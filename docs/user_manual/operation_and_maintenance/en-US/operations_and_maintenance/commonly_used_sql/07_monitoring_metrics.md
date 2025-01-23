---
title: Monitoring Metrics
weight: 7
---

## Query Cache Size Statistics

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  cache_name,
  round(cache_size / 1024 / 1024) cache_size_mb
FROM
  gv$ob_kvcache
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  cache_name;
```

## Query the Connection Information

```
SELECT
  t2.svr_ip,
  t2.svr_port,
  t1.tenant_name,
  coalesce(t2.active_cnt, 0) AS active_cnt,
  coalesce(t2.all_cnt, 0) AS all_cnt
FROM
  (
    SELECT
      tenant_name
    FROM
      dba_ob_tenants
    WHERE
      tenant_type <> 'META'
  ) t1
  LEFT JOIN (
    SELECT
      count(
        `state` = 'ACTIVE'
        OR NULL
      ) AS active_cnt,
      COUNT(1) AS all_cnt,
      tenant AS tenant_name,
      svr_ip,
      svr_port
    FROM
      gv$ob_processlist
    GROUP BY
      tenant,
      svr_ip,
      svr_port
  ) t2 ON t1.tenant_name = t2.tenant_name
ORDER BY
  all_cnt DESC,
  active_cnt DESC,
  t2.svr_ip,
  t2.svr_port,
  t1.tenant_name;
```

## Query the Delay of Log Stream Synchronization

```
SELECT
  /* MONITOR_AGENT */
  leader.tenant_id,
  '0' AS replica_type,
  abs(
    MAX(
      CAST(leader_ts AS signed) - CAST(follower_ts AS signed)
    )
  ) / 1000000000 max_clog_sync_delay_seconds
FROM
  (
    SELECT
      MAX(end_scn) leader_ts,
      tenant_id,
      role
    FROM
      gv$ob_log_stat
    WHERE
      role = 'LEADER'
    GROUP BY
      tenant_id
  ) leader
  INNER JOIN (
    SELECT
      MIN(end_scn) follower_ts,
      tenant_id,
      role
    FROM
      gv$ob_log_stat
    WHERE
      role = 'FOLLOWER'
    GROUP BY
      tenant_id
  ) follower ON leader.tenant_id = follower.tenant_id
GROUP BY
  leader.tenant_id
ORDER BY
  leader.tenant_id;
```

## Query the Number of Index Errors

```
SELECT
  /*+ MONITOR_AGENT QUERY_TIMEOUT(100000000) */
  COUNT(*) AS cnt
FROM
  cdb_indexes
WHERE
  status IN ('ERROR', 'UNUSABLE');
```

## Query the Status of Indexes

```
SELECT
  con_id tenant_id,
  table_type,
  table_owner,
  table_name,
  owner index_owner,
  index_name,
  status,
  index_type,
  uniqueness,
  compression
FROM
  cdb_indexes
WHERE
  con_id = 1012
  AND table_owner = 'ALVIN'
--   AND table_name = 'TEST'
ORDER BY
  tenant_id,
  table_owner,
  table_name,
  index_name;
```

## Query Abnormal Indexes

```
SELECT
  con_id tenant_id,
  table_type,
  table_owner,
  table_name,
  owner index_owner,
  index_name,
  status,
  index_type,
  uniqueness,
  compression
FROM
  cdb_indexes
WHERE
  status IN ('ERROR', 'UNUSABLE')
  AND con_id = 1012
  AND table_owner = 'ALVIN';
```

## Query Plan Cache Statistics

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  mem_used,
  access_count,
  hit_count
FROM
  v$ob_plan_cache_stat;
```

## Query the Duration of MemTable Snapshots

