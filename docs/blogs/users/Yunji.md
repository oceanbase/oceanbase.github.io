---
slug: Yunji
title: 'Slashing Costs by 87.5%: Yunji`s Cost-cutting Adventure with OceanBase Database'
tags:
  - User Case
---

# Slashing Costs by 87.5%: Yunji`s Cost-cutting Adventure with OceanBase Database

Yunji Sharing Technology Co., Ltd. (Yunji) is an e-commerce firm like Taobao and JD.com, except that its business is more driven by social networks. Yunji offers members killer deals by cherry-picking high-quality, value-for-money goods, helping millions of shoppers snag reliable goods at "wholesale prices". With recent market rollercoasters, we're on a mission to pinch every penny, especially when it comes to server and labor costs. Right now, our servers are eating up over 85% of our budget, so trimming costs is high on our to-do list.️

For companies, cost optimization is about cutting expenses and enhancing efficiency. In today's cutthroat environment, many companies are confronted with such challenges. For developers, cost optimization is a kick in the pants, requiring them to clean up clunky code and boost the company’s tech game. And for us database administrators, supporting the company’s operations on a shoestring budget is a badge of honor. Plus, it’s a great chance to learn knowledge and methods, from cost analysis and assessment to server improvement and manpower optimization.

Business Challenges
====

Before making any decisions, we got the measure of our business. Like many other Internet companies, Yunji also hit bumps in the road with its original IT architecture, which is shown in the following figure. The application layer on top runs on microservices, with a cache provided to handle fast write operations during flash sales.

![1701329029](/img/blogs/users/Yunji/image/1701329029113.png)

The database layer consisted of database instances on Tencent Cloud. We created numerous database instances due to the architecture of microservices. In general, each system was empowered by a microservice that was supported by the following three database instances: a primary database, a standby database, and a user-dedicated standby database.

Business data was pumped through components such as Flink and Canal to the big data module, where the data was crunched to generate T+0 and T+1 reports. Some of the crunched data was synchronized back to the business database to support user queries. That process formed a data loop.

A link was built for OceanBase Migration Service (OMS) to migrate data from Tencent Cloud database instances to an OceanBase cluster. Why? For example, we created 32 database instances to support an order system, which needed to handle aggregation queries involving all its instances. As such system-wide queries were beyond the original sharded architecture, we had to synchronize the data to the OceanBase cluster and did the job there.

So, what’s the hitch with this architecture? Well, here's the scoop:

**Data silos**: Technically, one query should do the trick with one execution. However, to meet different business needs, multiple replicas were generated for the same data set and were stored in multiple storage systems, increasing the request volume and number of executions. A large number of data replicas also pushed up the storage costs.

**Database and table sharding**: Database and table sharding depended on middleware that had their respective features, and therefore caused troubles to the business and O&M teams:

*   We must design a variety of tables for different queries, and all queries were based on partitioning keys. This increased the business complexity.
*   Cross-shard aggregation queries and join queries turned into a nightmare because data had to be collected for processing at the application layer.
*   O&M was painful. Database scaling required tons of operations and data migration, and the backup and restore processes were complicated.

**Higher operational costs**: Horizontal or vertical decomposition of microservices resulted in increasing instance count and resource costs. In addition, instance resources were inefficiently used. CPU utilization rarely hit 20% and, when it did, any business spikes would overwhelm servers. We had to reserve some hardware resources.

**Data safety**: To meet the requirements of Multi-Level Protection Scheme (MLPS), our system must be deployed in at least three IDCs across two regions for disaster recovery, which jacked up costs. We created on-premises and remote backups on Tencent Cloud for our production environment, and suffered O&M headaches during a remote backup, such as time-consuming data pulls and frequent failures. The tremendous data volume also incurred sky-high traffic costs.

Costs Optimization Strategies
======

To address those architectural challenges, we came up with a few cost optimization strategies:

*   Replace the complex sharded architecture that involves data loops and lengthy workflows, and is prone to faults.
*   Move archived data to OceanBase Database, which supports a high compression ratio. This saves storage costs and improves capacity limits.
*   Merge business instances, aiming for lower server resource consumption to increase resource usage during off-peak hours. For example, more resources can be allocated to handle e-commerce business requests during the day, and to generate T+0 and T+1 reports at night.
*   Consider replacing conventional databases with distributed ones that support hybrid transaction and analytical processing (HTAP), and executing online and analytical tasks within the same cluster. This simplifies data links, reduces the complexity of the business architecture, and brings down O&M workload. Plus, distributed databases can achieve higher performance with fewer machine resources under the same workload. This also saves costs.

What about the hurdles?

Switching to a new architecture takes time to prove it can carry our business growth. Convincing the development team to ramp up their workload is tough, too — it’s about selling the benefits of architecture transformation and a new learning curve. So, human resources and technological adaptation were major hurdles.

A Budget-saving Solution based on OceanBase Database
=====================

We designed a cost optimization solution in line with the following rules:

*   Strong system stability and zero business interruptions.
*   High compatibility and simplified deployment with a short learning curve.
*   No over-engineering, which may cripple the business system's adaptability to business fluctuations in the name of savings.

OceanBase Database got the nod for its:

*   Compatibility with MySQL, which means less development work and stable version iterations.
*   High throughput and solid ecosystem backing.
*   HTAP capabilities and horizontal scaling, which are well suited for our transaction processing (TP) and analytical processing (AP) needs.

![1701329130](/img/blogs/users/Yunji/image/1701329130162.png)

Using OceanBase Database, we transformed the original architecture, which consisted of a cloud database layer, an extract, transform, and load (ETL) layer, and a big data module, into a streamlined OceanBase cluster supporting HTAP tasks. The new architecture hits our cost optimization goals because it works with fewer intermediate data links, reduces the development work, and provides a recovery time objective (RTO) within 8 seconds and a recovery point objective (RPO) of 0, meeting the MLPS requirements.

![1701329144](/img/blogs/users/Yunji/image/1701329144538.png)

Summary
===

This article delves into the reasons for cost optimization in today’s market environment, our original database architecture and its vulnerabilities, and the new solution that we adopted to achieve cost optimization. Not only the distributed architecture of OceanBase Database suffices for our business scenarios, its high performance, high compression ratio, high reliability, and HTAP features also help reduce the hardware, manpower, and O&M costs. Amid the recent market changes, we have slashed the monthly server cost from more than 8 million Chinese yuan at the peak to less than 1 million Chinese yuan.

The result of cost optimization is remarkable, and the improvement of technology and system adaptability has played a significant role. Other companies may find our solution inspiring in making their cost optimization strategies. We have proved that technical tweaks amid shifting sands can cut costs, boost efficiency, and bring more financial benefits.

Moving forward, we will try out new features of OceanBase Database. We are testing OceanBase Database V4.2.1, the first long-term support (LTS) version, hoping that it will pack a punch.