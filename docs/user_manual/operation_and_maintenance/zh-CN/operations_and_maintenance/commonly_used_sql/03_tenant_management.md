---
title: 租户管理
weight: 3
---

## 查看租户基础信息

```
SELECT
  tenant_id,
  tenant_name,
  tenant_type,
  primary_zone,
  locality,
  compatibility_mode,
  status,
  0 AS locked,
  in_recyclebin,
  timestampdiff(
    second,
    create_time,
    now()
  ) AS exist_seconds
FROM
  dba_ob_tenants
WHERE
  tenant_type IN ('SYS', 'USER');
```

## 查询 Unit 规格列表

```
SELECT
  unit_config_id,
  name,
  max_cpu,
  min_cpu,
  round(memory_size / 1024 / 1024 / 1024) max_memory_size_gb,
  round(memory_size / 1024 / 1024 / 1024) min_memory_size_gb,
  round(log_disk_size / 1024 / 1024 / 1024) log_disk_size_gb,
  max_iops,
  min_iops,
  iops_weight
FROM
  dba_ob_unit_configs
ORDER BY
  unit_config_id;
```

## 查询资源池列表

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

## 查询 Unit 列表

`root@sys` 登陆查询，

```
SELECT
  tenant_id,
  svr_ip,
  svr_port,
  unit_id,
  status,
  create_time,
  modify_time,
  zone,
  unit_config_id,
  max_cpu,
  min_cpu,
  round(memory_size / 1024 / 1024 / 1024) memory_size_gb,
  round(log_disk_size / 1024 / 1024 / 1024) log_disk_size_gb,
  max_iops,
  min_iops
FROM
  dba_ob_units
ORDER BY
  tenant_id,
  svr_ip,
  svr_port,
  unit_id;
```

## 查看租户已使用磁盘资源

```
SELECT
  t1.unit_id,
  t1.svr_ip,
  t1.svr_port,
  t3.tenant_id,
  t3.tenant_name,
  round(t1.log_disk_size / 1024 / 1024 / 1024) AS log_disk_size_gb,
  round(t1.log_disk_in_use / 1024 / 1024 / 1024) AS log_disk_in_use_gb,
  round(t1.data_disk_in_use / 1024 / 1024 / 1024) AS data_disk_in_use_gb
FROM
  (
    SELECT
      unit_id,
      svr_ip,
      svr_port,
      SUM(log_disk_size) AS log_disk_size,
      SUM(log_disk_in_use) AS log_disk_in_use,
      SUM(data_disk_in_use) AS data_disk_in_use
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

## 查看租户数据量

`root@sys` 登陆查询，

```
SELECT
  tenant_id,
  svr_ip,
  svr_port,
  round(SUM(data_size) / 1024 / 1024) data_size_mb,
  round(SUM(required_size) / 1024 / 1024) required_size_mb
FROM
  cdb_ob_tablet_replicas
WHERE
  tenant_id = 1002
GROUP BY
  tenant_id,
  svr_ip,
  svr_port
ORDER BY
  tenant_id,
  svr_ip,
  svr_port;
```

用户租户下，执行如下  SQL，

```
SELECT
  svr_ip,
  svr_port,
  round(SUM(data_size) / 1024 / 1024) data_size_mb,
  round(SUM(required_size) / 1024 / 1024) required_size_mb
FROM
  dba_ob_tablet_replicas
GROUP BY
  svr_ip,
  svr_port
ORDER BY
  svr_ip,
  svr_port;
```

## 查看租户表大小统计

`root@sys` 登陆查询，

由于视图查询有性能问题，最好指定 tenant_id 和其他参数。

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  c.object_type,
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
      cdb_ob_tablet_replicas
  ) b ON a.tenant_id = b.tenant_id
   AND a.tenant_id = 1002
--   AND a.database_name = 'ALVIN'
  AND a.tablet_id = b.tablet_id
  AND a.svr_ip = b.svr_ip
  AND a.svr_port = b.svr_port
  JOIN cdb_objects c ON a.tenant_id = c.con_id
  AND a.table_id = c.object_id
  AND c.object_type = 'TABLE'
--   AND c.object_name = 'test'
GROUP BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  c.object_type
ORDER BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port;
```

如有性能问题 (以下 SQL 快 10 倍以上)，可以不使用视图查询，指定 tenant_id 查询：

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
  AND a.tenant_id = 1002
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

指定 tenant_id 和 database_name，按 table 大小排序：

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  c.object_type,
  c.object_name,
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
      cdb_ob_tablet_replicas
  ) b ON a.tenant_id = b.tenant_id
  AND a.tenant_id = 1012
  AND a.database_name = 'ALVIN'
  AND a.tablet_id = b.tablet_id
  AND a.svr_ip = b.svr_ip
  AND a.svr_port = b.svr_port
  JOIN cdb_objects c ON a.tenant_id = c.con_id
  AND a.table_id = c.object_id
  AND c.object_type = 'TABLE'
