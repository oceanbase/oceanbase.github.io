---
title: Typical scenarios and troubleshooting logic for SQL performance issues
weight: 8
---

# 7.7 Typical scenarios and troubleshooting logic for SQL performance issues

This topic describes how to diagnose SQL performance issues. For more information about SQL tuning, see '7.5 Read and manage SQL execution plans in OceanBase Database' and '7.6 Common SQL tuning methods'.

Perform troubleshooting in the following procedure:

1. Execute the `SHOW TRACE` statement to query the time spent in each phase and identify the phase that takes the longest time.

2. If the query result in Step 1 shows that an observer process is slow, query the `oceanbase.gv$ob_sql_audit` view for the phase that takes the longest time in the observer process.

3. If the query result in Step 2 shows that the execution phase takes the longest time, check for buffer tables, cardinality, and hard parsing.

4. If none of the preceding issues exists, execute the `EXPLAIN EXTENDED` statement to query the execution plan and check whether the number of rows estimated by the optimizer greatly differs from the actual one. If yes, manually collect statistics. If no, create a more appropriate index or use a hint to modify the plan or the degree of parallelism (DOP). For information about how to set a DOP for parallel execution, see [Set a DOP for parallel execution](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378909). For information about how to optimize an SQL statement by using the `EXPLAIN` statement, see [SQL tuning practice with EXPLAIN](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001168989).

This topic describes the tools commonly used for analyzing SQL performance issues and summarizes the typical scenarios and issues of SQL tuning.

## Tools for analyzing SQL performance issues

You can use the end-to-end tracing, SQL audit, and SQL plan monitor features to analyze SQL performance issues.

### End-to-end tracing

Data is processed through the following link: `application server <-> OceanBase Database Proxy (ODP) <-> OBServer node`. Specifically, an application server connects to and sends requests to ODP by calling database drivers. Then, ODP forwards the requests to the most appropriate OBServer nodes of OceanBase Database, which stores user data in multiple partitions and replicas across OBServer nodes in its distributed architecture. OBServer nodes execute the requests and return the execution results to the user. OBServer nodes also support request forwarding. If a request cannot be executed on the current OBServer node, it is forwarded to the appropriate OBServer node.

In the case of an end-to-end performance issue, such as long response time (RT) detected on the application server, you need to first find the component that has caused the issue on the database access link, and then troubleshoot the component.

![End-to-end tracing 01](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/001.png)

![End-to-end tracing 02](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/002.png)

![End-to-end tracing 03](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/003.png)

Two paths are involved in end-to-end tracing:

- An application sends a request to ODP through a client, such as Java Database Connectivity (JDBC) or Oracle Call Interface (OCI), ODP forwards the request to an OBServer node, and then the OBServer node returns the result to the application.

- An application directly sends a request to an OBServer node through a client, and then the OBServer node returns the result to the application.

Here is an example:

1. Use ODP to connect to OceanBase Database, create a table, and insert data into the table.

   ```sql
   create table t1(c1 int);

   insert into t1 values(123);
   ```

2. Enable end-to-end tracing for the current session.

   ```sql
   SET ob_enable_show_trace = ON;
   ```

3. Execute a simple query statement.

   ```sql
   SELECT c1 FROM t1 LIMIT 2;
   ```

   The output is as follows:

   ```shell
   +------+
   | c1   |
   +------+
   |  123 |
   +------+
   1 row in set
   ```

