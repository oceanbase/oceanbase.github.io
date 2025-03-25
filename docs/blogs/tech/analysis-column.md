---
slug: analysis-column
title: 'OceanBase Database V4.3 Feature Breakdown: In-depth Analysis of Columnar Storage'
---

In scenarios involving large-scale data analytics or extensive ad-hoc queries, columnar storage stands out as a crucial feature for business workloads. Unlike row-based storage, columnar storage physically arranges the data in a table by column. When data is stored by column, the system can scan only the columns involved in the query and calculation, instead of scanning the entire row. This way, the consumption of resources such as I/O and memory is reduced, and the calculation is accelerated. Moreover, columnar storage naturally provides better data compression conditions, making it easier to achieve higher compression ratios, thereby reducing the usage of storage space and network transmission bandwidth.

However, columnar engines generally assume limited random updates and attempt to ensure that data in columnar storage is static. When a large amount of data is updated randomly, system performance will inevitably degrade. The log-structured merge-tree (LSM-tree) architecture of OceanBase Database can process baseline data and incremental data separately, and therefore can solve the performance issue. OceanBase Database V4.3.0 supports the columnar engine based on the current architecture, implementing integrated columnar and row-based data storage within a database on only one architecture, and ensuring the performance of both transaction processing (TP) and analytical processing (AP) queries.

To help users with AP requirements smoothly use the new version, OceanBase Database has adapted and optimized several modules, including the optimizer, executor, DDL, and transaction processing, for the columnar engine. These optimizations introduce a new cost model and vectorized engine based on columnar storage, enhancements to the query pushdown feature, and features like skip index, a new column-based encoding algorithm, and adaptive compactions. This post will dive into the columnar storage feature provided by OceanBase Database V4.3, the application scenarios of this feature, as well as its development planning.

**1. Overall Columnar Storage Architecture**
------------

As a native distributed database, OceanBase Database stores user data in multiple replicas by default. OceanBase Database optimizes its self-developed LSM-tree-based storage engine to give full play to the multi-replica deployment mode and improve user experience in strong verification of data and reuse of migrated data.

-  Baseline data: Unlike other databases with LSM-tree-based storage engines, OceanBase Database introduces the concept of daily major compaction. A user selects a global version on a regular basis or based on their operation, and a major compaction is initiated for all replicas of tenant data based on the version to generate baseline data of the version. The baseline data of the same version is physically consistent for all replicas.

-  Incremental data: All data written after the latest version of baseline data is incremental data. Incremental data can be memory data written into MemTables or disk data compacted into SSTables. Incremental data contains multi-version data, and its replicas are maintained independently and are not necessarily consistent.

Random updates in columnar storage scenarios are controllable. On this basis, OceanBase Database V4.3 provides a set of columnar storage implementation methods transparent to upper-layer business based on the characteristics of baseline data and incremental data: Baseline data is stored by column, and incremental data is stored by row. Users' DML operations are not affected, and upstream data and downstream data are seamlessly synchronized. Users can perform transaction operations on columnstore tables in the same way as on rowstore tables. In columnar storage mode, the data of each column is stored as an independent SSTable, and the SSTables of all columns are combined into a virtual SSTable as baseline data for columnar storage. Users can flexibly select a storage mode as needed when they create a table. Baseline data can be stored by row, column, or both row and column (with redundancy).

![1716796000](/img/blogs/tech/analysis-column/image/1716795999198.png)

OceanBase Database V4.3 makes optimizations from multiple dimensions such as optimizer and executor to adapt to the columnar storage mode in the storage engine. After switching to the columnar storage mode, users will not perceive business changes and can enjoy the same performance superiority as the row-based storage mode. By optimizing the columnar storage engine from all aspects, OceanBase Database integrates TP and AP and supports different types of business with one engine and one set of code, honing its capability of hybrid transaction/analytical processing (HTAP).

  

**2. Native Advantages of OceanBase Database in Columnar Storage**
----------------------------

### **2.1 Fully-fledged LSM-tree engine**

