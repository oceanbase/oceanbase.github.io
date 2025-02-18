---
slug: Zhongyuan-Bank
title: 'Zhongyuan Bank‘s Practice: 70+ Tests Performed to Verify OceanBase Database, 30+ Systems Upgraded to New Database'
tags:
  - User Case
---

This article is a summary of Episode 15 of the DB Gurus Talks series.

Lyu Chunlei is a senior database expert, who has worked in the fields of traditional manufacturing and IT and Oracle Corporation before joining Zhongyuan Bank. His extensive experience in database O&M and management has played a crucial role as he led Zhongyuan Bank’s database team in upgrading from conventional databases to native distributed databases.

As a highly skilled database administrator (DBA), Mr. Lyu believes that one cannot build a successful DBA career without three decisive factors. First, a deep interest in database technology, which is the inexhaustible driving force that keeps DBAs moving forward. Second, a determination for constant learning, which is much like the hiking stick of a mountaineer, helping DBAs break through limitations. Finally, a deep sense of awe towards the production environment, which encourages a strong sense of responsibility.

These three factors have played an essential role in Lyu's work. Lyu was the chief technical expert who **led the project of upgrading Zhongyuan Bank's conventional database solution based on midrange servers to an OceanBase Database-powered architecture based on general servers. To date, over 30 systems have been deployed using the new architecture**. In Episode 15 of the DB Gurus Talks, Lyu shared how Zhongyuan Bank successfully upgraded its database system from a closed architecture to an open one.

![1735026880](/img/blogs/users/Zhongyuan-Bank/75a0cc1e-01fd-48de-8748-003138ff6498.png)

Zhongyuan, literally the central plain, is the birthplace of the Chinese nation and the economic hub of ancient China, boasting the glorious history of onetime capitals like Kaifeng, Luoyang, and Anyang, and is given a transcendent status in the country's civilization landscape.

Zhongyuan Bank was born on this land. **Founded in December 2014, this urban commercial bank headquartered in Henan Province was listed on the main board of the Hong Kong Stock Exchange in July 2017, and now has 18 branches, with total assets exceeding CNY 1.3 trillion, and a staff of nearly 20,000**.

At the end of 2021, Zhongyuan Bank officially launched its database upgrade project. So far, more than 30 application systems on MySQL and Oracle databases have been migrated to OceanBase Database. This project has played a key role in helping the bank gain insights into its customers, markets, and business to support daily operational and management decision-making.

  

**1. Pressing Need for Database Upgrade Amid Business Challenges**
--------------------

Zhongyuan Bank initially deployed most of its business systems on conventional centralized MySQL and Oracle databases, which had reliably supported the bank’s operations in the past. However, as the business of the banks grew, the transaction concurrency and data volumes of its systems increased, and its original databases could not be scaled out quickly to meet the performance and capacity demands, making it urgent for the bank to adopt a highly scalable high-performance database solution to sustain business growth.

Moreover, adhering to the bank’s digital transformation strategy, microservices and distributed architectures were adopted, with infrastructure software such as distributed middleware and analytical distributed databases deployed. The centralized databases for transactional systems had become the bottleneck of this transformation.

Cost considerations were another driving force for the database upgrade. The bank's previous information systems adopted midrange servers, centralized storage, and Oracle databases, leading to constantly high operational costs. In recent years, the bank needed to restructure some critical information systems to improve the overall processing capacity at reasonable infrastructure costs.

Additionally, databases are crucial pieces of infrastructure software. Zhongyuan Bank also needed to accelerate its transition to domestic databases while ensuring stable system operations, thereby increasing its control over IT infrastructure.

**Given the reasons above, Zhongyuan Bank initiated the selection of its next-generation database system in December 2020. Mr. Lyu, as the database team leader, was in charge of this task**.

Having years of experience in database operations, Lyu was clear about the challenges. Over the years, the bank has deployed a large number of systems with a wide variety of applications, including self-developed, third-party sourced, and customized systems. Many were provided by different vendors, which means significant variations in development practices and code quality, making the upgrade process highly complex.

