---
slug: RAG-CUSRI
title: 'Implementing RAG: Application of OceanBase Database at CUSRI'
tags:
  - User Case
---

> This article is part of [Making Technology Visible | The OceanBase Preacher Program 2024], a technical writing contest. If you are a tech enthusiast, join us in this contest to bring code to life with your words while getting a chance to win a prize of CNY 10,000!  
>   
> Author: Qiu Yonggang, OceanBase R&D Lead at China Unicom Software Research Institute (CUSRI). He is in charge of the development, support, and O&M of Distributed China Unicom Database (CUDB), the proprietary relational distributed database of China Unicom.

Generative artificial intelligence (AI) technology has experienced rapid development in recent years, giving rise to large models such as ChatGPT by OpenAI, Qwen by Alibaba Cloud, and ERNIE Bot by Baidu. These models have garnered wide attention for their applications in natural language processing and conversational systems. However, despite their powerful reasoning capabilities, these models cannot directly handle enterprise-specific data and knowledge in real-world applications, limiting their scope of use. In this context, vector databases, as a core component of the Retrieval-Augmented Generation (RAG) architecture, have gradually demonstrated their indispensable capabilities.

The RAG architecture lifts the limitations of large language models (LLMs) in handling enterprise-specific data by combining pre-trained LLMs with real-time internal data of enterprises. Leveraging the powerful search capabilities of vector databases, developers can do real-time, accurate generation tasks based on enterprise data without the need to retrain models. In this article, I will share how China Unicom successfully implemented RAG in our real business scenarios using the vector search capabilities of OceanBase Database to help developers and database administrators (DBAs) perform database infrastructure-related queries and management more efficiently, thereby improving business response speed and accuracy.

Background and Challenges: RAG Applications at CUSRI
------------------

The database platform of CUSRI serves thousands of internal users across various domains from application development to O&M management. Managing such a vast and complex database ecosystem presents several long-standing challenges: the diversity of database types, significant version differences, high stability requirements for production systems, and inefficiencies caused by discrepancies between testing and production environments. In addition, the heavy workloads of daily database O&M make it hard to improve the system response speed.

Specifically, we needed to address the following major ones:

1\. **Management of multiple databases and versions**: China Unicom uses many database products, which necessitates frequent version updates and maintenance activities. Ensuring consistency across different versions and quickly locating the causes of issues became a major challenge in O&M.

2\. **Efficient management of the production environment and its discrepancies with the testing environment**: The stability of production systems is crucial. How to ensure their stability while quickly resolving their issues was a pressing concern. Additionally, discrepancies between the testing and production environments could lead to performance deviations or potential failures. Efficiently managing and balancing the two to enhance overall system reliability and response speed was key to improving database agility.

3\. **Improving productivity and responsiveness**: In the face of changing business needs, quickly obtaining necessary information in a complex and dynamic database environment and responding promptly became the core issue in enhancing database O&M efficiency.

To address these challenges, we developed an intelligent database expert ChatDBA based on the RAG architecture. By combining database expertise with our internal O&M data, ChatDBA allows developers and DBAs to query database status, troubleshoot issues, and obtain recommendations using natural language, thus substantially reducing repetitive tasks. This solution not only improves problem-solving efficiency but also allows the team to focus more on crucial tasks. The following figure illustrates the overall process of this solution.

![1733391747](/img/blogs/users/RAG-CUSRI/image/529053c3-7d69-433e-9238-f1ca5f303e00.png)

As shown in the figure, files about general and specialized database knowledge, both internal and external, are systematically organized and imported into a knowledge base. Then, files are sliced, converted into vectors by a vectorization embedding model, and stored in a vector database. This way, our LLM can use professional knowledge of DBAs to significantly improve the recall capability and accuracy when answering questions. On top of that, a RAG-based Q&A system is introduced to enhance the LLM's comprehension and communication capabilities for specific questions by retrieving data from external knowledge bases, thereby helping improve the text processing efficiency and quality to generate more accurate and richer text content. ChatDBA has access to extensive database knowledge and experience. It provides comprehensive, high-quality technical consultation services and solutions to database users and maintainers, making databases more accessible and improving database O&M efficiency.

Database Selection: Upgrade from a Dual-database Architecture to an Integrated Database
---------------------

Initially, we deployed a MySQL relational database for data storage and a Milvus vector database. Along with increasing data volumes and business requirements, we soon ran into two problems: the existing databases could not scale horizontally to handle more data, and maintaining two database systems was complicated.

