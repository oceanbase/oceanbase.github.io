---
slug: parallel-execution-II
title: 'Mastering Parallel Execution in OceanBase Database: Part 2 - Set the DOP'
---

> The degree of parallelism (DOP) refers to the number of worker threads used for the execution of a single data flow operation (DFO). Parallel execution is designed to make full use of multi-core resources. In the parallel execution (PX) framework of OceanBase Database, you can manually specify a DOP or use the [Auto DOP](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105913) feature to allow the database to automatically select one. This article introduces how to manually specify a DOP.

This is the second article of a seven-part series on parallel execution.

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

2.1 Manually Specify a DOP
-----------

Once you specify a DOP for a table, all scans of the table are executed in parallel.

### 2.1.1 Methods for Specifying a DOP

#### Specify a DOP by using a table attribute

The following statements respectively specify a DOP for a primary table and an index table.
![1](/img/blogs/tech/parallel-execution-II/1.png)


Assume that an SQL statement involves only one table. If the primary table is queried in the statement, not only the DFOs of the primary table but also other DFOs are executed based on a DOP of 4. If the index table is queried in the SQL statement, not only the DFOs of the index table but also other DFOs are executed based on a DOP of 2.

If an SQL statement involves multiple tables, the maximum `PARALLEL` value is used as the DOP for the whole execution plan of the statement.

#### Specify a DOP by using a PARALLEL hint

You can use a global PARALLEL hint to specify a DOP for a whole SQL statement, or use a table-level PARALLEL hint to specify a DOP for a specific table. If PARALLEL hints are specified for multiple tables in an SQL statement, the DOP of the DFOs of each table is subject to the value of the corresponding table-level PARALLEL hint. If a DFO involves multiple tables, the maximum PARALLEL value is used as the DOP for the DFO.

![2](/img/blogs/tech/parallel-execution-II/2.png)
![3](/img/blogs/tech/parallel-execution-II/3.png)


For a DML statement, the preceding hint only enables parallel execution for the query part of the statement. The write part is still executed in serial. To enable parallel execution for the write part, you must add the hint ENABLE_PARALLEL_DML. Here is an example:

![4](/img/blogs/tech/parallel-execution-II/4.png)



Notice: You must specify a global PARALLEL hint for parallel DML. A table-level PARALLEL hint cannot enable parallel execution for the write part. For example, the following SQL statement does not enable parallel execution for DML statements:

`insert /*+ parallel(t3 3) enable_parallel_dml */ into t3 select * from t1;`

  

#### Specify a DOP for a session

If you specify a DOP for a session, all query statements in the session are executed based on the specified DOP. Note that the specified DOP is used even for single-row query statements. This can compromise the query performance.

![5](/img/blogs/tech/parallel-execution-II/5.png)

For a DML statement, the preceding statement only enables parallel execution for the query part of the statement. The write part is still executed in serial. To enable parallel execution for the write part, execute the following statement:

![6](/img/blogs/tech/parallel-execution-II/6.png)

### 2.1.2 DOP Priorities

The priorities of DOPs specified in different ways are sorted in descending order as follows: **DOP specified by a global hint > DOP specified by a table-level hint > DOP specified for a session > DOP specified for a table**.

The following example shows that when a global hint is specified, a table-level hint does not take effect.

![7](/img/blogs/tech/parallel-execution-II/7.png)


The following example shows that when a table-level hint is specified, the DOP specified for a session does not take effect.

![8](/img/blogs/tech/parallel-execution-II/8.png)

The following example shows that when a DOP is specified for a session, the DOP specified for the session has a higher priority than that specified for a table by using the `PARALLEL` attribute.

![9](/img/blogs/tech/parallel-execution-II/9.png)
![10](/img/blogs/tech/parallel-execution-II/10.png)
  


### 2.1.3 Principles for Specifying a DOP

Here are two basic principles: 1. **The purpose of setting a DOP is to make full use of the CPU resources**. 2. **A higher DOP does not guarantee better performance**. For example, when a tenant has 20 CPU cores:

*   For simple single-table operations, such as scan, filtering, addition, deletion, and modification, the theoretical DOP is 20.
*   For multi-table join queries and parallel DML (PDML) operations involving global indexes, the theoretical DOP is 10.
*   For complex execution plans in the form of a right-deep tree, the theoretical DOP is around 7.

**Explanations** are as follows:

*   For a single-table operation with only one DFO, all the 20 CPU cores can be allocated to this DFO.
*   For a multi-table join, two DFOs are started at the same time to form a data pipeline, where one DFO is the producer and the other is the consumer. Each DFO can be allocated with 10 CPU cores.
*   For a complex execution plan in the form of a right-deep tree, three DFOs are started at the same time. Each DFO can be allocated with around 7 CPU cores for efficient execution.

On top of the preceding **basic principles**, **tuning** is also required. Explanations are as follows:

*   For a single-table operation with only one DFO, all the 20 CPU cores can be allocated to this DFO.

> If the DFO spends most of its time on I/O, setting the DOP to a value higher than 20, such as 25, can make full use of the CPU cores.

*   For a multi-table join, two DFOs are started at the same time to form a data pipeline, where one DFO is the producer and the other is the consumer. Each DFO can be allocated with 10 CPU cores.

> However, it cannot be guaranteed that each DFO can make full use of the CPU cores allocated to it. Therefore, slightly increasing the DOP to 15, for example, can make better use of the CPU cores. \*\* However, we recommend that you do not increase the DOP indefinitely. A DOP of 50 brings no benefit but increases the thread and framework scheduling overhead.

*   For a complex execution plan in the form of a right-deep tree, three DFOs are started at the same time. Each DFO can be allocated with around 7 CPU cores for efficient execution.

> For an execution plan, three DFOs need to be started only in some steps. In most steps, only two DFOs need to be started at the same time. In this case, a DOP of 10 might be better than a DOP of 7.

After tuning, the situation of the tenant with 20 CPU cores may be as follows:

*   For simple single-table operations, such as scan, filtering, addition, deletion, and modification, the **actual DOP** is 30.
*   For multi-table join queries and PDML operations involving global indexes, the **actual DOP** is 15.
*   For complex execution plans in the form of a right-deep tree, the **actual DOP** is between 10 to 15.