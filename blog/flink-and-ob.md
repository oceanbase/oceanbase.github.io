---
slug: flink-and-ob
title: Flink CDC + OceanBase Database Data Integration Solution
---

## Introduction

Change Data Capture (CDC) is a widely applied technology that captures database changes. In this post, we will introduce you to the Flink CDC + OceanBase Database data integration solution. This solution combines CDC with extraordinary pipeline capabilities and diversified ecosystem tools of Flink, to synchronize processed CDC data to the downstream, formulating a solution for integrated full and incremental synchronization based on OceanBase Database Community Edition.

The solution brings two benefits. First, it synchronizes data by using one component and one link. Second, Flink SQL supports aggregation and extract-transform-load (ETL) of database and table shards, making it much easier for users to analyze, process, and synchronize CDC data by executing a Flink SQL job.

<!-- truncate -->

## Keypoints

This post is based on the content shared by Wang He, an open source tool expert with OceanBase.

It contains the following five parts:

1. Introduction to the CDC technology

2. Introduction to OceanBase CDC components

3. Introduction to Flink CDC

4. Use Flink CDC OceanBase Connector

5. Conclusion

## I. CDC technology

![](https://gw.alipayobjects.com/zos/oceanbase/eaa84253-a48e-438c-a458-29cc39c6d194/image/2022-05-07/7f3f97dc-eb5c-43f5-a8c8-44f5064bee08.png)

The CDC technology monitors and captures changes in a database, such as the INSERT, UPDATE, and DELETE operations on the data or data tables, and then writes the changes to message-oriented middleware, so that other services can subscribe to and consume the changes.

![](https://gw.alipayobjects.com/zos/oceanbase/7b3f7a72-e230-4ada-8f67-d1feb68d1168/image/2022-05-07/ac855f6e-3a00-44f3-b7e6-39517751fec0.png)

Alibaba Canal is a popular open source CDC tool, which is mainly used in Alibaba Cloud open-source components for incremental MySQL data subscription and consumption. The latest version of Alibaba Canal supports OceanBase Database Community Edition data sources, incremental DDL and DML operations, and filtering of databases, tables, and columns. You can use it with ZooKeeper for the deployment of high-availability clusters. The client adapter of Alibaba Canal supports multiple types of containers as the destination. You can use it with Alibaba Otter to achieve active geo-redundancy.

![](https://gw.alipayobjects.com/zos/oceanbase/17c2e5c5-9b31-4290-8cbd-983815f1e469/image/2022-05-07/300d3459-5fa8-416c-a5d5-84e03fdcc488.png)

Another popular open source CDC framework is Debezium.

It supports the synchronization of DDL and DML operation logs, uses the primary key or unique key as the key of the message body, and also supports the snapshot mode and full synchronization.

Debezium also supports a variety of data sources. You can integrate Debezium Server into a program as an embedded engine to directly write data to a message system without using Kafka.

# II. OceanBase CDC components

![](https://gw.alipayobjects.com/zos/oceanbase/b38cbaf6-fc19-4eef-b172-27a5016cc451/image/2022-05-07/15fd5ef4-7679-403b-aad1-a39d8700b0bc.png)

OceanBase Database Community Edition provides four CDC components:

obcdc (formerly liboblog): pulls incremental logs in sequence.

oblogmsg: parses the format of incremental logs.

oblogproxy: pulls the incremental logs.

oblogclient: connects to oblogproxy to obtain the incremental logs.

OceanBase Migration Service (OMS) Community Edition is provided. It is an all-in-one data migration tool for incremental data migration, full data migration, and full data verification.

![](https://gw.alipayobjects.com/zos/oceanbase/0fa227bf-343a-4b54-9eb8-ec0adcb7b018/image/2022-05-07/8eceea9f-1f1e-445c-9a9f-24c7cd495cd6.png)

The preceding figure shows the CDC logic of OceanBase Database Community Edition. Data is pulled by oblogproxy and OMS Community Edition. Canal and Flink CDC are integrated with oblogclient to obtain incremental logs from oblogproxy.

# III. Flink CDC

![](https://gw.alipayobjects.com/zos/oceanbase/fa9a24c3-5684-40c4-b584-35992433bff5/image/2022-05-07/ba8f10ce-eacf-48ef-b6b6-402368806f09.png)

Flink CDC supports multiple data sources, such as MySQL, PostgreSQL, and Oracle. Flink CDC reads the full and incremental data from a variety of databases, and then automatically transfers data to the Flink SQL engine for processing.

![](https://gw.alipayobjects.com/zos/oceanbase/fc9856de-09ed-4eaa-b110-dff6d75f5b32/image/2022-05-07/4d648854-a0e5-4404-83ea-18d1ce2b94cd.png)

Flink is a hybrid engine that supports both batch and streaming processing. Flink CDC converts streaming data into a dynamic table. In the preceding figure, the lower left part shows the mapping between streaming data and a dynamic table. The lower right part shows the results of multiple executions of continuous queries.

![](https://gw.alipayobjects.com/zos/oceanbase/091b66ed-1259-46f9-a385-3353c6c77a2f/image/2022-05-07/3217492e-54fc-4dac-831f-814dfd2b855c.png)

The preceding figure shows the working principle of Flink CDC. It implements the SourceFunction API based on Debezium and supports MySQL, Oracle, MongoDB, PostgreSQL, and SQLServer.

The latest version of Flink CDC supports data reads from a MySQL data source by using the Source API, which provides enhanced concurrent reading compared to the SourceFunction API.

The OceanBaseRichSourceFunction API is implemented for full and incremental data reads respectively based on JDBC and oblogclient.

![](https://gw.alipayobjects.com/zos/oceanbase/ef1db322-542c-460c-a4cc-7052711bdbb8/image/2022-05-07/7144e0a0-de64-4123-966a-4de6cf427d0b.png)

=============

# IV. Use Flink CDC OceanBase Connector

Configure the `docker-compose.yml` file and start the container. Go to the directory where the `docker-compose.yml` file is stored, and run the `docker-compose up-d` command to start the required components.

![](https://gw.alipayobjects.com/zos/oceanbase/9b5d74d0-01c9-42b7-88e8-329996981c57/image/2022-05-07/b87e2f73-36ad-47c2-b991-1bdff8fb5aba.png)

Run the `docker-compose exec observer obclient-h127.0.0.1-P2881-uroot-ppsw` command to log on by using newly created username and password. Download the required dependency packages and execute Flink DDL statements on the CLI of Flink SQL to create a table.

![](https://gw.alipayobjects.com/zos/oceanbase/67ccf926-fd34-4175-b7f7-6219ce53ec66/image/2022-05-07/022ef971-e3b8-4861-8590-3734401c1020.png)

Set the checkpointing interval to 3 seconds and the local time zone to Asia/Shanghai. Then, create an order table, a commodity table, and the associated order data table. Perform data reads and writes.

![](https://gw.alipayobjects.com/zos/oceanbase/77f314e9-0062-455a-a0aa-e34bc0f3de1a/image/2022-05-07/1a5ea095-35cf-4106-b629-7064a8a75792.png)

View the data in Kibana by visiting the following address:

[http://localhost:5601/app/kibana#/management/kibana/index_pattern](http://localhost:5601/app/kibana#/management/kibana/index_pattern)

![](https://gw.alipayobjects.com/zos/oceanbase/f79cc96e-182c-4180-808b-a7b8b091f4a7/image/2022-05-07/50904e7a-a129-46d1-b841-f9b19c64edee.png)

Create an index pattern named `enriched_orders`, and then view the written data by visiting [http://localhost:5601/app/kibana#/discover](http://localhost:5601/app/kibana#/discover%E7%9C%8B%E5%88%B0%E5%86%99%E5%85%A5%E7%9A%84%E6%95%B0%E6%8D%AE%E4%BA%86%E3%80%82).

![](https://gw.alipayobjects.com/zos/oceanbase/69bd86f3-8601-4561-a9e0-30831203e859/image/2022-05-07/01c329c8-b97b-4dfc-8e6c-117d00e24f69.png)

Modify the data of the monitored table and view the incremental data changes. Perform the following modification operations in OceanBase Database in sequence, and refresh Kibana once after each step. We can see that the order data displayed in Kibana is updated in real time.

![](https://gw.alipayobjects.com/zos/oceanbase/62c8b1a5-50d1-4903-a221-ce21c8f1d6c4/image/2022-05-07/991c53d2-425e-4d01-a20d-3851bff54609.png)

Clean up the environment. Go to the directory where the `docker-compose.yml` file is located, and run the `docker-compose down` command to stop all containers. Go to the Flink deployment directory and run the `./bin/stop-cluster.sh` command to stop the Flink cluster.

# V. Conclusion

Flink CDC supports full and incremental data migration between many types of data sources and works with Flink SQL to perform ETL operations on streaming data. As of the release of Flink CDC 2.2, the project has 44 contributors, 4 maintainers, and more than 4,000 community members.

OceanBase Connector can be integrated with Flink CDC 2.2 or later to read full data and incremental DML operations from multiple databases and tables in AT_LEAST_ONCE mode. Flink CDC OceanBase Connector will gradually support concurrent reads, incremental DDL operations, and the EXACTLY_ONCE mode in later versions.

Now, let's briefly compare the existing CDC solutions. OMS Community Edition is a proven online data migration tool with a GUI-based console. It provides full data migration, incremental data migration, data verification, and O&M services. DataX + Canal/Otter is a fully open source solution. Canal supports many types of destinations and incremental DDL operations, and Otter supports active-active disaster recovery.

# Afterword

Flink CDC is a fully open source solution and is supported by an active community. It supports full and incremental data synchronization between many types of data sources and destinations. It is worth mentioning that Flink CDC is easy to use, and supports aggregation and ETL of database and table shards. Compared with some existing CDC solutions that involve complex data cleaning, analysis, and aggregation operations, Flink SQL allows users to easily process data for various business needs by using methods such as stream-stream join and dimension table join.

## Contact us

**Feel free to contact us at any time.**

[Visit the official forum of OceanBase Database Community Edition](https://open.oceanbase.com/answer)

[Report an issue of OceanBase Database Community Edition](https://github.com/oceanbase/oceanbase/issues)

**DingTalk Group ID: 33254054**

![](https://gw.alipayobjects.com/zos/oceanbase/8223c1be-2a25-4658-9d9f-5fd4594e9900/image/2022-05-07/77e7a1ce-01b1-4b45-9aaa-ff184f43f822.png)
