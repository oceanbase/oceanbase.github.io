---
title: 旁路导入
weight: 8
---
# **旁路导入**

## **简单介绍**

目前的 insert 语句插入数据会通过 SQL、事务、存储等诸多模块。因为这些模块要考虑的事情非常多，导致执行路径相对较长，为了快速的导入数据，旁路导入跳过了 SQL、事务、MemTable 等模块，直接把数据写入到 SSTable。

现在的旁路导入是利用 DDL 来实现的，可以认为是一种类型的 DDL，所以在事务中使用旁路导入会提交开启事务。
旁路导入过程中不影响转储和合并。

## **用法**

**load data 加 direct(true, 0)hint**

```sql
load data /*+ parallel(10) direct(true, 0) */ infile '/home/xxx'  into table test1 fields terminated by '|' enclosed by '' lines starting by '' terminated by '\n';
```

direct(true/false,0)，true 和 false 是设定是否对导入文件排序，hint 中的 0 处是指定一个 max error count，目标是解决导入数据有问题，不会因为一行数据的出错，导致整个导入挂掉。这个 count 数允许少于等于这个 count 的行数出错还能继续导入。如果超过了这个 max error count，那么导入就会挂掉。

对重复主键处理三种模式：insert, replace, ignore；insert 表示只要发生重复都算出错；replace 表示有重复主键出现，那么替换掉原有的数据；ignore 表示有重复出现就忽略。replace, ignore 只支持 mysql 租户。
replace 和 ignore 举例：

```sql
load data /*+ parallel(10) direct(true, 0) */ infile '/home/mxxx'  replace/ignore into table test1 fields terminated by '|' enclosed by '' lines starting by '' terminated by '\n';
```

**旁路导入文件可在 oss 上，具体命令**

```sql
load data /*+ parallel(1) direct(false,0)*/ remote_oss infile 'oss://xxxxxxx?host=xxxxxxxx&access_id=XXXXX&access_key=XXXXXX' into table test1 fields terminated by '|' enclosed by '' lines starting by '' terminated by '\n';
```

**insert into select**

```sql
insert /*+  enable_parallel_dml parallel(2) append */ into t7 select * from t8;
```

insert into select 要走旁路的话，需要加 append hint。

## **控制排序使用内存**

```sql
set global ob_sql_work_area_percentage = 50;
```

表示控制排序能用租户多少内存。

## **虚拟表和视图**

__all_virtual_load_data_stat 原 load data 虚拟表可在此表看旁路导入状态。

| **字段** | **说明** |
| --- | --- |
| job_id | 原表的 table id。 |
| job_type | 是否走旁路导入，direct 表明走了旁路导入 |
| store_status | 旁路导入状态，一般是 none ->loading->merging->merged->commit；出错删除任务是 abort。 |
| store_trans_status | 同上 |

视图：v$session_longops。

## **旁路导入注意事项**

1. 现在 load data 还没有支持 load data local 语法。导致csv数据文件必须放在 observer 端；
2. 小数据量、索引表不适合使用旁路导入，旁路导入需要重新建索引，重构外键，耗时较长；
3. 原表有大数据的表，但是导入数据量小的，不适合使用旁路导入，旁路导入会建个 hidden table，把原表数据和导入数据一起重新写入；
4. 使用旁路导入可能报错 4013（一般不会撞到），大概率是临时文件分配内存失败，可以先看下日志4013报错是不是和临时文件相关，此问题临时文件已经优化；现临时文件那边给出一个内存和并行度的建议值，如果未超过建议值报错 4013 需要找临时文件 RD 排查是否问题，内存和并行度计算方式如下：

    目前建议最大 parallel=租户内存 *0.01 / 2M，比如 10G* 0.01 / 2M =5，此租户超过 5 并行度，报错 4013 可认为符合预期，另外如果分区数少的话，内部并行度是 parallel* 分区数，分区数多的话，就是 parallel；

5. 数据放大问题，设计预期加上排序，会是原文件数据大小的两倍；
6. 旁路导入是 ddl 操作，不允许对两个表同时进行旁路导入，导入加表锁，会报错；
7. 旁路导入中，RS 机器重启，再次重试任务需要在 5 分钟后，否则RS未清除上次任务，会报错；
8. 旁路导入和 load data 处理 csv 文件会有些不同，比如文件较表多列或少列，mysql 模式会报错 -1525（预期），所以 load data 导入正常的文件，旁路导入报错，需先检查下数据文件；
9. 一行数据不支持超过 2M；
10. 支持带自增列表的导入；
11. 除了索引和外键，trigger，constraint 等都不支持；
12. 支持lob，但是性能比较差，lob 会走原来的路径；
13. 为了和 mysql 行为一致，csv 文件对应bit类型为数字时，导入 bit 类有问题，比如文件是 8，导入后是 56，符合预期；
14. 开发对旁路导入的 parallel 大小做了限制，上限是租户 cpu 数，限制可以在虚拟表 parallel 列体现。
