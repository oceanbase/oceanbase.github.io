---
slug: Hybrid-Storage-Deploy
title: 'Breaking Resource Limits: OceanBase Database Hybrid Storage Deployment and Real-world Applications'
tags:
  - User Case
---

# Breaking Resource Limits: OceanBase Database Hybrid Storage Deployment and Real-world Applications

In most production environments, OceanBase clusters are typically deployed on SSD storage. The high compression ratio of OceanBase Database significantly reduces disk storage requirements. However, in scenarios involving massive historical archives, companies still face challenges such as insufficient storage and waste of computing resources. This article explores the feasibility of a hybrid storage configuration, where transaction logs (or clogs) are stored on SSDs and business data is stored on HDDs. Through an exhaustive verification process, we evaluate the performance degradation and stability of the hybrid configuration compared to an all-flash configuration across different specifications and scenarios. By incorporating real-world use cases in production environments, this article serves as a reference for deploying OceanBase Database in scenarios involving massive data. While ensuring business stability and performance, the hybrid configuration can significantly reduce hardware resource usage, address shortages in flash resources, and make better use of existing resources.

  

**Background**
------

The storage engine of OceanBase Database, built on the log-structured merge-tree (LSM-tree) structure, stores static baseline data on disks and dynamic incremental data in memory. When the incremental data in memory reaches the specified threshold, it is flushed to disks (a process called "minor compaction"). During off-peak hours at night, the system automatically merges incremental baseline data with existing baseline data (a process called "major compaction"). Handling incremental data in this quasi-memory approach greatly enhances the performance of INSERT, UPDATE, and DELETE operations. In addition, OceanBase Database applies aggressive compression algorithms on the baseline data, which is read-only. This ensures a high compression ratio without affecting the query performance. To ensure data persistence, redo logs are written to disks and synchronized to follower replicas while incremental data is written to memory. A transaction is considered successful only when the majority of replicas have successfully persisted the redo logs. Both minor and major compactions involve intensive disk I/O operations. To maintain high database performance, OceanBase officially recommends deploying clusters on SSD storage.

