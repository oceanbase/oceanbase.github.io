---
slug: NetEase-Games
title: 'NetEase Games: Why We Chose OceanBase Database?'
tags:
  - User Case
---

As one of **China's leading** game development companies, NetEase Games invests heavily in the R&D of online games in order to keep ahead of the curve. Our company has many game products and derivatives, requiring different data processing products to meet diversified business requirements. Our database team mainly serves the internal departments and provides comprehensive database services in private cloud environments.

NetEase Games boasts a mature database product matrix, but every product has its own pros and cons, and the existing database products are not flexible enough to cover all internal business scenarios. To solve this problem, we finally decided to introduce OceanBase Database.

## Business Architecture and Requirements


The figure below shows the MySQL database architecture used by a business platform of NetEase Games. As more business data and requests need to be processed on the platform, the original MySQL database architecture gradually evolves into one that consists of a primary cluster and a dozen standby clusters, in which the standby clusters are created to process read requests.

![1711436205](/img/blogs/users/NetEase-Games/image/1711436205907.png)

  

However, the following paint points are becoming obvious during our use of this database architecture.

*   **High concurrency and sensitive to latency:** During peak hours, the queries per second (QPS) in the primary cluster can reach 100,000, and the number of read requests of a single standby cluster can reach 10,000 or more, with a total of millions of QPS in all standby clusters. The overall concurrency is high, but our business is latency-sensitive, which means that performance jitters are intolerable.
*   **Heavy storage pressure on the primary cluster:** The storage space of a single node has exceeded 10 TB, which exerts heavy pressure on the MySQL database architecture in business scenarios involving high-concurrency transaction processing (TP).
*   **Poor real-time performance of standby clusters:** The standby clusters demand high real-time performance. Latency caused by slow queries or other issues in the standby clusters severely affects our business.
*   **Difficult O&M:** Traffic surges bring big challenges to database O&M. The MySQL database architecture, even though supplied with resources of the highest specifications, can deal with such a situation only by adding instances. What's worse, instance recreation will be required if a read-only standby cluster fails. Due to the huge amount of data stored in MySQL instances, both the storage space scale-outs of standby clusters and backup and restore are time-consuming, which is unacceptable for business.

To solve this pain point, we are crying out for a distributed database that supports smooth horizontal scale-outs and ensures stable performance. Besides, the MySQL database architecture requires large storage space for data archiving and involves high QPS during the archiving. In consideration of this, we want the distributed database to be able to process large queries while scaling out and ensure that business modules in the same cluster do not affect each other. Of course, it would be better if the distributed database is also cost-effective.

We analyze our requirements for a distributed database and sort them in the following priorities from high to low:

*   **Stable performance:** Our business is sensitive to query latency, which requires no jitters or slow queries with the database.
*   **High concurrency:** The database can process highly concurrent requests in peak hours, during which nearly 100,000 QPS are generated in the primary cluster, and millions of read requests are generated in standby clusters.
*   **Smooth scale-outs:** The storage space of a standalone server needs to be enough to support continuous data growth.
*   **Low latency:** The database must allow data synchronization to the primary cluster with a second-level latency.
*   **Low costs:** Due to a large amount of business data, we hope that the database operational costs can be minimized.

## Why We Chose OceanBase Database


After investigation, we find that OceanBase Database can help us solve the preceding business pain points, and it has the following advantages:

* First, stability. Database stability is critical to an online payment system in the gaming industry. A distributed three-replica OceanBase cluster supports automatic failovers and ensures a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of 8s when a minority of OBServer nodes are down. Serving Alipay for years, the high stability of OceanBase Database has been testified by core financial transaction systems in ultra-large scenarios.

* Second, transparency and scalability. An OceanBase database has high scalability and supports smooth online scaling. After a scale-out, the database automatically performs load balancing, which is transparent to applications without the need for changing business code and does not affect system continuity. This perfectly satisfies the horizontal storage scale-out requirement of NetEase Games.

![1711436259](/img/blogs/users/NetEase-Games/image/1711436259038.png)

* Third, real-time data synchronization. Our business requires high real-time performance of data. Therefore, we spent one month testing the stress and batch processing capability of OceanBase Database in the early stage after introducing it. After we use OceanBase Migration Service (OMS), a migration tool provided by OceanBase, no obvious latency occurs during data synchronization, ensuring real-time queries of business data.

* Fourth, tenant-level resource isolation. OceanBase Database supports the multitenancy architecture, where each tenant can be seen as an instance in the original MySQL database architecture. Within an OceanBase cluster, multiple tenants can be created to serve different business modules. To ensure business stability, OceanBase Database isolates resources, such as CPU, memory, and IOPS, between tenants to avoid interference among business modules and ensure quick payment.

