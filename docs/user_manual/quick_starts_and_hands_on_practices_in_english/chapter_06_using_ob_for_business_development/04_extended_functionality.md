---
title: Extended features of MySQL tenant
weight: 5
---

# 6.4 Extended features of a MySQL tenant of OceanBase Database

## Global index

### Definition

MySQL Database supports only local indexes. Unlike a local index, the partitioning of a global index is independent of the partitioning of the table. You can specify the partitioning rules and the number of partitions for a global index. These rules and this number do not have to be the same as those of the table.

![Global index](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/001.png)

### Benefits

Most indexes in a relational database are in a B+ Tree structure, where leaf nodes are stored in order by key values. Key values of an index correspond to the data in the table. When you specify the index conditions for data access, the database locates the target data by searching for the corresponding key value in the B+ Tree.

![B+ Tree](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/002.png)

If a table is split into multiple shards, or partitions in OceanBase Database, how to split the table index? In MySQL Database, the index is split with the table, and an index shard is used for retrieving data in the corresponding table shard. Such an index is known as a local index. You can also create a local index in OceanBase Database with ease by specifying a `local` keyword at the end of the `CREATE INDEX` statement. Local indexes cause some issues.

First, if you use local indexes, you must specify the partitioning key in a query. Otherwise, the database does not know which partition contains the queried data, and will enumerate all the partitions, making the query inefficient. In the example as shown in the following figure, the partitioning key of the `employ` table is `emp_id`, and the partitioning key is not specified in the filter condition in the query statement. The result in the red box indicates that database has scanned all partitions.

![1](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/003.png)

Another issue is that local indexes are created within partitions, so that index key values may not be globally unique. In the example as shown in the following figure, the key value `Edward` may exist in both local indexes of two partitions. Therefore, you must specify the partitioning key of partitions when you create a local index with a `UNIQUE` constraint in a database.

![2](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/004.png)

To simplify the use of local indexes, OceanBase Database in MySQL mode allows you to create global indexes. The differences between global and local indexes are as follows: The structure of the global index for a table is independent of the table partitions. The key values of a global index may correspond to data in different partitions of the table. For example, in the index structure on the right side of the following figure, the key values `1`, `2`, and `5` correspond to the data in two partitions. This way, you no longer need to specify a partitioning key when you use a global index. In addition, the index key values will be globally unique because the structure of the global index is independent of the table.

![Global index](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/005.png)

### Sample statements

To create a global index, simply specify the keyword `global` at the end of the `CREATE INDEX` statement. Here is an example:

```sql
-- Create a HASH-partitioned table:
create table t1(
  c1 int primary key,
  c2 int
  ) partition by hash(c1) partitions 5;

-- Create a partitioned index that adopts a different partitioning type:
create index g_idx on t1(c2) global
  partition by range(c2)
    (partition p0 values less than(100), 
     partition p1 values less than(200), 
     partition p2 values less than(300)
    );

-- The above two SQL statements are equivalent to the following SQL statement:
CREATE TABLE `t1` (
  `c1` int(11) NOT NULL,
  `c2` int(11) DEFAULT NULL,
  PRIMARY KEY (`c1`),
  KEY `g_idx` (`c2`) GLOBAL
   partition by range(c2) -- The partitioning type of the index.
    (partition `p0` values less than (100),
     partition `p1` values less than (200),
     partition `p2` values less than (300)
    )
  ) partition by hash(c1) -- The partitioning type of the table.
    (partition `p0`,
     partition `p1`,
     partition `p2`,
     partition `p3`,
     partition `p4`);
```

> **Notice**
>
>By default, when you create an index without specifying the `global` or `local` keyword, a global index is created if the index information is followed by partition information; otherwise, a local index is created.

### Scenarios

Given the aforesaid two benefits of global indexes, is it necessary to use global indexes unconditionally in distributed databases like OceanBase Database? Global indexes may involve cross-node data access. The costs caused by remote procedure calls (RPCs) during data retrieval cannot be ignored. Therefore, global indexes do not outperform local indexes in all scenarios.

We recommend that you use global indexes in the following scenarios:

- The table is partitioned, but the index does not contain the partitioning key of the table. In this scenario, a key value may exist on local indexes of all partitions, and the database must scan all indexed partitions to retrieve any data. Otherwise, data missing may occur. This leads to inefficient index scanning and a waste of resources. A global index solves that issue easily. If you use a global index, you can specify an index partitioning type that is different from the table partitioning type, and the partitioning key of the index is a subset of the index key.

- Given that local indexes cannot guarantee uniqueness, you must use a global index when you want to ensure that the index keys are unique and that the index key does not include the partitioning key of the table.

> **Note**
>
> Many databases add constraints to partitioned tables. For example, the definition of the primary key and unique index of a table must contain all fields of the partitioning key of the table. This constraint ensures that the indexed data corresponding to a index key exists in only one partition, which means that a unique value in a partition is also unique in the table.
>
> This constraint, while solving a database issue, bothers developers. This is because it greatly narrows the options of primary keys and unique indexes down to only a superset of the table partitioning keys, and therefore cannot meet the requirements of many business needs, making it the most complained drawback of local indexes.

In general, it is more complex to implement a global index than a local index, especially in a distributed database. Only a few commercial databases support global indexes. However, global indexes are less restrictive to users, and provide better experience.

### FAQ

#### Why cannot I set the primary key index of a table to a global index?

OceanBase Database supports only index-organized tables (IOTs). Heap tables are not supported. IOT is a database table storage mode, which organizes data based on the primary key index of the table, rather than the physical sequence of data. This mode ensures that the primary key of a table is organized in the same way as the table, and cannot be used as a global index.

