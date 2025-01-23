---
title: Introduction
weight: 1
---

> Keywords: automatic lifecycle management | cost effectiveness | super large capacity
>
> The intelligent history database migration platform of OceanBase Database helps users quickly archive cold data in a secure manner and allows them to configure related settings only once for automatic lifecycle management. OceanBase Database implements a distributed storage engine featuring a high compression ratio. Thanks to the adaptive compression technologies, this LSM-tree-based storage engine balances the system performance and compression ratio in a creative manner, which is impossible in a conventional database that stores data in fixed-size blocks.

## Historical Data Archiving

In business scenarios such as order processing, transaction processing, and logging, the total amount of data will continue to increase. Access to such data is often highly correlated with time. Usually, data that is closer to the current time is "hotter", which means that the data may be frequently modified and used for point queries. Hot data is usually accessed by transactional loads and real-time analytical loads, and accounts for a relatively low proportion of all data in the system.

Data that has existed in the system for a period of time is called "cold data", which is queried less frequently and rarely modified. In a stable IT system, cold data is a main part of the entire data volume and usually accessed by a small amount of transactional loads as well as some analytical loads such as report statistics.

Due to the obvious difference between hot data and cold data, it will apparently waste system resources to equally treat the two types of data in the same environment and allow them to share one set of resource specifications. In addition, the capacity limit of a single database system may also restrict the storage of data. However, if you periodically archive cold data to more cost-effective storage media and restore data from the history database when accessing it, the data query performance will be compromised at higher system complexity.

Therefore, more and more systems adopt a dual-database solution to separately store online data and historical data. This solution regularly synchronizes online data to the history database and deploys the history database in an environment with lower storage and computing costs, which reduces the overall costs and meets business needs.

## Current Status and Challenges of the Industry

- Rapid data growth: Online data, especially order and transaction data generated in scenarios such as new retail and payment, is growing fast in volume, and most of the data will barely be accessed or updated again some time after it is written to the disk.

- Low efficiency with high costs: Cold data takes up space of solid storage intended for the databases of online businesses, resulting in a serious waste of hardware resources and high IT costs for enterprises. The clumsiness of online databases drags down the query efficiency and hinders data changes and system scaling.

- High risks delivered by conventional solutions: In most conventional solutions, developers or database administrators archive data by using scripts or simple synchronization tools. The concurrency and efficiency of the archiving tasks are hard to control. It is easy to affect online databases, and even cause accidental deletion of production data.

- Complex O&M management: The applicable archiving interval and restrictions vary with databases or even tables of different business modules. It takes a lot of time and effort to maintain the execution logic of a large number of scheduled tasks.

## Solution

- The history database platform of OceanBase Database can be built with average hardware. It allows you to configure archiving tasks on graphical pages and supports automatic archiving interval management. You can set automatic canary execution of data migration, verification, and deletion tasks with a few clicks. The platform provides features such as Out-of-Memory (OOM) prevention, intelligent throttling, and multi-granularity traffic management to ensure stability, achieving intelligent O&M of data archiving tasks in the real sense.

- This solution has been verified in the core business scenarios of Ant Group. A single transaction payment history database stores more than 6 PB of data using hundreds of cost-effective large-capacity mechanical disks, with the disk usage automatically balanced. These disks have been running smoothly for years, saving huge in machine resource investment.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/01_introduction/001.png)

## Solution Advantages

- Visual management: You can create and run a task, check the task progress, suspend and resume a task, and perform other basic operations by using a GUI provided by OceanBase Database.

- Intelligent O&M: OceanBase Database uses the token bucket algorithm for throttling, and provides features such as resumable data transmission and automatic task scheduling. In addition, it is capable of self-healing. For example, it automatically replaces failed nodes, scales resources, and prevents OOM issues. O&M tasks are executed without requiring human intervention.

- Low costs: OceanBase Database is friendly to large-capacity SATA disks and compresses data at a high compression ratio for compact storage. A single node can store up to 400 TB of data, equivalent to the storage capacity of an entire conventional database.

- Large storage capacity: OceanBase Database allows you to streamline your online business system and reduce the costs of data archiving. A history database cluster of OceanBase Database can serve as a large-capacity relational database to stably support tasks, such as data monitoring, logging, auditing, and verification tasks. These tasks generate a large amount of data that is barely accessed again.


## Cases

### Ctrip

#### Business challenges

- As the volume of orders increases, business data grows rapidly, and the storage bottlenecks and performance issues of conventional databases become increasingly apparent.

- The increasing number of database shards not only made O&M more costly and complex but also resulted in endless application adaptation.

#### Solution

