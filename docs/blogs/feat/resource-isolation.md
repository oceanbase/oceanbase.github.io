---
slug: resource-isolation
title: "Why is resource isolation important for HTAP?"
---

> About the author: Xi Huafeng, an OceanBase technical expert, has been dedicated to optimizing the high availability and scalability of databases for 11 years. He helped with the implementation of the Paxos protocol in OceanBase Database and was a member of the OceanBase TPC-C project team. He is now a member of the OceanBase system group, dedicated to building HTAP infrastructure and working on isolation of resources for AP and TP tasks.

In [Technical thoughts on the benefits of vectorized engines to HTAP](https://open.oceanbase.com/blog/10900410), we shared views of the OceanBase team on vectorized engines and introduced our ideas of dealing with complex queries by using a vectorized engine.

Hybrid transaction and analytical processing (HTAP) is supposed to run online transaction processing (OLTP) and online analytical processing (OLAP) in the same system for better performance. It helps with making business decisions in real time and facilitates innovation at lower operational costs. However, parallel running of OLTP and OLAP tends to cause resource contention because they use database resources, such as CPU, memory, and disk, in different ways. Minimizing such contention is the key to achieve HTAP and also the issue to resolve through resource isolation — the technology to be introduced in this article.

<!-- truncate -->

We believe that true HTAP requires complete resource isolation. A database must support logical isolation complementary to physical isolation to help users adjust resource allocation as needed. Resources for core business that requires ultimate independence can be physically isolated, while those for cost-sensitive long-tail business can be logically isolated. In this article, we will share thoughts of the OceanBase team on resource isolation, and explain why this technology is a must for HTAP and what we have done to tackle the challenges of making it work.

- Why is resource isolation necessary for HTAP?
- How to implement resource isolation for HTAP?
- What is achieved by resource isolation in OceanBase Database?

**Why is resource isolation necessary for HTAP?**

Resource isolation lays the groundwork for HTAP

To show the importance of resource isolation, we can put a database beside an operating system. The two are both complex because of their openness of functionality and nature of delivering a higher price-performance ratio. The openness of functionality denotes uncontrollable workloads. For example, a user process or an SQL statement can be used to perform any operations in the system. As for the price-performance ratio, it is important because even a teeny-tiny saving of resources means a lot, given a massive user base. Among all the ways of driving up the cost performance, resource isolation is unarguably the most straightforward one.

After decades of development, modern operating systems are generally capable of supporting multiple users and Docker, a virtualized application container. Docker-based Kubernetes, for example, has become the de facto standard for business deployment. Databases, on the other hand, are also required to handle multi-tenancy and HTAP. Many companies separate their historical databases from online databases and perform OLAP in historical databases, which not only makes O&M more complicated but also downgrades OLAP efficiency, making it impossible to achieve dynamic balance between OLTP and OLAP with limited hardware resources. As more database instances are being deployed, achieving such balance will only bring more benefits.

Resource isolation is a requirement naturally derived from the grouping of different workloads. For example, backup tasks at the background and SQL processing tasks at the foreground are grouped because they obviously have different requirements on timeliness. OLTP and OLAP also involve grouping because the two use resources in different ways. In other words, as long as a software system processes objects differently, it naturally classifies them into groups to ensure the quality of service (QoS), which gives rise to the need for resource isolation.

Resource isolation is critical to the operation stability of a database. There are two typical cases of resource isolation. First, you can reserve resources for important database tasks through resource isolation to prevent the database from being overloaded and crash. Second, users may sometimes hold business with different QoS requirements in the same database. For example, they hold real-time OLTP business and a small number of less import background tasks in the same database. If users agree to expose such information to the database so that the database can isolate resources for the business, the database will be able to run more stably.

A classic example of the second case is the isolation between OLAP and OLTP. To avoid interference between OLTP and OLAP, a conventional database tends to be built with more hardware resources so that each business is allocated with sufficient resources, which leads to inefficient resource utilization. To address this issue, we can consolidate multiple databases into one physical database to reduce the O&M complexity and hardware costs.

Merging OLTP and OLAP databases into one HTAP database can be considered as a consolidation process. As aforementioned, operating systems have supported multi-user and Docker for long. Is it possible that databases also demand the sharing of physical resources as technology evolves? We believe that as technology evolves and databases grow larger, logical resource isolation will be applied in more scenarios. In the real world, many users run OLTP workloads in parallel with simple OLAP workloads in the same database. However, the performance may not be as expected due to the limited OLAP and resource isolation capabilities of the database.

For example, if the owner of an online store wants to know the best-sellers of a day, it's better to perform analysis in the online database. However, if the database does not support resource isolation, the analytical SQL queries may affect online transactions. To ensure the stability of online transactions, it is necessary to scale out the database by introducing more physical resources to keep the business stable. Even so, the analytical SQL queries must be strictly reviewed to prevent them from exhausting all resources.

Which is better: physical or logical isolation?

Resource isolation is not new. Conventionally, not sharing physical resources is taken as a physical isolation solution. In a database that adopts physical isolation, row-store-based replicas are used for OLTP and column-store-based replicas are used for OLAP under different tenants or within the same tenant. Physical resources for OLAP and OLTP are isolated. If cost is not a consideration, physical isolation is no doubt a better choice.

In the real world, however, costs and utilization of hardware resources are among the concerns of most customers. On the one hand, database hardware is expensive to purchase and maintain and needs to be replaced regularly. On the other hand, if database hardware is used for processing single business, only a minor portion of it is utilized on average. Inefficient use of hardware resources is absolutely a huge waste.

To make full use of hardware resources, logical isolation stands out because physical resources shared by OLAP and OLTP are logically isolated across different tenants or within the same tenant. Instead of a this-or-that choice, we believe that physical isolation and logical isolation are complementary. In view of the possible contention caused by shared resources, however, some worry that resource sharing impairs QoS and is therefore of limited value to users, while others are concerned about whether a perfect resource isolation solution is possible and whether the losses outweigh the benefits if the solution is too complex.

Well, on the one hand, we should get out of the box of perfectionism and recognize the obvious customer benefits of basic resource isolation capabilities. On the other hand, let's look at this issue from a forward-looking perspective and admit that the logical isolation technology is getting better over time.

Therefore, instead of making a choice between physical and logical isolation, an ideal HTAP solution is about finding a balance between absolute physical isolation and share-it-all. Infrastructure software should allow users to choose an isolation solution based on the scenario. It is necessary for database products to support physical and logical resource isolation at all levels.

**How to implement resource isolation for HTAP?**

Before implementing resource isolation, we must:

- Define resource groups and their QoS. For databases, a tenant is the most common resource group. You can also configure resource groups respectively for OLAP and OLTP.
- Develop and implement resource isolation strategies based on the defined QoS.

We will first look at the database management APIs for the database administrator (DBA), analyze the resources to be isolated (those having the greatest business impact), and then describe the isolation solution of OceanBase Database by taking CPU time, inputs and outputs per second (IOPS), and network bandwidth as examples.

Define resource groups and design resource plans for OLTP and OLAP

OceanBase Database aims to realize resource isolation between tenants and that between OLTP and OLAP within one tenant.

OceanBase Database allows users to define resource specifications of a tenant through unit configuration. Before you create an OceanBase Database tenant, you must create a resource pool and configure resource units in the pool to control the resource usage. If you are not familiar with this concept, go to OceanBase Documentation and take a look at the "Cluster and multi-tenant management" chapter.

      create resource unit box1 max_cpu 4, max_memory 21474836480, max_iops 128, max_disk_size '5G', max_session_num 64, min_cpu=4, min_memory=21474836480, min_iops=128;

For users to define resource specifications of OLTP and OLAP within a tenant, OceanBase Database provides management APIs by referring to the classic Resource Manager service of Oracle. We have noted that customers tend to run batch processing tasks during off-peak hours, such as midnight or early morning, when OLTP is unlikely affected by OLAP, and most resources of a cluster can be allocated to OLAP with minimal resources reserved to support essential OLTP tasks. During peak hours in the daytime, the resource isolation plan can be adjusted to ensure sufficient resources for OLTP with minimal resources reserved to support essential OLAP tasks. OceanBase Database allows users to set two plans for resource management in the daytime and at night. You can activate the plans as needed to ensure isolation and maximize resource utilization.

![](https://gw.alipayobjects.com/zos/oceanbase/8834920c-824e-443d-ae10-5032f8445faf/image/2022-09-29/f2a3ed00-30b2-44df-b47e-68b793d59a67.png)

For example, the following syntax defines a daytime resource plan where OLTP (`interactive_group`) and OLAP (`batch_group`) are respectively allocated with 80% and 20% of the resources.

         DBMS_RESOURCE_MANAGER.CREATE_PLAN(
            PLAN    => 'DAYTIME',
            COMMENT => 'More resources for OLTP applications');
         DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
            PLAN             => 'DAYTIME',
            GROUP_OR_SUBPLAN => 'interactive_group',
            COMMENT          => 'OLTP group',
            MGMT_P1          => 80,
            UTILIZATION_LIMIT => 100);

         DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
            PLAN             => 'DAYTIME',
            GROUP_OR_SUBPLAN => 'batch_group',
            COMMENT          => 'OLAP group',
            MGMT_P1          => 20,
            UTILIZATION_LIMIT => 20);

