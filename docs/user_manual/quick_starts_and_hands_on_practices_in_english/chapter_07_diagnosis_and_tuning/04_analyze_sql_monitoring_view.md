---
title: Perform analysis based on SQL monitoring views
weight: 5
---

# 7.4 Perform analysis based on SQL monitoring views

## Overview of system views

OceanBase Database V4.x provides a variety of views. You can obtain the basic information and real-time status of various database objects in an OceanBase cluster by using these views. These views can be classified into two categories: data dictionary views and dynamic performance views.

- A data dictionary view displays the basic information about database objects that are managed by the `sys` tenant. Typically, the names of data dictionary views begin with `DBA_` or `CDB_`. Views whose names begin with `DBA_` display information about each tenant. For example, the `DBA_OB_LS` view of a tenant displays the log stream information of the tenant, and the `DBA_OB_LS` view of the `sys` tenant displays only the log stream information of the `sys` tenant. Views whose names begin with `CDB_` are used for the `sys` tenant. You can query these views for the status of all tenants in the cluster from the `sys` tenant. For example, the `CDB_OB_LS` view displays information about all log streams of all tenants in the cluster. In general, each view whose name begins with `DBA_` has a corresponding view whose name begins with `CDB_` in the `sys` tenant.

- A dynamic performance view displays information about the dynamic status changes of the system. Typically, the names of dynamic performance views begin with `GV$` or `V$`. Views whose names begin with `V$` display only information about the node to which you have logged on. Views whose names begin with `GV$` display information about all nodes. Dynamic performance views of a user tenant display information about the tenant. For example, you can query the `GV$OB_UNITS` view of a user tenant for the resource unit allocation information of the tenant. Dynamic performance views of the `sys` tenant display information about all tenants in the cluster.

These views show you the internal architecture of OceanBase Database and details about the system operation status. Views allow you to learn about the system components of OceanBase Database, check their status in real time, and understand the relationships between them. Internal views are one of the best tools that help you get familiar with OceanBase Database. Corresponding data dictionary views are shown in the following figure.

![Views](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/04_analyze_sql_monitoring_view/001.jpeg)

The data sources of metrics are internal dynamic performance views of OceanBase Database. All metrics can be queried by using SQL statements. Dynamic performance views are classified into `GV$` views and `V$` views. An external monitoring system, such as OceanBase Cloud Platform (OCP), deploys its agent process on each database server and regularly pulls local monitoring information (`V$` views) by using SQL APIs. Some global information, such as RootService-related information, is collected from the central node. All monitoring data is reported to the monitoring system database and aggregated by cluster, tenant, node, and resource unit, to display the metrics on the monitoring dashboard.

> **Note**
>
> - Although the data sources of metrics are views of OceanBase Database, we recommend that you use a visual external monitoring system during daily O&M, which makes it easier to analyze the trends of metrics and improves efficiency.
>
> - `GV$` views and `V$` views are homogenous. Therefore, they are not separately described in this topic. You can query an appropriate view based on the scenario.

The following table describes the frequently used dynamic performance views of OceanBase Database.

| View | Description |
| ------------------------------ | ---------------------- |
| GV$SYSSTAT | Displays the system statistics.         |
| GV$SYSTEM_EVENT | Displays the statistics of tenant-level wait events.   |
| GV$SESSION_EVENT | Displays the statistics of session-level wait events.   |
| GV$LATCH | Displays the latch statistics.           |
| GV$OB_MEMORY | Displays the memory information.             |
| GV$OB_PROCESSLIST | Displays the session information.             |
| GV$OB_TRANSACTION_PARTICIPANTS | Displays the information about participants of active transactions. |
| GV$OB_SQL_AUDIT | Displays the SQL statistics.         |
| GV$SQL_PLAN_MONITOR | Displays the statistics of SQL operators.   |
| GV$OB_PLAN_CACHE_STAT | Displays the plan cache statistics.  |
| GV$OB_PLAN_CACHE_PLAN_STAT | Displays the statistics of execution plans.     |
| GV$OB_PLAN_CACHE_PLAN_EXPLAIN | Displays the details of execution plans.     |
| GV$OB_SERVERS | Displays the information about OBServer nodes.           |
| GV$OB_UNITS | Displays the information about resource units.          |
| GV$OB_PARAMETERS | Displays the information about parameters.           |
| GV$OB_KVCACHE | Displays the information about KVCache.         |
| GV$OB_SSTABLES | Displays the information about SSTables.         |
| GV$OB_MEMSTORE | Displays the information about MemStores.        |
| GV$OB_LOG_STAT | Displays the information about log streams.         |

Metrics can be classified by different attributes.

- Metrics are classified into system and SQL metrics based on the metric type. System metrics describe the system operating status for you to determine the health condition of clusters, tenants, and sessions. System metrics can be further classified into metrics, wait events, and latch events. SQL metrics describe SQL-related monitoring information and record resource consumption and wait events during the SQL execution so that you can diagnose the issue of a specific SQL statement.

- Metrics are classified into tenant-level and session-level metrics based on the monitoring granularity. Tenant-level metrics are indexed by tenant ID and node IP address. The external monitoring system regularly collects monitoring data gathered by tenant on each server, and aggregate and display the data by different dimensions, such as cluster, tenant, node, and resource unit, as needed in various scenarios. Tenant-level monitoring provides the data sources of the monitoring dashboard. Session-level metrics are indexed by session ID and trace ID. This allows you to perform end-to-end diagnostics on specific sessions. Session-level monitoring plays an important role in end-to-end tracing.

