---
title: 手动统计信息收集命令手册
weight: 3
---

> 说明：目前 DBA 进阶教程的内容暂时对应的是 OceanBase 4.x 社区版本，本小节的架构部分不涉及商业版中 Oracle 模式租户下的内容。社区版和商业版的能力区别详见：[官网链接](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428510)。

优化器统计信息是一个描述数据库中表和列信息的数据集合，是选取最优执行计划非常关键的部分。

OceanBase 4.x 之前版本的统计信息收集主要依靠每日合并过程中完成，但是由于每日合并是增量合并，会导致统计信息并不是一直准确的，同时每日合并也没法收集直方图信息。

因此，从 OceanBase 4.x 版本开始，实现了全新的统计信息收集，将统计信息收集和每日合并解耦，每日合并不再收集统计信息。所以在使用 OceanBase 4.x 版本的时候需要特别关注统计信息的收集情况。

本文将结合一些实际应用场景针对性的推荐一些手动统计信息收集的命令。

## 表级统计信息收集
如果需要显示收集某个表的统计信息，当前主要提供了两种方式进行统计信息：**<font color="red">DBMS_STATS 系统包和 ANALYZE 命令行</font>**。不同版本的差异如下：

### 非分区表的统计信息收集
**<font color="red">当表的数据量和列的个数的乘积不高于 1 千万时</font>**，推荐使用如下命令收集，比如如下 TEST 用户的表 T1 有 10 个列，同时数据量在一百万行时：

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
-- re1.不收集直方图

call dbms_stats.gather_table_stats(
    'test',
    't1',
    method_opt=>'for all columns size 1');


-- re2.直方图收集使用默认策略

call dbms_stats.gather_table_stats('test', 't1');、

-- 收集时间约 2 秒左右
```

**<font color="red">当表的数据量和列的个数的乘积超过 1 千万时</font>**，推荐可以根据数据业务情况和系统资源设置一定并行度加快统计信息的收集。比如，上述 TEST 用户 T1 表中的数据量增大到 1 千万行，使用 8 个并行度：

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
-- re1.不收集直方图

call dbms_stats.gather_table_stats(
    'test',
    't1',
    degree=>8,
    method_opt=>'for all columns size 1');

-- re2.直方图收集使用默认策略

call dbms_stats.gather_table_stats(
    'test',
    't1',
    degree=>8);

-- 收集时间约 4 秒左右
```


### 分区表的统计信息收集
相比较于非分区表，统计信息收集需要考虑分区表的分区统计信息收集，因此收集策略配置时需要将其考虑进去。

**<font color="red">在系统资源允许的情况下，推荐在上述收集非分区表的并行度情况下再额外增加一倍的并行度</font>**，相同上述场景中的 TEST 用户 T1 表改为 128 分区的 T_PART 表，10 列，100 万行数据，由于多了一个分区统计信息的收集，因此加了并行度为 2 ：

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
-- 使用适当的并行度：

-- re1.不收集直方图

call dbms_stats.gather_table_stats(
    'test',
    't_part',
    degree=>2,
    method_opt=>'for all columns size 1');

-- re2.直方图收集使用默认策略

call dbms_stats.gather_table_stats(
    'test',
    't_part',
    degree=>2);

-- 收集时间约 4 秒左右
```


针对分区表，除了上述增加并行度以外，**<font color="red">我们也可以考虑分区推导方式的收集，即收集分区的统计信息，进而通过分区统计信息推导全局统计信息</font>**，加快收集的效率，比如同样的上述场景，不增加并行度，调整收集的分区方式：

```sql
-- re1.不收集直方图

call dbms_stats.gather_table_stats(
    'test', 
    't_part', 
    granularity=>'APPROX_GLOBAL AND PARTITION', 
    method_opt=>'for all columns size 1');

-- re2.直方图收集使用默认策略

call dbms_stats.gather_table_stats(
    'test',
    't_part',
    granularity=>'APPROX_GLOBAL AND PARTITION');

-- 收集时间约 4 秒左右
```

**<font color="red">综上，针对分区表的统计信息收集，可以考虑增加合适的并行度以及选择分区推导的方式进行统计信息收集</font>**。



## SCHEMA 级别的统计信息收集
      除了手动的对单表的统计信息收集以外，基于 DBMS_STATS 系统包还提供了对整个用户下的所有表进行统计信息。

      在收集某个用户下的所有表统计信息时，很显然这是一个比较耗时的操作；因此，该功能建议在业务低峰期使用。

+ 如果该用户下 **<font color="red">所有表的数据量都是一些小表（数据量不超过 1 百万行）</font>**，可以直接使用类似于如下收集 TEST 用户的统计信息命令：

```sql

-- re1.不收集直方图

call dbms_stats.gather_schema_stats('TEST', method_opt=>'for all columns size 1');


-- re2.直方图收集使用默认策略

call dbms_stats.gather_schema_stats('TEST');

```

+  当收集的用户下 **<font color="red">存在一些大表（行数在千万级别）</font>**时，可以在业务低峰期增大并行度来收集：

```sql

-- re1.不收集直方图

call dbms_stats.gather_schema_stats(
    'TEST',
    degree=>'16',
    method_opt=>'for all columns size 1');

-- re2.直方图收集使用默认策略

call dbms_stats.gather_schema_stats('TEST', degree=>'16');
```

+  如果 **<font color="red">用户下存在超大表（行数超过 1 亿）时，可以选择针对超大表开大并行单独收集</font>**，然后锁定超大表的统计信息再使用上述命令收集整个用户的，收集完成后在解锁超大表的统计信息，后续按照增量模式收集；如：

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

## 统计信息过期查询

以下 SQL 仅适用于 OceanBase 4.2 及其之后版本：
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