After the plan is ready, you can execute the following statement to activate it:

      ALTER SYSTEM SET RESOURCE_MANAGER_PLAN = 'DAYTIME';

Similarly, you can define a night resource plan and activate it during off-peak hours.

OceanBase Database supports user-based SQL categorization, which is simple but quite effective. You can create a user dedicated to executing analytical SQL queries, so that all SQL queries initiated by this user are processed as OLAP workloads. Also, if the execution of a request does not complete in 5 seconds, OceanBase Database identifies the request as a large query and downgrades its priority.

Ensure QoS with `min`, `max`, and `weight`

QoS is a security mechanism that guarantees the smooth operation of critical processes when resources are overloaded. We will describe QoS through weight allocation and the definition of upper and lower limits on resources.

As the business traffic fluctuates over time, the QoS description should be flexible. If we use a fixed QoS description, just like specifying a fixed number of CPU cores and I/O bandwidth for Elastic Compute Service (ECS) of Alibaba Cloud, the system is prone to failure during peak hours due to insufficient database capacity.

Assume that Tenant A and Tenant B need to share 100 Mbit/s of bandwidth based on principles of resource sharing in off-peak hours and isolation in peak hours without interfering with each other.

How to ensure that resources are preferentially allocated to the tenant with higher priority? We can set the weight ratio between Tenant A and Tenant B to, for example, 1:3 to control the resource allocation. When both tenants need CPU resources, the ratio of CPU time spent on Tenant A and Tenant B will be 1:3. This weight ratio is specified by the `weight` parameter.

