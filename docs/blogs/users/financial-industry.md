---
slug: financial-industry
title: 'Case Study of Selecting OceanBase Database in the Financial Industry'
tags:
  - User Case
---

The application of OceanBase Database in the financial industry has yielded remarkable results. OceanBase Database, as a distributed database, has proven its value in meeting stringent requirements for high availability, low latency, high throughput, and data consistency. This article describes some real-world case studies that illustrate the selection and implementation outcomes of OceanBase Database in the financial industry.

  

**1. Background and Requirements**

The unique characteristics of the financial industry dictate its rigorous requirements for database systems in the following aspects:

1) High concurrency and throughput: Financial systems, especially in banking and securities markets, face millions of transaction requests or even a hundred times more on a daily basis. Databases must be capable of handling extremely high concurrent loads.

2) High availability: Financial operations cannot afford downtime. Any instance of database unavailability can lead to financial losses and customer attrition. Robust disaster recovery and fault tolerance mechanisms are critical.

3) Data consistency: Financial transactions require strong data consistency. Any data inconsistency can jeopardize the accuracy of transactions and the flow of funds.

4) Compliance and security: The financial industry is subject to strict regulations on data privacy and security, and databases must comply with national and industry standards.

OceanBase Database intrinsically excels in these aspects, thanks to its powerful distributed architecture, which supports horizontal scaling, distributed transactions, and strong consistency.

  

**2. Case Studies of OceanBase Database in the Financial Industry**

**1) Migration of a core banking system**

A large state-owned commercial bank previously relied on conventional relational databases like Oracle. However, as it served more customers, the transaction volume surged, leading to several critical issues:

- Performance bottlenecks: The legacy database system struggled to handle highly concurrent requests and massive data volumes, leading to prolonged response time and decreased throughput, especially during peak transaction hours.

- Availability concerns: The legacy database system lacked flexible disaster recovery and high availability mechanisms. In particular, it did not support disaster recovery across multiple IDCs.

- High costs: The legacy database system incurred high hardware and software maintenance costs and could hardly be scaled, resulting in escalating O&M expenses.

To address those issues, the bank decided to upgrade its core database system and ultimately chose OceanBase Database after rounds of assessment.

![1735288135](/img/blogs/users/financial-industry/image/6d50ec91-84e5-4364-a330-a01a028894cb.png)

**Key points of the upgrade process:**

- Distributed architecture: OceanBase Database's distributed architecture is highly scalable. The bank can effortlessly add storage and computing nodes to horizontally scale OceanBase Database without disrupting operations, meeting its needs for high concurrency and throughput.

- Distributed transactions: OceanBase Database ensures strong consistency of transaction data even under high concurrency, which is crucial for financial business.

- High availability design: OceanBase Database supports multi-IDC deployment, which provides data backups across different regions. In the event of an IDC failure, the system swiftly switches services to another IDC to ensure uninterrupted business operations.

- Data security and compliance: OceanBase Database provides built-in encryption, auditing, and authorization mechanisms, helping the bank meet regulatory requirements and safeguard customer data.

**Outcomes:**

- Performance boost: The bank's transaction processing capacity has been improved substantially. OceanBase Database has demonstrated its robust throughput performance, handling millions of transactions stably during peak hours.

- Cost reduction: Thanks to the distributed architecture of OceanBase Database, the bank can flexibly scale resources as needed, resulting in lower hardware and software procurement and maintenance costs compared to conventional standalone databases.

- High availability assurance: The bank has achieved uninterrupted service availability. The new solution prevents transaction disruptions caused by database failures and enhances customer satisfaction and system stability.

**2) Upgrade of a securities trading platform**

A well-known securities company deployed a conventional relational database for its trading platform. As the market demand and transaction volume grew, the platform encountered the following issues:

- High database latency: The platform handled highly frequent transactions, and the database latency became a bottleneck, leading to poor user experience.

- Poor scalability: The conventional database provided limited horizontal scalability and struggled to keep up with the rapidly expanding trading business.

- Unstable performance during peak hours: During periods of high market volatility, the conventional database struggled to process surging real-time transaction requests, leading to system overloads, performance degradation, and service interruptions.

To enhance the performance and stability of its trading platform, the securities company decided to replace the conventional database with OceanBase Database.

![1735288234](/img/blogs/users/financial-industry/image/0f00cc51-e929-44ea-94f7-e66d894f0e54.png)

**Key points of the upgrade process:**

- Advantages of a distributed architecture: OceanBase Database can be deployed in a distributed architecture, which allows the company to scale database resources horizontally to tackle millions of transaction requests per second and ensure stable operation even during peak hours.

- High concurrency processing capacity: OceanBase Database is optimized to meet the requirements for high concurrency and low latency of financial applications. Its in-memory storage engine and distributed transaction management capability can significantly improve the processing efficiency of real-time transactions.

- Multi-IDC deployment: OceanBase Database can be deployed across multiple IDCs. If one IDC fails, another IDC can take over the services. This guarantees the high availability of the trading platform.

- Data consistency assurance: OceanBase Database provides distributed transaction management features to ensure data consistency across different database nodes, preventing issues like fund errors during transactions.

**Outcomes:**

- Enhanced system performance: The trading platform's response time has dropped dramatically. It processes order and transaction requests faster and improves user experience greatly.

- High availability: OceanBase Database provides high availability by eliminating single points of failure (SPOFs). It ensures stable platform operation during peak hours and maintains transaction continuity.

- Flexible scaling: The company can now scale resources flexibly in response to market demands without being restricted by the limitations of conventional databases.


**3) Migration of an insurance data platform**

A large insurance company faced limitations of its conventional database architecture, which resulted in performance and scalability bottlenecks of its data platform, particularly when handling massive volumes of insurance policy and claims data. As the company's business kept growing, its database system incurred increasingly high maintenance and scaling costs.

**Key points of the upgrade process:**

- Data migration and compatibility: OceanBase Database is compatible with conventional databases like Oracle. It ensures smooth migration and minimizes risks and business interruptions during migration.

- Horizontal scaling: Thanks to the distributed architecture of OceanBase Database, the insurance company can scale data storage and computing resources as needed to support the processing and queries of massive amounts of data.

- Data security and compliance: Data privacy and security are paramount in the insurance industry. OceanBase Database provides robust encryption, auditing, and authorization features to help the insurance company meet regulatory requirements.

![1735288370](/img/blogs/users/financial-industry/image/a0a8a543-ebd5-4645-95b7-a8535b0fb6ef.png)

**Outcomes:**

- Performance optimization: The data processing efficiency and query speed have been improved significantly, enabling the insurance company to handle claims and customer information more effectively.

- Simplified O&M: OceanBase Database provides automatic O&M and auto-scaling capabilities, which greatly reduce the complexity and costs of database O&M.

**3. Summary**

These cases demonstrate that OceanBase Database is capable of handling massive amounts of data, highly concurrent requests, and complex transactions. It is particularly well-suited for financial systems that require high availability, low latency, high throughput, and strong data consistency. OceanBase Database effectively addresses the pain points of conventional databases in terms of performance, scalability, and O&M, helping financial institutions, be it a bank, a securities company, or an insurance company, enhance the stability, performance, and security of their business systems while reducing costs and achieve successful digital transformation.

As more financial institutions are seeking digitization and intelligentization solutions, OceanBase Database, an innovative database system developed in-house, is poised to see even broader adoption in more financial scenarios.