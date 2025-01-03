---
title: ODP 背景知识
weight: 1
---

> 如果大家对 OceanBase 的 ODP（OceanBase Database Proxy）组件尚不了解，在阅读社区版 ODP 问题排查手册之前，建议先快速浏览这篇文档，以了解 ODP 相关的背景知识。
> 
> **<font color="red">如果时间紧迫，可以只阅读本文最开始的 “ODP 的特性” 和 “ODP 路由的实现逻辑” 这两个部分。</font>**

## ODP 的故障排查脑图
如果大家已经了解 ODP，只想对在 ODP 使用过程中遇到的问题进行排查，可以参考下面这张图片，跳转到后面几个小节进行阅读。

![image](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/000.jpg)


## ODP 是什么
ODP 是代理服务器，代理服务器会让访问数据库的链路多一跳，那为什么需要 ODP 呢？我们以下图为例进行说明。

![代理](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/001.png)

图中 APP 是我们的业务程序，APP 下面有三台 ODP（ODP 的进程名叫做 obproxy），在实际部署中，ODP 和 APP 之间一般会有一个负载均衡（如 F5、LVS 或 Nginx 等）将请求分散到多台 ODP 上面，ODP 下面是 OBServer 节点，图中有 6 个 OBServer 节点。

需要使用 ODP 的原因如下：

- 数据路由
  
  ODP 可以获取到 OBServer 节点中的数据分布信息，可以将用户 SQL 高效转发到数据所在机器，执行效率更高。例如，对于 `insert into t1 where c1 in P1` 语句 ODP 可以将 SQL 转发到 Zone 2 中含有 P1 主副本的机器上。对于 `update t1 where c1 in P2` 语句 ODP 可以将 SQL 转发到 Zone 1 中含有 P2 主副本的机器上。

- 连接管理
  
  如果一个 OceanBase 集群的规模比较大，那么运维机器上、下线以及机器出现问题的概率也会相应增大。如果直连 OBServer 节点，遇到上面的情况，客户端就会发生断连。ODP 屏蔽了 OBServer 节点本身分布式的复杂性，客户连接 ODP，ODP 可以保证连接的稳定性，自身对 OBServer 节点的复杂状态进行处理。

也就是说，ODP 可以实现像使用单机数据库一样使用分布式数据库。

## ODP 的特性

作为 OceanBase 数据库的关键组件，ODP 具有如下特性：

- 高性能转发
  
  ODP 完整兼容 MySQL 协议，并支持 OceanBase 自研协议，采用多线程异步框架和透明流式转发的设计，保证了数据的高性能转发，同时确保了自身对机器资源的最小消耗。

- 最佳路由
  
  ODP 会充分考虑用户请求涉及的副本位置、用户配置的读写分离路由策略、OceanBase 数据库多地部署的最优链路，以及 OceanBase 数据库各机器的状态及负载情况，将用户的请求路由到最佳的 OBServer 节点上，最大程度的保证了 OceanBase 数据库整体的高性能运转。

- 连接管理
  
  针对一个客户端的物理连接，ODP 维持自身到后端多个 OBServer 节点的连接，采用基于版本号的增量同步方案维持了每个 OBServer 节点连接的会话状态，保证了客户端高效访问各个 OBServer 节点。

- 安全可信
  
  ODP 支持使用 SSL 访问数据，并和 MySQL 协议做了兼容，满足客户安全需求。

- 易运维
  
  ODP 本身无状态支持无限水平扩展，支持同时访问多个 OceanBase 集群。可以通过丰富的内部命令实现对自身状态的实时监控，提供极大的运维便利性。

ODP 社区版完全开源，使用 MulanPubL - 2.0 许可证，用户可以免费复制和使用源代码，修改或分发源代码时，请遵守木兰协议。

## ODP 路由的性能因素

高性能是 OceanBase 数据库的重要特性，路由对性能的影响主要在网络通信开销方面。ODP 通过感知数据分布和机器地理位置降低网络通信开销，提高整体性能。第七章是介绍 SQL 性能诊断和调优的章节，所以我们这一小节主要会从性能方面对路由策略进行介绍。

我们首先会介绍三个背景知识：

- ODP 路由的实现逻辑是什么？

- SQL 主要的计划类型有哪些？

- 如何查看资源分布信息？

### ODP 路由的实现逻辑

路由是 OceanBase 分布式数据库中的一个重要功能，是分布式架构下，实现快速访问数据的利器。

Partition 是 OceanBase 数据存储的基本单元。当我们创建一张 Table 时，就会存在表和 Partition 的映射。非分区表中，一张 Table 对应一个 Partition；分区表中一个 Table 会对应多个 Partition。

