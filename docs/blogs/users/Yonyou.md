---
slug: Yonyou
title: 'Yonyou Replaces MySQL with OceanBase Database to Reduce O&M Costs and Achieve High Availability'
tags:
  - User Case
---

Introduction: As Yonyou Network Technology (Yonyou) grows, it uses XXL-JOB as the task scheduling platform and Nacos as the configuration management center to standardize and automate IT O&M. However, the underlying MySQL system seemed to be increasingly overburdened in coping with more and more clusters built for XXL-JOB and Nacos. To relieve its O&M workload, the company started looking for a database that can manage all its clusters with high availability in a unified way. In this article, Yonyou's database administrators shared their story of database selection.

  

  

Business Challenges
------

Facing the growing team and IT system, we had to invest more efforts into routine O&M and use automation tools for help. We deployed a scheduling platform and a configuration management center to implement standardized and automated IT O&M.

  

Our task scheduling platform relies largely on the distributed XXL-JOB framework, which is lightweight and scalable, and allows fast development with a short learning curve.

  

We also introduced Nacos as both a registration center and configuration management center. With Nacos, we can perform service discovery and registration, and also standardize configuration and unify configuration formats. Configuration changes take effect in real time without restarting the server, and are synchronized to programs for quick response. We can adjust the business in real time or quasi-real time simply by dynamically modifying parameters in the configuration management center. In addition, its audit feature makes it possible to track system issues.

  

However, the increasing number of XXL-JOB and Nacos clusters brought about other challenges. On one hand, we spent time and efforts managing these clusters. On the other hand, they were supported on standalone MySQL databases, which required us to create additional MySQL instances that lacked high availability. When an instance failed, the entire scheduling platform or configuration management center became unavailable. Of course, we could simply create highly available MySQL clusters, but the daunting management and hardware costs were far too high. So we started looking for a database that provides high availability and supports unified cluster management to reduce the workload at affordable O&M costs.

  

  

Database Selection and Results
---------

  

After studying various databases on the market, we shortlisted two distributed databases. Both provide high availability natively and automatically switch business from faulty nodes to healthy ones, and we could deploy them without business modification.

  

We eventually chose OceanBase Database for our scheduling platform and configuration management center, largely because it supports multitenancy. This feature allows us to host databases of multiple platforms in one OceanBase cluster. This greatly reduces the workload of operating and maintaining multiple databases, and allows us to quickly scale out a tenant by flexibly configuring its resources when platform traffic surges.

  

By reading the official documentation of OceanBase Database, browsing its online community Q&A pages, talking with its engineers, and testing it, we found that OceanBase Database also provides four key capabilities.

1.  **High scalability**. The performance of our MySQL database degraded as the data volume increased, causing lags of our business platforms. With its distributed architecture, OceanBase Database provides linear scalability, allowing us to achieve linear performance improvement by adding servers to handle the increasing data volume.
2.  **High availability**. OceanBase Database natively supports high availability. It uses the Paxos protocol to achieve high availability at the partition level, and still provides services when a minority of nodes fail. We do not need to install other components to guarantee high availability or automatic failover.
3.  **High compression ratio**. OceanBase Database organizes data based on the log-structured merge-tree (LSM-tree) architecture, where the full data consists of baseline data and incremental data. The baseline data is static and will only change at a major compaction. Therefore, aggressive algorithms can be applied to achieve a pretty high compression ratio. After the migration from MySQL to OceanBase Database, the disk usage is only about one-third of what it was before.
4.  **High compatibility**. OceanBase Database is compatible with most MySQL syntax. However, Nacos and XXL-JOB require SQL initialization in the database, and the ENGINE=InnoDB clause must be specified in the table creation statement, which is not supported by OceanBase Database. The solution is to remove this clause when creating a table in OceanBase Database.

  

In fact, OceanBase Database did a great job in our test environment.

  

XXL-JOB task scheduling platform: After the SQL initialization was completed, the platform ran smoothly and was highly compatible with OceanBase Database. No exceptions were found.

  

![1](/img/blogs/users/Yonyou/7ad8457c-8ff5-484b-b79a-a7d49f6cedd2.png)

  

Nacos configuration management center: After the SQL initialization was completed, the center operated satisfactorily.

  

  

![2](/img/blogs/users/Yonyou/c6e62f0c-e92e-43ac-aa43-0206067bd918.png)

  

Summary
--

The test results showed that OceanBase Database is highly compatible and integrated with XXL-JOB and Nacos. So, we deployed our XXL-JOB task scheduling platform and Nacos configuration management center based on the multitenancy feature of OceanBase Database. This feature has helped reduce the number of MySQL instances, simplifying database O&M significantly. The following figure shows the architecture of our cluster in use.

  

![](https://gw.alipayobjects.com/zos/oceanbase/2add4cd8-0d66-4bb3-948f-78d46bbb7098/image/2022-12-08/8f9d1c01-62a6-4046-be46-a68b3709dfb7.jpeg)

We considered our initial attempt at database replacement a very smooth experience. Thanks to its DaaS capabilities, OceanBase Database provides better support for tools that depend on MySQL, such as XXL-JOB and Nacos. It simplifies our database management, and allows us to spare more time for optimizing other tools.

  

Follow us in the [OceanBase community](https://open.oceanbase.com/blog). We aspire to regularly contribute technical information so we can all move forward together.

  

Search 🔍 DingTalk group 33254054 or scan the QR code below to join the OceanBase technical Q&A group. You can find answers to all your technical questions there.

  

![](https://gw.alipayobjects.com/zos/oceanbase/f4d95b17-3494-4004-8295-09ab4e649b68/image/2022-08-29/00ff7894-c260-446d-939d-f98aa6648760.png)