From our perspective, SSDs are primarily used to boost performance. However, since some applications have lower performance requirements, we also deployed some clusters on HDDs. Over time, we encountered issues such as clog desynchronization, cluster instability, and even cluster failures. As a result, we promptly replaced these HDDs with SSDs. Nevertheless, we continued exploring the feasibility of deploying OceanBase clusters on HDDs. After reading the article [Can We Have Both Cost-effectiveness and Performance for History Databases?](https://open.oceanbase.com/blog/12198675456) posted by the OceanBase official team, we learned that deploying OceanBase clusters on HDDs is indeed feasible. We reached out to the author for specific use cases and deployment methods. We learned that using SSDs for transaction logs (which require high real-time performance) and HDDs for business data is a viable approach. As a result, we proceeded to verify the hybrid storage configuration. Here are the details.

**Note**

In this verification, the performance of all-flash and hybrid configurations is compared.

```
All-flash configuration: All disks are SSDs.

Hybrid configuration: Transaction logs are stored on NVMe SSDs, while business data on HDDs.

Database version: OceanBase Database V4.2.1.1

Resources:

All-flash configuration:

Kirin ARM servers × 3, each equipped with ARM-based Kirin CPUs (32 cores × 2), 512 GB memory, and 960 GB SATA SSD × 12

Hybrid configuration:

Kirin ARM servers × 3, each equipped with ARM-based Kirin CPUs (32 cores × 2), 512 GB memory, 1.8 TB NVMe SSD × 2, and 8 TB SATA HDD × 12
```

### **Scenario 1: batch writes**

| | All-flash | Hybrid |
| ---------- | ----------- | ----------- |
| 8C16GB | 54903 | 38622 |
| 16C32GB | 85870 | 61772 |
| 32C64GB | 178158 | 121918 |
| 64C128GB | 221443 | 164340 |

![1732082836](/img/blogs/users/Hybrid-Storage-Deploy/image/7c6096f8-9432-4cbe-9882-9abd79648977.png)

Conclusion: In the batch write scenario, performance increases linearly with specifications. However, after reaching the specification of 32 CPU cores and 64 GB of memory (32C64GB), performance improvement slows. The hybrid configuration shows a 29% performance drop compared to the all-flash configuration.

### **Scenario 2: regular writes**

| | All-flash | Hybrid |
| ---------- | ----------- | ----------- |
| 8C16GB | 24490 | 20513 |
| 16C32GB | 48079 | 40768 |
| 32C64GB | 87440 | 56511 |
| 64C128GB | 91702 | 56352 |

![1732082862](/img/blogs/users/Hybrid-Storage-Deploy/image/3692d7da-604c-4961-9a6d-4b1f80798e7a.png)

Conclusion: In the regular write scenario, performance increases linearly with specifications. However, after reaching the 32C64GB specification, performance improvement slows. The hybrid configuration shows a 26% performance drop compared to the all-flash configuration.

### **Scenario 3: regular read-only**

| | All-flash | Hybrid |
| ---------- | ----------- | ----------- |
| 8C16GB | 57283 | 53010 |
| 16C32GB | 106498 | 96702 |
| 32C64GB | 173308 | 166397 |
| 64C128GB | 198595 | 188010 |

![1732082878](/img/blogs/users/Hybrid-Storage-Deploy/image/0f461c7e-0c8a-46d1-82f6-e82d31df8aa6.png)

Conclusion: In the regular read-only scenario, performance increases linearly with specifications. However, after reaching the 32C64GB specification, performance improvement slows. The hybrid configuration shows a 6% performance drop compared to the all-flash configuration.

### **Scenario 4: regular reads/writes**

| | All-flash (reads) | All-flash (writes) | Hybrid (reads) | Hybrid (writes) |
| ---------- | ----------- | ----------- | ----------- | ----------- |
| 8C16GB | 36029 | 1801 | 34102 | 1705 |
| 16C32GB | 69911 | 3495 | 61301 | 3065 |
| 32C64GB | 131861 | 6593 | 111449 | 5572 |
| 64C128GB | 148802 | 7440 | 125255 | 6262 |


![1732082891](/img/blogs/users/Hybrid-Storage-Deploy/image/156ae12a-7fd7-4439-bde1-c7520bdbe92a.png)

Conclusion: In the regular read/write scenario, performance increases linearly with specifications. However, after reaching the 32C64GB specification, performance improvement slows. The hybrid configuration shows a 12% performance drop compared to the all-flash configuration.

### **Scenario 5: TPC-C benchmark on TP performance**

| | All-flash | Hybrid |
| ---------- | ----------- | ----------- |
| 8C16GB | 35127 | 28042 |
| 16C32GB | 82656 | 67327 |
| 32C64GB | 137854 | 118766 |
| 64C128GB | 158995 | 157774 |

![1732082904](/img/blogs/users/Hybrid-Storage-Deploy/image/298265e0-0b5f-4bbe-9741-3cf39bc8129c.png)

Conclusion: In the scenario of running the TPC-C benchmark on transaction processing (TP) performance, the hybrid configuration shows a 14% performance drop compared to the all-flash configuration.

### **Scenario 6: stability testing**

We used sysbench to perform stress testing with a concurrency level of 300. The database ran stably for 72 hours in a regular read/write scenario.

**Conclusions**

The test results indicate that the hybrid configuration shows a 28% performance drop in the data write scenario, a 6% drop in the data read scenario, and an overall 13% drop in the read/write scenario compared to the all-flash configuration.

In terms of stability, the database of either configuration ran stably for 72 hours under the high-concurrency read/write stress of the sysbench test. However, we could not fully simulate the complex real-world production environments in the tests. In such environments, exceptions are more likely to occur during the minor or major compaction process, thus affecting cluster stability.

In the hybrid configuration, high-performance NVMe SSDs or regular SSDs are used to store transaction logs (which require real-time dump), and HDDs are used to store large amounts of business data. This type of configuration is suitable for scenarios with low performance requirements, relatively simple business logic, and massive data, such as history databases, log databases, and backup databases.

The test results greatly encouraged us, as we have many history and log databases with massive data volumes. In addition, our online business workload is relatively low, and thus we have moderate requirements for data write performance and computing resources. For example, in one log database scenario, the daily log volume reaches nearly 2 billion records, with incremental data totaling around 4 TB (considering multiple replicas). Storing one month of data would require 30 all-flash servers. However, by switching to the hybrid configuration, we need only 3 servers to do the job, saving 27 servers, which translates to nearly CNY 3 million in hardware costs. Additionally, this solution allows us to utilize existing HDD-based servers, preventing significant resource waste.

**Summary**
------

The results of our rigorous testing and verification indicate that, compared to the all-flash configuration, the hybrid configuration experiences a performance drop of around 20% but maintains stable and continuous operation on OceanBase Database V4.x. Hybrid configurations are particularly suitable for scenarios with moderate performance requirements, simple business logic, and large data volumes, such as history databases, log databases, and backup databases. Real-world use cases in production environments have verified their feasibility.

Given that HDDs typically offer an order of magnitude more storage capacity than SSDs, hybrid configurations can reduce hardware costs by approximately 90% in these specific scenarios. This not only slashes the hardware budget but also improves resource utilization. In a telecom operator’s log database, for example, telecom services involve a large and diverse user base. In addition to its core business operation support system (BOSS), the operator also manages mobile and online service platforms, subsystems, and agents. Log analysis provides valuable decision-making support for business operations. Hybrid configurations reduce hardware costs while allowing longer data retention periods, offering more accurate data for decision-making.

Moreover, the feasibility of hybrid configurations proves that all-flash configurations are not the only option for OceanBase Database deployment. In the current era of rapid IT innovation and accelerated domestic technology adoption, IT device refresh cycles have shortened significantly. Many decommissioned devices, despite being replaced, are far from reaching their 6- to 8-year lifespan and still have functional high-capacity HDDs. Deploying OceanBase Database with hybrid configurations will substantially sustain the value of these legacy devices. For large companies with diverse hardware inventories, hybrid configurations expand the applicability of OceanBase Database and provide flexible, cost-effective, and efficient solutions for various business needs.