路由实现了根据 OBServer 节点的数据分布精准访问到数据所在的机器。同时还可以根据一定的策略将一致性要求不高的读请求发送给副本机器，充分利用机器的资源。路由选择输入的是用户的 SQL、用户配置规则、和 OBServer 节点状态，路由选择输出的是一个可用 OBServer 地址。

其路由实现逻辑如下图所示：

![路由逻辑](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/002.png)

1. 解析 SQL 并提取信息

   解析 SQL 模块使用的是 ODP 自己定制的 Parser 模块，只需要解析出 DML 语句中的数据库名、表名和 Hint，不需要通过其他复杂的表达式推演。

2. 通过 location cache（路由表）获取位置信息

   ODP 根据用户的请求 SQL 获取该 SQL 涉及的副本位置。ODP 每次首先会尝试从本地缓存中获取路由表，其次是全局缓存，如果都没有获取到，最后会发起异步任务去向 OBServer 节点查询路由表。对于路由表的更新，ODP 采用触发更新机制。ODP 每次会把 SQL 根据路由表转发给相应的 OBServer 节点，当 OBServer 节点发现该 SQL 不能在本地执行时，会在回包时反馈给 ODP。ODP 根据反馈决定下次是否强制更新本地缓存路由表。通常是在 OBServer 节点合并或者负载均衡导致切主时，路由表才会发生变化。

3. 确定路由规则

   ODP 需要根据不同情况确定最佳的路由规则。比如：强一致性读的 DML 请求期望发到分区主副本所在的 OBServer 节点上，弱一致性读的 DML 请求和其他请求则不要求，主副本和从副本均衡负载即可。如果 OceanBase 集群是多地部署，ODP 还提供了 LDC 路由，优先发给同机房的 OBServer 节点，其次是同城的 OBServer 节点，最后才是其他城市的 OBServer 节点。如果 OceanBase 集群是读写分离部署，ODP 还提供了读 Zone 优先、只限读 Zone、非合并优先等规则供业务按照自身特点配置。上述的几种情况在路由选择中是组合关系，输出是一个确定的路由规则。

4. 选择目标 OBServer 节点

   根据确定的路由规则从获取的路由表中选择最佳的 OBServer 节点，经过黑名单、灰名单检查后，对目标 OBServer 节点进行请求转发。

### SQL 的计划类型

分区（Partition）是数据存储的基本单元，当我们创建表时，就会存在表和分区的映射。如果是非分区表，一张表仅对应一个分区，如果是分区表，一张表可能会对应多个分区。每个分区根据副本角色又分为一个主副本和多个备副本，默认读写的都是分区的主副本。

在 OceanBase 数据库中，SQL 在执行前会生成一个执行计划，执行器根据这个执行计划来调度不同的算子完成计算。计划主要分为三种不同的类型，分别是本地（Local）计划、远程（Remote）计划和分布式（Distributed）计划。

下面以 OceanBase 数据库默认的强一致性读为例，介绍这三种不同的计划类型，即查询过程中需要访问分区的主（Leader）副本。

#### 本地计划

本地计划表示语句所涉及的所有分区的主副本都在当前 Session 所在的 OBServer 节点上，整条 SQL 在执行过程中，不需要和其他 OBServer 节点再进行额外地交互。

![本地计划](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/003.png)

一般来说，本地执行通过 explain 命令看到的计划会长这样：

```shell
========================================
|ID|OPERATOR   |NAME|EST. ROWS|COST    |
----------------------------------------
|0 |HASH JOIN  |    |98010000 |66774608|
|1 | TABLE SCAN|T1  |100000   |68478   |
|2 | TABLE SCAN|T2  |100000   |68478   |
========================================
```

#### 远程计划

远程（Remote）计划表示当前语句所涉及的所有分区主副本都与当前 Session 所在的 OBServer 节点不同，且都集中在另外一台 OBServer 节点上，需要 OBServer 节点再对 SQL 或者子计划进行一次转发。

![远程计划](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/004.png)

一般来说，远程执行通过 explain 命令看到的计划会长这样（存在 `EXCHANGE REMOTE` 算子）：

```shell
==================================================
|ID|OPERATOR            |NAME|EST. ROWS|COST     |
--------------------------------------------------
|0 |EXCHANGE IN REMOTE  |    |98010000 |154912123|
|1 | EXCHANGE OUT REMOTE|    |98010000 |66774608 |
|2 |  HASH JOIN         |    |98010000 |66774608 |
|3 |   TABLE SCAN       |T1  |100000   |68478    |
|4 |   TABLE SCAN       |T2  |100000   |68478    |
==================================================
```

