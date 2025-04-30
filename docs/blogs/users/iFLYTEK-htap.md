---
slug: iFLYTEK-htap
title: 'iFLYTEK Leverages HTAP Capabilities to Improve Query Performance by 40 Times for Large Tables with Hundreds of Millions of Records'
tags:
  - User Case
---

> Editor's note: iFLYTEK Co., Ltd. (iFLYTEK) became interested in native distributed databases in 2021 and deployed OceanBase Database in 2023 to empower their core business systems. The new database architecture achieves stable business operations, supports automatic scaling, and handles both transaction processing (TP) and analytical processing (AP) tasks without mutual interference. Unexpectedly, it also reduces the storage costs by 50% and greatly simplifies O&M. In this article, Li Mengjia, head of iFLYTEK's database team, shares their experience in database upgrades.

Exploring Native Distributed Databases
-----------

iFLYTEK is a listed tech company well-known in the Asia-Pacific region. Since its founding, the company has been engaged in technological research. Our core technologies, such as intelligent voice, natural language understanding, and computer vision, have maintained the edge on the international market. In 2023, we launched a promising business line, which initially experienced a trough period. As more services were released, the business volume welcomed explosive growth after a promotional campaign in September of that year.

![1702293646](/img/blogs/users/iFLYTEK-htap/image/1702293646599.png)

The business data was stored in a MySQL database, and as the business grew, the data volume and disk usage increased drastically.

* The business system generated a record for each user interaction. About 700 million records were squeezed into the core table in just half a year.
* The data volume grew rapidly, with an estimated annual increment of around 5 TB.

![1701691209](/img/blogs/users/iFLYTEK-htap/image/1701691209757.png)

We soon realized that MySQL could no longer effectively support our multi-dimensional, real-time report analysis for business decision-making due to the massive and rapidly growing data volume. A native distributed database might be a good solution.

Some vulnerabilities of MySQL further spurred our determination to replace it. A MySQL database cluster can be horizontally scaled out by sharding to improve its overall read/write performance. Many of our business systems were running on MySQL databases in a well-maintained architecture. However, MySQL was invasive to the business systems, so business adaptation was necessary. If we adhered to the sharding strategy, we would have to spend significant extra energy and time to modify the new business system because of frequent large table creation and update operations. Besides, it was in a critical stage, so we hoped to minimize the adaptation costs.

After comprehensive consideration, we decided to replace MySQL with a native distributed database solution for three benefits:

1. Scalability. Highly scalable data storage and processing capabilities handle drastic data growth and high-concurrency access with ease.

2. Maintainability. A comprehensive ecosystem of tools helps simplify database management and maintenance, reducing maintenance costs and complexity.

3. Hybrid transaction and analytical processing (HTAP) capabilities. With HTAP and read/write splitting, we can handle TP and AP tasks in a single architecture.

So, why did we pick OceanBase Database, and what can it do to help us?

Why OceanBase Database
-------------------

OceanBase Database has caught our attention since 2021. After two years of research, we were clear that it provides what we need.

**1. Scalability**

OceanBase Database can be deployed in a distributed, scalable architecture with a cluster of equivalent nodes. We can deploy a cluster across multiple zones to ensure fault isolation and rapid recovery.

We can scale out an OceanBase cluster in two ways. When a cluster runs out of resources to maintain its performance due to rapid business volume growth, we can enhance its service capacity by adding more nodes within each zone. This method is called intra-zone scaling. Another method is horizontal scaling. OceanBase Database distributes multiple replicas of the same set of data across different zones. If a minority of zones fails, the remaining replicas ensure that the cluster continues to provide service. We can improve the overall disaster recovery performance of a cluster by adding more zones.

Either way, the cluster can be scaled out when it is running, with zero business interruptions.

![1701691238](/img/blogs/users/iFLYTEK-htap/image/1701691238252.png)

**2. Maintainability**

OceanBase Database is backed by a grand ecosystem of more than 400 tools. Specifically, OceanBase Cloud Platform (OCP), an in-house O&M tool, offers a range of capabilities:

