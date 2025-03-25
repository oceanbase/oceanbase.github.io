---
slug: ob-db-transform
title: 'OceanBase Helps Enterprises Cope with the Challenges of Database Transformation in the Deep Waters'
---

On November 16, 2023, OceanBase Database held its 2023 annual product launch in Beijing and officially announced its commitment to an integrated database product strategy for critical business workloads. At the event, Yang Zhifeng, general manager of the product department at OceanBase Database, delivered a keynote speech on helping enterprises navigate the challenges in a critical phase of database transformation.

  
![1701397534](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2023-12/1701397513558.png)

  
**Here is the complete speech.**  
  
Hello, everyone. My presentation today sits at a crucial juncture. I'll be covering three main areas: the challenges enterprises face as digital transformation enters a critical phase, how OceanBase Database is helping enterprises address these challenges, and how our products are solving practical problems for our customers. I hope to share my perspective, from a product standpoint, on OceanBase Database's journey over the past few years in facilitating core system upgrades, and the work we've done to help our customers navigate this complex landscape and achieve greater success.

  

**1. Challenges Faced by Enterprises in a Critical Phase of Digital Transformation**
---------------------

Let's begin by exploring the challenges enterprises face as core system upgrades enter a critical phase. I'll start by sharing some insights from the CCID Consulting report, "Core Database Upgrade and Selection Guide 2023".

In the first half of 2023, CCID Consulting conducted in-depth interviews with 160 enterprises. The research revealed several key findings: Firstly, among domestically-produced database products deployed by Chinese enterprises, OceanBase Database ranked first. Secondly, regarding core system upgrades, the surveyed enterprises prioritized stability, compatibility, and code reliability. Based on these criteria, CCID Consulting assessed several database products. OceanBase Database achieved the highest matching score of 36.5, positioning it as the top choice for future core system upgrades. Finally, when asked about their future database selection preferences, the surveyed enterprises ranked OceanBase Database as their preferred option for future database deployments.

![1701397692](/img/blogs/tech/ob-db-transform/image/1701397672185.png)

Why is OceanBase Database becoming the preferred database for core system upgrades? Its roots in core systems date back to 2014 when it was first deployed to power Alipay's core transaction processing. This high-volume financial environment demanded high concurrency and availability. Forged in this crucible of extreme requirements, OceanBase Database is now expanding to serve a broader range of customers.

Today, enterprises across diverse sectors are choosing OceanBase Database to underpin their core systems. We've identified several key technical routes driving these adoptions, particularly in core system upgrades:

### **Route 1: Smooth Migration from Oracle to OceanBase Database, with Zero Application Changes**

This route epitomizes smooth database upgrades. A large insurance group, for example, migrated over 300 Oracle databases to OceanBase Database in just a year, with new systems going live almost weekly. This rapid migration was a remarkable achievement made possible by close collaboration with the customer's exceptional technical team. OceanBase Database's seamless migration and Oracle compatibility preserved the company's existing software investment, requiring virtually no changes to tens of millions of lines of application code. This approach, which avoids the complexity and risk of simultaneous application and database modifications, proved far more efficient, reliable, and manageable.

![1701398009](/img/blogs/tech/ob-db-transform/image/1701397989150.png)

### **Route 2: Migration from DB2 to an Oracle Tenant of OceanBase Database, with Minimal Application Changes to Implement a Single-core Heterogeneous Architecture**

This route targets customers using DB2, particularly small- and medium-sized banks. Few commercially available products offer seamless migration from DB2. Oracle, offering comparable functionality to DB2 and superior capabilities to many open source alternatives, has been a common replacement. With OceanBase Database's Oracle compatibility mode, customers like Changshu Rural Commercial Bank can migrate their DB2-based midrange server applications to OceanBase Database with minimal code changes, replicating almost all of their existing functionality. Enabling Oracle compatibility features within DB2 can further streamline this process.

This migration approach allows for long-term two-way synchronization between OceanBase Database and DB2, enabling DB2 to serve as a standby database in the long run. OceanBase Database also supports diverse CPU architectures and in-house hardware within a single database, a capability we call "heterogeneous-hardware support."

![1701398126](/img/blogs/tech/ob-db-transform/image/1701398106532.png)

### **Route 3: Cloud + OceanBase Database + LDC-based Architecture**

This route is suitable for enterprises that want to significantly refactor their applications by using a logical data center (LDC)-based architecture while upgrading their core systems. If an enterprise is willing to invest in refactoring their applications, the LDC-based architecture can significantly reduce application failure rates and substantially improve overall application availability, delivering comprehensive benefits beyond the database layer.

