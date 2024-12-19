---
slug: parallel-execution-IV
title: 'Mastering Parallel Execution in OceanBase Database: Part 4 - Parallel Execution Types'
---

> OceanBase Database supports parallel execution for various types of statements. This article introduces these types in detail, including parallel query, parallel DML (PDML), parallel DDL, and parallel LOAD DATA.

This is the fourth article of a seven-part series on parallel execution.

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

4.1 Parallel Query
--------

You can use parallel queries in the following scenarios:

*   `SELECT` statements and `SELECT` subqueries
*   Query part of DML statements (such as `INSERT`, `UPDATE`, and `DELETE`)
*   Queries on external tables

  

A parallel query involves two decision-making steps:

1.  Decide whether to perform a parallel query. If a `PARALLEL` hint is used in the query, the parallel query feature is enabled for the current session, or the `PARALLEL` attribute is specified for a table, a parallel query will be performed.
2.  Determine a degree of parallelism (DOP). In a parallel query, each data flow operation (DFO) can have a different DOP.

*   For a DFO for scanning base tables or indexes, its DOP is determined by the `PARALLEL` hint, parallel query attribute of the session, or the `PARALLEL` attribute of the table.
*   If it is detected that the data accessed by a DFO for scanning base tables or indexes is less than a macroblock, the DOP is partially decreased while the DFO is running.
*   The DOP of an intermediate node such as a join is inherited from that of the left-side sub-DFO of the join.
*   Some DFOs, such as a node for calculating `ROWNUM`, do not support parallel execution. The DOPs of such DFOs are forcibly set to 1.

  

4.2 PDML
----------

In most scenarios, PDML can significantly improve the data import, update, and deletion performance.

  

### 4.2.1 DOP for DML

The DOP for DML is consistent with that of the query part. If PDML is enabled, parallel execution is automatically enabled for the query part. The data read is redistributed based on the partition locations in the table to be updated. The DML operations are executed in parallel by multiple threads. Each thread processes the data of multiple partitions.

The optimal performance can be achieved if the DOP is a multiple of the number of partitions in the target table. When the DOP is greater than the number of partitions, multiple threads process the data in the same partition. When the DOP is smaller than the partition quantity, a single thread may process the data of multiple partitions and the partitions processed by a thread do not overlap with those processed by another thread. When the DOP is greater than the number of partitions in the target table, we recommend that you set the DOP to an integral multiple of the number of partitions.

Generally, the number of threads that concurrently insert data into the same partition cannot exceed 4. If more than four threads concurrently insert data into the same partition, the scalability is limited, log synchronization may become a bottleneck, and partition-level lock synchronization overheads are generated. When the DOP is smaller than the number of partitions in the target table, we recommend that you set the DOP to a value which ensures that the number of partitions is an integral multiple of the DOP. In this way, each thread processes a similar number of partitions, avoiding an imbalance in the insertion workloads.

  

### 4.2.2 Strategy for Processing Index Tables

Automatic maintenance is supported for index tables during PDML.

For local index tables, the storage layer automatically maintains them when the primary table is updated by using PDML.

For global index tables, the PDML framework maintains them by generating a specific plan. Assume that two global indexes exist. Here is how they are processed:

1.  DFO 1 updates the primary table.
2.  DFO 1 transfers the data required by global indexes 1 and 2 to DFO 2, and DFO 2 updates global index table 1.
3.  DFO 2 transfers the data required by global index 2 to DFO 3, and DFO 3 updates global index table 2.

![1705634034](/img/blogs/tech/parallel-execution-IV/1705634034065.png)

The preceding strategy applies to `INSERT`, `DELETE`, and `UPDATE` statements. For the `MERGE` statement, index maintenance is concentrated in a single DFO, as shown in the following figure.

1.  DFO 1 updates the primary table.
2.  DFO 1 transfers the data required by global indexes 1 and 2 to DFO 2, and DFO 2 maintains the two global indexes one by one.

![1705634043](/img/blogs/tech/parallel-execution-IV/1705634043346.png)

  

### 4.2.3 Strategy for Updating a Partitioning Key

When you use the `UPDATE` statement to update the partitioning key of a primary table or global index table, you must perform row movement to delete the existing data from the original partition and insert new data into the new partition.

During row movement, an `UPDATE` operation is divided into a `DELETE` operation and an `INSERT` operation. The first DFO is responsible for the `DELETE` operation and the second DFO is responsible for the `INSERT` operation. To avoid primary key conflicts, the `INSERT` DFO can be executed only after the `DELETE` DFO is completed.

  

### 4.2.4 Transaction Processing

