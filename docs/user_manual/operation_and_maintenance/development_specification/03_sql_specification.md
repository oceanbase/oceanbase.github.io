---
title: SQL 开发规范
weight: 3
---

> 说明：
>
> 本小节内容仅供参考，只是 “推荐” 用户做的内容，并不 “强制” 用户必须遵循。大家根据真实业务需求决定是否采取这些建议即可。

## SELECT 语句开发规范

- 使用到分区表的 SQL 语句，其过滤谓词中尽量带上分区键，避免不必要的全表扫描。

- order by 查询语句中，order by 的字段建议能够保证唯一性或者组合唯一。
    - 对非唯一字段排序，由于分布式数据库与单机数据库实现方式出入较大，结果可能会出现不稳定的情况。这里的 “不稳定” 指的是，在分布式数据库中，order by c1 的结果可能是：

        |c1|c2|
        |:---:|:---:|
        |&emsp;&emsp;&emsp; 1 &emsp;&emsp;&emsp; | &emsp;&emsp;&emsp; a &emsp;&emsp;&emsp;|
        |1|b|
        |2|c|
        |2|d|

        但也可能是：
        |c1|c2|
        |:---:|:---:|
        |&emsp;&emsp;&emsp; 1 &emsp;&emsp;&emsp; | &emsp;&emsp;&emsp; b &emsp;&emsp;&emsp; |
        |1|a|
        |2|d|
        |2|c|

- 不推荐使用 in 操作。带 in 的子查询尽量改写成 join。若实在无法避免，需要仔细评估 in 后边的集合元素数量，控制在 100 个之内。

- 如无去重需求，不建议使用 ``UNION``，推荐使用 ``UNION ALL``。``UNION ALL`` 可以减少不必要的排序开销。

- <code>count(*)</code> 会统计值为 NULL 的行，而 <code>count(列名)</code> 不会统计此列为 NULL 值的行。要根据业务需求，选择合适的聚合方式。

- 不推荐使用非同类型的列进行比较或 join，可能会因为出现隐式类型转换而导致无法利用索引的问题。如无法避免，尽量通过 cast 或者 convert 等方式进行必要的显式类型转换。

- 在设置并行度的时候，最佳并行度为表的分片数，次佳并行度为使用 auto dop 自动生产的并行度。

- 不推荐读锁 `SELECT ... for update (with cs)`。如果事务较大，高并发下容易导致锁等待影响业务。

- SELECT 语句推荐指定具体的字段名称，只写必要的列。尽量不要写成 " ``SELECT * ``" 的形式，这样写有几个问题：
  - 一是可能会增加查询分析器解析成本，同时也会产生额外的 IO 成本。
  - 二是可能会造成一些不必要的索引回表动作，导致查询性能下降。
  - 三是在表中增减字段时，容易造成与上下游的 resultMap 配置不一致的问题。

## DML 语句开发规范

- INSERT 语句推荐指定具体的字段名称（column_name），不建议写成 `INSERT INTO TBL VALUES(......)` 形式。否则在表中增减字段时，容易出现一些非预期的情况。

- 语句对数据的修改效果只有在提交事务时才永久生效。单个 DML 语句也可以是一个事务，事务是否自动提交可以通过 [autocommit 系统变量](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576570)进行配置，默认是一条 DML 一个事务，并会自动提交。

- 不带条件更新的时候，数据量较大时，会有大事务产生，可能由于事务超时导致执行失败。
    - UPDATE 语句，建议使用 WHERE 条件来控制修改的行数，确保事务不要太大。
    - DELETE 语句，建议带上 WHERE 条件分批删除。或者通过 TRUNCATE TABLE 这个 DDL 删除全表数据，可以大幅提高删除数据的性能（但 TRUNCATE 是 DDL，不能放在其他事务内）。
    - 实在不行，可以通过调大相关的超时时间（[ob_query_timeout](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576515) 和 [ob_trx_timeout](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576566)），来保证大事务成功执行。

- **<font color="red">频繁通过 DML 语句插入、删除和更新的表，可能会造成 Buffer 表问题，可通过开启自适应合并或者设置 table_mode 来减缓该问题，详见：[OceanBase 官网文档](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001574524)。</font>**

## DDL 语句开发规范

- **<font color="red">建议用户了解 OceanBase 的 [Online DDL 和 Offline DDL 列表](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001577364)。Offline DDL 执行时会锁表，表上无法执行其他 DML 操作。</font>**

- DDL 操作建议在业务低峰时段进行，以降低对系统的影响。