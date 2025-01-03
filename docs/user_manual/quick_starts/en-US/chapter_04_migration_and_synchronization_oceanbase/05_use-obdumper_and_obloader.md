---
title: Use OBLOADER & OBDUMPER for data migration
weight: 6
---

# 4.5 Use OBLOADER & OBDUMPER for data migration

> **Note**
>
> This topic describes how to use OBLOADER & OBDUMPER V4.2.8. The official documents referenced in this topic are of V4.2.8. You can switch to another version as needed in the upper-left corner of the document page. 

## Overview

OceanBase Database provides the data import tool OBLOADER and the data export tool OBDUMPER. 

### OBLOADER

OBLOADER is a client tool that is developed in Java. At present, OBLOADER applies only to OceanBase Database. You can import the definition files and table data files of database objects in storage media to OceanBase Database. We recommend that you use OBLOADER in combination with OBDUMPER. OBLOADER is compatible with the CSV files exported by using client tools such as mysqldump and Mydumper. Therefore, you can use OBLOADER in data migration. 

OBLOADER provides various types of built-in data preprocessing functions to improve its data import performance. The automatic fault tolerance mechanism ensures data import stability. Rich monitoring information is provided for you to observe the import performance and progress in real time. 

### OBDUMPER

OBDUMPER is a client tool that is developed in Java. At present, OBDUMPER applies only to OceanBase Database. You can use OBDUMPER to export objects and table data from OceanBase Database to the storage media in the specified file format. You can integrate OBDUMPER into a database O&M system for logical backup. In this case, incremental backup is not supported. 

Compared with other client export tools such as mysqldump, OBDUMPER has the following advantages:

* Quick data export: Multiple data query strategies are designed to significantly improve the export performance. 

* Versatile data exchange capabilities: Data in tables can be exported to multiple types of storage media in different formats. 

* Powerful data processing capabilities: Data is compressed, encrypted, desensitized, and preprocessed before being exported. 

