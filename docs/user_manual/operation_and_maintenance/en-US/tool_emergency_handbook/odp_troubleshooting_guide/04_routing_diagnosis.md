---
title: Troubleshoot ODP Routing Issues
Weight: 4
---

> This topic describes the background of the routing diagnostics feature, how to obtain diagnostic information, and how to locate and solve issues based on diagnostic information.

OceanBase Database Proxy (ODP) serves as the access and routing layers of OceanBase Database and routing is its core feature. In earlier versions, routing issues are difficult to troubleshoot. Therefore, ODP V4.2.1 provides the routing diagnostics feature. This feature allows you to set diagnostic points during the routing process of an SQL statement in ODP to record key status information. The diagnostic points are then returned in logs or the result set.

You can analyze the diagnostic points to learn about the routing process of an SQL statement in ODP.

## Routing Diagnostics Procedure

To use the routing diagnostics feature for troubleshooting, perform the following steps:

1. Obtain diagnostic information. For more information, see the "Obtain Diagnostic Information" section of this topic.

2. Perform troubleshooting based on the diagnostic information. For more information, see the "Overview" section of this topic.


## Obtain Diagnostic Information

This topic describes two methods for obtaining diagnostic information.

### Obtain diagnostic information by running a command

You can run the `explain route <your_sql>;` command to obtain the routing status information of an SQL statement. If the value of `route_diagnosis_level` is not `0`, this command will return detailed diagnostic information. The statement specified by `<your_sql>` will undergo the forwarding process in ODP without being actually forwarded to an OBServer node.

`route_diagnosis_level` is a global parameter that controls how detailed the routing status information is. The value is an integer. The default value is `2`, which indicates that the output information can cover level-2 diagnostic points.

The value range of the `route_diagnosis_level` parameter is [0, 4]. A larger value indicates more detailed status information. The value `0` specifies to disable this module. When this module is disabled, it does not occupy the memory of ODP or affect the performance of ODP.

This command does not apply to the following statements:
  
* COM_STMT_PREPARE
  
* COM_STMT_PREPARE_EXECUTE
  
* COM_STMT_CLOSE
  
* COM_STMT_RESET

* `PREPARE statement_name FROM preparable_SQL_statement;`

* `{DEALLOCATE | DROP} PREPARE stmt_name;`

* Internal statements of ODP

#### Examples

Execute the `SELECT * FROM test.list_sub_parts_my_01 WHERE c3='1999-09-09' AND c1=mod(1999,1000) AND c2='tiger0'` statement to query a table that does not exist.

```sql
obclient> EXPLAIN ROUTE SELECT * FROM test.list_sub_parts_my_01 WHERE c3='1999-09-09' AND c1=mod(1999,1000) AND c2='tiger0'\G
```

The output is as follows:

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

The result set is described as follows:

* `Trans First Query`: the first statement in the transaction.

* `Trans Current Query`: the current statement in the transaction.

* `Route Prompts`: the description of steps in the routing process. Two types of prompts exist: `[INFO]` and `[WARN]`.
  
  * `[INFO]`: some information returned during normal routing to help you understand the routing process. In this example, `[INFO]` information is returned in the `ROUTE_INFO` section. The information indicates that ODP routes the request to an OBServer node based on the partition location.
  
  * `[WARN]`: information returned when an exception occurs in a step of the routing process.

* `Route Plan`: the forwarding process in ODP. `SQL_PARSE`, `ROUTE_INFO`, and `LOCATION_CACHE_LOOKUP` are diagnostic points. Diagnostic points can be at the same level or in hierarchical relationships and are displayed in a tree structure.

The `FETCH_TABLE_RELATED_DATA:{table_entry:"partition information does not exist"}` information in the `Route Plan` section indicates that ODP queries the partition information about this table but no partition information exists.

In most cases, you can locate an issue based on the information returned in the `Route Prompts` and `Route Plan` sections.

### Diagnostic logs

If an SQL statement meets any of the following conditions, ODP will record the actual routing process in the `obproxy_diagnosis.log` file.

* The statement is not an `EXPLAIN ROUTE executable_sql;` statement.

* No partition is hit (`is_partition_hit = false`) or the value of `route_diagnosis_level` is `4`.

The log level is WARN or TRACE, depending on the scenario of the current statement.

* WARN logs are recorded in the following cases:
  
  * The current statement belongs to a distributed transaction.
  
  * The statement is the first statement of a transaction.

