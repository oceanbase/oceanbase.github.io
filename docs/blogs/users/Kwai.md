---
slug: Kwai
title: '400TB Single Cluster: OceanBase Powers Kwai`s Core Business'
tags:
  - User Case
---

> Kwai is a short video app boasting more than 10 million daily active users. How does it efficiently process highly concurrent user requests? Kwai once deployed multiple MySQL clusters in the backend to support high traffic with large data storage and satisfactory performance. What are the weak points of this conventional sharding solution? What pushed Kwai to select distributed databases and eventually deploy OceanBase Database? In this post, Xiaochong, the head of Kwai's O&M team, shared the team’s reflection and experience in implementing the OceanBase Database solution.

From MySQL sharding to enhanced MySQL
---------------------

Kwai is one of the popular short video and live streaming apps in China. Pooling content that covers all corners of everyday life, Kwai hopes to improve the unique sense of happiness for all with the power of technology. Users can record moments in their lives by taking photos and creating short videos. They can also interact with their followers in real time through live streaming. Founded in 2011, Kwai has been listed since 2021 and has attracted hundreds of millions of daily active users. This, on the one hand, drives the rapid growth of the company's e-commerce businesses. On the other hand, the underlying system is unprecedentedly loaded. Its conventional solution alleviated the storage stress and improved performance. However, the O&M complexity and unsustainability of the solution also posed challenges to the company's sustainable development.

As the volume of orders and business data grew rapidly, the original MySQL databases were increasingly stressed in terms of storage space and performance. Take the company's order management business as an example. When the total data volume of orders hit 150 TB, the storage bottleneck and performance issues of its MySQL database got worse. We tried database and table sharding to mitigate the business impact.

In response to the growing business, however, we had to create more database shards, and eventually created over 300 online MySQL shards. The large number of database shards did not solve the storage issue, but made O&M more complex, leaving us with endless application adaptation. Besides, the peak queries per second (QPS) of the app might surpass one million, which necessitates very high system performance. In this case, we had to squeeze many MySQL nodes into a single cluster, and we could not ensure the timely return of business requests during peak hours, not to mention that heavy-duty hardware was required for the middleware or downstream links to operate stably.

In addition to strong transaction processing (TP) and real-time read/write capabilities, our business also requires analytical processing (AP) capabilities. To ensure system stability and reliability, we needed to connect the MySQL database to ClickHouse, Elasticsearch, or Doris, which might require more data replicas, and thus further increased the hardware costs.

![1703042673](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-12/1703042673133.png)

We realized that the sharding solution was more like a painkiller rather than a cure, and we were in urgent need of a high-performance, scalable distributed database system that not only meets our business requirements but is also easy to operate and maintain.

The first distributed database product we tried fell short of our expectations due to its write performance and O&M methods. For example, it provided an oversimplified O&M platform that could hardly meet the needs of database administrators (DBAs), and it came with many nasty kernel issues. Then, we turned to OceanBase Database.

What impressed me deeply was that using OceanBase Database, it took less than a day to perform DDL operations on a single table larger than 10 TB and continuously growing, whereas the original database architecture was estimated to take one week for the same task. Moreover, the continuous growth of some business resulted in more tables and source data, and hence countless DDL operations. As the original databases were split into small shards, the number of shards would be fairly large in case of massive data amount, and the business stability might be impacted when a node was down, scaled, or replaced. OceanBase Database, on the contrary, adopts large partitions, and therefore can finish the aforesaid business operations in hours.

Support for core business based on OceanBase Database
----------------------

We have deployed eight OceanBase clusters to support our short video platform. More than 800 TB of data is managed on over 200 servers. The data volume of the largest cluster has exceeded 400 TB. We have upgraded all clusters from OceanBase Database V3.1 to V4.2 to provide online services, including clusters that host the core transaction verification system and payment system, and clusters that handle high-concurrency data writes in place of the previous master MySQL database. After the upgrade to OceanBase Database V4.1, the clusters have demonstrated significant improvement in business benefits and stability. Now, let me share with you the benefits of OceanBase Database in our two core business scenarios.

