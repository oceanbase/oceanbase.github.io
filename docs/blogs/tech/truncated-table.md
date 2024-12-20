---
slug: truncated-table
title: 'Why Truncated Tables Cannot Be Recycled in OceanBase Database V4.x?'
---
# Why Truncated Tables Cannot Be Recycled in OceanBase Database V4.x?

> I have been questioned a lot lately that "OceanBase Database V3.x supports the recycle of truncated tables. Why is this feature removed in OceanBase Database V4.x?"  
> In this article, I will explain why truncated tables are not moved to the recycle bin in OceanBase Database V4.x.

Background
==

MySQL does not provide a recycle bin, which, however, is necessary for a database administrator (DBA) to quickly and losslessly restore accidentally deleted data. In response to the strong request of Ant Group DBAs, OceanBase Database has supported the recycle bin feature in MySQL mode, which is similar to that in Oracle 10g. For more information, see [Overview](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001029493).

In OceanBase Database V3.x, if the session-level system variable [ob_enable_truncate_flashback](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001030833) is set to `on`, you can perform a `FLASHBACK` operation to restore the data truncated from a table.

For example, you can execute the following SQL sequence to restore the data truncated from table `t1` to a table named `truncated_t1`:
![1](/img/blogs/tech/truncated-table/1.png)
  

In OceanBase Database V4.x, a truncated table is not moved to the recycle bin, as shown in the following example:
![2](/img/blogs/tech/truncated-table/2.png)


Cause Analysis
====

Let's start with the implementation of the recycle bin in OceanBase Database and the implementation of the `TRUNCATE TABLE` statement in OceanBase Database V3.x and V4.x.

Implementation of the Recycle Bin
--------

The recycle bin is implemented by logically deleting data, where deleted objects are labeled with an internal identifier, making them invisible to users. Objects in the recycle bin have only their metadata changed. Their underlying data remains unchanged.

You can execute the `SHOW RECYCLEBIN` statement to view the information about all objects in the recycle bin. The object information is stored in an internal table named `__all_recyclebin`. When you move an object to the recycle bin, a record is inserted into the `__all_recyclebin` table. When you perform a `FLASHBACK` or `PURGE` operation, that record is deleted from the `__all_recyclebin` table.
![3](/img/blogs/tech/truncated-table/3.png)


To retain dropped tables in the recycle bin, OceanBase Database adds a default `__recyclebin` database whose `database_id` is `201004` for each tenant.
![4](/img/blogs/tech/truncated-table/4.png)


Dropping a table into the recycle bin is moving the table from its original database to the `__recyclebin` database, during which the `database_id` and `table_name` of the table are changed. The indexes on the dropped table are also moved to the recycle bin.
![5](/img/blogs/tech/truncated-table/5.png)


Therefore, the procedure of dropping a table into the recycle bin is as follows:

1.  The `database_id` and `table_name` values of the table are modified. The new database name is `__recyclebin`, and the new table name starts with `__recycle`.
2.  The table is moved to the recycle bin and a corresponding record is inserted into the `__all_recyclebin` table.
3.  The preceding steps are performed for the index tables of the dropped table.

The `FLASHBACK` operation restores a dropped table from the recycle bin. For more information, see [Restore objects from the recycle bin](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001029495).

The `PURGE` operation purges the recycle bin. It first deletes the information about an object from `__recyclebin` and then deletes the object from `__all_table` and `__all_table_history`. For more information, see [Purge the recycle bin](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001029492).

 Other objects such as tenants and databases are dropped into the recycle bin in a similar way.

  

Implementation of TRUNCATE TABLE
--------------------

### TRUNCATE TABLE in OceanBase Database V3.x

In OceanBase Database V3.x, a `TRUNCATE TABLE` statement is essentially the combination of a `DROP TABLE` statement and a `CREATE TABLE` statement. For example, if you execute `TRUNCATE TABLE t1`, `DROP TABLE t1` and `CREATE TABLE t1` are executed within the same transaction.

In other words, a truncated table and its data in OceanBase Database V3.x are moved into the recycle bin when the `DROP TABLE` statement is executed. This is why you can perform a `FLASHBACK` operation in OceanBase Database V3.x to restore an accidentally truncated table and its data.

### TRUNCATE TABLE in OceanBase Database V4.x