* TRACE logs are recorded in the following cases:
  
  * The current statement belongs to a regular transaction.
  
  * The table name is left empty in the statement.
  
  * The length of the statement exceeds the value of `request_buffer_length`.
  
  * Partition key calculation fails.

The following command words are supported in diagnostic logs:

* COM_QUERY

* COM_STMT_PREPARE_EXECUTE

* COM_STMT_PREPARE

* COM_STMT_SEND_PIECE_DATA

* COM_STMT_GET_PIECE_DATA

* COM_STMT_FETCH

* COM_STMT_SEND_LONG_DATA

* Non-internal statements of ODP

#### Examples

In the `obproxy_diagnosis.log` file, find the target row by keyword and replace '/n' with '\n' to obtain the diagnostic process in a tree structure.

The command is `grep "some_key_word" obproxy_diagnosis.log | sed "s/\/n/\n/g"`. Here is an example:

```shell
$ grep "2023-08-17 16:56:46.521180" obproxy_diagnosis.log | sed "s/\/n/\n/g"
```

The output is as follows:

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

The diagnostic procedure is as follows:

1. Based on the `[WARN] Fail to calculate first part idx may use route policy or cached server session` information in `PARTITION_ID_CALC_DONE`, partition ID calculation fails, and the request is routed based on the routing strategy or by reusing a session.

2. Check the data near the `PARTITION_ID_CALC_DONE` diagnostic point. The `RESOLVE_TOKEN:{error:-4002, , token_type:"TOKEN_COLUMN", token:"abcd"}` information indicates that ODP encounters an error in parsing `c3=abcd`.


## Overview

> A diagnostic point describes a key procedure in the routing and forwarding process on ODP. You can view diagnostic points to learn about the routing and forwarding process. This topic describes how to troubleshoot issues based on diagnostic points.

### Troubleshooting procedure

After you obtain diagnostic information, you can perform different troubleshooting operations based on whether the routed request is in the transaction.

#### Request in the transaction

If a request in a transaction is inaccurately routed, two cases are involved.

* Distributed transaction routing
  
  * If the current request is inaccurately routed, check the diagnostic points based on the diagnostic procedure.
  
  * If the current request is routed to the coordinator node, extract the SQL statement in `Trans First Query`, pass the statement to the `explain route` command to execute the statement again, and check the diagnostic points based on the diagnostic procedure.

* Non-distributed transaction routing
  
  The current request is routed together with the first statement in the transaction. In this case, extract the SQL statement in `Trans First Query`, pass the statement to the `explain route` command to execute the statement again, and check the diagnostic points based on the diagnostic procedure.

#### Request not in the transaction

If an inaccurately routed request is not in a transaction, you can directly check the diagnostic points based on the diagnostic procedure.

### Diagnostic procedure

After you obtain diagnostic information by running the `explain route` command or from diagnostic logs, you can check each diagnostic point based on the following procedure. For more information about the variables to diagnose at each diagnostic point, see the following topics of diagnostic points.

The following table summarizes the diagnostic points based on the execution sequence. A higher diagnostic level indicates more detailed diagnostic information.

<main id="notice" type='explain'>
  <h4>Note</h4>
  <ul>
  <li>
  <p>Not all data of diagnostic points is recorded in logs or returned in the result set. Only data useful to the current situation is recorded or returned. </p>
  </li>
  <li>
  <p>The <code>TABLE_ENTRY_LOOKUP_START</code> and <code>PARTITION_ID_CALC_START</code> diagnostic points have no data and are used only to maintain the tree structure of diagnostic points.</p>
  </li>
  </ul>
</main>

<table>
  <thead>
    <tr>
      <th>Diagnostic phase</th>
      <th>Diagnostic point</th>
      <th>Diagnostic point level</th>
    </tr>
  </thead>
  <tr>
    <td>Syntax parsing</td>
    <td>SQL_PARSE</td>
    <td>1</td>
  </tr>
  <tr>
    <td>Routing information acquisition</td>
    <td>ROUTE_INFO</td>
    <td>1</td>
  </tr>
  <tr>
    <td rowspan="13">Replica location acquisition</td>
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
    <td>Node selection based on the routing strategy</td>
    <td>ROUTE_POLICY</td>
    <td>1</td>
  </tr>
  <tr>
    <td>Replica access control</td>
    <td>CONGESTION_CONTROL</td>
    <td>1</td>
  </tr>
  <tr>
    <td>Response handling</td>
    <td>HANDLE_RESPONSE</td>
    <td>1</td>
  </tr>
  <tr>
    <td>Replica selection and retry</td>
    <td>RETRY</td>
    <td>1</td>
  </tr>
