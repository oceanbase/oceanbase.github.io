---
slug: Real-time-AP
title: 'OceanBase Database 4.3 - Milestone Release for Real-time AP'
---


In early 2023, OceanBase Database V4.1 was released. It is the first milestone version of the V4.x series and supports an integrated architecture for standalone and distributed modes. Such integrated architecture reduces the recovery time objective (RTO), a database reliability indicator, to less than 8 seconds, ensuring rapid database recovery from an unexpected failure. Unlike the V3.x series, the new version does not limit the number of partitions, providing higher capacity for processing large transactions. Core features such as the arbitration replica are supported to cut costs.

In September 2023, OceanBase Database V4.2.1 was released. As the first Long-Term Support (LTS) version of the V4.x series, it augments all core features of the V3.x series, and demonstrates improved performance in many aspects such as stability, scalability, support for small specifications, and ease of diagnostics. Six months after its release, hundreds of customers have deployed this LTS version in their production environments for stable operations.

To meet higher expectations on ease-of-use and capabilities of tackling miscellaneous workloads, we have released OceanBase Database V4.3.0, which is rigorously implemented on top of open design after thorough research.

OceanBase Database V4.3.0 sets a significant milestone on our roadmap to achieve real-time analytical processing (AP). This version provides a columnar engine based on the log-structured merge-tree (LSM-tree) architecture, which implements hybrid columnar and row-based storage. The database also introduces a new vectorized engine based on column data format descriptions and a cost model based on columnar storage. This way, wide tables can be effectively processed and the query performance in AP scenarios is significantly improved without affecting transactional processing (TP) business scenarios. Overall, the new OceanBase Database version is well-suited for mixed workload scenarios involving complex analytics, real-time reporting, real-time data warehousing, and online transactions. The materialized view feature is provided. Query results are pre-calculated and stored in materialized views to improve real-time query performance, and support rapid report generation and data analysis. The kernel in the new version also extends online DDL and adds support for tenant cloning. It has optimized performance and system resource usage, and provides better system usability. In a test with the same hardware configurations, the performance of OceanBase Database V4.3.0 in wide-table queries is comparable with mainstream columnstore databases in the industry.

Now, let's take a closer look at key updates of OceanBase Database V4.3.0:

-   **TP and AP integration**

-   **High-performance kernel**

-   **Higher computing performance**

-   **Ease-of-use enhancements**

  

**1. TP and AP Integration**
---------------------

In addition to features of V4.2, such as highly concurrent real-time row updates, and point queries of the primary key indexes, OceanBase Database V4.3.0 introduces more AP services. Its scalable distributed architecture also supports high availability, strong consistency, and geo-disaster recovery. The new version provides a columnar engine and enhances vectorized execution, parallel computing, and distributed plan optimization. This way, the database supports both TP and AP business.

### **(1) Integrated columnar and row-based storage**

Columnar storage is one of the key capabilities of AP databases in complex large-scale data analysis and ad hoc queries of massive data. Columnar storage is a way to organize data files. Different from row-based storage, columnar storage physically arranges data in a table by column. When data is stored by column, the system can scan only the columns involved in the query and calculation, instead of scanning the entire row. This way, the consumption of resources such as I/O and memory is reduced and the calculation is accelerated. Moreover, columnar storage naturally provides better data compression conditions, making it easier to achieve higher compression ratios, thereby reducing the usage of storage space and network transmission bandwidth.

However, columnar engines generally assume limited random updates and attempt to ensure that data in columnar storage is static. When a large amount of data is updated randomly, system performance will inevitably degrade. The LSM-tree architecture of OceanBase Database can process baseline data and incremental data separately, and therefore can solve the performance issue. Therefore, OceanBase Database V4.3.0 supports the columnar engine based on the current architecture, implementing integrated columnar and row-based data storage on an OBServer node with only one set of code and one architecture, and ensuring the performance of both TP and AP queries.

To help users with AP requirements smoothly use the new version, OceanBase Database has adapted and optimized several modules, including the optimizer, executor, DDL, and transaction processing, for the columnar engine. These optimizations introduce a new cost model and vectorized engine based on columnar storage, enhancements to the query pushdown feature, and features like skip index, a new column-based encoding algorithm, and adaptive compactions.

To make AP queries easy, we recommend that you run the following command in a MySQL or Oracle tenant of OceanBase Database to create a columnstore table by default:
```
    alter system set default_table_store_format = "column"
```

