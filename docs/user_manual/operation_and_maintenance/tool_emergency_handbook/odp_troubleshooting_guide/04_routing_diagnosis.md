---
title: 排查 ODP 路由问题
weight: 4
---

> 本小节将介绍路由诊断功能被开发的原因、如何使用路由诊断功能，以及如何根据诊断信息查找和解决问题。

ODP 是 OceanBase 数据库的接入层和路由层，而路由是 ODP 的核心功能，目前使用过程中发现，路由过程出现问题的情况下排查问题较为困难，因此 ODP V4.2.1 迭代中开发了路由诊断功能，通过在 ODP 路由转发的关键过程中设置诊断点来记录关键状态信息，这些诊断点可以被输出到日志或以结果集方式返回。

通过分析输出的诊断点，可以清晰地了解一条 SQL 语句从进入 ODP 到被转发出去的过程中发生了什么。

## 路由诊断流程

使用路由诊断功能排查问题的流程如下。

1. 获取诊断信息，详细介绍可参见 “获取诊断信息” 部分。

2. 根据诊断信息排查问题，详细介绍可参见 “诊断点排查” 部分。


## 获取诊断信息

本文介绍两种获取诊断信息的方法，可通过如下任一方法获取诊断信息。

### 命令行语句

可通过 `explain route <your_sql>;` 命令获取 SQL 语句的路由状态信息，在配置项 `route_diagnosis_level` 不为 0 的情况下，该命令会展示详细的诊断信息。`<your_sql>` 语句将会在 ODP 内部进行处理，执行正常的 ODP 转发流程，但不会真正转发给 OBServer 节点。

配置项 `route_diagnosis_level` 是全局配置项，可用来控制输出路由状态信息的详细程度。该配置项取值为一个整数，默认值为 2，表示输出信息可以覆盖二级诊断点，诊断点的详细介绍可参见 [诊断点排查](300.diagnosis-point-troubleshooting/100.overview-of-diagnosis-point-troubleshooting.md) 章节。

`route_diagnosis_level` 配置项的可选值有 [0-4]，配置的值越大，展示的状态信息越详细。配置值为 0 时表示关闭该模块。关闭该模块时，不会占用 ODP 内存，也不会影响 ODP 性能。

explain route 命令不支持诊断如下命令字。
  
* COM_STMT_PREPARE
  
* COM_STMT_PREPARE_EXECUTE
  
* COM_STMT_CLOSE
  
* COM_STMT_RESET

* 文本 Prepare（语法：`PREPARE statement_name FROM preparable_SQL_statement;` ）

* 文本 Prepare drop（语法：`{DEALLOCATE | DROP} PREPARE stmt_name;`）

* ODP 内部命令

#### 示例

查询一个不存在的表，SQL 语句为 `SELECT * FROM test.list_sub_parts_my_01 WHERE c3='1999-09-09' AND c1=mod(1999,1000) AND c2='tiger0'`。

```sql
obclient> EXPLAIN ROUTE SELECT * FROM test.list_sub_parts_my_01 WHERE c3='1999-09-09' AND c1=mod(1999,1000) AND c2='tiger0'\G
```

输出如下。

```sql
*************************** 1. row ***************************
Route Plan:
Trans First Query:"SELECT * FROM test.list_sub_parts_my_01"
Trans Current Query:"EXPLAIN ROUTE SELECT * FROM test.list_sub_parts_my_01 WHERE c3='1999-09-09' AND c1=mod(1999,1000) AND c2='tiger0'"
Route Prompts
-----------------
> ROUTE_INFO
  [INFO] Will do table partition location lookup to decide which OBServer to route to
> TABLE_ENTRY_LOOKUP_DONE
  [INFO] No available entry because table entry lookup failed
> ROUTE_INFO
  [INFO] Will route to cached connected server(10.10.10.1:4001)

Route Plan
-----------------
> SQL_PARSE:{cmd:"COM_QUERY", table:"list_sub_parts_my_01"}
> ROUTE_INFO:{route_info_type:"USE_PARTITION_LOCATION_LOOKUP", in_transaction:true}
> LOCATION_CACHE_LOOKUP:{mode:"oceanbase"}
  > TABLE_ENTRY_LOOKUP_START:{}
    > FETCH_TABLE_RELATED_DATA:{table_entry:"partition information does not exist"}
  > TABLE_ENTRY_LOOKUP_DONE:{is_lookup_succ:true, entry_from_remote:false}
> ROUTE_INFO:{route_info_type:"USE_CACHED_SESSION", svr_addr:"10.10.10.1:4001", in_transaction:true}
> CONGESTION_CONTROL:{svr_addr:"10.10.10.1:4001"}
```

