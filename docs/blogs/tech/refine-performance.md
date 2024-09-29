---
slug: refine-performance
title: "How We Approach Improving Distributed Query Performance"
---

> **Wang Guoping | Senior Technical Expert of OceanBase**

> Wang is the technical director of the OceanBase Database SQL engine. He joined OceanBase in 2016 and is responsible for the R&D of the SQL engine. He graduated from Harbin Institute of Technology in 2008 and received his PhD from National University of Singapore in 2014. His main research direction during his PhD was multi-query optimization and processing in the database field. Before joining OceanBase, he was responsible for database R&D in Huawei.

Performance is one of the important metrics for measuring a database system and also a major concern in the database system field. OceanBase Database V3.x provides a relatively sound optimizer engine, standalone execution engine, parallel execution engine, and vectorized execution engine. In May 2021, OceanBase Database V3.x ran the TPC-H benchmark and ranked first in the 30,000 GB Results list. It achieved a result of 15.26 million QphH@30,000 GB, which showcases its core performance. OceanBase Database has proved its distributed query performance and linear scalability by running this benchmark.

<!-- truncate -->

During massive application of OceanBase Database V3.x, performance issues still occur in some business scenarios. For example, non-optimal execution plans are generated in specific distributed scenarios, the execution engine has no tolerance for non-optimal execution plans, and parallel execution threads cannot be fully used to speed up queries in specific scenarios. To address these issues, when we started to design OceanBase Database V4.0, we thought about how to optimize the SQL engine to improve the distributed query performance. **The distributed query optimization and distributed execution engine** fundamentally determine the distributed query performance of the SQL engine. Let's talk about our thoughts from these two aspects.

**How does OceanBase Database V4.0 perform distributed query optimization?**

As we all know, query optimization is the focus and difficulty in database kernel development, and also the key point that determines the database query performance. Query optimization aims to select the optimal execution plan for each SQL statement. Generally, an SQL statement has many equivalent execution plans whose performance may vary by orders of magnitude. Therefore, query optimization fundamentally determines the query performance. OceanBase Database is a distributed relational database system, which means it inherently needs to perform distributed query optimization. In a relational database system, query optimization is always difficult in development. Distributed query optimization raises the level of the difficulty. Next, let's talk about the challenges in distributed query optimization compared with standalone query optimization.

**▋ Challenges in distributed query optimization**

**Significantly expanded plan enumeration space**

In query optimization, the optimizer needs to select an implementation method for each operator in an execution plan. In a standalone scenario, the optimizer only needs to consider the implementation of the operator on a single server. In a distributed scenario, the optimizer also needs to consider the distributed implementation of the operator. For example, in a standalone scenario, the implementation methods for a join operator include hash join, merge join, and nested loop join. In a distributed scenario, the implementation methods include partition-wise join, partial partition-wise join, hash-hash distribution join, and broadcast distribution join. When these distributed implementation methods are combined with standalone implementation methods, the plan enumeration space for distributed query optimization will be significantly expanded, posing challenges for the optimization.

**More physical attributes to be maintained**

In standalone query optimization, operator order is a very important physical attribute. The operator order may be used to speed up subsequent operators. The operator order determines whether tuples in the database are output based on a specific order after the operator is executed. For example, tuples are output in the order of (a,b,c) after the index (a,b,c) is scanned, because OceanBase Database preserves the order during index scan. The operator order is related to the implementation of specific operators. It may even affect the cost of subsequent operators. Therefore, after each operator is executed, query optimization will maintain the physical attribute "order", and execution plans with a useful order will be retained during plan pruning.

In distributed query optimization, another physical attribute is partition information. Partition information mainly includes the data partitioning method and the physical location of each partition. Partition information fundamentally determines the distributed algorithm selected for an operator. For example, whether a join can be implemented as a partition-wise join depends on the join key and the table partition information. As partition information can also affect the cost of subsequent operators, the physical attribute "partition information" also needs to be maintained during distributed query optimization. Partition information maintenance will finally affect plan pruning and selection and increase the complexity in distributed query optimization.

**More accurate distributed cost model**

