---
title: OCP 中使用的运维 SQL
weight: 9
---

因为有一部分用户希望我们能够在教程中增加一些运维常用的 SQL 或者命令，用于替换 OCP 工具的部分功能，以便在命令行模式中对数据库进行运维操作。

所以在本小节中，对 3.x 和 4.x 中 OCP 工具中使用的运维 SQL 进行了汇总和展示，供大家参考。

## ob_role

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  with_rootserver,
  *
FROM
  __all_server;
```

### OceanBase 4.x

```
SELECT
  with_rootserver,
  *
FROM
  dba_ob_servers;
```

## ob_server

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  status,
  (
    CASE
    WHEN stop_time = 0 THEN 0
    ELSE (time_to_usec(now()) - stop_time) / 1000000
    END
  ) AS stopped_duration_seconds
FROM
  __all_server;
```



```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  ifnull(group_concat(svr_ip SEPARATOR ','), '') AS servers,
  'active' status,
  COUNT(1) AS cnt
FROM
  __all_server
WHERE
  status = 'active'
UNION ALL
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  ifnull(group_concat(svr_ip SEPARATOR ','), '') AS servers,
  'inactive' status,
  COUNT(1) AS cnt
FROM
  __all_server
WHERE
  status = 'inactive';
```

### OceanBase 4.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  status,
  (
    CASE
    WHEN stop_time IS NULL THEN 0
    ELSE timestampdiff(second, stop_time, current_timestamp)
    END
  ) AS stopped_duration_seconds
FROM
  dba_ob_servers;
```



```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  ifnull(group_concat(svr_ip SEPARATOR ','), '') AS servers,
  'active' status,
  COUNT(1) AS cnt
FROM
  dba_ob_servers
WHERE
  status = 'active'
UNION ALL
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  ifnull(group_concat(svr_ip SEPARATOR ','), '') AS servers,
  'inactive' status,
  COUNT(1) AS cnt
FROM
  dba_ob_servers
WHERE
  status = 'inactive';
```

## ob_cache

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  cache_name,
  round(cache_size / 1024 / 1024) cache_size_mb
FROM
  __all_virtual_kvcache_info
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  cache_name;
```



```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(cache_size) / 1024 / 1024) cache_size_mb
FROM
  __all_virtual_kvcache_info
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

### OceanBase 4.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
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



```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
    tenant_id,
    svr_ip,
    svr_port,
    round(SUM(cache_size) / 1024 / 1024) cache_size_mb
FROM
    gv$ob_kvcache
GROUP BY
    tenant_id,
    svr_ip,
    svr_port
ORDER BY
    tenant_id,
    svr_ip,
    svr_port;
```

## ob_sysstat

### OceanBase 3.x

```
SELECT /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
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
                 30080, 30081, 40000, 40001, 40002,
                 40003, 40004, 40005, 40006, 40007,
                 40008, 40009, 40010, 40011, 40012,
                 40018, 40019, 40116, 40117, 40118,
                 50000, 50001, 50002, 50004, 50005,
                 50008, 50009, 50010, 50011, 50037,
                 50038, 60000, 60001, 60002, 60003,
                 60004, 60005, 60019, 60020, 60021,
                 60022, 60023, 60024, 80057, 120000,
                 120001, 120009, 120008 )
    AND ( con_id > 1000
          OR con_id = 1 )
    AND class < 1000;
```



```
SELECT /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
    con_id AS tenant_id,
    stat_id,
    value
FROM
    v$sysstat
WHERE
    stat_id IN ( 30066, 50003, 50021, 50022, 50030,
                 50039, 50040, 60031, 60057, 80023,
                 80025, 80026, 120002, 120005, 120006,
                 200001, 200002 )
    AND ( con_id > 1000
          OR con_id = 1 )
UNION ALL
SELECT
    con_id,
    stat_id,
    value
FROM
    v$sysstat
WHERE
    stat_id IN ( 80025, 80026, 80023 )
    AND con_id > 1
    AND con_id < 1001
    AND value > 0
UNION ALL
SELECT
    con_id AS tenant_id,
    stat_id,
    value
FROM
    v$sysstat
WHERE
        name = "memstore write lock wait timeout count"
    AND ( con_id > 1000
          OR con_id = 1 );
```

### OceanBase 4.x

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

不含 META 租户的：

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

## ob_disk

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  svr_ip,
  svr_port,
  round(total_size / 1024 / 1024 / 1024) total_size_gb,
  round(free_size / 1024 / 1024 / 1024) free_size_gb
FROM
  __all_virtual_disk_stat
ORDER BY
  svr_ip,
  svr_port;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  svr_ip,
  svr_port,
  round(data_disk_capacity / 1024 / 1024 / 1024) data_disk_capacity_gb,
  round((data_disk_capacity - data_disk_in_use) / 1024 / 1024 / 1024) data_disk_free_gb,
  round(log_disk_capacity / 1024 / 1024 / 1024) log_disk_capacity_gb,
  round(log_disk_assigned / 1024 / 1024 / 1024) log_disk_assigned_gb,
  round(log_disk_in_use / 1024 / 1024 / 1024) log_disk_in_use_gb
FROM
  gv$ob_servers
ORDER BY
  svr_ip,
  svr_port;
```

