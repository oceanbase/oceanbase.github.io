---
title: Factors affecting the performance of OceanBase Database
weight: 3
---

# 3.2 Factors affecting the performance of OceanBase Database

The performance of a database is subject to a variety of factors. From the perspective of software, the code, algorithm, and system architecture directly affect the database performance. As a hybrid transactional and analytical processing (HTAP) database with high performance, OceanBase Database has undergone constant improvement in terms of performance and resource utilization during version iterations. 

Operating system parameters also affect the database performance. The operating system serves as a bridge between the software and the hardware of the database. Proper parameter configurations enable the operating system to manage resources and execute tasks in a more efficient manner. This involves refined control on core components such as the memory management, process scheduling, and I/O components. 

After software and hardware resources are properly configured, you can take measures, such as runtime data resource allocation, database parameter tuning, and O&M, to make full use of existing system resources to maximize the database performance without compromising system stability. 

## Operating system parameters

You can configure network, memory, and I/O parameters properly to optimize the resource utilization and improve the performance. 

<table>
  <thead>
    <tr>
      <th>Category</th>
      <th>Parameter</th>
      <th>Description</th>
      <th>Recommended value/range</th>
    </tr>
  </thead>
  <tr>
    <td rowspan="13">Network parameters</td>
    <td>net.core.somaxconn</td>
    <td>The maximum length of the socket listening queue. Set this parameter to a large value if you frequently establish connections.</td>
    <td><code>2048</code>. The default value is <code>128</code>.</td>
  </tr>
  <tr>
    <td>net.core.netdev_max_backlog</td>
    <td>The length of the buffer queue processed by the protocol stack. A small value may lead to packet loss.</td>
    <td><code>10000</code></td>
  </tr>
  <tr>
    <td>net.core.rmem_default</td>
    <td>The default size of the receive buffer queue.</td>
    <td><code>16777216</code></td>
  </tr>
  <tr>
    <td>net.core.wmem_default</td>
    <td>The default size of the send buffer queue.</td>
    <td><code>16777216</code></td>
  </tr>

  <tr>
    <td>net.core.rmem_max</td>
    <td>The maximum size of the receive buffer queue.</td>
    <td><code>16777216</code></td>
  </tr>

  <tr>
    <td>net.core.wmem_max</td>
    <td>The maximum size of the send buffer queue.</td>
    <td><code>16777216</code></td>
  </tr>

  <tr>
    <td>net.ipv4.ip_local_port_range</td>
    <td>The TCP/UDP port range for the local client. The local client uses a port within this range to initiate a connection with a remote client.</td>
    <td>[3500, 65535]</td>

  </tr>

  <tr>
    <td>net.ipv4.tcp_rmem</td>
    <td>The receive buffer size of the socket. You need to specify three values from left to right: minimum size, default size, and maximum size.</td>
    <td><code>4096</code> (minimum size), <code>87380</code> (default size), and <code>16777216</code> (maximum size).</td>
  </tr>

  <tr>
    <td>net.ipv4.tcp_wmem</td>
    <td>The send buffer size of the socket. You need to specify three values from left to right: minimum size, default size, and maximum size.</td>
    <td><code>4096</code> (minimum size), <code>65536</code> (default size), and <code>16777216</code> (maximum size).</td>
  </tr>

  <tr>
    <td>net.ipv4.tcp_max_syn_backlog</td>
    <td>The number of connections in the SYN_RECVD state.</td>
    <td><code>16384</code></td>
  </tr>

  <tr>
    <td>net.ipv4.tcp_fin_timeout</td>
    <td>The duration of the FIN-WAIT-2 state after the socket is proactively disconnected.</td>
    <td><code>15</code></td>
  </tr>

  <tr>
    <td>net.ipv4.tcp_tw_reuse</td>
    <td>Specifies whether to allow to reuse a socket in the TIME WAIT state.</td>
    <td><code>1</code>, which means a socket in the TIME WAIT state can be reused.</td>

  </tr>

  <tr>
    <td>net.ipv4.tcp_slow_start_after_idle</td>
    <td>Specifies whether to allow to perform a slow start when a TCP connection resumes from the idle state. Prohibiting slow start will reduce the network latency in some cases.</td>
    <td><code>0</code>, which means that slow start is prohibited.</td>
  </tr>

  <tr>
    <td rowspan="2">Memory parameters</td>
    <td>vm.swappiness</td>
    <td>Specifies whether to preferentially use the physical memory.</td>
    <td><code>0</code></td>
  </tr>

  <tr>
    <td>vm.max_map_count</td>
    <td>The number of virtual memory areas that a process can have.</td>
    <td><code>655360</code></td>
  </tr>

  <tr>
    <td>AIO parameters</td>
    <td>fs.aio-max-nr</td>
    <td>The number of asynchronous I/O (AIO) requests.</td>
    <td><code>1048576</code></td>
  </tr>
</table>

## Resource allocation

### Disk partitioning

An OBServer node depends on syslogs, transaction logs (clogs), and data files when it is running. Storing the log files on the same disk may incur risks due to hardware resource contention.

