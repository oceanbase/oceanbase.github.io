---
slug: Sunshine-Insurance
title: 'Sunshine Insurance‘s Practices of Deploying Core Business Systems on OceanBase Database'
tags:
  - User Case
---


![1732192973](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-11/043bb459-a79c-457d-afd1-f6d383c17aad.png)

Sunshine Insurance was established in July 2005 and grew into a fully licensed insurance group in less than three years. The group made it to the list of China's top 500 enterprises within five years after its founding, and has been recognized as one of "China's 500 Most Valuable Brands" by the World Brand Lab for 14 years in a row. It is one of the fastest-growing medium-sized insurance companies in the industry.

By the end of 2023, the total assets of Sunshine Insurance Group (SIG) exceeded CNY 500 billion, with the annual original premium income surpassing CNY 100 billion, over 50,000 employees, and more than 30 million customers. Notably, Sunshine Property and Casualty Insurance, a SIG member company, achieved profitability in less than two years since its founding, and Sunshine Life Insurance, another SIG member company, did so in six years—both breaking industry records. Their growth speed and profitability far outperformed companies of the same age. As a rapidly growing and vigorous top-tier mid-sized insurance company, SIG has always been committed to innovation and social responsibility, investing heavily in supporting domestic technological innovation. With the accelerating trend of digital transformation, SIG decided to upgrade its database system with Chinese domestic products.

