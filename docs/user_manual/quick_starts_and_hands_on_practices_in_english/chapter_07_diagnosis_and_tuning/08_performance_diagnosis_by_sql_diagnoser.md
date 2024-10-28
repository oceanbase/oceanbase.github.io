---
title: Use SQL Diagnoser to diagnose and analyze SQL performance issues
weight: 9
---

# 7.8 Use SQL Diagnoser to diagnose and analyze SQL performance issues

This topic describes how to use SQL Diagnoser to diagnose and analyze SQL performance issues. We recommend that you use this tool in troubleshooting.

## Overview

SQL Diagnoser is an agile SQL diagnostic tool for OceanBase Database. It provides the following features:

- SQL advisor: You can use this feature on the GUI to directly analyze the SQL statements executed in a business cluster to find common suspicious SQL statements. This feature helps you identify hidden performance issues and provides optimization suggestions.

- SQL review: You can use this feature on the GUI by simply entering the SQL statement that you want to review. Then this feature analyzes the SQL statement based on common diagnostic items and provides suggestions for improvement.

As shown in the following figure, SQL Diagnoser contains two diagnostic rule engines.

- The static rule engine functions based on SQL syntax parsing. It parses the SQL syntax tree and implements static rules such as predicate calculus and implicit conversion rules based on the nodes of the SQL syntax tree.

- The dynamic rule engine queries the internal performance views `gv$(ob_)sql_audit` and `gv$(ob_)plan_cache_plan_stat` of OceanBase Database as well as tables and indexes to analyze SQL statement exceptions.

![Architecture](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_07_diagnosis_and_tuning/08_performance_diagnosis_by_sql_diagnoser/001.png)

## Use SQL Diagnoser

### Start SQL Diagnoser

1. Decompress the package.

2. Open the package.

3. Run the following command. `-Dserver.port=9090` specifies the port number. If this parameter is not specified, port `8080` is used by default.

   ```bash
   java -Dserver.port=9090 -jar sql-diagnoser-4.2.0.0.jar &
   ```

> **Note**
>
> If you deploy SQL Diagnoser in a production environment, use a Java virtual machine (JVM) parameter to specify the maximum memory size for this process to prevent it from occupying excessive memory.

### Stop SQL Diagnoser

1. Run the following command to query the process ID.
  
   ```bash
   ps -ef  |  grep sql-diagnoser
   ```

2. Run the following command to stop the process.

   ```bash
   kill -9 <Process ID>
   ```

### Features

#### Tenant SQL diagnostics

You can use this feature to directly analyze a business cluster to find common suspicious SQL statements. This feature helps you identify hidden performance issues and provides suggestions on index optimization and SQL rewriting.

| Full table scan with unused index | Indexes are created for tables involved in the SQL statement for full table scan. |
| --- | --- |
| Full table scan without available index | No indexes are created for tables involved in the SQL statement for full table scan. |
| Poor performance despite the use of index | Despite the use of indexes, the SQL performance is still poor because the response time or CPU time is too long. |
| Hint with no effect | The indexes specified in the hints are not used during SQL execution. |
| Too many partitions involved | During SQL execution, too many irrelevant partitions are involved in the calculation, wasting system resources. |

**The following diagnostic items are designed based on development specifications. They affect the response time of SQL statements and also increase the system load.**

| Too many rows affected | The number of rows affected by SQL execution exceeds the specified threshold. |
|-------------|------------------------|
| Too many rows returned | The number of rows returned from SQL execution exceeds the specified threshold. |
| Too many tables involved in SQL execution | The number of tables involved in SQL execution exceeds the specified threshold. |

#### Procedure

1. Obtain logon connection information of a user, log on to OceanBase Database by using the connection information, and verify that the user has the privilege to access tables in the `oceanbase` and `information_schema` databases.

2. Specify the following fields on the page that appears, and then click **One-click Diagnostics**.

    

   The fields are described as follows:

   - **Response Time**: The response time of SQL statements. SQL statements whose execution time exceeds this value will be returned for analysis.

   - **Samples**: The number of SQL statements collected for diagnostics each time. The default value is `10000`. You can modify this field based on your business needs.

   - **Logon User**: The username used to log on to OceanBase Database. If you directly connect to an OBServer node, specify the username in the format of `user@tenant`, for example, `root@ocp_meta`. If you connect to an OceanBase cluster through ODP, specify the username in the format of `user@tenant#cluster`, for example, `root@ocp_meta#obcluster`.

#### SQL review

You can use this feature to analyze table schemas and SQL statement structures to identify SQL syntax errors. This feature does not execute SQL statements. We recommend that you review the SQL statements before you launch new business.

#### Diagnostic items of SQL review

- 0001 Diagnostic item 1 related to indexes: The indexed column in the query condition involves calculation, for example, `ID+1=10`, which invalidates the index and causes a failure to extract the query range.

- 0002 Diagnostic item 2 related to indexes: The indexed column in the query condition uses fuzzy match or prefix fuzzy match.

- 0003 Diagnostic item 3 related to indexes: The indexed column in the query condition involves implicit data type conversion or precision conversion.

- 1001 Diagnostic item 1 related to execution plans: Too many `in` conditions exist. We recommend that you use no more than 200 `in` conditions, for example, `in(?,?,?..) `.

- 1002 Diagnostic item 2 related to execution plans: Too many table connections exist. We recommend that you use no more than 10 table connections. Otherwise, no optimal plan is available after pruning.

- 1003 Diagnostic item 3 related to execution plans: The `not in` clause must contain the `not null` constraint to avoid nested-loop joins.

- 2001 Diagnostic item 1 related to high-risk SQL statements: The `UPDATE` or `DELETE` statement does not contain the `WHERE` condition, or the `WHERE` condition is identically true.

- 2002 Diagnostic item 2 related to high-risk SQL statements: We recommend that you use the `not in` clause with caution. It involves special logic for processing null values, and the semantics are difficult to control.

- 2003 Diagnostic item 3 related to high-risk SQL statements: We recommend that you do not use the `INSERT` or `REPLACE` statement without fields.

- 3001 Diagnostic item 1 related to performance: The `UPDATE`, `DELETE`, or `SELECT` statement does not contain an index key, resulting in a full table scan.

- 3002 Diagnostic item 2 related to performance: The operation on the partitioned table does not contain a partitioning key, and thus partitions cannot be pruned.

- 4001 Diagnostic item 1 related to DDL operations: Too many indexes exist, which are redundant.

- 4002 Diagnostic item 2 related to DDL operations: Data skew occurs in the indexed column, leading to poor performance.

- 4003 Diagnostic item 3 related to DDL operations: When you create an index, you must manually specify the `global` or `local` keyword. We recommend that you use a local index.

- 4004 Diagnostic item 4 related to DDL operations: Too many table fields exist.

#### Procedure

1. In input area 1, enter the tenant connection information. The logon user must have at least the read privilege on business databases. SQL review will not execute the SQL statement.

2. Enter SQL text in the text box. The SQL text must be a string without Chinese characters.

3. Click **One-click Review**. The rewriting suggestions will be displayed at the bottom.