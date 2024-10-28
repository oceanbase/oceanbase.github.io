---
title: 场景介绍
weight: 1
---

> 关键字：T + 0 混合负载 | 分布式执行框架 | 多模场景支持
>
> HTAP 混合事务与实时分析处理是行业强诉求，OceanBase 基于分布式架构做好交易处理场景的同时，能够完成分析、跑批等分析性场景，一套引擎支持 OLAP + OLTP 工作负载，同时实现两套系统功能，真正通过“一个系统”提供同时处理交易及实时分析，“一份数据”用于不同的工作负载，从根本上保持数据的一致性并最大程度降低数据冗余，帮助企业大幅降低成本。

## HTAP 一体化混合负载场景
企业级应用的业务场景通常可以分为两个类别：联机交易和实时分析，我们通常称为 OLTP 和 OLAP 的业务应用。
![image](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/01_introduction/001.png)


大型企业往往会选择多款数据库产品分别支持 OLTP 和 OLAP 类的应用场景。这种组合式的解决方案需要数据在不同系统间进行流转，数据同步的过程会带来时间延迟和数据不一致的风险；同时，多套不同的系统也会产生冗余数据，增加存储成本。
![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/01_introduction/002.png)



## 行业现状与挑战
- 离线数仓实时性差：离线数仓往往仅能提供 T+1 的数据能力，数据更新能力较弱，导致在线业务团队的实时分析、会员营销等需求无法及时满足。而单独建设实时数仓对中小企业又相对复杂，还需要投入额外人力成本维护数据同步链路。

- HTAP 隔离性差：HTAP 的核心在于一套引擎支持多种负载，而资源的隔离性如果无法得到保障，承担关键交易的数据库一旦被分析型、批处理类的业务影响，往往直接导致在线交易下跌，业务严重受损。

- 传统主备能力单一 ：依靠主备复制的读写分离方案，备节点仅能处理只读查询，无法进行批处理操作 ；数据实时性也强依赖同步延迟，当遇到大型事务/DDL 时无法保证实时一致性。再加上本身能力有限的 SQL 优化器，无法灵活支持跨分片的多表复杂分析。

## 解决方案

- 通过 OMS 将异构数据库分库分表同步至 OceanBase 原生分区表（多表汇聚同步）。

- 迁移至 OceanBase 后多个实例融合为一个实例，摆脱维护中间件的苦恼，大幅提升存储可扩展性。

- OceanBase 的 HTAP 模式，满足了业务上分析查询的业务得以前置，无需等待 T + 1 数据，直接于在线库实现实时营销决策等分析需求。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/01_introduction/003.png)

## 方案优势
- 强大的数据更新能力：基于关系型数据库的更新能力，副本间毫秒级极低延迟。

- HTAP 一体化：一套引擎处理 OLTP 和基本的 OLAP 场景，同时基于资源组隔离技术，提供 OLTP/OLAP 业务资源隔离的可靠方案，免去复杂的实时数仓建设。

- 分布式并行计算引擎：强大的 SQL 优化器和执行器，支持向量化计算和海量数据的并行计算分析。

- 多模场景支持：完全兼容 MySQL 语法 , 同时支持 HBase 和 Table 模型 API ，并且支持 JSON 半结构化数据格式和场景。强大的 CDC 能力支持，方便多种类型的下游进行数据消费。

- 灵活的动态扩容：单集群最大可超过上千节点，数据容量超过 PB 级。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/01_introduction/004.png)

OceanBase 通过 Flink CDC 组件作为流处理引擎，同时以 OceanBase 的 PL / SQL + Job Package 实现批处理任务，完成数据集成以及数据建模的流批一体处理。同时通过向量引擎 + 多副本架构，实现数据与业务的协同以及时效性的保障。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/01_introduction/005.png)

## 用户案例

### 中国石化（典型用户案例）

#### 业务挑战
- 中国石化基于新基建技术构建新一代智慧加油站，推进中国石化生活综合服务商转型战略，原有加油卡系统无法适应互联网化客户营销服务体验和模式创新需求。

- 随着数据应用的层次更深更广，数据类型更多，对数据库提出新要求。现为异构分散式系统，无法满足业务转型所需低系统性风险、管理运维和自主创新。

#### 解决方案
- 基于 OceanBase 强大的 HTAP 混合负载能力：通过读写分离、资源隔离等技术实现了负载均衡和 OLAP 查询性能提升。通过存储引擎的 LSM tree 架构、事务引擎的提前解行锁等技术提升了 OLTP 事务性能。

