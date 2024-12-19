---
slug: storage-engine
title: 'Storage Engine of OceanBase Database V4.x Cuts Historical Database Costs by over 50%'
---

According to a report by International Data Corporation (IDC), by 2025, 180 ZB of data will be generated globally, driving an even greater demand of enterprises for massive data processing. Enterprises are exploring more cost-effective and efficient ways to process data, especially in historical databases.

Enterprises produce data since their establishment, and continuously archive the historical data into their storage systems. As the data volume grows, some storage systems face challenges such as limited scalability, performance degradation, and even lags, which disrupt business operations and increase data processing costs. Therefore, a data management system that features low cost, high efficiency, and high scalability is essential for enterprises.

OceanBase Database has helped enterprises halve their historical database costs. So, what are the core technologies behind OceanBase Database? This article explains the storage engine of OceanBase Database for the first time.

Slashing Resource Costs with a Storage Engine Supporting All Business Phases
----------------------

As shown in the following figure, a conventional standalone MySQL database with a small specification suffices for the business needs of an enterprise at its early stages. However, as the business grows, MySQL struggles to meet increasing performance and storage demands. Then, many enterprises choose to upgrade to high-specification Oracle databases. When even more data has been generated, enterprises will consider using Oracle Real Application Clusters (RAC) with shared storage or even switching their core business to databases of other types such as DB2. However, replacing a data system, a fundamental part for their business, can incur business disruption and additional costs. By contrast, if the data system is scalable, both the costs and risks can be greatly reduced. Is there a data system that suits the varying data management requirements of all business scales? 

![1694074532](/img/blogs/tech/storage-engine/1694074532826.png)

The answer is yes. OceanBase Database V4.0 adopts an integrated architecture that supports both standalone and distributed deployment to meet the business requirements in different phases. This architecture has the scalability of a distributed database, and the features and performance of a standalone database. With dynamic log streams, the system achieves high standalone performance in static mode, as well as smooth and rapid scalability by dynamically adjusting log streams. The resource-efficient and lightweight design of the storage engine allows it to support OceanBase Database deployed in different modes, enabling effortless and smooth handling of both small and large data volumes.

Therefore, a standalone, small-specification OceanBase Database instance will suffice for small-scale business generating small amount of data. As more business data is generated, you only need to scale up the tenant specification. If the business requires disaster recovery or load balancing, you can easily switch OceanBase Database to three-replica mode. The data of each replica is highly compressed in storage, which offsets the costs incurred by storing multiple replicas. When the business scale becomes large, you only need to scale out the cluster. This is the benefit of the integrated architecture of OceanBase Database.

Additionally, the storage engine of OceanBase Database V4.x is more lightweight, compact, and scalable in resource management, empowering enterprises to use resources more efficiently and cost-effectively.

On-Demand Loading of Small-sized Metadata for Higher Resource Utilization with Each Instance Supporting Millions of Partitions
-----------------------------

The OceanBase team has introduced the innovative concept of log streams to reduce the network and CPU overhead in scenarios involving a large number of partitions. The replicas of each partition constitute a Paxos group to ensure data consistency. To reduce the consensus protocol overhead in multi-partition or small-specification scenarios, the logs of the partitions in the same Paxos group are aggregated as a single log stream. This way, the disaster recovery and high availability of a group of partition replicas can be achieved based on the synchronization and election of one log stream.

The storage engine of OceanBase Database supports on-demand metadata loading, which intelligently distinguishes between hot and cold partitions and identifies necessary metadata to greatly reduce memory usage in massive data scenarios.

As shown in the following figure, a log stream consists of multiple tablets. A tablet is similar to a partition of a user table. It is the basic unit for load balancing and disaster recovery in a distributed system. The number of tablets is exponentially greater than that of log streams due to limited topology of the availability zones in a cluster. However, a cluster may contain tens of thousands of partitions, depending on the business needs.

![1694074545](/img/blogs/tech/storage-engine/1694074545569.png)

In OceanBase Database V4.x, the storage engine loads metadata on demand instead of storing the metadata of all partitions in memory. Metadata provides the basic attributes of partition replicas to support standalone and distributed features such as CREATE, READ, UPDATE, and DELETE (CRUD) operations, changes to the log-structured merge-tree (LSM-tree), load balancing, and disaster recovery. On-demand loading refers to the process of retaining the metadata of hot partitions in memory without loading cold partitions or their metadata. This technique maximizes memory usage efficiency. In earlier versions, metadata for 50,000 partitions requires an estimated 600 MB of memory. In OceanBase Database V4.x, metadata for 1 million partitions requires only 200 MB of memory. This way, a small-specification server can support more partitions. For example, in scenarios where historical databases are partitioned by time, more historical data can be stored without the need to scale up the server.

In OceanBase Database of earlier versions, the metadata of data blocks for querying hot and cold data is stored in memory. A 5-TB table requires an estimated 5 GB of memory for a cold startup. However, if the data volume of the table or partition increases, it is hard to proportionally allocate more memory to support data queries because the memory is limited.

