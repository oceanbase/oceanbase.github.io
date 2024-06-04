---
slug: kuayue-express
title: 'KUAYUE EXPRESS —— In the real-time warehouse scenario, utilizing OceanBase to make up for the shortcomings of MySQL and StarRocks'
tags:
  - User Case
---

Introduction: This article is based on the speech made by Zhang Jie, Big Data Architect of KUAYUE EXPRESS (hereinafter referred to as KYE), at the DTCC conference. The speech introduced the pain points faced by KYE in data analysis and the company's ideas and practices in the development of its query engine solution.

Hello everyone. I'm Zhang Jie, a Big Data Architect at KYE. Today, I want to talk about how we selected our query engine for HTAP scenarios. My talk will be divided into four parts:

1. Business background and the pain points encountered in daily data analysis in the logistics industry
2. Our considerations and product testing for query engine selection
3. Our benefits from using OceanBase Database
4. Our experience in using OceanBase Database Community Edition V4.0

<!-- truncate -->

**Business background of daily data analysis in the logistics industry**

In the Internet industry, data may be directly oriented to consumers and end users. But at KYE, we mainly serve our internal employees. Every day, more than 100 BI developers intensively use our big data platform for development. We have built more than 10,000 data service interfaces, which are called by various production systems through gateways. We handle tens of millions of calls per day, and the various data services we provide support the daily work of more than 50,000 employees throughout the entire group. To ensure a good user experience, we have high requirements for interface latency. Basically, the 99th percentile latency is required to be less than 1 second.

