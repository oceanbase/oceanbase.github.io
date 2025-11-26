---
title: Use OMS for data migration and synchronization
weight: 4
---

# 4.3 Use OMS for data migration and synchronization

This topic describes how to deploy and use OceanBase Migration Service (OMS). 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## OMS limitations

This section describes the limitations of OMS Community Edition. 

* The following table describes versions of OceanBase Database Community Edition and other databases that are supported by the data migration and data synchronization features of OMS Community Edition. 

   | Database | Data migration | Data synchronization |
   |-----|--------|-------|
   | OceanBase Database Community Edition | V3.1.0, V3.1.1, V3.1.2, V3.1.3, V3.1.4, V3.1.5, V4.0.0, V4.1.0, V4.2.0, V4.2.1, and V4.2.2 | V3.1.0, V3.1.1, V3.1.2, V3.1.3, V3.1.4, V3.1.5, V4.0.0, V4.1.0, V4.2.0, V4.2.1, and V4.2.2 |
   | Other databases | <ul><li>MySQL: 5.5, 5.6, 5.7, and 8.0</li><li>MariaDB: 10.2</li><li>TiDB: 4.x, 5.x, 6.x, and 7.x</li><li>PostgreSQL: 10.x and 12.x</li><li>GreenPlum: 4</li><li>HBase: 1.2.0-cdh5.15.2</li></ul> | <ul><li>Kafka: 0.9, 1.0, and 2.x</li><li>RocketMQ: 4.7.1</li></ul> |

* OMS Community Edition supports OceanBase Cloud Platform (OCP) Community Edition of the following versions: V3.1.1, V3.3.0, V4.0.0, V4.0.3, V4.2.0, and V4.2.1. 

* OMS Community Edition supports only the x86 architecture. 

## Supported migration types

