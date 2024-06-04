---
slug: io-isolation
title: 'OceanBase provides users with sufficiently flexible and simple I/O resource isolation experiences.'
---

**Sun Jianyun, an OceanBase technical expert**

He used to be a member of the TPC-C project and the technical support team for Double 11 shopping festivals, and is now engaged in the design, research, and development of I/O scheduling, DDL capabilities, and other work related to storage engines.

In [Why resource isolation matters to HTAP? ](https://open.oceanbase.com/blog/10900412), we talked about why hybrid transaction/analytical processing (HTAP) relies on resource isolation and how to implement it. Resource isolation is a capability. Many scenarios can be derived from it, such as HTAP, multitenancy, and pay-as-you-go. Based on resource isolation and cloud-based resource pools, all kinds of resources can be allocated on demand. Isolation of resources such as CPU and memory is already supported in OceanBase Database V4.0. OceanBase Database V4.1 supports enhanced disk I/O isolation and provides users a simple and flexible way to use this feature.

We believe that disk I/O isolation is an essential part of resource isolation. Disk I/O isolation enhances and completes the resource control capabilities for users. This article describes some thoughts of the OceanBase team on disk I/O isolation, how it is configured in OceanBase Database, and the disk I/O isolation performance testing of OceanBase Database V4.1.

<!-- truncate -->

## I. Why is disk I/O isolation necessary?

Some may ask, "Is resource isolation, especially disk I/O isolation, really necessary?" Why not directly divide the loads among different servers? For example, transaction processing (TP) and analytical processing (AP) loads can be routed to different replicas on different servers, and different tenants can be deployed on different servers to implement physical isolation. As I see it, that is truly a simple and convenient solution. However, it has many limitations, and cost is the biggest concern. Assume that a game company has two tenants A and B, where tenant A processes services outside China and tenant B processes services inside China. The load peaks of one tenant coincide with the load troughs of the other and vice versa due to the time zone difference. Although each of them can exclusively occupy separate server resources, half of the resources are wasted.

For disk I/O resources, loads whose data is tightly coupled cannot be simply divided among different servers. For example, operations such as backup, migration, and reorganization in a database strongly depend on intensive data reads and writes. Without disk I/O isolation, these tasks can affect the service throughput and response time. Actually, it is difficult to divide TP and AP loads on different servers as desired. TP and AP loads cannot be clearly demarcated sometimes. Even loads of the same type, such as TP loads, have different priorities based on services. What can we do in this situation?

Disk I/O is a type of flexible resources, and loads can contend for disk I/O resources. Resources such as memory are rigid and described as scalars. A memory block occupied by Load A cannot be simultaneously allocated to Load B. Disk I/O is a type of flexible resources and described as the processing capability within a unit time. Loads A and B can read data from and write data to the disk at the same time. Rigid resources can be clearly isolated like cutting a cake. However, for flexible resources, contention between loads must be considered. Assume that you have two fields A and B irrigated by the same river. When the water that flows to Field A is reduced, the water that flows to Field B can be increased.

## II. What is good disk I/O isolation?

To answer this question, we need to figure out customers' expectations of disk I/O isolation, which vary from one customer to another.

- Some customers want to implement exclusive resource usage through I/O isolation, such as an exclusive disk bandwidth of 200 Mbit/s.
- Some customers want to limit the resource usage of some loads to specified thresholds through disk I/O isolation.
- Others only want to allocate resources by weight when resources are insufficient. Resource isolation is not a concern when resources are sufficient.

In the technical field of resource isolation, the preceding three types of requirements correspond to three isolation semantics: reservation, limitation, and proportion. They are also what disk I/O isolation is supposed to implement in OceanBase Database.

## III. How do we configure disk I/O isolation in OceanBase Database?

OceanBase Database allows you to configure disk I/O isolation between tenants or between loads in a tenant.

The former is quite easy. For input/output operations per second (IOPS), you can specify the `MIN_IOPS`, `MAX_IOPS`, and `IOPS_WEIGHT` parameters for a tenant in the unit config to meet the foregoing three types of isolation requirements. Here is an example.

```SQL
alter resource unit set tp_unit min_iops=20000, max_iops=40000, iops_weight=500;
```

Then, how to configure disk I/O isolation between loads in a tenant? OceanBase Database extends the ResourceManager package of Oracle to adapt to the use habits of users.

The following example shows you how to use ResourceManager to isolate the disk I/O resources for TP and AP loads.

- First, create a resource management plan named `htap_plan` and two resource consumer groups named `tp_group` and `ap_group`.
- Second, bind `tp_group` and `ap_group` to `htap_plan`. Allocate more resources to `tp_group` and fewer resources to `ap_group`. The value of each of `MIN_IOPS`, `MAX_IOPS`, and `WEIGHT_IOPS` is a resource percentage of the unit config of the tenant.
- Third, set the mapping rule between the loads and resource consumer groups. In this example, loads are mapped to consumer groups by username. For example, all loads of the `trade` user use resources of the `tp_group` resource consumer group.

```SQL
# Create a resource management plan
BEGIN DBMS_RESOURCE_MANAGER.CREATE_PLAN(
  PLAN => 'htap_plan');
END; /

# Create resource consumer groups
BEGIN DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
  CONSUMER_GROUP => 'tp_group',
  COMMENT => 'resource group for oltp applications');
END;/

BEGIN DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
  CONSUMER_GROUP => 'ap_group',
  COMMENT => 'resource group for olap applications');
END;/

# Allocate resources
BEGIN DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE(
  PLAN => 'htap_plan',
  GROUP_OR_SUBPLAN => 'tp_group' ,
  COMMENT => 'more resource for tp_group',
  MGMT_P1 => 100,
  MIN_IOPS => 60,
  MIX_IOPS => 100,
  WEIGHT_IOPS => 100);
END; /

BEGIN DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE(
  PLAN => 'htap_plan',
  GROUP_OR_SUBPLAN => 'ap_group' ,
  COMMENT => 'less resource for ap_group',
  MGMT_P1 => 20,
  MIN_IOPS => 0,
  MIX_IOPS => 80,
  WEIGHT_IOPS => 20);
END; /

# Map loads to resource consumer groups
BEGIN
DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING
  ('FUNCTION', 'CAOPACTION_HIGH', 'background_group');
END;/

# Map specific SQL statements to a resource consumer group
BEGIN
  DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING
    ('COLUMN', 'test.t1.c1 = 3', 'big1_group');
END;/
BEGIN
  DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING
    ('USER', 'trade', 'tp_group');
END;/

BEGIN
  DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING
    ('USER', 'analysis', 'ap_group');
END;/
```

Mapping rules for resource consumer groups also support function names and column names. In function name-based mapping, the resource usage of backend tasks can be controlled by using ResourceManager. In column name-based mapping, resource isolation can be refined to the SQL statement level. Here is an example.

```SQL
# Map backend tasks to a resource consumer group
BEGIN
  DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING
      ('FUNCTION', 'CAOPACTION_HIGH', 'background_group');
END;/

# Map specific SQL statements to a resource consumer group
BEGIN
  DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING
      ('COLUMN', 'test.t1.c1 = 3', 'big1_group');
END;/
```

## IV. Disk I/O isolation performance testing of OceanBase Database V4.x

### **Verify the disk I/O isolation capability**

Create four tenants for a simulation test. Each tenant starts 64 threads to send I/O requests that perform 16 KB random reads. The loads of tenants 1, 2, and 4 last for 20 seconds, and the load of tenant 3 begins from the 10th second and lasts for 10 seconds. In this test, the maximum IOPS is about 60,000. Without limitations, any tenant can use up the disk resources.

We first verified the disk I/O isolation between tenants. Table 1 describes the resource configurations of the tenants and Figure 1 shows the test results of the tenants.

- When the disk resources are used up, the newly joined tenant 3 still has an IOPS of 10,000, which is reserved by using the `MIN_IOPS` parameter.
- The IOPS of tenant 4 does not exceed 5,000 because its maximum IOPS is limited by using the `MAX_IOPS` parameter.
- Regardless of the load changes, the IOPS ratio between tenant 1 and tenant 2 is always 2:1 as defined.

![1683280561](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-05/1683280561708.png)![1683280562](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-05/1683280562322.png)

Then, we verified the disk I/O isolation between loads in a tenant. Set four types of loads in tenant 2. Table 2 describes the resource configurations of the loads. Figure 2 shows the test results.

- The IOPS of Load B remains about 2,000, even if its weight is 0. This is because 97% of the minimum IOPS resources of the tenant is reserved for Load B by using the `MIN_PERCENT` parameter.
- The IOPS of Load A remains about 1,000. This is because the `MAX_PERCENT` parameter is set to `1` for Load A. In this way, Load A can use only 1% of the maximum resources of the tenant.
- The IOPS ratio between Load C and Load D is always 2:1, which conforms to their weight ratio of 50:25.

![1683280606](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-05/1683280606307.png)![1683280606](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-05/1683280606875.png)

The preceding tests show that OceanBase Database supports disk I/O isolation between tenants and between loads in a tenant, and meets the three isolation semantics of reservation, limitation, and proportion.

### **Adjust disk I/O isolation configurations in real time**

Some may have noticed that the disk I/O isolation configurations remain unchanged in the preceding tests. Does OceanBase Database support real-time adjustment of the isolation configurations? The answer is "Yes". The following test will prove it.

Prepare a large table and perform a full-table scan with a parallel query. During the scan, change the value of the `MAX_IOPS` parameter for the tenant repeatedly as the administrator. The video shows that the IOPS monitored by the operating system changes constantly.

You may have noticed that the IOPS monitored by the operating system is always lower than the value specified by the administrator. This is because OceanBase Database normalizes the overhead of I/O requests.

For example, the overhead of 64 KB random reads is different from that of 4 KB random reads. The baseline IOPS overhead specified in the unit config of the tenant is 16 KB random reads. However, the actual size of I/O requests is about 20 KB. After overhead calculation, the IOPS monitored by the operating system is different. For more information, see the related code of ob_io_manager.

## V. Afterword

The resource isolation capability of OceanBase Database V4.x allows you to flexibly control the resources allocated to different loads. We will make every effort to improve this capability to address user concerns, such as the unit config and number of resource units of the tenant. OceanBase Database is devoted to providing a better resource isolation capability and user experience. When the business traffic changes, OceanBase Database can automatically allocate the required resources, like a standalone database with unlimited resources. It must be a long haul to reach that goal, but we are resolved and ready to push through all the challenges.

Finally, feel free to share with us your comments on disk I/O isolation.