结果集说明如下。

* Trans First Query：事务首条语句内容

* Trans Current Query：事务当前语句内容

* Route Prompts：路由提示，对某些路由过程中的步骤进行解释，分为 `[INFO]` 和 `[WARN]` 提示
  
  * `[INFO]`：表示路由过程正常，会输出帮助您理解路由过程的一些信息。示例中 `ROUTE_INFO` 输出了 `[INFO]` 信息，通过阅读信息可以知道，本次请求将通过分区位置查询来决定路由至哪个 OBServer 节点
  
  * `[WARN]`：表示路由过程中对应步骤出现异常，重点检查该步骤的信息输出

* Route Plan：路由计划，展示 ODP 转发过程。其中 `SQL_PARSE`/`ROUTE_INFO`/`LOCATION_CACHE_LOOKUP` 为诊断点，诊断点之间存在同级或者父子关系，呈树状。详细信息可参见 [诊断点排查](300.diagnosis-point-troubleshooting/100.overview-of-diagnosis-point-troubleshooting.md) 章节。

通过 Route Plan 中的 `FETCH_TABLE_RELATED_DATA:{table_entry:"partition information does not exist"}` 可以得知 ODP 查询该表的分区信息，但其信息不存在。

大多数时候通过 Route Prompts 输出信息就可以确认问题，如果不能则结合 Route Prompts 与 Route Plan 一起排查问题。

### 诊断日志

当 SQL 语句满足以下条件时，ODP 会将实际路由过程输出到 `obproxy_diagnosis.log` 日志中。

* 非 `EXPLAIN ROUTE executable_sql;` 语句

* 分区未命中（`is_partition_hit = false`）或者 route_diagnosis_level = 4

日志输出时，会根据当前语句所处的场景决定输出日志级别为 WARN 或 TRACE，具体场景如下。

* 输出 WARN 级别日志
  
  * 分布式事务内路由语句
  
  * 事务首条语句

* 输出 TRACE 级别日志
  
  * 普通事务内事务路由语句
  
  * 语句表名为空
  
  * 语句超长（长度大于 request_buffer_length 配置项）
  
  * 分区键计算失败

诊断日志支持的命令字/类型如下所示。

* COM_QUERY

* COM_STMT_PREPARE_EXECUTE

* COM_STMT_PREPARE

* COM_STMT_SEND_PIECE_DATA

* COM_STMT_GET_PIECE_DATA

* COM_STMT_FETCH

* COM_STMT_SEND_LONG_DATA

* 非 ODP 内部命令

#### 示例

在 `obproxy_diagnosis.log` 中找到想诊断的日志行，过滤关键字得到该行，然后替换该日志行内的 '/n' 为 '\n' 得到树状的诊断过程。

脚本命令：grep "some_key_word" obproxy_diagnosis.log | sed "s/\/n/\n/g"，示例如下。

```shell
$ grep "2023-08-17 16:56:46.521180" obproxy_diagnosis.log | sed "s/\/n/\n/g"
```

输出如下。