* Last one, low storage costs with a high data compression ratio. OceanBase Database adopts an advanced log-structured merge-tree (LSM-tree)-based storage engine that is developed in-house. This engine automatically encodes and compresses microblocks when they are stored in disks. Unlike the B+ tree used by the original MySQL database architecture, the OceanBase storage engine reduces the storage costs by 70%–90% and improves the query efficiency by storing more data in each microblock.

Regardless of the three-replica architecture, OceanBase Database still helps us significantly lower the storage costs while ensuring high performance after data migration.

In addition to the preceding advantages, we also find the following strengths of OceanBase Database:

* **Compatibility with MySQL.** This ensures smooth business data migration without the need to change business code or invest too much manpower in adaptation tests.
* **Hybrid transactional and analytical processing (HTAP).** With this capability, we can try using a single OceanBase cluster to replace the original two systems for business modules involving both TP and AP.

## Tests on OceanBase Database in the Early Stage


Before putting a new database into formal use, we need to perform strict benchmark tests, business tests, and grayscale tests on the database to ensure it is stable, reliable, and adapted to our business. In this stage, we compared OceanBase Database with MySQL from various aspects, including the architecture, high availability (HA), consistency, compatibility, storage cost, and performance. The test details are as follows:

### 1. Test environment

![1711436386](/img/blogs/users/NetEase-Games/image/1711436386200.png)

![1711436404](/img/blogs/users/NetEase-Games/image/1711436404918.png)

![1711436412](/img/blogs/users/NetEase-Games/image/1711436412103.png)

  

### 2. Test tool

We used sysbench to perform tests in read-write hybrid (read-write ratio: 8:2) scenarios, read-only scenarios, and write-only scenarios.

### 3. Test results

*   Online transaction processing (OLTP) capability: In a small-scale data scenario where only 10 tables need to be processed and each table stores 20 million data records, OceanBase Database V4.0 is on a par with MySQL, and OceanBase Database V4.1 outperforms a standalone MySQL database. However, in a large-scale data scenario where more than 100 million data records need to be processed, the OLTP capability of a scaled-out OceanBase database is far beyond that of a standalone MySQL database.

![1711436426](/img/blogs/users/NetEase-Games/image/1711436426618.png)

*   Online analytical processing (OLAP) capability: When aggregate analysis and joined queries are involved for multiple large tables (storing more than 100 million data records), the overall performance of OceanBase Database V4.x is stable without serious jitters, and the time it spends on queries is much less than that MySQL spends. Actually, it's of little significance to compare the OLAP capability of the two databases since MySQL does not apply to AP-related business.
*   Data compression for storage: We exported 5 TB of data from the upstream MySQL cluster to the OceanBase database, and the total size of the generated replicas is only 2.1 TB, with 700 GB of each replica. The compression ratio for a single replica is almost 86%. Due to space fragments in the upstream MySQL cluster, the calculation result may have a slight deviation.

**Note:** We performed this test only to compare the data compression capability, without considering other costs such as CPU overhead. The total costs may vary according to business scenarios.


### 1. Tenant-level resource isolation test

We performed a performance stress test on two tenants to check whether the response to a tenant's requests is affected when the other tenant uses up all resources. The test process is as follows:


#### Step 1: Create two tenants.

(1) CPU: 2 cores; memory: 2 GB

```sql
create resource unit test_unit max_cpu 2, max_memory '2G', max_iops 128, max_disk_size '2G', max_session_num 128, MIN_CPU=2, MIN_MEMORY='2G', MIN_IOPS=128; create resource pool test_pool unit = 'test_unit', unit_num = 1, zone_list=('zone1','zone2','zone3'); create tenant test_tenant resource_pool_list=('test_pool'), charset=utf8mb4, replica_num=3, zone_list('zone1', 'zone2', 'zone3'), primary_zone=RANDOM, locality='F@zone
```
  


(2) CPU: 4 cores; memory: 4 GB

```sql
create resource unit test_unit2 max_cpu 4, max_memory '4G', max_iops 1280, max_disk_size 53687091200, max_session_num 128, MIN_CPU=4, MIN_MEMORY='4G', MIN_IOPS=1280; create resource pool sysbench_pool unit = 'test_unit2', unit_num = 1, zone_list=('zone1','zone2','zone3'); create tenant sysbench_tenant resource_pool_list=('sysbench_pool'), charset=utf8mb4, replica_num=3, zone_list('zone1', 'zone2', 'zone3'), primary_zone=RANDOM, locality
```
  


