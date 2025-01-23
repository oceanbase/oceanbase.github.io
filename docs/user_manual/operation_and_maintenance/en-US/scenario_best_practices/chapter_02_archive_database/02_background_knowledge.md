---
title: Background Knowledge of the Storage Engine
weight: 2
---

> In the process of collecting suggestions for this advanced tutorial, many users hope to learn more about the background knowledge and the implementation principles of key technologies. Therefore, this topic is added to brief the architecture of the OceanBase Database storage engine, the encoding and compression technologies adopted by the database system, as well as several ways to reduce the impact of encoding on the query performance.

> The content marked red in this topic is easily ignored when you use OceanBase Database in a test or production environment, which may lead to serious impact. We recommend that you pay more attention to such content.

## Architecture of the Storage Engine

Generally, a history database is **write-intensive** (with more writes than reads). Based on the log-structured merge-tree (LSM-tree), the storage engine of OceanBase Database is endowed with high write performance. In a history database, direct load is leveraged to efficiently synchronize data in batches periodically, with data update and real-time data synchronization supported.

The storage engine of OceanBase Database stores baseline data in baseline SSTables and incremental data in MemTables and incremental SSTables. The baseline data is read-only and cannot be modified. Incremental data supports both read and write operations.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/001.png)

**In OceanBase Database, DML operations such as `INSERT`, `UPDATE`, and `DELETE` are first written to MemTables in memory. This means that the data write performance is equivalent to that of an in-memory database, which agrees with the write-intensive scenario of our history database.** 

**When the size of a MemTable reaches the specified threshold, data in the MemTable is dumped to an incremental SSTable on the disk, as shown in the preceding figure. The dumping process is performed sequentially in batches, delivering much higher performance compared with the discrete random writing of a B+ tree-based storage engine.**

When the size of an incremental SSTable reaches the specified threshold, incremental data in the SSTable is merged with the existing baseline data to produce new baseline data. This process is referred to as a major compaction. Then, the new baseline data remains unchanged until the next major compaction. OceanBase Database automatically performs a major compaction during off-peak hours early in the morning on a daily basis.

A downside of the LSM-tree architecture is that it causes read amplification, as shown by the right-side arrows in the preceding figure. Upon a query request, OceanBase Database queries SSTables and MemTables separately, merges the query results, and then returns the merged result to the SQL layer. To mitigate the impact of read amplification, OceanBase Database implements multiple layers of caches in memory, such as the block cache and row cache, to avoid frequent random reads of baseline data.

The history database contains a small amount of incremental data and most data is stored in baseline SSTables. Therefore, for regular batch processing reports of the history database and extensive data scan in ad-hoc analytical queries, computations can be pushed down to the baseline SSTables to bypass the general issue of read amplification in the LSM-tree architecture. OceanBase Database supports pushing down operators on compressed data and uses a compression format that supports vectorized decoding. This way, it can easily process a large amount of data queries and computations.

The SSTable storage format and data encoding and compression technologies enable OceanBase Database to store massive amounts of historical data. The high compression ratio and the higher query performance on equivalent hardware can significantly reduce the storage and computation costs.

In addition, enterprises can choose to deploy the cluster of the history database on more cost-effective hardware, where data encoding and compression configurations hardly need to be considered during database O&M. In terms of application development, the same interface can be used to access the online database and history database, which simplifies the application code and architecture.

Attracted by these characteristics, more and more enterprises begin to use an OceanBase database as their history database. In the future, OceanBase Database will continue to seek breakthroughs in storage architecture, cost reduction, and efficiency improvement.

## Data Compression and Encoding Technologies

OceanBase Database supports both compression and encoding. Compression does not consider data characteristics, while encoding compresses data by column based on data characteristics. The two methods are orthogonal, meaning that we can first encode a data block and then compress it to achieve a higher compression ratio.

At the stage of compression, OceanBase Database uses compression algorithms to compress a microblock without considering the data format, and eliminate data redundancy if detected. OceanBase Database supports zlib, snappy, zstd, and lz4 algorithms for compression. You can use DDL statements to configure and change the compression algorithms for tables based on table application scenarios.

