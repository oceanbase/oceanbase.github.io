---
title: Cluster O&M
weight: 2
---

## Query the Version of OceanBase Database

Execute the following SQL statement to query the version of the OceanBase Database installation package as any user, whether in MySQL or Oracle mode:

```
SHOW VARIABLES LIKE '%version_comment%';
```

## Query the Name and ID of a Cluster

```
SELECT
  *
FROM
  gv$ob_parameters
WHERE
  name IN ('cluster', 'cluster_id');
```

## Query the Character Sets Supported by a Cluster

```
SELECT
  `collation_name` AS collation,
  `character_set_name` AS charset,
  `id`,
  `is_default`
FROM
  information_schema.collations;
```



## Query Information about All Zones

```
SELECT
  *
FROM
  dba_ob_zones;
```

## Query the Server Status

Execute the following SQL statement to query the information as the `root@sys` user:

```
SELECT
  /*+READ_CONSISTENCY(WEAK), QUERY_TIMEOUT(100000000)*/
  zone,
  svr_ip,
  with_rootserver,
  start_service_time,
  stop_time,
  status,
  substr(
    build_version,
    1,
    instr(build_version, '-') - 1
  ) build_version
FROM
  dba_ob_servers
ORDER BY
  zone,
  svr_ip;
```

## Query the Resource Configurations of Servers

Execute the following SQL statement to query the information as the `root@sys` user:

```
SELECT
  /* MONITOR_AGENT */
  svr_ip,
  svr_port,
  cpu_capacity_max AS cpu_total,
  cpu_assigned_max AS cpu_assigned,
  round(mem_capacity / 1024 / 1024 / 1024) mem_total_gb,
  round(mem_assigned / 1024 / 1024 / 1024) mem_assigned_gb,
  round((cpu_assigned_max / cpu_capacity_max), 2) AS cpu_assigned_percent,
  round((mem_assigned / mem_capacity), 2) AS mem_assigned_percent,
  round(data_disk_capacity / 1024 / 1024 / 1024) data_disk_capacity_gb,
  round(data_disk_in_use / 1024 / 1024 / 1024) data_disk_in_use_gb,
  round(
    (data_disk_capacity - data_disk_in_use) / 1024 / 1024 / 1024
  ) data_disk_free_gb,
  round(log_disk_capacity / 1024 / 1024 / 1024) log_disk_capacity_gb,
  round(log_disk_assigned / 1024 / 1024 / 1024) log_disk_assigned_gb,
  round(log_disk_in_use / 1024 / 1024 / 1024) log_disk_in_use_gb
FROM
  gv$ob_servers
ORDER BY
  svr_ip,
  svr_port;
```

## Query Degraded Log Streams of Tenants

```
SELECT
  a.tenant_id,
  ls_id,
  svr_ip,
  svr_port,
  role,
  arbitration_member,
  degraded_list
FROM
  gv$ob_log_stat a,
  dba_ob_tenants b
WHERE
  degraded_list <> ''
  AND a.tenant_id = b.tenant_id
  AND tenant_type != 'META'
ORDER BY
  a.tenant_id,
  svr_ip,
  svr_port;
```

## Query the Arbitration Service Information of a Cluster

```
SELECT
  arbitration_service_key,
  arbitration_service,
  previous_arbitration_service,
  type
FROM
  dba_ob_arbitration_service;
```

## Query the Major Compaction Progress of Tenants

```
SELECT
  tenant_id,
  compaction_scn,
  100 * (
    1 - SUM(unfinished_tablet_count) / SUM(total_tablet_count)
  ) progress_pct
FROM
  gv$ob_compaction_progress
GROUP BY
  tenant_id,
  compaction_scn
ORDER BY
  compaction_scn
LIMIT
  20;
```