- Metrics can also be classified based on the monitored objects. For example, the metrics can be classified into categories such as transaction, KVCache, clog, storage, resource, SSTable, and MemStore metrics. Based on all the metrics of OceanBase Database, you can progressively find the root causes during fault diagnosis, track the health status of each component in real time to identify potential risks at the earliest opportunity, and prevent the database performance specified in the service level agreement (SLA) from being affected.

This topic describes SQL monitoring. It allows you to diagnose system performance issues based on the monitoring information collected during multiple or specific executions of specific SQL statements. For information about system monitoring, see [System monitoring](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001169156).

## Overview of SQL monitoring

SQL monitoring information includes the resource consumption during SQL execution, which is obtained by collecting the statistics of metrics and wait events before and after an SQL statement is executed and calculating the difference. In addition, SQL monitoring provides information such as the SQL text, SQL plan, and execution feedback, which is quite helpful in diagnosing an SQL statement.

OceanBase Database provides many views for SQL diagnostics. The following table describes important ones.

| View | Description |
| ------------------------------ | ---------------------- |
| GV$OB_SQL_AUDIT | Displays the SQL statistics.         |
| GV$OB_PLAN_CACHE_PLAN_STAT | Displays the statistics of execution plans.     |
| GV$OB_PLAN_CACHE_PLAN_EXPLAIN | Displays the details of execution plans.     |
| DBA_OB_OUTLINES | Displays the general outlines.    |
| DBA_OB_CONCURRENT_LIMIT_SQL | Displays the throttling outlines.    |
| GV$OB_PLAN_CACHE_STAT | Displays the plan cache statistics.  |
| GV$SQL_PLAN_MONITOR | Displays the statistics of SQL operators.   |
| GV$SESSION_EVENT | Displays the statistics of session-level wait events.       |
| GV$OB_TRANSACTION_PARTICIPANTS | Displays the information about participants of active transactions. |

## View related to SQL audit

The` GV$OB_SQL_AUDIT` view is the most frequently used SQL monitoring view. It records the source, execution status, resource consumption, and wait events of each SQL request regardless of whether the SQL request is successful or fails. It also records key information such as the SQL text and execution plans. Therefore, it is a great tool for SQL diagnostics.

The data of the `GV$OB_SQL_AUDIT` view is stored in a configurable memory space. On each node, a separate cache is allocated for each tenant. When the memory usage or the number of records reaches the specified threshold, automatic eviction is triggered. The oldest data is evicted first. This is similar to a first-in-first-out (FIFO) queue in the memory. An experienced database administrator (DBA) often starts troubleshooting SQL response time (RT) jitters by disabling the SQL audit feature to retain the monitoring records. This prevents the monitoring data from being evicted.

### SQL audit settings

You can use the following parameters to control the behavior of the SQL audit feature:

- `enable_sql_audit`: specifies whether to enable the SQL audit feature for all tenants. This cluster parameter takes effect immediately after it is modified. The default value is `True`. For more information, see [enable_sql_audit](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105603).

  - Query the value of `enable_sql_audit`.
  
    ```sql
    show parameters like 'enable_sql_audit'\G
    ```

    The output is as follows:

    ```shell
    *************************** 1. row ***************************
             zone: zone1
         svr_type: observer
           svr_ip: 1.2.3.4
         svr_port: 12345
             name: enable_sql_audit
        data_type: NULL
            value: True
             info: specifies whether SQL audit is turned on. The default value is TRUE. Value: TRUE: turned on FALSE: turned off
          section: OBSERVER
            scope: CLUSTER
           source: DEFAULT
       edit_level: DYNAMIC_EFFECTIVE
    default_value: true
        isdefault: 1
    1 row in set
    ```
  
  - Change the value of `enable_sql_audit`.
  
    > **Note**
    >
    > You can modify the `enable_sql_audit` parameter only in the `sys` tenant. The modification takes effect on the entire cluster.
  
    ```sql
    -- Enable the SQL audit feature for the entire cluster.
    ALTER SYSTEM SET enable_sql_audit = true;
    
    -- Disable the SQL audit feature for the entire cluster.
    ALTER SYSTEM SET enable_sql_audit = false;
    ```

- `ob_enable_sql_audit`: specifies whether to enable the SQL audit feature for the current tenant. This tenant-level system variable takes effect immediately after it is modified. The default value is `ON`. For more information, see [ob_enable_sql_audit](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105303).
  
  - Query the value of `ob_enable_sql_audit`.
  
    ```sql
    show variables like 'ob_enable_sql_audit';
    ```

    The output is as follows:

    ```shell
    +---------------------+-------+
    | Variable_name       | Value |
    +---------------------+-------+
    | ob_enable_sql_audit | ON    |
    +---------------------+-------+
    1 row in set
    ```
  
  - Change the value of `ob_enable_sql_audit`.
  
    ```sql
    -- Disable the SQL audit feature for the current tenant. The modification takes effect only on connections created after the statement execution succeeds.
    SET global ob_enable_sql_audit = OFF;
    
    -- Enable the SQL audit feature for the current tenant. The modification takes effect only on connections created after the statement execution succeeds.
    SET global ob_enable_sql_audit = ON;
    ```

- `ob_sql_audit_percentage`: specifies the percentage of tenant memory that can be used by the SQL audit feature for the current tenant. This tenant-level system variable takes effect immediately after it is modified. The default value is `3`, which indicates 3%. To prevent excessive memory usage, the maximum memory space for the SQL Audit feature is set to 1 GB. For more information, see [ob_sql_audit_percentage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105342).

  - Query the value of `ob_sql_audit_percentage`.

    ```sql
    show variables like 'ob_sql_audit_percentage';
    ```

    The output is as follows:

    ```shell
    +-------------------------+-------+
    | Variable_name           | Value |
    +-------------------------+-------+
    | ob_sql_audit_percentage | 3     |
    +-------------------------+-------+
    1 row in set
    ```

  - Modify the `ob_sql_audit_percentage` parameter for the current tenant. The modification takes effect only on connections created after the statement execution succeeds.

    ```sql
    SET global ob_sql_audit_percentage = 5;
    ```

