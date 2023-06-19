---
title: 执行计划
weight: 2
---
# **执行计划**

执行计划是对一条 SQL 查询语句在数据库中执行过程的描述，通常用于分析某条 SQL 的性能问题，读懂执行计划是 SQL 优化的先决条件。本文介绍如何查看 SQL 的逻辑执行计划和实际执行计划，并介绍一些常用的执行计划算子。

## **逻辑执行计划**

使用 EXPLAIN 命令可以查看优化器针对指定 SQL 生成的逻辑执行计划。EXPLAIN 命令完整的语法如下：

```sql
{EXPLAIN | DESCRIBE | DESC} [explain_type] dml_statement;

explain_type：
    BASIC 
  | OUTLINE
  | EXTENDED
  | EXTENDED_NOADDR
  | PARTITIONS 
  | FORMAT = {TRADITIONAL| JSON}

dml_statement:
    SELECT statement 
  | DELETE statement
  | INSERT statement
  | REPLACE statement

```

其中，FORMAT 有 TRADITIONAL 和 JSON 两种格式，默认是 TRADITIONAL 格式，可读性更好，JSON 格式对程序解析比较友好。

先看一个简单的 SQL 执行计划格式：

```sql
obclient> EXPLAIN
    -> SELECT count(*) FROM BMSQL_ITEM \G
*************************** 1. row ***************************
Query Plan: ===============================================
|ID|OPERATOR       |NAME      |EST. ROWS|COST |
-----------------------------------------------
|0 |SCALAR GROUP BY|          |1        |78754|
|1 | TABLE SCAN    |BMSQL_ITEM|99995    |59653|
===============================================

Outputs & filters:
-------------------------------------
  0 - output([T_FUN_COUNT(*)]), filter(nil),
      group(nil), agg_func([T_FUN_COUNT(*)])
  1 - output([1]), filter(nil),
      access([BMSQL_ITEM.I_ID]), partitions(p0)

1 row in set (0.01 sec)
```

执行计划的输出展示分为两部分：

- 第一部分是用表格形式展示执行计划这棵树。每行是一个独立的操作，操作符是 OPERATOR，操作有 ID。操作展示可能会缩进。缩进表示是内部操作，可以嵌套。执行顺序遵循由内到外，由上到下。操作符支持的内容也是 SQL 引擎成熟度的一个体现。
  
  - OPERATOR：表示操作算子的名称，TABLE SCAN 是常用操作算子，表示扫描。
  
  - NAME：表示算子操作的对象。可以是表名、索引名、内部临时视图名。需要注意的是，如果扫描主键，依然展示表名。因为 OceanBase 数据库里的表和索引的本质都是索引组织表，表数据跟主键索引是一个概念。
  
  - EST. ROWS：执行当前算子输出的行数，跟统计信息有关。OceanBase 数据库里表的统计信息目前只有在集群合并的时候才更新。
  
  - COST：执行当前算子预估的成本。COST 计算比较复杂，暂时先不深入。

- 第二部分的内容跟第一部分有关，主要是描述第一部分算子的具体信息。
  
  - output：表示当前算子输出的表达式（包含列）。
  
  - filter：表示当前算子的过滤表达式，nil 表示无。如果当前算子是访问存储层，这个过滤表达式可以下推（push）。

在 OceanBase 数据库内部，这个结果是以 JSON 格式存储。示例如下：

```json
{
  "ID": 1,
  "OPERATOR": "SCALAR GROUP BY",
  "NAME": "SCALAR GROUP BY",
  "EST.ROWS": 1,
  "COST": 78754,
  "output": [
    "T_FUN_COUNT(*)"
  ],
  "CHILD_1": {
    "ID": 0,
    "OPERATOR": "TABLE SCAN",
    "NAME": "TABLE SCAN",
    "EST.ROWS": 99995,
    "COST": 59653,
    "output": [
      "1"
    ]
  }
}
```

该 JSON 内容描述的是一个树，对普通用户可读性不好。

## **实际执行计划**

