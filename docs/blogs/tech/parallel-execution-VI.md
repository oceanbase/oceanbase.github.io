---
slug: parallel-execution-VI
title: 'Mastering Parallel Execution in OceanBase Database: Part 6 - Troubleshooting and Tuning Tips'
---


> You can diagnose parallel execution issues from two perspectives. For the whole system, you can check whether the network, disk I/O, and CPU resources are used up. For specific SQL statements, you can locate the problematic SQL statements and check their internal status.

This is the sixth article of a seven-part series on parallel execution.

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

6.1 System Diagnostics
--------

When a performance issue occurs in a busy business system, you first need to perform preliminary diagnostics for the whole system by using either of the following two methods:

*   OceanBase Cloud Platform (OCP): You can observe the system performance on the GUI.
*   Command-line system tools such as TSAR: You can query historical monitoring data of network, disk, and CPU resources.

TSAR is a tool for system monitoring and performance analysis. It can provide details about CPU, disk, and network resources. Here are some examples of using the TSAR command.

```bash
    tsar --cpu
    
    tsar --io
    
    tsar --traffic
```

TSAR also provides other options and parameters. For example, `-d 2` specifies to query the data of the last two days, and `-i 1` specifies to collect data at an interval of 1 minute and display the collected data by minute.

```bash
    tsar -n 2 -i 1 --cpu
```

If the disk or network resources are used up, you can first check whether the hardware capacity is too small or the parallel execution load is too heavy.

  

6.2 SQL Diagnostics
----------

When a parallel execution issue occurs, you can perform diagnostics at the SQL layer, parallel execution (PX) thread layer, and operator layer in sequence.

### 6.2.1 Verify Whether the SQL Query Is Still in Progress

To verify whether the SQL query is running normally, query the `GV$OB_PROCESSLIST` view. If the value of the `TIME` field keeps increasing and the value of the `STATE` field is `ACTIVE`, the SQL query is still in progress.

To verify whether the SQL query is repeatedly retried, view the `RETRY_CNT` and `RETRY_INFO` fields. `RETRY_CNT` indicates the number of retries. `RETRY_INFO` indicates the reason for the last retry. `TOTAL_TIME` indicates the total execution time of the SQL query, including the time consumed for each retry. If the SQL query is repeatedly retried, determine whether manual intervention is required based on the error code provided in `RETRY_INFO`. In OceanBase Database of a version earlier than V4.1, the most common error is `-4138 (OB_SNAPSHOT_DISCARDED)`. If this error is returned, increase the value of `undo_retention` by referring to Section 4.2.4 in [Mastering Parallel Execution in OceanBase Database: Part 4 - Parallel Execution Types](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-IV). For other errors such as `-4038 (OB_NOT_MASTER)`, wait for the automatic retry to succeed. If the number of retries consistently exceeds one while the system is stable, contact the OceanBase R&D team for further analysis.

```sql
    -- MySQL mode
    SELECT
      TENANT,INFO,TRACE_ID,STATE,TIME,TOTAL_TIME,RETRY_CNT,RETRY_INFO
    FROM
      oceanbase.GV$OB_PROCESSLIST;
```

If you find the corresponding SQL statement in the `GV$OB_PROCESSLIST` view and the SQL statement is marked as `SESSION_KILLED` but fails to exit, contact the OceanBase R&D team to report the issue. This often occurs due to the following cause:

*   The `SESSION_KILLED` state is not detected correctly, preventing a timely exit from the execution process.

  

### 6.2.2 Verify Whether the SQL Query Is Being Executed in Parallel

You can query the `GV$OB_PX_WORKER_STAT` view for all active PX threads in an OceanBase cluster.

```sql
    -- MySQL mode
    OceanBase(admin@oceanbase)>select * from oceanbase.GV$OB_PX_WORKER_STAT;
    SESSION_ID: 3221520411
     TENANT_ID: 1002
        SVR_IP: 192.168.0.1
      SVR_PORT: 19510
      TRACE_ID: Y4C360B9E1F4D-0005F9A76E9E66B2-0-0
         QC_ID: 1
        SQC_ID: 0
     WORKER_ID: 0
        DFO_ID: 0
    START_TIME: 2023-04-23 17:29:17.372461
    
    -- Oracle mode
    OceanBase(root@SYS)>select * from SYS.GV$OB_PX_WORKER_STAT;
    SESSION_ID: 3221520410
     TENANT_ID: 1004
        SVR_IP: 192.168.0.1
      SVR_PORT: 19510
      TRACE_ID: Y4C360B9E1F4D-0005F9A76E9E66B1-0-0
         QC_ID: 1
        SQC_ID: 0
     WORKER_ID: 0
        DFO_ID: 0
    START_TIME: 2023-04-23 17:29:15.372461
```