### Eviction mechanism of SQL audit

OceanBase Database runs a background task for each tenant to check the memory usage of the OBServer node and SQL audit every second and determines whether to trigger SQL eviction. The maximum memory size available for SQL audit is specified by `ob_sql_audit_percentage`. When the memory usage of SQL audit reaches the specified threshold, eviction is triggered. When the memory usage of SQL audit falls below the specified threshold, eviction stops.

The following table describes the eviction mechanism of SQL audit.

| Trigger condition | Maximum memory size for SQL audit | Eviction triggering threshold | Eviction stopping threshold |
| -------- | ------------------ | ---------------- | ---------------- |
| Memory usage | [0 MB, 64 MB) | Maximum memory size × 50% | 0 MB |
| Memory usage | [64 MB, 100 MB) | Maximum memory size - 20 MB | Maximum memory size - 40 MB |
| Memory usage | [100 MB, 5 GB) | Maximum memory size × 80% | Maximum memory size × 60% |
| Memory usage | [5 GB, +∞) | Maximum memory size - 1 GB | Maximum memory size - 2 GB |
| Records | N/A | 9 million | 8 million |

The SQL audit feature also supports tenant-level manual eviction. You can execute the following statement to enable manual eviction for a tenant.

```sql
alter system flush sql audit tenant = <tenant_name>;
```

### Fields in GV$OB_SQL_AUDIT

The `GV$OB_SQL_AUDIT` view provides information in many fields. This section describes only a part of them. For more information, see the **Fields in GV$OB_SQL_AUDIT** section in [GV$OB_SQL_AUDIT](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001169795).

- `TENANT_ID`: the ID of the tenant that sent the request.

- `SVR_IP`: the IP address of the server that received the request.

- `CLIENT_IP`: the IP address of the client that sent the request.

- `REQUEST_TIME`: the time when the database received the request.

- `REQUEST_ID`: the ID of the request, which identifies one execution of the request and increases over time. External monitoring systems use this field as a cursor to pull the audit information.

- `IS_INNER_SQL`: indicates whether the request is an internal SQL request.

- `IS_EXECUTOR_RPC`: indicates whether the current request is an RPC request.

- `SQL_ID`: the identifier of a specific SQL statement. Unlike the `REQUEST_ID` field, the value of the `SQL_ID` field of an SQL statement remains unchanged regardless of multiple executions.

- `QUERY_SQL`: the full-text content of the SQL statement. OceanBase Database allows you to bind an execution plan by using the `SQL_ID` or `SQL_TEXT` field.

- `SID`: the identifier of a session. It is associated with all SQL statements and wait events of the session. This field corresponds to the `ID` field in the `GV$OB_PROCESSLIST` view.

- `TX_ID`: the identifier of a transaction. It is associated with all SQL statements of the transaction. A large gap between the end time of a statement and the start time of the next statement in a transaction indicates that the execution link consumes a large amount of time.

- `TRACE_ID`: the trace ID of the SQL request. You can associate the trace ID with other metrics or logs in a query.

- `IS_HIT_PLAN`: indicates whether the plan cache is hit. SQL tuning is time-consuming. To avoid repeated SQL tuning, generated plans are stored in the plan cache and retrieved from the plan cache when the related SQL statement is executed again. If the plan cache is not hit, a hard parsing of the SQL statement is performed. Otherwise, soft parsing is performed. Hard parsing affects the SQL performance and increases time consumption. If the hit rate of the plan cache of a tenant is too low, check whether the plan cache space is too small. A small plan cache causes frequent eviction of plans.

- `PLAN_ID`: the ID of the execution plan. You can query the details and statistics of the execution plan by using this field.

- `PLAN_HASH`: the hash value of the execution plan.

- `PLAN_TYPE`: the type of the execution plan. Valid values: `0`, `1`, `2`, and `3`. Values `1`, `2`, and `3` respectively correspond to local plans, remote plans, and distributed plans. The value `0` indicates that no execution plan is available. For example, a `COMMIT` statement does not have an execution plan.

- `AFFECTED_ROWS`: the number of rows affected.

- `RETURN_ROWS`: the number of rows returned.

- `RET_CODE`: the return code of the execution.

- `EVENT`: the name of the wait event with the longest wait time.

- `P1TEXT` to `P3TEXT`: the names of the three parameters of the wait event.

- `P1` to `P3`: the values of the three parameters of the wait event.

- `LEVEL`: the level of the wait event.

- `WAIT_CLASS_ID`: the ID of the class to which the wait event belongs.

- `WAIT_CLASS`: the name of the class to which the wait event belongs.

- `STATE`: the status of the wait event.

- `WAIT_TIME_MICRO`: the wait time of the wait event, in microseconds.

- `TOTAL_WAIT_TIME_MICRO`: the total wait time in the execution process, in microseconds.

- `TOTAL_WAITS`: the total number of waits during the execution.

- `ELAPSED_TIME`: the total time of this execution, from the time when the request was received to the end of the execution, which consists of multiple sub-stages.

- `NET_TIME`: the amount of time elapsed from when the RPC was sent to when the request was received.

- `NET_WAIT_TIME`: the amount of time elapsed from when the request was received to when it entered the queue.

- `QUEUE_TIME`: the time that the request waited in the queue, which reflects the request accumulation in the current tenant.

- `DECODE_TIME`: the time spent decoding the request after it left the queue.

- `GET_PLAN_TIME`: the time when the execution plan was generated, which reflects the health of the plan cache of the current tenant.