Compared with conventional databases, OceanBase Database has an inherent delta store, which perfectly suits the columnar storage strategy. Relying on the LSM-tree-based storage engine, the columnar storage mode in OceanBase Database provides full transactional support while delivering a performance level of basic operators that is comparable to conventional TP databases. The full transactional support endows OceanBase Database with natural excellence in system upgrades. Specifically, all transaction semantics and management are transparent to the business, allowing users to easily switch to the columnar storage mode without requiring application rewrites. This way, users can use a columnstore database in the same way as using a rowstore database.

### **2.2 Honed execution engine**

OceanBase Database boasts a superb execution engine and a general-purpose optimizer. In row-based storage mode, OceanBase Database realizes seamless integration with the vectorized storage engine to support vectorized execution without requiring application rewrites. What's more, the OceanBase Database optimizer estimates the costs of the row-based and columnar storage modes with only one set of code, allowing users' SQL engines to automatically select a storage mode.

### **2.3 Flexible native distributed architecture**

OceanBase Database supports a native distributed parallel query engine, and its application can be easily extended to heterogeneous columnstore replicas. Heterogeneous columnstore replicas stand out in scenarios where complete physical isolation is required, and will be supported in later versions of OceanBase Database.

In a word, OceanBase Database's inherent advantages foster the introduction of columnar storage in V4.3. OceanBase Database supports the following three columnar storage modes without ostensibly changing the overall architecture:

-  Columnstore baseline data + rowstore incremental data: Baseline data is stored by column, whereas incremental data is stored by row.

-  Flexible rowstore/columnstore indexes: Users can create columnstore indexes on rowstore tables or the other way around. The two types of indexes can also be flexibly combined. All columnstore tables and indexes share the same underlying storage architecture. Therefore, OceanBase Database naturally supports both rowstore and columnstore indexes.

-  Columnstore replicas: This feature is under development. Based on the native distributed architecture of OceanBase Database, this feature, once supported, will allow users to store incremental read-only replicas in columnar mode by performing compactions, with a few modifications to the original storage mode or the corresponding table.

  

**3. How to Store Data by Column**
------------

### **3.1 Create a columnstore table by default**

For online analytical processing (OLAP) scenarios, we recommend that users specify to create columnstore tables by default. This can be achieved by setting the following parameter:
```
    alter system set default_table_store_format = "column";
```

Once the setting takes effect, a columnstore table is created by default if no column group is specified for the created table.
```
    OceanBase(root@test)>create table  t1 (c1 int primary key, c2 int ,c3 int);
    Query OK,0 rows affected (0.301 sec)
    
    OceanBase(root@test)>show create table t1;
    
    CREATE TABLE `t1` (
      `c1` int(11) NOT NULL,
      `c2` int(11) DEFAULT NULL,
      `c3` int(11) DEFAULT NULL,
      PRIMARY KEY (`c1`)
    ) DEFAULT CHARSET = utf8mb4 ROW_FORMAT = DYNAMIC COMPRESSION = 'zstd_1.3.8' REPLICA_NUM = 1 BLOCK_SIZE = 16384 USE_BLOOM_FILTER = FALSE TABLET_SIZE = 134217728 PCTFREE = 0
    WITH COLUMN GROUP(each column)
    
    1 row in set (0.101 sec)
```

### **3.2 Specify to create a columnstore table**

To facilitate columnstore table creation, the `with column group` syntax is introduced in the table creation statement. If you specify `with column group (each column)` at the end of a `CREATE TABLE` statement, a columnstore table will be created.
```
    OceanBase(root@test)>create table  tt_column_store (c1 int primary key, c2 int ,c3 int) with column group (each column);
    Query OK,0 rows affected (0.308 sec)
    
    OceanBase(root@test)>show create table tt_column_store;
    
    CREATE TABLE `tt_column_store` (
      `c1` int(11) NOT NULL,
      `c2` int(11) DEFAULT NULL,
      `c3` int(11) DEFAULT NULL,
      PRIMARY KEY (`c1`)
    ) DEFAULT CHARSET = utf8mb4 ROW_FORMAT = DYNAMIC COMPRESSION = 'zstd_1.3.8' REPLICA_NUM = 1 BLOCK_SIZE = 16384 USE_BLOOM_FILTER = FALSE TABLET_SIZE = 134217728 PCTFREE = 0 WITH COLUMN GROUP(each column)
    
    1 row in set (0.108 sec)
```