So, we began searching for a database that supports both relational and vector data. During the selection process, we noticed that a lab release of OceanBase Database V4.x offered powerful vector search and hybrid query capabilities, which motivated us to evaluate the performance of dedicated vector databases, standalone databases, and distributed databases in handling vector data. Here are the comparison results:

<table>
    <tr>
        <th colspan="5">Comparison of vector databases for RAG applications</th>
    </tr>
    <tr>
        <td colspan="2">Key vector feature</td>
        <td>Dedicated vector database (Milvus)</td>
        <td>Standalone database capable of vector processing (PostgreSQL)</td>
        <td>Distributed database capable of vector processing (OceanBase Database)</td>
    </tr>
    <tr>
        <td rowspan="3">Vector processing capabilities and performance</td>
        <td>Vector query performance</td>
        <td>High. It is optimized for large-scale vector data processing.</td>
        <td>Medium. The performance depends on database scalability.</td>
        <td>High. It is optimized for massive data storage and queries and supports complex queries.</td>
    </tr>
    <tr>
        <td>Hybrid vector query</td>
        <td>It does not support hybrid queries with conventional databases.</td>
        <td>It supports basic vector queries but does not support complex hybrid queries.</td>
        <td>It supports hybrid queries of vectors, scalars, and other conventional data, and is suitable for complex fusion queries.</td>
    </tr>
    <tr>
        <td>Interface flexibility</td>
        <td>It supports SDKs, but does not support SQL.</td>
        <td>It supports SQL and uses plugins to handle vector queries.</td>
        <td>It supports both SQL and SDKs, offering more flexible interface options.</td>
    </tr>
    <tr>
        <td rowspan="3">Scalability and integration</td>
        <td>Scalability</td>
        <td>High. It can scale horizontally to handle more vector data.</td>
        <td>It provides limited scalability, which depends on the database performance.</td>
        <td>High. It supports distributed architectures and is capable of handling massive amounts of data.</td>
    </tr>
    <tr>
        <td>Integration with conventional data</td>
        <td>None. It can process only vector data.</td>
        <td>Strong. It can handle both relational and vector data.</td>
        <td>Strong. It is capable of handling hybrid queries of relational and vector data.</td>
    </tr>
    <tr>
        <td>Operation and maintenance complexity</td>
        <td>High. We must manage both vector and other databases.</td>
        <td>Average. Additional performance optimizations are required, and we need to manually implement hybrid queries of vector and structured data. The existing O&M systems can be reused.</td>
        <td>Low. Transaction processing (TP), analytical processing (AP), and AI workloads are handled within one database. Simplify the operational complexity brought by multiple databases</td>
    </tr>
    <tr>
        <td rowspan="2">High availability and disaster recovery</td>
        <td>High availability</td>
        <td>It supports disaster recovery and high availability, but must be deployed independently.</td>
        <td>It supports high availability, but its disaster recovery capabilities may not be as strong as expected.</td>
        <td>Strong. It can be deployed in standalone or distributed mode. It supports active-active/distributed disaster recovery strategies and automatic failover, and is suitable for scenarios with demanding business continuity requirements.</td>
    </tr>
    <tr>
        <td>Backup and recovery strategies</td>
        <td>It supports periodic full and incremental backups.</td>
        <td>It supports full and incremental backups.</td>
        <td>It supports full and incremental backups and recovers services immediately after a fault occurs.</td>
    </tr>
</table>
  

After a thorough comparison, we leaned towards an integrated solution based on OceanBase Database. This choice not only simplifies the technology stack but also offers significant advantages in performance, scalability, and ease of management. The tested version of OceanBase Database can process dense vectors with over 16,000 dimensions and calculate multiple types of vector distance, such as Manhattan distance, Euclidean distance, dot product, and cosine distance. It also allows us to create Hierarchical Navigable Small World (HNSW) indexes, perform incremental updates, and delete vectors, and supports hybrid filtering based on vectors, scalars, and semi-structured data. Within its native distributed architecture, these features make OceanBase Database an efficient all-in-one platform that is scalable and simplifies management.

![1733391787](/img/blogs/users/RAG-CUSRI/image/2bf08ce7-83af-42ac-80d0-0a479e65ca9a.png)

The testing and verification results indicated that the vector search capabilities of OceanBase Database fully met our needs, particularly in supporting ChatDBA. More importantly, those vector search capabilities are backed by a full-fledged product ecosystem, which further enhances its feasibility in real-world production environments. Compared with the open source version of Milvus, OceanBase Database demonstrates clear advantages:

