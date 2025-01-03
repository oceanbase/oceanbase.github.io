---
title: 资源隔离的效果
weight: 4
---

## CPU 隔离效果

我们观察到，很多客户的跑批业务会安排在业务低峰期，如午夜或者凌晨，此时不用过于担心 OLAP 会影响到 OLTP 类业务，我们可以把集群绝大部分资源分配给 OLAP 类业务，给 OLTP 留下最小资源保证即可。在白天的业务高峰期，通过调整资源隔离方案，可以确保 OLTP 业务资源充足，同时按照预设资源满足基本的 AP 类查询。

**在用户使用 OceanBase 的过程中，一般只需要预设两套资源管理计划，白天激活 DAYTIME 计划，夜间激活 NIGHT 计划，就可以实现满足基本的隔离需求的同时实现资源利用率的最大化。**

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/001.png)

例如我们可以用以下语法定义一个白天资源使用计划（resource plan),并且制定了此计划下 OLTP (interactive_group）和 OLAP (batch_group) 的资源百分比。80% 的资源用于 TP，剩下 20% 资源用于 AP。

```
DBMS_RESOURCE_MANAGER.CREATE_PLAN(
   PLAN    => 'DAYTIME',
   COMMENT => 'More resources for OLTP applications');

DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
   PLAN             => 'DAYTIME',
   GROUP_OR_SUBPLAN => 'interactive_group',
   COMMENT          => 'OLTP group',
   MGMT_P1          => 80,
   UTILIZATION_LIMIT => 100);

DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
   PLAN             => 'DAYTIME',
   GROUP_OR_SUBPLAN => 'batch_group',
   COMMENT          => 'OLAP group',
   MGMT_P1          => 20,
   UTILIZATION_LIMIT => 20);

-- 定义好资源使用计划后，用以下方式激活：
ALTER SYSTEM SET RESOURCE_MANAGER_PLAN = 'DAYTIME';
```
按照类似的方式，可以定义夜晚的资源使用计划，并在业务低峰期激活它。

OceanBase 还提供了按登录用户对 SQL 分类的方法，客户可以创建一个新用户用于执行 AP 分析型 SQL，只要是该用户发起的 SQL，都会被判定为是 AP 负载，这样分类方式让资源隔离的粒度更细，也更简单有效。同时，OceanBase 会把执行时间超过 5s（时间可配置）的请求识别为当作大查询，大查询会被降低优先级。

我们刚刚提到可以建一个特殊用户专门来服务 AP 业务，那么我们先创建两个测试用户：AP 和 TP。我们把 AP 任务绑定到 AP_GROUP，TP 任务绑定到 TP_GROUP。假设这个业务白天的时候 TP 负载高，AP 集中在晚上。因此我们为白天和晚上设置两个不同的资源使用计划，白天的时候我们希望 80% 的资源用于 TP，剩下 20% 资源用于 AP，夜晚的时候希望 50% 的资源用于 TP，剩下 50% 资源用于 TP。

从下图测试结果可以看出来，切换为夜晚计划后，AP 的 CPU 资源占比变大后，AP 的 QPS 明显变高，TP 的 QPS 有一些降低。下图中 AP 和 TP QPS 发送变化的点就是切换资源使用计划的时间。

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/002.png)

上图中看起来 TP 的 QPS 降低比较少，和 AP 的 QPS 变化相比起来没有那么明显。这是因为 AP 是从 0.3 到 0.5，增加了 66.7%, TP 从 0.7 到 0.5，只会下降 28.5%，所以 TP 的 QPS 变化幅度在理想情况下就要比 AP 的变化幅度更小，是符合预期的。



## IOPS 隔离效果
为了验证磁盘 IO 隔离的能力，我们用单元测试测做了一项仿真实验：
- 设置 4 个租户，每个租户启动 64 个线程发送 IO 请求，IO 请求固定为 16KB 随机读。
- 租户 1、2、4 的负载持续 20 秒，租户 3 的负载从第 10 秒开始，持续 10 秒。
- 实验磁盘 IOPS 上限大概在 6w，如果不加限制，任意一个租户单独都可以打满磁盘。


首先验证租户间磁盘 IO 隔离，各租户的配置和实验结果如下方图表所示：
![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/003.png)

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/004.png)

- 磁盘已经打满时，新加入的租户 3 依然拥有 1 万 IOPS，因为其通过 MIN_IOPS 预留了 1 万；
- 租户 4 的 IOPS 没有超过 5 千，因为其通过 MAX_IOPS 设置了资源上限；
- 无论负载如何变化，租户 1 和租户 2 的 IOPS 比值大概为 2 : 1，正如权重比例要求。


接下来，我们将验证租户内负载的隔离。我们在租户 2 内设置了 4 个类别的负载，各负载的配置和实验结果如下方图表所示：

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/005.png)

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/05_effect_of_resource_isolation/006.png)

- B 负载稳定在近 2000 IOPS，哪怕其权重为 0，因为 B 负载通过 MIN_PERCENT 预留了租户 MIN_IOPS 97% 的资源；
- A 负载稳定在 1000 IOPS 左右，因为其 MAX_PERCENT 为 1，最多只能使用租户 MAX_IOPS 1% 的资源；
- C、D 负载的 IOPS 比例始终保持大约 2 : 1，因为其权重为 50 : 25。

从上述两个实验可以看出，OceanBase 在支持租户间磁盘 IO 隔离的同时，还支持租户内负载间的磁盘 IO 隔离，且都满足 reservation（保留），limitation（限制），proportion（比例）这三种资源隔离语义。

## 推荐阅读

* [为什么资源隔离对 HTAP 至关重要？](https://open.oceanbase.com/blog/10900412)

* [给用户足够灵活简单的 IO 隔离体验](https://open.oceanbase.com/blog/3105048832)