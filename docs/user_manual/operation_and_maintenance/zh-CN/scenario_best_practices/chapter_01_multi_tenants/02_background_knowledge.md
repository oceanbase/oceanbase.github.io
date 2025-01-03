---
title: 租户背景知识
weight: 2
---

> 本文中标红的内容，均为用户在使用 OceanBase 进行测试和生产过程中容易被忽略的问题，且忽略后往往可能会造成严重影响。希望大家能够重点关注。

## 租户定义

租户是集群之上的递进概念，OceanBase 数据库采用了多租户架构。多租户架构适用于资源整合（Resource Consolidation）、SaaS 服务等场景，同时也降低了运维复杂度。

集群偏向于部署层面的物理概念，是 Zone 和节点的集合，Zone 和节点具有部署地域（称为 Region）等属性；而租户则偏向于资源层面的逻辑概念，是在物理节点上划分的资源单元，可以指定其资源规格，包括 CPU、内存、日志盘空间、IOPS 等。

**租户类似于传统数据库的数据库实例。租户通过资源池与资源关联，从而独占一定的资源配额，可以动态调整资源配额。在租户下可以创建 Database、表、用户等数据库对象。**

要描述清楚租户的概念，首先需要描述清楚资源规格、资源单元（Unit）、资源池等前置概念：

* 资源规格

  资源规格定义了常见物理资源项的大小，包括 CPU、内存、磁盘空间、IOPS 等。创建资源池时指定其资源规格，从而根据定义创建资源单元。

* 资源单元（Unit）

  Unit 是租户管理中非常重要的概念。OceanBase 按照 Unit 来管理物理资源，是 CPU、内存、存储空间、IOPS 等物理资源的集合。Unit 也是资源调度的基本单位，其具有节点、Zone、Region 等位置属性，节点是服务器的抽象，Zone 是机房的抽象，Region 是地域的抽象，通过调整 Unit 的位置属性从而调整租户的部署方式。

* 资源池

  每个 Unit 都归属于一个资源池，每个资源池由若干个 Unit 组成，资源池是资源分配的基本单位，同一个资源池内的各个 Unit 具有相同的资源规格，即该资源池内 Unit 的物理资源大小都相同。

  ![资源池](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/001.png)

  如上图，展示了一个由 6 个 Unit 组成的资源池 a_pool，该资源池具有如下重要属性：

  * `ZONE_LIST`：描述了该资源池中的 Unit 分布在哪些 Zone，本例为 `ZONE_LIST='zone1,zone2,zone3'`。
  * `Unit_NUM`：描述了 `ZONE_LIST` 中每个 Zone 中的 Unit 个数，本例为 `Unit_NUM=2`。
  * `Unit_CONFIG_ID`：描述了该资源池关联的资源规格，从而决定该资源池中每个 Unit 的物理资源大小，包括 CPU、内存、日志盘空间、IOPS 等。

通过 Unit 的概念，我们将 OceanBase 数据库的物理概念和逻辑概念进行了关联。每个租户有若干 Unit，分布于若干 Zone 的若干节点上。而每个节点上分布有若干个 Unit，这些 Unit 归属于不同租户。概括的讲：集群由节点组成，节点是 Unit 的容器。租户由 Unit 组成，Unit 是数据库对象的容器。

创建租户时通过设置 `RESOURCE_POOL_LIST`，可以指定该租户关联到的资源池，从而该租户拥有指定资源池的 Unit。例如：设置租户 `a` 的 `RESOURCE_POOL_LIST=('a_pool')`，其部署图如下：

![租户资源池](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/002.png)

该租户部署于 3 个 Zone，每个 Zone 有 2 个 Unit，可以通过调整 `a_pool` 的 `Unit_CONFIG_ID` 参数来动态调整租户的物理资源。

还可以通过调整 Unit 在同一个 Zone 内不同节点的分布（称为 Unit 迁移），从而达到 Zone 内不同节点间的负载均衡。节点故障时通过将其上的 Unit 迁移到同 Zone 内其他节点上，从而达到自动容灾恢复的目的。通过调整 Unit 在不同 Zone 的分布（变更租户的 Locality 属性），从而调整租户的部署模式，例如 “同城三中心”、“两地三中心”、“三地五中心” 等，从而具备不同的容灾等级。

## 租户类型

OceanBase 数据库 V4.0 开始，有三种类型的租户：系统租户、用户租户，以及每个用户租户对应的 Meta 租户。

