---
title: Perform database development in a MySQL tenant
weight: 2
---

# 6.1 Perform database development in a MySQL tenant

This topic describes how to connect to and access OceanBase Database in MySQL mode, and how to perform database development, such as data read/write and transaction processing. OceanBase Database supports a variety of connection methods, including command-line clients, the GUI client OceanBase Developer Center (ODC), and database drivers in various programming languages. OceanBase Database in MySQL mode is compatible with most features and statements of MySQL 5.7 or 8.0, and provides unique extended features, such as partitioned tables, global indexes, recycle bins, table groups, sequences, flashback queries, and replicated tables.

## Connection methods

You can connect to OceanBase Database by using a client, a driver, or an Object Relational Mapping (ORM) framework.

### Clients

You can connect to a MySQL tenant of OceanBase Database by using any of the following clients:

#### MySQL client (mysql)

The mysql client is a MySQL CLI tool that must be separately installed. OceanBase Database Community Edition supports only MySQL tenants. You can use a MySQL client to access a MySQL tenant. This section describes in detail how to connect to OceanBase Database by using the mysql client. You can refer to this section when you configure other clients and GUI tools.

##### Prerequisites

Before you connect to OceanBase Database by using the mysql client, make sure that the following conditions are met:

* The mysql client is installed on your server. OceanBase Database supports the mysql client of the following versions: 5.5, 5.6, and 5.7.

* The environment variable `PATH` contains the directory where the mysql client is located.

* The client is in the allowlist of the tenant. For more information about how to query and configure a tenant allowlist, see [View and set the tenant allowlist](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375924).

##### Connect to OceanBase Database

1. Open a command shell.

2. Connect to a MySQL tenant by running a MySQL command.

   * To connect to the MySQL tenant by using an OceanBase Data Proxy (ODP), run the following command:

     ```sql
     $mysql -h10.10.10.1 -uusername@obmysql#obdemo -P2883 -p****** -c -A -Doceanbase
     ```

     or

     ```sql
     $mysql -h10.10.10.1 -uobdemo:obmysql:username -P2883 -p****** -c -A -Doceanbase
     ```

     The parameters are described as follows:

     * `-h`: the IP address for connecting to OceanBase Database, which is usually the IP address of the ODP.

     * `-u`: the tenant account. The following formats are supported: `Username@Tenant name#Cluster name`, `Cluster name:Tenant name:Username`, `Cluster name-Tenant name-Username`, and `Cluster name.Tenant name.Username`. You can use the mysql client to connect only to a MySQL tenant. The default username of the administrator of a MySQL tenant is `root`.

     * `-P`: the port for connecting to OceanBase Database, which is also the listening port of the ODP. The default value is `2883`, which can be customized when ODP is deployed.

     * `-c`: specifies not to ignore comments in the runtime environment of MySQL. Hints are special comments that are not affected by the `-c` parameter.

     * `-A`: specifies not to automatically retrieve the statistical information when connecting to a MySQL tenant.

     * `oceanbase`: the name of the database to access. You can change it to the name of a business database.

     Here is an example:

     ```sql
     $mysql -h10.10.10.1 -u******@obmysql#obdemo -P2883 -p****** -c -A oceanbase
     ```

     or

     ```sql
     $mysql -h10.10.10.1 -uobdemo:obmysql:****** -P2883 -p****** -c -A -Doceanbase
     ```

   * To directly connect to an OBServer node of the MySQL tenant, run the following command:

     ```sql
     $mysql -h10.10.10.1 -uusername@obmysql -P2881 -p****** -c -A -Doceanbase
     ```

     The parameters are described as follows:

     * `-h`: the IP address for connecting to OceanBase Database, which is usually the IP address of an OBServer node.

     * `-u`: the tenant account in the following format: `Username@Tenant name`. You can use the mysql client to connect only to a MySQL tenant. The default username of the administrator of a MySQL tenant is `root`.

     * `-P`: the port for connecting to OceanBase Database. The default value is `2881`, which can be customized when OceanBase Database is deployed.

     * `-p`: specifies the account password. For security reasons, you do not need to specify this parameter. In that case, you will be prompted to enter a password later. The password is masked.

     * `-c`: specifies not to ignore comments in the runtime environment of MySQL. Hints are special comments that are not affected by the `-c` parameter.

     * `-A`: specifies not to automatically retrieve the statistical information when connecting to a MySQL tenant.

     * `oceanbase`: the name of the database to access. You can change it to the name of a business database.

   > **Note**
   >
   > When you use the direct connection method, make sure that the tenant resources are distributed on the OBServer node you specified. Otherwise, you cannot connect to the tenant by using this OBServer node.

##### Common errors

* Business database connection errors
  
  ```shell
  $mysql -h10.10.10.1 -u******@obmysql#obdemo -P2883 -p****** -c -A -Doceanbaseerror
  ```

  The output is as follows:
  
  ```shell
  mysql: [Warning] Using a password on the command line interface can be insecure.
  ERROR 1049 (42000): Unknown database 'oceanbaseerror'
  ```

* Incorrect cluster name
  
  ```shell
  $mysql -h10.10.10.1 -u******@obmysql#obdemoerror -P2883 -p****** -c -A -Doceanbase
  ```

  The output is as follows:

  ```shell
  mysql: [Warning] Using a password on the command line interface can be insecure.
  ERROR 4669 (HY000): cluster not exist
  ```

* Incorrect tenant name
  
  ```shell
  $mysql -h10.10.10.1 -u******@obmysqlerror#obdemo -P2883 -p****** -c -A -Doceanbase
  ```

  The output is as follows:

  ```shell
  mysql: [Warning] Using a password on the command line interface can be insecure.
  ERROR 4012 (HY000): Get Location Cache Fail
  ```

* Incorrect password
  
  ```shell
  $mysql -h10.10.10.1 -u******@obmysql#obdemo -P2883 -p******error -c -A -Doceanbase
  ```

  The output is as follows:

  ```shell
  ERROR 1045 (42000): Access denied for user 'root'@'xxx.xxx.xxx.xxx' (using password: YES)
  ```

* Direct connection to an OBServer node with the cluster name specified
  
  ```shell
  $mysql -h10.10.10.1 -u******@obmysql#obdemo -P2881 -p******error -c -A -Doceanbase
  ```

  The output is as follows:

  ```shell
  ERROR 1045 (42000): Access denied for user 'root'@'xxx.xxx.xxx.xxx' (using password: YES)
  ```

* Incorrect port
  
  ```shell
  $mysql -h10.10.10.1 -u******@obmysql#obdemo -P2889 -p****** -c -A -Doceanbase
  ```

  The output is as follows:

  ```shell
  mysql: [Warning] Using a password on the command line interface can be insecure.
  ERROR 2003 (HY000): Can't connect to MySQL server on '10.10.10.1' (111)
  ```

#### OBClient

OBClient is an interactive query tool that supports batch processing. It must be installed separately. OBClient provides a CLI and acts as the client when it is connected to OceanBase Database. It supports Oracle and MySQL tenants of OceanBase Database. After you connect to OceanBase Database, you can use OBClient to run database commands (including general MySQL commands) and execute SQL and PL/SQL statements.

##### Prerequisites

