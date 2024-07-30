---
title: SQL 性能调优 —— 索引调优
weight: 3
---
&emsp;&emsp;调优相关的内容主要分为三个部分：索引调优、连接（join）方式调优、综合调优实践。这篇内容是最简单、最基础，同时也最常用的“索引调优”。

&emsp;&emsp;这篇文章不涉及 OceanBase 改写、优化和执行的内核代码实现，也不涉及一条 SQL 从 parser、resolver 到计算出最终结果的相关原理。**只有数据库使用者最为关心的调优实践内容。**

&emsp;&emsp;阅读前建议先去了解一下在 OB 中如何通过 explain 阅读执行计划，例如可以先阅读一下庆涛写的这一系列博客：[https://open.oceanbase.com/blog/1100214](https://open.oceanbase.com/blog/1100214)。因为本篇博客涉及到的计划都超级简单，靠猜也能猜个八九不离十，所以如果实在懒得去了解 explain，也是 OK 的。
<a name="YCtcI"></a>
# 索引调优
&emsp;&emsp;当我们发现某一条 SQL 存在性能问题时，我们可以通过很多方式对这条 SQL 进行优化，其中最常见的是索引调优。索引调优通过为数据表创建合适的索引来达到减少数据扫描量，消除排序等目的。索引调优是一种比较简单的调优方式，也是 SQL 出现性能问题时通常在第一时间考虑的优化方式。在单表扫描场景下创建一个合适的索引往往可以极大地提高 SQL 的执行性能。<br />&emsp;&emsp;所以在建索引前，我们需要考虑是否有必要建索引、应该在哪些列上建索引、索引列的顺序应该怎样安排。接下来就会记录下 OceanBase 中索引的一些基础知识，以及创建合适的索引的方法。
<a name="ABZf2"></a>
# OceanBase 索引的基础知识
&emsp;&emsp;<strong>OceanBase 的索引中除了有索引键，还会包含主表的主键。</strong>因为在使用索引的时候，需要通过主表的主键去关联索引中的某一行与主表中的某一行。也就意味着索引表中需要包含主表的主键才能去反向查找定位主表中的具体某一行（OceanBase 中常把这个操作叫做索引回表），因此需要把主表的主键加到索引表里面。<br />&emsp;&emsp;我们可以简单做一个实验看下，创建一个索引叫 idx_b。
```
create table test(a int primary key, b int, c int, key idx_b(b));
```
&emsp;&emsp;再去 oceanbase.__all_column 中查询一下这个索引有哪些列，可以看到虽然这个索引创建在 b 列上，但是这个索引中还包含了主表的主键列 a 列。
```
select
  column_id,
  column_name,
  rowkey_position,
  index_position
from
  oceanbase.__all_column
where
  table_id = (
    select
      table_id
    from
      oceanbase.__all_table
    where
      data_table_id = (
        select
          table_id
        from
          oceanbase.__all_table
        where
          table_name = 'test'
      )
  );
+-----------+-------------+-----------------+----------------+
| column_id | column_name | rowkey_position | index_position |
+-----------+-------------+-----------------+----------------+
|        16 | a           |               2 |              0 |
|        17 | b           |               1 |              1 |
+-----------+-------------+-----------------+----------------+
2 rows in set (0.045 sec)
```
<a name="QFWl5"></a>
# 索引的几个作用
查询时走索引相对于走主表有三个优势：

1. 可以根据索引列的条件去快速定位数据，来减少数据的扫描量。
2. 索引列是有序的，可以利用此特性消掉一些排序操作。
3. 索引一般比主表小，如果过滤条件的过滤性好或者查询的列数较少，可以少扫描一些数据。
<a name="VqjuI"></a>
## 快速定位数据
&emsp;&emsp;索引的第一个优势是快速定位数据。可以将索引列上的过滤条件转化成索引扫描的开始位置和结束位置。在实际扫描的时候，只需要从开始位置一直扫描到结束位置，两个位置之间的数据就是满足索引列上的过滤条件的数据。扫描的开始位置到结束位置称为 query range。**这里需要记住的一个重要规则就是：索引可以从开头匹配多个等值谓词，直到匹配到第一个范围谓词为止。**<br />&emsp;&emsp;举个例子，在 test 表上有个索引 b、c， 按照前文提到的内容，其实它是 b、c、a 的索引，因为 a 是主键。
```
create table test(a int primary key, b int, c int, d int, key idx_b_c(b, c));
```
&emsp;&emsp;接下来执行几条 SQL，看看这些 SQL 能否充分利用这个索引。<br />&emsp;&emsp;下面这条 SQL 有一个 b=1 的过滤条件，对应的 query range 是 (1,MIN,MIN ; 1,MAX,MAX)。即要从 b=1，c=min，a=min 向量点开始，一直扫到 b=1， c=max，a=max 向量点。这两个向量点之间所有数据都满足 b=1条件，不需要再使用 b=1 过滤条件去过滤。
```
explain select /*+index(test idx_b_c)*/ * from test where b = 1;
+-------------------------------------------------------------------------------+
| Query Plan                                                                    |
+-------------------------------------------------------------------------------+
| =========================================================                     |
| |ID|OPERATOR        |NAME         |EST.ROWS|EST.TIME(us)|                     |
| ---------------------------------------------------------                     |
| |0 |TABLE RANGE SCAN|test(idx_b_c)|1       |5           |                     |
| =========================================================                     |
| Outputs & filters:                                                            |
| -------------------------------------                                         |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256 |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)          |
|       is_index_back=true, is_global_index=false,                              |
|       range_key([test.b], [test.c], [test.a]), range(1,MIN,MIN ; 1,MAX,MAX),  |
|       range_cond([test.b = 1])                                                |
+-------------------------------------------------------------------------------+
```
&emsp;&emsp;下面这条 SQL 有一个 b > 1 的过滤条件，和上面那条 SQL 类似，不赘述。
```
explain select /*+index(test idx_b_c)*/ * from test where b > 1;
+---------------------------------------------------------------------------------+
| Query Plan                                                                      |
+---------------------------------------------------------------------------------+
| =========================================================                       |
| |ID|OPERATOR        |NAME         |EST.ROWS|EST.TIME(us)|                       |
| ---------------------------------------------------------                       |
| |0 |TABLE RANGE SCAN|test(idx_b_c)|1       |5           |                       |
| =========================================================                       |
| Outputs & filters:                                                              |
| -------------------------------------                                           |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256   |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)            |
|       is_index_back=true, is_global_index=false,                                |
|       range_key([test.b], [test.c], [test.a]), range(1,MAX,MAX ; MAX,MAX,MAX),  |
|       range_cond([test.b > 1])                                                  |
+---------------------------------------------------------------------------------+
```
&emsp;&emsp;下面这条 SQL 的过滤条件是 b=1，c>1，对应的 query range 是 (1,1,MAX ; 1,MAX,MAX)，range_cond 是 ([test.b = 1], [test.c > 1])，因为第一个谓词是等值条件 b = 1，所以索引还会继续向后匹配，直到出现第一个范围条件 c > 1。
```
explain select/*+index(test idx_b_c)*/ * from test where b = 1 and c > 1;
+-------------------------------------------------------------------------------+
| Query Plan                                                                    |
+-------------------------------------------------------------------------------+
| =========================================================                     |
| |ID|OPERATOR        |NAME         |EST.ROWS|EST.TIME(us)|                     |
| ---------------------------------------------------------                     |
| |0 |TABLE RANGE SCAN|test(idx_b_c)|1       |5           |                     |
| =========================================================                     |
| Outputs & filters:                                                            |
| -------------------------------------                                         |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256 |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)          |
|       is_index_back=true, is_global_index=false,                              |
|       range_key([test.b], [test.c], [test.a]), range(1,1,MAX ; 1,MAX,MAX),    |
|       range_cond([test.b = 1], [test.c > 1])                                  |
+-------------------------------------------------------------------------------+
12 rows in set (0.041 sec)
```
&emsp;&emsp;下面这条 SQL 的过滤条件是 b>1，c>1。<strong>query range 在索引上抽 range 的时候，只能抽到第一个范围谓词为止。</strong>比如说这里 b>1,c>1，发现索引的第一列就被用来当范围谓词了，那么往后再出现任何的等值条件或范围条件，都不能再抽取 range。因此，此 SQL 对应的 query range 是 (1,MAX,MAX ; MAX,MAX,MAX)，因为这里是用两个向量点去描述起始和结束位置，然而两个向量点是无法精确地描述出多个范围条件的。看下面计划中 range_cond 是 ([test.b > 1])，表明这条 SQL 在索引上也只完成了 b > 1 这个条件的过滤，索引回表（is_index_back=true）之后，还需要再对 c > 1 进行一次过滤（filter([test.c > 1])）。
```
explain select /*+index(test idx_b_c)*/ * from test where b > 1 and c > 1;
+----------------------------------------------------------------------------------------+
| Query Plan                                                                             |
+----------------------------------------------------------------------------------------+
| =========================================================                              |
| |ID|OPERATOR        |NAME         |EST.ROWS|EST.TIME(us)|                              |
| ---------------------------------------------------------                              |
| |0 |TABLE RANGE SCAN|test(idx_b_c)|1       |3           |                              |
| =========================================================                              |
| Outputs & filters:                                                                     |
| -------------------------------------                                                  |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter([test.c > 1]), rowset=256 |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)                   |
|       is_index_back=true, is_global_index=false, filter_before_indexback[true],        |
|       range_key([test.b], [test.c], [test.a]), range(1,MAX,MAX ; MAX,MAX,MAX),         |
|       range_cond([test.b > 1])                                                         |
+----------------------------------------------------------------------------------------+
```
<a name="KTz7c"></a>
## 消除排序的开销
**索引本身是有序的，可以利用此特性来消除排序的开销。**<br />&emsp;&emsp;下面举几个简单的例子：<br />&emsp;&emsp;还是先创建一张表。
```
create table test(a int primary key, b int, c int, d int, key idx_b_c_d(b, c, d));
```
&emsp;&emsp;下面这条 SQL 是 b=1 order by c。 这条 SQL 用到了索引 idx_b_c_d，在计划中可以看到只有 table scan 算子而没有 sort 算子，说明索引回表后不需要再对 c 列进行排序。因为索引是按照 b、c、d、a 有序，但在扫描结果中，b 是一个常量 1，那么返回数据本身就是按照 c、d、a 有序的， order by c 自然也就不需要通过 sort 算子进行排序了。注意这里 is_index_back=false 说明索引扫描完成之后不需要回表，直接就可以输出结果，因为索引里已经包含了所查询的所有列。
```
explain select /*+index(test idx_b_c_d)*/ * from test where b = 1 order by c;
+-------------------------------------------------------------------------------------------------+
| Query Plan                                                                                      |
+-------------------------------------------------------------------------------------------------+
| ===========================================================                                     |
| |ID|OPERATOR        |NAME           |EST.ROWS|EST.TIME(us)|                                     |
| -----------------------------------------------------------                                     |
| |0 |TABLE RANGE SCAN|test(idx_b_c_d)|1       |2           |                                     |
| ===========================================================                                     |
| Outputs & filters:                                                                              |
| -------------------------------------                                                           |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256                   |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)                            |
|       is_index_back=false, is_global_index=false,                                               |
|       range_key([test.b], [test.c], [test.d], [test.a]), range(1,MIN,MIN,MIN ; 1,MAX,MAX,MAX),  |
|       range_cond([test.b = 1])                                                                  |
+-------------------------------------------------------------------------------------------------+
```
&emsp;&emsp;下面这条 SQL 就需要排序了。这里多了一个 or，看计划会通过索引去扫描出两批数据（因为 range 有两个 (1,MIN,MIN,MIN ; 1,MAX,MAX,MAX) 和 (2,MIN,MIN,MIN ; 2,MAX,MAX,MAX)），虽然两批数据内部都是有序的，但是两批数据之间却是无序的，所以在 table scan 上层还会再分配一个 sort 算子用于对 c 列进行排序。
```
explain select /*+index(test idx_b_c_d)*/ * from test where b = 1 or b = 2 order by c;
+----------------------------------------------------------------------------------------------------------------------------------+
| Query Plan                                                                                                                       |
+----------------------------------------------------------------------------------------------------------------------------------+
| =============================================================                                                                    |
| |ID|OPERATOR          |NAME           |EST.ROWS|EST.TIME(us)|                                                                    |
| -------------------------------------------------------------                                                                    |
| |0 |SORT              |               |1       |2           |                                                                    |
| |1 |└─TABLE RANGE SCAN|test(idx_b_c_d)|1       |2           |                                                                    |
| =============================================================                                                                    |
| Outputs & filters:                                                                                                               |
| -------------------------------------                                                                                            |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256                                                    |
|       sort_keys([test.c, ASC])                                                                                                   |
|   1 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256                                                    |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)                                                             |
|       is_index_back=false, is_global_index=false,                                                                                |
|       range_key([test.b], [test.c], [test.d], [test.a]), range(1,MIN,MIN,MIN ; 1,MAX,MAX,MAX), (2,MIN,MIN,MIN ; 2,MAX,MAX,MAX),  |
|       range_cond([test.b = 1 OR test.b = 2])                                                                                     |
+----------------------------------------------------------------------------------------------------------------------------------+
```
&emsp;&emsp;这条 SQL 与第一条类似，同理，也不需要排序。
```
explain select /*+index(test idx_b_c_d)*/ * from test where b = 1 and c = 2 order by c;
+---------------------------------------------------------------------------------------------+
| Query Plan                                                                                  |
+---------------------------------------------------------------------------------------------+
| ===========================================================                                 |
| |ID|OPERATOR        |NAME           |EST.ROWS|EST.TIME(us)|                                 |
| -----------------------------------------------------------                                 |
| |0 |TABLE RANGE SCAN|test(idx_b_c_d)|1       |2           |                                 |
| ===========================================================                                 |
| Outputs & filters:                                                                          |
| -------------------------------------                                                       |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter(nil), rowset=256               |
|       access([test.a], [test.b], [test.c], [test.d]), partitions(p0)                        |
|       is_index_back=false, is_global_index=false,                                           |
|       range_key([test.b], [test.c], [test.d], [test.a]), range(1,2,MIN,MIN ; 1,2,MAX,MAX),  |
|       range_cond([test.b = 1], [test.c = 2])                                                |
+---------------------------------------------------------------------------------------------+
```
&emsp;&emsp;下面这条 SQL 里的 c 是一个常量，索引是按照 b、c、d、a 有序的。因此，如果要求按照 b、d 去排序，直接在索引表上利用 c = 1 这个过滤条件（filter([test.c = 1])）查询就好了。<br />&emsp;&emsp;例如索引中 b 列有两个不同的值 1 和 2，那么利用 c = 1 这个过滤条件过滤之后，会返回索引上两批离散的数据，一批数据是 b = 1，c = 1，d、a，另一批数据是 b = 2，c = 1，d、a，这两批数据虽然在索引上可能是离散的，但是各批数据内，以及各批数据间，都是有序的，所以就不需要通过再分配 sort 算子去进行排序了。
```
explain select /*+index(test idx_b_c_d)*/ * from test where c = 1 order by b, d;
+--------------------------------------------------------------------------------------------------------------+
| Query Plan                                                                                                   |
+--------------------------------------------------------------------------------------------------------------+
| ==========================================================                                                   |
| |ID|OPERATOR       |NAME           |EST.ROWS|EST.TIME(us)|                                                   |
| ----------------------------------------------------------                                                   |
| |0 |TABLE FULL SCAN|test(idx_b_c_d)|1       |2           |                                                   |
| ==========================================================                                                   |
| Outputs & filters:                                                                                           |
| -------------------------------------                                                                        |
|   0 - output([test.a], [test.b], [test.c], [test.d]), filter([test.c = 1]), rowset=256                       |
|       access([test.a], [test.c], [test.b], [test.d]), partitions(p0)                                         |
|       is_index_back=false, is_global_index=false, filter_before_indexback[false],                            |
|       range_key([test.b], [test.c], [test.d], [test.a]), range(MIN,MIN,MIN,MIN ; MAX,MAX,MAX,MAX)always true |
+--------------------------------------------------------------------------------------------------------------+
```
<a name="QUbNn"></a>
## 查询指定列时，相比主表可以扫描更少的数据
&emsp;&emsp;这点比较好理解，例如一张大宽表，有 100 个列，OB 目前（截止到 2023.10.16）还只有行存（列存预计在 4.3 版本会支持）。如果经常要查询其中一个列，最好在这个列上创建索引，索引一般只会包含少数的几个列，可以有效避免每次都进行全表扫描。<br />&emsp;&emsp;例如下面这条 SQL，计划中的 NAME 中显示 test(idx_b)，说明查询用到了索引 idx_b，避免了扫描多余列 a、c、d 的数据。
```
create table test(a int, b int, c int, d int, key idx_b(b));

explain select b from test;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| ======================================================                                |
| |ID|OPERATOR       |NAME       |EST.ROWS|EST.TIME(us)|                                |
| ------------------------------------------------------                                |
| |0 |TABLE FULL SCAN|test(idx_b)|1       |2           |                                |
| ======================================================                                |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([test.b]), filter(nil), rowset=256                                       |
|       access([test.b]), partitions(p0)                                                |
|       is_index_back=false, is_global_index=false,                                     |
|       range_key([test.b], [test.__pk_increment]), range(MIN,MIN ; MAX,MAX)always true |
+---------------------------------------------------------------------------------------+
11 rows in set (0.041 sec)
```
&emsp;&emsp;又例如下面这条 SQL，优化器会选择列数最少的索引 idx_b（或者说数据量最小的索引）进行扫描。
```
create table test(a int, b int, c int, d int, key idx_b(b));

explain select count(*) from test;
+-----------------------------------------------------------------------------------------+
| Query Plan                                                                              |
+-----------------------------------------------------------------------------------------+
| ========================================================                                |
| |ID|OPERATOR         |NAME       |EST.ROWS|EST.TIME(us)|                                |
| --------------------------------------------------------                                |
| |0 |SCALAR GROUP BY  |           |1       |2           |                                |
| |1 |└─TABLE FULL SCAN|test(idx_b)|1       |2           |                                |
| ========================================================                                |
| Outputs & filters:                                                                      |
| -------------------------------------                                                   |
|   0 - output([T_FUN_COUNT_SUM(T_FUN_COUNT(*))]), filter(nil), rowset=256                |
|       group(nil), agg_func([T_FUN_COUNT_SUM(T_FUN_COUNT(*))])                           |
|   1 - output([T_FUN_COUNT(*)]), filter(nil), rowset=256                                 |
|       access(nil), partitions(p0)                                                       |
|       is_index_back=false, is_global_index=false,                                       |
|       range_key([test.b], [test.__pk_increment]), range(MIN,MIN ; MAX,MAX)always true,  |
|       pushdown_aggregation([T_FUN_COUNT(*)])                                            |
+-----------------------------------------------------------------------------------------+
```
这里也有一个劣势，就是如果查询的列比较多时，如果走了索引，就需要拿着从索引上得到的主表的主键列回到主表查询其余列（索引回表）。**索引回表的代价是很高的，一般索引回表的性能只有直接全表扫的十分之一，如果过滤条件的过滤很差但是依然走了索引，索引回表的代价就无法被忽略了。**<br />&emsp;&emsp;例如下面几条 SQL，索引建在 b 上，查询 a、b 的所有行，如果不走索引直接全表扫，优化器估计的代价 EST.TIME 是 2us。
```
create table test(a int, b int, c int, d int, key idx_b(b));

explain select a, b from test;
+---------------------------------------------------------------------+
| Query Plan                                                          |
+---------------------------------------------------------------------+
| ===============================================                     |
| |ID|OPERATOR       |NAME|EST.ROWS|EST.TIME(us)|                     |
| -----------------------------------------------                     |
| |0 |TABLE FULL SCAN|test|1       |2           |                     |
| ===============================================                     |
| Outputs & filters:                                                  |
| -------------------------------------                               |
|   0 - output([test.a], [test.b]), filter(nil), rowset=256           |
|       access([test.a], [test.b]), partitions(p0)                    |
|       is_index_back=false, is_global_index=false,                   |
|       range_key([test.__pk_increment]), range(MIN ; MAX)always true |
+---------------------------------------------------------------------+
```
&emsp;&emsp;如果通过指定 hint 强制走索引，优化器估计的代价 EST.TIME 是 5us，反倒比不走索引更慢了，这就是索引回表（is_index_back=true）带来的额外开销。
```
explain select /*+index(test idx_b)*/ a, b from test;
+---------------------------------------------------------------------------------------+
| Query Plan                                                                            |
+---------------------------------------------------------------------------------------+
| ======================================================                                |
| |ID|OPERATOR       |NAME       |EST.ROWS|EST.TIME(us)|                                |
| ------------------------------------------------------                                |
| |0 |TABLE FULL SCAN|test(idx_b)|1       |5           |                                |
| ======================================================                                |
| Outputs & filters:                                                                    |
| -------------------------------------                                                 |
|   0 - output([test.a], [test.b]), filter(nil), rowset=256                             |
|       access([test.__pk_increment], [test.a], [test.b]), partitions(p0)               |
|       is_index_back=true, is_global_index=false,                                      |
|       range_key([test.b], [test.__pk_increment]), range(MIN,MIN ; MAX,MAX)always true |
+---------------------------------------------------------------------------------------+
```
<a name="LgEmY"></a>
# 如何衡量走索引的耗时时间
走索引的耗时时间由两部分构成：

1. 扫描索引的时间（由扫描的数据行数决定）
2. 索引回表的时间（由需要回表的数据行数决定）

&emsp;&emsp;假设这张表有 10000 行数据，扫描索引的时间是 1 ms 1000 行，索引回表的时间是 1 ms 100 行（大概是十倍的关系）。
```
create table test(a int primary key, b int, c int, d int, e int, key idx_b_e_c(b, e, c));
```

- 用 b = 1 这个过滤条件进行过滤，会返回 1000 行数据；
- 用 b = 1 and c = 1 这个过滤条件进行过滤，会返回 100 行数据；

&emsp;&emsp;如果我们执行 select * from test where b = 1; 这条 SQL，走索引的话，开销就是：在索引上扫描 1000 行的数据，大概是 1 ms。
```
explain select /*+index(test idx_b_c_d)*/ * from test where b = 1;
```
&emsp;&emsp;不走索引的话，开销就是：在主表上扫描 10000 行的数据，大概是 10 ms。
```
explain select /*+index(test primary)*/ * from test where b = 1;
```
&emsp;&emsp;所以在这种场景下，还是走索引更快，如果生成的计划没有走索引，就可以自己指定个 hint /\*+index(test idx_b_c_d)*/ 强制让它走索引。<br />&emsp;&emsp;如果我们执行 select * from test where b = 1 and c = 1; 这条 SQL，走 idx_b_c_d 这个索引的开销就是：在索引上扫描 1000 行的数据 + 索引回表 1000 行的数据，大概是 1 ms + 10 ms = 11 ms。
```
explain select /*+index(test idx_b_c_d)*/ * from test where b = 1 and c = 1;
```
&emsp;&emsp;这条 SQL 不走索引的开销就是：在主表示索引上 10000 行的数据，耗时大概是 10 ms。
```
explain select /*+index(test primary)*/ * from test where b = 1 and c = 1;
```
&emsp;&emsp;所以在这种场景下，不走索引而走主表反倒更快，如果生成的计划走了索引，就可以自己指定个 hint /*+index(test primary)*/ 强制让它走主表。<br />&emsp;&emsp;如何获取类似于 “用 b = 1 and c = 1 这个过滤条件进行过滤，会返回 100 行数据” 这种信息？执行一条 SQL 看下 count 就好了。
```
select count(*) from test where b = 1 and c = 1;
+----------+
| count(*) |
+----------+
|       100|
+----------+
```
<a name="w199p"></a>
# 创建索引的策略
大体可以用下面两句话总结：

- **将存在等值条件的列放在索引的前面，将存在范围条件的列放在索引的后面。**
- **有多个列上存在范围条件时过滤性强的列放在前面。**

&emsp;&emsp;例如一条 SQL 中存在三个过滤条件，分别是 a = 1、b > 0、c between 1 and 12。其中 b > 0 可以过滤掉 30% 的数据，c between 1 and 12 可以过滤掉 90% 的数据，那么按照我们的基础策略，对于这条 SQL 可以在 (a, c, b) 上建一个索引进行优化。<br />&emsp;&emsp;大家可以思考下为什么要这么创建索引？索引中前两列是 a 和 c 很好理解，最后在索引中加上 b 列的原因我个人理解是为了在 select b 的时候，可以消除回表的开销。