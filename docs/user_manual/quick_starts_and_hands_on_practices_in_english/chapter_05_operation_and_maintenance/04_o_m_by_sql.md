---
title: Perform O&M by using SQL statements
weight: 5
---

# 5.4 Perform O&M by using SQL statements

This topic describes the common SQL statements and how to collect logs for troubleshooting in different database exception scenarios.

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing or the Long-Term Support (LTS) version. You can switch to another version as needed in the upper-left corner of the document page.

SQL statements are the most basic method for database O&M. At present, basic cluster management operations are all performed by using SQL statements. For more information, see [Manage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103367).

## Common SQL statements

### SQL statements for basic cluster management

#### Query the database name

When you log on to OceanBase Database through OceanBase Database Proxy (ODP), you may encounter the error `ERROR 4669 (HY000): cluster not exist`. The reason for this is an incorrect name of the OceanBase cluster (or the database name). For example, if OceanBase Database is deployed by using OBD, the `obd cluster list` command returns the name of the deployed cluster that the OceanBase Database component belongs to, rather than the database name. You can log on to OceanBase Database and execute the following statement to query the database name:

```sql
show parameters like 'cluster';
```

The output is as follows, where the value in the `value` column is the database name, which is `metadb` in this example.

```shell
+-------+----------+----------------+----------+---------+-----------+--------+---------------------+----------+---------+---------+-------------------+---------------+-----------+
| zone  | svr_type | svr_ip         | svr_port | name    | data_type | value  | info                | section  | scope   | source  | edit_level        |
+-------+----------+----------------+----------+---------+-----------+--------+---------------------+----------+---------+---------+-------------------+
| zone1 | observer | 10.10.10.1     |     2882 | cluster | STRING    | metadb | Name of the cluster | OBSERVER | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
+-------+----------+----------------+----------+---------+-----------+--------+---------------------+----------+---------+---------+-------------------+
```

#### Query the database version

Apart from running the `./bin/observer --version` command to query the database version from a binary file, you can also execute the following statements in the database to query the version number:

* Query the parameter that specifies the database version

  ```sql
  SHOW VARIABLES like 'version_comment';
  ```

  The output is as follows:

  ```shell
  +-----------------+------------------------------------------------------------------------------------------------------------------+
  | Variable_name   | Value                                                                                                            |
  +-----------------+------------------------------------------------------------------------------------------------------------------+
  | version_comment | OceanBase_CE 4.2.1.2 (r102000042023120514-ccdde7d34de421336c5362483d64bf2b73348bd4) (Built Dec  5 2023 14:34:01) |
  +-----------------+------------------------------------------------------------------------------------------------------------------+
  ```

* Query the `DBA_OB_SERVERS` view for the database version
  
  ```sql
  SELECT BUILD_VERSION FROM oceanbase.DBA_OB_SERVERS;
  ```

  The output is as follows. For more information about the `DBA_OB_SERVERS` view, see [oceanbase.DBA_OB_SERVERS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104271).

  ```shell
  +-------------------------------------------------------------------------------------------+
  | BUILD_VERSION                                                                             |
  +-------------------------------------------------------------------------------------------+
  | 4.2.1.2_102000042023120514-ccdde7d34de421336c5362483d64bf2b73348bd4(Dec  5 2023 14:34:01) |
  +-------------------------------------------------------------------------------------------+
  ```

#### Query the RootService leader

RootService is the control center of a cluster and is responsible for resource management, disaster recovery, load balancing, and schema management. In a multi-zone cluster, RootService has multiple replicas but only one is the leader. The leader is responsible for cluster management and task coordination. When the RootService leader fails, you need to check its logs. You can execute the following statement to query the IP address of the leader:

```sql
SELECT svr_ip as RootService FROM oceanbase.DBA_OB_SERVERS WHERE with_rootserver='yes';
```

The output is as follows. For more information about the `DBA_OB_SERVERS` view, see [oceanbase.DBA_OB_SERVERS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104271).

```shell
+----------------+
| RootService    |
+----------------+
| 10.10.10.1     |
+----------------+
```

#### Query the status, IDC, region, and type of a zone

When you take over a cluster to OceanBase Cloud Platform (OCP), you may be prompted that the IDC or region of hosts does not match that of the cluster. You can execute the following statement to view the IDC and region of each zone and modify this information to ensure consistency with the host configurations.

```sql
SELECT * FROM oceanbase.DBA_OB_ZONES;
```

The output is as follows. For more information about the `DBA_OB_ZONES` view, see [oceanbase.DBA_OB_ZONES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104331).

```shell
+-------+----------------------------+----------------------------+--------+-------------+------------+-----------+
| ZONE  | CREATE_TIME                | MODIFY_TIME                | STATUS | IDC         | REGION     | TYPE      |
+-------+----------------------------+----------------------------+--------+-------------+------------+-----------+
| zone1 | 2024-06-04 11:21:23.398969 | 2024-06-04 11:21:45.087430 | ACTIVE | default_idc | sys_region | ReadWrite |
+-------+----------------------------+----------------------------+--------+-------------+------------+-----------+
```

#### Query hidden parameters

In OceanBase Database, the names of some parameters start with two underscores (`__`). These are hidden system parameters, and we recommend that you do not directly adjust them unless necessary. You cannot use the `show parameters` command to query hidden parameters. However, you can use the `alter system set` command to modify hidden parameters as you modify normal parameters. You can execute the following statement to query a hidden parameter.

Here, the `__min_full_resource_pool_memory` parameter is used an example.

```sql
SELECT * FROM oceanbase.GV$OB_PARAMETERS WHERE name ='__min_full_resource_pool_memory';
```

The output is as follows. For more information about the `GV$OB_PARAMETERS` view, see [GV\$OB_PARAMETERS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104422).

```shell

+----------------+----------+-------+---------+-----------+---------------------------------+-----------+------------+-------------------------------------------------------------------+--------------+-------------------+---------------+-----------+
| SVR_IP         | SVR_PORT | ZONE  | SCOPE   | TENANT_ID | NAME                            | DATA_TYPE | VALUE      | INFO                                                              | SECTION      | EDIT_LEVEL        |
+----------------+----------+-------+---------+-----------+---------------------------------+-----------+------------+-------------------------------------------------------------------+--------------+-------------------+
| 10.10.10.1     |     2882 | zone1 | CLUSTER |      NULL | __min_full_resource_pool_memory | INT       | 2147483648 | the min memory value which is specified for a full resource pool. | LOAD_BALANCE | DYNAMIC_EFFECTIVE |
+----------------+----------+-------+---------+-----------+---------------------------------+-----------+------------+-------------------------------------------------------------------+--------------+-------------------+
```

#### Query all tables of a specific type in a tenant

You can execute the following statement to query the `DBA_OBJECTS` view for the information about objects of different types in a user tenant. For more information about the `DBA_OBJECTS` view, see [oceanbase.DBA_OBJECTS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104302).

1. Query object types.

   ```sql
   SELECT distinct(OBJECT_TYPE) FROM oceanbase.DBA_OBJECTS; 
   ```
  
   The output is as follows:
  
   ```shell
   +---------------+
   | OBJECT_TYPE   |
   +---------------+
   | TABLE         |
   | VIRTUAL TABLE |
   | INDEX         |
   | VIEW          |
   | PACKAGE       |
   | PACKAGE BODY  |
   | DATABASE      |
   | TABLEGROUP    |
   +---------------+
   ```

2. Query tables based on the object type.

   The following sample statement queries all tables of the `TABLE` type in the tenant.

   ```sql
   SELECT OBJECT_NAME FROM oceanbase.DBA_OBJECTS WHERE OBJECT_TYPE='TABLE';
   ```

#### Query the modification records of a parameter

You can execute the following statement to query the modification records of a parameter. This allows you to restore a parameter when necessary.

```sql
SELECT * FROM oceanbase.DBA_OB_ROOTSERVICE_EVENT_HISTORY WHERE event='admin_set_config' and value2 like '%xxxxx%';
```

The following output takes the `enable_rereplication` parameter as an example. For more information about the `DBA_OB_ROOTSERVICE_EVENT_HISTORY` view, see [oceanbase.DBA_OB_ROOTSERVICE_EVENT_HISTORY](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104248).

```shell
+----------------------------+--------------+------------------+-------+--------+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------+--------+-------+--------+-------+--------+-------+--------+------------+---------------+-------------+
| TIMESTAMP                  | MODULE       | EVENT            | NAME1 | VALUE1 | NAME2 | VALUE2                                                                                                                                                                  | NAME3    | VALUE3 | NAME4 | VALUE4 | NAME5 | VALUE5 | NAME6 | VALUE6 | EXTRA_INFO | RS_SVR_IP     | RS_SVR_PORT |
+----------------------------+--------------+------------------+-------+--------+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------+--------+-------+--------+-------+--------+-------+--------+------------+---------------+-------------+
| 2024-07-29 11:05:04.577456 | root_service | admin_set_config | ret   | 0      | arg   | {name:" enable_rereplication", value:" false", comment:" ", zone:" ", server:" 0.0.0.0:0", tenant_name:" ", exec_tenant_id:1, tenant_ids: [], want_to_set_tenant_config:false} | is_inner | 0      |       |        |       |        |       |        |            | 10.10.10.1    |        2882 |
+----------------------------+--------------+------------------+-------+--------+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------+--------+-------+--------+-------+--------+-------+--------+------------+---------------+-------------+
```

#### Query events that occurred in the last hour in a cluster

You can execute the following statement to query the scheduling events that occurred within a specified period of time in different modules. This helps you learn about the stability of the cluster. For example, when a node fails, the RootService module responsible for node monitoring and scheduling will add the node to the blocklist, put the node permanently offline, or migrate the units on the node. In this case, you can query the scheduling events that occurred in RootService to learn about the automatic recovery process.

```sql
SELECT `TIMESTAMP`,module,EVENT,name1,value1,name2,value2,rs_svr_ip 
  FROM oceanbase.DBA_OB_ROOTSERVICE_EVENT_HISTORY 
  WHERE module IN ( 'server', 'root_service', 'balancer' ) AND `TIMESTAMP` > SUBDATE( now(), INTERVAL 1  HOUR ) 
  ORDER BY `TIMESTAMP` DESC LIMIT 50;
```

The output is as follows:

