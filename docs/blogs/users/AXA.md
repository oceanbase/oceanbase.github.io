---
slug: AXA
title: 'How Did AXA SPDB Select a Database Service to Meet Both OLTP and OLAP Requirements?'
tags:
  - User Case
---


**Introduction:** AXA SPDB Investment Managers Co., Ltd. (AXA SPDB), a Sino-French joint venture fund company established in 2007, requires easy-to-use and efficient business data management tools that deliver high storage performance, ensure quick response, and support real-time data processing. As the original Oracle + Cloudera Distributed Hadoop (CDH) solution could not meet its expectations, **AXA SPDB sought to optimize its database architecture and evaluated OceanBase Database, TiDB, Hive, and Oracle.** After comprehensive comparisons and tests, the company decided on OceanBase Database. In this article, the technical development department of AXA SPDB shared their experience in database selection.

  

  

  

  

**Background and Challenges**

  

The data center of AXA SPDB Investment R&D Department stores 1 TB to 2 TB of data, and the amount of last year's financial security data of some marketing models that need to be reported to supervision departments reaches around 5 TB. In other words, our data can be accommodated in a small data warehouse. As for our data business, calculation tasks involving small and medium amounts of data account for more than 80%, and big data calculation tasks, which rarely happen, can be technically prevented to some extent.

  

For years, we have managed our Oracle database with CDH, a data center management tool. CDH excels in data storage and processes large calculations fast, but has disadvantages in most of small calculations, instant queries based on online analytical processing (OLAP), and real-time data processing. For example, CDH does not support the atomicity, consistency, isolation, or durability (ACID) of transactions and supports only limited DML SQL statements, which prevents effective data writes. In addition, CDH must push its result tables back to Oracle for data application maintenance. Then, we synchronize the manually maintained data and the data of the source system to CDH at T+1 frequency. CDH integrates the data for calculations and then pushes the results back to Oracle. The result data can then be used by DataApi, report, and other data query applications. Resources are wasted as the data is pushed back and forth between Oracle and CDH.

  

However, the Oracle database is not scalable and cannot handle large OLAP tasks, and CDH does not support fast report query or real-time data service unless Impala, Presto, or other real-time analytical components are provided, which is not an option in our plan. So, we started researching distributed databases, hoping to support both online transaction processing (OLTP) and OLAP in one system.

  

  

  

  

**Solution Research and Comparison**

  

**We did our research on OceanBase Database and TiDB, two distributed databases that are capable of hybrid transaction and analytical processing (HTAP).**

  

To achieve both OLTP and OLAP in a TiDB database, we have to build TiFlash replicas. In comparison, the integrated architecture of OceanBase Database is easier to operate and maintain and more user-friendly. So, we didn't test or verify TiDB in a production environment.

  

**We finally comprehensively compared features of Hive, Oracle, and OceanBase Database based on our production environment.**

  

![1](/img/blogs/users/AXA/1698135021300.png)

  

Based on the comparison, we dived deeper into OceanBase Database and looked forward to its following powerful capabilities:

*   **It processes a large number of concurrent calculation tasks, which allows us to perform batch processing in our data warehouses**. It supports real-time data synchronization, which allows us to build real-time data warehouses.
*   **It is highly scalable and can be linearly scaled to cope with the growing data volume of data warehouses**. Technically, a data warehouse not greater than 100 TB in size will not hit the performance ceiling of OceanBase Database in terms of storage and computing.
*   **It provides the OLAP service for report generating and API queries**, and supports ACID and data writes. With OceanBase Database, we no longer need to manually input data on our reporting platform. It also well handles batch processing in data warehouses and provides a pack of OLAP features, allowing us to tackle various tasks in one technical stack.
*   **It provides more powerful SQL engines to implement complex logic**.
*   **It supports multitenancy**, which means we can separate the applications of data warehouses for each tenant and isolate their resources, thereby providing better user experience.
*  **It comes with a natively distributed high-availability architecture, which supports the three-replica deployment mode, making our data warehouses safer**.
*   **It is empowered by multiple support tools**:
*   **OceanBase Migration Service (OMS)**: We have requested its support for data synchronization from Oracle data sources. If supported, we can replace DataX and other data extract-transform-load (ETL) tools with OMS for data migration.
*   **OceanBase Deployer Center (ODC)**: ODC is a great alternative to tools such as CDH Hue and DBeaver for data access and provides user experience equal to that provided by the original vendor. ODC also supports web clients and will soon support Nginx-based request forwarding, so that we can try taking the frontend computer out of our system.
*   **OceanBase Cloud Platform (OCP)**: OCP provides user-friendly permission control features, and makes it easy to get started in resource and tenant management. It allows us to push forward the long-suspended lab project.
*   **The open source community provides reliable and convenient support and a variety of resources** and is maintained by the official technical team of OceanBase Database. You can share ideas about initiative features and work with community members to promote the development. You can also submit feature requests to Ant Group. They will schedule the development if the requested features are generally expected. In addition, the community provides **abundant learning resources**, such as documents, videos, blogs, and offline activities. You can also take training and certification tests.

  

  

  

**Product Testing and Verification**

  

After the technical solution was finalized, we conducted production-level tests on the features, performance, and compatibility of OceanBase Database.

  

We first verified its features mainly by examining the completeness of its SQL syntax and functions.

  

Compared to Hive, OceanBase Database is fully compatible with MySQL syntax and supports a large number of window functions, which is great to our business. Most scripts migrated from Hive can run directly in MySQL tenants of OceanBase Database. That is, we need to **modify only a little part of the code**. Over 90% of the code was migrated from the data center of our Investment R&D Department to OceanBase Database with zero modifications. The remaining less than 10% of the code was modified mainly due to the difference in functions. For example, OceanBase Database does not support covariance functions and we wrote new code by ourselves.

  