--   AND c.object_name = 'test'
GROUP BY
  a.tenant_id,
  a.svr_ip,
  a.svr_port,
  c.object_type,
  c.object_name
ORDER BY
  required_size_mb DESC
LIMIT
  100;
```

用户租户下，执行如下  SQL，

```
SELECT
  /*+ READ_CONSISTENCY(WEAK) QUERY_TIMEOUT(50000000) */
  a.svr_ip,
  a.svr_port,
  a.database_name,
  c.object_type,
  c.object_name,
  round(SUM(data_size) / 1024 / 1024) AS data_size_mb,
  round(SUM(required_size) / 1024 / 1024) AS required_size_mb
FROM
  dba_ob_table_locations a
  JOIN (
    SELECT
      tablet_id,
      svr_ip,
      svr_port,
      data_size,
      required_size
    FROM
      dba_ob_tablet_replicas
  ) b ON a.tablet_id = b.tablet_id
  AND a.database_name = 'SYS'
  AND a.svr_ip = b.svr_ip
  AND a.svr_port = b.svr_port
  JOIN dba_objects c ON a.table_id = c.object_id
  AND c.object_type = 'TABLE'
  AND c.object_name = 'TEST'
GROUP BY
  a.svr_ip,
  a.svr_port,
  a.database_name,
  c.object_type,
  c.object_name
ORDER BY
  required_size_mb DESC;
```

## 租户 partition/leader 分布情况

`root@sys` 登陆查询，

```
SELECT
  zone,
  svr_ip,
  role,
  COUNT(1) cnt
FROM
  cdb_ob_table_locations
WHERE
  tenant_id = 1012
GROUP BY
  svr_ip,
  role
ORDER BY
  1,
  3 DESC;
```

指定 tenant_id, database_name, object_name，查询 leader：

```
SELECT
  *
FROM
  cdb_ob_table_locations a
WHERE
  a.tenant_id = 1012
  AND a.database_name = 'ALVIN'
  AND (a.tenant_id, a.table_id) IN (
    SELECT
      c.con_id,
      c.object_id
    FROM
      cdb_objects c
    WHERE
      c.con_id = a.tenant_id
      AND c.object_type = 'TABLE'
      AND c.object_name = 'test'
  )
LIMIT
  100;
```

指定 tenant_id, database_name, object_name，查询 tablet replica：

```
SELECT
  *
FROM
  cdb_ob_tablet_replicas r
WHERE
  (r.tenant_id, r.tablet_id) IN (
    SELECT
      a.tenant_id,
      a.tablet_id
    FROM
      cdb_ob_table_locations a
    WHERE
      a.tenant_id = 1012
      AND a.database_name = 'ALVIN'
      AND (a.tenant_id, a.table_id) IN (
        SELECT
          c.con_id,
          c.object_id
        FROM
          cdb_objects c
        WHERE
          c.con_id = a.tenant_id
          AND c.object_type = 'TABLE'
          AND c.object_name = 'test'
      )
  )
LIMIT
  100;
```

## MySQL 模式查询数据库列表

```
SELECT
  o.created AS gmt_create,
  o.object_id AS database_id,
  d.database_name,
  c.id AS collation_type,
  c.character_set_name,
  c.collation_name,
  NULL AS primary_zone,
  0 AS read_only
FROM
  dba_ob_databases d
  JOIN dba_objects o ON o.object_type = 'DATABASE'
  JOIN information_schema.collations c ON d.database_name = o.object_name
  AND d.collation = c.collation_name;
```

## 统计租户表数量

查询非 META 租户的表数量：

```
SELECT
  /*+ MONITOR_AGENT QUERY_TIMEOUT(100000000) */
  t.tenant_id,
  c.owner,
  COUNT(*) AS cnt
FROM
  cdb_tables c
  JOIN dba_ob_tenants t ON c.con_id = t.tenant_id
  AND tenant_type IN ('SYS', 'USER')
  AND c.owner NOT IN ('oceanbase', 'mysql')
GROUP BY
  t.tenant_id,
  c.owner
ORDER BY
  t.tenant_id,
  c.owner;
```

查询非 META 租户的表数量：

```
SELECT
  /*+ MONITOR_AGENT QUERY_TIMEOUT(100000000) */
  t.tenant_id,
  COUNT(*) AS cnt
FROM
  cdb_tables c
  JOIN dba_ob_tenants t ON c.con_id = t.tenant_id
  AND tenant_type IN ('SYS', 'USER')
GROUP BY
  t.tenant_id
ORDER BY
  t.tenant_id;
```

查询所有租户的：

```
SELECT
  /*+ MONITOR_AGENT QUERY_TIMEOUT(100000000) */
  con_id tenant_id,
  COUNT(*) AS cnt
FROM
  cdb_tables
GROUP BY
  con_id
ORDER BY
  con_id;
```