In query optimization, cost is the standard to evaluate an execution plan. Generally, cost represents the execution time of an execution plan or the amount of database system resources, such as CPU, I/O, and network resources, occupied by the execution plan. In a standalone scenario, the cost model needs to consider only the CPU and I/O costs. In a distributed scenario, apart from CPU and I/O costs, the cost model also needs to consider the network transmission cost, degree of parallelism (DOP) for queries, and cost in specific distributed optimization scenarios such as cost calculation for a Bloom filter. These factors increase the complexity in the design and fitting of a distributed cost model, as well as the complexity in distributed query optimization to some extent.

**▋ Two-phase distributed query optimization in OceanBase Database V3.x**

To decrease the complexity caused by distributed query optimization, OceanBase Database V3.x adopts two-phase distributed query optimization, which is a common solution in the industry.

In the first phase, based on the assumption that all tables are stored on the local server, the optimizer selects a local optimal execution plan by using the existing standalone query optimization capabilities.

In the second phase, based on the fixed join order and local algorithms, the optimizer selects a distributed algorithm for each operator by using a simple distributed cost model.

The following figure shows an example of two-phase distributed query optimization for query Q1. In the first phase, the optimizer selects a local optimal execution plan shown by the chart on the left. MJ represents merge join, HJ represents hash join, and HGBY represents hash group by, which are local algorithms. In the second phase, based on the fixed join order and local algorithms, the optimizer selects a distributed algorithm for each operator by using a simple distributed cost model. In this example, the partition-wise join algorithm is selected for the MJ node, and the hash-hash distribution join algorithm is selected for the HJ node.

```SQL
create table R1(a int primary key, b int, c int, d int) partition by hash(a) partitions 4;
create table R2(a int primary key, b int, c int, d int) partition by hash(a) partitions 4;
create table R3(a int primary key, b int, c int, d int) partition by hash(b) partitions 5;
select R2.c, sum(R3.d) from R1, R2, R3 where R1.a = R2.a and R2.C = R3.C group by R2.C;
```