- `EXECUTE_TIME`: the execution time of the plan, which is the sum of the CPU time and the value of the `TOTAL_WAIT_TIME_MICRO` field. The value of the `TOTAL_WAIT_TIME_MICRO` field is the sum of the values of the following fields: `APPLICATION_WAIT_TIME`, `CONCURRENCY_WAIT_TIME`, `USER_IO_WAIT_TIME`, and `SCHEDULE_TIME`. The difference between the values of the `EXECUTE_TIME` and `TOTAL_WAIT_TIME_MICRO` fields is the value of the `CPU_TIME` field.

- `APPLICATION_WAIT_TIME`: the total amount of time spent waiting for events of the `application` class.

- `CONCURRENCY_WAIT_TIME`: the total amount of time spent waiting for events of the `concurrency` class.

- `USER_IO_WAIT_TIME`: the total amount of time spent waiting for events of the `user_io` class.

- `SCHEDULE_TIME`: the total amount of time spent on events of the `schedule` class, in microseconds.

- Logical reads: During the execution of a request, the database first reads data from caches at all levels. The corresponding fields include `ROW_CACHE_HIT`, `BLOOM_FILTER_CACHE_HIT`, and `BLOCK_CACHE_HIT`. If no cache is hit, a disk read is performed. The field corresponding to a disk read is `DISK_READS`. You can determine whether to optimize an SQL request based on the number of rows scanned during the execution of the request. The number of rows scanned is calculated based on the number of cache and disk reads. Note that the number of rows scanned does not equal the number of physical reads, because the database first scans caches at all levels.

- `ROW_CACHE_HIT`: the number of row cache hits.

- `BLOOM_FILTER_CACHE_HIT`: the number of Bloom filter cache hits.

- `BLOCK_CACHE_HIT`: the number of block cache hits.

- `BLOCK_INDEX_CACHE_HIT`: the number of block index cache hits.

- `DISK_READS`: the number of physical reads.

- `RETRY_CNT`: the number of retries.

- `TABLE_SCAN`: indicates whether the request contains a full table scan.

- `CONSISTENCY_LEVEL`: the consistency level. Valid values:

  - `-1`: indicates that the consistency level is invalid.

  - `1`: indicates to read data stored in SSTables.

  - `2`: indicates weak-consistency read.

  - `3`: indicates strong-consistency read.

- `MEMSTORE_READ_ROW_COUNT`: the number of rows read from the MemStore.

- `SSSTORE_READ_ROW_COUNT`: the number of rows read from the SSStore.

- `REQUEST_MEMORY_USED`: the memory consumed by the request.


### Examples

You can query the `GV$OB_SQL_AUDIT` view for execution information of SQL statements in various dimensions. Here are some examples:

- Query slow SQL statistics.
  
  You can query the SQL statements whose execution time exceeds the specified threshold during a period of time, and subsequently optimize specific SQL statements based on the query result. The following example queries the first five SQL statements that were executed later than `2024-02-20 12:00:00` with the execution time exceeding 100 ms under the tenant whose ID is `1002`:

  ```sql
  select
    tenant_id,
    request_id,
    usec_to_time(request_time),
    elapsed_time,
    queue_time,
    execute_time,
    query_sql
  from
    oceanbase.GV$OB_SQL_AUDIT
  where
    tenant_id = 1002
    and elapsed_time > 100000
    and request_time > time_to_usec('2024-02-20 12:00:00')
  order by
    elapsed_time desc
  limit
    5;
  ```
  
  The output is as follows:
  
  ```shell
  +-----------+------------+----------------------------+--------------+------------+--------------+-------------------------------+
  | tenant_id | request_id | usec_to_time(request_time) | elapsed_time | queue_time | execute_time | query_sql                     |
  +-----------+------------+----------------------------+--------------+------------+--------------+-------------------------------+
  |      1002 |   21371247 | 2024-02-20 16:14:10.008111 |       153118 |         34 |       139873 | select * from xxxx where xxxx |
  +-----------+------------+----------------------------+--------------+------------+--------------+-------------------------------+
  1 row in set
  ```

- Query SQL statements within a transaction.
  
  Each SQL statement entry in `GV$OB_SQL_AUDIT` records the unique identifier of the current transaction in the `tx_id` field. You can find all SQL statements in the current transaction based on this field. Then, you can determine whether the transaction model in business stress testing meets your expectation. The following example queries the SQL statements executed in the transaction whose `tx_id` is `27592485` under the `sys` tenant whose ID is `1`.

  ```sql
  select
    tenant_id,
    tx_id,
    query_sql
  from
    oceanbase.GV$OB_SQL_AUDIT
  where
    tenant_id = 1
    and tx_id = '27592485'
  order by
    request_time asc;
  ```
  
  The output is as follows:
  
  ```shell
  +-----------+----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  | tenant_id | tx_id    | query_sql                                                                                                                                                                        |
  +-----------+----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  |         1 | 27592485 | START TRANSACTION                                                                                                                                                                |
  |         1 | 27592485 | SELECT column_value FROM __all_core_table WHERE TABLE_NAME = '__all_global_stat' AND COLUMN_NAME = 'snapshot_gc_scn' FOR UPDATE                                                  |
  |         1 | 27592485 | UPDATE __all_core_table SET column_value = 1708416843896658521 WHERE table_name = '__all_global_stat' AND column_name = 'snapshot_gc_scn' AND column_value < 1708416843896658521 |
  |         1 | 27592485 | COMMIT                                                                                                                                                                           |
  +-----------+----------+----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  4 rows in set
  ```