You can flexibly create a business table as a rowstore table, columnstore table, or hybrid rowstore-columnstore table based on the load type. You can also create a columnstore index for a rowstore table.

![1713849286](/img/blogs/tech/Real-time-AP/image/1713849285226.png)

![1713849297](/img/blogs/tech/Real-time-AP/image/1713849296536.png)

The optimizer determines, based on estimated costs, whether to scan a hybrid rowstore-columnstore table by row or by column.

![1713849311](/img/blogs/tech/Real-time-AP/image/1713849310310.png)

### **(2) New vectorized engine**

Earlier versions of OceanBase Database have implemented a vectorized engine based on uniform data format descriptions, offering performance significantly better than that of non-vectorized engines. However, the engine still has some performance deficiencies in deep AP scenarios. OceanBase Database V4.3.0 implements the vectorized engine 2.0, which is based on column data format descriptions, avoiding the memory usage, serialization, and read/write access overhead caused by ObDatum maintenance. Based on the reconstruction of data format descriptions, the new vectorized engine also reimplements more than 10 commonly used operators such as HashJoin, AGGR, HashGroupBy, and Exchange (DTL Shuffle), as well as over 20 MySQL expressions including relational operations, logical operations, and arithmetic operations. Subsequent V4.3.x versions will further improve and implement other operators and expressions based on the new vectorized engine to achieve better performance.

### **(3) Materialized views**

OceanBase Database V4.3.0 introduces materialized views. Materialized views are a key feature for AP business scenarios. By precomputing and storing the query results of views, real-time calculations are reduced to improve query performance and simplify complex query logic. Materialized views are commonly used for rapid report generation and data analysis scenarios.

Materialized views need to store query result sets to optimize the query performance. Due to data dependency between a materialized view and its base tables, data in the materialized view must be refreshed accordingly when data in any base tables changes. Therefore, the materialized view refresh mechanism is also introduced in the new version, including complete refresh and incremental refresh strategies. Complete refresh is a relatively direct method. Each time a refresh operation is performed, the system re-executes the corresponding query statement of a materialized view to recalculate and overwrite the original result set. This method is applicable to scenarios with a small amount of data. Incremental refresh, by contrast, only deals with data that has been changed since the last refresh. To achieve accurate incremental refresh, OceanBase Database implements a materialized view log feature that is similar to Oracle Materialized View Log (MLOG). The feature tracks incremental data updates in base tables and records the updates in logs. This ensures that materialized views can be refreshed incrementally in a short period. Incremental refresh is particularly useful in business scenarios with large data volumes and frequent data changes.

  

**2. High-performance Kernel**
---------------

The kernel in the new version has enhanced the cost model, added support for tenant cloning, extended online DDL, added Amazon Simple Storage Service (S3) as the backup and restore media, restructured the session management module, and optimized the log stream state machine and system resource usage, to improve database performance and stability in handling key business workloads.

### **(1) Enhanced row estimation system**

As the OceanBase Database version evolves, more cost estimation methods are available for the optimizer. For row estimation of each operator, a variety of algorithms, such as row estimation based on the storage layer, row estimation based on statistics, dynamic sampling, and default statistics, are supported. However, there are no clear strategies and complete control methods for using row estimation. OceanBase Database V4.3.0 reconstructs the row estimation system. Specifically, it prioritizes row estimation strategies based on scenarios and provides methods such as hints and system variables for you to manually intervene in the selection of a row estimation strategy. This version also enhances the predicate selectivity and number of distinct values (NDV) calculation framework to improve the accuracy of cost estimation by the optimizer.

### **(2) Enhanced statistics**

OceanBase Database V4.3.0 improves the statistics feature, statistics collection performance, and the compatibility and usability of statistics. Specifically, this version reconstructs the offline statistics collection process to improve the collection efficiency, optimizes the statistics collection strategies to automatically collect information about index histograms by default and collect statistics in a deductive manner, and ensures transaction consistency for online statistics collection. It is compatible with the `DBMS_STATS.COPY_TABLE_STATS` procedure of Oracle for statistics copying, and is also compatible with the `ANALYZE TABLE` statement of MySQL. It provides a command to cancel statistics collection, enriches the monitoring on the statistics collection progress, and enhances maintenance usability. It also supports the parallel deletion of statistics.