The debit card system of a large state-owned bank provides a compelling case study. Originally running on a DB2 mainframe, the bank migrated its application to OceanBase Database and created over 100 isolated tenants in OceanBase Database. Each tenant housed a discrete application unit, mirroring the application's decomposition. This significantly reduced the overall failure rate. While a seamless upgrade was precluded by the legacy DB2 mainframe environment, the bank realized the benefits of this LDC-based approach. Throughout the migration, OceanBase Database delivered the necessary database capabilities, empowering the bank's modernization efforts.

![1701398230](/img/blogs/tech/ob-db-transform/image/1701398210021.png)

### **Route 4: Smooth Migration from MySQL to OceanBase Database**

This route is ideal for enterprises in the Internet and new retail industries. These enterprises, drawn to OceanBase Database's significant cost reduction capabilities, choose it for their core system migrations. For example, GCash consolidated over 240 MySQL databases onto just 16 OceanBase clusters, drastically simplifying the O&M workload of database administrators (DBAs). Furthermore, their data footprint shrunk from 5 TB to 500 GB, a 90% reduction, resulting in a 35% overall cost savings. Our analysis indicates that enterprises with MySQL deployments exceeding 32 cores can typically achieve cost savings of over 30% by migrating to OceanBase Database.

![1701398315](/img/blogs/tech/ob-db-transform/image/1701398294996.png)

  

**2. Enterprises of All Sizes Wade into a Critical Phase of Digital Transformation**
------------------------

In today's market, enterprises of all sizes, including the small- and medium-sized banks we're discussing today, are wading into a critical phase of digital transformation. Based on conversations with numerous customers, we've observed this critical phase generally consists of three stages:

![1701398389](/img/blogs/tech/ob-db-transform/image/1701398369362.png)

Begin with a pilot program focusing on non-critical business modules. Next, implement the upgrade in a core, but not business-critical, module, and expand the scope from simpler peripheral business modules to those of greater complexity. Finally, assuming success in the second phase, proceed with widespread deployment. Throughout this process, organizations of all sizes – from small enterprises to large organizations – are likely to face several common challenges:

(1) After expanding from peripheral to core systems, it becomes clear that database requirements differ. Core systems often demand robust analytical processing (AP) capabilities beyond simple key-value (KV) stores.

(2) As deployments scale, cost becomes a primary concern for small- and medium-sized enterprises. While large organizations may be less cost-sensitive, they prioritize efficient replication, guaranteed performance and stability, and demonstrable return on investment (ROI).

Over the past year, many OceanBase Database customers have progressed to the third phase. To address their evolving needs, we've focused on two key areas of product iteration, driving the evolution of OceanBase Database in these trends.

  

### **Trend 1: Enhanced Compatibility**

- #### **Continuously Improve Compatibility and Minimize Application Migration Costs**

OceanBase Database uniquely supports both MySQL and Oracle compatibility within a single cluster. Over the past three years, OceanBase Database has significantly matured its compatibility features, going beyond basic functionality and addressing nuanced details often overlooked. For instance, OceanBase Database supports the GB 18030-2022 character set, the latest mandatory national standard, in both MySQL and Oracle modes. Notably, OceanBase Database delivered Oracle-compatible support for GB 18030-2022 even before Oracle itself.

![1701398592](/img/blogs/tech/ob-db-transform/image/1701398571836.png)

OceanBase Database V4.0 introduces significantly enhanced DDL support. Leveraging our offline DDL framework, OceanBase Database now supports the full spectrum of DDL operations. Previously, DBAs had to re-import data if a component was incorrectly configured. Now, they can easily modify even complex table schema attributes like partitioning keys with a single DDL statement.

OceanBase Database will continue enhancing its MySQL compatibility, aiming to become a superior MySQL alternative. This provides customers with flexibility in choosing their preferred compatibility mode. For those who prefer MySQL mode, we are committed to bringing features from both our Oracle mode and years of OceanBase Database development into the MySQL experience. This effectively creates an "enhanced MySQL." For example, we've introduced DBLink functionality in MySQL mode, a feature familiar to Oracle users, further bridging the gap between the two ecosystems.

Other features, such as SQL Plan Management (SPM), are now also available in MySQL mode. Previously OceanBase Database-specific performance views, along with other capabilities, are now provided in both MySQL and Oracle modes. This is a natural progression, aiming to help our customers complete smooth application migration as they enter a critical phase of digital transformation. By offering feature parity, we simplify application migration and reduce the need for extensive adaptation and rewriting, which becomes increasingly challenging as the number of migrated applications grows.

  

