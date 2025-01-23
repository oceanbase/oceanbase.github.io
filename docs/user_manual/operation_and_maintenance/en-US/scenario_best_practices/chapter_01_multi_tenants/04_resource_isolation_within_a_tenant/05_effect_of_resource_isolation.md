---
title: Resource Isolation Effects
weight: 4
---

## CPU Isolation Effects

We have noted that customers tend to run batch processing tasks during off-peak hours, such as midnight or early morning, when online transaction processing (OLTP) is unlikely affected by online analytical processing (OLAP), and most resources of a cluster can be allocated to OLAP with minimal resources reserved to support essential OLTP tasks. During peak hours in the daytime, the resource isolation plan can be adjusted to ensure sufficient resources for OLTP with minimal resources reserved to support essential OLAP tasks.

**OceanBase Database allows you to set two plans for resource management in the daytime and at night. You can activate the plans as needed to ensure isolation and maximize resource utilization.**

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/001.png)

For example, the following syntax defines a daytime resource plan where OLTP (interactive_group) and OLAP (batch_group) are respectively allocated with 80% and 20% of the resources.

```
DBMS_RESOURCE_MANAGER.CREATE_PLAN(
   PLAN    => 'DAYTIME',
   COMMENT => 'More resources for OLTP applications');

DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
   PLAN             => 'DAYTIME',
   GROUP_OR_SUBPLAN => 'interactive_group',
   COMMENT          => 'OLTP group',
   MGMT_P1          => 80,
   UTILIZATION_LIMIT => 100);

DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
   PLAN             => 'DAYTIME',
   GROUP_OR_SUBPLAN => 'batch_group',
   COMMENT          => 'OLAP group',
   MGMT_P1          => 20,
   UTILIZATION_LIMIT => 20);

-- After the plan is ready, you can execute the following statement to activate it:
ALTER SYSTEM SET RESOURCE_MANAGER_PLAN = 'DAYTIME';
```
Similarly, you can define a night resource plan and activate it during off-peak hours.

OceanBase Database also supports user-based SQL categorization, which makes resource isolation more fine-grained, simple, and effective. You can create a user dedicated to executing analytical SQL queries, so that all SQL queries initiated by this user are processed as OLAP workloads. Furthermore, OceanBase Database identifies requests whose execution time exceeds the specified value, such as 5s, as large queries, and downgrades their priorities.

We mentioned that a dedicated user can be created for OLAP. Therefore, create two test users respectively named AP and TP. Bind OLAP tasks to AP_GROUP and OLTP tasks to TP_GROUP. Assume that the test business involves heavy OLTP workloads during daytime and most OLAP workloads are handled at night. Therefore, we set two resource plans for daytime and night. The daytime plan schedules 80% of the resources for OLTP and 20% for OLAP, and the night plan schedules 50% of the resources for OLTP and 50% for OLAP.

The test result in the following figure shows that the queries per second (QPS) for OLAP increases significantly while the OLTP QPS decreases after the plan switchover because a larger portion of CPU resources are allocated to OLAP in the night plan. In the following figure, you can see the turning points of OLAP and OLTP QPS curves caused by the plan switchover.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/002.png)

It seems that the change in the OLTP QPS is not as noticeable in comparison to OLAP QPS. This is actually a result as expected. The percentage of resources for OLAP is increased from 20% to 50%, an increase of 150%, and that for OLTP is reduced from 80% to 50%, a decrease of 37.5%. In ideal conditions, the QPS fluctuation amplitude of OLTP is smaller than that of OLAP.



## IOPS Isolation Effects
We performed a simulation test to verify the IOPS isolation effects.
- Create four tenants for the simulation test. Each tenant starts 64 threads to send I/O requests that perform 16 KB random reads.
- The loads of tenants 1, 2, and 4 last for 20 seconds, and the load of tenant 3 begins from the 10th second and lasts for 10 seconds.
- In this test, the maximum IOPS is about 60,000. Without limitations, any tenant can use up the disk resources.


We first verified the disk I/O isolation between tenants. The following figures respectively show the resource configurations and test results of the tenants.
![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/003.png)

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/004.png)

- When the disk resources are used up, the newly joined tenant 3 still has an IOPS of 10,000, which is reserved by using the `MIN_IOPS` parameter.
- The IOPS of tenant 4 does not exceed 5,000 because its maximum IOPS is limited by using the `MAX_IOPS` parameter.
- Regardless of the load changes, the IOPS ratio between tenant 1 and tenant 2 is always 2:1 as defined.


Then, we verified the disk I/O isolation between loads in a tenant. Set four types of loads in tenant 2. The following figures respectively show the resource configurations and test results of the loads.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/005.png)

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/006.png)

- The IOPS of Load B remains about 2,000, even if its weight is 0. This is because 97% of the minimum IOPS resources of the tenant are reserved for Load B by using the `MIN_PERCENT` parameter.
- The IOPS of Load A remains about 1,000. This is because the `MAX_PERCENT` parameter is set to `1` for Load A. In this way, Load A can use only 1% of the maximum resources of the tenant.
- The IOPS ratio between Load C and Load D is always 2:1, which conforms to their weight ratio of 50:25.

The preceding two tests show that OceanBase Database supports disk I/O isolation between tenants and between loads in a tenant, and meets the three isolation semantics of reservation, limitation, and proportion.

## References

* [Why Resource Isolation Matters in Databases: Take HTAP as an Example](https://en.oceanbase.com/blog/2615023872)

* [Flexible and Simple I/O Isolation Experience](https://open.oceanbase.com/blog/3105048832)