```shell

+----------------------------+--------------+-------------------+-----------+--------+-------+-------------------------------------------------------------------------------+----------------+
| TIMESTAMP                  | module       | EVENT             | name1     | value1 | name2 | value2                                                                        | rs_svr_ip      |
+----------------------------+--------------+-------------------+-----------+--------+-------+-------------------------------------------------------------------------------+----------------+
| 2024-07-18 02:00:02.709958 | root_service | root_minor_freeze | ret       | 0      | arg   | {tenant_ids: [1], server_list: [], zone:" ", tablet_id: {id:0}, ls_id: {id: -1}}    | 10.10.10.1      |
| 2024-07-18 02:00:02.685112 | root_service | root_major_freeze | tenant_id | 1      | ret   | 0                                                                             | 10.10.10.1      |
| 2024-07-18 02:00:02.348725 | root_service | root_minor_freeze | ret       | 0      | arg   | {tenant_ids: [1002], server_list: [], zone:" ", tablet_id: {id:0}, ls_id: {id: -1}} | 10.10.10.1      |
| 2024-07-18 02:00:02.324432 | root_service | root_major_freeze | tenant_id | 1002   | ret   | 0                                                                             | 10.10.10.1     |
| 2024-07-18 02:00:02.291545 | root_service | root_minor_freeze | ret       | 0      | arg   | {tenant_ids: [1010], server_list: [], zone:" ", tablet_id: {id:0}, ls_id: {id: -1}} | 10.10.10.1      |
| 2024-07-18 02:00:02.262967 | root_service | root_major_freeze | tenant_id | 1010   | ret   | 0                                                                             | 10.10.10.1     |
| 2024-07-18 02:00:01.672662 | root_service | root_minor_freeze | ret       | 0      | arg   | {tenant_ids: [1009], server_list: [], zone:" ", tablet_id: {id:0}, ls_id: {id: -1}} | 10.10.10.1      |
| 2024-07-18 02:00:01.658700 | root_service | root_major_freeze | tenant_id | 1009   | ret   | 0                                                                             | 10.10.10.1     |
| 2024-07-18 02:00:01.216653 | root_service | root_minor_freeze | ret       | 0      | arg   | {tenant_ids: [1001], server_list: [], zone:" ", tablet_id: {id:0}, ls_id: {id: -1}} | 10.10.10.1      |
| 2024-07-18 02:00:01.202710 | root_service | root_major_freeze | tenant_id | 1001   | ret   | 0                                                                             | 10.10.10.1     |
+----------------------------+--------------+-------------------+-----------+--------+-------+-------------------------------------------------------------------------------+----------------+

```

For more information about the `DBA_OB_ROOTSERVICE_EVENT_HISTORY` view, see [oceanbase.DBA_OB_ROOTSERVICE_EVENT_HISTORY](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104248).

### SQL statements for querying cluster resources

* Query the CPU, memory, and disk parameter configurations in a cluster
  
  ```sql
  show parameters where name in ('memory_limit','memory_limit_percentage','system_memory','log_disk_size','log_disk_percentage','datafile_size','datafile_disk_percentage');
  ```
  
  The output is as follows:

  ```shell
  +-------+----------+----------------+----------+--------------------------+-----------+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------+---------+---------+-------------------+
  | zone  | svr_type | svr_ip         | svr_port | name                     | data_type | value | info                                                                                                                                                                                                                                                                                                                                | section    | scope   | source  | edit_level        |
  +-------+----------+----------------+----------+--------------------------+-----------+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------+---------+---------+-------------------+
  | zone1 | observer | 10.10.10.1     |     2882 | log_disk_percentage      | NULL      | 0     | the percentage of disk space used by the log files. Range: [0,99] in integer;only effective when parameter log_disk_size is 0;when log_disk_percentage is 0: a) if the data and the log are on the same disk, means log_disk_percentage = 30 b) if the data and the log are on the different disks, means log_disk_perecentage = 90 | LOGSERVICE | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  | zone1 | observer | 10.10.10.1     |     2882 | log_disk_size            | NULL      | 100G  | the size of disk space used by the log files. Range: [0, +∞)                                                                                                                                                                                                                                                                        | LOGSERVICE | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  | zone1 | observer | 10.10.10.1     |     2882 | memory_limit_percentage  | NULL      | 80    | the size of the memory reserved for internal use(for testing purpose). Range: [10, 95]                                                                                                                                                                                                                                              | OBSERVER   | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  | zone1 | observer | 10.10.10.1     |     2882 | system_memory            | NULL      | 3G    | the memory reserved for internal use which cannot be allocated to any outer-tenant, and should be determined to guarantee every server functions normally. Range: [0M,)                                                                                                                                                             | OBSERVER   | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  | zone1 | observer | 10.10.10.1     |     2882 | memory_limit             | NULL      | 30G   | the size of the memory reserved for internal use(for testing purpose), 0 means follow memory_limit_percentage. Range: 0, [1G,).                                                                                                                                                                                                     | OBSERVER   | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  | zone1 | observer | 10.10.10.1     |     2882 | datafile_disk_percentage | NULL      | 0     | the percentage of disk space used by the data files. Range: [0,99] in integer                                                                                                                                                                                                                                                       | SSTABLE    | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  | zone1 | observer | 10.10.10.1     |     2882 | datafile_size            | NULL      | 100G  | size of the data file. Range: [0, +∞)                                                                                                                                                                                                                                                                                               | SSTABLE    | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  +-------+----------+----------------+----------+--------------------------+-----------+-------+-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+------------+---------+---------+-------------------+
  ```

* Query resource allocation at the server level in a cluster
  
  ```sql
  SELECT zone,concat(SVR_IP,':' ,SVR_PORT) observer,
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
    FROM oceanbase.GV$OB_SERVERS;
  ```
  
  The output is as follows. For more information about the `GV$OB_SERVERS` view, see [GV\$OB_SERVERS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104534).
  
  ```shell
  +-------+---------------------+-----------+--------------+----------+--------------+---------------+--------------+-------------+-------------------+-------------------+---------------+-----------+----------------+----------------+
  | zone  | observer            | cpu_total | cpu_assigned | cpu_free | memory_total | system_memory | mem_assigned | memory_free | log_disk_capacity | log_disk_assigned | log_disk_free | data_disk | data_disk_used | data_disk_free |
  +-------+---------------------+-----------+--------------+----------+--------------+---------------+--------------+-------------+-------------------+-------------------+---------------+-----------+----------------+----------------+
  | zone1 | 10.10.10.1:2882     |        16 |            7 |        9 |        30.00 |          3.00 |        10.00 |       17.00 |            100.00 |             27.00 |         73.00 |    100.00 |           1.52 |          98.48 |
  +-------+---------------------+-----------+--------------+----------+--------------+---------------+--------------+-------------+-------------------+-------------------+---------------+-----------+----------------+----------------+
  ```

* Query resource allocation and disk usage at the tenant level in a cluster
  
  ```sql
  SELECT a.zone,a.svr_ip,b.tenant_name,b.tenant_type, a.max_cpu, a.min_cpu,
    round(a.memory_size/1024/1024/1024,2) memory_size_gb, 
    round(a.log_disk_size/1024/1024/1024,2) log_disk_size,
    round(a.log_disk_in_use/1024/1024/1024,2) log_disk_in_use,
    round(a.data_disk_in_use/1024/1024/1024,2) data_disk_in_use
    FROM oceanbase.GV$OB_UNITS a join oceanbase.dba_ob_tenants b on a.tenant_id=b.tenant_id order by b.tenant_name;
  ```
  
  The output is as follows. For more information about the `GV$OB_UNITS` view, see [GV\$OB_UNITS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104420).
  
  ```shell
  +-------+----------------+-------------+-------------+---------+---------+----------------+---------------+-----------------+------------------+
  | zone  | svr_ip         | tenant_name | tenant_type | max_cpu | min_cpu | memory_size_gb | log_disk_size | log_disk_in_use | data_disk_in_use |
  +-------+----------------+-------------+-------------+---------+---------+----------------+---------------+-----------------+------------------+
  | zone1 | 10.10.10.1     | META$1002   | META        |    NULL |    NULL |           1.00 |          1.20 |            0.95 |             0.10 |
  | zone1 | 10.10.10.1     | META$1004   | META        |    NULL |    NULL |           1.00 |          1.20 |            0.90 |             0.08 |
  | zone1 | 10.10.10.1     | ocp_meta    | USER        |       2 |       2 |           3.00 |         10.80 |            4.31 |             0.92 |
  | zone1 | 10.10.10.1     | ocp_monitor | USER        |       2 |       2 |           3.00 |         10.80 |            2.91 |             0.22 |
  | zone1 | 10.10.10.1     | sys         | SYS         |       3 |       3 |           2.00 |          3.00 |            1.33 |             0.06 |
  +-------+----------------+-------------+-------------+---------+---------+----------------+---------------+-----------------+------------------+
  ```

* Query the size of disk space occupied by all tables in a tenant
  
  ```sql
  SELECT /*+ query_timeout(30000000) */ a.TENANT_ID, a.DATABASE_NAME, a.TABLE_NAME, a.TABLE_ID, 
    sum(case when b.nested_offset = 0 then IFNULL(b.data_block_count+b.index_block_count+b.linked_block_count, 0) * 2 * 1024 * 1024 else IFNULL(b.size, 0) end) /1024.0/1024/1024 as data_size_in_GB 
    FROM oceanbase.CDB_OB_TABLE_LOCATIONS a inner join oceanbase. __all_virtual_table_mgr b on a.svr_ip = b.svr_ip and a.svr_port=b.svr_port and a.tenant_id = b.tenant_id and a.LS_ID = b.LS_ID and a.TABLET_ID = b.TABLET_ID and a.role ='LEADER' and a.tenant_id = ${tenant ID}
    and b.table_type >= 10 and b.size > 0 group by a.TABLE_ID;
  ```

  You need to replace `${tenant ID}` with the ID of the target tenant. You can execute the `select * from oceanbase.DBA_OB_TENANTS;` statement to query the tenant ID. For more information about the `DBA_OB_TENANTS` and `CDB_OB_TABLE_LOCATIONS` views, see [oceanbase.DBA_OB_TENANTS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104223) and [oceanbase.CDB_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104230).

* Query the size of disk space occupied by a single replica of a table
  
  ```sql
  SELECT sum(size)/1024/1024/1024 FROM (SELECT DATABASE_NAME,TABLE_NAME,TABLE_ID,PARTITION_NAME,TABLET_ID,`ROLE` 
    FROM oceanbase.DBA_OB_TABLE_LOCATIONS ) AA full join 
    (SELECT distinct(TABLET_ID) ,size 
    FROM  oceanbase.GV$OB_SSTABLES ) BB on AA.TABLET_ID=BB.TABLET_ID  
    WHERE  AA.role='leader' and AA.table_name='${table_name}';
  ```

  You need to replace `${table_name}` with the name of the target table. The output is as follows:

  ```shell
  +--------------------------+
  | sum(size)/1024/1024/1024 |
  +--------------------------+
  |           0.000017967074 |
  +--------------------------+
  ```

  For more information about the `DBA_OB_TABLE_LOCATIONS` and `GV$OB_SSTABLES` views, see [oceanbase.DBA_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104367) and [GV\$OB_SSTABLES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104517).