### **(3) Adaptive cost model**

In earlier versions of OceanBase Database, the cost model uses constant parameters measured by internal machines to represent hardware system statistics, and describes the execution overhead of each operator by using a series of formulas and constant parameters. However, in real business scenarios, different hardware environments may have different CPU clock frequencies, sequential or random read speeds, and NIC bandwidths, thereby resulting in cost estimation deviations. The optimizer cannot always generate optimal plans in different business environments because of these deviations. The new version implements the cost model in an optimized way to support the `DBMS_STATS` package for collecting or setting system statistics coefficients, thus adapting the cost model to hardware. It also provides the `DBA_OB_AUX_STATISTICS` view to display the system statistics coefficients of the current tenant.

### **(4) Fixed session variables for function-based indexes**

When a function-based index is created on a table, a hidden virtual generated column is added to the table and defined as the index key of the function-based index. The values of the virtual generated column are stored in the index table. The results of some built-in system functions are affected by session variables. The calculation result of a function varies based on the values of session variables, even if the input arguments are the same. When a function-based index or generated column is created in this version, session variables on which the function-based index or generated column depends are fixed in the column schema to improve stability. When values of the indexed column or generated column are calculated, fixed session variable values are used. Therefore, the calculation result is not affected by variable values in the current session. OceanBase Database V4.3.0 supports fixed values of the system variables `timezone_info`, `nls_format`, `nls_collation`, and `sql_mode`.

### **(5) Online DDL expansion in MySQL mode**

OceanBase Database V4.3.0 supports more online DDL scenarios for column type changes, including:

-   **Conversion of integer types:** Online DDL operations, instead of offline DDL operations, are performed to change the data type of a primary key column, indexed column, generated column, column on which a generated column depends, or column with a `UNIQUE` or `CHECK` constraint to an integer type with a larger value range.

-   **Conversion of the DECIMAL data type:** For columns that support the DECIMAL data type, online DDL operations are performed to increase the precision within any of the \[1, 9\], \[10, 18\], \[19, 38\], and \[39, 76\] ranges without changing the scale.

-   **Conversion of the BIT or CHAR data type:** For columns that support the BIT or CHAR data type, online DDL operations are performed to increase the width.

-   **Conversion of the VARCHAR or VARBINARY data type:** For columns that support the VARCHAR or VARBINARY data type, online DDL operations are performed to increase the width.

-   **Conversion of the LOB data type:** To change the data type of a column that supports LOB data types to a LOB data type with a larger value range, offline DDL operations are performed for columns of the TINYTEXT or TINYBLOB data type, and online DDL operations are performed for columns of other data types.

-   **Conversion between the TINYTEXT and VARCHAR data types:** For columns that support the TINYTEXT data type, online DDL operations are performed to change the VARCHAR(x) data type to the TINYTEXT data type if `x <= 255`, and offline DDL operations are performed if otherwise. For columns that support the VARCHAR data type, online DDL operations are performed to change the TINYTEXT data type to the VARCHAR(x) data type if `x >= 255`, and offline DDL operations are performed if otherwise.

-   **Conversion between the TINYBLOB and VARBINARY data types:** For columns that support the TINYBLOB data type, online DDL operations are performed to change the VARBINARY(x) data type to the TINYBLOB data type if `x <= 255`, and offline DDL operations are performed if otherwise. For columns that support the VARBINARY data type, online DDL operations are performed to change the TINYBLOB data type to the VARBINARY(x) data type if `x >= 255`, and offline DDL operations are performed if otherwise.

### **(6) Globally unique client session ID**

Prior to OceanBase Database V4.3.0 and OceanBase Database Proxy (ODP) V4.2.3, when the client executes `SHOW PROCESSLIST` through ODP, the client session ID in ODP is returned. However, when the client queries the session ID by using an expression such as `connection_id` or from a system view, the session ID on the server is returned. A client session ID corresponds to multiple server session IDs. This causes confusion in session information queries and makes user session management difficult. In the new version, the client session ID generation and maintenance process is reconstructed. When the version of OceanBase Database is not earlier than V4.3.0 and the version of ODP is not earlier than V4.2.3, the session IDs returned by various channels, such as the `SHOW PROCESSLIST` command, the `information_schema.PROCESSLIST` and `GV$OB_PROCESSLIST` views, and the `connection_id`, `userenv('sid')`, `userenv('sessionid')`, `sys_context('userenv','sid')`, and `sys_context('userenv','sessionid')` expressions, are all client session IDs. You can specify a client session ID in the SQL or PL command `KILL` to terminate the corresponding session. If the preceding version requirements for OceanBase Database and ODP are not met, the handling method in earlier versions is used.

