---
title: OceanBase ecological tools
weight: 3
---

# 1.2 OceanBase ecological tools

This topic introduces various OceanBase ecological tools, including those for installation and deployment, monitoring, and migration and synchronization. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Database proxy

### ODP

OceanBase Database Proxy (ODP) is a proxy server dedicated for OceanBase Database. Unlike other ecological tools described in this topic, ODP is a part of the OceanBase Database kernel that comprises OBServer nodes and ODP. OceanBase Database stores replicas of user data on multiple OBServer nodes. When receiving an SQL request from a user, ODP forwards the request to the optimal OBServer node and returns the execution result to the user. Core features of ODP include connection management, optimal routing, high-performance forwarding, easy O&M, high availability, and proprietary protocol. 

For more information, see [OceanBase Database Proxy](https://en.oceanbase.com/docs/common-odp-doc-en-10000000001177429). 

## Installation and deployment tools

### For Enterprise Users

### OCP

OceanBase Cloud Platform (OCP) is an enterprise-level management platform tailored for OceanBase clusters. It is compatible with all major OceanBase Database versions. It provides GUI-based management capabilities, including lifecycle management of database components and resources (such as hosts, networks, and software packages), fault recovery, performance diagnostics, as well as monitoring and alerting. OCP aims to help enterprises manage OceanBase clusters more efficiently at lower IT O&M costs and shorten the user learning curve. 

For more information about the system architecture and features of OCP, see [OceanBase Cloud Platform](https://en.oceanbase.com/docs/common-ocp-10000000001553919). 

### For Individual Users or Enterprises with Limited Resources

### OBD

OceanBase Deployer (OBD) allows you to install and deploy an OceanBase cluster on the CLI or GUI. OBD standardizes the complex configuration process to simplify cluster deployment. 

In CLI-based deployment, you can edit the configuration file to flexibly adjust the configurations. This deployment mode requires expertise and is suitable for users who have a deep understanding of OceanBase Database. In GUI-based deployment, you can easily deploy a cluster by following the wizard. This deployment mode is suitable for users who want to quickly experience OceanBase Database in a standard environment. 

Besides cluster deployment, OBD also provides general O&M capabilities such as the package manager, stress test software, and cluster management to deliver better user experience on OceanBase Database. 

For more information, see [OceanBase Deployer](https://en.oceanbase.com/docs/obd-en). 

### For K8s Users

### ob-operator

ob-operator is a tool built based on the Kubernetes Operator framework for managing OceanBase clusters on Kubernetes. It provides a simple and reliable way to implement containerized deployment of OceanBase clusters and simplifies the O&M of OceanBase clusters. ob-operator defines various resources for OceanBase Database and implements the corresponding coordination logic. It allows you to manage OceanBase clusters in a declarative manner, just as you would manage native Kubernetes resources. 

For more information about the features and usage instructions of ob-operator, see [Kubernetes Operator for OceanBase](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195649). 

## Monitoring tools

### OCP / OCP Express

OCP and OCP Express not only allow you to create and manage clusters and tenants, but also provide features such as performance diagnostics, and monitoring and alerting. For more information, see the description of OCP and OCP Express in 'Installation and deployment tools'. 

### OBAgent

OceanBase Agent (OBAgent) is a framework for monitoring data collection and O&M. 

* Monitoring data collection

   OBAgent supports data collection in pushing and pulling modes for different scenarios. By default, OBAgent supports plug-ins for server data collection, OceanBase Database metrics collection, log collection, monitoring data label processing, and HTTP service of the Prometheus protocol. OBAgent allows you to push data to Pushgateway, vmagent, Elasticsearch, Simple Log Service (SLS), and Alertmanager. You can also develop plug-ins to enable OBAgent to collect data from other sources or customize the data processing process. 

* O&M

   OBAgent allows you to configure hot updates. It also provides APIs for OBAgent O&M, file operations, and RPM package operations. You can use these APIs as needed. 

For more information, see the [obagent repository](https://github.com/oceanbase/obagent) on GitHub. 

## O&M tools

### For Enterprise Users

### OCP

In addition to creating and managing clusters and tenants, OCP also supports fault recovery, performance diagnostics, and monitoring and alerting. 

For more information, see the description of OCP in 'Installation and deployment tools'. 

### For Operations and Development Users

### OBShell

OceanBase Shell (OBShell) is an out-of-the-box command-line tool provided by OceanBase Database Community Edition for O&M engineers and developers to manage local OceanBase clusters. OBShell supports cluster O&M and provides O&M and management APIs based on OceanBase Database. This allows products from different ecosystems to manage the same OceanBase cluster in a unified manner, reducing the difficulty in and costs of OceanBase cluster management. 

You do not need to separately install OBShell. As long as OceanBase Database Community Edition is installed, you can find the OBShell executable file in the `bin` directory under the working directory of each OBServer node. 

For more information, see [OBShell](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001378072). 

### obdiag

obdiag is a CLI diagnostic tool designed for OceanBase Database. At present, it can scan, collect, and analyze diagnostic information such as the logs, SQL audit records, and the process stack information of OceanBase Database. You can use obdiag easily, no matter whether your OceanBase cluster is deployed manually or by using OCP or OBD. 

obdiag allows you to use command lines to: (a) inspect OceanBase clusters for existing or possible exceptions, analyze their causes, and provide O&M suggestions; (b) collect diagnostic information dispersed across nodes and return the information to the obdiag server in a package; (c) analyze OceanBase Database logs to identify errors that have occurred; and (d) perform end-to-end diagnostics based on the `trace.log` file. 

For more information, see [OceanBase Diagnostic Tool](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375725). 

## Migration and synchronization tools

### OMS

OceanBase Migration Service (OMS) is a service that supports data interaction between a homogeneous or heterogeneous data source and OceanBase Database. OMS provides the capabilities for online migration of existing data and real-time synchronization of incremental data. 

OMS Community Edition provides a visualized and centralized management platform. You can migrate data with simple configurations. OMS Community Edition aims to help you migrate and synchronize data in real time from homogeneous or heterogeneous data sources to OceanBase Database at a low cost and low risk. 

For more information, see [OceanBase Migration Service](https://en.oceanbase.com/docs/oms-en). 

### OBLogProxy

OBLogProxy is the incremental log proxy service of OceanBase Database. It establishes connections with OceanBase Database to read incremental logs and provides downstream services with change data capture (CDC) capabilities. 

OBLogProxy supports the following two modes: 

* The binlog mode of OBLogProxy is designed for compatibility with MySQL binlogs. It allows you to use MySQL binlog incremental parsing tools to synchronize OceanBase Database logs in real time. Thereby, you can smoothly use MySQL binlog tools with OceanBase Database. 

* OBLogProxy in CDC mode subscribes to data changes in OceanBase Database and synchronizes these data changes to downstream services in real time for real-time or quasi-realtime data replication and synchronization. 

For more information, see [OBLogProxy](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375722). 

### OBLOADER & OBDUMPER

OceanBase provides the data import tool OBLOADER and the data export tool OBDUMPER. 

OBLOADER provides extensive command-line options that allow you to import database object definitions and table data to OceanBase Database in complex scenarios. We recommend that you use OBLOADER in combination with OBDUMPER. You can also use OBLOADER to import files in the CSV format that are exported by using third-party tools, such as Navicat, MyDumper, and SQL Developer, to OceanBase Database. OBLOADER fully exploits the features of the distributed OceanBase Database system and is particularly optimized in import performance. 

You can use OBDUMPER to export table data from OceanBase Database to files in the SQL or CSV format. You can also use it to export objects defined in the database to files. 

For more information, see [OceanBase Loader and Dumper](https://en.oceanbase.com/docs/obloader-obdumper-en). 

## GUI-based development tools

### ODC

OceanBase Developer Center (ODC) is a GUI-based development tool and a collaborative management platform for data development and production change. ODC is provided in two forms: Client ODC and Web ODC. Client ODC focuses on database development. It is lightweight and easy to deploy on Windows, macOS, and Linux. As for Web ODC, in addition to database development, Web ODC also provides collaborative management features to ensure the security, compliance, and efficiency of database changes. 

Web ODC allows you to work in Individual Workspace mode or Team Workspace mode. Individual Workspace is suitable for individual developers and allows you to use features of Client ODC in a browser. You can access and create data sources as needed and develop databases with various windows and tools provided on the platform. Team Workspace is ideal for developers and database administrators (DBAs) to collaborate with each other. It is both a development tool and a collaborative management platform. ODC provides a variety of database development and management features, such as project collaboration, stable change, data security, and hot/cold data separation. 

For more information, see [OceanBase Developer Center](https://en.oceanbase.com/docs/odc-en). 

> **Note**
>
> In addition to ODC, you can also use third-party GUI-based development tools such as Navicat and DBeaver to connect to OceanBase Database. 

## Database drivers

### OceanBase Connector/J

OceanBase Connector/J is a driver that implements the JDBC API to provide connections to OceanBase Database for Java-based applications. OceanBase Connector/J is a JDBC Type 4 driver that can be connected to a database engine by using local protocols. 

OceanBase Database supports OceanBase Connector/J and is fully compatible with MySQL Connector Java, the native JDBC driver for MySQL. OceanBase Connector/J is fully compatible with MySQL JDBC. OceanBase Connector/J automatically determines whether OceanBase Database runs in MySQL or Oracle mode and supports both modes at the protocol layer. 

For more information, see [OceanBase Connector/J](https://en.oceanbase.com/docs/oceanbase-connector-j-en). 

### OceanBase Connector/C

OceanBase Connector/C is an OBClient development component based on C/C++. OceanBase Connector/C supports C API libraries. OceanBase Connector/C allows C/C++ applications to access OceanBase distributed database clusters from the underlying layer. Then, the applications can perform operations such as database connection, data access, error processing, and prepared statement processing. 

Also known as LibobClient, OceanBase Connector/C allows an application to run as an independent server process to communicate with OBServer nodes by using network connections. A client application references the C API header file during compilation and can link to the C API library file. 

For more information, see [OceanBase Connector/C](https://en.oceanbase.com/docs/oceanbase-connector-c-en). 

### OceanBase Connector/ODBC

ODBC stands for Open Database Connectivity. OceanBase Connector/ODBC is designed for data sharing between heterogeneous databases. It has become a major part of the Windows Open System Architecture (WOSA) and a database access API standard in Windows-based environments. 

For more information, see [OceanBase Connector/ODBC](https://en.oceanbase.com/docs/obodbc-en). 
