---
slug: Zuoyebang
title: 'How Zuoyebang Leverages OceanBase Database for Business Success'
tags:
  - User Case
---

About the author: Liu Qiang, a member of Zuoyebang's infrastructure database administrator (DBA) team, works on the exploration and implementation of distributed databases. He collaborates with the R&D team in promoting the deployment of distributed databases in Zuoyebang's business system.

Major Vulnerabilities in the Original Core Business Architecture
-----------

Founded in 2015, Zuoyebang is committed to promoting inclusive education through technology. Using technologies such as AI and big data, Zuoyebang provides learning solutions, educational resources, and smart hardware to students, teachers, and parents.

In its early stages, Zuoyebang deployed a MySQL database based on Alibaba Cloud Elastic Compute Service (ECS) and leveraged a self-managed Database as a Service (DBasS) platform to support rapid business growth. This data architecture offered stable online transaction processing (OLTP) performance, but its limitations became apparent as the volume of business data exponentially grew.

![1705572847](/img/blogs/users/Zuoyebang/1705572847250.png)

Vulnerability 1: High cost of scaling with a distributed architecture

When a standalone MySQL cluster reaches its performance bottleneck in handling the read load of an application, a common solution is to restructure the standalone MySQL cluster into a distributed architecture using sharding. However, this solution introduces significant restructuring costs. Every data architecture scaling requires extensive changes from both the business and DBA teams, making this trade-off of engineering effort for core business stability unsustainable for the rapid growth of the application.

Vulnerability 2: Lack of on-demand scalability

To accommodate business growth, Zuoyebang sharded its initial standalone MySQL cluster into eight sharded clusters using its current distributed MySQL solution. This has resulted in significant resource waste and challenges with data balancing across the shards.

Vulnerability 3: Data architecture limitations

The original MySQL architecture could handle only a subset of core OLTP workloads and lacked real-time data analysis capabilities, hindering further business development. Zuoyebang required a solution capable of handling both OLTP and online analytical processing (OLAP) workloads while ensuring resource isolation between them.

Vulnerability 4: Inflexible data storage strategies

The redundant and bulky distributed MySQL architecture made it difficult to promptly adjust data storage strategies in response to evolving data compliance requirements. Zuoyebang required a solution that enables agile storage adjustments while maintaining strong data consistency.

Core Business Enhancement with an HTAP Architecture to Support Diverse Workloads
--------------------

To fix the aforementioned architectural vulnerabilities, the DBA and architecture teams thoroughly investigated several database products.

Among others, OceanBase Database V4.x offers a compelling solution with its native distributed architecture, hybrid transactional/analytical processing (HTAP) capabilities, multitenancy, high data compression, and comprehensive ecosystem, directly tackling these vulnerabilities.

1\. A native distributed architecture that allows for strong data consistency and auto scaling

The native distributed architecture of OceanBase Database offers seamless scalability, eliminating the complexities of sharding and enabling us to easily adapt to changing capacity needs. Leveraging the Paxos protocol and full data checksumming, OceanBase Database ensures strong data consistency between replicas and zero data loss. It can recover from a failure within 8 seconds. During the proof of concept (POC) stage, Zuoyebang tested the scalability and disaster recovery performance of OceanBase Database by upgrading the architecture from a 1-1-1 configuration (one node per zone across three zones) to a 2-2-2 configuration. The business remained stable throughout the data rebalancing process across OBServer nodes.

2\. A unified engine for HTAP workloads

OceanBase Database adopts a hybrid row-column storage architecture and a unified engine to handle both OLAP and OLTP workloads. This allows OceanBase Database to handle transactional processing while responding to analytical queries and batch processing within seconds. To ensure resource isolation in HTAP scenarios, OceanBase Database provides several mechanisms, such as large queues for AP queries, SQL statement-level resource binding within a tenant, and read-only replicas. Zuoyebang tested its performance in a typical scenario, where a dataset of more than one million rows was used for 10 to 20 concurrent aggregate queries. The test results showed that OceanBase Database responded to analytical queries within milliseconds, demonstrating performance dozens of times faster than MySQL Database without impacting core tractional processing performance.

![1705572913](/img/blogs/users/Zuoyebang/1705572913705.png)

![1705572925](/img/blogs/users/Zuoyebang/1705572925497.png)

3\. Multitenancy and high data compression