### **(7) Improvement of the log stream state machine**

In OceanBase Database V4.3.0, the log stream status is split into the in-memory status and persistent status. The persistent status indicates the life cycle of a log stream. After the OBServer node where a log stream resides breaks down and then restarts, the system determines whether the log stream should exist and what the in-memory status of the log stream should be based on the persistent status of the log stream. The in-memory status indicates the runtime status of a log stream, representing the overall status of the log stream and the status of key submodules. Based on the explicit status and status sequence of the log stream, underlying modules can determine which operations are safe to the log stream and whether the log stream has gone through a status change of the ABA type. For backup and restore or migration processes, the working status of a log stream is optimized after the OBServer node where the log stream resides restarts. This feature improves the stability of log stream-related features and enhances the concurrency control on log streams.

### **(8) Tenant cloning**

OceanBase Database V4.3.0 supports tenant cloning. You can quickly clone a specified tenant by executing an SQL statement in the sys tenant. After a tenant cloning job is completed, the created new tenant is a standby tenant. You can convert the standby tenant into the primary tenant to provide services. The new tenant and the source tenant share physical macroblocks in the initial state, but new data changes and resource usage are isolated between the tenants. You can clone an online tenant for temporary data analysis with high resource consumption or other high-risk operations to avoid risking the online tenant. In addition, you can also clone a tenant for disaster recovery. When irrecoverable misoperations are performed in the source tenant, you can use the new tenant for data rollback.

### **(9) Support for S3 as the backup and restore media**

Earlier versions of OceanBase Database support two types of storage media for backup and restore: file storage (NFS) and object storage such as Alibaba Cloud Object Storage Service (OSS) and Tencent Cloud Object Storage (COS). The new version supports Amazon S3 and S3-compatible object storage like Huawei Cloud Object Storage Service (OBS) and Google Cloud Storage (GCS) as the log archive and data backup destination. You can also use backup data on S3 and S3-compatible object storage for physical restore.

### **(10) Proactive broadcast/refresh of tablet locations**

In earlier versions, OceanBase Database provides the periodic location cache refresh mechanism to ensure that the location information of log streams is updated in real time and consistent. However, tablet location information can only be passively refreshed. Changes in the mappings between tablets and log streams can trigger SQL retries and read/write errors with a certain probability. OceanBase Database V4.3.0 supports proactive broadcast of tablet locations to reduce SQL retries and read/write errors caused by changes in mappings after transfer. It also supports proactive refresh to avoid unrecoverable read/write errors.

### **(11) Migration of active transactions during tablet transfer**

In the design of standalone log streams, data is in the unit of tablets, while logs are in the unit of log streams. Multiple tablets are aggregated into one log stream, saving the high cost of two-phase commit of transactions within a single log stream. To balance data and traffic among different log streams, tablets can be flexibly transferred between log streams. However, during the tablet transfer process, active transactions may still be handling the data, and even a simple operation may damage the atomicity, consistency, isolation, and durability (ACID) of the transactions. For example, if active transaction data on the transfer source cannot be completely migrated to the transfer destination during concurrent transaction execution, the atomicity of the transactions cannot be guaranteed. In earlier versions, active transactions were killed during the transfer to avoid transaction problems. This mechanism affects the normal execution of transactions to some extent. To resolve this problem, the new version supports the migration of active transactions during tablet transfer, which enables concurrent execution of active transactions and ensures that no abnormal rollbacks or consistency issues occur in concurrent transactions due to the transfer.

### **(12) Memory throttling mechanism**

Prior to OceanBase Database V4.x, only a few modules release memory based on freezes and minor compactions, and the MemTable is the largest part among them. Therefore, in earlier versions, an upper limit is set for memory usage of the MemTable, enabling it to run as smoothly as possible within the memory usage limit and avoiding writing failures caused by sudden memory exhaustion. In OceanBase Database V4.x, more modules that release memory based on freezes and minor compactions are introduced, such as the transaction data module. The new version provides more refined means to control the memory usage of various modules and supports the memory upper limit control of TxData and metadata service (MDS) modules. The two modules share memory space with the MemTable. When the sum of the memory usage of the three modules reaches `Tenant memory × _tx_share_memory_limit_percentage% × writing_throttling_trigger_percentage%`, overall memory throttling is triggered for the three modules. The new version also supports freezes and minor compactions of the transaction data table by time to reduce the memory usage of the transaction data module. By default, the transaction data table is frozen once every 1,800 seconds.

