---
title: 读写分离策略及架构设计
weight: 3
---

> 说明：目前 DBA 进阶教程的内容暂时对应的是 OceanBase 社区版本，本小节的架构部分不涉及商业版的仲裁副本功能。社区版和商业版的能力区别详见：[官网链接](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428510)。

## 概述
数据库的读写分离策略是一种将数据库的查询操作和写入操作分离的方案，目的是降低读写操作的相互影响并提升资源利用率。在 HTAP 数据库中，读写分离的应用场景非常普及，只读的业务场景主要包括 BI 查询业务、大数据 ETL 取数、缓存的拉取等。

两种类型的业务同时跑在一套数据库集群上，这对数据库的配置等要求就相对较高，因此我们一般会采用读写分离的方式，将一部分的读请求，路由到 Follower 副本上，从而降低复杂分析计算对资源的侵占，影响在线业务的响应延迟。

OceanBase 数据库天然支持读写分离的功能，即通过 [OBProxy 代理服务](https://open.oceanbase.com/blog/10900290)和修改 OBServer 的配置即可实现业务的读写分离策略。

OceanBase 数据库在读取数据时，提供了两种一致性级别：强一致性和弱一致性。强一致性是指请求路由给主副本读取最新数据；[弱一致性](https://www.oceanbase.com/docs/common-oceanbase-database-1000000000035084)是指请求优先路由给备副本，不要求读取最新数据。

OceanBase 通过应用侧为执行的 SQL 添加 SQL Hint 来显性开启弱一致性读就可以实现基于注释的读写分离功能，同时也衍生出如下三种常用的读写分离策略，用户还可以根据实际情况，对读写分离策略进行灵活的配置。

## 备优先读（弱一致性读）
1. 无论从哪个 OBproxy 链接 OB 集群，通常单表 SQL 最后都会被路由到该表 Leader 副本所在的节点。这种默认的路由规则叫强一致性读。
2. 可以通过修改 OBproxy 的路由策略为 follower_first ，将业务读流量指定到该 OBProxy 从而保证读请求优先访问 Follower 副本，对应 OBProxy 默认会将请求路由到本地 Follower 副本。如果本地该数据的副本为 Leader 副本，则会自动优先路由到同 Region 中其他 IDC 的 Follower 副本。综上，备优先的含义就是：就近读取 Follower 副本。
3. 配置方法详见这篇 [官方文档](https://www.oceanbase.com/docs/common-best-practices-1000000001489641)，这里不再细说。

**路由策略示意图：**

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/001.png)

**优点**：配置相对简单，只修改 OBProxy 配置，无需修改 OBserver 配置；读流量均摊到全部 Follower 副本上。

**缺点**：如果本地副本是 Leader 副本，读请求则会跨 IDC（zone） 访问；在不调整副本 Leader 的情况下，同 zone 或同 server 下不同副本的 Leader 和 Follower 可能共存，不能完全实现 zone 级别或者 server 级别的读写隔离。

**<font color="red">适用场景：备优先读（弱一致性读）通常用于对读写分离要求不高，且读请求较少的场景。如果有较多的读请求，为了不影响 Leader 副本的读写，推荐使用只读 zone 或者只读副本。</font>**

## 只读 zone


1. 设置 Primary Zone为 zone1,zone2;zone3，注意这里 zone1 和 zone2 之间是逗号，zone2 和 zone3 之间是分号，表示 zone1 和 zone2 会被设置为 primary zone，因此所有的 Leader 副本都被迁移到了 zone1 和 zone2 中，zone3 默认情况下都为 Follower 副本，那么 zone3 的副本就可以只给弱一致性读的分析计算类SQL提供服务。
2. 需要弱一致性读的 SQL，连接设置了弱读的 OBProxy；其余 SQL 连接正常 OBProxy。
3. 通过连接弱读的 OBProxy 的所有 SQL，会基于 LDC 路由策略，以及 FOLLOWER_FIRST 策略，自动访问本地的 Follower 副本。
4. 配置方法还是详见这篇 [官方文档](https://www.oceanbase.com/docs/common-best-practices-1000000001489641)，这里不再细说。

**路由策略示意图：**

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/002.png)

**优点**：通过设置只读 zone 实现了 zone 级别隔离读写请求，隔离性相比备优先读的方案更高。

**缺点**：需要人工设置 Primary Zone，写流量会被集中打到 zone1 和 zone2。

**<font color="red">适用场景：适用于读写比较均衡的场景。</font>**

## 只读副本
OceanBase 中除了默认的全功能性副本之外，还有一种只读型副本，只读型副本的名称为 READONLY，简称 R 副本。区别于全功能副本，只读副本提供读的能力，不提供写的能力，只能作为日志流的 Follower 副本，不参与选举及日志的投票，不能当选为日志流的 Leader 副本。

利用只读副本，我们就可以专门配置一个 zone，只放只读型副本，专门提供给 OLAP 分析计算类请求，并且只读副本出现故障，并不会影响主集群服务。


1. 主集群正常提供服务。
2. AP 类请求走独立的 OBProxy，访问只读型副本。
3. 配置方法略，在创建租户时会要求选择各个 zone 中的副本类型，在对应 zone 中选择只对副本就好了。**这里需要注意的一点是：全功能副本支持随时在线动态调整为只读副本。**

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/003.png)


**路由策略示意图：**

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_03_htap/03_read_write_separation_best_practices/004.png)