### i. Transaction verification

As a short video platform, Kwai provides e-commerce services to meet the needs of prospective shoppers when they swipe through videos. In general, e-commerce services attract stable traffic, generating 80,000 to 90,000 QPS daily. During a live streaming event with a massive audience, the traffic increases dramatically and the QPS value often soars by 10 or even 100 times, reaching over a million. The compressed data volume can be larger than 100 TB.

Characteristics of the live streaming business:

·       It is extremely sensitive to latency, usually at the ms level, due to very high requirements for transactions per second (TPS). If a transaction cannot be completed within the specified duration, the verification results are affected, resulting in inaccurate data.

·       The e-commerce services require high system stability because they are closely related to transactions, and are affected when the system fails or experiences abnormal jitters, causing financial losses.

Before we adopted OceanBase Database, data reads and writes in the transaction verification scenario were performed in the original MySQL architecture. To address the performance issues caused by large tables, we split large tables into multiple small table shards, and distributed the business read/write traffic across multiple MySQL instances. As the sharding solution could not guarantee cross-instance data consistency or cross-instance transaction atomicity, data inconsistencies were likely in complex operations and when errors occurred, leading to incorrect data verification results, such as missing refunds, inaccurate deductions, and financial losses.

The findings of our investigation indicate that the distributed architecture of OceanBase Database is horizontally scalable. Facing an increasing amount of data, we only need to scale out the storage and computing resources of the cluster to deal with large table queries and storage issues. OceanBase Database also provides native distributed capabilities and shows better performance in processing distributed transactions. After OceanBase Database is put into operation, each data record written to shards of the MySQL clusters from upstream business modules is synchronized to OceanBase Database in real time by using binlogs. A data query in an upstream MySQL cluster also triggers the same query in OceanBase Database. The query results are compared to ensure the consistency of the order status in the entire accounting system.

The figure below shows the performance of online transaction verification. The upper-left chart shows the daily trends of QPS, which is about 90,000 on average. The upper-right chart shows the SQL response time, which is no more than 10 ms on average. The peak value of 10,000 ms occurs at midnight because a special thread is started to delete a large amount of corresponding historical data after the daily major compaction. This is acceptable to our business. The lower-left chart shows the daily trends of TPS, which is about 10,000 on average. The lower-right chart shows the transaction response time, which ranges from 5 to 10 ms in general. So, it is safe to say that the response time of OceanBase Database meets our latency requirements, and our system stability is guaranteed.

![1703042979](/img/blogs/users/Kwai/image/1703042979767.png)

### ii. Payment business

Payment data must be processed in real time in the e-commerce business. On the one hand, merchants and customer service staff check the sales in a live streaming event based on the payment data. On the other hand, the payment gateway uses the payment data for aggregate queries. Three major characteristics of the payment business are described as follows.

**1. Large data amount**

Compared with transaction verification, the payment business generates far more data, which may exceed 100 TB in a single cluster. The largest cluster of our system has contained more than 400 TB of data, with the largest table exceeding 10 TB.

**2. Complex aggregation queries**

The write traffic of the payment business is much higher than its query traffic, and all backend queries go through the payment gateway. To perform aggregation queries involving a massive data amount, the system may join dozens or even hundreds of tables, which requires high performance.

**3. Frequent DDL operations**

Queries come in irregularly. To process queries faster, indexes are added frequently. In the original solution, data was written to MySQL clusters and then synchronized to Elasticsearch clusters for complex AP queries. While meeting the business requirements, the solution bothered us due to the following three issues:

·       Inferior real-time performance: The high write traffic to the MySQL clusters might result in data latency when it was synchronized to Elasticsearch.

·       Higher costs: The deployment of an Elasticsearch cluster incurred hardware and maintenance costs in addition to those of the MySQL cluster.

·       More complex O&M: We had to take care of the O&M of both the MySQL clusters and the Elasticsearch clusters.