上面的计划中，0 号 `EXCHANGE IN REMOTE` 算子和 1 号 `EXCHANGE OUT REMOTE` 算子用于切分在不同 OBServer 节点上做的工作。

0 号算在所在的 OBServer 节点接收到 ODP 路由到的 SQL，负责生成这个远程计划，并把完整 SQL 或者 1 - 4 号算子构成的子计划转发到分区主副本所在的另一个 OBServer 节点。

1 - 4 号算子所在的 OBServer 节点负责对 `HASH JOIN` 进行计算，并通过 1 号算子 `EXCHANGE OUT REMOTE` 把计算结果返回给 0 号算在所在的 OBServer 节点。

最后 0 号算在所在的 OBServer 节点通过 `EXCHANGE IN REMOTE` 算子接收这个结果，并把计算结果继续向上层返回。

#### 分布式计划

分布式计划不能确定当前语句涉及到的分区主副本和当前 Session 的关系，往往都是 SQL 需要访问多个分区且多个分区的主副本分布在多个不同的 OBServer 节点上。

分布式计划会使用并行执行的方式进行调度，调度过程中会将其切分成多个操作步骤，每个操作步骤称之为一个 DFO（Data Flow Operation）。

![分布式计划](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/005.png)

分布式执行通过 explain 命令看到的计划（存在 `EXCHANGE DISTR` 算子）：

```shell
================================================================
|ID|OPERATOR                     |NAME    |EST. ROWS|COST      |
----------------------------------------------------------------
|0 |PX COORDINATOR               |        |980100000|1546175452|
|1 | EXCHANGE OUT DISTR          |:EX10002|980100000|664800304 |
|2 |  HASH JOIN                  |        |980100000|664800304 |
|3 |   EXCHANGE IN DISTR         |        |200000   |213647    |
|4 |    EXCHANGE OUT DISTR (HASH)|:EX10000|200000   |123720    |
|5 |     PX BLOCK ITERATOR       |        |200000   |123720    |
|6 |      TABLE SCAN             |T1      |200000   |123720    |
|7 |   EXCHANGE IN DISTR         |        |500000   |534080    |
|8 |    EXCHANGE OUT DISTR (HASH)|:EX10001|500000   |309262    |
|9 |     PX BLOCK ITERATOR       |        |500000   |309262    |
|10|      TABLE SCAN             |T2      |500000   |309262    |
================================================================
```

总的来说，Local 计划和 Remote 计划涉及到的分区主副本都分布在单节点上，ODP 的作用就是尽量消除性能较差的 Remote 计划，将路由尽可能的变为性能更优的 Local 计划。

如果通过 OBServer 节点生成 Remote 计划后再进行转发，在转发前需要对 SQL 进行完整的 parser 和 resolver 流程，还需要在优化器模块对 SQL 进行改写和选择最佳的执行计划等等，而且转发的可能还是一个网络传输代价较大的子计划。

而 ODP 转发 SQL 只需要进行 SQL 解析和简单的分区信息获取即可（参见上面的 ODP 路由的实现逻辑），整体流程相比通过 OBServer 节点生成 Remote 计划后再进行转发要轻量的多。

如果表路由类型为 Remote 计划的 SQL 过多，说明该 SQL 的路由可能存在问题（可通过查看 oceanbase.GV$OB_SQL_AUDIT 视图中 `plan_type` 字段来确认）。查看 SQL 计划类型的相关 SQL 如下：

```sql
MySQL [oceanbase]> select plan_type, count(1) from gv$ob_sql_audit where 
request_time > time_to_usec('2021-08-24 18:00:00') group by plan_type;
```

输出如下：

```shell
+-----------+----------+
| plan_type | count(1) |
+-----------+----------+
|         1 |    17119 |
|         0 |     9614 |
|         3 |     4400 |
|         2 |    23429 |
+-----------+----------+
4 rows in set
```

其中，plan_type = 1、2、3 分别表示 Local、Remote、Distribute 执行计划。一般来讲，`0` 代表无 plan 的 SQL 语句，比如：`set autocommit=0/1`，`commit` 等。

### 资源分布信息

ODP 的主要功能是提供 SQL 路由。所以要先了解数据的位置，再了解 SQL 路由策略。

#### 查看租户资源单元位置

ODP 为了把 SQL 准确地路由到最佳的节点上，首先需要知道的就是租户资源所在的节点位置信息（LOCATION CACHE）。有如下 2 种方法可以确认租户的位置：

