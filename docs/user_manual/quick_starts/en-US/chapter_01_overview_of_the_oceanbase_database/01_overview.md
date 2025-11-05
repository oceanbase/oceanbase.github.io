---
title: OceanBase Database
weight: 2
---

# 1.1 OceanBase Database

This topic highlights the key features of OceanBase Database, explores the differences between the Community and Enterprise editions, and dives into the evolution of system tables and views across major versions like V3.x and V4.x. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Overview

OceanBase Database is a native, distributed database developed independently by the OceanBase team. It has successfully served the Singles' Day Shopping Festival for 11 consecutive years, and introduces a new region-level disaster recovery standard known as "Five IDCs across Three Regions". It is the only native, distributed database that has set new world records in both TPC-C and TPC-H benchmark tests. Based on the self-developed integrated architecture, OceanBase Database incorporates the scalability of a distributed architecture and the performance benefits of a centralized architecture. This enables the database to support transaction processing (TP) and analytical processing (AP) with one engine, and ensures its strong data consistency, high availability, high performance, online scalability, high compatibility with Oracle/MySQL, transparency to applications, and high cost-effectiveness. OceanBase Database has been making in-depth exploration in a wide range of core scenarios for 14 years, helping more than 1,000 enterprises from industries such as finance, government services, telecommunication, retail, and Internet in upgrading their key business systems. 

### Core features

#### High availability

OceanBase Database pioneers the "Five IDCs across Three Regions" disaster recovery solution, setting a new standard for lossless disaster recovery in the financial industry. It supports disaster recovery in the same region or across different regions, enabling multi-site active-active deployment. This meets the Level 6 disaster recovery requirements of the financial industry with a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of less than 8 seconds. 

#### High compatibility

OceanBase Database Community Edition is highly compatible with most general features of MySQL and supports advanced features such as procedural language and triggers. It provides automatic migration tools that support migration assessment and reverse synchronization, ensuring data security during migration. The database can assist key business scenarios in industries such as finance, government services, telecommunication, and Internet. 

#### Horizontal scaling

OceanBase Database supports rapid transparent horizontal scaling in response to business fluctuations, and achieves high performance based on a quasi-memory transaction processing architecture. It supports thousands of nodes in a single cluster, where the maximum data volume can exceed 3 PB and a single table can contain trillions of rows. 

#### Low costs

OceanBase Database adopts a storage engine based on the log-structured merge-tree (LSM-tree), which can achieve a high compression ratio and reduce storage costs by 70% to 90%. OceanBase Database also supports the multi-tenant architecture, which means that the same cluster can serve multiple business lines with the data of one tenant isolated from that of others. This reduces the deployment and operation and maintenance (O&M) costs. 

#### Real-time HTAP

OceanBase Database uses the same database engine to perform online real-time transactions and real-time analysis on the same set of data. Multiple replicas of the same set of data can be stored in different forms for different purposes. This fundamentally ensures data consistency. 

#### Security and reliability

The OceanBase team has been independently developing OceanBase Database since 2010 and has full control over its source code. The integrated architecture of OceanBase Database has reliably supported large-scale financial core systems for many years. 

## About OceanBase Database Community Edition

OceanBase Database Community Edition uses the MulanPubL-2.0 license. You can copy and use the source code for free. You must follow the requirements outlined in the license when you modify or distribute the source code. 

### Core features of OceanBase Database Community Edition

OceanBase Database Community Edition supports all the core features of OceanBase Database Enterprise Edition, including:

* Multi-replica high availability and strong synchronization 

* Multi-tenancy 

* Online elastic scaling 

* Cross-region disaster recovery and active-active capability (including three IDCs across two regions and five IDCs across three regions) 

* Table partitioning and replication 

* HTAP 

* High compatibility with MySQL 

* Backup and restore 

* Change Data Capture (CDC) 

### Download links

