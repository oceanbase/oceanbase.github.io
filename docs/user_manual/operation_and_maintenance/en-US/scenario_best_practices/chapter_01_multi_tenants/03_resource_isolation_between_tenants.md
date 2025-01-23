---
title: Resource Isolation Between Tenants
weight: 3
---

OceanBase Database is a multi-tenant database system. It isolates resources among tenants to prevent resource contention and ensure stable business operation.

Resource isolation refers to the behavior of controlling resource allocation among multiple resource units on a node, and it is a local behavior of the node. Similar technologies include Docker and virtual machines (VMs), but OceanBase Database does not rely on Docker or VM technologies for resource isolation. It implements resource isolation internally within the database.

In OceanBase Database, resource units are the basic units for allocating resources to tenants. A resource unit is equivalent to a Docker container. You can create multiple resource units on a node. Each resource unit created on a node occupies a part of the physical resources on the node, such as the CPU and memory resources. The allocation of resources on a node is recorded in an internal table for database administrators.

You can create multiple resource units across nodes for a tenant. However, a tenant can have only one resource unit on a node. The resource units of a tenant are independent of each other. Currently, OceanBase Database does not aggregate the resource usage of multiple resource units for global resource control. Specifically, if the resources on a node fail the demand of a tenant, OceanBase Database does not allow the tenant to compete for resources of other tenants on another node.

## Advantages of Multi-tenant Isolation in OceanBase Database

Compared with Docker containers and VMs, OceanBase Database provides more lightweight tenant isolation and makes it easier to implement advanced features such as priority management.
From the perspective of OceanBase Database requirements, Docker containers and VMs have the following disadvantages:

* There are heavy overheads in runtime environments of both Docker containers and VMs, while OceanBase Database needs to support lightweight tenants.

* The specification change and migration of Docker containers or VMs are costly, while OceanBase Database is designed to help tenants change specifications and perform the migration at a faster speed.

* Tenants cannot share resources such as object pools if Docker containers or VMs are used.

* Customizing resource isolation within Docker containers or VMs, such as priority support within tenants, is challenging.

In addition, unified views cannot be exposed if Docker containers or VMs are used.

## Isolation Effects

* Memory resources are completely isolated.

  * Memory resources for operators during SQL execution are isolated. When the memory of a tenant is exhausted, other tenants are not affected.

  * The block cache and MemTable are isolated. When the memory of a tenant is exhausted, the read and write operations of other tenants are not affected.

* CPU resources are completely isolated.

  * Basic CPU resource isolation is implemented by controlling the number of active threads based on the user status. Each tenant has an independent thread pool. The specifications of a thread pool are subject to the tenant specifications and some parameters. The CPU resources available for a tenant are determined by the unit config.

  * To achieve better isolation effects, OceanBase Database allows you to configure control groups (cgroups) for CPU isolation since V4.0.0. Cgroup is a mechanism provided by the Linux kernel to aggregate or divide, based on specialized behavior, a series of system tasks and their subtasks into different groups that are graded based on resources, thereby providing a unified framework for system resource management. You can precisely limit the CPU utilization of threads based on cgroups, thereby implementing CPU isolation among tenants.
  
  ![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/03_resource_isolation_between_tenants/001.png)

* SQL modules of different tenants do not affect each other.

  * The SQL plan cache of a tenant is isolated from that of another tenant. When the plan cache of a tenant is evicted, the plan caches of other tenants are not affected.

  * The SQL audit table of a tenant is isolated from that of another tenant. If the queries per second (QPS) value of a tenant is very high, the audit information about other tenants is not flushed.

* Transaction modules of different tenants do not affect each other.

  * If the row lock of a tenant is suspended, other tenants are not affected.

  * If the transaction of a tenant is suspended, other tenants are not affected.

  * If the replay for a tenant fails, other tenants are not affected.

* Clog modules of different tenants do not affect each other.

  The log stream directories are divided by tenant. The structure of a log stream directory on the disk is as follows:

  ```
    tenant_id
        ├── unit_id_0
        │   ├── log
        │   └── meta
        ├── unit_id_1
        │   ├── log
        │   └── meta
        └── unit_id_2
            ├── log
            └── meta
  ```
  
## Resource Classification

OceanBase Database supports isolation of CPU, memory, and IOPS resources for tenants in V4.0.0 and later. You can specify resource specifications such as `CPU`, `MEMORY`, `IOPS`, and `LOG_DISK_SIZE` for each resource unit.

```sql
obclient> 
    CREATE RESOURCE UNIT name
        MAX_CPU = 1, [MIN_CPU = 1,]
        MEMORY_SIZE = '5G',
        [MAX_IOPS = 1024, MIN_IOPS = 1024, IOPS_WEIGHT=0,]
        [LOG_DISK_SIZE = '2G'];
```

### Available CPU resources on an OBServer node

When an OBServer node starts, the system detects the number of online CPU cores of the physical server or container. If the detected number of CPU cores is inaccurate, for example, in a containerized environment, you can use the `cpu_count` parameter to specify CPU resources.

Each OBServer node reserves two CPU cores for background threads. Therefore, the total CPU cores that can be allocated to tenants are two less than the CPU cores on the OBServer node.

### Available memory resources on an OBServer node

When an OBServer node starts, the system detects the memory of the physical server or container. Each OBServer node reserves a part of the memory for other processes. Therefore, the size of memory available for the observer process is calculated based on the following formula: `physical memory × memory_limit_percentage`. You can also use the `memory_limit` parameter to specify the total size of memory available for the observer process.

