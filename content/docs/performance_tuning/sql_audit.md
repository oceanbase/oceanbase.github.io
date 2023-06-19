---
title: SQL 审计视图
weight: 3
---
# **SQL 审计视图**

SQL 审计视图可以查看在 OceanBase 数据库里执行过的所有 SQL（包含执行失败 SQL）。这对开发同学了解自己的业务 SQL 和定位问题细节非常有帮助。

## **SQL 审计视图概述**

SQL 审计视图 `gv$ob_sql_audit` 是虚拟表，是内存中一个 FIFO 队列。OceanBase 数据库 3.x 版本是 `gv$sql_audit` 虚拟表。

功能的开启和数据大小是通过下面的 OceanBase 集群参数控制的。

| 参数名 | 参数值 | 参数含义 |
| --- | --- | --- |
| enable_sql_audit | TRUE | 指定是否开启 SQL 审计。默认 TRUE 是开启。FALSE 是关闭。 |

SQL 审计能保留的数据大小和租户内存资源的大小也有关系，通常不会特别大。建议自行实时将 SQL 审计视图的数据抽取走，之后做二次分析。

您可以在租户里执行如下命令开启或关闭 SQL 审计功能。

```sql
set global ob_enable_sql_audit = on;
```

视图列定义如下：

| 列名 | 含义 |
| --- | --- |
| SVR_IP | SQL 执行的 OBServer 节点 IP |
| SVR_PORT | SQL 执行的 OBServer 节点端口 |
| REQUEST_ID | 唯一标识 |
| TRACE_ID | 该 SQL 的 TRACE_ID 信息，在 OBServer 节点日志里可以关联查询相关日志 |
| SID | SQL 执行的 OBServer 节点上的会话 ID |
| CLIENT_IP | 该 SQL 执行的客户端 IP，通常是 OBProxy IP |
| TENANT_ID | 该 SQL 执行的租户 ID |
| TENANT_NAME | 该 SQL 执行的租户名称 |
| USER_NAME | 该 SQL 执行的租户内部用户名 |
| USER_CLIENT_IP | 该 SQL 执行的实际客户端 IP |
| DB_ID | 该 SQL 执行的数据库 ID |
| DB_NAME | 该 SQL 执行的数据库名称 |
| SQL_ID | 该 SQL 的 SQL_ID |
| QUERY_SQL | 该 SQL 的文本，如果太长会截断 |
| PLAN_ID | 该 SQL 的执行计划 ID |
| AFFECTED_ROWS | 该 SQL 的写影响行数 |
| RETURN_ROWS | 该 SQL 的返回行数 |
| PARTITION_CNT | 该 SQL 访问的分区数量 |
| RET_CODE | 该 SQL 的返回代码 |
| EVENT | 该 SQL 的主要等待事件 |
| PLAN_TYPE | 该 SQL 的执行计划类型 1：本地 SQL；2：远程 SQL；3：分布式 SQL |
| IS_HIT_PLAN | 是否命中执行计划 |
| REQUEST_TIME | 该 SQL 执行时间点（时间戳类型，可通过 usec_to_time 转换为可读时间格式） |
| ELAPSED_TIME | 该 SQL 执行总耗时 |
| NET_TIME | 该 SQL 执行网络消耗时间 |
| QUEUE_TIME | 该 SQL 执行内部排队时间 |
| DECODE_TIME | 出队列后 decode 时间 |
| GET_PLAN_TIME | 该 SQL 执行计划生成时间 |
| EXECUTE_TIME | 该 SQL 实际内部执行时间（不包括 CPU 排队时间） |

## **如何查看 SQL 审计视图**

您可在 sys 租户或业务租户中执行如下命令查看 SQL 审计视图，在 sys 租户中执行时可以查看所有租户的 SQL 数据，在业务租户中执行仅可查看自身租户的 SQL 数据。