> Note: The concept of microblock is similar to the concepts of page and block in conventional databases. In the LSM-tree architecture, microblocks in OceanBase Database are compressed and become longer after compression. When you create a table, you can set the `block_size` parameter to specify the size of microblocks before compression. (Now you know the meaning of the `block_size` parameter in the output of the `SHOW CREATE TABLE` statement.)

**You can set `block_size`, which defaults to `16KB`, to a larger value to achieve a higher compression ratio. However, this may compromise the read performance because microblock is the smallest unit of read I/O operations. If you want to read a specific row of data in a microblock, only this row of data is decoded. This prevents specific decompression algorithms from decompressing the entire data block when you want to read only a part of data in the data block. If you set `block_size` to a large value, microblocks with data updates cannot be reused during a major compaction but must be rewritten, which slows down the major compaction.** **<font color="red">Adjusting the value of the `block_size` parameter has its pros and cons. You can modify the parameter value as needed after you understand the meaning and impact. We recommend that you use the default value.</font>**

Before data is read from a compressed microblock, the whole microblock is decompressed for scanning, which causes CPU overhead. To minimize the impact of decompression on the query performance, OceanBase Database assigns the decompression task to asynchronous I/O threads and then stores the decompressed microblocks in the block cache as needed. This, combined with query prefetching, provides a pipeline of microblocks for query processing threads and eliminates the additional overhead due to decompression.


### Encoding technology for compression

- Data is stored in columns by city, gender, product category, and other classification attributes. In this case, data in each column has a small cardinality. We can create dictionaries directly on these columns to achieve a higher compression ratio.

- If data is inserted into the database in chronological order, time-related columns and auto-increment columns of the inserted rows have small value ranges, and their values increase monotonically. We can make use of these characteristics and apply encoding algorithms such as bit-packing and delta encoding quite easily.

To achieve a higher compression ratio and help users slash storage costs, OceanBase Database has developed a variety of encoding algorithms that have worked well. In addition to single-column encoding algorithms, such as bit-packing, hex encoding, dictionary encoding, run-length encoding (RLE), constant encoding, delta encoding for numeric data, and delta encoding for fixed-length strings, OceanBase Database also provides innovative span-column equal encoding and column prefix encoding to compress different types of redundant data in one or several columns, respectively.

#### Reduced bit width for storage: bit-packing and hex encoding

Bit-packing and hex encoding are similar in that they represent the original data by encoding it with fewer bits if the cardinality of data is small. Moreover, these two encoding algorithms are not exclusive, which means that you can perform bit-packing or hex encoding on numeric data or strings generated by other encoding algorithms to further reduce data redundancy.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/002.png)

(Bit-packing)

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/003.png)

(Hex encoding)


#### Data deduplication for a single column: dictionary encoding and RLE

We can create a dictionary for a data block to compress data with a low cardinality. If the distribution of data with a low cardinality in a microblock conforms to corresponding characteristics, you can use an encoding method such as RLE or constant encoding to further compress the data.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/004.png)

(Dictionary encoding and RLE)

> Note: In the RLE on the rightmost of the preceding figure, the values 0, 4, and 6 in the first column are the initial subscripts of 0, 1, and 2 in the right-side dictionary encoding. RLE and dictionary encoding apply to scenarios with a large amount of continuous duplicate data.


#### Value range-based data compression: delta encoding

OceanBase Database supports delta encoding for numeric data and delta encoding for fixed-length strings. Delta encoding for numeric data is suitable for compressing numeric data in a small value range. To compress date, timestamp, or other numeric data of small adjacent differences, we can keep the minimum value, and store the difference between the original data and the minimum value in each row. Delta encoding for fixed-length strings is a better choice for compressing artificially generated nominal numbers, such as order IDs and ID card numbers, as well as strings of a certain pattern, such as URLs. We can specify a pattern string for a microblock of such data and store the difference between the original string and the pattern string in each row to achieve better compression results.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/005.png)

(Delta encoding for numeric data)

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/006.png)

(Delta encoding for fixed-length strings)


#### Reduced redundancy across columns: span-column encoding

OceanBase Database provides span-column encoding to improve the compression ratio by making use of the data similarity between different columns. Technically, a columnar storage database encodes data only within columns. In an actual business database, however, it is common that data in different columns are associated. In this case, you can use one column to represent part of the information of another column.