In OceanBase Database, a table without a primary key has a hidden auto-increment column that serves as a primary key. The ID of this column is `1` and the column name is `__pk_increment`. You can query the `oceanbase.__all_column` table to view more information about the column.

#### Why must the partitioning keys of a partitioned table be included in the local unique index and the primary key index?

In OceanBase Database, to create a local partitioned unique index on a partitioned table, you must ensure that the index contains the partitioning keys of the table. This constraint does not apply to global partitioned unique indexes. For more information, see [Create indexes on partitioned tables](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378763).

```sql
create table t1(c1 int unique key, c2 int) partition by hash(c2);
ERROR 1503 (HY000): A UNIQUE INDEX must include all columns in the table's partitioning function

create table t1(c1 int primary key, c2 int) partition by hash(c2);
ERROR 1503 (HY000): A PRIMARY KEY must include all columns in the table's partitioning function
```

As aforementioned, a unique index supports data uniqueness checks only within each partition. Assuming that the unique index does not contain all the partitioning keys and that `create table t1(c1 int unique key, c2 int) partition by hash(c2);` is executed successfully, the table data may be as follows:

| c1  | c2  |
| --- | --- |
| 1   | 1   |
| 1   | 2   |
| 2   | 1   |
| 2   | 2   |
| 3   | 1   |
| 3   | 2   |

Then, one of the partitions is as shown below. The `c1`column of the partition meets the unique constraint, and will pass the uniqueness check.

| c1  | c2  |
| --- | --- |
| 1   | 1   |
| 2   | 1   |
| 3   | 1   |

The other partition is as shown below. The `c1`column of this partition also meets the unique constraint, and will pass the uniqueness check as well.

| c1  | c2  |
| --- | --- |
| 1   | 2   |
| 2   | 2   |
| 3   | 2   |

While both partitions pass the uniqueness check on the `c1` column, the data in the `c1` column is not unique. The same applies to the primary key. Of course, MySQL and Oracle databases also apply these requirements and constraints.

If the unique index is set to a global index, it is not partitioned by using the partitioning rule of the table, thereby avoiding the uniqueness check issue.

## Recycle bin

### Definition

A recycle bin stores objects dropped by the user.

In OceanBase Database, you can move databases, tables, indexes, and tenants to a recycle bin. Objects in the recycle bin still occupy physical space unless they are manually cleared by using the `PURGE` statement or periodically cleared by the system. Before an object is cleared from the recycle bin, you can restore it by using corresponding statements.

### Benefits

The recycle bin feature allows you to restore a mistakenly dropped database object.

This useful feature is not supported in MySQL Database, but is supported in MySQL tenants of OceanBase Database and is designed based on the recycle bin feature of Oracle Database.

### Sample statements

#### Enable or disable the recycle bin and set the purging interval

- Enable or disable the recycle bin
  
  By default, the recycle bin feature is disabled.

  ```sql
  -- The following statements take effect for the current session.
  SET recyclebin = on;
  SET recyclebin = off;
  SET session recyclebin = on;
  SET session recyclebin = off;
  ```

  You can specify the `global` keyword to make the statement for enabling or disabling the recycle bin take effect within the current tenant.

  ```sql
  -- If you specify the `global` keyword in a session, it takes effect in subsequent sessions.
  SET global recyclebin = on;
  SET global recyclebin = off;
  ```

-  View whether the recycle bin feature is enabled
  
   ```sql
   show variables like 'recyclebin';
   ```

   The output is as follows:

   ```shell
   +---------------+-------+
   | Variable_name | Value |
   +---------------+-------+
   | recyclebin    | ON    |
   +---------------+-------+
   ```

- Set the interval for purging objects in the recycle bin
  
  The default value is `0s`, which indicates that the periodic purging of the recycle bin is disabled. The following statement can be executed only in the sys tenant and takes effect for the entire cluster:

  ```sql
  alter system set recyclebin_object_expire_time= '7d';
  ```

  You can set the purging interval to `0s` to disable periodic purging of the recycle bin.

  ```sql
  ALTER SYSTEM SET recyclebin_object_expire_time = "0s";
  ```

- View the cluster-level parameter `recyclebin_object_expire_time`.
  
  ```sql
  show parameters like 'recyclebin_object_expire_time'\G
  ```

  The output is as follows:

  ```shell
  *************************** 1. row ***************************
           zone: zone1
       svr_type: observer
         svr_ip: 1.2.3.4
       svr_port: 12345
           name: recyclebin_object_expire_time
      data_type: NULL
          value: 0s
           info: recyclebin object expire time, default 0 that means auto purge recyclebin off. Range: [0s, +∞)
        section: ROOT_SERVICE
          scope: CLUSTER
         source: DEFAULT
     edit_level: DYNAMIC_EFFECTIVE
  default_value: 0s
      isdefault: 1
  ```

#### View objects in the recycle bin

> **Note**
>
> - When you drop an index alone, the index is not moved to the recycle bin.
>
> - When you drop a table, indexes on the table are also moved to the recycle bin together with the table.

1. Create a database and then an indexed table.

   ```sql
   create database test_db;
   create table t1(c1 int, c2 int, index idx(c2));
   ```
  
2. Drop the created database and indexed table.

   ```sql
   drop database test_db;
   drop table t1;
   ```

