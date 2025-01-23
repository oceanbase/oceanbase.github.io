---
title: HTAP System Architecture Design
weight: 4
---

> Note: At present, *OceanBase Advanced Tutorial for DBAs* applies only to OceanBase Database Community Edition. Therefore, the arbitration replica feature of OceanBase Database Enterprise Edition is not included in the tutorial outline provided in this topic. For more information about the differences between the two editions, see [Differences between Enterprise Edition and Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714481).

OceanBase Database supports read-only columnstore replicas since V4.3.3. This topic describes how to use columnar storage to further optimize the system architecture on the basis of read/write splitting.

## Business Architecture for Real-time Reports and Risk Control
    - **<font color="red">Scenarios: This architecture applies to scenarios that are dominated by transaction processing (TP) business but have a few analytical processing (AP) requirements. </font>**

    - Architecture design idea: Use rowstore replicas and create columnstore indexes on rowstore replicas.
    
    - For information about how to create a columnstore index, see [Columnstore Engine: Your Ticket to OLAP](https://open.oceanbase.com/blog/11547010336).

    > Note:
    >
    > With columnstore indexes, both a rowstore replica (for TP business) and a columnstore replica (AP business) are available for the same data.
    >
    > Compared with the dual-replica mode (rowstore replica + columnstore replica), the columnstore index feature allows you to create an index only on columns involved in AP. This can accelerate AP queries and minimize the storage costs.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/04_htap_best_practices/001.png)

## Business Architecture for Quasi-real-time Decision Analysis
    - **<font color="red">Scenarios: This architecture applies to scenarios that have more TP business needs than AP business needs and where resource isolation cannot be implemented by using control groups (cgroups). </font>**

    - Architecture design idea: Use read-only columnstore replicas to implement zone-level hard isolation.

    - For the considerations on using read-only columnstore replicas, see [Columnstore replica](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001719945).

    > Note:
    >
    > The columnstore replica feature is a new feature available since OceanBase Database V4.3.3, which was released on October 24, 2024. We recommend that you do not use it in a proof of concept (POC) environment, to avoid compromising system stability.


![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/04_htap_best_practices/002.png)


## Business Architecture for Lightweight Data Warehouses

    - **<font color="red">Scenarios: This architecture applies to scenarios dominated by AP business that has both large queries and many small queries. </font>**

    - Architecture design idea: Use a columnstore table and create rowstore indexes on the table.
    
    - For information about the columnar storage syntax, see [Columnstore Engine: Your Ticket to OLAP](https://open.oceanbase.com/blog/11547010336).

    > Note:
    >
    > The columnstore table aims to accelerate complex AP queries and rowstore indexes aim to accelerate point queries.
    >
    > A lightweight data warehouse is not an offline data warehouse. It has not only complex queries but also simple and lightweight point queries.

    
![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/04_htap_best_practices/003.png)


## Position and Functionality of OceanBase Database in Design of Real-time Data Warehouses

This section describes the position and functionality of OceanBase Database in the design of real-time data warehouses.

A common hierarchical architecture of real-time data warehouses comprises the following layers: operational data store (ODS), data warehouse detail (DWD), data warehouse summary (DWS), and application data store (ADS). These layers have different features and purposes to better organize and manage data to support efficient data processing and analysis.

These layers are described as follows:

- ODS layer: stores quasi-real-time raw data for operation reports and monitoring.

- DWD layer: stores cleansed and standardized details data without redundancy and inconsistency.

- DWS layer: stores aggregated and summarized data for complex analysis and report generation.

- ADS layer: stores highly aggregated and processed data for frontend applications and reports.

Usually, a TP database is among the upstream systems of the data warehouse business. Business logs are written to the queue by using ecosystem tools such as Kafka and then batch written to the data warehouse.

- OceanBase Database can serve as the data warehouse.
    - Based on its materialized view capabilities, OceanBase Database cleanses data stored in the DWD layer and summarizes data in the DWS layer, thereby eliminating the extract, transform, and load (ETL) process between different layers.
    ![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/04_htap_best_practices/004.png)

- OceanBase Database can serve as the storage medium of the data warehouse.
    - Third-party ecosystem tools such as Flink are used for computations, and OceanBase Database is also used to process some complex queries, which can be seen as a hybrid computation solution.
    ![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/04_htap_best_practices/005.png)

- If a third-party ecosystem tool is required for data processing when the data volume is large:
    - OceanBase Database can serve as the ODS layer to address the pain point of poor real-time write performance.
    - OceanBase Database can serve as the ADS layer to address the pain point of poor performance in high-concurrency scenarios.
    ![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/04_htap_best_practices/006.png)