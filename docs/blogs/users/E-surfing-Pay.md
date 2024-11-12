---
slug: E-surfing-Pay
title: 'Multitenancy Helps E-surfing Pay Improve Performance Fivefold at a Lower Cost'
tags:
  - User Case
---

As a platform serving tens of millions of monthly active users (MAU), E-surfing Pay not only provides a variety of everyday life services, but also needs to store and process relevant data. Due to issues with its original database solution, such as insufficient storage space, high analysis latency, difficulties in cost control, and increased O&M complexity, the company must replace the original database architecture with a new one to ensure the long-term business stability.

Based on an in-depth investigation of the distributed database solutions on the market, E-surfing Pay finally chose OceanBase Database and tested and verified this solution in real-world scenarios. Compared to the original database solution, OceanBase Database improved performance fivefold, reduced hardware costs by 57%, and saved storage space by 10%, significantly minimizing server and O&M costs. Satisfied with these benefits, E-surfing Pay then decided to switch its database in use to OceanBase Database for the business modules of the billing center and message center and gradually migrate the existing MySQL business to the new database.

Background Information of E-surfing Pay
----

As a third-party service platform owned by China Telecom Bestpay E-commerce Co., Ltd., E-surfing Pay has accumulated 70 million MAU and offers a range of services such as utility bill payment, shopping, and financial management. Leveraging cloud computing, big data, and AI, the platform cooperates with partners to empower more than 10 million offline merchants and 170+ well-known online leading e-commerce platforms.

With high regulatory compliance, E-surfing Pay insists on providing handy services for public and sharing resources with partners to achieve mutual success. In addition, it is committed to building open, safe, and easy-to-use products. By combining service investment and product upgrade, E-surfing Pay aims to realize digital transformation in its business practices and service provision.

**Challenges and Database Selection: Problems with the Original Database**
----------------------------

The database solution that E-surfing Pay used in the past played an important role mainly in its business modules of the billing center, credit checking, and anti-money laundering. However, the following problems emerged as the MAU increased and the associated business grew.

1\. Tenants were not isolated. E-surfing Pay deployed multiple databases in a database cluster, with resources shared among them. When any database was experiencing traffic surges during peak hours, the services of other databases were affected, which significantly impacted the user experience.

2\. Hardware costs were high. To ensure business stability during O&M, business modules were physically isolated and ran in different database environments. Therefore, many databases were deployed. In other words, a server was deployed for each role in a single cluster for a business module. For example, in the original database cluster, two separate database environments were set up for the billing center and message center modules, each deployed with seven servers. As a result, a total of 14 servers were required. While the business stability was achieved by isolating business modules, the costs were high.

3\. The stability was poor. Take the business module of the message center as an example. Some issues were found during testing of the original database for this module, including slow queries, surges lasting several seconds, and irregular business jitters.

For most business modules on the platform, three IDCs were deployed across two regions in the active-active architecture, which is one of the deployment modes provided by OceanBase Database. In addition, each IDC deployed under OceanBase Database supports business access, better suiting the business architecture of E-surfing Pay than any other distributed database solutions on the market.

As a typical distributed database solution in China, OceanBase Database provides enterprise-level features, including financial-grade high availability, transparent horizontal scalability, distributed transactions, multitenancy, and SQL syntax compatibility, all based on its native distributed architecture, delivering the following capabilities:

**Higher performance:** All nodes in the cluster have equivalent computing and storage capabilities. If higher computing power is required by business or the data volume increases rapidly, the computing power and storage capacity of OceanBase Database can be increased by adding nodes. In addition, the integrated architecture reduces unnecessary remote procedure calls (RPCs) between components and within the same component of the distributed cluster by completing business access locally whenever possible, thereby achieving higher performance. The test result showed that the cluster performance increased linearly after hardware resources were added, which met the expectation.

**Lower cost:** In business practice, the tenant isolation feature enables efficient O&M of multiple business modules in one or few environments. Official support tools such as OceanBase Cloud Platform (OCP) and OceanBase Migration Service (OMS) can also be leveraged to simplify O&M. The test result showed that OceanBase Database consumed fewer hardware resources than other database solutions, which means it is more cost-effective.