```shell
[2023-08-17 16:56:46.521180] [31792][Y0-00007F38DAAF34E0] [ROUTE]((*route_diagnosis=
Trans Current Query:"select * from test.range_sub_parts_my_01 where c1=22222 and c2=111111 and c3=abcd"
...
> PARTITION_ID_CALC_DONE
  [WARN] Fail to calculate first part idx may use route policy or cached server session

Route Plan
> SQL_PARSE:{cmd:"COM_QUERY", table:"range_sub_parts_my_01"}
> ROUTE_INFO:{route_info_type:"USE_PARTITION_LOCATION_LOOKUP"}
> LOCATION_CACHE_LOOKUP:{mode:"oceanbase"}
  > TABLE_ENTRY_LOOKUP_DONE:{table:"range_sub_parts_my_01", table_id:1099511677778, partition_num:16, table_type:"USER TABLE", entry_from_remote:false}
  > PARTITION_ID_CALC_START:{}
    > EXPR_PARSE:{col_val:[[0]["c1", "22222"], [1]["c2", "111111"], [2]["c3", ""]]}
    > RESOLVE_EXPR:{error:-4002, sub_part_range:"(111111,MIN ; 111111,MAX)"}
      > RESOLVE_TOKEN:{resolve:{"BIGINT":22222}, token_type:"TOKEN_INT_VAL", token:"22222"}
      > RESOLVE_TOKEN:{resolve:{"BIGINT":111111}, token_type:"TOKEN_INT_VAL", token:"111111"}
      > RESOLVE_TOKEN:{error:-4002, , token_type:"TOKEN_COLUMN", token:"abcd"}
  > PARTITION_ID_CALC_DONE:{error:-4002, partition_id:-1, level:2, partitions:"(p-1sp-1)"}
> ROUTE_POLICY:{replica:"10.10.10.1:50110", idc_type:"SAME_IDC", zone_type:"ReadWrite", role:"FOLLOWER", type:"FULL", chosen_route_type:"ROUTE_TYPE_NONPARTITION_UNMERGE_LOCAL", route_policy:"MERGE_IDC_ORDER_OPTIMIZED", trans_consistency:"STRONG", session_consistency:"STRONG"}
> CONGESTION_CONTROL:{svr_addr:"10.10.10.1:50110"}
> HANDLE_RESPONSE:{is_parititon_hit:"false", state:"CONNECTION_ALIVE"}
)
```

诊断过程如下。

1. 通过 `PARTITION_ID_CALC_DONE` 下的 `[WARN] Fail to calculate first part idx may use route policy or cached server session` 可以知道计算一级分区 ID 失败，将会通过路由策略路由或者复用会话。

2. 检查诊断点 `PARTITION_ID_CALC_DONE` 附近数据，发现 `RESOLVE_TOKEN:{error:-4002, , token_type:"TOKEN_COLUMN", token:"abcd"}`，由此得知 ODP 解析 c3=abcd 时出现解析错误。


## 诊断点排查概述

> 诊断点描述的是 ODP 进行路由转发过程中的关键过程，通过观察诊断点，可以洞悉路由转发过程。本章节介绍如何根据诊断点进行分析排查。

### 排查流程

获取诊断信息后，可根据路由请求是否处于事务中选择下述不同的操作进行排查。

#### 请求处于事务中

处于事务中的请求路由不准有以下两种处理情况。

* 分布式事务路由
  
  * 当前请求 ODP 路由不准，直接参照诊断流程进行诊断点的分析排查。
  
  * 当前请求跟随协调者路由，可将【Trans First Query】中的内容取出，使用 `explain route` 命令重新执行一遍后再参照诊断流程进行诊断点的分析排查。

* 非分布式事务路由
  
  当前请求跟随事务第一条语句路由，将【Trans First Query】中的内容取出，使用 `explain route` 命令重新执行一遍后再参照诊断流程进行诊断点的分析排查。

#### 请求不处于事务中

当路由不准的请求不处于事务中时，您可直接参照诊断流程进行诊断点的分析排查。

### 诊断流程

当您通过 `explain route` 命令或诊断日志获取到诊断信息后，您可通过各诊断点信息进行路由诊断，各诊断点需诊断的变量及变量含义可参考本章具体的诊断点介绍文档。

下表为诊断点的概览，诊断点从上到下为其执行顺序，诊断级别越高，获取的诊断信息越详细。

<main id="notice" type='explain'>
  <h4>说明</h4>
  <ul>
  <li>
  <p>诊断点数据不会全部输出到日志或者结果集中，诊断点只会输出对应当前诊断有用的数据。</p>
  </li>
  <li>
  <p><code>TABLE_ENTRY_LOOKUP_START</code> 和 <code>PARTITION_ID_CALC_START</code> 为无数据诊断点，仅用于维持诊断点之间的树状结构</p>
  </li>
  </ul>
</main>

