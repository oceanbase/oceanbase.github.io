---
slug: CR-Vanguard
title: 'CR Vanguard Upgrades Its Core System Database and Improves System Performance By 70%'
tags:
  - User Case
---

This article is originally published by Vanguard D-Tech on WeChat Official Accounts Platform.

> China Resources Vanguard (CR Vanguard) is an excellent retail chain of CR Group, running business in the Chinese mainland and Hong Kong. Facing its giant business network, CR Vanguard is in an urgent need to strengthen the interconnection of its numerous business lines to adapt to the rapid development of its various interrelated business environments, such as online sales, in-store sales, logistics, and finance.  
> With the rapid development of information technology and the advancement of digital transformation, databases are playing an increasingly important role as the cornerstone for data management and storage. CR Vanguard hopes to provide efficient, reliable, and secure data management solutions through database upgrades, innovative technologies, and intelligent applications. In this article, Vanguard D-Tech's technical team shares their experience in migrating CR Vanguard's database system to OceanBase Database.

Vanguard D-Tech has been actively working to implement the strategic information security plans of the state, CR Group, and CR Vanguard. We have introduced a home-grown database system to provide continuous support for key business and intelligent operations and improve the operational efficiency of business systems. This way, CR Vanguard can provide better services for end consumers in an efficient cycle that brings down costs, boosts efficiency, and ensures compliance. This will help CR Vanguard maintain sustainable development on the complex and changing market, and keep one step ahead amid fierce competition.

I. Conventional Databases and Their Vulnerabilities
--------------

(i) Conventional databases today

Conventional database systems such as MySQL and Oracle have played a valuable role in data storage and processing. However, in response to the trend of data explosion brought about by the popularization of the Internet and mobile devices, many companies choose to improve the performance and capacity of conventional databases by extending their architectures.

(ii) Common MySQL architectures and extended MySQL architectures

Three MySQL architectures are commonly used:

**Master-slave architecture**. This architecture allows users to improve database performance and capacity by replicating data to one or more slave servers.

![1709003527](/img/blogs/users/CR-Vanguard/image/1709003527466.png)

**Sharded architecture**. In this architecture, the database and tables are sharded to achieve horizontal scaling, and data is distributed to multiple database instances.

![1709003536](/img/blogs/users/CR-Vanguard/image/1709003536640.png)

**Read/write splitting architecture**. In this architecture, read requests and write requests are processed on different database instances, which improves concurrency performance.

![1709003545](/img/blogs/users/CR-Vanguard/image/1709003545687.png)

When the business volume increases to a point where none of the preceding three architectures can ensure business stability, users often deploy an extended MySQL architecture to handle performance issues by integrating the capabilities of a sharded architecture and those of a read/write split architecture.

![1709003557](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-02/1709003557083.png)

It is noteworthy that an extended cluster architecture is more complex, leading to soaring O&M and development costs and a variety of challenges, such as the barrel effect, where a fault may drag down the stability of the entire system.

(iii) Vulnerabilities

Conventional databases, while doing a great job in many scenarios, bother users due to some of their vulnerabilities.

*   Performance bottleneck: A conventional database will reach its performance limit soon when it handles a flood of concurrent requests. For example, a MySQL backend database can easily support a monitoring system that consists of hundreds of hosts and works with 10,000-20,000 monitoring metrics. However, when tens of thousands of hosts are working in the system to handle 500,000 or more metrics, severe data delay, sometimes more than 30 minutes, is likely to happen. In this case, the monitoring data is basically useless.
*   Limited scalability: Conventional databases are not scalable enough to meet our growing demand for data processing due to limitations on hardware, such as CPU, memory, and storage. The increasing data volume has caused quite a few issues, such as database performance degradation and extended response time. To ensure the database health, we must keep an eye on the data volume and regularly clear our data, which is actually a compromise on maintaining database performance. For the best of the business, we should keep as much data available as possible.
*   High maintenance costs: The maintenance and management of conventional databases are laborious and consume a large amount of resources.
*   Security issues: The security of conventional databases is usually one of the top concerns. A variety of measures need to be taken to guarantee data security. For example, MySQL databases lack a holistic solution for data backup and recovery. This leads to incomplete backups, lost or corrupted backup files, prolonged recovery time, and other issues. In the middleware-based MySQL architecture, it is tricky to audit and track operations such as user access and data modifications. In most cases, it is difficult to track down the user who initiated a problematic SQL query.
*   Insufficient high availability: Most conventional databases can hardly ensure high availability in the event of a failure, resulting in business interruptions. CR Vanguard has prepared all possible solutions, conventional and novel, for cluster high availability, such as the master-slave architecture, multi-slave architecture, database sharding, and geo-redundancy. In extreme cases, the recovery time objective (RTO) could reach 10 to 30 minutes. In some cases, we needed to manually decide whether to switch the system, and even the whole team had to work together analyzing risky and important database operations and making decisions.

