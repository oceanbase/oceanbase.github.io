---
slug: Loong-Airlines
title: 'HTAP Practice of Loong Airlines: Unified Technology Stack for Efficient Online Services and A Lightweight Real-Time Data Warehouse'
tags:
  - User Case
---

> **About the author:** Lu Qiuxiao, System Operations Engineer at Loong Airlines

## Database HTAP Capabilities Required for the Aviation Business

Zhejiang Loong Airlines Co., Ltd., the only airline headquartered in Zhejiang Province, China, provides public passenger and cargo services. It holds all domestic and international air transport licenses, and has developed into a medium-large sized airline ranking among the largest private airlines in China. Since its founding in 2011, it has operated up to 600 domestic and international passenger and cargo routes, covering the entire Chinese mainland and reaching over 170 cities in regions along the "Belt and Road" routes, such as Hong Kong, Macau, Japan, South Korea, Southeast Asia, and Central Asia.

Efficient data management and a reliable database system are key factors for successful modern aviation operations. Loong Airlines needs to process a significant amount of data, including flight information, ticket sales data, customer information, and seat allocation data. Its business not only has high demands for online transaction processing (OLTP) but also requires advanced online analytical processing (OLAP) of T+N, T+1, and even T+0 data, emphasizing real-time data handling and reliable data analysis. Our original database, based on a master-slave mode, posed risks to business continuity in case of faults and could not process or analyze data in real time. This drove us to seek new database solutions.

## Research on the HTAP Capabilities of OceanBase Database

Our market research results indicated that OceanBase Database offers excellent performance and reliability for both OLTP and OLAP without the need to build two systems. So, we delved into key factors such as scalability, performance, data security, and reliability based on our business system requirements.

**1. Distributed architecture and scalability**

Our extensive aviation business requires the database system to handle massive amounts of data and concurrent requests. OceanBase Database can be deployed in a distributed architecture, which stores data across multiple nodes. We can easily add more nodes to cope with growing data volume.

![1704793000](/img/blogs/users/Loong-Airlines/image/1704793000832.png)

**2. High performance and complex queries**

We often need to retrieve and analyze data based on multiple conditions and metrics to provide accurate flight information and sales data. The SQL layer of OceanBase Database efficiently handles complex queries and returns results in a short time, thanks to its SQL optimizer and execution engine.

The SQL optimizer of OceanBase Database rewrites SQL queries based on rules and cost models, generating and selecting optimal query rewrite plans. It also optimizes various plans in distributed processing scenarios.

![1704793014](/img/blogs/users/Loong-Airlines/image/1704793014642.png)

The SQL execution engine of OceanBase Database supports parallel execution and vectorized computing. Using the parallel execution framework, it adaptively handles both parallel execution on a standalone server and distributed parallel execution. While serial execution suffices for small business, OceanBase Database supports parallel execution on a standalone server when a large amount of data is involved. Many open source standalone databases lack this capability. However, with sufficient CPU resources, the processing time of an SQL query can be linearly reduced by parallel execution in OceanBase Database. For distributed execution plans in the same form, OceanBase Database can execute them in parallel on multiple servers to process larger amounts of data. It breaks the performance bottleneck limited by the number of CPU cores of a single server, allowing us to scale up to hundreds or even thousands of CPU cores.

![1704793030](/img/blogs/users/Loong-Airlines/image/1704793030493.png)

Furthermore, OceanBase Database handles both OLAP and OLTP requests within a single cluster, and resource isolation therefore is crucial. OceanBase Database provides various resource isolation methods, such as physical isolation of multiple zones and isolation of database connections based on CPU resource groups. It also automatically identifies and isolates slow queries to prevent them from affecting the overall transaction response time.

![1704793067](/img/blogs/users/Loong-Airlines/image/1704793067111.png)

**3. Data security and reliability**

Airlines have stringent requirements for data security and reliability, and must ensure data safety and system reliability to avoid downtime. OceanBase Database ensures data integrity and reliability through multi-layered security measures, such as data backup, fault recovery, and fault tolerance mechanisms.

