---
title: Introduction
weight: 1
---

> Keywords: T + 0 HTAP | distributed execution framework | support for multi-model scenarios
>
> Hybrid transaction and analytical processing (HTAP) is a highly expected database capability. With its distributed architecture, OceanBase Database can process transactions while handling analytical tasks such as data analysis and batch processing. Online analytical processing (OLAP) and online transaction processing (OLTP) are supported by the same set of engines to implement two sets of system features. Transactions and real-time analysis are provided by the same system, and one copy of data is used for different workloads. This fundamentally ensures data consistency and minimizes data redundancy, thereby significantly reducing the costs.

## HTAP Scenarios
Business scenarios of enterprise applications can be roughly classified into OLTP and OLAP.
![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/01_introduction/001.png)


Many enterprises tend to deploy multiple database products to support OLTP and OLAP scenarios separately. In this solution, data needs to be transmitted between two systems. Data synchronization inevitably causes latency and introduces the risk of data inconsistency. Redundant data is generated in the two systems, increasing the storage costs.
![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/01_introduction/002.png)



## Current Status and Challenges of the Industry
- Poor real-time performance of offline data warehouses: Typically, an offline data warehouse can provide only T+1 data capabilities and poor data update performance. As a result, requirements such as real-time analysis and membership marketing of online business teams cannot be met in a timely manner. It is complex for small- and medium-sized enterprises to separately build a real-time data warehouse. In addition, extra manpower must be invested to maintain the data synchronization link.

- Poor isolation of HTAP: The core of HTAP lies in supporting multiple types of loads by using one set of engines. If resource isolation cannot be ensured, the database intended for key transactions can be affected by analytical and batch processing business. This directly leads to decline of online transactions and business stability.

- Sole capabilities of the conventional primary/standby architecture: In the read/write splitting solution based on primary/standby replication, a standby node can process only read-only queries and does not support batch processing. The real-time data performance is closely related to the synchronization latency. Real-time data consistency cannot be ensured in the case of a large number of transactions or DDL operations. The SQL optimizer has limited capabilities and is incompetent for complex multi-table analysis across shards.



## Solution

- OceanBase Migration Service (OMS), which supports multi-table aggregation and synchronization, is used to synchronize data from tables of a heterogeneous database to native partitioned tables of OceanBase Database.

- Multiple instances are merged into one instance after being migrated to OceanBase Database. This eliminates the need for middleware maintenance and greatly improves the storage scalability.

- In HTAP mode of OceanBase Database, business analysis and queries as well as real-time marketing and decision analysis can be directly performed in the online database, without the need for T+1 data.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/01_introduction/003.png)

## Solution Advantages
- High data update performance: Based on the powerful update capabilities as a relational database, OceanBase Database achieves a millisecond-level ultralow synchronization latency between replicas.

- Integrated HTAP: OceanBase Database uses one set of engines to accommodate OLTP and basic OLAP scenarios, and implements reliable resource isolation between OLTP business and OLAP business based on resource groups. This way, no real-time data warehouse needs to be built.

- Distributed parallel computing engine: The powerful SQL optimizer and executor support vectorized computing, as well as parallel computing and analysis of massive amounts of data.

- Support for multi-model scenarios: OceanBase Database is fully compatible with the syntax of MySQL. It also supports HBase-compatible APIs and TableAPI as well as semi-structured JSON data. OceanBase Database provides powerful Change Data Capture (CDC) capabilities to support data consumption by different types of downstream systems.

- Flexible dynamic scaling: A single OceanBase cluster can contain more than 1,000 nodes and store data at a level higher than PB.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/01_introduction/004.png)

OceanBase Database uses Flink CDC as the streaming engine and leverages PL/SQL stored procedures in combination with job packages to handle batch processing tasks, thereby implementing data integration and data modeling in an integrated manner. It also implements collaboration between data and business and ensures time efficiency based on the vectorized engine and multi-replica architecture.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/01_introduction/005.png)

## Cases

### Sinopec

#### Business challenges
- The original fuel card system failed to support the Internet-based marketing service and business mode innovation. A next-gen smart gas station is expected to be built by using novel technologies to transform Sinopec into an all-around life service provider.

- As more types of data are more profoundly applied and utilized in a wider range of sectors, new features are expected from a database. The original heterogeneous and dispersed database failed to meet the transformation requirements for low systemic risk, easy management and O&M, and business innovation.

#### Solution
- Based on the powerful HTAP capabilities of OceanBase Database, technologies such as read/write splitting and resource isolation are used to implement load balancing and improve OLAP performance. The OLTP performance is improved by using the log-structured merge-tree (LSM-tree) architecture of the storage engine and technologies such as early lock release (ELR) of the transaction engine.

- The original fuel card system consists of 23 standalone Sybase and Oracle databases, which are operated and maintained by respective provincial branches. The solution aggregates those standalone databases into one distributed OceanBase cluster whose architecture integrates data, platform, and applications.

