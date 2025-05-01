---
slug: column-store
title: 'The Present and Future of Columnar Storage in OceanBase Database'
---

OceanBase Database V4.3 provides the columnar storage feature to support real-time analysis business. As an extension of [**In-depth Interpretation of Columnar Storage**](https://oceanbase.github.io/docs/blogs/tech/analysis-column), this article further explores the application and evolution of columnar storage in the OceanBase Database architecture and its development trend.

**1. Background**
--------

In 1970, Edgar F. Codd invented the relational model for database management, ushering in a new era in the database field. In 1979, Oracle released the first commercial database edition. After that, database technologies were widely used in various industries. At that time, the data size of users was moderate, and data queries were simple. Therefore, a standalone database system could fully meet users' needs.

As time went by, users' data size increased dramatically, with queries getting complex. In this case, a standalone database was not competent to handle users' requirements for transaction processing (TP) and analytical processing (AP). Considering this, Codd proposed the concept of online analytical processing (OLAP) and 12 principles in 1993. Since then, online transaction processing (OLTP) has been separated from OLAP, and many database products have been launched in respective domains. Ten years later, probably in 2005, Michael Stonebraker developed C-Store, which is the first column-oriented database model. This model proved the great potential in the AP field, and columnar storage henceforth became a necessity in an OLAP database. Despite the dominant position of OLTP products in the market, representative OLAP products, such as Greenplum (2006), Snowflake (2014), Databricks (2014), and ClickHouse (2016), emerged endlessly around the world.

Although OLTP and OLAP products are independent of each other, users may require both capabilities at the same time. To support business, users often need to deploy two separate databases, one for OLTP and the other for OLAP, and use data synchronization tools to synchronize data from the OLTP database to the OLAP database. Such a deployment method brings a series of issues.

Firstly, a redundant replica and database exist. Even though low-priced storage devices can be used to deploy the OLAP database, extra CPU and memory resources are still consumed. What's worse, O&M of the additional database increases costs.

Secondly, latency occurs in synchronization between the OLAP and OLTP databases, and the latency duration is hard to control. Once an exception occurs in the OLAP database or the synchronization tool is faulty, several days may be taken to recover data, during which OLAP business is unavailable.

Lastly, higher requirements are imposed on the real-time performance of OLAP as the Internet develops. Take online shopping as an example. In this typical OLAP scenario, the database system is expected to automatically recommend items to shoppers based on the historical order records and relevant information of the shoppers for a higher turnover. The response may lag behind the speed of online shoppers in browsing apps or web pages if data needs to be first synchronized to the OLAP database.

Therefore, database users want a single database system to handle both OLAP and OLTP tasks while ensuring the performance of processing massive data. To solve this problem, Gartner proposed the concept of hybrid transaction and analytical processing (HTAP) to cover OLAP and OLTP capabilities in only one database system.

Relatively speaking, row-based storage is more suitable for OLTP workloads, while columnar storage is more suitable for OLAP workloads. A real-time HTAP database often needs to support both row-based storage and columnar storage. Compared with deploying two separate databases, using a single HTAP database can eliminate synchronization latency and improve real-time data performance. However, the data redundancy issue is still not resolved. In fact, it is possible to use only one copy of data for HTAP, which depends on how we treat and use columnar storage.

  

**2. Columnstore as a Replica**
-----------

The columnstore replica solution implements HTAP more directly. Specifically, it sets up two independent engines within a single database system: one is row-oriented for OLTP and the other is column-oriented for OLAP. This solution makes data synchronization details imperceptible to users and provides zero-latency OLAP data access. Many top database products in the industry such as Google F1 Lightning and PingCAP TiDB adopt similar solutions.

![1717380551](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-06/1717380551360.png)

As shown in the preceding figure, the three replicas in node 1, node 2, and the primary node are supported by the rowstore engine to provide OLTP capabilities, and the replica in node 4 is supported by the columnstore engine to provide OLAP capabilities. Raft and change data capture (CDC) are used to synchronize data between the two engines. This solution is superior because it improves the isolation effect, which prevents data access to the OLAP engine from affecting the OLTP engine.

However, the biggest disadvantage of this solution is the high costs, especially in scenarios involving massive data. This solution requires not only a redundant data replica, but also extra CPU and memory resources to support the columnstore engine, with no contribution to O&M cost reduction. In addition, dedicated engineers need to be assigned to handle exceptions in the independent columnstore engine.

  

**3. Columnstore as an Index**
-----------

A typical approach to implementing HTAP is through columnstore indexes, with SQL Server being a notable example. SQL Server introduced the columnstore index feature in 2012. However, columnstore indexes were read-only and could not be updated at that time. In 2016, SQL Server began to support updatable columnstore indexes for a more user-friendly experience.

![1717385844](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-06/1717385843903.png)

SQL Server also developed an internal columnstore engine to work with the existing rowstore engine, as shown in the preceding figure. The SQL layer interacts with underlying engines in a unified manner. It uses the rowstore engine to store data in rowstore tables and the columnstore engine to store columnstore indexes created on these tables. SQL Server allows rowstore and columnstore data to coexist, and multiple columnstore indexes can be created. This solution enables users to flexibly create indexes only for specific columns as needed, with lower data redundancy than the columnstore replica solution. In addition, SQL Server can leverage both rowstore and columnstore engines for SQL execution, significantly improving execution efficiency.

In terms of implementation, the columnstore engine in SQL Server arranges a fixed number of rows to form a row group in a way similar to how a heap table is organized, instead of based on the order of the primary key. In a row group, columns are separately stored in different segments. A row group cannot be modified once it is generated. You can delete it by marking it in Delete Bitmap and update it by using DELETE and INSERT operations. INSERT operations are stored in Delta Store. The final query result combines data in the columnstore engine, Delete Bitmap, Delete Buffer, and Delta Store.

![1717385867](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-06/1717385866859.png)

The columnar storage solution of SQL Server resolves issues regarding latency, real-time performance, and costs. However, for index-organized tables (IOTs), columnstore indexes heavily rely on rowstores, and PRIMARY KEY and UNIQUE constraints also need to be maintained by using rowstores. Moreover, the maintenance of Delta Store and Delete Bitmap also requires costs, and the introduction of columnstore indexes has an impact on the performance of row-oriented OLTP workloads.

  

**4. Columnstore as a Cache**
-----------

In 2013, Oracle 12c introduced the In-Memory Column Store (IM column store) feature to store data in a cache using a columnar format.

![1717385910](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-06/1717385909938.png)

Strictly speaking, IM column store is more like an accelerated columnstore cache based on the rowstore architecture, rather than an independent columnstore engine. Oracle allows users to enable IM column store at different levels, including columns, partitions, tables, and tablespaces, featuring high flexibility. If IM column store is enabled for specific columns in specific tables, Oracle loads data of these columns from rowstores to the memory and stores the data in a columnar format. It needs to be noted that the data is still stored in rowstores and will not be directly stored on the disk. Operations such as create, update, and delete on these columns will be updated to columstores through the internal refresh mechanism. The System Global Area (SGA) in the buffer cache of Oracle undertakes most create, read, update, and delete (CRUD) operations on transactions. To enable IM column store, users need to allocate a separate memory area outside the buffer cache for columnar storage.

This solution avoids costs incurred by disk data redundancy, provides real-time zero-latency OLAP capabilities, and allows users to flexibly configure the columstores as needed. However, its disadvantages are also obvious. On the one hand, memory costs are not reduced and memory resources, which are more valuable than disk resources, are consumed to support OLAP workloads. On the other hand, the data involved in OLAP workloads is massive. Therefore, it is not feasible to store all data in the memory. Once users access the disk, Oracle needs to read the requested data from rowstores and convert it into a columnar format for in-memory storage. In this scenario, columnar storage loses its superiority over row-based storage in reducing I/O costs.

  

**5. Columnstore as Data**
-----------

The underlying storage engines of both SQL Server and Oracle depend on the B-tree structure. If we open up our eyes and take the log-structured merge-tree (LSM-tree) structure into consideration, we will find that LSM-tree perfectly suits columnar storage. In an LSM-tree architecture, data is stored in MemTables and SSTables. MemTables are stored in memory and can be dynamically modified, which are naturally suitable for row-based storage. SSTables are stored on the disk and cannot be modified, which are more suitable for columnar storage. In OceanBase Database, SSTables are further divided into minor compaction SSTables and baseline SSTables. Generally, minor compaction SSTables store data modified recently, while baseline SSTables store old data.

OLTP workloads are often short transactions such as insertion, small-range updates, and deletion and reads of recent data. Data involved in such workloads is usually stored in MemTables and minor compaction SSTables. Therefore, to ensure the performance of OLTP workloads, OceanBase Database uses the row-based storage strategy for MemTables and minor compaction SSTables, provides Bloom filters for baseline SSTables to block empty queries, and caches partial hotspot columnstore data to accelerate hot data queries.

OLAP workloads are usually large queries, mainly involving data stored in baseline SSTables. OceanBase Database adopts the columnar storage strategy for baseline SSTables. Unlike SQL Server, OceanBase Database stores columns based on the order of the primary key. This way, OceanBase Database can quickly locate the row of the target data by using binary search when processing a small number of OLTP requests in columstores. By conducting proof of concept (POC) tests, many users acknowledge that the columnar storage solution in OceanBase Database can truly support OLTP workloads.

By doing this, OceanBase Database can support both OLTP and OLAP capabilities with only one copy of data. In most cases, baseline SSTables store the majority of data records, and columnar storage features a higher data compression ratio than row-based storage. Therefore, the OceanBase Database architecture can minimize costs. However, challenges are posed on this architecture.

One challenge is to isolate resources allocated for OLTP and OLAP workloads. Under an ideal scheduling mechanism, OLAP workloads can flexibly use resources for OLTP workloads and utilize most system resources when no OLTP workloads exist. This can be implemented theoretically, just like the fact that most databases can be deployed in a docker, but few users worry about the resource isolation capability of the docker. However, high-level isolation requirements still cannot be met.

The other challenge is that the performance of some queries may be better when baseline SSTables adopt row-based storage. Alternatively, combining multiple columns for mixed storage may improve query performance.

  

**6. Columnstore Is Everything**
-----------

Based on the LSM-tree architecture, OceanBase Database can store data in a columnar format to minimize costs. However, this does not mean that columnar storage is the only choice for OceanBase Database. Instead, it allows users to flexibly treat a columnstore as a cache, index, or replica to explore more possibilities.

-  First, treat a columnstore as a cache. OceanBase Database can store data in the memory in a columnar format and cache partial columnstore data to speed up hotspot data queries.

-  Secondly, treat a columnstore as an index. OceanBase Database can store both rowstore and columnstore data in baseline SSTables, or aggregate partial columns to remove redundant data. The system queries a columnstore, rowstore, or row group based on the actual needs.

-  Thirdly, treat a columnstore as a replica. OceanBase Database can apply row-based storage to the leader replica and columnar storage to read-only replicas, to improve resource isolation effects.

-  In the near future, OceanBase Database may get rid of the limitations of these underlying storage methods, eliminate the barriers between OLTP and OLAP, and return to the origin of a database. If this comes true, OceanBase Database will organize data always in a format that is most suitable for the workload type and return the query results to users at the quickest speed. Users will only need to add resources if they feel that the query response is slow but do not want to take optimization measures.

  

**7. Summary**
----------

OceanBase Database already supports the columnar storage feature in version 4.3 and more related features are under development. We hope that these features will be unveiled as soon as possible to allow more users to experience the convenience brought by columnar storage in real-time AP scenarios.

  

![1717386085](/img/blogs/tech/column-store/image/1717386085767.png)