*   IaaS resource management: such as region, IDC, and host management
*   Tenant management: database, session, parameter, and zone priority management, as well as creation, deletion, and scaling of tenants
*   Software package management: package upload, download, and storage
*   OceanBase Database Proxy (ODP) management: creation, takeover, deletion, upgrade, and scaling of ODP clusters, as well as parameter management
*   Backup and restore: data and log backup, backup cleanup, second backup, restore, and sampling
*   Database cluster management: creation, deletion, upgrade, scaling, and monitoring of database clusters, fault alerting, as well as management of compaction tasks, parameters, and resource units

OCP allows us to execute arguably all O&M tasks on a GUI instead of a command line interface. This greatly reduces the overall O&M workload.

![1701691284](/img/blogs/users/iFLYTEK-htap/image/1701691284063.png)

OceanBase Database also surprised us with its performance in DDL operations. If you are a MySQL user, you may have experienced the awkwardness when performing DDL operations on a large table in your MySQL database. MySQL 5.6 and later have been optimized, but still cannot meet business requirements in many scenarios. Therefore, we used three tools to help perform DDL operations on large tables in MySQL. Typically, we did that job at night because it took a very long time for tables with hundreds of millions of records. OceanBase Database performs distributed DDL operations, with priority given to business requests. A time-consuming DDL operation in MySQL can be completed within seconds in OceanBase Database.

**3. HTAP capabilities**

Most databases cope with AP and TP requests separately. In other words, data is written to an online TP system and is extracted to an AP system for analysis. OceanBase Database provides an engine that supports both TP and AP capabilities. It analyzes data immediately after the data is inserted. Resources for TP and AP requests are isolated to avoid business interference.

![1701691295](/img/blogs/users/iFLYTEK-htap/image/1701691295206.png)

Furthermore, the online transaction processing (OLTP) capabilities of OceanBase Database have withstood the huge traffic of the Double 11 shopping festival, ten years in a row, and Alipay. Its online analytical processing (OLAP) capabilities also bring many benefits, such as complex query optimization, low-latency response (within seconds), and horizontal linear scaling (to handle JOIN queries on tens or even hundreds of millions of data records).

To make sure that OceanBase Database can meet our business requirements, we tested its performance.

**4. Performance test**

Using the common TPC-C benchmark tools, we measured the tpmC value (transactions per minute) of a three-node OceanBase cluster, a standalone MySQL database, and a sharded MySQL database in a production environment with 96 CPU cores, 384 GB of memory, and SSDs. The test result showed that the MySQL database slightly outperformed the OceanBase cluster when the concurrency was below 64. However, the OceanBase cluster gained significant advantage when the concurrency was set to 128 or larger. As the concurrency became larger, the performance of the OceanBase cluster kept improving, while that of MySQL peaked at the concurrency of 256.

![1701691306](/img/blogs/users/iFLYTEK-htap/image/1701691306742.png)

We also compared the performance of MySQL and OceanBase Database in handling the most time-consuming statistical queries of the system. Results indicated that depending on SQL complexity, OceanBase Database outperformed MySQL by 7 to 40 times.

![1701691313](/img/blogs/users/iFLYTEK-htap/image/1701691313876.png)

The performance stress test also proved the high data compression ratio of OceanBase Database. The compressed data volume of the three-replica OceanBase cluster was about 50% smaller than that of the MySQL cluster, significantly reducing the storage cost.

 **5. Protocol compatibility and data migration**

 We were highly concerned about two issues. First, we hoped that OceanBase Database would be compatible with MySQL protocols, so that we could migrate data to OceanBase Database without extensive modifications. In fact, OceanBase Database is fully compatible with MySQL protocols, allowing us to switch business systems to it without complicated code modifications. Second, the new business system provides 24/7 service, leaving a narrow time window for data migration. OceanBase Migration Service (OMS) supports near-real-time data synchronization from MySQL to OceanBase Database. Using OMS, with the traffic switching capabilities of the intermediate layer, we can quickly switch the business traffic from MySQL to OceanBase Database, shortening the expected downtime.

**6. Conclusion**

In a word, OceanBase Database fully meets our requirements based on the research and test results.