<table>
  <thead>
    <tr>
      <th>诊断阶段</th>
      <th>诊断点</th>
      <th>诊断点级别</th>
    </tr>
  </thead>
  <tr>
    <td>文法解析</td>
    <td>SQL_PARSE</td>
    <td>1</td>
  </tr>
  <tr>
    <td>获取路由信息</td>
    <td>ROUTE_INFO</td>
    <td>1</td>
  </tr>
  <tr>
    <td rowspan="13">获取表副本位置</td>
    <td>LOCATION_CACHE_LOOKUP</td>
    <td>1</td>
  </tr>
  <tr>
    <td>ROUTINE_ENTRY_LOOKUP_DONE</td>
    <td>2</td>
  </tr>
  <tr>
    <td>TABLE_ENTRY_LOOKUP_START</td>
    <td>2</td>
  </tr>
  <tr>
    <td>FETCH_TABLE_RELATED_DATA</td>
    <td>3</td>
  </tr>
  <tr>
    <td>TABLE_ENTRY_LOOKUP_DONE</td>
    <td>2</td>
  </tr>
  <tr>
    <td>PARTITION_ID_CALC_START</td>
    <td>2</td>
  </tr>
  <tr>
    <td>EXPR_PARSE</td>
    <td>3</td>
  </tr>
  <tr>
    <td>CALC_ROWID</td>
    <td>3</td>
  </tr>
  <tr>
    <td>RESOLVE_EXPR</td>
    <td>3</td>
  </tr>
  <tr>
    <td>RESOLVE_TOKEN</td>
    <td>4</td>
  </tr>
  <tr>
    <td>CALC_PARTITION_ID</td>
    <td>3</td>
  </tr>
  <tr>
    <td>PARTITION_ID_CALC_DONE</td>
    <td>2</td>
  </tr>
  <tr>
    <td>PARTITION_ENTRY_LOOKUP_DONE</td>
    <td>2</td>
  </tr>
  <tr>
    <td>根据路由策略选取</td>
    <td>ROUTE_POLICY</td>
    <td>1</td>
  </tr>
  <tr>
    <td>副本访问控制</td>
    <td>CONGESTION_CONTROL</td>
    <td>1</td>
  </tr>
  <tr>
    <td>处理 OBServer 回包</td>
    <td>HANDLE_RESPONSE</td>
    <td>1</td>
  </tr>
  <tr>
    <td>选取副本并尝试重试</td>
    <td>RETRY</td>
    <td>1</td>
  </tr>
</table>

#### 诊断技巧

* 可重点关注诊断提示（Route Prompts）中的 WARN 提示信息，以及其对应诊断点附近的诊断数据。

* 可重点关注诊断数据（Route Plan）中的 error 数据。

* 可通过设置 route_diagnosis_level = 4 以及 monitor_log_level='TRACE'，在诊断日志中查看所有可用日志诊断的用户请求的诊断结果。

  route_diagnosis_level 的详细介绍请参见 [route_diagnosis_level](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000001601210)；monitor_log_level 的详细介绍请参见 [monitor_log_level](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000001601148)。

**<font color="red">这里不再详细地介绍所有所有诊断点了。原因是个人觉得这些诊断点，涉及到太多 ODP 工作流程和具体实现相关的内容，如果用户获取 EXPLAIN ROUTE 的信息之后，如果能够凭借背景知识（主要还是凭感觉）直接读懂并进行分析，自是最好；如果不能直接读懂，也没关系，拿着诊断的信息去联系 OceanBase 社区论坛的值班同学协助排查即可。</font>**

## 使用示例

本文结合 MySQL 租户模式下不同示例介绍如何使用路由诊断功能。

> 在下面的示例中，均已将 <code>route_diagnosis_level</code> 设置为 4。

### 示例一：PS/PL 语句调用

当 PS 调用路由不准时，execute 实际执行的语句不方便寻找，您可查看对应诊断日志，通过诊断日志查看执行的相关语句。