4. Execute the `SHOW TRACE` statement.

   ```sql
   SHOW TRACE;
   ```

   The output is as follows:

   ```shell
   +-----------------------------------------------------------+----------------------------+------------+
   | Operation                                                 | StartTime                  | ElapseTime |
   +-----------------------------------------------------------+----------------------------+------------+
   | ob_proxy                                                  | 2024-03-20 15:07:46.419433 | 191.999 ms |
   | ├── ob_proxy_partition_location_lookup                    | 2024-03-20 15:07:46.419494 | 181.839 ms |
   | ├── ob_proxy_server_process_req                           | 2024-03-20 15:07:46.601697 | 9.138 ms   |
   | └── com_query_process                                     | 2024-03-20 15:07:46.601920 | 8.824 ms   |
   |     └── mpquery_single_stmt                               | 2024-03-20 15:07:46.601940 | 8.765 ms   |
   |         ├── sql_compile                                   | 2024-03-20 15:07:46.601984 | 7.666 ms   |
   |         │   ├── pc_get_plan                               | 2024-03-20 15:07:46.602051 | 0.029 ms   |
   |         │   └── hard_parse                                | 2024-03-20 15:07:46.602195 | 7.423 ms   |
   |         │       ├── parse                                 | 2024-03-20 15:07:46.602201 | 0.137 ms   |
   |         │       ├── resolve                               | 2024-03-20 15:07:46.602393 | 0.555 ms   |
   |         │       ├── rewrite                               | 2024-03-20 15:07:46.603104 | 1.055 ms   |
   |         │       ├── optimize                              | 2024-03-20 15:07:46.604194 | 4.298 ms   |
   |         │       │   ├── inner_execute_read                | 2024-03-20 15:07:46.605959 | 0.825 ms   |
   |         │       │   │   ├── sql_compile                   | 2024-03-20 15:07:46.606078 | 0.321 ms   |
   |         │       │   │   │   └── pc_get_plan               | 2024-03-20 15:07:46.606124 | 0.147 ms   |
   |         │       │   │   ├── open                          | 2024-03-20 15:07:46.606418 | 0.129 ms   |
   |         │       │   │   └── do_local_das_task             | 2024-03-20 15:07:46.606606 | 0.095 ms   |
   |         │       │   └── close                             | 2024-03-20 15:07:46.606813 | 0.240 ms   |
   |         │       │       ├── close_das_task                | 2024-03-20 15:07:46.606879 | 0.022 ms   |
   |         │       │       └── end_transaction               | 2024-03-20 15:07:46.607009 | 0.023 ms   |
   |         │       ├── code_generate                         | 2024-03-20 15:07:46.608527 | 0.374 ms   |
   |         │       └── pc_add_plan                           | 2024-03-20 15:07:46.609375 | 0.207 ms   |
   |         └── sql_execute                                   | 2024-03-20 15:07:46.609677 | 0.832 ms   |
   |             ├── open                                      | 2024-03-20 15:07:46.609684 | 0.156 ms   |
   |             ├── response_result                           | 2024-03-20 15:07:46.609875 | 0.327 ms   |
   |             │   └── do_local_das_task                     | 2024-03-20 15:07:46.609905 | 0.136 ms   |
   |             └── close                                     | 2024-03-20 15:07:46.610221 | 0.225 ms   |
   |                 ├── close_das_task                        | 2024-03-20 15:07:46.610229 | 0.029 ms   |
   |                 └── end_transaction                       | 2024-03-20 15:07:46.610410 | 0.019 ms   |
   +-----------------------------------------------------------+----------------------------+------------+
   29 rows in set
   ```

   The query result shows that:

   - The execution of the SQL statement took a total of 191.999 ms.

   - The `ob_proxy_partition_location_lookup` operation took 181.839 ms, which was the time taken by ODP to search for the location of the leader of the `t1` table. This operation took a long time because the `t1` table was newly created and ODP had not cached its location information in the location. However, ODP will directly get the location information from the location cache upon next access to the table.

   - The `com_query_process` operation on the OBServer node to which the SQL statement was forwarded took 8.824 ms.

5. Execute the `SELECT c1 FROM t1 LIMIT 2;` statement in the same session again, and then execute the `SHOW TRACE` statement.

   ```sql
   SHOW TRACE;
   ```

   The output is as follows:

   ```shell
   +-----------------------------------------------+----------------------------+------------+
   | Operation                                     | StartTime                  | ElapseTime |
   +-----------------------------------------------+----------------------------+------------+
   | ob_proxy                                      | 2024-03-20 15:34:14.879559 | 7.390 ms   |
   | ├── ob_proxy_partition_location_lookup        | 2024-03-20 15:34:14.879652 | 4.691 ms   |
   | ├── ob_proxy_server_process_req               | 2024-03-20 15:34:14.884785 | 1.514 ms   |
   | └── com_query_process                         | 2024-03-20 15:34:14.884943 | 1.237 ms   |
   |     └── mpquery_single_stmt                   | 2024-03-20 15:34:14.884959 | 1.207 ms   |
   |         ├── sql_compile                       | 2024-03-20 15:34:14.884997 | 0.279 ms   |
   |         │   └── pc_get_plan                   | 2024-03-20 15:34:14.885042 | 0.071 ms   |
   |         └── sql_execute                       | 2024-03-20 15:34:14.885300 | 0.809 ms   |
   |             ├── open                          | 2024-03-20 15:34:14.885310 | 0.139 ms   |
   |             ├── response_result               | 2024-03-20 15:34:14.885513 | 0.314 ms   |
   |             │   └── do_local_das_task         | 2024-03-20 15:34:14.885548 | 0.114 ms   |
   |             └── close                         | 2024-03-20 15:34:14.885847 | 0.190 ms   |
   |                 ├── close_das_task            | 2024-03-20 15:34:14.885856 | 0.030 ms   |
   |                 └── end_transaction           | 2024-03-20 15:34:14.885997 | 0.019 ms   |
   +-----------------------------------------------+----------------------------+------------+
   14 rows in set
   ```

   The query result shows that:

   - The execution time of the SQL statement was shortened from 191.999 ms to 7.390 ms.

   - The time taken by ODP to search for routing information and forwarding the SQL statement was shortened from 181.839 ms to 4.691 ms. This is because ODP directly obtained the location information from the location cache.

   - The time taken by the `com_query_process` operation on the OBServer node to which the SQL statement was forwarded was shortened from 8.824 ms to 1.237 ms. The execution of the preceding SQL statement was divided into two phases. In the compilation phase, the optimizer generated an execution plan. In the execution phase, the execution engine calculated results based on the execution plan. During the second execution, the time spent in the compilation phase was shortened. This is because an execution plan (`pc_get_plan`) has been generated and stored in the plan cache during the first execution and no plan needed to be generated again during the second execution. This way, the overhead of the `hard_parse` operation to parse the SQL statement and generate a plan was eliminated.