* Query the size of tenants
  
  ```sql
  SELECT t.tenant_name,
    round(sum(t2.data_size)/1024/1024/1024,2) as data_size_gb,
    round(sum(t2.required_size)/1024/1024/1024,2) as required_size_gb
    FROM oceanbase.DBA_OB_TENANTS t,oceanbase.CDB_OB_TABLE_LOCATIONS t1,oceanbase.CDB_OB_TABLET_REPLICAS t2
    WHERE t.tenant_id=t1.tenant_id and t1.svr_ip=t2.svr_ip and t1.tenant_id=t2.tenant_id and t1.ls_id=t2.ls_id and t1.tablet_id=t2.tablet_id
    group by t.tenant_name
    order by 3 desc;
  ```

  The output is as follows:

  ```shell
  +-----------------------+--------------+------------------+
  | tenant_name           | data_size_gb | required_size_gb |
  +-----------------------+--------------+------------------+
  | sys                   |         0.04 |             0.04 |
  | ob_archivedata_tenant |         0.02 |             0.02 |
  | META$1002             |         0.01 |             0.01 |
  | META$1010             |         0.01 |             0.01 |
  +-----------------------+--------------+------------------+
  ```

  For more information about the `DBA_OB_TENANTS`, `CDB_OB_TABLE_LOCATIONS`, and `CDB_OB_TABLET_REPLICAS` views, see [oceanbase.DBA_OB_TENANTS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104223), [oceanbase.CDB_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104230), and [oceanbase.CDB_OB_TABLET_REPLICAS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104257).

### SQL statements related to table partitions

All SQL statements mentioned in this section query information from the `DBA_OB_TABLE_LOCATIONS` view. For more information about the `DBA_OB_TABLE_LOCATIONS` view, see [oceanbase.DBA_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104367).

* Query the distribution of leaders of the `t1` table in the `test` database
  
  ```sql
  SELECT * FROM oceanbase.DBA_OB_TABLE_LOCATIONS WHERE DATABASE_NAME='test' and TABLE_NAME='t1' and ROLE='LEADER' and TABLE_TYPE='USER TABLE';
  ```

  The output is as follows:

  ```shell
  +---------------+------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+---------------+----------+--------+--------------+-----------------+-----------+-----------------+---------------+----------+
  | DATABASE_NAME | TABLE_NAME | TABLE_ID | TABLE_TYPE | PARTITION_NAME | SUBPARTITION_NAME | INDEX_NAME | DATA_TABLE_ID | TABLET_ID | LS_ID | ZONE  | SVR_IP        | SVR_PORT | ROLE   | REPLICA_TYPE | DUPLICATE_SCOPE | OBJECT_ID | TABLEGROUP_NAME | TABLEGROUP_ID | SHARDING |
  +---------------+------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+---------------+----------+--------+--------------+-----------------+-----------+-----------------+---------------+----------+
  | test          | t1         |   525671 | USER TABLE | NULL           | NULL              | NULL       |          NULL |    225152 |  1002 | zone1 | 10.10.10.1   |     2882 | LEADER | FULL         | NONE            |    525671 | NULL            |          NULL | NULL     |
  +---------------+------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+---------------+----------+--------+--------------+-----------------+-----------+-----------------+---------------+----------+

  ```

* Query the number of partitions (including index partitions) in the `test` database
  
  ```sql
  SELECT count(*) FROM oceanbase.DBA_OB_TABLE_LOCATIONS WHERE DATABASE_NAME='test' and ROLE='LEADER';
  ```

  The output is as follows:

  ```shell
  +----------+
  | count(*) |
  +----------+
  |      242 |
  +----------+
  ```

* Query the number of partitions of the `test` database on a specific OBServer node
  
  ```sql
  SELECT count(*) FROM oceanbase.DBA_OB_TABLE_LOCATIONS 
    WHERE SVR_IP='<server_ip>' 
    and database_name='test' 
    and ROLE='LEADER';
  ```

  You need to replace `<server_ip>` with the IP address of the target OBServer node. The output is as follows:

  ```shell
  +----------+
  | count(*) |
  +----------+
  |      117 |
  +----------+
  ```

### SQL statements related to table distribution

All SQL statements mentioned in this section query information from the `CDB_OB_TABLE_LOCATIONS` view. For more information about the `CDB_OB_TABLE_LOCATIONS` view, see [oceanbase.CDB_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104230).

* Query the distribution of partitions
  
  ```sql
  SELECT svr_ip, count(1) FROM oceanbase.CDB_OB_TABLE_LOCATIONS 
    WHERE tenant_id = 1002 group by svr_ip order by svr_ip;
  ```
  
  The output is as follows:
  
  ```shell
  +----------------+----------+
  | svr_ip         | count(1) |
  +----------------+----------+
  | 10.10.10.1     |      1156|
  +----------------+----------+
  ```

* Query the distribution of partition leaders
  
  ```sql
  SELECT svr_ip, count(1) FROM oceanbase.CDB_OB_TABLE_LOCATIONS 
    WHERE tenant_id = 1002 and role = 'leader' group by svr_ip order by svr_ip;
  ```
  
  The output is as follows:
  
  ```shell
  +----------------+----------+
  | svr_ip         | count(1) |
  +----------------+----------+
  |  10.10.10.1    |     1156 |
  +----------------+----------+
  ```

* Query the distribution of leaders in all business databases
  
  ```sql
  SELECT svr_ip, count(1) FROM oceanbase.CDB_OB_TABLE_LOCATIONS 
    WHERE tenant_id = 1002 and role = 'LEADER' and DATABASE_NAME not in ('oceanbase','mysql') group by svr_ip order by svr_ip;
  ```
  
  The output is as follows:
  
  ```shell
  +----------------+----------+
  | svr_ip         | count(1) |
  +----------------+----------+
  |  10.10.10.1    |      566 |
  +----------------+----------+
  ```

### SQL statements related to minor and major compactions

* Initiate a minor compaction for all tenants
  
  ```sql
  ALTER SYSTEM MINOR FREEZE tenant= all_user;
  ```

* Initiate a minor compaction for a single tenant, such as `test`
  
  ```sql
  ALTER SYSTEM MINOR FREEZE tenant= 'test';
  ```

* Query the number of minor compactions and the memory threshold
  
  ```sql
  SELECT * FROM oceanbase.gv$ob_memstore;
  ```

  The output is as follows. For more information about the `GV$OB_MEMSTORE` view, see [GV\$OB_MEMSTORE](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104468).

  ```shell
  +----------------+----------+-----------+-------------+----------------+------------+---------------+----------------+
  | SVR_IP         | SVR_PORT | TENANT_ID | ACTIVE_SPAN | FREEZE_TRIGGER | FREEZE_CNT | MEMSTORE_USED | MEMSTORE_LIMIT |
  +----------------+----------+-----------+-------------+----------------+------------+---------------+----------------+
  | 10.10.10.1     |     2882 |         1 |   138412032 |      290393948 |          0 |     138412032 |     1288490160 |
  | 10.10.10.1     |     2882 |      1001 |    75497472 |       90013604 |         92 |      73400320 |      429496720 |
  | 10.10.10.1     |     2882 |      1009 |    48234496 |       90642744 |         99 |      44040192 |      429496720 |
  | 10.10.10.1     |     2882 |      1010 |    37748736 |      452510424 |          0 |      37748736 |     2147483640 |
  +----------------+----------+-----------+-------------+----------------+------------+---------------+----------------+
  ```

* Query the minor compaction configurations
  
  ```sql
  SHOW PARAMETERS WHERE name in ('memstore_limit_percentage','freeze_trigger_percentage','writing_throttling_trigger_percentage','memory_limit');
  ```

  The output is as follows:

  ```shell
  +-------+----------+----------------+----------+---------------------------------------+-----------+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+---------------+-----------+
  | zone  | svr_type | svr_ip         | svr_port | name                                  | data_type | value | info                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | section  | scope   | source  | edit_level        | default_value | isdefault |
  +-------+----------+----------------+----------+---------------------------------------+-----------+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+---------------+-----------+
  | zone1 | observer | 10.10.10.1     |     2882 | memstore_limit_percentage             | INT       | 0     | used in calculating the value of MEMSTORE_LIMIT parameter: memstore_limit_percentage = memstore_limit / memory_size, where MEMORY_SIZE is determined when the tenant is created. Range: [0, 100). 1. the system will use memstore_limit_percentage if only memstore_limit_percentage is set.2. the system will use _memstore_limit_percentage if both memstore_limit_percentage and _memstore_limit_percentage is set.3. the system will adjust automatically if both memstore_limit_percentage and _memstore_limit_percentage set to 0(by default). | TENANT   | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE | 0             |         1 |
  | zone1 | observer | 10.10.10.1     |     2882 | memory_limit                          | CAPACITY  | 30G   | the size of the memory reserved for internal use(for testing purpose), 0 means follow memory_limit_percentage. Range: 0, [1G,).                                                                                                                                                                                                                                                                                                                                                                                                                      | OBSERVER | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE | 0M            |         0 |
  | zone1 | observer | 10.10.10.1     |     2882 | writing_throttling_trigger_percentage | INT       | 60    | the threshold of the size of the mem store when writing_limit will be triggered. Rang: (0,100]. setting 100 means turn off writing limit                                                                                                                                                                                                                                                                                                                                                                                                              | TRANS    | TENANT  | DEFAULT | DYNAMIC_EFFECTIVE | 60            |         1 |
  | zone1 | observer | 10.10.10.1     |     2882 | freeze_trigger_percentage             | INT       | 20    | the threshold of the size of the mem store when freeze will be triggered. Rang: (0,100)                                                                                                                                                                                                                                                                                                                                                                                                                                                               | TENANT   | TENANT  | DEFAULT | DYNAMIC_EFFECTIVE | 20            |         1 |
  +-------+----------+----------------+----------+---------------------------------------+-----------+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+---------------+-----------+
  ```

* Query whether global major compaction is enabled
  
  ```sql
  SHOW PARAMETERS LIKE 'enable_major_freeze';
  ```

  The output is as follows:

  ```shell
  +-------+----------+----------------+----------+---------------------+-----------+-------+--------------------------------------------------------------------------------------------------+--------------+---------+---------+-------------------+
  | zone  | svr_type | svr_ip         | svr_port | name                | data_type | value | info                                                                                             | section      | scope   | source  | edit_level        |
  +-------+----------+----------------+----------+---------------------+-----------+-------+--------------------------------------------------------------------------------------------------+--------------+---------+---------+-------------------+
  | zone1 | observer | 10.10.10.1     |     2882 | enable_major_freeze | BOOL      | True  | specifies whether major_freeze function is turned on. Value:  True:turned on;  False: turned off | ROOT_SERVICE | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
  +-------+----------+----------------+----------+---------------------+-----------+-------+--------------------------------------------------------------------------------------------------+--------------+---------+---------+-------------------+
  ```

* Initiate a major compaction for all tenants
  
  ```sql
  ALTER SYSTEM MAJOR FREEZE TENANT= all_user;
  ```

* Initiate a major compaction for a single tenant, such as `test`
  
  ```sql
  ALTER SYSTEM MAJOR FREEZE TENANT='test';
  ```