* The OBClient application is downloaded and installed. To download OBClient of the required version, go to [OceanBase Download Center](https://en.oceanbase.com/softwarecenter).

* The client is in the allowlist of the tenant. For more information about how to query and configure a tenant allowlist, see [View and set the tenant allowlist](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375924).

##### Connect to OceanBase Database

* To connect to OceanBase Database by using an ODP, run the following command:

  ```sql
  obclient -h10.10.10.1 -uusername@obtenant#obdemo -P2883 -p****** -c -A -Doceanbase
  ```
  
  or
  
  ```sql
  obclient -h10.10.10.1 -uobdemo:obtenant:username -P2883 -p****** -c -A -Doceanbase
  ```

* To directly connect to an OBServer node, run the following command:

  ```sql
  obclient -h10.10.10.1 -uusername@obtenant -P2881 -p****** -c -A -Doceanbase
  ```

For more information about parameters in the commands, see the parameter description for the mysql client.

#### ODC

ODC is an enterprise-level collaborative database development tool tailored for OceanBase Database.

ODC allows you to connect to a MySQL tenant of OceanBase Database and a MySQL database. ODC is provided in two forms: Client ODC and Web ODC. Client ODC focuses on database development. It is lightweight and easy to deploy on Windows, macOS, and Linux. While functioning as a tool platform, Web ODC also provides collaborative management features to ensure the security, compliance, and efficiency of database changes.

##### Prerequisites

You have deployed ODC. For more information, see [Deployment Guide](https://en.oceanbase.com/docs/common-odc-10000000001510636).

##### Examples

For more information about how to connect to an OceanBase Database tenant by using ODC, see [Connect to OceanBase Database by using ODC](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104075).

##### Considerations

When you connect to a data source by using ODC, the cluster name is optional on the connection creation page. If you connect directly to an OBServer node, do not specify the cluster name; otherwise, the connection will fail.

#### DBeaver

DBeaver is a general database client. It connects to a database through the Java Database Connectivity (JDBC) driver provided by the database. It supports normal relational databases, non-relational databases, and distributed databases.

You can use DBeaver in a variety of scenarios such as development, debugging, management, and maintenance of OceanBase Database, data analysis and visualization, database migration and synchronization, and learning and training.

##### Prerequisites

* You have downloaded and installed DBeaver. You can download the DBeaver installation package for your operating system from the [DBeaver Community website](https://dbeaver.io/download/).

* You have obtained the JDBC driver for DBeaver to connect to OceanBase Database. The default driver file is `mysql-connector-java-5.1.44`. Driver files of version 5.x all support connection to MySQL tenants of OceanBase Database. You can also go to the [MySQL Product Archives](https://downloads.mysql.com/archives/c-j/) page at the official website of MySQL and download another V5.x driver file.

* The IP address of the OBServer node to be connected has access to the server where DBeaver is installed.

* You have installed OceanBase Database and created a MySQL tenant.

##### Connect to OceanBase Database

For more information about how to connect to an OceanBase Database tenant by using DBeaver, see [Connect to OceanBase Database by using DBeaver](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375978).

##### Considerations

OceanBase Database in MySQL mode does not support the EVENT feature. You can ignore event-related error messages when you connect to OceanBase Database.

#### Navicat

Navicat is a general database client. It connects to a database through the JDBC driver provided by the database. It supports normal relational databases, non-relational databases, and distributed databases. You can connect to a MySQL tenant of OceanBase Database by using the OceanBase or MySQL driver that comes with Navicat.

##### Prerequisites

* You have downloaded and installed Navicat. You can download the Navicat installation package for your operating system from the [Navicat Premium website](https://www.navicat.com/en/company/press/107-pres).

* The IP address of the OBServer node to be connected has access to the server where Navicat is installed.

* You have installed OceanBase Database and created a MySQL tenant.

##### Connect to OceanBase Database

For more information about how to connect to an OceanBase Database tenant by using Navicat, see [Connect to OceanBase Database by using Navicat](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375981).

##### Considerations

OceanBase Database in MySQL mode does not support the EVENT feature. You can ignore event-related error messages when you connect to OceanBase Database.

#### Configure a connection pool

A database connection pool is a collection of database connection resources. It is created and maintained in memory to improve the database access efficiency of applications. In practice, a connection pool can significantly improve the performance of database operations, especially for applications that frequently access a database.

Some of the popular database connection pools are Database Connection Pool (DBCP), Tomcat JDBC, HikariCP, and Druid connection pools. Connection pools have their respective characteristics. You can choose any one of them as needed.

##### Recommended data source configuration

| Parameter definition        | Description                | ZDAL parameter                     | Druid parameter                    | DBCP parameter               | c3p0 parameter              |
|--------------|-------------------------------|--------------------------|-------------------------------|----------------------------|-----------------------|
| Number of initial connections      | The number of connections established during initialization of the connection pool.  | prefill=true, initialized to minConn       | initialSize(0)            |  initialSize(0)         | initialPoolSize(3)    |
| Minimum number of connections       | The minimum number of available connections retained for the connection pool.   | minConn(0)        | minIdle(0)       | minIdle(0)       | minPoolSize(3)        |
| Maximum number of connections       | The maximum number of available connections. If the number of connections in the connection pool exceeds this number, an exception is returned, indicating that the connection pool is full.       | maxConn(10)         | maxActive(8)      | maxActive(8)    | maxActive(8)          |
| Connection idle timeout period      | The period of connection idle time that the connection pool waits for before it disconnects the connection. MySQL disconnects a connection that has been idle for 8 hours by default. A connection becomes a dirty one during the active/standby switchover. Without this mechanism, a request may fail. For OceanBase Cloud, the default SLB timeout period is 15 minutes. You can set it to 12 minutes. | idleTimeoutMinutes(30min)    | minEvictableIdleTimeMillis(30min)  | minEvictableIdleTimeMillis(30min) takes effect only when `timeBetweenEvictionRunsMillis(-1) > 0` is set. This parameter specifies the asynchronous check cycle. | maxIdleTime (0 indicates no timeout.)     |
| Timeout period for obtaining a connection from the connection pool  | If the value is too large, the application response will be very slow when the connection pool is full. | blockingTimeoutMillis(500ms) | maxWait (-1 indicates no timeout.)  |  maxWaitMillis (-1 indicates no timeout.)  |  checkoutTimeout (0 indicates no timeout.) |
| Timeout period before destroying a connection   | If a connection is not returned to the connection pool after this period, the connection is directly destroyed. This mechanism prevents connection leakage but restricts the duration in which a connection can be used by a transaction.   | None         | removeAbandonedTimeoutMillis(300s) | removeAbandonedTimeout(300s)    | None         |

##### Configure a JDBC connection pool

The following JDBC parameters are important and must be configured. You can specify these parameters in the connection properties of the connection pool or the JDBC URL. Here is an example:

```shell
conn=jdbc:oceanbase://xxx.xxx.xxx.xxx:3306/test?rewriteBatchedStatements=TRUE&allowMultiQueries=TRUE&useLocalSessionState=TRUE&useUnicode=TRUE&characterEncoding=utf-8&socketTimeout=3000000&connectTimeout=60000
```

* `rewriteBatchedStatements`: We recommend that you set the value to `TRUE`.
  
  * By default, the JDBC driver of OceanBase Database disregards the `executeBatch()` statement. It splits a group of SQL statements to be executed in a batch, and sends them to the database one by one. In this case, a batch insert operation is indeed a bunch of single insert operations, resulting in low performance. To implement real batch insertion, you must set this parameter to `TRUE`, so that the driver can execute SQL statements in batches. You can use the `addBatch` method to combine multiple `INSERT` statements on the same table into one `INSERT` statement that contains multiple values to improve the performance of batch insert operations.
  
  * You must use the `prepareStatement` statement to prepare each `INSERT` statement and then execute `addBatch`. Otherwise, the statements cannot be merged for execution.

* `allowMultiQueries`: We recommend that you set the value to `TRUE`.
  
  The JDBC driver allows you to concatenate multiple SQL statements by semicolons (;) in application code and send them as one SQL statement to the server.

* `useLocalSessionState`: We recommend that you set the value to `TRUE` to prevent transactions from frequently sending session variable queries to OceanBase Database.
  
  Main session variables are `autocommit`, `read_only` and `transaction isolation`.

* `socketTimeout`: the time, in ms, that the socket waits for the response to an SQL statement when the SQL statement is executed. The value `0` specifies not to set a timeout period. You can also set the system variable `max_statement_time` to limit the query time. Default value: `0` (in standard configuration) or `10000`.

* `connectTimeout`: the time to wait for the connection to be established, in ms. The value `0` specifies not to set a timeout period. Default value: `30000`.

* `useCursorFetch`: We recommend that you set the value to `TRUE`.
  
  For query statements with a large data volume, the database server creates a cursor and distributes data to clients based on the value of the `FetchSize` parameter. If you set this attribute to `TRUE`, `useServerPrepStms` is automatically set to `TRUE`.

* `useServerPrepStms`: specifies whether to use the prepared statement (PS) protocol to send SQL statements to the database server.
  
  If you set this parameter to `TRUE`, SQL statements are executed in the following two steps in the database:
  
  * Send the SQL text that contains a question mark (?) to the database server for preparation (`SQL_audit: request_type=5`).
  
  * Execute the statement based on real values in the database (`SQL_audit: request_type=6`).

* `cachePrepStmts`: specifies whether to enable the PS cache to cache prepared statements to avoid repeated preparation on the client side and server side. `cachePrepStmts=TRUE` applies to scenarios where `useServerPrepStms` is set to `TRUE` and batch execution is performed repeatedly for the same SQL statement. Each batch execute operation involves the prepare operation and the setting of `executecachePrepStmts=TRUE`. This avoids repeated preparations.

* `prepStmtCacheSQLLimit`: The maximum SQL length allowed for the PS cache. SQL statements with a longer length cannot be placed into the PS cache.

* `prepStmtCacheSize`: The maximum number of SQL statements that can be stored in the PS cache.

* `maxBatchTotalParamsNum`: The maximum number of parameters that an SQL statement supports for a batch operation. This parameter equals the number of questions marks (?) allowed for an SQL statement. If the number of parameters exceeds the limit, the batch SQL statement will be split.

For more information about how to configure other connection pools, see [Database connection pool configuration](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378267).

##### Suggestions on connection pool settings

* You can retain a minimum of two connections for the console and adjust the configuration based on the business concurrency and transaction time.

* We recommend that you set the idle connection timeout period to 30 minutes.
  
  By default, MySQL disconnects a connection that has been idle for 8 hours, which cannot be sensed by the client. This results in dirty connections. The connection pool can check whether a connection is alive through mechanisms such as heartbeats or testOnBorrow. When a connection has been idle for this period, the connection is disconnected.
  
### Drivers

You can connect to a MySQL tenant of OceanBase Database by using any of the following drivers:

#### Java driver (MySQL Connector/J)

MySQL Connector/J is a JDBC driver provided by MySQL.

For more information about how to connect Java applications to OceanBase Database, see [Build a Java application](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375517).

#### C driver (OceanBase Connector/C)

OceanBase Connector/C is an OBClient development component based on C/C++. OceanBase Connector/C supports C API libraries.

OceanBase Connector/C allows C/C++ applications to access distributed OceanBase clusters from the underlying layer. Then, the applications can perform operations such as database connection, data access, error processing, and prepared statement processing.

OceanBase Connector/C is also called LibOBClient. By using OceanBase Connector/C, an application can act as an independent server process to communicate with OBServer nodes over network connections. A client application references the C API header file during compilation and can link to the C API library file. The `.so` file generated by LibOBClient is `libobclient.so`, which corresponds to the `libmysqlclient.so` file in MySQL. OceanBase Database uses OBClient as its CLI tool, which corresponds to the CLI tool in MySQL.

For more information about how to connect C applications to OceanBase Database, see [Build a C application](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375518).

#### Python driver (PyMySQL)

If you use Python 3.x, you can connect to a MySQL database server by using PyMySQL. PyMySQL follows the Python Database API Specification 2.0 and contains a pure-Python MySQL client library. In MySQL mode of OceanBase Database, you can use PyMySQL to connect Python applications to OceanBase Database.

For more information about how to connect Python applications to OceanBase Database, see [Build a Python application](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375519).

#### Go driver (Go-SQL-Driver)

Go-SQL-Driver is a MySQL database driver in the Go language that implements Go's `database/sql/driver` interface. You can operate MySQL tenants of OceanBase Database from your Go applications by using APIs of the `database/sql` package.

For more information about how to connect Go applications to OceanBase Database, see [Build a Go application](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375516).

### ORM frameworks

Object Relational Mapping (ORM) is a programming technique that converts data between different types of systems by using object-oriented programming languages. In effect, ORM creates a "virtual object database" that can be used within programming languages.

For more information about how to connect to a MySQL tenant of OceanBase Database by using a supported ORM framework, see the following topics in the Java section in OceanBase Database Documentation:

* [Connect to OceanBase Database by using Spring Boot](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378239)

* [Connect to OceanBase Database by using Spring Batch](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378242)

* [Connect to OceanBase Database by using Spring Data JDBC](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378238)

* [Connect to OceanBase Database by using Spring Data JPA](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378240)

* [Connect to OceanBase Database by using Hibernate](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378244)

* [Connect to OceanBase Database by using MyBatis](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378241)

## Database operations

Database operations are various actions you perform on the data in a database, such as adding, modifying, querying, and deleting data. The following section describes operations you may often perform in OceanBase Database. For example, you can manage database objects, read/write data, and manage transactions.

### Manage database objects

Database objects are components of a database that can be manipulated and used in the database by executing SQL statements. This section describes the types and storage methods of database object supported by OceanBase Database in MySQL mode, and the dependencies between database objects.

Database objects of OceanBase Database in MySQL mode include tables, views, indexes, partitions, sequences, triggers, and stored procedures.

#### Manage users

OceanBase Database users are classified into two categories: users in the sys tenant and users in a user tenant. The built-in system administrator of the sys tenant is the `root user`. The built-in tenant administrator of a MySQL tenant is the `root` user. When you create a user, if the current session is in the sys tenant, the created user belongs to the sys tenant. Otherwise, the user belongs to a user tenant. Users created by the administrator of the sys tenant or a user tenant can log on only to the current tenant. Users in a tenant must have unique usernames. However, users in different tenants can have the same usernames. Therefore, a user is globally identified by a username and a tenant name in the **username@tenant name** format.

##### Prerequisites

You may need to create users and grant them privileges in OceanBase Database as needed. To create a user, you must have the `CREATE USER` privilege. By default, you can log on to a business tenant as its root user to create business users in the tenant.

By default, only cluster and tenant administrators have the `CREATE USER` privilege. Other users can create a user only after they are granted the `CREATE USER` privilege. For more information, see [Grant direct privileges](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378997).

##### Naming rules for usernames

When you specify a name for a user, take note of the following rules:

Rule 1: Ensure the uniqueness of usernames in a tenant.

* Users in the same tenant must have unique names. However, users in different tenants can have the same name. A user is globally identified by a username and a tenant name in the **username@tenant name** format.

* The sys tenant uses the MySQL mode. To distinguish users in the sys tenant from those in a user tenant in MySQL mode, we recommend that you use a specific prefix for the usernames of users in the sys tenant.

Rule 2: Observe the following naming conventions:

* When you create a user by using an OBClient or ODC, the username cannot exceed 64 bytes in length.

* When you create a user in the OceanBase Cloud Platform (OCP) console, the username must be 2 to 64 characters in length and start with a letter, and can contain letters, digits, and underscores (_).

##### Create a user

A user can be created by using either of the following statements:

* `CREATE USER`.

* `GRANT`.

Here is an example:

```sql
MySQL [oceanbase]> create user user01 identified by 'zf******MG';
Query OK, 0 rows affected (0.024 sec)

MySQL [oceanbase]> grant all privileges on test.* to user01 ;
Query OK, 0 rows affected (0.013 sec)

MySQL [oceanbase]> grant all privileges on test.* to user02 identified by 'dQ******M8';
Query OK, 0 rows affected (0.028 sec)
```

You cannot update the password field in the user metadata of a MySQL tenant of OceanBase Database.

You can use the `SHOW GRANTS` statement to view the privileges of a user.

Here is an example:

```sql
MySQL [oceanbase]> show grants for user01;
+----------------------------------------------+
| Grants for user01@%                          |
+----------------------------------------------+
| GRANT USAGE ON *.* TO 'user01'               |
| GRANT ALL PRIVILEGES ON `test`.* TO 'user01' |
+----------------------------------------------+
2 rows in set (0.001 sec)

MySQL [oceanbase]> show grants for user02;
+----------------------------------------------+
| Grants for user02@%                          |
+----------------------------------------------+
| GRANT USAGE ON *.* TO 'user02'               |
| GRANT ALL PRIVILEGES ON `test`.* TO 'user02' |
+----------------------------------------------+
2 rows in set (0.001 sec)
```

For more information about user management, see [MySQL mode](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378995).

#### Manage databases

In OceanBase Database, a database contains tables, indexes, and metadata of database objects. Do not use a default database, for example, the `test` database, in your production environment. We recommend that you create your own databases by using SQL statements.

##### Prerequisites

Before you manage a database, make sure that the following conditions are met:

* You have deployed an OceanBase cluster and created a MySQL tenant.

* You have connected to the MySQL tenant of OceanBase Database.

* You have the `CREATE`, `ALTER`, and `DROP` privileges.

##### Limitations

* In OceanBase Database, the name of each database must be globally unique.

* A database name cannot exceed 128 characters in length.

* A database name can contain only uppercase and lowercase letters, digits, underscores (_), and dollar signs ($).

* A database name cannot contain reserved keywords. For more information about the reserved keywords in MySQL mode of OceanBase Database, see [Reserved keywords (MySQL mode)](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375357).

##### Suggestions on database creation

* We recommend that you give a database a meaningful name that reflects its purpose and content. For example, you can name a database in the `application ID_sub-application name (optional)_db ` format.

* We recommend that you create a database and related users as the `root` user and grant only required privileges to ensure the security and controllability of the database.

* When you create a database, specify an appropriate default character set and collation to ensure proper storage and sorting of data. To adapt to long-term development of your business, we recommend that you use the `utf8mb4` character set to ensure storage of the majority of characters.

* Database names that contain only digits must be enclosed by backticks (`). However, we recommend that you do not use such database names because they are meaningless and the backticks (`) can increase complexity and cause confusion in queries.

##### Sample statements

Example 1: Create a database named `test_db` and specify to use the `utf8mb4` character set.

```sql
obclient [(none)]> CREATE DATABASE test_db DEFAULT CHARACTER SET utf8mb4;
```

Example 2: Create a read-only database named `test_ro_db`.

```sql
obclient [(none)]> CREATE DATABASE test_ro_db READ ONLY;
```

Example 3： Create a database named `test_rw_db` that supports read and write operations.

```sql
obclient [(none)]> CREATE DATABASE test_rw_db READ WRITE;
```

For more information about statements for database management, see [Plan database objects](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375993).

#### Manage tables

Tables are the most basic data storage units in OceanBase Database. A table contains specific data that a user can access. A table consists of rows, and a row consists of columns.

##### Table types

OceanBase Database supports tables with and without a primary key.

* Tables with a primary key: In OceanBase Database, tables with a primary key must meet the following criteria:

  * Each table can have at most one primary key column group.
  
  * A primary key can contain at most 64 columns, and the total length of primary key data cannot exceed 16 KB.
  
  When a table with a primary key is created, a globally unique index is created for the primary key columns to quickly locate rows through the primary key.
  
  In the following example, a table named `emp_table` is created, with the `emp_id` column as its primary key.
  
  ```sql
  CREATE TABLE emp_table (   
    emp_id INT PRIMARY KEY,   
    emp_name VARCHAR(100),   
    emp_age INT NOT NULL 
  );
  ```

* Tables without a primary key: A table with no primary key specified is a table without a primary key.

  In the following example, a table named `student_table` is created with no primary key.
  
  ```sql
  CREATE TABLE student_table (   
    student_id INT NOT NULL,   
    student_name VARCHAR(100),   
    student_age INT NOT NULL 
  );
  ```

  In OceanBase Database, a table without a primary key uses a partition-level auto-increment column as its hidden primary key.

##### Limitations

* The table name cannot exceed 64 characters in length.

* The length of a table row cannot exceed 1.5 MB.

* A table can contain a maximum of 4,096 columns.

* A table can have a maximum of 128 indexes.

* A primary key can contain at most 64 columns, and the total length of primary key data cannot exceed 16 KB.

* The maximum number of partitions in a single table is specified by the tenant-level parameter `max_partition_num`, which has been introduced since V4.2.1_CE_BP3. The default value is `8192` and the maximum value is `65536`.

For more information about limitations on table creation, see [Limitations](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375342).

##### Suggestions on table creation

* Use either all uppercase letters or all lowercase letters for table names. Do not use a combination of uppercase and lowercase letters.

* Use table names that well represent the data content, for example, "TEST".

* Do not use reserved words or keywords as the table name.

* For an intermediate table that stores intermediate result sets, follow the table naming format of `tmp_table name (or abbreviation)_column name(or abbreviation)_creation time`, for example, `tmp_account_tbluser_20220224`.

* For a backup table that stores backups or snapshots of a source table, follow the table naming format of `bak_table name (or abbreviation)_column name (or abbreviation)_creation time`, for example, `bak_ account_tbluser_20220224`.

For more information about table naming conventions, see [Table naming conventions](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375691).

##### Sample statements

Here is an example:

```sql
create table ware(w_id int
, w_ytd decimal(12,2)
, w_tax decimal(4,4)
, w_name varchar(10)
, w_street_1 varchar(20)
, w_street_2 varchar(20)
, w_city varchar(20)
, w_state char(2)
, w_zip char(9)
, unique(w_name, w_city)
, primary key(w_id)
);

create table cust (c_w_id int NOT NULL
, c_d_id int NOT null
, c_id int NOT null
, c_discount decimal(4, 4)
, c_credit char(2)
, c_last varchar(16)
, c_first varchar(16)
, c_middle char(2)
, c_balance decimal(12, 2)
, c_ytd_payment decimal(12, 2)
, c_payment_cnt int
, c_credit_lim decimal(12, 2)
, c_street_1 varchar(20)
, c_street_2 varchar(20)
, c_city varchar(20)
, c_state char(2)
, c_zip char(9)
, c_phone char(16)
, c_since date
, c_delivery_cnt int
, c_data varchar(500)
, index icust(c_last, c_d_id, c_w_id, c_first, c_id)
, FOREIGN KEY (c_w_id) REFERENCES ware(w_id)
, primary key (c_w_id, c_d_id, c_id)
);
```

Foreign keys are supported in MySQL tenants of OceanBase Database. In a distributed database, we recommend that you do not use foreign key constraints at the database level in high-concurrency read/write scenarios. Foreign keys will increase the probability of unnecessary blocking and deadlocks and may affect the performance.

Use the `like` statement to copy the schema of a table. The primary keys, unique keys, and index names in the schema are all copied. In the syntax of MySQL, the primary key names, UNIQUE constraints, and index names must be unique in the same table and can be duplicate in different tables.

```sql
create table t1 like ware;

MySQL [test]> show create table t1\G
*************************** 1. row ***************************
Table: t1
Create Table: CREATE TABLE `t1` (
`w_id` int(11) NOT NULL,
`w_ytd` decimal(12,2) DEFAULT NULL,
`w_tax` decimal(4,4) DEFAULT NULL,
`w_name` varchar(10) DEFAULT NULL,
`w_street_1` varchar(20) DEFAULT NULL,
`w_street_2` varchar(20) DEFAULT NULL,
`w_city` varchar(20) DEFAULT NULL,
`w_state` char(2) DEFAULT NULL,
`w_zip` char(9) DEFAULT NULL,
PRIMARY KEY (`w_id`),
UNIQUE KEY `w_name` (`w_name`, `w_city`) BLOCK_SIZE 16384 GLOBAL
) DEFAULT CHARSET = utf8mb4 ROW_FORMAT = COMPACT COMPRESSION = 'zstd_1.3.8' REPLICA_NUM = 1 BLOCK_SIZE = 16384 USE_BLOOM_FILTER = FALSE TABLET_SIZE = 134217728 PCTFREE = 0
1 row in set (0.003 sec)
```

Use the `create table ... as select` statement to copy the schema and data of a table. Note that this statement copies only the basic data types of a table, and does not copy the primary keys, UNIQUE constraints, or indexes.

```sql
create table t2 as select * from ware;

MySQL [test]> show create table t2\G
*************************** 1. row ***************************
Table: t2
Create Table: CREATE TABLE `t2` (
`w_id` int(11) NOT NULL,
`w_ytd` decimal(12,2) DEFAULT NULL,
`w_tax` decimal(4,4) DEFAULT NULL,
`w_name` varchar(10) DEFAULT NULL,
`w_street_1` varchar(20) DEFAULT NULL,
`w_street_2` varchar(20) DEFAULT NULL,
`w_city` varchar(20) DEFAULT NULL,
`w_state` char(2) DEFAULT NULL,
`w_zip` char(9) DEFAULT NULL
) DEFAULT CHARSET = utf8mb4 ROW_FORMAT = COMPACT COMPRESSION = 'zstd_1.3.8' REPLICA_NUM = 1 BLOCK_SIZE = 16384 USE_BLOOM_FILTER = FALSE TABLET_SIZE = 134217728 PCTFREE = 0
1 row in set (0.002 sec)
```

For more information about statements for table management, see [Create and manage tables](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001377915).

#### Manage indexes

An index, also known as a secondary index, is an optional structure. OceanBase Database uses the clustered index table model. The system automatically generates a primary key index for the specified primary key, and other indexes that you create are secondary indexes. You can determine the fields on which indexes are to be created based on business needs to speed up queries on these fields.

For more information about indexes, see [Indexes](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378812).

##### Prerequisites

Before you create an index, make sure that the following conditions are met:

* You have deployed an OceanBase cluster and created a MySQL tenant and user.

* You have connected to the MySQL tenant of OceanBase Database.

* You have created a database table.

* You have the `INDEX` privilege.

##### Limitations

* In OceanBase Database, an index name must be unique in a table.

* The index name cannot exceed 64 bytes in length.

* Take note of the following limitations on unique indexes:

  * You can create multiple unique indexes that have unique column values on a table.

  * If you want to ensure global uniqueness for other column combinations besides a primary key, you can create a global unique index.

  * A local unique index must contain all columns in the partitioning key of the table.

* The partitioning rules of a global index are not necessarily the same as those of the table.

##### Suggestions on index creation

* We recommend that you use a name that succinctly describes the columns covered by the index and its purpose, for example, `idx_customer_name`.

* If a global index has the same partitioning rules and the same number of partitions as the table, we recommend that you change the global index to a local index in this case.

* We recommend that the number of parallel SQL statements that you issue to create indexes do not exceed the maximum number of CPU cores specified for the unit config of the tenant. For example, if the unit config of a tenant has 4 CPU cores, we recommend that you create no more than 4 indexes concurrently.

* Create indexes on fields that are frequently used for queries, but do not create excess indexes on tables that are frequently updated.

* Do not create indexes on tables with a small amount of data. For a table with a small data amount, it may take a shorter time to query all the data than to traverse the indexes. In this case, indexes cannot produce optimization effects.

* If create, read, update and delete (CRUD) operations on the table are far more than query operations, do not create indexes.

* Create efficient indexes:

  * Include all necessary columns required for queries. The more relevant columns included in the index, the better it can minimize the number of rows returned.

  * Indexes of equivalent conditions should always be placed in the front of the index table.

  * Indexes for filtering and sorting large amounts of data should be placed in the front of the index table.

##### Sample statements

Example: Execute the following SQL statements to create a table named `tbl2` and create an index on the `col2` column in the `tbl2` table.

1. Create a table named `tbl2`.

   ```sql
   obclient [test]> CREATE TABLE tbl2(col1 INT, col2 INT, col3 VARCHAR(50), PRIMARY KEY (col1));
   ```

2. Create an index named `idx_tbl2_col2` on the `col2` column in the `tbl2` table.

   ```sql
   obclient [test]> CREATE INDEX idx_tbl2_col2 ON tbl2(col2);
   ```

3. Query indexes of the `tbl2` table.

   ```sql
   obclient [test]> SHOW INDEX FROM tbl2;
   ```

   The return result is as follows:

   ```shell
   +-------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+-----------+---------------+---------+------------+
   | Table | Non_unique | Key_name      | Seq_in_index | Column_name | Collation | Cardinality | Sub_part | Packed | Null | Index_type | Comment   | Index_comment | Visible | Expression |
   +-------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+-----------+---------------+---------+------------+
   | tbl2  |          0 | PRIMARY       |            1 | col1        | A         |        NULL | NULL     | NULL   |      | BTREE      | available |               | YES     | NULL       |
   | tbl2  |          1 | idx_tbl2_col2 |            1 | col2        | A         |        NULL | NULL     | NULL   | YES  | BTREE      | available |               | YES     | NULL       |
   +-------+------------+---------------+--------------+-------------+-----------+-------------+----------+--------+------+------------+-----------+---------------+---------+------------+
   2 rows in set
   ```

For more information about statements for index management, see [Create and manage indexes](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001377889).

#### Subprograms

A subprogram is a procedural language (PL) unit that contains a collection of SQL statements and PL statements. You can use a subprogram to resolve specific issues or execute a group of related tasks. A subprogram can contain parameters, and callers pass values to these parameters. A subprogram can be a stored procedure or a function. In most cases, you can use a stored procedure to perform an operation and a function to calculate and return a value.

A stored subprogram is a subprogram stored in a database to perform complex logic operations for different database applications. The MySQL mode supports only standalone subprograms that are created at the schema level. Subprograms in MySQL mode meet the requirements for stored programs in the SQL standard and differ from PL subprograms in Oracle mode in terms of syntax and features.

For more information about subprograms, see [Subprograms](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001379921).

### Write data

#### Insert data

After you create a table, you can use the `INSERT` statement or other statements to insert records into the table. This section describes how to use related statements.

##### Prerequisites

* You have connected to a MySQL tenant of OceanBase Database.

* You have the `INSERT` privilege on the target table.

##### Use the `INSERT` statement to insert data

**Insert a single row of data**

You can use the `INSERT` statement to insert a single row of data.

Assume that the information about the table into which data is to be inserted is as follows:

```sql
obclient [test]> CREATE TABLE t_insert(
id int NOT NULL PRIMARY KEY,
name varchar(10) NOT NULL, 
value int,
gmt_create DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
Query OK, 0 rows affected 
```

The `id` and `name` columns of the table cannot be empty. The `id` column is the primary key column and cannot contain duplicate values because a `UNIQUE` constraint is defined on this column. A default value is specified for the `gmt_create` column.

Example: Insert multiple rows of data into a table by executing a single-row insertion statement multiple times.

A default value has been specified for the `gmt_create` column. Therefore, you do not need to specify a value for this column when you insert data.

```sql
obclient [test]> INSERT INTO t_insert(id, name, value) 
VALUES (1,'CN',10001);
Query OK, 2 rows affected

obclient [test]> INSERT INTO t_insert(id, name, value) 
VALUES(2,'US', 10002);
Query OK, 2 rows affected
```

If no default value is specified for the `gmt_create` column, you must specify a value for this column when you insert data by using the following statement:

```sql
obclient [test]> INSERT INTO t_insert(id, name, value, gmt_create)
VALUES (3,'EN', 10003, current_timestamp ());
Query OK, 1 row affected 
```

**Insert multiple rows of data at a time**

To insert multiple records, you can also use an `INSERT` statement that contains multiple values in the `VALUES` clause. The execution of a single multi-row insertion statement is faster than that of multiple single-row insertion statements.

Example: Insert multiple rows of data at a time.

```sql
obclient [test]> INSERT INTO t_insert(id, name, value) 
VALUES (1,'CN',10001),(2,'US', 10002);
Query OK, 2 rows affected
```

When you need to back up the data of a table or copy all records of a table to another table, you can use the `INSERT INTO ... SELECT ... FROM` statement as the `VALUES` clause of the `INSERT` statement for batch insertion.

Example: Back up all data of the `t_insert` table to the `t_insert_bak` table.

```sql
obclient [test]> SELECT * FROM t_insert;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-12 15:17:17 |
|  2 | US   | 10002 | 2022-10-12 16:29:16 |
|  3 | EN   | 10003 | 2022-10-12 16:29:26 |
+----+------+-------+---------------------+
3 rows in set

obclient [test]> CREATE TABLE t_insert_bak(
id number NOT NULL PRIMARY KEY,
name varchar(10) NOT NULL, 
value number,
gmt_create DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
Query OK, 0 rows affected 

obclient [test]> INSERT INTO t_insert_bak SELECT * FROM t_insert;
Query OK, 2 rows affected

obclient [test]> SELECT * FROM t_insert_bak;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-12 15:17:17 |
|  2 | US   | 10002 | 2022-10-12 16:29:16 |
|  3 | EN   | 10003 | 2022-10-12 16:29:26 |
+----+------+-------+---------------------+
3 rows in set
```

##### Insert data by using other statements

Besides the `INSERT` statement, you can use the `REPLACE INTO` statement instead to insert data into a table without data records or a table with data records but no primary key or unique key conflicts. For more information about the `REPLACE INTO` statement, see [REPLACE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378362).

Here is an example:

* Create a table named `t_replace` and then use the `REPLACE INTO` statement to insert data into the table.

  ```sql
  obclient [test]> CREATE TABLE t_replace(
  id int NOT NULL PRIMARY KEY
  , name varchar(10) NOT NULL
  , value int
  ,gmt_create timestamp NOT NULL DEFAULT current_timestamp
  );
  Query OK, 0 rows affected 
  
  obclient [test]> REPLACE INTO t_replace VALUES(1,'CN',2001, current_timestamp ());
  Query OK, 1 row affected 
  
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-11-23 09:52:44 |
  +----+------+-------+---------------------+
  1 row in set 
  ```

* Use the `REPLACE INTO` statement to insert data into the `t_replace` table that has data records.

  ```sql
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-03-22 16:13:55 |
  +----+------+-------+---------------------+
  1 row in set 
  
  obclient [test]> REPLACE INTO t_replace values(2,'US',2002, current_timestamp ());
  Query OK, 1 row affected
  
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-11-23 09:52:44 |
  |  2 | US   |  2002 | 2022-11-23 09:53:05 |
  +----+------+-------+---------------------+
  2 rows in set
  ```

#### Update data

After you insert data into a table, you can use the `UPDATE` statement to update the records in the table. This section describes how to use related statements.

##### Prerequisites

* You have connected to a MySQL tenant of OceanBase Database.

* You have the `UPDATE` privilege on the target table.

##### Update data by using the `UPDATE` statement

Generally, the `UPDATE` statement is used to update the data of a table. For more information about the `UPDATE` statement, see [UPDATE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378398).

The syntax of a simple `UPDATE` statement is as follows:

```sql
UPDATE table_name
SET column_name = value [, column_name = value]...
[ WHERE condition ];
```

|                      Parameter                       | Required |                  Description                  |
|-----------------------------------------------|------|-----------------------------------------|
| table_name                                  | Yes    | The table whose data is to be updated.                              |
| column_name = value [, column_name = value] | Yes    | The column to be updated. The value after the equal sign (=) is the new value.         |
| [ WHERE condition ]                         | No    | The conditions that the rows to be updated must meet. If no condition is specified, all records corresponding to the column are updated. |

Example: Update all values in the `value` column of the `t_insert` table by increasing each of them by 1.

```sql
obclient [test]> UPDATE t_insert SET value = value+1;
Query OK, 4 rows affected 
Rows matched: 4  Changed: 4  Warnings: 0

obclient [test]> SELECT * FROM t_insert;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10002 | 1970-01-01 17:18:06 |
|  2 | US   | 10003 | 1970-01-01 17:18:47 |
|  3 | EN   | 10004 | 1970-01-01 17:18:47 |
|  4 | JP   | 10005 | 1970-01-01 17:28:21 |
+----+------+-------+---------------------+
4 rows in set
```

When you execute the `UPDATE` statement, make sure that the transaction is not large. You can use the `LIMIT` keyword to control the number of records to be updated or the `WHERE` keyword to control the update scope. When you execute an `UPDATE` statement that involves more than one hundred thousand records without using the `WHERE` clause, a large transaction is generated, which may cause the update to fail.

##### Update data by using other statements

In addition to the explicit `UPDATE` statement, you can use other statements to update data. For example, when you use the `INSERT` statement to insert data, you can use the `ON DUPLICATE KEY UPDATE` clause to convert the insertion statement into a data update statement to avoid constraint conflicts.

Example: Use the `ON DUPLICATE KEY UPDATE` clause to convert a data insertion statement into a data update statement.

```sql
obclient [test]> SELECT * FROM t_insert;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-12 15:17:17 |
|  2 | US   | 10002 | 2022-10-12 16:29:16 |
|  3 | EN   | 10003 | 2022-10-12 16:29:26 |
|  4 | JP   | 10004 | 2022-10-12 17:02:52 |
+----+------+-------+---------------------+
4 rows in set

obclient [test]> INSERT INTO t_insert(id, name, value) VALUES (3,'UK', 10003),(5, 'CN', 10005) ON DUPLICATE KEY UPDATE name = VALUES(name);
Query OK, 1 row affected 

obclient [test]> SELECT * FROM t_insert;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-12 16:29:16 |
|  2 | US   | 10002 | 2022-10-12 15:17:17 |
|  3 | UK   | 10003 | 2022-10-12 16:29:26 |
|  4 | JP   | 10004 | 2022-10-12 17:02:52 |
|  5 | CN   | 10005 | 2022-10-12 17:27:46 |
+----+------+-------+---------------------+
5 rows in set
```

In this example, `ON DUPLICATE KEY UPDATE name = VALUES(name)` specifies that when the inserted data is duplicate with a value of the primary key, the value of the `name` column of the conflicting row `(3,'EN', 10003)` in the original data is updated to the value of the `name` column of the data to be inserted.

#### Delete data

After you insert data into a table, you can use the `DELETE` statement or other statements to delete records from the table. This section describes how to use related statements.

##### Prerequisites

Before you delete data from a table, make sure that the following conditions are met:

* You have connected to a MySQL tenant of OceanBase Database.

* You have the `DELETE` privilege on the target table. To use the `TRUNCATE TABLE` statement to clear the data in a table, you must also have the `CREATE` privilege on the table.

##### Use the `DELETE` statement to delete data

Generally, the `DELETE` statement is used to delete part of the data or all data from a table. For more information about the `DELETE` statement, see [DELETE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378376).

The syntax of a simple `DELETE` statement is as follows:

```sql
DELETE FROM table_name [ WHERE condition ];
```

|          Parameter           | Required |                Description                                    |
|-------------------------|---------|--------------------------------------------------------|
| table_name              | Yes      | The table from which data is to be deleted.                                     |
| [ WHERE condition ]     | No      | The condition for deleting data. If no condition is specified, all data in the table is deleted. |

Here are two examples:

* Delete all rows from the `t_insert` table.

  ```sql
  obclient [test]> DELETE FROM t_insert;
  Query OK, 3 row affected
  ```

  For a table that contains millions of records, deleting all the records at a time may result in performance issues. We recommend that you delete the data in batches by using the `WHERE` condition, or **use the TRUNCATE TABLE statement to empty a table**.

* Filter the data in the `value` column of the `t_insert` table. Execute multiple statements to respectively delete the data that meets the `value < 10000`, `value < 20000`, and `value < 30000` conditions in batches.

  ```sql
  obclient [test]> DELETE FROM t_insert WHERE value < 100000;
  
  obclient [test]> DELETE FROM t_insert WHERE value < 200000;
  
  obclient [test]> DELETE FROM t_insert WHERE value < 300000;
  ```

##### Use the TRUNCATE TABLE statement to empty a table

The `TRUNCATE TABLE` statement clears a table but retains its schema, including the partitions defined for the table. Logically, this statement is equivalent to the `DELETE FROM` statement that is used to delete all rows.

The syntax is as follows:

```sql
TRUNCATE [TABLE] table_name;
```

Example: Use the `TRUNCATE TABLE` statement to empty the `t_insert` table.

```sql
obclient [test]> TRUNCATE TABLE t_insert;
```

For more information about the `TRUNCATE TABLE` statement, see [TRUNCATE TABLE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378391).

#### Replace data

You can use the `REPLACE INTO` statement to insert or update data. This section describes how to use the statement.

##### Prerequisites

Before you replace data in a table, make sure that the following conditions are met:

* You have connected to a MySQL tenant of OceanBase Database.

* You have the `INSERT`, `UPDATE`, and `DELETE` privileges on the target table.

##### Use REPLACE INTO to replace data

Generally, the `REPLACE INTO` statement is used to replace one or more records in a table. For more information about the `REPLACE INTO` statement, see [REPLACE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378362).

The syntax of the `REPLACE INTO` statement is as follows:

```sql
REPLACE INTO table_name VALUES(list_of_values);
```

|        Parameter        | Required |     Description     |                 Example                  |
|------------------|------|------------|-------------------------------------|
| table_name       | Yes    | The table into which data is to be inserted. | table1                              |
| (list_of_values) | Yes    | The data to be inserted.      | (1,'CN',2001, current_timestamp ()) |

The `REPLACE INTO` statement will determine whether to directly insert new data or to use new data to update existing data based on whether conflicts exist.

* If the data to be inserted does not conflict with the values of the primary key or unique key column, the data is inserted.

* If the data to be inserted conflicts with the values of the primary key or unique key column, the existing records are deleted and then new records are inserted. We recommend that you create a PRIMARY KEY or UNIQUE index on the target table to avoid inserting duplicate records into the table.

Here are some examples:

* Create a table named `t_replace` and then use the `REPLACE INTO` statement to insert a row into the table.

  ```sql
  obclient [test]> CREATE TABLE t_replace(
  id number NOT NULL PRIMARY KEY
  , name varchar(10) NOT NULL
  , value number
  ,gmt_create timestamp NOT NULL DEFAULT current_timestamp
  );
  Query OK, 0 rows affected 
  
  obclient [test]> REPLACE INTO t_replace values(1,'CN',2001, current_timestamp ());
  Query OK, 1 row affected 
  
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  +----+------+-------+---------------------+
  1 row in set
  ```

  In this example, no data is inserted after the `t_replace` table is created. One record is inserted into the table after the `REPLACE INTO` statement is executed.

* Execute the `REPLACE INTO` statement again to insert another row of data.

  ```sql
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  +----+------+-------+---------------------+
  1 row in set
  
  obclient [test]> REPLACE INTO t_replace(id, name, value, gmt_create) VALUES(2,'US',2002,  current_timestamp ());
  Query OK, 1 row affected 
  
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  |  2 | US   |  2002 | 2022-10-13 14:17:56 |
  +----+------+-------+---------------------+
  2 rows in set
  ```

  In this example, the `t_replace` table already has a record. The `(2,'US',2002,current_timestamp ())` data record is not duplicate with the record in the table and therefore does not violate the UNIQUE constraint and is inserted into the `t_replace` table.

* Use a query statement to replace the `VALUES` clause in the `REPLACE INTO` statement to insert multiple rows of data. Insert the data of the `t_insert` table into the `t_replace` table.

  ```sql
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  |  2 | US   |  2002 | 2022-10-13 14:17:56 |
  +----+------+-------+---------------------+
  2 rows in set
  
  obclient [test]> SELECT * FROM t_insert;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  7 | EN   |  1007 | 2022-10-13 14:36:36 |
  |  8 | JP   |  1008 | 2022-10-13 14:36:36 |
  +----+------+-------+---------------------+
  2 rows in set
  
  obclient [test]> REPLACE INTO t_replace
  SELECT id,name,value,gmt_create FROM t_insert;
  Query OK, 2 rows affected
  Records: 2  Duplicates: 0  Warnings: 0
  
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  |  2 | US   |  2002 | 2022-10-13 14:17:56 |
  |  7 | EN   |  1007 | 2022-10-13 14:36:36 |
  |  8 | JP   |  1008 | 2022-10-13 14:36:36 |
  +----+------+-------+---------------------+
  4 rows in set
  ```

  For a table with records and primary key or unique key conflicts, you can use the `REPLACE INTO` statement to update the conflicting data in the table to the new data.

* Insert a record into the `t_replace` table.

  ```sql
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  |  2 | US   |  2002 | 2022-10-13 14:17:56 |
  |  7 | EN   |  1007 | 2022-10-13 14:36:36 |
  |  8 | JP   |  1008 | 2022-10-13 14:36:36 |
  +----+------+-------+---------------------+
  4 rows in set
  
  obclient [test]> REPLACE INTO t_replace(id, name, value, gmt_create) VALUES(2,'EN',2002,  current_timestamp ());
  Query OK, 2 rows affected
  
  obclient [test]> SELECT * FROM t_replace;
  +----+------+-------+---------------------+
  | id | name | value | gmt_create          |
  +----+------+-------+---------------------+
  |  1 | CN   |  2001 | 2022-10-13 14:06:58 |
  |  2 | EN   |  2002 | 2022-10-13 14:44:33 |
  |  7 | EN   |  1007 | 2022-10-13 14:36:36 |
  |  8 | JP   |  1008 | 2022-10-13 14:36:36 |
  +----+------+-------+---------------------+
  4 rows in set
  ```

  In this example, the `id` column in the `t_replace` table is the primary key column and must meet the UNIQUE constraint. The inserted record `(2,'EN',2002,current_timestamp ())` violates the UNIQUE constraint. Therefore, the system deletes the original record `(2,'US',2002,current_timestamp ())` and inserts the new record `(2,'EN',2002,current_timestamp ())`.

### Read data

#### Query a single table

This section describes how to use SQL statements to perform single-table queries on tables in OceanBase Database.

##### Prerequisites

* You have connected to a MySQL tenant of OceanBase Database.

* You have the `SELECT` privilege.

##### Execute a SELECT query

The general structure of a single-table query using the `SELECT` statement is as follows:

```sql
SELECT [ALL | DISTINCT | UNIQUE | SQL_CALC_FOUND_ROWS] select_list 
FROM table_name
[ WHERE query_condition ]
[ GROUP BY group_by_condition ]
[ HAVING group_condition ]
[ ORDER BY column_list ][ASC | DESC]
[ LIMIT limit_clause ]

column_list:
column_name[,column_name...] 
```

**Parameters**

|             Parameter            |                           Description                       |
|-----------------------------|-----------------------------------------------------|
| select_list                 | The list of columns to retrieve, which can be column names, expressions, or aggregate functions. Separate multiple columns with commas (,). |
| table_name                  | The name of the table from which data is to be retrieved. |
| WHERE query_condition       | Optional. The query condition. Only rows that meet the condition will be returned. |
| GROUP BY group_by_condition | Optional. Specifies to group the results by the specified column. This parameter is typically used with aggregate functions. |
| HAVING group_condition      | Optional. Specifies to filter the grouped result set. Only groups that meet the condition will be returned. |
| ORDER BY column_list        | Optional. Specifies to sort the result set. You can specify to sort one or more columns. |
| ASC \| DESC                  | Optional. The order of sorting. `ASC` indicates the ascending order, and `DESC` indicates the descending order. The default value is `ASC`. |
| LIMIT limit_clause          | Optional. Specifies to limit the number of rows returned in the result set. |
| column_list                 | The list of columns to retrieve. You can specify one or more columns. Separate multiple columns with commas (,). |
| column_name                 | The name of the column to retrieve. |

If you use the `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, and `LIMIT` clauses in a query, these clauses are executed in strict accordance with the following sequence:

1. The `FROM` clause is executed to find the required table.

2. The `WHERE` clause is executed to specify conditions. You can use the `WHERE` clause to filter data before sorting.

3. The `GROUP BY` clause is executed to group or aggregate records. If `GROUP BY` is not executed, all records are considered a group.

4. The `HAVING` clause filters data after grouping and returns the entire SQL query result.

5. The `SELECT` clause is executed.

6. The `DISTINCT` clause is executed to remove duplicate rows.

7. The `ORDER BY` clause is executed to sort the results in ascending or descending order.

8. The `LIMIT` clause is executed to limit the number of records.

```sql
SELECT * FROM student;
```

The return result is as follows:

```shell
+----+-----------+--------+-----+-------+-----------------+-------+
| id | name      | gender | age | score | enrollment_date | notes |
+----+-----------+--------+-----+-------+-----------------+-------+
|  1 | Emma      |      0 |  20 |    85 | 2021-09-01      | NULL  |
|  2 | William   |      1 |  21 |  90.5 | 2021-09-02      | B     |
|  3 | Olivia    |      0 |  19 |  95.5 | 2021-09-03      | A     |
|  4 | James     |      1 |  20 |  87.5 | 2021-09-03      | NULL  |
|  5 | Sophia    |      0 |  20 |  91.5 | 2021-09-05      | B     |
|  6 | Benjamin  |      1 |  21 |  96.5 | 2021-09-01      | A     |
|  7 | Ava       |      0 |  22 |  89.5 | 2021-09-06      | NULL  |
|  8 | Michael   |      1 |  18 |  93.5 | 2021-09-08      | B     |
|  9 | Charlotte |      1 |  19 |    88 | 2021-09-06      | NULL  |
| 10 | Ethan     |      1 |  20 |    92 | 2021-09-01      | B     |
+----+-----------+--------+-----+-------+-----------------+-------+
10 rows in set
```

**Filter data**

You can add a `WHERE` clause to the `SELECT` statement to query data that meets the specified conditions. The `WHERE` clause can contain one or more conditions for filtering data. Only data that meets the `WHERE` conditions will be returned. You can flexibly use query conditions based on specific requirements to filter and retrieve target data.

When you use the `WHERE` clause, make sure that the conditions are correct and appropriate operators are used.

The following table lists general query conditions specified by the `WHERE` clause.

|   Condition type   |                     Predicate           |
|------------|---------------------------------------------|
| Comparison condition       | `=`, `>`, `<`, `>=`, `<=`, `!=`, and `<>` |
| Logical condition (multiple conditions supported in a query) | `AND`, `OR`, and `NOT`  |
| Fuzzy condition (matching by characters) | `LIKE` and `NOT LIKE`               |
| Interval condition (with a specified range) | `BETWEEN AND` and `NOT BETWEEN AND` |
| Condition with a specified set     | `IN` and `NOT IN`                   |
| Condition related to NULL values   | `IS NULL` and `IS NOT NULL`         |

For more information about query conditions and operators, see [Comparison operators](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378449).

**Group query results**

You can use the `GROUP BY` clause to group the query results in SQL queries. `GROUP BY` supports grouping by a single field or multiple fields. You can also use the `WHERE` clause to filter data before grouping, use the `HAVING` clause to filter data after grouping, and use the `ORDER BY` clause to sort data after grouping.

* When you use the `GROUP BY` clause, make sure that the columns in the `SELECT` statement are aggregate functions or included in the `GROUP BY` clause.

* When you use the `HAVING` clause, make sure that the conditions are applied to the grouped results, but not the original data.

If a query contains the `HAVING` clause, the data is first grouped and then filtered based on the conditions specified in the `HAVING` clause. Aggregate functions can be used after the `HAVING` clause is executed. These aggregate functions may be different from those following the `SELECT` statement.

Example: Query customers who placed two or more orders in 2019, and return the data of the `user_id` and `COUNT(order_id)` columns.

```sql
SELECT user_id, COUNT(order_id)
FROM fruit_order t
WHERE t.order_year = 2019
GROUP BY user_id
HAVING COUNT(order_id) >= 2;
```

The return result is as follows:

```shell
+----------+--------------+
| Customer ID   | Number of orders     |
+----------+--------------+
|     1022 |            2 |
+----------+--------------+
1 row in set
```

**Aggregate data**

An aggregate query aggregates data and returns a summary of results. It can collect statistics on, count, or calculate the sum, average value, maximum value, or minimum value of a set of data. An aggregate query is usually used with the `GROUP BY` clause to group data and aggregate each group of data. The `GROUP BY` clause groups data based on specified columns. Then an aggregate function is applied to each group to generate a result set.

The following table lists frequently-used aggregate functions in `GROUP BY` queries.

| Aggregate function |           Description           |
| -------- | ----------------------- |
| MAX()    | Queries the maximum value of the specified column.     |
| MIN()    | Queries the minimum value of the specified column.     |
| COUNT()  | Returns the number of rows in the query result.     |
| SUM()    | Returns the sum of the specified column.       |
| AVG()    | Returns the average value of the data in the specified column. |

For more information about aggregate functions, see [Use aggregate functions in queries](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378270).

Example: Gather statistics on the sales amount of toy orders using <code>COUNT()</code>, <code>SUM()</code>, <code>AVG()</code>, <code>ROUND()</code>, <code>MIN()</code>, and <code>MAX()</code> functions.

```sql
SELECT toy_id
, count(*)                         order_count
, sum(toy_amount)                  sum_amount
, round(avg(toy_amount),2)         avg_amount
, min(toy_amount)                  min_amount
,max(toy_amount)                   max_amount
FROM toys_order GROUP BY toy_id  ORDER BY toy_id;
```

The return result is as follows:

```shell
+--------+-------------+------------+------------+------------+------------+
| toy_id | order_count | sum_amount | avg_amount | min_amount | max_amount |
+--------+-------------+------------+------------+------------+------------+
|      1 |           2 |        150 |      75.00 |         50 |        100 |
|      2 |           3 |        490 |     163.33 |        100 |        200 |
|      3 |           2 |        680 |     340.00 |        330 |        350 |
+--------+-------------+------------+------------+------------+------------+
3 rows in set
```

**Sort data**

Data sorting sorts query results by a specified column or expression in ascending or descending order. You can use the `ORDER BY` clause to specify the sorting method in SQL queries. `ORDER BY` supports sorting by a single field, multiple fields, an alias, or a function. Separate multiple fields with commas (,). If the `ASC` or `DESC` keyword is not added in the `ORDER BY` clause, the query results are sorted in ascending order by default.

The `ORDER BY` clause consumes a large amount of resources, especially when you use it to sort large datasets. We recommend that you use indexes to optimize the sorting operation when necessary. Make sure that the correct columns and sorting order are specified.

Example: Query student information in the `student` table, and return the information sorted by `score` in ascending order.

```sql
SELECT id, name, score
FROM student
ORDER BY score;
```

The return result is as follows:

```shell
+----+-----------+-------+
| id | name      | score |
+----+-----------+-------+
|  1 | Emma      |    85 |
|  4 | James     |  87.5 |
|  9 | Charlotte |    88 |
|  7 | Ava       |  89.5 |
|  2 | William   |  90.5 |
|  5 | Sophia    |  91.5 |
| 10 | Ethan     |    92 |
|  8 | Michael   |  93.5 |
|  3 | Olivia    |  95.5 |
|  6 | Benjamin  |  96.5 |
+----+-----------+-------+
10 rows in set
```

**Limit the number of rows in the result set**

You can use the `LIMIT` clause to limit the number of rows returned in the result set for an SQL query.

The format of the `LIMIT` clause to limit the number of rows is as follows:

```sql
LIMIT [offset,] row_count
```

or

```sql
LIMIT row_count OFFSET offset
```

* `offset`: the number of rows to skip. In the first format, `offset` is optional, and its default value is 0, indicating that zero rows are to be skipped. The value range is [0, +∞).

* `row_count`: the number of rows to be returned. In the first format, if `offset` is not specified, data is returned starting from the first row by default. The value range is [0, +∞).

* Take note of the following limitations on the values of `offset` and `row_count`:

  * Expressions are not supported.

  * Only explicit numerical values are allowed, and they cannot be negative.

Example: Retrieve the three rows after the fifth row in the `student` table and return the data of the `id` and `name` columns.

```sql
SELECT id, name
FROM student
LIMIT 3 OFFSET 5;
```

The return result is as follows:

```shell
+----+----------+
| id | name     |
+----+----------+
|  6 | Benjamin |
|  7 | Ava      |
|  8 | Michael  |
+----+----------+
3 rows in set
```

**Perform pagination queries**

You can use the `LIMIT` clause to perform pagination in SQL queries.

The format of the `LIMIT` clause for pagination is as follows:

```sql
LIMIT (page_no - 1) * page_size, page_size;
```

* `page_no`: the page number. The value range is [1, +∞).

* `page_size`: the number of records per page. The value range is [1, +∞). For example, For example, if `page_no` is set to `5` and `page_size` is set to `10`, the 10 records on page 5 are retrieved.

Example: For the `student` table, set `page_size` to `2` to retrieve data of page 1 and page 2.

Page 1:

```sql
SELECT id, name
FROM student
ORDER BY id
LIMIT 0,2;
```

The return result is as follows:

```shell
+----+---------+
| id | name    |
+----+---------+
|  1 | Emma    |
|  2 | William |
+----+---------+
2 rows in set
```

Page 2:

```sql
SELECT id, name
FROM student
ORDER BY id
LIMIT 2,2;
```

The return result is as follows:

```shell
+----+--------+
| id | name   |
+----+--------+
|  3 | Olivia |
|  4 | James  |
+----+--------+
2 rows in set
```

#### Perform subqueries

A subquery is a query nested in an upper-layer query. An upper-layer query is generally referred to as a parent query or outer query. The subquery result is returned to the parent query or outer query as input. The parent query takes the subquery result into the calculation to determine the final output.

The SQL language supports multi-level nested queries, which means that one subquery can be nested with other subqueries. Meanwhile, subqueries can be included in various clauses of SQL statements, such as `SELECT`, `FROM`, and `WHERE`.

For more information about statements for subqueries, see [Subqueries](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378431).

### Manage transactions

A database transaction is a series of database operations that are treated as a unit. The database is transformed from one consistent state to another after a transaction is executed.

You can use database transactions to achieve the following purposes:

* Recover a sequence of failed database operations to the normal state and maintain database consistency even if the database is in the abnormal state.

* Isolate concurrent access to a database and prevent concurrent operations from causing inconsistency in the database.

Basic transaction control statements are as follows:

* BEGIN: explicitly starts a transaction. The use of the statement involves the following two scenarios:

  * If the value of the system variable `autocommit` is `0` for a tenant session, the autocommit mode is disabled. In this case, you do not need to explicitly issue the `BEGIN` command to combine multiple SQL statements into one transaction.

  * If the value of the system variable `autocommit` is `1` for a tenant session, the autocommit mode is enabled. In this case, each SQL statement is an independent transaction. To combine multiple SQL statements into one transaction, you need to explicitly issue the `BEGIN` command. In this case, the autocommit mode is disabled and will be resumed after a `COMMIT` or `ROLLBACK` statement is executed.

* SAVEPOINT: marks a savepoint in a transaction. After the transaction is executed, you can roll back the transaction to the savepoint. Savepoints are optional. A transaction can have multiple savepoints.

* COMMIT: commits and ends the current transaction, permanently applies all the changes made by the transaction, deletes all the savepoints, and releases the locks that the transaction holds.

* ROLLBACK: rolls back all the changes in a transaction or the changes after a specific savepoint, deletes all the savepoints in the statements that are rolled back, and releases the locks that the transaction holds.

On the CLI of OBClient, you can run a transaction control command after the SQL prompt, or modify the `autocommit` variable at the session level to control whether to automatically commit transactions.

* If you execute the `SET autocommit` statement to set the `autocommit` variable, the setting takes effect immediately for the current session and becomes invalid after the session is closed.

* If you execute the `SET GLOBAL autocommit` statement to set the `autocommit` variable at the tenant level, the setting takes effect after you close the current session and starts a new one.

* If the `autocommit` variable of a session is set to `0` and no transaction is explicitly committed, when the program terminates abnormally, OceanBase Database automatically rolls back the last uncommitted transaction.

#### Start a transaction

The transaction control statements in the MySQL mode of OceanBase Database are compatible with those in MySQL Database. In the MySQL mode of OceanBase Database, you can start a transaction in the following ways:

* Execute a `BEGIN` statement.

  ```sql
  obclient [test]> BEGIN;      // Start a transaction.
  obclient [test]> INSERT INTO table1 VALUES(1,1);  
  obclient [test]> COMMIT;
  ```

* Execute a `START TRANSACTION` statement.

  ```sql
  obclient [test]> START TRANSACTION; // Start a transaction.
  obclient [test]> INSERT INTO table1 VALUES(1,1);  
  obclient [test]> COMMIT;
  ```

* When `autocommit` is set to `0` to disable the autocommit mode, execute the `INSERT`, `UPDATE`, `DELETE`, or `SELECT FOR UPDATE` statement to start a new transaction.

  ```sql
  obclient [test]> SET AUTOCOMMIT=0;
  obclient [test]> INSERT INTO table1 VALUES(1,1);  // Start a transaction.
  obclient [test]> COMMIT;
  
  obclient [test]> SET AUTOCOMMIT=0;
  obclient [test]> UPDATE table1 SET id = 2 WHERE id = 1;  // Start a transaction.
  obclient [test]> COMMIT;
  
  obclient [test]> SET AUTOCOMMIT=0;
  obclient [test]> DELETE FROM table1 WHERE id = 2;  // Start a transaction.
  obclient [test]> COMMIT;
  
  obclient [test]> SET AUTOCOMMIT=0;
  obclient [test]> SELECT id FROM table1 WHERE id = 1 FOR UPDATE;  // Start a transaction.
  obclient [test]> COMMIT;
  ```

When a transaction is started, OceanBase Database assigns an ID to uniquely identify the transaction.

In scenarios with multiple concurrent connections, the same row of data may be operated by two transactions. For query reads, you can use the `SELECT FOR UPDATE` statement to lock the query results to prevent other DML statements from modifying this record.

Use `SET autocommit=0` to disable the autocommit mode and then execute `UPDATE` to start a transaction.

```sql
obclient [test]> CREATE TABLE ordr(
id INT NOT NULL PRIMARY KEY,
name VARCHAR(10) NOT NULL,
value INT,
gmt_create DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP );
Query OK, 0 rows affected

obclient [test]>  INSERT INTO ordr(id, name, value)
VALUES (1,'CN',10001),(2,'US', 10002),(3,'EN', 10003);
Query OK, 3 rows affected
 Records: 3  Duplicates: 0  Warnings: 0

obclient [test]> SELECT * FROM ordr;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   | 10003 | 2022-10-19 14:51:12 |
+----+------+-------+---------------------+
2 rows in set

obclient [test]> SET autocommit=0;
Query OK, 0 rows affected 

obclient [test]> UPDATE ordr SET id=4 WHERE name='US';
Query OK, 1 row affected 
Rows matched: 1  Changed: 1  Warnings: 0
```

After the execution, you can query the `oceanbase.V$OB_TRANSACTION_PARTICIPANTS` view for information about participants of active transactions.

```sql
obclient [test]> SELECT * FROM oceanbase.V$OB_TRANSACTION_PARTICIPANTS;
```

The output is as follows:

```shell
*************************** 1. row ***************************
       TENANT_ID: 1002
          SVR_IP: xx.xx.xx.223
        SVR_PORT: 2882
      SESSION_ID: 3221487660
  SCHEDULER_ADDR: "xx.xx.xx.223:2882"
         TX_TYPE: UNDECIDED
           TX_ID: 110352
           LS_ID: 1001
    PARTICIPANTS: NULL
 CTX_CREATE_TIME: 2022-10-19 14:55:23.763474
 TX_EXPIRED_TIME: 2022-10-19 14:55:23.763474
           STATE: ACTIVE
          ACTION: START
PENDING_LOG_SIZE: 116
FLUSHED_LOG_SIZE: 0
            ROLE: LEADER
1 row in set
```

#### Define a savepoint

In OceanBase Database, savepoints are user-defined execution marks in a transaction. You can define multiple savepoints in a transaction. In this way, the transaction can be rolled back to a specified savepoint when necessary.

If you make mistakes in operations after defining a savepoint, you do not need to roll back the entire transaction and execute it again. Instead, you can run the `ROLLBACK TO` command to roll back only operations after the savepoint.

In the example described in the following table, the `sp1` savepoint is created, so that data inserts after this savepoint can be rolled back.

|          Command            |           Description            |
| ----------------------- | ------------------------- |
| BEGIN;                  | Starts a transaction.                  |
| INSERT INTO a VALUE(1); | Inserts row 1.                 |
| SAVEPOINT sp1;          | Creates a savepoint named `sp1`. |
| INSERT INTO a VALUE(2); | Inserts row 2.                  |
| SAVEPOINT sp2;          | Creates a savepoint named `sp2`. |
| ROLLBACK TO sp1;        | Rolls back to sp1.          |
| INSERT INTO a VALUE(3); | Inserts row 3.                 |
| COMMIT;                 | Commits the transaction.                  |

Each operation in a transaction corresponds to an SQL sequence in OceanBase Database. The value of the SQL sequence increases during transaction execution (excluding parallel operations). Creating a savepoint is to match the name of the savepoint to the current SQL sequence of the transaction. When you run the `ROLLBACK TO` command, OceanBase Database performs the following operations internally:

1. Roll back all the operations with an SQL sequence that is greater than the SQL sequence of the savepoint, and release the corresponding row lock, such as the lock of row 2 in this example.

2. Delete all savepoints that are created after this savepoint. In this example, the `sp2` savepoint is deleted.

You can continue to execute the transaction after running a `ROLLBACK TO` command.

For more information about savepoints, see [Savepoints](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378287).

#### Commit a transaction

In OceanBase Database, transactions can be committed explicitly or implicitly. To explicitly commit a transaction, use the `COMMIT` statement or the commit button on a GUI-based client. In implicit commit of a transaction, you do not need to proactively commit it. When `autocommit` is set to `1`, after each statement is executed, OceanBase Database will automatically commit the transaction where this statement is executed. In this case, a statement is a transaction.

OceanBase Database issues an implicit `COMMIT` statement before and after a DDL statement, which also commits a transaction.

In an implicit commit process, OceanBase Database automatically commits an active transaction without receiving a transaction ending statement such as a `COMMIT` or `ROLLBACK` statement.

A transaction may be implicitly committed in the following scenarios:

* A statement that is used to start a transaction is executed.

* A DDL statement is executed.

#### Commit a transaction explicitly

Use `BEGIN` to start a transaction, use `INSERT` to insert data into the `ordr` table, and then use `COMMIT` to commit the transaction.

```sql
obclient [test]> SELECT * FROM ordr;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   | 10003 | 2022-10-19 14:51:12 |
+----+------+-------+---------------------+
3 rows in set

obclient [test]> BEGIN;
Query OK, 0 rows affected 

obclient [test]> INSERT INTO ordr(id,name) VALUES(4,'JP');
Query OK, 1 row affected 

obclient [test]> COMMIT;
Query OK, 0 rows affected 
```

Close and then reconnect the session. Query the table data.

```shell
obclient [test]> SELECT * FROM ordr;
```

The return result is as follows, which indicates that the data is inserted and saved.

```shell
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   | 10003 | 2022-10-19 14:51:12 |
|  4 | JP   |  NULL | 2022-10-19 14:51:44 |
+----+------+-------+---------------------+
4 rows in set
```

#### Commit a transaction implicitly

Set the `autocommit` variable to `1` to enable the autocommit mode.

```sql
obclient [test]> SELECT * FROM ordr;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   | 10003 | 2022-10-19 14:51:12 |
|  4 | JP   |  NULL | 2022-10-19 14:51:44 |
+----+------+-------+---------------------+
4 rows in set

obclient [test]> SET autocommit=1;

obclient [test]>  INSERT INTO ordr(id,name) VALUES(5,'CN');
Query OK, 1 row affected 
```

Close and then reconnect the session. Query the table data.

```sql
obclient [test]> SELECT * FROM ordr;
```

The return result is as follows, which indicates that the data is inserted and saved.

```shell
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   | 10003 | 2022-10-19 14:51:12 |
|  4 | JP   |  NULL | 2022-10-19 14:51:44 |
|  5 | CN   |  NULL | 2022-10-19 14:53:56 |
+----+------+-------+---------------------+
5 rows in set
```

#### Roll back a transaction

Rolling back a transaction is to revoke all the changes made in the transaction. Before a transaction is committed, you can roll back the entire transaction or roll back the transaction to any savepoint.

After you roll back an entire transaction:

* All changes made in the transaction are discarded.

* All savepoints are cleared.

* All locks held by the transaction are released.

To roll back an entire transaction, use the following syntax:

```sql
ROLLBACK;
```

In the following example, `ROLLBACK` is used to revoke all changes made by the current transaction.

```sql
obclient [test]> SELECT * FROM ordr;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   | 10003 | 2022-10-19 14:51:12 |
|  4 | JP   |  NULL | 2022-10-19 14:51:44 |
|  5 | CN   |  NULL | 2022-10-19 14:53:56 |
+----+------+-------+---------------------+
5 rows in set

obclient [test]> BEGIN;
Query OK, 0 rows affected 

obclient [test]> INSERT INTO ordr(id, name, value) VALUES(6,'JP',10007);
Query OK, 1 row affected 

obclient [test]> INSERT INTO ordr(id, name, value) VALUES(8,'FR',10008),(9,'RU',10009);
Query OK, 2 rows affected 
Records: 2  Duplicates: 0  Warnings: 0

obclient [test]> SELECT * FROM ordr;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   |  1003 | 2022-10-19 14:51:12 |
|  4 | JP   |  NULL | 2022-10-19 14:51:44 |
|  5 | CN   |  NULL | 2022-10-19 14:53:56 |
|  6 | JP   | 10007 | 2022-10-19 14:58:24 |
|  8 | FR   | 10008 | 2022-10-19 14:58:35 |
|  9 | RU   | 10009 | 2022-10-19 14:58:35 |
+----+------+-------+---------------------+
8 rows in set

obclient [test]> ROLLBACK;
Query OK, 0 rows affected 

obclient [test]> SELECT * FROM ordr;
+----+------+-------+---------------------+
| id | name | value | gmt_create          |
+----+------+-------+---------------------+
|  1 | CN   | 10001 | 2022-10-19 14:51:12 |
|  2 | US   | 10002 | 2022-10-19 14:51:12 |
|  3 | EN   |  1003 | 2022-10-19 14:51:12 |
|  4 | JP   |  NULL | 2022-10-19 14:51:44 |
|  5 | CN   |  NULL | 2022-10-19 14:53:56 |
+----+------+-------+---------------------+
5 rows in set
```

In this example, the `BEGIN` statement is used to start a transaction. Before the `COMMIT` statement is used to commit the transaction, all modifications are visible only to the current session, and none of them is persisted. You can use the `ROLLBACK` statement to roll back the modifications.

##### Automatically roll back a transaction

In an automatic rollback process, OceanBase Database rolls back a transaction without receiving a `ROLLBACK` command from users. A transaction may be automatically rolled back in the following scenarios:

* The session is disconnected.

* The transaction execution times out. The `ob_trx_timeout` parameter specifies the transaction timeout duration in microseconds.

* No statement is executed in a session where an active transaction resides within the idle timeout period. The `ob_trx_idle_timeout` parameter specifies the idle timeout duration in microseconds. A timeout occurs when the execution interval between two statements exceeds the value of this parameter.

##### Roll back an interrupted transaction

If an internal error occurs during the execution of a transaction due to a node failure or other reasons, the transaction is interrupted. In this case, the transaction cannot execute a statement and must be rolled back.

If you execute an SQL statement in this case, the message "transaction need rollback" appears. You must execute a `ROLLBACK` statement to end the transaction.

#### Transaction isolation levels

Isolation levels describe the extent to which concurrent transactions interfere with each other during execution. The SQL-92 standard of American National Standards Institute (ANSI) and International Organization for Standardization (ISO) defines four isolation levels based on the exceptions that must be avoided during transaction execution. The higher the isolation level, the weaker the interference between transactions and the fewer exceptions that are allowed to occur. At the highest isolation level Serializable, no exceptions are allowed. The following exceptions are to be avoided:

* Dirty read
 
  One transaction reads the data that has not been committed by other transactions.

* Non-repeatable read
 
  When you query the data of a row that you have once read, you find that the data of this row has been modified or deleted. For example, for `select c2 from test where c1=1;`, the value of `c2` queried for the first time is `1`. When you query `c2` again, its value becomes `2` because other transactions have modified the value.

* Phantom read
  
  When the same query conditions are used again during request execution, the newly inserted rows in another committed transaction that meet the conditions are read and returned in the result set.

| Isolation level |  Dirty read  | Non-repeatable read |  Phantom read  |
| ------- | ------ | ---------- | ----- |
| Read uncommitted | Possible   | Possible       | Possible   |
| Read committed | Impossible | Possible       | Possible   |
| Repeatable read | Impossible | Impossible     | Possible   |
| Serializable | Impossible | Impossible     | Impossible |

OceanBase Database in MySQL mode supports the following isolation levels:

* Read committed: A query executed by a transaction can read only the data committed before the query starts. This isolation level cannot prevent non-repeatable or phantom reads.

* Repeatable read: The same data read at different times within a transaction is consistent.

* Serializable: It is similar to the serializable isolation level in Oracle Database, but is not strictly a serializable isolation level.

By default, OceanBase Database uses the **read committed** isolation level.

In practice, only the **Read committed** and **Serializable** isolation levels are implemented in OceanBase Database. If you set the isolation level to **Repeatable read**, **Serializable** is implemented. In other words, OceanBase Database implements a stricter **Repeatable read** isolation level to prevent phantom reads. At the **Read committed** isolation level, dirty reads are impossible, but non-repeatable reads and phantom reads may occur. At the **Serializable** isolation level, dirty, non-repeatable, and phantom reads are impossible.

##### OceanBase Database vs other databases in terms of isolation levels

|         Database           |   Read uncommitted    | Read committed | Repeatable read |  Serializable  |
| ------------------------- | --------------------------------- | -------------------------- | --------------------------- | -------------------------- |
| OceanBase                 | Not supported                        | Supported, conforming to the SQL standard       | Supported, no phantom reads          | Supported, strict serializable isolation not guaranteed |
| MySQL                     | Supported, with possible dirty reads            | Supported, conforming to the SQL standard      | Supported, no phantom reads          | Supported, strict serializable isolation guaranteed |
| Oracle                    | Not supported                        | Supported, conforming to the SQL standard      | Not supported                  | Supported, strict serializable isolation not guaranteed |
| PostgreSQL earlier than 9.1   | Supported, read committed isolation implemented | Supported, conforming to the SQL standard      | Supported, no phantom reads          | Supported, strict serializable isolation not guaranteed |
| PostgreSQL 9.1 and later | Supported, read committed isolation implemented | Supported, conforming to the SQL standard      | Supported, no phantom reads          | Supported, strict serializable isolation guaranteed |

Differences of transaction isolation levels between OceanBase Database in MySQL mode and MySQL Database are described as follows:

* Read uncommitted: The **read uncommitted** isolation level is supported in MySQL Database but not in OceanBase Database in MySQL mode.

* Read committed: At the read committed isolation level, MySQL Database implements semi-consistent reads to determine whether a row meets the conditions for an update. If a row is already updated in a concurrent transaction, MySQL Database waits for the transaction to finish and then determines whether to update the row based on the latest version. OceanBase Database determines whether a row meets the conditions for an update based on the version in the snapshot of the statement, regardless of whether the row is updated in a concurrent transaction or not.

* Repeatable read: When a write conflict occurs at the repeatable read isolation level in MySQL Database, a data write transaction waits for the previous one to finish. If the previous one rolls back, the transaction updates data based on the original version. If the previous one commits, the transaction updates data based on the latest version. In OceanBase Database, a data write transaction waits for the previous one to finish. If the previous one rolls back, the transaction updates data based on the original version. If the previous one commits, the transaction rolls back and returns an error.

* Serializable: MySQL Database implements the serializable isolation level based on the two-phase lock (2PL) protocol, which guarantee strict serializability. OceanBase Database implements the serializable isolation level based on snapshot isolation, which cannot guarantee strict serializability.

##### Read committed

At the read committed isolation level in OceanBase Database, when a `SELECT` statement is executed, only the data from transactions committed before the execution of the statement is read. The data from transactions committed during the statement execution or modified by concurrent transactions is not read. In other words, the latest snapshot of the current database is obtained prior to the execution of each statement. Dirty reads are impossible because the snapshot records only the committed data. However, two consecutive `SELECT` statements in the same transaction may obtain different data because a new snapshot is obtained before each statement is executed. This means that unrepeatable reads and phantom reads may occur at the read committed isolation level.

Like the `SELECT` statement, statements such as `UPDATE`, `DELETE`, and `SELECT FOR UPDATE` obtain only the row version committed prior to the statement execution when searching for a row. They skip the row if that version does not satisfy the predicates of the update operation, and try to update the row only if it does. However, while a transaction (transaction A) is trying to update a row that satisfies the predicates, the row may have already been updated by another concurrent transaction (transaction B). In this case, if transaction B has not finished, transaction A waits for transaction B to commit or roll back. If transaction B rolls back, transaction A continues to update the target row. If transaction B commits, transaction A re-executes the statement, thus re-obtaining the statement snapshot to read the version updated by transaction B. If that version still satisfies the predicates, the target row is updated on top of that version.

##### Repeatable read or serializable

At the serializable or repeatable read isolation level in OceanBase Database, the first statement of a transaction obtains the snapshot of the current database as the transaction snapshot, from which data is read during the execution of subsequent `SELECT` statements. Only the data from transactions committed before the transaction snapshot is read. The data from transactions committed during the transaction execution or modified by concurrent transactions is not read. As all statements use the same transaction snapshot with consistent data, non-repeatable reads and phantom reads are impossible.

Like the `SELECT` statement, statements such as `UPDATE`, `DELETE`, and `SELECT FOR UPDATE` obtain only the row version committed prior to the transaction snapshot when searching for a row. They skip the row if that version does not satisfy the predicates of the update operation, and try to update the row only if it does. However, while a transaction (transaction A) has found the target row, the row may have already been updated by another concurrent transaction (transaction B). In this case, if transaction B has not finished, transaction A waits for transaction B to commit or roll back. If transaction B rolls back, transaction A continues to update the originally found row. If transaction B commits, transaction A rolls back to avoid lost updates. In this case, OceanBase Database in MySQL mode returns the following error message:

```sql
ERROR 6235 (25000): can't serialize access for this transaction
```

> **Note**
>
> A transaction at the business layer may roll back due to write conflicts and retry. If the business does not require that all statements in a transaction use consistent data, we recommend that you use the read-committed isolation level for complex transactions whose retry costs are high.

##### Set the isolation level

You can set the isolation level at the global level or the session level.

```sql
SET [GLOBAL | SESSION] TRANSACTION ISOLATION LEVEL [READ COMMITTED | REPEATABLE READ | SERIALIZABLE];
```

##### Limitations

* You cannot set the isolation level during transaction execution. Otherwise, the following error is reported:

  ```sql
  ERROR 1568 (25001): Transaction characteristics can't be changed while a transaction is in progress
  ```

* Global isolation levels can be overridden by isolation levels at the session level.

* Limitations of the serializable isolation level

  In the SQL standard, the serializable isolation level avoids only dirty reads, non-repeatable reads, and phantom reads. The strict definition of serializability is as follows: Any two concurrent transactions are executed sequentially, one after another. In other words, same results are returned, regardless of whether the transactions are executed sequentially or in parallel. Similar to Oracle, and PostgreSQL 9.0 and earlier, OceanBase Database does not guarantee strict serializability at the serializable isolation level. This means that the execution result of transactions may be different from that of any serial execution. A typical example is write skew. Assume that you have created two empty tables named `T1(num int)` and `T2(num int)`, and executed statements in transaction 1 (`Trx1`) and transaction 2 (`Trx2`) in the following order:

  ```sql
  Trx1                                                  Trx2
  BEGIN;
  INSERT INTO T2 SELECT COUNT(*) FROM T1;
  
                                                        BEGIN;
                                                        INSERT INTO T1 SELECT COUNT(*) FROM T2;
  COMMIT;
                                                        COMMIT:
  ```

  In the snapshots obtained by `Trx1` and `Trx2` transactions, the value of `COUNT` is `0` for both tables. The `num=0` row will be inserted into both `T1` and `T2` tables. If the two transactions are executed serially, regardless of the execution sequence, `num=0` and `num=1` will be inserted into both tables respectively. At present, OceanBase Database cannot guarantee strict serializability because it does not lock read operations or check for loops of read/write conflicts when a transaction commits, and reads and writes are not mutually exclusive. In most real-world scenarios, only dirty reads, phantom reads, and non-repeatable reads must be prevented in business. If the business requires strict serializability, you can explicitly add locks to read operations by using, for example, the `SELECT FOR UPDATE` statement.

#### Weak consistency read

OceanBase Database provides two consistency levels: STRONG and WEAK. In a strong consistency read operation, the latest data must be read, and requests are routed to the leader. In a weak consistency read operation, the reading of the latest data is not required, and requests are preferentially routed to the followers. In OceanBase Database, write operations always feature strong consistency, which means that the leader provides services. By default, read operations in OceanBase Database feature strong consistency, which means that the leader provides services. However, you can specify weak consistency reads. In this case, the followers preferentially provide services.

For more information about weak consistency read, see [Weak consistency read](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001377992).