- #### **Core Systems Require Databases to Handle Both Complex Transactions and Analytics**

This requirement for hybrid transactional/analytical processing (HTAP) often presents a compatibility challenge. While achieving syntactic compatibility with open source databases can be relatively straightforward, migrating core systems to these alternatives often reveals performance limitations, despite functional equivalence. Legacy databases like Oracle and DB2, initially designed without a strict separation between transactional processing (TP) and AP workloads, have fostered applications that rely on this unified HTAP capability at the core system level.

OceanBase Database V4.0 significantly enhances AP capabilities compared to version 3.0. This is evidenced by a 3.4x performance improvement in the TPC-DS benchmark, representing complex analytical workloads, and a 6x improvement in the TPC-H benchmark. Data import performance for both AP scenarios and core system migrations also sees a 6x increase.

Furthermore, OceanBase Database V4.0 provides robust data integration capabilities in both MySQL and Oracle modes. Data can be integrated via DBLink, enabling queries against other databases directly within the OceanBase Database engine, or through external tables, facilitating access to data stored in files. Both features are fully supported in the latest release of OceanBase Database.

![1701398809](/img/blogs/tech/ob-db-transform/image/1701398788515.png)

OceanBase Database has significantly enhanced its resource isolation capabilities for mixed HTAP workloads. The latest version offers improved resource isolation through cgroups, managing CPU, memory, and IOPS, and introduces fine-grained resource isolation at the SQL statement level.

Within a database, OceanBase Database can distinguish between batch processing applications and interactive applications. Dedicated resource groups can be assigned to batch processing applications, providing enhanced control. OceanBase Database supports resource grouping based on users, and its latest version allows binding specific SQL statements to resource groups, limiting their CPU and IOPS consumption. This granular control effectively addresses the challenges of managing mixed workloads in core systems.

  

- #### **Continuously Refine the Migration Strategy to Evolve from Data Migration to Architecture Integration**

For enhancing kernel functionality, roughly 50% of development effort is often dedicated to ensuring seamless migration during database upgrades. OceanBase Database, refined over a decade of real-world deployment in core systems, incorporates this expertise directly into its product and services. Through extensive customer engagements and practical experience, OceanBase Database has developed a comprehensive methodology for this critical process.

![1701398892](/img/blogs/tech/ob-db-transform/image/1701398871970.png)

Customers can use OceanBase Migration Assessment (OMA) in their existing environments to generate a comprehensive assessment report before migrating data, even without deploying OceanBase Database. This report details compatibility, identifies SQL statements requiring rewriting, and provides intelligent diagnostic recommendations, including table partitioning strategies for optimal performance.

Once ready to migrate, OceanBase Migration Service (OMS) facilitates seamless data transfer from Oracle, MySQL, PostgreSQL, DB2, or HBase to OceanBase Database. For example, a large insurance group, as mentioned above, leveraged OMS to migrate hundreds of terabytes of data from over 300 systems, showcasing OMS's proven migration capabilities.

After applications are switched over to the new OceanBase Database, OMS establishes a reverse synchronization link to the source database, enabling parallel operation for an extended period. Core systems, which often serve as intermediary data hubs, also need to synchronize data to downstream systems. To meet this end, OMS also supports data subscription.

Currently, OceanBase Database supports data synchronization with various cloud services like AnalyticDB for MySQL (ADB), Hologres, and MaxCompute through built-in integrations. Users can also use Kafka to compile a program to subscribe to messages for downstream data warehouse synchronization. Unlike Oracle, MySQL benefits from a rich ecosystem of tools. Therefore, rather than building bespoke integrations for each downstream target, OceanBase Database natively supports the MySQL binlog protocol. This allows existing MySQL data replication and synchronization tools to seamlessly integrate with OceanBase Database, fostering compatibility within the MySQL ecosystem.

### **Trend 2: Enhanced Stability**

Database users always prioritize stability and reliability. Over the past year, OceanBase Database has dedicated significant effort to enhancing stability. For example, instead of solely focusing on recovery time objective (RTO) and recovery point objective (RPO), we've prioritized ensuring the continuous operation of databases and applications, even in the most demanding scenarios. While this sounds straightforward, achieving such resilience requires meticulous attention to every technical detail.

![1701399063](/img/blogs/tech/ob-db-transform/image/1701399043319.png)

