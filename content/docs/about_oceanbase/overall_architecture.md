---
title: 整体架构
weight: 2
---
# **整体架构**

OceanBase 集群默认是 n-n-n 的三副本架构，代表三个可用区（Zone），每个 Zone 内都有 n 个节点。

如下图所示是 2-2-2 的集群架构图，每个 Zone 内有两个节点，默认数据分片是三副本。应用访问默认通过 OBProxy 进行连接，OBProxy 会解析 SQL 内容，自动将请求下发到对应的 OBServer 并返回结果。

![image.png](/img/about_oceanbase/overall_architecture/framework1.jpeg)

## **名词定义**

**副本**

指的是实际的分片数据，单分片最大的副本数量不会超过 Zone 的数量。

**Locality**

用来描述一个表的副本类型以及分布位置的方式。

**Resource Pool**

资源池，每个 Unit 都归属于一个资源池，每个资源池由若干个 Unit 组成，资源池是资源分配的基本单位，同一个资源池内的各个 Unit 具有相同的资源规格，即该资源池内 Unit 的物理资源大小都相同。您可参考 [创建资源池](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699432) 一文创建资源池。

**Server**

通常代表 OBServer，OceanBase 的数据库服务，每个 Zone 内有 1~n 个 Server。

**Tablet**

数据分片，存储层以一张表或者一个分区为粒度提供数据存储与访问，每个分区对应一个用于存储数据的 Tablet，用户定义的非分区表也会对应一个 Tablet，每个分片的副本数量由 Locality 定义。

**Tenant**

租户，类似于传统数据库的数据库实例，租户通过资源池与资源关联，从而独占一定的资源配额，可以动态调整资源配额。在租户下可以创建 Database、表、用户等数据库对象。部署 OceanBase 数据库时默认创建 sys 租户，sys 租户仅做集群管理使用，业务使用或者压测建议创建自己的业务租户。

创建租户时必须先创建 Unit 和 Resource Pool，或者使用已有的 Unit 和 Resource Pool，您可参考 [创建用户租户](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001702215) 一文创建用户租户。

**Unit**

资源单元，OceanBase 数据库按照 Unit 来管理物理资源，是 CPU、内存、存储空间、IOPS 等物理资源的集合。您可参考 [创建资源单元](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699430) 一文创建资源单元。

**Zone**

集群的可用区，不同的可用区可以在同一机房，也可以在不同机房；每个 Zone 内的服务器也同样，可以在同一机房也可以不同机房，建议每个 Zone 内的服务器都部署在同一机房，并且建议 Zone 之间的网络延迟不要太高。