3. View objects in the recycle bin.

   ```sql
   show RECYCLEBIN;
   ```

   The output is as follows, where `OBJECT_NAME` indicates the new name of an object after it is moved to the recycle bin. This is to uniquely identify objects of the same type and name in the recycle bin. `ORIGINAL_NAME` indicates the original name of an object before it was dropped.

   ```shell
   +--------------------------------+------------------+----------+----------------------------+
   | OBJECT_NAME                    | ORIGINAL_NAME    | TYPE     | CREATETIME                 |
   +--------------------------------+------------------+----------+----------------------------+
   | __recycle_$_1_1713173706419784 | __idx_500044_idx | INDEX    | 2024-04-15 17:35:06.419840 |
   | __recycle_$_1_1713173706464688 | t1               | TABLE    | 2024-04-15 17:35:06.465056 |
   | __recycle_$_1_1713173712877712 | test_db          | DATABASE | 2024-04-15 17:35:12.877862 |
   +--------------------------------+------------------+----------+----------------------------+
   3 rows in set
   ```

4. Query the internal table `oceanbase.__all_recyclebin`.

   ```sql
   select * from oceanbase. __all_recyclebin;
   ```

   The output is as follows, showing details of objects before they were dropped in fields such as `database_id` and `table_id`:

   ```shell
   +----------------------------+-----------+--------------------------------+------+-------------+----------+---------------+------------------+
   | gmt_create                 | tenant_id | object_name                    | type | database_id | table_id | tablegroup_id | original_name    |
   +----------------------------+-----------+--------------------------------+------+-------------+----------+---------------+------------------+
   | 2024-04-15 17:35:06.419840 |         0 | __recycle_$_1_1713173706419784 |    2 |      500001 |   500045 |            -1 | __idx_500044_idx |
   | 2024-04-15 17:35:06.465056 |         0 | __recycle_$_1_1713173706464688 |    1 |      500001 |   500044 |            -1 | t1               |
   | 2024-04-15 17:35:12.877862 |         0 | __recycle_$_1_1713173712877712 |    4 |      500046 |       -1 |            -1 | test_db          |
   +----------------------------+-----------+--------------------------------+------+-------------+----------+---------------+------------------+
   3 rows in set
   ```

#### Restore objects from the recycle bin

To restore a table, for example, execute the following statement: `FLASHBACK TABLE object_name TO BEFORE DROP [RENAME To new_table_name];`.

```sql
-- Create a table with the same name as the one that was just dropped.
create table t1(c1 int);
Query OK, 0 rows affected

-- Execute the statement in the database from which the table was dropped to restore the table from the recycle bin. By default, the original table name is used. You can use the `RENAME To new_table_name ` clause to rename the table.
-- Indexes on the table are restored with the table.
-- If the original name of the table is the same as that of an existing table, the system returns an error.
flashback table __recycle_$_1_1713173706464688 to before drop;
ERROR 1050 (42S01): Table 't1' already exists

-- Use the `RENAME To new_table_name ` clause to rename the table.
flashback table __recycle_$_1_1713173706464688 to before drop rename to old_t1;
Query OK, 0 rows affected

The output is as follows, showing that the table and its indexes are restored:
obclient [test]> show RECYCLEBIN;
+--------------------------------+---------------+----------+----------------------------+
| OBJECT_NAME                    | ORIGINAL_NAME | TYPE     | CREATETIME                 |
+--------------------------------+---------------+----------+----------------------------+
| __recycle_$_1_1713173712877712 | test_db       | DATABASE | 2024-04-15 17:35:12.877862 |
+--------------------------------+---------------+----------+----------------------------+
```

To restore a database or tenant from the recycle bin, replace the keyword `table` in the `FLASHBACK` statement with `database` or `tenant`.

> **Note**
>
> 1. Before you restore a table from the recycle bin, you must restore the database to which the table belongs if the database has been dropped.
>
> 2. You cannot directly restore an index. When you execute the `FLASHBACK` statement to restore a table, indexes on the table are restored together with the table.
>
> 3. You can modify the name of an object when you restore it from the recycle bin, but the object name must be different from an existing one. Otherwise, the system returns an error.
>
> 4. If a table in the recycle bin originally belongs to a table group, it is restored to the group by default. If the group is deleted, the restored table does not belong to any group.

#### Purge objects in the recycle bin

You can execute the following statements to purge objects in the recycle bin:

```sql
show recyclebin;
+--------------------------------+------------------+----------+----------------------------+
| OBJECT_NAME                    | ORIGINAL_NAME    | TYPE     | CREATETIME                 |
+--------------------------------+------------------+----------+----------------------------+
| __recycle_$_1_1713173712877712 | test_db          | DATABASE | 2024-04-15 17:35:12.877862 |
| __recycle_$_1_1713177112706600 | __idx_500048_idx | INDEX    | 2024-04-15 18:31:52.706664 |
| __recycle_$_1_1713177112725848 | t1               | TABLE    | 2024-04-15 18:31:52.727735 |
+--------------------------------+------------------+----------+----------------------------+
3 rows in set

-- To purge an index, execute the following statement: PURGE INDEX object_name;
purge index __recycle_$_1_1713177112706600;

-- To purge a table, execute the following statement: PURGE TABLE object_name;
purge table __recycle_$_1_1713177112725848;

-- To purge a database, execute the following statement: PURGE DATABASE object_name;
purge database __recycle_$_1_1713173712877712;

-- To purge a user tenant, execute the following statement: PURGE TENANT object_name; (You can execute the statement only in the sys tenant.)

-- To purge all objects at a time, execute the following statement:
purge recyclebin;

-- To view objects in the recycle bin after a purge recyclebin operation, execute the following statement:
show recyclebin;
Empty set
```

> **Note**
>
> The `PURGE` statement deletes an object along with its dependent objects in the recycle bin. For example, when you purge a database in the recycle bin, tables and indexes that belong to the database are also purged.