As historical databases typically involve heavy writes, minimal reads, and ultra-large tables, enterprises often use servers with small memory and large disks to reduce costs. For this reason, the storage engine of OceanBase Database V4.x has reconstructed the storage format of SSTables on disks. Specifically, the storage engine changes the flat index layer (a type of metadata) that locates macroblocks based on primary keys into a tree structure. This way, the metadata for querying data no longer resides in memory. Instead, the storage engine dynamically loads related microblocks based on the query load. With the new structure, the cold startup of a 5-TB table requires no greater than 24 KB of memory. The increasing data volume can hardly affect the memory usage of a standalone instance. This further reduces the memory costs of historical databases. 

![1694074554](/img/blogs/tech/storage-engine/1694074554357.png)

More Flexible Disk I/O Isolation Strategies for More Secure and Efficient Resource Utilization
--------------------------

The storage engine of OceanBase Database offers a full set of syntax for configuring the maximum or minimum IOPS and the weight of each tenant. This enables you to flexibly allocate I/O resources for tenants, further balance traffic during peak and off-peak hours to meet disk performance requirements, and reduce costs.

As shown in the following figure, the maximum IOPS of Tenant 4 (blue line) is limited to 5,000 to prevent the concurrent traffic from affecting other tenants. As Tenant 1 (red line) and Tenant 2 (green line) have high IOPS demands, their maximum IOPS is limited to 100,000, and their weight ratio is set to 2:1 to control their traffic ratio. What will happen if you add Tenant 3 (yellow line) to the cluster? Tenant 4 is unaffected because its maximum IOPS is limited. Tenants 1 and 2 can lend IOPS resources to Tenant 3 based on their weight ratio. This way, inter-tenant isolation is achieved.

![1694074568](/img/blogs/tech/storage-engine/1694074568063.png)

OceanBase Database also supports intra-tenant isolation. Why is intra-tenant isolation necessary?

Here are two scenarios: In a hybrid transaction/analytical processing (HTAP) scenario that involves both transaction processing (TP) and analytical processing (AP), intra-tenant isolation prevents latency-sensitive TP requests from being disrupted and maintains the stability of normal business traffic. In a scenario where foreground traffic must be isolated from background traffic, poor background traffic isolation can affect foreground query requests, leading to noticeable fluctuations. Intra-tenant isolation ensures secure and efficient resource utilization in HTAP scenarios. For example, A, B, C, and D in the following figure represent different loads. As MIN_PERCENT of B is set to 97%, its IOPS, although being the lowest, is not expected to drop below the blue line. As C has a weight of 50 and D has a weight of 25, their IOPS is always in a ratio of 2:1, as shown in the following figure.

![1694074581](/img/blogs/tech/storage-engine/1694074581349.png)

Optimized Compaction Mechanism for Mitigated Space Amplification and Reduced Disk Overhead
------------------------

Data compaction in the storage engine consumes a great deal of system resources. It has been one of the most researched technology for LSM-tree systems. Vendors have their own optimization solutions for a trade-off among read amplification, write amplification, and space amplification. Effective use of the compaction technology can save more computing resources, allowing more business requests to be processed and improving cost-effectiveness. After more than a decade of in-house development and research, the OceanBase Database team has effectively increased the computing performance of compaction and reduced the costs of resources such as disk space.

The storage engine of OceanBase Database leverages the well-known Tiered & Leveled policy to support different compaction methods based on factors such as transaction characteristics, data patterns, and resource dependencies.

Unlike the multi-level optimizations in RocksDB, Cassandra, and other systems, the LSM-tree architecture has only three levels of persistent SSTables, as shown in the following figure. Each level serves specific purposes. L0, with a low-overhead and quick data processing logic, is designed to rapidly release memory. L1 aims to eliminate read amplification and reduce disk overheads caused by data overlaps, including spatial data redundancy and temporal version redundancy. L2 not only resolves space amplification but also performs complex transactional and distributed tasks such as data validation, reclamation, and compression.

![1694074592](/img/blogs/tech/storage-engine/1694074592358.png)

Based on an in-depth analysis of data processing and system resources, the storage engine of OceanBase Database V4.x has introduced the following compaction methods: mini compaction, minor compaction, medium compaction, and major compaction. The storage engine automatically selects a compaction method based on real-time resource usage and statistical sampling data to achieve dynamic balance, alleviating resource bottlenecks and improving system stability.

*   Mini compaction generates SSTables at L0. It uses an efficient, dense disk format instead of implementing time-consuming data compression. This maximizes IOPS while minimizing CPU consumption.
*   Minor compaction merges the SSTables at L0 to generate L1. It improves query performance by reorganizing the multi-version data of the same primary key and reduces space amplification by automatically detecting overlapping ranges of incremental data and reusing macroblocks. Minor compaction will support data encoding and compression to further reduce the disk overhead.
*   Major compaction generates baseline data at L2 and is the main contributor to cost reduction. In addition to reclaiming the incremental data of early versions and using proper disk formats based on table attributes and advanced compression technologies to reduce storage costs, OceanBase Database V4.x reorganizes and compresses data voids caused by scattered inserts to better support different data update models. Major compaction also validates data across multiple replicas to ensure secure and reliable data storage.

