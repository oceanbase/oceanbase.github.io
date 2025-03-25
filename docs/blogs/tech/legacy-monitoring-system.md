---
slug: legacy-monitoring-system
title: 'Using OceanBase Database to Store Data of a traditional Monitoring System'
---


I work for a leading new energy company headquartered in Ningbo, specializing in the development, manufacturing, and sales of photovoltaic products.

As a company with billions in revenue, our monitoring system is one of the most critical IT management tools, playing a vital role in ensuring business continuity and risk forecasting. In 2022, we chose Zabbix as our monitoring system to track metrics for servers, operating systems, middleware, databases, and network equipment deployed around the globe. It also provides early warnings for our business systems, ensuring accurate alerting for anomalies. Additionally, it provides metrics for IT facility inspections and event sourcing, enabling IT managers to quickly access historical data for various system components.

Architecture of Our Monitoring System
--------

We chose Zabbix because it's open-source, and has a stable architecture and the capabilities to "monitor everything". It's a great fit for our company, which primarily relies on conventional architectures with minimal cloud-native infrastructure. Plus, our IT team already had experience with Zabbix, so the learning curve was low.

When I joined the company, I was tasked with continuously optimizing and improving the newly implemented Zabbix monitoring system to enhance its timeliness and accuracy. However, since the monitoring system worked with a MySQL 8.0 database, it soon ran into issues due to limitations of the MySQL architecture.

Pain Points of Our MySQL-Based Monitoring Architecture
----------------

First of all, high availability bottlenecks of different architectures we tried.

*   Master-slave architecture:

    *  Without read-write splitting, the performance was no better than a standalone system with only one node. If the master node failed, we had to shut it down for a failover and validate data consistency between master and slave nodes. I don't recommend this solution.
    * We could implement read-write splitting in two ways: modifying the DAL code (not recommended because it would hinder feature iterations), or introducing middleware like ProxySQL (which added complexity and reduced reliability).

*   Dual-master architecture:

    * We adopted a single-write approach with Keepalived to provide virtual IP addresses for easy failover.
    * A dual-write approach would require controlling row IDs to avoid primary key conflicts and data redundancy. It also required code modifications. I don't recommend this solution.

*   MySQL Group Replication (MGR)-based architecture:

    * While it offered strong consistency, it required middleware like ProxySQL for read-write splitting. In our tests, MGR was prone to an "avalanche effect," where the failure of one node could crash the entire cluster. 
    * The biggest vulnerability of a replication-based architecture is that it cannot retain the disk-consuming binlogs for long due to the high write volume of Zabbix. If replication breaks for too long, it is impossible to resynchronize master and slave nodes.

Secondly, read-write conflict. Zabbix wrote a massive amount of data, which often led to read-write conflicts (optimistic locks) if O&M and business teams perform operations such as querying monitoring data, converting historical data to trend data, and comparing alerts during peak hours. Additionally, Zabbix's housekeeper service would periodically clear expired monitoring data, which could cause pessimistic locks, drastically reducing database performance. As the data volume grew, the conflict became more pronounced.

Thirdly, capacity issues. Despite extensive optimizations to reduce the number of monitoring items and data retention period, we still needed to store a huge amount of data. After just over a year, Zabbix's database exceeded 1 TB, with the largest table holding over 700 million records. In addition to business data, binlogs of InnoDB also occupied significant storage space.

Here are my thoughts on architecture optimization based on our specific business scenarios.

Optimizing MySQL: A Temporary Fix
---------------

Among so many optimization cases, I'll talk about a typical one.

Zabbix provided monitoring templates. The Linux monitoring template alone contained over 100 monitoring items. Given our 2,000 plus production servers, we got 200,000 monitoring items. If we collected data once every 5 minutes, the database would write 2.4 million records per hour to the `history` table.

A 5-minute collection interval was just theoretical, as longer intervals would reduce data accuracy. The values of some monitoring items, like metrics for traffic, and CPU, memory, and I/O usage, were often collected once every 1 minute or so for higher accuracy. This would result in even more monitoring data.