### Scenarios

We recommend that you enable the recycle bin feature in a production environment to prevent DBAs from mistakenly dropping important tenant data.

To reduce the disk space occupied by the data in the recycle bin, you can specify a reasonable small value for the purging interval.

### FAQ

#### Will the objects in the recycle bin be purged if I disable the recycle bin?

If you disable the recycle bin by using the `SET recyclebin = off` statement, the objects in the recycle bin are not purged.

#### Can I perform a `FLASHBACK` or `PURGE` operation on the objects in the recycle bin by their original names?

When you perform a `FLASHBACK` or `PURGE` operation on a table in the recycle bin, you can use its original name indicated by the `ORIGINAL_NAME` field in the return result of a `SHOW RECYCLEBIN` statement. The `FLASHBACK` or `PURGE` operation is performed based on the following rules:

- If the recycle bin contains tables with the same original name, the `FLASHBACK ORIGINAL_NAME` statement restores the table that was last moved to the recycle bin.

- If the recycle bin contains tables with the same original name, the `PURGE ORIGINAL_NAME` statement purges the earliest table that was moved to the recycle bin.

The preceding rules of OceanBase Database are consistent with those of Oracle Database.

You can also perform a `FLASHBACK` or `PURGE` operation on a tenant in the recycle bin by its original name based on the preceding rules.

However, the preceding rules do not apply to indexes or databases.

> **Note**
>
> While it seems easier to perform `FLASHBACK` or `PURGE` operations on the objects in the recycle bin by their original names, we recommend that you use the unique name indicated by the `OBJECT_NAME` field to avoid losses due to your misremembering of the operation rules.

#### OceanBase Database does not move a separately dropped index to the recycle bin. Why?

When you drop an index alone in OceanBase Database, the index is not moved to the recycle bin. However, when you drop a table, indexes on the table are moved to the recycle bin together with the table.

 This is because an index in the recycle bin cannot be updated with the corresponding table, and cannot be restored by using the `FLASHBACK` statement due to data inconsistency.

#### OceanBase Database V4.x does not move a truncated table to the recycle bin. Why?

In OceanBase Database V3.x, if the session-level variable `ob_enable_truncate_flashback` is set to `on`, and you truncate a table by mistake, you can perform a `FLASHBACK` operation to restore the table and data to the status before the `TRUNCATE TABLE` operation.

That feature is not supported in OceanBase Database V4.x because the implementation of the `TRUNCATE TABLE` operation has changed. 

## Table groups

### Definition

A table group is a logical concept that represents a collection of tables. By default, data is randomly distributed to tables. By defining a table group, you can control the physical proximity among a group of tables.

### Benefits

OceanBase Database is a native distributed database. When multiple OBServer nodes exit in each zone, the data of different tables and the data of different partitions of the same table may be distributed to different nodes for load balancing purposes.

This causes two issues:

- Although the partition definitions (including the partitioning type, number of partitions, and partitioning key value) of two partitioned tables are identical, the identical partitions of the two tables may exist on two different nodes. Each time a `JOIN` operation is performed on the partitioning keys of the two tables, cross-node communication is necessary, resulting in high network overheads.

- Similarly, distributed transactions are performed when tables or partitions frequently involved in the same transaction do not exist on the same node. This may affect transaction performance.

To avoid cross-node operations and improve database performance, OceanBase Database provides the table group feature, which stores a group of tables and the same partitions of tables with the same partition definitions on the same server.

Here is an example:

1. Create two tables named `t1` and `t2` with the same partitioning rule.

   ```shell
   obclient [test]> CREATE TABLE t1(col1 int, col2 int) 
                        PARTITION BY RANGE(col1)(
                        PARTITION p0 VALUES LESS THAN(100),
                        PARTITION p1 VALUES LESS THAN(200),
                        PARTITION p2 VALUES LESS THAN(300));
   ```

   ```shell
   obclient [test]> CREATE TABLE t2(col1 int, col2 int) 
                        PARTITION BY RANGE(col1)(
                        PARTITION p0 VALUES LESS THAN(100),
                        PARTITION p1 VALUES LESS THAN(200),
                        PARTITION p2 VALUES LESS THAN(300));
   ```

2. Create a table group and add tables `t1` and `t2` to the table group.

   ```shell
   obclient [test]> CREATE TABLEGROUP tg1 sharding = 'ADAPTIVE';
   obclient [test]> ALTER TABLEGROUP tg1 add t1, t2;
   ```

   View the information about the table group `tg1`.

   ```shell
   obclient [test]> SHOW TABLEGROUPS WHERE tablegroup_name = 'tg1';
   ```

   The output is as follows:

   ```shell
   +-----------------+------------+---------------+----------+
   | Tablegroup_name | Table_name | Database_name | Sharding |
   +-----------------+------------+---------------+----------+
   | tg1             | t1         | test          | ADAPTIVE |
   | tg1             | t2         | test          | ADAPTIVE |
   +-----------------+------------+---------------+----------+
   2 rows in set
   ```

3. Create a partitioned table with a different partitioning rule.

   ```shell
   obclient [test]> CREATE TABLE t3(col1 int, col2 int) 
                        PARTITION BY RANGE(col1)(
                        PARTITION p0 VALUES LESS THAN(400),
                        PARTITION p1 VALUES LESS THAN(500),
                        PARTITION p2 VALUES LESS THAN(600));
   ```

4. Add the differently partitioned table to the table group.

   ```shell
   obclient [test]> ALTER TABLEGROUP tg1 add t3;
   ```

   The output is as follows, with an error reported:

   ```shell
   ERROR 4179 (HY000): range_part partition value not equal, add table to tablegroup not allowed
   ```