To better support the storage, queries, and modifications of our ticket data, we decided to build the core database system of our new business based on OceanBase Database.

## Aviation Business Efficiency Improved by HTAP Capabilities

### 1. Benefits: real-time, smooth, reliable, and cost-effective data processing

a. Unified technology stack with enhanced real-time analysis capabilities

As shown in the following figure, OceanBase Database is everywhere in the system, serving multiple roles within the ticketing architecture and providing robust data management and analysis capabilities.

![1704793089](/img/blogs/users/Loong-Airlines/image/1704793089912.png)

The data collection layer collects data from multiple sources in real time and aggregates the data in OceanBase Database. The preprocessing layer cleanses business data, while the operational data store (ODS) layer performs data modeling and stores the results in OceanBase Database. Finally, the service and publishing layer provides AP and TP results from OceanBase Database to various business applications through APIs for cross-system data calls.

The high-performance query engine and distributed computing framework of OceanBase Database provide exceptional data processing and analysis capabilities, allowing us to swiftly conduct large-scale data analysis and respond to complex queries in real time. As AP and TP requests are handled in a single database system to produce accurate outcomes in real time, we can make more informed strategic decisions. From passenger behavior analysis to flight scheduling and resource management, OceanBase Database has streamlined our data processing workflows, making them more efficient and stable.

b. Stable and reliable operations with zero downtime

Since the launch of OceanBase Database, our system has been running with zero downtime. OceanBase Database not only ensures system stability and reliability but also facilitates seamless business operations by enabling smooth integration between different business units, allowing for uninterrupted data flow. This has significantly reduced potential downtime and business risks.

c. 70% reduction in storage costs

Thanks to the outstanding data processing and compression capabilities of OceanBase Database, we achieved a 70% reduction in storage costs after migrating business from MySQL to OceanBase Database.

In addition to lower storage costs, OceanBase Database offers other benefits, such as high scalability of its distributed architecture, data security, and simplified O&M due to its hybrid transaction/analytical processing (HTAP) capabilities. It provides us with a reliable data management solution, thus enhancing our operational efficiency and competitive edge.

### 2. Lessons learned: disk IOPS optimization

We deployed and comprehensively tested OceanBase Database based on the official documentation and, with satisfactory results, introduced it into our production environment. However, lacking familiarity with the database product, we began experiencing a regular spike in disk IOPS at 22:00 every day after a few months of operation, when a considerable amount of data had been accumulated.

![1704793121](/img/blogs/users/Loong-Airlines/image/1704793121478.png)

When troubleshooting with OceanBase Technical Support, we identified several issues with our cluster deployment.

*   We stored the /redo, /log, and /data directories on the same disk, rather than physically isolating them. The /redo directory in particular has high I/O performance requirements.
*   Instead of SSDs, we installed HDDs, which provided unsatisfactory disk I/O capabilities. OceanBase Technical Support recommended SSDs for production environments because HDDs might result in performance bottlenecks during a major compaction in the backend.
*   We set the primary\_zone parameter of tenants to zone1, so that all leader replicas were stored on the same server, which became a read/write hotspot.

With the help of OceanBase Technical Support, we physically separated the /redo, /log, and /data directories by migrating them to different disks. This avoids contention of disk I/O resources and ensures optimal I/O performance for each directory.

We also optimized parameter settings, especially the connection timeout, single-transaction time, and log level parameters, and managed accounts of our self-built operating system in OceanBase Cloud Platform (OCP).

The optimization measures brought a significant improvement in system performance with stable and efficient operations.

## Vision for the Future

As our aviation business continues to grow and data volume increases, we will further expand the application scope of OceanBase Database. We will leverage its high scalability to enhance the system capacity and performance by adding more nodes as needed. To access the latest features and optimizations, we will also keep a close eye on the technological updates of OceanBase Database, and will collaborate with the OceanBase community.

We believe that OceanBase Database, as an efficient and reliable distributed database product developed by a Chinese company, its successful application in our aviation ticketing system has set an example for companies in other industries. By optimizing our business data management and analysis capabilities based on OceanBase Database, we can further reduce O&M and storage costs while boosting business processing efficiency.