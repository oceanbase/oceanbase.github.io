---
slug: SRCUB
title: 'SRCUB‘s Practice: An Upgrade to a Multi-Active Distributed Architecture with Stable Running of 49 Systems'
tags:
  - User Case
---


This article is a summary of Episode 12 of the DB Gurus Talks series.

Every product has its early adopters, and for OceanBase Database, Sichuan Rural Commercial United Bank (hereinafter referred to as SRCUB) was one of those early adopters. Formerly known as Sichuan Rural Credit Union, SRCUB underwent a restructuring in January 2024 with a registered capital of CNY 22 billion, making it the largest rural commercial bank in China. Back in 2018, SRCUB began its collaboration with the OceanBase team, a partnership that has since flourished, embodying the true essence of mutual growth and success.

In Episode 12 of DB Gurus Talks, we are honored to have Mr Gui Junhong, a senior engineer at the IT department of SRCUB, share the story of this fruitful partnership. With over a decade of experience in banking system development and architecture design, Gui has grown from a software engineer and has been instrumental in the bank's journey from selecting OceanBase Database to its full-scale implementation.

![1718330611](/img/blogs/users/SRCUB/image/1718330610803.png)

2018 marked a significant milestone in the 70-year history of Sichuan's rural credit system. It was the year SRCUB decided to pivot the architecture of its IT system towards a fully distributed one, laying the groundwork for selecting a distributed cloud platform and a distributed database system. Fast forward to July 2020, the "Shuxin Cloud" platform was officially launched. Built on OceanBase Database, this platform adopted a multi-active, modular architecture across multiple regions. Soon after that, systems for intelligent lending, open banking, smart counters, and intelligent marketing were migrated to the cloud.

Today, the platform supports the stable operation of 49 systems, providing robust support for SRCUB's mission to become a compliant, intelligent, and leading bank.

  

**1. Embracing a Fully Distributed Architecture**
----------------

By the end of 2023, SRCUB's total assets exceeded CNY 2 trillion, including its subsidiaries, making it the largest bank group in Sichuan by business scale, service coverage, employee count, and customer reach. The bank plays a crucial role in supporting local economic development and the "agriculture, rural areas, and farmers" ("three rural") policies.

However, SRCUB's legacy IT systems, built on IBM hosts, midrange servers, and databases like Oracle and DB2, were becoming increasingly inadequate. While IBM hosts were stable, their high maintenance costs, reliance on third-party technologies, lack of flexibility, and limited scalability were major drawbacks.

SRCUB is an inclusive financial institution that handles a high volume of small, frequent transactions. The peak transaction volumes can be at least twice the daily average. For example, the transaction volume will rocket during the Spring Festival, when migrant workers return home for a family reunion. And, with the rise of Internet finance, intelligent and open banking services have gained growing popularity. These new business modes are characterized by rapid system iteration and fast traffic change. They could experience unpredictable traffic spikes under the influence of user consumption habits, making it essential for the IT infrastructure to be both elastic and adaptable.

In response, SRCUB made a strategic decision in 2018 to transform its IT system to a distributed architecture, and OceanBase Database emerged as a key contender in their database selection process.

"Digital transformation is essentially about enabling the flow, integration, and optimization of data to unlock its full potential," explained Gui Junhong.

The choice of database was apparently critical to this transformation. As Gui noted, modern applications are no longer just about calling services between each other; they need to be seamlessly integrated with databases to maximize the support for business operations.

For example, SRCUB provides a smart small loan service that is greatly popular among farmers and herders. Today, they can apply for loans online to purchase yaks, fertilizer, and other supplies, with the entire process taking just minutes—a far cry from the 3 to 5 days it used to take. This efficiency is made possible by a robust database capable of handling intricate data integration processes.

While the legacy databases like Oracle, DB2, and Informix were stable on proprietary hardware, they were expensive to maintain and lacked the scalability needed to support the bank's rapid growth. Moreover, they failed to meet the bank's requirements for multi-active disaster recovery.

  

**2. Ensuring Data Security with a Multi-active Architecture**
---------------------

In SRCUB's transformation to a distributed architecture, disaster recovery was a top priority.