OceanBase Database V4.x has introduced the concept of tablets. Tablets, imperceptible to users, are migratable data blocks at the physical storage layer. For more information, see [What Are Tablets in OceanBase Database V4.0?](https://open.oceanbase.com/blog/1249578496) The `TRUNCATE TABLE` statement in OceanBase Database V4.x is implemented by modifying the corresponding tablets of partitions, instead of executing a `DROP TABLE` statement and a `CREATE TABLE` statement as in OceanBase Database V3.x. To be specific, truncating a table in OceanBase Database V4.x deletes old tablets and creates new tablets. This boosts performance in scenarios where a table has many associated objects such as columns, constraints, foreign keys, partitions, and indexes.

As `TRUNCATE TABLE` in OceanBase Database V4.x does not involve `DROP TABLE`, a truncated table is not moved to the recycle bin. When you truncate a table in OceanBase Database V4.x, the metadata of the table remains unchanged, and only the corresponding tablets are modified.

### Why the Change in OceanBase Database V4.x?

Users frequently truncating tables in OceanBase Database V3.x have found that the performance of the `TRUNCATE TABLE` statement in OceanBase Database was lower than that in Oracle. The performance overhead comes from two aspects: updating system tables and creating partitions. In OceanBase Database V3.x, partition creation requires creating Paxos groups and thereby involves many steps. In OceanBase Database V4.x, which adopts a single-log stream architecture, partition creation involves only operations on the data within the log stream, leading to a significant improvement in performance. To eliminate the performance overhead caused by updating system tables, the `TRUNCATE TABLE` statement must be implemented differently.

A user of OceanBase Database V3.x maintains tens of thousands of tables, each with hundreds of columns and check constraints. For each table, hundreds of records are stored in the `__all_column` and `__all_constraint` system tables. Every time when they perform a `TRUNCATE TABLE` operation, the system deletes metadata during the `DROP TABLE` operation and rewrites metadata during the `CREATE TABLE` operation. If the table is associated with many objects, this process takes forever to complete.

In OceanBase Database V4.x, `TRUNCATE TABLE` no longer modifies the metadata of a table, leaving system tables such as `__all_column` and `__all_constraint` unchanged during the truncation. Data is cleared by replacing tablets. The `__all_table` table has a column named `tablet_id` added to record the tablet of each table. When you truncate a table, OceanBase Database creates an empty tablet, uses the `tablet_id` value of the new tablet to overwrite the old value in the `__all_table` table, and then deletes the old tablet. For a partitioned table, a `tablet_id` value is recorded in the `__all_part` table for each partition. When you truncate a partitioned table, OceanBase Database replaces the corresponding tablet with a new, empty tablet for each partition.

The implementation of `TRUNCATE TABLE` in OceanBase Database V4.x is similar to that in Oracle. You can think of `table_id` and `tablet_id` in OceanBase Database V4.x as `object_id` and `data_object_id` in Oracle.

Other Noteworthy Points
==

Here are a few interesting but often overlooked aspects of the recycle bin feature.

Flash Back a Table by Using original_name
-----------------------------------

As stated in [FLASHBACK](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001031748), a topic currently dated September 12, 2023, when restoring a table from the recycle bin by using the `FLASHBACK` statement, you can only specify the corresponding object name (`object_name`) of the table in the recycle bin, not the original name (`original_name`) of the table before it was dropped.

Actually, OceanBase Database also allows you to specify `original_name`. If the recycle bin contains tables with the same original name, the `FLASHBACK original_name` statement restores the table that was last moved to the recycle bin. This is consistent with the recycle bin feature of Oracle.

Here is an example:
![6](/img/blogs/tech/truncated-table/6.png)
![7](/img/blogs/tech/truncated-table/7.png)

Purge a Table by Using original_name
-------------------------------

As stated in [PURGE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001031730), a topic currently dated September 12, 2023, when purging a table from the recycle bin by using the `PURGE` statement, you can only specify the corresponding object name (`object_name`) of the table in the recycle bin, not the original name (`original_name`) of the table before it was dropped.

Actually, OceanBase Database also allows you to specify `original_name`. If the recycle bin contains tables with the same original name, the `PURGE original_name` statement purges the table that was first moved to the recycle bin. This is consistent with the recycle bin feature of Oracle.

Here is an example:
![8](/img/blogs/tech/truncated-table/8.png)
![9](/img/blogs/tech/truncated-table/9.png)  




Let me put an end here. For any questions about the recycle bin feature of OceanBase Database, feel free to leave a comment.

  

References
====

   If you are interested, read the following posts:

   [What Is a Schema in OceanBase Database?](https://oceanbase.github.io/docs/blogs/tech/ob-schema)

   [Adaptive Techniques in the OceanBase Database Execution Engine](https://oceanbase.github.io/docs/blogs/tech/adaptive-sql-execution-engine)

   [Pushdown Techniques in OceanBase Database](https://open.oceanbase.com/blog/5382203648)