After you add tables `t1` and `t2` to the table group, their partitions with identical data are stored on the same node, as shown in the following figure.

![tablegroup](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/006.png)

If two partitions adopting the same partitioning rule exist on the same node, you can perform a `JOIN` operation on their partitioning keys without redistributing the partition data or using the network. The aforementioned special `JOIN` operation in OceanBase Database is called a partition-wise join, which significantly reduces the network overheads.

```shell
obclient [test]> explain select * from t1, t2 where t1.col1 = t2.col1;
```

The output is as follows:

```shell
+-----------------------------------------------------------------------------------------------+
| Query Plan                                                                                    |
+-----------------------------------------------------------------------------------------------+
| =============================================================                                 |
| |ID|OPERATOR                 |NAME    |EST.ROWS|EST.TIME(us)|                                 |
| -------------------------------------------------------------                                 |
| |0 |PX COORDINATOR           |        |1       |26          |                                 |
| |1 |└─EXCHANGE OUT DISTR     |:EX10000|1       |25          |                                 |
| |2 |  └─PX PARTITION ITERATOR|        |1       |24          |                                 |
| |3 |    └─HASH JOIN          |        |1       |24          |                                 |
| |4 |      ├─TABLE FULL SCAN  |t1      |1       |12          |                                 |
| |5 |      └─TABLE FULL SCAN  |t2      |1       |12          |                                 |
| =============================================================                                 |
| Outputs & filters:                                                                            |
| -------------------------------------                                                         |
|   0 - output([INTERNAL_FUNCTION(t1.col1, t1.col2, t2.col1, t2.col2)]), filter(nil), rowset=16 |
|   1 - output([INTERNAL_FUNCTION(t1.col1, t1.col2, t2.col1, t2.col2)]), filter(nil), rowset=16 |
|       dop=1                                                                                   |
|   2 - output([t1.col1], [t2.col1], [t1.col2], [t2.col2]), filter(nil), rowset=16              |
|       partition wise, force partition granule                                                 |
|   3 - output([t1.col1], [t2.col1], [t1.col2], [t2.col2]), filter(nil), rowset=16              |
|       equal_conds([t1.col1 = t2.col1]), other_conds(nil)                                      |
|   4 - output([t1.col1], [t1.col2]), filter(nil), rowset=16                                    |
|       access([t1.col1], [t1.col2]), partitions(p[0-2])                                        |
|       is_index_back=false, is_global_index=false,                                             |
|       range_key([t1.__pk_increment]), range(MIN ; MAX)always true                             |
|   5 - output([t2.col1], [t2.col2]), filter(nil), rowset=16                                    |
|       access([t2.col1], [t2.col2]), partitions(p[0-2])                                        |
|       is_index_back=false, is_global_index=false,                                             |
|       range_key([t2.__pk_increment]), range(MIN ; MAX)always true                             |
+-----------------------------------------------------------------------------------------------+
27 rows in set
```

The following example performs a `JOIN` operation on two tables partitioned by different rules. You can observe the differences from the `JOIN` operation on two tables partitioned by the same rule.

```shell
explain select * from t1, t3 where t1.col1 = t3.col1;
```

The output is as follows. The `EXCHANGE OUT DISTR (PKEY)` operator specifies to redistribute the data of the `t1` table based on the partitioning rule of the `t3` table, which incurs network overheads.

```shell
+-----------------------------------------------------------------------------------------------+
| Query Plan                                                                                    |
+-----------------------------------------------------------------------------------------------+
| =====================================================================                         |
| |ID|OPERATOR                         |NAME    |EST.ROWS|EST.TIME(us)|                         |
| ---------------------------------------------------------------------                         |
| |0 |PX COORDINATOR                   |        |1       |27          |                         |
| |1 |└─EXCHANGE OUT DISTR             |:EX10001|1       |26          |                         |
| |2 |  └─HASH JOIN                    |        |1       |25          |                         |
| |3 |    ├─EXCHANGE IN DISTR          |        |1       |13          |                         |
| |4 |    │ └─EXCHANGE OUT DISTR (PKEY)|:EX10000|1       |13          |                         |
| |5 |    │   └─PX PARTITION ITERATOR  |        |1       |12          |                         |
| |6 |    │     └─TABLE FULL SCAN      |t1      |1       |12          |                         |
| |7 |    └─PX PARTITION ITERATOR      |        |1       |12          |                         |
| |8 |      └─TABLE FULL SCAN          |t3      |1       |12          |                         |
| =====================================================================                         |
| Outputs & filters:                                                                            |
| -------------------------------------                                                         |
|   0 - output([INTERNAL_FUNCTION(t1.col1, t1.col2, t3.col1, t3.col2)]), filter(nil), rowset=16 |
|   1 - output([INTERNAL_FUNCTION(t1.col1, t1.col2, t3.col1, t3.col2)]), filter(nil), rowset=16 |
|       dop=1                                                                                   |
|   2 - output([t1.col1], [t3.col1], [t1.col2], [t3.col2]), filter(nil), rowset=16              |
|       equal_conds([t1.col1 = t3.col1]), other_conds(nil)                                      |
|   3 - output([t1.col1], [t1.col2]), filter(nil), rowset=16                                    |
|   4 - output([t1.col1], [t1.col2]), filter(nil), rowset=16                                    |
|       (#keys=1, [t1.col1]), dop=1                                                             |
|   5 - output([t1.col1], [t1.col2]), filter(nil), rowset=16                                    |
|       force partition granule                                                                 |
|   6 - output([t1.col1], [t1.col2]), filter(nil), rowset=16                                    |
|       access([t1.col1], [t1.col2]), partitions(p[0-2])                                        |
|       is_index_back=false, is_global_index=false,                                             |
|       range_key([t1.__pk_increment]), range(MIN ; MAX)always true                             |
|   7 - output([t3.col1], [t3.col2]), filter(nil), rowset=16                                    |
|       affinitize, force partition granule                                                     |
|   8 - output([t3.col1], [t3.col2]), filter(nil), rowset=16                                    |
|       access([t3.col1], [t3.col2]), partitions(p[0-2])                                        |
|       is_index_back=false, is_global_index=false,                                             |
|       range_key([t3.__pk_increment]), range(MIN ; MAX)always true                             |
+-----------------------------------------------------------------------------------------------+
35 rows in set
```