## ob_server_resource

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  svr_ip,
  svr_port,
  cpu_total,
  cpu_max_assigned AS cpu_assigned,
  round(mem_total / 1024 / 1024 / 1024) mem_total_gb,
  round(mem_max_assigned / 1024 / 1024 / 1024) mem_assigned_gb,
  round(disk_total / 1024 / 1024 / 1024) disk_total_gb,
  cpu_assigned_percent,
  mem_assigned_percent
FROM
  __all_virtual_server_stat
ORDER BY
  svr_ip,
  svr_port;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  svr_ip,
  svr_port,
  cpu_capacity_max AS cpu_total,
  cpu_assigned_max AS cpu_assigned,
  round(mem_capacity / 1024 / 1024 / 1024) mem_total_gb,
  round(mem_assigned / 1024 / 1024 / 1024) mem_assigned_gb,
  round(data_disk_capacity / 1024 / 1024 / 1024) data_disk_capacity_gb,
  (cpu_assigned_max / cpu_capacity_max) AS cpu_assigned_percent,
  (mem_assigned / mem_capacity) AS mem_assigned_percent
FROM
  gv$ob_servers
ORDER BY
  svr_ip,
  svr_port;
```

## ob_table

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(100000000) */
  tenant_name,
  tenant_id,
  COUNT(*) AS cnt
FROM
  gv$table
GROUP BY
  tenant_id;
```

### OceanBase 4.x

```
SELECT
  /*+ MONITOR_AGENT QUERY_TIMEOUT(100000000) */
  con_id tenant_id,
  COUNT(*) AS cnt
FROM
  cdb_tables
GROUP BY
  con_id;
```

## ob_session

### OceanBase 3.x

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
      v$unit
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
      __all_virtual_processlist
    GROUP BY
      tenant,
      svr_ip,
      svr_port
  ) t2 ON t1.tenant_name = t2.tenant_name;
```

### OceanBase 4.x

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
      v$ob_processlist
    GROUP BY
      tenant,
      svr_ip,
      svr_port
  ) t2 ON t1.tenant_name = t2.tenant_name;
```

## ob_plan_cache

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  mem_used,
  access_count,
  hit_count
FROM
  v$plan_cache_stat;
```

### OceanBase 4.x

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

## ob_waitevent

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
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

### OceanBase 4.x

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

## ob_system_event

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
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
  event_group;
```

### OceanBase 4.x

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
  event_group;
```

## ob_tenant_memstore

### OceanBase 3.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK),query_timeout(100000000) */
  t.tenant_id,
  t.tenant_name,
  MAX(m.freeze_cnt) AS freeze_cnt,
  s.value AS minor_freeze_times,
  round(100 * MAX(m.freeze_cnt) / s.value, 2) AS compact_trigger_ratio
FROM
  gv$memstore m
  JOIN __all_tenant t ON m.tenant_id = t.tenant_id
  JOIN __all_virtual_sys_parameter_stat s ON s.name = 'minor_freeze_times'
WHERE
  t.tenant_id > 1000
GROUP BY
  m.tenant_id;
```

### OceanBase 4.x

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

## ob_unit

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  unit_id,
  unit_config_id,
  unit_config_name,
  resource_pool_id,
  resource_pool_name,
  zone,
  tenant_id,
  tenant_name,
  svr_ip,
  svr_port,
  migrate_from_svr_ip,
  migrate_from_svr_port,
  max_cpu,
  min_cpu,
  round(max_memory / 1024 / 1024 / 1024) max_memory_gb,
  round(min_memory / 1024 / 1024 / 1024) min_memory_gb,
  max_iops,
  min_iops,
  round(max_disk_size / 1024 / 1024 / 1024) max_disk_size_gb,
  max_session_num
FROM
  v$unit
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  unit_id;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  svr_ip,
  svr_port,
  unit_id,
  tenant_id,
  zone,
  zone_type,
  region,
  max_cpu,
  min_cpu,
  round(memory_size / 1024 / 1024 / 1024) memory_size_gb,
  max_iops,
  min_iops,
  iops_weight,
  round(log_disk_size / 1024 / 1024 / 1024) log_disk_size_gb,
  round(log_disk_in_use / 1024 / 1024 / 1024) log_disk_in_use_gb,
  round(data_disk_in_use / 1024 / 1024 / 1024) data_disk_in_use_gb,
  status,
  create_time
