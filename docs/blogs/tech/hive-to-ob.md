---
slug: hive-to-ob
title: 'From Hive to OceanBase Database: Building an Efficient Real-Time Data Warehouse'
---

> **About the author:** coolmoon1202, a senior big data engineer working on high-performance software architecture design.

Our business is highly related to travel, and we began searching for new data warehouse solutions due to the high latency and low efficiency of our original data warehouse, which was deployed in the early days of our company. In this article, I will share with you the story of our solution selection and lessons learned. It would be great if you could find something useful.


**Issues of the Previous Solution**

  

Our online business environment mainly involves data statistics and analysis. Most data is collected from two sources. In the original architecture, real-time streaming data was collected from the frontend application and stored in Kafka. Then, Spark Streaming tasks would be launched every 10 minutes to synchronize data from Kafka to the Hive data warehouse. A huge amount of real-time streaming data would be collected, and the tables related might contain as many as tens of billions of records.

Another major data source was a government-managed public data sharing and exchange platform. Data was collected from the platform, aggregated, and stored in an RDS database. Then, Spark tasks would be periodically launched to fully synchronize the data to the Hive data warehouse. Less data was collected from the platform. The largest table related might contain tens of millions of records. Data from different sources was aggregated in Hive, and then Spark would read the data and transfer it to the big data cluster for analysis.

**This Spark + Hive solution caused three challenges**.

  

**1. Data latency**: Data was imported into Hive periodically, which led to a data latency of greater than 10 minutes, making real-time updates impossible.

  

**2. Architecture complexity**: Full data was periodically imported from RDS to Hive, and it was slow. It took over 3 minutes to import a table with tens of millions of records.



**3. Poor cost efficiency**: Our original architecture used Spark to read data from Hive for analytical statistics. It took more than 3 minutes to analyze 100 million records. Using Spark for periodic data import and analysis consumed significant CPU and memory resources of the big data cluster, leading to queuing of concurrent tasks.

To address those challenges, we decided to try a lightweight real-time data warehouse solution. Among others, OceanBase Database had its reputation as a homegrown native distributed database for its hybrid transaction and analytical processing (HTAP) capabilities and features that enable a real-time data warehouse, such as real-time writing, updating, and analysis of massive amounts of data. So, soon after we learned that it had been open source since June 2021, we tested its performance using OceanBase Database Community Edition V3.1.1. Details of the test are described in this article: Stress Test Results of OceanBase Database Community Edition V3.1.1. Note that the test results are for reference only.

**Here is our conclusion**: In the testing environment, OceanBase Database achieved a maximum of 355,739 tpmC under TPC-C conditions, and completed all SQL queries in 24.05 seconds under TPC-H conditions. The results proved the extraordinary performance of OceanBase Database Community Edition V3.1.1 in online transaction processing (OLTP) and online analytical processing (OLAP), and indicated that it could be scaled out to cope with most high-concurrency scenarios involving massive data.

  

We also tested TiDB and PolarDB-X. In comparison, OceanBase Database Community Edition did the best job in the TPC-H performance test and under our real business workload. Another convincing factor was that, OceanBase Database is backed by an open source community that provides excellent technical support.

**Deployment and Benefits of the New Solution**

  

Based on our evaluation, we replaced the Hive + Spark solution with an OceanBase + Flink solution, and deployed an OceanBase cluster in a 3-3-3 architecture using OceanBase Database Community Edition V3.1.3.

  

*   **Hardware configuration**: 9 Elastic Compute Service (ECS) instances are used, each with 32 CPU cores, 128 GB of memory, a 500 GB SSD for storing redo logs, and a 4 TB SSD for storing data.

  

  

*   **Resource allocation**: The OBServer memory limit is 102 GB, the system memory size is 30 GB, and the OceanBase Database Proxy (ODP) memory size is 4 GB. After deploying the OceanBase cluster, we set resources for the sys tenant to 4 CPU cores and 4 GB of memory. Then, we created a business tenant, and allocated 26 CPU cores and 64 GB of memory to it. We also set the primary\_zone parameter to RANDOM, so that leader partitions of the business tenant tables are randomly distributed across the 9 ECS instances.

  