II. Database Selection and Upgrading
---------

Given the aforementioned reasons, CR Vanguard started researching domestically-developed databases, which had drawn so much attention in recent years.

We considered the following factors in database selection.

*   Independent research and development: whether the database is a proprietary product independently developed by a Chinese company that owns its intellectual property rights, and whether the database is compatible with the systems developed by CR Vanguard.
*   Compatibility: compatibility with our existing databases (such as MySQL and Oracle) and systems (such as CentOS and Red Hat) in terms of protocols, data formats, and APIs...
*   High availability: faulty node troubleshooting, disaster recovery, and data backup...
*   Scalability: scaling by adding nodes, data partitioning, and load balancing...
*   Performance: satisfactory read/write speed, concurrent processing performance, and data processing performance...
*   Costs: migration costs, development costs, and host storage costs...
*   Business coupling: adaptability to business applications and performance jitter of SQL execution in different scenarios.

We shortlisted two database products, OceanBase Database and a distributed database system (hereinafter referred to as Database A), and compared their performance, costs, and compatibility in benchmarks and stress tests.

(i) Performance comparison in benchmark tests

To get a fair conclusion, the two candidates featuring different architectures were compared based on a total of 64 CPU cores and 256 GB of memory, regardless of the number of hosts in use. The test results are shown in the following figure:
 

![1709003685](/img/blogs/users/CR-Vanguard/image/1709003685929.png)

Details of the test results are described as follows:

*   In the oltp\_update\_index test, the QPS of OceanBase Database is roughly two times that of Database A in scenarios with different levels of concurrency.
*   In the oltp\_read\_only, oltp\_read\_write, oltp\_update\_non\_index, and oltp\_insert tests, OceanBase Database outperforms Database A by a 40% higher QPS on average in scenarios with different levels of concurrency.
*   In the oltp\_point\_select and oltp\_write\_only tests, both databases have their own strong points in scenarios with different levels of concurrency, showing comparable overall performance.

![1709003708](/img/blogs/users/CR-Vanguard/image/1709003708334.png)  

(ii) Performance comparison in stress tests  

The stress tests were performed in the same environment as the benchmark tests, and the test results are as follows:

![1709003720](/img/blogs/users/CR-Vanguard/image/1709003720277.png)  
OceanBase Database outperformed Database A in the stress tests, delivering twice the write QPS and four times the query QPS, with the latency being only 1/4 of that of its rival.

![1709003734](/img/blogs/users/CR-Vanguard/image/1709003734121.png)

The comparison results indicate that OceanBase Database showed better overall performance. In addition, OceanBase Database could maximize the utilization of storage resources and reduce resource fragmentation, cutting storage costs by about 60% compared to MySQL. Conservatively, OceanBase Database could bring down the total cost of ownership by 30%. As for other features such as compatibility, high availability, and scalability, there was not much difference between the two, as shown in the following figure.

![1709003747](/img/blogs/users/CR-Vanguard/image/1709003747778.png)

III. Migration and Upgrade Solution for a Core System
-------------

After exhaustive system testing, we selected a core business system to upgrade its database.

We first assessed the performance, availability, and scalability of our existing database, and determined the migration objectives and plan. Then, we came up with a detailed migration solution covering data backup, data conversion, node migration, and post-migration testing based on the assessment results. After the migration, we merged the original shards and launched continuous monitoring and maintenance of the new system to ensure that it operates stably and meets our business requirements.

(i) Migration assessment

The system used a middleware-based MySQL database cluster of a sharded architecture, which is shown in the following figure.

![1709003792](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-02/1709003792059.png)

The cluster consisted of 5 master database instances. Each master instance was divided into 10 shards and provided with two slave instances. Master and slave instances were integrated into a logical database based on middleware to achieve read-write splitting. We performed the following steps in the migration assessment.