When a system has abundant physical resources, it is possible that a low-weight tenant takes up a lot of resources that it does not need. How to put a cap on it? We can specify the maximum resource usage for each tenant by setting the `max` parameter on top of the weight ratio. For example, with a weight ratio of 1:3 between Tenant A and Tenant B, Tenant A can use up to 25 Mbit/s of bandwidth. If we set the `max` parameter to 20 Mbit/s, the tenant will use no more than 20 Mbit/s of bandwidth.

The weight ratio will change if tenants are added or deleted. To ensure that each tenant obtains the minimum resources that it requires, we can specify the amount of reserved resources for each tenant by setting the `min` parameter. This not only guarantees the operation of basic functionality of all tenants but also describes QoS in a clearer way.

Provide better resource isolation in OceanBase Database

Database resources can be classified into rigid and elastic resources depending on their usage behaviors. Generally, elastic resources can be isolated. Rigid resources are necessary for programs to fulfill their duties and, once occupied, will not be released in a short period of time. Typical rigid resources include disk, memory, and the number of connections. After you make a static plan for such resources, the amount of resources allocated to each group is fixed. Elastic resources, such as IOPS, CPU time, and network bandwidth, have nothing to do with program functionality but are related to system performance. These resources can be preempted or quickly released. Users can schedule elastic resources for sharing in off-peak hours and isolation in peak hours. So, the sharing of elastic resources is what we need to focus on.

