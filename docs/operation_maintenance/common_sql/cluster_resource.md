---
title: 集群资源常用SQL
weight: 4
---
# **集群资源常用 SQL**

本文介绍查询集群资源的常用 SQL，主要用于查询集群当前分配情况，以及各租户资源使用情况。

- 查看 OceanBase 集群 CPU 分配总量

  ```sql
  show parameters where name="cpu_count";
  ```

- 查看 OceanBase 集群内存分配总量

  ```sql
  show parameters where name in ('memory_limit','memory_limit_percentage','system_memory');
  ```

- 查看 OceanBase 集群数据和日志分配总量

  ```sql
  show parameters where name in ('log_disk_size','log_disk_percentage','datafile_size','datafile_disk_percentage');
  ```

- 查看 OceanBase 集群 CPU、内存、CLOG、DATA 等总量和分配情况

  ```sql
  select zone,concat(SVR_IP,':',SVR_PORT) observer,
  cpu_capacity_max cpu_total,cpu_assigned_max cpu_assigned,
  cpu_capacity-cpu_assigned_max as cpu_free,
  round(memory_limit/1024/1024/1024,2) as memory_total,
  round((memory_limit-mem_capacity)/1024/1024/1024,2) as system_memory,
  round(mem_assigned/1024/1024/1024,2) as mem_assigned,
  round((mem_capacity-mem_assigned)/1024/1024/1024,2) as memory_free,
  round(log_disk_capacity/1024/1024/1024,2) as log_disk_capacity,
  round(log_disk_assigned/1024/1024/1024,2) as log_disk_assigned,
  round((log_disk_capacity-log_disk_assigned)/1024/1024/1024,2) as log_disk_free,
  round((data_disk_capacity/1024/1024/1024),2) as data_disk,
  round((data_disk_in_use/1024/1024/1024),2) as data_disk_used,
  round((data_disk_capacity-data_disk_in_use)/1024/1024/1024,2) as data_disk_free
  from gv$ob_servers;
  ```

  ```sql
  select c.tenant_name,b.tenant_id,a.name as unit_config_name,
  concat(b.svr_ip,':',b.svr_port) as observer,
  b.status,b.resource_pool_id, b.zone,
  b.unit_config_id,b.max_cpu,b.min_cpu,
  CAST(b.memory_size/1024/1024/1024 as DECIMAL(15,2)) memory_GB,
  CAST(b.log_disk_size/1024/1024/1024 as DECIMAL(15,2)) log_disk_size_GB,
  b.max_iops,b.min_iops,b.iops_weight 
  from __all_unit_config a, DBA_OB_UNITS b, DBA_OB_TENANTS c
  where a.unit_config_id = b.unit_config_id
  and c.tenant_id = b.tenant_id
  and b.tenant_id=1;
  ```

- 查看各租户资源分配情况

  ```sql
  select t1.name resource_pool_name, t2.`name` unit_config_name, 
  t2.max_cpu, t2.min_cpu, 
  round(t2.memory_size/1024/1024/1024,2) mem_size_gb,
  round(t2.log_disk_size/1024/1024/1024,2) log_disk_size_gb, t2.max_iops, 
  t2.min_iops, t3.unit_id, t3.zone, concat(t3.svr_ip,':',t3.`svr_port`) observer,
  t4.tenant_id, t4.tenant_name
  from __all_resource_pool t1
  join __all_unit_config t2 on (t1.unit_config_id=t2.unit_config_id)
  join __all_unit t3 on (t1.`resource_pool_id` = t3.`resource_pool_id`)
  left join __all_tenant t4 on (t1.tenant_id=t4.tenant_id)
  order by t1.`resource_pool_id`, t2.`unit_config_id`, t3.unit_id;
  ```

- 查看租户磁盘使用细节

  ```sql
  select a.svr_ip,a.svr_port,a.tenant_id,b.tenant_name,
  CAST(a.data_disk_in_use/1024/1024/1024 as DECIMAL(15,2)) data_disk_use_G, 
  CAST(a.log_disk_size/1024/1024/1024 as DECIMAL(15,2)) log_disk_size, 
  CAST(a.log_disk_in_use/1024/1024/1024 as DECIMAL(15,2)) log_disk_use_G 
  from __all_virtual_unit a,dba_ob_tenants b 
  where a.tenant_id=b.tenant_id;
  ```
