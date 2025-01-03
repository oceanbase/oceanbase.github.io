---
title: 配置租户内资源隔离
weight: 4
---

本文档主要介绍 MySQL 模式下租户内资源隔离的配置方法。

## 前提条件

* 开始配置资源隔离前，建议先阅读并了解《租户内资源隔离概述》的内容。
* 由于 CPU 的资源隔离依赖 cgroup，如果需要控制 CPU 的资源隔离，则在开始配置资源隔离前，必须配置 cgroup 目录并开启 cgroup 功能。配置 cgroup 目录并开启 cgroup 功能的相关操作请参见：《CPU 资源隔离准备工作》。

  配置 User 级资源隔离和 Function 级资源隔离时，如果不需要控制 CPU 的资源隔离（仅需要进行 IOPS 资源隔离），则不需要配置 cgroup；配置 SQL 级资源隔离时，无论是否需要控制 CPU 的资源隔离，均需要配置 cgroup。

* 在进行 IOPS 资源隔离前，需要先进行磁盘性能校准，磁盘性能校准的相关操作请参见《IOPS 资源隔离准备工作》

  如果仅需要控制 CPU 的资源隔离，则不需要进行磁盘性能校准。

* 请确认已创建好需要进行资源隔离的用户。

* 如果需要配置 SQL 级资源隔离，请确认已创建好需要进行资源隔离的数据库、表及列。

## 步骤一（可选）：将租户的 MAX_IOPS 和 MIN_IOPS 配置为有效值

说明：如果您在创建租户所使用的 Unit 规格时，已将 <code>MAX_IOPS</code> 和 <code>MIN_IOPS</code> 设置为 16 KB 读对应的 IOPS 值，或者，您不需要控制 IOPS 的资源隔离，请忽略本步骤。

完成磁盘校准后，在配置资源隔离计划前，需要保证租户的资源规格中 `MAX_IOPS` 和 `MIN_IOPS` 的值为有效值，这里的有效值指的是以 16 KB 读对应的 IOPS 值作为租户 IOPS 配置的参考值。

1. 使用 `root` 用户登录集群的 `sys` 租户。

2. 执行以下命令，查看待进行资源隔离的租户的资源规格。

   ```sql
   obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS;
   ```

   查询结果的示例如下：

   ```shell
   +----------------+-----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
   | UNIT_CONFIG_ID | NAME            | CREATE_TIME                | MODIFY_TIME                | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS            | MIN_IOPS            | IOPS_WEIGHT |
   +----------------+-----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
   |              1 | sys_unit_config | 2023-12-19 13:55:04.463295 | 2023-12-19 13:56:08.969718 |       3 |       3 |  2147483648 |    3221225472 | 9223372036854775807 | 9223372036854775807 |           3 |
   |           1001 | small_unit      | 2023-12-19 13:56:09.851665 | 2023-12-19 13:56:09.851665 |       1 |       1 |  2147483648 |    6442450944 | 9223372036854775807 | 9223372036854775807 |           1 |
   |           1002 | medium_unit     | 2023-12-19 13:56:10.030914 | 2023-12-19 13:56:10.030914 |       8 |       4 |  8589934592 |   25769803776 | 9223372036854775807 | 9223372036854775807 |           4 |
   |           1003 | large_unit      | 2023-12-19 13:56:10.112115 | 2023-12-19 13:56:10.112115 |      16 |       8 | 21474836480 |   64424509440 | 9223372036854775807 | 9223372036854775807 |           8 |
   +----------------+-----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
   4 rows in set
   ```

   根据查询结果，如果该租户的 `MAX_IOPS` 和 `MIN_IOPS` 均为默认值 `INT64_MAX`（9223372036854775807），则需要对租户可使用的 IOPS 资源重新进行规划。
   
3. 执行以下命令，确认租户部署在哪些 OBServer 节点上。

   ```sql
   obclient [oceanbase]> SELECT DISTINCT SVR_IP, SVR_PORT FROM oceanbase.CDB_OB_LS_LOCATIONS WHERE tenant_id = xxxx;
   ```

   查询结果的示例如下：

   ```shell
   +----------------+----------+
   | SVR_IP         | SVR_PORT |
   +----------------+----------+
   | xx.xxx.xxx.xx1 |    xxxx1 |
   | xx.xxx.xxx.xx1 |    xxxx2 |
   | xx.xxx.xxx.xx1 |    xxxx3 |
   +----------------+----------+
   3 rows in set
   ```

