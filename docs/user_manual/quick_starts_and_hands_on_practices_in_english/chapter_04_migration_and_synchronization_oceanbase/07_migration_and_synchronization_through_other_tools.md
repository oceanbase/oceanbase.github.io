---
title: Use other tools for data migration and synchronization
weight: 8
---

# 4.7 Use other tools for data migration and synchronization

OceanBase Database also supports many third-party data import and export tools, such as Flink CDC, DataX, and Canal. These open source tools provide slightly different features, and therefore are applicable to different scenarios. This topic describes how to use these tools for data migration and synchronization between OceanBase Database and other databases. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Use Flink CDC for data migration and synchronization

### Overview

Change data capture (CDC) helps you monitor and capture changes in databases. You can do many things with data provided by CDC. For example, you can use the data to make historical databases or perform near real-time caching. You can also provide the CDC data to message queues (MQs), so you can use MQs for analysis and auditing. 

Flink CDC Connectors (Flink CDC for short) is a set of source connectors for Apache Flink. Flink CDC can read historical data and incremental changes from most databases in real time, and synchronize full and incremental data of different databases to MQs and data warehouses. You can also use Flink CDC for real-time data integration, to import database data to a data lake or data warehouse in real time. 

Flink CDC also supports data processing. You can use the SQL client of Flink CDC to associate, widen, and aggregate database data in real time, and write the results to various stores. 

![Flink CDC](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/07_migration_and_synchronization_through_other_tools/001.png)

### Supported connectors

| Connector | Database | Driver |
|----|----|---|
| mongodb-cdc | MongoDB: 3.6, 4.x, and 5.0 | MongoDB Driver: 4.3.4 |
| mysql-cdc | <ul><li>MySQL: 5.6, 5.7, and 8.0.x</li><li>RDS for MySQL: 5.6, 5.7, and 8.0.x</li><li>PolarDB for MySQL: 5.6, 5.7, and 8.0.x</li><li>Aurora for MySQL: 5.6, 5.7, and 8.0.x</li><li>MariaDB: 10.x</li><li>PolarDB X: 2.0.1</li></ul> | JDBC Driver: 8.0.28 |
| oceanbase-cdc | <ul><li>OceanBase Database Community Edition: V3.1.x and V4.x</li><li>OceanBase Database Enterprise Edition: V2.x, V3.x, and V4.x</li></ul> | OceanBase Driver: V2.4.x |
| oracle-cdc | Oracle: 11, 12, 19, and 21 | Oracle Driver: 19.3.0.0 |
| postgres-cdc | PostgreSQL: 9.6, 10, 11, 12, 13, and 14 | DBC Driver: 42.5.1 |
| sqlserver-cdc | SQLServer: 2012, 2014, 2016, 2017, and 2019 | JDBC Driver: 9.4.1.jre8 |
| tidb-cdc | TiDB: 5.1.x, 5.2.x, 5.3.x, 5.4.x, and 6.0.0 | JDBC Driver: 8.0.27 |
| db2-cdc | DB2: 11.5 | DB2 Driver: 11.5.0.0 |
| vitess-cdc | Vitess: 8.0.x and 9.0.x | MySQL JDBC Driver: 8.0.26 |

### Configure Flink CDC-based data migration and synchronization

For more information, see the following topics:

* [Use Flink CDC to synchronize data from a MySQL database to OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103629)

* [Use Flink CDC to migrate data from OceanBase Database to a MySQL database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103614)

## Use Canal for data migration and synchronization

### Overview

Canal is an open source product of Alibaba. It provides subscription and consumption of incremental data based on the parsing of incremental logs in MySQL databases. 

The following figure shows how Canal works.

![How Canal works](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/07_migration_and_synchronization_through_other_tools/002.png)

* Canal disguises itself as a MySQL slave by simulating the communication protocol of the MySQL slave, and sends a dump request to the MySQL master.

* The MySQL master receives the dump request, and pushes binary logs to the slave, which is Canal.

* Canal parses the binary logs into a stream of bytes.

### Architecture and components

The following figure shows the architecture and components of Canal.

![Canal architecture ](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/07_migration_and_synchronization_through_other_tools/003.png)

where

* server: indicates a Canal instance, which corresponds to a Java virtual machine (JVM). 

* Instance: indicates a data queue. A server can host one to N instances. An instance module contains the following components:

   * eventParser: the parser that accesses the data source, and simulates and parses the communication protocol of the MySQL slave for communication with the MySQL master. 

   * eventSink: the linker between eventParser and eventStore for data filtering, processing, and dispatch. 

   * eventStore: the data storage. 

   * metaManager: the incremental subscription and consumption information manager. 

