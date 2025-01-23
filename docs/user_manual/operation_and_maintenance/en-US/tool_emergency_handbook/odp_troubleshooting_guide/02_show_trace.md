---
title: Check Whether ODP Causes a Performance Bottleneck
weight: 2
---

> When the SQL performance is not as expected, you first need to execute the `SHOW TRACE` statement to query the time spent in each phase and identify the phase that takes the longest time.
> 
> **<font color="red">This topic describes how to use the `SHOW TRACE` statement to check whether poor SQL performance occurs because OceanBase Database Proxy (ODP) causes a performance bottleneck. If you are skilled in analyzing SQL performance issues by using the `SHOW TRACE` statement, skip this topic. </font>**

## End-to-end Tracing

Data is processed through the following link: application server &lt;-&gt; ODP &lt;-&gt; OBServer node. Specifically, an application server connects to and sends requests to ODP by calling database drivers. Then, ODP forwards the requests to the most appropriate OBServer nodes of OceanBase Database, which stores user data in multiple partitions and replicas across OBServer nodes in its distributed architecture. OBServer nodes execute the requests and return the execution results to the user. OBServer nodes also support request forwarding. If a request cannot be executed on the current OBServer node, it is forwarded to the appropriate OBServer node.

In the case of an end-to-end performance issue, such as long response time (RT) detected on the application server, you need to first find the component that has caused the issue on the database access link, and then troubleshoot the component.

![End-to-end tracing](/img/user_manual/operation_and_maintenance/en-US/tool_emergency_handbook/odp_troubleshooting_guide/02_show_trace/001.png)

Two paths are involved in end-to-end tracing:

- An application sends a request to ODP through a client, such as Java Database Connectivity (JDBC) or Oracle Call Interface (OCI), ODP forwards the request to an OBServer node, and then the OBServer node returns the result to the application.

- An application directly sends a request to an OBServer node through a client, and then the OBServer node returns the result to the application.

### Examples

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

   > Other important operations in the query result are described as follows:
   >
   > - **ob_proxy**: the operation that spans from when ODP receives an SQL request to when it returns a complete response to the client.
   >
   > - **ob_proxy_server_process_req**: the operation that spans from when an SQL request is sent to when a response is first received from the OBServer node. The time taken by this operation equals the value of the processing time on the OBServer node plus the time consumed to transmit the request over the network.
   >
   > - **com_query_process**: the operation that spans from when the OBServer node receives an SQL request to when it forwards a response.

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

   - The time taken by ODP to search for routing information and forward the SQL statement was shortened from 181.839 ms to 4.691 ms. This is because ODP directly obtained the location information from the location cache.

   - The time taken by the `com_query_process` operation on the OBServer node to which the SQL statement was forwarded was shortened from 8.824 ms to 1.237 ms. The execution of the preceding SQL statement was divided into two phases. In the compilation phase, the optimizer generated an execution plan. In the execution phase, the execution engine calculated results based on the execution plan. During the second execution, the time spent in the compilation phase was shortened. This is because an execution plan (`pc_get_plan`) has been generated and stored in the plan cache during the first execution and no plan needed to be generated again during the second execution. This way, the overhead of the `hard_parse` operation to parse the SQL statement and generate a plan was eliminated.

6. Directly connect to the OBServer node to log in to OceanBase Database, execute the `SELECT c1 FROM t1 LIMIT 2;` statement again, and then execute the `SHOW TRACE` statement.

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

**<font color="red">After the analysis, run the following command to disable session-level end-to-end tracing to avoid compromising the performance of subsequent SQL statements. </font>**
```
set ob_enable_show_trace='off';
```

### Summary
For an SQL statement whose performance is not as expected, you can execute the `SHOW TRACE` statement to check whether most of the time is spent in the ODP forwarding phase, plan generation phase, or execution phase. You can see details about the time spent in each phase and further analyze the slow operations.

If ODP forwarding is slow, check whether the network between ODP and the OBServer node fails or whether ODP has not cached location information.

If the execution is slow, check whether the index used in the execution plan is inappropriate and perform SQL tuning as needed. For more information, see the [SQL performance diagnostics and tuning](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/performance_tuning) topic of this tutorial.