4. 执行以下命令，确认待进行资源隔离的租户所在的 OBServer 节点上的磁盘校准值，使用 16 KB 读的磁盘校准值作为该节点 IOPS 设置的上限值。

   ```sql
   obclient [oceanbase]> SELECT * FROM oceanbase.GV$OB_IO_BENCHMARK WHERE MODE='READ' AND SIZE=16384;
   ```

   查询结果的示例如下：

   ```shell
   +----------------+----------+--------------+------+-------+-------+------+---------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | MODE | SIZE  | IOPS  | MBPS | LATENCY |
   +----------------+----------+--------------+------+-------+-------+------+---------+
   | xx.xxx.xxx.xx1 |    xxxx1 | DATA         | READ | 16384 | 48162 |  752 |     331 |
   | xx.xxx.xxx.xx1 |    xxxx2 | DATA         | READ | 16384 | 47485 |  741 |     336 |
   | xx.xxx.xxx.xx1 |    xxxx3 | DATA         | READ | 16384 | 48235 |  753 |     331 |
   +----------------+----------+--------------+------+-------+-------+------+---------+
   3 rows in set
   ```

   根据查询结果，将获取到的各节点的磁盘校准值作为上限值来规划租户可用的 IOPS。由于集群内可能有多个租户部署在相同的 OBServer 节点，您可以需要根据业务实际情况来分配这些 IOPS。
   
   假设某集群下有两个租户，且两个租户都部署在相同的 OBServer 节点上，每个 OBServer 节点的 16 KB 读的磁盘 IOPS 基准值均相同，为 20000 IOPS，同时，预计两个租户的负载差不多，则可以将 20000 IOPS 平分给两个租户（具体可根据实际业务情况来为租户划分可用的 IOPS），即每个租户的 `MAX_IOPS` 和 `MIN_IOPS` 均配置为 10000，您也可以根据业务考虑，将 `MIN_IOPS` 设置为小于 `MAX_IOPS` 的某个值。

5. 执行以下命令，修改租户的 `MAX_IOPS` 和 `MIN_IOPS` 值。

   建议先修改 `MIN_IOPS` 后再修改 `MAX_IOPS`。

   ```sql
   ALTER RESOURCE UNIT unit_name MIN_IOPS = xxx;
   ```

   ```sql
   ALTER RESOURCE UNIT unit_name MAX_IOPS = xxx;
   ```

## 步骤二：配置资源隔离计划

假设当前租户中已有 `tp_user` 和 `ap_user` 等 2 个用户。

您可以参考以下步骤配置资源隔离计划，以控制不同用户或后台任务使用不同的 CPU 或 IOPS 资源。

1. 租户管理员登录集群的 MySQL 租户。

2. 调用 `DBMS_RESOURCE_MANAGER` 系统包中的 `CREATE_CONSUMER_GROUP` 子程序，创建资源组。

   语句如下：

   ```sql
   CALL DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
   CONSUMER_GROUP => 'group_name' ,
   COMMENT => 'coments'
   );
   ```

   相关参数说明如下：

   * `CONSUMER_GROUP`：定义资源组名称。

   * `COMMENT`：填写资源组的备注信息。

   例如，创建以下 2 个资源组，分别为 `interactive_group` 和 `batch_group`。

   ```shell
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
   CONSUMER_GROUP => 'interactive_group' ,
   COMMENT => 'TP'
   );
   ```

   ```shell
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
   CONSUMER_GROUP => 'batch_group' ,
   COMMENT => 'AP'
   );
   ```

   创建成功后，可以查询 `oceanbase.DBA_RSRC_CONSUMER_GROUPS` 视图进行确认。有关 `oceanbase.DBA_RSRC_CONSUMER_GROUPS` 视图的详细介绍请参见：[oceanbase.DBA_RSRC_CONSUMER_GROUPS](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001430808)。

3. 调用 `DBMS_RESOURCE_MANAGER` 系统包中的 `CREATE_PLAN` 子程序，创建资源管理计划。

   语句如下：

   ```sql
   CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN(
   PLAN => 'plan_name',
   comment => 'coments');
   ```

   相关参数说明如下：

   * `PLAN`：定义资源管理计划名称。
  
   * `COMMENT`：填写资源管理计划的备注信息。

   例如，创建一个名为 `daytime` 的资源管理计划，并添加备注信息。

   ```sql
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN(
   PLAN => 'daytime',
   comment => 'TPFirst');
   ```   

   创建成功后，可以查询 `oceanbase.DBA_RSRC_PLANS` 视图进行确认。有关 `oceanbase.DBA_RSRC_PLANS` 视图的详细介绍请参见：[oceanbase.DBA_RSRC_PLANS](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001430900)。