- Query SQL statements executed in the same session.
  
  You can query all business requests in a specific session by SID to analyze the business model. The following example queries the SQL statements executed later than `2024-02-20 12:00:00` in the session whose `sid` is `3221652146` under the tenant whose ID is `1002`.

  ```sql
  select
    tenant_id,
    sid,
    query_sql
  from
    oceanbase.GV$OB_SQL_AUDIT
  where
    tenant_id = 1002
    and sid = 3221652146
    and request_time > time_to_usec('2024-02-20 12:00:00')
  order by
    request_time asc;
  ```
  
  The output is as follows:

  ```shell
  +-----------+------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
  | tenant_id | sid        | query_sql                                                                                                                                                   |
  +-----------+------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
  |      1002 | 3221652146 | set _show_ddl_in_compat_mode = 1;                                                                                                                           |
  |      1002 | 3221652146 | set autocommit=1                                                                                                                                            |
  |      1002 | 3221652146 | set names utf8                                                                                                                                              |
  |      1002 | 3221652146 | SELECT @@max_allowed_packet,@@system_time_zone,@@time_zone,@@auto_increment_increment,@@tx_isolation AS tx_isolation,@@session.tx_read_only AS tx_read_only |
  |      1002 | 3221652146 | select @@version_comment, @@version, ob_version() limit 1                                                                                                   |
  |      1002 | 3221652146 | show variables like 'version_comment'                                                                                                                       |
  |      1002 | 3221652146 | SHOW DATABASES                                                                                                                                              |
  +-----------+------------+-------------------------------------------------------------------------------------------------------------------------------------------------------------+
  7 rows in set
  ```

- Query the average queuing time of the last 1,000 SQL statements.

  ```sql
  SELECT
    --+ query_timeout(30000000)
    avg(queue_time)
  FROM
    oceanbase.GV$OB_SQL_AUDIT
  WHERE
    request_id > (
      SELECT
        max(request_id)
      FROM
        v$OB_SQL_AUDIT
    ) - 1000;
  ```
  
  The output is as follows:
  
  ```shell
  +-----------------+
  | avg(queue_time) |
  +-----------------+
  |          0.2960 |
  +-----------------+
  1 row in set
  ```

- Query SQL statements that occupy the most resources of a tenant.
  
  If CPU resources of the tenant are fully used, you can use the following statement to check whether the issue is caused by SQL statements and if yes, query the suspicious SQL statements. The SQL statements in the return result are sorted in descending order by the amount of resources occupied, which is calculated by using the following formula: Execution time × Number of executions.

  ```sql
  select
    SQL_ID,
    avg(ELAPSED_TIME),
    avg(QUEUE_TIME),
    avg(ROW_CACHE_HIT + BLOOM_FILTER_CACHE_HIT + BLOCK_CACHE_HIT + DISK_READS) avg_logical_read,
    avg(execute_time) avg_exec_time,
    count(*) cnt,
    avg(execute_time - TOTAL_WAIT_TIME_MICRO) avg_cpu_time,
    avg(TOTAL_WAIT_TIME_MICRO) avg_wait_time,
    WAIT_CLASS,
    avg(retry_cnt),
    QUERY_SQL
  from
    oceanbase.GV$OB_SQL_AUDIT
  group by
    SQL_ID
  order by
    avg_exec_time * cnt desc
  limit
    10;
  ```
  
  The output is as follows:

  ```shell
  +----------------------------------+-------------------+-----------------+------------------+---------------+------+--------------+---------------+------------+----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  | SQL_ID                           | avg(ELAPSED_TIME) | avg(QUEUE_TIME) | avg_logical_read | avg_exec_time | cnt  | avg_cpu_time | avg_wait_time | WAIT_CLASS | avg(retry_cnt) | QUERY_SQL                                                                                                                                                                                                                                                                                                                                                                                                                               |
  +----------------------------------+-------------------+-----------------+------------------+---------------+------+--------------+---------------+------------+----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  | 1532BA78C664771E7113567D8E951B51 |         4330.2720 |          0.0000 |           0.0000 |     4138.0498 |  261 |    4138.0498 |        0.0000 | OTHER      |         0.0000 | SELECT FIELD FROM `oceanbase`. `__tenant_virtual_table_column` WHERE TABLE_ID = 20001                                                                                                                                                                                                                                                                                                                                                    |
  | 1D0BA376E273B9D622641124D8C59264 |          323.2321 |          0.0000 |           0.0000 |      224.9437 |  711 |     224.9437 |        0.0000 | OTHER      |         0.0000 | COMMIT                                                                                                                                                                                                                                                                                                                                                                                                                                  |
  | 9050622DE000F09344C9A882DAF34A75 |          472.4209 |          0.0000 |           0.0000 |      265.2209 |  575 |     265.2209 |        0.0000 | OTHER      |         0.0000 | select * from __all_ls where 1=1 and status != 'DROPPED' and status != 'CREATE_ABORT' order by ls_id                                                                                                                                                                                                                                                                                                                                    |
  | 19A6B821DB3DE80D69EE8880D3A45C5F |       160857.0000 |         38.0000 |           0.0000 |   137214.0000 |    1 |  137214.0000 |        0.0000 | OTHER      |         0.0000 | select * from GV$OB_SQL_AUDIT where SQL_ID = '1D0BA376E273B9D622641124D8C59264'                                                                                                                                                                                                                                                                                                                                                         |
  | 37B3D4D55DC217FA1BCA9031DC3AF1DC |        34309.2500 |         37.2500 |           0.0000 |    28792.0000 |    4 |   28792.0000 |        0.0000 | OTHER      |         0.0000 | select   SQL_ID,   avg(ELAPSED_TIME),   avg(QUEUE_TIME),   avg(ROW_CACHE_HIT + BLOOM_FILTER_CACHE_HIT + BLOCK_CACHE_HIT + DISK_READS) avg_logical_read,   avg(execute_time) avg_exec_time,   count(*) cnt,   avg(execute_time - TOTAL_WAIT_TIME_MICRO) avg_cpu_time,   avg(TOTAL_WAIT_TIME_MICRO) avg_wait_time,   WAIT_CLASS,   avg(retry_cnt) from   GV$OB_SQL_AUDIT group by   SQL_ID order by   avg_exec_time * cnt desc limit   10 |
  | 735537F7B5DB7C4E0E946C9B26108560 |          615.7653 |          0.0000 |           0.0000 |      395.2419 |  277 |     395.2419 |        0.0000 | OTHER      |         0.0000 | SELECT * FROM __all_spatial_reference_systems WHERE (SRS_ID < 70000000 AND SRS_ID != 0) OR SRS_ID > 2000000000                                                                                                                                                                                                                                                                                                                          |
  | 2EAAA3C495632AB97F13659E429FC9CD |          464.6715 |          0.0000 |           0.0000 |      240.4224 |  277 |     240.4224 |        0.0000 | OTHER      |         0.0000 | select * from __all_balance_task where parent_list is null or parent_list = ''                                                                                                                                                                                                                                                                                                                                                          |
  | B7A6FA97FEC98C06F9586D23935AC4C6 |          276.7934 |          0.0000 |           0.0000 |      104.0799 |  576 |     104.0799 |        0.0000 | OTHER      |         0.0000 | START TRANSACTION                                                                                                                                                                                                                                                                                                                                                                                                                       |
  | 556CEFD22F28DDDCB6E283DF89BD9348 |         2263.9643 |          0.0000 |           0.0000 |     2103.5714 |   28 |    2103.5714 |        0.0000 | OTHER      |         0.0000 | UPDATE __all_core_table SET column_value = 1708415231707450537 WHERE table_name = '__all_global_stat' AND column_name = 'snapshot_gc_scn' AND column_value < 1708415231707450537                                                                                                                                                                                                                                                        |
  | 17605A1DA6B6A2150E9FBCA5D4C7653A |          797.5532 |          0.0000 |           0.0000 |      594.5532 |   94 |     594.5532 |        0.0000 | OTHER      |         0.0000 | SELECT row_id, column_name, column_value FROM __all_core_table WHERE table_name = '__all_global_stat' ORDER BY row_id, column_name                                                                                                                                                                                                                                                                                                      |
  +----------------------------------+-------------------+-----------------+------------------+---------------+------+--------------+---------------+------------+----------------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
  10 rows in set
  ```

  When an SQL response time (RT) jitter occurs in a tenant, the CPU resource of the tenant is fully used and the RT of all SQL statements soars. In this case, you must first determine whether the issue is caused by the SQL statements or other problems.
  
  The SQL statement described in the preceding example is quite useful in diagnostics. It aggregates executed SQL statements based on `SQL_ID` values and sorts the statements in descending order by the amount of resources occupied, which is the product of `avg_exec_time` multiplied by `cnt`. This way, you can check the top SQL statements for exceptions.

  For more information, see [Cases](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001166527).

