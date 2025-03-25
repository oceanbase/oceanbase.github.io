---
slug: baicizhan-cto
title: 'Core Learning Record Database of Baicizhan Migrated to the Cloud Within Five Month, Saving 80% of Storage Space'
tags:
  - User Case
---

# Core Learning Record Database of Baicizhan Migrated to the Cloud Within Five Month, Saving 80% of Storage Space
This article is a summary of Episode 14 of the DB Gurus Talks series.

Baicizhan is an illustrated English learning app designed to make building vocabulary fun for people of all ages and proficiency levels. In the 14th episode of DB Gurus Talks, Mr. Jing Mi, CTO of Chengdu Chaoyouai Technology Co., Ltd. ("Chaoyouai" for short), was invited to share his insights.

Jing is a seasoned technical expert with extensive experience in distributed architectures and databases. He worked with big tech companies like Baidu and Xunlei before joining Chaoyouai. Years of complex software development have shaped his meticulous approach to testing and verification, which he has carried into his current job.

In this episode, Jing talked about how the careful selection, comprehensive testing, and thorough preparation ensured the smooth migration of a 30-node MySQL database to OceanBase Cloud.

![1728469648](/img/blogs/users/baicizhan-cto/image/1728469646994.png)

What's great about Baicizhan is that it uses image-based memorization techniques to make vocabulary building more engaging. The unique learning method has brought it the highest user activity over other foreign language learning apps.

Released in 2012, Baicizhan has amassed over 200 million users. For an app with such a huge user base, ensuring smooth user experience is no small feat. Baicizhan must not only guarantee 24/7 accessibility but also track every user interaction, from vocabulary book selections to learning progress and reviews. All such data is stored in the core learning record database.

**As the user base grew, the learning record database was expanded to 30 nodes**. By early 2024, the company decided to upgrade the database from MySQL to OceanBase Cloud, shrinking it to 3 nodes. This move not only saved 20% to 30% in costs but also eliminated the need for manual scaling, leading to a remarkable O&M efficiency boost and paving the way for further business innovation.

  

**1. Business Growth Putting Pressure on Scalability**
---------------------

Hosting the learning progress data of all users, the learning record database is the largest and one of the most important databases of Baicizhan. With the continuous influx of new users and the growing data volume, the company had to deploy more database nodes.

"Baicizhan was born in 2011. Given its internet-based services, we adopted the mainstream technology stack of the time. MySQL was the go-to choice for most internet companies, so we chose it for our learning record database," said Jing.

Jing Mi is a tech veteran who has worked on software development and architecture design at companies like Baidu and Xunlei. He joined Baicizhan in 2021, leading its technical operations, from infrastructure setup to cloud service optimization, and exploration of new technologies like AI and multi-infrastructure.

"We had to add database nodes one after another as the data volume grew. In the past two years, with the rise of e-learning, our core business grew rapidly, requiring 3 or 4 new nodes each year," he added.

**Baicizhan deployed its system on a public cloud, using the RDS for MySQL database service provided by the cloud vendor. The maximum storage capacity of a node was around 3 TB. When the data volume exceeded the capacity, it had to scale out the system**, which was quite straightforward for data of new users—simply routing it to new nodes. However, scaling was complicated for data of existing users, as it required re-sharding the archive data, a task that was done manually by database administrators (DBAs) based on their experience. Over time, more nodes were deployed, making that approach increasingly challenging.

First, ensuring the smooth operation of so many nodes without downtime was really hard. Despite robust cloud infrastructure, hardware or software issues could cause nodes to fail, disrupting business operations and putting immense pressure on system maintenance, disaster recovery, and backup.

Second, manual sharding incurred high labor costs. For example, DBAs must monitor which nodes were nearing their limits and quickly re-shard data before the nodes ran out of resources. This increased not only O&M costs, but also development costs, because developers must know which node stored the data required by the query.

Third, from a technical perspective, a true distributed solution would not require manually distributing data.

"Manual data distribution often leads to uneven node loads. For instance, new nodes typically handle data of new or highly active users, running under high loads. However, manual optimizations could hardly achieve dynamic load balancing, leading to uneven loads across nodes," explained Jing.

Furthermore, the large number of standalone RDS instances required numerous data transmission service (DTS) connections for data synchronization with the big data platform, resulting in complex O&M and high costs.

  