OceanBase Database prioritizes the isolation of the following resources that are relatively import: memory, disk space, CPU time, IOPS, and bandwidth.

CPU isolation

OceanBase Database has supported CPU time isolation and will support CPU cache isolation later. CPU isolation works in real time only when CPU is in kernel mode. This is because a resource can be scheduled only if it can be divided into many smaller pieces. For example, network I/O resources are natively in form of packets, and so do disk I/O resources. The operating system divides CPU time into many slices, which are transparent for the user mode and cannot be directly scheduled. To schedule CPU time in user mode, you need to insert many checkpoints into the code to divide the CPU time of user threads into many segments, and execute the scheduling at the checkpoints. The accuracy of checkpoint insertion, however, is not guaranteed. How to insert checkpoints into functions of a static database?

OceanBase Database adopts a kernel mode solution, where the CPU controller of cgroup is used. Currently, cgroup supports the `max` and `weight` parameters. Although the `min` parameter is not supported, it is not a problem because the total CPU time does not fluctuate. We can reserve the time slices for each group just by setting the `weight` parameter.

CPU isolation applies not only to user workloads, but also system tasks. For example, leader election among multiple replicas is a high-priority task for OBServer nodes, and we do not want the election to be affected by the CPU resource contention with user SQL queries. Therefore, we divide resources for election and user SQL queries into two directories in the root of cgroup, and further divide the user SQL directory into subdirectories corresponding to tenants and users within tenants.

IOPS isolation

If you use a solid-state disk (SSD), you can calculate the bandwidth based on this equation: Bandwidth = SSD size × IOPS. We can use normalized IOPS with an empirical formula. For example, we can take a 16 KB I/O as a normalized I/O, so that a 2 MB I/O is translated into several normalized I/Os based on the formula. Devices need to be distinguished during IOPS isolation. However, exposing the devices makes configuration more complicated. So, in most cases, multiple devices share one set of configurations.

These ideas are inspired by this paper about VM I/O isolation, titled "mClock: Handling Throughput Variability for Hypervisor IO Scheduling", by VMware Inc.

When OceanBase Database was deployed on a public cloud, we found that the I/O throughput of the cloud disk fluctuated. However, OceanBase Database quickly adapted to such fluctuation and maintained the stability of the most important OLTP business. Also, OceanBase Database associates I/O isolation with block cache, which means OceanBase Database limits not only the I/O bandwidth of OLAP but also the cache used for OLAP. In this way, the block cache can be protected from being polluted by OLAP to eventually ensure the low latency of OLTP.

Network bandwidth isolation

OBServer nodes communicate with each other by using remote procedure calls (RPCs). RPCs are sent to OBServer nodes within the same Internet data center (IDC) for the distributed execution of SQL statements and two-phase commit, and to OBServer nodes in other IDCs for log replication and data backup to ensure high availability. Unlike intra-IDC communication, the inter-IDC communication between an OBServer node and different IDCs is performed with varying latency and bandwidth usage. Usually, the bandwidth is shared for inter-IDC communication. Therefore, the bandwidth allocation and limitation must be considered globally. The question is how to define the scope of 'global'? If we have built multiple OceanBase clusters, do we need to consider them all? What if network partitioning is involved even we have only one OceanBase cluster? How can we get the global view?