## Views related to execution plans

To avoid repeatedly generating plans for the same SQL statement, generated plans are stored in the plan cache and retrieved from the plan cache when the system attempts to generate a plan for the same SQL statement again. On each node, a separate plan cache is allocated for each tenant to cache the SQL plans processed on this node.

Plan cache views display plan cache statistics, execution statistics, and plan information. The data displayed in these views is collected from plan caches. OceanBase Database provides the following plan cache views:

- `GV$OB_PLAN_CACHE_STAT`: displays the statistics about each plan cache. On each node, a separate plan cache is allocated for each tenant to cache the SQL plans processed on this node. In this view, each plan cache has a record.

- `GV$OB_PLAN_CACHE_PLAN_STAT`: displays the details of each cached plan and its execution statistics.

- `GV$OB_PLAN_CACHE_PLAN_EXPLAIN`: displays the information about operators in the cached plans. **Take note of the following considerations:**
  
  - To query the `GV$OB_PLAN_CACHE_PLAN_EXPLAIN` view, you must specify the `TENANT_ID`, `SVR_IP`, `SVR_PORT`, and `PLAN_ID` fields. Otherwise, no result is returned.
  
  - To query the `V$OB_PLAN_CACHE_PLAN_EXPLAIN` view, you must specify the `TENANT_ID` and `PLAN_ID` fields. Otherwise, no result is returned.

Fields in the `GV$OB_PLAN_CACHE_PLAN_STAT` view are described as follows:

- `TENANT_ID`: the ID of the tenant.

- `SVR_IP`: the IP address of the node.

- `PLAN_ID`: the ID of the execution plan, which corresponds to the `PLAN_ID` field in the `GV$OB_SQL_AUDIT` view.

- `SQL_ID`: the ID of the SQL statement, which corresponds to the `SQL_ID` field in the `GV$OB_SQL_AUDIT` view.

- `TYPE`: the type of the execution plan. `1` indicates a local plan. `2` indicates a remote plan. `3` indicates a distributed plan.

- `STATEMENT`: the parameterized SQL statement.

- `QUERY_SQL`: the original SQL statement executed when the plan was loaded for the first time.

- `FIRST_LOAD_TIME`: the time when the plan was loaded for the first time.

- `SCHEMA_VERSION`: the version of the schema.

- `LAST_ACTIVE_TIME`: the time of the last execution.

- `AVG_EXE_USEC`: the average execution duration.

- `SLOWEST_EXE_TIME`: the timestamp when the slowest execution ended.

- `SLOWEST_EXE_USEC`: the amount of time consumed by the slowest execution.

