---
slug: miniaturization
title: 'OceanBase 4.0 interpretation: Reduce the threshold of distributed database use, talk about our thinking on small specifications'
---

> **Author | Zhao Yuzhong, a senior technical expert of OceanBase.** He joined Alipay in 2010 to help with the R&D of the distributed transaction framework, and has engaged in the R&D of storage engines as an OceanBaser since 2013.

With the emergence of more scenarios and the growth of data volume in recent years, distributed databases have rapidly spread across a variety of sectors, providing great solutions for data-intensive and high-concurrency applications with their technical capabilities such as data consistency, high availability, and elastic scaling. A distributed database is often deployed on multiple servers to ensure high availability and performance. Therefore, to handle small-scale simple scenarios in the early days of their business, users tend to deploy a centralized database that costs less and exhibits higher performance if small specifications. The problem is, sooner or later, the centralized database will be bottlenecked as the business size grows, and adjustments or restructuring of the database architecture by then can be extremely challenging and costly.

<!-- truncate -->

OceanBase Database Community Edition V4.0 was released at the Apsara Conference 2022. It is the industry's first MySQL-compatible integrated database that supports both standalone and distributed deployment modes. This version provides many much-expected capabilities, such as enhanced online analytical processing (OLAP) capabilities. Featuring an integrated architecture, it can be deployed in standalone mode with a few clicks and can stably run in a production system with small hardware specifications, such as four CPU cores and 16 GB of memory (4C16G). This reduces the deployment costs and improves its usability. We hope that the dual technical advantages of the integrated architecture can bring perpetual benefits for database users.

According to their feedback, users are highly interested in the integrated architecture of OceanBase Database Community Edition V4.0 and its support for small-specification deployment. We believe that small-specification deployment is not only about providing all necessary features in standalone mode. More importantly, it delivers higher performance with the same hardware configuration. In this article, we will, from the following three perspectives, share our thoughts on small-sized distributed databases, and our innovative ideas and solutions about the integrated architecture that supports both standalone and distributed deployment:

- Reasons for choosing a small-specification distributed database
- Key techniques for small-specification deployment
- Performance of OceanBase databases with small specifications

## I. Why a distributed database with small specifications?

Over the past decade or so since its founding in 2010, OceanBase has broken the world records in TPC-C and TPC-H tests, empowered the Double 11 shopping festival every year, and ensured that every transaction was safely and efficiently executed. Pushing through all kinds of challenges, OceanBase Database, as a fully self-developed native distributed database, has proved its scalability and stability. From OceanBase Database V2.2 that topped the TPC-C ranking for the first time with 203 Elastic Compute Service (ECS) servers, to a later version that took the crown again with 1,554 ECS servers, the performance of OceanBase Database rises linearly with the number of servers.

On the other hand, as OceanBase Database caught the attention from industries other than the financial sector, we realized that not all users were faced by the amount of data comparable to the Double 11. In fact, standalone databases are just enough to tick all the boxes of many users in the early days of their business, when the data volume is rather small. Therefore, it is a great help to provide minimal database specifications for users to begin with. In this way, users are able to break in at very low costs. Also, with the great scalability of OceanBase Database, users can flexibly scale out their database systems later to take care of the increasing data volume and performance requirements.

**▋ From small to large: Basic database requirements in a business that grows**

The latest OceanBase Database V4.0 supports a minimum deployment specification of 4C8G. What does 4C8G mean? It's just a typical configuration of a nice laptop. In other words, OceanBase Database V4.0 can be deployed and stably run on a personal computer.

As user business grows, OceanBase Database V4.0 can be scaled out to support changing needs over the entire lifecycle of the business. OceanBase Database V4.0 helps users find better solutions to cost reduction, efficiency improvement, and business innovation.

- In its early days, user business handles small amount of data and has few requirements on disaster recovery. The user can deploy and run OceanBase Database V4.0 on a single server and perform cold backup regularly to protect its data system from possible disasters.
- As its business grows, the user can vertically scale up the specifications of the existing server. To meet its requirements on disaster recovery, the user can add another server to build a primary/standby architecture, which provides the online disaster recovery capability. (Manual intervention is still required during disaster recovery due to the limits of the primary/standby architecture.)
- When its business expands to certain size and data becomes more important, the user can simply upgrade to the three-replica architecture, which ensures high availability with three servers and supports automatic disaster recovery. When a server fails, the three-replica architecture of OceanBase Database V4.0 guarantees business recovery in 8s with zero data loss. In other words, the recovery time objective (RTO) is less than 8s and the recovery point objective (RPO) is 0.
- When user business experiences even greater growth and each server has been upgraded to the highest configurations, the user has to deal with this "happy trouble" as Taobao and Alipay did. In this case, the transparent distributed scalability of OceanBase Database allows the user to scale its cluster out from 3 to 6, 9 or even thousands of servers.