OceanBase Database supports region-level bandwidth control since V3.2. Next, instead of holistic resource scheduling among multiple OceanBase clusters, we want the DBA to make a static resource plan. That is, the DBA needs to configure the bandwidth available to clusters for the intra-IDC and inter-IDC communication. OceanBase Database then dynamically assigns the bandwidth to OBServer nodes within a cluster, and each OBServer node further assigns the bandwidth to different groups based on their priorities.

For most business, bandwidth allocation for the intra-IDC communication is more important. While bandwidth isolation is quite similar to IOPS isolation, algorithms often take the network interface card (NIC) rather than each communication destination in calculations as an I/O device, given the large number of communication destinations.

Bandwidth isolation can be completed in two steps: tag traffic and isolate the tagged traffic based on pre-defined requirements. The first step can be performed only at the application layer, and the second step can be performed either at the application layer or the kernel layer. Since Linux Traffic Control (TC) provides a variety of throttling and priority strategies, OceanBase Database tags traffic at the application layer and throttles the tagged traffic at the kernel layer. This solution reuses capabilities of the kernel that are supported by a widely accepted ecosystem. Users do not bother to learn new throttling mechanisms.

**What is achieved by resource isolation in OceanBase Database?**

At present, OceanBase Database supports the isolation of memory, disk, CPU, and IOPS, and will support bandwidth isolation in the future. The following test takes CPU isolation as an example to show the performance of resource isolation in OceanBase Database.

When talking about the method of defining resource groups, we mentioned that a dedicated user can be created for OLAP. In this test, we created two test users named AP@ORACLE and TP@ORACLE, and bound OLAP tasks to AP_GROUP and OLTP tasks to TP_GROUP, assuming that the test business involves heavy OLTP workloads during daytime and most OLAP workloads are handled at night. Therefore, we set two resource plans for daytime and night. The daytime plan schedules 80% of the resources for OLTP and 20% for OLAP, and the night plan schedules 50% of the resources for OLTP and 50% for OLAP.

Switch from the daytime plan to the night plan

The result shows that the OLAP QPS increases significantly while the OLTP QPS decreases after the plan switchover due to a larger portion of CPU resources allocated to OLAP in the night plan. In the figure below, you can see the turning points of OLAP and OLTP throughput curves caused by the plan switchover.

![](https://gw.alipayobjects.com/zos/oceanbase/df4eeb08-6997-4447-9ba2-a934dd3cad25/image/2022-09-29/673ae0a8-e777-4612-8326-0dd0a3d81e09.png)

It seems that the change in the OLTP throughput is not as noticeable in comparison to that of OLAP. This is actually a result as expected. The percentage of resources for OLAP is increased from 20% to 50%, an increase of 150%, and that for OLTP is reduced from 80% to 50%, a decrease of 37.5%. Given that the actual OLTP throughput drops from 19,000 to 14,300 QPS, a 24.7% decrease, the gap does not make much difference.

The performance of CPU isolation relies largely on the type of workload. If the network becomes a bottleneck, bandwidth isolation is also necessary. The test is not intended to bang the drum for CPU isolation as a cure-all, but it does show that simple CPU isolation works well for CPU-bound workloads, even without the CPU cache isolation. Keep in mind that isolation capabilities are getting better over time. CPU isolation alone takes effect on OLTP-simple OLAP isolation or OLTP-OLTP isolation. If we combine CPU isolation with IOPS isolation and network bandwidth isolation, the application scope will be even wider.

# [](#k31aH)**Wrap-up**

This article introduces thoughts of the OceanBase team on resource isolation technology and its implementation solution. Highly efficient and effective resource isolation is required to ensure sharing of hardware resources among different tenants and among OLTP and OLAP services within the same tenant in an HTAP database. We believe that a resource isolation solution that integrates complementary physical and logical isolation mechanisms is more suitable for an HTAP database. OceanBase will keep optimizing the resource isolation technology to better meet the needs of users.