*   Scalability: OceanBase Database can be vertically and horizontally scaled based on business fluctuations.
*   Maintainability: OCP allows us to perform O&M on a GUI instead of a command line interface, reducing O&M workload. A DDL operation is completed within seconds.
*   HTAP capabilities: OceanBase Database supports both TP and AP capabilities. Resources for TP and AP requests are isolated to avoid business interference.
*   Others: OceanBase Database is fully compatible with MySQL protocols. We can use OMS to smoothly migrate data from MySQL to OceanBase Database with zero business code modifications. Compared with MySQL, OceanBase Database saves the storage cost by half.

Switching Business from MySQL to OceanBase Database
----------------------

We were fully prepared before switching to OceanBase Database.

- First, we built a test environment and tested OceanBase Database to verify its adaptability and compatibility, and make sure that its OLAP and OLTP performance meet online business requirements.

- Second, we verified the OMS-based synchronization method and then synchronized data from MySQL to OceanBase Database and verified data consistency. To address unknown migration risks, we designed a rollback plan. We also tried management operations, and verified the high availability solution and the emergency plan.

- Finally, we switched the business system from MySQL to OceanBase Database, which proceeded smoothly. After that, we carried out routine O&M works, such as performance optimization, monitoring, and backup and restore, to ensure continuous and stable operations of the OceanBase cluster.

The following figure shows the switching procedure. Our original MySQL architecture consisted of a master instance and a slave instance to ensure high availability. It received requests forwarded by ProxySQL. The new architecture consists of a three-node OceanBase cluster. It receives requests forwarded by HAProxy, which also serves as a load balancer. We set the same configuration for HAProxy and ProxySQL, and migrated data from the MySQL cluster to the OceanBase cluster using OMS before the switching. At the same time, we verified data consistency between the two clusters, and synchronized their user information. This way, we only needed to change the virtual IP address for the business connection of the MySQL cluster to that of the OceanBase cluster, and then switch the business traffic with negligible impact on the upper-layer business applications.

![1701691368](/img/blogs/users/iFLYTEK-htap/image/1701691368737.png)

After the OceanBase cluster went live, we kept the MySQL cluster for some time, and enabled reverse synchronization from the OceanBase cluster to the production MySQL cluster, as shown in the following figure. This is to prevent any incompatibility issues. In that case, we could quickly switch the business traffic back to MySQL. The good news was nothing bad happened.

![1701691376](/img/blogs/users/iFLYTEK-htap/image/1701691376501.png)

To further improve the overall system availability, we set up a standby OceanBase cluster for the purpose of disaster recovery. If the production cluster failed, we could quickly switch to the standby cluster and keep system services available.

As a first-time OceanBase Database user, exhaustive preparation strengthened our confidence despite the limited time window for the business switching.

Nevertheless, we encountered problems during the process anyway. At first, we deployed OceanBase Database V4.1. Our developers reported errors in the result set after the switching. We contacted OceanBase Technical Support, who fixed the issue by adding hints. We also noticed exceptions during the synchronization of large tables and DDL operations using OMS. Those exceptions were kicked out after we upgraded OceanBase Database to V4.2.1.

Summary
----------------------

OceanBase Database has been running stably for six months as I put together this article, and has brought us many benefits:

Stable business operations. The native distributed architecture of OceanBase Database is based on the Paxos protocol. It avoids single points of failure, providing stable service for upper-layer applications.

 Automatic scaling with zero business interruptions. OceanBase Database supports vertical and horizontal scaling in response to business changes, causing zero business interruptions to upper-layer applications.

 Improved maintainability and simplified O&M. We can perform all O&M tasks in OCP. This management platform has dramatically reduced our O&M workload.

 Great storage cost reduction. As indicated by our test results, OceanBase Database provides a data compression ratio two times that of MySQL, saving half of the storage cost.

 Smooth business migration. OceanBase Database is fully compatible with MySQL protocols, requiring minimal code modifications, thus saving considerable development costs. In addition, OMS has helped us smoothly migrate data from MySQL to OceanBase Database.

 Convenient HTAP capabilities. OceanBase Database provides an engine that supports both OLTP and OLAP, saving the costs of building a separate OLAP system.

 In the days to come, iFLYTEK will migrate more systems to OceanBase Database, and deepen the partnership with OceanBase.