We deployed the OceanBase cluster using OceanBase Deployer (obd) instead of using OceanBase Cloud Platform (OCP) as planned, because OCP installation depends on OceanBase Database. The good news is we can use OCP to easily take over the cluster later. The following figure shows the topology of the OceanBase cluster.

  

![](https://gw.alipayobjects.com/zos/oceanbase/e4b5cfe6-b452-4386-a1a5-094df5a5d49b/image/2022-11-03/30b8a7c8-690a-454a-8e5a-bbfb6dcc3673.png)

  

**The OceanBase + Flink solution has brought the following three major benefits.**

  

**Smaller end-to-end latency**. The new solution uses the OceanBase SQL mode for data querying and analysis. From data generation by the frontend application to OceanBase Database returning a query result, the time consumed is reduced from at least 10 minutes to less than 3 seconds.

  

**Significant hardware cost savings**. The new solution uses Flink CDC to synchronize incremental data to OceanBase Database in real time, and the resource usage of incremental streaming tasks changes smoothly rather than sharply. In the session mode of Flink, incremental streaming tasks occupy much fewer resources, slashing the resource usage of the big data cluster from 140 CPU cores and 280 GB of memory to 23 CPU cores and 46 GB of memory, which translates to an 84% reduction in hardware costs.

  

**Shorter SQL query time**: The new architecture allows us to enable parallel distributed SQL execution by specifying hints. As a result, the execution time of the following query, which involves roughly 60 million records, is reduced from 3 minutes to 15 seconds: 
```sql
select /*+ parallel(36) */ count(1) from health_query_log where datetime >='2022-05-01 00:00:00' and datetime<='2022-06-01 00:00:00';
```

**Summary**
----------------------

Now, let me share with you some experiences in using OceanBase Database Community Edition.

  

**1. A table index can be quickly created and deleted.** You can create indexes as needed to greatly improve data retrieval efficiency.

  

**2. A variety of window functions** are provided for you to handle complex queries and statistical jobs.

  

**3. JSON data types are supported.** You can extract the required JSON data and create virtual columns. This is a very useful feature as you don't need to rerun historical data when upstream data structures change.

**4. We strongly recommend you use the TableGroup feature, which improves the query speed, especially for multi-table joins.**

**5. OceanBase Database Community Edition is compatible with most features and syntax of MySQL 5.7, greatly reducing the learning curve for developers.** The data synchronization from the RDS database was quite smooth.

We have also noticed some features that are not supported by V3.1.3 or may be supported in later versions, and have submitted them to the community for further update.

**1. Full-text indexes are not supported.** When you perform a fuzzy match query on Chinese strings, the database runs a full table scan. In a MySQL database, for example, if you want to use incomplete address information to perform a fuzzy match query, you can use a FullText index to enhance query performance. However, to do that in OceanBase Database Community Edition V3.1.3, we could only use a LIKE clause as a workaround. We discussed this issue with the OceanBase technical team, and they planned to support full-text indexes in later versions.

  

**2. Materialized views are not supported**. Therefore, you cannot query a large table (with hundreds of millions of records) to get real-time incremental statistics. For example, if you query a large table using the COUNT() function with the GROUP BY clause, the database performs full data calculations, instead of using pre-calculated data of materialized views to reduce the calculation load. This results in unsatisfactory performance in some scenarios. If real-time statistics on massive data are required for your business, you have to seek alternative solutions.

  

**3. Out-of-memory (OOM) errors may occur during execution**. Using the COUNT() function with the GROUP BY clause may cause OOM errors of OBServer nodes, leading to node failures. This issue can be avoided by rewriting the subquery, such as 
```sql
SELECT COUNT(*) FROM (SELECT DISTINCT ...)
```

  

We would like to extend our thanks to the technical staff of the OceanBase community for their professional support in our real-time data warehouse transformation project. They were patient and timely responsive to all our questions throughout the project, from deployment to testing, migration, and O&M. They also offered suggestions on optimizing slow SQL statements, thus helping ensure the smooth progress of the project. We wish the OceanBase community a brilliant future.