* When the disk space occupied by clogs exceeds the value of [log_disk_utilization_threshold](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105665), which is 80% by default, clog files will be recycled. When the disk space occupied by clogs exceeds the value of [log_disk_utilization_limit_threshold](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105673), which is 95% by default, data write will be stopped on the OBServer node. 

* Operations, such as minor compactions and major compactions, that consume extra I/O resources may contend with business read/write requests for I/O resources, leading to business jitters. 

* The resource contention slows down data synchronization in OceanBase Change Data Capture (CDC). 

You can take the following measures to address the risks:

* When resources on the OBServer node are sufficient, we recommend that you mount three solid-state drives (SSDs) for storage. If the OBServer node does not have three disks or uses Redundant Array of Independent Disks (RAID) for storage, you need to partition the disks or the logical volumes of the disk array. 

* You can enable log throttling to limit the disk I/O bandwidth available for syslogs. Here is an example: 

   ```sql
   alter system set syslog_io_bandwidth_limit='10M';
   ```

* You can enable syslog recycling and set the maximum number of syslog files. Here is an example: 

   ```sql
   alter system set enable_syslog_recycle = true; alter system set max_syslog_file_count = 1000;
   ```

### Primary zone

In OceanBase Database, a leader is responsible for the read and write requests in strong-consistency scenarios. Therefore, the distribution of partition leaders determines the distribution of business traffic on OBServer nodes. 

The distribution of leaders is controlled by the primary zone, which describes the distribution preferences of leaders. Leaders carry the strong-consistency read/write business traffic. In other words, the primary zone determines the distribution of traffic in OceanBase Database. 

For an OceanBase cluster deployed across multiple nodes, you can set the primary zone to `RANDOM` to scatter leaders of different partitions on nodes in different zones, so as to maximize the resource utilization of each node in the cluster. 

### Partitioned tables

In OceanBase Database, partitioning allows you to decompose a table into multiple smaller and more manageable parts called partitions based on specific rules. A partitioned table horizontally splits a large table into multiple independent partitions. 

Partitioning brings the following benefits:

* Higher availability

   The unavailability of a partition does not necessarily mean that the entire table is unavailable. The query optimizer automatically removes unreferenced partitions from the query plan. Therefore, queries are not affected when the partitions are unavailable. 

* Easier management of database objects

   A partitioned object has pieces that can be managed collectively or separately. You can use DDL statements to operate partitions rather than the whole table or index. Therefore, you can decompose resource-intensive tasks such as the recreation of an index or table. For example, you can move only one partition at a time. If an error occurs, you need to move only the partition again rather than move the table again. In addition, you can execute a `TRUNCATE` statement on a partition to avoid unnecessary deletion of a large amount data. 

* Reduced contention for shared resources in online transaction processing (OLTP) systems

   In OLTP scenarios, partitioning can reduce contention for shared resources. For example, a DML operation is performed on many partitions rather than one table. 

* Enhanced query performance in data warehouses

   In analytical processing (AP) scenarios, partitioning can speed up the processing of ad hoc queries. Partitioning keys can implement filtering. For example, if sales data is partitioned by sales time and you want to query the sales data of a quarter, you need to query only one or several partitions rather than the entire table. 

* Better load balancing results

   OceanBase Database stores data and implements load balancing by partition. Different partitions can be stored on different OBServer nodes in an OceanBase cluster. Therefore, different partitions of a partitioned table can be distributed on different OBServer nodes so that the data of a table can be evenly distributed across the entire OceanBase cluster. 

### Table groups

A table group is a logical concept. It represents a collection of tables. By default, data is randomly distributed to tables. In a distributed scenario, you can define a table group to control the physical closeness among a group of tables, thereby reducing the overhead and improving the performance. 

In OceanBase Database V3.x, a table group is a partitioned one and tables joining a table group must have the same partitioning type as the table group. This imposes limitations on tables to be added to a table group. In OceanBase Database V4.2.0 and later, after you define the `SHARDING` attribute, you can flexibly add tables with different partitioning types to a table group. 

Table groups with the `SHARDING` attribute can be classified based on the attribute values. 

* Table groups with the `SHARDING` attribute set to `NONE`: All partitions of all tables in such a table group are aggregated on the same server and the tables can have different partitioning types. 

* Table groups with `SHARDING` not set to `NONE`: The data of each table in such a table group is distributed to multiple servers. To ensure consistent table data distribution, all tables in the table group must have the same partition definition, including the partitioning type, partition count, and partition value. The system schedules or aligns partitions with the same partition attribute to the same server to implement partition-wise join. 

For more information about table groups, see [Reference > Database object management > MySQL mode > Create and manage table groups](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105763) in OceanBase Database Documentation. 

### Local and global indexes

#### Local indexes

Local indexes of a partitioned table are similar to those of a non-partitioned table. The data structure of indexes is also in a one-to-one correspondence with the data structure of the primary table. However, the primary table has been partitioned, so each partition of the primary table has its own separate index data structure. In the index data structure, each key only maps to the primary table in its partition, instead of that in other partitions. Therefore, this type of index is called the local index. 

#### Global indexes

