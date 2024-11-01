---
slug: E-mind
title: 'From MySQL to OceanBase: how does E-mind manage the analysis of humongous data'
tags:
  - User Case
---

**Background**
--------

Beijing E-mind Education Technology Co., Ltd. (hereinafter referred to as E-mind) is a high-end education assessment firm in China. We provide education diagnosis, assessment, and improvement services to primary and secondary schools in China. We started service research and development in 2009, and have established a school diagnosis cycle that organically combines theory development, solution exploration, modeling, procedure streamlining, and result application. Tapping the power of Internet technologies, we have built a proprietary system that supports independent diagnosis, data analysis, and data reporting to provide more basic education schools with multi-dimensional and customized services. Many premium primary and secondary schools have benefitted from our professional and tailored diagnosis, assessment, and management consulting services. They have all recognized us for playing an important role in optimizing their education performance and department management, and the personal development of students.

**Challenges**
--------

Our online business platform and background analysis platform were built on MySQL databases. The business growth in the past two years has put an increasing workload on the database management system. While the cloud online services worked fine, the growing data volume seriously degraded the performance of our background analysis platform and reporting system. We addressed the issue by creating more table partitions, but still worried that the standalone architecture might be overwhelmed by the rapid business development due to its system scalability, performance bottleneck, and data security issues. So we started hunting alternatives to MySQL based on one principle that the new database system must be fully compatible with MySQL syntax, because hundreds of thousands of our reports were made manually. It would be a disaster if we had to make them all over again.

**Database research and selection**
---------

It was a long haul to select the right database system.

### **Middleware**

MyCat supports the sharding of many types of databases and is easy to scale. However, it has the following drawbacks:

* MyCat routes all SQL requests in a system, and thus forms a single point. If the system consists of multiple databases, MyCat itself consumes considerable CPU resources.
* It is difficult to implement a MyCat-based architecture. In a standalone architecture, MyCat also causes a 30% forwarding performance loss.

So we did not select MyCat after comprehensive consideration.

ShardingSphere is a type of open source distributed database middleware with obvious advantages:

* Powerful sharding and routing capabilities: supports multiple sharding algorithms and routing strategies, and can flexibly distribute data to multiple database nodes.
* Great compatibility: supports many types of databases, such as MySQL, Oracle, and SQL Server.
* High availability and scalability: supports leader-follower replication and data backup, providing high availability and data reliability. ShardingSphere can be easily scaled out in response to growing data volume and concurrent requests.
* Flexible configuration and management: comes with a range of configuration options and management tools, allowing users to easily perform operations such as sharding, routing, and data migration.

We decided on using ShardingSphere before we tried OceanBase Database. However, we preferred OceanBase Database due to its native distributed architecture without middleware.

### **Greenplum Database**

Some of our business modules ran stably on Greenplum Database. However, its syntax is based on PostgreSQL, which is quite different from MySQL syntax. So we did not choose Greenplum Database either.

### **Apache Doris**

Apache Doris is a high-performance, real-time analytic database based on the massively parallel processing (MPP) architecture. It is well known for its extreme speed and ease of use. In a query that involves massive amounts of data, it returns results in less than a second. Apache Doris supports not only highly concurrent point queries, but also high-throughput complex data analysis. Intrigued by the introduction on its official website, we tested Apache Doris 1.x with a data set that contained hundreds of millions of rows. The system was indeed powerful and returned query results in a blink, despite its simple architecture. However, we found that it was not fully compatible with MySQL cluster analysis or functions. Our BI system had no problem in generating regular reports, but always returned errors for some specific reports. Apache Doris might be our choice if we just started out or planned to remake all our reports.

### **SequoiaDB**

Being popular in the financial sector, SequoiaDB boasts high performance and infinite horizontal scalability, and, according to its official website, is fully compatible with traditional relational databases. We crossed it out anyway because it was not fully compatible with MySQL in our tests.

### **OceanBase Database**

The release of OceanBase Database V4.1.0 caught our eyes by chance, and we were very interested in its advantages.

**High compatibility**: OceanBase Database is highly compatible with most general features of Oracle and MySQL, and supports advanced features such as procedural language (PL) and triggers. OceanBase Migration Service (OMS), an automatic migration tool, is provided to support migration assessment and reverse synchronization to ensure data migration security when a core system is migrated to OceanBase Database in key industries such as finance, public governance, and communication service.