4. 调用 `DBMS_RESOURCE_MANAGER` 系统包中的 `CREATE_PLAN_DIRECTIVE` 子程序，创建资源管理计划内容。用于启用资源管理计划时，限制资源组所使用的 CPU 资源和 IOPS 资源。语句如下：

   ```sql
   CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
      PLAN => 'plan_name',
      GROUP_OR_SUBPLAN => 'group_name' ,
      COMMENT  => 'comments',
      MGMT_P1 => int_value,
      UTILIZATION_LIMIT => int_value,
      MIN_IOPS => int_value,
      MAX_IOPS => int_value,
      WEIGHT_IOPS => int_value);
   ```

   调用 `DBMS_RESOURCE_MANAGER` 系统包中的 `UPDATE_PLAN_DIRECTIVE` 子程序，更新资源管理计划内容。示例如下：

   ```sql
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.UPDATE_PLAN_DIRECTIVE(
   PLAN => 'daytime',
   GROUP_OR_SUBPLAN => 'interactive_group' ,
   COMMENT => 'new',
   MGMT_P1 => 40,
   UTILIZATION_LIMIT => 60);
   MIN_IOPS => 40,
   MAX_IOPS => 80,
   WEIGHT_IOPS => 70);
   ```

   相关参数说明如下：

   * `PLAN`：指定资源管理计划名称。

   * `GROUP_OR_SUBPLAN`：指定资源组。
  
   * `COMMENT`：填写资源管理计划内容的备注信息，默认值为 `NULL`。

   * `MGMT_P1`：指定系统满负载情况下，相对可用的最大 CPU 占比，默认值为 `100`。
  
   * `UTILIZATION_LIMIT`：指定资源组使用的 CPU 资源的上限。该参数的默认值为 `100`，取值范围为 (0, 100\]。`100` 表示最大可使用租户全部 CPU 资源。如果取值为 `70` 则表示最大可使用租户 70% 的 CPU 资源。

   * `MIN_IOPS`：用于出现 IO 争用时，资源组预留的 IOPS 资源，总和不超过 100，默认值为 `0`。

   * `MAX_IOPS`：用于指定资源组最大可使用的 IOPS 资源，总和可以超过 100，默认值为 `100`。

   * `WEIGHT_IOPS`：用于指定 IOPS 的权重值，总和可以超过100，默认值为 `0`。

   示例如下：
   
   * 指定资源计划为 `daytime`，绑定资源组 `interactive_group`，并指定可使用的 CPU 资源上限为租户 CPU 总资源的 80%。同时，当出现出现 IO 争用时，指定最少可用的 IOPS 资源为 30%，可使用的 IOPS 资源上限为 IOPS 总资源为 90%，IOPS 资源权重为 80。

      ```shell
      obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE(
      PLAN => 'daytime',
      GROUP_OR_SUBPLAN => 'interactive_group' ,
      COMMENT  => '',
      UTILIZATION_LIMIT =>80,
      MIN_IOPS => 30,
      MAX_IOPS => 90,
      WEIGHT_IOPS => 80);
      ```
    
   * 指定资源计划为 `daytime`，绑定资源组 `batch_group`，并指定可使用的 CPU 资源上限为租户 CPU 总资源的 40%。同时，当出现出现 IO 争用时，指定最少可用的 IOPS 资源为 40%，可使用的 IOPS 资源上限为 IOPS 总资源为 80%，IOPS 资源权重为 70。

      ```shell
      obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE(
      PLAN => 'daytime',
      GROUP_OR_SUBPLAN => 'batch_group' ,
      COMMENT  => '',
      UTILIZATION_LIMIT => 40,
      MIN_IOPS => 40,
      MAX_IOPS => 80,
      WEIGHT_IOPS => 70);
      ```

   创建成功后，可以查询 `oceanbase.DBA_RSRC_PLAN_DIRECTIVES` 视图和 `oceanbase.DBA_OB_RSRC_IO_DIRECTIVES` 视图进行确认。

   有关 `oceanbase.DBA_RSRC_PLAN_DIRECTIVES` 视图的详细介绍，请参见：[oceanbase.DBA_RSRC_PLAN_DIRECTIVES](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001430797)。

   有关 `oceanbase.DBA_OB_RSRC_IO_DIRECTIVES` 视图的详细介绍，请参见：[oceanbase.DBA_OB_RSRC_IO_DIRECTIVES](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001430923)。

