---
title: Statistics O&M Manual
weight: 1
---

> **<font color="red">This statistics O&M manual is used for OceanBase Database Community Edition V4.2.0 or later. By default, if you collect statistics on a table, execution plans involving access to the table are refreshed in the plan cache. We recommend that you do not collect statistics during peak hours unless necessary.</font>**

## Basic Knowledge of Statistics

Before you read this topic, we recommend that you learn about the basic knowledge of statistics. For more information, see the "Statistics" section in [Common SQL tuning methods](https://oceanbase.github.io/docs/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/sql_tuning).

> If you already have a basic understanding of OceanBase Database statistics, you can directly read the following sections.




## Troubleshoot Collection Job Execution Failures {#troubleshoot-collection-job-execution-failures}
### Working principles of automatic statistics collection
Automatic statistics collection jobs are implemented based on the `DBMS_SCHEDULER` system package. The following table describes the seven windows defined to schedule statistics collection jobs during each week.

| **Maintenance window** | **Start time/Frequency** | **Maximum collection duration** |
| :---: | :---: | :---: |
| **MONDAY_WINDOW** | 22:00/Per week | 4 hours |
| **TUESDAY_WINDOW** | 22:00/Per week | 4 hours |
| **WEDNESDAY_WINDOW** | 22:00/Per week | 4 hours |
| **THURSDAY_WINDOW** | 22:00/Per week | 4 hours |
| **FRIDAY_WINDOW** | 22:00/Per week | 4 hours |
| **SATURDAY_WINDOW** | 06:00/Per week | 20 hours |
| **SUNDAY_WINDOW** | 06:00/Per week | 20 hours |

Automatic statistics collection involves only tables whose statistics are missing or outdated and is performed in an incremental manner. That is, the system collects statistics only on partitions in which data has changed, instead of on the entire table. By default, if the total amount of data that is added, deleted, and modified since the last collection in a partition exceeds 10% of the current table data amount, the statistics of the partition are outdated.


### Troubleshooting procedure {#troubleshooting-procedure}
To check whether automatic statistics collection is successful, perform the following steps:

+ **Step 1: Execute the following SQL statements based on the types of tenants to check whether automatic collection jobs are normally scheduled for all tenants within the previous day. If so, perform the operation in Step 2. If not, refer to [Troubleshoot Collection Job Scheduling Failures](#troubleshoot-collection-job-scheduling-failures).**

   ```sql

   -- Execute the following SQL statement in the sys tenant. If the return result is not empty, the automatic statistics collection jobs of specific tenants are not scheduled as expected. This method is recommended.

   SELECT tenant_id AS failed_scheduler_tenant_id
   FROM   oceanbase.__all_tenant t
   WHERE  NOT EXISTS(SELECT 1
                  FROM oceanbase.__all_virtual_task_opt_stat_gather_history h
                  WHERE  TYPE = 1
                  AND start_time > date_sub(now(), interval 1 day)
                  AND h.tenant_id = t.tenant_id);


   -- Execute the following SQL statement in a MySQL tenant. If the return result is empty, the automatic statistics collection jobs of the tenant are not scheduled as expected.

   SELECT *
   FROM   oceanbase.dba_ob_task_opt_stat_gather_history
   WHERE  start_time > date_sub(now(), interval 1 day)
       AND TYPE = 'AUTO GATHER';
   ```

+ **Step 2: Execute the following SQL statements based on the types of tenants to obtain the list of failed collection jobs within the previous day. If the return result is empty, the statistics are collected as expected. If not, perform the operations in Step 3 to troubleshoot the issue.**

   ```sql

   -- Execute the following SQL statement in the sys tenant to query this information of specific or all user tenants. We recommend that you query the information about specific tenants.

   SELECT t_opt.tenant_id,
          t_opt.task_id,
          task_opt.start_time AS task_start_time,
          task_opt.end_time   AS task_end_time,
          d.database_name,
          t.table_name,
          t_opt.table_id,
          t_opt.ret_code,
          t_opt.start_time,
          t_opt.end_time,
          t_opt.memory_used,
          t_opt.stat_refresh_failed_list,
          t_opt.properties
   FROM   (
              SELECT tenant_id,
                     task_id,
                     start_time,
                     end_time,
                     table_count
              FROM   oceanbase.__all_virtual_task_opt_stat_gather_history
              WHERE  type = 1
   --            AND    tenant_id = {tenant_id} -- Specify the IDs of tenants whose information you want to query.
              AND    start_time > date_sub(Now(), interval 1 day)) task_opt
   JOIN   oceanbase.__all_virtual_table_opt_stat_gather_history t_opt
   JOIN   oceanbase.__all_virtual_table t
   JOIN   oceanbase.__all_virtual_database d
   WHERE  t_opt.ret_code != 0
   AND    task_opt.task_id = t_opt.task_id
   AND    task_opt.tenant_id = t_opt.tenant_id
   AND    t_opt.tenant_id = t.tenant_id
   AND    t_opt.table_id = t.table_id
   AND    t.tenant_id = d.tenant_id
   AND    t.database_id = d.database_id
   AND    t_opt.table_id > 200000;


   -- Execute the following SQL statement in a MySQL tenant to query this information of the tenant:

   SELECT task_opt.task_id,
          task_opt.start_time AS task_start_time,
          task_opt.end_time   AS task_end_time,
          t_opt.owner,
          t_opt.table_name,
          t_opt.start_time,
          t_opt.end_time,
          t_opt.memory_used,
          t_opt.stat_refresh_failed_list,
          t_opt.properties
   FROM   (SELECT task_id,
               start_time,
               end_time
        FROM   oceanbase.dba_ob_task_opt_stat_gather_history
        WHERE  start_time > Date_sub(Now(), interval 1 day)
               AND TYPE = 'AUTO GATHER') task_opt
       join oceanbase.dba_ob_table_opt_stat_gather_history t_opt
         ON task_opt.task_id = t_opt.task_id
            AND t_opt.status != 'SUCCESS'
            AND owner != 'oceanbase';  
   ```

+ **Step 3: Troubleshoot and resolve the collection failure as follows:**

1. **<font color="red">(Most common)</font>** If the collection times out and error ret=-4012 is reported because the target table contains more than 100 million rows, refer to [Troubleshoot Stuck Collection Caused by an Ultra-large Table](#troubleshoot-stuck-collection-caused-by-an-ultra-large-table).

2. If the collection fails because a tenant has too many tables requiring statistics collection but the collection window has a limited duration, you need to manually collect the statistics of the tenant during **<font color="red">off-peak hours</font>**. For more information about collection strategies, see [Statements for Manual Statistics Collection](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/operations_and_maintenance/optimizer_statistics/command).

3. If an error other than the timeout error is reported, manually collect the statistics of the target table during **<font color="red">off-peak hours</font>**. For more information, see [Statements for Manual Statistics Collection](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/operations_and_maintenance/optimizer_statistics/command). Then, follow up the collection and report the error to the on-duty engineers of the OceanBase community forum.

## Troubleshoot Collection Job Scheduling Failures {#troubleshoot-collection-job-scheduling-failures}
You can execute the following SQL statements to check whether the automatic collection jobs are normally scheduled based on tenant types:

+ **sys tenant (with specified user tenant ID):**

   ```sql
   -- Check whether the jobs in all windows of the target user tenant are normally scheduled and run in order.

   SELECT tenant_id,
          job_name,
          what,
          start_date,
          this_date,
          last_date,
          next_date,
          enabled
   FROM   oceanbase.__all_virtual_tenant_scheduler_job
   WHERE  tenant_id = {tenant_id}
       AND job_name IN ( 'MONDAY_WINDOW', 'TUESDAY_WINDOW', 'WEDNESDAY_WINDOW',
                            'THURSDAY_WINDOW',
                     'FRIDAY_WINDOW', 'SATURDAY_WINDOW', 'SUNDAY_WINDOW' )
       AND job != 0; 


   -- Check whether the last job of the target user tenant is successful. The result code 0 indicates success.

   SELECT *
   FROM OCEANBASE.__ALL_VIRTUAL_TENANT_SCHEDULER_JOB_RUN_DETAIL
   WHERE tenant_id = {tenant_id}
   ORDER BY time;
   ```

+ **MySQL tenant:**

   ```sql
   -- Check whether the jobs in all windows of the tenant are normally scheduled and run in order.

   SELECT job_name,
          job_action,
          start_date,
          last_start_date,
          next_run_date,
          enabled
   FROM   oceanbase.dba_scheduler_jobs
   WHERE  job_name IN ( 'MONDAY_WINDOW', 'TUESDAY_WINDOW', 'WEDNESDAY_WINDOW',
                     'THURSDAY_WINDOW',
                     'FRIDAY_WINDOW', 'SATURDAY_WINDOW', 'SUNDAY_WINDOW' ); 

   -- Check whether the last job of the tenant is successful. The result code 0 indicates success.

   SELECT *
   FROM OCEANBASE.__ALL_TENANT_SCHEDULER_JOB_RUN_DETAIL
   ORDER BY time;
   ```

If the scheduling is abnormal, report the issue to the on-duty engineers of the OceanBase community forum.

## Troubleshoot Stuck Collection Caused by an Ultra-large Table {#troubleshoot-stuck-collection-caused-by-an-ultra-large-table}
The automatic statistics collection for many tenants fails due to slow collection on an ultra-large table. This issue can be troubleshot by using the method described in [Troubleshoot collection job execution failures](#troubleshoot-collection-job-execution-failures). If an ultra-large table causes the failure, use the following strategy to fix the issue:

+ **Step 1: Execute the following SQL statements to query the collection status of the ultra-large table within the previous period of time and check whether each collection on the ultra-large table is time-consuming. For the query in the sys tenant, a non-zero value of the `ret_code` parameter indicates a collection failure. For the query in a user tenant, a NULL value or a value other than 'SUCCESS' of the `status` parameter indicates a collection failure.**

   ```sql
   -- sys tenant

   SELECT *
   FROM   oceanbase.__all_virtual_table_opt_stat_gather_history
   WHERE  table_id = {table_id}
   ORDER  BY start_time; 
   -- MySQL tenant

   SELECT *
   FROM   oceanbase.dba_ob_table_opt_stat_gather_history
   WHERE  table_name = '{table_name}'
   ORDER  BY start_time;
   ```

+ **Step 2: Modify the statistics collection strategies of ultra-large tables. For more information, see** [Modify the statistics collection strategies of ultra-large tables](#modify-the-statistics-collection-strategies-of-ultra-large-tables).

+ **Step 3: After the collection strategies are modified, determine whether to manually collect statistics of the large table again based on the actual situation. When most statistics of the table are outdated and the plans generated for queries that require accessing the table are not optimal, increase the degree of parallelism (DOP) for statistics collection if the system resources are sufficient. In other cases, you can execute the following SQL statement to check whether the automatic statistics collection can be successfully performed based on the modified strategies:**

   ```plsql
   -- MySQL tenant
   -- To ensure stability, this collection does not refresh relevant plans in the plan cache.
   call dbms_stats.gather_table_stats('database_name','table_name', no_invalidate=>true);              
   ```

+ **Step 4: If the issue of stuck collection has frequently occurred for the tenant, you can check whether the statistics on most tables in the tenant are missing or outdated. If so, manually collect the statistics on the tables during <font color="red">off-peak hours</font>. For more information, see [Quickly query tables with outdated or missing statistics in the current tenant](#quickly-query-tables-with-outdated-or-missing-statistics-in-the-current-tenant) and [Statements for Manual Statistics Collection](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/operations_and_maintenance/optimizer_statistics/command).**

+ **Step 5: Modify the start time of automatic statistics collection jobs. <font color="red">We recommend that the collection is performed after the daily compaction during off-peak hours</font>. For more information, see [Modify the Scheduling Time of Automatic Statistics Collection Jobs](#modify-the-scheduling-time-of-automatic-statistics-collection-jobs).**

If you have any questions about the preceding steps or encounter any issues during actual operations, contact the on-duty engineers of the OceanBase community forum.

## Common O&M Methods of Statistics
### Disable and enable automatic statistics collection
You can execute the following statements to disable or enable automatic statistics collection. Note that you need to re-configure the collection jobs as needed after automatic statistics collection is enabled.

```sql
-- MySQL tenant:
-- Disable automatic statistics collection:
call dbms_scheduler.disable('MONDAY_WINDOW');
call dbms_scheduler.disable('TUESDAY_WINDOW');
call dbms_scheduler.disable('WEDNESDAY_WINDOW');
call dbms_scheduler.disable('THURSDAY_WINDOW');
call dbms_scheduler.disable('FRIDAY_WINDOW');
call dbms_scheduler.disable('SATURDAY_WINDOW');
call dbms_scheduler.disable('SUNDAY_WINDOW');

-- Enable automatic statistics collection:
call dbms_scheduler.enable('MONDAY_WINDOW');
call dbms_scheduler.enable('TUESDAY_WINDOW');
call dbms_scheduler.enable('WEDNESDAY_WINDOW');
call dbms_scheduler.enable('THURSDAY_WINDOW');
call dbms_scheduler.enable('FRIDAY_WINDOW');
call dbms_scheduler.enable('SATURDAY_WINDOW');
call dbms_scheduler.enable('SUNDAY_WINDOW');
```

### Quickly query tables with outdated or missing statistics in the current tenant {#quickly-query-tables-with-outdated-or-missing-statistics-in-the-current-tenant}
You can execute the following statement to query tables whose statistics are missing or outdated in a user tenant and sort the tables by their data amount:

```sql
-- MySQL tenant

SELECT v2.database_name,
       v2.table_name,
       Sum(inserts - deletes) row_cnt
FROM   oceanbase.dba_tab_modifications v1,
       (SELECT DISTINCT database_name AS DATABASE_NAME,
                        table_name    AS table_name
        FROM   oceanbase.dba_ob_table_stat_stale_info
        WHERE  is_stale = 'YES'
               AND database_name != 'oceanbase') v2
WHERE  v1.table_name = v2.table_name
GROUP  BY v2.database_name,
          v2.table_name
ORDER  BY row_cnt; 
```

### Modify the statistics collection strategies of ultra-large tables {#modify-the-statistics-collection-strategies-of-ultra-large-tables}
The statistics collection on ultra-large tables is time-consuming due to the following reasons:

1. **The tables contain a large amount of data. Therefore, full table scans take a long time during statistics collection.**

2. **The histogram collection involves complex computations, which causes extra costs.**

3. **By default, statistics and histograms are collected from subpartitions, partitions, and whole tables of large partitioned tables. The cost is equal to 3 × (full table scan cost + histogram collection cost). <font color="red">This issue is optimized only for OceanBase V4.2.2 and later</font>**.

In view of the preceding reasons, you can optimize statistics collection configurations based on your business requirements and the actual situation of tables by using the following methods:

+ Set an appropriate default DOP for statistics collection. Note that you must schedule the automatic statistics collection job to run during off-peak hours to prevent your business from being affected. For more information, see [Modify the Scheduling Time of Automatic Statistics Collection Jobs](#modify-the-scheduling-time-of-automatic-statistics-collection-jobs). **<font color="red">We recommend that you set the DOP to 8 or a smaller value.</font>** Here is an example:

   ```sql
   -- MySQL tenant:
   call dbms_stats.set_table_prefs('database_name', 'table_name', 'degree', '8');
   ```

+ Set the default histogram collection method for columns. We recommend that you do not collect histograms on columns in which data is evenly distributed.

   ```sql
   -- MySQL tenant

   -- 1. If data is evenly distributed in all columns of the table, you can skip histogram collection on all columns. Here is an example:

   call dbms_stats.set_table_prefs('database_name', 'table_name', 'method_opt', 'for all columns size 1');

   -- 2. If data is unevenly distributed in a few columns of the table, you can collect histograms on these columns and skip histogram collection on other columns. The following sample statement shows how to collect histograms on the `c1` and `c2` columns and skip histogram collection on the `c3`, `c4`, and `c5` columns:

   call dbms_stats.set_table_prefs('database_name', 'table_name', 'method_opt', 'for columns c1 size 254, c2 size 254, c3 size 1, c4 size 1, c5 size 1');
   ```

+ Set the default statistics collection granularity for partitioned tables. For HASH-partitioned tables and KEY-partitioned tables, you can collect only global statistics or deduce global statistics based on partition-level statistics. Here is an example:

   ```sql
   -- MySQL tenant

   -- 1. Collect only global statistics:
   call dbms_stats.set_table_prefs('database_name', 'table_name', 'granularity', 'GLOBAL');

   -- 2. Deduce global statistics based on partition-level statistics:
   call dbms_stats.set_table_prefs('database_name', 'table_name', 'granularity', 'APPROX_GLOBAL AND PARTITION');
   ```

+ **<font color="red">Use large-table sampling with caution. When you use large-table sampling to collect statistics, the number of histogram samples becomes very large, which lowers collection efficiency. Large-table sampling is suitable for the collection of basic statistics instead of histograms.</font>** Here is an example:

   ```sql
   -- MySQL tenant

   -- 1. Skip histogram collection on all columns:
   call dbms_stats.set_table_prefs('database_name', 'table_name', 'method_opt', 'for all columns size 1');

   -- 2. Set the sampling ratio to 10%:
   call dbms_stats.set_table_prefs('database_name', 'table_name', 'estimate_percent', '10');
   ```

If you want to clear or delete a default statistics collection strategy that you specified, specify only the attribute to be deleted. Here is an example:

```sql
-- Delete the "granularity" attribute in a MySQL tenant:

call dbms_stats.delete_table_prefs('database_name', 'table_name', 'granularity');
```

After you set a statistics collection strategy, you can query whether it has taken effect. Here is an example:

```sql
-- Query the specified "degree" attribute in a MySQL tenant:

select dbms_stats.get_prefs('degree', 'database_name','table_name') from dual;
```
You can also lock statistics after you manually collect the statistics on ultra-large tables. For more information, see [Lock statistics to prevent statistics updates](#lock-statistics-to-prevent-statistics-updates).

### Lock statistics to prevent statistics updates {#lock-statistics-to-prevent-statistics-updates}
If the overall data distribution of a table does not significantly change and you want to maintain stability of query plans that require accessing the table, you can execute the following statements to lock and unlock the table statistics:

```sql
-- Lock the statistics on a table in a MySQL tenant:
call dbms_stats.lock_table_stats('database_name', 'table_name');

-- Unlock the statistics on a table in a MySQL tenant:
call dbms_stats.unlock_table_stats('database_name', 'table_name');
```

**<font color="red">Note that the locked statistics are not automatically updated. This is suitable for scenarios with slight data changes and insensitive to data values.</font>** If you want to recollect the locked statistics, you must unlock the statistics first.

### Modify the strategies for slow statistics collection
If the statistics collection of a table is very slow, you can perform the following operations to modify the collection strategies:

1. **<font color="red">Disable histogram collection</font>**. Histogram collection is the most time-consuming operation and histograms are not very necessary in many scenarios. You can execute the following statement to skip histogram collection for all columns in the specified table by setting the `method_opt` option to `for all columns size 1`:

   ```sql
   call dbms_stats.set_table_prefs('database_name', 
                                    'table_name', 
                                    'method_opt', 
                                    'for all columns size 1');
   ```

2. **<font color="red">Increase the DOP by specifying the `degree` option</font>**. You can increase the DOP of statistics collection during off-peak hours to accelerate the collection.
3. Specify to deduce global statistics based on partition-level statistics.

In addition, **<font color="red">we recommend that you do not modify the `estimate_percent` option</font>**. By default, histograms are collected based on the calculation result of a small amount of sample data. If you modify this option, a large amount of data may be sampled. This significantly slows down histogram collection and decreases the accuracy of collected basic statistics.

## References
- [Statistical information and row estimation](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001718186)

- [OceanBase community forum](https://ask.oceanbase.com/)
