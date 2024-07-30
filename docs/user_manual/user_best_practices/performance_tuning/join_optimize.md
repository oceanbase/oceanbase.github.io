---
title: SQL 性能调优 —— 连接（JOIN）方式调优
weight: 4
---
<a name="P6a9t"></a>
# 连接（JOIN）方式调优
在 OceanBase 数据库中，有三种基础的连接算法： Nested-Loop Join、 Merge Join 以及 Hash Join：

1. Nested-Loop Join：首先把 join 左侧的数据扫描出来，然后用左侧的每一行去遍历一次右表的数据，从里面找到所有能连接上的数据行做连接。它的代价 = 左表扫描的代价 + 左表的行数 * 左表每一行遍历右表的代价，即：cost(NLJ) = cost(left) + N(left) * cost(right)，时间复杂度是 O(m * n)。
2. Merge Join（这个应该也可以叫做 sort merge join）：先对左表和右表的连接键分别排序，然后用类似移动指针的方式不断地调整指针，找到匹配行做连接。它的代价 = 左右表排序的代价 + 左右表扫描的代价，即：cost(MJ) = sort(left) + sort(right) + cost(left) + cost(right)，时间复杂度就是排序的时间复杂度 O(n * logn)。
3. Hash Join：扫描左表并对每一行建哈希表，扫描右表并哈希表中做探测，匹配并连接。它的代价 = 扫描左表的代价 + 左表的行数 * 每一行建哈希表的代价 + 扫描右表的代价 + 右表的行数 * 每一行探测哈希表的代价，即：cost(HJ) = cost(left) + N(left) * create_hash_cost + cost(right) + N(right) * probe_hash_cost。
<a name="m8Fvq"></a>
# Nested-Loop Join
&emsp;&emsp;OceanBase 里的 Nested-Loop Join 有两种执行方式，分别为非条件下压的 Nested-Loop Join 和条件下压的 Nested-Loop Join。<br />&emsp;&emsp;我们接下来会看一下非条件下压的 NLJ 和条件下压的 NLJ 的开销有什么不同。开始前，我们做一些准备工作，先创建两张表 t1 和 t2，通过 recursive cte 分别插入 1000 行数据，然后通过系统包函数 dbms_stats.gather_table_stats 收集一下统计信息。
```
drop table t1;

drop table t2;

CREATE TABLE t1
WITH RECURSIVE my_cte(a, b, c) AS
(
  SELECT 1, 0, 0
  UNION ALL
  SELECT a + 1, round((a + 1) / 2, 0), round((a + 1) / 3, 0) FROM my_cte WHERE a < 1000
)
SELECT * FROM my_cte;

alter table t1 add primary key(a);

CREATE TABLE t2
WITH RECURSIVE my_cte(a, b, c) AS
(
  SELECT 1, 0, 0
  UNION ALL
  SELECT a + 1, round((a + 1) / 2, 0), round((a + 1) / 3, 0) FROM my_cte WHERE a < 1000
)
SELECT * FROM my_cte;

alter table t2 add primary key(a);

call dbms_stats.gather_table_stats('TEST', 'T1', method_opt=>'for all columns size auto', estimate_percent=>100);

call dbms_stats.gather_table_stats('TEST', 'T2', method_opt=>'for all columns size auto', estimate_percent=>100);
```
<a name="RNFD4"></a>
## 非条件下压的 Nested-Loop Join
&emsp;&emsp;我们通过指定 hint /\*+use_nl(t1, t2)*/ 的方式强制让下面这条 SQL 生成 NESTED-LOOP JOIN 的计划，t2 上没有合适的索引可用，主键中也没有包含 b 列，就需要先扫描 t2 的全部数据，然后通过 material 算子将它物化到内存里。意味着接下来在处理 t1 的每一行时，都要完整地遍历 t2 的所有行，相当于做了笛卡尔积，时间复杂度是 O(m * n)，所以性能非常差。<br />&emsp;&emsp;OB 中只会出现有条件下压的 NLJ，理论上不应该出现这种非条件下压的 NLJ。
```
explain select /*+use_nl(t1, t2)*/ * from t1, t2 where t1.b = t2.b;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| ===================================================                                   |
| |ID|OPERATOR           |NAME|EST.ROWS|EST.TIME(us)|                                   |
| ---------------------------------------------------                                   |
| |0 |NESTED-LOOP JOIN   |    |1877    |11578       |                                   |
| |1 |├─TABLE FULL SCAN  |t1  |1000    |84          |                                   |
| |2 |└─MATERIAL         |    |1000    |179         |                                   |
| |3 |  └─TABLE FULL SCAN|t2  |1000    |84          |                                   |
| ===================================================                                   |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       conds([t1.b = t2.b]), nl_params_(nil), use_batch=false                          |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.a]), range(MIN ; MAX)always true                                  |
|   2 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|   3 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       access([t2.a], [t2.b], [t2.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.a]), range(MIN ; MAX)always true                                  |
+---------------------------------------------------------------------------------------+
21 rows in set (0.050 sec)
```
<a name="Xieus"></a>
## 条件下压的 Nested-Loop Join
&emsp;&emsp;我们改变连接条件为 t1.a = t2.a，并通过指定 hint /\*+use_nl(t1, t2)*/ 的方式强制让下面这条 SQL 生成 NESTED-LOOP JOIN 的计划。<br />&emsp;&emsp;可以看到在 nl_params 里面有 t1.a，意味着执行过程中会首先扫描 join 的左支（t1 表），然后把获取到的 t1 每一行的 a 值当做过滤条件，到右支上利用 t1.a = t2.a 作为 range_cond 去进行的 table get（主键查询）。因为右支 t2 表在 a 列上有主键，所以可以直接通过 table get 快速获取到任何一个具体的值，时间复杂度只有 O(m)。
```
explain select /*+use_nl(t1, t2)*/ * from t1, t2 where t1.a = t2.a;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| =======================================================                               |
| |ID|OPERATOR               |NAME|EST.ROWS|EST.TIME(us)|                               |
| -------------------------------------------------------                               |
| |0 |NESTED-LOOP JOIN       |    |1000    |16274       |                               |
| |1 |├─TABLE FULL SCAN      |t1  |1000    |84          |                               |
| |2 |└─DISTRIBUTED TABLE GET|t2  |1       |16          |                               |
| =======================================================                               |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       conds(nil), nl_params_([t1.a(:0)]), use_batch=true                              |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.a]), range(MIN ; MAX)always true                                  |
|   2 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       access([GROUP_ID], [t2.a], [t2.b], [t2.c]), partitions(p0)                      |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.a]), range(MIN ; MAX),                                            |
|       range_cond([:0 = t2.a])                                                         |
+---------------------------------------------------------------------------------------+
```
&emsp;&emsp;<strong>在 OceanBase 中，一般情况下都只会选择条件下压的 Nested-Loop Join。</strong>除非没有等值连接条件，并且 Nested-Loop Join 也没有合适的索引可用，才有可能会考虑生成非条件下压的 Nested-Loop Join，生成这种非条件下压的 NLJ 的概率非常小，一般都会用 HJ 或 MJ 代替，如果出现，就要仔细分析下是否合理了。
<a name="je7GS"></a>
## Subplan Filter
&emsp;&emsp;这里需要多提一句和子查询相关的 subplan filter 算子，这个算子的执行方式跟 Nested Loop Join 类似，和 NLJ 一样，也需要创建合适的索引或者主键，让条件能够下压。<br />&emsp;&emsp;我们还继续用之前创建的两张表 t1 和 t2，主键都建在两张表的 a 列上。下面这条 SQL 是 subplan filter 没有合适的索引或主键的情况，计划和没有条件下压的 NLJ 几乎一模一样，这里不再赘述了：
```
explain select /*+no_rewrite*/ a from t1 where b > (select b from t2 where t1.b = t2.b);
+--------------------------------------------------------------------------------------------+
| Query Plan                                                                                 |
+--------------------------------------------------------------------------------------------+
| =================================================                                          |
| |ID|OPERATOR         |NAME|EST.ROWS|EST.TIME(us)|                                          |
| -------------------------------------------------                                          |
| |0 |SUBPLAN FILTER   |    |334     |45415       |                                          |
| |1 |├─TABLE FULL SCAN|t1  |1000    |60          |                                          |
| |2 |└─TABLE FULL SCAN|t2  |2       |46          |                                          |
| =================================================                                          |
| Outputs & filters:                                                                         |
| -------------------------------------                                                      |
|   0 - output([t1.a]), filter([t1.b > subquery(1)]), rowset=256                             |
|       exec_params_([t1.b(:0)]), onetime_exprs_(nil), init_plan_idxs_(nil), use_batch=false |
|   1 - output([t1.a], [t1.b]), filter(nil), rowset=256                                      |
|       access([t1.a], [t1.b]), partitions(p0)                                               |
|       is_index_back=false, is_global_index=false,                                          |
|       range_key([t1.a]), range(MIN ; MAX)always true                                       |
|   2 - output([t2.b]), filter([:0 = t2.b]), rowset=256                                      |
|       access([t2.b]), partitions(p0)                                                       |
|       is_index_back=false, is_global_index=false, filter_before_indexback[false],          |
|       range_key([t2.a]), range(MIN ; MAX)always true                                       |
+--------------------------------------------------------------------------------------------+
```
&emsp;&emsp;下面这条 SQL 是 subplan filter 有合适主键的情况，计划和有条件下压的 NLJ 几乎一模一样，这里不再赘述了：
```
explain select /*+no_rewrite*/ a from t1 where b > (select b from t2 where t1.a = t2.a);
+-------------------------------------------------------------------------------------------+
| Query Plan                                                                                |
+-------------------------------------------------------------------------------------------+
| =======================================================                                   |
| |ID|OPERATOR               |NAME|EST.ROWS|EST.TIME(us)|                                   |
| -------------------------------------------------------                                   |
| |0 |SUBPLAN FILTER         |    |334     |18043       |                                   |
| |1 |├─TABLE FULL SCAN      |t1  |1000    |60          |                                   |
| |2 |└─DISTRIBUTED TABLE GET|t2  |1       |18          |                                   |
| =======================================================                                   |
| Outputs & filters:                                                                        |
| -------------------------------------                                                     |
|   0 - output([t1.a]), filter([t1.b > subquery(1)]), rowset=256                            |
|       exec_params_([t1.a(:0)]), onetime_exprs_(nil), init_plan_idxs_(nil), use_batch=true |
|   1 - output([t1.a], [t1.b]), filter(nil), rowset=256                                     |
|       access([t1.a], [t1.b]), partitions(p0)                                              |
|       is_index_back=false, is_global_index=false,                                         |
|       range_key([t1.a]), range(MIN ; MAX)always true                                      |
|   2 - output([t2.b]), filter(nil), rowset=256                                             |
|       access([GROUP_ID], [t2.b]), partitions(p0)                                          |
|       is_index_back=false, is_global_index=false,                                         |
|       range_key([t2.a]), range(MIN ; MAX)always true,                                     |
|       range_cond([:0 = t2.a])                                                             |
+-------------------------------------------------------------------------------------------+
```
&emsp;&emsp;在 OceanBase 中，并不是所有的子查询都能被 unnest，有时候根据 sql 的语义，只能用 subplan filter 算子进行计算。**subplan filter 的执行方式跟 Nested Loop Join 类似，所以也需要创建合适的索引避免出现非条件下压的 subplan filter。**
<a name="TS0s8"></a>
# Hash Join