- 系统（sys）租户直接查询

  ```sql
  select
    t1.name resource_pool_name,
    t2.`name` unit_config_name,
    t2.max_cpu,
    t2.min_cpu,
    round(t2.memory_size / 1024 / 1024 / 1024) max_mem_gb,
    round(t2.memory_size / 1024 / 1024 / 1024) min_mem_gb,
    t3.unit_id,
    t3.zone,
    concat(t3.svr_ip, ':', t3.`svr_port`) observer,
    t4.tenant_id,
    t4.tenant_name
  from
    __all_resource_pool t1
    join __all_unit_config t2 on (t1.unit_config_id = t2.unit_config_id)
    join __all_unit t3 on (t1.`resource_pool_id` = t3.`resource_pool_id`)
    left join __all_tenant t4 on (t1.tenant_id = t4.tenant_id)
  order by
    t1.`resource_pool_id`,
    t2.`unit_config_id`,
    t3.unit_id;
  ```

  输出如下：

  ```shell
  +------------------------------+-----------------------------------+---------+---------+------------+------------+---------+-------+--------------------+-----------+---------------+
  | resource_pool_name           | unit_config_name                  | max_cpu | min_cpu | max_mem_gb | min_mem_gb | unit_id | zone  | observer           | tenant_id | tenant_name   |
  +------------------------------+-----------------------------------+---------+---------+------------+------------+---------+-------+--------------------+-----------+---------------+
  | sys_pool                     | config_sys_zone1_xiaofeng_sys_lpj |       3 |       3 |          6 |          6 |       1 | zone1 | xx.xxx.xx.20:22602 |         1 | sys           |
  | pool_for_tenant_mysql        | 2c2g                              |       2 |       2 |          2 |          2 |    1001 | zone1 | xx.xxx.xx.20:22602 |      1002 | mysql         |
  | pool_mysql_standby_zone1_xcl | config_mysql_standby_zone1_S1_xic |     1.5 |     1.5 |          6 |          6 |    1002 | zone1 | xx.xxx.xx.20:22602 |      1004 | mysql_standby |
  +------------------------------+-----------------------------------+---------+---------+------------+------------+---------+-------+--------------------+-----------+---------------+
  3 rows in set
  ```

- 普通用户租户直接查询

  ```sql
  select * from GV$OB_UNITS where tenant_id=1002;
  ```

  在业务租户里，条件 `tenant_id=1002` 也可以不加，因为每个业务租户只能查看自己的租户资源单元信息，命令输出如下：

  ```shell
  +--------------+----------+---------+-----------+-------+-----------+------------+---------+---------+-------------+---------------------+---------------------+-------------+---------------+-----------------+------------------+--------+----------------------------+
  | SVR_IP       | SVR_PORT | UNIT_ID | TENANT_ID | ZONE  | ZONE_TYPE | REGION     | MAX_CPU | MIN_CPU | MEMORY_SIZE | MAX_IOPS            | MIN_IOPS            | IOPS_WEIGHT | LOG_DISK_SIZE | LOG_DISK_IN_USE | DATA_DISK_IN_USE | STATUS | CREATE_TIME                |
  +--------------+----------+---------+-----------+-------+-----------+------------+---------+---------+-------------+---------------------+---------------------+-------------+---------------+-----------------+------------------+--------+----------------------------+
  | 1.2.3.4      |    22602 |    1001 |      1002 | zone1 | ReadWrite | sys_region |       2 |       2 |  1073741824 | 9223372036854775807 | 9223372036854775807 |           2 |    5798205850 |      4607930545 |         20971520 | NORMAL | 2023-11-20 11:09:55.668007 |
  +--------------+----------+---------+-----------+-------+-----------+------------+---------+---------+-------------+---------------------+---------------------+-------------+---------------+-----------------+------------------+--------+----------------------------+
  1 row in set
  ```

#### 查看分区副本位置

根据上面介绍的 ODP 路由的实现逻辑，ODP 在解析 SQL 获得涉及到的表和分区信息后，需要根据表和分区的信息获得对应分区的主副本的位置信息。

OceanBase 数据库 4.x 版本的副本管理策略是租户级的，即同一个租户下所有表的 Primary Zone 的规则是统一的。在系统租户下可以通过查询 `oceanbase.DBA_OB_TENANTS` 表确定租户信息。

```sql
select * from oceanbase.DBA_OB_TENANTS;
```

输出如下：