![](https://gw.alipayobjects.com/zos/oceanbase/195f8d40-74bd-4522-9c2b-531c29387a8a/image/2022-11-30/330988c9-f643-4c4b-af39-50584f9b99e0.png)

Two-phase distributed query optimization significantly decreases the optimization complexity. However, during massive commercial use of OceanBase Database V3.x, the optimization effects of two-phase distributed query optimization are sometimes not as expected due to the following reasons:

**A non-optimal local algorithm is selected when partition information is ignored**

During two-phase distributed query optimization, if partition information is ignored in the first phase, a non-optimal local algorithm will generally be selected. The following figure shows a query Q2 and its execution plan in the first phase. During local optimization in the first phase, if the selectivity of predicate `R1.c = 100` is low, a few rows in the R1 table meet this condition. In this case, the optimizer will select a nested loop join for this query. Specifically, for each row in the R1 table that meets the condition, data that meets the condition is quickly obtained from the R2 table based on the index `idx`. In actual execution however, the execution time of the nested loop join is much longer than that estimated by the optimizer. This is because R2 is a partitioned table with 100 partitions and the operation performed for each row in the R1 table must be performed in each partition in the R2 table during the nested loop join, which increases the execution time by 100 times. In this case, the optimal plan may be a hash join rather than a nested loop join. In this scenario, partition information is not considered during the optimization in the first phase. As a result, the standalone costs of operators are incorrectly estimated in the first phase, and a non-optimal local algorithm is selected for the query.

```SQL
create table R1(a int primary key, b int, c int);
create table R2(a int primary key, b int, c int, index idx(b)) partition by hash(a) partitions 100;
Q2: select * from R1, R2 where R2.b = R1.b and R1.c = 100;
/* Execution plan for the first phase*/
| =============================================
|ID|OPERATOR        |NAME   |EST. ROWS|COST |
---------------------------------------------
|0 |NESTED-LOOP JOIN|       |970299   |85622|
|1 | TABLE SCAN     |r1     |990      |40790|
|2 | TABLE SCAN     |r2(idx)|1        |44   |
=============================================

Outputs & filters:
-------------------------------------
    0 - output([r1.a], [r1.b], [r1.c], [r2.a], [r2.b], [r2.c]), filter(nil),
        conds(nil), nl_params_([r1.b])
    1 - output([r1.b], [r1.c], [r1.a]), filter([r1.c = 100]),
        access([r1.b], [r1.c], [r1.a]), partitions(p0)
    2 - output([r2.b], [r2.a], [r2.c]), filter(nil),
        access([r2.b], [r2.a], [r2.c]), partitions(p0)
```

**A non-optimal join order is selected when partition information is ignored**

During two-phase distributed query optimization, if partition information is ignored in the first phase, a non-optimal join order will generally be selected. The following figure shows a query Q3 and two groups of local plans and distributed plans generated for it. In the first group, the join order is ((R2, R3), R1). In the second group, the join order is ((R1, R2), R3). If partition information is not considered, the optimizer may select the ((R2, R3), R1) join order in the first phase. However, this join order may incur more network transmission costs in the second phase. As shown in the following figure, the tables R1, R2, and R3, as well as the join results of R2 and R3, all need to be transmitted over the network. ((R1,R2), R3) may be a better join order. This is because in the second phase, only R3 and the join results of R1 and R2 need to be transmitted. Since a partition-wise join can be performed on R1 and R2, the two tables do not need to be transmitted over the network. In business scenarios, it is common that an inappropriate join order is selected due to the ignorance of partition information.

```SQL
create table R1(a int primary key, b int, c int, d int) partition by hash(a) partitions 4;create table R2(a int primary key, b int, c int, d int) partition by hash(a) partitions 4;create table R3(a int primary key, b int, c int, d int) partition by hash(b) partitions 5;Q3: select R2.c, sum(R3.d) from R1, R2, R3 where R1.a = R2.a and R2.b = R3.b;
```

![](https://gw.alipayobjects.com/zos/oceanbase/3fd34d2d-e5c4-4a01-a393-3b0e3808221d/image/2022-11-30/2c02e366-d102-488a-b179-42ea1f8c3779.png)

In the foregoing two scenarios, a non-optimal join order and a non-optimal local algorithm are selected because partition information is not considered during optimization in the first phase. Through the two scenarios, we can see that the drawbacks of two-phase distributed query optimization are obvious. Next, let's talk about how OceanBase Database V4.0 performs distributed query optimization to resolve these issues.

**▋ Distributed query optimization in OceanBase Database V4.0**

OceanBase Database V4.0 uses the one-phase optimization method for distributed queries. In this method, the optimizer enumerates both local and distributed algorithms in the same phase and estimates the costs by using a distributed cost model. OceanBase Database V4.0 restructures the entire distributed query optimization method from two-phase optimization to one-phase optimization.

To facilitate understanding of the one-phase distributed query optimization method, I first want to introduce the bottom-up dynamic programming method in System-R. Given an SQL statement, System-R uses the bottom-up dynamic programming method to enumerate joins and select a join algorithm. For a join that involves N tables, this method will enumerate execution plans for each subset by size. For each enumeration subset, the method will select an optimal plan as follows:

- Enumerate all standalone join algorithms, maintain the physical attribute "order", and calculate the costs based on a standalone cost model.
- Retain the plan with the lowest cost and those with a useful order. The order in a plan is useful when and only when this order is useful for the allocation of subsequent operators.

The following figure shows an example of plan enumeration for a join that involves four tables. The method will first enumerate plans for all size 1 base tables. For each base table, the method will enumerate all indexes and retain plans with the lowest cost and a useful order. Then, the method will enumerate plans for each size 2 subset. For example, to enumerate all execution plans for the join of `{R1,R2}`, the method will consider all standalone join algorithms and combine them with all plans retained for R1 and R2. The method will continue enumeration until execution plans are enumerated for the size 4 subset.

![](https://gw.alipayobjects.com/zos/oceanbase/672dc990-54a7-4231-bdab-bb05ab03beff/image/2022-11-30/87ee8003-c9b5-46bb-83c2-52abd3a3eb8c.png)

Based on the standalone query optimization method of System-R, OceanBase Database V4.0 implements distributed query optimization as follows:

1\. For each enumeration subset, OceanBase Database will enumerate the distributed algorithms of all operators, use a distributed cost model to calculate the cost of each distributed algorithm, and maintain two physical attributes: order and partition information.

2\. For each enumeration subset, OceanBase Database will retain the plan with the lowest cost, plans with a useful order, and plans with useful partition information. Partition information is useful when and only when it is useful for subsequent operators. In the scenario shown in the following figure, plan P1 uses a hash-hash distribution join, and plan P2 uses a broadcast distribution join for the R2 table. Though P2 has a higher cost than P1, P2 inherits the partition information of the R1 table, which will be useful for the subsequent group by operator. Therefore, P2 will also be retained.

```SQL
create table R1(a int primary key, b int, c int, d int) partition by hash(a) partitions 4;
create table R2(a int primary key, b int, c int, d int) partition by hash(a) partitions 4;
select R1.a, SUM(R2.c) from R1, R2 where R1.b = R2.b group by R1.a;
```

![](https://gw.alipayobjects.com/zos/oceanbase/ceb3befd-0018-4a05-8f26-cc0bdb4ce341/image/2022-11-30/0a41f314-f6a5-41f1-913d-c6b230dd0f25.png)

OceanBase Database V4.0 uses the one-phase distributed query optimization method, which involves a much larger plan space than standalone query optimization. Facing the issue of a large plan space, OceanBase Database V4.0 provides a variety of methods for quick plan pruning. It also provides new join enumeration algorithms to support distributed plan enumeration for ultra-large tables. Thanks to these techniques, OceanBase Database V4.0 effectively reduces the distributed plan space and improves the distributed query optimization performance. Our experimental results also show that OceanBase Database V4.0 can enumerate distributed plans for 50 tables within seconds.

**How does OceanBase Database V4.0 improve the performance of the distributed execution engine?**

Compared with OceanBase Database V3.x, OceanBase Database V4.0 has made many improvements in the execution engine. It has implemented new distributed and standalone algorithms, such as null-aware hash anti-join, shared broadcast hash join, hash-based window function, and partition bloom filter. It has also improved the implementation of the entire vectorized engine, developed ultimate parallel pushdown techniques, and initiated the development of adaptive techniques. These efforts have greatly improved the performance of both distributed and standalone queries. Here I want to introduce the adaptive techniques and parallel pushdown techniques of OceanBase Database V4.0.

**▋ Development towards an adaptive execution engine**

In business scenarios of OceanBase Database, we found that the execution engine has no tolerance for non-optimal execution plans generated by the optimizer. When the optimizer generates non-optimal execution plans, the execution engine cannot adjust the plans to improve the execution performance. Although the optimizer is designed to choose the optimal execution plans for database queries, the optimizer itself is not perfect. For example, it cannot accurately estimate the total number of rows. So, the optimizer may pick a less optimal execution plan, or even a lousy one.

To resolve this issue, OceanBase Database V4.0 starts to develop an adaptive execution engine. An adaptive execution engine identifies some non-optimal execution plans based on the real-time execution status and adjusts them accordingly to improve the execution performance. We believe that once an execution engine reaches a certain stage of development, it must use adaptive techniques to address the issue of non-optimal execution plans generated by the optimizer. However, we also do not believe that adaptive techniques can handle all scenarios of non-optimal plans.

OceanBase Database V4.0 implements adaptive GROUP BY/DISTINCT parallel pushdown, which can prevent performance downgrade caused by non-optimal plans in GROUP BY/DISTINCT parallel pushdown scenarios. Before we dive into adaptive techniques, let me briefly introduce the GROUP BY/DISTINCT parallel pushdown technique. As a general technique in distributed execution, GROUP BY/DISTINCT parallel pushdown is often used to push down the GROUP BY operator in advance to pre-aggregate some data. This reduces the workload of network transmission, thus improving the performance. The following figure shows an example where the execution plan pushes down the GROUP BY operator to Operator 5 for data pre-aggregation, so that the network transmission workload of Operator 4 is reduced to achieve higher performance. However, note that GROUP BY parallel pushdown does not necessarily improve the performance. It sometimes backfires, mainly because it consumes extra computing resources. GROUP BY parallel pushdown brings benefits only when the performance improvement in network transmission surpasses the extra computing cost.

```SQL
create table R1(a int primary key, b int, c int) partition by hash(a) partitions 4;
explain select b, sum(c) from R1 group by b;
| ==========================================================
|ID|OPERATOR                     |NAME    |EST. ROWS|COST|
----------------------------------------------------------
|0 |PX COORDINATOR               |        |1        |10  |
|1 | EXCHANGE OUT DISTR          |:EX10001|1        |10  |
|2 |  HASH GROUP BY              |        |1        |9   |
|3 |   EXCHANGE IN DISTR         |        |1        |9   |
|4 |    EXCHANGE OUT DISTR (HASH)|:EX10000|1        |8   |
|5 |     HASH GROUP BY           |        |1        |8   |
|6 |      PX PARTITION ITERATOR  |        |1        |7   |
|7 |       TABLE SCAN            |r1      |1        |7   |
==========================================================

Outputs & filters:
-------------------------------------
    0 - output([INTERNAL_FUNCTION(r1.b, T_FUN_SUM(T_FUN_SUM(r1.c)))]), filter(nil), rowset=256
    1 - output([INTERNAL_FUNCTION(r1.b, T_FUN_SUM(T_FUN_SUM(r1.c)))]), filter(nil), rowset=256, dop=1
    2 - output([r1.b], [T_FUN_SUM(T_FUN_SUM(r1.c))]), filter(nil), rowset=256,
        group([r1.b]), agg_func([T_FUN_SUM(T_FUN_SUM(r1.c))])
    3 - output([r1.b], [T_FUN_SUM(r1.c)]), filter(nil), rowset=256
    4 - (#keys=1, [r1.b]), output([r1.b], [T_FUN_SUM(r1.c)]), filter(nil), rowset=256, dop=1
    5 - output([r1.b], [T_FUN_SUM(r1.c)]), filter(nil), rowset=256,
        group([r1.b]), agg_func([T_FUN_SUM(r1.c)])
    6 - output([r1.b], [r1.c]), filter(nil), rowset=256
    7 - output([r1.b], [r1.c]), filter(nil), rowset=256,
        access([r1.b], [r1.c]), partitions(p[0-3])
```

In OceanBase Database of earlier versions, the optimizer determines whether to push down the GROUP BY operator based on cost estimation. However, the optimizer may sometimes incorrectly estimate the number of rows. As a result, the GROUP BY operator is not pushed down or is incorrectly pushed down, compromising the execution performance. To resolve this issue, OceanBase Database V4.0 introduces adaptive GROUP BY/DISTINCT parallel pushdown. The optimizer will always push down the GROUP BY/DISTINCT operator and determine whether to skip the pushed down GROUP BY/DISTINCT operator by sampling part of the data of the operator during execution. The challenge of this technique lies in how to make the pushed operator achieve satisfactory pre-aggregation performance. The OceanBase Database solution is to control the performance of the hash table of the pushed operator by limiting the table within the L3 cache and perform multiple rounds of sampling to prevent misjudgment due to continuous non-aggregation of data. The key points of the solution are described as follows:

- The execution engine limits the hash table within L2 cache (1 MB) and, in the case of unsatisfactory pre-aggregation performance, marks the hash table as discarded. If the pre-aggregation performance is good, the execution engine expands the hash table to L3 cache (10 MB) and, if more memory is needed during the execution, marks the hash table as discarded.
- If the hash table is discarded, the execution engine returns and releases all rows of the table, and then rebuilds the hash table to start the next round of sampling.
- If pre-aggregation fails to achieve satisfactory performance in five consecutive rounds of sampling, the execution engine skips the pushed GROUP BY operator.

Compared with the execution without operator pushdown, adaptive GROUP BY/DISTINCT parallel pushdown involves extra overhead for sampling and computing, which are required to determine whether to skip the pushed down operator during the execution. However, our tests based on various data distribution modes indicate that the extra overhead can be kept within 10%, which is much lower than the performance gain.

We are also working on more adaptive techniques, such as the adaptive creation and detection of Bloom filters, adaptive tuning of nested loop join and hash join, and adaptive tuning of broadcast distribution join and hash-hash distribution join. We believe that these adaptive techniques can elevate the capabilities of the execution engine to a new level, making the execution engine more robust. This way, when the optimizer generates a non-optimal or lousy execution plan, the execution engine can adjust the plan to improve the query performance.

**▋ Development towards ultimate parallel pushdown**

Parallel pushdown in the execution of distributed queries is a technique where the computing of some operators is pushed down to improve performance. Generally, this technique improves the performance of distributed queries by performing executions at the maximum DOP or reducing network transmission. It significantly improves the performance of distributed queries by orders of magnitude in many cases. The GROUP BY/DISTINCT parallel pushdown technique described in the previous section is a typical example of parallel pushdown techniques. Compared with OceanBase Database V3.x, OceanBase Database V4.0 provides well-developed parallel pushdown techniques, which work on almost all operators in AP scenarios, such as GROUP BY, ROLLUP, and DISTINCT, and window functions.

The following table compares OceanBase Database V3.x and OceanBase Database V4.0 in parallel pushdown.

![](https://gw.alipayobjects.com/zos/oceanbase/dbcb3231-5893-43b1-8456-7c969894bf31/image/2022-11-30/8ae0d7fe-c66c-491d-ae63-c70899cad4b3.png)

**Pushdown scenario** **Example V3.x V4.0**GROUP BY, without a DISTINCT aggregate function select a, sum(d) from t group by a; Supported Supported GROUP BY, with a DISTINCT aggregate function select a, sum(distinct c),count(distinct d) from t group by a;Not supported Supported ROLLUP select a, sum(d) from t group by a rollup(b);Not supported Supported DISTINCT select distinct a from t; Supported Supported Window Function select a, b, sum(d) over (partition by c) from t; Not supported Supported

In OceanBase Database V4.0, the implementation of parallel pushdown varies based on operators. Due to the complexity in parallel execution, each implementation is confronted with different challenges. Here we won't introduce each implementation of parallel pushdown. Let's talk about the three-phase parallel pushdown technique for DISTINCT aggregate functions, to illustrate the advantages of parallel pushdown. The following figure shows a query Q1 that contains two DISTINCT aggregate functions. In OceanBase Database V3.x, parallel pushdown cannot be performed for Q1. The execution plan of Q1 shows that all deduplication logic and aggregate logic are calculated by Operator 0, which does not support parallel execution, leading to poor overall execution performance.

```SQL
create table R1(a int, b int, c int, d int, primary key(a,b)) partition by hash(b) partitions 4;
Q1: select sum(distinct c), sum(distinct d) from R1 where a = 5;
| =====================================================
|ID|OPERATOR                |NAME    |EST. ROWS|COST|
-----------------------------------------------------
|0 |SCALAR GROUP BY         |        |1        |2365|
|1 | PX COORDINATOR         |        |3960     |2122|
|2 |  EXCHANGE OUT DISTR    |:EX10000|3960     |1532|
|3 |   PX PARTITION ITERATOR|        |3960     |1532|
|4 |    TABLE SCAN          |r1      |3960     |1532|
=====================================================

Outputs & filters:
-------------------------------------
    0 - output([T_FUN_SUM(distinct r1.c)], [T_FUN_SUM(distinct r1.d)]), filter(nil),
        group(nil), agg_func([T_FUN_SUM(distinct r1.c)], [T_FUN_SUM(distinct r1.d)])
    1 - output([r1.c], [r1.d]), filter(nil)
    2 - output([r1.c], [r1.d]), filter(nil), dop=1
    3 - output([r1.c], [r1.d]), filter(nil)
    4 - output([r1.c], [r1.d]), filter(nil),
        access([r1.c], [r1.d]), partitions(p[0-3])
```

To improve the distributed execution performance of a query that uses a DISTINCT aggregate function, OceanBase Database V4.0 introduces the three-phase parallel pushdown logic. The following figure shows the three-phase parallel pushdown logic for a query that uses a DISTINCT aggregate function. The details are as follows:

**In the first phase**, the DISTINCT logic is pushed down for partial deduplication. In this example, the job in this phase is completed by Operator 6.

**In the second phase**, data is repartitioned based on the deduplicated column, and then full deduplication and partial pre-aggregation calculation are performed. In this example, the job in this phase is completed by Operators 3, 4, and 5.

**In the third phase**, the results obtained in the second phase are aggregated. In this example, the job in this phase is completed by Operators 0, 1, and 2.

Compared to the execution without operator pushdown, the three-phase parallel pushdown technique has two performance benefits. First, it allows data deduplication and pre-aggregation at the maximum DOP. Second, data deduplication by using the DISTINCT pushdown technique reduces the workload of network transmission.

```SQL
create table R1(a int, b int, c int, d int, primary key(a,b)) partition by hash(b) partitions 4;
select sum(distinct c) from R1 where a = 5;
| ===========================================================
|ID|OPERATOR                      |NAME    |EST. ROWS|COST|
-----------------------------------------------------------
|0 |SCALAR GROUP BY               |        |1        |1986|
|1 | PX COORDINATOR               |        |1        |1835|
|2 |  EXCHANGE OUT DISTR          |:EX10001|1        |1835|
|3 |   MERGE GROUP BY             |        |1        |1835|
|4 |    EXCHANGE IN DISTR         |        |1        |1683|
|5 |     EXCHANGE OUT DISTR (HASH)|:EX10000|1        |1683|
|6 |      HASH GROUP BY           |        |1        |1683|
|7 |       PX PARTITION ITERATOR  |        |3960     |1532|
|8 |        TABLE SCAN            |r1      |3960     |1532|
===========================================================

Outputs & filters:
-------------------------------------
    0 - output([T_FUN_SUM(T_FUN_SUM(distinct r1.c))]), filter(nil),
        group(nil), agg_func([T_FUN_SUM(T_FUN_SUM(distinct r1.c))])
    1 - output([T_FUN_SUM(distinct r1.c)]), filter(nil)
    2 - output([T_FUN_SUM(distinct r1.c)]), filter(nil), dop=1
    3 - output([T_FUN_SUM(distinct r1.c)]), filter(nil),
        group(nil), agg_func([T_FUN_SUM(distinct r1.c)])
    4 - output([r1.c]), filter(nil)
    5 - (#keys=1, [r1.c]), output([r1.c]), filter(nil), dop=1
    6 - output([r1.c]), filter(nil),
        group([r1.c]), agg_func(nil)
    7 - output([r1.c]), filter(nil)
    8 - output([r1.c]), filter(nil),
        access([r1.c]), partitions(p[0-3]
```

The preceding example shows how the three-phase parallel pushdown technique works for a query with only one DISTINCT aggregate function. The question is, is it still effective for a query with multiple DISTINCT aggregate functions? The answer is yes. The trick is that in the first phase, we create a replica of the data set for each DISTINCT aggregate function and tag the replica to indicate its association with this aggregate function. Similar operations are performed in the second and third phases, except for some minor differences in terms of implementation. The following figure shows the three-phase pushdown logic for a query that uses two DISTINCT aggregate functions. AGGR_CODE is used to mark the redundant data generated after each DISTINCT aggregate function is calculated.

```SQL
create table R1(a int, b int, c int, d int, primary key(a,b)) partition by hash(b) partitions 4;select sum(distinct c), sum(distinct d) from R1 where a = 5;| ===========================================================|ID|OPERATOR                      |NAME    |EST. ROWS|COST|-----------------------------------------------------------|0 |SCALAR GROUP BY               |        |1        |13  ||1 | PX COORDINATOR               |        |2        |13  ||2 |  EXCHANGE OUT DISTR          |:EX10001|2        |12  ||3 |   HASH GROUP BY              |        |2        |11  ||4 |    EXCHANGE IN DISTR         |        |2        |10  ||5 |     EXCHANGE OUT DISTR (HASH)|:EX10000|2        |9   ||6 |      HASH GROUP BY           |        |2        |8   ||7 |       PX PARTITION ITERATOR  |        |1        |7   ||8 |        TABLE SCAN            |r1      |1        |7   |===========================================================Outputs & filters:-------------------------------------  0 - output([T_FUN_SUM(T_FUN_SUM(dup(r1.c)))], [T_FUN_SUM(T_FUN_SUM(dup(r1.d)))]), filter(nil), rowset=256,      group(nil), agg_func([T_FUN_SUM(T_FUN_SUM(dup(r1.c)))], [T_FUN_SUM(T_FUN_SUM(dup(r1.d)))])  1 - output([AGGR_CODE], [T_FUN_SUM(dup(r1.c))], [T_FUN_SUM(dup(r1.d))]), filter(nil), rowset=256  2 - output([AGGR_CODE], [T_FUN_SUM(dup(r1.c))], [T_FUN_SUM(dup(r1.d))]), filter(nil), rowset=256, dop=1  3 - output([AGGR_CODE], [T_FUN_SUM(dup(r1.c))], [T_FUN_SUM(dup(r1.d))]), filter(nil), rowset=256,      group([AGGR_CODE]), agg_func([T_FUN_SUM(dup(r1.c))], [T_FUN_SUM(dup(r1.d))])  4 - output([AGGR_CODE], [dup(r1.c)], [dup(r1.d)]), filter(nil), rowset=256  5 - (#keys=3, [AGGR_CODE], [dup(r1.c)], [dup(r1.d)]), output([AGGR_CODE], [dup(r1.c)], [dup(r1.d)]), filter(nil), rowset=256, dop=1  6 - output([AGGR_CODE], [dup(r1.c)], [dup(r1.d)]), filter(nil), rowset=256,      group([AGGR_CODE], [dup(r1.c)], [dup(r1.d)]), agg_func(nil)  7 - output([r1.c], [r1.d]), filter(nil), rowset=256  8 - output([r1.c], [r1.d]), filter(nil), rowset=256,      access([r1.c], [r1.d]), partitions(p[0-3])
```

Parallel pushdown is common in distributed scenarios. In OceanBase Database V3.x, the distributed query performance often deteriorates due to the imperfection of the parallel pushdown feature. OceanBase Database V4.0 can resolve such issues to improve the distributed query performance.

**Final words**

In the end, I want to share with you the actual improvements made by OceanBase Database V4.0 in distributed query performance. Compared with OceanBase Database V3.x, OceanBase Database V4.0 implements a new distributed cost model, a distributed query optimization framework, a set of well-developed parallel pushdown techniques, and adaptive techniques. The development of these techniques is driven by our understanding of customer requirements and distributed systems.

We tested the techniques by running the TPC-DS benchmark with a scale factor of 100 GB. The test results show that the new techniques significantly improve the distributed query performance. The total execution duration of 99 queries decreases from 918s to 270s. The following figure compares the performance of queries in OceanBase Database V3.x and OceanBase Database V4.0 in the TPC-DS benchmark with a scale factor of 100 GB.

![](https://gw.alipayobjects.com/zos/oceanbase/733ccee4-16e2-4058-8444-9ef9003df85c/image/2022-11-30/bb5d7618-9c57-45d6-9547-3fea3c97e651.png)

Performance comparison for the TPC-DS benchmark with a scale factor of 100 GB (OceanBase Database V3.x and V4.0)

These are our thoughts on the value and technical evolution of distributed query optimization of OceanBase Database V4.0. Databases are foundational software in essence. For software users, we hope that later OceanBase Database V4.x versions can bring better user experience and higher query performance based on distributed query optimization and technical innovations in the execution engine.

Welcome to follow [OceanBase Community](https://open.oceanbase.com/blog), where we will keep providing valuable technical content and grow together with millions of techies.

Search for 🔍 DingTalk group 33254054 or scan the following QR code to join the OceanBase technical consultation group, where you can get a solution to any technical issue.

![](https://gw.alipayobjects.com/zos/oceanbase/f4d95b17-3494-4004-8295-09ab4e649b68/image/2022-08-29/00ff7894-c260-446d-939d-f98aa6648760.png)
