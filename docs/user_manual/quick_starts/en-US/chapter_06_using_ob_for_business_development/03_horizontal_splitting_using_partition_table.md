---
title: Partition a table by horizontal splitting
weight: 4
---

# 6.3 Partition a table in OceanBase Database by horizontal splitting

## Partitioned tables

### Definition

In OceanBase Database, partitioning allows you to decompose a table into multiple smaller and more manageable parts called partitions based on specific rules. Each partition is an independent object with its own name and may have its own storage features. For example, the following figure shows a table that consists of five partitions, which are distributed across two servers.

![Partitioned table](/img/user_manual/quick_starts/en-US/chapter_06_using_ob_for_business_development/03_horizontal_splitting_using_partition_table/001.png)

An application that accesses a database logically accesses only one table or one index. However, the table may consist of multiple physical partitions. Each partition is an independent object and can be independently accessed or accessed as part of the table. The partitions are completely transparent to the application and do not affect the business logic of the application.

From the perspective of an application, only one schema object exists. No modification to SQL statements is required to access partitioned tables. Partitioning is useful for many types of database applications, especially those that manage large amounts of data.

### Business splitting

A common misconception about distributed databases is that the performance of a business system will become great after it is migrated to a distributed database, or the performance will be improved accordingly after a capacity scaling. For a system running on a distributed database, its performance or scalability improvement depends largely on whether the business can be split and the data partitions be distributed to more nodes to make use of these nodes.

**The advantage of a distributed database is that large tables can be split and stored on multiple nodes so that requests can be distributed to multiple nodes for processing. Access requests to a partition are handled by the node on which the partition resides**. As high-concurrency SQL requests access different partitions, they are handled by different nodes, and the total queries per second (QPS) of all nodes can be quite tremendous. In this case, adding more nodes means that the total QPS for handling SQL requests can also be improved accordingly. This is the best case in using a distributed database.

**The goal of partitioning is to distribute large amounts of data and access requests evenly to multiple nodes**. Theoretically, if each node handles data and requests evenly, 10 nodes can handle 10 times that of a single node. However, if the table is unevenly partitioned, some nodes will handle more data or requests that others, resulting in data skew, which may lead to uneven resource utilization and load among nodes. Intensively skewed data is also known as hotspot data. The straightforward method for preventing hotspot data is to randomly allocate data to different nodes. A problem is that all partitions must be scanned to find the desired data. Therefore, this method is infeasible. In practice, partitioning strategies are often defined based on certain rules, which may be business rules.

Partitioning brings the following benefits:

* Higher availability

  The unavailability of a partition does not necessarily mean that the entire table is unavailable. The query optimizer automatically removes unreferenced partitions from the query plan. Therefore, queries are not affected when the partitions are unavailable.

* Easier management of database objects

  A partitioned object has pieces that can be managed collectively or separately. DDL statements can manipulate partitions rather than entire tables or indexes. Therefore, you can decompose resource-intensive tasks such as the recreation of an index or table. For example, you can move only one partition at a time. If an issue occurs, you need only to redo the partition move rather than the table move. In addition, you can execute a `TRUNCATE` statement on a partition to avoid unnecessary deletion of a large amount data.

* Reduced contention for shared resources in online transaction processing (OLTP) systems

  In transaction processing (TP) scenarios, partitioning can reduce contention for shared resources. For example, a DML operation is performed on many partitions rather than one table.

* Enhanced data warehouse query performance

  In analytical processing (AP) scenarios, partitioning can speed up the processing of ad hoc queries. Partitioning keys can implement filtering. For example, if sales data is partitioned by sales time and you want to query the sales data of a quarter, you need to query only one or several partitions rather than the entire table.

* Better load balancing results

  OceanBase Database stores data and implements load balancing by partition. Different partitions can be stored on different OBServer nodes in an OceanBase cluster. Therefore, different partitions of a partitioned table can be distributed on different OBServer nodes so that the data of a table can be evenly distributed across the entire OceanBase cluster.

### Considerations