- cost(NLJ) = cost(left) + N(left) * cost(right)
- cost(HJ) = cost(left) + N(left) * create_hash_cost + cost(right) + N(right) * probe_hash_cost

&emsp;&emsp;上面列出了 NLJ 和 HJ 的代价计算公式，这里先免去数学推导的过程，直接说结论 “ OB 的优化器如果要在 NLJ 和 HJ 中进行选择，在满足下面两个条件时，才会选择 NLJ ” ：

1. **右表有合适的索引或者主键。**
2. **右表的行数 / 左表的行数超过一定的阈值，在 OB 中，大概是 20 这样**（20 是博士和义博他们给出的经验值，实测不止 20，大概在 100 的样子，这里不乱猜测，后面有空儿了会学习一下代价计算这块儿的代码）。

&emsp;&emsp;我们来验证一下上面的结论，先创建两张表：第一张无主键表 t1 有 10 行；第二张有主键表 t2 主键是 a 列，有 1000 行。
```
drop table t1;

drop table t2;

CREATE TABLE t1
WITH RECURSIVE my_cte(a, b, c) AS
(
  SELECT 1, 0, 0
  UNION ALL
  SELECT a + 1, round((a + 1) / 2, 0), round((a + 1) / 3, 0) FROM my_cte WHERE a < 10
)
SELECT * FROM my_cte;

CREATE TABLE t2
WITH RECURSIVE my_cte(a, b, c) AS
(
  SELECT 1, 0, 0
  UNION ALL
  SELECT a + 1, round((a + 1) / 2, 0), round((a + 1) / 3, 0) FROM my_cte WHERE a < 1000
)
SELECT * FROM my_cte;

alter table t2 add primary key(a);

call dbms_stats.gather_table_stats('TEST', 'T1', method_opt=>'for all columns size auto', estimate_percent=>100);

call dbms_stats.gather_table_stats('TEST', 'T2', method_opt=>'for all columns size auto', estimate_percent=>100);
```
&emsp;&emsp;当用不上 t2 表的主键时，如果要生成 NLJ，则会生成非条件下压的 NLJ，显然代价会很大，所以这里会生成一个 HJ 的计划：
```
explain select * from t1, t2 where t1.b = t2.b;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| =================================================                                     |
| |ID|OPERATOR         |NAME|EST.ROWS|EST.TIME(us)|                                     |
| -------------------------------------------------                                     |
| |0 |HASH JOIN        |    |1       |4           |                                     |
| |1 |├─TABLE FULL SCAN|t1  |1       |2           |                                     |
| |2 |└─TABLE FULL SCAN|t2  |1       |2           |                                     |
| =================================================                                     |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       equal_conds([t1.b = t2.b]), other_conds(nil)                                    |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.a]), range(MIN ; MAX)always true                                  |
|   2 - output([t2.b], [t2.a], [t2.c]), filter(nil), rowset=256                         |
|       access([t2.b], [t2.a], [t2.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.__pk_increment]), range(MIN ; MAX)always true                     |
+---------------------------------------------------------------------------------------+
```
&emsp;&emsp;当能用上 t2 表的主键列 t2.a 去进行 table get，而且右表和左表有明显的大小表关系时（右表 t2 有 1000 行，左表 t1 只有 10 行），这里就会生成一个 NLJ 的计划：
```
explain select * from t1, t2 where t1.a = t2.a;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| =======================================================                               |
| |ID|OPERATOR               |NAME|EST.ROWS|EST.TIME(us)|                               |
| -------------------------------------------------------                               |
| |0 |NESTED-LOOP JOIN       |    |10      |165         |                               |
| |1 |├─TABLE FULL SCAN      |t1  |10      |3           |                               |
| |2 |└─DISTRIBUTED TABLE GET|t2  |1       |16          |                               |
| =======================================================                               |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       conds(nil), nl_params_([t1.a(:0)]), use_batch=true                              |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.__pk_increment]), range(MIN ; MAX)always true                     |
|   2 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       access([GROUP_ID], [t2.a], [t2.b], [t2.c]), partitions(p0)                      |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.a]), range(MIN ; MAX),                                            |
|       range_cond([:0 = t2.a])                                                         |
+---------------------------------------------------------------------------------------+
```