1\. **Easy O&M**: The vector search capabilities of OceanBase Database are provided in OceanBase Cloud Platform (OCP), a dedicated O&M and management tool, which makes database O&M much easier. OCP also provides a suite of features, such as GUI-based fast deployment, hardware resource management, monitoring and alerting, and backup and recovery. Milvus, on the contrary, offers basic database features, lacks comprehensive O&M support, and has security vulnerabilities.

2\. **High availability and auto-scaling**: The vector search feature of OceanBase Database inherits the high availability of its native distributed architecture, which supports distributed deployment, auto-scaling, and automatic rapid recovery based on the Paxos protocol when a single node fails. In contrast, Milvus can be deployed only on a single server and lacks high availability and horizontal scalability, which is unacceptable in production environments.

3\. **Resource isolation based on multitenancy**: The vector search feature of OceanBase Database supports resource isolation between tenants. Combined with its high scalability, OceanBase Database provides us with a secure and flexible database-as-a-service (DBaaS) service. We can quickly create database instances using existing resource pools and adjust instance resources as needed. Milvus, on the other hand, lacks resource isolation capabilities, leading to a waste or a shortage of resources, especially when it is deployed on a physical server.

4\. **SQL support**: The vector search feature of OceanBase Database supports standard SQL operations. Developers can interact with the database using familiar client tools like DBeaver and Navicat. This makes the database more accessible and improves development efficiency. Milvus, however, does not support SQL. Developers can operate data only through APIs and scripts, which is less user-friendly.

5\. **Rapid migration**: We can use OceanBase Migration Service (OMS) to migrate data to a vector database based on OceanBase Database from a homogeneous or heterogeneous database, or the other way around. Using OMS, we successfully migrated test data from Milvus to OceanBase Database. Milvus itself does not support data migration, and we must rebuild data after a cross-environment migration, which is time-consuming and causes serious impacts on business operations.

In the performance test, we simulated the actual production scenarios, and created only one instance to cope with tasks that were previously handled by two database systems. Compared to the dual-database deployment, the test instance fully met our performance requirements with approximately 30% fewer resources while greatly reducing resource utilization. This translates to at least a 30% reduction in hardware resource costs. The following figure compares the performance of mainstream vector databases. We can see that OceanBase Database, represented by the VSAG curve, outperforms others. VSAG is a vector indexing algorithm jointly developed by OceanBase and Ant Group.

![1733391805](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-12/2188bef1-212f-4dfd-bc2c-6b58926b4924.png)

  

Results and Benefits: Building a RAG-based Modern Data Infrastructure
------------------

Given the testing and verification results, we decided to upgrade our MySQL + Milvus architecture to a modern solution and made necessary adaptations, which did not take too much effort. OceanBase Database is fully compatible with SQL syntax, so we modified nothing major except some configurations. We did not even replace the driver package. As for the Milvus vector database, we updated its dependency packages and adjusted database operation methods. Since OceanBase Database supports SQL operations on vector data, and our team was familiar with SQL syntax, the adaptation job was done quickly. We completed all adaptations in about one week and finished functionality verification in less than two weeks.

In early October 2024, when OceanBase Database V4.3.3, a stable version supporting vector search, was released, we initiated the upgrade of our production databases. Using OMS, we efficiently and smoothly migrated data from Milvus to OceanBase Database. After the upgrade, our two databases were merged into an integrated architecture, which reduced hardware resource usage by about 30% while fully meeting our business performance requirements. The native distributed architecture of OceanBase Database not only significantly improves system stability and minimizes the risk of single points of failure (SPOFs), but also provides scalability for future business growth. This upgrade simplifies the technology stack, alleviates the workload of our O&M team, and lays a flexible, reliable, and scalable technical foundation for long-term business development.

Summary
----

CUSRI upgraded the underlying architecture of ChatDBA to a modern solution based on RAG and OceanBase Database. Thanks to its extraordinary capabilities to handle relational and vector data, a single OceanBase cluster can meet our needs of processing multiple types of workloads and data. The hardware resource usage was reduced by about 30%, and with tools like OCP and OMS, O&M was greatly streamlined to improve team efficiency.

This project proved the importance of RAG-based vector search capabilities for building an efficient Q&A system. OceanBase Database, as an integrated database, not only supports multimodal data processing and multi-scenario integration but also excels in performance and stability. The new design simplifies the system architecture and provides robust technical support for more advanced business needs in the future, marking a key step in developing a unified, efficient, and intelligent database solution. Looking ahead, we plan to further expand the application of OceanBase Database, and streamline the technology stack and cut O&M costs through modern data architecture upgrades.