* Query the major compaction process of each zone of tenants
  
  ```sql
  SELECT * FROM oceanbase.CDB_OB_ZONE_MAJOR_COMPACTION;
  ```

  The output is as follows. For more information about the `CDB_OB_ZONE_MAJOR_COMPACTION` view, see [oceanbase.CDB_OB_ZONE_MAJOR_COMPACTION](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104320).

  ```shell
  +-----------+-------+---------------------+---------------------+----------------------------+----------------------------+--------+
  | TENANT_ID | ZONE  | BROADCAST_SCN       | LAST_SCN            | LAST_FINISH_TIME           | START_TIME                 | STATUS |
  +-----------+-------+---------------------+---------------------+----------------------------+----------------------------+--------+
  |         1 | zone1 | 1721152800548834000 | 1721152800548834000 | 2024-07-17 02:02:45.384450 | 2024-07-17 02:00:00.592597 | IDLE   |
  |      1001 | zone1 | 1721152803954045000 | 1721152803954045000 | 2024-07-17 02:04:38.201694 | 2024-07-17 02:00:04.011316 | IDLE   |
  |      1009 | zone1 | 1721152804388328000 | 1721152804388328000 | 2024-07-17 02:05:28.617318 | 2024-07-17 02:00:04.438908 | IDLE   |
  |      1010 | zone1 | 1721152800394534000 | 1721152800394534000 | 2024-07-17 02:02:33.460294 | 2024-07-17 02:00:00.448116 | IDLE   |
  +-----------+-------+---------------------+---------------------+----------------------------+----------------------------+--------+
  ```

* Query the major compaction information of all tenants
  
  ```sql
  SELECT * FROM oceanbase.CDB_OB_MAJOR_COMPACTION;
  ```

  The output is as follows. For more information about the `CDB_OB_MAJOR_COMPACTION` view, see [oceanbase.CDB_OB_MAJOR_COMPACTION](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104410).

  ```shell
  
  +-----------+---------------------+----------------------------+----------------------+---------------------+----------------------------+----------------------------+--------+----------+--------------+------+
  | TENANT_ID | FROZEN_SCN          | FROZEN_TIME                | GLOBAL_BROADCAST_SCN | LAST_SCN            | LAST_FINISH_TIME           | START_TIME                 | STATUS | IS_ERROR | IS_SUSPENDED | INFO |
  +-----------+---------------------+----------------------------+----------------------+---------------------+----------------------------+----------------------------+--------+----------+--------------+------+
  |         1 | 1721152800548834000 | 2024-07-17 02:00:00.548834 |  1721152800548834000 | 1721152800548834000 | 2024-07-17 02:02:45.381779 | 2024-07-17 02:00:00.575358 | IDLE   | NO       | NO           |      |
  |      1001 | 1721152803954045000 | 2024-07-17 02:00:03.954045 |  1721152803954045000 | 1721152803954045000 | 2024-07-17 02:04:38.198968 | 2024-07-17 02:00:03.996545 | IDLE   | NO       | NO           |      |
  |      1009 | 1721152804388328000 | 2024-07-17 02:00:04.388328 |  1721152804388328000 | 1721152804388328000 | 2024-07-17 02:05:28.614793 | 2024-07-17 02:00:04.423302 | IDLE   | NO       | NO           |      |
  |      1010 | 1721152800394534000 | 2024-07-17 02:00:00.394534 |  1721152800394534000 | 1721152800394534000 | 2024-07-17 02:02:33.456848 | 2024-07-17 02:00:00.429451 | IDLE   | NO       | NO           |      |
  +-----------+---------------------+----------------------------+----------------------+---------------------+----------------------------+----------------------------+--------+----------+--------------+------+
  ```

* Query the number of tables pending major compaction
  
  ```sql
  SELECT * FROM oceanbase.GV$OB_COMPACTION_PROGRESS 
    WHERE UNFINISHED_TABLET_COUNT != 0;
  ```

  For more information about the `GV$OB_COMPACTION_PROGRESS` view, see [GV\$OB_COMPACTION_PROGRESS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104421).

* Query the delay of a major compaction for a tenant

  ```sql
  SELECT * FROM oceanbase. __all_rootservice_event_history WHERE name1='tenant_id' and value1='${tenant ID}' and module = 'daily_merge' order by gmt_create desc  limit 1;
  ```

  You need to replace `${tenant ID}` with the ID of the target tenant. You can execute the `select * from oceanbase.DBA_OB_TENANTS;` statement to query the tenant ID. For more information about the `DBA_OB_TENANTS` view, see [oceanbase.DBA_OB_TENANTS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104223). The output is as follows:

  ```shell
  +----------------------------+-------------+---------------+-----------+--------+----------------------+---------------------+-------+--------+-------+--------+-------+--------+-------+--------+------------+----------------+-------------+
  | gmt_create                 | module      | event         | name1     | value1 | name2                | value2              | name3 | value3 | name4 | value4 | name5 | value5 | name6 | value6 | extra_info | rs_svr_ip      | rs_svr_port |
  +----------------------------+-------------+---------------+-----------+--------+----------------------+---------------------+-------+--------+-------+--------+-------+--------+-------+--------+------------+----------------+-------------+
  | 2024-07-18 02:04:45.332640 | daily_merge | global_merged | tenant_id | 1001   | global_broadcast_scn | 1721239201197860000 |       |        |       |        |       |        |       |        |            | 10.10.10.1     |        2882 |
  +----------------------------+-------------+---------------+-----------+--------+----------------------+---------------------+-------+--------+-------+--------+-------+--------+-------+--------+------------+----------------+-------------+
  ```

* Query ongoing minor or major compaction tasks
  
  ```sql
  SELECT * FROM oceanbase.GV$OB_TABLET_COMPACTION_PROGRESS WHERE TYPE='MINI_MERGE';
  ```

  You can set `TYPE` to `MINI_MERGE` to view minor compaction tasks, and to `MAJOR_MERGE` to view major compaction tasks. A minor compaction converts the frozen MemTables into a mini SSTable. For more information about the `GV$OB_TABLET_COMPACTION_PROGRESS` view, see [GV\$OB_TABLET_COMPACTION_PROGRESS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104527).

* Query the minor or major compaction history
  
  ```sql
  SELECT * FROM oceanbase.GV$OB_TABLET_COMPACTION_HISTORY 
    WHERE TYPE='MINI_MERGE' order by START_TIME desc limit 3;
  ```

  You can set `TYPE` to `MINI_MERGE` to view the minor compaction history, and to `MAJOR_MERGE` to view the major compaction history. A minor compaction converts the frozen MemTables into a mini SSTable. The output is as follows:
  
  ```shell
  
  +---------------+----------+-----------+-------+-----------+------------+---------------------+----------------------------+----------------------------+-----------------------------------+-------------+-------------------+-------------------------------+------------------------------+--------------------------------------+-----------------+-----------------------+-------------------+---------------------+------------------------------+----------------------------+-----------------+---------------+------------------------------------------------------------------------+---------------+--------------------------------------------------------------------+-------------+-----------+-----------------------------------------------------------------+-------------------+
  | SVR_IP        | SVR_PORT | TENANT_ID | LS_ID | TABLET_ID | TYPE       | COMPACTION_SCN      | START_TIME                 | FINISH_TIME                | TASK_ID                           | OCCUPY_SIZE | MACRO_BLOCK_COUNT | MULTIPLEXED_MACRO_BLOCK_COUNT | NEW_MICRO_COUNT_IN_NEW_MACRO | MULTIPLEXED_MICRO_COUNT_IN_NEW_MACRO | TOTAL_ROW_COUNT | INCREMENTAL_ROW_COUNT | COMPRESSION_RATIO | NEW_FLUSH_DATA_RATE | PROGRESSIVE_COMPACTION_ROUND | PROGRESSIVE_COMPACTION_NUM | PARALLEL_DEGREE | PARALLEL_INFO | PARTICIPANT_TABLE                                                      | MACRO_ID_LIST | COMMENTS                                                           |
  +---------------+----------+-----------+-------+-----------+------------+---------------------+----------------------------+----------------------------+-----------------------------------+-------------+-------------------+-------------------------------+------------------------------+--------------------------------------+-----------------+-----------------------+-------------------+---------------------+------------------------------+----------------------------+-----------------+---------------+------------------------------------------------------------------------+---------------+--------------------------------------------------------------------+
  | 10.10.10.1     |     2882 |      1002 |     1 |       373 | MINI_MERGE | 1721152976299008000 | 2024-07-17 02:03:08.509109 | 2024-07-17 02:03:08.524133 | YB420BA1CC62-00061A0898BDDE08-0-0 |       14045 |                 1 |                             0 |                            1 |                                    0 |             101 |                   101 |                 1 |                4896 |                            0 |                          0 |               1 | -             | table_cnt=1,start_scn=1721112282660948001,end_scn=1721152976299008000; | 18831         | comment="cost_mb=2;time=add_time:1721152988508926|total=15.02ms;"; |
  | 10.10.10.1     |     2882 |      1002 |     1 |       121 | MINI_MERGE | 1721152980999256000 | 2024-07-17 02:03:03.506837 | 2024-07-17 02:03:03.576037 | YB420BA1CC62-00061A0898BDDC45-0-0 |           0 |                 0 |                             0 |                            0 |                                    0 |               0 |                     0 |                 1 |                   0 |                            0 |                          0 |               1 | -             | table_cnt=1,start_scn=1721152803751899001,end_scn=1721152980999256000; |               | comment="time=add_time:1721152983506636|total=69.20ms;";           |
  | 10.10.10.1     |     2882 |      1002 |     1 |         1 | MINI_MERGE | 1721152973925564001 | 2024-07-17 02:02:58.504770 | 2024-07-17 02:02:58.569947 | YB420BA1CC62-00061A0898BDDA52-0-0 |        2204 |                 1 |                             0 |                            1 |                                    0 |              18 |                    18 |                 1 |                 818 |                            0 |                          0 |               1 | -             | table_cnt=1,start_scn=1721152803751899001,end_scn=1721152973925564001; | 18736         | comment="cost_mb=2;time=add_time:1721152978504549|total=65.18ms;"; |
  +---------------+----------+-----------+-------+-----------+------------+---------------------+----------------------------+----------------------------+-----------------------------------+-------------+-------------------+-------------------------------+------------------------------+--------------------------------------+-----------------+-----------------------+-------------------+---------------------+------------------------------+----------------------------+-----------------+---------------+------------------------------------------------------------------------+---------------+--------------------------------------------------------------------+
  ```
  
  For more information about the `GV$OB_TABLET_COMPACTION_HISTORY` view, see [GV\$OB_TABLET_COMPACTION_HISTORY](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104513).