- #### **Enhanced Stability Ensures Business Continuity under More Demanding Conditions**

Firstly, OceanBase Database V4.0 redefines high availability with an RPO of 0 and an RTO of under 8 seconds. This significant improvement from a 30-second RTO was achieved through meticulous refinements, such as replacing the previous polling mechanism with cluster-wide broadcasts upon node failure. This ensures prompt notification of primary database switchovers to frontend applications.

Secondly, cross-region deployment significantly reduces network bandwidth consumption. While network bandwidth wasn't a major concern for us internally during Alipay's demanding database upgrades, we recognize that it can be a significant constraint for many external customers, particularly those with cross-region deployment. Over the past two to three years, OceanBase Database has prioritized addressing this challenge. OceanBase Database V4.0 reduces cross-replica network bandwidth consumption by 30% to 40%, with TPC-C workloads demonstrating a 30% reduction in storage bandwidth.

Thirdly, OceanBase Database offers a variety of flexible disaster recovery modes and comprehensive security enhancements. Regarding stability and reliability, I want to revisit Paxos, a fundamental yet crucial topic. While Paxos's three-replica architecture provides high availability, it also offers a significant, often overlooked benefit: tolerance to network jitter. Discussions about high availability must consider failure types. Clean failures, such as IDC outages, network disconnections, or fiber cuts, are relatively straightforward for distributed systems to handle. However, real-world scenarios often involve transient network issues like jitter. OceanBase Database, with its Paxos-based multi-replica architecture, is uniquely positioned to tolerate such disruptions.

  

- #### **Arbitration Service: Automatic Leader Election Improves Automatic Zone-disaster Recovery**

With the release of OceanBase Database V4.0, we've been highlighting a key new feature: the arbitration service. I'd like to take this opportunity to share how this feature can be utilized to enhance system stability. We've identified two key scenarios where the arbitration service can significantly improve the robustness of OceanBase Database deployments.

![1701399233](/img/blogs/tech/ob-db-transform/image/1701399212565.png)

The leftmost deployment in the preceding figure illustrates the traditional primary/standby database configuration. In this mode, the primary and secondary databases store two copies of data and require two sets of computing resources. Therefore, two sets of server resources are deployed. In addition, one bandwidth plan is required between the primary and standby databases, and all transactions write to a single copy of the data. In this scenario, a failure can lead to data loss, namely, the RPO is greater than 0.

OceanBase Database enhances the disaster recovery capabilities of this deployment with a three-node high availability solution. Previous versions of OceanBase Database referred to this as a "log replica." By employing a majority-vote mechanism across the three nodes, data loss is prevented even if a minority of nodes fail. This "data loss" doesn't refer to the loss of uncommitted transactions, but rather the potential loss of committed data that would occur in a traditional primary/standby failover. OceanBase Database introduced a unique design in earlier versions where, despite maintaining three log copies, only two copies of the data were stored, as shown in the middle of the preceding figure.

This approach, however, presents a bandwidth challenge. Data effectively occupies twice the network capacity, which can impact stability, especially in bandwidth-constrained environments.

To address this, we've introduced an arbitration service in OceanBase Database. Think of it as an enhanced version of the log replica marked in green in the figure. When a transaction is committed, OceanBase Database does not write the transaction log to the arbitration service, meaning data is not synchronized to the arbitration replica. However, Paxos logs are synchronized to the arbitration replica, allowing the arbitration service to participate in distributed leader elections based on Paxos. This ensures strong consistency (RPO=0) and high availability at a lower cost by requiring only one bandwidth plan between the leader and followers. This reduction in bandwidth not only improves cost-efficiency but, crucially, enhances stability.

  

- #### **Arbitration Service: Reduce Cross-region Bandwidth Consumption to Enhance the Stability of Three IDCs across Two Regions**

The arbitration service also enhances the stability of three IDCs across two regions by reducing cross-region bandwidth consumption.

![1701399577](/img/blogs/tech/ob-db-transform/image/1701399556978.png)

Consider a traditional two-region, three-IDC deployment, as illustrated on the leftmost of the preceding figure. If the primary region fails, switching to a standby database in the standby region inevitably results in data loss, the extent of which is unpredictable. This poses a significant challenge.

With OceanBase Database's two-region, three-IDC, five-replica deployment, a standby IDC automatically takes over if the primary IDC fails, ensuring no data loss and eliminating the need for data correction. However, while this maintains business continuity, it can lead to performance degradation. The remaining three replicas, along with the remote replicas, form a majority, requiring all writes to go across regions, impacting overall stability.