Span-column encoding outperforms other encoding algorithms in the compression of composite columns and system-generated data, and can also reduce the data redundancy due to inappropriate table design paradigms.

> Note: Span-column encoding is used only for columns with certain associations, for example, most data of two columns is equivalent or the data of one column is the prefix or substring of another column.


### Adaptive compression

Adaptive compression allows the database system to select an optimal encoding algorithm.

The compression performance of data encoding algorithms is related not only to the table schema but also to data characteristics such as the distribution of data and the value range of data within a microblock. This means it is hard to achieve the best compression performance by specifying a columnar encoding algorithm when you design the table data model.

To make your work easier and improve the compression performance, OceanBase Database can analyze characteristics such as the data type, value range, and number of distinct values (NDV) of a column during major compaction. It can also select an appropriate encoding algorithm based on the encoding algorithm and compression ratio of the corresponding column in the previous microblock in the compaction task. OceanBase Database supports encoding the same column in different microblocks with different algorithms while ensuring that the overhead in selecting an encoding algorithm is within an acceptable range.


### Reduce the impact of data encoding on the query performance

To better balance compression performance and query performance, we have considered the impact on the query performance when designing data encoding methods.


#### Row-level random access

In compression scenarios, the whole data block will be decompressed even if you want to access just a part of data in it. When you access a row in some analytical systems intended for scan queries rather than point queries, adjacent or all rows in the database are decoded.

To better support transactional workloads, OceanBase Database needs to support more efficient point queries. Therefore, our encoding methods ensure row-level random access to encoded data. To be specific, the database accesses and decodes only the metadata of the target row in a point query, which reduces the computational amplification during random point queries. In addition, OceanBase Database stores all metadata required for decoding data in a microblock just within the microblock, so that the microblock is self-describing with better memory locality during decoding.

> Note: In other words, when you perform a point query, OceanBase Database can decode a single row rather than the whole microblock.

#### Computation pushdown

Furthermore, since we store ordered dictionaries, null bitmaps, constants, and other metadata in a microblock to describe the distribution of the encoded data, we can use the metadata to optimize the execution of some filter and aggregate operators during a data scan, and to perform computations directly on the encoded data.

OceanBase Database significantly strengthened its analytical processing capabilities. In the latest versions, aggregation and filtering are pushed down to the storage layer and the vectorized engine is used for vectorized batch decoding based on the columnar storage characteristics of encoded data.

When processing a query, OceanBase Database performs computations directly on the encoded data by making full use of the encoding metadata and the locality of encoded data stored in a columnar storage architecture. This brings a significant increase in the execution efficiency of the pushed-down operators and the data decoding efficiency of the vectorized engine. Data encoding-based operator push-down and vectorized decoding are also important features that have empowered OceanBase Database to efficiently handle analytical workloads and demonstrate an extraordinary performance in TPC-H benchmark tests.

> Note: In other words, for common filter conditions and simple aggregate computations, the storage layer does not need to transfer data to the SQL layer for computation. OceanBase Database can directly complete the computations in the storage layer, saving the overhead for the storage layer to return rows to the SQL layer. OceanBase Database also supports directly performing computations on encoded data, saving the overhead in decoding.

### Basic test of encoding and compression

We performed a simple test to see the influence of different compression methods on the compression performance of OceanBase Database.

We used OceanBase Database V4.0 to test the compression ratio with a TPC-H 10 GB data model in transaction scenarios and with an IJCAI-16 Brick-and-Mortar Store Recommendation Dataset in user behavior log scenarios.

- The TPC-H model simulated real-life order and transaction processing. We tested the compression ratios of two large tables in the TPC-H model: ORDERS table, which stores order information, and LINEITEM table, which stores product information. Under the default configuration where both the zstd and encoding algorithms were used, the compression ratio of the two tables reached about 4.6 in OceanBase Database, much higher than the compression ratio achieved when only the encoding or zstd algorithm was used.

- The IJCAI-16 taobao user log dataset stored desensitized real behavior logs of Taobao users. The compression ratio reached 9.9 when the zstd and encoding algorithms were combined, 8.3 for the encoding algorithm alone, and 6.0 for the zstd algorithm alone.

![image](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/02_background_knowledge/007.png)