* Query the major compaction records of a table

  ```sql
  SELECT * FROM oceanbase.GV$OB_TABLET_COMPACTION_HISTORY 
    WHERE TABLET_ID IN 
    (SELECT TABLET_ID FROM oceanbase.CDB_OB_TABLE_LOCATIONS WHERE TABLE_NAME = '${table_name}') ORDER BY START_TIME DESC limit 1;
  ```

  You need to replace `${table_name}` with the name of the target table. For more information about the `GV$OB_TABLET_COMPACTION_HISTORY` and `CDB_OB_TABLE_LOCATIONS` views, see [GV\$OB_TABLET_COMPACTION_HISTORY](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104513) and [oceanbase.CDB_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104230). The output is as follows:

  ```shell
  +---------------+----------+-----------+-------+-----------+----------------+---------------------+----------------------------+----------------------------+-----------------------------------+-------------+-------------------+-------------------------------+------------------------------+--------------------------------------+-----------------+-----------------------+-------------------+---------------------+------------------------------+----------------------------+-----------------+---------------+-------------------+---------------+---------------------------------------------------------+-------------+-----------+---------------+-------------------+
  | SVR_IP        | SVR_PORT | TENANT_ID | LS_ID | TABLET_ID | TYPE           | COMPACTION_SCN      | START_TIME                 | FINISH_TIME                | TASK_ID                           | OCCUPY_SIZE | MACRO_BLOCK_COUNT | MULTIPLEXED_MACRO_BLOCK_COUNT | NEW_MICRO_COUNT_IN_NEW_MACRO | MULTIPLEXED_MICRO_COUNT_IN_NEW_MACRO | TOTAL_ROW_COUNT | INCREMENTAL_ROW_COUNT | COMPRESSION_RATIO | NEW_FLUSH_DATA_RATE | PROGRESSIVE_COMPACTION_ROUND | PROGRESSIVE_COMPACTION_NUM | PARALLEL_DEGREE | PARALLEL_INFO | PARTICIPANT_TABLE | MACRO_ID_LIST | COMMENTS                                                |
  +---------------+----------+-----------+-------+-----------+----------------+---------------------+----------------------------+----------------------------+-----------------------------------+-------------+-------------------+-------------------------------+------------------------------+--------------------------------------+-----------------+-----------------------+-------------------+---------------------+------------------------------+----------------------------+-----------------+---------------+-------------------+---------------+---------------------------------------------------------+
  | 10.10.10.1     |     2882 |         1 |     1 |    200030 | MDS_MINI_MERGE | 1721273439647032000 | 2024-07-18 11:30:40.065549 | 2024-07-18 11:30:40.072639 | YB420BA1CC62-00061A08028BAA9E-0-0 |           0 |                 0 |                             0 |                            0 |                                    0 |               0 |                     0 |                 1 |                   0 |                            0 |                          0 |               0 | -             |                   |               | comment="time=add_time:1721273439825215|total=7.09ms;"; |
  +---------------+----------+-----------+-------+-----------+----------------+---------------------+----------------------------+----------------------------+-----------------------------------+-------------+-------------------+-------------------------------+------------------------------+--------------------------------------+-----------------+-----------------------+-------------------+---------------------+------------------------------+----------------------------+-----------------+---------------+-------------------+---------------+---------------------------------------------------------+
  ```

### SQL statements related to execution plans and plan caches

* Query information about the execution plan of an SQL statement
  
  ```sql
  SELECT * FROM oceanbase.GV$OB_PLAN_CACHE_PLAN_stat where query_sql like '%keyword%';
  ```
  
  You need to replace `%keyword%` with a keyword in the SQL statement.

* Clear all plan caches of a tenant
  
  ```sql
  ALTER SYSTEM FLUSH PLAN CACHE TENANT = '${tenant_name}' global;
  ```

  You need to replace `${tenant_name}` with the name of the target tenant.

* Clear all plan caches of a database in a tenant
  
  ```sql
  ALTER SYSTEM FLUSH PLAN CACHE databases='${database}' tenant='${tenant_name}' GLOBAL;
  ```

  You need to replace `${database}` with the name of the target database, and `${tenant_name}` with the name of the tenant where `${database}` belongs.

### SQL statements related to statistics collection

* Manually collect statistics

  * Collect statistics on the `test1` table in the `test` database by calling a procedure

    ```sql
    call dbms_stats.gather_table_stats('test','test1');
    ```

  * Collect statistics on all tables in the `test` database by calling a procedure and set the degree of parallelism (DOP) to `128`

    ```sql
    call dbms_stats.gather_schema_stats('test', degree=>128);
    ```  

  * Collect statistics on the `test1` table in the `test` database by executing the ANALYZE statement

    ```sql
    ALTER SYSTEM SET enable_sql_extension = true;
    ANALYZE TABLE test.test1 COMPUTE STATISTICS;
    ```

* Query the statistics collected on the `test1` table
  
  ```sql
  SELECT * FROM oceanbase.DBA_TAB_STATISTICS WHERE TABLE_NAME='test1';
  ```

  For more information about the `DBA_TAB_STATISTICS` view, see [oceanbase.DBA_TAB_STATISTICS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104296).

* Query the sorted time consumption of tasks for collecting tenant table statistics
  
  ```sql
  SELECT table_id,tenant_id,task_id,ret_code,start_time,end_time,TIMEDIFF(end_time, start_time) as times FROM oceanbase. __all_virtual_table_opt_stat_gather_history order by times desc limit 5;
  ```

  The output is as follows:

  ```shell
  +----------+-----------+--------------------------------------+----------+----------------------------+----------------------------+-----------------+
  | table_id | tenant_id | task_id                              | ret_code | start_time                 | end_time                   | times           |
  +----------+-----------+--------------------------------------+----------+----------------------------+----------------------------+-----------------+
  |   525657 |      1002 | 36507c6d-32fb-11ef-a31f-00163e048137 |        0 | 2024-06-25 22:00:00.173423 | 2024-06-25 22:01:51.433552 | 00:01:51.260129 |
  |      458 |         1 | 5f2ad8bf-387b-11ef-8765-00163e035a65 |        0 | 2024-07-02 22:00:00.136656 | 2024-07-02 22:00:01.743898 | 00:00:01.607242 |
  |      458 |         1 | 3646d5bc-32fb-11ef-a31f-00163e06beb9 |        0 | 2024-06-25 22:00:00.085670 | 2024-06-25 22:00:01.663990 | 00:00:01.578320 |
  |      458 |      1001 | 60c1e763-33c4-11ef-a31f-00163e06beb9 |        0 | 2024-06-26 22:00:00.252122 | 2024-06-26 22:00:01.822895 | 00:00:01.570773 |
  |      458 |         1 | 3fddfbd3-4163-11ef-885e-00163e048137 |        0 | 2024-07-14 06:00:00.235859 | 2024-07-14 06:00:01.800427 | 00:00:01.564568 |
  +----------+-----------+--------------------------------------+----------+----------------------------+----------------------------+-----------------+
  ```

### Other SQL statements

* Query RootService switching information

  ```sql
  SELECT * FROM __all_rootservice_event_history WHERE module='root_service' and event in ('start_rootservice','stop_rootservice') order by gmt_create desc;
  ```

* Query table information by table ID
  
  A table ID uniquely identifies a table within a tenant. However, table IDs can be duplicate among tenants in a cluster. A table ID can also identify an index or a view. You can query the `CDB_OB_TABLE_LOCATIONS` view for information, such as the table name, database name, tenant name, leader, and table type, of a table object. Here is an example:

  ```sql
  SELECT * FROM oceanbase.CDB_OB_TABLE_LOCATIONS where table_id = 500008;
  ```

  The output is as follows. For more information about the `CDB_OB_TABLE_LOCATIONS` view, see [oceanbase.CDB_OB_TABLE_LOCATIONS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104230).

  ```shell
  
  +-----------+---------------+------------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+----------------+----------+----------+--------------+-----------------+-----------+-----------------+---------------+----------+
  | TENANT_ID | DATABASE_NAME | TABLE_NAME       | TABLE_ID | TABLE_TYPE | PARTITION_NAME | SUBPARTITION_NAME | INDEX_NAME | DATA_TABLE_ID | TABLET_ID | LS_ID | ZONE  | SVR_IP         | SVR_PORT | ROLE     | REPLICA_TYPE | DUPLICATE_SCOPE | OBJECT_ID | TABLEGROUP_NAME | TABLEGROUP_ID | SHARDING |
  +-----------+---------------+------------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+----------------+----------+----------+--------------+-----------------+-----------+-----------------+---------------+----------+
  |         1 | test          | cluster_slowlogs |   500008 | USER TABLE | NULL           | NULL              | NULL       |          NULL |    200002 |     1 | zone1 | 10.10.10.1     |     2882 | FOLLOWER | FULL         | NONE            |    500008 | NULL            |          NULL | NULL     |
  +-----------+---------------+------------------+----------+------------+----------------+-------------------+------------+---------------+-----------+-------+-------+----------------+----------+----------+--------------+-----------------+-----------+-----------------+---------------+----------+
  ```

* Verify whether an index takes effect

  * Verify whether an index takes effect (that is, has a status value of `VALID`) based on the index name in the sys tenant

    ```sql
    SELECT * FROM oceanbase.CDB_INDEXES where status<>'VALID' and INDEX_NAME='%<index name>%';
    ```

    You need to replace `<index name>` with the actual index name. If the output is empty, all indexes are normal. For more information about the `CDB_INDEXES` view, see [oceanbase.CDB_INDEXES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104365).
  
  * Verify whether an index takes effect based on the table ID

    To query information such as the table ID by index name, you need to replace `<index name>` with the actual index name.

    ```sql
    SELECT table_id, table_name FROM oceanbase. __all_virtual_table_history WHERE table_name like '%<index name>%';
    ```

    Query index creation failures by table ID. If the output is empty, all indexes are normal.

    ```sql
    SELECT * FROM  oceanbase. __all_virtual_ddl_error_message WHERE object_id = '${table_id}';
    ```

* Query the slow transactions of a tenant
  
  ```sql
  SELECT /*+READ_CONSISTENCY(weak),parallel(8),QUERY_TIMEOUT(180000000)*/ usec_to_time(request_time),* 
    FROM oceanbase.GV$OB_SQL_AUDIT 
    WHERE tenant_id = ${tenant ID} and RET_CODE = '-5066' and QUERY_SQL like 'REPLACE%' and usec_to_time(request_time) between '2024-05-01 15:25:00' and now() order by ELAPSED_TIME desc;
  ```

  You need to replace `${tenant ID}` with the ID of the target tenant. You can execute the `select * from oceanbase.DBA_OB_TENANTS;` statement to query the tenant ID. You need to replace `2024-05-01 15:25:00` in the example based on the actual situation. For more information about the `GV$OB_SQL_AUDIT` view, see [GV\$OB_SQL_AUDIT](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106687).

* Query long-running transactions and suspended transactions

  The following examples query the transactions within the last 600s. You can replace `600` with a desired value based on the actual situation.

  * Query long-running transactions

    ```sql
    SELECT count(1) FROM oceanbase. __all_virtual_trans_stat
      WHERE part_trans_action<=2 AND ctx_create_time < date_sub(now(), INTERVAL 600 SECOND) AND is_exiting != 1;
    ```

  * Query suspended transactions

    ```sql
    SELECT count(1) FROM oceanbase. __all_virtual_trans_stat
      WHERE part_trans_action > 2 AND ctx_create_time < date_sub(now(), INTERVAL 600 SECOND) AND is_exiting != 1;
    ```