5. 调用 `DBMS_RESOURCE_MANAGER` 系统包中的 `SET_CONSUMER_GROUP_MAPPING` 子程序，根据实际使用场景，创建资源隔离匹配规则。

   语句如下：

   ```sql
   CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
      ATTRIBUTE => 'column | user | function', 
      VALUE => 'values',
      CONSUMER_GROUP => 'group_name');
   ```

   相关参数说明如下：

   * `ATTRIBUTE`：指定属性类型，属性名称不区分大小写。
      
     * `column` 表示 SQL 级资源隔离。
     
     * `user` 表示 User 级资源隔离。
     
     * `function` 表示 Function 级资源隔离。

   * `VALUE`：指定属性值。
   
     * 如果属性类型为 `column`，则此处需要指定库名、表名、列名、常量值和用户名等信息。

       其中：

       * 库名和用户名为可选，默认库名为当前库名，如果未指定用户名，则对所有用户生效，包括当前租户中后续新建的用户。

       * 表名、列名、常量值为必选项，并且每项只能指定一个值。在指定常量值时，仅支持指定为数值或字符串。

       * 在指定表名、列名、用户名时，指定的表、列和用户必须存在。
     
     * 如果属性类型为 `user`，则此处指定为用户名即可。当前仅支持指定一个用户。

     * 如果属性类型为 `function`，则此处指定 DAG 线程对应的 8 种后台任务：compaction_high、ha_high、compaction_mid、ha_mid、compaction_low、ha_low、ddl 和 ddl_high，填写其中一个即可。当前仅支持指定一个任务。

   * `CONSUMER_GROUP`：指定需要绑定的资源组。表示当 SQL 命中 `VALUE` 中所设置的匹配规则后，需要绑定在哪个资源组上执行该语句。当前仅支持绑定一个资源组。

        如果未指定要绑定的资源组，则默认绑定系统内置的 `OTHER_GROUPS`。系统内置的 `OTHER_GROUPS` 对应的资源如下：
        
        * MIN_IOPS = 100 - SUM(租户内其他资源组的总和)
        
        * MAX_IOPS = 100
        
        * WEIGHT_IOPS = 100

   示例如下：

   * 创建 SQL 级资源隔离匹配规则

      * 指定当用户 `tp_user` 执行的一条 `WHERE` 条件中包含 `test.t.c3 = 3` 的 SQL 语句时，该 SQL 语句绑定到名为 `batch_group` 的资源组上执行，并使用该资源组所限制的 CPU 资源和 IOPS 资源。

        <main id="notice" type='notice'>
        <h4>注意</h4>
        <p>执行 SQL 语句时，并不需要语句中必须包含 <code>test.t.</code>，只需要 <code>c3</code> 最终被解析为 <code>test.t.c3</code>，则该 SQL 语句就会绑定到名为 <code>batch_group</code> 的资源组上执行。例如：<code>SELECT * FROM test.t WHERE c3 = 1;</code>。</p>
        </main>

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'column',
        VALUE => 'test.t.c3=3 for tp_user',
        CONSUMER_GROUP => 'batch_group');
        ```

      * 指定当执行的一条 `WHERE` 条件中包含 `t.c3=5` 的 SQL 语句时，该 SQL 语句绑定到名为 `interactive_group` 的资源组上执行，并使用该资源组所限制的 CPU 资源和 IOPS 资源。

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'column',
        VALUE => 't.c3=5',
        CONSUMER_GROUP => 'interactive_group');
        ```

       除了通过调用 `SET_CONSUMER_GROUP_MAPPING` 子程序来绑定资源组，OceanBase 数据库还支持通过 Hint 绑定资源组的方式。用户可以通过使用 Hint 灵活地将待执行的 SQL 提交到指定的资源组。例如，待执行的 SQL 语句是 `SELECT * FROM T`，如果希望该 SQL 使用资源组 `batch_group` 所限制的资源，则使用 Hint 方式绑定资源组的示例如下：

      ```shell
      obclient [test]> SELECT /*+resource_group('batch_group')*/ * FROM t;
      ```

      <main id="notice" type='explain'>
      <h4>说明</h4>
      <p>通过 Hint 方式指定资源组后，如果资源组不存在，则语句执行时使用默认的资源组 <code>OTHER_GROUPS</code>。</p>
      </main>

   * 创建 User 级资源隔离匹配规则

      * 指定 `tp_user` 用户执行的 SQL 绑定到名为 `interactive_group` 的资源组上执行，并使用该资源组所限制的 CPU 资源和 IOPS 资源。

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'user',
        VALUE => 'tp_user',
        CONSUMER_GROUP => 'interactive_group');
        ```

      * 指定 `ap_user` 用户执行的 SQL 绑定到名为 `batch_group` 的资源组上执行，并使用该资源组所限制的 CPU 资源和 IOPS 资源。

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'user',
        VALUE => 'ap_user',
        CONSUMER_GROUP => 'batch_group');
        ```

   * 创建 Function 资源隔离匹配规则。

      * 指定执行 `compaction_high` 的任务时，系统绑定到名为 `interactive_group` 的资源组上执行，并使用该资源组所限制的 CPU 资源和 IOPS 资源。

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'function',
        VALUE => 'compaction_high',
        CONSUMER_GROUP => 'interactive_group');
        ```

      * 指定执行 `ddl_high` 任务时，系统绑定到名为 `batch_group` 资源组上执行，并使用该资源组所限制的 CPU 资源和 IOPS 资源。

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'function',
        VALUE => 'ddl_high',
        CONSUMER_GROUP => 'batch_group');
        ```

   创建成功后，可以查询 `oceanbase.DBA_RSRC_GROUP_MAPPINGS` 视图进行确认。有关 `oceanbase.DBA_RSRC_GROUP_MAPPINGS` 视图的详细介绍请参见：[oceanbase.DBA_RSRC_GROUP_MAPPINGS](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001430902)。

