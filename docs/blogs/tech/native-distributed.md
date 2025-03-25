---
slug: native-distributed
title: 'Treat the Symptoms and the Root Cause! OceanBase Native Distributed + Single-machine Distributed Integration Solves the Problem of Sharding from the Root'
---

As enterprise data volumes grow, traditional standalone centralized databases struggle to meet increasing demands. Many enterprises turn to MySQL sharding as a solution for scaling data storage and processing. However, while sharding addresses immediate capacity needs for processing massive data, it introduces significant complexities.

Despite decades of database advancements and the rapid rise of distributed database technologies, the debate between sharding and distributed systems persists, with the latter not yet fully replacing the former. Many enterprises believe that sharding their existing MySQL databases allows them to leverage their current expertise and address immediate scaling needs caused by business growth. Given that sharding can handle current workloads, these enterprises question the necessity of migrating to a distributed database architecture.

  

**1. Sharding: A Short-term Fix for Growing Pains**
-----------------------

"Premature optimization is the root of all evil." This adage, coined by computer scientist Donald Knuth in his seminal work, The Art of Computer Programming, is a widely held principle among programmers. Knuth argued that focusing excessively on efficiency and performance optimization too early in the development process is often counterproductive, leading to wasted resources. He advocated prioritizing the actual business requirements during programming and delaying optimization efforts until necessary. Database sharding might appear to embody this principle, offering a seemingly natural progression by incrementally adapting existing systems to accommodate growing data volumes, thereby avoiding a complete architectural overhaul.

Indeed, when sharding adequately addresses immediate scaling needs, a full-fledged distributed system might seem excessive.

However, this approach can ultimately prove detrimental. **While sharding ostensibly arises from the need for distributed management of massive data as business grows, its underlying motivation lies in the rapidly evolving demands of a growing business. Ultimately, the core requirement is a flexible infrastructure capable of supporting continuous business development and iteration.**

Sharding, while designed to address rapid business growth, often hinders the flexibility of upper-layer business iterations. This inflexibility presents two key challenges:

-  Sharding introduces tight coupling with the business logic. Changes to the underlying database schema, such as scaling or restructuring, necessitate corresponding modifications to the business layer. This shifts the burden of database management onto the business layer, preventing enterprises from focusing on business development, and hindering rapid iteration.

-  Sharded architectures introduce significant complexity, increasing O&M overhead. Evolving business requirements frequently demand re-evaluation and redesign of the sharding strategy to maintain performance. However, business requirements vary in different growth stages of an enterprise. The constant adaptation becomes unsustainable in the long run, preventing a consistent and scalable approach to data management throughout the business lifecycle.

In the initial stages of an enterprise, when data volume is low, a single, modestly-specced MySQL server suffices. As the business grows, scaling up the server or sharding the database becomes necessary. However, further expansion brings new challenges: demands for greater scalability, the need for high-availability solutions like primary/standby disaster recovery for critical services, and the ability to efficiently scale down resources as business needs contract. Each growth phase necessitates significant system overhauls, making sharding a mere stopgap. **Sharding neither addresses the fundamental need for high-performance distributed transactions nor provides the flexibility required to adapt to the evolving demands of a dynamic business environment.**

In a blog post, Randall Hyde, author of "The Art of Assembly Language" and a seasoned software expert, clarifies that "no premature optimization" shouldn't be misinterpreted as "no optimization." He emphasizes that Donald Knuth's original intent was to prioritize addressing systemic, macro-level performance bottlenecks over getting bogged down in micro-optimizations. Hyde further contends that performance considerations should be integral to the initial design phase. Experienced developers instinctively anticipate potential performance pitfalls, while less experienced developers often overlook this crucial aspect, mistakenly believing that minor adjustments later on can remedy any performance deficiencies.

So, what kind of database solution can fundamentally address the challenges of sharding at the outset of system design?

OceanBase Database provides a solution by combining native distributed capabilities with an integrated architecture that supports both standalone and distributed modes. By encapsulating all distributed functionality within the database itself, OceanBase Database allows enterprises to rapidly iterate without needing to manage the underlying complexity. This approach also caters to the evolving needs of enterprises throughout their lifecycle, eliminating the need for frequent and disruptive system overhauls. OceanBase Database empowers enterprises to focus on expanding their core business, offering a database solution that scales seamlessly alongside their growth.

  