- Compared with a conventional centralized MySQL database, OceanBase Database compresses data in the storage at an ultra-high data compression ratio, which greatly reduces the hardware costs of enterprises.

- OceanBase Database supports flexible resource scaling. Its capacity can be linearly scaled in response to the actual business development to support the storage and computing of massive amounts of data. This allows you to get ready for future business growth.

- In addition, OceanBase Database is compatible with MySQL protocols and syntax, so that legacy data can be smoothly migrated to significantly reduce the costs of business migration and transformation. OceanBase Migration Service (OMS) ensures strong data consistency during data migration through full migration, incremental migration, and reverse migration, and supports the synchronization of data to message queue products such as Kafka.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_02_archive_database/01_introduction/002.png)


#### Customer benefits

- More efficient O&M: Dozens of MySQL database shards are aggregated into one OceanBase cluster, making management easier with greatly reduced O&M costs. An OceanBase cluster with ultrahigh throughput can be built based on regular PC servers. The cluster does not require database or table sharding and can be quickly scaled out as needed.

- Low costs: OceanBase Database stores hundreds of terabytes of data with guaranteed performance and stability. Compared with the previous solution, the storage cost of the OceanBase solution is slashed by 85%.

- Higher synchronization performance: Data migration is transparent to business. OMS provides full migration and incremental synchronization to support all-in-one data migration of mainstream databases. The latency from data writing in the upstream business modules to the response of the downstream OceanBase cluster is reduced, accelerating data synchronization and reducing the synchronization latency time by 75%.

- High data write performance: Efficient multi-node write is implemented thanks to the Shared-nothing architecture, partition-level leader distribution, and parallel DML provided by the parallel execution framework. With this feature, the data write performance is significantly improved to accommodate highly concurrent data write requirements of the archive database of Ctrip.

#### Videos
[Cost reduction for the history database of Ctrip](https://www.oceanbase.com/video/9001003)


### Other cases

+ Alipay: [https://open.oceanbase.com/blog/5377309696](https://open.oceanbase.com/blog/5377309696)
    - Industry: Internet
    - Pain points: A MySQL database with a sharding architecture was used as the history database, which was poor in horizontal scalability and had many limitations on queries and transactions.
    - Benefits: After the history database is migrated from MySQL to OceanBase Database, the disk cost per unit space is reduced to 30% of that of an online server and the overall costs are reduced by about 80%. The storage costs of some business modules are even reduced by 90%.
+ BOSS Zhipin: [https://open.oceanbase.com/blog/8983073840](https://open.oceanbase.com/blog/8983073840)
    - Industry: Internet
    - Pain points: A MySQL database with a sharding architecture was used as the history database, which was poor in horizontal scalability and had many limitations on queries and transactions.
    - Benefits: OceanBase Database is a native distributed system with high scalability. It provides high availability with a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of less than 8s when a minority of replicas fail, making the database more stable. In addition, more than 70% of the storage resources are saved.
+ ENERGY MONSTER: [https://open.oceanbase.com/blog/7057790512](https://open.oceanbase.com/blog/7057790512)
    - Industry: intelligent manufacturing
    - Pain points: The business system architecture becomes increasingly complex as the business volume rapidly grows. A MySQL database with a sharding architecture was used as the history database, which was poor in horizontal scalability and had many limitations on queries and transactions.
    - Benefits: OceanBase Database supports both vertical and horizontal scaling in a quick, transparent, and convenient manner. The storage costs are reduced by 71%.
+ Tsinghua Tongfang: [https://open.oceanbase.com/blog/10581685536](https://open.oceanbase.com/blog/10581685536)
    - Industry: energy science and technology
    - Pain points: A MySQL database with a sharding architecture was used as the history database, which was poor in horizontal scalability and had many limitations on queries and transactions.
    - Benefits: The storage costs are reduced by 75%.
+ Yoka Games: [https://open.oceanbase.com/blog/7746416928](https://open.oceanbase.com/blog/7746416928)
    - Industry: gaming
    - Pain points: The resource utilization of different business modules varied greatly in the original MySQL database. The resource utilization of non-blockbuster games is low.
    - Benefits: The hardware costs are reduced by 80% based on resource isolation between tenants and a high compression ratio. Hundreds of thousands of CNY are saved for each business cluster, significantly reducing the hardware costs.
+ Zuoyebang: [https://open.oceanbase.com/blog/8811965232](https://open.oceanbase.com/blog/8811965232)
    - Industry: education
    - Pain points: The storage costs of a MySQL database were high.
    Benefits: The storage costs are reduced by more than 60%, the real-time analysis performance is improved by more than four times, and the hardware costs are reduced by 77.8%.