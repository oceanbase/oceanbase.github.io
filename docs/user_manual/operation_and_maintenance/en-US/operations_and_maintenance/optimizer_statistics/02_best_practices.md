---
title: Best Practices for Statistics Collection
weight: 2
---

> Note: At present, *OceanBase Advanced Tutorial for DBAs* applies only to OceanBase Database Community Edition V4.x. Features of Oracle tenants of OceanBase Database Enterprise Edition are not described in this topic. For more information about the differences between the two editions, see [Differences between Enterprise Edition and Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714481).

## Purpose of Statistics Collection
Before the optimizer generates and selects the optimal execution plan, it evaluates and compares the execution cost of each available plan. Therefore, it is crucial to increase the accuracy of cost evaluation.

The optimizer evaluates the costs of execution plans based on the cost model and the number of rows estimated for each operator. In this process, statistics play a key role. Accurate statistics improve row estimation for operators, which allows the optimizer to estimate costs of execution plans and select the optimal plan in a more efficient manner.

Therefore, the accuracy of statistics must be guaranteed.

## Default Statistics Collection Strategies

By default, the system starts to collect statistics from 22:00 on each workday and from 06:00 on weekends. The collection lasts at most 4 hours on workdays and 20 hours on weekends. Each collection duration is called a statistics maintenance window.

In each statistics maintenance window, the optimizer re-collects all outdated statistics on tables or partitions. By default, the statistics on a table or partition are outdated if no statistics on the table or partition are collected or more than **10%** of rows in the table or partition have been added, deleted, or modified since the last collection. The following table describes the default statistics collection strategies.

| **Preference name** | **Description** | **Default value** |
| --- | --- | --- |
| degree | The degree of parallelism (DOP). | 1, which indicates single-thread scanning. | |
| method_opt | The strategy used to collect column-level statistics. | Collect the statistics on all columns and the histograms of columns with data skew used in WHERE conditions. |
| granularity | The granularity of the collection. | Collect partition-level statistics and deduce global statistics based on the collected partition-level statistics. For non-partitioned tables, global statistics are directly collected. |
| estimate_percent | The sampling ratio. | Collect statistics through a full table scan without sampling. | |
| block_sample | Specifies whether to perform block sampling. | Perform row sampling instead of block sampling. | |


## Configure Statistics Collection Strategies
The default statistics collection strategies are applicable to most tables. In certain scenarios, you may need to modify the collection strategies based on your business characteristics. This section describes some common scenarios and corresponding collection strategies.

### Business peak hours overlap statistics maintenance windows



**<font color="red">The default settings of statistics maintenance windows in OceanBase Database follow those in Oracle. However, many domestic business applications still run after 22:00 on working days. If statistics collection starts at 22:00, the SQL statements for statistics collection may preempt resources with business SQL statements, affecting business performance. In this case, you can modify the start time of a statistics maintenance window to avoid overlap with business peak hours. </font>**

```sql
-- For example, it is 11:00 on Thursday, March 7, 2024.
-- You can execute the following statements to start statistics collection at 02:00 every day from Friday:

call dbms_scheduler.set_attribute(
    'FRIDAY_WINDOW', 'NEXT_DATE', '2024-03-08 02:00:00');

call dbms_scheduler.set_attribute(
    'SATURDAY_WINDOW', 'NEXT_DATE', '2024-03-09 02:00:00');

call dbms_scheduler.set_attribute(
    'SUNDAY_WINDOW', 'NEXT_DATE', '2024-03-10 02:00:00');

call dbms_scheduler.set_attribute(
    'MONDAY_WINDOW', 'NEXT_DATE', '2024-03-11 02:00:00');

call dbms_scheduler.set_attribute(
    'TUESDAY_WINDOW', 'NEXT_DATE', '2024-03-12 02:00:00');

call dbms_scheduler.set_attribute(
    'WEDNESDAY_WINDOW', 'NEXT_DATE', '2024-03-13 02:00:00');

call dbms_scheduler.set_attribute(
    'THURSDAY_WINDOW', 'NEXT_DATE', '2024-03-14 02:00:00');

```
> Note: The preceding statements apply only to OceanBase Database tenants in MySQL mode.