- 通过“数据+平台+应用”的架构设计，将现有加油卡系统从分省运维的 23 套 Sybase 和 Oracle 单体数据库，统一集中至一套 OceanBase分布式数据库集群中。

- OceanBase对传统集中式数据库具备优异的兼容能力，帮助中国石化原始数据库应用无损迁移，过渡方案确保柔性切割。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/01_introduction/006.png)

#### 用户收益

- 转型：电子券、返利实时化，单一支付方式向多种支付方式转变，有力推进中国石化生活综合服务商战略转型。

- 提效：OceanBase 支撑全国近 3 万个加油站的业务流量，对内支持交易流水由天级降低到秒级，实现一体化班日结和报表需求。数据查询时间由分钟级降低到秒级，支持每分钟 50,000 笔业务交易。

- 降本：23 套分散系统运维降低至 1 套 OceanBase，大幅度降低了软硬件和运维成本，实现 8 倍存储成本节约。

- 可靠：故障恢复时间从小时级降低到分钟级，业务连续性达到 99.99%，安全级别达到网络安全等级保护 2.0 要求。



###  其他用户案例

+ 跨越速运：[https://open.oceanbase.com/blog/27200135](https://open.oceanbase.com/blog/27200135)
    - 行业：物流
    - 痛点：MySQL 无法满足越来越复杂的分析处理需求。从 TiDB、OceanBase、StarRocks、Doris 中考虑在线扩容、负载均衡等可维护性，会在 TiDB、OceanBase 中二选一。
    - 收益：OceanBase 实时数据查询和离线数据查询的性能都是 TiDB 的五倍左右，存储成本只有 TiDB 的五分之一；且组件少，维护方便。

+ 作业帮：[https://open.oceanbase.com/blog/8811965232](https://open.oceanbase.com/blog/8811965232)
    - 行业：教育
    - 痛点：MySQL 无法支持实时数据分析的需求
    - 收益：典型的百万数据规模的 10-20 并发聚合类查询场景，测试结果显示 OceanBase 不仅能做到毫秒级响应（性能高于 MySQL 数十倍），而且对核心 TP 业务毫无影响。

+ 翼鸥教育（Classin）：[https://open.oceanbase.com/blog/27200134](https://open.oceanbase.com/blog/27200134)
    - 行业：教育
    - 痛点：读写瓶颈。在疫情期间，在线课堂业务翻倍，流量猛增，由于 MySQL 这样的单机版数据库无法像分布式数据库一样做到平滑的水平扩展，线上许多集群存在明显的读写瓶颈。
    - 收益：将线上的真实流量引入测试集群，对比 TiDB 和 OceanBase，由于 TiDB 优化器不稳定，出现索引走错的情况，且 TiDB 的 CPU 使用率和延迟指标也经常出现较为明显的波动，而 OceanBase 的 CPU 使用率和延迟指标表现非常平稳。

+ 联通云粒：[https://open.oceanbase.com/blog/5244321792](https://open.oceanbase.com/blog/5244321792)
    - 行业：政企 / 运营商
    - 痛点：大数据处理系统，Hive 依赖 Hadoop，使用 HDFS 存储数据，YARN 作为资源管理框架，Tez 优化 Hive DAG 任务……组件众多，运维困难。
    - 收益：Oceanbase 架构较简洁：只有 OBServer 和 OBProxy，我们需要部署和运维几十甚至上百套集群，配置、部署、运维等方面用 OceanBase 较为便利。数据治理从分钟级到准实时：OceanBase在小数据量场景下各方面的时延都远低于Hive，而且相比定位为单一 AP 引擎的 Hive，定位为 HTAP 的 OceanBase 在 TP 方面也有诸多优势。
    - 视频资料：[云粒智慧实时数仓演进之路](https://www.oceanbase.com/video/9001367)

+ 四川华迪：[https://open.oceanbase.com/blog/6776731648](https://open.oceanbase.com/blog/6776731648)
    - 行业：互联网
    - 痛点：使用 Hadoop 生态搭建数据计算平台，组件过多、搭建复杂、运维成本高。最关键的问题是，这套复杂的环境出现故障后难以排查，不能及时解决。
    - 收益：架构大大简化，易运维，同时节省了大量成本。每个 OBServer 节点内都包含了存储引擎和计算引擎，节点之间对等，组件数量少、部署简单、易于运维，不需要我们再为数据库补充其他组件来实现高可用及自动故障转移等功能。