```shell
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+----------+------------+-----------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | CREATE_TIME                | MODIFY_TIME                | PRIMARY_ZONE | LOCALITY      | PREVIOUS_LOCALITY | COMPATIBILITY_MODE | STATUS | IN_RECYCLEBIN | LOCKED | TENANT_ROLE | SWITCHOVER_STATUS | SWITCHOVER_EPOCH | SYNC_SCN            | REPLAYABLE_SCN      | READABLE_SCN        | RECOVERY_UNTIL_SCN  | LOG_MODE     | ARBITRATION_SERVICE_STATUS | UNIT_NUM | COMPATIBLE | MAX_LS_ID |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+----------+------------+-----------+
|         1 | sys         | SYS         | 2024-04-10 10:48:59.526612 | 2024-04-10 10:48:59.526612 | RANDOM       | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |        1 | 4.2.3.0    |         1 |
|      1001 | META$1002   | META        | 2024-04-10 10:49:30.029481 | 2024-04-10 10:50:27.254959 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |        1 | 4.2.3.0    |         1 |
|      1002 | mysql       | USER        | 2024-04-10 10:49:30.048284 | 2024-04-10 10:50:27.458529 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1717384184174664001 | 1717384184174664001 | 1717384184174664001 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |        1 | 4.2.3.0    |      1001 |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+----------+------------+-----------+
3 rows in set
```

在系统租户下，可以通过查询 `oceanbase.cdb_ob_table_locations` 获得各个租户中所有表的各分区位置信息。

```sql
select * from oceanbase.cdb_ob_table_locations where table_name = 't1';
```

输出如下：

```shell
+-----------+---------------+------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+--------------+----------+--------+--------------+-----------------+-----------+-----------------+---------------+----------+
| TENANT_ID | DATABASE_NAME | TABLE_NAME | TABLE_ID | TABLE_TYPE | PARTITION_NAME | SUBPARTITION_NAME | INDEX_NAME | DATA_TABLE_ID | TABLET_ID | LS_ID | ZONE  | SVR_IP       | SVR_PORT | ROLE   | REPLICA_TYPE | DUPLICATE_SCOPE | OBJECT_ID | TABLEGROUP_NAME | TABLEGROUP_ID | SHARDING |
+-----------+---------------+------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+--------------+----------+--------+--------------+-----------------+-----------+-----------------+---------------+----------+
|         1 | oceanbase     | t1         |   500010 | USER TABLE | NULL           | NULL              | NULL       |          NULL |    200003 |     1 | zone1 | xx.xxx.xx.20 |    22602 | LEADER | FULL         | NONE            |    500010 | NULL            |          NULL | NULL     |
|      1002 | test          | t1         |   500087 | USER TABLE | NULL           | NULL              | NULL       |          NULL |    200049 |  1001 | zone1 | xx.xxx.xx.20 |    22602 | LEADER | FULL         | NONE            |    500087 | NULL            |          NULL | NULL     |
|      1004 | test          | t1         |   500003 | USER TABLE | NULL           | NULL              | NULL       |          NULL |    200001 |  1001 | zone1 | xx.xxx.xx.20 |    22602 | LEADER | FULL         | NONE            |    500003 | NULL            |          NULL | NULL     |
+-----------+---------------+------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+--------------+----------+--------+--------------+-----------------+-----------+-----------------+---------------+----------+
3 rows in set
```

在普通租户下，可以通过查询 `oceanbase.dba_ob_table_locations` 获得各个租户中所有表的各分区位置信息。

```sql
select database_name, table_name, table_id, table_type, zone, svr_ip, role from oceanbase.dba_ob_table_locations where table_name = 't1';
```

输出如下：

```shell
+---------------+------------+----------+------------+-------+--------------+--------+
| database_name | table_name | table_id | table_type | zone  | svr_ip       | role   |
+---------------+------------+----------+------------+-------+--------------+--------+
| test          | t1         |   500087 | USER TABLE | zone1 | xx.xxx.xx.20 | LEADER |
+---------------+------------+----------+------------+-------+--------------+--------+
1 row in set
```

#### 查看和调整 LDC 设置

逻辑数据中心（Logical Data Center，LDC）路由可用于解决分布式关系型数据库中多地多中心部署时产生的异地路由延迟问题。

OceanBase 数据库作为典型的高可用分布式关系型数据库，使用 Paxos 协议进行日志同步，天然支持多地多中心的部署方式以提供高可靠的容灾保证。但当真正多地多中心部署时，任何数据库都会面临异地路由延迟问题。逻辑数据中心（Logical Data Center，LDC）路由正是为了解决这一问题而设计的。在为 OceanBase 集群的每个 Zone 设置地区（Region）属性和机房（IDC）属性，并为 ODP 指定机房（IDC）名称配置项的情况下，当数据请求发到 ODP 时，ODP 将按 “同机房 > 同地区 > 异地” 的优先级顺序进行 OBServer 节点的选取。具体的设置方法详见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/路由策略路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517780)。