Compared with the local index of a partitioned table, the global index of a partitioned table does not maintain the one-to-one relationship with the partitions of the primary table. Instead, it takes the data of all primary table partitions as a whole. In addition, one key of the global index may map to data in multiple primary table partitions if the index key has duplicate values. Furthermore, for a global index, you can define an independent data distribution mode, which can be the non-partitioned mode or partitioned mode. In partitioned mode, the partition structure of global indexes can be the same as or be different from that of the primary table. The partition mode of a global index is completely independent of that of the primary table, so a global index looks more like a separate table. Therefore, a global index is also called an index table. 

We recommend that you use global indexes in the following scenarios:

* In addition to the primary key, combinations of other columns must meet the global uniqueness requirement. This business requirement can only be met by using globally unique indexes. 

* Business queries cannot obtain the conditional predicate of the partitioning key, and the business table does not involve high-concurrency parallel write-in. To avoid scanning all partitions, you can create a global index based on the query conditions. When necessary, you can partition the global index based on a new partitioning key. 

Global indexes make it possible to ensure the global uniqueness of data and implement data re-partitioning and also meet the high requirements of some applications to query data from different dimensions. However, each data write operation may become a cross-IDC distributed transaction, which affects the writing performance in high-concurrency writing scenarios. If a business query can obtain the conditional predicate of the partitioning key, we still recommend that you create local indexes in OceanBase Database to exclude unqualified partitions by using the partition pruning feature of the database optimizer. This design considers both the query and writing performance to optimize the overall system performance. 

## Database parameter tuning

OceanBase Database V4.x is extensively optimized to improve user experience, ease of use, and performance. You can achieve desired database performance by tuning basic parameters. You can also tune parameters based on the runtime environment and business scenarios to further improve the database performance. 

### OLTP scenarios

To configure OceanBase Database parameters, run the `obclient -h<host_ip> -P<host_port> -uroot@sys -A -p` command to connect to the sys tenant, and then execute the following statements:

```shell
# Disable SQL audit
ALTER system SET enable_sql_audit=false;
# Disable information collection for performance events
ALTER system SET enable_perf_event=false;
# Set the syslog level to ERROR to reduce generated logs
ALTER system SET syslog_level='ERROR';
# Disable trace log recording
alter system set enable_record_trace_log=false;
```

To configure OceanBase Database Proxy (ODP) parameters, run the `obclient -h<host_ip> -P<host_port> -uroot@sys -A -p` command to connect to the sys tenant, and then execute the following statements:

> **Note**
>
> To modify ODP parameters, you must log on to the sys tenant of the OceanBase cluster by using the IP address and port of ODP. 

```shell
# Increase the maximum runtime memory of ODP
ALTER proxyconfig SET proxy_mem_limited='4G';
# Disable the compression protocol of ODP
ALTER proxyconfig set enable_compression_protocol=false;
```

### OLAP scenarios

To configure OceanBase Database parameters, connect to a user tenant and execute the following statements:

```shell
# Set the percentage of the SQL workspace memory to the total memory of the tenant
SET GLOBAL ob_sql_work_area_percentage = 80;
# Set the maximum execution time of an SQL statement
SET GLOBAL ob_query_timeout = 36000000000;
# Set the timeout period of transactions
SET GLOBAL ob_trx_timeout = 36000000000;
# Set the maximum size of network packets
SET GLOBAL max_allowed_packet = 67108864;
# Set the number of PX threads that can be requested by the tenant on each node
SET GLOBAL parallel_servers_target = 624;
```

## Major compactions and statistics collection

### Major compactions

A major compaction compacts all dynamic and static data, which is a time-consuming operation. Specifically, a major compaction compacts SSTables and MEMTables of the current major version with the full static data of an earlier version to generate a new set of full data. During a major compaction, OceanBase Database compresses the data twice: semantics-based encoding within the database and general compression by using the specified compression algorithm. In general compression, the encoded data is compressed by using an algorithm such as LZ4. Compression saves storage space and greatly improves query performance. Compression has a slight impact on data write performance in OceanBase Database, which is built based on the log-structured merge-tree (LSM-tree) architecture. 

### Statistics collection

In a database, the optimizer tries to generate the optimal execution plan for each SQL query, most commonly, based on real-time and effective statistics and accurate row estimates. Statistics here refer to optimizer statistics, which are a set of data that describes the tables and columns in a database, and are the key for the cost model to select the optimal execution plan. The optimizer cost model selects an execution plan and optimizes plan selection based on the statistics on the tables, columns, predicates, and other objects involved in a query. Accurate and effective statistics can help the optimizer select the optimal execution plan. 

In OceanBase Database, the optimizer stores statistics as common data in internal tables and maintains a local cache of statistics to speed up access to statistics. In OceanBase Database of a version earlier than V4.0, statistics are collected during daily major compactions. However, statistics collected in this way are not always accurate because only incremental data is compacted in daily major compactions. In addition, the issue of data skew cannot be resolved because histogram information cannot be collected during daily major compactions. In OceanBase Database V4.0, statistics collection is decoupled from daily major compactions. In other words, statistics are not collected during daily major compactions and execution plans are not affected by daily major compactions. 