**2. Addressing the Symptoms: A Native Distributed Architecture Simplifies Underlying Complexity and Enables Elastic Scaling for Rapid Business Iteration**
-------------------------------------

Sharding solutions present several drawbacks. First, managing cross-shard transactions is complex, often compromising data integrity and consistency. Second, database performance is highly dependent on the chosen sharding strategy, leading to increased architectural complexity and O&M overhead. Poorly designed sharding strategies can create hotspots, concentrating read/write operations on specific shards and significantly impacting overall performance.

Third, cross-shard queries, data aggregation, and report generation introduce significant complexity and performance overhead, often necessitating specialized optimization techniques and middleware. Capacity planning, scaling, and data migration require careful redesign and pose substantial challenges to system stability and data integrity. Finally, sharding often requires application code to directly or indirectly be aware of the underlying sharding logic, increasing coupling between the application and the database, and hindering maintainability and scalability.

These shortcomings stem from the fact that sharded databases, even with middleware, are fundamentally centralized systems adapted for distributed use. Their core architecture isn't designed for distributed transactions and struggles to meet the demands of a truly distributed environment.

**In contrast, OceanBase Database's native distributed architecture avoids the middleware-based approach to distributed transactions common in sharded systems. Instead, it incorporates distributed principles at its core, from system architecture design to distributed transaction implementation, creating a database truly built for distributed environments.**

OceanBase Database utilizes a partitioned table architecture to achieve horizontal scalability and data management within its native distributed architecture. This fundamentally addresses the complexities associated with traditional sharding approaches, which heavily rely on middleware and intricate partitioning strategies. OceanBase Database's underlying architecture enables data to be distributed across multiple compute nodes (OBServer nodes). Replicas of a partition can reside in different zones, with the Paxos protocol ensuring cross-node data consistency and guaranteeing atomicity, consistency, isolation, and durability (ACID) properties for distributed transactions among replicas. This architecture also supports multi-replica and cross-IDC disaster recovery, providing financial-grade high availability. Furthermore, OceanBase Database simplifies horizontal scaling and capacity adjustments through its internal partitioning mechanism, eliminating the need for users to design and maintain complex sharding strategies, thereby reducing the overall complexity of distributed database design and O&M.

OceanBase Database employs a routing mechanism that shields applications from the underlying logic. Applications interact with the distributed data as if it were a standalone database, without needing to know the physical location of the data. When a client initiates a SQL query, OceanBase Database Proxy (ODP) uses the partitioning key to determine the partition where the requested data resides, and routes the query to an appropriate OBServer node for execution. OceanBase Database transparently handles distributed query execution and transactions, shielding applications from the complexities of sharding. This transparent routing enables applications to remain agnostic to the underlying data distribution. Furthermore, OceanBase Database supports online scaling and data migration, providing flexibility for evolving business needs.

![1726743792](/img/blogs/tech/native-distributed/image/1726743793097.png)

Figure 1: Comparison of a sharding solution with OceanBase Database's native distributed architecture

  

OceanBase Database's native distributed architecture offers several advantages over sharding solutions, resulting in lower costs and improved performance. Its shared-nothing architecture utilizes commodity hardware, eliminating the need for expensive, high-end storage and proprietary licensing fees often associated with sharded deployments. This significantly reduces both hardware and software costs while maximizing resource utilization. Furthermore, OceanBase Database's distributed query optimizer intelligently schedules and executes plans in distributed environments, minimizing cross-node data transfer and processing, thus ensuring high query performance. Features like table partitioning and local indexes further enhance query efficiency and reduce latency.

  

**3. Addressing the Root Cause: An Integrated Architecture for Standalone and Distributed Modes Supports the Entire Lifecycle of Enterprises**
------------------------------

A typical enterprise's database evolution often follows a path driven by increasing scale: starting with small-footprint MySQL deployments for small-scale business, progressing to larger-scale Oracle instances for medium-scale business, then to Oracle RAC for improved scalability in large-scale business, and finally potentially to DB2 on midrange servers for core business.

![1726743852](/img/blogs/tech/native-distributed/image/1726743852693.png)

Figure 2: Database selection strategies based on business scale

This traditional path suffers from several key limitations. First, scalability is inherently constrained, preventing seamless adaptation to fluctuating business demands. Second, each upgrade introduces significant costs and complexity due to extensive hardware and software replacements. Third, this upgrade path is largely irreversible, making it difficult to adapt to unforeseen business changes and potentially leading to substantial sunk costs.