6. 为资源组启用合适的资源管理计划。

   由于不同的资源管理计划中，同一个资源组被限制的资源可能不同。您需要为资源组启用合适的资源管理计划。

   ```sql
   obclient [test]> SET GLOBAL resource_manager_plan = 'daytime';
   ```

   <main id="notice" type='explain'>
   <h4>说明</h4>
   <p>如果不需要对资源进行限制，可以使用 <code>SET GLOBAL resource_manager_plan = '';</code> 语句禁用所有资源计划。</p>
   </main>

## 配置后注意事项

* 资源隔离匹配规则添加后，如果删除了用户后再重建，资源隔离匹配规则仍然适用。

* 资源隔离匹配规则添加成功后不是立即生效，预计可能在 10 秒内开始生效，具体以实际环境为准。

* SQL 级资源隔离的优先级高于 User 级资源隔离和 Function 级资源隔离。

* 资源隔离匹配规则添加后，目前仅在 `SELECT`、`INSERT`、`UPDATE`、`DELETE` 等语句中生效，在 DDL 和 DCL 语句中不生效，在 PL 中也不生效。在 prepareStatement 中可以生效。

## 配置带来的性能影响

* User 级资源隔离和 Function 级资源隔离在 SQL 未解析前即可确认使用哪个资源组的资源，故对性能无影响。

* SQL 级资源隔离对性能的影响主要来自重试。不同于 User 级资源隔离和 Function 级资源隔离在一条 SQL 未解析前就确定了应该使用哪个资源使用组的资源，SQL 级资源隔离在 SQL 解析或命中 Plan Cache 时，才能确定应该使用哪个资源使用组的资源，此时如果发现应该使用的资源组与当前正在使用的不同，那么系统就会执行一次重试，使用匹配规则对应的资源使用组的资源来处理这条 SQL。

  SQL 级资源隔离对性能的影响主要分为以下三种情况：

  1. 当一条 SQL 未匹配到任意一条规则时，对性能几乎没有影响。

  2. 当一条 SQL 匹配到一条规则时，假设该规则所指定的资源使用组为 `batch_group`, 不仅本 SQL 最终会以 `batch_group` 的资源执行，下一条 SQL 也会先以 `batch_group` 的资源执行，直到匹配到规则发现需要切换到其他资源组，系统才会进行重试。对于连续执行一批 SQL，并且这些 SQL 均绑定在同一个资源组上的场景，使用该策略可以实现仅处理一批中的第一条 SQL 时需要重试，后续 SQL 都不再需要重试。尽量减少了重试，对性能影响较小。

  3. 当每一条 SQL 预期使用的资源组都与上一条不同，则每一条 SQL 都需要重试一次，对性能的影响较大。