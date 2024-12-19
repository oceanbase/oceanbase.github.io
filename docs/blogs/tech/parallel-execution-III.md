---
slug: parallel-execution-III
title: 'Mastering Parallel Execution in OceanBase Database: Part 3 - Concurrency Control and Queuing'
---

> Parallel queries may queue while waiting for threads. This article introduces thread management in parallel execution.

This is the third article of a seven-part series on parallel execution.

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

3.1 Concurrency Control in Parallel Execution
------------

You can use the tenant-level variable `PARALLEL_SERVERS_TARGET` to specify the number of parallel execution (PX) worker threads available for the tenant on each node. A parallel query requests worker threads from all related OBServer nodes before being executed. If any OBServer node fails to provide sufficient worker threads, the parallel query is not executed. In this case, the parallel query is put back in the queue. When it is scheduled the next time, it retries to request threads from the nodes until sufficient worker threads are obtained. After the whole query is completed, the requested worker threads are immediately released.

The process of trying to request worker threads, requeuing due to insufficient thread resources, being scheduled again, and retrying to request worker threads is called **parallel query queuing**. The allocation of worker threads on all OBServer nodes is managed by a module named **PX resource manager**.

For each parallel query, the PX resource manager splits the execution plan of the query into multiple data flow operations (DFOs), simulates the DFO scheduling process, and calculates the maximum number of worker threads required for the query on each OBServer node based on the PARALLEL hint or table-level PARALLEL attribute. This group of threads is called a **resource vector**.

The resource vector is a logical concept used for concurrency control and queuing. After a parallel query requests sufficient worker threads from the PX resource manager based on the resource vector, the parallel query execution starts. During the execution, physical threads are requested and released as different DFOs are scheduled and executed. However, logical threads are not returned to the PX resource manager. The resource vector is returned to the PX resource manager only after the parallel query is completed.

When a large number of parallel queries try to request threads from the PX resource manager, threads are allocated based on the First-come, First-serve (FCFS) strategy until no thread is left or the remaining threads are insufficient for any query. All subsequent queries will wait in the queue and retry to request threads when being scheduled again.

  

3.2 Allocation of PX Worker Threads
--------------

Each OBServer node of the tenant has a **PX thread pool** for executing parallel queries. When the threads in the thread pool are insufficient, the thread pool is dynamically scaled out. If threads in the thread pool remain idle for more than 10 minutes, the thread pool is scaled in to 10 threads. If threads in the thread pool remain idle for more than 60 minutes, the thread pool can be scaled in to 0 threads.

When a parallel query is scheduled, each DFO can obtain required PX threads from the PX thread pool on the corresponding OBServer node. By default, the number of threads allocated to a DFO on an OBServer node cannot exceed the value of `MIN_CPU` of the tenant × 10. If the number of threads requested by a DFO exceeds this value, the thread pool still allocates `MIN_CPU` × 10 threads to the DFO.

  

3.3 Two-level Resource Control Model
------------

Any parallel query experiences two levels of resource control.

*   Global control: The parallel query requests a resource vector with sufficient PX threads from the PX resource manager.
*   Local control: The PX thread pool allocates the expected number of physical threads.

**Global control** is responsible for resource acquisition in distributed scenarios. **Local control** is responsible only for resource allocation in the thread pool on a single node. Global control ensures successful execution of a query that passes the check by avoiding the situation where resources cannot be obtained during running. Local control ensures that in extreme circumstances, a single DFO of a query will not request an excessively large number of physical threads, avoiding waste of thread resources. A parallel query that passes the check in the global control phase can be successfully executed. Sufficient physical threads are available for this parallel query regardless of the degree of parallelism (DOP).

![1705634075](/img/blogs/tech/parallel-execution-III/1705634075415.png)

  

3.4 View Related to PX Resource Manager
-----------------

The PX resource manager can query the `GV$OB_PX_TARGET_MONITOR` view for the thread usage information on each OBServer node of a tenant. For more information about fields in the view, see the **GV$OB_PX_TARGET_MONITOR** topic of the OceanBase Database documentation.

    OceanBase(admin@oceanbase)>select  * from GV$OB_PX_TARGET_MONITOR;
    +--------------+----------+-----------+-----------+-----------------+--------------+-----------+-------------+------------------+-------------------+------------------------------+
    | SVR_IP       | SVR_PORT | TENANT_ID | IS_LEADER | VERSION         | PEER_IP      | PEER_PORT | PEER_TARGET | PEER_TARGET_USED | LOCAL_TARGET_USED | LOCAL_PARALLEL_SESSION_COUNT |
    +--------------+----------+-----------+-----------+-----------------+--------------+-----------+-------------+------------------+-------------------+------------------------------+
    | 192.168.11.2 |    19512 |      1004 | N         | 555393108309134 | 192.168.11.1 |     19510 |          10 |                6 |                 0 |                            0 |
    | 192.168.11.2 |    19512 |      1004 | N         | 555393108309134 | 192.168.11.2 |     19512 |          10 |                0 |                 0 |                            0 |
    | 192.168.11.1 |    19510 |      1004 | Y         | 555393108309134 | 192.168.11.1 |     19510 |          10 |                6 |                 6 |                            1 |
    | 192.168.11.1 |    19510 |      1004 | Y         | 555393108309134 | 192.168.11.2 |     19512 |          10 |                0 |                 0 |                            1 |
    +--------------+----------+-----------+-----------+-----------------+--------------+-----------+-------------+------------------+-------------------+------------------------------+
    4 rows in set (0.002 sec)

The global resource usage status queried at a specific moment may be inconsistent on different OBServer nodes. However, the global status is synchronized every 500 ms at the background. Generally, the global resource usage status queried on the OBServer nodes is basically consistent without obvious deviations.