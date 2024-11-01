---
slug: ob-schema
title: 'What Is a Schema in OceanBase Database?'
---
# What Is a Schema in OceanBase Database?

In the OceanBase open source community, questions like "What is a schema?" are often seen.

![1691459740](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459740667.png)

**Many mistakenly believe schemas and databases are synonymous in OceanBase Database. In this article, we talk about what a schema truly is.**

In short, the meaning of a schema differs across MySQL and Oracle modes of OceanBase Database and its metadata management module.

Schema in OceanBase Database in MySQL Mode
=======================

       Schema is a synonym for database. You can replace DATABASE with SCHEMA in SQL statements. For example, you can replace CREATE DATABASE with CREATE SCHEMA.

Schema in OceanBase Database in Oracle Mode
========================

       In OceanBase Database in Oracle mode, a schema is a collection of database objects owned by a user. It provides privilege management and namespace isolation, similar to a user space. Schema objects are database objects in a specific schema, such as tables, views, and indexes. Non-schema objects are database objects that do not belong to a specific schema, such as users, roles, and tablespaces.

 When a user is created, it has a default schema with the same name as the username. With appropriate privileges, a user can access and use objects in other schemas. When you access an object without specifying a schema, the system automatically adds the default schema name of the object.

 If the user you currently use has the necessary privileges to access or modify objects in other schemas, you can switch to another schema by executing `alter session set current_schema = other_schema_name;`. This allows you to work within the context of the specified schema.

  

Schema in the Metadata Management Module of OceanBase Database
======================

![1691459773](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459773537.png)

       In the metadata management module of OceanBase Database, a schema refers to the complete set of metadata describing database objects that must be synchronized across a cluster. This includes, but is not limited to, metadata for tables, databases, and users. Additionally, OceanBase Database employs a multi-version schema approach, ensuring eventual consistency of in-memory schema information across the cluster.

What does a schema encompass?
============

       After understanding that a schema represents metadata, you may naturally wonder, "What does the metadata encompass?"