```shell
[2023-09-19 18:48:49.079458] [106700][Y0-00007FD892AB64E0] [ROUTE]((*route_diagnosis=
Trans Current Query:"execute stmt"
Route Prompts
--------------
> ROUTE_INFO
  [INFO] Will do table partition location lookup to decide which OBServer to route to
> ROUTE_POLICY
  [INFO] Will route to table's partition leader replica(10.10.10.1:4001) using non route policy because query for STRONG read
Route Plan
--------------
> SQL_PARSE:{cmd:"COM_QUERY", table:"t0"}
> ROUTE_INFO:{route_info_type:"USE_PARTITION_LOCATION_LOOKUP"}
> LOCATION_CACHE_LOOKUP:{mode:"oceanbase"}
  > TABLE_ENTRY_LOOKUP_DONE:{table:"t0", table_id:"500078", table_type:"USER TABLE", partition_num:64, entry_from_remote:false}
  > PARTITION_ID_CALC_START:{}
    > EXPR_PARSE:{col_val:"=88888888,=1111111"}
    > RESOLVE_EXPR:{part_range:"[88888888 ; 88888888]", sub_part_range:"[1111111 ; 1111111]"}
      > RESOLVE_TOKEN:{token_type:"TOKEN_INT_VAL", resolve:"BIGINT:88888888", token:"88888888"}
      > RESOLVE_TOKEN:{token_type:"TOKEN_INT_VAL", resolve:"BIGINT:1111111", token:"1111111"}
    > CALC_PARTITION_ID:{part_description:"partition by hash(INT<binary>) partitions 8 subpartition by hash(INT<binary>) partitions 8"}
  > PARTITION_ID_CALC_DONE:{partition_id:200073, level:2, partitions:"(p0sp7)", parse_sql:"prepare stmt from 'insert into t0 values(88888888,1111111,9999999)'"}
  > PARTITION_ENTRY_LOOKUP_DONE:{leader:"10.10.10.1:4001", entry_from_remote:false}
> ROUTE_POLICY:{chosen_route_type:"ROUTE_TYPE_LEADER"}
> CONGESTION_CONTROL:{svr_addr:"10.10.10.1:4001"}
```

从诊断点 PARTITION_ID_CALC_DONE 的诊断信息 parse_sql 中可以查到对应语句的相关输出。

### 示例二：分区表查询

#### 未提供分区键值导致分区表路由不准

以 t0 为二级分区表，执行语句 `select * from t0 where c1=1` 路由不准为例，执行如下命令进行路由诊断。

```sql
obclient> EXPLAIN ROUTE select * from t0 where c1=1\G
```

输出如下所示。

```shell
Trans Current Query:"select * from t0 where c1=1"
Route Prompts
--------------
> ROUTE_INFO
  [INFO] Will do table partition location lookup to decide which OBServer to route to
> PARTITION_ID_CALC_DONE
  [WARN] Fail to use partition key value to calculate sub part idx
Route Plan
--------------
> SQL_PARSE:{cmd:"COM_QUERY", table:"t0"}
> ROUTE_INFO:{route_info_type:"USE_PARTITION_LOCATION_LOOKUP"}
> LOCATION_CACHE_LOOKUP:{mode:"oceanbase"}
  > TABLE_ENTRY_LOOKUP_DONE:{table:"t0", table_id:"500078", table_type:"USER TABLE", partition_num:64, entry_from_remote:false}
  > PARTITION_ID_CALC_START:{}
  > EXPR_PARSE:{col_val:"c1=1"}
  > RESOLVE_EXPR:{part_range:"[1 ; 1]", sub_part_range:"(MIN ; MAX)always true"}
    > RESOLVE_TOKEN:{token_type:"TOKEN_INT_VAL", resolve:"BIGINT:1", token:"1"}
  > CALC_PARTITION_ID:{error:-4002, part_description:"partition by hash(INT<binary>) partitions 8 subpartition by hash(INT<binary>) partitions 8"}
> PARTITION_ID_CALC_DONE:{error:-4002, partition_id:-1, level:2, partitions:"(p1sp-1)"}
```

根据诊断结果进行分析。

1. 查看路由提示 `PARTITION_ID_CALC_DONE [WARN] Fail to use partition key value to calculate sub part idx` 表示计算二级分区位置失败。

2. 查看路由计划中 PARTITION_ID_CALC_DONE 附近数据是否有相关信息。

3. 路由计划中诊断点 `RESOLVE_EXPR:{part_range:"[1 ; 1]", sub_part_range:"(MIN ; MAX)always true"}` 表示二级分区的范围为 `MIN:MAX`，所以无法确定二级分区具体位置。

4. 反推语句 `Trans Current Query:"select * from t0 where c1=1"` 没有提供二级分区键值。

#### 使用不支持的表达式计算分区键值导致分区表路由不准