Additionally, Zabbix would extract a full hour of data of a monitoring item from the `history` and `history_unit` tables on an hourly basis, performing calculations to get its minimum, average, and maximum values, and then insert them into the `trends` and `trends_unit` tables.

![1727347610](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-09/1727347612203.png)

This process involved large result sets, heavy calculation workload, and significant caching, often leading to issues like rapid creation of temporary tables, excessive disk I/O load, high swap usage, and large transactions.

As the pessimistic locks mentioned earlier would cause historical data cleanup tasks to fail, more and more data would be built up. Table locks also made it impossible to use the dump method for backups, forcing the use of physical backups. However, since the `DELETE` statement was used to clear historical data, it left fragmented space in primary business tables, requiring defragmentation before creating backups, which was quite cumbersome.

Highly frequent `INSERT` and `DELETE` operations also generated massive amounts of binlogs, taking up large storage space. Reducing the binlog retention period would cause fast synchronization point override. If the master node and a slave node were disconnected, you might need to restore the slave node from scratch.

To address these issues, we optimized the following tables.

| Table name  | Description                      | Data type             |
|-------------|----------------------------------|-----------------------|
| history     | Stores the raw historical data.  | Floating-point numbers|
| history_uint| Stores the raw historical data.  | Unsigned numbers      |
| history_str | Stores the raw short strings.    | Characters            |
| history_text| Stores the raw long strings.     | Text                  |
| history_log | Stores the raw log strings.      | Logs                  |
| trends      | Stores the hourly statistics.    | Floating-point numbers|
| trends_uint | Stores the hourly statistics.    | Unsigned numbers      |
| auditlog    | Stores the audit logs.           | Logs                  |

Zabbix stores historical data in tables with a name starting with `history`, and trend data in those with a name starting with `trends`.

*   History tables store different types of raw data of all monitoring items collected from clients, and have similar schemas. If the data of a monitoring item is collected once a minute, 86,400 records are generated for this monitoring item on a daily basis.

*   The `history` table stores numeric data in the following columns: `itemid` of the BIGINT(20) type, `clock` of the INT(11) type, `value` of the BIGINT(20) type, and `ns` of the INT(11) type. Each record consumes approximately 24 bytes (8 ＋ 4 ＋ 8 ＋ 4), resulting in about 2 MB of data per day.
*   The `history_str` and `history_text` tables store string and text data in the `value` column of the VARCHAR(255) type in utf8mb4_bin and `value` column of the TEXT type in utf8mb4_bin, respectively. A VARCHAR(255) column in utf8mb4 can store up to 1,020 bytes, while a TEXT column can store up to 65,535 bytes. If, in extreme cases, the data of a text- or string-type item is collected once a minute, approximately 85 MB or 5 GB of data can be generated each day.
*   The size of historical data depends on factors like the number of monitoring items, retention periods, data types, and collection intervals.

*   Trends tables store aggregated hourly data, including the minimum, average, and maximum values for each monitoring item. Essentially, trends tables are compressed versions of history tables, reducing resource demands.

*   Trends tables only use the data of numeric history tables. The `history_str`, `history_log`, and `history_text` tables do not have corresponding trends tables.
*   The data of trends tables are converted from history tables by Zabbix's housekeeper service, which is similar to a scheduled task. The conversion process inevitably compromises the database performance.

Starting with Indexes
-----

The `history` table stores the supra-second part of the timestamp of a monitoring item in the `clock` column (in seconds), and the sub-second part in the `ns` column (in nanoseconds).

The sub-second part is usually not a concern. Zabbix often uses both columns in its internal statistical queries. However, the `ns` column is not indexed, leading to full table scans. To address this issue, we optimized the `history` table like this:

    CREATE TABLE `history_old` (
      `itemid` bigint(20) unsigned NOT NULL,
      `clock` int(11) NOT NULL DEFAULT '0',
      `value` double NOT NULL DEFAULT '0',
      `ns` int(11) NOT NULL DEFAULT '0',
      KEY `history_1` (`itemid`, `clock`) BLOCK_SIZE 16384 LOCAL
    ) DEFAULT CHARSET = utf8mb4
    
    CREATE TABLE `history` (
      `itemid` bigint(20) unsigned NOT NULL,
      `clock` int(11) NOT NULL DEFAULT '0',
      `value` double NOT NULL DEFAULT '0',
      `ns` int(11) NOT NULL DEFAULT '0',
      PRIMARY KEY (`itemid`, `clock`, `ns`)
    ) DEFAULT CHARSET = utf8mb4 
    