For medium compaction, one of its functions is to resolve the well-known queuing table issue in the LSM-tree architecture. For example, assume that a user inserts six rows of data and then deletes all of them, as shown in the following figure. The table is logically empty, but 12 physical rows are scanned during a query. Another example is a scenario involving both updates and inserts, where Aggregation Count returns two rows but seven rows are scanned during a query. The gap between the logical and physical row counts leads to poorer-than-expected query performance.

![1694074606](/img/blogs/tech/storage-engine/1694074606772.png)

In OceanBase Database of earlier versions, you must explicitly specify the buffer table attribute when creating a table. This signals the storage engine to identify buffer tables with a large number of rows and trigger special compaction actions to compress rows. In OceanBase Database V4.1, the storage engine intelligently collects data statistics each time it generates an SSTable. Each SSTable is represented by a set of vectors that describe its update characteristics. When identifying a queuing table, the system automatically initiates a medium compaction to remove redundant data. The process is imperceptible to users so that you do not need to learn about business characteristics before creating tables or perform a DDL operation after deploying the system. This lowers the barrier to using OceanBase Database and enhances business stability after a traffic switchover.

Encoding and Compression for Maximal Reduction in Storage Costs
--------------

In addition to improving the efficiency of using disks, memory, and other resources, decreasing the storage costs is another key factor in reducing the overall costs. This is where the storage engine comes into play. An efficient storage engine reduces costs considerably, especially in historical databases with massive data.

In terms of cost reduction, the storage engine of OceanBase Database has architectural advantages over conventional databases. Conventional databases, built on the B+ tree architecture, adopt in-place updates and use fixed-size blocks. They typically face fragmentation issues that can cause write amplification and query performance degradation after compressing data for storage. OceanBase Database leverages the LSM-tree-based storage architecture, thus gaining more advantages in data compression. First, OceanBase Database is not subject to the performance bottleneck of random disk writes and storage fragmentation. Therefore, it writes data faster than a conventional database that updates data blocks in real time. Second, OceanBase Database decouples compression from data updates such as addition, deletion, and modification and ensures that data update involves no compression to minimize the impact on performance. Third, OceanBase Database automatically adjusts the size of data blocks when batch persisting data. When compressing data blocks in sequence, OceanBase Database obtains the information about a data block, such as the compression ratio, to better compress the next one.

As shown in the following figure, the storage engine of OceanBase Database uses hybrid row-column storage to support a high compression ratio. Unlike rowstore storage, hybrid row-column storage organizes data in microblocks in columns instead of rows. When generating SSTables during a compaction, OceanBase Database encodes and compresses a microblock in two steps. First, OceanBase Database chooses the optimal algorithm based on the data characteristics of adjacent rows in a column to encode the microblock. This initial encoding typically achieves a compression ratio of about 50%. Then, OceanBase Database compresses the encoded microblock to reach an average compression ratio of 30%.

![1694074619](/img/blogs/tech/storage-engine/1694074619037.png)

OceanBase Database uses an adaptive and heuristic mechanism to choose the encoding algorithm by automatically analyzing characteristics such as data type, value range, and number of distinct values (NDV), and referencing the encoding and compression history of adjacent microblocks. Here are some examples. For short strings such as license plates, OceanBase Database encodes and compresses them by using bit-packing and hex encoding to effectively decrease the bit width for storage. For a column with much duplicate data, such as a column storing gender or zodiac data, OceanBase Database deduplicates the column data by using dictionary encoding and run-length encoding (RLE). For strings or values with similar ranges, OceanBase Database uses delta encoding. For columns that are related or similarly prefixed, such as barcodes of different products under the same categories, OceanBase Database reduces redundancy across these columns by using span-column encoding.

You can query encoded data without decoding it, push down the aggregation and filters, or perform vectorized calculations on encoded data based on Single Instruction Multiple Data (SIMD) instructions. Columnar OceanBase Database is coming soon. It detects and adapts to data encoding characteristics, supports the advanced Skip Index feature, and boosts the query performance in AP scenarios.

Summary: The Secret to Low-Cost and Efficient Data Management in OceanBase Database
------------------------------

After years of in-house research on resource overhead reduction from all aspects, including data input and output, the OceanBase Database team has transformed the storage engine into a unified, efficient, and scalable data storage architecture.

*   In terms of data organization, the storage engine loads multi-layer metadata on demand to flexibly allocate memory resources for processing hotspot data. This further relaxes server specification requirements and increases the performance of small-specification servers.
*   In terms of data writes, the storage engine uses different compaction methods at multiple levels to ensure efficient and stable writes and automatic data void compression, compress baseline data with a high compression ratio, and reduce storage costs.
*   In terms of data queries, the storage engine supports aggregation and filter pushdown and SIMD-based vectorization for data in various formats. This boosts the query performance in large-query and AP scenarios. In addition, the storage engine will soon support Skip Index.
*   In terms of resource management, the storage engine offers optimized inter-tenant isolation of resources such as CPU, memory, and I/O. This enables one cluster to serve multiple business systems and reduces the overall system costs.

What we have discussed so far barely scratches the surface of the storage engine of OceanBase Database. We will share more real-world cases and technical details in the future.