- OceanBase Database is highly compatible with conventional centralized databases and helps Sinopec migrate its applications from original databases without data loss. A transition solution is provided to minimize business interruptions.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/01_introduction/006.png)

#### Customer benefits

- Transformation: Users can receive e-coupons and discounts instantly and choose a payment method from multiple options, which is a great step towards transforming Sinopec into an all-around life service provider.

- Efficiency improvement: OceanBase Database empowers Sinopec to provide the fuel card service for about 30,000 gas stations around China. The time consumed for uploading transaction records is reduced from almost one day to a few seconds, meeting the need for daily job handover and reporting. The data query time is shortened from several minutes to several seconds. Up to 50,000 business transactions can be carried out per minute.

- Cost reduction: As 23 separate databases are aggregated into one OceanBase cluster, the software, hardware, and O&M costs are greatly reduced. The storage cost is slashed by 8 times.

- High reliability: The time consumed for failure recovery is decreased from hours to minutes, the business continuity reaches 99.99%, and security requirements in MLPS 2.0 are met.



### Other cases

+ KUAYUE EXPRESS (KYE): [https://open.oceanbase.com/blog/27200135](https://open.oceanbase.com/blog/27200135)
    - Industry: logistics
    - Pain points: MySQL cannot meet the increasingly complex analysis and processing requirements. TiDB, OceanBase Database, StarRocks, and Doris are considered in terms of online scaling, load balancing, and other maintainability metrics. Either TiDB or OceanBase Database will be chosen.
    - Benefits: Both the real-time and offline data query performance of OceanBase Database is five times that of TiDB, and the storage cost is 1/5 that of TiDB. Moreover, OceanBase Database has a few components, enabling easy maintenance.

+ Zuoyebang: [https://open.oceanbase.com/blog/8811965232](https://open.oceanbase.com/blog/8811965232)
    - Industry: education
    - Pain points: MySQL cannot support real-time data analysis requirements.
    - Benefits: Zuoyebang tested the performance of OceanBase Database in a typical scenario, where a dataset of more than one million rows was used for 10 to 20 concurrent aggregate queries. The test results showed that OceanBase Database responded to analytical queries within milliseconds, demonstrating performance dozens of times better than MySQL Database without impacting core transaction processing (TP) performance.

+ ClassIn: [https://open.oceanbase.com/blog/27200134](https://open.oceanbase.com/blog/27200134)
    - Industry: education
    - Pain points: Bottlenecks occur in read and write performance. During the COVID-19 pandemic, the traffic of online classroom business surged. As standalone databases such as MySQL do not support smooth horizontal scaling like distributed databases, many online clusters had obvious bottlenecks in reads and writes.
    - Benefits: The actual online traffic was introduced to test clusters. The optimizer of TiDB was unstable and had indexing errors. The CPU utilization and latency of TiDB frequently fluctuated obviously. On the contrary, the CPU utilization and latency of OceanBase Database were very stable.

+ Yunli Smart of China Unicom: [https://open.oceanbase.com/blog/5244321792](https://open.oceanbase.com/blog/5244321792)
    - Industry: government enterprises and network operators
    - Pain points: The big data processing system contains too many components. Hive depends on Hadoop, Hadoop Distributed File System (HDFS) is used for data storage, YARN is used as the resource management framework, and Tez is used to optimize directed acyclic graph (DAG) tasks of Hive, making O&M difficult.
    - Benefits: The architecture of OceanBase Database is simple and contains only OBServer nodes and OceanBase Database Proxy (ODP). If tens or hundreds of clusters are to be deployed and maintained, OceanBase Database is a better choice in terms of configuration, deployment, and O&M. OceanBase Database improves the data governance efficiency from a minute level to a quasi-real-time level. OceanBase Database outperforms Hive in terms of latency in scenarios with small amounts of data. In TP scenarios, OceanBase Database with an HTAP engine is superior to Hive, which is based on a single AP engine.
    - Video: [Evolution Path of the Real-time Data Warehouse for Yunli Smart of China Unicom](https://www.oceanbase.com/video/9001367)

+ Hwadee: [https://open.oceanbase.com/blog/6776731648](https://open.oceanbase.com/blog/6776731648)
    - Industry: Internet
    - Pain points: The data computing platform was built based on the Hadoop ecosystem. It comprised too many components, leading to complex building and high O&M costs. What's worse, troubleshooting was difficult in this complex environment.
    - Benefits: The architecture is greatly simplified, enabling easy O&M and lowering the costs. The OBServer nodes are peer-to-peer, and each contains a storage engine and a computing engine. OceanBase Database boasts a small number of components, simple deployment, and easy O&M. With OceanBase Database, we no longer need to add other components to the database to achieve high availability and automatic failover.