> Other history tables were optimized similarly.

Table partitioning
---

We partitioned history and trends tables, creating and dropping partitions periodically. This approach posed some challenges:

First, given the huge table size, directly operating on tables would be risky and inefficient. So, we would create a table and insert data from the source table using the `insert  /*+ ENABLE_PARALLEL_DML PARALLEL(2) */ … select …` statement, which was made possible by the [parallel DML](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001973796) feature of OceanBase Database. While this worked for smaller tables, it failed for larger, busier tables.

Second, using the dump method for backups required significant downtime.

Third, when using DataX for data synchronization, it was difficult to determine the last synchronization point if the process was interrupted, making it hard to resume synchronization.

MySQL Parameter Optimization
---------

The most frequent operations in Zabbix were writing new data to the database, converting history data to trends, deleting expired data, and querying monitoring data or generating reports (using Grafana). These operations—especially queries involving sorting, aggregation, and calculations, as well as large INSERT and DELETE transactions—put immense pressure on MySQL, prolonging the processing time. The simplest way to speed up processing was to adjust the following MySQL parameters to keep as much data in memory as possible: `innodb_buffer_pool_size`, `query_cache_size`, `tmp_table_size`, `innodb_log_buffer_size`, `sort_buffer_size`, `read_buffer_size`, `join_buffer_size`, and `binlog_cache_size`.

However, we just couldn't endlessly add more memory once it hits the physical limits, and large transactions would excessively consume disk I/O resources when, for example, dirty pages were flushed to a disk. Besides, scaling up hardware would involve downtime, causing additional costs.

My point is, performance bottlenecks are inevitable as long as we keep using those MySQL and OS optimization and scaling methods. We need something new.

Seeking a New Solution
------

We needed a new data storage solution that could not only address our architectural bottlenecks and business pain points, but meet three requirements:

1\.     The solution must support the syntax, functions, expressions, data types, table partitioning methods, character sets, and collations of MySQL.

2\.     It provides hybrid transaction and analytical processing (HTAP) capabilities, and has a data engine that efficiently handles both transaction processing (TP) and analytical processing (AP) workloads in a relational architecture.

3\.     It provides high availability and multi-active capabilities without relying on additional technologies.

Zabbix Server supports both **MySQL** and **PostgreSQL**. However, on the one hand, our team lacked expertise in **PostgreSQL**, and on the other hand, we had already developed numerous applications and reports based on MySQL databases. Switching the database system to **PostgreSQL** would require redevelopment. Therefore, we gave up **PostgreSQL** and narrowed our selection down to MySQL-compatible databases.

I mentioned earlier that we also deployed the InnoDB engine. So, we considered TokuDB, an optimized version of InnoDB.

We were also interested in emerging databases like **TiDB, Huawei GaussDB, openGauss, OceanBase Database, and Dameng Database**.

*   **TiDB** was ruled out due to its lack of support for MySQL stored procedures and foreign keys.
*   **openGauss**, based on **PostgreSQL**, was a secondary option.
*   **Huawei GaussDB** required paid licenses.
*   **Dameng Database** also required paid licenses.

OceanBase Database passed our first screening for its MySQL compatibility, distributed architecture, and open-source.

Based on compatibility considerations, **TokuDB** and **OceanBase Database** were shortlisted for our new solution.

| Comparison item               | TokuDB       | OceanBase Database |
|-----------------------------  |--------------|--------------------|
|Deployment                     | Easy         | Easy               |
|Disaster recovery architecture | Master-slave | Distributed        |
| Data compression ratio        | Medium       | High               |
| Support for domestic products | No           | Yes                |
|Performance                    |Data write performance was optimized, lacking evidence for data read performance. | To be tested |