```
SELECT
  /*+ PARALLEL(2), ENABLE_PARALLEL_DML, MONITOR_AGENT */
  tenant_id,
  svr_ip,
  svr_port,
  MAX(unix_timestamp(now()) - end_log_scn / 1000000000) max_snapshot_duration_seconds
FROM
  gv$ob_sstables
WHERE
  table_type = 'MEMTABLE'
  AND is_active = 'NO'
  AND end_log_scn / 1000000000 > 1
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

## Query Memory Usage of the Tenant sys500

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(hold) / 1024 / 1024) AS hold_mb,
  round(SUM(used) / 1024 / 1024) AS used_mb
FROM
  gv$ob_memory
WHERE
  tenant_id = 500
  AND mod_name <> 'KvstorCacheMb'
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

## Query Memory Usage Statistics Grouped by Tenant

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(hold) / 1024 / 1024) AS hold_mb,
  round(SUM(used) / 1024 / 1024) AS used_mb
FROM
  gv$ob_memory
WHERE
  mod_name <> 'KvstorCacheMb'
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

## Query Memory Usage Statistics Grouped by Module

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  svr_ip,
  svr_port,
  mod_name,
  round(SUM(hold) / 1024 / 1024) AS hold_mb,
  round(SUM(used) / 1024 / 1024) AS used_mb
FROM
  gv$ob_memory
WHERE
  mod_name <> 'KvstorCacheMb'
GROUP BY
  tenant_id,
  svr_ip,
  svr_port,
  mod_name
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  mod_name;
```

## Query Latch Information

```
SELECT
  /* MONITOR_AGENT */
  con_id tenant_id,
  name,
  svr_ip,
  svr_port,
  gets,
  misses,
  sleeps,
  immediate_gets,
  immediate_misses,
  spin_gets,
  wait_time / 1000000 AS wait_time
FROM
  gv$latch
WHERE
  (
    con_id = 1
    OR con_id > 1000
  )
  AND (
    gets > 0
    OR misses > 0
    OR sleeps > 0
    OR immediate_gets > 0
    OR immediate_misses > 0
  )
ORDER BY
  tenant_id,
  name,
  svr_ip,
  svr_port;
```

## Query the Time Spent for Ongoing System Jobs

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  job_type AS task_type,
  timestampdiff(second, start_time, current_timestamp) AS max_sys_task_duration_seconds,
  rs_svr_ip AS svr_ip,
  rs_svr_port AS svr_port
FROM
  dba_ob_tenant_jobs
WHERE
  job_status = 'INPROGRESS'
UNION
SELECT
  tenant_id,
  job_type AS task_type,
  timestampdiff(second, start_time, current_timestamp) AS max_sys_task_duration_seconds,
  rs_svr_ip AS svr_ip,
  rs_svr_port AS svr_port
FROM
  dba_ob_unit_jobs
WHERE
  tenant_id IS NOT NULL
  AND job_status = 'INPROGRESS'
ORDER BY
  tenant_id,
  task_type,
  svr_ip,
  svr_port;
```

## Query the Time Spent for All System Jobs

```
SELECT
  /* MONITOR_AGENT */
  tenant_id,
  rs_svr_ip AS svr_ip,
  rs_svr_port svr_port,
  job_status,
  job_type AS task_type,
  timestampdiff(second, start_time, current_timestamp) AS max_sys_task_duration_seconds
FROM
  dba_ob_tenant_jobs
UNION
SELECT
  tenant_id,
  rs_svr_ip AS svr_ip,
  rs_svr_port svr_port,
  job_status,
  job_type AS task_type,
  timestampdiff(second, start_time, current_timestamp) AS max_sys_task_duration_seconds
FROM
  dba_ob_unit_jobs
WHERE
  tenant_id IS NOT NULL
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  job_status,
  task_type;
```

## Query the Time Spent for Server Jobs

Execute the following SQL statement to query the time spent for ongoing server jobs:

```
SELECT
  job_type AS task_type,
  timestampdiff(second, start_time, current_timestamp) AS max_sys_task_duration_seconds,
  svr_ip
FROM
  dba_ob_server_jobs
WHERE
  job_status = 'INPROGRESS'
ORDER BY
  start_time DESC,
  task_type,
  job_status;