Like regular DML statements in OceanBase Database, PDML statements also support transaction processing. A PDML statement can appear in the same transaction with another query statement. After the PDML statement is executed, the transaction does not need to be immediately committed. The execution result of the PDML statement can be read in the subsequent query statement.

In OceanBase Database of a version earlier than V4.1, if the execution time of a PDML statement is excessively long, you must set an appropriate value for the tenant-level parameter `undo_retention`. Otherwise, the error `-4138 (OB_SNAPSHOT_DISCARDED)` may occur and the SQL statements are repeatedly retried until a timeout. Literally, the `undo_retention` parameter specifies the retention point of undo logs, which is the scope of the undo logs to be retained from the time dimension. In OceanBase Database, all multiversion data within the specified period is retained. If the execution time of a PDML statement exceeds the value of the `undo_retention` parameter, the multiversion data may be evicted. If any subsequent operation tries to access the evicted multiversion data, the error `OB_SNAPSHOT_DISCARDED` will be returned. The default value of the `undo_retention` parameter is 30 minutes. To be specific, if a PDML statement is not completed within 30 minutes, it can time out with an error returned, regardless of the timeout value specified for the statement. Generally, if the maximum PDML execution time is 2 hours, you can set `undo_retention` to 2.5 hours. You cannot set `undo_retention` to a very large value. Otherwise, the multiversion data cannot be recycled and the disk space will be used up.

Since OceanBase Database V4.1, the execution time of PDML statements is no longer controlled by the `undo_retention` parameter. Multiversion data is recycled based on the transaction version. The data that can be read based on the version of a transaction will not be recycled as long as this transaction is active. However, it makes an exception if the data disk is full. In this case, the multiversion data is forcibly recycled. The system returns the error `OB_SNAPSHOT_DISCARDED` for the PDML statement and automatically retries the whole statement.

  

### 4.2.5 Direct Load

Insufficient memory space easily leads to an out of memory (OOM) error for PDML statements. A PDML statement that does not use a direct load path first writes data to the MemTable, and then the data is written to the disk through minor and major compactions. If the PDML statement writes data to the MemTable at a speed higher than the minor compaction speed, the memory usage keeps increasing until an OOM error is returned.

To resolve this issue, OceanBase Database V4.1 has introduced the [direct load](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714719) feature at the storage layer. If a PDML statement executes an `INSERT` operation through direct load, data will be directly written to the disk without the need to be written to the MemTable first. This avoids the OOM error and improves the data import performance.

You can use an `APPEND` hint to enable the direct load feature. Before starting direct load, make sure that the previous transaction is committed and set `autocommit` to `1`. In OceanBase Database V4.2, direct load must be used in combination with PDML. If PDML is not enabled by using a hint or for the session, the direct load hint is automatically ignored. Here is an example:

    set autocommit = 1;
    insert /*+ append enable_parallel_dml parallel(3) */ into t1 select * from t2;

In later versions, you can use the direct load feature at any point within a transaction.

  

### 4.2.6 DML Operations Unsuitable for Parallel Execution

To ensure correct DML semantics, parallel execution is supported for the query part but not for the DML part in the following scenarios:

*   The target table contains a local unique index.
*   The `INSERT ON DUPLICATE KEY UPDATE` statement is used.
*   The target table contains triggers or foreign keys.
*   The target table of the `MERGE INTO` statement contains a global unique index.
*   The `IGNORE` mode is enabled for DML.

If parallel execution is not performed for a DML statement, you can execute the `EXPLAIN EXTENDED` statement and view the `Note` field in the return result for the reason.

  

### 4.2.7 Row Movement

When you update the partitioning key of a partitioned table, data may be migrated from one partition to another. In Oracle mode, you can execute the following statement to disable cross-partition data migration:

    create table t1 (c1 int primary key, c2 int) partition by hash(c1) partitions 3;
    alter table t1 disable row movement;
    
    OceanBase(TEST@TEST)>update t1 set c1 = c1 + 100000000;
    ORA-14402: updating partition key column would cause a partition change

However, PDML will ignore the `ROW MOVEMENT` attribute of tables and always allow partitioning key updates.

  

4.3 Parallel DDL
----------

OceanBase Database supports parallel execution for the following DDL statements:

*   CREATE TABLE AS SELECT
*   ALTER TABLE
*   CREATE INDEX

  

### 4.3.0 Technical Mechanism

All parallel DDL operations are completed by using specific PDML operations. For example, creating an index is to create an empty index table, retrieve data of index columns from the primary table in parallel, and insert the data into the index table in parallel.

  

### 4.3.1 Specify a DOP by Using a Hint