![LDC](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/006.png)

同时，OceanBase 数据库还支持通过调整系统变量的方式改变默认的路由策略，详见官网《OceanBase 数据库》文档 [参考指南/系统原理/数据链路/数据库代理/SQL 路由](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001050895)。

## ODP 路由的高可用因素

高可用因素是指 OceanBase 数据库对机器故障有容忍能力，让故障对应用透明无感知，ODP 发现 OBServer 节点故障后，路由时会排除故障节点，选择健康节点，对于正在执行的SQL也有一定的重试能力。高可用涉及故障探测、黑名单机制、重试逻辑等内容。如图所示，ODP 发现 OBServer1 故障后，将该节点加入黑名单。路由时从健康节点选择。

![高可用](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/007.png)

了解了数据路由的影响因素和路由原则后，我们就可以更高效地进行路由策略设计了。不过，现实情况会复杂很多，原则上我们要实时感知 OBServer 节点状态、数据分布等，但在工程实践中很难做到，便引发出许多问题。因此，我们在考虑路由时需要兼顾功能、性能和高可用，让 OceanBase 数据库“更好用”。

## ODP 路由的功能和策略

ODP 实现了集群路由、租户路由和租户内路由，通过 ODP 可以访问不同集群的不同租户的不同机器。接下来我们将围绕这三部分介绍 ODP 的路由功能。

### 集群路由

集群路由是指 ODP 路由功能支持访问不同的集群，它的关键点在于获取集群名和 rslist（rootservice_list） 的映射关系：

- 对于启动参数指定 rslist 的启动方式，集群名和 rslist 的映射关系通过启动参数指定。

- 对于指定 `config_server_url` 的启动方式，集群名和 rslist 的映射关系通过访问 URL 获取。

需要注意的是，这里的 rslist 不需要包含所有的集群机器列表，ODP 会通过访问视图获取集群所有机器，一般 rslist 为 RootServer（OceanBase 数据库的总控服务）所在的机器。

![集群路由步骤](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/008.png)

从上图中可以看到，OCP 是集群路由时非常重要的一个模块。当生产环境中出现集群路由问题时，需着重排查是否是 OCP 模块出现了问题。

ODP 是在用户登录首次访问集群时获取 rslist，并保存到内存中，后续再访问该集群，从 ODP 的内存中获取就可以了。

需要注意的是，因为 ODP 路由功能支持访问不同的集群，所以在命令行中通过 ODP（假设 ODP 的 ip 和 port 分别为 `127.0.0.1` 和 `2883`）进行连接时，除了需要指定用户名 user_name 和租户名 tenant_name 外，还需要额外指定要连接的集群名 cluster_name。如果一些周边工具例如 ODC 等，说明必须通过 ODP 进行连接，在 ODC 等工具中配置连接串时，也需要在连接串中加上集群名 cluster_name，例如：

```shell
mysql -h 127.0.0.1 -u user_name@tenant_name#cluster_name -P2883 -Ddatabase_name -pPASSWORD
```

如果在命令行中不通过 ODP 进行连接，而是对 OBServer 节点（假设 OBServer 节点的 ip 和 port 分别为 `1.2.3.4` 和 `12345`）进行直连，那么就只需要指定用户名和租户名，不能再额外指定对应的集群名了。例如：

```shell
mysql -h 1.2.3.4 -u user_name@tenant_name -P12345 -Ddatabase_name -pPASSWORD
```

### 租户路由

OceanBase 数据库中，一个集群有多个租户，租户路由是指 ODP 路由功能支持访问不同的租户。在众多租户中，sys 租户比较特殊，类似于管理员租户，和集群管理相关。我们将分开讨论 sys 租户路由和普通租户路由。

#### sys 租户路由

ODP 完成上述的集群路由后，可获得集群的 rslist，此时 ODP 会通过 proxyro@sys 账号登录 rslist 中的一台机器，并通过视图 `DBA_OB_SERVERS` 获取集群的所有机器节点。

在 OceanBase 数据库的现有实现中，sys 在每个节点都有分布，因此，`DBA_OB_SERVERS` 返回的结果也就是 sys 租户的路由信息。