Introducing the arbitration service addresses this issue. OceanBase Database converts the remote replicas into arbitration nodes. Upon primary IDC failure, the secondary IDC, with the participation of the arbitration replicas, transitions from a five-replica to a three-replica configuration. This facilitates rapid recovery without performance degradation.

  

**3. Empower Customers with Practical Solutions**
-----------------------

### **(1) Comprehensive Management Tools for Uninterrupted Core System Availability**

Beyond the features discussed, we'll now address a key concern for DBAs: the management tools OceanBase Database provides to help customers tackle real-world challenges.

![1701399780](/img/blogs/tech/ob-db-transform/image/1701399759969.png)

First, planned O&M operations. These include scaling and rolling upgrades. For instance, if a server malfunctions, OceanBase Database can automatically replace it using its management platform, OceanBase Cloud Platform (OCP). These capabilities have been integral to OceanBase Database for a considerable time.

Second, automated failure handling. Before OceanBase Database's distributed architecture, DBAs often had to handle failures, such as primary or standby database outages, during off-hours, sometimes with response times as tight as 10 minutes. OceanBase Database's automated failover capabilities have significantly reduced this burden. In the vast majority of failure scenarios, DBA intervention is unnecessary. Even in less common outages, the system typically recovers automatically within 8 seconds. This demonstrates how distributed technology drastically improves distributed disaster recovery capabilities.

How does OceanBase Database, as a native distributed database, differ from databases that implement distributed transactions on top of sharding? Consider the classic two-phase commit problem: if the coordinator fails, distributed transactions can become blocked, as dictated by the protocol itself. OceanBase Database addresses this issue fundamentally. Because OceanBase Database participants are highly available, maintained by a three-replica architecture, they do not lose their state. This inherent high availability allows OceanBase Database to effectively eliminate a phase from the traditional two-phase commit process. This not only improves performance but also prevents suspended transactions, significantly reducing the operational burden on DBAs.

Third, emergency response. OceanBase Database provides built-in emergency measures that can be manually triggered at the database kernel level. These include operations like follower-to-leader switchover and SQL throttling, such as limiting QPS per statement. While the effective use of these features relies on DBA experience, OceanBase Database offers a new product, OceanBase Autonomy Service (OAS), to simplify this process. OAS encapsulates the best practices gleaned from numerous core system upgrades, automating and streamlining many emergency procedures.

  

### **(2) OAS: Ensure Core System Stability**

OAS is an autonomous service provided by OceanBase Database. It leverages data collection and analysis, combined with expert knowledge. Honed through extensive experience with numerous customer core systems, OAS incorporates best practices and solutions derived from real-world DBA operational management and customer scenarios. These accumulated experiences are then formalized and integrated into the OAS product. OceanBase Database currently offers two ways to access these features.

First, users of the latest OCP version can find them within the new Diagnostics Center, which includes updated functionality for resource management, monitoring and alerting, backup and restore, and session diagnostics. Second, for users of earlier OCP versions, OceanBase Database provides a standalone package containing these features, eliminating the need to upgrade to the latest OCP version.

Internally, OCP monitors for anomalous events and rule violations. When detected, these trigger automated operational responses and self-healing actions. OceanBase Database has also incorporated new features for capacity planning and real-time SQL diagnostics.

![1701399870](/img/blogs/tech/ob-db-transform/image/1701399849562.png)

"Passion makes the years fly by" is a favorite motto of our founder, Yang Zhenkun, and one that resonates deeply with me. Thirteen years ago, we began as a small internal project with the simple goal of using technology to simplify the management and use of massive datasets. With the help and support of thousands of customers, OceanBase Database has evolved from version 1.x to 4.x, progressing from a native distributed architecture to an integrated architecture supporting both standalone and distributed deployments. Looking ahead, we are committed to partnering with even more customers to build truly practical and user-friendly solutions for critical business workloads, providing a robust database foundation for upgrading core systems.

Let me share a brief story. During the development of OceanBase Database V1.0, even with numerous ongoing tasks, our founder, Yang, insisted we pause everything and spend over a month refactoring our entire codebase to meticulously check every C++ return value. This commitment to quality is reflected in our open source code today. We encourage you to explore the OceanBase Database code and report any unchecked return values as bugs. This dedication to building a robust and reliable product is a responsibility we take seriously, both for the long-term success of OceanBase Database and for our customers. That's all my presentation. Thanks for your attention.