With the online scalability of OceanBase Database, the storage of large amounts of data is no longer a problem. In addition, the hybrid transaction/analytical processing (HTAP) capability of OceanBase Database allows the system to handle real-time queries and analysis while ensuring data writes. In this business scenario, OceanBase Database has demonstrated equivalent performance in analyzing complex SQL statements as Elasticsearch. In addition, OceanBase Database supports online indexing. This feature allows us to perform DDL operations at any time. By replacing the previous MySQL + Elasticsearch solution with OceanBase Database, we not only save the costs for Elasticsearch services and hardware, but also significantly reduces the costs of MySQL hardware. Compared with the previous solution, OceanBase Database meets the query requirements with 50% fewer server resources. In the following figure, the left side shows the logic of the MySQL + Elasticsearch solution, and the right side shows the OceanBase Database solution.

![1703042993553](/img/blogs/users/Kwai/image/1703042993553.png)

The figure below shows the performance of the payment business. The data write QPS ranges from 50,000 to 70,000 in general, and the QPS value of queries is less than 10,000. In the two charts on the right, the blue lines indicate the response time of historical data deletion tasks in off-peak hours, and the green line indicates the response time of write/read queries.

![1703043001](/img/blogs/users/Kwai/image/1703043001143.png)

Today, we manage more than 190 OBServer nodes in eight OceanBase clusters in OceanBase Cloud Platform (OCP). This O&M tool allows us to easily deal with cluster scaling, monitoring, and alerting. Our O&M team of over 100 members is a big fan of OceanBase Developer Center (ODC), a query platform of OceanBase Database that allows us to verify whether the data is written successfully and correctly. ODC also allows us to access a database and perform routine operations in GUI-based workspaces. It is updated frequently and our feedback is handled responsively.

Benefits and disadvantages of OceanBase Database
-------------------

OceanBase Database has greatly benefitted our core business from the following perspectives in the aforesaid two scenarios:

·       High compatibility with MySQL: The O&M team can use OceanBase Database in the same way as they use a MySQL database. In addition, OceanBase Database is compatible with MySQL protocols and syntax, so that legacy data can be smoothly migrated to significantly reduce the costs of business migration and transformation.

·       More efficient O&M: Over 300 MySQL database shards are aggregated into one OceanBase cluster, making management easier with greatly reduced O&M costs.

·       Higher synchronization performance: The latency from data writing in the upstream business modules to the response of the downstream OceanBase cluster is reduced, making data synchronization faster. The synchronization latency is reduced by 75%.

·       Three IDCs within the same city: OceanBase Database can be deployed across three IDCs within the same city. This deployment mode reduces the recovery point objective (RPO) to zero and the recovery time objective (RTO) to less than 8 seconds in the case of disasters. A read-only zone can be added in another city to provide the local read feature, which improves the query efficiency. The features such as zone-disaster recovery and local read further enhance the business stability and performance.

·       Flexible resource scaling: The capacity of OceanBase Database can be linearly scaled in response to the actual business development to support the storage and computing of massive amounts of data. This allows us to get ready for business growth in the future.

·       Compared with a conventional centralized MySQL database, OceanBase Database compresses data in the storage at an ultra-high data compression ratio, which greatly reduces the hardware costs of enterprises. For example, the new solution saves us 50 servers.

We have also noticed something about OceanBase Database that can be improved. First, we use OceanBase Database V4.1, which is not compatible with MySQL binlogs. We need to export binlogs by executing SELECT statements, and then synchronize binlogs to a big data platform. OceanBase Database V4.2 is compatible with MySQL binlogs. We are planning to try it out. Second, some alert messages of OCP V4.0.3-20230301 are indeterminately described, and this OCP version does not display top SQL queries. This is a bit disturbing during troubleshooting. Third, a task of scaling in hundreds of servers in parallel tends to fail and needs manual retries. Fortunately, we learned from OceanBase that the preceding issues have been solved in OCP V4.2.

We understand that every coin has two sides, and database products are no exception. In the days to come, we would like to push forward the cooperation with the OceanBase community, and keep the database products updated to enjoy the storage and performance advantages of OceanBase Database. We will also connect to downstream applications in the ecosystem based on binlogs, and play an active role in community co-building.