**2. Thorough Testing for a Stable Migration**
---------------

In July 2023, overwhelmed by the O&M pressure, Baicizhan decided to make a change. Jing Mi believed that adopting a distributed database would be an effective solution to move away from manual data distribution. During his time at Baidu, Jing participated in the development of a distributed database, now the open source Apache Doris. His deep expertise in distributed database technology made it clear that Baicizhan needed a reliable distributed database.

Jing revealed that the company had considered replacing the database during the online education boom a couple of years ago. However, the rapid business growth compelled them to handle more imperative tasks.

With many distributed database vendors in the market, choosing the right one was not easy. Baicizhan spent nearly two months on market research and product verification, engaging with several vendors before tentatively selecting OceanBase Cloud.

**"We chose OceanBase Cloud because it perfectly fits our needs. For example, its high data compression ratio and computing capabilities are well-suited to our applications. Plus, we can easily find many success stories that prove its benefits," said Jing.**

Another key factor in the decision was that the OceanBase team was highly cooperative and supportive during product verification, which made the communication smooth and efficient.

Baicizhan did not immediately start the migration. Instead, they spent nearly three months testing OceanBase Cloud before finalizing the selection. Jing emphasized that the testing was comprehensive, with test data reaching 1/10 of their total data volume to simulate real-world scenarios.

**"We set up a three-node cluster and tested its performance with terabytes of data in various scenarios, such as bulk writes, bulk reads, and fault recovery. For example, we simulated extreme conditions like shutting down a node or network interruptions to observe the results," said Jing.**

The testing also covered computing capabilities, APIs, and usability of the database. The thorough testing paid off as the actual migration process went smoothly. Starting in January 2024, Baicizhan migrated two nodes every two weeks, and then gradually increased the pace and completed the migration by the end of June.

"The migration process went smoothly, thanks to our exhaustive preparations and simulations. We also took the opportunity to streamline the codebase, which has been in use for over a decade," explained Jing.

  

**3. Immediate Cost Savings and Efficiency Gains**
-----------------

Running the learning record database on OceanBase Cloud, the benefits are remarkable.

**Streamlined architecture**. The new architecture consists of only 3 nodes instead of 30, and the data storage space required is reduced substantially. "OceanBase Cloud provides a high compression ratio. The data now occupies less than 1/5 of the original storage space," Jing noted.

**Lower costs**. With fewer nodes, database costs are slashed by 20-30%, even with considerable redundancy of computing and storage resources.

**Relieved workload**. DBAs no longer need to watch database metrics closely and hurry to scale the database as the resource usage approaches thresholds. When scaling the previous database system, DBAs must manually distribute data across nodes, which requires deep understanding of the business logic and extensive experience. Now, OceanBase Cloud automatically handles data sharding, leading to a significant improvement in O&M efficiency.

**Higher scalability. Storage space is no longer decided by the computing resource specification. Unlike an RDS for MySQL database with 30 CPU cores, an OceanBase cluster with the same core count can store up to 200 TB of data.**

Jing noted that the successful migration of the learning record database has facilitated their understanding of OceanBase Database and they have gained valuable experience for future database migrations. In fact, the company is now evaluating the feasibility of migrating other business databases, and OceanBase Database has become their top choice for new business designs.

  

**4. Summary**
----------

Currently, Baicizhan is exploring more features of OceanBase Cloud, such as AI and hybrid transaction and analytical processing (HTAP) capabilities, aiming to further empower its business. Freed from laborious O&M of conventional databases, DBAs are able to invest more time and energy in the explorations.

"Today, our business teams are expecting more from databases. DBAs should shift their focus toward business needs, and participate in data and system architecture design and data governance. By understanding the company’s strategies, DBAs can contribute to data planning, broaden their career prospects and enhance their competitiveness," Jing concluded.

* * *

**Mark Your Calendar!**
------------

The [2024 OceanBase Annual Conference](https://oceanbaseweb-pre.oceanbase.com/conference2024?activityCode=4923042&officerId=3881) will be open on October 23 at the Hyatt Regency Beijing Wangjing. Mr. Jing Mi, CTO of Baicizhan, will be there to share the best practices of OceanBase Cloud in Baicizhan's system. [Sign up now](https://oceanbaseweb-pre.oceanbase.com/conference2024?activityCode=4923042&officerId=3881) to join the event!