"The bank has its development standards and requirements. However, the varying capabilities and code quality of the vendors result in quite complex system transformation and database upgrades. In particular, systems that depend heavily on Oracle database features may require the rewriting of many complex SQL statements. This is where strong support from the database vendors is needed," Lyu Chunlei explained.

To achieve sustainable business development, Zhongyuan Bank also needed to explore cost-effective solutions for those Oracle-dependent systems while ensuring their stability.

  

**2. Choice of OceanBase Database after Comprehensive Testing**
-------------------------------

In line with the Financial Application Specification of Distributed Database Technology—Technical Architecture, a standard released by the People’s Bank of China, and based on its own needs and peer experiences, Zhongyuan Bank determined its core requirements for database selection: high stability, high availability, scalability, maintainability, high performance, and compatibility, while considering overall costs, tools, platforms, and ecosystem development.

**"Stability and high availability are the two most important requirements for us. Stability is fundamental for financial services, especially in the case of failures, such as IDC or server failures. The system must provide a self-healing mechanism to minimize the impact on applications," Lyu noted.**

Scalability is another crucial feature. The database system must support node addition or removal while it is running to enhance its performance and capacity. Lyu explained that scalability was one of the primary reasons for considering distributed databases. Zhongyuan Bank's original Oracle Real Application Clusters (RAC) could be scaled out to increase storage and compute resources, but their "share-everything" architecture made it impossible to effectively improve the I/O capacity.

Adhering to the database selection requirements, the bank conducted a comprehensive proof of concept (POC) assessment of leading domestic database products to compare their basic capabilities, performance, high availability, maintainability, compatibility, and security, covering 79 test items. In this competitive assessment, OceanBase Database stood out for its excellent performance, high availability, and O&M efficiency, and eventually got the nod.

"OceanBase Database not only ticked all our boxes in terms of performance, high availability, and maintainability, it would also benefit us for a lower total cost of ownership. We decided to go with it based on an all-around evaluation," said Lyu.

Lyu also mentioned several other key features required by Zhongyuan Bank. For example, OceanBase Database is highly compatible with Oracle and MySQL and comes with an automatic migration tool that supports migration assessment and reverse synchronization. These features ensure data migration security and can support the upgrade of the bank's core business systems. Furthermore, OceanBase Database can be horizontally scaled out without affecting business applications, and its quasi-memory transaction processing architecture helps maintain high performance, allowing the bank to create a cluster with thousands of nodes and store trillions of rows in a single table.

  

**3. Successful Upgrade Guaranteed by Advanced Technologies**
-------------------------

Database selection was the first step in the upgrade project. The real challenges for the project team lay in data migration and business relaunch. Zhongyuan Bank formulated a detailed database migration plan, covering system selection, modification evaluation, code modification, testing, business relaunch, and post-migration review.

When it came to system selection, Lyu explained, "The more important an information system is, the higher the security risk it faces, and the more urgent the need for an upgrade to domestic technologies. **Therefore, we picked key business systems that handle highly concurrent requests, such as those involving online services and channel management**."

Then, the bank evaluated those systems meticulously, focusing on identifying and adapting Oracle-specific syntax. Using OceanBase Migration Assessment (OMA), the bank comprehensively analyzed and diagnosed the systems, scanning SQL syntax, table schemas, and database objects to accurately identify necessary modifications and streamline the modification process.

After the code modifications were completed, various tests and relaunch drills were performed repeatedly until the systems met requirements.

**The relaunch process was split into two stages: data migration and data verification**, which were completed using OceanBase Migration Service (OMS). This tool supports full and incremental migration, batch verification, and reverse writing, ensuring a smooth migration process.

"Every change in a financial system must be reversible, so the reverse writing feature is essential to us. OMS automatically converts data types and performs reverse writes, making the entire migration process seamless," said Lyu.

After the database system was upgraded, Lyu's team monitored and tracked the system performance to rule out possible unforeseen issues, such as performance fluctuations, despite extensive testing.