以 t0 为分区表，执行语句 `select * from t0 where c1=abs(-100.123);` 路由不准为例，查看对应诊断日志内容如下。

```shell
[2023-09-19 19:43:11.029616] [106683][Y0-00007FD890E544E0] [ROUTE]((*route_diagnosis=
Trans Current Query:"select * from t0 where c1=abs(-100.123)"
Route Prompts
--------------
> ROUTE_INFO
  [INFO] Will do table partition location lookup to decide which OBServer to route to
> RESOLVE_TOKEN
  [WARN] Not support to resolve expr func(abs)
Route Plan
--------------
> SQL_PARSE:{cmd:"COM_QUERY", table:"t0"}
> ROUTE_INFO:{route_info_type:"USE_PARTITION_LOCATION_LOOKUP"}
> LOCATION_CACHE_LOOKUP:{mode:"oceanbase"}
  > TABLE_ENTRY_LOOKUP_DONE:{table:"t0", table_id:"500078", table_type:"USER TABLE", partition_num:64, entry_from_remote:false}
  > PARTITION_ID_CALC_START:{}
    > EXPR_PARSE:{col_val:"c1=abs"}
    > RESOLVE_EXPR:{error:-5055, part_range:"(MIN ; MAX)always true", sub_part_range:"(MIN ; MAX)always true"}
      > RESOLVE_TOKEN:{error:-5055, token_type:"TOKEN_FUNC", token:"abs"}
    > PARTITION_ID_CALC_DONE:{error:-5055, partition_id:-1, level:2, partitions:"(p-1sp-1)"}
> ROUTE_INFO:{route_info_type:"USE_CACHED_SESSION", svr_addr:"10.10.10.1:4001"}
> CONGESTION_CONTROL:{svr_addr:"10.10.10.1:4001"}
> HANDLE_RESPONSE:{is_parititon_hit:"true", send_action:"SERVER_SEND_REQUEST", state:"CMD_COMPLETE"}
)
```

诊断结果中 `RESOLVE_TOKEN [WARN] Not support to resolve expr func(abs)` 表示不支持解析 abs 表达式。因此可知该语句无法解析表达式，从而无法计算出正确的分区键值，所以无法路由准确。

### 路由策略路由

以执行 `SELECT 100 - max(round(total / mem_limit * 100)) FROM oceanbase.gv$ob_memstore` 命令路由目标不符合预期为例，执行如下命令进行路由诊断。

```sql
obclient> EXPLAIN ROUTE SELECT 100 - max(round(total / mem_limit * 100)) FROM oceanbase.gv$ob_memstore\G
```

输出如下所示。

```shell
*************************** 1. row ***************************
Route Plan:
Trans Current Query:"EXPLAIN ROUTE SELECT 100 - max(round(total / mem_limit * 100)) FROM oceanbase.gv$ob_memstore"
Route Prompts
-----------------
> ROUTE_INFO
  [INFO] Will do table partition location lookup to decide which OBServer to route to
> TABLE_ENTRY_LOOKUP_DONE
  [INFO] Non-partition table will be routed by ROUTE_POLICY
> ROUTE_POLICY
  [INFO] All OBServers treated as the SAME_IDC with OBProxy because 'proxy_idc_name' is not configured
  [INFO] Will route to routing type(NONPARTITION_UNMERGE_LOCAL) matched replica(10.10.10.1:4001) using default route policy MERGE_IDC_ORDER because query for STRONG read
```

根据路由提示：`[INFO] All OBServers treated as the SAME_IDC with OBProxy because 'proxy_idc_name' is not configured` 可知没有配置 proxy_idc_name，ODP 将所有 OBServer 节点视为 SAME_IDC，LDC 路由将失效。



## 参考

- [OceanBase 官网文档的 “路由诊断” 部分](https://www.oceanbase.com/docs/common-odp-doc-cn-1000000001601271)。

    > 因为在 OceanBase 官网中发现了十分完善的 ODP 路由诊断文档，所以这一小节就偷懒直接把官网的内容给照搬过来了。
    >
    > 本文的内容只是基于官网文档，做了一些删改，并增加了一些批注（主要是删掉了对各诊断点的介绍，这东西主要还是给技术支持同学和 ODP 的研发同学拿去分析问题的，感兴趣的用户可以简单了解，但没必要花费时间学习）。