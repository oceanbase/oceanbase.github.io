---
slug: Yoka
title: 'Yoka Games: Migrating Business from MySQL to OceanBase Database in Only One Month'
tags:
  - User Case
---

> Editor's note: As one of the earliest tabletop game developers in the Chinese mainland, Yoka Games started testing OceanBase Database in September 2023 and spent only two months migrating three core business modules to OceanBase Database. Why does Yoka Games discard the universal MySQL solution used in the gaming industry and choose OceanBase Database? In this article, Yu Zhenjia, O&M owner at Yoka Games, shares his practical experience in database replacement.

> **About the author:** Yu Zhenjia, head of the O&M department in the support center of Hangzhou Yoka Network Technology Co., Ltd.

Architecture Features and Paint Points of the Gaming Business
-----------

As one of the earliest tabletop game developers in the Chinese mainland, Yoka Games provides both offline board games and online digital games. The core business of our company is to offer derivative games and products of "War of the Three Kingdoms". As time goes by, Yoka Games has also been exploring and developing other phenomenal games in recent years. One typical game is "Monkey King: Arena of Heroes", whose revenue exceeded CNY 200 million in one month after the game was released.

MySQL is one of the most popular database products used in the gaming industry. However, it is not a distributed database and has poor scalability, hindering the development of the industry. The database cluster architecture of Yoka Games has three features, as shown in Figure 1.

![1701411042](/img/blogs/users/Yoka/image/1701411042089.png)

<center>_Figure 1: Database cluster architecture of Yoka Games_</center>

**Feature 1: two IDCs across three regions, meeting the standards of Multi-Level Protection Scheme (MLPS) Level 3.** As illustrated in Figure 1, it is a typical conventional database architecture in primary/standby mode. Yoka Games deploys an IDC in primary/standby mode in Hangzhou, with an IDC in Shanghai for disaster recovery, and an IDC in Jiangsu for offline data backups.

**Feature 2: hybrid cloud deployment, with data stored on the local servers.** Yoka Games deploys business on the cloud, but all data is stored in IDCs. Connections are established between the IDCs and Alibaba Cloud through an enterprise leased line. This method is widely adopted by enterprises to migrate their business to the cloud. Most of them think data is private, and they must take control of it.

**Feature 3: at least one database cluster created for each project.** Yoka Games has a lot of game projects, and each of them requires at least one MySQL cluster regardless of the data volume involved. As a result, the database cluster architecture is complicated.

#### Due to the preceding architecture features, the following pain points arise accordingly:

**Pain point 1: poor usability of MySQL Master High Availability (MHA) Manager, making automatic business switchover difficult.** Here's an example. The primary MySQL cluster was down in an accident. Due to a 1–2s latency, the standby cluster failed to change to the primary one. The attribute data of game roles was written to databases in real time, and a large amount of data was concurrently written every second. Therefore, even though the primary/standby switchover had been successful, data loss still occurred.

**Pain point 2: difficulty in scale-outs and high maintenance costs.** Figure 2 shows the growth trend of average log space occupied per month by "War of the Three Kingdoms" on mobile devices since the log system was put into use in 2015. We can see from the figure that the log space of the game has been multiplied over the years. MySQL can rely on only migration or database/table sharding to increase the database capacity, resulting in higher maintenance costs. Especially when ads are placed in games, a huge amount of data needs to be processed. If we invest substantial manpower in sharding and subsequent maintenance, the ad performance will definitely be affected.

![1701411092](/img/blogs/users/Yoka/image/1701411092754.png)

<center>_Figure 2: Log space occupied by the mobile game "War of the Three Kingdoms"_</center>

**Pain point 3: uneven resource utilization.** Only a few games can be best-sellers, and the rest are average. Those mediocre games occupy excessive CPU and memory resources of servers, making the CPU and memory resources available for best-selling games insufficient.

**Pain point 4: difficulty in data migration.** Game data needs to be migrated frequently, but the mysqldump client utility provided by MySQL cannot display the migration progress or speed due to its poor performance and visualization. On this account, we have to look for substitutes.