* Observe the following notes when you create a partitioned table:

  * If the table contains a large amount of data and the accessed data is centralized, you can create a partitioned table. We recommend that you partition a table that contains more than 10 million records. The maximum number of partitions of a table is 8,192.

  * Observe the following notes for constraints on partitioned tables.

    * When you create a partitioned table, ensure that at least one field in each primary key and unique key is a partitioning key field of the table. If the table does not have a primary key or unique key, any field can be used as the partitioning key.

    * We recommend that you use a primary key wherever possible to ensure global uniqueness in a partitioned table.

    * A unique index on a partitioned table must include a partitioning key of the table.

* We recommend that you design the partitioning strategy based on your practical use and scenarios.

  * Practical use: history table and flow table.

  * Scenarios: tables with obvious access hotspots.

* To use partitioned tables, you need to use appropriate partitioning keys and partitioning strategies.

  * `HASH` partitioning: Select a field with a high degree of distinction and the highest frequency of occurrence in the query condition as the partitioning key for `HASH` partitioning.

  * `RANGE` and `LIST` partitioning: Select an appropriate field as the partitioning key based on business rules. Ensure that the number of partitions is not too small. For example, for large log tables, you can use a time type column as a partitioning key for `RANGE` partitioning.

  * `RANGE` partitioning: We recommend that you do not set the last column to `MAXVALUE`.

  * Range queries based on partitioning keys are not suitable in `HASH` partitioning scenarios.

### Create and manage partitioned tables

Partitioning is a built-in feature of OceanBase Database. You need to specify only the partitioning strategy and the number of partitions when you create a table. The SQL queries for a partitioned table are the same as those for a regular table. OceanBase Database Proxy (ODP) or OBServer nodes of OceanBase Database automatically route SQL queries of users to the corresponding nodes. The partitioning details of a partitioned table are transparent to applications.

If you know the partition number of the data you want to read, you can run SQL queries to directly access the partition in the partitioned table. The basic syntax is as follows:

```bash
part_table partition ( p[0,1,...][sp[0,1,...]] )
```

Unless otherwise defined in a table, partitions are named based on a certain rule by default.

For example, partitions are named p0, p1, p2, and so forth, and subpartitions are named p0sp0, p0sp1, p0sp2, ..., p1sp0, p1sp1, p1sp2, and so forth.

Example: Access a specific partition and subpartition in a partitioned table.

```sql
select * from t1 partition (p0) ;

select * from t1 partition (p5sp0) ;
```

#### Create a partitioned table

OceanBase Database supports a variety of partitioning strategies:

* `RANGE` partitioning

* `RANGE COLUMNS` partitioning

* `LIST` partitioning

* `LIST COLUMNS` partitioning

* `HASH` partitioning

* `KEY` partitioning

* Composite partitioning

##### RANGE partitioning

`RANGE` partitioning maps data to partitions based on ranges of partitioning key values that you set up for each partition when you define the partitioned table. It is the most common partitioning type and is often used with dates. For example, you can partition business log tables by day, week, or month.

The basic syntax for `RANGE` partitioning is as follows:

```sql
CREATE TABLE table_name (
    column_name1        column_type
    [, column_nameN     column_type]
) PARTITION BY RANGE ( expr(column_name1) )
(
    PARTITION   p0      VALUES LESS THAN ( expr )
    [, PARTITION pN     VALUES LESS THAN (expr ) ]
 [, PARTITION pX    VALUES LESS THAN (maxvalue) ]
);
```

Rules of `RANGE` partitioning are as follows:

* In the `PARTITION BY RANGE ( expr )` clause, the result of the `expr` expression must be of the INT type.

* A `VALUES LESS THAN` clause must be specified for each partition. This clause specifies a non-inclusive upper bound for the partition. Values of the partitioning key equal to or higher than this upper bound are added to the next higher partition.

* All partitions, except the first one, have an implicit lower bound, which is the upper bound of the previous partition.

* A `MAXVALUE` literal can be defined only for the last partition. `MAXVALUE` represents a virtual infinite value that is always greater than other possible values for the partitioning key, including the NULL value.