### Sample statements

For more information about table groups, see [Create and manage table groups](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001377877).

### SHARDING attribute

The table group feature has been introduced since OceanBase Database V1.x. Tables associated with each other often share the same partitioning rules. Partitions that adopt the same partitioning rules are placed together to implement partition-wise joins, which greatly optimize read and write performance. Therefore, the table group feature is provided to change regular joins to partition-wise joins.

The `SHARDING` attribute has been introduced since OceanBase Database V4.2.0 to control the aggregation and dispersion of table data within a table group. By default, data of different tables is randomly distributed. To gather the partitions of multiple related tables on the same node to support partition-wise joins and improve performance, you need to specify the alignment rules between partitions of different tables.

- If you specify `SHARDING = NONE`, all partitions of all tables in a table group exist on the same node, regardless of the partitioning type. This way, you can distribute tables frequently involved in the same transaction on the same server, thus simplifying a distributed transaction to a single-server transaction.

- If you set the `SHARDING` attribute of a table group to a value other than `NONE`, the data of each table in the table group is distributed to multiple servers. To ensure consistent table data distribution, all tables in the table group must have the same partition definition, including the partitioning type, number of partitions, and partitioning key value. The system schedules or aligns partitions with the same partition attributes to the same server to implement partition-wise joins.

Other valid values of the `SHARDING` attribute and their effect on the tables in a table group are as follows:

- `PARTITION`: Specifies to distribute data by partition. For a subpartitioned table, all subpartitions under the same partition are aggregated.

  - Partitioning type requirement: All tables use the same partitioning type. For a subpartitioned table, only its partitioning type is verified. Therefore, if the `SHARDING` attribute of a table group is set to this value, the table group may contain both partitioned and subpartitioned tables, as long as their partitioning types are the same.

  - Partition alignment rules: Partitions with the same partitioning key value are aggregated, including partitions of partitioned tables and all subpartitions under corresponding partitions of subpartitioned tables.

- `ADAPTIVE`: Data is distributed in an adaptive way. If the `SHARDING` attribute of a table group is set to this value, and the table group contains only partitioned tables, data is distributed by partition. If the table group contains only subpartitioned tables, data is distributed by subpartition.

  - Partitioning type requirement: All tables in the table group are partitioned tables or subpartitioned tables. If all tables are partitioned tables, the tables must use the same partitioning type. If all tables are subpartitioned tables, the tables must use the same partitioning and subpartitioning types.

  - Partition alignment rules: For partitioned tables, partitions with the same partitioning key value are aggregated. For subpartitioned tables, subpartitions with the same partitioning key value and subpartitioning key value are aggregated.

The following examples describe how to use the `SHARDING` attribute.

**Example 1: SHARDING = NONE**

If you specify `SHARDING = NONE` for a table group, all partitions of all tables in the table group are distributed in the same partition group on the same server.

```sql
SQL> CREATE TABLEGROUP TG1 SHARDING = 'NONE';

# Create a non-partitioned table and specify its table group
SQL> CREATE TABLE T_NONPART (pk int primary key) tablegroup = TG1;

# Create a partitioned table and specify its table group
SQL> CREATE TABLE T_PART_2 (pk int primary key)  tablegroup = TG1
     partition by hash(pk)
     partitions 2;

# Create a subpartitioned table and specify its table group
SQL> CREATE TABLE T_SUBPART_2_2 (pk int, c1 int, primary key(pk, c1)) tablegroup = TG1
     partition by hash(pk)
     subpartition by hash(c1) subpartitions 2
     partitions 2;
```

<table>
  <tr>
    <td rowspan="2">Table</td>
    <td>Partition Group</td>
  </tr>
  <tr>
    <td>0</td>
  </tr>
  <tr>
    <td>T_NONPART</td>
    <td>P0</td>
  </tr>
  <tr>
    <td>T_PART_2</td>
    <td>P0, P1</td>
  </tr>
  <tr>
    <td>T_SUBPART_2_2</td>
    <td>P0SP0, P0SP1, P1SP0, P1SP1</td>
  </tr>
</table>

**Example 2: SHARDING = PARTITION**

If you specify `SHARDING = PARTITION` for a table group, all tables in the table group must be partitioned tables adopting the same partitioning type. Partitions with the same partition attributes are aggregated in a partition group.

```sql
SQL> CREATE TABLEGROUP TG1 SHARDING = 'PARTITION';

# Create a partitioned table and specify its table group
SQL> CREATE TABLE T_PART_2 (pk int primary key) tablegroup = TG1
     partition by hash(pk) partitions 2;

# Create a subpartitioned table and specify its table group
SQL> CREATE TABLE T_SUBPART_2_2 (pk int, c1 int, primary key(pk, c1)) tablegroup = TG1
     partition by hash(pk)
     subpartition by hash(c1) subpartitions 2
     partitions 2;
```