In OceanBase Database V4.2, **only the `CREATE INDEX` statement** supports enabling parallel execution by using the `PARALLEL` hint. For other DDL statements, parallel execution can be enabled only by using a session variable or the `PARALLEL` attribute of the table.

    CREATE /*+ PARALLEL(3) */ INDEX IDX ON T1(C2);

  


### 4.3.2 Specify a DOP by Using a Session Variable

All the preceding DDL statements support specifying a DOP by using a session variable. After you specify a DOP, all DDL statements in the session are executed in parallel based on the specified DOP. The DOPs of the query part and modification part are the same.

    SET _FORCE_PARALLEL_DDL_DOP = 3;
    CREATE TABLE T1 (C1 int, C2 int, C3 int, C4 int);
    CREATE INDEX IDX ON T1(C2);
    
    -- To enable parallel execution for the CREATE TABLE AS SELECT statement in OceanBase Database V4.2,
    -- you must specify the _FORCE_PARALLEL_DML_DOP parameter
    -- instead of the _FORCE_PARALLEL_DDL_DOP parameter.
    -- OceanBase Database of later versions may require specifying the _FORCE_PARALLEL_DDL_DOP parameter.
    SET _FORCE_PARALLEL_DML_DOP = 3;
    CREATE TABLE T1 (C1 int, C2 int, C3 int, C4 int);
    CREATE TABLE T2 AS SELECT * FROM T1;

  


### 4.3.3 Specify a DOP by Using the PARALLEL Attribute of a Table

  

In the real-world test, the parallel execution was not performed on the example provided in this section. You can use the following statement to confirm whether it aligns with the design.

`select plan\_operation, count(\*) threads from oceanbase.gv$sql\_plan\_monitor where trace\_id = last\_trace\_id() group by plan\_line\_id, plan\_operation order by plan\_line\_id;`

When you want to perform DDL operations on a table that has the `PARALLEL` attribute, you can use the `SET` statement to enable parallel execution by setting the corresponding session variable. Here is an example:

    SET _ENABLE_PARALLEL_DDL = 1;
    CREATE TABLE T1 (C1 int, C2 int, C3 int, C4 int) PARALLEL = 3;
    CREATE INDEX IDX ON T1(C2) PARALLEL = 2;
    
    -- To enable parallel execution for the CREATE TABLE AS SELECT statement in OceanBase Database V4.2,
    -- you must specify the _ENABLE_PARALLEL_DML parameter
    -- instead of the _ENABLE_PARALLEL_DDL parameter.
    -- OceanBase Database of later versions may require specifying the _ENABLE_PARALLEL_DDL parameter.
    SET _ENABLE_PARALLEL_DML = 1;
    CREATE TABLE T1 (C1 int, C2 int, C3 int, C4 int) PARALLEL = 3;
    CREATE TABLE T2 PARALLEL 2 AS SELECT * FROM T1;

  


### 4.3.4 Priorities

If two or all of the `PARALLEL` hint, session-level attribute `FORCE SESSION PARALLEL`, and table-level attribute `PARALLEL` are specified, their priorities are sorted as follows:

`PARALLEL` hint > Session-level attribute `FORCE SESSION PARALLEL` > Table-level attribute `PARALLEL`.

  

### 4.3.5 Direct Load

Direct load is used for the `CREATE INDEX` statement, regardless of whether parallel execution is enabled for the statement.

In OceanBase Database V4.2, the `CREATE TABLE AS SELECT` statement does not support direct load. If the amount of data is large, we recommend that you first create an empty table and then insert data into the table in parallel through direct load by using PDML.

  

4.4 Parallel LOAD DATA
----------------

`LOAD DATA` is not implemented based on PDML. Specifically, the system uses multiple threads to split the CSV file into multiple `INSERT` statements and then distributes the `INSERT` statements based on the specified DOP.

    LOAD DATA /*+ parallel(2) */ infile "test.csv" INTO TABLE t1 FIELDS TERMINATED BY ',' ENCLOSED BY '"';

In the preceding statement, the `PARALLEL` attribute specifies the DOP for loading data. If the value of the `PARALLEL` attribute is not specified, `LOAD DATA` is executed based on the DOP of 4, which is the default value of the `PARALLEL` attribute. We recommend that you set `PARALLEL` to a value within the range from `0` to the maximum number of CPU cores of the tenant.

  

4.5 Scenarios Where Parallel Execution Is Partially Inapplicable
-------------

*   The top-layer DFO does not require parallel execution. It interacts with the client and executes top-layer operations that do not require parallel execution, such as `LIMIT` and `PX COORDINATOR` operations.
*   A DFO that contains a table-valued user-defined function (UDF) can only be executed in serial. Other DFOs can still be executed in parallel.