我们可以通过如下命令查看 SQL 实际执行计划，查看 SQL 的实际执行计划要求 SQL 被执行过。

运行下面两个 SQL，查看 SQL 审计视图，获取执行节点和 PLAN_ID 信息。

```sql
select o.o_w_id , o.o_d_id ,o.o_id , i.i_name ,i.i_price ,o.o_c_id  from bmsql_oorder o , bmsql_item i  where o.o_id = i.i_id  and o.o_w_id  = 3 limit 10 ;

select o.o_w_id , o.o_d_id ,o.o_id , i.i_name ,i.i_price ,o.o_c_id  from bmsql_item i , bmsql_oorder o  where o.o_id = i.i_id  and o.o_w_id  = 3 limit 10 ;

SELECT /*+ read_consistency(weak) ob_querytimeout(100000000) */ substr(usec_to_time(request_time),1,19) request_time_, s.svr_ip,  s.client_Ip, s.sid,s.tenant_id, s.tenant_name, s.user_name, s.db_name, s.query_sql, s.plan_id, s.plan_type, s.affected_rows, s.return_rows, s.ret_code, s.event, s.elapsed_time, s.queue_time, s.execute_time
FROM oceanbase.gv$ob_sql_audit s
WHERE 1=1  and s.tenant_id = 1002
 and user_name='u_tpcc' and query_sql like 'select o.o_w_id%'
 and request_time >= time_to_usec(date_sub(CURRENT_TIMESTAMP, interval 5 minute ))
ORDER BY request_time DESC
LIMIT 10 \G

# 输出：

*************************** 1. row ***************************
request_time_: 2021-10-05 11:24:50
       svr_ip: x.x.x.x
    client_Ip: x.x.x.x
          sid: 3221668666
    tenant_id: 1002
  tenant_name: obmysql
    user_name: u_tpcc
      db_name: tpccdb
    query_sql: select o.o_w_id , o.o_d_id ,o.o_id , i.i_name ,i.i_price ,o.o_c_id  from bmsql_item i , bmsql_oorder o  where o.o_id = i.i_id  and o.o_w_id  = 3 limit 10
      plan_id: 3305
    plan_type: 3
affected_rows: 0
  return_rows: 10
     ret_code: 0
        event: default condition wait
 elapsed_time: 20058
   queue_time: 73
 execute_time: 19726
*************************** 2. row ***************************
request_time_: 2021-10-05 11:24:46
       svr_ip: x.x.x.x
    client_Ip: x.x.x.x
          sid: 3222238517
    tenant_id: 1002
  tenant_name: obmysql
    user_name: u_tpcc
      db_name: tpccdb
    query_sql: select o.o_w_id , o.o_d_id ,o.o_id , i.i_name ,i.i_price ,o.o_c_id  from bmsql_oorder o , bmsql_item i  where o.o_id = i.i_id  and o.o_w_id  = 3 limit 10
      plan_id: 273
    plan_type: 3
affected_rows: 0
  return_rows: 10
     ret_code: 0
        event: system internal wait
 elapsed_time: 141562
   queue_time: 48
 execute_time: 139714
2 rows in set (0.119 sec)
```

其中 tenant_id、svr_ip、svr_port 和 plan_id 列信息很重要。查看视图 gv$ob_plan_cache_plan_explain 需要这些字段信息。

如果是在网页上，且以上输出结果格式化正确，对比 2 个 SQL 的实际执行计划可以看出分别是对那个表进行远程访问。

除了通过 SQL 审计视图定位具体的 SQL 及其执行计划外，还可以通过查看缓存的执行计划汇总视图 gv$ob_plan_cache_plan_stat。

```sql
SELECT s.tenant_id, svr_ip,plan_Id,sql_id,TYPE, query_sql, first_load_time, avg_exe_usec, slow_count,executions, slowest_exe_usec,s.outline_id
FROM oceanbase.`gv$ob_plan_cache_plan_stat` s  
WHERE s.tenant_id = 1002   -- 改成具体的 tenant_id
ORDER BY avg_exe_usec desc limit 10
;
```