Step 1: performance estimation. The database contained 15 TB of data produced by the system. The estimated concurrency was 3,000. The top 50 high-frequency SQL statements were monitored in the backend.

Step 2: consideration of availability and scalability. The scalability of our middleware-based MySQL architecture had already been greatly improved. We could quickly increase its capacity and computing power by adding new MySQL clusters and configuring middleware routing settings. However, a short service downtime was inevitable during cluster scaling.

Step 3: evaluation of data volume after migration. The volume of migrated data might occupy 6 TB of space in OceanBase Database, which therefore must have a disk size of at least 7 TB to ensure the disk health.

Step 4: stress test. We performed a high-frequency SQL stress test to verify the data loading capacity of the database.

Step 5: evaluation and analysis of associated business. We made clear all business modules associated with the system and verified them one by one.

In the assessment, we verified the feasibility of the new system and estimated the requirements of resources such as CPU, memory, and disks of OceanBase Database.  

(ii) Migration solution

A challenge of the migration was how to do it smoothly without disturbing our business modules that were running stably around the clock. We designed a neat procedure and migrated the read business first, and then the write business. This read-write splitting strategy ensured a stable and smooth system migration and minimized the impact on end-user experience.

![1709003832](/img/blogs/users/CR-Vanguard/image/1709003832627.png)  

Another challenge was to merge the shards of the original MySQL cluster into OceanBase Database. We must check each large table to confirm the uniqueness of each data record and configure appropriate partitioning keys for large tables to ensure the optimal performance of hotspot SQL queries. It was also necessary to make sure that historical data can be quickly shed to guarantee easy and efficient O&M.

To those ends, we determined a migration and modification plan based on extensive analysis and verification.

First, we confirmed the large tables with no duplicate data. They need no modifications after table merging. Second, we modified the large tables that might have duplicate data after migration to ensure data consistency.

![1709003848](/img/blogs/users/CR-Vanguard/image/1709003848217.png)

Finally, we adapted our read/write business to dual data sources, and migrated the business in batches based on rational rules.

![1709003876](/img/blogs/users/CR-Vanguard/image/1709003876473.png)  

(iii) Real-time processing of streaming data

Kafka plays a crucial role in processing data streams associated with database operations. Kafka supports many storage formats, such as Canal, SharePlex, and Debezium, which are widely used in the industry. OceanBase Migration Service (OMS), a data synchronization and migration tool provided with OceanBase Database, supports these formats well, making the data transfer process smoother and more stable and reliable while significantly reducing migration and development costs.

1\. Data stream processing in the original system based on binlogs + CA scheduling

![1709003892](/img/blogs/users/CR-Vanguard/image/1709003892136.png)  

In our original system, Kafka connectors captured changes in cluster data in real time by listening to binlogs of all MySQL nodes, making the database O&M complicated. Besides, certificate authority (CA) scheduling suffered considerable push delay. Data was pushed inefficiently when the business traffic went high, resulting in poor system reliability.  

2\. Real-time processing of streaming data based on OMS + Flink scheduling

![1709003909](/img/blogs/users/CR-Vanguard/image/1709003909382.png)  

OMS provides a GUI-based console for centralized task management and supports data synchronization to a specific point in time with low maintenance costs. This solution uses Flink streams to achieve real-time data processing and pushes processed data to the destination system in real time through stream sinks and table sinks of Flink. This ensures that the destination system supports the reception and processing of real-time data. The solution also supports periodical state checks at checkpoints during task execution to ensure that a faulty task can be restored to the state at the checkpoint.

The OMS + Flink solution allows us to manage real-time data with simple operations and completes the entire data transfer process within 2 seconds. This way, every data record can be accurately and reliably pushed to end users for consumption in real time.

(iv) Migration and merging results

Our all-around preparation and verification paid off. We successfully migrated the core system to OceanBase Database and merged its shards with zero impact on end-user experience and business operation stability. The results of production verification indicate that the system performance was improved by about 70%, and the costs were reduced by about 50%.

IV. Vision for the Future
------

Next, we will make every endeavor to build a full-featured database system and strengthen our skills to get the most out of it. We will also optimize resource allocation and improve monitoring and O&M mechanisms to boost efficiency at lower costs and achieve sustainable business development.