ODP 会每 15 秒访问一次 `DBA_OB_SERVERS`，维护最新的路由信息，这样可以感知到集群发生的节点变更。除了集群机器列表，ODP 还会通过 sys 租户获取 partition 分布信息、Zone 信息、租户信息等。

#### 普通租户路由

与 sys 租户的路由信息就是集群的机器列表不同，普通租户路由信息是租户资源所在的机器。

ODP 查询租户路由信息并不是通过 unit 相关的表，而是通过特殊表名 `__all_dummy` 表示查询租户信息。ODP 需要通过内部表 `__all_virtual_proxy_schema` 获取租户的机器列表，在访问 `__all_virtual_proxy_schema` 时，ODP 指定表名（`__all_dummy`）和指定租户名获取租户的节点信息。

![普通租户路由](/img/user_manual/operation_and_maintenance/zh-CN/tool_emergency_handbook/odp_troubleshooting_guide/01_introduction/009.png)

ODP 会将获取到的租户信息保存在本地内存中，并根据一定策略进行缓存信息的更新。对于 sys 租户，通过每 15 秒一次的拉取任务获得最新的信息；对于普通租户，ODP 的刷新频率并不高，普通租户的路由缓存策略如下：

- 创建：首次访问租户时，通过 `__all_virtual_proxy_schema` 获得普通租户路由信息并创建。

- 淘汰：当 OBServer 节点返回错误码 `OB_TENANT_NOT_IN_SERVER` 时设置缓存失效。

- 更新：当缓存失效后重新访问 `__all_virtual_proxy_schema` 获得普通租户路由信息。

总的来说，在多租户架构下，ODP 通过 sys 租户获得元数据信息（sys 租户本身路由信息就是集群的机器列表），然后通过元数据信息获得租户的路由信息。通过租户路由功能，ODP 支持了 OceanBase 数据库的多租户架构。

#### 租户内路由

##### 强一致性读路由策略

路由策略很多，这里针对部分主要的路由策略由简单到复杂进行列举。

- 强一致性读路由策略将 SQL 路由到访问表的分区的主副本所在节点。这一条理解起来比较简单，但实际 SQL 情形很复杂。

- 如果 SQL 访问了两个表，会依据第一个表及其条件判断出该分区主副本节点。如果无法判断就随机发。所以 SQL 里多表连接时，表的前后顺序对路由策略是有影响的，间接对性能有影响。

- 如果要判断的表是分区表，会判断条件是否是分区键等值条件。如果不是，则不能确定是哪个分区，就随机发到该表的所有分区所在的节点任意一个。

- 如果开启事务了，则事务里开启事务的 SQL 的路由节点会作为事务后面其他 SQL 路由的目标节点，直到事务结束（提交或者回滚）为止。

- 当 SQL 被 ODP 路由分配到一个节点上时：
  
  - 如果要访问的数据分区的主副本恰好在那个节点上，SQL 就在该节点执行，这个 SQL 的执行类型是本地 SQL（`plan_type` 为 `1`）。
  
  - 如果要访问的数据分区的主副本不在这个节点上，SQL 会被 OBServer 节点再次转发。这个 SQL 的执行类型是远程 SQL（`plan_type` 为 `2`）。
  
  - 如果 SQL 执行计划要访问的数据分区是跨越多个节点，则这个 SQL 的执行类型是分布式 SQL（`plan_type` 为 `3`）。

- 如果事务中有复制表的读 SQL，只要 SQL 被路由到的节点上有该复制表的备副本，则该 SQL 可以读取本地备副本，因为复制表的所有备副本跟主副本是强一致的。这个 SQL 的执行类型是本地 SQL。

实际 SQL 类型很复杂，ODP 的路由策略也变得很复杂，有时候会出现路由不准的情形。如果不符合设计预期就可能会产生 BUG，但很可能也是设计如此（BY DESIGN）。毕竟当前版本的 ODP 只能做简单的 SQL 解析，不像 OceanBase 数据库那样做完整的执行计划解析。

当业务 SQL 很多很复杂时，远程 SQL 和分布式 SQL 将会无法避免，这时主要观察远程 SQL 和分布式 SQL 在业务 SQL 中的占比。如果比例很高，整体上业务 SQL 性能都不会很好。此时应尽可能地减少远程 SQL 和分布式 SQL。比如，通过表分组、复制表和 PRIMARY_ZONE 设置等。

##### 弱一致性读路由策略

OceanBase 数据库默认是强一致性读，即写后读立即可见（READ AFTER WRITER）。使用强一致性读策略时，ODP 会优先路由到访问表的分区的主副本节点上。