According to Lyu, OceanBase Cloud Platform (OCP), the official database management tool, made those tasks much easier. OCP throttled poorly performing SQL queries and allowed the team to adjust execution plans using hints, ensuring rapid recovery of information systems before they could drill down to the root cause of performance issues.

After an information system was relaunched based on OceanBase Database, Lyu's team would review the whole process, focusing on performance and resource usage before and after the relaunch, issues encountered during the process, how they were resolved, and whether to incorporate corresponding notes into standard operating procedures. The review was quite necessary. Lyu noted that unforeseen issues were likely despite meticulous preparations. With the strong support from the OceanBase delivery team, however, those issues were efficiently resolved.

Nonetheless, Lyu expressed his expectation that the bank’s database team could handle issues independently. "Our principle is to do our jobs with minimal assistance from outside and develop in-house O&M capabilities as soon as possible. This will allow us to truly have full control," he stressed.

  

**4. Significant Benefits from Two Years of Stable Operation**
----------------------

As of November 2022, the full stack of the OceanBase cluster created by the bank went live, and mobile banking services were relaunched in the new architecture. A variety of core systems such as credit and payment systems followed suit. Back then, the bank also organized a failover drill on a production cluster that had two IDCs in the same region.

So far, OceanBase, with its exceptional performance and stability, has supported over 30 of the bank's information systems. More than 80% of them are key business systems. This achievement not only showcased the bank's technical strength but also a strong testament to its commitment to digital transformation.

With the migration of more key business systems to OceanBase Database, the benefits have started to come in.

**First, performance**: The information systems have maintained their performance after the migration to OceanBase Database. "Given that the previous database systems ran on proprietary and expensive hardware, while the new architecture uses general servers, it is a significant improvement by maintaining the performance," Lyu explained.

**Second, costs**: Compared with the previous architecture comprising midrange servers, centralized storage, and Oracle databases, the new solution based on general servers offers great cost advantages. Optimal resource utilization has further reduced the costs. OceanBase Database supports quick scaling by flexibly reallocating resources from different pools, so the bank does not have to configure redundant hardware resources for critical systems.

**Third, operational efficiency**: The rich set of features provided by OCP has greatly improved the bank's O&M efficiency. For example, a failover between the primary and standby clusters in the same region can now be completed with a few clicks in just 6 seconds, which contrasts sharply with conventional centralized databases. OceanBase Database supports multitenancy, allowing tenants in MySQL and Oracle mode to coexist in a single cluster, and to be monitored and managed under unified standards.

**Fourth, stability**: OceanBase Database has operated smoothly since its launch. It quickly recovers from server failures, ensuring uninterrupted business continuity.

Looking back on the past few years, Lyu noted that his experience in database upgrades and O&M is invaluable. Amid the trend of IT infrastructure localization, Zhongyuan Bank will speed up its system upgrade significantly, and Lyu's valuable experience will be a great lubricant for this process.

Looking ahead, Lyu said that Zhongyuan Bank plans to migrate more systems to OceanBase Database. They are also exploring how to better utilize new features of OceanBase Database, such as hybrid transaction and analytical processing (HTAP), to extract more business value, including supporting lightweight AP tasks.

  

**5. Summary**
----------

We are now in an era of explosive growth of AI technologies, where data processing capabilities have become the core strength of enterprises. A new round of competition in the financial industry has already begun. Zhongyuan Bank, striving to become a top-tier urban commercial bank, has been advocating for a "data-driven culture". With the high-performance, high-stability OceanBase Database and its rich suite of ecosystem tools, Zhongyuan Bank is better equipped to pursue its business objectives, fulfill social responsibilities, and drive further high-quality business development.

  

* * *

Special thanks to Mr. Lin Chun for his support for this episode of DB Gurus Talks. Lin Chun is the chief database expert at the China Pacific Insurance (CPIC) Digital Intelligence Research Institute. He has extensive experience in upgrading and replacing core financial system databases. He was also the keynote speaker of Episode 3 of DB Gurus Talks. To learn more about CPIC’s database upgrade practice, see [Review on Core System Database Upgrade by CPIC Chief Database Expert](https://open.oceanbase.com/blog/8761673744).