With the release of OceanBase Database V4.0 in 2022 and the introduction of its "integrated architecture for standalone and distributed modes," OceanBase Database began offering a single solution to address the evolving database needs of enterprises across different growth stages and scales. This allows the database to scale seamlessly alongside the business, fulfilling the enterprise need for a database solution that supports their entire lifecycle.

OceanBase Database's integrated architecture for standalone and distributed modes offers two key deployment advantages. First, a single OBServer node can be deployed in either standalone or distributed mode. Second, within a distributed OceanBase cluster, individual tenants can also be deployed in standalone mode. Furthermore, both tenants and the overall cluster can flexibly switch between standalone and distributed deployments as needed.

![1726743883](/img/blogs/tech/native-distributed/image/1726743883873.png)

Figure 3: OceanBase Database's integrated architecture for standalone and distributed modes

As shown in the preceding figure, OceanBase Database's integrated architecture for standalone and distributed modes allows enterprises to flexibly adjust their database deployment at any stage of growth, choosing the model that best suits their current needs.

Initially, enterprises can deploy OceanBase Database on a smaller server. As data grows, they can scale vertically by migrating to a larger server. OceanBase Database supports high availability and disaster recovery through primary/standby and three-replica deployments. For massive data growth, enterprises can seamlessly scale horizontally by expanding the cluster.

While "integrated architecture for standalone and distributed modes" sounds simple, and handling complex distributed transactions might imply ease of standalone deployment, the reality is more nuanced. OceanBase Database's extensive experience in distributed transactional processing (TP), culminating in breaking the TPC-C world record, demonstrates its prowess in distributed transactions. The challenge of an integrated architecture for standalone and distributed modes lies in seamlessly integrating standalone and distributed modes:

**(1) How can database performance in small-scale and standalone deployments be optimized to match that of a dedicated standalone database?**

Distributed systems, due to the large overhead inherent in ensuring atomicity and durability for distributed transactions in log stream design, often underperform standalone centralized databases when handling standalone or small-scale transactions. This performance gap can deter adoption, leading some enterprises to opt for costly vertical scaling of existing hardware rather than migrating to a distributed architecture.

Specifically, log streams are fundamental to ensuring atomicity and durability in database transactions. In distributed databases, protocols like two-phase commit (2PC) are employed to achieve atomicity based on log streams, while consensus algorithms like Paxos guarantee durability. These mechanisms introduce larger overhead compared to standalone databases. Furthermore, multi-point writing in a distributed database results in the generation of multiple log streams. The number of log streams affects the number of participants in 2PC and Paxos consensus, thereby impacting the overhead of distributed transactions.

In typical distributed systems, the number of log streams corresponds to the number of data shards. Larger datasets require more shards, leading to increased overhead and performance degradation for distributed transactions. To achieve standalone performance comparable to traditional standalone databases, reducing the number of log streams is crucial.

OceanBase Database addresses this by tying the number of log streams to the number of nodes. In a standalone deployment, OceanBase Database functions much like a traditional standalone database with a single log stream. During distributed scaling, the number of log streams scales with the number of nodes, significantly mitigating the performance penalty of distribution.

This approach allows OceanBase Database to achieve performance comparable to standalone databases in both standalone and small-scale distributed deployments.

![1726744014](/img/blogs/tech/native-distributed/image/1726744014446.png)

Figure 4: Sysbench performance comparison (4C16G):

OceanBase Database Community Edition V4.0 vs. RDS for MySQL 8.0

As shown in the preceding figure, in a 4C16G environment, Sysbench benchmarks show OceanBase Database V4.0 achieving twice the insert and update performance of MySQL 8.0. Performance in other tested operations is comparable. Furthermore, OceanBase Database demonstrates lower storage costs in standalone deployments. In a TPC-H 100GB benchmark, OceanBase Database V4.0's storage cost was only one-quarter that of MySQL.

**(2) How can we seamlessly switch between standalone and distributed deployments without compromising performance?**

Having addressed performance concerns in both standalone and distributed modes, the next challenge for an integrated architecture for standalone and distributed modes is ensuring seamless horizontal scalability without sacrificing performance.

**Beyond the previously mentioned log stream optimization, which reduces overhead during horizontal scaling by adjusting the number of streams based on the number of nodes, OceanBase Database implements several methods for enhancing scaling performance, both manually and automatically.**