In Tenant 2, perform the stress test on 2,048 threads concurrently.

![1711436493](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-03/1711436493542.png)

Check the response to requests from Tenant 1 before and during the stress test on Tenant 2, as well as the CPU usage of Tenant 2 during the test.

The following figure shows the performance of Tenant 1 before the stress test on Tenant 2.

![1711436505](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-03/1711436505287.png)

The following figure shows the performance of Tenant 1 during the stress test on Tenant 2.

![1711436518](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-03/1711436518050.png)

  

#### Step 2: Check the resource usage of Tenant 2.

*   CPU:

![1711436542](/img/blogs/users/NetEase-Games/image/1711436542465.png)

*   Memory:

![1711436553](/img/blogs/users/NetEase-Games/image/1711436553061.png)

The test results are as follows:

*   The resource usage stability meets the expectation. During the stress test on multiple threads in a high concurrency scenario, the CPU and memory resources are stably used by Tenant 2, without exceeding the upper limit.
*   No reciprocal impact is found between the two tenants. The expected isolation effect is achieved. During the stress test on Tenant 2, the number of requests from Tenant 1 slightly decreases, and the QPS reduces by about 20%. The usage of I/O resources may have not been thoroughly limited, resulting in resource contention. It's worth noting that OceanBase Database does not support the usage limitation on I/O resources until the release of V4.x, which means that this feature is not supported in V3.x. Overall, the two tenants have no significant impact on each other when using CPU and memory resources.

To sum up, the test results prove the superiority of OceanBase Database in terms of performance, stability, recourse isolation, and cost reduction. So, we finally decided to use it in actual business scenarios.  

## Benefits Brought by OceanBase Database

OceanBase Database helps us build a new business architecture (as shown in the following figure), which effectively solves our business pain points. Currently, OMS synchronizes all data in the primary MySQL cluster to an OceanBase cluster. This helps the upstream MySQL cluster regularly clear redundant data based on its business logic and release more storage space. OMS also allows us to set the related parameter for ignoring the DML and DDL operations in MySQL data cleanup. By doing this, a complete data replica is always available in the OceanBase cluster for business queries.

![1711436608](/img/blogs/users/NetEase-Games/image/1711436608218.png)

The benefits of this new architecture are as follows:

*   **Stable business queries:** OceanBase Database shares 15% QPS of the original read-only MySQL standby cluster and delivers stable performance with few jitters.
*   **Flexible scaling under high concurrency stress:** The high scalability of OceanBase Database can easily handle a large number of concurrent requests. By migrating a part of QPS in the original read-only MySQL standby cluster to an OceanBase cluster, the high concurrency stress and risk are effectively controlled.
*   **High real-time performance of data:** The logical replication feature provided by OMS reads the MySQL binlogs and replays the replica in the OceanBase cluster, minimizing the primary/standby switchover latency. OceanBase Database generates monitoring reports if a data synchronization latency or slow query occurs.
*   **Lower storage costs for a single standby cluster:** Compared with the single-replica storage in MySQL, the OceanBase Database storage solution lowers the cost by over 80% and compresses data in the upstream MySQL cluster to about 30% of its original size for storage and archiving, greatly reducing the storage pressure. We also take control of the risks caused by excessive data by using OMS to migrate data to an OceanBase cluster and clearing business data in MySQL on a regular basis.
*   **Easier O&M:** In the event of traffic surges, OceanBase Database can dynamically adjust the available resources of tenants and clusters. OceanBase Database also provides a GUI-based SQL throttling feature for you to deal with traffic surges or slow SQL queries. What's more, both the Paxos-based HA mode in failure scenarios and horizontal scaling are almost imperceptible to applications. By compressing backup data to about 30% of its original size, OceanBase Database restores less data within a shorter time than MySQL when replacing a failed node, improving the backup and restore efficiency by three times.

## Best Practices


The use and operations of a native distributed database are different from those of a distributed database middleware product. We have summarized some best practices during the use of OceanBase Database. I hope these practices are useful for enterprises with the same pain points as NetEase Games.

### Best practice 1: Optimize the data synchronization performance

We encountered a series of challenges in the early stage of using OMS to migrate data from MySQL to OceanBase Database. The biggest challenge is the high latency in incremental migration, resulting in poor migration performance. By querying logs, we find that the REPLACE INTO statement is executed to write data to OceanBase Database, making data migration slow. We run the SQL diagnostics tool and identify an issue, that is, the OB\_GAIS\_PUSH\_AUTO\_INC\_RE function increases the time that the system spends processing remote procedure call (RPC) requests for auto-increment columns.