The preceding pain points have been haunting our company for a long time. After investigations, we decided to choose OceanBase Database, a native distributed database. Next, I'll elaborate on the architecture transformation and business benefits brought by OceanBase Database.

**Architecture Transformation Brought by OceanBase Database**
--------------------

### Deployment: configure memory and disk space settings

Currently, we use OceanBase Database only for several business modules and have created a primary cluster that consists of three servers, each with 48 CPU cores, 256 GB of memory, and 80 TB of disk space. Since we spent only one month completing the test on and deployment of OceanBase Database, some issues occurred in this process.

**Issue 1: maximum memory settings for an OceanBase database**

The [maximum memory for an OceanBase database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103404) is defined by related parameters, such as [memory\_limit\_percentage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105533) and [memory\_limit](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105475). However, beginners of OceanBase Database may not modify the default settings of these parameters. Like most beginners, we retained the default value (80%) of memory\_limit\_percentage when using OceanBase Database V4.2.0 for the first time, making 20% of the OBServer memory unable to be used.

In addition, the [system\_memory](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105522) parameter needs to be set to reserve memory for the virtual SYS500 tenant. If the parameter value is not specified, the system will automatically adjust the memory usage strategy based on the current memory usage. The SYS500 tenant is a special virtual tenant. In OceanBase Database, the memory for the SYS500 tenant is the memory shared by physical tenants and the memory consumed by virtual tenants. When configuring the deployment environment for the first time, we found in OceanBase Cloud Platform (OCP) that the remaining memory allocated to user tenants was only 180 GB (approximately equal to 256 \x 80%(memory\_limit\_percentage) – 30（system\_memory)) after the servers with 256 GB of memory were put online. We finally resolved the issue by modifying the values of the corresponding parameters: memory\_limit\_percentage and system\_memory.

**Issue 2: disk space settings**

If clogs and data are stored on the same disk, OceanBase Database reserves 40% of disk space for clogs by default. Consequently, the percentage of disk space available for data files is only 60%. This percentage can be adjusted by changing the value of [datafile\_disk\_percentage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105552). After learning that, we stored data files and clogs on different disks and adjusted the percentage of disk space reserved for data files.

For beginners of OceanBase Database, the preceding two issues may be overlooked. Based on past experiences, we recommend that they follow the suggestions provided on the official OceanBase Database website when configuring the memory and disk space settings. Mainstream OceanBase Database servers are configured with 384 GB or 512 GB memory. On the official website, the suggested percentage of disk space allocated to a database is 80% for the 384 GB server memory or 90% for the 512 GB server memory. It is also recommended that enterprises store data files and clogs on different disks. In this case, the percentage of disk space available for data files will be 90% by default. For more information, refer to the [relevant document](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106069) on the official website.

The business architecture of Yoka Games has not much changed since we replaced MySQL with OceanBase Database, as shown in Figure 3. The difference is that the primary/standby nodes for disaster recovery in the MySQL environment change to three OBServer nodes, and each IDC is deployed with OceanBase Database Proxy (ODP). However, due to the limitations of OceanBase Database Community Edition, we figure out a solution to replace the ODP cluster. We use the Network Load Balancing (NLB) service provided by Alibaba Cloud to load two ODPs. By doing this, we can ensure the business availability in the production environment when any of the nodes in an IDC fails.

![1701411231](/img/blogs/users/Yoka/image/1701411231895.png)

<center>_Figure 3: Database cluster architecture of Yoka Games after business migration to OceanBase Database_</center>

Along with ODP, we also use many other OceanBase ecosystem tools, including OCP, OceanBase Migration Service (OMS), OceanBase Agent (OBAgent), and OceanBase Developer Center (ODC). Efficient and easy to operate, these tools lighten the workload of our O&M personnel and reduce the O&M costs.

### **OCP: easier O&M at a lower cost**