At the 2024 OceanBase Annual Conference, **Yang Qinghua, the head of Sunshine Digital Technology's innovation and incubation team, was invited to share their experience in upgrading a database system. For more information, see** [**SIG's Best Practices in Upgrading the Databases of Key Business Systems**](https://www.oceanbase.com/video/9001834). He revealed that SIG has been upgrading the databases for several general and core business systems, such as the property insurance, life insurance, and asset management systems. **So far, the group has built over 20 OceanBase clusters and replaced nearly 400 database instances for more than 200 business systems, accounting for nearly 40% of the total. All upgraded systems are running stably**.

  

**1. Innovation First: SIG Actively Promotes Database Architecture Upgrade**
----------------------------

 In its digital transformation journey, SIG has always focused on empowering business development with technology and promoting technological innovation in house. It has resolutely implemented regulatory requirements, quickly responded to industry trends, and driven continuous upgrades and reforms in its IT architecture. SIG's technological evolution has gone through four main stages.

![1732193245](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-11/ed2f11eb-68c8-44ec-9fa4-ddcd17593c1d.png)

**○   Early Stage (2004-2014): In this stage, SIG focused on online transformation**. A series of core business systems were deployed to free some staff from tedious form work. Most systems were externally sourced.

**○   Stage 1.0 (2015-2017): In this stage, SIG emphasized adaptation to internet-based business based on the distributed architecture and configurable design**. A typical move was the building of new-generation core business systems starting in 2015. Drawing on experiences of peer companies, SIG developed capabilities such as local data centers, process engines, and rule configuration, further expanding the application of internet technologies in its business systems.

**○   Stage 2.0 (2018-2022): In this stage, SIG took action to develop its mobile capabilities, data processing capabilities, and cloud-native technologies**. It developed a series of B2C and B2B apps to improve user experience, started building a data mid-end platform and, in response to trends in cloud-native transformation, implemented service governance, containerization, and DevOps technologies, starting with its core systems.

**○   Stage 3.0 (2023-Present): In this stage, SIG steered toward intelligentization.** With the rise of AI, SIG has been gradually moving to system intelligentization. Guided by the philosophy of "one server serving a group of customers," the group has developed in-house AI and large-model capabilities to achieve intelligent decision-making systems, early warning systems, and robot employees, while further strengthening its cloud-native infrastructure.

With the fast business growth and the unceasing technological upgrade, the complex application architecture and business requirements posed new challenges to data systems, including the following three challenges to databases:

**○   Autonomous control**: Smoothly upgrading to a domestic technology stack was a significant challenge in data management.

**○   Management of multiple data sources**: With the advancement of cloud-native and intelligent technologies, many of SIG's business systems were shifted to microservice-based architectures. Some large core systems even consisted of dozens or hundreds of microservices, leading to more database instances and more issues in database selection and data asset management.

**○   Performance, availability, and scalability**: Databases hit bottlenecks in terms of non-functional requirements such as the performance, availability, and scalability. The conventional technology stack made it costly to meet new business demands, especially for internet-based services, which were affected by insufficient availability and scalability of the data layer, leading to increased costs and risks.

  

**2. Reliability and Cost-Effectiveness of OceanBase Database**
----------------------------

SIG determined its database upgrade strategy based on three principles:

**○** Exhaustive replacement. All new business systems, including core features, must be upgraded based on domestic databases.

**○** Layer replacement with expert support. Collectively replace key layers such as the databases and middleware layers, and establish an internal expert group to cope with upgrade challenges and ensure a smooth process.

**○** Hands-on use: Deploy and use domestic products in real-world business scenarios, and avoid long-term running of both legacy and new databases in parallel. This verifies whether core business systems are viable on domestic databases.

Based on this strategy, Yang explained why they chose OceanBase Database: **"Reliability and cost-effectiveness are the two decisive factors in our database selection. "**

![1732193417](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-11/d72d29fc-34c7-4c74-bef0-a45a76cc99dc.png)

When it came to reliability, SIG placed a high value on three factors: **Autonomous control**: The whole stack of OceanBase Database is developed fully in house, which aligns perfectly with SIG's requirements. The vendor can quickly deal with any custom needs or issues during the upgrade process. **Technical reliability**: OceanBase Database has advantages in distributed architecture, high performance and availability, and scalability, and its reliability has been demonstrated through successful applications in peer companies in the industry. **Service reliability**: OceanBase Database is backed by a full-time professional technical support team, who can assist with database deployment and O&M.

As to the cost-effectiveness, SIG also considered three factors: **Resource costs**: OceanBase Database supports multitenancy, shared resource pools, LSM-tree storage, and advanced compression algorithms, and thus can meet higher business demands. **Process costs**: OceanBase Database offers a complete migration solution with well-developed tools to ensure a smooth migration. **Operational costs**: OceanBase Database can be managed with a range of tools, such as OceanBase Cloud Platform (OCP) for cluster management, OceanBase Autonomy Service (OAS) for database diagnostics, and OceanBase Admin Toolkit (OAT) for deployment. These tools help the operations team quickly identify and resolve issues, simplifying routine O&M.

Given these six factors, SIG decided to upgrade its database system to OceanBase Database, and had accelerated its database upgrade efforts since 2022.

  

**3. Performance and Resource Utilization Improvement of the "Ultra-Short-Term Insurance" System**
---------------------------

**So far, the group has built over 20 OceanBase clusters and replaced nearly 400 database instances for more than 200 general and core business systems, such as the property insurance, life insurance, and asset management systems**, accounting for nearly 40% of the total. All upgraded systems are running stably.

At the conference, Yang highlighted their experience in implementing the Ultra-Short-Term Insurance system, which handles part of Sunshine Property and Casualty Insurance's internet-based short-term insurance policies. With up to 3 million policies on a daily basis, a single table can contain up to 2 billion data records. Before the company upgraded its database to a distributed architecture, the system relied on physical table sharding for scalability. In a word, the business scenario of the system is characterized by numerous data sources, a high daily transaction volume, large traffic, a low premium per policy, and stringent requirements for policy issuance speed, stability, and cost-effectiveness.

**Given this background, the database supporting the Ultra-Short-Term Insurance system must provide high concurrency, low latency, strong consistency, high availability, resource efficiency, and minimal post-migration changes**.

![1732193764](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-11/bf7723fa-71c7-4478-af25-a049acee4d72.png)

Yang showed the four stages of migrating the database supporting the Ultra-Short-Term Insurance system.

![1732193777](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-11/0f4f8565-6427-498e-9bb8-d6b90664c5cb.png)

**Stage 1: Using OceanBase Migration Assessment (OMA), SIG conducted a thorough analysis of the original centralized database to identify incompatible functions and problematic SQL statements**. It encountered challenges, such as issues related to stored procedures and global unique IDs, in the assessment. SIG addressed the stored procedure issues by disabling stored procedures at the development level, and implemented a highly available distributed naming service based on Zookeeper for continuous ID generation.

**Stage 2: Based on experiences of peer companies and its specific business needs, SIG combed through key database SQL statements to determine the most cost-effective table schemas and partitioning methods**. It also investigated table associations and query conditions to determine partitioning keys and table groups. The distributed computing capabilities of OceanBase Database were leveraged to enhance performance and scalability in the case of massive data.

**Stage 3: Tables were partitioned as needed**. For example, tables with core data were partitioned for optimal performance and scalability, while tables with summary data were not partitioned to reduce costs and complexity. For tables with common basic data, their replicas were created in the new database by using OceanBase Migration Service (OMS) to support data queries. All the three types of tables are handled well in the final solution.

**Stage 4: SIG executed data migration**. OMS was used to establish batch and real-time synchronization channels, ensuring a smooth migration process.

**Yang noted that the distributed architecture of OceanBase Database ensured stability and scalability while improving resource utilization. The LSM-Tree-based data compression strategy helped SIG save over 50% on hardware costs. Additionally, the multitenancy feature significantly simplified database O&M.**

  

**4. Vision for the Future**
------------------

Seeing the unstoppable momentum of AI, Yang shared his thoughts on the trends of multi-model data integration and the integration of transaction processing (TP) and analytical processing (AP).

As business needs diversify and AI technologies advance, enterprises must handle increasingly diverse data types, including structured data (like core business data in a relational database), semi-structured data (like JSON and XML data), and unstructured data (like text, images, and videos). Multi-model data presents new challenges for the integration, storage, retrieval, and analysis of data.

To support such a wide range of data types, a conventional data management system requires multiple technology stacks, which increases operational costs and risks. **Yang expressed hope that OceanBase Database could provide scenario-specific multi-modal data integration capabilities, so that SIG could effectively integrate and analyze various types of data to help reduce costs, boost efficiency, and encourage business innovation**.

SIG's business requires TP and AP integration. Currently, SIG has deployed Oracle Exadata to support this need. However, as data management becomes more complex and its business grows, SIG is seeking more advanced and scalable China-developed alternatives. **If SIG achieves TP and AP integration based on OceanBase Database, it can simplify its IT infrastructure, reduce the total cost of ownership, and enhance business processing efficiency and data insights, thus addressing the changing landscape of data management and moving forward in technological innovation.**

![1732193848](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-11/0fb90b08-346b-4014-9c37-ccaf60b9d83a.png)

Acknowledgments: Yang Qinghua, head of the innovation and incubation team, Sunshine Digital Technology