6. Directly connect to the OBServer node to log on to OceanBase Database, execute the `SELECT c1 FROM t1 LIMIT 2;` statement again, and then execute the `SHOW TRACE` statement.

   ```sql
   SHOW TRACE;
   ```

   The output is as follows:

   ```shell
   +-------------------------------------------+----------------------------+------------+
   | Operation                                 | StartTime                  | ElapseTime |
   +-------------------------------------------+----------------------------+------------+
   | com_query_process                         | 2024-03-20 15:54:38.772699 | 1.746 ms   |
   | └── mpquery_single_stmt                   | 2024-03-20 15:54:38.772771 | 1.647 ms   |
   |     ├── sql_compile                       | 2024-03-20 15:54:38.772835 | 0.356 ms   |
   |     │   └── pc_get_plan                   | 2024-03-20 15:54:38.772900 | 0.143 ms   |
   |     └── sql_execute                       | 2024-03-20 15:54:38.773209 | 1.052 ms   |
   |         ├── open                          | 2024-03-20 15:54:38.773232 | 0.150 ms   |
   |         ├── response_result               | 2024-03-20 15:54:38.773413 | 0.421 ms   |
   |         │   └── do_local_das_task         | 2024-03-20 15:54:38.773479 | 0.192 ms   |
   |         └── close                         | 2024-03-20 15:54:38.773857 | 0.379 ms   |
   |             ├── close_das_task            | 2024-03-20 15:54:38.773913 | 0.069 ms   |
   |             └── end_transaction           | 2024-03-20 15:54:38.774139 | 0.058 ms   |
   +-------------------------------------------+----------------------------+------------+
   11 rows in set
   ```

   The query result shows that:

   - The direct connection to the OBServer node eliminated ODP-related overheads.

   - The execution plan for the SQL statement was stored in the plan cache of the OBServer node. Therefore, hard parsing was not required in the compilation phase of the next execution.

To sum up, the end-to-end tracing feature allows you to query the time spent in each phase of the execution of an SQL statement with unexpected performance. You can execute the `SHOW TRACE` statement to check whether ODP forwarding, plan generation, or execution takes the longest time. The `SHOW TRACE` statement returns details about the time spent in each phase for you to further analyze the slow operations. In the preceding example, the `SHOW TRACE` statement does not return many details because the SQL statement is simple and the plan cache is used.