在 4.x 以前的版本中，只有系统租户和用户租户，存在本该属于用户租户的数据存放到了系统租户的问题，导致系统租户比较臃肿，引发系统租户资源占用过多、资源统计粒度粗、资源隔离不足等问题，对集群稳定性造成了较大挑战。OceanBase 数据库 V4.0 开始引入了 Meta 租户，为每个用户租户配置一个对应的 Meta 租户来管理用户租户的私有数据，并使用用户租户的资源。

Root Service 承担了 OceanBase 数据库的大量管理工作，包括集群管理，租户管理，资源管理，负载均衡，每日合并调度，迁移复制等，Root Service 基于系统租户支持以上功能。系统租户是 OceanBase 数据库内部用来处理集群公共任务的数据库实例。

### 租户类型介绍

* 系统租户

  系统租户是集群默认创建的租户，与集群生命期一致，负责管理集群和所有租户的生命周期。系统租户仅有一个 1 号日志流，只支持单点写入，不具备扩展能力。系统租户可以创建用户表，所有的用户表和系统表数据均由 1 号日志流服务。系统租户数据是集群私有的，不支持物理备份恢复。

  系统租户是应用系统访问 OceanBase 数据库的入口，客户端解析应用系统配置文件后访问 Config Server 获取系统租户的 IP 列表，然后访问系统租户逐级获取元数据，并最终建立与目标租户的连接。系统租户的容量是稳定性的一大挑战，大量应用系统同时重启时会产生建立连接的流量尖峰，短时间耗尽系统租户的工作线程，导致应用系统与目标租户建立连接失败。系统租户不具备横向扩展能力，可以对系统租户垂直扩容，或者调整集群配置项。

  虽然有多副本机制保证系统租户可以容忍少数派节点故障，但系统租户依然是集群的单点。由于内核 Bug 导致系统租户异常后将会影响 OceanBase 集群的服务可用性，会导致客户端无法建立连接、及集群内部的管理工作异常，系统租户的稳定性对 OceanBase 集群的稳定性至关重要。系统支持了一套检测机制，通过该机制发现系统租户的异常，并通过运维命令强制切主来恢复。也可以通过外部 admin 工具来强制切换服务，新主上任后，再隔离原来的异常机器。
  
  <font color="red">**注意：系统租户只用于集群管理和租户管理，不提供完整的数据库功能，切勿在生产或业务测试等场合使用 ！生产和测试场合需要创建并使用用户租户。**</font>


* 用户租户

  用户租户是由用户创建的租户，对外提供完整的数据库功能，社区版本支持 MySQL 兼容模式。用户租户支持服务能力水平扩展到多台机器上，支持动态扩容和缩容，内部会根据用户配置自动创建和删除日志流。用户租户的数据有更强的数据保护和可用性要求，支持跨集群物理同步和物理备份恢复，典型数据包括：schema 数据、用户表数据、事务数据等。

* Meta 租户

  Meta 租户是 OceanBase 数据库内部自管理的租户，每创建一个用户租户会创建一个对应的 Meta 租户，其生命周期与用户租户保持一致。Meta 租户用于存储和管理用户租户的租户私有数据，这部分数据不需要跨库物理同步以及物理备份恢复，例如：配置项、位置信息、副本信息、日志流状态、备份恢复相关信息、合并信息等。 Meta 租户不可登录，普通用户只能通过系统租户的视图查询 Meta 租户下的数据。Meta 租户没有独立的 Unit，创建租户时默认为 Meta 租户预留资源，各项资源从用户租户资源中扣除。

用户租户与 Meta 租户是相关的概念，可以简单理解为：用户租户存放的都是与用户数据相关的信息，包括用户创建的表和部分系统表，这部分数据需要在主备集群之间同步，物理备份恢复也需要操作这部分数据；而 Meta 租户存放的都是支撑用户租户运行的租户私有数据，主备集群会各自创建自己的 Meta 租户，物理备份数据恢复出来的租户也会有自己的 Meta 租户，所以这部分数据不需要在主备集群之间同步，也不需要备份。系统租户与 Meta 租户类似，存放的是支撑集群运行的集群私有数据，同样无需主备集群之间同步及物理备份。

![租户类型1](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/003.png)

如上图所示：

