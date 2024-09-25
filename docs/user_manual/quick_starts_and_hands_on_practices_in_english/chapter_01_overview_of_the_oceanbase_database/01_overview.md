---
title: OceanBase Database
weight: 2
---

# 1.1 OceanBase Database

This topic outlines the core features of OceanBase Database, the differences between its community and enterprise editions, and changes in the system tables and system views in its key versions such as V4.x and V3.x. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Overview

OceanBase Database is a native, distributed database developed independently by the OceanBase team. It has successfully served the Double 11 promotion season for 11 consecutive years, and introduces a new region-level disaster recovery standard known as "Five IDCs across Three Regions". It is the only native, distributed database that has set new world records in both TPC-C and TPC-H benchmark tests. Based on the self-developed integrated architecture, OceanBase Database incorporates the scalability of a distributed architecture and the performance benefits of a centralized architecture. This enables the database to support transaction processing (TP) and analytical processing (AP) with one engine, and ensures its strong data consistency, high availability, high performance, online scalability, high compatibility with Oracle/MySQL, transparency to applications, and high cost-effectiveness. OceanBase Database has been making in-depth exploration in a wide range of core scenarios for 14 years, helping more than 1,000 enterprises from industries such as finance, government services, telecommunication, retail, and Internet in upgrading their key business systems. 

### Core features

#### High availability

OceanBase Database pioneers the "Five IDCs across Three Regions" disaster recovery solution, setting a new standard for lossless disaster recovery in the financial industry. It supports multi-active IDCs deployed across multiple regions for zone- and geo-disaster recovery, which meets the Level 6 disaster recovery requirements of the financial industry with a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of less than 8 seconds. 

#### High compatibility

OceanBase Database Community Edition is highly compatible with most general features of MySQL and supports advanced features such as procedural language and triggers. It provides automatic migration tools that support migration assessment and reverse synchronization, ensuring data security during migration. The database can assist key business scenarios in industries such as finance, government services, telecommunication, and Internet. 

#### Horizontal scaling

OceanBase Database supports rapid transparent horizontal scaling in response to business fluctuations, and achieves high performance based on a quasi-memory transaction processing architecture. It supports thousands of nodes in a single cluster, where the maximum data volume can exceed 3 PB and a single table can contain trillions of rows. 

#### Low costs

OceanBase Database adopts a storage engine based on the log-structured merge-tree (LSM-tree), which can achieve a high compression ratio and reduce storage costs by 70% to 90%. OceanBase Database also supports the multi-tenant architecture, which means that the same cluster can serve multiple business lines with the data of one tenant isolated from that of others. This reduces deployment and O&M costs. 

#### Real-time HTAP

OceanBase Database uses the same database engine to perform online real-time transactions and real-time analysis on the same set of data. Multiple replicas of the same set of data can be stored in different forms for different purposes. This fundamentally ensures data consistency. 

#### Security and reliability

The OceanBase team has been independently developing OceanBase Database since 2010 and has full control over its source code. The integrated architecture of OceanBase Database has reliably supported large-scale financial core systems for many years. 

## About OceanBase Database Community Edition

OceanBase Database Community Edition uses the MulanPubL-2.0 license. You can copy and use the source code for free. You must follow the requirements outlined in the license when you modify or distribute the source code. 

### Core features of OceanBase Database Community Edition

OceanBase Database Community Edition supports all core features of OceanBase Database Enterprise Edition, including:

* Multi-replica high availability and strong synchronization 

* Multitenancy 

* Online elastic scaling 

* Geo-disaster recovery and active geo-redundancy (including three IDCs across two regions and five IDCs across three regions) 

* Table partitioning and replication 

* HTAP 

* High compatibility with MySQL 

* Backup and restore 

* Change Data Capture (CDC) 

### Download links