> **Notice**
>
> You can add partitions to and delete partitions from a RANGE-partitioned table. If `MAXVALUE` is specified for the last partition in `RANGE` partitioning, you cannot add a new partition. Therefore, we recommend that you do not use `MAXVALUE` to define the last partition.

`RANGE` partitioning requires the partitioning key expression to return an integer value. To partition a table by `RANGE` based on a time column, the column must be a `TIMESTAMP` column and you must use the `UNIX_TIMESTAMP` function to convert timestamps to numeric values. This can also be implemented by `RANGE COLUMNS` partitioning, which does not require the results of the partitioning key expression to be integer values.

Here is an example:

```sql
CREATE TABLE test_range(id INT, gmt_create TIMESTAMP, info VARCHAR(20), PRIMARY KEY (gmt_create))
PARTITION BY RANGE(UNIX_TIMESTAMP(gmt_create))
(PARTITION p0 VALUES LESS THAN (UNIX_TIMESTAMP('2015-01-01 00:00:00')),
PARTITION p1 VALUES LESS THAN (UNIX_TIMESTAMP('2016-01-01 00:00:00')),
PARTITION p2 VALUES LESS THAN (UNIX_TIMESTAMP('2017-01-01 00:00:00')));
```

##### `RANGE COLUMNS` partitioning

`RANGE COLUMNS` partitioning is similar to `RANGE` partitioning. The difference lies in that `RANGE COLUMNS` partitioning supports the use of multiple columns (column vectors) as partitioning keys, and the column type of a partitioning key can be `INT` or others, such as `VARCHAR` and `DATETIME`.

The basic syntax for `RANGE COLUMNS` partitioning is as follows:

```sql
CREATE TABLE table_name (column_name column_type[, column_name column_type])
  PARTITION BY { RANGE COLUMNS(column_name [,column_name])
                }
    (
     PARTITION partition_name VALUES LESS THAN(expr)
     [, PARTITION partition_name VALUES LESS THAN (expr )...]
     [, PARTITION partition_name VALUES LESS THAN (MAXVALUE)]
     );
```

Differences between `RANGE COLUMNS` and `RANGE` partitioning are as follows:

* The partitioning key for `RANGE COLUMNS` partitioning does not have to be of the INT type. It can be of any data type.

* The partitioning key for `RANGE COLUMNS` partitioning cannot be an expression.

* The partitioning key for `RANGE COLUMNS` partitioning can be a vector.

Here is an example:

```sql
CREATE TABLE tbl1_log_rc (log_id BIGINT NOT NULL,log_value VARCHAR(50),log_date DATE NOT NULL)
       PARTITION BY RANGE COLUMNS(log_date) 
        (PARTITION M202001 VALUES LESS THAN('2020/02/01')
       , PARTITION M202002 VALUES LESS THAN('2020/03/01')
       , PARTITION M202003 VALUES LESS THAN('2020/04/01')
       , PARTITION M202004 VALUES LESS THAN('2020/05/01')
       , PARTITION M202005 VALUES LESS THAN('2020/06/01')
       , PARTITION M202006 VALUES LESS THAN('2020/07/01')
       , PARTITION M202007 VALUES LESS THAN('2020/08/01')
       , PARTITION M202008 VALUES LESS THAN('2020/09/01')
       , PARTITION M202009 VALUES LESS THAN('2020/10/01')
       , PARTITION M202010 VALUES LESS THAN('2020/11/01')
       , PARTITION M202011 VALUES LESS THAN('2020/12/01')
       , PARTITION M202012 VALUES LESS THAN('2021/01/01')
       , PARTITION MMAX VALUES LESS THAN MAXVALUE
        );
Query OK, 0 rows affected
```

##### LIST partitioning

`List` partitioning is implemented based on the values of an enumerated type. It is useful for enumerated types.

Unlike `RANGE` partitioning or `HASH` partitioning, `LIST` partitioning enables you to explicitly control how rows map to partitions by specifying a list of discrete values for the partitioning key in the description for each partition. The advantage of `LIST` partitioning is that you can partition unordered and unrelated data.