### **(13) Optimization of DDL temporary result space**

During DDL operations, many processes may store temporary results in materialized structures. Here are two typical scenarios: 1) During index creation, the system scans data in the base data table and sorts and inserts the obtained data to the index table. If the memory is insufficient during the sorting process, current data in the memory space will be temporarily stored in materialized structures to release the memory space for subsequent scanning. Data in the materialized structures is then merged and sorted. 2) In the columnar storage direct load scenario, the system first temporarily stores the data to be inserted into each column group in materialized structures, and then obtains data from the materialized structures for insertion. These materialized structures can be used in the `SORT` operator to store intermediate data required for external sorting. When the system inserts data into column groups, the data can be cached in materialized structures, avoiding additional overhead caused by repeated table scanning. As a result, the temporary files occupy considerable disk space. The new version eliminates unnecessary redundant structures to simplify the data flow, and supports encoding and compression of temporary results for storage on disks. This greatly reduces the disk space occupied by temporary files.

  

**3. Higher Computing Performance**
---------------

The online analytical processing (OLAP) capabilities are significantly enhanced in the new version, achieving a performance boost in TPC-H 1TB and TPC-DS 1TB tests. The new version also optimizes PDML, read and write operations in OBKV, direct load performance of LOB data, and node restart performance.

  

### **(1) Increased performance in the TPC-H 1TB test**

The following figure shows the performance of a tenant with 80 CPU cores and 500 GB of memory of different OceanBase Database versions in the TPC-H 1TB test. Overall, the performance of V4.3.0 is about 25% higher than that of V4.2.0.

![1713849772](/img/blogs/tech/Real-time-AP/image/1713849771931.png)

Figure 1: Performance of V4.3.0 and V4.2.0 in the TPC-H 1TB test

  

### **(2) Increased performance in TPC-DS 1TB test**

The following figure shows the performance of a tenant with 80 CPU cores and 500 GB of memory of different OceanBase Database versions in the TPC-DS 1TB test. Overall, the performance of V4.3.0 is about 111% higher than that of V4.2.0.

![1713849829](/img/blogs/tech/Real-time-AP/image/1713849828408.png)

Figure 2: Performance of V4.3.0 and V4.2.0 in the TPC-DS 1TB test

  

### **(3) OBKV performance optimization**

Compared with those in V4.2.1, the OBKV single-row read-write performance is improved by about 70%, and the batch read-write performance is improved by 80% to 220%.

  

### **(4) PDML transaction optimization**

The new version implements optimizations at the transaction layer by supporting parallel commit, log replay, and partition-level rollbacks within transaction participants. Compared with earlier V4.x versions, the new version significantly improves the PDML execution performance and scalability in high concurrency scenarios.

  

### **(5) I/O usage optimization for loading tablet metadata**

OceanBase Database V4.x supports millions of partitions on a single machine. As the memory may fail to hold the metadata of millions of tablets, OceanBase Database V4.x supports on-demand loading of tablet metadata. OceanBase Database supports on-demand loading of metadata at the partition level and the subclass level within partitions. In a partition, metadata is split into multiple subclasses for hierarchical storage. In scenarios where background tasks require deeper metadata, the data read consumes more I/O resources. These I/O overheads are not a problem for local SSDs, but may affect system performance when HDD disks or cloud disks are used. OceanBase Database V4.3.0 aggregates frequently accessed metadata in storage, and only one I/O operation is required to access the metadata. This greatly reduces the I/O overhead in zero load scenarios and avoids the impact on foreground query performance caused by background task I/O overhead. In addition, the metadata loading process during the restart of an OBServer node is optimized. Tablet metadata is loaded in batches at the granularity of macroblocks, greatly reducing discrete I/O reads and speeding up the restart by several or even dozens of times.

  

**4. Ease-of-use Enhancements**
----------------

