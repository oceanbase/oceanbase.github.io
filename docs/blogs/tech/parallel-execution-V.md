---
slug: parallel-execution-V
title: 'Mastering Parallel Execution in OceanBase Database: Part 5 - Parallel Execution Parameters'
---

> OceanBase Database provides a group of parameters for you to control the initialization and tuning of parallel execution. When OceanBase Database starts, the default values of parallel execution parameters can be calculated based on the number of CPU cores of the tenant and the tenant-level parameter `px_workers_per_cpu_quota`. You can also choose not to use the default values but to manually specify parameter values upon startup of OceanBase Database or manually adjust the parameter values later as needed. By default, parallel execution is enabled.  
> This article introduces techniques for controlling parallel execution parameters from two aspects: default values and tuning of parallel execution parameters.

This is the fifth article of a seven-part series on parallel execution.

Part 1

[Introduction](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-I)

Part 2

[Set the DOP](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-II)

Part 3

[Concurrency Control and Queuing](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-III)

Part 4

[Parallel Execution Types](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-IV)

Part 5

[Parallel Execution Parameters](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-V)

Part 6

[Troubleshooting and Tuning Tips](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-VI)

Part 7

[Get Started with a PoC Test](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-VII)

5.1 Default Values of Parallel Execution Parameters
------------

You can set parallel execution parameters to control the number of parallel execution (PX) threads and queuing in parallel execution. The following table describes the parameters.

| Parameter name | Default value | Level | Description |
| --------------- | --------------- | --------------- | --------------- |
| px\_workers\_per\_cpu\_quota | 10 | Tenant-level parameter | The number of PX threads that can be allocated on each CPU core. Value range: \[1, 20\]. |
| parallel\_servers\_target | MIN CPU × px\_workers\_per\_cpu\_quota | Tenant-level variable | The number of PX threads that can be requested from each node of the tenant. |
| parallel\_degree\_policy | MANUAL | Tenant-level or session-level variable | The auto degree of parallelism (DOP) strategy. You can set the value to `AUTO` to enable auto DOP. After auto DOP is enabled, the optimizer automatically calculates the DOP for queries based on statistics. If you set the value to `MANUAL`, you can specify a DOP by using hints, a table-level PARALLEL attribute, or a session-level PARALLEL attribute. |
| \_parallel\_max\_active\_sessions | 0 | Tenant-level parameter | In the TPC-H benchmark, a power run requires a higher DOP than a throughput run. However, the TPC-H specification disallows dynamic changes to the DOP by using SQL. To support dynamic changes to the DOP, the `_parallel_max_active_sessions` parameter is introduced. When the value of `_parallel_max_active_sessions` is `0`, the number of active sessions that can be executed in parallel is unlimited. When the value of `_parallel_max_active_sessions` is greater than `0`, the value indicates the number of active sessions that can be executed in parallel. The threads of the extra sessions are suspended. After a query is completed, the suspended session threads are woken up to resume. |

To lower the requirements for using parallel execution, OceanBase Database minimizes the number of parallel execution parameters. You can use the default values to directly enable parallel execution. In special scenarios, you can change the parameter values for optimization.

### px\_workers\_per\_cpu\_quota

This parameter specifies the number of PX threads that can be allocated on each CPU core. Assume that the value of `MIN_CPU` of the tenant is N. If the data to be processed in parallel is evenly distributed, the number of threads that can be allocated on each node is calculated by using the following formula: N × Value of `px_workers_per_cpu_quota`. If the data is unevenly distributed, the actual number of threads allocated on some nodes may exceed the value calculated by using the foregoing formula for a short time. After the parallel execution is completed, the excess threads are automatically reclaimed.

`px_workers_per_cpu_quota` affects the default value of `parallel_servers_target` only during tenant creation. If you change the value of `px_workers_per_cpu_quota` after the tenant is created, the value of `parallel_servers_target` is not affected.

Generally, you do not need to change the default value of `px_workers_per_cpu_quota`. If all CPU resources are occupied by parallel execution when resource isolation is disabled, you can try to decrease the value of `px_workers_per_cpu_quota` to lower the CPU utilization.

  

### parallel\_servers\_target

This parameter specifies the number of PX threads that can be requested from each node of the tenant. When thread resources are used up, subsequent PX requests need to wait in a queue. For the concept of queuing, see [Mastering Parallel Execution in OceanBase Database: Part 3 - Concurrency Control and Queuing](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-III).

In parallel execution, the CPU utilization can be very low due to factors such as an excessively small value of `parallel_servers_target`, which downgrades the DOP for the SQL statement, resulting in fewer threads allocated than expected. In OceanBase Database of a version earlier than V3.2.3, the default value of `parallel_servers_target` is very small. You can increase the value of `parallel_servers_target` to resolve the issue. We recommend that you set `parallel_servers_target` to the value of `MIN_CPU` × 10. In OceanBase Database V3.2.3 and later, the default value of `parallel_servers_target` is the value of `MIN_CPU` × 10. Therefore, this issue does not occur.

  

`MIN_CPU` specifies the minimum number of CPU cores for the tenant and is specified during tenant creation.