从这个视图里可以看到全局的 SQL 执行汇总。适合找 TOP N 慢 SQL。根据里面的节点信息、SQLID 和 PLANID 信息，既可以到 SQL 审计视图里定位具体的 SQL 信息，也可以查看实际运行的执行计划信息。

执行计划可以清空，命令如下：

```sql
ALTER SYSTEM flush plan cache GLOBAL;
```

仅用于测试环境研究，生产环境的 SQL 执行计划缓存通常不可随便清空。清空执行计划会导致所有 SQL 要重新进行一次硬解析。

## **常见执行计划算子**

**TABLE GET**

表示主键直接等值访问，后面接表名。OceanBase 数据库里主键就是表数据。

**TABLE SCAN**

表示全表扫描、主键扫描或索引扫描。具体需根据该执行计划算子后面的操作对象名是表还是索引判断。

> **注意**
>
> 主键扫描时执行计划算子后面跟的操作对象也是表名。

**TOP-N SORT**

常用的场景排序后可能只返回最大或最小的前 N 条记录。

**NESTED-LOOP JOIN**

这个算法的整体性能取决于外部表返回的记录数（循环的次数）和内部表的查询性能。

个人经验是小表作为外部表，大表作为内部表。不过实际并不是按照表的大小区分，而是由过滤条件应用后的结果集大小来定。可以对比下面 SQL 的执行计划。

**MERGE JOIN**

MERGE JOIN 主要用于两个不是很小或很大的结果集的连接，它们没有有效的过滤条件或者这个条件上没有合适的索引。

MERGE JOIN 算法基本分两大阶段：

- 排序，将两个结果集分别按连接字段排序。

- 合并，分别从两个结果集里读取记录，进行比较、遍历等。

如果结果集本来就是有序的，那么第一阶段可以优化。MERGE JOIN 可以用于等值运算，也可以用于不等值运算（小于、大于、小于等于、大于等于）。

MERGE JOIN 主要利用数据主键或者索引的有序，此时它的性能有可能会更好。数据量非常大的时候，MERGE JOIN 性能并不是很好，要设法规避。

**HASH JOIN**

HASH JOIN 用于两个比较大的结果集之间的连接，通常没有比较好的过滤条件或者过滤条件上没有索引。

> **说明**
>
> - HASH JOIN 也分外部表和内部表，内部表是 probe table，外部表是 hash table。通常数据库会挑选结果集相对小的表作为外部表，并在连接条件上用哈希函数构建 hash table，然后循环遍历 probe table，对连接条件列用哈希函数，探测是否在 hash table 中存在，如果存在，则返回匹配的记录。该算子和 NESTED-LOOP JOIN 很类似，不同之处是 HASH JOIN 会在连接条件列上用哈希函数，并在内存中构建 hash table。
>
> - OceanBase 优化器一次能构建的最大 hash table 受内部参数（_hash_table_size）限制。如果外部表的结果集比这个大，就需要分多次构建 hash table，这个也叫 multiple pass，会涉及到一些内存和文件数据交换，以及多次哈希探测，性能相对会下降一些。
>
> - HASH JOIN 的细节比较复杂，此处不详细讨论。目前只要能识别出 HASH JOIN，以及掌握产生后如何规避 HASH JOIN 算法。

**SUBPLAN SCAN 和 COUNT**

算子 SUBPLAN SCAN 跟 TABLE SCAN 类似，不同的是：

- SUBPLAN SCAN 是从视图（包括内部临时生成的）里读取数据。

- TABLE SCAN 是从基表（或者索引）里扫描数据。

**EXCHANGE IN|OUT REMOTE**

首先看要访问表的主副本节点，然后直连另外一个节点。人为构造一个远程执行计划。

> **说明**
>
> Exchange 算子是分布式场景下，用于线程间进行数据交互的算子。它一般成对出现，数据源端有一个 out 算子，目的端会有一个 in 算子。

实际上业务都是通过 OBProxy 连接，能正确路由到 OBServer 节点上，很大程度规避了远程执行计划，不过并不能从根本上避免。后面还会举例说明。