Compared to Oracle, MySQL tenants of OceanBase Database show more differences. In this case, you need to use OceanBase Database Enterprise Edition and create Oracle tenants to take care of the Oracle-specific functions and special dialects.

  

When it comes to the performance test, as **we migrated a large number of small scripts to OceanBase Database, the overall runtime was about 30% less than that of CDH**. Small scripts are not much of an advantage of OceanBase Database over Oracle. However, the distributed HTAP capabilities of OceanBase Database allow us to run a large number of concurrent OLAP tasks. In addition, the data storage space occupied in OceanBase Database is significantly lower than that in Oracle. **Our data of about 8 TB in the Oracle database occupies roughly 2.4 TB in OceanBase Database**.

  

As for the compatibility test, we connected to OceanBase Database by using MySQL drivers and it worked seamlessly with our ETL and scheduling tools, data synchronization tools, report applications, and the DataAPI platform, which operated in different environments. We ran into a little problem in that process and OceanBase Technical Support solved it by replacing the involved MySQL driver with another version.

  

  

  

**Migration Solution and Application Modification**

  

Our original system architecture consisted of Oracle and CDH. We must migrate data from Oracle and CDH instances to OceanBase Database. Now, let's share the lessons we learned in the migration process.

  

First, when migrating data from CDH to OceanBase Database, we batch processed the CREATE TABLE statements by using Hive metadata.

*   **We converted the STRING data type to the VARCHAR(200) data type by default**. Some special or extra-long fields were manually processed.
*   Due to the limitations of OceanBase Database on table partitioning for each node, **it is not recommended to create a large number of partitions as in a Hive data warehouse**. Instead, we partitioned only special large tables. We created indexes on tables storing no more than 10 million rows of account records to accelerate the query, and partitioned larger tables based on the date and data source.

  

OceanBase Database does not support the LOAD DATA LOCAL mode, which brought inconvenience to our business migration from a Hadoop distributed file system (HDFS). So, we had to batch export data from tables in the ORC format to TXT files by running the hive -e command, and then used obloader to import data to OceanBase Database.

  

**Second, the data in our Oracle database was migrated to a MySQL tenant of OceanBase Database in offline mode**. The challenge mainly lies in the differences between the Oracle and MySQL syntaxes and SQL functions. So, we adapted the Oracle-based query syntax to the new MySQL tenant where necessary.

  

**Third, our original solution did not involve a primary replica, or leader**. As a result, intensive cross-node data interactions during the batch processing task led to excessive remote procedure calls (RPCs), which caused errors. This was the biggest challenge in our migration project. Then, we specified a leader, reduced RPCs in INSERT operations, and made full use of hints, a handy feature for OLAP tenants. If we didn't use hints to handle OLAP tasks, we couldn't experience the powerful HTAP capabilities of OceanBase Database. To be specific, **after we added hints, the execution time of SQL scripts in OceanBase Database was stunningly reduced from 40 minutes to 6 minutes**.

  

**Last but bot least, OceanBase Database works in OLTP mode by default** and we must adjust many parameters for it to handle OLAP tasks more efficiently. So, we hope OceanBase can improve the features of OCP for tenants in different modes, so that users can quickly configure their OLAP tenants.

  

  

  

**Business Feedback**

  

Now, we own a database with an integrated architecture, a well-defined O&M solution, and a wealth of support tools. OceanBase Database almost ticks all the boxes that we are looking for in a database. **With much less O&M workload, we are able to pay more attention to the value of data itself**. And with the help of the OceanBase ecosystem, we have created more valuable data applications.

  

**Thanks to the HTAP capabilities of OceanBase Database**, we can manage our manually recorded data, warehoused data, and some application data in the integrated architecture of OceanBase Database, which **not only saves the resources for real-time synchronization, but also allows parameters that are manually modified in the business system to take effect on various business modules in real time**. Also, the Browser/Server architecture and the clear permission management mechanism of Web ODC allow us to share model data, the latest information, and part of OceanBase Database's computing resources directly to members of various business lines, which greatly improves the efficiency of data usage.

  

  

  

**Summary**

  

We would like to extend our thanks to OceanBase community members for their help in our database selection, data migration, and business switchover to the new system. A few humble suggestions:

  

**OceanBase Database is new and needs to provide more scenario-based solutions**. For example, our data service scenario requires many database features, such as data synchronization, data processing, data scheduling, metadata management, data storage, and data desensitization. To meet requirements in this scenario, OceanBase Database can offer an exemplar technical framework solution that integrates all the features mentioned above.

  

**In addition, we are looking forward to more OLAP features of OceanBase Database**, such as external tables, materialized views, and cross-tenant data access. We also hope that ODC supports connections from data sources such as Hive, Oracle, MySQL, and other data warehouse tools or databases.

  

To conclude, we sincerely wish OceanBase Database a better future.

  

Follow us in the [OceanBase community](https://open.oceanbase.com/blog). We aspire to regularly contribute technical information so we can all move forward together.

  

Search 🔍 DingTalk group 33254054 or scan the QR code below to join the OceanBase technical Q&A group. You can find answers to all your technical questions there.

  

![](https://gw.alipayobjects.com/zos/oceanbase/f4d95b17-3494-4004-8295-09ab4e649b68/image/2022-08-29/00ff7894-c260-446d-939d-f98aa6648760.png)