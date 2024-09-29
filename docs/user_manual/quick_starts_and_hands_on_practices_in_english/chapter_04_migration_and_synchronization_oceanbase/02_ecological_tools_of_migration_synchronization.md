---
title: Ecosystem components for data migration and synchronization
weight: 3
---

# 4.2 Ecosystem components for data migration and synchronization

Database O&M engineers often need to migrate or synchronize data in the event of database replacement, IDC relocation, business testing, database upgrade, and other routine database O&M operations. You can perform operations such as inter-table data archiving, disk usage balancing, and resource unit migration within an OceanBase cluster by using simple commands. However, you need tools to, for example, synchronize data between clusters or with heterogeneous data sources. 

This topic describes several frequently used data migration methods and tools. 

The following table lists the migration solutions supported by OceanBase Database.

| Migration solution | Schema migration | Full data migration | Incremental migration | Data verification | Supported data source |
| ------------------- | -------- | ------------ | ------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OceanBase Migration Service (OMS) | Supported | Supported | Supported | Supported |  <ul><li>OceanBase</li><li>MySQL</li><li>MariaDB</li><li>PostgreSQL</li><li>GreenPlum</li><li>HBase</li><li>TiDB</li><li>Kafka</li><li>RocketMQ</li></ul> |
| OBLogProxy | Supported | Not supported | Supported | Not supported |  <ul><li>OceanBase</li><li>MySQL binlog tools</li><li>CDC tools</li><li>OBLogClient</li></ul> |
| OBLOADER & OBDUMPER | Supported | Supported | Not supported | Not supported | OceanBase |
| SQL statements | Supported | Supported | Not supported | Not supported |  <ul><li>Mainstream databases</li><li>SQL text</li><li>CSV files</li></ul> |
| DataX | Not supported | Supported | Not supported | Not supported | Many data sources are supported. For more information, see [official introduction](https://github.com/alibaba/DataX/blob/master/introduction.md) |
| Canal | Supported | Supported | Supported | Not supported | Many data sources are supported. For more information, see [official introduction](https://github.com/alibaba/canal/wiki) |
| Flink CDC | Supported | Supported | Supported | Not supported | Many data sources are supported. For more information, see [official introduction](https://github.com/apache/flink-cdc) |
| SeaTunnel | Supported | Supported | Supported | Not supported | Many data sources are supported. For more information, see [official introduction](https://seatunnel.apache.org/docs/about/) |

## OMS

OMS is a service that supports data interaction between a homogeneous or heterogeneous data source and OceanBase Database. OMS provides the capabilities for online migration of existing data and real-time synchronization of incremental data. 

OMS Community Edition provides a visualized and centralized management platform. You can migrate data in real time with simple configurations. OMS Community Edition aims to implement real-time data migration and synchronization from homogeneous or heterogeneous databases to OceanBase Database with low risks, low costs, and high efficiency. 

For more information, see [OceanBase Migration Service](https://en.oceanbase.com/docs/oms-en). 

## OBLogProxy

OBLogProxy is the incremental log proxy service of OceanBase Database. It establishes connections with OceanBase Database to read incremental logs and provides downstream services with change data capture (CDC) capabilities. 

OBLogProxy supports the following two modes: 

* The binlog mode of OBLogProxy is designed for compatibility with MySQL binlogs. It allows you to use MySQL binlog incremental parsing tools to synchronize OceanBase Database logs in real time. Thereby, you can smoothly use MySQL binlog tools with OceanBase Database. 

* OBLogProxy in CDC mode subscribes to data changes in OceanBase Database and synchronizes these data changes to downstream services in real time for real-time or quasi-realtime data replication and synchronization. 

For more information, see [OBLogProxy](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001239311). 

## OBLOADER & OBDUMPER

OBLOADER & OBDUMPER are client tools that are developed in Java. At present, they apply only to OceanBase Database. You can use OBLOADER to import the definition files and table data files of database objects in storage media to OceanBase Database, or use OBDUMPER to export them to storage media. 

We recommend that you use OBLOADER in combination with OBDUMPER. OBLOADER is compatible with the CSV files exported by using client tools such as mysqldump and Mydumper. Therefore, you can use OBLOADER in data migration. You can integrate OBDUMPER into a database O&M system for logical backup. OBLOADER provides various types of built-in data preprocessing functions to improve its data import performance. The automatic fault tolerance mechanism ensures data import stability. Rich monitoring information is provided for you to observe the import performance and progress in real time. 

For more information, see [OceanBase Loader and Dumper](https://en.oceanbase.com/docs/obloader-obdumper-en). 

## SQL statements for data migration

Executing SQL statements is a common and simple way to export data to an external file or import data from an external file to a database. You can also use SQL statements to migrate data from one table to another and process the data accordingly. 

Supported statements include SELECT INTO OUTFILE, LOAD DATA, and INSERT INTO. Direct load is also supported to accelerate data import. For more information, see 'Use SQL statements for data migration' in 'migration-and-synchronization-through-sql'. 

## Other migration tools

### Canal

Canal parses the incremental logs of a MySQL database and provides incremental data subscription and consumption. 

In its early days, Alibaba needed to synchronize data between the two IDCs deployed in China and the United States, and the incremental data was collected based on business triggers. Since 2010, the company has gradually switched the method to obtaining and synchronizing incremental data by parsing database logs, giving rise to a large number of database services that are based on the subscription and consumption of incremental logs. Canal supports using a MySQL 5.1.x, 5.5.x, 5.6.x, 5.7.x, or 8.0.x database as the source. 

Canal works in the following way:

1. Canal disguises itself as a MySQL slave by simulating the communication protocol of the MySQL slave, and sends a dump request to the MySQL master.

2. The MySQL master receives the dump request, and pushes binary logs to the slave, which is Canal.

3. Canal parses the binary logs into a stream of bytes.

For more information, see the [introduction to Canal](https://github.com/alibaba/canal?tab=readme-ov-file). 

### Flink CDC

Flink CDC is a streaming data processing technology based on Flink.  

It monitors and captures changes of the data source, extracts the changes into the data streams of Flink, and sends the data streams to downstream systems in real time, so that downstream systems can process the data changes in a timely manner. Flink CDC supports multiple data sources, such as relational databases, NoSQL databases, and message queues. 

For more information, see the [introduction to Flink CDC](https://github.com/apache/flink-cdc). 

### DataX

DataX is a tool for offline synchronization between heterogeneous data sources. You can use it to stably and efficiently synchronize data between many types of heterogeneous data sources, such as relational databases (like MySQL, Oracle, and OceanBase Database), HDFS, Hive, ODPS, HBase, and FTP. 

![DataX architecture](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/02_ecological_tools_of_migration_synchronization/001.png)

To address issues of data synchronization between heterogeneous data sources in a complex mesh topology, DataX introduces the star topology and serves as the transmission hub that connects to various data sources. This way, you can connect a new data source to DataX and start synchronizing data between the new data source and the existing data sources right away. 

For more information, see [the introduction of DataX](https://github.com/alibaba/DataX/blob/master/introduction.md). 

### SeaTunnel

SeaTunnel is an easy-to-use distributed data integration platform that supports real-time synchronization of massive amounts of data with ultra-high performance. It can stably and efficiently synchronize tens of billions of data records every day and has been deployed by nearly 100 enterprises for their production. 

SeaTunnel is specifically developed for data integration and synchronization, and solves the following data integration challenges:

* Diverse data sources: While hundreds of types of incompatible data sources are in use in the industry, emerging technologies keep bringing new data source types. Users require a tool that efficiently supports most if not all of the data sources. 

* Complex synchronization scenarios: For example, offline full synchronization, offline incremental synchronization, CDC data synchronization, real-time synchronization, and database synchronization are involved. 

* High resource consumption: Existing data integration and synchronization tools often consume a great amount of computing resources or Java Database Connectivity (JDBC) resources for real-time synchronization of numerous small tables, which increases the resource costs of enterprises. 

* Lack of quality monitoring: Data loss and duplication are common issues during the process of a data integration or synchronization task, which lacks monitoring, making it impossible to observe the data quality of the task. 

* Complex technology stacks: Enterprises use different technical components, therefore users must develop corresponding synchronization programs for data integration. 

* Difficulties in management and maintenance: As different underlying technical components, such as Flink and Spark, are used, offline and real-time synchronization processes are often separately developed and managed, making the synchronization management and maintenance more difficult. 

The following diagram describes the workflow of SeaTunnel.

![SeaTunnel workflow](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/02_ecological_tools_of_migration_synchronization/002.png)

For more information, see the [introduction to SeaTunnel](https://seatunnel.apache.org/docs/about/). 
