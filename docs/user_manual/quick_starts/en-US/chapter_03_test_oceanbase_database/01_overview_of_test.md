---
title: Overview
weight: 2
---

# 3.1 Overview

In this data-driven era, the rapid development in the database industry ushers in brand-new technological innovations and solutions. To ensure that the selected database model can accommodate a growing data scale and increasing data processing needs, enterprises and technical personnel will run proof of concept (PoC) tests to verify the capabilities of the database system. Several key points, such as the performance, parallel processing capacity, storage costs, and high availability, are prioritized during the tests to ensure that the selected database technology can meet specific business requirements and performance standards. 

## Performance test

The database performance test is a key concern in business model selection and PoC testing. It involves multiple evaluation standards and test tools. OceanBase Database is a real-time hybrid transactional and analytical processing (HTAP) database that supports both online real-time transactions and real-time analytics. To assess the online transaction processing (OLTP) performance of a database, we usually use standard test tools such as Sysbench and TPC-C to measure the capabilities of the database in processing concurrent transactions, maintaining data integrity, and quickly responding to query requests. To assess the online analytical processing (OLAP) performance of a database, we usually use tools such as TPC-H to simulate complex query and analysis operations on multi-dimensional datasets, to verify the capabilities of the database in processing and responding to operations involving large amounts of data. 

Apart from the preceding standard test tools and models well recognized in the industry, you can use JMeter to simulate the interactions with a database in actual business scenarios, so as to assess the comprehensive performance of the database. The test results of JMeter are more comprehensive and approximate to actual application scenarios. 

## Parallel import test

A large amount of data needs to be imported in parallel in OLAP scenarios. Therefore, the batch data processing capacity is also a key concern in PoC tests. The speed and stability in batch data write are essential if you need to migrate or synchronize large amounts of data. The parallel execution (PX) framework of OceanBase Database supports executing DML statements in parallel DML (PDML) mode. For a database deployed on multiple nodes, the PX framework can implement parallel write on these nodes while ensuring data consistency for large transactions. The asynchronous minor compaction mechanism enhances the support of the log-structured merge-tree (LSM-tree)-based storage engine for large transactions when memory is tight. 

## Data compression test

After business data is imported, data compression is also a concern. As the storage costs constantly increase and demand for efficient data access grows, low storage costs and efficient processing of massive amounts of data have become the key factors demonstrating the competitiveness of databases. Data compression is the key method to optimize database performance and lower the overall costs. A data compression test aims to quantify the storage space saved by data compression, assess the impact of data compression on the query and transaction processing performance, and verify data integrity and restore reliability. 

## High availability test

A database system is responsible for data storage and queries in an application architecture. High data availability is crucial for enterprises to ensure business continuity. Therefore, high availability is also a key concern in database testing. OceanBase Database implements a multi-replica disaster recovery solution based on the Paxos protocol. When a minority of replicas fail, OceanBase Database can provide a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of less than 8s. Multi-replica disaster recovery ensures fast fault recovery with zero data loss when a minority of OBServer nodes in a cluster fail. In the multi-replica disaster recovery solution, transaction logs are persisted and synchronized among multiple replicas by using the Paxos protocol. 
