---
slug: binlog-service
title: 'OceanBase Binlog Service'
---

Foreword
--

MySQL is a globally renowned open source relational database and boasts high stability, reliability, and ease of use. Its popularity is mainly credited to a feature released in the early stage—binary log (binlog).

MySQL binlogs are a set of log files that record all changes made to a MySQL database. The feature has won the favor of developers and enterprises since it was introduced in MySQL. MySQL binlog files store all SQL statements that change the database status in an easily readable binary format, enabling data integration and replication in databases. After years of accumulation, MySQL has developed some mature incremental parsing systems based on the logical binlog replication capability. These systems are widely applied to data integration, including [Canal](https://github.com/alibaba/canal) and [Debezium](https://github.com/debezium/debezium).

OceanBase Database has been supporting the MySQL mode since a very early version, allowing MySQL users to switch to OceanBase Database at low costs. Considering that some mature MySQL parsing systems for incremental binlogs have been widely used, **OceanBase Database integrated existing systems** and released its own binlog service shortly thereafter.

The binlog service supported in OceanBase Database provides similar features to MySQL, such as logging database changes. This is critical to ensuring the success of data migration and synchronization and guaranteeing data consistency. This service allows MySQL users to leverage familiar binlog-based solutions for monitoring, backup, and real-time data replication in OceanBase Database.

Logical Binlog Replication Architecture in MySQL
-------------------

![1719456500](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-06/1719456499955.png)

Data replication in MySQL is implemented depending on binlogs, Specifically, MySQL uses binlogs to mainly record the logical changes of data in the SQL engine layer, instead of using redo logs to record physical changes in the transaction engine layer. This design has a specific purpose.

MySQL aims to support multiple storage engines such as InnoDB and MyISAM. Each storage engine has its own characteristics and advantages. This MySQL mechanism allows seamless data replication and heterogeneous data synchronization between different storage engines.

What's more, it ensures data consistency and demonstrates the superiority of MySQL in replication flexibility and system compatibility. By recording logical rather than physical data changes, MySQL successfully integrates diversified storage engine features and is widely adopted in replication architectures that require high compatibility and flexibility.

The MySQL binlog service also plays a key role in the big data field. The service provides a Change Data Capture (CDC) tool to process and analyze data.

**The advantages of the binlog service in the big data environment are as follows:**

1. **Data synchronization**: The binlog service monitors and records data changes, including insert, update, and delete operations, in real time. Real-time data streams are captured by big data tools and synchronized to data lakes, data warehouses, or other big data processing systems for further analysis.
2. **Real-time analysis**: By leveraging the CDC tool provided by the binlog service, enterprises can push captured data changes to a stream processing engine such as Apache Kafka, Apache Flink, or Apache Storm for further analysis to support real-time business insights and decisions.
3. **Cross-platform data integration**: Maintaining data consistency across different databases and storage engines is a big challenge for database systems in the big data environment. The binlog service provides CDC tools such as Canal and Debezium for users to seamlessly synchronize data to Hadoop, Apache Hive, Elasticsearch, or any other target database, meeting their needs for data integration.
4. **System decoupling**: The binlog service allows event-based data architecture design. This means that data producers (databases) and consumers (for example, a big data processing service) can be loosely coupled and independently extended, improving the system flexibility and stability.
5. **Audit and tracking of historical data**: The binlog service supports the audit of historical data, which is necessary for analyzing the trend and mode of historical data and tracking audit records.

Characteristics of the MySQL Binlog Service
---------------

The binlog service performs different behaviors in transaction storage engines and non-transaction storage engines. **This post involves only the binlog behaviors in the transaction storage engine InnoDB**. On the one hand, InnoDB is the default storage engine that is widely used among the multiple storage engines supported by MySQL. On the other hand, OceanBase Database natively supports transactions and needs to follow the MySQL binlog behaviors in the transaction storage engine InnoDB in MySQL mode.

MySQL binlog files support two formats: Statement-Based Replication (SBR) and Row-Based Replication (RBR). Binlogs in the SBR format record the content of SQL statements and their context information and occupy small disk space. However, data synchronization issues may occur during SBR under certain circumstances. Relatively speaking, binlogs in the RBR format record the specific values of data before changes, without session context information attached. This avoids issues faced by SBR and ensures data consistency.

Binlog parsing systems such as Canal and Debezium support only the RBR format. Considering the compatibility of these parsing systems and their wide application in data synchronization and integration, this post focuses on binlogs in the RBR format, which can be compatible with all the preceding parsing systems.

MySQL binlogs consist of two groups of files:

*   Binlog files, which are numbered consecutively from 1. For example, MySQL binlogs are numbered 000001, 000002, and 000003, as shown in the preceding figure.
*   Binlog index files, for example, mysql-bin.index in the preceding figure. The file is a text file and records the names of all existing binlog files. Return results of the `SHOW BINARY LOGS` statement are read from this index file.

MySQL binlogs consist of different types of events. In MySQL 5.7, about 40 event types are supported. From the perspective of CDC-based incremental parsing, the following types of events need to be noticed: Format\_desc, Previous\_gtids, Gtid, Rotate, Query, Xid, Table\_map, Write\_rows, Update\_rows, and Delete\_rows. From the perspective of transactions, all binlog events related to a transaction are consecutive in a binlog, which means that events of different transactions do not overlap and binlog events of a transaction are not stored across binlogs. Here is a sample return result of the `SHOW BINLOG EVENTS` statement:
```
    mysql> SHOW BINLOG EVENTS IN 'mysql-bin.000009';
    +------------------+------+----------------+------------+-------------+--------------------------------------------------------------------+
    | Log_name         | Pos  | Event_type     | Server_id  | End_log_pos | Info                                                               |
    +------------------+------+----------------+------------+-------------+--------------------------------------------------------------------+
    | mysql-bin.000009 |    4 | Format_desc    | 1147473732 |         123 | Server ver: 5.7.35-log, Binlog ver: 4                              |
    | mysql-bin.000009 |  123 | Previous_gtids | 1147473732 |         194 | ebd2d3b0-6399-11ec-86ea-0242ac110004:1-38                          |
    | mysql-bin.000009 |  194 | Gtid           | 1147473732 |         259 | SET @@SESSION.GTID_NEXT= 'ebd2d3b0-6399-11ec-86ea-0242ac110004:39' |
    | mysql-bin.000009 |  259 | Query          | 1147473732 |         353 | create database test                                               |
    | mysql-bin.000009 |  353 | Gtid           | 1147473732 |         418 | SET @@SESSION.GTID_NEXT= 'ebd2d3b0-6399-11ec-86ea-0242ac110004:40' |
    | mysql-bin.000009 |  418 | Query          | 1147473732 |         543 | use `test`; CREATE TABLE t1(id int primary key, v varchar(30))    |
    | mysql-bin.000009 |  543 | Gtid           | 1147473732 |         608 | SET @@SESSION.GTID_NEXT= 'ebd2d3b0-6399-11ec-86ea-0242ac110004:41' |
    | mysql-bin.000009 |  608 | Query          | 1147473732 |         733 | use `test`; CREATE TABLE t2(id int primary key, v varchar(30))    |
    | mysql-bin.000009 |  733 | Gtid           | 1147473732 |         798 | SET @@SESSION.GTID_NEXT= 'ebd2d3b0-6399-11ec-86ea-0242ac110004:42' |
    | mysql-bin.000009 |  798 | Query          | 1147473732 |         870 | BEGIN                                                              |
    | mysql-bin.000009 |  870 | Table_map      | 1147473732 |         918 | table_id: 114 (test.t1)                                            |
    | mysql-bin.000009 |  918 | Write_rows     | 1147473732 |         963 | table_id: 114 flags: STMT_END_F                                    |
    | mysql-bin.000009 |  963 | Table_map      | 1147473732 |        1011 | table_id: 115 (test.t2)                                            |
    | mysql-bin.000009 | 1011 | Write_rows     | 1147473732 |        1056 | table_id: 115 flags: STMT_END_F                                    |
    | mysql-bin.000009 | 1056 | Xid            | 1147473732 |        1087 | COMMIT /* xid=57 */                                                |
    | mysql-bin.000009 | 1087 | Gtid           | 1147473732 |        1152 | SET @@SESSION.GTID_NEXT= 'ebd2d3b0-6399-11ec-86ea-0242ac110004:43' |
    | mysql-bin.000009 | 1152 | Query          | 1147473732 |        1224 | BEGIN                                                              |
    | mysql-bin.000009 | 1224 | Table_map      | 1147473732 |        1272 | table_id: 114 (test.t1)                                            |
    | mysql-bin.000009 | 1272 | Update_rows    | 1147473732 |        1328 | table_id: 114 flags: STMT_END_F                                    |
    | mysql-bin.000009 | 1328 | Table_map      | 1147473732 |        1376 | table_id: 115 (test.t2)                                            |
    | mysql-bin.000009 | 1376 | Update_rows    | 1147473732 |        1432 | table_id: 115 flags: STMT_END_F                                    |
    | mysql-bin.000009 | 1432 | Xid            | 1147473732 |        1463 | COMMIT /* xid=61 */                                                |
    | mysql-bin.000009 | 1463 | Gtid           | 1147473732 |        1528 | SET @@SESSION.GTID_NEXT= 'ebd2d3b0-6399-11ec-86ea-0242ac110004:44' |
    | mysql-bin.000009 | 1528 | Query          | 1147473732 |        1600 | BEGIN                                                              |
    | mysql-bin.000009 | 1600 | Table_map      | 1147473732 |        1648 | table_id: 114 (test.t1)                                            |
    | mysql-bin.000009 | 1648 | Delete_rows    | 1147473732 |        1693 | table_id: 114 flags: STMT_END_F                                    |
    | mysql-bin.000009 | 1693 | Xid            | 1147473732 |        1724 | COMMIT /* xid=67 */                                                |
    | mysql-bin.000009 | 1724 | Rotate         | 1147473732 |        1771 | mysql-bin.000010;pos=4                                             |
    +------------------+------+----------------+------------+-------------+--------------------------------------------------------------------+
    28 rows in set (0.00 sec)
```
Technical Mechanism of Parsing Systems Canal and Debezium
--------------------

Both Canal and Debezium are CDC tools, which are mainly used to monitor changes made to a database and broadcast these changes. Although Canal mainly serves MySQL while Debezium supports multiple database systems, they share similar technical mechanisms to parse and transfer data changes.

Imitating the communication process of a slave MySQL server, Canal and Debezium parse MySQL binlogs, extract changes such as data addition, deletion, and update, and convert them into a unified format.

1.  **Establish a connection**: Canal or Debezium connects to the master MySQL server to imitate the behavior of the server.
2.  **Request binlogs**: Canal or Debezium requests MySQL to send binlogs from a specific position.
3.  **Parse binlogs**: Canal or Debezium reads binlog streams from the connection and parses them into identifiable data change events.
4.  **Convert data**: Parsed events are converted into a general message format for subsequent systems to consume.
5.  **Broadcast changes**: Data changes can be sent to various types of middleware or directly used by other systems such as the Kafka message queue, monitoring systems, caches, and search engines.

Canal or Debezium disguises itself as a slave server, sets the server ID and UUID for itself, and locates and pulls binlog events by using the `COM_BINLOG_DUMP` or `COM_BINLOG_DUMP_GTID` protocol instruction. In addition, to support binlog parsing, the system variables `binlog_format` and `binlog_row_image` must be set to `ROW` and `FULL`, respectively.

During binlog parsing, Canal or Debezium focuses on the DML and DDL operations that are involved in transactions. The main binlog events to be parsed are listed as follows. Some control binlog events also need to be parsed, including Format\_desc, Rotate, Previous\_gtids, and Gtid.

| Event type | Description |
| ---------- | ----------- |
| Query | It indicates a BEGIN operation or a DDL operation of a transaction. |
| Xid | It indicates a COMMIT operation of a transaction. |
| Table\_map | In a transaction, a DML statement changes data in one or more tables. A Table\_map event is generated for each table involving data changes and is written to binlogs for recording the internal IDs and names of these tables. Table\_map events take precedence over all events generated by DML operations, including Write\_rows, Update\_rows, and Delete\_rows, in the binlog events of this transaction. |
| Write\_rows | An event of this type is generated by an INSERT statement. Each event can contain the insert records of multiple rows that correspond to the same table ID. If an INSERT statement inserts multiple rows of data, consecutive events of this type are generated. |
| Update\_rows | An event of this type is generated by an UPDATE statement. Each event can contain the update records of multiple rows that correspond to the same table ID. If an UPDATE statement updates multiple rows of data, consecutive events of this type are generated. |
| Delete\_rows | An event of this type is generated by a DELETE statement. Each event can contain the delete records of multiple rows that correspond to the same table ID. If a DELETE statement deletes multiple rows of data, consecutive events of this type are generated. |

Although Write\_rows, Update\_rows, and Delete\_rows events record the data values before and after a change, the recorded metadata does not contain the column names in the changed tables. Therefore, you need to query MySQL metadata to obtain the schema definition of these tables during initialization before Canal or Debezium parses binlogs. Moreover, MySQL uses the same IP address and port (defaulted to port 3306) to provide SQL and binlog services.

MySQL-compatible Binlog Service in OceanBase Database
---------------------------------------------

The binlog mode of OBLogProxy is designed for compatibility with MySQL binlogs. It allows you to synchronize OceanBase Database logs by using MySQL binlog tools. Thereby, you can smoothly use MySQL binlog tools with OceanBase Database.

### Key technical points

The binlog service in OceanBase Database consists of three parts: OceanBase Database kernel, OceanBase Database Proxy (ODP), and oblogproxy. oblogproxy is the core of the binlog service.

The key technical points of the entire binlog service system are as follows:

*   OceanBase Database adopts the multitenancy design, where each tenant corresponds to a MySQL instant. Therefore, binlogs are created at the tenant level.
*   Clogs of OceanBase Database are obtained by using obcdc and need to be converted into the FULL row image format and stored as binlogs. These binlogs can be parsed by multiple downstream MySQL systems and analyzed by MySQL binlog tools, and supports pullback as well.
*   The MySQL communication protocol is supported.

*   `COM_BINLOG_DUMP` or `COM_BINLOG_DUMP_GTID` used for binlog dump is also a part of the MySQL communication protocol. ODP and oblogproxy need to identify and handle the two protocol instructions.
*   When parsing binlogs, Canal or Debezium needs to query the metadata of MySQL to obtain the schema definitions of involved tables and check binlog-related system variables to confirm whether binlogs are in the expected format. In addition, Debezium allows you to export snapshots of full baseline data before it dumps binlogs. `SELECT` and `SHOW` statements are involved in the preceding scenarios, which are forwarded by ODP.
*   MySQL uses the same IP address and port (defaulted to port 3306) to provide the SQL and binlog services. As for OceanBase Database, ODP uses the default port 2883 to access the SQL service, supports the binlog dump protocol, and forwards requests to the corresponding oblogproxy instance to enable compatibility with the MySQL binlog and SQL services.

### Terms

Related terms and their definitions are provided for you to better understand this post.

*   OceanBase database: refers to an OceanBase cluster.
*   ODP: the OceanBase Database access proxy that provides unified access to SQL and binlog protocols and commands.
*   oblogproxy: the core of the binlog service in OceanBase Database.
*   MySQL binlog tools: tools for parsing incremental MySQL binlogs, such as Canal and Debezium.
*   BC: the binlog converter module of oblogproxy. This module pulls and parses clog files and converts them into binlog files in the binlog format.
*   BD: the binlog dumper module of oblogproxy. This module provides binlog subscription services for subscription requests of downstream services (MySQL binlog systems).
*   BCM: the BC management module of oblogproxy.
*   BDM: the BD management module of oblogproxy.

### System architecture

![1719456552](/img/blogs/tech/binlog-service/image/1719456552842.png)

The preceding figure shows the entire technical architecture of the OceanBase binlog service that is compatible with the MySQL binlog system. The interaction process is as follows:

*   Create binlogs for the specified OceanBase tenant. Compared with the MySQL binlog service, this is an additional step for OceanBase Database users when needed.

*   Connect the MySQL client to oblogproxy and execute the `CREATE BINLOG` statement.
*   Use BCM to create a BC submodule after oblogproxy receives the binlog creation request.

*   After the BC submodule finishes initialization, use ODP to execute the following binlog-related statements in the MySQL client to check the binlog status. ODP needs to identify these statements and forward them to the corresponding oblogproxy instances. BCM returns the result set.

*   `SHOW MASTER STATUS`
*   `SHOW BINARY LOGS`
*   `SHOW BINLOG EVENTS`

*   Use ODP to execute queries irrelevant to binlogs in the MySQL client, during which ODP directly queries the corresponding OceanBase tenant.
*   Use MySQL binlog tools such as Canal and Debezium to send the `COM_BINLOG_DUMP` or `COM_BINLOG_DUMP_GTID` instruction to ODP. After receiving the instruction, ODP forwards the request to the corresponding oblogproxy instance. After receiving the `COM_BINLOG_DUMP` or `COM_BINLOG_DUMP_GTID` instruction, the oblogproxy instance creates a BD submodule by using BDM to provide the binlog dump service.

Summary
--

The emergence of the OceanBase binlog service is a great leap in the compatibility between modern database technologies and the MySQL ecosystem. The OceanBase binlog service benefits from the development of database technologies and meets user needs for real-time data processing and analysis. This service extends the MySQL-relevant features of OceanBase Database and creates a flexible solution that applies to a distributed multi-tenant database environment. By seamlessly integrating existing MySQL binlog tools, OceanBase Database allows users to enjoy high performance, high scalability, and high availability and maintains compatibility with these MySQL binlog tools, adapting to the habits of original MySQL binlog service users.

In terms of technologies, the OceanBase binlog service simplifies CDC and data replication, making data migration, synchronization, integration, review, and disaster recovery smoother.