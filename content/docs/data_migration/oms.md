---
title: OMS
weight: 1
---
# **使用 OMS 进行数据迁移和数据同步**

本文主要介绍使用 OMS 进行数据迁移和数据同步的适用版本和目前支持的源端/目标端，详细的操作过程请参见官网 [OMS 文档](https://www.oceanbase.com/docs/oms-cn)。

## **适用版本**

数据迁移和数据同步功能中，OceanBase 社区版和其它数据终端的适用版本如下。

| 分类 | 数据迁移 | 数据同步 |
| --- | --- | --- |
| OceanBase 社区版 | V3.1.0-CE、V3.1.1-CE、V3.1.2-CE、V3.1.3-CE、V3.1.4-CE、V4.0.0-CE、V4.1.0-CE | V3.1.0-CE、V3.1.1-CE、V3.1.2-CE、V3.1.3-CE、V3.1.4-CE |
| 其它数据终端 | - MySQL：V5.5、V5.6、V5.7、V8.0<br> - MariaDB：V10.2<br> - TiDB：4.x、5.x<br> - PostgreSQL：10.x |- Kafka：V0.9、V1.0、V2.x<br> - RocketMQ：V4.7.1 |

## **目前支持的数据源和目标端**

其中，OceanBase 4.x 版本只能作为 MySQL 的目标端，其他的暂不支持。

| 数据源 | 目标端 | 数据迁移 | 数据同步 |
| --- | --- | --- | --- |
| MySQL | OceanBase | 支持 | 支持 |
| TiDB | OceanBase | 支持 | 支持 |
| PostgreSQL | OceanBase | 支持 | 支持 |
| OceanBase | OceanBase | 支持 | 支持 |
| OceanBase | MySQL | 支持 | 支持 |
| OceanBase | Kafka | \\ | 支持 |
| OceanBase | RocketMQ | \\ | 支持 |

## **TiDB 迁移数据到 OceanBase 数据库需要注意的点**

如需使用 OMS 做 TiDB 增量数据迁移，需要先为 TiDB 集群部署 TiCDC，并且把数据写到 kafka，之后在 OMS 创建数据源。

在 OMS 中创建数据源时需先创建 kafka 数据源，再创建 TiDB 数据源，并且 TiDB 数据源里需要包含创建的 kafka 数据源，这样在创建迁移项目的时候才能选择增量同步。