### Configure Canal-based data migration and synchronization

For more information, see the following topics:

* [Use Canal to synchronize data from a MySQL database to OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103636)

* [Use Canal to synchronize data from OceanBase Database to a MySQL database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103616)

## Use DataX for data migration

### Overview

DataX is the open source edition of DataWorks of Alibaba Cloud. It is an offline data synchronization tool/platform widely used in Alibaba Group. DataX efficiently synchronizes data between heterogeneous data sources such as MySQL, Oracle, SQL Server, PostgreSQL, Hadoop Distributed File System (HDFS), Hive, ADS, HBase, Table Store (OTS), MaxCompute (formerly known as ODPS), Distributed Relational Database Service (DRDS), and OceanBase Database. 

![DataX topology](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/07_migration_and_synchronization_through_other_tools/004.png)

To address issues of data synchronization between heterogeneous data sources in a complex mesh topology, DataX introduces the star topology and serves as the transmission hub that connects to various data sources. This way, you can connect a new data source to DataX and start synchronizing data between the new data source and the existing data sources right away. 

DataX has been widely used in Alibaba Group for six years with stable operation. It undertakes all offline big data synchronization services. At present, DataX handles more than 80,000 synchronization jobs and transmits more than 300 TB of data every day. 

### DataX architecture

DataX is an offline data synchronization framework that is designed based on the framework + plug-in architecture. Data source reads and writes are abstracted as the reader and writer plug-ins and are integrated into the entire framework. 

![DataX architecture](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/07_migration_and_synchronization_through_other_tools/005.png)

* Reader: The reader plug-in is a data collection module that collects data from a data source and sends the data to the framework. 

* Writer: The writer plug-in is a data write module that retrieves data from the framework and writes the data to the destination. 

* Framework: The framework builds a data transmission channel to connect the reader and the writer and processes core technical issues such as caching, throttling, concurrency, and data conversion. 

### DataX 3.0 plug-ins

Over years of development, DataX has supported a wide range of plug-ins for connection with mainstream RDBMS databases, NoSQL databases, and big data computing systems. The following table describes data sources supported by DataX.

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Data source</th>
      <th>Reader</th>
      <th>Writer</th>
      <th>File access</th>
    </tr>
  </thead>
  <tr>
    <td rowspan="8">RDBMS database</td>
    <td>MySQL</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>Oracle</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>OceanBase Database</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>SQLServer</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>PostgreSQL</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>DRDS</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>Dameng</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>General RDBMS databases</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td rowspan="4">Alibaba Cloud data warehouse</td>
    <td>ODPS</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>ADS</td>
    <td> </td>
    <td>✅</td>
    <td>Write</td>
  </tr>
  <tr>
    <td>OSS</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>OCS</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td rowspan="5">NoSQL data storage</td>
    <td>OTS</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>HBase 0.94</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>HBase 1.1</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>MongoDB</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>Hive</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td rowspan="4">Unstructured data storage</td>
    <td>TxtFile</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>FTP</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>HDFS</td>
    <td>✅</td>
    <td>✅</td>
    <td>Read/Write</td>
  </tr>
  <tr>
    <td>Elasticsearch</td>
    <td> </td>
    <td>✅</td>
    <td>Write</td>
  </tr>
</table>

### DataX core modules

Open source DataX 3.0 supports data synchronization by multiple threads on a single server. The following sequence diagram describes how modules of DataX work with each other in handling a job. 

![DataX modules](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_04_migration_and_synchronization_oceanbase/07_migration_and_synchronization_through_other_tools/006.png)

**Core modules**

1. When DataX receives a data synchronization job, it starts a process to handle the job. The Job module of DataX, as the hub that manages the execution of a job, provides features such as data cleaning, job splitting, and task group management. 

2. When the Job module is started, it splits a job into multiple tasks for concurrent execution based on the specific source splitting strategy. A task is the basic unit of a DataX job. Each task synchronizes part of data. 

3. After job splitting, the Job module calls the Scheduler module to group the tasks based on the number of concurrent tasks that you specified. Tasks in each group are executed based on the supported number of concurrent tasks, which is 5 for each task group by default. 

4. When a task is started in a task group, the task is executed by the thread of Reader > Channel > Writer. 

5. The Job module monitors the execution of tasks and then exits when all tasks in all task groups are completed. If the Job module exits unexpectedly, the process returns a non-zero value. 

