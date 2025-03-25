---
slug: SAIC-Volkswagen
title: 'OceanBase Has Successfully Partnered with SAIC Volkswagen'
tags:
  - User Case
---



![1724923468](/img/blogs/users/SAIC-Volkswagen/image/1724923468990.png)

Recently, SAIC Volkswagen Automotive Co., Ltd. (hereinafter referred to as "SAIC Volkswagen") has migrated its core business systems, such as the bonus point and coupon system, to OceanBase Cloud, a native distributed database service. **The leading capabilities of OceanBase Cloud have helped achieve an 85% reduction in storage costs, increase business continuity to 99.999%, and improve query performance by five times, enhancing the data management capabilities of SAIC Volkswagen to better meet various user requirements.**

![1727344692](/img/blogs/users/SAIC-Volkswagen/image/1727344692079.png)

SAIC Volkswagen is one of the oldest automobile joint ventures in China. It produces and sells more than 30 models under the Volkswagen, Audi, and Skoda brands, covering a wide range of market segments such as A0 class, A class, B class, C class, sport utility vehicle (SUV), and multi-purpose vehicle (MPV). In the first quarter of 2024, SAIC Volkswagen sold 265,000 vehicles, a year-on-year increase of 11.4%, among which 28,000 new energy vehicles were sold with a year-on-year increase of 171.3%. The surge in data volume caused by rapid business growth poses the following challenges to the original open source databases used by the core business systems of SAIC Volkswagen:

- **High sharding workloads:** The original databases could not meet performance requirements and needed to be sharded. However, due to the large number of rows in a single table and the high data growth rate, the sharding solution was cost-ineffective and involved high risks, so SAIC Volkswagen turned to native distributed databases.

- **Scaling difficulties:** The CPU load of original databases continued to rise, making it difficult to add resources for business activities or perform online auto scaling in high-concurrency scenarios. This affected the user experience.

- **Query performance bottleneck:** As data volume was continuously increasing, the original databases experienced low performance in complex queries and, in some cases, failed to query reports, delaying the feedback on business operations.

In order to further enhance its operational capabilities, provide users with better car buying and using experience, and develop in the digital era, SAIC Volkswagen initiated a new round of database upgrades. After comprehensively evaluating database services based on their migration workloads, product capabilities, business flexibility, and best practices, SAIC Volkswagen finally chose OceanBase Cloud.

OceanBase Cloud is a cloud database service launched by OceanBase for users of all sizes. It provides multi-model, multi-tenant, and multi-workload capabilities, meeting 80% of data management needs with only one database. It also allows users in different regions to access high-quality enterprise-level database products and services, helping simplify the technology stack and build a modern data architecture.

**OceanBase Cloud is fully compatible with nearly all MySQL syntaxes and data types used by SAIC Volkswagen. With its traffic replay feature, OceanBase Cloud enhanced the efficiency of full regression testing, ensuring a fast, smooth, and stable business migration from original databases.** After the migration, the diverse requirements of core business systems were met, boosting efficiency at lower costs.

- **85% savings on storage costs and 15% reduction in total cost of ownership (TCO):** SAIC Volkswagen replaced dozens of original databases with only four OceanBase clusters to simplify the architecture, and utilized the multitenancy capability of OceanBase Cloud to consume resources and manage O&M in an efficient manner. In addition, the advanced compression technology developed based on the log-structured merge-tree (LSM-tree) architecture significantly reduced storage costs by 85% and TCO, including maintenance and operational costs, by 15%.

- **99.999% business continuity:** The cutting-edge automatic failover capability of OceanBase Cloud guarantees a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of less than 8 seconds, ensuring business continuity when an error occurs in server nodes, zone, or region, preventing costly and complex business failures and data losses. After the database upgrade, the bonus point and coupon system of SAIC Volkswagen achieved a business continuity of 99.999% to support 24/7 stable running of key business systems.

- **Query performance improved by five times:** The hybrid transaction/analytical processing (HTAP) capabilities of OceanBase Cloud freed SAIC Volkswagen from complex extract, transform, and load (ETL) operations and redundant data. Transaction processing (TP) and real-time analytic processing (AP) workloads were performed by using the same set of data while their servers were isolated from each other to avoid business interference and additional costs. The new bonus point and coupon system handles large data volumes and complex business logic, and delivers a five-fold improvement in query performance.

- **Support for auto scaling:** Native distributed databases support auto scaling and linear performance growth without stopping servers or modifying applications. This enables SAIC Volkswagen to add computing and storage resources as its business develops, without requiring sharding. The horizontal scaling expands business with low transformation workloads and easily copes with business requirements at all times.

SAIC Volkswagen always insists on innovative and market-oriented development to better satisfy users. SAIC Volkswagen has embarked on a new journey with OceanBase Cloud, elevating its data management capabilities to support diverse user needs. In the future, the two parties will collaborate to tackle more key business system challenges and ensure every drive counts.