If ODP forwarding is slow, check whether the network between ODP and the OBServer node fails or whether ODP has not cached location information. For information about ODP performance analysis, see [Performance analysis](https://en.oceanbase.com/docs/common-odp-doc-en-10000000001177457).

If the execution is slow, check whether the index used in the execution plan is inappropriate and perform SQL tuning as needed. For more information about execution plans, see the preceding topics.

### SQL audit

The `GV$OB_SQL_AUDIT` view is the most frequently used SQL monitoring view. It records the source, execution status, resource consumption, and wait events of each SQL statement. It also records key information such as the SQL text and execution plans. Therefore, it is a great tool for SQL diagnostics. For more information, see [SQL audit](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001169151).

In case of an online RT jitter where the RT is not constantly high, you may consider executing the `alter system set ob_enable_sql_audit = 0;` statement to disable SQL audit after the jitter occurs. This ensures that the SQL statement causing the jitter is not evicted from the `GV$OB_SQL_AUDIT` view.

Then you can query the `GV$OB_SQL_AUDIT` view for the top N SQL statements with the longest execution time within a specified period.

```sql
-- Query the top N SQL statements with the longest execution time within a specified period.
select /*+ parallel(15) */ sql_id, elapsed_time, trace_id, substr(query_sql, 1, 6) -- For ease of display, query_sql is truncated.
from oceanbase.gv$ob_sql_audit     
where tenant_id = 1
      and IS_EXECUTOR_RPC = 0 
      and request_time > (time_to_usec(now()) - 10000000) 
      and request_time < time_to_usec(now()) 
order by elapsed_time desc
limit 10;
```

The output is as follows:

```shell
+----------------------------------+--------------+------------------------------------+-------------------------+
| sql_id                           | elapsed_time | trace_id                           | substr(query_sql, 1, 6) |
+----------------------------------+--------------+------------------------------------+-------------------------+
| 3BD6E04969DEE524A788E629AFD1D202 |       124223 | Y584A0BA1CC5A-0006141213C0C8FD-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        19367 | Y584E0BA1CC5A-00061412076765AD-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        18789 | Y58480BA1CC5B-00061412075A8FD9-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        18307 | Y584E0BA1CC5A-00061412076765AE-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        17801 | Y584E0BA1CC5A-00061412076765AF-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        17305 | Y58480BA1CC5B-00061412075A8FD8-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        16928 | Y58480BA1CC5B-00061412075A8FD7-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        12575 | Y584A0BA1CC5A-00061412076125CC-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        11960 | Y584A0BA1CC5A-00061412076125CB-0-0 | select                  |
| B6F2A13C4C81145FFAA2F2A5CF9587A9 |        11869 | Y584A0BA1CC5A-00061412076125CA-0-0 | select                  |
+----------------------------------+--------------+------------------------------------+-------------------------+
10 rows in set
```

You can analyze SQL statement exceptions based on the fields in the `GV$OB_SQL_AUDIT` view.

- Check the `GET_PLAN_TIME` field for the time spent in getting the execution plan. A long period of time often comes with the value of `IS_HIT_PLAN` being `0`, which indicates that the plan cache is not hit and hard parsing is performed.

- Check the `SSSTORE_READ_ROW_COUNT` and `MEMSTORE_READ_ROW_COUNT` fields for buffer tables. For more information, see the [Buffer table issues](#Buffer%20table_issues) section.

- Check the `QUEUE_TIME` field for the queue time. A long queue time indicates that worker threads of the tenant are waiting. For more information, see the [Wait issues](#Wait_issues) section.

- Check the `RETRY_CNT` field for the number of retries. If the number is large, check for lock conflicts or leader switchovers.

- Check the `EXECUTE_TIME` field and analyze the execution plan in combination with the [GV$OB_PLAN_CACHE_PLAN_EXPLAIN](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001168178) dictionary view. If the execution plan is inappropriate, determine whether to create an appropriate index or use a hint to modify the join order or join algorithm. For more information, see '7.6 Common SQL tuning methods'.

```sql
select c1 from t1;
+------+
| c1   |
+------+
|  123 |
+------+
1 row in set

select last_trace_id();
+------------------------------------+
| last_trace_id()                    |
+------------------------------------+
| Y584A0B9E1F14-0006104BC96894F3-0-0 |
+------------------------------------+
1 row in set

select QUERY_SQL, PLAN_ID, RETURN_ROWS, NET_WAIT_TIME, QUEUE_TIME, GET_PLAN_TIME, EXECUTE_TIME
  from  oceanbase.GV$OB_SQL_AUDIT
  where trace_id = 'Y584A0B9E1F14-0006104BC96894F3-0-0';
+-------------------+---------+-------------+---------------+------------+---------------+--------------+
| QUERY_SQL         | PLAN_ID | RETURN_ROWS | NET_WAIT_TIME | QUEUE_TIME | GET_PLAN_TIME | EXECUTE_TIME |
+-------------------+---------+-------------+---------------+------------+---------------+--------------+
| select c1 from t1 |   53777 |           1 |            10 |         46 |           234 |          664 |
+-------------------+---------+-------------+---------------+------------+---------------+--------------+
1 row in set
```

> **Note**
>
> If the SQL statement causing the RT jitter has been evicted from the `GV$OB_SQL_AUDIT` view, you must check for trace logs of slow queries at the time of jitter and analyze these trace logs, if any.

### SQL plan monitor (advanced)

The SQL plan monitor feature analyzes performance issues for SQL statements with high DOPs and complex execution plans. It is integrated in obdiag to monitor the real-time execution of operators for the following types of SQL statements:

- SQL statements containing the `/*+ monitor*/` hint

- SQL statements using distributed execution plans with `parallel > 1`

- SQL statements with their execution time exceeding 1s

This feature is more complex than end-to-end tracing and SQL audit. Before you use it to analyze an SQL statement, you must read the execution plan for the SQL statement. You can use obdiag to collect the information recorded by SQL plan monitor. This way, you can identify slow operators and check whether tasks are evenly distributed to the threads of a slow operator in parallel execution or whether performance issues are caused by concentration of data in a few threads.

Here is an example: Perform an aggregation operation with a DOP of 3. If the generated plan is not a parallel plan, you must add the `/*+monitor*/` hint to enable SQL plan monitor.

```sql
select /*+parallel(3) */ count(c1) from t1;
+-----------+
| COUNT(C1) |
+-----------+
| 110000000 |
+-----------+
1 row in set

select last_trace_id() from dual;
+------------------------------------+
| LAST_TRACE_ID()                    |
+------------------------------------+
| Y58480B7C052B-0005EB5FF9C060FC-0-0 |
+------------------------------------+
1 row in set
```

Collect the information recorded by SQL plan monitor based on the trace ID.

```sql
[admin@test001 .obdiag]$ obdiag gather plan_monitor --trace_id Y58480B7C052B-0005EB5FF9C060FC-0-0
```

An HTML file is returned. You can open it to view the collected information.

![Sample information](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/004.png)

The preceding SQL statement is simple and has a simple execution plan that involves `COUNT` operations in two phases. In the first phase, three threads of Operator 3 perform `COUNT` operations separately. In the second phase, Operator 0 calculates the sum of count results from all threads. The following figure shows the sample information returned by SQL plan monitor. You can view the number of threads used by each operator and the number of rows returned by each operator.

![Example](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/005.png)

In the preceding figure, the granule count for the `PHY_GRANULE_ITERATOR` operator is highlighted in yellow. If multiple granules exist, one granule is distributed to each of the three threads at first. After a thread completes the granule distributed to it, it contends for other granules in the pool. You can move your pointer over the block highlighted in yellow to view the granule count. In the preceding figure, the job is divided into 12 granules. For more information about granules, see [Introduction to parallel execution](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378041).

The `RESCAN` column in the following figure shows that the three threads have processed data of 1+2, 1+3, and 1+4 granules respectively. 1 indicates the granule originally distributed to each thread. 2, 3, and 4 indicate the granules that the threads subsequently contended for from the pool.

![Details](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/006.png)

In this example, the granules are almost evenly distributed because the amount of data is very small.

When an operator involves a large amount of data, a large number of threads may be allocated to it. If only a few threads are working, you can collect the information recorded by SQL plan monitor and post it to the Q&A module in the OceanBase community or send it to OceanBase Technical Support. For example, in the following figure, a few threads of the `HASH JOIN` operator processed most of the data.

![image](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/007.png)

## Typical scenarios of SQL performance issues for OBServer nodes

When an OBServer node hits a performance bottleneck, you need to first identify whether the worker thread is blocked or has been running for a long time. The former case indicates that the worker thread is waiting for a system object, and the latter case indicates that the worker thread is scanning a large amount of data or that resources are insufficient. You must use different solutions for performance bottlenecks due to different root causes.

OceanBase Database provides a variety of internal tables and system logs for you to locate performance bottlenecks of OBServer nodes. For example, you can analyze OBServer node behaviors by using the SQL audit feature.

- Running state exceptions 
  
  Running state exceptions are likely related to execution plans. For example, if the execution plan generated by the optimizer for the SQL query is not the optimal one, a large amount of data may be scanned. If the hit rate of the cache plan is low, the SQL execution may take extra time for compilation. Insufficient resource during the execution can also result in a running state exception. Generally, running state exceptions can be solved by adjusting the execution plan or increasing resources.

- Blocked state exceptions 
  
  A worker thread of OceanBase Database is either running in the CPU or waiting for resources, such as I/O resources, network bandwidth, and critical sections. A worker thread is in the blocked state when it is waiting for resources. The blocking of worker threads indicates a concurrency bottleneck of the system and the throughput cannot be increased by adding more resources. To solve blocked state exceptions, you must first find the bottleneck and handle it with a specific optimization solution.

The following figure shows the major types of OBServer node exceptions based on the preceding analysis:

![Performance jitter](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/008.png)

### Execution issues

#### Non-optimal plans

The execution process of an SQL query is divided into a compilation phase and an execution phase. An execution plan is generated in the compilation phase, which consists of several sub-phases such as lexical parsing, syntax parsing, syntax optimization, and code generation. Then, the execution plan is submitted to the executor for execution, and the result is returned. The process of parsing an SQL query to generate the execution plan is known as hard parsing. Hard parsing consumes considerable resources and affects the duration of SQL execution. Therefore, a generated execution plans is stored in the plan cache. When the same SQL query is received next time, the system first checks whether it hits the plan cache. If yes, the cached plan is extracted and submitted to the executor for execution. This process is defined as soft parsing. This way, it is unnecessary to perform hard parsing for each SQL query, thereby reducing resource consumption. Therefore, the key to performance tuning is to make sure that SQL queries hit the plan cache and the plan is optimal.

![Execution process](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/07_troubleshooting_sql_performance_issues/009.png)

The optimizer may generate suboptimal execution plans due to various reasons, such as missing indexes, outdated statistics, buffer tables, and cardinality. The execution of a suboptimal execution plan requires massive logical reads and scanning of a large amount of data. As a result, the time consumption increases and the throughput decreases.

##### Buffer table issues

Data is frequently inserted to or deleted from a buffer table. An index table is also a buffer table. When the indexed column of a primary table is updated, data is inserted to or deleted from the index table.

Buffer tables arise from the LSM-tree-based storage engine of OceanBase Database. In an LSM-tree architecture, deleted data is first labeled "deleted" but is physically deleted only after a major compaction. If a large amount of incremental data is labeled "deleted", few rows are actually available for upper-layer applications. In addition, the labeled data may be processed during range queries, which is time-consuming and results in long execution time of SQL queries. In the presence of buffer tables, the optimizer is prone to generate suboptimal execution plans.

Buffer tables are an SQL exception that is triggered only when the following conditions are met: (1) Most data inserted into a table will be deleted soon, that is, only a small amount of data persists in the table. In general, OceanBase Database recycles data block holes (unused space) from the table to avoid exceptions. (2) A great deal of data is inserted and deleted in a short period of time, and data block holes of the table are not efficiently recycled, or data in the table piles up because the inserted data amount is larger than the deleted data amount. In this case, the database actually scans lots of data in the table, leading to SQL performance deterioration.

Here is an example: Insert 1,000 rows of data into a table, delete every other row to keep 500 rows, and then scan the table. Check the `physical_range_rows` and `logical_range_rows` fields in the execution plan for the number of physical rows actually scanned and the number of logical rows to be scanned in the table.

> **Note**
>
> After the SQL statement is executed, you can also check the `SSSTORE_READ_ROW_COUNT` and `MEMSTORE_READ_ROW_COUNT` fields in the `GV$OB_SQL_AUDIT` view for the numbers of physical rows and logical rows scanned.

1. Create a table for buffer table testing.

   ```sql
   create table t1(c1 int);
   ```

2. Insert 1,000 rows of data into the table.

   ```sql
   insert into t1 with recursive cte(n) as (select 1 from dual union all select n + 1 from cte where n < 1000) select n from cte;
   ```

3. Delete every other row to keep 500 rows.

   ```sql
   delete from t1 where c1 % 2 = 0;
   ```

4. Query the execution plan.

   ```sql
   explain extended_noaddr select * from t1;
   ```

   The output is as follows. Check the `physical_range_rows` and `logical_range_rows` fields in the execution plan.

   ```shell
   +-------------------------------------------------------------------+
   | Query Plan                                                        |
   +-------------------------------------------------------------------+
   | ===============================================                   |
   | |ID|OPERATOR       |NAME|EST.ROWS|EST.TIME(us)|                   |
   | -----------------------------------------------                   |
   | |0 |TABLE FULL SCAN|t1  |501     |38          |                   |
   | ===============================================                   |
   | Outputs & filters:                                                |
   | -------------------------------------                             |
   |   0 - output([t1.c1]), filter(nil), rowset=256                    |
   |       access([t1.c1]), partitions(p0)                             |
   |       is_index_back=false, is_global_index=false,                 |
   |       range_key([t1.__pk_increment]), range(MIN ; MAX)always true |
   | ......                                                            |
   | Optimization Info:                                                |
   | -------------------------------------                             |
   |   t1:                                                             |
   |       table_rows:501                                              |
   |       physical_range_rows:1000                                    |
   |       logical_range_rows:500                                      |
   |       index_back_rows:0                                           |
   |       output_rows:501                                             |
   |       table_dop:1                                                 |
   |       dop_method:Table DOP                                        |
   |       avaiable_index_name: [t1]                                    |
   |       stats version:0                                             |
   |       dynamic sampling level:0                                    |
   |   Plan Type:                                                      |
   |       LOCAL                                                       |
   |   Note:                                                           |
   |       Degree of Parallelisim is 1 because of table property       |
   +-------------------------------------------------------------------+
   45 rows in set
   ```

   For more information about the `physical_range_rows` and `logical_range_rows` fields, see '7.5 Read and manage SQL execution plans in OceanBase Database'. The `logical_range_rows` field indicates that only 500 logical rows need to be scanned. However, in the LSM-tree architecture, deleted data is only labeled "deleted" but not physically deleted until a major compaction. Therefore, the number of physical rows actually scanned that is indicated by the `physical_range_rows` field is still 1000.

   In this case, you can manually initiate a major compaction and then check the `physical_range_rows` and `logical_range_rows` fields in the execution plan.

5. Manually initiate a major compaction.

   ```sql
   ALTER SYSTEM MAJOR FREEZE;
   ```

   For more information, see [Manually initiate a major compaction](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001169027).

6. Query the major compaction progress.

   ```sql
   SELECT START_TIME, LAST_FINISH_TIME, STATUS FROM oceanbase.DBA_OB_MAJOR_COMPACTION;
   ```

   For more information, see [View the major compaction process](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001169024).

   ```shell
   +----------------------------+----------------------------+--------+
   | START_TIME                 | LAST_FINISH_TIME           | STATUS |
   +----------------------------+----------------------------+--------+
   | 2024-03-20 17:54:18.610008 | 2024-03-20 17:54:50.738156 | IDLE   |
   +----------------------------+----------------------------+--------+
   1 row in set
   ```

7. Query the execution plan again.

   ```sql
   explain extended_noaddr select * from t1;
   ```

   The output is as follows. Check the `physical_range_rows` and `logical_range_rows` fields in the execution plan.

   ```shell
   +-------------------------------------------------------------------+
   | Query Plan                                                        |
   +-------------------------------------------------------------------+
   | ===============================================                   |
   | |ID|OPERATOR       |NAME|EST.ROWS|EST.TIME(us)|                   |
   | -----------------------------------------------                   |
   | |0 |TABLE FULL SCAN|t1  |501     |21          |                   |
   | ===============================================                   |
   | Outputs & filters:                                                |
   | -------------------------------------                             |
   |   0 - output([t1.c1]), filter(nil), rowset=256                    |
   |       access([t1.c1]), partitions(p0)                             |
   |       is_index_back=false, is_global_index=false,                 |
   |       range_key([t1.__pk_increment]), range(MIN ; MAX)always true |
   | ......                                                            |
   | Optimization Info:                                                |
   | -------------------------------------                             |
   |   t1:                                                             |
   |       table_rows:501                                              |
   |       physical_range_rows:500                                     |
   |       logical_range_rows:500                                      |
   |       index_back_rows:0                                           |
   |       output_rows:501                                             |
   |       table_dop:1                                                 |
   |       dop_method:Table DOP                                        |
   |       avaiable_index_name: [t1]                                    |
   |       stats version:0                                             |
   |       dynamic sampling level:0                                    |
   |   Plan Type:                                                      |
   |       LOCAL                                                       |
   |   Note:                                                           |
   |       Degree of Parallelisim is 1 because of table property       |
   +-------------------------------------------------------------------+
   45 rows in set
   ```

   The major compaction has physically deleted the data labeled "deleted" and removed data block holes. Therefore, the value of `physical_range_rows` is the same as that of `logical_range_rows`.

To sum up, you can check the `physical_range_rows` and `logical_range_rows` fields in the execution plan for buffer tables. If the values of the two fields differ greatly, the table is a buffer table. You can manually initiate a major compaction to solve this problem. If you have concerns that the major compaction will take a long time, you can also use hints or outlines to optimize the execution plan.

##### Bad case of the plan cache (cardinality)

An optimal execution plan generated by the optimizer for the current dataset will be stored in the plan cache. However, this plan may not be optimal for subsequent datasets. As a result, a subsequent SQL query that hits the plan cache may take a long time. This is called a bad case of the plan cache.

For more information, see the **Bad case of the plan cache** section in '7.6 Common SQL tuning methods'.

##### Hard parsing

Hard parsing is a complete SQL compilation process, which is frequently performed for SQL queries when the hit rate of the plan cache is low. Therefore, hard parsing increases the SQL execution duration. You can check the values of the `GET_PLAN_TIME` field in the `GV$OB_SQL_AUDIT` view to determine whether the time consumed to generate an execution plan is abnormal. The duration of plan generation is usually less than 0.1 ms, but can be increased to more than 100 ms in the case of a request exception.

This is usually because a small cache size is configured and execution plans are therefore frequently evicted. You can use the system variable `ob_plan_cache_percentage` to increase the percentage of tenant memory available for the plan cache. The absolute value of the maximum memory size available for the plan cache is calculated by using the following formula: Maximum memory size for the tenant × `ob_plan_cache_percentage`/100. The default value of `ob_plan_cache_percentage` is `5`.

```sql
show variables like 'ob_plan_cache_percentage';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| ob_plan_cache_percentage | 5     |
+--------------------------+-------+
1 row in set (0.010 sec)

-- Modify the system variable `ob_plan_cache_percentage` of the tenant.
set global ob_plan_cache_percentage = 10;

show variables like 'ob_plan_cache_percentage';
+--------------------------+-------+
| Variable_name            | Value |
+--------------------------+-------+
| ob_plan_cache_percentage | 10    |
+--------------------------+-------+
```

For more information, see [Modify system variables of a tenant](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001166969).

#### Capacity issues during execution

If you confirm that the performance bottleneck is not caused by the execution plan, it is likely caused by capacity issues.

If the performance bottleneck is caused by suboptimal plans, you can find a large number of logical reads and time-consuming SQL queries in the `GV$OB_SQL_AUDIT` view, and the execution duration is prolonged mainly due to the increase of CPU time.

You can query the `GV$OB_SQL_AUDIT` view. If the value of the `QUEUE_TIME` field increases significantly, and no SQL query involves a large number of logical reads or results in a large value for the `EXECUTE_TIME` field, the performance bottleneck is caused by capacity issues.

These issues may occur in the following scenarios:

- Increase of application traffic If the execution plans of top SQL statements are not changed, but the CPU utilization of the tenant and the number of SQL executions increase, the performance issue is likely caused by the increase of application traffic.

- Changes of application workload Changes of application workload, such as the increase in the number of large queries, also cause performance issues.

- Contention of computing resources at the infrastructure layer

You can use the following methods to solve capacity issues:

- Throttle specific SQL statements. For more information about the throttling methods, see [Apply throttling to an OceanBase cluster](https://en.oceanbase.com/docs/common-ocp-10000000001188039).

- Increase the maximum number of CPU cores for a tenant.

- Adjust cluster parameters. The cluster parameter `cpu_quota_concurrency` specifies the number of worker threads provided by the CPU cores of a tenant. The minimum number of worker threads for a tenant is calculated by using the following formula: `cpu_quota_concurrency` × `MIN_CPU`. When a capacity issue occurs in a tenant, if the CPU workload of the physical server is not high, it indicates that most worker threads do not use CPU resources. You can set the `cpu_quota_concurrency` parameter to a proper larger value, so that more computing resources of the physical server are available for the worker threads. Note that an excessively large value leads to frequent context switching and frequent creation and termination of threads, which result in system issues. For more information about the `cpu_quota_concurrency` parameter, see [cpu_quota_concurrency](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001168673).
  
  1. Query the value of the `cpu_quota_concurrency` parameter.

     ```sql
     show parameters like 'cpu_quota_concurrency';
     ```

     The output is as follows:

     ```shell
     +-------+----------+--------------+----------+-----------------------+-----------+-------+--------------------------------------------------------+---------+--------+---------+-------------------+
     | zone  | svr_type | svr_ip       | svr_port | name                  | data_type | value | info                                                   | section | scope  | source  | edit_level        |
     +-------+----------+--------------+----------+-----------------------+-----------+-------+--------------------------------------------------------+---------+--------+---------+-------------------+
     | zone1 | observer | 1.2.3.4      |    12345 | cpu_quota_concurrency | NULL      | 2     | max allowed concurrency for 1 CPU quota. Range: [1,20] | TENANT  | TENANT | DEFAULT | DYNAMIC_EFFECTIVE |
     +-------+----------+--------------+----------+-----------------------+-----------+-------+--------------------------------------------------------+---------+--------+---------+-------------------+
     1 row in set
     ```

  2. Modify the parameter.

     We recommend that you set the parameter to `4`, or `2` in an advanced RISC machine (ARM) system. If you decrease the value of the parameter, performance and even stability may be affected. If you increase the value of the parameter, memory usage and CPU utilization may increase. Proceed with caution.

     ```sql
     ALTER SYSTEM SET cpu_quota_concurrency = '4';
     ```

  3. Query the value of the parameter again.

     ```sql
     show parameters like 'cpu_quota_concurrency';
     ```

     The output is as follows:

     ```shell
     +-------+----------+--------------+----------+-----------------------+-----------+-------+--------------------------------------------------------+---------+--------+---------+-------------------+
     | zone  | svr_type | svr_ip       | svr_port | name                  | data_type | value | info                                                   | section | scope  | source  | edit_level        |
     +-------+----------+--------------+----------+-----------------------+-----------+-------+--------------------------------------------------------+---------+--------+---------+-------------------+
     | zone1 | observer | 1.2.3.4      |    12345 | cpu_quota_concurrency | NULL      | 4     | max allowed concurrency for 1 CPU quota. Range: [1,20] | TENANT  | TENANT | DEFAULT | DYNAMIC_EFFECTIVE |
     +-------+----------+--------------+----------+-----------------------+-----------+-------+--------------------------------------------------------+---------+--------+---------+-------------------+
     1 row in set
     ```

> **Note**
>
> We recommend that you solve a capacity issue by increasing the maximum number of CPU cores for the tenant or the value of `cpu_quota_concurrency`. More worker threads require more memory resources. Therefore, you may also need to increase the maximum memory size for the tenant.

### Wait issues

If you confirm that the performance bottleneck is not caused by execution plans or resource capacity issues during the execution, it is likely caused by internal wait events.

In an internal wait event, the worker threads wait for the required resources, such as locks, latches, I/O, and memory.

You can query the `GV$OB_SQL_AUDIT` view. If you can find SQL queries that result in a large value of the `EXECUTE_TIME` field, and the execution duration is prolonged mainly due to the increase of the value of `TOTAL_WAIT_TIME_MICRO`, the performance bottleneck is caused by internal wait events. The value of `TOTAL_WAIT_TIME_MICRO` is the sum of the values of `APPLICATION_WAIT_TIME`, `CONCURRENCY_WAIT_TIME`, `USER_IO_WAIT_TIME`, and `SCHEDULE_TIME`. You can further determine the types of resources that the worker threads are waiting for.

The `GV$OB_SQL_AUDIT` view displays the following information about wait events:

- The wait time of four classes of wait events: `APPLICATION_WAIT_TIME`, `CONCURRENCY_WAIT_TIME`, `USER_IO_WAIT_TIME`, and `SCHEDULE_TIME`. Each class involves many specific wait events.

- The name of the most time-consuming wait event, which is indicated by `EVENT`, and the time consumed, which is indicated by `WAIT_TIME_MICRO`.

- The number of occurrences of all wait events, which is indicated by `TOTAL_WAITS`, and the total time consumed, which is indicated by `TOTAL_WAIT_TIME_MICRO`.

If a large amount of time is consumed by wait events, you can check `EVENT` for the specific types of most time-consuming wait events. For example, the following SQL statement with a specified `trace_id` spent most time in waiting for an I/O operation to read data from the index.

```sql
select sql_id, elapsed_time, queue_time, get_plan_time, execute_time,
       application_wait_time, concurrency_wait_time, user_io_wait_time,
       schedule_time, event, wait_class, wait_time_micro, total_wait_time_micro 
from oceanbase.gv$ob_sql_audit 
where trace_id = 'YB420B84FE35-0005648A67211DC9'\G
```

The output is as follows:

```shell
*************************** 1. row ***************************
               sql_id: 5316DBF96556040831142D61BBD9014F
         elapsed_time: 953
           queue_time: 18
        get_plan_time: 58
         execute_time: 867
application_wait_time: 0
concurrency_wait_time: 0
    user_io_wait_time: 550
        schedule_time: 0
                event: db file data index read
           wait_class: USER_IO
      wait_time_micro: 352
total_wait_time_micro: 550
```

Then you can use the SQL audit feature to identify the SQL statements that cause a large number of disk I/O operations and result in I/O wait events in other worker threads of the tenant. For more information, see [Cases](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001166527).

## Afterword

Sections 7.4 to 7.7 of Chapter 7 describe only commonly used analysis tools. You are not likely to become an expert in SQL performance analysis simply by reading them. You must also gradually accumulate experience in extensive practices.

Hopefully, this chapter can give you some inspiration in diagnosing SQL performance issues. If the methods described in this chapter cannot solve your problems, you can post your questions to the [Q&A](https://ask.oceanbase.com/) forum in the OceanBase community. OceanBase Technical Support will help you out.