### Statistics collection fails to complete due to ultra-large tables
When the default statistics collection strategies are used, the system performs a full table scan on tables or partitions whose statistics are to be collected by using a single thread. If a table or partition contains a large amount of data or occupies much disk space, the statistics collection of the table or partition takes a long period of time, which affects that of other tables or even incurs a timeout error.

If a table in your business contains more than 100 million rows or occupies more than 20 GB of disk space, we recommend that you configure the statistics collection strategies by using the following methods:

1. Skip large objects.

    In MySQL mode, statistics on LONGTEXT columns are collected by default. If the LONGTEXT columns store large objects (LOBs), the statistics are collected at a slow speed.

    In the following example, the fourth parameter specifies the columns whose statistics are to be collected. You need to specify all columns except LOB columns.

    ```sql
    call dbms_stats.set_table_prefs(
      'databse_name',
      'table_name',
      'method_opt',
      'for columns col1,col2,col3,... size auto');
    ```

2. Increase the DOP or configure block sampling.

    If you increase the DOP, more concurrent threads are used to collect statistics. This way, you can achieve quick collection by consuming more resources.

    Alternatively, you can configure block sampling to reduce the amount of data to be processed during statistics collection.

    Both methods improve the statistics collection efficiency. The first method trades off resources for statistics accuracy, whereas the second method trades off statistics accuracy for resource availability.

    You can select a method based on your business requirements.

    ```sql
    -- Configure the DOP of statistics collection.
    call dbms_stats.set_table_prefs(
      'databse_name',
      'table_name',
      'degree',
      '4');
    ```

    ```sql
    -- Enable block sampling.
    call dbms_stats.set_table_prefs(
      'databse_name',
      'table_name',
      'block_sample',
      'True');

    -- Configure a sampling ratio based on the data size of the table. In most cases, you can know the data characteristics of a table after you collect statistics of tens of millions of rows from the table.
    call dbms_stats.set_table_prefs(
      'databse_name',
      'table_name',
      'estimate_percent',
      '0.1');
    ```

3. Do not collect global statistics on partitioned tables. In the following example, the fourth parameter specifies the level of statistics to be collected. For a partitioned table, you can configure to collect statistics of only partitions. For a subpartitioned table, you can configure to collect statistics of only subpartitions. Note that if you use this strategy, you must delete global statistics for partitioned tables, and delete global and partition-level statistics for subpartitioned tables.

    ```sql
    -- Partitioned tables
    call dbms_stats.set_table_prefs(
      'databse_name',
      'table_name',
      'granularity',
      'PARTITION');

    -- Subpartitioned tables
    call dbms_stats.set_table_prefs(
      'databse_name',
      'table_name',
      'granularity',
      'SUBPARTITION');
    ```

### Table statistics are missing for queries initiated immediately after batch data import into a table
By default, statistics are updated only after automatic statistics collection, which is scheduled periodically.

> OceanBase Database V4.2.4 and versions later than V4.2.5 provide the asynchronous statistics collection capability to address this issue.

If a large amount of data is imported into an empty table or small table, as often happens in batch processing scenarios, and the table is then immediately queried, the optimizer may generate a poor plan due to missing or severely outdated statistics.

**<font color="red">In this case, we recommend that you manually collect the statistics and then perform queries after the data import. If an excessively large amount of data is imported, you can modify the manual collection strategies. For more information, see the "Statistics collection fails to complete due to ultra-large tables" section of this topic. </font>**

### Partition statistics are missing for queries initiated on the same day as the data import into a partition pre-created by date

For a table in which partitions are pre-created by date, the optimizer may fail to collect statistics on some pre-created partitions because the partitions contain no data.

If data is imported into such a partition and the imported data is queried on the same day, the optimizer may generate a poor plan due to severely outdated statistics.

In this case, we recommend that you manually collect statistics on the partition on the same day after the data import.

> OceanBase Database V4.2.4 and versions later than V4.2.5 provide the asynchronous statistics collection capability to address this issue.