- `SLOW_COUNT`: the number of times that the current plan was identified as a slow query. The query execution time threshold is specified by the cluster parameter `trace_log_slow_query_watermark`.

- `HIT_COUNT`: the number of plan cache hits.

- `LARGE_QUERYS`: the number of times that the current plan was identified as a large query. The query execution time threshold is specified by the cluster parameter `large_query_threshold`.

- `DELAYED_LARGE_QUERYS`: the number of times that the current plan was identified as a large query and dropped to the large query queue.

- `TIMEOUT_COUNT`: the number of timeouts.

- `EXECUTIONS`: the number of times that the plan has been executed.

- `DISK_READS`: the number of physical reads.

- `DIRECT_WRITES`: the number of disk writes.

- `BUFFER_GETS`: the number of logical reads.

- `APPLICATION_WAIT_TIME`: the total amount of time spent waiting for events of the `application` class.

- `CONCURRENCY_WAIT_TIME`: the total amount of time spent waiting for events of the `concurrency` class.

- `USER_IO_WAIT_TIME`: the total amount of time spent waiting for the events of the `user_io` class.

- `ROWS_PROCESSED`: the total number of rows in the results selected for all executions or the number of rows modified by executing the `ALTER TABLE` statement.

- `ELAPSED_TIME`: the total time consumed by all executions, where the time consumed by each execution is defined as the time elapsed from when the execution request was received to when the execution was completed.

- `CPU_TIME`: the total amount of CPU time consumed by all executions.

- `OUTLINE_ID`: the ID of the outline. The value `-1` indicates that the plan is not generated based on a bound outline.

- `OUTLINE_DATA`: the information about the outline corresponding to the plan.

- `TABLE_SCAN`: indicates whether the query is a primary key scan.

The `GV$OB_PLAN_CACHE_PLAN_EXPLAIN` view displays the details of each execution plan in the following main fields:

- `TENANT_ID`: the ID of the tenant.

- `SVR_IP`: the IP address of the node.

- `PLAN_ID`: the ID of the execution plan.

- `PLAN_DEPTH`: the depth of the operator.

- `OPERATOR`: the name of the operator.

- `NAME`: the name of the table corresponding to the operator.

- `ROWS`: the estimated number of rows in the result.

- `COST`: the estimated cost.

- `PROPERTY`: the details of the operator.

When you repeatedly execute an SQL statement, the execution plan may change with database objects, statistics, and OceanBase Database versions. You can query the actual execution plan for an SQL statement from the `gv$ob_sql_audit` or `GV$OB_PLAN_CACHE_PLAN_EXPLAIN` view instead of directly executing the `EXPLAIN` statement.

Here is an example:

1. Execute an SQL statement.

   ```sql
   select * from oceanbase.DBA_OB_DATABASES;
   ```

   The output is as follows:

   ```shell
   +--------------------+---------------+--------------------+-----------+--------------------+
   | DATABASE_NAME      | IN_RECYCLEBIN | COLLATION          | READ_ONLY | COMMENT            |
   +--------------------+---------------+--------------------+-----------+--------------------+
   | obproxy            | NO            | utf8mb4_general_ci | NO        |                    |
   | test               | NO            | utf8mb4_general_ci | NO        | test schema        |
   | __public           | NO            | utf8mb4_general_ci | YES       | public schema      |
   | __recyclebin       | NO            | utf8mb4_general_ci | YES       | recyclebin schema  |
   | mysql              | NO            | utf8mb4_general_ci | NO        | MySql schema       |
   | information_schema | NO            | utf8mb4_general_ci | NO        | information_schema |
   | oceanbase          | NO            | utf8mb4_general_ci | NO        | system database    |
   +--------------------+---------------+--------------------+-----------+--------------------+
   8 rows in set
   ```

2. Query the trace ID of the SQL statement.

   ```sql
   select last_trace_id();
   ```

   The output is as follows:

   ```shell
   +------------------------------------+
   | last_trace_id()                    |
   +------------------------------------+
   | Y584A0B9E1F14-0006104BFEB3B549-0-0 |
   +------------------------------------+
   1 row in set
   ```

3. Query the `TENANT_ID`, `SVR_IP`, `SVR_PORT`, and `PLAN_ID` fields corresponding to the SQL statement based on the trace ID.

   ```sql
   select TENANT_ID,
     SVR_IP,
     SVR_PORT,
     PLAN_ID,
     QUERY_SQL
   from oceanbase.gv$ob_sql_audit
   where trace_id = 'Y584A0B9E1F14-0006104BFEB3B549-0-0';
   ```

   The output is as follows:

   ```shell
   +-----------+--------------+----------+---------+------------------------------------------+
   | TENANT_ID | SVR_IP       | SVR_PORT | PLAN_ID | QUERY_SQL                                |
   +-----------+--------------+----------+---------+------------------------------------------+
   |      1002 | 1.2.3.4      |    12345 |   67890 | select * from oceanbase.DBA_OB_DATABASES |
   +-----------+--------------+----------+---------+------------------------------------------+
   1 row in set
   ```

