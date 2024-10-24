---
title: HTAP 系统架构设计
weight: 4
---

> 说明：目前 DBA 进阶教程的内容暂时对应的是 OceanBase 社区版本，本小节的架构部分不涉及商业版的仲裁副本功能。社区版和商业版的能力区别详见：[官网链接](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428510)。

OceanBase 从 4.3.3 版本开始，支持了只读列存副本，在上一小节读写分离架构的基础上，我们继续来看下利用列存，可以继续对架构进行哪些优化。

## 实时报表、实时风控业务架构
    - **<font color="red">适用场景：以 TP 业务为主，虽然有一部分 AP 实时分析需求，但整体需求不大。</font>**

    - 架构设计思路：推荐使用行存副本，并在行存副本上创建列存索引。
    
    - 创建列存索引的方式详见：[《进入 OLAP 领域的入场券 —— 列存引擎》](https://open.oceanbase.com/blog/11547010336)。

    > 说明：
    >
    > 通过列存索引，可以实现在同一份数据上既有行存用于 TP，也有列存用于 AP。
    >
    > 相比使用行、列两份副本的优势是，可以只在需要进行 AP 计算的特定列上创建索引，既能够达到加速 AP 查询的目的，也能够最大程度的降低存储成本。

    ![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/04_htap_best_practices/001.png)

## 准实时决策分析业务架构：
    - **<font color="red">适用场景：以 TP 业务为主，同时也有较多 AP 需求，且不能接受上面这种利用 cgroup 资源组的方式进行资源隔离。</font>**

    - 架构设计思路：可以通过 “只读列存副本”，实现 zone 级别的硬隔离。

    - 使用只读列存副本的注意事项详见：[官网文档](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001431875)。

    > 说明：
    >
    > 只读列存副本是刚刚（2024.10.24）发布的 4.3.3 版本新增的特性，推荐先在 POC 测试环境中使用，不推荐直接上生产环境，以免影响系统稳定性。


    ![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/04_htap_best_practices/002.png)


## 轻量级数仓业务架构

    - **<font color="red">适用场景：以 AP 业务为主，且业务中不仅仅有大查询，还有大量小查询。</font>**

    - 架构设计思路：主表推荐使用列存表，并在列存表上创建行存索引。
    
    - 列存语法还是详见：[《进入 OLAP 领域的入场券 —— 列存引擎》](https://open.oceanbase.com/blog/11547010336)。

    > 说明：
    >
    > 列存表的目的是加速 AP 复杂查询，行存索引的目的是加速点查。
    >
    > "轻量数仓" 不是 “离线数仓”，含义是：不只有复杂查询，也有简单和轻量的点查。

    
    ![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/04_htap_best_practices/003.png)


## OceanBase 在实时数仓业务设计中的位置及作用

针对上面第三种数仓场景，我们这里做一些简单的展开，介绍下 OceanBase 在实时数仓业务设计中适合的位置及作用。

在数据仓库（Data Warehouse）的设计中，ODS、DWD、DWS 和 ADS 是常见的分层架构中的不同层次。这些层次各自有不同的功能和用途，有助于更好地组织和管理数据，支持高效的数据处理和分析。

先简单解释一下这几个层次：

- ODS（Operational Data Store）操作数据存储：存储近实时的原始数据，支持运营报表和监控。

- DWD (Data Warehouse Detail Layer) 数据仓库明细层：去除了冗余和不一致，存储经过初步清洗和标准化的明细数据。

- DWS (Data Warehouse Summary Layer) 数据仓库汇总层：存储经过进一步聚合和汇总的数据，支持复杂分析和报表生成。

- ADS (Application Data Store) 应用数据存储层：存储经过高度聚合和加工的数据，用于最终的前端应用和报表展示。

数仓业务的上游往往有一个 TP 数据库，以及业务日志，通过 Kafka 等生态工具写入到队列，再批量写入到数仓。

- 可以让 OceanBase 作为数仓主体。
    - 通过 OceanBase 的物化视图能力，存储在 DWD 和 DWS 中清洗和汇总数据，从而消除上述不同层次间的 ETL 流程。
    ![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/04_htap_best_practices/004.png)

- 可以用 OceanBase 作为数仓的存储方案。
    - 通过 Flink 等第三方生态工具进行计算，同时也会使用 OceanBase 进行一部分复杂查询（混合计算模式）。
    ![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/04_htap_best_practices/005.png)

- 当数据量大，且需要使用第三方生态工具作为数据加工层时：
    - 可以用 OceanBase 作 ODS 层，解决实时写入性能差的痛点。
    - 可以用 OceanBase 作 ADS 层，解决高并发场景性能差的痛点。
    ![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/04_htap_best_practices/006.png)