**优点**：OLAP 与 OLTP 的请求可以做到完全隔离，互相不受任何影响。

**缺点**：需要为只读型副本提供更多资源。

**<font color="red">适用场景：业务读请求远大于写请求，且大部分读请求对实时性要求不高，或者有大量的 AP 分析场景。</font>**

## 只读备集群（备租户）
上面这些都是三副本或者五副本架构的读写分离方案。**<font color="red">如果对可用性要求不高，但比较看重成本</font>**，可以考虑为 OB 集群搭建一个备集群，可以是单副本（或者三副本），让只读业务只访问备集群。

注意：备只能读不能写，并且这个读必须是弱一致性读。

物理备库介绍详见：[基于日志异步复制的物理备库解决方案](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/zh-CN/disaster_recovery_architecture_design/primary_standby_database_solution)。

创建备租户，只需要在通过 OCP 创建租户时，选择租户类型为 “备租户” 并设置对应的主租户即可，十分简单，这里不再细说。

## 总结
综上所述，OceanBase 的读写分离有三种方案：

- 备优先读：三副本或者五副本架构下，个别 SQL 通过弱一致性读 HINT 或者会话设置，就近只读备副本（上面的 “备优先读” 和 “只读 zone” 都可以统一归为这种方案）。

- 只读副本：三副本或五副本架构下，额外增加一个或多个只读副本，为只读副本配置单独的 OBProxy ，只读业务走这个 OBProxy 专门访问只读副本。

- 只读备集群：搭建一个备集群，可以是单副本或者三副本。只读业务只访问备集群。

OceanBase 读写分离方案的优势有两点：

- 不用担心误写 “备副本或只读副本”，因为它不支持写，写操作会被路由到主副本。

- 不用担心 “备副本或只读副本” 发生故障，因为 OBProxy 会就近路由到其他备副本。


最后，用一位用户对 OceanBase 读写分离的比较中肯的评价，作为读写分离这一部分的结尾：“用惯了 Oracle 的 ADG 或者 MySQL 的主从读写分离，可能会觉得 OB 的读写分离方案看上去有一点儿复杂。这个时候，就需要转变观念了，读写分离方案严格的说要考虑各种异常情况，OB 把这些异常都做到内部去了，但对用户使用是极其方便的，对运维的工作也是很友好的。”


## 推荐阅读

[OceanBase 如何实现读写分离](https://open.oceanbase.com/blog/5581452032)

[OceanBase 读写分离方案全攻略](https://open.oceanbase.com/blog/1100238)