FROM
  gv$ob_units
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  unit_id;
```



```
SELECT
  unit_id,
  tenant_id,
  status,
  resource_pool_id,
  unit_group_id,
  create_time,
  modify_time,
  zone,
  svr_ip,
  svr_port,
  migrate_from_svr_ip,
  migrate_from_svr_port,
  manual_migrate,
  unit_config_id,
  max_cpu,
  min_cpu,
  round(memory_size / 1024 / 1024 / 1024) memory_size_gb,
  round(log_disk_size / 1024 / 1024 / 1024) log_disk_size_gb,
  max_iops,
  min_iops,
  iops_weight
FROM
  dba_ob_units
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  unit_id;
```

## ob_tenant_resource

### OceanBase 3.x

```
SELECT
  /*+read_consistency(weak) */
  coalesce(tenant_id, - 1) AS tenant_id,
  tenant_name,
  SUM(max_cpu) AS max_cpu,
  SUM(min_cpu) AS min_cpu,
  round(SUM(max_memory) / 1024 / 1024 / 1024) max_memory_gb,
  round(SUM(min_memory) / 1024 / 1024 / 1024) min_memory_gb
FROM
  v$unit
GROUP BY
  tenant_id;
```

### OceanBase 4.x

```
SELECT
  coalesce(t1.tenant_id, - 1) AS tenant_id,
  tenant_name,
  svr_ip,
  svr_port,
  SUM(max_cpu) AS max_cpu,
  SUM(min_cpu) AS min_cpu,
  round(SUM(max_memory) / 1024 / 1024 / 1024) max_memory_gb,
  round(SUM(min_memory) / 1024 / 1024 / 1024) min_memory_gb
FROM
  (
    SELECT
      t1.unit_id,
      t1.svr_ip,
      t1.svr_port,
      t2.tenant_id,
      t1.min_cpu,
      t1.max_cpu,
      t1.min_memory,
      t1.max_memory
    FROM
      (
        SELECT
          unit_id,
          svr_ip,
          svr_port,
          SUM(min_cpu) AS min_cpu,
          SUM(max_cpu) AS max_cpu,
          SUM(memory_size) AS min_memory,
          SUM(memory_size) AS max_memory
        FROM
          gv$ob_units
        GROUP BY
          unit_id,
      svr_ip,
      svr_port
      ) t1
      JOIN dba_ob_units t2 ON t1.unit_id = t2.unit_id
  ) t1
  JOIN dba_ob_tenants t2 ON t1.tenant_id = t2.tenant_id
WHERE
  tenant_type <> 'meta'
GROUP BY
  tenant_id
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

## ob_tenant_assigned

### OceanBase 3.x

```
SELECT
  t2.tenant_id,
  t2.tenant_name,
  t1.svr_ip,
  t1.svr_port,
  t1.cpu_total,
  t1.cpu_max_assigned AS cpu_assigned,
  round(t1.mem_total / 1024 / 1024 / 1024) mem_total_gb,
  round(t1.mem_max_assigned / 1024 / 1024 / 1024) mem_assigned_gb
FROM
  __all_virtual_server_stat t1
  JOIN (
    SELECT
      tenant_id,
      tenant_name,
      svr_ip,
      svr_port
    FROM
      v$unit
  ) t2 ON t1.svr_ip = t2.svr_ip
  AND t1.svr_port = t2.svr_port
ORDER BY
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  t4.tenant_id,
  t4.tenant_name,
  t4.svr_ip,
  t4.svr_port,
  cpu_capacity AS cpu_total,
  cpu_assigned,
  round(mem_capacity / 1024 / 1024 / 1024) mem_total_gb,
  round(mem_assigned / 1024 / 1024 / 1024) mem_assigned_gb
FROM
  gv$ob_servers t1
  JOIN (
    SELECT
      t2.tenant_id,
      t3.tenant_name,
      t2.svr_ip,
      t2.svr_port
    FROM
      gv$ob_units t2
      LEFT JOIN dba_ob_tenants t3 ON t2.tenant_id = t3.tenant_id
    WHERE
      t3.tenant_type <> 'META'
  ) t4 ON t1.svr_ip = t4.svr_ip
  AND t1.svr_port = t4.svr_port
ORDER BY
  t4.tenant_id,
  t1.svr_ip,
  t1.svr_port;
```

## ob_tenant_disk

### OceanBase 3.x

```
SELECT
  t2.tenant_id,
  t2.tenant_name,
  t1.svr_ip,
  t1.svr_port,
  round(t1.total_size / 1024 / 1024 / 1024) total_size_gb
FROM
  __all_virtual_disk_stat t1
  JOIN (
    SELECT
      tenant_id,
      tenant_name,
      svr_ip,
      svr_port
    FROM
      gv$unit
  ) t2 ON t1.svr_ip = t2.svr_ip
  AND t1.svr_port = t2.svr_port
ORDER BY
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  t4.tenant_id AS tenant_id,
  t4.tenant_name,
  t4.svr_ip,
  t4.svr_port,
  round(t1.data_disk_capacity / 1024 / 1024 / 1024) total_size_gb
FROM
  gv$ob_servers t1
  JOIN (
    SELECT
      t2.tenant_id,
      t3.tenant_name,
      t2.svr_ip,
      t2.svr_port
    FROM
      gv$ob_units t2
      LEFT JOIN dba_ob_tenants t3 ON t2.tenant_id = t3.tenant_id
    WHERE
      t3.tenant_type <> 'META'
  ) t4 ON t1.svr_ip = t4.svr_ip
  AND t1.svr_port = t4.svr_port
ORDER BY
  t4.tenant_id,
  t1.svr_ip,
  t1.svr_port;
```