<a name="WnUdT"></a>
# Merge Join

- cost(MJ) = cost(left) + cost(right) + sort(left) + sort(right)
- cost(HJ) = cost(left) + N(left) * hash_cost + cost(right) + N(right) * probe_cost

&emsp;&emsp;上面列出了 NLJ 和 HJ 的代价计算公式，它们都需要完整地扫描左表和右表，区别在于 Merge Join 要分别对两侧在连接键上进行排序，而哈希则是对左侧建哈希表、对右侧做哈希探测。相比于构建哈希表和哈希探测（O(n)）来说，做排序的代价会更高（O(nlogn)）。**因此，在一般情况下，一定是 Hash Join 优于 Merge Join。**<br />&emsp;&emsp;只有在一些非常特殊的场景下，才会选择 Merge Join 。比如两侧都有序时，就可以省去排序的代价，直接做一次归并就好了。<br />&emsp;&emsp;还是拿一开始的两张表 t1 和 t2 做实验，t1 和 t2 都有建在 a 列上的主键。
```
drop table t1;

drop table t2;

CREATE TABLE t1
WITH RECURSIVE my_cte(a, b, c) AS
(
  SELECT 1, 0, 0
  UNION ALL
  SELECT a + 1, round((a + 1) / 2, 0), round((a + 1) / 3, 0) FROM my_cte WHERE a < 1000
)
SELECT * FROM my_cte;

alter table t1 add primary key(a);

CREATE TABLE t2
WITH RECURSIVE my_cte(a, b, c) AS
(
  SELECT 1, 0, 0
  UNION ALL
  SELECT a + 1, round((a + 1) / 2, 0), round((a + 1) / 3, 0) FROM my_cte WHERE a < 1000
)
SELECT * FROM my_cte;

alter table t2 add primary key(a);

call dbms_stats.gather_table_stats('TEST', 'T1', method_opt=>'for all columns size auto', estimate_percent=>100);

call dbms_stats.gather_table_stats('TEST', 'T2', method_opt=>'for all columns size auto', estimate_percent=>100);
```
&emsp;&emsp;如果连接条件都是本来就有序的主键 a 列，则会生成 merge join。
```
explain select * from t1, t2 where t1.a = t2.a;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| =================================================                                     |
| |ID|OPERATOR         |NAME|EST.ROWS|EST.TIME(us)|                                     |
| -------------------------------------------------                                     |
| |0 |MERGE JOIN       |    |1000    |301         |                                     |
| |1 |├─TABLE FULL SCAN|t1  |1000    |84          |                                     |
| |2 |└─TABLE FULL SCAN|t2  |1000    |84          |                                     |
| =================================================                                     |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       equal_conds([t1.a = t2.a]), other_conds(nil)                                    |
|       merge_directions([ASC])                                                         |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.a]), range(MIN ; MAX)always true                                  |
|   2 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       access([t2.a], [t2.b], [t2.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.a]), range(MIN ; MAX)always true                                  |
+---------------------------------------------------------------------------------------+
```
&emsp;&emsp;如果连接条件都是无序的 b 列，则会生成 hash join。
```
explain select * from t1, t2 where t1.b = t2.b;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| =================================================                                     |
| |ID|OPERATOR         |NAME|EST.ROWS|EST.TIME(us)|                                     |
| -------------------------------------------------                                     |
| |0 |HASH JOIN        |    |1877    |481         |                                     |
| |1 |├─TABLE FULL SCAN|t1  |1000    |84          |                                     |
| |2 |└─TABLE FULL SCAN|t2  |1000    |84          |                                     |
| =================================================                                     |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       equal_conds([t1.b = t2.b]), other_conds(nil)                                    |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.a]), range(MIN ; MAX)always true                                  |
|   2 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       access([t2.a], [t2.b], [t2.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.a]), range(MIN ; MAX)always true                                  |
+---------------------------------------------------------------------------------------+
```
&emsp;&emsp;如果连接条件都是无序的 b 列，并通过指定 hint 强制要求生成 merge join 的计划，那么执行计划中一定会被先分配 sort 算子，通过 sort 算子进行排序后再进行 merge join，这种计划的代价往往会比 hash join 高。
```
explain select /*+ USE_MERGE(t1 t2) */ * from t1, t2 where t1.b = t2.b;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| ===================================================                                   |
| |ID|OPERATOR           |NAME|EST.ROWS|EST.TIME(us)|                                   |
| ---------------------------------------------------                                   |
| |0 |MERGE JOIN         |    |1877    |750         |                                   |
| |1 |├─SORT             |    |1000    |294         |                                   |
| |2 |│ └─TABLE FULL SCAN|t1  |1000    |84          |                                   |
| |3 |└─SORT             |    |1000    |294         |                                   |
| |4 |  └─TABLE FULL SCAN|t2  |1000    |84          |                                   |
| ===================================================                                   |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([t1.a], [t1.b], [t1.c], [t2.a], [t2.b], [t2.c]), filter(nil), rowset=256 |
|       equal_conds([t1.b = t2.b]), other_conds(nil)                                    |
|       merge_directions([ASC])                                                         |
|   1 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       sort_keys([t1.b, ASC])                                                          |
|   2 - output([t1.a], [t1.b], [t1.c]), filter(nil), rowset=256                         |
|       access([t1.a], [t1.b], [t1.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t1.a]), range(MIN ; MAX)always true                                  |
|   3 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       sort_keys([t2.b, ASC])                                                          |
|   4 - output([t2.a], [t2.b], [t2.c]), filter(nil), rowset=256                         |
|       access([t2.a], [t2.b], [t2.c]), partitions(p0)                                  |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([t2.a]), range(MIN ; MAX)always true                                  |
+---------------------------------------------------------------------------------------+
```
<a name="gTjRW"></a>
# 总结
这三个 join 方式是数据库最基础的知识点，最后简单地总结一下学完之后需要记住的几个点：

1. 计划里绝大多数的情况都只会选择有条件下压的 Nested-Loop Join，如果选择了非条件下压的 NLJ，需要创建合适的索引让计划变成有条件下压的 NLJ，或者指定 hint 变更 join 的方式。与联接操作相关的 Hint 详见官网链接：[https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000222744](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000222744)
2. subplan filter 的执行方式跟 Nested Loop Join 类似，所以也需要创建合适的索引避免出现非条件下压的 subplan filter。
3. 计划里如果有 merge join，往往是可以利用下层算子的有序性。如果下层算子都是无序的，计划中在 merge 前还专门分配了一些 sort 进行排序，需要分析下是否需要通过 hint 改成使用 hash join 进行连接。
4. 如果没有可用的索引和主键，也没有有序性，那么一般 hash join 的代价是最低的。