* Official website: [https://en.oceanbase.com/softwarecenter](https://en.oceanbase.com/softwarecenter)

* GitHub: [https://github.com/oceanbase/oceanbase/releases/](https://github.com/oceanbase/oceanbase/releases/)

### Supported operating systems

For more information, see [Software and hardware requirements](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971619). 

### Differences from a MySQL database

* The underlying layer of OceanBase Database is totally different from that of MySQL, which means that OceanBase Database neither relies on open source MySQL components nor uses the InnoDB engine. However, OceanBase Database Community Edition is compatible with most syntaxes of MySQL 5.6 and 5.7, as well as some new features of MySQL 8.0. 

* Compared with MySQL, OceanBase Database employs a storage engine that achieves a higher compression ratio and reduces storage costs by 70% to 90%. 

* OceanBase Database is a distributed database cluster product. In production environments, it defaults to three replicas, and the synchronization protocol among these replicas is not asynchronous or semi-synchronous. Instead, it uses the Paxos protocol to synchronize transaction logs. An OceanBase cluster can be deployed across IDCs and regions. When a server or IDC fails, an automatic replica failover is performed without data loss. Therefore, OceanBase Database is naturally suitable for the deployment mode of three IDCs across two regions to achieve the cross-region disaster recovery and active-active capability. 

* An OceanBase cluster supports multiple tenants (also called instances) that are allocated resources on demand, enabling elastic scaling and high availability, much like a cloud database service. O&M engineers only need to manage a few OceanBase clusters to provide numerous instances for business applications, making OceanBase Database easy to use. 

* OceanBase Database supports horizontal splitting (partitioned tables), without the need for database and table sharding. SQL statements and transactions are fully transparent to business systems without any functional limitations. Partitioned tables demonstrate good linear scalability. The largest known single-tenant deployment currently consists of 1,500 nodes. 

* The SQL engine of OceanBase Database is more powerful than that of MySQL: it supports caching of execution plans to reduce the overhead of repeatedly generating the same plan for identical SQL statements; it allows intervention in the form of SQL execution plans through hints and outlines; and it supports plan generation and SQL computing in distributed and complex scenarios. Additionally, OceanBase Database supports hybrid workloads combining OLTP and OLAP (or HTAP). 

### Applicable business scenarios of OceanBase Database Community Edition

* Scenario 1: Large-scale MySQL 5.6/5.7 instances

   In scenarios where MySQL instances are large and require automated operation and maintenance platforms, handling unexpected MySQL crashes and primary-standby inconsistencies probably requires DBA intervention. High availability and strong consistency pose inherent risks for MySQL. OceanBase Database's multi-tenant architecture, high availability, and strong consistency capabilities can completely address these pain points. 

* Scenario 2: Large data volume and high storage costs in MySQL 5.6/5.7

   When MySQL business data volume grows to several terabytes, the query and read/write performance may decrease and DDL operations on large tables take longer, increasing risks. The disk capacity of a single server may reach the expansion bottleneck in this case. The online DDL operations and high data compression ratio of MySQL tenants of OceanBase Database can resolve these pain points. 

* Scenario 3: High or fluctuating business access pressure

   Distributed database middleware products built on MySQL can alleviate some business load and storage pressure. However, they often lack strong consistency for queries across nodes and require distributed transaction middleware to coordinate transactions. Scaling out may also involve logical data splitting (database and table sharding), which leads to high O&M costs and increased risks. OceanBase Database's MySQL tenants offer a horizontal partitioning solution using partitioned tables, providing native SQL and transaction capabilities that are transparent to the business. Additionally, OceanBase Database supports online scaling in and out with asynchronous internal data migration and built-in high availability, ensuring no service disruptions during scaling operations. This effectively addresses the challenges mentioned above. 

* Scenario 4: Complex queries on transactional databases

   Transactional databases sometimes experience a small number of complex queries over large amounts of data. Conventional solutions involve synchronizing data to a data warehouse for these queries. The SQL engine of OceanBase Database caters to both OLTP and OLAP scenarios, employing advanced SQL optimizer technology proven in complex Oracle business scenarios and supporting complex SQL statement optimization and efficient execution. This allows complex queries to run directly on the transaction database, reducing unnecessary data synchronization. Moreover, OceanBase Database provides different read/write splitting technologies to control the impact of complex queries on transactions. 

* For more scenarios, click [here](https://en.oceanbase.com/blog#customer_stories). 

## Differences between the Enterprise Edition and Community Edition

OceanBase Database Community Edition differs from OceanBase Database Enterprise Edition in that the latter comprises more advanced features such as advanced compatibility modes, operation audit, and data encryption. Taking V4.4.1 as an example, the features supported by the Enterprise Edition and Community Edition are as follows:

| Category | Feature | Enterprise Edition | Community Edition |
|----------|---------|-------------------|-------------------|
| **Product Architecture** | Storage and compute separation | Supported | Not supported |
| **Product Architecture** | Independent log service | Supported | Not supported |
| **Core Components** | Integrated SQL engine | Supported | Supported |
| **Core Components** | Integrated transaction engine | Supported | Supported |
| **Core Components** | Integrated storage engine | Supported | Supported |
| **Core Components** | Cluster scheduling service | Supported | Supported |
| **Core Components** | Cluster proxy service | Supported | Supported |
| **Core Components** | Client, C driver, and Java driver | Supported | Supported |
| **High Availability** | Multi-replica support | Supported | Supported |
| **High Availability** | Five IDCs across three regions | Supported | Supported |
| **High Availability** | Transparent horizontal scaling | Supported | Supported |
| **High Availability** | Multi-tenant management | Supported | Supported |
| **High Availability** | Tenant cloning | Supported | Supported |
| **High Availability** | Data backup and restore | Supported | Supported |
| **High Availability** | Resource isolation | Supported | Supported |
| **High Availability** | Physical standby database | Supported | Supported |
| **High Availability** | Arbitration service | Supported | Not supported |
| **Compatibility** | MySQL syntax and protocol compatibility | Supported | Supported |
| **Compatibility** | Data types and function compatibility | Supported | Supported |
| **Compatibility** | Stored procedures and packages | Supported | Supported |
| **Compatibility** | Complex character sets | Supported | Supported |
| **Compatibility** | Oracle syntax compatibility | Supported | Not supported |
| **Compatibility** | XA transactions | Supported | Supported |
| **Compatibility** | LOCK TABLE | Supported | Supported |
| **Compatibility** | Function-based indexes | Supported | Supported |
| **High Performance** | Cost-based optimizer | Supported | Supported |
| **High Performance** | Optimization and rewriting of complex queries | Supported | Supported |
| **High Performance** | Parallel execution engine | Supported | Supported |
| **High Performance** | Vectorized engine | Supported | Supported |
| **High Performance** | Columnar engine | Supported | Supported |
| **High Performance** | Advanced SQL plan management (SPM) | Supported | Not supported |
| **High Performance** | Minimum specifications | Supported | Supported |
| **High Performance** | Paxos-based log transmission | Supported | Supported |
| **High Performance** | Distributed strong-consistency transactions, complete ACID, and multi-version support | Supported | Supported |
| **High Performance** | Data partitioning (RANGE, HASH, and LIST) | Supported | Supported |
| **High Performance** | Partition exchange | Supported | Supported |
| **High Performance** | Partition splitting | Supported | Supported |
| **High Performance** | Global indexes | Supported | Supported |
| **High Performance** | Multi-valued indexes | Supported | Supported |
| **High Performance** | Full-text indexes | Supported | Supported |
| **High Performance** | Advanced compression | Supported | Supported |
| **High Performance** | Dynamic sampling | Supported | Supported |
| **High Performance** | Auto degree of parallelism (DOP) | Supported | Supported |
| **High Performance** | Materialized views | Supported | Supported |
| **Cross-Data Source Access** | Read-only external tables | Supported | Supported |
| **Cross-Data Source Access** | DBLink | Supported | Supported |
| **Multimodel** | OBKV-Table | Supported | Supported |
| **Multimodel** | OBKV-HBase | Supported | Supported |
| **Multimodel** | JSON | Supported | Supported |
| **Multimodel** | Geographic information system (GIS) | Supported | Supported |
| **Multimodel** | XML | Supported | Supported (XML expressions) |
| **Multimodel** | Vector | Supported | Supported |
| **Security** | Audit | Supported | Not supported |
| **Security** | Privilege management | Supported | Supported |
| **Security** | Communication encryption | Supported | Supported |
| **Security** | Advanced security scaling | Supported | Not supported<sup>1</sup> |
| **O&M Management** | End-to-end tracing | Supported | Supported |
| **O&M Management** | O&M components (liboblog and ob_admin) | Supported | Supported |
| **O&M Management** | obloader and obdumper | Supported | Supported |
| **O&M Management** | GUI-based development and management tools | Supported | Supported<sup>2</sup> |
| **Support and Services** | Technical consultation (product technical consultation services) | Supported | Community-based technical consultation only<sup>3</sup> |
| **Support and Services** | Service acquisition (channels for obtaining technical support) | Professional commercial support team | Online service consultation only<sup>4</sup> |
| **Support and Services** | Expert services (planning, implementation, inspection, fault recovery, and production assurance) | Commercial expert on-site services | Not supported |
| **Support and Services** | Fault response | 24/7 services | Not supported |
| **Cost Efficiency** | CLOG storage compression | Supported | Not supported |

## Notes

1. **Advanced security scaling**: OceanBase Database Community Edition does not support row-level labels, transparent data encryption (TDE), RPC transmission encryption based on national cryptographic algorithms, or TLS password-free login.

2. **GUI-based development and management tools**: OceanBase Database Community Edition supports GUI-based development and management tools such as OceanBase Cloud Platform (OCP), OceanBase Migration Service (OMS), and OceanBase Developer Center (ODC). You can download these tools for free. However, OceanBase Migration Assessment (OMA) is not included.

3. **Technical consultation**: OceanBase Database Community Edition provides only community-based product technical consultation services, operating through community issues, and does not provide commercial expert team technical consultation.

4. **Service acquisition**: OceanBase Database Community Edition provides online service consultation only on the OceanBase Community official website or official community, and does not provide commercial expert team exclusive services.

## Release notes of OceanBase Database Community Edition

For more information, see [release notes](https://github.com/oceanbase/oceanbase/releases/tag/v4.4.1_CE). 

## Changes in system tables and views in OceanBase Database V3.x and V4.x

Compared to OceanBase Database version 3.x, version 4.x has made significant improvements in stability and performance, along with many new features. Notably, we have extensively redesigned internal tables and virtual tables, and introduced system views for information display. In short, the biggest change in version 4.x is the comprehensive shift to using views for internal information queries. These uniformly defined views ensure compatibility across versions and provide clearer information.

For more information, see [Changes in views in OceanBase Database V3.x and V4.x](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001970993). 
