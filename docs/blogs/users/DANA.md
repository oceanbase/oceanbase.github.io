---
slug: DANA
title: 'DANA Achieved Three Key Zero-Impact Goals with OceanBase Database'
tags:
  - User Case
---




![1720163744](/img/blogs/users/DANA/image/1720163744535.png)

Southeast Asia's mobile payment market is experiencing rapid growth. A report by Google, Temasek, and Bain & Company projects the burgeoning ASEAN mobile payment market to reach USD 2 trillion in transaction value by 2030.

With the vision of building a cashless society in Indonesia, the largest economy in Southeast Asia, DANA has grown over the past six years into one of the country's leading e-wallet and payment service providers, boasting nearly 200 million users.

A robust and scalable technical infrastructure was crucial to DANA's rapid growth. After evaluating several database solutions based on factors such as performance, product features, stability, and migration costs, DANA selected OceanBase Database to underpin its database infrastructure.

  

**1. DANA's Rise Fuels Explosion of Transaction Data**
------------------------

Founded in 2018, DANA is at the forefront of Indonesia's rapidly growing digital landscape. It quickly became one of the country's leading e-wallets and payment services. As of 2024, DANA boasts a massive user base of nearly 200 million and has become a ubiquitous digital payment service in Indonesia. Over the past two years, DANA has embarked on a journey of growth and transformation.

DANA's journey began with a vision: to create a cashless society in Indonesia and provide secure, reliable, and innovative financial services to the masses. To fulfill this vision, DANA has continuously expanded its service offerings, including fund transfers, credit card linking, and balance recharges, and led the way in integrating with the Quick Response Indonesian Standard (QRIS) code system, becoming the first e-wallet in Indonesia to enable QR code payments.

Due to its extensive service offerings, DANA processes billions of transactions each year, cementing its leadership in the domestic e-wallet market. However, the rapid growth of online transactions and merchant partnerships in early 2018 presented DANA with significant scalability and sustainability challenges. Its existing database proved insufficient for the increasing demands of the system, resulting in sluggish performance in areas such as transaction management, payment processing, billing, membership, and marketing.

DANA requires a robust database solution capable of maintaining stability and performance under high concurrency and unpredictable transaction patterns. The company also needs to address the risks of data loss and extended downtime, as well as navigate the complexities of a transition from an on-premises deployment to a hybrid cloud deployment.

DANA's Vice President of Technology Operations and Engineering, Zikry Zakiyulfuadi, stated: "Initially, DANA used a MySQL-compatible database. However, due to the rapid growth in online transactions and the number of partner merchants, the existing database for transaction management, payment, accounting, membership, and marketing systems had difficulty scaling elastically during peak hours. The system frequently hit capacity limits, driving DANA to seek a more robust database solution. "

  

**2. Embark on a Database Upgrade in Partnership with OceanBase Database**
------------------------------

OceanBase Database, under development since 2010, has a proven track record of handling the user and transaction volume growth driven by e-commerce, particularly demonstrated by its work with Alipay.

As a pioneer in China's mobile payment industry, Alipay was one of OceanBase Database's earliest adopters. Over more than a decade, OceanBase Database has been honed through rigorous use in Alipay's large-scale financial scenarios, and has successfully handled peak transaction query volumes of 61 million per second.

Its robust high availability and disaster recovery capabilities are ideally suited to address the challenges faced by DANA. Facing predictable traffic growth and the limitations of its existing MySQL database, DANA chose to partner with OceanBase Database in 2018 and began its database upgrade, drawing on OceanBase Database's proven success in supporting similar upgrades within the electronic payment industry.

OceanBase Database believes that database reliability and high availability are crucial for avoiding downtime and data loss. Performance is also crucial. OceanBase Database targets low latency and high throughput to deliver a seamless user experience. Zikry added: "OceanBase Database's distributed architecture allows DANA to seamlessly scale during peak business hours. This distributed architecture differs from that used in traditional banks or enterprises, which is typically primary-standby. OceanBase Database, however, employs an active-active architecture. "

This means that instead of a primary server handling all workloads, with standby servers activating only in the event of failure, an active-active high availability cluster distributes workloads evenly across all nodes, ensuring optimal load balancing.

  

**3. Achieve a Hybrid Cloud Deployment with Three Key Zero-Impact Goals**
-------------------------

When DANA began its migration from an on-premises architecture to a hybrid cloud architecture in 2019, OceanBase Database played a vital role in providing technical assistance.

DANA's CTO Norman Sasono attended OceanBase Database's first overseas technical summit last week. He shared: "During our collaboration with OceanBase Database, DANA gained a deeper understanding of distributed databases and greater familiarity with hybrid cloud architectures. The experience significantly enhanced the expertise of my team and myself. Working with OceanBase Database convinced us to create a modern, unified database to ensure our technology resilience and business growth. "

![1720164079](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-07/1720164080299.png)

Norman noted that, in DANA's experience, a fully on-premises or fully public cloud deployment was not optimal. While on-premises operation was more economical for regular workloads, they needed to migrate to the cloud during high-traffic peaks.

In 2019, DANA began deploying a hybrid cloud. Leveraging OceanBase Database, DANA achieved a seamless transition and gained elastic scalability. This flexibility is particularly valuable for easily shifting workloads to the public cloud to ensure high system availability.

OceanBase Database also provides backup capabilities. Thanks to OceanBase Database's multi-active architecture, DANA deployed a three-IDC hybrid cloud. This distributed architecture ensures continued operation even if one IDC experiences an outage. Owing to this robust infrastructure, in 2020, DANA achieved zero database failures and zero data loss, achieving a business system availability of over 99.99%.

Zikry added: "OceanBase Database can operate efficiently even in minimal environments, processing thousands of transactions per second. It seamlessly supports DANA's business growth, ensuring stable performance even during peak hours. OceanBase Database's scalability, coupled with an RTO of less than 8 seconds for disaster recovery and 24/7 global remote technical support, guarantees that DANA maintains high performance and reliability, even with significant transaction spikes. "

Furthermore, a key benefit of using OceanBase Database is that it enables DANA to achieve three critical zero-impact goals: zero downtime, zero data loss, and zero data inconsistency. Because each node holds a replica of the data, data loss is eliminated. Synchronization occurs within sub-milliseconds, ensuring extremely fast performance.

This stability and data integrity are crucial for fostering trust between users and merchants. Norman added that, given DANA's exponential year-over-year growth in online transactions and merchant partnerships, a scalable and sustainable database solution is essential.

  

**4. Gain Increasing Expertise in Understanding Overseas Users**
-------------------

DANA continues to see user growth. Zikry said DANA had approximately 150 million users at the end of 2023, and that number has now grown to approximately 180 million. This indicates considerable room for growth in Indonesia's digital technology market, given its population of over 200 million.

As a Chinese-developed database, OceanBase Database has been accelerating its international growth over the past few years. In overseas markets, it has prioritized industries with extensive practical experience, such as e-commerce, retail, logistics, and electronic payments, exporting both its technology and its practical expertise.

Globally, OceanBase Database has over 1,000 customers. In addition to DANA, OceanBase Database also powers the Philippine e-wallet GCash, the African e-wallet PalmPay, the Iraqi national credit card Qi Card, and many other financial institutions worldwide.

In the future, OceanBase will continue to empower DANA to ensure every payment counts, working together to provide more accessible financial services for the Indonesian people.

* * *

\*This article is adapted from TMTPOST.