Firstly, the cost of learning arises inevitably each time when a new product is put into use. OCP provides users with both CLI and GUI tools, greatly shortening the learning curve of O&M engineers. These tools lower the threshold for the database administrators (DBAs) of conventional centralized databases to learn knowledge of distributed databases and make database management easier. Secondly, our company has a plentiful of game products, and each product needs to be deployed with a database cluster, which increases the O&M workload of DBAs. However, OCP slims down the management scale and allows DBAs to manage these clusters in a unified manner. What's more, OCP centralizes operations that need to be done in different systems. These operations are managing accounts, backups, resources, and disaster recovery tasks, analyzing slow logs, and monitoring databases.

### **OMS: simple, efficient, and visualized data migration**

We have tested the data migration performance of OMS and compared it with mysqldump. The test result shows that data migration with mysqldump is time-consuming and involves multiple steps such as data export, compression, transmission, and recovery. What's worse, the migration process is not visualized, and no data verification tool is provided by MySQL. Unlike mysqldump, OMS simplifies data migration and supports process-based migration and post-migration verification. As shown in Figure 4, OMS is more efficient than mysqldump in data migration and visualizes the migration progress and speed for users to check in real time. By now, we have migrated more than 20 TB of data, and a large part of these migration tasks were done by OMS. So, we're heavily dependent on OMS at this stage.

![1701411268](/img/blogs/users/Yoka/image/1701411268411.png)

<center>_Figure 4: Comparison between OMS and mysqldump in data migration_</center>

### **ODP, OBAgent, and ODC**

In addition to OCP and OMS, other OceanBase ecosystem tools also outperform their MySQL counterparts.

*   Unlike MySQL Proxy as an independent tool, ODP has been integrated into OCP and can be used together with load balancing (LB) features on the cloud to simply achieve high availability (HA).
*   OBAgent can replace MySQL Exporter to be integrated into the monitoring mid-end of Yoka Games and visualize monitoring data by working with Prometheus and Grafana.
*   More than a development and O&M tool, ODC can also substitute Navicat to provide ticket creation and review features.

On top of revenue, we hope that OceanBase Database can make optimizations in the following aspects: One is the interconnection between ecosystem tools. For example, our O&M personnel need to log in to different platforms when using OCP, OMS, and ODC. We want these tools to be integrated into the same platform that requires only one account-password pair for login. The other is the barrier among different steps that hinders notifications of ticket results. We hope that related features can be added, such as modification of table schemas, modification of stored procedure, and data archiving.

Benefits from OceanBase Database: Lower Costs and Higher Efficiency
----------------

As we've talked about, the introduction of a new technology can make O&M easier. However, an enterprise may care more about how this technology helps it increase efficiency at lower costs. In this regard, OceanBase Database not only helps Yoka Games improve resource utilization, but also reduces storage and hardware costs.

### **1. Higher utilization of storage resources**

In the beginning, we chose OceanBase Database because of its high data compression ratio for compact storage. In the test stage, OceanBase Database compressed game data to 19%–37% of its original size while maintaining the performance and CPU overhead, as shown in Figure 5.

![1701411370](/img/blogs/users/Yoka/image/1701411370429.png)

<center>_Figure 5: Storage space before and after migration from MySQL to OceanBase Database_</center>

How about the reduction in hardware costs? Currently, Yoka Games adopts a solid storage solution. The cost of this solution is about CNY 450 per TB and will increase to CNY 900 per TB after RAID 10. In this year, 20 TB of data is about to be migrated and the data storage space will be reduced to 7 TB after migration. This way, the saved cost will be (20 TB–7 TB) x CNY 900/TB x 3 = CNY 35,100. As mentioned above, the available storage space for an OceanBase cluster is about 50 GB. If the data file storage percentage is 80%, we can migrate about 125 TB of data. So, CNY 200,000 can be saved by creating such a cluster.

### **2. Higher utilization of CPU and memory resources**

First of all, let's have a look at the database performance indicators applied in the gaming industry.

In this industry, the CPU utilization of the primary cluster hardly reaches 10% in most cases, let alone a standby cluster or disaster recovery cluster. Only when a game publishes the daily quests, usually at 02:00 or 10:00, the CPU utilization reaches the peak, and the peak hours vary according to the games. Meanwhile, the O&M personnel conduct data analysis mainly between 03:00 and 04:00.