Zuoyebang leveraged the multitenancy architecture of the OceanBase cluster to handle all requests of the eight MySQL clusters. By selecting appropriate tenant specifications, Zuoyebang maximized resource utilization while maintaining tenant isolation. The high compression ratio provided by the storage engine of OceanBase Database helps greatly reduce the storage costs. The original 900 GB of data spread across the MySQL clusters (each with one primary and two secondaries) was compressed to only 170 GB in a three-replica OceanBase cluster, saving more than 60% of storage costs. For equivalent workloads, OceanBase Database with the multitenancy architecture required less than 20% of the resources consumed by MySQL. A minimal OceanBase tenant required only 3 CPU cores and 12 GB of memory per zone, while a MySQL node exclusively occupied 32 CPU cores and 256 GB of memory.

![1705572941](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705572941063.png)

![1705572952](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705572952399.png)

  

4\. A comprehensive ecosystem

OceanBase Database provides a rich ecosystem of tools. In addition to its self-managed O&M platforms, such as OceanBase Cloud Platform (OCP), OceanBase Developer Center (ODC), and OceanBase Migration Services (OMS), it is also compatible with more than 400 upstream and downstream tools.

![1705572965](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705572965174.png)

![1705572974](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705572974435.png)

The above-mentioned tools facilitate real-time migration, integration of migration and synchronization tasks, and visualized cluster lifecycle management, development management, and end-to-end diagnostics. This comprehensive toolset enables a phased architecture upgrade solution that supports rollback, monitoring, and canary release.

After careful consideration, we chose OceanBase Database as the core database for architecture upgrade, and designed and implemented the new architecture.

Benefits of Applying the OceanBase Database-based HTAP architecture
-------------------------

The following figure shows our new architecture incorporating OceanBase Database. Write traffic is directed to the sharded MySQL clusters. OMS then synchronizes both full and incremental data to MySQL tenants of the downstream OceanBase cluster in real time. Data is verified in the synchronization process.

![1705573025](/img/blogs/users/Zuoyebang/1705573025416.png)

Leveraging the HTAP capabilities of OceanBase Database, we can directly use online databases for real-time data analysis to support our marketing decision-making, eliminating the need for T+1 data. We have not only maintained the stability of online core business, but also overcome the business challenges. Later, we will gradually migrate the business traffic to OceanBase Database or, if necessary, roll it back to the MySQL clusters.

![1705573033](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705573033759.png)

Since implementing OceanBase Database, our business system has achieved significant architectural advantages and valuable practical benefits.

First, we have achieved a greater than 60% reduction in storage costs, a more than four-fold improvement in real-time analysis performance, and a 77.8% reduction in hardware costs compared to our previous MySQL deployment.

Second, OceanBase Database uses a unified engine for both OLTP and OLAP workloads, stably supporting our core business while simultaneously handling real-time analytical requests. The auto DOP feature significantly boosts AP performance. In two data analysis tests that involve complex SQL statements for AP queries on millions of data rows, the response speed was improved by several times. The time consumed was reduced from 4.6 to 0.8 seconds in one test, and from 1.8 to 0.24 seconds in the other test. If you have sufficient resources to support higher performance, you can try the DBLink feature, which supports cross-tenant queries.

![1705573076](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705573076846.png)

![1705573069](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705573068981.png)

![1705573090](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-01/1705573090601.png)

Finally, a comprehensive and convenient ecosystem not only relieves the workload of business and O&M staff, but also saves O&M and development costs.

By the way, let me share with you some experience in using OMS:

* A data synchronization task of OMS handles around 1,000 requests per second (RPS) per concurrent thread. This throughput can be lower if individual records are large, especially if they contain large object (LOB) fields. In general, you need to allocate 1 GB of memory for each concurrent thread. If you allocate insufficient memory for a large number of concurrent threads, the RPS may be significantly reduced due to full garbage collection (GC).
* In most cases, OMS requires 4 CPU cores and 8 GB of memory to create a synchronization link. If the memory usage of a server exceeds 80%, the link creation fails. In this case, you can increase the memory size of the server.
* You can check the RPS metric within the details of a specific data synchronization task of OMS to track the data synchronization speed.

Migration of Core Business to OceanBase Database
-----------------

We have successfully implemented an OceanBase Database-based solution. Moving forward, we will expand our use of OceanBase Database and invest more efforts in optimizing the solution.

* Try to build a multi-region disaster recovery architecture, ensure data compliance while meeting the data aggregation requirements, and further explore the primary/standby cluster solution of OceanBase Database.
* Gradually migrate the core business traffic from MySQL to OceanBase Database, so that our business will no longer be affected by the vulnerabilities of the sharded architecture. Use the data subscription feature of OMS to transmit data to the data lake, creating a closed-loop data management system.
* Build an integrated data development platform based on ODC to streamline collaboration between developers and DBAs. Investigate the row-level recycle bin feature of OceanBase Database to enhance business stability and data fault tolerance.