* Official website: [https://en.oceanbase.com/softwarecenter](https://en.oceanbase.com/softwarecenter)

* GitHub: [https://github.com/oceanbase/oceanbase/releases/](https://github.com/oceanbase/oceanbase/releases/)

### Supported operating systems

For more information, see [Software and hardware requirements](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375950). 

### Differences from a MySQL database

* The underlying layer of OceanBase Database is totally different from that of MySQL, which means that OceanBase Database neither relies on open source MySQL components nor uses the InnoDB engine. However, OceanBase Database Community Edition is compatible with most syntaxes of MySQL 5.6 and 5.7, as well as some new features of MySQL 8.0. 

* Compared with MySQL, OceanBase Database employs a storage engine that achieves a higher compression ratio and reduces storage costs by 70% to 90%. 

* OceanBase Database is a distributed database cluster. By default, the production environment comprises three replicas that use the Paxos protocol to synchronize transaction logs. The synchronization process is not asynchronous or semi-synchronous. An OceanBase cluster can be deployed across IDCs and regions. When a server or IDC fails, an automatic replica failover is performed without data loss. Therefore, OceanBase Database is naturally suitable for the deployment mode of three IDCs across two regions to achieve geo-disaster recovery and active geo-redundancy. 

* An OceanBase cluster supports multiple tenants (also known as instances) that are allocated with resources on demand, elastic scaling, and high availability, and is similar to a cloud database service. O&M engineers only need to maintain a few OceanBase clusters to provide many instances for business systems, which means OceanBase Database is easy to use. 

* OceanBase Database supports horizontal splitting (partitioned tables), without the need for database and table sharding. SQL statements and transactions are fully transparent to business systems without limitations on features. Partitioned tables demonstrate good linear scalability. Among the known cases by now, a single tenant can contain up to 1,500 nodes. 

* The SQL engine of OceanBase Database is more powerful than that of MySQL. It supports the caching of execution plans, avoiding the overhead caused by repeated generation of the same execution plan for the same SQL statement; allows you to use hints and outlines to intervene the form of SQL execution plans; and supports plan generation and SQL computing in distributed and complicated scenarios. In addition, OceanBase Database supports hybrid OLTP and OLAP (or HTAP) requirements. 

### Applicable business scenarios of OceanBase Database Community Edition

* Scenario 1: MySQL 5.6/5.7 instances are large in scale.

   When MySQL instances are large in scale, an automatic O&M platform is needed. When the automatic O&M platform handles problems of failover upon server breakdown and inconsistency between the primary and standby clusters, the DBA may need to intervene. High availability and strong consistency are the pain points of MySQL, which can be resolved based on the multitenancy, high availability, and strong consistency capabilities of OceanBase Database. 

* Scenario 2: MySQL 5.6/5.7 stores a large amount of data at high costs.

   When the business data volume of a MySQL instance grows to the TB level, the query and read/write performance may decrease and DDL operations on large tables take longer, increasing the risks. The disk capacity of a single server may also reach the scaling bottleneck in this case. The online DDL operations and high data compression ratio of MySQL tenants of OceanBase Database can resolve these pain points. 

* Scenario 3: Business access is featured with high stress and great uncertainty.

   The distributed database middleware restructured based on MySQL can share the business stress and storage space stress to a certain extent. However, strong consistency queries across nodes are not supported, the distributed transaction middleware is needed to coordinate transactions, and logical data splitting (database and table sharding) may be needed during scale-out, leading to high O&M costs and risks. MySQL tenants of OceanBase Database support horizontal splitting of partitioned tables and provide native SQL and transaction capabilities that are transparent to business systems. Online scaling and data migration can be performed asynchronously in OceanBase Database to ensure high availability, enabling it to resolve the preceding pain points during scaling. 

* Scenario 4: Complex queries are made in transaction databases.

   A transaction database has a few complex query scenarios that involve a large amount of data. In conventional solutions, data is synchronized to the data warehouse to process such queries. The SQL engine of OceanBase Database applies to both OLTP and OLAP scenarios. The engine adopts the advanced SQL optimizer technology that has been tested in complex Oracle business scenarios to support complex SQL statement optimization and efficient execution. This way, complex queries can be directly performed in the transaction database, reducing unnecessary data synchronization. Moreover, OceanBase Database provides different read/write splitting technologies to control the impact of complex queries on transactions. 

* Click [here](https://en.oceanbase.com/blog#customer_stories) for case studies. 

## Differences between the Enterprise Edition and Community Edition

OceanBase Database Community Edition differs from OceanBase Database Enterprise Edition in that the latter comprises more advanced features such as advanced compatibility modes, operation audit, and data encryption. The following table uses V4.2.2 as an example to compare the support for features by the two editions.

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Feature</th>
      <th>Enterprise Edition</th>
      <th>Community Edition</th>
    </tr>
  </thead>
  <tr>
    <td rowspan="6">Core components</td>
    <td>Integrated SQL engine</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Integrated transaction engine</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Integrated storage engine</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Cluster scheduling service</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Cluster proxy service</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Client, C driver, and Java driver</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td rowspan="8">High availability</td>
    <td>Multi-replica</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Five IDCs across three regions</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Transparent horizontal scaling</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Multi-tenant management</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Data backup and restore</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Resource isolation</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Physical Standby Database solution</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Arbitration service</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td rowspan="8">Compatibility</td>
    <td>Compatibility with MySQL syntax and protocols</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Data types and functions</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Stored procedures and packages</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Complex character sets</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Compatibility with Oracle syntax</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td>XA transactions</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td>Table locks</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td>Function-based indexes</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td rowspan="13">High performance</td>
    <td>Cost-based optimizer</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Optimization and rewriting of complex queries</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Parallel execution engine</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Vectorized engine</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Advanced SQL plan management (SPM)</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td>Minimum specifications</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Paxos-based log transmission</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Distributed strong-consistency transactions, complete atomicity, consistency, isolation, and durability (ACID), and multi-version support</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Data partitioning (RANGE, HASH, and LIST)</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Global indexes</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Advanced compression</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Dynamic sampling</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Auto degree of parallelism (DOP)</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td rowspan="2">Cross-data source access</td>
    <td>Read-only external tables (in the CSV format)</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>DBLink</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td rowspan="5">Multimodel</td>
    <td>TableAPI</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>HBaseAPI</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>JSON</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Geographic information system (GIS)</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>XML</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td rowspan="4">Security</td>
    <td>Audit</td>
    <td>Supported</td>
    <td>Not supported</td>
  </tr>
  <tr>
    <td>Privilege management</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Communication encryption</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>Advanced security scaling</td>
    <td>Supported</td>
    <td>Not supported  <br></br>OceanBase Database Community Edition does not support transparent data encryption (TDE) for row-level labels, data, and logs. </td>
  </tr>
  <tr>
    <td rowspan="4">O&M management</td>
    <td>End-to-end diagnostics</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>O&M components (liboblog and ob_admin)</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>OBLOADER & OBDUMPER</td>
    <td>Supported</td>
    <td>Supported</td>
  </tr>
  <tr>
    <td>GUI-based development and management tools</td>
    <td>Supported</td>
    <td>Supported<br></br>OceanBase Database Community Edition supports GUI-based development and management tools such as OceanBase Cloud Platform (OCP), OceanBase Migration Service (OMS), and OceanBase Developer Center (ODC). You can download these tools for free. However, OceanBase Migration Assessment (OMA) is a paid service. </td>
  </tr>
  <tr>
    <td rowspan="4">Support and services</td>
    <td>Technical consultation (on products)</td>
    <td>Supported</td>
    <td>OceanBase Database Community Edition provides only community-based technical consultation on products. No commercial expert team is provided for technical consultation. </td>
  </tr>
  <tr>
    <td>Service acquisition (channels for obtaining technical support)</td>
    <td>Commercial expert team</td>
    <td>OceanBase Database Community Edition provides online service consultation only on its official website or in its official community and does not provide commercial expert teams. </td>
  </tr>
  <tr>
    <td>Expert services (planning, implementation, inspection, fault recovery, and production assurance)</td>
    <td>On-site services by commercial experts</td>
    <td>OceanBase Database Community Edition does not provide expert assurance services. </td>
  </tr>
  <tr>
    <td>Response to faults</td>
    <td>24/7 services</td>
    <td>OceanBase Database Community Edition does not provide emergency troubleshooting services. </td>
  </tr>
</table>

For more information, see [Differences between the Enterprise Edition and the Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375341). 

## Release notes of OceanBase Database Community Edition

For more information, see [release notes](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001376050). 

## Changes in system tables and views in OceanBase Database V3.x and V4.x

Based on OceanBase Database V3.x, we greatly improve the stability and performance of V4.x, and add many new features. For example, we optimize the internal tables and virtual tables in V4.x, and provide system views for better information display. In a word, the biggest update in OceanBase Database V4.x is that all its internal information is queried from views. Views in different versions are defined in a unified manner to ensure compatibility between versions and clearer information display. 

For more information, see [Changes in views in OceanBase Database V3.x and V4.x](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001375362). 