## ob_tenant_task

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  task_type,
  MAX(
    timestampdiff(
      second,
      sys_task_status.start_time,
      current_timestamp
    )
  ) max_sys_task_duration_seconds
FROM
  __all_virtual_sys_task_status sys_task_status
GROUP BY
  tenant_id,
  task_type
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  task_type;
```

### OceanBase 4.x

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

## ob_server_task

### OceanBase 3.x

无

### OceanBase 4.x

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

## ob_memtable

### OceanBase 3.x

```
SELECT
  /*+ PARALLEL(2), ENABLE_PARALLEL_DML, MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  MAX(
    unix_timestamp(now()) - snapshot_version / 1000000
  ) max_snapshot_duration_seconds
FROM
  __all_virtual_table_mgr
WHERE
  snapshot_version / 1000000 > 1
  AND table_type = 0
  AND is_active = 0
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

### OceanBase 4.x

```
SELECT
  /*+ PARALLEL(2), ENABLE_PARALLEL_DML, MONITOR_AGENT */
  tenant_id,
  svr_ip,
  svr_port,
  MAX(unix_timestamp(now()) - end_log_scn / 1000000000) max_snapshot_duration_seconds
FROM
  v$ob_sstables
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

## ob_clog

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  stat.svr_ip,
  stat.svr_port,
  stat.table_id >> 40 tenant_id,
  stat.replica_type,
  MAX(stat.next_replay_ts_delta) / 1000000 AS max_clog_sync_delay_seconds
FROM
  __all_virtual_clog_stat stat
  LEFT JOIN (
    SELECT
      meta.svr_ip,
      meta.svr_port,
      meta.table_id,
      meta.partition_id
    FROM
      __all_virtual_meta_table meta
    WHERE
      meta.status = 'REPLICA_STATUS_NORMAL'
      AND meta.table_id NOT IN (
        SELECT
          table_id
        FROM
          __all_virtual_partition_migration_status mig
        WHERE
          mig.action <> 'END'
      )
  ) meta ON stat.table_id = meta.table_id
  AND stat.partition_idx = meta.partition_id
  AND stat.svr_ip = meta.svr_ip
  AND stat.svr_port = meta.svr_port
GROUP BY
  svr_ip,
  svr_port,
  tenant_id,
  replica_type
HAVING
  max_clog_sync_delay_seconds < 18446744073709
ORDER BY
  svr_ip,
  svr_port,
  tenant_id,
  replica_type;
```

### OceanBase 4.x

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

## ob_index

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(100000000) */
  COUNT(*) AS cnt
FROM
  gv$table
WHERE
  table_type IN (5)
  AND index_status IN (5, 6, 7);
```



```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(100000000) */
    index_status,
    tenant_id,
    tenant_name,
    table_id,
    table_name,
    database_id,
    database_name,
    table_type,
    comment,
    index_type
FROM
    gv$table
WHERE
    table_type IN ( 5 )
    AND tenant_name = 'oboracle'
    AND database_name = 'ALVIN';
```

### OceanBase 4.x

```
SELECT
  /*+ MONITOR_AGENT QUERY_TIMEOUT(100000000) */
  COUNT(*) AS cnt
FROM
  cdb_indexes
WHERE
  status IN ('ERROR', 'UNUSABLE');
```



```
SELECT
  status,
  con_id,
  owner,
  index_name,
  index_type,
  table_owner,
  table_name,
  table_type,
  uniqueness,
  compression
FROM
  cdb_indexes
WHERE
  table_owner = 'ALVIN'
  AND table_name = 'TEST';
```

## ob_memstore

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  ip,
  port,
  tenant_id,
  round(active / 1024 / 1024) active_mb,
  round(total / 1024 / 1024) memstore_used_mb,
  round(freeze_trigger / 1024 / 1024) freeze_trigger_mb,
  round(mem_limit / 1024 / 1024) mem_limit_mb,
  freeze_cnt,
  round(total / mem_limit, 2) mem_usage
FROM
  gv$memstore
ORDER BY
  ip,
  port;
```

### OceanBase 4.x

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

## ob_compaction

### OceanBase 3.x

无

### OceanBase 4.x

```
SELECT
  tenant_id,
  frozen_scn AS frozen_version,
  last_scn AS last_version,
  CASE is_error
  WHEN 'YES' THEN 1
  ELSE 0