<table>
  <tr>
    <td rowspan="2">Table</td>
    <td colspan="2">Partition Group</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
  </tr>
  <tr>
    <td>T_PART_2</td>
    <td>P0</td>
    <td>P1</td>
  </tr>
  <tr>
    <td>T_SUBPART_2_2</td>
    <td>P0SP0, P0SP1</td>
    <td>P1SP0, P1SP1</td>
  </tr>
</table>

**Example 3: SHARDING = ADAPTIVE**

In this case, all tables in the table group must adopt the same partitioning and subpartitioning types. Partitioned tables and subpartitioned tables cannot be added to the same table group.

Create a table group for partitioned tables:

```sql
SQL> CREATE TABLEGROUP TG_PART SHARDING = 'ADAPTIVE';

# Create a partitioned table and specify its table group
SQL> CREATE TABLE T1_PART_2 (pk int primary key) tablegroup = TG_PART
     partition by hash(pk) partitions 2;

# Create a partitioned table and specify its table group
SQL> CREATE TABLE T2_PART_2 (pk int primary key, c1 int) tablegroup = TG_PART
     partition by hash(pk) partitions 2;
```

<table>
  <tr>
    <td rowspan="2">Table</td>
    <td colspan="2">Partition Group</td>
  </tr>
  <tr>
    <td>0</td>
    <td>1</td>
  </tr>
  <tr>
    <td>T1_PART_2</td>
    <td>P0</td>
    <td>P1</td>
  </tr>
  <tr>
    <td>T2_PART_2</td>
    <td>P0</td>
    <td>P1</td>
  </tr>
</table>

Create a table group for subpartitioned tables:

```sql
SQL> CREATE TABLEGROUP TG_SUBPART SHARDING = 'ADAPTIVE';

# Create a subpartitioned table and specify its table group
SQL> CREATE TABLE T1_SUBPART_2_2 (pk int, c1 int, primary key(pk, c1)) tablegroup = TG_SUBPART
     partition by hash(pk)
     subpartition by hash(c1) subpartitions 2
     partitions 2;

# Create a subpartitioned table and specify its table group
SQL> CREATE TABLE T2_SUBPART_2_2 (pk int, c1 int, c2 int, primary key(pk, c1)) tablegroup = TG_SUBPART
     partition by hash(pk)
     subpartition by hash(c1) subpartitions 2
     partitions 2;
```

<table>
  <tr>
    <td rowspan="2">Table</td>
    <td colspan="4">Partition Group</td>
  </tr>
  <tr>
    <td>00</td>
    <td>01</td>
    <td>10</td>
    <td>11</td>
  </tr>
  <tr>
    <td>T1_SUBPART_2_2</td>
    <td>P0SP0</td>
    <td>P0SP1</td>
    <td>P1SP0</td>
    <td>P1SP1</td>
  </tr>
  <tr>
    <td>T2_SUBPART_3_3</td>
    <td>P0SP0</td>
    <td>P0SP1</td>
    <td>P1SP0</td>
    <td>P1SP1</td>
  </tr>
</table>

### FAQ

#### Is a table group affiliated with a database?

A table group is not affiliated with a database. They are objects in a tenant.

The affiliation relationship between database objects in OcreanBase Database is as follows:

- Tenants
  - Databases and table groups
    - Tables
      - Indexes, partitions, and constraints

## Sequences

### Definition

In OceanBase Database, a sequence is a set of auto-increment unique numeric values generated in the database based on some rules. Sequences are often used to generate unique identifiers.

### Benefits

Many database users need to migrate their business systems from DB2 or Oracle Database to MySQL tenants of Oceanbase Database.

Their business involves a great number of sequence objects in DB2 or Oracle Database. To reduce the workload in business modification, OceanBase Database supports sequences in MySQL mode.

### Sample statements

For more information about sequences, see [Create and manage sequences](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001377919).

### Scenarios

1. Business is migrated from DB2 or Oracle Database to MySQL tenants of Oceanbase Database.

2. The auto-increment column feature, which is bound to a table, cannot meet the business needs. Sequences are not bound to tables. You can create a sequence separately and use it for multiple tables.

3. An auto-increment column, which does not support the `CYCLE` option, has reached its maximum value. Sequences support the `CYCLE` option and can wrap around.

### FAQ

#### What are the differences between a sequence and an auto-increment column?

1. Auto-increment columns are bound to tables. Sequences are not bound to tables. You can create a sequence separately and use it for multiple tables.

2. Auto-increment columns do not support the `CYCLE` option. Sequences support the `CYCLE` option and can wrap around.