For more information, see [Introduction](https://en.oceanbase.com/docs/common-oceanbase-dumper-loader-10000000001417504). 

## Environment preparation and installation

Before you run OBLOADER & OBDUMPER, make sure that you have the appropriate operating environment and privileges. 

### Operating environment

| Environment | Requirement |
| --------- | ---------------------------------------------------------------------------------- |
| OS | Linux, macOS, and Windows 7 or later  |
| Java environment | Install [Oracle JDK 1.8.0_3xx](https://www.oracle.com/java/technologies/javase/javase8u211-later-archive-downloads.html) and configure the `JAVA_HOME` environment variable in the local environment.  |
| Character set | We recommend that you use UTF-8 as the file character set.  |
| Java virtual machine (JVM) parameters | Modify the JVM memory parameters in the `bin/obloader` and `bin/obdumper` scripts to avoid JVM memory insufficiency.  |

> **Note**
>
> Some minor versions of OpenJDK 1.8 have serious garbage collection (GC) bugs. OBLOADER & OBDUMPER may encounter out of memory (OOM) errors or hang. Therefore, you need to install the latest minor version of [OpenJDK 1.8](https://pkgs.org/download/java-1.8.0-openjdk). 

### Privileges

#### OBLOADER

When you use OBLOADER to import data to an OceanBase database, the account used to connect to the database must have the privileges to execute the `CREATE`, `SELECT`, `INSERT`, and `UPDATE` statements. You can view the privileges granted to a user by using the `SHOW GRANTS` statement. Here is a sample statement:

```shell
obclient> SHOW GRANTS FOR user1;
```

The output is as follows:

```shell
+------------------------------------------+
| Grants for user1@%                       |
+------------------------------------------+
| GRANT CREATE ON *.* TO 'user1'           |
| GRANT SELECT ON `db1`.* TO 'user1'       |
| GRANT INSERT ON `db1`.* TO 'user1'       |
| GRANT UPDATE ON `db1`.* TO 'user1'       |
| GRANT SELECT ON `oceanbase`.* TO 'user1' |
+------------------------------------------+
```

> **Note**
>
> * The account must also have the SELECT privilege on the `oceanbase` database. 
>
> * To use OBLOADER to import database object definitions and data to an Oracle tenant of OceanBase Database, we recommend that you connect to the database by using the account of a database administrator (DBA). 

#### OBDUMPER

When you use OBDUMPER to export data from an OceanBase database, the account used to connect to the database must have the privileges to execute the `CREATE` and `SELECT` statements. You can view the privileges granted to a user by using the `SHOW GRANTS` statement. Here is a sample statement:

```shell
obclient> SHOW GRANTS FOR user1;
```

The output is as follows:

```shell
+------------------------------------------+
| Grants for user1@%                       |
+------------------------------------------+
| GRANT CREATE ON *.* TO 'user1'           |
| GRANT SELECT ON `db1`.* TO 'user1'       |
| GRANT SELECT ON `oceanbase`.* TO 'user1' |
+------------------------------------------+
```

> **Note**
>
> * The account must also have the SELECT privilege on the `oceanbase` database. 
>
> * To use OBDUMPER to export database object definitions from an Oracle tenant of OceanBase Database, we recommend that you connect to the database by using the account of a DBA. When you use OBDUMPER to export data from an Oracle tenant of OceanBase Database, no special requirement is imposed on the account used to connect to the database. 

#### Other considerations

* For OceanBase Database of a version earlier than V4.0.0, the `--sys-user` and `--sys-password` options must be specified on the command line of OBLOADER & OBDUMPER. 

* The `--sys-user` and `--sys-password` options must be set to the username and password of a user with privileges to query system tables and views in the sys tenant. 

### Installation

OBLOADER & OBDUMPER are provided in a software package. You can run the tools after you decompress the package on your host. 

Perform the following steps:

1. Go to [OceanBase Download Center](https://en.oceanbase.com/softwarecenter) to download the package. 

2. Decompress the package and go to the directory where the script resides. 

   ```shell
   # Windows
   cd {ob-loader-dumper}/bin/windows

   # Linux or macOS
   cd {ob-loader-dumper}/bin
   ```

3. Run the following command to view the help information of the command-line options: 

   * Run OBLOADER

      ```shell
      # Windows
      call obloader.bat --help

      # Linux or macOS
      ./obloader --help
      ```

   * Run OBDUMPER

      ```shell
      # Windows
      call obdumper.bat --help

      # Linux or macOS
      ./obdumper --help
      ```

   For more information, see [Import data > Command-line options](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028857) and [Export data > Command-line options](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028868). 

## Export data

You can use OBDUMPER to export table schemas (to DDL files) and table data. OBDUMPER can export table data to files in multiple formats, such as CSV, SQL, and CUT. It can also export data files to Amazon Simple Storage Service (S3) and Alibaba Cloud Object Storage Service (OSS). You can filter out columns that you do not want to export. You can also define a control file for OBDUMPER to preprocess data to be exported. 

* For more information, see **Step 5: Export data** in [Quick start](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028865). 

* OBDUMPER allows you to specify the information required for export in command-line options. For more information about the options, see [Command-line options](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028868). 

* You can define a control file for OBDUMPER to preprocess data to be exported. When you define a control file, you can configure a preprocessing function for each column, or use case expressions to accomplish complex data processing tasks by performing simple logical and arithmetic operations. For more information, see [Data processing](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028874). 

* You can tune the performance of OBDUMPER from three aspects: command-line options, virtual machine memory, and database kernel. For more information, see [Performance tuning](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028866). 

* For answers to frequently asked questions about OBDUMPER, see [FAQ](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028867). 

## Import data

You can use OBLOADER to import table schemas (from DDL files) and table data (from files in supported formats) to a database. Data files in the CSV, SQL, POS, and CUT formats are supported. Data files from Amazon S3, Alibaba Cloud OSS, and Apache Hadoop can also be imported to an OceanBase database. You can filter out columns that you do not want to import. You can also define a control file for OBLOADER to preprocess data to be imported. 

* For more information, see **Step 6: Import data** in [Quick start](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028856). 

* OBLOADER allows you to specify the information required for import in command-line options. For more information about the options, see [Command-line options](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028857). 

* You can define a control file for OBLOADER to preprocess data to be imported. When you define a control file, you can configure a preprocessing function for each column, or use case expressions to accomplish complex data processing tasks by performing simple logical and arithmetic operations. For more information, see [Data processing](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028869). 

* You can tune the performance of OBLOADER from three aspects: command-line options, virtual machine memory, and database kernel. For more information, see [Performance tuning](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028854). 

* If the imported data contains a Bad Record or Discard Record error, you can use OBLOADER V4.2.4 or later to control the impact of such dirty data on the exit status of the process. You can manually fix such errors based on the generated error report. For more information, see [Error handling](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028855). 

* For answers to frequently asked questions about OBLOADER, see [FAQ](https://en.oceanbase.com/docs/community-obloader-obdumper-en-10000000001028859). 

## Direct load

Direct load allows OceanBase Database to write data directly to a data file. Direct load skips the SQL layer interface, directly allocates space in data files, and inserts data, thereby improving the data import efficiency. 

The direct load feature applies to the following scenarios:

* Data migration and synchronization: In data migration or synchronization, a large amount of data of different types must be migrated from different data sources to OceanBase Database. Conventional SQL interfaces cannot meet the requirement on timeliness. 

* Conventional extract, transform, and load (ETL): After data is extracted and transformed in the source, a large amount of data must be loaded to the destination within a short time. The direct load technology can improve the import performance. 

* Data loading from text files or other data sources to OceanBase Database: Direct load can accelerate the data loading process. 

For more information, see [Direct load (Bypass import)](https://en.oceanbase.com/docs/common-oceanbase-dumper-loader-10000000001417512). 

## Security features

By default, OBLOADER & OBDUMPER can run after you explicitly specify sensitive information such as the password on the command line. To enhance information security, OBLOADER & OBDUMPER V4.2.0 and later provide methods to encrypt and decrypt sensitive information on the command line. For more information, see [Security features](https://en.oceanbase.com/docs/common-oceanbase-dumper-loader-10000000001417503). 

## Self-service troubleshooting

You may encounter some issues when using OBDUMPER & OBLOADER. Documentation of the tools provide methods for you to view the tool running status and troubleshoot the issues. For more information, see [Self-service troubleshooting](https://en.oceanbase.com/docs/common-oceanbase-dumper-loader-10000000001417505). 
