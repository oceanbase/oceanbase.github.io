---
title: Read/Write Splitting Strategy and Architecture
weight: 3
---

> Note: At present, *OceanBase Advanced Tutorial for DBAs* applies only to OceanBase Database Community Edition. Therefore, the arbitration replica feature of OceanBase Database Enterprise Edition is not included in the tutorial outline provided in this topic. For more information about the differences between the two editions, see [Differences between Enterprise Edition and Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714481).

## Overview
The read/write splitting strategy separates query operations from write operations in a database, preventing mutual impact and improving resource utilization. In a hybrid transaction and analytical processing (HTAP) database, read/write splitting scenarios are common, and read-only scenarios include business intelligence (BI) queries, extract, transform, and load (ETL) in big data, and data pulling from caches.

Hosting both transaction processing (TP) business and analytical processing (AP) business in the same database cluster raises high requirements for database configurations. The read/write splitting strategy is generally used to route some read requests to followers to reduce the resource usage by complex online analytical processing (OLAP) requests and shorten the response time of online business.

OceanBase Database natively supports read/write splitting by using [OceanBase Database Proxy (ODP)](https://open.oceanbase.com/blog/10900290) and modifying the configurations of OBServer nodes.

OceanBase Database provides two read consistency levels: strong consistency and weak consistency. Strong-consistency read requests are routed to the leader to read the latest data. [Weak-consistency read requests](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001029729) are preferentially routed to followers and may not read the latest data.

OceanBase Database allows you to add an SQL hint to an SQL statement to be executed at the application side to explicitly enable weak-consistency reads, thereby implementing comment-based read-write splitting. OceanBase Database supports the following three common read/write splitting strategies and allows you to flexibly configure a read/write splitting strategy as needed.

## Follower-first Read (Weak-consistency Read) Strategy
1. Single-table SQL queries are generally routed to the node where the leader of the table resides, regardless of the ODP that you use to connect to the OceanBase cluster. This default routing strategy is called strong-consistency read.
2. You can change the routing strategy of ODP to follower-first so that business read traffic is assigned to the ODP and read requests are preferentially routed to followers. By default, ODP routes a read request to the local follower. If the local replica is the leader, ODP preferentially routes the read request to the follower in another IDC in the same region. In one word, the follower-first read strategy means to read a nearby follower.
3. For the configuration method, see [Best practices for read/write splitting](https://en.oceanbase.com/docs/common-best-practices-10000000001714402).

**The following figure shows the routing strategy.**

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/001.png)

**Advantages**: The configuration procedure is simple. You need to modify only ODP settings but no OBServer node settings. Read traffic is evenly distributed to all followers.

**Disadvantages**: If the local replica is the leader, read requests need to be routed across IDCs (zones). If leaders are not changed, the leader and followers of different replicas may coexist in the same zone or server. In other words, zone- or server-level read/write splitting cannot be fully implemented.

**<font color="red">Scenarios: Generally, the follower-first read (weak-consistency read) strategy applies to scenarios without high requirements for read/write splitting and with a few read requests. For a scenario with many read requests, the read-only zone or read-only replica strategy is recommended to avoid affecting read and write operations of the leader. </font>**

## Read-only Zone Strategy


1. Set `PRIMARY_ZONE` to `zone1,zone2;zone3`. Note that a comma (,) is used between `zone1` and `zone2`, while a semicolon (;) is used between `zone2` and `zone3`, which indicates that both `zone1` and `zone2` are set to primary zones. Therefore, all leaders will be migrated to `zone1` and `zone2`. By default, followers are routed to `zone3` and are configured to process only OLAP SQL statements for which the weak-consistency read strategy is specified.
2. SQL statements that require weak-consistency read are routed to the ODP with weak-consistency read enabled. Other SQL statements are routed to a normal ODP.
3. All SQL statements bound for the ODP with weak-consistency read enabled are automatically routed to the local follower based on the logical data center (LDC)-based strategy and follower-first read strategy.
4. For the configuration method, see [Best practices for read/write splitting](https://en.oceanbase.com/docs/common-best-practices-10000000001714402).

**The following figure shows the routing strategy.**

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/002.png)

**Advantages**: Read/Write splitting is implemented at the zone level by setting a read-only zone. The isolation performance is higher than that of the follower-first read strategy.

**Disadvantages**: The primary zones must be manually specified. The write traffic will be distributed to `zone1` and `zone2`.

**<font color="red">Scenarios: The read-only zone strategy applies to scenarios with balanced read and write requests. </font>**

## Read-only Replica Strategy
Apart from full-featured replicas, OceanBase Database also supports read-only replicas. The name of read-only replicas is READONLY or R for short. Read-only replicas support read operations and do not support write operations. A read-only replica can serve only as a follower of a log stream, and cannot participate in election or voting. In other words, a read-only replica cannot be elected as the leader of the log stream.

You can configure a dedicated zone to host a read-only replica for processing OLAP requests. When the read-only replica fails, services of the primary cluster are not affected.


1. The primary cluster provides services normally.
2. AP requests are routed by using an independent ODP to a read-only replica.
3. Select the read-only replica type for the corresponding zone during tenant creation. **Note that a full-featured replica can be dynamically switched to a read-only replica.**

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/003.png)


