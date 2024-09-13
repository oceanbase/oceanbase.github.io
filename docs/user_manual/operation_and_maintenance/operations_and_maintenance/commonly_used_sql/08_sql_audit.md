---
title: SQL_Audit
weight: 8
---

## 获取 elapsed_time 排序最近 M 分钟内的 top N 的 SQL

`root@sys` 登陆查询，

获取 elapsed_time 排序最近M分钟内的topN的sql

```
SELECT
  /*+READ_CONSISTENCY(WEAK), QUERY_TIMEOUT(100000000)*/
  tenant_id,
  tenant_name,
  user_name,
  db_name,
  svr_ip,
  plan_id,
  plan_type,
  affected_rows,
  return_rows,
  elapsed_time,
  execute_time,
  sql_id,
  usec_to_time(request_time),
  substr(
    replace(query_sql, '\n', ' '),
    1,
    100
  )
FROM
  gv$ob_sql_audit
WHERE
  1 = 1
  AND request_time > (time_to_usec(now()) - 10 * 60 * 1000000)
  AND is_inner_sql = 0
-- AND tenant_id = 1001
ORDER BY
  elapsed_time DESC
LIMIT
  10;
```

## 按 qps 排序获取业务租户最近 M 分钟执行次数最多的 top N的 SQL

`root@sys` 登陆查询，

```
SELECT
  /*+READ_CONSISTENCY(WEAK), QUERY_TIMEOUT(100000000)*/
  tenant_id,
  sql_id,
  COUNT(1) / 60 qps,
  AVG(elapsed_time),
  AVG(execute_time),
  AVG(queue_time),
  AVG(return_rows),
  AVG(affected_rows),
  substr(
    replace(query_sql, '\n', ' '),
    1,
    100
  ) query_sql,
  ret_code
FROM
  gv$ob_sql_audit
WHERE
  1 = 1
  AND request_time > (time_to_usec(now()) - 10 * 60 * 1000000)
  AND is_inner_sql = 0
  AND tenant_id > 1000
GROUP BY
  tenant_id,
  sql_id,
  query_sql,
  ret_code
ORDER BY
  qps DESC
LIMIT
  10;
```

## 按 sqlid 查找最近执行的 N个 SQL 详情

`root@sys` 登陆查询，

```
SELECT
  /*+READ_CONSISTENCY(WEAK), QUERY_TIMEOUT(100000000)*/
  *
FROM
  gv$ob_sql_audit
WHERE
  1 = 1
-- AND sql_id = 'xxx'
ORDER BY
  request_time DESC
LIMIT
  10;
```

## 查看某租户在各 server 上最近 M 分钟的 qps

`root@sys` 登陆查询，

```
SELECT
  t2.zone,
  t1.tenant_id,
  t1.svr_ip,
  COUNT(*) / 10 / 60 AS qps,
  AVG(t1.elapsed_time),
  AVG(t1.queue_time),
  AVG(get_plan_time),
  AVG(execute_time)
FROM
  gv$ob_sql_audit t1,
  dba_ob_servers t2
WHERE
  t1.svr_ip = t2.svr_ip
  -- AND t1.tenant_id = 1001
  AND is_executor_rpc = 0
  AND request_time > (time_to_usec(now()) - 10 * 60 * 1000000)
GROUP BY
  t1.tenant_id,
  t1.svr_ip
ORDER BY
  qps;
```

## 查看租户 top N 个最消耗 cpu 的 sqlid

`root@sys` 登陆查询，

```
SELECT
  sql_id,
  SUM(elapsed_time - queue_time) sum_t,
  COUNT(*) cnt,
  AVG(get_plan_time),
  AVG(execute_time),
  substr(
    replace(query_sql, '\n', ' '),
    1,
    100
  ) query_sql
FROM
  gv$ob_sql_audit
WHERE
  tenant_id = tenant_id
  AND is_executor_rpc = 0
  AND request_time > (time_to_usec(now()) - 10 * 60 * 1000000)
GROUP BY
  sql_id
ORDER BY
  sum_t DESC
LIMIT
  10;
```