---
title: SQL Audit
weight: 8
---

## Query the Top N SQL Statements with the Highest Elapsed Time That Were Executed in the Last M Minutes

Execute the following SQL statement to query the information as the `root@sys` user:


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

## Query the Top N SQL Statements with the Highest QPS That Were Executed in User Tenants in the Last M Minutes

Execute the following SQL statement to query the information as the `root@sys` user:

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

## Query Details of the Last N SQL Statements Executed Based on SQL Statement IDs

Execute the following SQL statement to query the information as the `root@sys` user:

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

## Query the QPS of a Tenant on Each Server in the Last M Minutes

Execute the following SQL statement to query the information as the `root@sys` user:

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

## Query the IDs of the Top N SQL Statements with the Highest CPU Utilization in a Tenant

Execute the following SQL statement to query the information as the `root@sys` user:

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