The data read performance of TokuDB didn't meet our expectations. OceanBase Database, on the other hand, stood out with its support for HTAP, multi-active high availability, and a vibrant community with plenty of resources to help us get started. So, we decided on OceanBase Database.

Deploying OceanBase Database
-----------

Following the official documentation, we began the deployment process. Along the way, we encountered a few minor hiccups, which were resolved with the help of the official documentation and some advice from the community. I'll share the details in a future post for your reference.

Overall, the migration from MySQL to OceanBase Database was surprisingly smooth. Since we deployed OceanBase Database Community Edition, we couldn't leverage the OceanBase Migration Assessment (OMA) tool to evaluate the migration process beforehand. Instead, we relied on experience and some helpful tips from the community. We performed the following checks before the migration:

*   Character set check. OceanBase Database doesn't support all MySQL character sets or collations, so a pre-migration evaluation is crucial.
*   OceanBase Database doesn't have an event scheduler. If your original database uses events, you'll need to find alternative solutions (more on this later).
*   Unlike some other MySQL-compatible databases, OceanBase Database is case-insensitive by default. Make sure to check the `lower_case_table_names` setting in your original database.
*   If you plan to enable reverse synchronization, ensure that the necessary accounts are created and authorized in the original database, and that the `omstxndb` database is ready.
*   If your database has foreign key constraints, remember to disable them before migration using the **SET FOREIGN_KEY_CHECKS=0;** statement.

![1727348341](/img/blogs/tech/legacy-monitoring-system/image/1727348343480.png)

