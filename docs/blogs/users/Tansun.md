---
slug: Tansun
title: 'OceanBase & Tansun Technology Unveil a Joint Solution with a Next-gen Credit Card Core System to Provide Innovative Vitality and Data-driven Support for Steady Growth of Credit Card Business'
tags:
  - User Case
---


In 1985, Bank of China (BOC) issued the first RMB credit card in China. After more than 30 years of development, credit cards have become popular among the general public from being held by a few elites. According to data from the People's Bank of China (PBC), as of the end of the first quarter of 2022, each person in China held an average of 0.57 credit cards and combined credit and debit cards.

  

However, as the growth rate driven by traffic dividends slows down and several new regulations concerning the standardized development of the credit card industry have officially come into effect, the once booming credit card business is entering the "existing-customer-focused era." According to the financial reports of major banks in the first half of 2022, it is obvious that the relevant data of credit card business, such as the number of issued cards, loan balances, and transaction amounts, have all shown weak growth.

  

In the "existing-customer-focused era", the growth logic of credit card business is changing. As a financial product with both payment and loan features, credit cards are always in the vanguard of retail banking. To discover new opportunities in this era, credit card business needs to shift its focus from products to customers and upgrade from digitalization and dataization to intelligence. This transition requires strong support from the underlying system.

  

OceanBase Database, a completely self-developed native distributed database service, has teamed up with Tansun Technology, a leading IT solution service provider in the domestic financial industry, to launch a "joint solution with a next-generation credit card core system." The joint solution uses the next-generation credit card core system CreditX of Tansun Technology at the business application layer, and uses an integrated architecture of microservices, container clouds, and native distributed database service OceanBase Database at the platform support layer. This provides innovative vitality and data-driven support for steady growth of credit card business.

  

![](/img/blogs/users/Tansun/image/0cd27c95-858d-4efb-b03e-e8af26996aa5.png)

_Architecure of the "joint solution for credit cards"_

  

CreditX organically integrates retail financial services such as credit cards and consumer loans in the business model, supports real-time posting of financial transactions without delays, and processes data at the transaction level. It provides a "customer-centric" view to manage the entire lifecycle of customers, a customizable mesh credit limit management system, a flexible and powerful parameter system, and comprehensive pricing capabilities for various customers. These features effectively support banks in managing and innovating next-generation credit card business.

  

The integrated architecture at the platform support layer realizes unlimited elastic scalability of the banking system, supports hundreds of millions of accounts and daily processing of hundreds of millions of transactions, and supports multi-active deployment of applications and databases, such as three IDCs across two regions, five IDCs across three regions, local active-active disaster recovery, and active geo-redundancy. This greatly improves the disaster recovery capability of the credit card system.

  

As shown in the figure below, the joint solution has eight major business innovations, including transaction-oriented interest calculation, real-time transaction posting, integration of multiple business models, and multi-dimensional accounting processing, as well as eight major technical innovations, including auto scaling, true data consistency, unitized deployment, and agile iteration.

![](/img/blogs/users/Tansun/image/7834b4f1-580f-40c1-9841-a252e7141c09.png)


**Transaction-oriented interest calculation**

  

Due to the unique nature of credit card business, interest processing is especially complex and critical and is involved in all stages of credit card transactions, including debit transactions, credit transactions, and full repayments. However, under the balance-based interest calculation mechanism of the traditional credit card system, the correlation between balances and transactions is missing. In this case, the entire interest processing only reflects the results instead of the process, which poses a great challenge to customer service. At the same time, the balance-based interest calculation mechanism calculates interests in an inaccurate manner, which also restricts the fine-grained accounting of banks.

  

To handle the preceding pain points of the balance-based interest calculation mechanism, Tansun Technology pioneers an innovative reform in the industry by adopting a transaction unit-based interest calculation mechanism. Under the new mechanism, a transaction unit is formed for each transaction, with interest calculated independently within the unit. The final interest is determined based on the relationships between different transaction units. Unlike the conventional balance-based mechanism, the transaction unit-based mechanism processes interest calculation at transaction level, which accurately reflects the interest calculation of each transaction. It also supports dynamic interest calculation and determines the final interest based on the transaction behaviors of customers, providing strong support for joining the complex and changeable competition in the future market.

  

  

  

**Real-time transaction posting**

  

In the traditional dual-message processing mode of credit cards, a transaction is considered complete in the system backend only after it is authorized and posted. However, there is a natural time difference between the authorization and posting of a transaction, which is calculated in days. With the development of credit card business, more derivatives are involved in transaction posting, including more types of credit limits and more rights and interests. Cardholders also have higher requirements for the timeliness of transaction posting.

  