**Better stability:** The data of a business table is stored in the form of shards. In the distributed architecture of OceanBase Database, the data of a single table can be evenly distributed across different nodes. E-surfing Pay no longer needs a complex database and table sharding solution. In addition, OceanBase Database stores three replicas for a set of data by default and uses the Paxos protocol for leader election. This ensures that upper-layer business applications are not affected and that the business data is not lost when the minority of nodes or replicas fail or become abnormal.

The preceding three capabilities deliver exactly what E-surfing Pay requires and values, leading it to choose OceanBase Database.

![1688521819](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-07/1688521819891.png)

Figure 1: Typical three-replica architecture of OceanBase Database

**Architecture Transformation: Performance Improvement with Fewer Resources and at Lower O&M Costs**
-------------------------

After determining the database selection solution, we compared OceanBase Database V3.1.4 with the original database used by E-surfing Pay. We adopted a dual write method to compare the two database solutions in real-world scenarios. The test result exceeded our expectations.

Firstly, OceanBase Database reduced the hardware cost by 57% and significantly saved resources. Its multitenancy feature made resource isolation possible. This allowed E-surfing Pay to create business tenants separately and migrate business modules of the billing center and message center from 14 servers in the original database to just 6 servers in OceanBase Database, reducing hardware costs by 57%. In addition, OceanBase Database allowed O&M of multiple business modules in the same environment, facilitating daily management.

The average CPU utilization of tenants in the original database environment for the preceding two business modules was between 20% and 25%, while the CPU utilization in the OceanBase Database environment was about 5%. Besides, OceanBase Database required 10% less storage space (17 TB) than the original database (19 TB). These figures prove that OceanBase Database consumes fewer resources when processing the same data volume.

Secondly, the performance is 5 times better. The single table analysis efficiency is improved by 10% to 20%. Take the business module of the message center as an example. The average response time for the message status update API provided by the original database is 10 ms. However, under the same conditions, OceanBase Database uses the partitioning key to maintain the response latency at 2 ms. As for the online billing business module, the original database stored 20 billion data records in a single large table. By partitioning the table using the hash algorithm, OceanBase Database improves the single table analysis efficiency by 10% to 20%.

Lastly, OceanBase Database greatly lowers the O&M cost. OceanBase Database provides GUI-based management in OCP, allowing a database administrator (DBA) to manage clusters in a unified manner. The DBA can log in to OCP to operate and maintain all clusters, as shown in the figure below. Thus, the management cost is significantly reduced.

![1688521893](/img/blogs/users/E-surfing-Pay/1688521893238.png)

Figure 2: OCP cluster management page

In addition to routine O&M management, OCP also monitors the status of all clusters and sends an alert upon an exception, as shown in the figure below.

![1688521933](/img/blogs/users/E-surfing-Pay/1688521933034.png)

Figure 3: OCP monitoring page

At present, the business modules of E-surfing Pay such as the message center and billing center have been switched to OceanBase Database. More business modules such as the settlement center and anti-money laundering will be gradually migrated to OceanBase Database as well.

**Summary: Contributing Factors to Successful Database Selection**
--------------------

Overall, this database selection practice of E-surfing Pay and the final results achieved have greatly surprised our team. We attribute this success to the following factors:

First, smooth business migration. During database migration, we care most about minimizing the migration time and cost while ensuring zero business interruptions and data loss. We use OMS to efficiently and smoothly migrate data from the original MySQL environment with no data loss at a lower cost. Compatibility is also ensured, without requiring any application modifications. For example, we leverage binlog tools provided by the original database to migrate data to OceanBase Database and complete the migration smoothly.

Second, unified management for higher O&M efficiency. OceanBase Database allows us to manage all the database environments in OCP in a unified manner, simplifying database O&M and management. What's more, the monitoring and alerting system in OCP facilitates issue detection and resolution.

Last but not least, multitenancy and resource isolation. We need to deploy multiple databases for some business modules, such as the online mall. To avoid resource contention among these databases, which may affect other business modules, each database is contained in an OceanBase Database tenant. Resources for each tenant are isolated, so that we can limit the amount of resources for each database. Furthermore, the amount of tenant resources can be adjusted as needed, which means we can adjust resources of each database. This ensures the business stability and flexibility.

That's all for the success story about E-surfing Pay's database selection. We hope that our experience can help you select the right database.