| Migration type | Description |
|---------|------|
| Schema migration | Migrates the definitions of data objects, such as tables, indexes, constraints, comments, and views, from the source database to the destination database. Temporary tables are automatically filtered out. <br></br>If the source database is not an OceanBase database, the conversion and assembly of the data type and SQL syntax are performed based on the syntax definition and standard of the type of the destination OceanBase Database tenant, and then data is replicated to the destination database.  |
| Full data migration | Migrates the existing data from tables in the source database to the corresponding tables in the destination database. On the **Full Data Migration** page, you can view information on the **Tables**, **Table Indexes**, and **Migration Performance** tabs. The status of a full data migration task changes to **Completed** only after the table objects and table indexes are migrated. <br></br>On the **Table Indexes** page, you can click **View Creation Syntax** next to a table to view its index creation syntax. <br></br>You can combine full data migration with incremental synchronization to ensure data consistency between the source and destination databases. If any objects fail to be migrated during full data migration, the causes of the failure are displayed.  |
| Incremental synchronization | After incremental synchronization starts, data that has been changed (added, modified, or deleted) in the source database is synchronized to the corresponding tables in the destination database. <br></br>When services continuously write data to the source database, OMS Community Edition starts the incremental data pull module to pull incremental data from the source instance, parses and encapsulates the incremental data, and then stores the data. After that, OMS Community Edition starts the full data migration. <br></br>After the full data migration task is completed, OMS Community Edition starts the incremental data replay module to pull incremental data from the incremental data pull module. The incremental data is synchronized to the destination instance after being filtered, mapped, and converted.  |
| Full verification | After the full data migration and incremental data migration are completed, OMS Community Edition automatically initiates a full verification task to verify the data tables in the source and destination databases. You can initiate custom data verification tasks during incremental data synchronization. If tables with inconsistent data are detected, you can choose to re-verify all data or only the inconsistent data in the tables.  |
| Forward switchover | Forward switchover is an abstract and standard process of traditional system cutover and does not involve the switchover of application connections. This process includes a series of tasks that are performed by OMS Community Edition for application switchover in a data migration project. You must make sure that the entire forward switchover process is completed before the application connections are switched over to the destination database. <br></br>Forward switchover is required for data migration. OMS Community Edition ensures the completion of forward data migration in this process, and you can start the reverse incremental synchronization component based on your business needs. The forward switchover process involves the following operations:<ol><li>You must make sure that data migration is completed and wait until forward synchronization is completed. </li><li>OMS Community Edition automatically supplements CHECK constraints, FOREIGN KEY constraints, and other objects that are ignored in the schema migration stage. </li><li>OMS Community Edition automatically drops the additional hidden columns and unique indexes that the migration depends on. <br></br>This operation is required only when you migrate data within OceanBase Database Community Edition. For more information, see [Schema migration mechanisms](https://en.oceanbase.com/docs/community-oms-en-10000000001576271). </li><li>You must migrate triggers, functions, and stored procedures in the source database that are not supported by OMS Community Edition to the destination database. </li><li>You must disable triggers and FOREIGN KEY constraints in the source database. This operation is required only when the data migration project involves reverse incremental synchronization. </li></ol> |
| Reverse incremental migration | In business cutover scenarios, after the migration is completed, you can start an incremental synchronization project in a reverse direction. In other words, you can synchronize data from the destination database to the source database before the business database switchover. In this way, data changes made in the destination database after the switchover are applied to the source business database in real time.  |

## Deploy OMS

OMS supports single-node deployment and high-availability (HA) deployment. In HA deployment mode, you can deploy OMS on multiple nodes in a single region, or multiple nodes in multiple regions. If you want to use OMS in active-active disaster recovery scenarios, you must deploy OMS on multiple nodes in multiple regions. 

### Single-node deployment

OMS Community Edition deployed on a single node can still provide all features. If you do not need an HA environment, you can deploy OMS Community Edition on a single node. For more information, see [Deploy OMS Community Edition on a single node](https://en.oceanbase.com/docs/community-oms-en-10000000001087168). 

### Single-region multi-node deployment

You can deploy OMS Community Edition on multiple nodes to achieve high availability. In an HA architecture, each node of OMS Community Edition provides all features, and the backend task framework implements distributed scheduling based on the database. When a node becomes unavailable, the framework automatically schedules tasks to other available nodes of OMS Community Edition. 

The multiple nodes can be placed in a single region. For more information, see [Deploy OMS Community Edition on multiple nodes in a single region](https://en.oceanbase.com/docs/community-oms-en-10000000001087167). 

> **Note**
>
> The HA feature does not support automatic recovery of the Full-Import/Full-Verification component. 
>
> We recommend that you apply multi-node deployment in the production environment. 

### Multi-region multi-node deployment

You can deploy OMS Community Edition on multiple nodes in multiple regions. For more information, see [Deploy OMS Community Edition on multiple nodes in multiple regions](https://en.oceanbase.com/docs/community-oms-en-10000000001087164). 

### Check the deployment

After you deploy OMS Community Edition on the server, access Docker and check the service status to determine whether OMS Community Edition is properly operating on the server. For more information, see [Check the deployment](https://en.oceanbase.com/docs/community-oms-en-10000000001087162).

> **Note**
>
> You can directly deploy OMS Community Edition V4.1.1, which does not support upgrade from an earlier version.
> To use OMS Community Edition to collect and display historical monitoring data, you must deploy an InfluxDB time-series database. For more information, see [Deploy a time-series database (Optional)](https://en.oceanbase.com/docs/community-oms-en-10000000001087169). 
> The HA feature of OMS Community Edition is disabled by default. To enable this feature, set `enable` to `true` in `ha.config` in the console of OMS Community Edition. For more information, see [Modify HA configurations](https://en.oceanbase.com/docs/community-oms-en-10000000001087296). 

## Use OMS for data migration

### Overview

OMS Community Edition allows you to transmit data between OceanBase Database Community Edition and many other data sources, such as MySQL, TiDB, and PostgreSQL in real time, and migrate data between MySQL tenants of OceanBase Database Community Edition. 

For more information, see [Overview](https://en.oceanbase.com/docs/community-oms-en-10000000001087137). 

### Data migration process

The data migration feature of OMS Community Edition allows you to migrate data between homogeneous or heterogeneous data sources. It is applicable to business scenarios such as database upgrade, cross-instance data migration, database splitting, and database scaling. 

The server deployed with OMS Community Edition must be able to connect to both source and destination databases at the same time. To start a data migration project, you only need to configure the source and destination databases and select the tables to be migrated. 

To prepare for, create, and manage a data migration project, perform the following steps: 

1. Make preparations

   Before you migrate data by using OMS Community Edition, create dedicated users in the source or destination database and grant the required privileges to the users. For more information, see [Create a database user](https://en.oceanbase.com/docs/community-oms-en-10000000001087128). 

2. Create data sources

   Log on to the console of OMS Community Edition to create a source data source and a destination data source. For more information, see [Create data sources](https://en.oceanbase.com/docs/community-oms-en-10000000001087224). 

3. Create a data migration project

   Specify the source, destination, migration type, and migration objects for the data migration project as needed. For more information, refer to the following section 'Create a data migration project', which describes how to create common data migration projects. 

4. View the status of the data migration project

   After the data migration project is started, it will be executed based on the selected migration types. For more information, see [View details of a data migration project](https://en.oceanbase.com/docs/community-oms-en-10000000001087239). 

5. (Optional) Stop and release the data migration project

   After the data migration project is completed, if data no longer needs to be migrated from the source database to the destination database, you can clear the data migration project. For more information, see [Release and delete a data migration project](https://en.oceanbase.com/docs/community-oms-en-10000000001087238). 

### Create a data migration project

You have learned about the data sources supported by OMS and other limitations on using OMS in 'OMS limitations'. In this section, you will learn how to create common migration projects in OMS to migrate data online. 

* [Migrate data from a MySQL database to OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087142)

* [Migrate data from OceanBase Database Community Edition to a MySQL database](https://en.oceanbase.com/docs/community-oms-en-10000000001087140)

* [Migrate data from HBase to OBKV](https://en.oceanbase.com/docs/community-oms-en-10000000001087138)

* [Migrate data between instances of OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087141)

* [Migrate data in active-active disaster recovery scenarios](https://en.oceanbase.com/docs/community-oms-en-10000000001087438)

* [Migrate data from a TiDB database to OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087139)

* [Migrate data from a PostgreSQL database to OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087136)

> **Note**
>
> You can manage the created data migration projects. For more information, see [Manage data migration projects](https://en.oceanbase.com/docs/community-oms-en-10000000001087239). 

### Features

When you create a data migration project, you can specify features, such as DML filtering, DDL synchronization, matching rules for migration objects, and wildcard patterns. For more information, see [Features](https://en.oceanbase.com/docs/community-oms-en-10000000001087245). This section describes direct load and DDL synchronization. 

#### Direct load

Direct load is provided in OMS Community Edition V4.2.2 and later. This feature allows OceanBase Database to write data directly to a data file. Direct load skips the SQL layer interface, directly allocates space in data files, and inserts data, thereby improving the data import efficiency. 

To enable this feature, select **Direct Load** on the **Migration Options** page when you create a data migration project. Test results indicate that the data write efficiency is 3 to 6 times higher after direct load is enabled. 

Direct load is supported only in the following data migration scenarios: 

* [Migrate data from a MySQL database to OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087142)

* [Migrate data from HBase to OBKV](https://en.oceanbase.com/docs/community-oms-en-10000000001087138)

* [Migrate data between instances of OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087141)

* [Migrate data in active-active disaster recovery scenarios](https://en.oceanbase.com/docs/community-oms-en-10000000001087438)

* [Migrate data from a TiDB database to OceanBase Database Community Edition](https://en.oceanbase.com/docs/community-oms-en-10000000001087139)

For more information, see [Direct load](https://en.oceanbase.com/docs/community-oms-en-10000000001576273). 

#### DDL synchronization

When you create a migration project, you can enable DDL synchronization. DDL operations such as CREATE TABLE, ALTER TABLE, DROP TABLE, and TRUNCATE TABLE will be synchronized to the destination database only after DDL synchronization is enabled. The DDL synchronization feature applies to long-term data migration and synchronization projects to significantly lower the O&M costs. Limitations of this feature are described as follows:

* Only the supported DDL operations can be synchronized. For more information about supported DDL operations, see [Supported DDL operations for synchronization and limitations](https://en.oceanbase.com/docs/community-oms-en-10000000001087341). 

* If the table to be synchronized involves other types of DDL operations, the data migration project may fail and cause unrecoverable data exceptions. 

* Do not perform DDL operations for database or schema changes during schema migration and full data migration. Otherwise, the data migration project may be interrupted. 

When you create a data migration project and proceed to the **Select Migration Type** step, you can select **Incremental Synchronization** and then select **DDL Synchronization** to enable DDL synchronization. In the **DDL Synchronization** section, you can select **Source Execution** or **Destination Execution**. 

* **Source Execution**: This option specifies to execute incremental DDL operations only at the source and synchronize them to the destination. 

* **Destination Execution**: This parameter specifies to execute incremental DDL operations only at the destination and synchronize them to the source. 

For more information, see [DDL synchronization](https://en.oceanbase.com/docs/community-oms-en-10000000001087246). 

## Use OMS for data synchronization

### Overview

OMS Community Edition supports real-time data synchronization between OceanBase Database Community Edition and Kafka or RocketMQ instances. You can use OMS Community Edition in scenarios such as building a real-time data warehouse, data query, and report distribution. 

### Supported project types

Projects for data synchronization from the source to the destination mainly involves incremental data synchronization, where DML changes are written from the source to the destination in real time. OMS Community Edition allows you to synchronize data with a minimum granularity of tables and a maximum granularity of tenants. 

The following table describes the project types supported by OMS Community Edition.

| Project type | Schema synchronization | Full synchronization | Incremental synchronization | Data verification |
| --------------------------- | -------- | -------- | -------- | -------- |
| OceanBase Database > Kafka | Supported | Supported | Supported | Not supported |
| OceanBase Database > RocketMQ | N/A | Supported | Supported | Not supported |

### Data synchronization process

The data synchronization feature of OMS Community Edition allows you to synchronize data between data sources in real time. It is applicable to business scenarios such as active geo-redundancy, remote disaster recovery, data aggregation, and real-time data warehousing. 

To prepare for, create, and manage a data synchronization project, perform the following steps: 

1. Make preparations

   Before you use OMS Community Edition to synchronize data, we recommend that you create dedicated database users for the data synchronization project and grant the required privileges to the users. For more information, see [Create a database user](https://en.oceanbase.com/docs/community-oms-en-10000000001370706). 

2. Create data sources

   Log on to the console of OMS Community Edition to create a source data source and a destination data source. For more information, see [Create data sources](https://en.oceanbase.com/docs/community-oms-en-10000000001370810). 

3. Create a data synchronization project

   Specify the source, destination, synchronization type, and synchronization objects for the data synchronization project as needed. For more information, refer to the [Data synchronization](https://en.oceanbase.com/docs/community-oms-en-10000000001370698), which describes how to create common data synchronization projects. 

4. View the status of the data synchronization project

   After the data synchronization project is started, it will be executed based on the selected synchronization types. For more information, see [View details of a data synchronization project](https://en.oceanbase.com/docs/community-oms-en-10000000001370777). 

5. (Optional) Stop and release the data synchronization project

   After the data synchronization project is completed, if data no longer needs to be synchronized from the source database to the destination database, you can clear the data synchronization project. For more information, see [Release and delete a data synchronization project](https://en.oceanbase.com/docs/community-oms-en-10000000001370780). 

### Create a data synchronization project

OMS Community Edition supports real-time data synchronization between OceanBase Database Community Edition and Kafka or RocketMQ instances. 

* Kafka is a widely used high-performance distributed stream computing platform. OMS Community Edition supports real-time data synchronization between a self-managed Kafka instance and OceanBase Database Community Edition, extending the message processing capability. Therefore, OMS Community Edition is widely applied to business scenarios such as real-time data warehouse building, data query, and report distribution. For more information, see [Create a task to synchronize data from OceanBase Database Community Edition to a Kafka instance](https://en.oceanbase.com/docs/community-oms-en-10000000001370699). 

* Message Queue for Apache RocketMQ is a distributed message-oriented middleware built by Alibaba Cloud based on Apache RocketMQ. It features low latency, high concurrency, and high reliability. The data synchronization feature of OMS Community Edition allows you to synchronize data between a physical table in OceanBase Database Community Edition and a RocketMQ data source in real time, extending the message processing capability. For more information, see [Create a task to synchronize data from OceanBase Database Community Edition to a RocketMQ instance](https://en.oceanbase.com/docs/community-oms-en-10000000001370696). 

### Manage data synchronization projects

You can manage the created data synchronization projects. For more information, see [Manage data synchronization projects](https://en.oceanbase.com/docs/community-oms-en-10000000001370777). 

### Features

When you create a data synchronization project, you can specify features such as DML filtering and DDL synchronization. For more information, see [Features](https://en.oceanbase.com/docs/community-oms-en-10000000001370789). 

### Data formats

When you use OMS Community Edition to synchronize data from the source to a Kafka or RocketMQ instance, you can use a serialization method to control the format of the synchronized data. Supported serialization methods are Default, Canal, DataWorks (V2.0), SharePlex, DefaultExtendColumnType, Debezium, DebeziumFlatten, DebeziumSmt, and Maxwell. Note that Maxwell is supported only when the destination is a Kafka instance. 

For more information, see [Data formats](https://en.oceanbase.com/docs/community-oms-en-10000000001370790). 

> **Note**
>
> In addition to data migration and synchronization, OMS Community Edition also supports other features such as O&M monitoring and system management. For more information, see the documentation of [OceanBase Migration Service](https://en.oceanbase.com/docs/community-oms-en-10000000001087110) of a specific version. 