**Horizontal scaling**: OceanBase Database supports rapid, transparent horizontal scaling in response to business fluctuations, and achieves high performance based on a quasi-memory transaction processing architecture. Users can deploy thousands of nodes in an OceanBase cluster, where the maximum data volume can exceed 3 PB and a single table can contain trillions of rows.

**High cost efficiency**: OceanBase Database adopts a storage engine based on the log-structured merge-tree (LSM-tree), which can achieve a high compression ratio and reduce storage costs by 70% to 90%. OceanBase Database also supports native multitenancy, which means that a single cluster can serve multiple business lines with the data of one tenant isolated from that of others. These features reduce deployment and O&M costs.

**Real-time hybrid transactional/analytical processing (HTAP)**: OceanBase Database uses the same database engine to perform online real-time transactions and real-time analysis on the same set of data. Multiple replicas of the same set of data can be stored in different forms for different purposes. This fundamentally ensures data consistency.

Running through its documentation, we had no problem with its high availability solution, but were not that confident about its compatibility with MySQL. After all, the tests on other alternatives did not end well.

![1703487982](/img/blogs/users/E-mind/1703487982703.png)

**Functionality and compatibility tests**
------------

We deployed OceanBase Database in a test environment to test its functionality and compatibility. With the help of its official documentation, we deployed the test environment on a local virtual machine of average specifications by simply executing a few lines of commands.

Item

Description

OS

CentOS Linux 7.6

CPU

4 cores

Memory

8 GB

Disk type

SSD

Disk size

100 GB

File system

XFS

All-in-one package

V4.1.0 or later

Then, we imported the test data and launched the reporting system to execute a test task. To our surprise, OceanBase Database generated a perfect report before we adapted it to our specific business requirements. This indicated that OceanBase Database was fully compatible with our BI system and the thousands of reports in it. We were so excited that we finally found a feasible solution that supported our complex statistical statements.

Soon after that, we tested the functionality and compatibility of OceanBase Database on a virtual machine of higher specifications.

![1703487992](/img/blogs/users/E-mind/1703487992359.png)

After data migration, we noticed that all data in the original MySQL database, about 401.5 GB, occupied only 44.7 GB in OceanBase Database. This was because, according to the official documentation, the storage engine of OceanBase Database is based on the LSM-tree architecture, which features a high compression ratio. Data is divided into static baseline data (stored in SSTables) and dynamic incremental data (stored in MemTables) to guarantee database performance.

![1703488000](/img/blogs/users/E-mind/1703488000318.png)

With the help of the clearly described documentation, we got started quite easily. From the installation of OceanBase Database to the creation of objects, such as resource pools, tenants, databases, and users, everything was done smoothly.

We did encounter some issues during the tests, such as the performance issue of some SQL statements. However, we solved them quickly with the help of the community and engineers on DingTalk. Later, we upgraded OceanBase Database to V4.2.1, which has been running with better stability.

**Data migration**

OceanBase Database supports fast data migration by tools such as Navicat, Kettle, DataX, and MyDumper/MyLoader. In the test, we imported 120 million rows of data in 8 minutes using Kettle.

Take note of the following considerations before you start data migration:

* Disable the primary key auto-increment feature. Otherwise, high-concurrency import will seriously impact the performance.
* Disable indexes and foreign keys, and create new ones after data import.
* Replace the character set utf8 with utf8mb4.
* Modify timeout parameters to prevent timeout errors when importing the data of large tables.

* Modify the connection timeout parameter by running

    `show variables like '%ob_query_timeout%'`. We changed the value to 3,600,000,000 microseconds.

* Modify the write timeout parameter by running

    `show variables like '%net_write_timeout%'`. We changed the value to 600 seconds.

**Final words**
------

Our analysis platform is now running on OceanBase Database, and we are quite satisfied with the performance. First, unlike in MySQL, multi-table joins involving a large table with hundreds of millions of rows no longer get stuck. Second, we no longer worry about the single point of failure, thanks to the guaranteed system security, high availability, and scalability. As our business grows, we only need to scale the database dynamically, which will greatly reduce our database O&M workload. In the end, we hope that OceanBase enjoys a brilliant future.