To support scalability and multi-point writes, the distributed database OceanBase Database provides table partitioning, dividing a table's data across multiple partitions. Tables using the same partitioning method can be grouped into a table group. During load balancing, table groups ensure related data resides on the same server, as all tables within a table group are bound to the same log stream. This minimizes cross-server operations, significantly reducing data transfer overhead and improving performance in connection-intensive scenarios. In the ideal case, if all tables involved in a transaction belong to the same table group, the transaction becomes a standalone transaction, eliminating distributed transaction overhead.

OceanBase Database also provides automated scheduling to enhance scaling performance. For instance, it automatically aggregates remote procedure calls (RPCs) and, through automatic load balancing, co-locates partitions involved in a distributed transaction to minimize distributed overhead.

![1726744125](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-09/1726744125429.png)

Figure 5: tpmC values of OceanBase Database varying with different number of nodes in a TPC-C benchmark

The preceding figure shows the tpmC value changes of an OceanBase cluster ranging from 3 to 1,500 nodes in a TPC-C benchmark. The results show that OceanBase cluster performance scales linearly with cluster size even with a 10% distributed transaction workload.

  

**4. Combining Native Distributed Capabilities with an Integrated Architecture for Standalone and Distributed Modes Simplifies Modern Data Architecture Upgrades**
----------------------------------

OceanBase Database's native distributed capabilities and integrated architecture for standalone and distributed modes have been widely adopted to replace sharding solutions and empower enterprises to modernize their data infrastructure.

**💡 Kwai: OceanBase Database Replaces MySQL Sharding to Handle Peak Traffic Loads on a 100+TB Cluster**

Kwai is a short-video mobile application developed by Beijing Kuaishou Technology Co., Ltd. Launched in 2011 as "GIF Kuaishou," a GIF creation and sharing app, it transitioned to a short-video community in 2012 and rebranded as Kwai in 2014. Kuaishou Technology went public on the main board of the Hong Kong Stock Exchange in 2021. By the end of that year, Kwai boasted 308 million daily active users and 544 million monthly active users on average, making it a top short-video platform in China.

Kwai initially relied on MySQL for its database solution. However, as order volumes and business data surged, the performance of its standalone centralized deployment became a bottleneck. Sharding was implemented as a temporary solution to address storage and performance challenges. As the business continued to grow, the number of its MySQL database shards proliferated, eventually exceeding 300. This significantly increased O&M costs and complexity, requiring continuous application modifications to adapt to the ever-increasing number of shards. Kwai recognized that sharding was merely a stopgap measure, not a long-term solution. They needed a database solution that could deliver the required performance while simplifying operations and O&M.

After evaluating various distributed databases, Kwai ultimately selected OceanBase Database and deployed it in core business scenarios.

Take the transaction verification scenario as an example. E-commerce platforms typically experience a stable daily traffic volume of 80,000 to 90,000 queries per second (QPS). However, during large-scale live streaming events, user traffic surges dramatically, increasing QPS by a factor of ten or even a hundred, reaching millions. Even with compression, the data volume can exceed 100 terabytes. Furthermore, during these live streams, the business is extremely sensitive to latency and system stability. Prior to implementing OceanBase Database, transaction verification relied on a MySQL sharded architecture. This involved splitting large tables into smaller shards and distributing read/write traffic across multiple MySQL instances. The inability of this sharded solution to guarantee cross-shard data consistency and transaction atomicity led to potential data inconsistencies, particularly in complex scenarios or during error conditions. This resulted in inaccurate transaction verification results, including missing refunds, incorrect deduction amounts, and ultimately, financial losses.

With OceanBase Database implemented, upstream services continue to write directly to the MySQL cluster. Simultaneously, each write to an upstream MySQL shard is replicated in real time to OceanBase Database via binlog streaming. During transaction verification, queries against the upstream MySQL cluster trigger identical queries against OceanBase Database. The results from both databases are then compared to ensure the accuracy and consistency of order status across the entire financial system.

The figure below illustrates the performance of online transaction verification. The upper-left chart shows the daily QPS, averaging around 90,000. The upper-right chart shows the query response time, generally remaining below 10 ms. The peak of 10,000 ms (10 seconds) occurs nightly during a full compaction, when a dedicated thread is started to delete a substantial volume of historical data. This elevated latency is acceptable to the business. The lower-left chart shows the daily transaction volume, averaging around 10,000 TPS. The lower-right chart shows the transaction response time, which ranges from 5 ms to 10 ms. OceanBase Database delivers the required response time, satisfying latency requirements, and maintains system stability.