The basic syntax for `LIST` partitioning is as follows:

```sql
CREATE TABLE table_name (column_name column_type[,column_name column_type])
  PARTITION BY { LIST ( expr(column_name) | column_name )
                }
    (PARTITION partition_name VALUES IN ( v01 [, v0N])
     [,PARTITION partition_name VALUES IN ( vN1 [, vNN])]
     [,PARTITION partition_name VALUES IN (DEFAULT)]
    );
```

Rules of `LIST` partitioning are as follows:

* In `LIST` partitioning, the partitioning key can be a column name or an expression. However, the data type of the partitioning key must be INT, and the return type of the expression must be INT.

* The partitioning expression can reference only one column, instead of a list of multiple columns (column vectors). For example, `partition by list (c1, c2)` is not allowed.

Here is an example:

```sql
CREATE TABLE tbl1_l (col1 BIGINT PRIMARY KEY,col2 VARCHAR(50))
       PARTITION BY LIST(col1) 
        (PARTITION p0 VALUES IN (1, 2, 3),
         PARTITION p1 VALUES IN (5, 6),
         PARTITION p2 VALUES IN (DEFAULT)
        );
Query OK, 0 rows affected
```

##### LIST COLUMNS partitioning

`LIST COLUMNS` partitioning is a variant of `LIST` partitioning. During `LIST COLUMNS` partitioning, you can specify multiple partitioning keys. The partitioning keys can be of the following data types: INT, DATE, and DATETIME.

If you want to use multiple columns or a column of other data types as the partitioning key, you can choose `LIST COLUMNS` partitioning.

The basic syntax for `LIST COLUMNS` partitioning is as follows:

```sql
CREATE TABLE table_name (column_name column_type[,column_name column_type])
  PARTITION BY { LIST COLUMNS ( column_name [,column_name])
                }
    (PARTITION partition_name VALUES IN ( v01 [, v0N])
     [,PARTITION partition_name VALUES IN ( vN1 [, vNN])]
     [,PARTITION partition_name VALUES IN (DEFAULT)]
    );
```

Differences between `LIST COLUMNS` partitioning and `LIST` partitioning are as follows:

* The partitioning key for `LIST COLUMNS` partitioning does not have to be of the INT type. It can be of any data type.

* The partitioning key for `LIST COLUMNS` partitioning cannot be an expression.

* The partitioning key for `LIST COLUMNS` partitioning can be a vector.

Here is an example:

```sql
CREATE TABLE tbl1_lc (id INT,partition_id VARCHAR(2))
       PARTITION BY LIST COLUMNS(partition_id)
        (PARTITION p0 VALUES IN ('00','01'),
         PARTITION p1 VALUES IN ('02','03'),
         PARTITION p2 VALUES IN (DEFAULT)
        );
Query OK, 0 rows affected
```

##### HASH partitioning

`HASH` partitioning applies to scenarios where `RANGE` partitioning and `LIST` partitioning are inapplicable. `HASH` partitioning enables easy partitioning of data by distributing records over partitions based on a hash function on the partitioning key. `HASH` partitioning is useful for distinct value queries on the partitioning keys, such as partitioning based on user ID. `HASH` partitioning can be used to eliminate hotspots in queries.

`HASH` partitioning is a better choice in the following cases:

* You cannot identify an obvious partitioning key for the data.

* The sizes of range partitions differ substantially or are difficult to balance manually.

* `RANGE` partitioning can cause the data to be undesirably clustered.

* Performance features such as parallel DML, partition pruning, and partition-wise joins are important.

The basic syntax for `HASH` partitioning is as follows:

```sql
CREATE TABLE table_name (column_name column_type[,column_name column_type])
  PARTITION BY { HASH(expr) } 
    PARTITIONS partition_count;
```

Rules of `HASH` partitioning are as follows:

* The data type of a partitioning key or the value returned by the expression of a partitioning key must be of the INT type.

* The partitioning expression cannot be a column vector. For example, `partition by hash(c1, c2)` is not allowed.