The size of memory for internal shared modules must be subtracted from the size of memory available for the observer process. The remaining memory is available for tenants. The size of memory for internal shared modules is specified by the `system_memory` parameter.

### Check the available resources on each OBServer node

You can query the `oceanbase.GV$OB_SERVERS` view for the available resources on each OBServer node. Here is an example:

```sql
obclient> SELECT * FROM oceanbase.GV$OB_SERVERS\G
*************************** 1. row ***************************
                 SVR_IP: xx.xx.xx.xx
               SVR_PORT: 57234
                   ZONE: zone1
               SQL_PORT: 57235
           CPU_CAPACITY: 14
       CPU_CAPACITY_MAX: 14
           CPU_ASSIGNED: 6.5
       CPU_ASSIGNED_MAX: 6.5
           MEM_CAPACITY: 10737418240
           MEM_ASSIGNED: 6442450944
      LOG_DISK_CAPACITY: 316955164672
      LOG_DISK_ASSIGNED: 15569256438
        LOG_DISK_IN_USE: 939524096
     DATA_DISK_CAPACITY: 10737418240
       DATA_DISK_IN_USE: 624951296
DATA_DISK_HEALTH_STATUS: NORMAL
DATA_DISK_ABNORMAL_TIME: NULL
1 row in set
```

## Resource Isolation

### Memory isolation

OceanBase Database does not support memory overprovisioning on OBServer nodes in V4.0.0 and later, because memory overprovisioning will cause unstable tenant operation. The `MIN_MEMORY` and `MAX_MEMORY` parameters are deprecated, and the `MEMORY_SIZE` parameter is used instead.

### CPU isolation

Before OceanBase Database V3.1.x, you can limit the number of threads to control CPU utilization. In OceanBase Database V3.1.x and later, you can configure cgroups to control CPU utilization.

**Thread classification**

Many threads with different features start along with an OBServer node. In this section, threads are classified into the following two types:

* Threads for processing SQL statements and transaction commits, which are collectively referred to as tenant worker threads.

* Threads for processing network I/O, disk I/O, compactions, and scheduled tasks, which are referred to as background threads.

In the current version of OceanBase Database, tenant worker threads and most background threads are tenant-specific, and network threads are shared.

**CPU isolation for tenant worker threads based on the number of threads**

CPU resources in a resource unit are isolated based on the number of active tenant worker threads for the resource unit.

Because the execution of SQL statements may involve I/O waiting and lock waiting, a thread may not fully utilize a physical CPU. Therefore, under default configurations, an OBServer node starts four threads on each CPU. You can set the `cpu_quota_concurrency` parameter to control the number of threads to be started on a CPU. In this case, if the `MAX_CPU` parameter of a resource unit is set to `10`, 40 parallel active threads are allowed for the resource unit, and the maximum CPU utilization is 400%.

**CPU isolation for tenant worker threads based on cgroups**

After cgroups are configured, worker threads of different tenants are stored in different cgroup directories, which improves CPU isolation between tenants. The isolation results are described as follows:

* If a tenant on an OBServer node has a very high load and the rest of the tenants are relatively idle, then the CPU of the high-load tenant will also be limited by `MAX_CPU`.

* If the load of the idle tenants increases, physical CPU resources become insufficient. In this case, cgroups allocate time slices based on weights.

**CPU isolation for background threads**

* In OceanBase Database V4.0.0, threads used by a tenant are isolated from those used by another tenant, and each tenant controls a corresponding number of threads.

* For better isolation, background threads are also allocated to different cgroup directories to achieve isolation between tenants and between tenants and worker threads.

**Large query processing**

Compared with quick responses to large queries, quick responses to small queries are of higher significance. This means that large queries have lower priorities than small queries. When large queries and small queries contend for CPU resources, the system limits the amount of CPU resources occupied by large queries.

If a worker thread takes a long time to execute an SQL query, the query is identified as a large query, and the worker thread waits in a pthread condition to release its CPU resources to other tenant worker threads.

To support this feature, OBServer nodes insert many checkpoints into the code, making tenant worker threads periodically check their status during the running process. When an OBServer node determines that a worker thread should be suspended, the worker thread waits in a pthread condition.

If both large queries and small queries exist, the large queries can occupy at most 30% of the tenant worker threads. The percentage 30% is specified by the `large_query_worker_percentage` parameter.

Take note of the following items:

* If no small queries exist, large queries can occupy 100% of the tenant worker threads. The percentage 30% takes effect only when both large queries and small queries exist.

* If a tenant worker thread is suspended because it executes a large query, the system may create a tenant worker thread for compensation. However, the total number of tenant worker threads cannot exceed 10 times the value of the `MAX_CPU` parameter. The multiple 10 is specified by the `workers_per_cpu_quota` parameter.

**Identify large queries in advance**

An OBServer node starts a new tenant worker thread after it suspends a large query thread. However, if many large queries are initiated, new threads created on the OBServer node are still used to process large queries, and the number of tenant worker threads soon reaches the upper limit. No threads are available for small queries until all the large queries are processed.

To resolve this issue, an OBServer node predicts whether an SQL query is large before it is executed by estimating the execution time of the SQL query. Prediction is based on the following assumptions: If the execution plans of two SQL queries are the same, the execution time of the SQL queries is also similar. In this case, you can determine whether an SQL query is large based on the execution time of the latest SQL query with the same execution plan.

Once an SQL request is identified as a large query, it is placed in a large query queue and the tenant worker thread executing the query is released. In this case, the system can continue to respond to subsequent requests.