END
  AS is_error,
  CASE is_suspended
  WHEN 'YES' THEN 1
  ELSE 0
END
  AS is_suspended,
  start_time AS start_time,
  frozen_time AS frozen_time,
  now() AS current
FROM
  cdb_ob_major_compaction;
```

## ob_tenant500_memory

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(hold) / 1024 / 1024) AS hold_mb,
  round(SUM(used) / 1024 / 1024) AS used_mb
FROM
  __all_virtual_memory_info
WHERE
  tenant_id = 500
  AND mod_name <> 'OB_KVSTORE_CACHE_MB'
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

### OceanBase 4.x

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

## ob_tenant_memory

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(hold) / 1024 / 1024) AS hold_mb,
  round(SUM(used) / 1024 / 1024) AS used_mb
FROM
  __all_virtual_memory_info
WHERE
  mod_name <> 'OB_KVSTORE_CACHE_MB'
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

### OceanBase 4.x

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

## ob_unit_config

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  __all_unit.svr_ip,
  __all_unit_config.name,
  max_cpu,
  min_cpu,
  round(max_memory / 1024 / 1024 / 1024) AS max_memory_gb,
  round(min_memory / 1024 / 1024 / 1024) AS min_memory_gb,
  max_iops,
  min_iops
FROM
  __all_resource_pool,
  __all_unit_config,
  __all_unit
WHERE
  __all_resource_pool.unit_config_id = __all_unit_config.unit_config_id
  AND __all_unit.resource_pool_id = __all_resource_pool.resource_pool_id
ORDER BY
  tenant_id,
  __all_unit.svr_ip,
  __all_unit_config.name;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  p.tenant_id,
  u.svr_ip,
  uc.name,
  uc.max_cpu,
  uc.min_cpu,
  round(uc.memory_size / 1024 / 1024 / 1024) AS max_memory_gb,
  round(uc.log_disk_size / 1024 / 1024 / 1024) AS log_disk_size_gb,
  uc.max_iops,
  uc.min_iops
FROM
  dba_ob_resource_pools p,
  dba_ob_unit_configs uc,
  dba_ob_units u
WHERE
  p.unit_config_id = uc.unit_config_id
  AND u.resource_pool_id = p.resource_pool_id
ORDER BY
  p.tenant_id,
  u.svr_ip,
  uc.name;
```

## ob_tenant_log_disk

### OceanBase 3.x

无

### OceanBase 4.x

```
SELECT
  t1.unit_id,
  t1.svr_ip,
  t1.svr_port,
  t3.tenant_id,
  t3.tenant_name,
  round(t1.log_disk_size / 1024 / 1024 / 1024) AS log_disk_size_gb,
  round(t1.log_disk_in_use / 1024 / 1024 / 1024) AS log_disk_in_use_gb
FROM
  (
    SELECT
      unit_id,
      svr_ip,
      svr_port,
      SUM(log_disk_size) AS log_disk_size,
      SUM(log_disk_in_use) AS log_disk_in_use
    FROM
      gv$ob_units
    GROUP BY
      unit_id,
      svr_ip,
      svr_port
  ) t1
  JOIN dba_ob_units t2 ON t1.unit_id = t2.unit_id
  AND t1.svr_ip = t2.svr_ip
  AND t1.svr_port = t2.svr_port
  JOIN (
    SELECT
      tenant_id,
      tenant_name
    FROM
      dba_ob_tenants
    WHERE
      tenant_type IN ('SYS', 'USER')
  ) t3 ON t2.tenant_id = t3.tenant_id
ORDER BY
  t3.tenant_id,
  t1.svr_ip,
  t1.svr_port,
  t1.unit_id;
```

## ob_system_event_detail

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  con_id AS tenant_id,
  event_id,
  event AS event_name,
  wait_class,
  total_waits,
  total_timeouts,
  time_waited * 10000 AS time_waited_us
FROM
  v$system_event
WHERE
  wait_class <> 'IDLE'
  AND (
    con_id > 1000
    OR con_id = 1
  )
  AND total_waits > 0;
```

### OceanBase 4.x

```
SELECT
  /* MONITOR_AGENT */
  con_id AS tenant_id,
  event_id,
  event AS event_name,
  wait_class,
  total_waits,
  total_timeouts,
  time_waited * 10000 AS time_waited_us
FROM
  v$system_event
WHERE
  wait_class <> 'IDLE'
  AND (
    con_id > 1000
    OR con_id = 1
  )
  AND total_waits > 0;
```

## ob_latch

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
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

### OceanBase 4.x

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

## ob_tenant_server

### OceanBase 3.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(data_size) / 1024 / 1024) AS data_size_mb,
  round(SUM(required_size) / 1024 / 1024) AS required_size_mb,
  sum(row_count) row_count
from
  (
    SELECT
      tenant_id,
      svr_ip,
      svr_port,
      table_id,
      partition_id,
      data_size,
      required_size,
      row_count
    FROM
      __all_virtual_meta_table
    union
    SELECT
      tenant_id,
      svr_ip,
      svr_port,
      table_id,
      partition_id,
      data_size,
      required_size,
      row_count
    FROM
      __all_root_table
  )
group by
  tenant_id,
  svr_ip,
  svr_port;
```

