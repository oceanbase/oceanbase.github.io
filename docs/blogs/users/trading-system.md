---
slug: trading-system
title: 'Practice of Applying OceanBase Database in a Futures Company‘s Production Environment'
tags:
  - User Case
---

# Practice of Applying OceanBase Database in a Futures Company's Production Environment

**Introduction**

As the financial industry evolves and markets grow increasingly complex, futures trading systems face challenges such as handling massive transaction volumes, ensuring low latency, and maintaining system reliability. Conventional standalone and distributed databases are struggling to keep up. Futures companies and exchanges have been looking for next-generation distributed database technologies to boost the scalability, reliability, and performance of their systems. OceanBase Database, a distributed database system developed by Alibaba Group, is becoming a key part of the infrastructure in the financial sector, particularly for futures trading systems, thanks to its high availability, performance, and scalability.

In this article, we'll explore how a futures company runs its core trading system on OceanBase Database, covering everything from database architecture design to performance optimization, transaction management, and fault recovery.

**1\. Background and Requirements**

**1.1 Unique demands of futures trading systems**

As irreplaceable components of financial markets, futures trading systems must provide some key features:

High concurrency: Futures markets are where highly frequent transactions take place, especially during periods of high volatility when transaction requests can reach millions per second.

Low latency: Speed is everything in futures trading. Even the slightest delay can have a significant impact on trade execution.

High availability and disaster recovery: Futures trading systems must be highly available and capable of recovering quickly from disasters, as a short downtime can result in substantial financial losses.

Strong consistency: With large amounts of funds and real-time market data updates involved, futures trading systems must ensure strong data consistency and the atomicity of transactions.

**1.2 Challenges for conventional databases**

Conventional relational databases, with their single-node architecture and vertical scaling mode, struggle to cope with highly concurrent transactions and massive amounts of data. Here are some of the issues they face:

Performance bottlenecks: As the data volume and concurrency increase, conventional databases experience poorer query and write performance, leading to response lags of databases and delays in transaction processing.

Scalability issues: When traffic soars, conventional standalone databases can hardly be scaled horizontally.

Poor fault recovery: Conventional databases often rely on a primary/standby model. If the primary node fails, manual intervention is required to switch services to the standby nodes, which may result in prolonged downtime and reduced availability.

**1.3 Why OceanBase Database**

OceanBase Database, as a distributed relational database system, offers several benefits that address the shortcomings of their conventional cousins:

High concurrency support: The distributed architecture of OceanBase Database can be scaled horizontally in a moment, making it ideal for high-concurrency trading scenarios.

Low latency: Through table sharding and optimized query paths, OceanBase Database controls the response time in milliseconds.

High availability and disaster recovery: With its multi-replica mechanism and automatic failover capabilities, OceanBase Database ensures high availability even in the event of node failures.

Strong consistency: OceanBase Database supports distributed transactions, ensuring data consistency across nodes, which is critical for the accuracy of futures trading systems.

Given these benefits, the futures company decided to migrate its core trading system to OceanBase Database, aiming to solve issues related to scalability, performance, and fault recovery.

**2\. OceanBase Database's Role in the Architecture of the Futures Trading System**

**2.1 Overview**

In the architecture of the futures trading system, OceanBase Database is deployed at the database layer to store and manage all trading data, market data, fund data, and user account information. The system architecture consists of the following layers:

(1) Frontend trading layer: This layer includes user trading terminals and order processing modules. It receives trading requests from users and passes them through message queues to the core trading engine.

(2) Core trading engine: This layer handles the actual trading logic, such as order matching, trade execution, and risk control. It interacts with OceanBase Database through database interfaces.

(3) Database layer: In this layer, OceanBase Database stores and manages all trading-related data, such as order information, trade records, and position data.

(4) Data synchronization and monitoring layer: This layer handles data backup, real-time data synchronization, monitoring, and alerting, ensuring high availability and data integrity of the system.

In this architecture, the primary role of OceanBase Database is to provide efficient and stable data storage and processing capabilities.

**2.2 Table sharding and distributed architecture design**

OceanBase Database divides a data table into shards based on specific rules and distributes them across multiple nodes. To better fit the needs of the futures trading system, the following sharding and distribution strategies are implemented:

Order table: The order table is sharded by order ID. Shards of different orders are distributed across different physical nodes to prevent any node from being overloaded.

Trade record table: This table is sharded by trade time and trading pair, ensuring efficient data locating during queries.

Fund flow table: This table is sharded by user ID, allowing for quick access to a user's fund changes.

These sharding strategies allow OceanBase Database to deliver excellent query performance while maintaining high availability and scalability.

**3\. Application of OceanBase Database in Futures Trading**

**3.1 Order processing and transaction management**

In the futures trading system, order processing requires strong data consistency and the atomicity of transactions. OceanBase Database ensures this through its distributed transaction protocol while handling order operations as follows:

Order creation: When a user submits an order, OceanBase Database ensures the order data is successfully written to the database and immediately fed back to the trading system.

Order matching and execution: During order matching, OceanBase Database performs joint queries on multiple tables such as the order table and trade record table, while maintaining data consistency to avoid matching failures or inconsistencies.

Fund deduction and settlement: The execution of each order involves fund deductions and position updates. OceanBase Database supports cross-table and distributed transactions, ensuring accurate fund settlement and preventing issues like insufficient funds or settlement errors.

The transaction management capabilities of OceanBase Database play a crucial role in futures trading, especially in high-concurrency scenarios, where it ensures the consistency of every order and the atomicity of trading operations.

**3.2 Optimizations for high-concurrency trading scenarios**

Futures markets experience considerable fluctuations in trading volume and data flow. During periods of high volatility, in particular, the trading system faces rocketing concurrent requests. In response, OceanBase Database implements the following optimizations:

Table sharding: By dividing tables into shards and distributing them across multiple nodes, OceanBase Database parallelizes request processing, avoiding performance bottlenecks on any single node.

Multi-level caching: OceanBase Database adopts a multi-level caching mechanism that can cache data in memory and disks. Frequently accessed data, such as real-time market data for certain trading products, is cached to reduce direct database access and improve performance.

Query execution: OceanBase Database provides a highly optimized query execution engine. It minimizes the query latency by selecting the optimal execution plan, especially for complex queries and large datasets.

These optimizations enable OceanBase Database to maintain a low latency and a high throughput in high-concurrency trading scenarios, ensuring the futures trading system remains stable even under tremendous load.

**3.3 High availability and disaster recovery design**

The futures trading system must operate around the clock, making high availability a top priority. OceanBase Database guarantees high availability and disaster recovery by leveraging the following mechanisms:

Multi-replica mechanism: Each data node stores multiple replicas of the data, distributed across different physical servers. If a node fails, OceanBase Database automatically switches to another replica.

Automatic fault recovery: Relying on its monitoring and fault detection mechanisms, OceanBase Database quickly identifies node failures and automatically initiates failover and recovery processes.

Cross-IDC disaster recovery: To prevent system crashes from single points of failure, OceanBase Database can be deployed in multiple active IDCs across different regions.

This high availability and disaster recovery design ensures that the futures trading system remains stable and operational, even in the face of hardware or network failures.