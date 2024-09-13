---
title: 集群运维
weight: 2
---

## 获取 OceanBase 详细版本信息

任意用户 (MySQL 模式或 Oracle 模式) 登录通过如下 SQL 查询 OceanBase 安装包的版本:

```
SHOW VARIABLES LIKE '%version_comment%';
```

## 查询 cluster_name 与 cluster_id

```
SELECT
  *
FROM
  gv$ob_parameters
WHERE
  name IN ('cluster', 'cluster_id');
```

## 获取集群支持的字符集

```
SELECT
  `collation_name` AS collation,
  `character_set_name` AS charset,
  `id`,
  `is_default`
FROM
  information_schema.collations;
```



## 查询所有 zone 信息

```
SELECT
  *
FROM
  dba_ob_zones;
```

## 查看服务器状态信息

`root@sys` 登陆查询，

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

## 查看服务器资源配置

`root@sys` 登陆查询，

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

## 获取租户的降级日志流

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

## 获取集群的仲裁服务信息

```
SELECT
  arbitration_service_key,
  arbitration_service,
  previous_arbitration_service,
  type
FROM
  dba_ob_arbitration_service;
```

##  获取租户的合并进度

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