以下 SQL 有性能问题，不再使用：

```
SELECT
  tenant_id,
  svr_ip,
  svr_port,
  table_type,
  SUM(replica_count) AS partition_replica_count,
  SUM(row_count) AS row_count,
  round(SUM(data_size) / 1024 / 1024) AS data_size_mb,
  round(SUM(required_size) / 1024 / 1024) AS required_size_mb
FROM
  (
    SELECT
      c.tenant_id,
      COUNT(*) AS replica_count,
      (
        CASE b.table_type
        WHEN 5 THEN 'index_table'
        ELSE 'data_table'
        END
      ) AS table_type,
      c.svr_ip,
      c.svr_port,
      SUM(c.row_count) AS row_count,
      SUM(c.occupy_size) AS data_size,
      COUNT(DISTINCT(c.macro_idx_in_data_file)) * 2 * 1024 * 1024 AS required_size
    FROM
      (
        SELECT
          svr_ip,
          svr_port,
          tenant_id,
          row_count,
          table_id,
          partition_id,
          occupy_size,
          macro_idx_in_data_file
        FROM
          __all_virtual_partition_sstable_macro_info
        GROUP BY
          svr_ip,
          svr_port,
          tenant_id,
          table_id,
          partition_id,
          macro_idx_in_data_file
      ) c
      LEFT JOIN __all_virtual_table b ON b.tenant_id = c.tenant_id
      AND b.table_id = c.table_id
    GROUP BY
      tenant_id,
      svr_ip,
      svr_port,
      partition_id,
      b.table_type
  )
GROUP BY
  tenant_id,
  svr_ip,
  svr_port,
  table_type;
```

### OceanBase 4.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  round(SUM(data_size) / 1024 / 1024) AS data_size_mb,
  round(SUM(required_size) / 1024 / 1024) AS required_size_mb
FROM
  cdb_ob_table_locations a
  JOIN (
    SELECT
      tenant_id,
      tablet_id,
      svr_ip,
      svr_port,
      data_size,
      required_size
    FROM
      __all_virtual_tablet_meta_table
  ) b ON a.tenant_id = b.tenant_id
  AND a.tablet_id = b.tablet_id
  AND a.svr_ip = b.svr_ip
  AND a.svr_port = b.svr_port
  JOIN __all_virtual_table c ON a.tenant_id = c.tenant_id
  AND a.table_id = c.table_id
GROUP BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port
ORDER BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port;
```

```
SELECT
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  a.row_count,
  round(a.data_size / 1024 / 1024) AS data_size_mb,
  round(b.required_size / 1024 / 1024) AS required_size_mb
FROM
  (
    SELECT
      tenant_id,
      svr_ip,
      svr_port,
      SUM(occupy_size) AS data_size,
      SUM(row_count) AS row_count
    FROM
      (
        SELECT
          tenant_id,
          svr_ip,
          svr_port,
          tablet_id,
          row_count,
          occupy_size
        FROM
          __all_virtual_tablet_sstable_macro_info
        GROUP BY
          tenant_id,
          tablet_id,
          svr_ip,
          svr_port,
          macro_block_idx
      )
    GROUP BY
      tenant_id,
      svr_ip,
      svr_port
  ) a
  INNER JOIN (
    SELECT
      tenant_id,
      svr_ip,
      svr_port,
      SUM(required_size) AS required_size
    FROM
      (
        SELECT
          tenant_id,
          svr_ip,
          svr_port,
          COUNT(DISTINCT(macro_block_idx)) * 2 * 1024 * 1024 AS required_size
        FROM
          __all_virtual_tablet_sstable_macro_info
        GROUP BY
          tenant_id,
          svr_ip,
          svr_port,
          macro_block_idx
      )
    GROUP BY
      tenant_id,
      svr_ip,
      svr_port
  ) b ON a.tenant_id = b.tenant_id
  AND a.svr_ip = b.svr_ip
  AND a.svr_port = b.svr_port
ORDER BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port;
```

## ob_tenant_server_data_index

### OceanBase 3.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  a.tenant_id,
  b.svr_ip,
  b.svr_port,
  round(SUM(size) / 1024 / 1024) AS data_size_mb
FROM
  __all_virtual_table_mgr b
  LEFT JOIN __all_virtual_table a ON a.tenant_id = b.tenant_id
  AND a.table_id = b.index_id
WHERE
  a.table_type = 5
GROUP BY
  1,
  2,
  3;
```