The new version provides the index usage monitoring feature to help you identify and delete invalid indexes, and allows you to import a small amount of local data from the client. Features such as LOB INROW threshold configuration, remote procedure call (RPC) authentication certificate management, and parameter resetting are also provided to improve system usability.

  

### **(1) Index usage monitoring**

We usually create indexes to improve the query performance of the database. However, more and more indexes are created as data tables are used in more business scenarios by more operators. Unused indexes are a waste of storage space and increase the overhead of DML operations. In this case, you need to drop useless indexes to alleviate the burden on the system. However, you can hardly identify all useless indexes by manual efforts. Therefore, OceanBase Database V4.3.0 provides the index usage monitoring feature. After you enable this feature and set the sampling method, the index usage information that meets the rules is recorded in the memory of a user tenant and refreshed to the internal table once every 15 minutes. You can then query the `DBA_INDEX_USAGE` view to find out whether an index is referenced and drop useless indexes to release space.

### **(2) Local import from the client**

OceanBase Database V4.3.0 supports the `LOAD DATA LOCAL INFILE` statement for local import from the client. You can use the feature to import local files through streaming file processing. Based on this feature, developers can import local files for testing without uploading files to the server or object storage, improving the efficiency of importing a small amount of data.

Note: To import local data from the client, make sure that:

 a. The version of OceanBase Command-Line Client (OBClient) is V2.2.4 or later.

 b. The version of ODP is V3.2.4 or later. If you directly connect to an OBServer node, ignore this requirement.

 c. The version of OceanBase Connector/J is V2.4.8 or later if you use Java and OceanBase Connector/J.

You can directly use a MySQL client or a native MariaDB client of any version.

The `SECURE_FILE_PRIV` variable is used to specify the server paths that can be accessed by the OBServer node. This variable does not affect local import from a client, and therefore does not need to be specified for local import.

### **(3) LOB INROW threshold configuration**

By default, LOB data of a size less than or equal to 4 KB is stored in INROW mode, and LOB data of a size greater than 4 KB is stored in the LOB auxiliary table. In some scenarios, INROW storage provides higher performance than auxiliary table-based storage. Therefore, this version supports dynamic configuration of the LOB storage mode. You can adjust the INROW threshold based on your business needs, provided that the threshold does not exceed the limit for INROW storage.

### **(4) RPC authentication certificate management**

When RPC authentication is enabled for a cluster, for an access request from a client, such as the arbitration service, primary/standby database, or OceanBase Change Data Capture (CDC), you need to place the root CA certificate of the client in the deployment directory of each OBServer node in the cluster, and then perform related configurations. This whole process is complicated. OceanBase Database V4.3.0 supports the internal certificate management feature. You can use the `DBMS_TRUSTED_CERTIFICATE_MANAGER` system package provided in the sys tenant to add, delete, and modify root CA certificates trusted by an OceanBase cluster. The `DBA_OB_TRUSTED_ROOT_CERTIFICATE` view is also provided in the sys tenant to display the list of client root CA certificates added to OBServer nodes in the cluster and the certificate expiration time.

### **(5) Parameter resetting**

In earlier versions, if you want to reset a parameter to the default value, you need to query the default value of the parameter first, and then manually set the parameter to the default value. The new version provides the `ALTER SYSTEM [RESET] parameter_name [SCOPE = {MEMORY | SPFILE | BOTH}] {TENANT [=] 'tenant_name'}` syntax for you to reset a parameter to the default value. The default value is obtained from the node that executes the statement. You can reset cluster-level parameters or parameters of a specified tenant in the sys tenant. You can also reset parameters for the current user tenant. On OBServer nodes, whether the `SCOPE` option is specified or not does not affect the implementation logic. For a parameter that takes effect statically, the default value is only stored on the disk but not updated to the memory. For a parameter that takes effect dynamically, the default value is stored on the disk and updated to the memory.

**5. Afterword**
----------

OceanBase Database V4.3.0 sets a significant milestone on our roadmap to achieve real-time AP. We will keep updating AP features of subsequent versions to overcome challenges in real-world business scenarios.

We would like to thank all our users and developers for their contributions to OceanBase Database V4.3.0. Their valuable suggestions are a powerful driving force that pushes OceanBase forward. We look forward to working with every user and developer in tackling critical workloads, developing modern data architectures, and building better and more user-friendly distributed databases.

You can visit [**Release Notes**](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971697) to learn more about the new OceanBase Database V4.3.0.