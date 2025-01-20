---
title: 合并管理
weight: 6
---

本文中在系统租户下查询的内容，均需要通过 `root@sys` 登陆。

## 系统租户下查询所有租户的合并状态
`root@sys` 登陆查询：
```
SELECT
  tenant_id,
  global_broadcast_scn AS broadcast_scn,
  is_error AS error,
  status,
  frozen_scn,
  last_scn,
  is_suspended AS suspend,
  info,
  start_time,
  last_finish_time,
  timestampdiff(second, start_time, last_finish_time) merge_time_second
FROM
  cdb_ob_major_compaction
ORDER BY
  start_time DESC
LIMIT
  50;
```

```
SELECT
  *
FROM
  cdb_ob_zone_major_compaction;
```

## 普通租户下查询当前租户的合并状态

```
SELECT
  global_broadcast_scn AS broadcast_scn,
  is_error AS error,
  status,
  frozen_scn,
  last_scn,
  is_suspended AS suspend,
  info,
  start_time,
  last_finish_time,
  timestampdiff(second, start_time, last_finish_time) merge_time_second
FROM
  dba_ob_major_compaction
ORDER BY
  start_time DESC
LIMIT
  50;
```

## 查询所有租户的 tablet 转储历史信息
`root@sys` 登陆查询：

```
SELECT
  *
FROM
  gv$ob_tablet_compaction_history
WHERE
  type = 'MINI_MERGE'
  AND finish_time >= date_sub(now(), INTERVAL 2 HOUR)
ORDER BY
  start_time DESC
LIMIT
  50;
```

```
SELECT
  tenant_id,
  MIN(start_time) AS min_start_time,
  MAX(finish_time) AS max_finish_time,
  SUM(occupy_size) AS occupy_size,
  SUM(total_row_count) AS total_row_count,
  COUNT(1) AS tablet_count
FROM
  gv$ob_tablet_compaction_history
WHERE
  type = 'MINI_MERGE'
--   AND finish_time >= date_sub(now(), INTERVAL 600 SECOND)
--   AND finish_time >= date_sub(now(), INTERVAL 3 HOUR)
  AND finish_time >= date_sub(now(), INTERVAL 1 DAY)
GROUP BY
  tenant_id
LIMIT
  50;
```

## memstore 信息

`root@sys` 登陆查询：
```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  round(active_span / 1024 / 1024) active_mb,
  round(memstore_used / 1024 / 1024) memstore_used_mb,
  round(freeze_trigger / 1024 / 1024) freeze_trigger_mb,
  round(memstore_limit / 1024 / 1024) mem_limit_mb,
  freeze_cnt,
  round(memstore_used / memstore_limit, 2) mem_usage
FROM
  gv$ob_memstore
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

## 租户 memstore 信息

`root@sys` 登陆查询：
```
SELECT
  /*+ READ_CONSISTENCY(WEAK),query_timeout(100000000) */
  t.tenant_id,
  t.tenant_name,
  MAX(m.freeze_cnt) AS freeze_cnt,
  s.value AS minor_freeze_times,
  round(100 * MAX(m.freeze_cnt) / s.value, 2) AS compact_trigger_ratio
FROM
  gv$ob_memstore m
  JOIN dba_ob_tenants t ON m.tenant_id = t.tenant_id
  JOIN gv$ob_parameters s ON s.name = 'major_compact_trigger'
  AND s.tenant_id = t.tenant_id
WHERE
  t.tenant_id > 1000
  AND t.tenant_type <> 'meta'
GROUP BY
  m.tenant_id;
```

## 查看转储信息

`root@sys` 登陆查询：

```
SELECT
  *
FROM
  dba_ob_rootservice_event_history
WHERE
  event = 'root_minor_freeze'
ORDER BY
  timestamp DESC
LIMIT
  30;
```

## 查看每日合并耗时

`root@sys` 登陆查询：

```
SELECT
  t.tenant_id,
  t.global_boradcast_scn,
  t.merge_begin_time,
  u.merge_end_time,
  timestampdiff(second, t.merge_begin_time, u.merge_end_time) merge_time_second
FROM
  (
    SELECT
      value1 tenant_id,
      value2 global_boradcast_scn,
      timestamp merge_begin_time
    FROM
      dba_ob_rootservice_event_history
    WHERE
      module = 'daily_merge'
      AND event = 'merging'
  ) t,
  (
    SELECT
      value1 tenant_id,
      value2 global_boradcast_scn,
      timestamp merge_end_time
    FROM
      dba_ob_rootservice_event_history
    WHERE
      module = 'daily_merge'
      AND event = 'global_merged'
  ) u
WHERE
  t.tenant_id = u.tenant_id
  AND t.global_boradcast_scn = u.global_boradcast_scn
ORDER BY
  3 DESC
LIMIT
  10;
```