4. Query the actual execution plan for the SQL statement based on the return result.

   ```sql
   SELECT
     *
   FROM
     oceanbase.GV$OB_PLAN_CACHE_PLAN_EXPLAIN
   WHERE
     tenant_id = 1002
     AND SVR_IP = '1.2.3.4'
     AND SVR_PORT = 12345
     AND PLAN_ID = 67890;
   ```

   The output is as follows:

   ```shell
   +-----------+--------------+----------+---------+------------+--------------+-----------------+------+------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
   | TENANT_ID | SVR_IP       | SVR_PORT | PLAN_ID | PLAN_DEPTH | PLAN_LINE_ID | OPERATOR        | NAME | ROWS | COST | PROPERTY                                                                                                                                                                                                                                                                    |
   +-----------+--------------+----------+---------+------------+--------------+-----------------+------+------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
   |      1002 | 1.2.3.4      |    12345 |   67890 |          0 |            0 | PHY_HASH_JOIN   | NULL |    8 |   56 | NULL                                                                                                                                                                                                                                                                        |
   |      1002 | 1.2.3.4      |    12345 |   67890 |          1 |            1 |  PHY_TABLE_SCAN | D    |    8 |    5 | table_rows:8, physical_range_rows:8, logical_range_rows:8, index_back_rows:0, output_rows:8, avaiable_index_name[idx_db_name,__all_database], pruned_index_name[idx_db_name], estimation info[table_id:104, (table_type:10, version: -1--1--1, logical_rc:8, physical_rc:8)] |
   |      1002 | 1.2.3.4      |    12345 |   67890 |          1 |            2 |  PHY_TABLE_SCAN | C    |   18 |   45 | table_rows:18, physical_range_rows:18, logical_range_rows:18, index_back_rows:0, output_rows:18, avaiable_index_name[__tenant_virtual_collation]                                                                                                                            |
   +-----------+--------------+----------+---------+------------+--------------+-----------------+------+------+------+-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
   3 rows in set
   ```

OceanBase Database also supports the `GV$OB_SQL_PLAN` view. It displays the information returned during the first execution of a plan, for example, the number of output rows of the current operator estimated by the optimizer, and the actual number of rows returned for the current operator during the first execution of the plan. You can determine whether the cost estimated by the optimizer is accurate based on these values. For more information about the `GV$OB_SQL_PLAN` view, see [GV$OB_SQL_PLAN](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104608).

Here is an example:

1. Execute an SQL statement.

   ```sql
   select * from oceanbase.DBA_OB_DATABASES;
   ```

   The output is as follows:

   ```shell
   +--------------------+---------------+--------------------+-----------+--------------------+
   | DATABASE_NAME      | IN_RECYCLEBIN | COLLATION          | READ_ONLY | COMMENT            |
   +--------------------+---------------+--------------------+-----------+--------------------+
   | obproxy            | NO            | utf8mb4_general_ci | NO        |                    |
   | test               | NO            | utf8mb4_general_ci | NO        | test schema        |
   | __public           | NO            | utf8mb4_general_ci | YES       | public schema      |
   | __recyclebin       | NO            | utf8mb4_general_ci | YES       | recyclebin schema  |
   | mysql              | NO            | utf8mb4_general_ci | NO        | MySql schema       |
   | information_schema | NO            | utf8mb4_general_ci | NO        | information_schema |
   | oceanbase          | NO            | utf8mb4_general_ci | NO        | system database    |
   +--------------------+---------------+--------------------+-----------+--------------------+
   8 rows in set
   ```

2. Query the trace ID of the SQL statement.

   ```sql
   select last_trace_id();
   ```

   The output is as follows:

   ```shell
   +------------------------------------+
   | last_trace_id()                    |
   +------------------------------------+
   | Y584A0B9E1F14-0006104BFEB3B549-0-0 |
   +------------------------------------+
   1 row in set
   ```

3. Query the `TENANT_ID`, `SVR_IP`, `SVR_PORT`, and `PLAN_ID` fields corresponding to the SQL statement based on the trace ID.

   ```sql
   select TENANT_ID,
     SVR_IP,
     SVR_PORT,
     PLAN_ID,
     QUERY_SQL
   from oceanbase.gv$ob_sql_audit
   where trace_id = 'Y584A0B9E1F14-0006104BFEB3B549-0-0';
   ```

   The output is as follows:

   ```shell
   +-----------+--------------+----------+---------+------------------------------------------+
   | TENANT_ID | SVR_IP       | SVR_PORT | PLAN_ID | QUERY_SQL                                |
   +-----------+--------------+----------+---------+------------------------------------------+
   |      1002 | 1.2.3.4      |    12345 |   67890 | select * from oceanbase.DBA_OB_DATABASES |
   +-----------+--------------+----------+---------+------------------------------------------+
   1 row in set
   ```

4. Query the actual execution plan for the SQL statement based on the return result.

   ```sql
   select
     OPERATOR,
     ID,
     PARENT_ID,
     DEPTH,
     POSITION,
     OBJECT_NAME,
     COST,
     REAL_COST,
     CARDINALITY,
     REAL_CARDINALITY,
     IO_COST,
     CPU_COST
   from oceanbase.GV$OB_SQL_PLAN
   where plan_id = 67890;
   ```

   The output is as follows:

   ```shell
   +------------------+----+-----------+-------+----------+----------------------------+------+-----------+-------------+------------------+---------+----------+
   | OPERATOR         | ID | PARENT_ID | DEPTH | POSITION | OBJECT_NAME                | COST | REAL_COST | CARDINALITY | REAL_CARDINALITY | IO_COST | CPU_COST |
   +------------------+----+-----------+-------+----------+----------------------------+------+-----------+-------------+------------------+---------+----------+
   | HASH OUTER JOIN  |  0 |        -1 |     0 |        1 |                            |   57 |      2110 |           8 |                8 |       0 |        0 |
   | TABLE FULL SCAN  |  1 |         0 |     1 |        1 | __all_database             |    6 |         0 |           8 |                8 |       0 |        0 |
   | TABLE FULL SCAN  |  2 |         0 |     1 |        2 | __tenant_virtual_collation |   46 |      2110 |          18 |               18 |       0 |        0 |
   +------------------+----+-----------+-------+----------+----------------------------+------+-----------+-------------+------------------+---------+----------+
   3 rows in set
   ```