For more details on these steps, refer to the [official documentation](https://en.oceanbase.com/docs/community-oms-en-10000000001836496). One particular challenge we faced was with Zabbix's history and trends tables, which should be partitioned. Partitions should be managed by scheduled tasks; otherwise the workload would be overwhelming for administrators. In MySQL, we automated this using events and stored procedures. However, as I said earlier, OceanBase Database doesn't support events. Would it be a dead end? No, God has opened a window, and handed in OceanBase Developer Center (ODC), an open-source, enterprise-grade database collaboration platform. ODC's partitioning plan module served as a more advanced alternative to the combination of events and stored procedures in MySQL. I've posted [an article on this](https://open.oceanbase.com/blog/12521093139) if you're interested in the details.

A New Chapter with OceanBase Database
-----

Six months into running OceanBase Database with Zabbix, we've achieved the same performance with significantly fewer hardware resources, compared to our previous MySQL-based architecture.

![1727348390](/img/blogs/tech/legacy-monitoring-system/image/1727348392419.png)

Our developers and system administrators were not against the migration given the fact that OceanBase Database is MySQL-compatible. The high reliability and HTAP capabilities of OceanBase Database also made it easier to communicate the migration plan with the operations team. After the migration, the performance improvements and an 80% reduction in storage space left the business team thoroughly impressed.

The performance boost is immediately noticeable. Queries that used to take at least 4 seconds to render historical data (spanning weeks or months) now load almost instantly. Additionally, the frequency of performance alerts from Zabbix has dropped significantly since the migration.

In short, OceanBase Database has met our expectations, and we're continually exploring its new features. Here's a quick summary of how OceanBase Database aligns with our business needs:

*   Parallel processing: For operations involving a large amount of data, we can enable parallel processing to significantly boost efficiency.
*   Hot scaling: Thanks to OceanBase Cloud Platform (OCP), we can scale CPU, memory, and other database resources, and modify zones and parameters while the database is running, which minimizes the downtime.
*   High compression ratio: When importing data to our Zabbix database, we noticed that the size was compressed from 1.2 TB in MySQL to just 260 GB in OceanBase Database—an 80% reduction in storage space.
*   Inherent scalability and distributed capabilities: OceanBase supports both horizontal scaling by adding zones and vertical scaling by increasing resource specifications, with data synchronization handled automatically in the backend. This provides robust data redundancy. We tested an MGR-based architecture, which, while ensuring consistency, was a nightmare to maintain. Any node failure risked bringing down the entire cluster.
*   Slow query isolation: Slow queries are placed in a separate queue, so that they don't interfere with smaller, faster queries or cause congestion.

OceanBase Database provides a suite of tools that has made database management more automated and convenient.

OCP has been a lifesaver, offering a range of practical features:

*   Cloud-native and multitenancy: OCP allows unified management of databases, simplifying their creation and O&M. The multitenancy feature ensures resource isolation between tenants.
*   SQL diagnostics: Integrated SQL diagnostics make it easy to monitor top, slow, and parallel SQL statements. We can quickly diagnose and optimize SQL execution on a GUI-based interface.

![1727348486](/img/blogs/tech/legacy-monitoring-system/image/1727348487990.png)

*   Backup: OCP natively supports physical and log backups.

![1727348516](/img/blogs/tech/legacy-monitoring-system/image/1727348518029.png)

OceanBase Migration Service (OMS) Community Edition supports real-time data migration between OceanBase Database Community Edition and different types of data sources like MySQL, PostgreSQL, TiDB, Kafka, and RocketMQ. It also supports data migration between MySQL tenants of OceanBase Database Community Edition. Key features of OMS are as follows:

*   Streamlines the migration process with automatic operations.
*   Supports schema synchronization, data synchronization, incremental synchronization, and reverse synchronization in one task, reducing the workload of O&M engineers.
*   Allows synchronization of specific tables and table data based on rules.

ODC is packed with handy features. For example:

*   Provides an integrated SQL development environment, which supports SQL auditing and double confirmation for high-risk operations.
*   Supports workflows and allows data source access authorization, enhancing collaboration efficiency.
*   Supports integration with Active Directory of your enterprise for secure account management. ODC also doubles as a database access management platform, much like a bastion host. The best part? It's free!
*   Works with OceanBase Database in MySQL mode, MySQL databases, and Oracle databases, making it a great cost-effective tool for database development.
*   Supports scheduled tasks:
    * SQL scheduling: Executes SQL statements as scheduled, similar to MySQL event scheduler.
    * Partitioning plans: Supports partition creation and dropping. For more information, see [this article](https://open.oceanbase.com/blog/12521093139).
    * Data archiving: Migrates historical data from one table or database to another based on predefined rules.
    * Data cleanup: Schedules data cleanup tasks based on specific rules.
*   Tracks the status of all tasks, facilitating O&M.
*   Provides all these features out of the box, saving time and effort.

Looking Ahead
----

Given features of OceanBase Database and our business scenarios, we're planning to migrate more systems to OceanBase Database. Currently, we're working on migrating our production device data collection system and reporting system.

Similar to Zabbix, this data collection system has the following characteristics:

*   Large data amount. Production device data is collected once a few seconds, leading to high concurrency and a tremendous data size.
*   Time series of data. We designed some wide tables with time series columns, requiring complex queries to transform them into long tables. We've used window functions to compare collected results within the time series. In OceanBase Database of a later version, we can do that by making use of the columnar storage.
*   Regular archiving and cleanup. This can be handled using the data archiving and cleanup features of ODC. You can enable parallel execution of cleanup tasks to speed things up.
*   Table partitioning. Large tables are partitioned for easier management.

The reporting system has the following characteristics:

*   It requires HTAP capabilities. OceanBase Database puts slow queries in a separate queue, minimizing the impact of large transactions and queries on the execution of smaller, faster ones.

While OceanBase Database has been a game-changer for us, it's not flawless. Execution plans can be difficult to read and sometimes get performance jitters or deteriorate, leading to unstable SQL execution. System logs can be hard to understand. Additionally, the support for Chinese language can be better. In our obdumper test, the backup of tables with names in Chinese failed. The community is working on a fix, and we temporarily resolved it by rolling the database back to an older version.

Summary
--

OceanBase Database is a powerful database platform. From trial to production, we've encountered both challenges and surprises. When issues arise, we will first try to figure out a solution on our own based on the documentation. If that doesn't work, we can always reach out to the OceanBase community, which has been incredibly responsive, offering timely and accurate support—much better than other open-source communities.

As OceanBase Database continues to evolve, we're excited to explore new features like columnar storage and materialized views in V4.3. The journey may be long, but with OceanBase, we'll eventually reach our destination.