The transaction posting of credit cards is complex. Therefore, to authorize and post a transaction at the same time, the system must respond quickly and provide high processing performance. Tansun Technology is the first in the industry to innovatively adopt a real-time balance-based mechanism, in which single-message transactions of credit cards are truly posted in real time. This mechanism uses real-time balances as a bridge to connect the authorization and posting processes. When a transaction is authorized, the balance is updated in real time and the credit limit is accurately restored, and the subsequent complex accounting processing is asynchronously processed based on the posting result of the real-time balance. This way, real-time posting can be achieved with timely and high-performance transaction authorization.

  

  

  

**Auto scaling**

  

The upgrade and transformation of credit card business requires both agility and business continuity. To ensure business continuity, CreditX is deeply adapted to OceanBase Database, which allows the system to scale without limits.

  

In the traditional IT architecture, databases often become a scalability bottleneck. However, by integrating with native distributed databases, the credit card system can use one set of code to support both sharding and partitioning database architectures. This provides a stable, reliable, cost-effective, and efficient database solution for application development. For the capacity, OceanBase Database supports the following three scaling methods. Theoretically, the capacity is unlimited.

  

**Scaling based on existing server resources, which allows databases to stagger resource utilization.** This is the most common method used by small and medium-sized banks, in which existing resources can be allocated based on business requirements. For example, the ratio of resources used for trading and analysis can be 9:1 during the day and 4:6 at night. The existing server resources are like a piece of cake, which can be dynamically allocated between different databases and different services to shift loads for resource utilization.

  

![](/img/blogs/users/Tansun/image/7eaa09e1-7728-435e-8b13-307d5f77efdd.png)

  

**Vertical scaling, which allows the dynamic increase or decrease of server resources in existing IDCs.** For large-scale promotional activities and marketing activities, you can estimate the required resource capacity of the system in advance and adjust the number of server resources accordingly. Distributed databases support smooth and seamless scaling.

  

**Horizontal scaling, which allows the increase of IDCs to scale out resources.** To support horizontal scaling, a distributed database must be a cluster deployed among multiple IDCs where the number of replicas for a tenant or the database can be specified.

  

  

  

  

**True data consistency**

  

CreditX uses advanced methods to manage data throughout the entire lifecycle from data generation to the final state of the transaction process, and data in the lifecycle is fully preserved. OceanBase Database has the following five unique lines of defense to ensure data consistency, which prevent data loss and confusion by detecting and resisting data issues such as silent disk errors and hard disk firmware damages.

  

![](/img/blogs/users/Tansun/image/af22497b-a464-40ed-baad-60788eac9e51.png)

  

The Paxos consistency protocol serves as the first line of defense. It ensures not only data consistency during transactions, but also seamless switching of database write points among multiple replicas.

  

The verification of data consistency among multiple replicas within the cluster serves as the second line of defense. It supports hybrid deployment of replicas with heterogeneous chips within the cluster for rigorous canary releases and the long-term running of the replicas.

  

The verification of data consistency between primary and standby clusters serves as the third line of defense. It supports hybrid deployment of primary and standby clusters with heterogeneous chips for rigorous canary releases of the chips and the operating system, as well as the long-term running of the clusters.

  

The chained checksum technology serves as the fourth line of defense. It supports both binary and columnar checks on the checksums of data blocks, table partitions, and indexes. Any tampering of bytes can be detected.

  

The periodic scanning of cold data serves as the fifth line of defense. It effectively detects silent disk errors to prevent data loss, proving that advanced technology makes data reliable.

  

Currently, this joint solution has been put into practice in many leading banks. For example, a large state-owned bank has used this joint solution to migrate the hosts of the credit card core system from a mainframe to a distributed architecture. This reconstruction project reduced the yearly system O&M costs by 75% and cut the batch processing time by more than 50% for the bank. As builders of the system supporting credit card business, OceanBase and Tansun Technology will continue to go deep into the front line, improve technologies, products, and services, and work together to provide customers with more valuable overall solutions.

  

Follow us in the [OceanBase community](https://open.oceanbase.com/blog). We aspire to regularly contribute technical information so that we can all move forward together.

  

Search DingTalk group 33254054 or scan the QR code below to join the OceanBase technical Q&A group. You can find answers to all your technical questions there.

  

![](https://gw.alipayobjects.com/zos/oceanbase/f4d95b17-3494-4004-8295-09ab4e649b68/image/2022-08-29/00ff7894-c260-446d-939d-f98aa6648760.png)