![image.png](https://s2.loli.net/2024/06/04/gLRmXzs5VMCBT1A.webp)

Figure 1 Deployment evolution: OceanBase Database vs conventional databases

**▋ Smooth transitions that ensure linear performance improvement**

The integrated architecture of OceanBase Database supports smooth transition from standalone to distributed multi-cluster deployment mode, keeping the performance improvement at a linear speed.

Thanks to the good vertical scalability of OceanBase Database, the configuration upgrade of the server in standalone mode usually achieves linear performance improvement. When a user scales a distributed cluster from 3 to 6 servers, for example, distributed transactions are often introduced, which, in most cases, results in performance loss. However, OceanBase Database reduces the probability of distributed transactions through a variety of mechanisms, such as the TableGroup mechanism that binds multiple tables together, and the well-designed load balancing strategies.

The good distributed scalability of OceanBase Database also helps maintain linear performance improvement as the number of servers increases. For example, in the TPC-C test, which involves about 10% of distributed transactions, the performance improvement of OceanBase Database remained linear as more nodes were added to the cluster.

![](https://gw.alipayobjects.com/zos/oceanbase/f419efdd-d5b7-4a33-9afe-c7e0107c71f5/image/2023-01-11/d6979385-99d3-4ed9-a378-d2a8962e3342.png)

Figure 2 Performance of OceanBase Database with different number of nodes in the TPC-C test

More importantly, all operations performed in scaling from a standalone OceanBase database to an OceanBase cluster of thousands of nodes are transparent to the business. Users do not need to modify the code of their upper-level business applications, or manually migrate their operation data. If you use OceanBase Cloud, you can perform backup, scaling, and O&M operations all on the same platform, which is quite convenient.

From the first day of the development of OceanBase Database V4.0, we have been thinking about how to run a distributed database on small-specification hardware, yet delivering high performance, so that users benefit from cost-effective high availability in their respective scenarios. OceanBase Database V4.0 not only provides all necessary features in standalone mode, and also delivers higher performance with the same hardware configuration.

## II. Key techniques for small-specification deployment

In the fundamental software sector, it is very hard to make a database system "large" because the system will be increasingly vulnerable to failures as more nodes are added to it. In our second TPC-C test, for example, we built an OceanBase cluster of 1,554 Elastic Compute Service (ECS) servers. In such a cluster, the frequency of a single-server failure is about once a day or every other day. The point is we have to make the product sufficiently stable and highly available to keep such a jumbo-sized cluster up and running.

It is equally hard to make a database system "small" because it requires getting down to every detail, much like using a microscope to arrange the usage of every slice of resource. Not only that, some proper designs or configurations in a large system may be totally unacceptable in a smaller one. What's more challenging is that we must make the system suitable for both large and small hardware specifications. This requires us to weigh up between large and small specifications when designing the database system, so as to minimize the additional overhead of a distributed architecture while allowing the database system to make adaptive response according to hardware specifications in many scenarios. Now, let's talk about the technical solution of OceanBase Database V4.0 by taking the usage of CPU and memory, the two major challenges, as an example.

**▋ Reducing CPU utilization through dynamic control of log streams**

To build a small database, OceanBase Database V4.0 needs to control the CPU utilization in the first place. In versions earlier than V4.0, OceanBase Database would generate a Paxos log stream for each partition of a data table to ensure the data consistency among multiple replicas based on the Paxos protocol. This is a very flexible design because Paxos groups are based on partitions, which means that partitions can be migrated between servers. However, this design puts heavy workload on the CPU because each Paxos log stream consumes overhead for leader selection, heartbeat, and log synchronization. Such additional overhead occupies a moderate percentage of the CPU resource if servers have large specifications, or the number of partitions is small, but causes an unbearable burden for small-specification servers.

How do we solve that issue in OceanBase Database V4.0? We go straight-forward and reduce the number of Paxos log streams. If we can reduce the number of Paxos log streams to the same as that of servers, the overhead for Paxos log streams is roughly equal to that for logs in a conventional database in the primary/standby mode.

![](https://gw.alipayobjects.com/zos/oceanbase/a248fea2-2640-432c-8c0e-68f394e9611b/image/2023-01-11/5830c47b-96eb-4303-9398-8f1b080610a4.png)

Figure 3 Dynamic log streams of a cluster based on OceanBase Database V4.0

OceanBase Database V4.0 generates a Paxos log stream for multiple data table partitions and dynamically controls the log streams. As shown in the figure above, the database cluster consists of three zones, and each zone has two servers deployed. Assume that two resource units are configured for a tenant. In this case, two Paxos log streams are generated for the tenant, with one containing P1, P2, P3, and P4 partitions and the other containing P5 and P6 partitions.

- When the two servers are not load-balanced, the load balancing module of OceanBase Database migrates the partitions between the Paxos log streams.

- To scale out the cluster, a user can split one Paxos log stream into multiple Paxos log streams and migrate them as a whole.

- To scale in the cluster, the user can migrate multiple Paxos log streams and merge the streams.

With dynamic log stream control, OceanBase Database V4.0 greatly reduces the CPU overhead of the distributed architecture and guarantees high availability and flexible scaling.

**▋ Achieving high concurrency with a small memory space through dynamic metadata loading**

The second challenge that OceanBase Database V4.0 needs to take in building a small database is to optimize memory usage. For the sake of performance, OceanBase Database of versions earlier than V4.0 stored some metadata in memory. The memory usage of this portion of metadata was not high if the total memory size was large, but unacceptable for a small-specification server. To support ultimate performance at small specifications, we have achieved dynamic loading of all metadata in OceanBase Database V4.0.

![5D9183AF-7D02-40D3-8EAE-2173F2025126.png](https://s2.loli.net/2024/06/04/q4N9U5Vz2GAQHTM.png)

Figure 4 SSTable hierarchical storage

As shown in the figure above, we store an SSTable in a hierarchical structure. To be specific, we store the microblocks of the SSTable in partitions and maintain only the handle of the partitions in memory. The requested data is dynamically loaded by using KVCache only when the partitions need to be accessed. In this way, OceanBase Database V4.0 is capable of processing highly concurrent requests for massive amount of data with a small memory size.

## III. Performance of databases with small specifications

To test the actual performance of OceanBase Database with small specifications, we deployed OceanBase Database Community Edition V4.0 in 1:1:1 mode based on three 4C16G servers and compared its performance with that of RDS for MySQL 8.0, which was also deployed on 4C16G servers. The comparison was performed by using Sysbench and the results show that OceanBase Database Community Edition V4.0 outperforms RDS for MySQL 8.0 in most data processing scenarios. In particular, under the same hardware specifications, OceanBase Database Community Edition V4.0 handles a throughput 1.9 times that of RDS for MySQL 8.0 in INSERT and UPDATE operations.

![](https://gw.alipayobjects.com/zos/oceanbase/22580914-c626-4968-b2ec-14b36e73a7dc/image/2023-01-11/74429483-aee7-4cb6-9cdf-0f5c43646d01.png)

Figure 5 Throughput performance test results of OceanBase Database Community Edition V4.0 and RDS for MySQL 8.0 on Sysbench (4C16G)

We also compared the two at specifications of 8C32G, 16C64G, and 32C128G, which are most popular among users. As the server specifications increase, the performance gap widens between OceanBase Database Community Edition V4.0 and RDS for MySQL 8.0. At 32C128G specifications, OceanBase Database Community Edition V4.0 achieves a throughput 4.3 times that of RDS for MySQL 8.0 with 75% less response time.

![](https://gw.alipayobjects.com/zos/oceanbase/9a3fa66e-7716-48e3-bcf2-82735c4726c9/image/2023-01-11/b4324d1e-6bd1-48cb-9ccc-c100cca6aae6.png)

Figure 6 Throughput performance test results of OceanBase Database Community Edition V4.0 and RDS for MySQL 8.0 on Sysbench

![lQLPJyDF79Hqr-3NBTjNDHCwRri-CRupihMGSPeKlXwaAA_3184_1336.png](https://s2.loli.net/2024/06/04/vLwU6FWcVfNKy7M.png)

Table 1 Performance (throughput and response time) test results of OceanBase Database Community Edition V4.0 and RDS for MySQL 8.0 on Sysbench

## Afterword

OceanBase Database has achieved ultimate performance in the TPC-C test with a massive cluster of more than a thousand servers, and ultimate resource usage in standalone performance tests at small specifications, such as 4C16G. What's behind those achievements is our unshakable faith in our mission to make data management and use easier. Streamlining services for customers with every effort is the motto of every OceanBase engineer. Growing fast, OceanBase Database is not yet perfect. We still have a lot to do to optimize its performance with higher specifications and save more resources in a database with even smaller specifications. OceanBase Database Community Edition V4.0 is now available and we are looking forward to working with all users to build a general database system that is easier to use.

Welcome to [OceanBase Community](https://open.oceanbase.com/blog). We will keep generating useful content, and pursue excellence together with tens of millions of developers.

🔍Join us on DingTalk (Group ID: 33254054), or scan the QR code below to contact OceanBase Technical Support. We are ready to answer all questions about our products.

![](https://gw.alipayobjects.com/zos/oceanbase/f4d95b17-3494-4004-8295-09ab4e649b68/image/2022-08-29/00ff7894-c260-446d-939d-f98aa6648760.png)