Based on the trace ID queried from the `GV$OB_PROCESSLIST` view, you can query the `GV$OB_PX_WORKER_STAT` view for the data flow operations (DFOs) being executed in the current SQL query, as well as the execution time of the DFOs.

If no required information is found in the `GV$OB_PX_WORKER_STAT` view, but you can still find the corresponding SQL query in the `GV$OB_PROCESSLIST` view, the possible causes are as follows:

*   All DFOs have been completed, the result set is large, and data is being output to the client.
*   All DFOs except for the top-layer DFO have been completed.

  

### 6.2.3 Verify the Execution Status of Each Operator

Query the `oceanbase.GV$SQL_PLAN_MONITOR` view in MySQL mode or the `SYS.GV$SQL_PLAN_MONITOR` view in Oracle mode for the execution status of each operator in each PX thread. In OceanBase Database V4.1 and later, the `GV$SQL_PLAN_MONITOR` view records two parts of data:

*   Operators that have been completed, namely operators that have called the `close` operation and no longer process data in the current thread.
*   Operators that are being executed, namely operators that have not called the `close` operation and are processing data. To query data of these operators from the `GV$SQL_PLAN_MONITOR` view, you must specify `request_id < 0` in the `WHERE` condition. When you use the `request_id < 0` condition to query this view, you are calling the `Realtime SQL PLAN MONITOR` operation. This operation may change in the future.

In OceanBase Database of a version earlier than V4.1, you can view the status of only completed operators.

The important fields in the `GV$SQL_PLAN_MONITOR` view are described as follows:

*   `TRACE_ID`: the unique ID of an SQL statement.
*   `PLAN_LINE_ID`: the ID of an operator in the execution plan, which corresponds to the ID queried by using the `EXPLAIN` statement.
*   `PLAN_OPERATION`: the name of the operator, such as `TABLE SCAN` or `HASH JOIN`.
*   `OUTPUT_ROWS`: the number of rows generated by the current operator.
*   `FIRST_CHANGE_TIME`: the time when the operator generated the first row.
*   `LAST_CHANGE_TIME`: the time when the operator generated the last row.
*   `FIRST_REFRESH_TIME`: the time when the monitoring of the operator started.
*   `LAST_REFRESH_TIME`: the time when the monitoring of the operator ended.

The preceding fields can basically describe the major data processing actions taken by an operator. Here are some examples.

1.  The following sample code queries the number of threads used by each operator in a completed SQL statement.

    ```sql
    SELECT PLAN_LINE_ID, PLAN_OPERATION, COUNT(*) THREADS
    FROM GV$SQL_PLAN_MONITOR
    WHERE TRACE_ID = 'YA1E824573385-00053C8A6AB28111-0-0'
    GROUP BY PLAN_LINE_ID, PLAN_OPERATION
    ORDER BY PLAN_LINE_ID;
    
    +--------------+------------------------+---------+
    | PLAN_LINE_ID | PLAN_OPERATION         | THREADS |
    +--------------+------------------------+---------+
    |            0 | PHY_PX_FIFO_COORD      |       1 |
    |            1 | PHY_PX_REDUCE_TRANSMIT |       2 |
    |            2 | PHY_GRANULE_ITERATOR   |       2 |
    |            3 | PHY_TABLE_SCAN         |       2 |
    +--------------+------------------------+---------+
    4 rows in set (0.104 sec)
    ```

2.  The following sample code queries the operators being executed, the number of threads used, and the number of rows that have been generated in an SQL statement being executed.

    ```sql
    SELECT PLAN_LINE_ID, CONCAT(LPAD('', PLAN_DEPTH, ' '), PLAN_OPERATION) OPERATOR, COUNT(*) THREADS, SUM(OUTPUT_ROWS) ROWS
    FROM GV$SQL_PLAN_MONITOR
    WHERE TRACE_ID = 'YA1E824573385-00053C8A6AB28111-0-0' AND REQUEST_ID < 0
    GROUP BY PLAN_LINE_ID, PLAN_OPERATION, PLAN_DEPTH
    ORDER BY PLAN_LINE_ID;
    ```