**The following figure shows the routing strategy.**

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/004.png)

**Advantages**: OLAP requests can be fully isolated from online transaction processing (OLTP) requests without affecting each other.

**Disadvantages**: More resources are required for the read-only replica.

**<font color="red">Scenarios: The read-only replica strategy applies to scenarios with far more read requests than write requests, most of which do not require high real-time performance, or scenarios with a large number of AP requests. </font>**

## Read-only Standby Cluster (Standby Tenant) Strategy
The preceding read/write splitting strategies apply to the three-replica or five-replica architecture. **<font color="red">For scenarios that demand cost effectiveness but not require high availability</font>**, you can build a single-replica or three-replica standby cluster for the OceanBase cluster and route read-only requests only to the standby cluster.

Notice: A standby cluster supports only reads and the reads must have weak consistency.

For information about the Physical Standby Database solution, see [Physical standby database solution based on asynchronous log replication](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/en-US/disaster_recovery_architecture_design/primary_standby_database_solution).

You can create a standby tenant in OceanBase Cloud Platform (OCP) by setting the tenant type to STANDBY and specifying the primary tenant for it.

## Summary
To sum up, OceanBase Database supports the following read/write splitting strategies:

- Follower-first read/Read-only zone: In the three-replica or five-replica architecture, you can specify a weak-consistency read hint or configure session settings to enable certain SQL statements to access a nearby read-only replica.

- Read-only replica: In the three-replica or five-replica architecture, you can specify one or more additional read-only replicas and configure a dedicated ODP to route read-only requests to the read-only replicas.

- Read-only standby cluster: You can build a standby cluster with one or three replicas. In this case, read-only requests are routed only to this standby cluster.

Advantages of the read/write splitting feature:

- A follower or read-only replica, which does not support write operations, will not be mistakenly written. All write operations will be routed to the leader.

- When a follower or read-only replica fails, ODP will route the requests to a nearby follower.


Finally, let me end this topic about read/write splitting with a user's fair comment: "If you are used to Oracle's ADG or MySQL's master/slave read/write splitting, you may find OceanBase Database's read/write splitting solution a little complicated. Strictly speaking, a read/write splitting solution needs to consider various abnormal situations. That's exactly what OceanBase Database has done. What's more, OceanBase Database simplifies the configuration procedure and makes O&M easier."


## References

[Read/Write Splitting](https://open.oceanbase.com/blog/5581452032)

[Architecture Design for AP Scenarios: Read/Write Splitting](https://open.oceanbase.com/blog/1100238)