* 租户是 OceanBase 数据库中的一个实例，独占一定的物理资源，类似于云环境下的 Docker。
* 系统租户是集群默认创建的租户，与集群生命周期一致，负责管理集群和所有的用户租户。
* 用户租户由用户创建，用户租户与 Meta 租户一一对应，具有相同的生命周期。
* 私有数据表示支撑集群和用户租户运行的数据，每个集群和租户都会有自己的数据，这部分数据不需要在主备集群之间同步，也不需要物理备份。
* 非私有数据表示用户数据，包括用户创建的表和部分系统表，需要在主备集群之间同步及物理备份。
* 系统租户和 Meta 租户仅有一个 1 号日志流，不具备水平扩展能力。
* 用户租户支持动态创建和删除日志流，具备水平扩展能力。

### 租户信息查询

登录系统租户，查询 `DBA_OB_TENANTS` 视图即可查看所有的租户。`TENANT_TYPE` 表示租户类型：`SYS` 为系统租户，`META` 为 Meta 租户，`USER` 为用户租户。租户 ID 为 1 的是系统租户。租户 ID 大于 1000 的租户中，偶数的是用户租户，奇数的是 Meta 租户，并且用户租户的租户 ID 比其对应 Meta 租户大 1。

示例如下：

```shell
obclient [oceanbase]>  SELECT * FROM DBA_OB_TENANTS;
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | CREATE_TIME                | MODIFY_TIME                | PRIMARY_ZONE | LOCALITY      | PREVIOUS_LOCALITY | COMPATIBILITY_MODE | STATUS | IN_RECYCLEBIN | LOCKED | TENANT_ROLE | SWITCHOVER_STATUS | SWITCHOVER_EPOCH | SYNC_SCN            | REPLAYABLE_SCN      | READABLE_SCN        | RECOVERY_UNTIL_SCN  | LOG_MODE     | ARBITRATION_SERVICE_STATUS |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
|         1 | sys         | SYS         | 2023-05-17 18:10:19.940353 | 2023-05-17 18:10:19.940353 | RANDOM       | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1001 | META$1002   | META        | 2023-05-17 18:15:21.455549 | 2023-05-17 18:15:36.639479 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1002 | mysql001    | USER        | 2023-05-17 18:15:21.461276 | 2023-05-17 18:15:36.669988 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684395321137516636 | 1684395321137516636 | 1684395321052204807 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
|      1003 | META$1004   | META        | 2023-05-17 18:18:19.927859 | 2023-05-17 18:18:36.443233 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1004 | oracle001   | USER        | 2023-05-17 18:18:19.928914 | 2023-05-17 18:18:36.471606 | zone1        | FULL{1}@zone1 | NULL              | ORACLE             | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684395321137558760 | 1684395321137558760 | 1684395320951813345 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
5 rows in set
```

### 租户类型的区别

从用户视角，三种租户的关键特性的异同点如下：

| 对比项 | 系统租户 | 用户租户 | Meta 租户 |
|------|---------|---------|-----------|
| 租户 ID（TENANT_ID） | 固定值：1 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;| 最小值：1002 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;| 最小值：1001<br></br> 与用户租户 ID 关系：Meta 租户 ID + 1 = 对应的用户租户 ID |
| 租户类型（TENANT_TYPE） | SYS    | USER | META |
| 租户名规范 | SYS    | 大小写英文字母、数字和下划线 | `META${user_tenant_id}`。例如：用户租户的租户 ID 为 1002，Meta 租户名为：META$1002 |
| 数据属性 | 集群私有数据    | 租户非私有数据 | 租户私有数据 |
| 扩展性 | 数据不可水平扩展，只有一个日志流    | 具备水平扩展能力，支持动态扩容和缩容 | 数据不可水平扩展，只有一个日志流 |
| 租户运维 | <ul><li>创建：不支持</li><li>删除：不支持&emsp;</li><li>重命名：不支持</li><li>用户登录：支持</li><li>修改 Locality：支持</li><li>修改 Primary Zone：支持</li></ul>   | <ul><li>创建：支持</li><li>删除：支持</li><li>重命名：支持</li><li>用户登录：支持</li><li>修改 Locality：支持</li><li>修改 Primary Zone：支持</li></ul>  | <ul><li>创建：不支持</li><li>删除：不支持</li><li>重命名：不支持</li><li>用户登录：不支持</li><li>修改 Locality：不支持</li><li>修改 Primary Zone：不支持</li></ul>  |
| 数据对外访问接口 | 系统租户下的视图。    | <ul><li>系统租户下：<ul><li>`CDB_xxx` 视图和动态性能视图会展示所有用户租户的数据。</li><li>`DBA_OB_TENANTS` 视图会展示所有用户租户的信息。</li></ul></li><li> 用户租户下：展示本租户的数据。</li></ul>| Meta 租户不能直接登录，它的信息可以通过用户租户和系统租户进行访问。<ul><li>系统租户下：<ul><li>`CDB_xxx` 视图和动态性能视图会展示所有 -Meta 租户的数据。</li><li>`DBA_OB_TENANTS` 视图会展示所有 Meta 租户的信息。</li></ul></li><li> 用户租户下：Meta 租户管理的数据会通过用户租户下的视图展示出来，例如路由信息 `DBA_OB_LS_LOCATIONS`、配置项信息 `GV$OB_PARAMETERS` 等。</li></ul> |