Considering the preceding features of the gaming industry, we optimize the cluster settings in OceanBase Database, such as the zone priorities for tenants and CPU resource overallocation (when appropriate), to improve resource utilization. To be specific, the configured CPU resources have exceeded the 48 CPU cores for the primary cluster. I'll give you an example. If the peak hours for both games A and B are 00:00, set the zone priorities for the tenants corresponding to the two games to ZONE1 and ZONE2, respectively. If the peak hours for game A and game C are 00:00 and 04:00, respectively, set the zone priorities for both games to ZONE1.

By doing this, our resource utilization greatly increases and exceeds 10%, as shown in Figure 6.

  

![1701411395](/img/blogs/users/Yoka/image/1701411394934.jpg)

![1701411402](/img/blogs/users/Yoka/image/1701411402873.png)

<center>_Figure 6: Resource utilization before and after OceanBase Database is used_</center>

From Figure 7, we can also see that OceanBase Database significantly improves the CPU utilization of hosts.

![1701411413](/img/blogs/users/Yoka/image/1701411413339.png)

<center>_Figure 7: Host CPU utilization comparison between MySQL and OceanBase Database_</center>

### **3. Lower server cost**

After using OceanBase Database, we discard a MySQL cluster and an ApsaraDB instance on Alibaba Cloud. Figure 8 shows the host specifications of the discarded MySQL cluster and the ApsaraDB instance on Alibaba Cloud. This indicates the cost saved.

![1701411526](/img/blogs/users/Yoka/image/1701411526196.png)

<center>_Figure 8: Cost saved after OceanBase Database is used_</center>

Our company started testing and using OceanBase Database nearly three months ago. In such a short period, we adopted a relatively aggressive strategy, but the result was remarkable. I believe that OceanBase Database will unlock its potential in more business scenarios in the future.

Exploration of OceanBase Database in Diverse Scenarios
--------------------

### **Scenario 1: optimize the performance of a large table that contains hundreds of millions of data records**

A mobile game of our company generates about 400 to 500 million data records every day. In the past, we used MySQL to store these data records in 14 tables, encompassing 164 data types and occupying 60–100 GB of storage space. But now, OceanBase Database helps us combine these tables and convert them into 14 partitions. To test the OceanBase database performance, we randomly inserted 100,000 data records in the database and selected 10,000 accounts to query data types. The test result shows that almost the same time was spent on a query in the OceanBase database and in a MySQL table. As more data records and data types are generated, the advantages of OceanBase Database partitions get increasingly obvious, which means that we no longer need to worry about the overhead brought by sharding for large tables.

### **Scenario 2: reduce the storage cost of a history database**

We want to set up a history database for cold log data with a cost-effective storage solution, that is, a large-capacity low-RPM HDD. In compliance with the industry requirements, game companies must be able to track the consumer behavior data of players in the past 12 months. However, the fact is that game companies seldom query players' behavior data in the past three months, not to mention earlier data. If such data is stored in the primary cluster, it will result in a waste of storage resources. To avoid this, we need to synchronize history cold data to a history cluster for a lower storage cost. With OceanBase Database, it is expected that the cost of a history database can be reduced by 50% to 95%. We are looking forward to verifying this prediction in real-world scenarios.

Migration Schedule and Planning
---------

The business that needs to be migrated involves three types of business modules. First, three business modules that have used OceanBase Database, which include the core product of Yoka Games — "War of the Three Kingdoms". Second, four internal IT-based business modules, including monitoring, auditing, and configuration management database (CMDB). Last, projects under testing and development, such as the instant messaging (IM) project of Yoka Games. The migration process is full of twists and turns, but we have received tremendous support. I'd like to extend my thanks to the internal project teams for their trust and willingness to accept new technologies, as well as to the OceanBase open source community for professional technical support.

By now, we have migrated all data involved in the first type of business modules, solved paint points in using MySQL databases (such as complex HA configuration and difficulties in disaster recovery and scale-outs), greatly improved the utilization of server resources, and reduced the costs of computing resources. I'm fully assured that OceanBase Database will be applied to more business modules of Yoka Games in the future. Wish the prosperity of OceanBase in the long term.