![1691459787](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459787349.png)

       The preceding answer requires clarification. Metadata for database objects is exclusively modified by DDL statements. In contrast, estimated row counts are influenced solely by DML statements and are therefore statistical information, not metadata. Consequently, estimated row counts are not part of the table schema.

 For a comprehensive understanding of what constitutes metadata, refer to the code under `src/share/schema`. For example, to view the table metadata stored in the table schema, check the members of the `ObTableSchema` class and its parent classes in [ob\_table\_schema.h](https://github.com/oceanbase/oceanbase/blob/9940650223427978ac634ff0d7423ab53c74a95e/src/share/schema/ob_table_schema.h#L821).

![1691459798](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459798799.png)

  

Execution Process of DDL Statements
========

       You now understand what a schema is and its components. As a schema can be modified only through DDL statements, we briefly explain their execution process to help troubleshoot DDL issues.

       DDL statements are not processed by the optimizer; instead, they are sent as commands to a RootServer (RS) for processing. The following figure shows the execution process in OceanBase Database.

![1691459810](/img/blogs/tech/ob-schema/1691459810134.png)

       Let's use a common CREATE TABLE statement as an example:

       The OBServer resolves the CREATE TABLE statement, stores the table information in create\_table\_arg, and sends create\_table\_arg to the RS through a remote procedure call (RPC). The RS then performs the following operations:

*   Check whether the schema used by the OBServer during resolution is of the latest version through optimistic locking. If not, retry the entire DDL statement.
*   Obtain a new, monotonically increasing table ID within the tenant from the \_\_all\_sys\_stat table.
*   Persist the information provided in create\_table\_arg to internal tables such as \_\_all\_table\_history for durability.
*   Record the DDL change log in the \_\_all\_ddl\_operation table for use in scenarios such as incremental refreshes.
*   Publish the updated schema by notifying all nodes to refresh their in-memory schema cache.

![1691461106](/img/blogs/tech/ob-schema/1691461106276.png)

  

       Upon receiving the PUBLISH SCHEMA command from the RS, other OBServers load the incremental schema changes from the internal tables into their in-memory schema cache. This process is often referred to as a "schema refresh."

       What happens when the DDL service on the RS calls publish_schema() to broadcast the new schema version to all OBServers?

1.  The OBServer where the RS resides calls refresh\_schema directly.
2.  Every other alive OBServer receives a switch\_schema command, with the value of the schema\_version parameter being the latest schema version.
3.  Upon receiving the command, each OBServer generates an ObSchemaRefreshTask to asynchronously refresh its schema to the latest version.

![1691459823](/img/blogs/tech/ob-schema/1691459823348.png)

  

Here is another figure.

*   The upper part of the figure shows DDL statement execution, during which the DDL service on the RS writes data to the internal tables and notifies each OBServer to load metadata changes into their in-memory schema cache.
*   The lower part of the figure shows query execution, during which metadata is read from the in-memory schema cache.

![1691459832](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459832525.png)

  

The GV$OB\_SERVER\_SCHEMA\_INFO view in the question mentioned at the beginning of this article provides the information about the latest refreshed schema version for each tenant on every OBServer. Key schema information in this view includes REFRESHED\_SCHEMA\_VERSION, SCHEMA\_COUNT, and SCHEMA\_SIZE, defined as follows:

*   REFRESHED\_SCHEMA\_VERSION: the schema version refreshed for the tenant on the OBServer.
*   RECEIVED\_SCHEMA\_VERSION: the schema version in the latest refresh task received from the RS for the tenant on the OBServer.
*   SCHEMA\_COUNT: the total number of schema objects, such as tables and databases, for the schema version.
*   SCHEMA\_SIZE: the total memory used by the schema objects for the schema version, in bytes.

    obclient> select * from oceanbase.GV$OB_SERVER_SCHEMA_INFO\G
    *************************** 1. row ***************************
                        SVR_IP: 11.158.31.20
                      SVR_PORT: 22602
                     TENANT_ID: 1002
      REFRESHED_SCHEMA_VERSION: 1690109029768968
       RECEIVED_SCHEMA_VERSION: 1690113309637344
                  SCHEMA_COUNT: 1583
                   SCHEMA_SIZE: 1537240
    MIN_SSTABLE_SCHEMA_VERSION: -1
    1 row in set (0.01 sec)

Troubleshooting of DDL and Schema Issues
====================

       Now that we've discussed so much, let's move on to some typical DDL and schema issues. Feel free to share any good troubleshooting methods you've found.

How do I modify the syntax of a DDL statement when it fails with a syntax error?
----------------------

       Customers often attempt to migrate metadata from their existing databases to OceanBase Database Community Edition. For example, we recently encountered a customer who tried to apply a PostgreSQL partitioned table definition to a tenant in OceanBase Database in MySQL mode. The execution failed and the customer mistakenly concluded that OceanBase Database does not support partitioned tables.

    CREATE TABLE value_stream_dashboard_counts (
        id bigint NOT NULL,
        namespace_id bigint NOT NULL,
        count bigint NOT NULL,
        metric smallint NOT NULL
    )
    PARTITION BY RANGE (id);

![1691459848](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459848425.png)

       How do I troubleshoot syntax errors in OceanBase Database in MySQL mode? A common approach is to consult the various OceanBase syntax documentation resources. However, OceanBase syntax is evolving rapidly as its MySQL compatibility improves. The documentation may not accurately reflect the currently supported syntax, and even eventual consistency cannot be guaranteed. A senior colleague once wisely said, "Documentation can be misleading, but code never lies." All syntax supported by OceanBase Database Community Edition is defined in a Yet Another Compiler Compiler (Yacc) file named [sql\_parser\_mysql\_mode.y](https://github.com/oceanbase/oceanbase/blob/9940650223427978ac634ff0d7423ab53c74a95e/src/sql/parser/sql_parser_mysql_mode.y#L4391).

       With the syntax rules in this file, we can easily correct the preceding SQL statement for execution in OceanBase Database in MySQL mode.

    CREATE TABLE value_stream_dashboard_counts (
        id bigint NOT NULL,
        namespace_id bigint NOT NULL,
        count bigint NOT NULL,
        metric smallint NOT NULL
    )
    PARTITION BY RANGE (id)(
         PARTITION p0 VALUES LESS THAN (100),
         PARTITION p1 VALUES LESS THAN (200),
         PARTITION p2 VALUES LESS THAN (300),
         PARTITION p3 VALUES LESS THAN MAXVALUE
    );

  


How do I troubleshoot a DDL statement that failed with a vague error?
----------------------------

       For example, I encountered an error while executing a DDL statement. The error message indicated that a check constraint contains an invalid expression, but it did not pinpoint the offending part of the expression. Was the issue with the column `c1`, the equality operator `=`, the function `sysdate()`, or the entire expression `c1 = sysdate()`?

    obclient> create table t1(c1 int, check (c1 = sysdate()));
    ERROR 3814 (HY000): An expression of a check constraint contains disallowed function.

       First, query the trace\_id of the failed statement.

    select last_trace_id();
    +------------------------------------+
    | last_trace_id()                    |
    +------------------------------------+
    | Y584A0B9E1F14-00060127094761A8-0-0 |
    +------------------------------------+
    1 row in set (0.00 sec)

       Then, run `grep Y584A0B9E1F14-00060127094761B0-0-0 observer.log\*` to obtain the OBServer logs.

![1691459866](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459866653.png)

       The first warning log for this trace indicates that a deterministic expression is wrongly specified in the check constraint. However, it actually means a non-deterministic expression is used, which is not allowed.

       To understand what constitutes a non-deterministic expression, refer to the code based on the file name and line number indicated in the log, such as [ob\_raw\_expr\_util.cpp:1856](https://github.com/oceanbase/oceanbase/blob/9940650223427978ac634ff0d7423ab53c74a95e/src/sql/resolver/expr/ob_raw_expr_util.cpp#L1856). You can navigate to the definition of a specific function on the web page, such as [ObRawExpr::is\_non\_pure\_sys\_func\_expr](https://github.com/oceanbase/oceanbase/blob/master/src/sql/resolver/expr/ob_raw_expr.cpp#L832).

       All non-deterministic expressions are listed there, including sysdate, which was used in the failed statement.

![1691459880](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459880888.png)

       We can infer that the expression within a check constraint must be deterministic, producing the same result each time the expression is executed. The sysdate expression, which returns the current time, produces a different result upon each execution and is thus not allowed in check constraints. This is a good opportunity to explore other examples of non-deterministic expressions.

What do I do if I am unable to obtain useful logs after executing a DDL statement?
-------------------

       For example, I executed a DDL statement to create a database, but it failed with an error.

    obclient> create database xiaofeng_db;
    ERROR 4016 (HY000): Internal error
    
    obclient> select last_trace_id();
    +------------------------------------+
    | last_trace_id()                    |
    +------------------------------------+
    | Y584A0B9E1F14-00060127094761B4-0-0 |
    +------------------------------------+
    1 row in set (0.00 sec)

I tried running `grep Y584A0B9E1F14-00060127094761B4-0-0 observer.log*` to obtain logs based on the trace ID, but only found an RPC error.

![1691459893](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459892911.png)

Since DDL::Arg is sent to the RS for execution, the issue likely originated there. Therefore, run `grep Y584A0B9E1F14-00060127094761B4-0-0 rootservice.log* | vi -` to obtain the RS logs, and search for the first occurrence of `ret=-4016` in the log file based on the error code 4016.

  

       The error log indicates that the issue occurred on line 2887 of the `ob\_root\_service.cpp` file. The error message is "create\_database failed, because db\_name is forbidden." We encourage you to first analyze the issue based on the file name and line number in the error log. If the cause remains unclear, contact OceanBase Database Technical Support for assistance.

       The file contains an intentionally added error code to simulate errors on the RS. Any attempt to create a database named xiaofeng\_db will trigger a 4016 OB\_ERR\_UNEXPECTED error.

The `rootservice.log` file is often overlooked during the troubleshooting of DDL and schema issues. Even many highly experienced OceanBase kernel developers have wasted considerable time debugging a minor bug due to this oversight. If you find no clue in the `observer.log` file when troubleshooting this type of issues, remember to check the `rootservice.log` file.

![1691459923](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-08/1691459923618.png)

What do I do if OBServers hang during schema refreshes?
--------------------

       A schema refresh involves loading data from internal tables into memory and verifying schema validity. If the verification fails, it indicates an issue with the metadata persisted in the internal tables, causing OBServers to hang. This happens because executing DDL statements, DML statements, or queries based on corrupted metadata may incur many data correctness issues. This situation is rare but can cause severe consequences.

       If a DDL statement hangs and messages such as "Trying so hard to die" and "schema meta is still not consistent after rebuild, need fixing" appear in the RS logs, manual intervention is needed to restore the environment by modifying incorrect data in the OceanBase Database internal tables. This process is risky. We recommend that you contact OceanBase Database Technical Support for assistance in diagnosing the root cause and restoring your environment. If you are using OceanBase Database Community Edition, join DingTalk group 33254054 and contact the group administrator.

References
====

Overview of database objects in MySQL mode: [https://www.oceanbase.com/docs/common-oceanbase-database-10000000001702409](https://www.oceanbase.com/docs/common-oceanbase-database-10000000001702409)

Overview of database objects in Oracle mode: [https://www.oceanbase.com/docs/common-oceanbase-database-10000000001702405](https://www.oceanbase.com/docs/common-oceanbase-database-10000000001702405)

Answer from Yanmu in the Q&A section of the OceanBase community: [https://ask.oceanbase.com/t/topic/35601662/3](https://ask.oceanbase.com/t/topic/35601662/3)

Source code of OceanBase Database: [https://github.com/oceanbase/oceanbase/blob/9940650223427978ac634ff0d7423ab53c74a95e/src/share/schema/ob\_table\_schema.h#L821](https://github.com/oceanbase/oceanbase/blob/9940650223427978ac634ff0d7423ab53c74a95e/src/share/schema/ob_table_schema.h#L821)