## 用户租户

用户租户与通常所见的数据库管理系统相对应，可以被看作是一个数据库实例。它由系统租户根据业务需要所创建出来，对外提供完整的数据库功能。生产和测试场合需要创建并使用用户租户，不能使用系统租户和 Meta 租户。

用户租户具备一个实例所应该具有的所有特性，主要包括：

* 可以创建自己的用户
* 可以创建数据库（database，仅 MySQL 兼容模式支持）、表（table）等所有客体对象
* 有自己独立的系统表和系统视图
* 有自己独立的系统变量
* 数据库实例所具备的其他特性

所有用户数据的元信息都存储在用户租户下，所以每个租户都有自己的命名空间，并且彼此隔离不可访问。

集群中只有一个系统租户，通过系统租户，可以在集群中创建和管理用户租户。在用户租户中，可以创建和管理用户（user）、库（database）、表（table）、视图（view）等数据库对象。各种不同数据库对象的层级关系大致如下图所示：

![租户](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/004.png)

在用户租户下创建的用户，只能登录到本租户，对其他租户不可见。可以从视图 `mysql.user` 中查询用户信息。

在用户租户下可以创建表，创建后对其他租户不可见。可以从 `information_schema.tables` 视图中查询本租户所有用户表的信息。

用户租户只能在本租户下修改本租户的系统变量。可以从 `information_schema.global_variables` 和 `information_schema.session_variables` 视图中查询系统变量信息。也可以通过 `SHOW VARIABLES` 语句查询。

## 系统变量和配置项

OceanBase 数据库提供了 “系统变量” 和 “配置项” 两种不同的参数来对数据库的行为进行配置，使之能够符合业务的要求。

因为有很多用户还不理解系统变量和配置项的影响范围，例如某个参数的设置，是会影响整个集群，还是影响当前租户，亦或是只影响当前 session。所以在介绍租户时，需要顺带向大家解释清楚这个问题。

### 租户系统变量

**OceanBase 的系统变量都是组户级的，也就是只对当前的租户生效。所以系统变量又可以被称作：租户系统变量。** 

设置系统变量时，又可以通过增加 Global 关键字或者 Session 关键字，来设置对应系统变量为全局级别或者会话级别，以调整系统变量在租户内的生效范围：
* 全局变量：表示 Global 级别的修改，数据库同一租户内的不同用户共享一个全局变量。全局变量的修改不会随会话的退出而失效。此外，全局变量修改后，对当前已打开的 Session 不生效，需要重新建立 Session 才能生效。
* 会话变量：表示 Session 级别的修改，Session 变量的修改仅对当前 Session 生效。当新的客户端连接到数据库后，数据库会复制全局变量来自动生成对应连接上的 Session 变量。

### 配置项

OceanBase 数据库的配置项分为集群级配置项和租户级配置项。

* 集群级配置项：指适用于整个 OceanBase 数据库集群的配置选项，它们具有全局性质，用于配置整个集群的基本信息、性能参数、安全选项等等。这些配置项通常包括数据备份和恢复、负载均衡等方面的配置选项。集群级配置项通常是在集群启动时进行配置，配置后不轻易修改。

* 租户级配置项：指适用于租户级别的配置选项，它们是针对单个租户或多个租户的配置选项。用于对单个租户或多个租户进行特定的配置和优化。这些配置项通常包括存储引擎参数、SQL 执行策略、访问控制等方面的配置选项。租户级配置项通常可以在租户创建和管理时进行配置，可以随时根据需要进行修改。