**DataX scheduling process**

Assume that you submit a DataX job to synchronize data from 100 MySQL tables to ODPS and set the number of concurrent tasks to 20. The scheduling logic in DataX is as follows:

1. The Job module splits the job into 100 tasks. 

2. Since 20 concurrent tasks are configured and each task group supports 5 concurrent tasks by default, DataX allocates the tasks to 4 groups. 

3. The 25 tasks allocated to each of the 4 task groups are executed with the concurrency of 5 tasks. 

### Configure DataX-based data migration

For more information, see the following topics:

* [Use DataX to migrate table data from a MySQL database to OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103634)

* [Use DataX to migrate table data from OceanBase Database to a MySQL database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103612)

* [Use DataX to migrate table data from an Oracle database to OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103609)

* [Use DataX to migrate table data from OceanBase Database to an Oracle database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103640)

* [Use DataX to migrate CSV files to OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103638)

## Use SeaTunnel for data migration and synchronization

This section describes how to deploy and use SeaTunnel. For more information about SeaTunnel, see '4.2 Ecosystem components for data migration and synchronization'. 

### Deploy SeaTunnel

#### Configure the environment

Before installing SeaTunnel, you need to configure a Java 8 or 11 environment. Other versions later than Java 8 can theoretically work as well. 

#### Download the software

If your server can connect to the Internet, you can run the following command to directly download the software by using the terminal: 

```shell
export version="2.3.3"
wget "https://archive.apache.org/dist/seatunnel/${version}/apache-seatunnel-${version}-bin.tar.gz"
tar -xzvf "apache-seatunnel-${version}-bin.tar.gz"
```