After you set an appropriate value for `parallel_servers_target`, reconnect to your database and execute the following statement to view the latest value:

```sql
    show variables like 'parallel_servers_target';
```

For ease of O&M, you can set `parallel_servers_target` to the maximum value to avoid frequent adjustment. Theoretically, you can set `parallel_servers_target` to an infinite value. However, this results in low efficiency, because all queries are executed once they are initiated, without the need to wait in a queue, and contend for CPU time slices, disk I/Os, and network I/Os.

This issue is not severe in terms of throughput. However, resource contention will significantly increase the latency of individual SQL statements. Considering the CPU and I/O utilization, you can set `parallel_servers_target` to the value of `MIN_CPU` × 10. In a few I/O-intensive scenarios, CPU resources may not be fully used. In this case, you can set `parallel_servers_target` to the value of `MIN_CPU` × 20.

  

### parallel\_degree\_policy

This parameter specifies the DOP strategy. Valid values are `AUTO` and `MANUAL`. You can set the value to `AUTO` to enable auto DOP. In this case, the optimizer automatically calculates the DOP for queries based on statistics. If you set the value to `MANUAL`, you can specify a DOP by using hints, a table-level PARALLEL attribute, or a session-level PARALLEL attribute.

In OceanBase Database V4.2 and later, if you are not familiar with the DOP setting rules, you can set `parallel_degree_policy` to `AUTO` to allow the optimizer to automatically select a DOP. For more information about the rules for automatically calculating a DOP, see [Mastering Parallel Execution in OceanBase Database: Part 2 - Set the DOP](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-II). OceanBase Database of a version earlier than V4.2 does not support the `parallel_degree_policy` parameter, and therefore does not support the auto DOP feature. In this case, you must manually specify a DOP.

  

5.2 Tuning of Parallel Execution Parameters
--------------

### ob\_sql\_work\_area\_percentage

This is a tenant-level variable that specifies the maximum memory space available for the SQL workarea. The value is in percentage that indicates the percentage of the memory space available for the SQL module to the total memory space of the tenant. The default value is `5`, which indicates 5%. When the memory space occupied by the SQL module exceeds the specified value, data in the memory is flushed to the disk. To view the actual memory usage of the SQL workarea, you can search for `WORK_AREA` in the `observer.log` file. Here is an example:

```bash
    [MEMORY] tenant_id=1001 ctx_id=WORK_AREA hold=2,097,152 used=0 limit=157,286,400
```

In a scenario with more reads than writes, if data in the memory is flushed to the disk due to insufficient memory for the SQL workarea, you can increase the value of `ob_sql_work_area_percentage`.

  

### workarea\_size\_policy

OceanBase Database implements global adaptive memory management. When `workarea_size_policy` is set to `AUTO`, the execution framework allocates memory to operators, such as Hash Join, Group By, and Sort, based on the optimal strategy, and enables the adaptive data flush strategy. If `workarea_size_policy` is set to `MANUAL`, you must manually specify `_hash_area_size` and `_sort_area_size`.

### \_hash\_area\_size

This is a tenant-level parameter that allows you to manually specify the maximum memory space available for the hash algorithm of each operator. The default value is 128 MB. When the used memory space exceeds the specified value, data in the memory is flushed to the disk. This parameter applies to operators related to the hash algorithm, such as Hash Join, Hash Group By, and Hash Distinct. **Generally, you do not need to modify the value of this parameter and we recommend that you set `workarea_size_policy` to `AUTO`.** If you do not want the system to automatically flush data from the memory to the disk during the use of the hash algorithm, set `workarea_size_policy` to `MANUAL` and manually specify a `_hash_area_size` value.

### \_sort\_area\_size

This is a tenant-level parameter that allows you to manually specify the maximum memory space available for the sort algorithm of each operator. The default value is 128 MB. When the used memory space exceeds the specified value, data in the memory is flushed to the disk. This parameter is mainly used for the sort operator. **Generally, you do not need to modify the value of this parameter, and we recommend that you set `workarea_size_policy` to `AUTO`.** If you do not want the system to automatically flush data from the memory to the disk during the use of the sort algorithm, set `workarea_size_policy` to `MANUAL` and manually specify a `_sort_area_size` value.

  

### \_px\_shared\_hash\_join

This is a session-level system variable that determines whether to use a shared hash table during hash joins for optimization. The default value is `true`, which specifies to enable the shared hash join algorithm. When a hash join is executed in parallel, each PX thread independently calculates a hash table. When the left table uses broadcast redistribution, all hash tables calculated by the PX threads are identical. Therefore, each machine needs only one hash table for all PX threads to share to improve CPU cache efficiency. **Generally, you do not need to modify the value of this parameter.**

  

5.3 Tuning of Parallel DML Parameters
------------------

The transaction mechanism is no longer a must in OceanBase Database V4.1 and later. Therefore, when you import data into a table, we recommend that you use the `INSERT INTO SELECT` statement in combination with the direct load feature to insert the data into the table at a time. This can shorten the import time and avoid memory shortage caused by a high write speed.