### **3.3 Specify to create a hybrid rowstore-columnstore table**

If users want to balance between AP business and TP business and can accept a specific degree of data redundancy, they can add `all columns` in the `with column group` syntax to enable rowstore redundancy.
```
    create table  tt_column_row (c1 int primary key, c2 int , c3 int) with column group (all columns, each column);
    Query OK, 0 rows affected (0.252 sec)
    
    OceanBase(root@test)>show create table tt_column_row;
    CREATE TABLE `tt_column_row` (
      `c1` int(11) NOT NULL, 
      `c2` int(11) DEFAULT NULL, 
      `c3` int(11) DEFAULT NULL, 
      PRIMARY KEY (`c1`)
    ) DEFAULT CHARSET = utf8mb4 ROW_FORMAT = DYNAMIC COMPRESSION = 'zstd_1.3.8' REPLICA_NUM = 1 BLOCK_SIZE = 16384 USE_BLOOM_FILTER = FALSE TABLET_SIZE = 134217728 PCTFREE = 0 WITH COLUMN GROUP(all columns, each column)
    
    1 row in set (0.075 sec)
```

### **3.4 Columnstore scan**

Users can add `COLUMN TABLE FULL SCAN` in the plan to check the range scan for the columnstore table.
```
    OceanBase(root@test)>explain select * from tt_column_store;
    +--------------------------------------------------------------------------------------------------------+
    | Query Plan                                                                                             |
    +--------------------------------------------------------------------------------------------------------+
    | =================================================================                                      |
    | |ID|OPERATOR              |NAME           |EST.ROWS|EST.TIME(us)|                                      |
    | -----------------------------------------------------------------                                      |
    | |0 |COLUMN TABLE FULL SCAN|tt_column_store|1       |7           |                                      |
    | =================================================================                                      |
    | Outputs & filters:                                                                                     |
    | -------------------------------------                                                                  |
    |   0 - output([tt_column_store.c1], [tt_column_store.c2], [tt_column_store.c3]), filter(nil), rowset=16 |
    |       access([tt_column_store.c1], [tt_column_store.c2], [tt_column_store.c3]), partitions(p0)         |
    |       is_index_back=false, is_glOceanBaseal_index=false,                                                      |
    |       range_key([tt_column_store.c1]), range(MIN ; MAX)always true                                     |
    +--------------------------------------------------------------------------------------------------------+
```

`COLUMN TABLE GET` in the plan indicates the get operation with a specified primary key on the columnstore table.
```
    OceanBase(root@test)>explain select * from tt_column_store where c1 = 1;
    +--------------------------------------------------------------------------------------------------------+
    | Query Plan                                                                                             |
    +--------------------------------------------------------------------------------------------------------+
    | ===========================================================                                            |
    | |ID|OPERATOR        |NAME           |EST.ROWS|EST.TIME(us)|                                            |
    | -----------------------------------------------------------                                            |
    | |0 |COLUMN TABLE GET|tt_column_store|1       |14          |                                            |
    | ===========================================================                                            |
    | Outputs & filters:                                                                                     |
    | -------------------------------------                                                                  |
    |   0 - output([tt_column_store.c1], [tt_column_store.c2], [tt_column_store.c3]), filter(nil), rowset=16 |
    |       access([tt_column_store.c1], [tt_column_store.c2], [tt_column_store.c3]), partitions(p0)         |
    |       is_index_back=false, is_global_index=false,                                                      |
    |       range_key([tt_column_store.c1]), range[1 ; 1],                                                   |
    |       range_cond([tt_column_store.c1 = 1])                                                             |
    +--------------------------------------------------------------------------------------------------------+
    12 rows in set (0.051 sec)
```