- 查看近期所有 SQL

  ```sql
  SELECT /*+ read_consistency(weak) ob_querytimeout(100000000) */  substr(usec_to_time(request_time),1,19) request_time_, s.svr_ip, s.client_Ip, s.sid,s.tenant_id, s.tenant_name, s.user_name, s.db_name, s.query_sql, s.affected_rows, s.return_rows, s.ret_code, s.event, s.elapsed_time, s.queue_time, s.execute_time, round(s.request_memory_used/1024/1024/1024,2) req_mem_mb, plan_type, is_executor_rpc, is_inner_sql, trace_id 
  FROM gv$ob_sql_audit s
  WHERE 1=1  and s.tenant_id = 1002
   and user_name='u_tpcc' 
   and request_time >= time_to_usec(DATE_SUB(current_timestamp, INTERVAL 30 MINUTE) )
  ORDER BY request_time DESC
  LIMIT 100;
  ```

  request_time 是时间戳，可通过函数 `usec_to_time` 和 `time_to_usec` 进行时间戳和微秒数的转换。

- 分析统计近期所有 SQL
  
  根据 sql_id 统计平均总耗时、平均执行时间等。

  ```sql
  SELECT sql_id, count(*), round(avg(elapsed_time)) avg_elapsed_time, round(avg(execute_time)) avg_exec_time
  FROM gv$ob_sql_audit s
  WHERE 1=1  and s.tenant_id = 1002
   and user_name='u_tpcc' 
   and request_time >= time_to_usec(DATE_SUB(current_timestamp, INTERVAL 30 MINUTE) )
  GROUP BY sql_id
  order by avg_elapsed_time desc 
  ;
  ```

- 查看报错的 SQL
  
  ret_code 是 SQL 执行报错时的错误码，无报错时为 0，出现报错时错误码为负数。

  ```sql
  SELECT /*+ read_consistency(weak) ob_querytimeout(100000000) */  substr(usec_to_time(request_time),1,19) request_time_, s.svr_ip, s.client_Ip, s.sid,s.tenant_id, s.tenant_name, s.user_name, s.db_name, s.sql_id,  s.query_sql, s.affected_rows, s.return_rows, s.ret_code, s.event, s.elapsed_time, s.queue_time, s.execute_time, round(s.request_memory_used/1024/1024/1024,2) req_mem_mb, plan_type, is_executor_rpc, is_inner_sql, trace_id 
  FROM gv$ob_sql_audit s
  WHERE 1=1  and s.tenant_id = 1002
   and user_name='u_tpcc' 
   and ret_code < 0
   and request_time >= time_to_usec(DATE_SUB(current_timestamp, INTERVAL 30 MINUTE) )
  ORDER BY request_time DESC
  LIMIT 500;
  ```

- 查看远程 SQL 和分布式 SQL
  
  plan_type 的值有三个：1 表示本地 SQL；2 表示远程 SQL；3 表示分布式 SQL。

  ```sql
  SELECT /*+ read_consistency(weak) ob_querytimeout(100000000) */  substr(usec_to_time(request_time),1,19) request_time_, s.svr_ip, s.client_Ip, s.sid,s.tenant_id, s.tenant_name, s.user_name, s.db_name, s.sql_id,  s.query_sql, s.affected_rows, s.return_rows, s.ret_code, s.event, s.elapsed_time, s.queue_time, s.execute_time, round(s.request_memory_used/1024/1024/1024,2) req_mem_mb, plan_type, is_executor_rpc, is_inner_sql, trace_id 
  FROM gv$ob_sql_audit s
  WHERE 1=1  and s.tenant_id = 1002
   and user_name='u_tpcc' 
   and plan_type > 1
   and request_time >= time_to_usec(DATE_SUB(current_timestamp, INTERVAL 30 MINUTE) )
  ORDER BY request_time DESC
  LIMIT 500;
  ```

  远程 SQL 的出现需要结合事务的业务逻辑分析。