查询某个配置项为集群级别还是租户级别的方法如下：

```shell
obclient [test]> SHOW PARAMETERS; -- 展示所有配置项

obclient [test]> SHOW PARAMETERS like 'cpu_quota_concurrency'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: 11.158.31.20
  svr_port: 22602
      name: cpu_quota_concurrency
 data_type: NULL
     value: 4
      info: max allowed concurrency for 1 CPU quota. Range: [1,20]
   section: TENANT
     scope: TENANT
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.004 sec)

obclient [test]> SHOW PARAMETERS like 'max_string_print_length'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: 11.158.31.20
  svr_port: 22602
      name: max_string_print_length
 data_type: NULL
     value: 500
      info: truncate very long string when printing to log file. Range:[0,]
   section: OBSERVER
     scope: CLUSTER
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.005 sec)
```

scope 列对应的值为 CLUSTER 表示该配置项的生效范围为整个集群；如果 scope 列对应的值为 TENANT，则表示该配置项的生效范围为当前租户。

edit_level 列对应的值为 DYNAMIC_EFFECTIVE 时表示修改后立即生效，为 STATIC_EFFECTIVE 时则表示需要在重启 OBServer 节点后生效。

**注意：**

**上述的查询结果中有一个比较容易和 scope 混淆的 section 列，值可能为：LOAD_BALANCE、DAILY_MERGE、RPC、TRANS、LOCATION_CACHE 等等，甚至可能为 TENANT 或者 OBSERVER（上面的示例就专门展示了这种情况）。<font color="red">这个 section 仅仅是一个 tag，只有标签性质，表示这个配置项和哪个模块相关，不代表配置项的生效范围，大家切记要将 scope 和 section 列的含义区分开！</font>**

**尤其是要注意类似于 TENANT 或者 OBSERVER 这种 tag，估计研发同学在写标签的时候实在不知道相应的配置项该归为哪个模块更合适了，就直接偷懒把标签打成了 TENANT 或者 OBSERVER，但这个标签并不代表对当前 tenant 或者当前 session 直连的某个 OBServer 生效。**  


<br></br>
<br></br>
最后附上一个配置项与系统变量的对比：

| 对比项   | 配置项 | 系统变量 |
|---------|-----------|---------|
| 生效范围 &emsp;&emsp;&emsp;&emsp; | 分为集群、Zone、机器和租户。 | 分为租户的 Global 或 Session 级别。 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; |
| 生效方式 | <ul><li> 动态生效：<code>edit_level</code> 为 <code>dynamic_effective</code></li><li> 重启生效：<code>edit_level</code> 为 <code>static_effective</code></li></ul> | <ul><li>设置 Session 级别的变量仅对当前 Session 有效，对其他 Session 无效。</li><li> 设置 Global 级别的变量对当前 Session 无效，需要重新登录建立新的 Session 才会生效。 </li></ul> |
| 修改方式 | <ul><li>支持通过 SQL 语句修改，示例：<br></br><code>Alter SYSTEM SET schema_history_expire_time='1h';</code></li><li>支持通过启动参数修改，示例：<br></br><code>cd /home/admin/oceanbase && ./bin/observer -o "schema_history_expire_time='1h'";</code> </li></ul>| 仅支持通过 SQL 语句修改，示例如下：<ul><li>MySQL 模式<br></br><code>SET ob_query_timeout = 20000000;</code><br></br><code>SET GLOBAL ob_query_timeout = 20000000;</code><br></br></li></ul> |
| 查询方式 | 可以使用 `SHOW PARAMETERS` 语句查询。示例：`SHOW PARAMETERS LIKE 'schema_history_expire_time';` | 可以使用 `SHOW [GLOBAL] VARIABLES` 语句查询。示例如下：<ul><li>`SHOW VARIABLES LIKE 'ob_query_timeout';`</li></ul> <ul><li>`SHOW GLOBAL VARIABLES LIKE 'ob_query_timeout';`</li></ul> |
| 持久化   | 持久化到内部表与配置文件，可以在 <code>/home/admin/oceanbase/etc/observer.config.bin</code> 与 <code>/home/admin/oceanbase/etc/observer.config.bin.history</code> 文件中查询该配置项。 | 仅 Global 级别的变量会持久化，Session 级别的变量不会进行持久化。 |
| 生命周期 | 长，从进程启动到退出。 | 短，需要租户的 Schema 创建成功以后才生效。 |