For financial institutions of SRCUB's scale, regulatory requirements mandate the establishment of remote disaster recovery centers. A common mode is the "2-3" mode, which involves deploying three IDCs across two regions. The three IDCs are a production IDC, a local disaster recovery IDC, and a remote disaster recovery IDC.

Given that many of its branches are located in earthquake-prone areas, the bank took an extra step by adopting an architecture in "3-4-5" mode: four IDCs with five nodes across three regions. This approach ensures city-level multi-active disaster recovery.

The distributed architecture of OceanBase Database was a perfect fit for SRCUB's requirements for a multi-active modular architecture. In a modular architecture, each module independently manages some services with minimal cross-module access, reducing latency while maintaining disaster recovery capabilities. This requires the underlying database to support data sharding strategies that ensure requests forwarded to a module are processed using data within that same module.

Gui said that SRCUB's transformation to a distributed architecture was further strengthened by the adoption of cloud-native technologies like microservices and containers, laying the foundation for modular deployment.

Beyond supporting the "3-4-5" mode, OceanBase Database offers several other advantages:

○   It has withstood years of overwhelming workloads in Alipay's core scenarios, demonstrating proven high availability, strong data consistency, and flexible scalability.

○   It supports multitenancy, which allows for on-demand resource allocation, simplifying O&M.

○   It is one of the top domestic distributed databases that are highly compatible with mainstream databases, particularly MySQL and Oracle.

○   It is entirely developed in-house, giving the vendor full control over its core expertise and source code, which greatly facilitates the database upgrade program of SRCUB.

  

**3. Building a Solid Data Foundation to Support ''Three Rural''**
-----------------

SRCUB selected OceanBase Database in 2019 and completed the OceanBase Database-powered "Shuxin Cloud" platform by the end of 2020. Then, the bank launched new projects on the platform while gradually migrating its systems to the platform.

So far, 49 systems have been migrated from conventional Oracle and DB2 databases and are running smoothly on OceanBase Database, including 6 core systems, 18 important systems, and 25 general systems. The bank began developing its distributed core system in early 2023, with completion expected by the end of 2024. This next-generation core system will also run on OceanBase Database.

![1718190591](/img/blogs/users/SRCUB/image/1718190590694.png)

The benefits of OceanBase Database are becoming increasingly evident as more business systems run on it.

First, the successful implementation of the multi-active architecture has remarkably improved the availability of SRCUB's IT systems. The database now achieves a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of under 8 seconds in the event of a disaster with zero data loss. This is critical for a bank located in an earthquake-prone region.

Second, the auto-scaling and rapid horizontal scaling features of OceanBase Database, combined with SRCUB's new cloud-native architecture, have given the bank greater flexibility in resource allocation. This allows SRCUB to easily handle traffic spikes during events like the Spring Festival and the "Double 11" shopping festival.

Gui shared that SRCUB has divided its data into 100 shards, each with 5 replicas. If any IDC or all IDCs in a region experience a failure, the business traffic can be quickly rerouted to other IDCs. Also, resources can be dynamically adjusted based on traffic to ensure uninterrupted business operations.

Third, the database O&M is more efficient and cost-effective. OceanBase Cloud Platform (OCP), an O&M tool specifically designed for OceanBase Database, has greatly enhanced the bank's ability to manage and maintain its databases.

Moreover, OceanBase Database is compatible with both x86 and ARM servers, laying a solid foundation for future upgrades of SRCUB's core systems based on general servers.

These benefits aren't just internal. They also translate to faster and more convenient services for SRCUB's customers. As mentioned earlier, the time it takes for farmers to secure small loans has been reduced from days to minutes, providing solid proof of great improvement in customer experience.

Next, SRCUB plans to continue optimizing its architecture, according to Gui. Currently, the bank uses a 5-replica deployment mode. As more systems come online, the high usage of bandwidth and server resources has become a growing concern. SRCUB is now adapting its disaster recovery requirements to fit different systems, aiming at further cost reduction.

As SRCUB continues to leverage OceanBase Database, its digital capabilities will only grow stronger, empowering the bank to seize new opportunities in the digital era and contribute even more to Sichuan's economic development.