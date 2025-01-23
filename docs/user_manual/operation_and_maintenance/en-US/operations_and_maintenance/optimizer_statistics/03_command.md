---
title: Statements for Manual Statistics Collection
weight: 3
---

> Note: At present, *OceanBase Advanced Tutorial for DBAs* applies only to OceanBase Database Community Edition V4.x. Features of Oracle tenants of OceanBase Database Enterprise Edition are not described in this topic. For more information about the differences between the two editions, see [Differences between Enterprise Edition and Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714481).

Optimizer statistics are a collection of data that describes the tables and columns in a database, which are the key to selecting the optimal execution plan.

In OceanBase Database of a version earlier than V4.x, statistics are mainly collected during daily compactions. However, statistics are not always accurate because of the incremental data involved in daily compactions. In addition, histogram information cannot be collected during daily compactions.

Therefore, the statistics feature is upgraded in OceanBase Database V4.x and later, so that statistics are no longer collected during daily compactions. When you use OceanBase Database V4.x, pay special attention to the collection of statistics.

This topic recommends some statements for manual statistics collection in actual scenarios.

## Collect Table-level Statistics
To explicitly collect statistics on a table, you can use the following methods: **<font color="red">DBMS_STATS system package and ANALYZE statement</font>**. Pay attention to the table type.

### Collect statistics on a non-partitioned table
**<font color="red">If the product of the number of rows and the number of columns in a table is no greater than 10 million</font>**, we recommend that you run the following statements to collect statistics on the table. In the following example, the `t1` table owned by the `test` user contains 10 columns and one million rows:

```sql
create table test.t1(
    c1 int, c2 int, c3 int, c4 int, c5 int, 
    c6 int, c7 int, c8 int, c9 int, c10 int);

insert /*+append*/ into t1 
    select level,level,level,level,level,
           level,level,level,level,level
    from dual
    connect by level <= 1000000;
```

```sql
-- re1. Histograms are not collected.

call dbms_stats.gather_table_stats(
    'test',
    't1',
    method_opt=>'for all columns size 1');


-- re2. Histograms are collected by using the default strategy.

call dbms_stats.gather_table_stats('test', 't1');

-- The collection takes about 2 seconds.
```

**<font color="red">If the product of the number of rows and the number of columns in a table exceeds 10 million</font>**, we recommend that you specify an appropriate degree of parallelism (DOP) based on your business requirements and system resources to accelerate the statistics collection. In the following example, the DOP is set to 8 when the data amount in the `t1` table is increased to 10 million rows:

```sql
create table test.t1(
    c1 int, c2 int, c3 int, c4 int, c5 int,
    c6 int, c7 int, c8 int, c9 int, c10 int);

insert /*+append*/ into t1 
    select level,level,level,level,level,
           level,level,level,level,level
    from dual
    connect by level <= 10000000;
```

```sql
-- re1. Histograms are not collected.

call dbms_stats.gather_table_stats(
    'test',
    't1',
    degree=>8,
    method_opt=>'for all columns size 1');

-- re2. Histograms are collected by using the default strategy.

call dbms_stats.gather_table_stats(
    'test',
    't1',
    degree=>8);

-- The collection takes about 4 seconds.
```


### Collect statistics on a partitioned table
Different from statistics collection strategies for non-partitioned tables, the strategies for partitioned tables must cover the collection of partition statistics.

**<font color="red">If system resources are sufficient, we recommend that you double the DOP for statistics collection on partitioned tables.</font>** For example, the `t_part` table of the `test` user contains 128 partitions, 10 columns, and one million rows of data. In this case, you can set the DOP to 2 to collect the basic statistics and partition statistics:

```sql
create table t_part(
    c1 int, c2 int, c3 int, c4 int, c5 int,
    c6 int, c7 int, c8 int, c9 int, c10 int
)partition by hash(c1) partitions 128;

insert /*+append*/ into t_part 
    select level,level,level,level,level,
           level,level,level,level,level
    from dual
    connect by level <= 1000000;
```

