---
title: Compatibility between OceanBase Database and MySQL
weight: 2
---

# 4.1 Compatibility between OceanBase Database and MySQL

To migrate or synchronize data between heterogeneous databases, you need to first learn about the compatibility between these databases in terms of, for example, data types, character sets, collations, and indexes. Data migration or synchronization between incompatible databases will inevitably fail. That is why you need to grasp features and characteristics of source databases, and check whether they are compatible with destination databases before migration, and if not, whether other better alternatives are available. This topic describes the compatibility between OceanBase Database V4.2.1 and MySQL 8.x. You can check the compatibility between OceanBase Database and other databases by referring to this topic. 

OceanBase Database in MySQL mode is compatible with most features and statements of MySQL 5.7 or 8.0. In this topic, differences between OceanBase Database in MySQL mode and native MySQL are described in the following aspects: data types, strings, procedural language (PL) features, system views, character sets, collations, indexes, SQL_MODE, partitions, and backup and restore. 

> **Note**
>
> For information about compatibility between OceanBase Database of other versions and MySQL, see [Compatibility with MySQL](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103402) in OceanBase Database documentation of the target versions. 

## Data types

OceanBase Database supports all data types of MySQL except the `SERIAL` type. 

## Length comparison of string types

| Type | MySQL 8.0 | OceanBase Database V4.2.1 |
| ---------- | ------------------------------- | --------------------- |
| CHAR | 255 characters | 256 characters |
| VARCHAR | 65,535 characters (around 16,383 characters in fact) | 262,144 characters |
| BINARY | 255 bytes | 256 bytes |
| VARBINARY | 65,535 bytes (around 65,532 characters in fact) | 1,048,576 bytes |
| TINYBLOB | 255 bytes | 255 bytes |
| BLOB | 65,535 bytes | 65,536 bytes |
| MEDIUMBLOB | 16,777,215 bytes | 16,777,216 bytes |
| LONGBLOB | 4,294,967,295 bytes (4 GB) | 536,870,911 bytes |
| TINYTEXT | 255 bytes | 255 bytes |
| TEXT | 65,535 bytes | 65,536 bytes |
| MEDIUMTEXT | 16,777,215 bytes | 6,777,216 bytes |
| LONGTEXT | 4,294,967,295 bytes (4 GB) | 536,870,911 bytes |

## PL features

OceanBase Database Community Edition is compatible with most PL features of MySQL. For more information, see [PL reference](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104171). 

OceanBase Database supports the following PL features:

* Data types

* Stored procedures

* Custom functions

* Triggers

* Exception handling

OceanBase Database also provides particular MySQL PL packages, such as `DBMS_RESOURCE_MANAGER`, `DBMS_STATS`, `DBMS_UDR`, `DBMS_XPLAN` and `DBMS_WORKLOAD_REPOSITORY`. 

## System views

OceanBase Database implements most views of two internal databases: `information_schema` and `mysql`. However, due to the differences from MySQL in architecture, OceanBase Database cannot implement all the views of MySQL or ensure consistency with MySQL in definitions of all columns in the views. 

For more information about the columns in system views, see [Overview](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103435). 

## Character sets and collations

This section describes only the character sets and collations supported by OceanBase Database Community Edition V4.2.1. 

> **Notice**
>
> The supported character sets and collations may vary in different versions. If you use OceanBase Database Community Edition of a version other than V4.2.1, run the `show charset` and `show collation` commands to view the supported character sets and collations. 

The following table describes the character sets and collations supported by OceanBase Database Community Edition.

| Character set | Collation | Description |
| ------------ | ----------------------- | ------------------------------------------------------------------ |
| utf8mb4 | utf8mb4_general_ci | A general collation.  |
| utf8mb4 | utf8mb4_bin | A binary collation.  |
| binary | binary | A binary collation.  |
| gbk | gbk_chinese_ci | A collation for Chinese.  |
| gbk | gbk_bin | A binary collation.  |
| utf16 | utf16_general_ci | A general collation.  |
| utf16 | utf16_bin | A binary collation.  |
| gb18030 | gb18030_chinese_ci | A collation for Chinese.  |
| gb18030 | gb18030_bin | A binary collation.  |
| latin1 | latin1_swedish_ci | A collation for Swedish/Finnish.  |
| latin1 | latin1_bin | A binary collation.  |
| gb18030_2022 | gb18030_2022_bin | A binary collation.  |
| gb18030_2022 | gb18030_2022_chinese_ci | A Pinyin collation for Chinese. The collation is case-insensitive. This is the default collation for this character set in MySQL mode.  |
| gb18030_2022 | gb18030_2022_chinese_cs | A Pinyin collation for Chinese. The collation is case-sensitive.  |
| gb18030_2022 | gb18030_2022_radical_ci | A radical stroke collation for Chinese. The collation is case-insensitive.  |
| gb18030_2022 | gb18030_2022_radical_cs | A radical stroke collation for Chinese. The collation is case-sensitive.  |
| gb18030_2022 | gb18030_2022_stroke_ci | A stroke collation for Chinese. The collation is case-insensitive.  |
| gb18030_2022 | gb18030_2022_stroke_cs | A stroke collation for Chinese. The collation is case-sensitive.  |

For more information about character sets and collations, see [Character set and collation](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106903). 

## Indexes

The following table describes index types that are supported in MySQL but not in OceanBase Database. 

| Index type | Index data structure | MySQL | OceanBase Database |
| -------- | ------------ | ------------ | ---------------- |
| Index extension | B-tree | Supported | Not supported |
| Descending index | B-tree | Supported | Not supported |
| Full-text index | B-tree | Supported | Not supported |
| HASH index | B-tree | Supported | Not supported |
| LOCK option | / | Supported | Not supported |
| Index merge | B-tree | Supported | Not supported |

For more information about indexes, see [Indexes](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106626). 

## SQL_MODE

OceanBase Database V4.2.1 supports all SQL_MODE values that are supported by MySQL. For more information, see [sql_mode](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105329). 

## Partitions

The partition support feature of OceanBase Database is different from that of MySQL.

* OceanBase Database supports partitioning, template-based subpartitioning, and non-template-based subpartitioning. MySQL does not support non-template-based subpartitioning. 

* OceanBase Database supports the following subpartitioning methods: HASH, KEY, RANGE, RANGE COLUMNS, LIST, and LIST COLUMNS. MySQL supports only HASH and KEY subpartitioning. 

For more information, see [Create and manage partitions](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105785). 

## Backup and restore

OceanBase Database is compatible with some backup and restore features of MySQL. For example, OceanBase Database supports the following features:

* Full backup and incremental backup. 

* Hot backup. 

* Table-level restore. 

OceanBase Database does not support the following features:

* Cluster-level backup or restore. 

* Cold backup. 

* Validation of backup data. 

* Backup or restore for some databases within tenants. 