![](https://gw.alipayobjects.com/zos/oceanbase/1a31d7a2-e247-43fb-bce9-46ca43585e11/image/2022-12-28/1258e2ef-7ee1-456c-bc95-5284d117052b.png)

In addition to online analytical processing (OLAP) scenarios, our data services also provide key data in core business processes, such as performance and salary query, waybill cost allocation, and real-time waybill tracking. The actual revenue of each waybill is not fixed. Therefore, a large number of users, such as drivers and operators, query their daily revenue by using our interfaces, including the costs of each waybill and the real-time tracking information of each waybill. All of this data comes from the big data platform.

In the logistics industry, core analysis scenarios all concern waybills. Waybill analysis requires data from dozens of upstream enterprise resource planning (ERP) systems, including transportation management, customer management, and performance management systems. This data is converged on the big data platform. The big data platform collects, merges, and calculates all upstream data related to waybills, qualifies the data for waybill domains of our data warehouse through complex analysis and processing, and then provides the data to the users of various platforms and services.

With the rapid development of the company business, database application scenarios are becoming more and more complex. In the early stage, users queried results based on fixed parameters, for example, by day, week, or month, or with fixed conditions. Back then, we could preprocess data and place the data aggregation results in MySQL Database so that users could directly find the results they were looking for. Today, user needs are becoming increasingly complex. They want to query data by any field and any time range. In this case, MySQL Database no longer meets our needs.

**Our business scenario has changed in the following aspects:**

1. More table joins

   In the past, we could prepare a single wide table in advance to serve users. As requirements change more frequently, a query interface may involve dozens of table joins.

2. Higher requirement for real-time performance

   In the past, users could accept our offline and batch data updates. Now they require real-time data updates, including the real-time status of each waybill. This imposes higher requirements on real-time data processing for downstream databases.

3. Higher requirements for latency

   Previously, users could wait 3 to 4 seconds for data results. Now users require a response to data requests within one second.

To address these new business requirements, we need to select a more suitable database solution. To improve user experience and real-time performance, the new database must provide **exceptional query performance** and **support real-time writes, updates, and deletion**. The database must also be easy to use, so **standard SQL support and rich functions** are essential. It would be even better if it was **highly compatible with MySQL**. In addition, the database must allow **data to flow in and out**, and its data integration feature must support data sources in our usage scenarios. **Database stability and maintainability** are also important factors that concern us.

**Database tests: performance and feature comparison of five databases**

The following performance testing and feature testing results explain why we chose OceanBase Database from among other distributed databases.

**Performance testing**

A unified test comparison standard is essential for database evaluation and selection. Common benchmark tests in the industry include TPC-H, TPC-DS, and SSB. Every database product provides these benchmark test results in the official documents. We used these test results for reference in database selection. However, we cannot solely rely on these test results because they do not account for our business characteristics and the test sets are usually specially optimized for the tests. Therefore, we built a set of benchmark standards based on our own data analysis requirements. This set of benchmark standards adopts a unified test model and environment, and defines unified tests based on the SSD disks of Alibaba Cloud.

We prepared a standard data set of more than a dozen tables related to waybills, and compiled a set of standard SQL statements in accordance with our daily application scenarios based on actual waybill analysis cases. We also developed a feature test set based on our actual needs. Then we carried out benchmark tests with these test data sets on different databases available on the market.

After preliminary screening, we selected five popular commercial query engines for testing and comparison. They were TiDB, OceanBase, StarRocks, Doris, and Trino. The following figure shows the performance test results.

| SQL No | SQL description                                                             |
| ------ | --------------------------------------------------------------------------- |
| SQL 21 | SQL heavily relying on CPU for computation                                  |
| SQL 19 | Multi-table join aggregation with high cardinality in Snowflake schema      |
| SQL 18 | Multi-table join aggregation with high cardinality in Star schema           |
| SQL 17 | Multi-table join point query in Snowflake schema                            |
| SQL 16 | Multi-table join point query in Star schema                                 |
| SQL 15 | Large table join aggregation with high cardinality                          |
| SQL 14 | Large table join aggregation with low cardinality                           |
| SQL 13 | Large table and small table join aggregation with high cardinality          |
| SQL 12 | Large table and small table join aggregation with low cardinality           |
| SQL 11 | Large table and small table join point query with index miss                |
| SQL 10 | Large table and small table join point query with index hit                 |
| SQL 9  | Range scan on a non-indexed datetime column                                 |
| SQL 8  | Aggregation on high cardinality column                                      |
| SQL 7  | Aggregation on low cardinality column                                       |
| SQL 6  | Window functions                                                            |
| SQL 5  | ORDER BY with LIMIT                                                         |
| SQL 4  | ORDER BY                                                                    |
| SQL 3  | Point query with filter condition as IN clause containing a thousand values |
| SQL 2  | Point query with index miss                                                 |
| SQL 1  | Point query with index hit                                                  |

![](https://gw.alipayobjects.com/zos/oceanbase/08b1c279-4af3-4f55-aa09-9e4e98c56bb0/image/2022-12-28/6d1cb039-34c7-48f4-a75d-669e358e0eee.png)

We can see that, in pure OLAP scenarios, StarRocks has the best performance. To our surprise, OceanBase Database came in second. Before we tried OceanBase Database, we tested TiDB, whose performance was far inferior to StarRocks. Therefore, we didn't expect much from the performance of HTAP databases. However, after the testing on OceanBase Database was completed, we unexpectedly found that its performance in OLAP scenarios was also good.

**Feature testing**

In addition to the performance tests, we also tested and verified the general features of the databases. The test results show that HTAP databases have richer features, and one HTAP database can be basically considered a collection of several distributed MySQL databases. Despite their slight differences, these HTAP databases all support updates, deletion, indexed column customization, and consistency guarantees.

- **Big data ecosystem integration**. Our business scenarios primarily involve waybill analysis. Therefore, we must consider the integration of databases with big data platforms. In this regard, StarRocks and Doris are the clear winners.
- **Maintainability.** We are primarily concerned with online expansion, online upgrade, automatic balancing, resource isolation, and management tools. HTAP databases perform better in these areas. Among them, OceanBase and TiDB were the best. For example, OceanBase provides OceanBase Cloud Platform (OCP), and TiDB provides TiUP. Both can help us easily deploy, upgrade, monitor, and maintain the corresponding databases.

After comprehensive comparison, we concluded that MySQL is a transaction processing (TP) database that is widely used in our business, and its strengths are stability, transaction processing, and concurrency capabilities. StarRocks is an analytical processing (AP) database that is widely used in our analysis scenarios. StarRocks boasts a distributed architecture, good AP analysis performance, and a high compression ratio due to columnar storage. StarRocks provides a good solution to our requirements in pure analysis business scenarios. However, in addition to TP scenarios and AP scenarios, we have many businesses that require databases with both TP and AP capabilities, such as real-time waybill analysis. HTAP databases, such as OceanBase Database and TiDB, can support these scenarios.

We carried out **a further round of testing and comparison between OceanBase Database and TiDB** and found that:

- The performance of OceanBase Database is 4x to 5x higher than that of TiDB in all scenarios.
- OceanBase Database has a simpler architecture and integrates storage and computing. It needs only observer and obproxy processes. However, TiDB requires multiple services such as PD, TiDB, TiKV, and TiFlash, resulting in higher complexity during subsequent maintenance and troubleshooting.
- OceanBase Database is more advantageous in data storage space because it supports hybrid row and column storage and supports AP and TP scenarios with the same set of data. In contrast, TiDB needs another set of data stored in the columnar format generated with TiFlash to support AP scenarios, so the data storage space is doubled.

In view of this, we chose OceanBase Database to help us solve business pain points in real-time analysis scenarios.

**Our benefits from using OceanBase Database**

After we decided to use OceanBase Database, we carried out the following tasks.

**First, we verified the data integration links**

**Verification of offline data synchronization.** We use the Sqoop tool to synchronize data from Hive to OceanBase Database in batches. When we write data to a 220-field wide table in a 3-node OceanBase cluster at a degree of parallelism (DOP) of 50, the write performance is 2 million rows per minute, which meets our requirements for offline batch data synchronization.

**Verification of real-time data writing.** Based on our real-time computing platform, we use Flink JDBC Connector to write upstream data from Kafka and other sources into OceanBase Database in real time. The real-time write performance is 0.15 million rows per minute for a 220-field wide table with 10 partitions. Limited by the implementation of the JDBC connector, the real-time performance is far inferior to offline performance, but can still meet our requirements for real-time synchronization of incremental data. The OceanBase community will launch Flink OceanBase Connector in January 2023, which has been comprehensively optimized in terms of write and concurrency performance. We will verify it as soon as possible. We believe that its performance will be better than that of the native Flink JDBC Connector.

OceanBase also provides OceanBase Migration Service (OMS), which can synchronize incremental data to Kafka in the Canal format in real time, so that downstream systems can consume the incremental data. The AP database that we are currently using does not support this feature. It can be of great help to us in secondary real-time data computing as well as data backup and disaster recovery.

**Second, we explored upgrading the waybill analysis architecture**

After data link verification, we run a trial to upgrade the waybill analysis architecture. The following figure shows our original waybill analysis architecture, which was basically an offline processing architecture. The basic upstream waybill data was synchronized from binlogs to Kafka through Canal. The data of multiple topics was written into different Hive tables through our in-house platform. The tables were merged and processed on a two-hourly or daily basis to generate a final waybill wide table for business teams.

![](https://gw.alipayobjects.com/zos/oceanbase/f981915a-ab34-4739-b160-01db66a38944/image/2022-12-28/6a627b5a-8bd0-40a3-9231-1dd51abedfa0.png)

This architecture had two main problems: First, the timeliness of data was poor. Data was processed offline, so it was already at least two hours old. Second, the analysis performance was poor. We carried out waybill analysis based on Presto. The analysis generally took about 1 to 10 seconds, and even longer for more complex analysis. This was hard on our business teams, but we were limited by the technology at that time.

Currently, we use an upgraded architecture based on this earlier version, with HBase carrying out real-time aggregation of waybill wide tables and the CDC capability of HBase synchronizing the merged data to StarRocks in real time. This is a significant improvement. Offline data is turned into real-time data, and the performance of real-time waybill analysis based on StarRocks has also been greatly improved.

![](https://gw.alipayobjects.com/zos/oceanbase/3ec17c7c-652f-4964-8a6f-058a22537e64/image/2022-12-28/1d94b7d2-204d-4f90-8874-426b107ca4f3.png)

However, we encounter several problems after the launch of the upgraded architecture:

- The solution is too complex and hard to reuse.
- The data link is long, resulting in difficulties in troubleshooting data synchronization problems.
- The maintenance costs are high.

Therefore, we tried to optimize the current architecture with the AP capabilities of OceanBase Database. We use OceanBase Database to help us further solve problems in real-time waybill analysis. During the test, we used Flink JDBC Connector to directly write the upstream waybill data of multiple tables into OceanBase Database, and merged the multi-field data of the waybill wide tables in OceanBase Database in real time.

![](https://gw.alipayobjects.com/zos/oceanbase/52ff144b-0eae-4c4a-9ab3-caad91f4a341/image/2022-12-28/15bd01c5-0e8b-46b1-a4cf-8a85c15843e3.png)

Based on the excellent AP capabilities of OceanBase Database, we connected the waybill wide tables to the external analysis system. The analysis performance was unchanged. The analysis of a 220-field wide table with 20 million rows by using a complex SQL statement took about 4 seconds, and could be further accelerated. Upon testing, we found that we no longer need a complete set of HBase systems, so we were able to **greatly simply the architecture for real-time waybill analysis, reducing the number of components by a third and cutting costs by half.**

- The number of components required for data merging is significantly reduced. This shortens the data link by half and increases the timeliness of data processing. For example, a query that took 5 seconds before now takes only 2 seconds in OceanBase Database.
- The data synchronization link is also shortened, facilitating maintenance and troubleshooting.
- Server costs are also reduced because a complete set of HBase clusters is no longer required.
- The reproducibility of the whole solution has increased, and we can quickly reuse it in other similar analysis scenarios.

**Our experience in using OceanBase Database Community Edition V4.0**

After OceanBase Database Community Edition V4.0 was launched on November 3, 2022, KYE tried out its many new features. This version implements a new distributed cost model and distributed query optimization framework, applies a comprehensive set of parallel pushdown techniques, and enables the development of adaptive techniques. The new version outperforms OceanBase Database Community Edition V3.x significantly, as shown in the following TPC-DS 100 GB benchmark test results.

![](https://gw.alipayobjects.com/zos/oceanbase/92a3f581-1bf7-4e93-92fa-9804bf7ea772/image/2022-12-28/e47eb7bd-9ac2-4d83-83a2-7cccc2da9e1f.png)

KYE has also tested OceanBase Database Community Edition V3.2. The following figure shows the test results and comparison of these two versions.

![](https://gw.alipayobjects.com/zos/oceanbase/10f21275-ffec-45e0-bacb-26200484c28a/image/2022-12-28/a4888a1b-47d6-4a13-8c10-2cfb627d69b0.png)

We can see that almost all SQL sets see performance improvements in the new version, and some are improved by 4x to 5x. In some high-base aggregation scenarios, the performance improvement is 3x to 4x. The overall AP performance is improved significantly.

Compared with OceanBase Database Community Edition V3.2, the new version delivers optimal performance without requiring much parameter optimization. You only need to take the following simple steps:

- Manually perform a major compaction to merge the data and flush it to disk.
- Manually collect table statistics one time to increase the accuracy of the execution plan.
- Set a reasonable number of partitions and DOP based on the number of CPU cores of the OBServer nodes to give full play to the CPU capacity.

**Suggestions for OceanBase**

When using OceanBase, we also found some issues and reported them to the OceanBase community. The first issue is the compatibility of peripheral tools. Tools such as OBLOADER and OMS are not fully adapted to OceanBase Database Community Edition V4.0. The second issue is the performance in some aggregation scenarios. After analysis, we found that we could solve this issue with hints. According to the OceanBase community, these issues will be resolved in the next version.

Finally, I would like to express our gratitude to the OceanBase community team for their help and support.

That's all for me. Thank you.

> Company Profile: Established in 2007, Kuayue Express Group Co., Ltd. is a modern comprehensive express delivery company specializing in time-sensitive delivery services. It provides delivery on the same day, the next day, the third day, the same day in the same city, the next day in the same city, land transportation, and fresh goods delivery services, as well as 24-hour pickup and delivery and one-to-one exclusive services.

Follow us in the [OceanBase community](https://open.oceanbase.com/blog). We aspire to regularly contribute technical information so we can all move forward together.

Search🔍 DingTalk group 33254054 or scan the QR code below to join the OceanBase technical Q&A group. You can find answers to all your technical questions there.

![](https://gw.alipayobjects.com/zos/oceanbase/f4d95b17-3494-4004-8295-09ab4e649b68/image/2022-08-29/00ff7894-c260-446d-939d-f98aa6648760.png)