### OceanBase 4.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  SUM(data_size) AS data_size
FROM
  cdb_ob_table_locations a
  JOIN (
    SELECT
      tenant_id,
      tablet_id,
      svr_ip,
      svr_port,
      data_size,
      required_size
    FROM
      __all_virtual_tablet_meta_table
  ) b ON a.tenant_id = b.tenant_id
  AND a.tablet_id = b.tablet_id
  AND a.svr_ip = b.svr_ip
  AND a.svr_port = b.svr_port
  JOIN __all_virtual_table c ON a.tenant_id = c.tenant_id
  AND c.table_type = 5
  AND a.table_id = c.table_id
GROUP BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port;
```

以下 SQL 目前已经不用了：

```
SELECT
  tenant_id,
  svr_ip,
  svr_port,
  SUM(row_count) AS row_count,
  round(SUM(data_size) / 1024 / 1024) AS data_size_mb,
  table_type
FROM
  (
    SELECT
      a.tenant_id,
      a.svr_ip,
      a.svr_port,
      SUM(row_count) AS row_count,
      SUM(occupy_size) AS data_size,
      (
        CASE table_type
        WHEN 'INDEX' THEN 'index_table'
        ELSE 'data_table'
        END
      ) AS table_type
    FROM
      (
        SELECT
          tenant_id,
          svr_ip,
          svr_port,
          tablet_id,
          row_count,
          occupy_size
        FROM
          __all_virtual_tablet_sstable_macro_info
        GROUP BY
          tenant_id,
          tablet_id,
          svr_ip,
          svr_port,
          macro_block_idx
      ) a
      LEFT JOIN cdb_ob_table_locations b ON a.tenant_id = b.tenant_id
      AND a.tablet_id = b.tablet_id
    GROUP BY
      a.tenant_id,
      svr_ip,
      svr_port,
      table_type
  )
GROUP BY
  tenant_id,
  svr_port,
  svr_ip,
  table_type
ORDER BY
  tenant_id,
  svr_port,
  svr_ip,
  table_type;
```

## ob_tenant_unit

### OceanBase 3.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) */
  coalesce(tenant_id, - 1) AS tenant_id,
  tenant_name,
  svr_ip,
  svr_port,
  unit_id,
  zone,
  max_cpu,
  min_cpu,
  round(max_memory / 1024 / 1024 / 1024) AS max_memory_gb,
  round(min_memory / 1024 / 1024 / 1024) AS min_memory_gb,
  1 AS unit_count
FROM
  gv$unit
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  unit_id;
```

### OceanBase 4.x

```
SELECT
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port,
  t1.unit_id,
  t1.zone,
  t1.min_cpu,
  t1.max_cpu,
  round(t1.max_memory / 1024 / 1024 / 1024) AS max_memory_gb,
  round(t1.min_memory / 1024 / 1024 / 1024) AS min_memory_gb
FROM
  (
    SELECT
      unit_id,
      svr_ip,
      svr_port,
      zone,
      SUM(min_cpu) AS min_cpu,
      SUM(max_cpu) AS max_cpu,
      SUM(memory_size) AS min_memory,
      SUM(memory_size) AS max_memory
    FROM
      gv$ob_units
    GROUP BY
      unit_id,
      svr_ip,
      svr_port
  ) t1
  JOIN dba_ob_units t2 ON t1.unit_id = t2.unit_id
  AND t1.svr_ip = t2.svr_ip
  AND t1.svr_port = t2.svr_port
ORDER BY
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port,
  t1.unit_id;
```

## ob_server_partition_replica

### OceanBase 3.x

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) */
  t1.svr_ip,
  t1.svr_port,
  t2.zone,
  t1.`count` AS count
FROM
  (
    SELECT
      svr_ip,
      svr_port,
      COUNT(*) AS `count`
    FROM
      __all_virtual_partition_info
    GROUP BY
      svr_ip,
      svr_port
  ) t1
  JOIN __all_server t2 ON t1.svr_ip = t2.svr_ip
  AND t1.svr_port = t2.svr_port
ORDER BY
  t1.svr_ip,
  t1.svr_port,
  t2.zone;
```



```
SELECT
  /*+ READ_CONSISTENCY(WEAK) */
  t1.tenant_id,
  t1.svr_ip,
  t1.svr_port,
  t2.zone,
  t1.`count` AS count
FROM
  (
    SELECT
      tenant_id,
      svr_ip,
      svr_port,
      COUNT(*) AS `count`
    FROM
      __all_virtual_partition_info
    GROUP BY
      tenant_id,
      svr_ip,
      svr_port
  ) t1
  JOIN __all_server t2 ON t1.svr_ip = t2.svr_ip
  AND t1.svr_port = t2.svr_port
ORDER BY
  t1.tenant_id,
  t1.svr_ip,
  t1.svr_port,
  t2.zone;