Users may want to specify whether to perform a column store scan for a hybrid rowstore-columnstore table by using hints. To this end, the optimizer determines whether to perform a rowstore scan or columnstore scan for a hybrid rowstore-columnstore table based on costs. For example, for full table scans in a simple scenario, the system uses rowstore for generating a plan by default.
```
    OceanBase(root@test)>explain select * from tt_column_row;
    +--------------------------------------------------------------------------------------------------+
    | Query Plan                                                                                       |
    +--------------------------------------------------------------------------------------------------+
    | ========================================================                                         |
    | |ID|OPERATOR       |NAME         |EST.ROWS|EST.TIME(us)|                                         |
    | --------------------------------------------------------                                         |
    | |0 |TABLE FULL SCAN|tt_column_row|1       |3           |                                         |
    | ========================================================                                         |
    | Outputs & filters:                                                                               |
    | -------------------------------------                                                            |
    |   0 - output([tt_column_row.c1], [tt_column_row.c2], [tt_column_row.c3]), filter(nil), rowset=16 |
    |       access([tt_column_row.c1], [tt_column_row.c2], [tt_column_row.c3]), partitions(p0)         |
    |       is_index_back=false, is_global_index=false,                                                |
    |       range_key([tt_column_row.c1]), range(MIN ; MAX)always true                                 |
    +--------------------------------------------------------------------------------------------------+
```

Users can also forcibly perform a columnstore scan for the tt_column_row table by specifying the USE\_COLUMN\_TABLE hint..
```
    OceanBase(root@test)>explain select /*+ USE_COLUMN_TABLE(tt_column_row) */ * from tt_column_row;
    +--------------------------------------------------------------------------------------------------+
    | Query Plan                                                                                       |
    +--------------------------------------------------------------------------------------------------+
    | ===============================================================                                  |
    | |ID|OPERATOR              |NAME         |EST.ROWS|EST.TIME(us)|                                  |
    | ---------------------------------------------------------------                                  |
    | |0 |COLUMN TABLE FULL SCAN|tt_column_row|1       |7           |                                  |
    | ===============================================================                                  |
    | Outputs & filters:                                                                               |
    | -------------------------------------                                                            |
    |   0 - output([tt_column_row.c1], [tt_column_row.c2], [tt_column_row.c3]), filter(nil), rowset=16 |
    |       access([tt_column_row.c1], [tt_column_row.c2], [tt_column_row.c3]), partitions(p0)         |
    |       is_index_back=false, is_global_index=false,                                                |
    |       range_key([tt_column_row.c1]), range(MIN ; MAX)always true                                 |
    +--------------------------------------------------------------------------------------------------+
``` 

Similarly, users can use the NO_USE_COLUMN_TABLE hint to forcibly forbid columnstore scan for the table.
```
    OceanBase(root@test)>explain select  /*+ NO_USE_COLUMN_TABLE(tt_column_row) */ c2 from tt_column_row;
    +------------------------------------------------------------------+
    | Query Plan                                                       |
    +------------------------------------------------------------------+
    | ========================================================         |
    | |ID|OPERATOR       |NAME         |EST.ROWS|EST.TIME(us)|         |
    | --------------------------------------------------------         |
    | |0 |TABLE FULL SCAN|tt_column_row|1       |3           |         |
    | ========================================================         |
    | Outputs & filters:                                               |
    | -------------------------------------                            |
    |   0 - output([tt_column_row.c2]), filter(nil), rowset=16         |
    |       access([tt_column_row.c2]), partitions(p0)                 |
    |       is_index_back=false, is_global_index=false,                |
    |       range_key([tt_column_row.c1]), range(MIN ; MAX)always true |
    +------------------------------------------------------------------+
    11 rows in set (0.053 sec)
```
  

**4. Vision for the Future**
----------

The introduction of the columnar storage feature in OceanBase Database V4.3 provides new storage solutions for users in data analysis and real-time analysis scenarios. OceanBase Database will keep optimizing this feature to bring the following benefits to users:

**First, enriched experiences.** OceanBase Database supports a pure columnar storage engine for the time being, and will support user-defined column groups in the future to meet various analysis needs. Moreover, we are going to strengthen the direct load feature for incremental data to help users efficiently import data, thus shortening the preparation time for data analysis.

**Second, enhanced performance.** We aim to enhance the skip index feature to better satisfy users' query requirements. We plan to unify the standard for storage formats and associate them with the vectorized engine. This way, the system will be able to identify different storage formats during SQL execution, helping users save overheads in data format conversion.

**Third, more flexible deployment modes.** In later versions, OceanBase Database will support the heterogeneous replicas required by users in OLAP scenarios. We are also considering a cost-effective storage/computing splitting solution that is applicable to AP databases.