* For a HASH-partitioned table, if no partition names are specified when the table is created, the system generates the partition names based on the following naming conventions: p0, p1, ..., and pn.

* In a HASH-partitioned table, you cannot add or delete partitions.

Here is an example:

```sql
create table t1 (
    c1 int, 
    c2 int
) partition by hash(c1 + 1) partitions 5;
```

##### KEY partitioning

`KEY` partitioning is similar to `HASH` partitioning. They both use the modulus operation to determine which partition the requested data belongs to.

The basic syntax for `KEY` partitioning is as follows:

```sql
CREATE TABLE table_name (column_name column_type[,column_name column_type])
  PARTITION BY { KEY([column_name_list]) } 
    PARTITIONS partition_count;
```

Rules of `KEY` partitioning are as follows:

* In `KEY` partitioning, the system applies an internal default HASH function on the partitioning key before the modulus operation.

* You cannot determine the partition to which a row belongs through simple calculation.

* The partitioning key for `KEY` partitioning does not have to be of the INT type. It can be of any data type.

* The partitioning key for `KEY` partitioning cannot be an expression.

* The partitioning key for `KEY` partitioning can be a column or vector.

* if the partitioning key for `KEY` partitioning is left empty, the primary key is used as the partitioning key.

Here is an example:

```sql
CREATE TABLE tbl1_k(id INT,gmt_create DATETIME,info VARCHAR(20))
       PARTITION BY KEY(id,gmt_create) PARTITIONS 10;
Query OK, 0 rows affected
```

##### Composite partitioning (subpartitioning)

Subpartitioning is a technique that partitions a table based on two dimensions. For example, it is frequently used in scenarios that involve bills. `HASH` partitioning by `user_id` is first performed, followed by `RANGE` partitioning based on bill creation time.

![Subpartitioning](/img/user_manual/quick_starts/en-US/chapter_06_using_ob_for_business_development/03_horizontal_splitting_using_partition_table/002.png)

OceanBase Database in MySQL mode supports the `HASH`, `RANGE`, `LIST`, `KEY`, `RANGE COLUMNS`, and `LIST COLUMNS` partitioning types, and a combination of any two partitioning types as the subpartitioning type.

Composite partitioning provides the following benefits:

* You can perform partition pruning on one or two dimensions based on the SQL statement to improve query performance.

* You can perform partial partition-wise and full partition-wise joins for queries on either dimension.

* You can perform parallel backup and restore on a table.

* Compared with single-level partitioning, composite partitioning generates more partitions. This can be beneficial for the efficient parallel execution of queries.

* You can implement a rolling window to support historical data and still partition on another dimension if many statements can benefit from partition pruning or partition-wise joins.

* You can store data based on the partitioning key. For example, you can store data for a specific product type in a read-only and compressed format, and keep data of other product types uncompressed.

Here is an example:

```sql
CREATE TABLE t_log_part_by_range_hash (
    log_id      int NOT NULL 
    , log_value varchar(50)
    , log_date  TIMESTAMP NOT NULL 
    , PRIMARY key(log_id, log_date)
) PARTITION BY RANGE(UNIX_TIMESTAMP(log_date))
SUBPARTITION BY HASH(log_id) SUBPARTITIONS 16
(
    PARTITION M202001 VALUES LESS THAN(UNIX_TIMESTAMP('2020/02/01'))
    , PARTITION M202002 VALUES LESS THAN(UNIX_TIMESTAMP('2020/03/01'))
    , PARTITION M202003 VALUES LESS THAN(UNIX_TIMESTAMP('2020/04/01'))
    , PARTITION M202004 VALUES LESS THAN(UNIX_TIMESTAMP('2020/05/01'))
    , PARTITION M202005 VALUES LESS THAN(UNIX_TIMESTAMP('2020/06/01'))
    , PARTITION M202006 VALUES LESS THAN(UNIX_TIMESTAMP('2020/07/01'))
    , PARTITION M202007 VALUES LESS THAN(UNIX_TIMESTAMP('2020/08/01'))
    , PARTITION M202008 VALUES LESS THAN(UNIX_TIMESTAMP('2020/09/01'))
    , PARTITION M202009 VALUES LESS THAN(UNIX_TIMESTAMP('2020/10/01'))
    , PARTITION M202010 VALUES LESS THAN(UNIX_TIMESTAMP('2020/11/01'))
    , PARTITION M202011 VALUES LESS THAN(UNIX_TIMESTAMP('2020/12/01'))
    , PARTITION M202012 VALUES LESS THAN(UNIX_TIMESTAMP('2021/01/01'))
);
```