If your server cannot connect to the Internet, you can download the installation package from [SeaTunnel official website](https://seatunnel.apache.org/download/) and decompress the package on your server for installation. 

#### Install the connector

You can install the connector by using the following two methods:

* Online installation

   In SeaTunnel 2.2.0-beta and later, the binary package of SeaTunnel does not provide the connector dependencies by default. If you use SeaTunnel of a version in that range for the first time, you need to execute the following command to install the connector. In this example, the connector of version `2.3.3` is installed. 

   ```shell
   sh bin/install-plugin.sh 2.3.3
   ```

   In general, you do not need to install all connector plug-ins. You can open the `plugin_config` configuration file in the `config/` directory and specify the required plug-ins. For example, if you need only the `connector-console` plug-in, you can modify `plugin.properties` as follows:

   ```shell
   --seatunnel-connectors--
   connector-console
   --end--
   ```

* Offline installation

   If your server cannot connect to the Internet, you can manually download the connector and upload it to the `connectors/seatunnel` directory. 

   In this case, take note of the following considerations:

   * The `connectors` directory must contain the following subdirectories. Otherwise, you must manually create the subdirectories. 

      ```shell
      flink
      flink-sql
      seatunnel
      spark
      ```

   * You can download only the required V2 connector plug-ins and store them in the `seatunnel` directory.

### Configure a synchronization task

After you install SeaTunnel, you can edit the configuration file and start a data synchronization task. The following example describes how to synchronize data from a MySQL database to OceanBase Database. 

|        | Source | Destination |
| ------ | ---------- | ------------------- |
| Database | MySQL | OceanBase Database in MySQL mode |
| Table | mysql2ob | mysql2ob |
| IP address | 10.10.10.1 | 10.10.10.2 |

1. In the source MySQL database named `test`, create a table named `mysql2ob` and write three data records. 

   ```shell
   MySQL [test]> create table mysql2ob(id int primary key, name varchar(20));
   Query OK, 0 rows affected (0.01 sec)
   
   MySQL [test]> insert into mysql2ob values(1,'oceanbase');
   Query OK, 1 row affected (0.00 sec)
   
   MySQL [test]> insert into mysql2ob values(2,'oracle');
   Query OK, 1 row affected (0.00 sec)
   
   MySQL [test]> insert into mysql2ob values(3,'mysql');
   Query OK, 1 row affected (0.00 sec)
   ```

2. In the destination database named `test`, which is a MySQL tenant of OceanBase Database, create a table named `mysql2ob`. 

   ```shell
   obclient [test]> create table mysql2ob(id int primary key, name varchar(20));
   ```

3. Create a configuration file named `mysql_to_oceanbase.conf` in the `config` directory. 

   ```shell
   [admin@test ~]$ vim config/mysql_to_oceanbase.conf
   ```

   The file content is as follows:

   ```shell
   env {
           job.mode = "STREAMING"
           execution.parallelism = 1
           checkpoint.interval = 10000
   }
   source {
       MySQL-CDC {
           result_table_name = "test"
           parallelism = 1
           server-id = 5656
           username = "root"
           password = "******"
           table-names = ["test.mysql2ob"]
           base-url = "jdbc:mysql://10.10.10.1:3306/test"
       }
   }
   
   sink {
     jdbc {
           url = "jdbc:mysql://10.10.10.2:2883/test"
           driver = "com.mysql.jdbc.Driver"
           user = "root@obtest#obcluster"
           password = "******"
           generate_sink_sql = true
           database = "test"
           table = "mysql2ob"
     }
   }
   ```

4. Save the file and start the synchronization task.

   ```shell
   [admin@test ~]$ bash ./bin/seatunnel.sh --config ./config/mysql_to_oceanbase.conf -e local
   ```

   The logs are as follows:

   ```shell
   2024-02-29 18:56:25,664 WARN  org.apache.seatunnel.core.starter.seatunnel.args.ClientCommandArgs$MasterTypeValidator -
   ******************************************************************************************
   -e and --deploy-mode deprecated in 2.3.1, please use -m and --master instead of it
   ******************************************************************************************
   Feb 29, 2024 6:56:25 PM com.hazelcast.internal.config.AbstractConfigLocator
   INFO: Loading configuration '/opt/seatunnel/apache-seatunnel-2.3.3/config/seatunnel.yaml' from System property 'seatunnel.config'
   Feb 29, 2024 6:56:25 PM com.hazelcast.internal.config.AbstractConfigLocator
   INFO: Using configuration file at /opt/seatunnel/apache-seatunnel-2.3.3/config/seatunnel.yaml
   Feb 29, 2024 6:56:25 PM org.apache.seatunnel.engine.common.config.SeaTunnelConfig
   INFO: seatunnel.home is /opt/seatunnel/apache-seatunnel-2.3.3
   Feb 29, 2024 6:56:25 PM com.hazelcast.internal.config.AbstractConfigLocator
   INFO: Loading configuration '/opt/seatunnel/apache-seatunnel-2.3.3/config/hazelcast.yaml' from System property 'hazelcast.config'
   Feb 29, 2024 6:56:25 PM com.hazelcast.internal.config.AbstractConfigLocator
   INFO: Using configuration file at /opt/seatunnel/apache-seatunnel-2.3.3/config/hazelcast.yaml
   2024-02-29 18:56:26,178 WARN  com.hazelcast.instance.AddressPicker - [LOCAL] [seatunnel-997250] [5.1] You configured your member address as host name. Please be aware of that your dns can be spoofed. Make sure that your dns configurations are correct.
   2024-02-29 18:56:26,178 INFO  com.hazelcast.instance.AddressPicker - [LOCAL] [seatunnel-997250] [5.1] Resolving domain name 'localhost' to address(es): [127.0.0.1]
   2024-02-29 18:56:26,179 INFO  com.hazelcast.instance.AddressPicker - [LOCAL] [seatunnel-997250] [5.1] Interfaces is disabled, trying to pick one address from TCP-IP config addresses: [localhost/127.0.0.1]
   2024-02-29 18:56:26,202 INFO  org.apache.seatunnel.engine.server.SeaTunnelServer - SeaTunnel server start...
   2024-02-29 18:56:26,204 INFO  com.hazelcast.system - [localhost]:5801 [seatunnel-997250] [5.1] Based on Hazelcast IMDG version: 5.1.0 (20220228 - 21f20e7)
   2024-02-29 18:56:26,204 INFO  com.hazelcast.system - [localhost]:5801 [seatunnel-997250] [5.1] Cluster name: seatunnel-997250
   2024-02-29 18:56:26,204 INFO  com.hazelcast.system - [localhost]:5801 [seatunnel-997250] [5.1]
   
    _____               _____                             _
   /  ___|             |_   _|                           | |
   \ `--.   ___   __ _   | |   _   _  _ __   _ __    ___ | |
    `--. \ / _ \ / _` |  | |  | | | || '_ \ | '_ \  / _ \| |
   /\__/ /|  __/| (_| |  | |  | |_| || | | || | | ||  __/| |
   \____/  \___| \__,_|  \_/   \__,_||_| |_||_| |_| \___||_|
   
   ......
   ```

After you write data in the source database, you can find that the data is automatically synchronized to the destination database. That's it. You can try more data synchronization scenarios based on the preceding example. 