* Query the index creation progress
  
  ```sql
  SELECT 
    SUBSTRING_INDEX(SUBSTRING_INDEX(MESSAGE, 'ROW_INSERTED: ', -1), ',', 1) AS row_inserted,
    SUBSTRING_INDEX(SUBSTRING_INDEX(MESSAGE, 'ROW_SCANNED: ', -1), ',', 1) AS row_scanned,
    (SUBSTRING_INDEX(SUBSTRING_INDEX(MESSAGE, 'ROW_INSERTED: ', -1), ',', 1) /SUBSTRING_INDEX  (SUBSTRING_INDEX(MESSAGE, 'ROW_SCANNED: ', -1), ',', 1)) AS ratio
    FROM oceanbase.GV$SESSION_LONGOPS;
  ```

  For more information about the `GV$SESSION_LONGOPS` view, see [GV\$SESSION_LONGOPS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104538).

* Query the macroblock utilization of a tenant
  
  ```sql
  SELECT loc.TENANT_ID,loc.DATABASE_NAME,loc.TABLE_NAME,loc.TABLE_ID,
    SUM(rep.DATA_SIZE) AS DATA_SIZE,
    SUM(rep.REQUIRED_SIZE) AS REQUIRED_SIZE,
    SUM(rep.DATA_SIZE) / NULLIF(SUM(rep.REQUIRED_SIZE), 0) AS SIZE_RATIO
    FROM oceanbase.CDB_OB_TABLE_LOCATIONS loc
    JOIN oceanbase.CDB_OB_TABLET_REPLICAS rep
    ON loc.TABLET_ID = rep.TABLET_ID
    WHERE loc.TABLE_TYPE = 'USER TABLE' and loc.TENANT_ID = ${tenant ID}
    GROUP BY loc.DATABASE_NAME,loc.TABLE_NAME,loc.TABLE_ID;
  ```
  
  You need to replace `${tenant ID}` with the ID of the target tenant. You can execute the `select * from oceanbase.DBA_OB_TENANTS;` statement to query the tenant ID.

## Common issues and troubleshooting

### Obtain the database logs of an SQL statement

This section describes how to quickly locate the logs of an abnormal SQL statement. For most issues related to SQL statements, you cannot identify the causes merely by querying related views and need to check the database system logs. However, OceanBase Database has a large amount of logs, and they are updated quickly. If you are unfamiliar with database operations, you may fail to find information about an abnormal SQL statement because its logs have been overwritten. This section focuses on adjusting system logs, printing trace IDs, and locating system logs.

Symptom: An SQL statement fails or an SQL task is not completed in the business system, and you cannot identify the cause based on views.

Two handling methods are available based on the scenarios. Select an appropriate method as needed.

#### Scenario 1: The SQL statement cannot be repeatedly executed
  
1. Query the `GV$OB_SQL_AUDIT` view for `TRACE_ID` and `svr_ip` of the abnormal SQL statement.

   > **Note**
   >
   > The data recorded in this view will not be persisted locally. The data retention period depends on the tenant memory size and the `ob_sql_audit_percentage` system variable. If you fail to query information about the SQL statement, you can adjust the value of `ob_sql_audit_percentage`. For more information about the `ob_sql_audit_percentage` system variable, see [ob_sql_audit_percentage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105342).

   ```sql
   select query_sql,svr_ip,TRACE_ID,client_ip,TENANT_NAME,user_name,DB_NAME,ELAPSED_TIME,RET_CODE,FROM_UNIXTIME(ROUND(REQUEST_TIME/1000/1000),'%Y-%m-%d %H:%i:%S') from `GV$OB_SQL_AUDIT` WHERE REQUEST_TIME>='2024-04-05 14:34:00'  limit 10;
   ```

   For more information about the `GV$OB_SQL_AUDIT` view, see [GV\$OB_SQL_AUDIT](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106687).

2. On the server with the IP address specified by `svr_ip`, filter logs by `TRACE_ID`.

   Not all exceptions are recorded in the `observer.log` file. For example, if a backup statement fails, you can find the cause in the `rootservice.log` file.

   ```bash
   [root@test001 ~]$ grep "YB420BA1CC68-000615A09D4CBDA0-0-0" observer.log*
   [root@test001 ~]$ grep "YB420BA1CC68-000615A09D4CBDA0-0-0" rootservice.log*
   ```
  
3. If the information in the `GV$OB_SQL_AUDIT` view is evicted, the corresponding system logs are overwritten, or the system log level is too low, you can perform the following steps to adjust settings and repeat the preceding steps to obtain the logs when the SQL statement can be executed again to reproduce the issue.

   1. Query the system log level.

      ```sql
      show parameters like 'syslog_level';
      ```

      The output is as follows:

      ```shell
      +-------+----------+----------------+----------+--------------+-----------+-------+------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+---------------+-----------+
      | zone  | svr_type | svr_ip         | svr_port | name         | data_type | value | info                                                                                                                         | section  | scope   | source  | edit_level        | default_value | isdefault |
      +-------+----------+----------------+----------+--------------+-----------+-------+------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+---------------+-----------+
      | zone1 | observer | 10.10.10.1     |     2882 | syslog_level | STRING    | WDIAG | specifies the current level of logging. There are DEBUG, TRACE, WDIAG, EDIAG, INFO, WARN, ERROR, seven different log levels. | OBSERVER | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE | WDIAG         |         1 |
      +-------+----------+----------------+----------+--------------+-----------+-------+------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+---------------+-----------+
      ```

   2. (Optional) Set the log level.

      The default value of the `syslog_level` parameter is `WDIAG`. If the parameter value is `WDIAG` in the preceding output, skip this step.

      ```sql
      alter system set syslog_level='WDIAG';
      ```

   3. Set the number of system log files to retain based on the available disk space.

      ```sql
      alter system set max_syslog_file_count='10';
      ```

#### Scenario 2: The SQL statement can be repeatedly executed

You can first follow the steps in Scenario 1 for troubleshooting, or repeatedly execute the SQL statement to reproduce the issue. If you cannot obtain the required information, perform the following steps to obtain the trace ID of the SQL statement and filter the logs by trace ID. You can query the trace ID both from the sys tenant and a user tenant. Select a tenant to query the trace ID based on the actual scenario.

* If an error is immediately returned after the SQL statement is executed, we recommend that you query the trace ID from the sys tenant.

  1. Log on to the sys tenant and set the `enable_rich_error_msg` parameter to `true`.

     The `enable_rich_error_msg` parameter specifies whether to add debugging information, such as the server IP address, time, and trace ID, to client messages. For more information, see [enable_rich_error_msg](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105476).

     ```sql
     alter system set enable_rich_error_msg=true;
     ```

  2. Log on to a user tenant and execute the SQL statement. The IP address of the execution node and the trace ID are directly returned.

     ```sql
     obclient [test]> select count(*) from t2;
     ```

     The output is as follows:

     ```shell
     ERROR 1146 (42S02): Table 'test.t2' doesn't exist
     [10.10.10.1:2882] [2024-04-13 20:10:20.292087] [YB420BA1CC68-000615A0A8EA5E38-0-0]
     ```
  
  3. Access the execution node, which is 10.10.10.1 in this example, to filter logs.

     ```bash
     [root@test001 ~]$ grep "YB420BA1CC68-000615A0A8EA5E38-0-0"  rootservice.log*
     [root@test001 ~]$ grep "YB420BA1CC68-000615A0A8EA5E38-0-0"  observer.log*
     ```
  
  4. After you obtain the required logs, set the `enable_rich_error_msg` parameter to `false`.

     ```sql
     alter system set enable_rich_error_msg=false;
     ```

* If the SQL statement is successfully executed but the SQL task remains uncompleted after a long period of time, we recommend that you query the trace ID from a user tenant. For example, if the archiving status does not change to `doing` after you enable archiving, you need to perform the following steps to query the trace ID:
  
  1. Log on to a user tenant and set the `ob_enable_show_trace` variable to `ON`.

     The `ob_enable_show_trace` variable specifies whether to enable the show trace feature. For more information, see [ob_enable_show_trace](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105375).

     ```sql
     SET ob_enable_show_trace='ON';
     ```

  2. Execute the SQL statement and query its trace ID.

     Only the trace ID is returned. Therefore, you need to query the `GV$OB_SQL_AUDIT` view for the node (`SVR_IP`) where logs are to be filtered.

     > **Note**
     >
     > You must execute the following statements in the same session.

     Execute the SQL statement, which is `select count(*) from test2;` in this example. The output is as follows:

     ```shell
     +----------+
     | count(*) |
     +----------+
     |        0 |
     +----------+
     ```

     Query the trace ID of the executed SQL statement.

     ```shell
     obclient [test]> select last_trace_id();
     ```

     The output is as follows:

     ```shell
     +-----------------------------------+
     | last_trace_id()                   |
     +-----------------------------------+
     | YB420BA1CC68-000615A0A8EA6511-0-0 |
     +-----------------------------------+
     ```

     Query the `GV$OB_SQL_AUDIT` view for the node where the logs reside based on the trace ID displayed in the output.

     ```shell
     obclient [test]> select * from oceanbase.gv$ob_sql_audit where  trace_id='YB420BA1CC68-000615A0A8EA6511-0-0';
     ```

  3. Filter logs by trace ID on the node with the IP address specified by `SVR_IP`.

     ```bash
     [root@test001 ~]$ grep "YB420BA1CC68-000615A0A8EA6511-0-0" rootservice.log*
     [root@test001 ~]$ grep "YB420BA1CC68-000615A0A8EA6511-0-0" observer.log*
     ```
### Collect information about slow SQL statements

When you use OceanBase Database, you may encounter the issue of slow SQL execution due to hardware bottlenecks or the need for SQL tuning. In such cases, you first need to find the cause of the issue. The tuning methods are not described here but in Chapter 7. This section describes how to collect information about slow SQL statements for self-service troubleshooting or for reference when you seek help in the Q&A section of the OceanBase community.

Select an appropriate solution based on the scenario.

#### The execution of an SQL statement times out or takes a long time