![1726744218](/img/blogs/tech/native-distributed/image/1726744218420.png)

Figure 6: OceanBase Database performance for transaction verification at Kwai

**Now, Kwai has deployed eight OceanBase clusters, managing over 800 TB of data across more than 200 servers, with the largest cluster exceeding 400 TB.** Leveraging OceanBase Database , Kwai has achieved flexible resource scaling, reduced data synchronization latency by 75%, significantly lowered storage costs (equivalent to the hardware costs of 50 servers), and achieved disaster recovery with a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of under 8 seconds. A single OceanBase cluster can replace over 300 MySQL instances, dramatically reducing O&M costs.

  

**💡 iFLYTEK: OceanBase Database's Flexible Scaling and Native Distributed Architecture Empower Rapid Business Iteration**

iFLYTEK (SHE: 002230) is a renowned provider of intelligent speech and artificial intelligence solutions in the Asia-Pacific region. Since its inception, iFLYTEK has maintained a leading position in core technologies such as intelligent speech, natural language understanding, and computer vision.

iFLYTEK previously relied on MySQL for its business database. In 2023, a critical new business application launched with initially low volume but subsequently experienced explosive growth, leading to a rapid increase in data volume and disk usage. This application also required multi-dimensional, real-time report analytics for business decision-making, quickly exceeding MySQL's capacity and highlighting the need for greater scalability.

When evaluating database upgrade options, iFLYTEK compared sharding their existing MySQL deployment with adopting a native distributed database. While iFLYTEK had extensive experience with MySQL and a mature O&M infrastructure, sharding would require significant code changes to their applications and increase O&M overhead. Given the rapid iteration and frequent updates of the new business, including the creation and modification of large tables, coupled with the criticality of this phase, minimizing disruption was paramount. Continuing with MySQL and implementing sharding would have necessitated extensive modifications, adding considerable effort.

After extensive evaluation, iFLYTEK selected OceanBase Database to upgrade its existing database infrastructure. Leveraging OceanBase Database's native distributed architecture, iFLYTEK benefited from its scalability, maintainability, hybrid transactional/analytical processing (HTAP) capabilities, high protocol compatibility, and rapid migration capabilities. This enabled iFLYTEK to effectively support the rapid iteration and deployment of its new business systems.

iFLYTEK conducted tpmC performance tests in a production environment, comparing a three-node OceanBase cluster against both a standalone MySQL database and a sharded MySQL database. The test environment utilized SSDs, 96 CPU cores, and 384 GB of memory. Results showed that MySQL slightly outperformed the OceanBase cluster at concurrency levels below 64. However, the OceanBase cluster demonstrated a significant performance advantage beyond 128 concurrent connections. As concurrency increased further, the performance of the OceanBase cluster continued to scale, while MySQL performance peaked at the concurrency of 256.

![1726744283](/img/blogs/tech/native-distributed/image/1726744284269.png)

Figure 6: tpmC performance comparison in stress tests (96C384G):

OceanBase Database vs. MySQL vs. sharded MySQL database

Furthermore, the most time-consuming queries in the system were identified and compared between MySQL and OceanBase Database. The results showed that OceanBase Database outperformed MySQL by a factor of 7 to 40, depending on the complexity of the SQL queries.

**Deployed at iFLYTEK in 2023, OceanBase Database has ensured stable operations while providing flexible scalability and HTAP capabilities. It has also reduced iFLYTEK's storage costs by 50%.**

  

**5. Summary**
----------

While database sharding has been a popular solution for meeting enterprises' requirements for massive data storage and processing in the short term, it often introduces challenges such as maintaining distributed transaction consistency, decreased query performance, increased complexity, tight coupling with application logic, and limited scalability. Sharding addresses the immediate need for increased capacity but fails to provide a long-term solution for achieving high performance in distributed transactions or adapting to evolving business requirements in different development stages of enterprises.

OceanBase Database addresses these challenges through its native distributed architecture, guaranteeing ACID properties for distributed transactions while providing seamless scalability and supporting rapid upgrades without business disruption. Its integrated architecture, combining the strengths of standalone and distributed modes, enables it to adapt to evolving business needs throughout an enterprise's lifecycle, eliminating the need for sharding and its associated complexities.