</table>

#### Diagnostic tips

* Pay attention to the WARN information in `Route Prompts` and the diagnostic data near the corresponding diagnostic point.

* Pay attention to the error information in `Route Plan`.

* Set `route_diagnosis_level` to `4` and `monitor_log_level` to 'TRACE' and view the diagnostic results of all user requests in the diagnostic logs.

  For more information about `route_diagnosis_level`, see [route_diagnosis_level](https://en.oceanbase.com/docs/common-odp-doc-en-10000000001736104). For more information about `monitor_log_level`, see [monitor_log_level](https://en.oceanbase.com/docs/common-odp-doc-en-10000000001736057).

**<font color="red">Diagnostic points are not described here. These diagnostic points involve too much content related to the ODP workflow and specific implementations. If you can directly understand and analyze the diagnostic information obtained by using `EXPLAIN ROUTE` based on your background knowledge (mainly based on intuition), that would be great. If you cannot understand the information, record the diagnostic information obtained and contact the on-duty staff in the OceanBase community forum for assistance in troubleshooting. </font>**

## Examples

This topic provides several examples to describe how to use the routing diagnostics feature in MySQL mode.

> The following examples assume that <code>route_diagnosis_level</code> is set to `4`.

### Example 1: PS/PL statement call

If it is difficult to find the actually executed statement when a prepared statement (PS)/PL statement call is inaccurately routed, you can view the corresponding diagnostic logs.

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

You can find the output of the executed statement in the `parse_sql` field of the diagnostic information of the `PARTITION_ID_CALC_DONE` diagnostic point.

### Example 2: Partitioned table query

#### Inaccurate partitioned table-based routing because partitioning key values are not provided

Assume that `t0` is a subpartitioned table and the executed statement `select * from t0 where c1=1` is inaccurately routed. Run the following command for routing diagnostics:

```sql
obclient> EXPLAIN ROUTE select * from t0 where c1=1\G
```

The output is as follows:

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

Check the diagnostic result.

1. The `PARTITION_ID_CALC_DONE [WARN] Fail to use partition key value to calculate sub part idx` information in `Route Prompts` indicates that subpartition location calculation fails.

2. Check whether relevant information exists near `PARTITION_ID_CALC_DONE` in `Route Plan`.

3. The diagnostic information at the diagnostic point `RESOLVE_EXPR:{part_range:"[1 ; 1]", sub_part_range:"(MIN ; MAX)always true"}` indicates that the subpartition range is `MIN:MAX`. Therefore, the subpartition location cannot be determined.

4. It can be deemed that subpartitioning key values are not provided in `Trans Current Query:"select * from t0 where c1=1"`.

#### Inaccurate partitioned table-based routing when partitioning key values are calculated by using an unsupported expression

Assume that `t0` is a partitioned table and the executed statement `select * from t0 where c1=abs(-100.123);` is inaccurately routed. View the corresponding diagnostic log.

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

In the diagnostic result, the information `RESOLVE_TOKEN [WARN] Not support to resolve expr func(abs)` indicates that the abs expression fails to be parsed. As a result, the partitioning key values cannot be correctly calculated, leading to inaccurate routing.

### Strategy-based routing

Assume that the `SELECT 100 - max(round(total / mem_limit * 100)) FROM oceanbase.gv$ob_memstore` statement is not routed as expected. Run the following command for routing diagnostics:

```sql
obclient> EXPLAIN ROUTE SELECT 100 - max(round(total / mem_limit * 100)) FROM oceanbase.gv$ob_memstore\G
```

The output is as follows:

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

The information `[INFO] All OBServers treated as the SAME_IDC with OBProxy because 'proxy_idc_name' is not configured` indicates that the `proxy_idc_name` parameter is not configured. Therefore, ODP considers that all OBServer nodes are in the same IDC. As a result, LDC-based routing becomes invalid.



## References

- [Overview](https://en.oceanbase.com/docs/common-odp-doc-en-10000000001736148)

    > A complete ODP routing diagnostics document is available on the official website of OceanBase Database.
    >
    > The content of this topic is based on the documentation on the official website, with some deletions and additions. Specifically, the introduction of each diagnostic point is deleted. Diagnostic points are used by OceanBase Technical Support and R&D engineers for fault analysis. You do not need to dive deep into this, but feel free to gain a basic understanding if it interests you.