```

### OceanBase 4.x

无

## ob_server_partition

### OceanBase 3.x

以下

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) */
  t.svr_ip,
  t.svr_port,
  t.zone,
  coalesce(_max_partition_cnt_per_server, 30000) AS replica_limit
FROM
  (
    SELECT
      svr_ip,
      svr_port,
      MAX(zone) AS zone,
      MAX(
        CASE `name`
        WHEN '_max_partition_cnt_per_server' THEN `value`
        ELSE NULL
        END
      ) AS _max_partition_cnt_per_server
    FROM
      __all_virtual_sys_parameter_stat
    GROUP BY
      `svr_ip`,
      `svr_port`
  ) t;
```



```
SELECT
  /*+ READ_CONSISTENCY(WEAK) */
  svr_ip,
  svr_port,
  zone,
  `value`
FROM
  __all_virtual_sys_parameter_stat
WHERE
  `name` = '_max_partition_cnt_per_server'
ORDER BY
  svr_ip,
  svr_port;
```

### OceanBase 4.x

无

## ob_tenant_context_memory

### OceanBase 3.x

```
SELECT
  /*+ MONITOR_AGENT READ_CONSISTENCY(WEAK) */
  tenant_id,
  svr_ip,
  svr_port,
  mod_name,
  round(SUM(hold) / 1024 / 1024) AS hold_mb,
  round(SUM(used) / 1024 / 1024) AS used_mb
FROM
  __all_virtual_memory_info
WHERE
  mod_name <> 'OB_KVSTORE_CACHE_MB'
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

### OceanBase 4.x

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

## log_stream

### OceanBase 3.x

无

### OceanBase 4.x

OceanBase 4.1+ :

```
SELECT
  /*+ MONITOR_AGENT */
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port,
  sum(t1.degraded_list <> '') AS degraded_count
FROM
  gv$ob_log_stat t1
  INNER JOIN dba_ob_tenants t2 ON t1.tenant_id = t2.tenant_id
  AND t2.tenant_type != 'META'
GROUP BY
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port
ORDER BY
  t2.tenant_id,
  t1.svr_ip,
  t1.svr_port;
```

## ob_database_disk

### OceanBase 3.x

```
SELECT
  t1.tenant_id,
  t2.database_id,
  t3.database_name,
  round(SUM(t1.data_size) / 1024 / 1024) AS data_size_mb,
  round(SUM(t1.required_size) / 1024 / 1024) AS required_size_mb
FROM
  (
    SELECT
      tenant_id,
      table_id,
      SUM(data_size) AS data_size,
      SUM(required_size) AS required_size
    FROM
      __all_virtual_tenant_partition_meta_table
    GROUP BY
      table_id
  ) t1
  LEFT JOIN (
    SELECT
      tenant_id,
      table_id,
      database_id
    FROM
      __all_virtual_table
  ) t2 ON t1.tenant_id = t2.tenant_id
  AND t1.table_id = t2.table_id
  LEFT JOIN (
    SELECT
      tenant_id,
      database_id,
      database_name
    FROM
      gv$database
  ) t3 ON t2.tenant_id = t3.tenant_id
  AND t2.database_id = t3.database_id
GROUP BY
  t2.database_id
ORDER BY
  data_size_mb DESC;
```

### OceanBase 4.x

```
SELECT
  t1.tenant_id,
  t1.database_name,
  t3.object_id AS database_id,
  round(SUM(t2.data_size) / 1024 / 1024) AS data_size_mb,
  round(SUM(t2.required_size) / 1024 / 1024) AS required_size_mb
FROM
  (
    SELECT
      tenant_id,
      database_name,
      table_id,
      tablet_id
    FROM
      cdb_ob_table_locations
  ) t1
  LEFT JOIN (
    SELECT
      tenant_id,
      tablet_id,
      svr_ip,
      svr_port,
      data_size,
      required_size
    FROM
      cdb_ob_tablet_replicas
  ) t2 ON t1.tenant_id = t2.tenant_id
  AND t1.tablet_id = t2.tablet_id
  LEFT JOIN (
    SELECT
      con_id,
      object_name,
      object_id
    FROM
      cdb_objects
    WHERE
      object_type = 'DATABASE'
  ) t3 ON t1.tenant_id = t3.con_id
  AND t1.database_name = t3.object_name
GROUP BY
  t1.database_name
ORDER BY
  data_size_mb DESC;
```

## tenant

### OceanBase 3.x

```
SELECT tenant_id ob_tenant_id, tenant_name FROM __all_tenant
```

### OceanBase 4.x

```
SELECT tenant_id ob_tenant_id, tenant_name FROM DBA_OB_TENANTS WHERE tenant_type<>'META'
```

## unit

### OceanBase 3.x

```
SELECT tenant_id ob_tenant_id, tenant_name FROM v$unit
```

### OceanBase 4.x

```
SELECT a.tenant_id as ob_tenant_id, a.tenant_name FROM DBA_OB_TENANTS a join v$ob_units b on a.tenant_id = b.tenant_id WHERE a.tenant_type<>'META'
```