```sql
-- Create a table that contains an auto-increment column named `id`.
obclient [test]> CREATE TABLE t1(id bigint not null auto_increment primary key, name varchar(50));
Query OK, 0 rows affected

obclient [test]> INSERT INTO t1(name) VALUES('A'),('B'),('C');
Query OK, 3 rows affected

obclient [test]> SELECT * FROM t1;
+----+------+
| id | name |
+----+------+
|  1 | A    |
|  2 | B    |
|  3 | C    |
+----+------+
3 rows in set


-- Create a sequence whose start value is 1, minimum value is 1, and maximum value is 5, with a step size of 2, and specify the `NOCYCLE` option.
obclient [test]> CREATE SEQUENCE seq1 START WITH 1 MINVALUE 1 MAXVALUE 5 INCREMENT BY 2 NOCYCLE;
Query OK, 0 rows affected

obclient [test]> SELECT seq1.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       1 |
+---------+
1 row in set

obclient [test]> SELECT seq1.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       3 |
+---------+
1 row in set

obclient [test]> SELECT seq1.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       5 |
+---------+
1 row in set

-- If you specify the `NOCYCLE` option, no more values can be generated after the sequence reaches the maximum value.
obclient [test]> SELECT seq1.nextval FROM DUAL;
ERROR 4332 (HY000): sequence exceeds MAXVALUE and cannot be instantiated


-- Create another sequence whose start value is 1, minimum value is 1, and maximum value is 5, with a step size of 2, and specify the `CYCLE` and `CACHE` options.
obclient [test]> CREATE SEQUENCE seq7 START WITH 1 MINVALUE 1 MAXVALUE 5 INCREMENT BY 2 CYCLE CACHE 2;
Query OK, 0 rows affected

obclient [test]> SELECT seq7.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       1 |
+---------+
1 row in set

obclient [test]> SELECT seq7.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       3 |
+---------+
1 row in set

obclient [test]> SELECT seq7.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       5 |
+---------+
1 row in set

obclient [test]> SELECT seq7.nextval FROM DUAL;
+---------+
| nextval |
+---------+
|       1 |
+---------+
1 row in set


-- In addition to top-level `SELECT` statements, you can also use sequences in `INSERT` and `UPDATE` statements.

obclient [test]> create table t2(c1 int);
Query OK, 0 rows affected

obclient [test]> insert into t2 values(seq7.nextval);
Query OK, 1 row affected

obclient [test]> select * from t2;
+------+
| c1   |
+------+
|    3 |
+------+
1 row in set

obclient [test]> update t2 set c1 = seq7.nextval;
Query OK, 1 row affected
Rows matched: 1  Changed: 1  Warnings: 0

obclient [test]> select * from t2;
+------+
| c1   |
+------+
|    5 |
+------+
1 row in set
```

#### What is the impact of the ORDER and NOORDER options on a sequence and an auto-increment column?

The ORDER and NOORDER options have the same impact on sequences and auto-increment columns.

OceanBase Database is a distributed database in which database tables are generally distributed across multiple servers. OceanBase Database must ensure the auto-increment column generation performance in distributed multi-server scenarios. This result in the issue of value hopping when auto-increment values are generated.

OceanBase Database supports `NOORDER` and `ORDER` auto-increment modes for auto-increment columns. By default, the `ORDER` mode is used.

##### NOORDER mode

This mode is implemented based on the distributed cache. Values in an auto-increment column in this mode are globally unique. Values in the auto-increment column only increase locally within a node. Global increment is not guaranteed.

The data structure of an auto-increment column in `NOORDER` mode consists of two parts:

* Internal table: a table that resides on the central node and into which the central node persists the checkpoint of auto-increment values that have been used.

* Cache: an auto-increment value range that exists in each OBServer node and is requested from the internal table.

![NOORDER mode](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/007.png)

For an auto-increment column in `NOORDER` mode, OBServer nodes are independent of each other. Each OBServer node can obtain an auto-increment value range from the internal table and record the range in the server cache. Auto-increment values are obtained from the local cache without accessing the central node.

##### ORDER mode

This mode is implemented based on the centralized cache. Values in a sequence or an auto-increment column in this mode increase globally.

The following figure shows the working principle of an auto-increment column in `ORDER` mode.

![ORDER mode](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_06_using_ob_for_business_development/04_extended_functionality/008.png)

In `ORDER` mode, an auto-increment column will select the OBServer node that is the leader of the current cluster and where RootService is deployed to provide services. Other OBServer nodes that serve as followers must send an RPC request to apply for auto-increment values from the leader. The leader will request an auto-increment value range from the internal table and cache the value range.

To avoid value hopping in `NOORDER ` mode while applying for auto-increment values from different nodes in distributed scenarios, you need to set the auto-increment column to `ORDER` mode.

> **Note**
>
> The default mode of a sequence is different from that of an auto-increment column:
>
> - To be compatible with Oracle Database, a sequence is created in `NOORDER` mode by default.
>
> - To be compatible with MySQL Database, an auto-increment column is created in `ORDER` mode by default.

#### Considering performance overheads, what are the recommended attribute settings when I create a sequence?

If you create a sequence in `ORDER` mode, to ensure global sequentiality, the database accesses the central node to update a specific internal table every time it obtains the next value. This may cause serious lock conflicts in high-concurrency scenarios. If the sequence values do not need to be incremental but must be unique, we recommend that you set the sequence to `NOORDER` mode.

If you have high performance requirements, pay attention to the value cache mode. Two value cache modes are supported: CACHE and NOCACHE.

- `NOCACHE`: Specifies that auto-increment values are not cached in the OBServer node. In this mode, the `SELECT` and `UPDATE` statements are executed every time the `NEXTVAL` pseudocolumn is called. This affects the performance of the database.

- `CACHE`: Specifies the number of auto-increment values that each OBServer node caches in memory. The default value is `20`.

> **Note**
>
> By default, the database caches a small number of auto-increment values for sequences. When you create a sequence, we recommend that you specify a larger value for `CACHE`. For a database instance with the capability of handling 100 transactions per second (TPS), you can set the `CACHE SIZE` parameter to `360000`.

## Flashback queries

OceanBase Database supports record-specific flashback queries, which allows you to obtain data of a specific historical version.

For more information, see [Flashback queries](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375474).

## Replicated tables

OceanBase Database allows you to create replicated tables. A replicated table can read the latest data modifications from any healthy replica. If you do not frequently write data and are more concerned about the operation latency and load balancing, a replicated table is a good choice.

 