```sql
-- Specify an appropriate DOP:

-- re1. Histograms are not collected.

call dbms_stats.gather_table_stats(
    'test',
    't_part',
    degree=>2,
    method_opt=>'for all columns size 1');

-- re2. Histograms are collected by using the default strategy.

call dbms_stats.gather_table_stats(
    'test',
    't_part',
    degree=>2);

-- The collection takes about 4 seconds.
```


For partitioned tables, **<font color="red">you can also deduce global statistics from partition-level statistics to accelerate statistics collection</font>**. That is, you can modify the collection granularity to `APPROX_GLOBAL AND PARTITION` instead of increasing the DOP for statistics collection on the `t_part` table.

```sql
-- re1. Histograms are not collected.

call dbms_stats.gather_table_stats(
    'test', 
    't_part', 
    granularity=>'APPROX_GLOBAL AND PARTITION', 
    method_opt=>'for all columns size 1');

-- re2. Histograms are collected by using the default strategy.

call dbms_stats.gather_table_stats(
    'test',
    't_part',
    granularity=>'APPROX_GLOBAL AND PARTITION');

-- The collection takes about 4 seconds.
```

**<font color="red">In summary, you can specify an appropriate DOP or deduce global statistics from partition-level statistics to accelerate statistics collection on partitioned tables.</font>**



## Collect Schema-level Statistics

In addition to manual statistics collection on a single table, you can use the `DBMS_STATS` system package to collect statistics on all tables of a user.

This process is time-consuming. Therefore, we recommend that you use this feature during off-peak hours.

+ If **<font color="red">each table of the user contains no more than one million rows</font>**, you can run the statements in the following example to collect statistics:

    ```sql

    -- re1. Histograms are not collected.

    call dbms_stats.gather_schema_stats('TEST', method_opt=>'for all columns size 1');


    -- re2. Histograms are collected by using the default strategy.

    call dbms_stats.gather_schema_stats('TEST');

    ```

+  If **<font color="red">the user has large tables and each large table contains tens of millions of rows</font>**, you can increase the DOP and collect statistics during off-peak hours.

    ```sql

    -- re1. Histograms are not collected.

    call dbms_stats.gather_schema_stats(
        'TEST',
        degree=>'16',
        method_opt=>'for all columns size 1');

    -- re2. Histograms are collected by using the default strategy.

    call dbms_stats.gather_schema_stats('TEST', degree=>'16');
    ```

+  If **<font color="red">the user has ultra-large tables and each ultra-large table contains more than 100 million rows, you can collect statistics on the ultra-large tables separately at a high DOP</font>**. Then, you can lock the statistics on the ultra-large tables and execute the preceding statements to collect statistics on all tables of the user. After the statistics are collected, you can unlock the statistics on the ultra-large tables and then collect the subsequent statistics in incremental mode. Here is an example:

    ```sql
    call dbms_stats.gather_table_stats(
        'test',
        'big_table',
        degree=>128,
        method_opt=>'for all columns size 1');

    call dbms_stats.lock_table_stats('test','big_table');

    call dbms_stats.gather_schema_stats(
        'TEST',
        degree=>'16',
        method_opt=>'for all columns size 1');

    call dbms_stats.unlock_table_stats('test','big_table');
    ```

## Query Whether Statistics Are Outdated

The following SQL statements apply only to OceanBase Database V4.2 and later:
```sql
select distinct DATABASE_NAME, TABLE_NAME
    from oceanbase.DBA_OB_TABLE_STAT_STALE_INFO
    where DATABASE_NAME not in('oceanbase','mysql', '__recyclebin')
        and (IS_STALE = 'YES' or LAST_ANALYZED_TIME is null);
```

```cpp
select distinct OWNER, TABLE_NAME
    from sys.DBA_OB_TABLE_STAT_STALE_INFO
    where OWNER != 'oceanbase'
        and OWNER != '__recyclebin' and (IS_STALE = 'YES' or LAST_ANALYZED_TIME is null);
```