Then, we consult the OceanBase Database team about this issue. The team tells us that the migrated table is a partitioned table in OceanBase Database and the created auto-increment column is of the ORDER attribute. In this case, the auto-increment column is fully scanned for synchronization between all partitions when OceanBase Database runs the REPLACE INTO SQL and UPDATE statements, increasing the RPC cost. The data synchronization performance is greatly affected especially in the event of large data volume.

**🧰 Solutions:**

*   In the premise that the business requirements are met, remove the ORDER attribute from the auto-increment column to avoid the global scan of the column upon an attribute update. We finally adopted this solution, with which the upstream MySQL cluster successfully ensures the ID uniqueness.
*   Change the attribute of the auto-increment column from ORDER to NOORDER and leave the values of the auto-increment column unspecified in the REPLACE INTO statement. In other words, use the auto-increment values generated by autoincrement\_service in this statement.

### Best practice 2: Design reasonable partitioned tables

Considering the scalability of OceanBase Database as a distributed system, we plan to divide a large table that stores billions of rows of data in the MySQL cluster into partitions when migrated to OceanBase Database. In the early tests, we take account into both the current query performance and future scalability and design a table schema that contains 512 hash partitions based on transaction IDs (a general condition used for most business queries) for migration, trying to balance between storage and performance.

When it comes to the grayscale test, other columns instead of the transaction ID column are used as the filter conditions for thousands of QPS, which account for a small proportion. These queries do not use the partitioning key. Therefore, data in the 512 partitions on all OBServer nodes is scanned upon each request, leading to multiple RPC requests. Consequently, high network latency occurs frequently, and SQL statements are slowly executed.

**🧰 Solutions:**

*   Select appropriate columns as the filter conditions for queries without using the partitioning key, and create global indexes to reduce the amount of data to scan. Note that if too many such query requests with different filter conditions are sent, the partitioned table may need multiple global indexes, which gives rise to extra maintenance costs. Therefore, we recommend that you do not create excessive global indexes for a single table.
*   Reduce the number of partitions in the table from 512 to about 10. This solution can achieve the horizontal balance and lower the RPC latency even if all partitions are scanned. After discussion, we chose this solution.

### Best practice 3: Ensure the atomicity of the transactions from the upstream MySQL cluster to an OceanBase cluster

There's a special business scenario during the test run. In this scenario, the seller sells products to the buyer in batches and hundreds of orders are generated accordingly. The data of these orders, plus various cash settlement records, may cause hundreds of different DML statements to be executed in a transaction. The DML statements are executed in the MySQL cluster, while the business query requests are made in an OceanBase cluster. Sometimes, the execution results of some SQL statements in a transaction read from OceanBase Database may not conform to the atomicity.

We check OMS logs and find that the "maxRecords is 64, cut it" message is displayed in the incremental synchronization link to indicate that a large transaction is divided into several small transactions by default. This is because when OMS is used to synchronize the upstream binlogs, a default parameter splitThreshold is used to control the number of parsed upstream transaction records. Once the transaction size exceeds the value specified by splitThreshold, the transaction is divided into small pieces for execution. As a result, only statements in a part of these small transactions have been executed when data is read from OceanBase Database. For business modules, only the intermediate state of a small transaction in MySQL is read.

**🧰 Solution:**

Set JDBCWriter.sourceFile.splitThreshold in OMS to a greater value, for example, 1024. This can ensure that a transaction is completed once data has been synchronized to OceanBase Database. Note that a larger value of this parameter indicates more resources occupied by OMS. Proceed with caution.

### Best practice 4: Specify a primary key or unique key to ensure data consistency in synchronization

Repeated rows of data are found when we query data in an OceanBase table migrated from MySQL using OMS. After troubleshooting, we identify that this partitioned table does not have a primary key or unique key for data consistency checks. As a result, data conflicts may occur if a restart or retry happens during the synchronization with OMS.

**🧰 Solution:**

Specify a primary key or unique key for each OceanBase table to ensure data consistency in synchronization.

## Summary and Vision for the Future


Since the introduction of OceanBase Database, its performance has been stable and reliable without jitters or synchronization latency, effectively helping us solve business pain points.

In the future, we will keep exploring the applications of OceanBase Database and gradually replace MySQL standby clusters with OceanBase clusters.

Meanwhile, we are striving to incorporate the OceanBase ecosystem into the SaaS DB platform of NetEase Games. We believe that this action will enhance our service capabilities and enable us to provide database support for more products and business modules.