3.  The following sample code queries the number of rows that have been processed by each operator and the number of rows that have been generated by each operator in a completed SQL statement.

    ```sql
    SELECT PLAN_LINE_ID, CONCAT(LPAD('', PLAN_DEPTH, ' '), PLAN_OPERATION) OPERATOR, SUM(OUTPUT_ROWS) ROWS
    FROM GV$SQL_PLAN_MONITOR
    WHERE TRACE_ID = 'Y4C360B9E1F4D-0005F9A76E9E6193-0-0'
    GROUP BY PLAN_LINE_ID, PLAN_OPERATION, PLAN_DEPTH
    ORDER BY PLAN_LINE_ID;
    +--------------+-----------------------------------+------+
    | PLAN_LINE_ID | OPERATOR                          | ROWS |
    +--------------+-----------------------------------+------+
    |            0 | PHY_PX_MERGE_SORT_COORD           |    2 |
    |            1 |  PHY_PX_REDUCE_TRANSMIT           |    2 |
    |            2 |   PHY_SORT                        |    2 |
    |            3 |    PHY_HASH_GROUP_BY              |    2 |
    |            4 |     PHY_PX_FIFO_RECEIVE           |    2 |
    |            5 |      PHY_PX_DIST_TRANSMIT         |    2 |
    |            6 |       PHY_HASH_GROUP_BY           |    2 |
    |            7 |        PHY_HASH_JOIN              | 2002 |
    |            8 |         PHY_HASH_JOIN             | 2002 |
    |            9 |          PHY_JOIN_FILTER          | 8192 |
    |           10 |           PHY_PX_FIFO_RECEIVE     | 8192 |
    |           11 |            PHY_PX_REPART_TRANSMIT | 8192 |
    |           12 |             PHY_GRANULE_ITERATOR  | 8192 |
    |           13 |              PHY_TABLE_SCAN       | 8192 |
    |           14 |          PHY_GRANULE_ITERATOR     | 8192 |
    |           15 |           PHY_TABLE_SCAN          | 8192 |
    |           16 |         PHY_GRANULE_ITERATOR      | 8192 |
    |           17 |          PHY_TABLE_SCAN           | 8192 |
    +--------------+-----------------------------------+------+
    18 rows in set (0.107 sec)
    ```

The `PLAN_DEPTH` field is used for indentation for better display effects. `PLAN_DEPTH` specifies the depth of an operator in the operator tree.

  

**Note:**

1.  Information about operators that have not been scheduled is not recorded in the `GV$SQL_PLAN_MONITOR` view.
2.  If a procedural language (PL) object contains multiple SQL statements, the statements share the same trace ID.

  

6.3 Parallel Execution Tuning Tips
------------

This section describes the basic tips for parallel execution tuning in OceanBase Database. As tuning never truly ends, we will keep updating the content in this section to include new ideas and improvements.

### 6.3.1 Manually Collect Statistics

If the statistics saved in the optimizer are outdated, a nonoptimal execution plan may be generated. OceanBase Database provides API operations for manually collecting statistics in V3.2 and V4.1. For more information, see [Manually collect statistics](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001134124).

The syntax for collecting statistics on a primary table or an index table in OceanBase Database V4.1 is as follows:

```sql
    -- Collect the global statistics on the T1 table of the TEST user, and enable the AUTO strategy for determining the number of buckets for all columns.
    call dbms_stats.gather_table_stats('TEST', 'T1', granularity=>'GLOBAL', method_opt=>'FOR ALL COLUMNS SIZE AUTO');
    -- Collect the statistics on the IDX index in the T1 table of the TEST user, set the degree of parallelism (DOP) to 4, and specify the table name. The table name must be specified because the index name is not unique.
    call dbms_stats.gather_index_stats('TEST', 'IDX', degree=>4, tabname=>'T1');
```

### 6.3.2 Modify the Partitioning Method for a Partition-wise Join

For a large-table join in a proof of concept (PoC) scenario, if allowed by the business system, you can use the same partitioning method for the large tables and bind the tables to the same table group to achieve optimal performance for partition-wise joins. When you perform a partition-wise join, you must adjust the DOP to a value that matches the partition quantity to achieve optimal performance.

### 6.3.3 Adapt the DOP and Partition Quantity

Generally, preferable performance can be achieved if the DOP and the partition quantity are in an integral multiple relationship. For more information, see Section 1.6 in [Mastering Parallel Execution in OceanBase Database: Part 1 - Introduction to Parallel Execution](https://oceanbase.github.io/docs/blogs/tech/parallel-execution-I).

### 6.3.4 Create Indexes

You can create appropriate indexes to reduce the amount of data to be scanned, thereby improving the parallel execution performance. You need to determine the tables and columns on which indexes are to be created based on specific SQL statements.

### 6.3.5 Create Replicated Tables

In OceanBase Database V4.2 and later, you can create replicated tables to reduce data redistribution, thereby improving the parallel execution performance. For more information, see the **Create a replicated table** section in [Create a table](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001031355). The basic syntax for creating a replicated table is as follows:

```sql
    create table dup_t1(c1 int) duplicate_scope = 'cluster';
```