和强一致性读对立的就是弱一致性读，弱一致性读不要求写后读立即可见。弱一致性读也可以路由到分区的主副本和备副本节点，通常有三副本所在节点可以选。

但是开启弱一致性读后，如果 OceanBase 数据库和 ODP 都开启了 LDC 特性，那么弱一致性读语句的路由策略会改变，弱一致性读语句将按下述顺序进行路由：

- 同一个机房或者同一个 Region 状态不是合并中（merging）的节点。

- 同一 Region 中正在合并的节点。

- 其他 Region 的不在合并的或在合并的节点。

即 ODP 会尽力避开合并中的节点。不过若 OceanBase 集群关闭了轮转合并（参数 `enable_merge_by_turn` 设置为 `false`），合并（major freeze）则是所有节点都开始合并，那么 ODP 也就无法避开合并中的节点。

还有一些 SQL 不是访问数据，而是查看或者设置变量值等。如：

```sql
set @@autocommit=off
show variables like 'autocommit';
```

这类 SQL 的路由策略则是随机路由。在随机路由策略中，如果 OceanBase 数据库和 ODP 开启了 LDC 设置，也会按照上文的路由顺序进行路由。

弱一致性读通常用在读写分离场景中。不过当租户 PRIMARY_ZONE 为 `RANDOM` 时，租户的所有分区的主副本也是分散在所有 Zone 下，这时弱一致性读备副本的意义也不是很大。

但是，如果使用了只读副本，只读副本设置为独立的 IDC，然后单独的 ODP 设置为同一个 IDC，则这个 ODP 可以用于只读副本的路由。

##### 其他路由策略

ODP 的路由策略非常丰富，本小节只做大概的介绍。大家仅需了解上述的两个最基本的 ODP 路由策略（强度策略和弱读策略）即可。

ODP 租户内路由的完整策略如下。

- 指定 IP 路由
  
  通过 ODP 配置项（`target_db_server`）或语句注释指定 OBServer 节点，ODP 会将语句准确路由至指定的 OBServer 节点。此路由功能优先级最高，当指定 IP 时，ODP 会忽略其他的路由功能。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/指定 IP 路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517773)。

- 强读分区表路由
  
  在强读分区表的语句中提供分区键值、表达式或分区名称，ODP 会将语句准确路由到数据所在分区的主副本 OBServer 节点执行。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/强读分区表路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517777)。

- 强读全局索引表路由
  
  在强读主表的语句中提供全局索引表的列值、表达式或索引分区名称，ODP 会将语句准确路由到数据所在的索引分区的主副本 OBServer 节点执行。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/强读全局索引表路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517779)。

- 强读复制表路由
  
  在强读复制表时，ODP 将语句路由至与 ODP 位置关系最近的 OBServer 节点执行。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/强读复制表路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517774)。

- 强读 Primary Zone 路由
  
  通过 ODP 配置项配置 Primary Zone，ODP 将无法计算路由的强读语句路由至 Primary Zone 内的 OBServer 节点。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/强读 Primary Zone 路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517782)。

- 路由策略路由
  
  ODP 按照用户配置的路由策略规则进行路由。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/路由策略路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517780)。

- 分布式事务路由
  
  通过 ODP 配置项（enable_transaction_internal_routing）开启，开启后事务内的语句不受事务开启节点限制，无需强制路由至事务开启的 OBServer 节点。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/分布式事务路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517775)。

- 二次路由
  
  通过 ODP 配置项开启后，当语句路由至某 OBServer 节点，但未命中分区或者分布式事务无法在该 OBServer 节点执行时，ODP 可以重新进行一次准确路由。详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/二次路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517781)。

- 强制路由
  
  用户无法控制此行为，由 ODP 决定是否强制路由，主要有以下几种情况。详详细介绍请参见官网《OceanBase 数据库代理》文档 [数据路由/租户内路由/强制路由](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000000517776)。
  
  - 非分布式事务路由，事务内语句强制路由至事务开启 OBServer 节点。
  
  - 会话级临时表路由，对会话级临时表进行查询时，会强制路由至第一次查询临时表的 OBServer 节点。
  
  - 复用会话路由，当计算路由失败且 enable_cached_server 配置项开启时，ODP 会强制路由到上一次会话所在的 OBServer 节点。
  
  - CURSOR/PIECES 路由，客户端使用 CURSOR/PIECES 流式获取/上传数据时，所有请求会强制路由至同一 OBServer 节点。

  ## 推荐阅读
  - OceanBase 社区博客专题：[《详解 OBProxy：高性能的数据访问中间件》](https://open.oceanbase.com/blog/topics/3983484160)。