OceanBase Database supports `RANGE-HASH` and `HASH-RANGE` composite partitioning. However, `Add` and `Drop` operations can be performed only on a partition of a `RANGE`-partitioned table. For large tables, we recommend that you use `RANGE-HASH` partitioning to facilitate maintenance such as partition addition and dropping.

#### Manage partitioned tables

After you create a partitioned table, you can add, drop, or truncate partitions in the partitioned table. For more information, see [Create and manage partitions](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001377902).

### Indexing on partitioned tables

The query performance of a partitioned table depends on the conditions in the SQL statement. If an SQL statement with a sharding key is executed, OceanBase Database performs partition retrieval based on the conditions. Then, OceanBase Database scans only specific partitions. If the SQL statement does not have a sharding key, OceanBase Database scans all partitions.

You can also create indexes to improve the query performance of partitioned tables. Indexes on partitioned tables can either be partitioned or non-partitioned.

* A non-partitioned index on a partitioned table is a global index. It is a single index object that refers to all rows in the partitioned table.

* Partitioned indexes are classified into two types based on their partitioning strategies.
  
  * The first type is called local index that is partitioned in the same manner as the partitioned table. Each partition of a local index corresponds to one partition of the partitioned table.
  
  * The second type is called global index whose partitioning strategy is different from that of the partitioned table.
  
> **Note**
>
> * By default, a local index is created for a partitioned table.
>
> * We recommend that you use local indexes whenever possible and use global indexes only when necessary. Global indexes can degrade the performance of the database in performing DML operations because they may cause DML operations to become distributed transactions.

Example: Create a local index and a global index on a partitioned table.

```sql
CREATE INDEX idx_log_date ON t_log_part_by_range_hash(log_date) LOCAL;

CREATE INDEX idx_log_date2 ON t_log_part_by_range_hash(log_value, log_date) GLOBAL;
```

> **Note**
>
> You do not need to separately create indexes for the primary and unique keys of a partitioned table in OceanBase Database. In OceanBase Database, the primary key and local unique key in a partitioned table must have a partitioning key.

### Suggestions on using partitioned tables

* Create partitions based on your business needs, such as hotspot data distribution, easy maintenance of historical data, conditions in business SQL statements.

* If your business involves multi-dimensional queries, such as queries of both accounts and card numbers of customers, select the partitioning key based on data usage frequency and importance.

* Plan partitioning based on your business scenarios and definite query conditions. The purpose of partitioning is to improve query efficiency through partition pruning. Do not partition a table arbitrarily. If the query conditions can cover only partitions in some scenarios, we recommend that you do not create subpartitions.

* When you create an index, select the index type in the following priority: local index > global partitioned index > global index. Use a global index only when necessary. Global indexes can degrade the performance of DML operations because they may cause DML operations to become distributed transactions.

* When you query or modify a partitioned table, specify the partitioning key in the statement whenever possible.

* We recommend that you do not specify `MAXVALUE` for partitions in a RANGE-partitioned table. Otherwise, you cannot add a new partition. If you use `RANGE` partitioning, we recommend that you use the partition management feature of OceanBase Developer Center (ODC) to manage partitions based on the business conditions, and add partitions regularly to prevent out-of-range errors.

* To avoid write amplification, choose a sequential column rather than using a randomly generated value when you specify a custom primary key. For example, you can choose a chronologically ascending column.

* For a table whose historical data need to be cleared regularly, design your partitioning strategy based on data usage scenarios and the cleanup interval. For example, you can partition a transaction flow table based on date. This way, you can drop historical partitions by day.