We recommend that you use OceanBase Diagnostic Tool (obdiag) to diagnose and analyze the system logs of the current cluster to assist with troubleshooting. For more information about the procedure, see [Use obdiag for Diagnostic Analysis](https://en.oceanbase.com/docs/common-obdiag-en-10000000001574809).

The show trace feature in end-to-end diagnostics can also detect performance bottlenecks and perform further analysis and tuning. For more information about the feature, see [End-to-end tracing](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103878).
  
If the issue cannot be resolved by using the two methods, you can troubleshoot in the following ways:

* Query the `GV$OB_SQL_AUDIT` view for the wait events that affect the execution time.
  
  ```sql
  select * from oceanbase.gv$ob_sql_audit where query_sql like '%<SQL keyword>%'
  ```

  You need to replace `<SQL keyword>` with the keyword in the SQL statement whose execution times out or takes a long time. For more information about the `GV$OB_SQL_AUDIT` view, see [GV\$OB_SQL_AUDIT](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106687).

* Run the `EXPLAIN EXTENDED` command to obtain the execution plan and analyze the plan. For the procedure, see [View and analyze the shape of an execution plan](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001107586).

* Perform the following steps to obtain the SQL plan monitoring information for troubleshooting:

  1. Log on to the sys tenant and query the `enable_sql_audit` parameter.

     ```sql
     show parameters like 'enable_sql_audit';
     ```

     For more information about the `enable_sql_audit` parameter, see [enable_sql_audit](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105603).

  2. (Optional) Set the `enable_sql_audit` parameter.

     If the value of the `enable_sql_audit` parameter is `false`, execute the following statement to change the value to `true`:

     ```sql
     alter system enable_sql_audit = true;
     ```

  3. Log on to a user tenant and query the execution plan of the SQL statement.

     ```sql
     EXPLAIN EXTENDED <SQL statement>;
     ```
  
  4. Enable the show trace feature.
  
     ```sql
     SET ob_enable_show_trace=‘ON’;
     ```

  5. Execute the SQL statement whose execution times out or takes a long time again.

  6. Execute the following SQL statement to query the trace ID of the SQL statement executed in the previous step:

     ```sql
     select last_trace_id();
     ```

  7. Execute the following statement in the sys tenant to temporarily disable the SQL audit feature to prevent the information from being overwritten:

     ```sql
     alter system enable_sql_audit = false;
     ```

  8. Query the SQL plan monitoring information.

     Replace `<trace_id>` in the following statement with the trace ID returned in Step 6 to query the output of each operator.

     ```sql
     select plan_line_id, plan_operation, sum(output_rows), sum(STARTS) rescan, min(first_refresh_time) open_time, max(last_refresh_time) close_time, min(first_change_time) first_row_time, max(last_change_time) last_row_eof_time, count(1) from oceanbase.gv$sql_plan_monitor where trace_id = '<trace_id>' group by plan_line_id, plan_operation order by plan_line_id;
     ```

  9. Execute the following statement in the sys tenant to restore the value of the `enable_sql_audit` parameter:

     ```sql
     alter system enable_sql_audit = true;
     ```

If the issue persists, you can submit a question in the [Q&A](https://ask.oceanbase.com/) section on the official website and provide the preceding information and the observer.log file corresponding to the trace ID for assistance.

The preceding methods apply to SELECT statements. If the execution of a DDL statement is stuck, self-service troubleshooting is unsuitable. You can submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

#### The execution of a DDL statement is stuck

1. Execute the following statement to query the information about the DDL statement being executed:

   ```sql
   select tenant_id, gmt_create, ddl_type, status, task_id, parent_task_id, object_id, target_object_id, execution_id, trace_id, unhex(ddl_stmt_str) from __all_virtual_ddl_task_status;
   ```

   Take the following actions based on the returned result:

   * If the information about the DDL statement being executed can be obtained, go to Step 2.

   * If the information about the DDL statement being executed cannot be obtained, go to Step 3.

2. Query the status switching history of the DDL task based on information such as the tenant ID and task ID returned in the output.

   ```sql
   # Replace <tenant_id> and <task_id> with the `tenant_id` and `task_id` values returned in Step 1.
   set @ddl_tenant_id = <tenant_id>, @ddl_task_id = <task_id>;

   select * from __all_rootservice_event_history where module = 'ddl_scheduler' and event = 'switch_state' and value1 = @ddl_tenant_id and value2 = @ddl_task_id;
   ```

   If the task ID of an index creation task is unknown, you can query the required information based on OBJECT_ID (ID of the primary table) and TARGET_OBJECT_ID (ID of the index table) instead.

   ```sql
   select * from __all_rootservice_event_history where module = 'ddl_scheduler' and event = 'switch_state' and value1 = @ddl_tenant_id and value3 = '$OBJECT_ID' and value4 = '$TARGET_OBJECT_ID';
   ```

   If the value of `new_state` in the output is `2` (`WAIT_TRANS_END`), the system is probably waiting for the active transaction to end. The mappings between DDL execution phases and output values are as follows:

   ```shell
   PREPARE = 0,
   LOCK_TABLE = 1,
   WAIT_TRANS_END = 2,
   REDEFINITION = 3,
   VALIDATE_CHECKSUM = 4,
   COPY_TABLE_DEPENDENT_OBJECTS = 5,
   TAKE_EFFECT = 6,
   WRITE_BARRIER_LOG = 7,
   CHECK_CONSTRAINT_VALID = 8,
   SET_CONSTRAINT_VALIDATE = 9,
   MODIFY_AUTOINC = 10,
   SET_WRITE_ONLY = 11,
   WAIT_TRANS_END_FOR_WRITE_ONLY = 12,
   SET_UNUSABLE = 13,
   WAIT_TRANS_END_FOR_UNUSABLE = 14,
   DROP_SCHEMA = 15,
   FAIL = 99,
   SUCCESS = 100
   ```

3. If you cannot query the information about the DDL statement from the `__all_virtual_ddl_task_status` table, the RootService thread for scheduling the DDL task is probably stuck.

   Execute the following statement to query the trace ID:

   ```sql
   select * from gv$ob_sql_audit where query_sql like '%keyword in the DDL statement%';
   ```

   Filter the logs on the RootService leader based on the trace ID.

   ```sql
   grep $trace_id rootservice.log | grep "DDLQueueTh" | grep "\[DDL]" 
   ```

   If the `6005` or `4023` error code related to table locks is returned in the log, confirm whether the issue is caused by lock contention of the `DROP` or `TRUNCATE` operation, or submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

   If the `4012` or `4121` error code related to RPC is returned in the log, query information as follows:

    ```sql
    # Query RootService DDL requests that consume more than 100 ms
    grep "DDLQueueTh" rootservice.log | grep "\[DDL]" | grep "cost=[0-9]\{6\}"

    # Query RootService DDL requests that consume more than 1s
    grep "DDLQueueTh" rootservice.log | grep "\[DDL]" | grep "cost=[0-9]\{7\}"
    
    # Query RootService DDL requests that consume more than 10s
    grep "DDLQueueTh" rootservice.log | grep "\[DDL]" | grep "cost=[0-9]\{8\}"
    ```

    If the DDL statement takes a long time to execute and you cannot query it from the `__all_virtual_ddl_task_status` table based on the trace ID, it is probably that the business load is heavy. You can try to reduce the load to resolve the issue. If the DDL statement takes a short time to execute and the execution time is stable, we recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website and provide the information collected for assistance.

### Troubleshoot database initialization failures

When you start OceanBase Database for the first time after deployment, a bootstrap is performed to initialize the database. This action is performed only once. If the bootstrap times out due to improper resource parameter settings or poor server performance, the initialization will fail. In this case, you must reinstall OceanBase Database. If you are not sure about the initialization failure cause, reinstallation cannot resolve the issue but will affect user experience. This section describes how to troubleshoot a database initialization failure.

**Symptom**: The bootstrap fails.

**Troubleshooting**:

When the bootstrap fails, you only need to check the earliest observer.log file, regardless of the tool that you use to deploy OceanBase Database. During initialization, the observer process does not exit and will print a large amount of process logs. As a result, earlier logs will be overwritten, thereby distracting the troubleshooting. Therefore, you need to use the keywords related to database startup to locate the required logs.

1. Check logs at the `ERROR` level. When initialization fails, `ERROR` logs are recorded. If a large number of `ERROR` logs exist, you can search for the keyword `Unexpected internal error happen`. However, this keyword cannot directly show the cause of the initialization failure. You still need to check related `WARN` and `WDIAG` logs. Here is an example:

   ```shell
   Unexpected internal error happen, please checkout the internal errcode
   ```

2. If the system logs generated during initialization are overwritten and you cannot identify the cause based on logs generated later, you need to reinstall the database, use the keyword `begin server limit report` to locate the startup log, and check the `WARN`, `WDIAG`, and `ERROR` logs that follow this log. Here is an example:

   ```shell
  
   [2024-04-11 21:32:57.748844] INFO  print_all_limits (main.cpp:368) [43378][observer][T0][Y0-0000000000000000-0-0] [lt=6] ============= *begin server limit report * =============
   ```



For example, if you set `memory_limit` to `30G` and `system_memory` to `30G` when you deploy OceanBase Database by using OceanBase Deployer (OBD), the deployment will surely fail. Since OBD performs a precheck on parameters, you can find a `WARN` log followed by an `ERROR` log indicating a startup failure.

```bash
obd cluster start lzq1 
Get local repositories ok
Search plugins ok
Load cluster param plugin ok
Open ssh connection ok
Check before start observer ok
[WARN] obd-2010: (10.10.10.1): system_memory too large. system_memory should be less than 0.75 * memory_limit/memory_limit_percentage.

Start observer ok
observer program health check x
[WARN] obd-2002: Failed to start 10.10.10.1 observer
[ERROR] oceanbase-ce start failed
See https://www.oceanbase.com/product/ob-deployer/error-codes .
Trace ID: 12b798b0-fa48-11ee-8a58-00163e046d79
If you want to view detailed obd logs, please run: obd display-trace 12b798b0-fa48-11ee-8a58-00163e046d79
```

At this time, the observer process is absent. The logs are as follows:

```bash
# The earliest `ERROR` log in the observer.log file reports the error message "update observer memory config failed", indicating that the memory configuration is abnormal.
[2024-04-14 18:16:37.849976] ERROR issue_dba_error (ob_log.cpp:1868) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=18][errcode=-4388] Unexpected internal error happen, please checkout the internal errcode(errcode=-4147, file="ob_server_config.cpp", line_no=365, info="update observer memory config failed")
[2024-04-14 18:16:37.849983] EDIAG [SHARE.CONFIG] reload_config (ob_server_config.cpp:365) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=7][errcode=-4147] update observer memory config failed(memory_limit=32212254720, system_memory=32212254720, hidden_sys_memory=12079595520, min_server_avail_memory=2147483648) BACKTRACE:0x113b8115 0x6ad98b0 0x6ad9471 0x6ad90ec 0x6ad8ee5 0xf2e7697 0xf2e70c8 0x9cd0a93 0x9cc6c55 0x6ab20e4 0x7ff08e478445 0x4e56560
[2024-04-14 18:16:37.850043] WDIAG [SHARE.CONFIG] reload_config (ob_server_config.cpp:377) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=57][errcode=-4147] the hold memory of tenant_500 is over the reserved memory(tenant_500_hold=6291456, tenant_500_reserved=0)
[2024-04-14 18:16:37.850052] ERROR issue_dba_error (ob_log.cpp:1868) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=5][errcode=-4388] Unexpected internal error happen, please checkout the internal errcode(errcode=-4147, file="ob_server.cpp", line_no=1886, info="reload memory config failed")

# According to the following logs, the sys tenant created adaptively can apply for 2 GB to 12 GB of memory. After 32 GB of system memory is applied for, the remaining memory space is insufficient to support a 2 GB memory application of the sys tenant, which causes the initialization failure.
memory_limit=32212254720, system_memory=32212254720, hidden_sys_memory=12079595520, min_server_avail_memory=2147483648)
```

### Troubleshoot database initialization failures

When you start OceanBase Database for the first time after deployment, a bootstrap is performed to initialize the database. This action is performed only once. If the bootstrap times out due to improper resource parameter settings or poor server performance, the initialization will fail. In this case, you must reinstall OceanBase Database. If you are not sure about the initialization failure cause, reinstallation cannot resolve the issue but will affect user experience. This section describes how to troubleshoot a database initialization failure.

**Symptom**: The bootstrap fails.

**Troubleshooting**:

When the bootstrap fails, you only need to check the earliest observer.log file, regardless of the tool that you use to deploy OceanBase Database. During initialization, the observer process does not exit and will print a large amount of process logs. As a result, earlier logs will be overwritten, thereby distracting the troubleshooting. Therefore, you need to use the keywords related to database startup to locate the required logs.

1. Check logs at the `ERROR` level. When initialization fails, `ERROR` logs are recorded. If a large number of `ERROR` logs exist, you can search for the keyword `Unexpected internal error happen`. However, this keyword cannot directly show the cause of the initialization failure. You still need to check related `WARN` and `WDIAG` logs. Here is an example:

   ```shell
   Unexpected internal error happen, please checkout the internal errcode
   ```

2. If the system logs generated during initialization are overwritten and you cannot identify the cause based on logs generated later, you need to reinstall the database, use the keyword `begin server limit report` to locate the startup log, and check the `WARN`, `WDIAG`, and `ERROR` logs that follow this log. Here is an example:

   ```shell
  
   [2024-04-11 21:32:57.748844] INFO  print_all_limits (main.cpp:368) [43378][observer][T0][Y0-0000000000000000-0-0] [lt=6] ============= *begin server limit report * =============
   ```



For example, if you set `memory_limit` to `30G` and `system_memory` to `30G` when you deploy OceanBase Database by using OceanBase Deployer (OBD), the deployment will surely fail. Since OBD performs a precheck on parameters, you can find a `WARN` log followed by an `ERROR` log indicating a startup failure.
```bash
obd cluster start lzq1 
Get local repositories ok
Search plugins ok
Load cluster param plugin ok
Open ssh connection ok
Check before start observer ok
[WARN] obd-2010: (10.10.10.1): system_memory too large. system_memory should be less than 0.75 * memory_limit/memory_limit_percentage.

Start observer ok
observer program health check x
[WARN] obd-2002: Failed to start 10.10.10.1 observer
[ERROR] oceanbase-ce start failed
See https://www.oceanbase.com/product/ob-deployer/error-codes .
Trace ID: 12b798b0-fa48-11ee-8a58-00163e046d79
If you want to view detailed obd logs, please run: obd display-trace 12b798b0-fa48-11ee-8a58-00163e046d79
```

At this time, the observer process is absent. The logs are as follows:

```bash
# The earliest `ERROR` log in the observer.log file reports the error message "update observer memory config failed", indicating that the memory configuration is abnormal.
[2024-04-14 18:16:37.849976] ERROR issue_dba_error (ob_log.cpp:1868) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=18][errcode=-4388] Unexpected internal error happen, please checkout the internal errcode(errcode=-4147, file="ob_server_config.cpp", line_no=365, info="update observer memory config failed")
[2024-04-14 18:16:37.849983] EDIAG [SHARE.CONFIG] reload_config (ob_server_config.cpp:365) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=7][errcode=-4147] update observer memory config failed(memory_limit=32212254720, system_memory=32212254720, hidden_sys_memory=12079595520, min_server_avail_memory=2147483648) BACKTRACE:0x113b8115 0x6ad98b0 0x6ad9471 0x6ad90ec 0x6ad8ee5 0xf2e7697 0xf2e70c8 0x9cd0a93 0x9cc6c55 0x6ab20e4 0x7ff08e478445 0x4e56560
[2024-04-14 18:16:37.850043] WDIAG [SHARE.CONFIG] reload_config (ob_server_config.cpp:377) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=57][errcode=-4147] the hold memory of tenant_500 is over the reserved memory(tenant_500_hold=6291456, tenant_500_reserved=0)
[2024-04-14 18:16:37.850052] ERROR issue_dba_error (ob_log.cpp:1868) [76016][observer][T0][Y0-0000000000000000-0-0] [lt=5][errcode=-4388] Unexpected internal error happen, please checkout the internal errcode(errcode=-4147, file="ob_server.cpp", line_no=1886, info="reload memory config failed")

# According to the following logs, the sys tenant created adaptively can apply for 2 GB to 12 GB of memory. After 32 GB of system memory is applied for, the remaining memory space is insufficient to support a 2 GB memory application of the sys tenant, which causes the initialization failure.
memory_limit=32212254720, system_memory=32212254720, hidden_sys_memory=12079595520, min_server_avail_memory=2147483648)
```

### Troubleshoot database upgrade failures based on logs

In essence, OceanBase Database is upgraded by using an OceanBase Database upgrade script, regardless of the tool that you use for the upgrade. Generally, OceanBase Database is upgraded by using OBD or OCP. When an upgrade fails, it is difficult to confirm the failure cause by checking the ODP or OCP logs. You need to check the logic based on the script. Actually, dedicated logs are generated for an upgrade script.

> **Note**
>
> For more information about the upgrade script, see **Step 1** in [Upgrade an OceanBase cluster](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106726).

**Symptom**: The upgrade of OceanBase Database by using OBD or OCP fails.

**Troubleshooting**:

* The upgrade of OceanBase Database by using OBD may fail in different phases. Logs are generated in the current directory where the OBD upgrade command is executed.

  * Failure in the `Exec upgrade_checker.py x` phase: You can run the `obd display-trace` command and identify the cause based on the output. If you cannot identify the cause based on the output, you can check the script log file `upgrade_checker.log`.  
  
  * Failure in the `Exec upgrade_pre.py x` phase: An upgrade usually fails in this phase. Generally, after you run the `obd display-trace` command, the failure cause provided in the output is not clear. Therefore, you need to check the script log file `upgrade_pre.log` to analyze the cause based on the actual situation.
  
  * Failure in the `Exec upgrade_health_checker.py x` phase: An upgrade hardly fails in this phase. You can check the log file `upgrade_cluster_health_checker.log` to analyze the failure cause.
  
  * Failure in the `Exec upgrade_post.py x` phase: An upgrade usually fails in this phase. You need to check the script log file `upgrade_post.log` to analyze the cause based on the actual situation.

> **Note**
>
> * If a timeout occurs during the upgrade of OceanBase Database by using OBD, you can run the OBD upgrade command again. At present, OBD allows you to upgrade the database again regardless of the phase in which the timeout occurs.
>  
> * If you cannot confirm the failure cause through self-service troubleshooting, we recommend that you collect related logs and submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

* The logic for upgrading OceanBase Database by using OCP is similar to that for upgrading OceanBase Database by using OBD. When you perform an upgrade with OCP, upgrade logs are generated and displayed on the GUI in real time. However, when the upgrade script fails, you also need to check the upgrade logs, which are stored in a different path with a different file name from those used for upgrading with OBD.
    * Log storage path: `/tmp/{version}/upgrade_*_{time}.log, such as /tmp/4.2.1.2-102000042023120514_upgrade_post_20240411101214.log`.
    * When an upgrade step fails, it is prohibited to skip the step or set the status of the step to successful. Some upgrade steps will modify related system parameters. If you skip a failed upgrade step, the cluster may become unavailable. We recommend that you collect related logs and submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

### Collect stack information when an OBServer node crashes

**Symptom**: A properly running OBServer node exits accidentally, and a core dump file is generated on the node.

**Troubleshooting**:

1. Run the following command to check whether the `CRASH ERROR` keyword is included in the logs generated by the OBServer node.

   ```bash
   [root@test001 ~]$ grep "CRASH ERROR" observer.log
   ```

   The output is as follows:

   ```shell
   CRASH ERROR!!! sig=6, sig_code=-6, sig_addr=3eb00000dbb, timestamp=1712828099270879, tid=4466, tname=ReplayEngine12, trace_id=0-0, extra_info=((null)),    lbt=0x9af40d8 0x9ae4978 0x7f74fdbdd62f 0x7f74fd42a377 0x7f74fd42ba67 0x9a28638 0x873cffa 0x8dd491f 0x8dd309b 0x8e6f22e 0x8b4e29c 0x8b4ac4b 0x8b48b04    0x9a69028 0x3426f0e 0x2cc7671 0x985e884 0x985d271 0x9859d2e
   ```

2. Check whether a core dump file is generated in the location specified by `kernel.core_pattern`, which is a parameter in the `sysctl.conf` file under the `/etc/` directory on the OBServer node.

   Query the location specified by `kernel.core_pattern`.

   ```bash
   [root@test001 ~]$ grep "kernel.core_pattern" /etc/sysctl.conf
   ```

   The output is as follows:

   ```shell
   kernel.core_pattern = /obdata/data/core-%e-%p-%t
   ```

   > **Note**
   >
   > If `kernel.core_pattern` is not specified, by default, a `core.${ob_pid}` file is generated in the home directory (`home_path`) of OceanBase Database.

   Check the core dump file.

   ```shell
   [root@test001 ~]$ ls -l /obdata/data/core*
   ```

   The output is as follows. If the core dump file is not generated, you can run the `ulimit -a` or `ulimit -c` command to view the current resource limits. If the value is `0` or small, no core dump file can be generated when the node crashes.

   ```shell
   -rw------- 1 admin admin 8723914752 April   8 19:04 /obdata/data/core-observer-27670-1712574296
   ```

3. Run the `addr2line` command to collect stack information.

   ```bash
   addr2line -pCfe ./bin/observer 0x9af40d8 0x9ae4978 0x7f74fdbdd62f 0x7f74fd42a377 0x7f74fd42ba67 0x9a28638 0x873cffa 0x8dd491f 0x8dd309b 0x8e6f22e 0x8b4e29c 0x8b4ac4b 0x8b48b04 0x9a69028 0x3426f0e 0x2cc7671 0x985e884 0x985d271
   ```

4. Submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website and provide the core dump file, stack information, and logs recorded near the failure time in the observer.log file for assistance.

You can also take the following emergency measures:

Generally, a core dump file is generated when the database system crashes due to an exception. After you collect or back up the information required for troubleshooting, you can try to manually restart the observer process to resolve the issue. When crashes frequently occur and the issue cannot be resolved through a restart, if the cluster is available, you can replace the faulty node or increase the time to wait before putting the node permanently offline. If the cluster is unavailable, you can restore data from backup files or switch to the physical standby database to resume business.

For more information about how to replace an OBServer node, see [Replace an OBServer node](https://en.oceanbase.com/docs/common-ocp-10000000001483764).

For more information about how to increase the time to wait before putting a node permanently offline, see [Failures of a minority of nodes](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103895).