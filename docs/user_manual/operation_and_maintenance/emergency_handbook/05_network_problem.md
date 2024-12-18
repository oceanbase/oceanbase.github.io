---
title: 网络抖动
weight: 5
---

> 上一小节写了一个 OceanBase 节点宕机时的故障应急思路，下面几个小节再增加其他几种硬件 / 环境故障的处理思路。
>
> 大家如果不爱看和故障相关内容，倒也不必强行未雨绸缪。可以先收藏，遇到问题的时候再拿出来用。可以不看，但不能没有。

> **<font color="red">对于明确的网络问题，建议采用 “先隔离，后分析” 的策略。</font>**


## 业务及数据库表现
当网络发生故障或者抖动，可能会导致 OceanBase 集群内的日志流会反复发起无主选举。具体表现在应用层就是应用请求时好时坏。

- 网络轻微抖动时，可能会影响业务 SQL 访问性能。

- 网络严重抖动时，可能导致 OceanBase 通信时好时坏，进而造成频繁切主。业务甚至有可能收到数据库返回的 [ret=-4038](https://open.oceanbase.com/quicksearch?q=OB_NOT_MASTER&scope=knowledge) 这个 OB_NOT_MASTER 的报错（99.9% 都是底层发生切主导致的找不到 leader 副本）。

- 网络完全中断时，如出现网络隔离的节点是主副本节点，集群会切主，切主完成后，业务恢复。这台 OBServer 上的所有 session 如果因为网络原因全部断开，可能也会致使部分业务受到影响。

## 排查方向
- 网络丢包时，OCP 会有告警。

![image](/img/user_manual/operation_and_maintenance/emergency_handbook/05_network_problem/002.png)

- 如果有网络故障或者长时间丢包，OCP 可能直接会有[主机不可用](https://www.oceanbase.com/docs/common-ocp-1000000001740695)告警。

![image](/img/user_manual/operation_and_maintenance/emergency_handbook/05_network_problem/003.png)

- 网络故障排查方法，详见：[OceanBase 官网文档](https://www.oceanbase.com/docs/common-ocp-1000000001740641)，这里不赘述。

## 应急流程

先在集群所有节点进行网络检查，确认影响范围。

接下来的应急流程和节点宕机的流程比较类似。

### 单机网络故障

- 检查网络监控指标是否出现了丢包、超时重传等。

- **<font color="red">将被影响单机隔离，防止频繁切主（节点隔离）</font>**。
```
-- 停止节点，隔离故障节点
alter system stop server 'xx.xxx.xxx.x:2882';
```
- 排查网络问题并解决，然后解除隔离。
```
alter system start server 'xx.xxx.xxx.x:2882';
```


### 机房网络故障


- 确认受影响的副本。

- **<font color="red">租户切主，将机房对应的整个 ZONE 进行隔离（[副本隔离](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001573944)）</font>**。
```
-- 租户切主
ALTER TENANT tenant_name primary_zone='zone1';

-- 隔离 zone
ALTER SYSTEM STOP ZONE 'zone1';

SELECT zone, status FROM oceanbase.DBA_OB_ZONES;
+-------+----------+
| zone  | status   |
+-------+----------+
| zone1 | INACTIVE |
| zone2 | ACTIVE   |
| zone3 | ACTIVE   |
+-------+----------+
```

- 排查网络问题并解决，然后解除隔离。
```
ALTER SYSTEM START ZONE zone_name;

SELECT zone, status FROM oceanbase.DBA_OB_ZONES;
+-------+--------+
| zone  | status |
+-------+--------+
| zone1 | ACTIVE |
| zone2 | ACTIVE |
| zone3 | ACTIVE |
+-------+--------+
```

### 集群所有机房网络故障

如果多机房均有网络故障，且网络无法短时恢复，需要切换至备集群（再次祭出备库）。详见：[官网文档](https://www.oceanbase.com/docs/common-ocp-1000000001740130)。


## 网卡负载高应急流程（2024.12.05 补充内容）

可以参考这篇 [OceanBase 官网文档](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001574365)。

个人感觉官网上写的备份任务、导数任务等，对网络产生的影响应该远小于对磁盘产生的影响，如果瓶颈是网络，一般不会是这些原因。

不过特殊 SQL 在执行过程中，由分布式计划产生的网络 shuffle 倒是很可能会导致网络负载问题。

如果遇到这种情况，可以通过 OCP 的 SQL 诊断进行确认，对 SQL 进行调优，或者直接在 OCP 上对该 SQL 进行限流。

![image](/img/user_manual/operation_and_maintenance/emergency_handbook/05_network_problem/004.png)