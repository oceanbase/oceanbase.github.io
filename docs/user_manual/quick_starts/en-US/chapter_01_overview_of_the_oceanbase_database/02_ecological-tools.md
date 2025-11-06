---
title: OceanBase ecosystem tools
weight: 3
---

# 1.2 OceanBase ecosystem tools

This topic introduces various OceanBase ecosystem tools, including those for installation and deployment, monitoring, and migration and synchronization. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Database proxy

### ODP

OceanBase Database Proxy (ODP) is a dedicated proxy server for OceanBase Database. Unlike other ecosystem tools covered in this topic, ODP is a part of the OceanBase Database kernel, which consists of OBServer nodes and ODP. OceanBase Database stores replicas of user data across multiple OBServer nodes. Upon receiving an SQL request from a user, ODP forwards the request to the optimal OBServer node and returns the execution result to the user. Key features of ODP include connection management, optimal routing, high-performance forwarding, easy operation and maintenance (O&M), high availability, and a proprietary protocol. 

For details, see [OceanBase Database Proxy](https://en.oceanbase.com/docs/common-odp-doc-en-10000000002135903). 

## Installation and deployment tools

### OCP

OceanBase Cloud Platform (OCP) is an enterprise-grade management platform designed for OceanBase clusters. It is compatible with all major OceanBase Database versions. OCP provides GUI-based management capabilities, including lifecycle management of database components and resources (such as hosts, networks, and software packages), fault recovery, performance diagnostics, monitoring, and alerting. OCP helps enterprises manage OceanBase clusters more efficiently, reduces IT O&M costs, and shortens the user learning curve. 

For more information about the system architecture and features of OCP, see [OceanBase Cloud Platform](https://en.oceanbase.com/docs/common-ocp-10000000002854293). 

### OCP Express

OCP Express is a web-based management tool for OceanBase Database V4.x. Integrated with OceanBase clusters, OCP Express allows you to view key performance metrics and perform basic database management operations on OceanBase clusters. 

Derived from OCP, OCP Express retains core features but offers a refreshed layout for a better user experience. Feature configurations are rearranged to allow deployment on any database node with the minimum resource consumption. OCP Express provides broad control over OceanBase Database V4.x while minimizing costs. 

Intended for lightweight O&M management, OCP Express integrates with the managed OceanBase cluster for one-to-one dedicated management. It supports basic O&M needs with fewer resources. In contrast, targeted large-scale and complex clusters, OCP supports managing multiple OceanBase clusters and provides richer management capabilities than OCP Express. However, OCP requires an additional OceanBase cluster to store its own data and demands higher resource configurations. 

> **Note**
>
> OCP Express is suitable for O&M of OceanBase clusters in development and testing environments with no more than 20 servers and 3 to 5 tenants. We recommend using OCP for production environments. 

For more information about the system architecture and features of OCP Express, see [OCP Express](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971292). 

### OBD

OceanBase Deployer (OBD) enables installation and deployment of OceanBase clusters through CLI or GUI. It standardizes the complex configuration process, simplifying cluster deployment. 

* CLI-based deployment lets you edit configuration files for flexible adjustment and requires deep OceanBase knowledge. 

* GUI-based deployment uses a wizard to guide you through easily setting up clusters, ideal for quickly trying OceanBase in standard environments. 

In addition to cluster deployment, OBD provides general O&M capabilities such as the package management, stress testing, and cluster management for better user experience. 

For details, see [OceanBase Deployer](https://en.oceanbase.com/docs/obd-en). 

### ob-operator

ob-operator is built on the Kubernetes Operator framework to manage OceanBase clusters on Kubernetes. It provides a simple and reliable way to implement the containerized deployment of and simplify the O&M of OceanBase clusters. ob-operator defines various resources for OceanBase Database and implements the corresponding coordination logic, allowing you to manage OceanBase clusters declaratively, much like native Kubernetes resources. 

For more information about the features and usage instructions of ob-operator, see [Kubernetes Operator for OceanBase](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001735158). 

## Monitoring tools

### OCP / OCP Express

In addition to cluster and tenant management, OCP and OCP Express provide performance diagnostics, monitoring, and alerting features. See the description of OCP and OCP Express in [Installation and deployment tools](#Installation and deployment tools) for details.

### OBAgent

OceanBase Agent (OBAgent) is a monitoring data collection and O&M framework. 

* Data collection

   OBAgent supports push and pull modes for various scenarios. By default, OBAgent supports plug-ins for server data collection, OceanBase Database metrics collection, log collection, monitoring data label processing, and HTTP service of the Prometheus protocol. Data can be pushed to Pushgateway, vmagent, Elasticsearch, Simple Log Service (SLS), and Alertmanager. You can also develop plug-ins to enable OBAgent to collect data from other sources or customize the data processing process. 

* O&M

   OBAgent offers hot update configuration and APIs for O&M, file, and RPM package operations. 

For details, see the [obagent repository](https://github.com/oceanbase/obagent). 

## Migration and synchronization tools

### OMS

OceanBase Migration Service (OMS) supports data migration between a homogeneous or heterogeneous data source and OceanBase Database. It handles online migration of existing data and real-time synchronization of incremental data. 

OMS Community Edition provides a visual, centralized management platform for you to migrate data in real time with simple configuration. It helps you migrate and synchronize data in real time from a homogeneous or heterogeneous data source to OceanBase Database at a low cost and at a low risk. 

For details, see [OceanBase Migration Service](https://en.oceanbase.com/docs/oms-en). 

### OBLogProxy

OBLogProxy is the incremental log proxy service of OceanBase Database. It connects to OceanBase Database to read incremental logs and enables downstream CDC (change data capture). 

It supports two modes: 

* Binlog mode: Compatible with MySQL binlogs, allowing the use of MySQL binlog parsing tools to synchronize OceanBase Database logs in real time. 

* CDC mode: Subscribes to data changes in OceanBase Database and synchronizes these to downstream services for real-time or near real-time replication and synchronization. 

For details, see [OBLogProxy](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971288). 

### OBLOADER & OBDUMPER

OceanBase provides the data import tool OBLOADER and the data export tool OBDUMPER. 

OBLOADER offers extensive command-line options to import database object definitions and table data to OceanBase Database in complex scenarios. It works well with OBDUMPER and can import CSV files exported by tools like Navicat, MyDumper, or SQL Developer. OBLOADER leverages OceanBase Database's distributed architecture and optimizes the import performance. 

OBDUMPER supports exporting table data from OceanBase Database to SQL or CSV files and also supports exporting objects defined in the database to files. 

For details, see [OceanBase Loader and Dumper](https://en.oceanbase.com/docs/obloader-obdumper-en). 

## O&M tools

### OCP / OCP Express

OCP supports creating and managing clusters and tenants, fault recovery, performance diagnostics, and monitoring and alerting.

Compared with OCP, OCP Express does not support advanced O&M capabilities, such as backup and restore, version upgrade, and cluster scaling, aiming to reduce resource usage. OCP Express is more lightweight than OCP and is designed to meet the basic O&M and monitoring requirements of a single cluster. For production environments, we recommend using OCP. 

See the description of OCP and OCP Express in [Installation and deployment tools](#Installation and deployment tools) for details. 

### OBShell

OceanBase Shell (OBShell) is an out-of-the-box CLI tool for O&M engineers and developers to manage local OceanBase clusters. It supports cluster O&M and provides O&M APIs based on OceanBase Database, enabling unified management across different ecosystem tools and reducing operational complexity and costs. 

OBShell requires no separate installation. It is included with OceanBase Database Community Edition, located in the `bin` directory under the working directory of each OBServer node. 

For details, see [OBShell](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001973568). 

### obdiag

obdiag is a CLI diagnostic tool designed for OceanBase Database. It scans, collects, and analyzes logs, SQL audit records, and process stack information about OceanBase Database. You can use obdiag easily, no matter whether your OceanBase cluster is deployed manually or by using OCP or OBD. 

obdiag can:

* Inspect OceanBase clusters for existing or possible exceptions, analyze causes, and provide O&M suggestions.
* Collect diagnostic information dispersed across nodes and package it for reporting.
* Analyze logs to detect errors.
* Perform end-to-end diagnostics using the `trace.log` file. 

For details, see [OceanBase Diagnostic Tool](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971285). 

### ob_error

ob_error is an error code parsing tool that returns causes and solutions for OceanBase error codes, letting you troubleshoot issues without searching documentation. 

For details, see [ob_error](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971282). 

### ob_admin

ob_admin offers tools like slog_tool, log_tool, dumpsst, and dump_backup for troubleshooting data inconsistency, loss, and errors.

For details, see [ob_admin](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001973570). 

## GUI-based development tools

### ODC

OceanBase Developer Center (ODC) is a GUI-based development tool and a collaborative management platform for data development and production change, available as Client ODC and Web ODC.

* Client ODC focuses on database development and is lightweight and easy to deploy on Windows, macOS, and Linux.
* Web ODC adds the collaborative management features to ensure the security, compliance, and efficiency of database changes. 

Specifically, Web ODC supports:

* Individual Workspace for individual developers to develop databases through a browser.
* Team Workspace for developers and database administrators (DBAs) to collaborate, enabling project collaboration, controlled change, data security, and hot/cold data separation. 

For details, see [OceanBase Developer Center](https://en.oceanbase.com/docs/odc-en). 

> **Note**
>
> In addition to ODC, third-party GUI-based development tools like Navicat and DBeaver can also connect to OceanBase Database. 

## Database drivers

### OceanBase Connector/J

OceanBase Connector/J is used for Java-based applications to connect to OceanBase Database. It is a JDBC Type 4 driver that can be connected to a database engine through local protocols. 

OceanBase Database supports OceanBase Connector/J and is fully compatible with MySQL Connector Java, the native JDBC driver for MySQL. OceanBase Connector/J is fully compatible with MySQL JDBC. OceanBase Connector/J automatically determines whether OceanBase Database runs in MySQL or Oracle mode and supports both modes at the protocol layer. 

For details, see [OceanBase Connector/J](https://en.oceanbase.com/docs/oceanbase-connector-j-en). 

### OceanBase Connector/C

OceanBase Connector/C is an OBClient development component based on C/C++. OceanBase Connector/C supports C API libraries. OceanBase Connector/C allows C/C++ applications to access OceanBase distributed database clusters from the underlying layer. Then, the applications can perform operations such as database connection, data access, error processing, and prepared statement processing. 

Also known as LibobClient, OceanBase Connector/C allows an application to run as an independent server process to co<img width="432" height="16" alt="image" src="https://github.com/user-attachments/assets/d65b875d-ba4b-41a4-b04e-0bc3bc9d25d9" />
<img width="432" height="16" alt="image" src="https://github.com/user-attachments/assets/ca40cb66-31fc-4508-b784-0cf33b5f3a8e" />
<img width="432" height="16" alt="image" src="https://github.com/user-attachments/assets/2ab64048-85d1-4bdd-a680-0ee50f62d630" />
mmunicate with OBServer nodes by using network connections. A client application references the C API header file during compilation and can link to the C API library file. 

For more information about OceanBase Connector/C, see [OceanBase Connector/C](https://en.oceanbase.com/docs/oceanbase-connector-c-en). 

### OceanBase Connector/ODBC

ODBC (Open Database Connectivity) enables data sharing between heterogeneous databases. It has become a major part of the Windows Open System Architecture (WOSA) and a database access API standard in Windows-based environments. 

For details, see [OceanBase Connector/ODBC](https://en.oceanbase.com/docs/obodbc-en). 