```

Execute the following SQL statement to query the time spent for all server jobs:

```
SELECT
  job_type AS task_type,
  job_status,
  timestampdiff(second, start_time, current_timestamp) AS max_sys_task_duration_seconds,
  svr_ip
FROM
  dba_ob_server_jobs
ORDER BY
  start_time DESC,
  task_type,
  job_status;
```

## Query System Event Statistics Grouped by Tenant

```
SELECT
  /* MONITOR_AGENT */
  con_id tenant_id,
  SUM(total_waits) AS total_waits,
  SUM(time_waited_micro) / 1000000 AS time_waited
FROM
  v$system_event
WHERE
  v$system_event.wait_class <> 'IDLE'
  AND (
    con_id > 1000
    OR con_id = 1
  )
GROUP BY
  tenant_id;
```

## Query System Event Statistics Grouped by Event

```
SELECT
  /* MONITOR_AGENT */
  con_id tenant_id,
  CASE
  WHEN event_id = 10000 THEN 'INTERNAL'
  WHEN event_id = 13000 THEN 'SYNC_RPC'
  WHEN event_id = 14003 THEN 'ROW_LOCK_WAIT'
  WHEN (
    event_id >= 10001
    AND event_id <= 11006
  )
  OR (
    event_id >= 11008
    AND event_id <= 11011
  ) THEN 'IO'
  WHEN event LIKE 'latch:%' THEN 'LATCH'
  ELSE 'OTHER'
END
  event_group,
  SUM(total_waits) AS total_waits,
  SUM(time_waited_micro / 1000000) AS time_waited
FROM
  v$system_event
WHERE
  v$system_event.wait_class <> 'IDLE'
  AND (
    con_id > 1000
    OR con_id = 1
  )
GROUP BY
  tenant_id,
  event_group
ORDER BY
  tenant_id,
  event_group;
```



## Query System Statistics

```
SELECT /* MONITOR_AGENT */
    con_id tenant_id,
    stat_id,
    value
FROM
    v$sysstat
WHERE
    stat_id IN ( 10000, 10001, 10002, 10003, 10004,
                 10005, 10006, 140002, 140003, 140005,
                 140006, 140012, 140013, 40030, 80040,
                 80041, 130000, 130001, 130002, 130004,
                 20000, 20001, 20002, 30000, 30001,
                 30002, 30005, 30006, 30007, 30008,
                 30009, 30010, 30011, 30012, 30013,
                 30080, 30081, 30082, 30083, 30084,
                 30085, 30086, 40000, 40001, 40002,
                 40003, 40004, 40005, 40006, 40007,
                 40008, 40009, 40010, 40011, 40012,
                 40018, 40019, 40116, 40117, 40118,
                 50000, 50001, 60087, 50004, 50005,
                 50008, 50009, 50010, 50011, 50037,
                 50038, 60000, 60001, 60002, 60003,
                 60004, 60005, 60019, 60020, 60021,
                 60022, 60023, 60024, 80001, 80002,
                 80003, 80007, 80008, 80009, 80057,
                 120000, 120001, 120009, 120008 )
    AND ( con_id > 1000
          OR con_id = 1 )
    AND class < 1000;
```

Execute the following SQL statement to exclude the statistics of meta tenants:

```
SELECT /* MONITOR_AGENT */
    tenant_id,
    stat_id,
    value
FROM
    v$sysstat,
    dba_ob_tenants
WHERE
    stat_id IN ( 30066, 50003, 50021, 50022, 50030,
                 50039, 50040, 60031, 60057, 60083,
                 80023, 80025, 80026, 120002, 120005,
                 120006, 200001, 200002 )
    AND ( con_id > 1000
          OR con_id = 1 )
    AND dba_ob_tenants.tenant_id = v$sysstat.con_id
    AND dba_ob_tenants.tenant_type <> 'META'
UNION ALL
SELECT
    con_id AS tenant_id,
    stat_id,
    value
FROM
    v$sysstat
WHERE
    stat_id IN ( 80025, 80026, 80023 )
    AND con_id > 1
    AND con_id < 1001
    AND value > 0;
```