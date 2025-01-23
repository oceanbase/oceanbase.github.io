---
title: Full Log/Data Disk
weight: 6
---

## Business and Database Symptoms


### Full data disk

OceanBase Cloud Platform (OCP) reports a data disk alert, such as the alert for [ob_host_data_path_disk_percent](https://en.oceanbase.com/docs/common-ocp-10000000001899685).

The business application reports an error. OBServer nodes may fail to perform minor compactions, major compactions, or memory release, resulting in a failure to write data to the cluster.

### Full log disk

OCP reports a log disk alert, such as [ob_host_log_disk_percent_over_threshold](https://en.oceanbase.com/docs/common-ocp-10000000001899703).

The business application reports an error. OBServer nodes may not function properly, affecting the election process.

> The methods described in the preceding topics are applicable when other programs generate a large amount of data in the log disk or data disk of an OBServer node. Do not manually delete log files or data files on OBServer nodes. Otherwise, the system may fail to be restored.

## Troubleshooting Approach

### Full data disk

Connect to the `oceanbase` database through the sys tenant and query information about the data disk usage of each node in the cluster, including the total allocated size, occupied size, and remaining size.

```
SELECT b.zone, a.svr_ip, a.svr_port,
        ROUND(a.total_size/1024/1024/1024,3) total_size_GB,
        ROUND((a.total_size-a.free_size)/1024/1024/1024,3) used_size_GB,
        ROUND(a.free_size/1024/1024/1024,3) free_size_GB,
        ROUND((a.total_size-a.free_size)/total_size,2)*100 disk_used_percentage
FROM oceanbase.__all_virtual_disk_stat a
INNER JOIN oceanbase.__all_server b
  ON a.svr_ip=b.svr_ip AND a.svr_port=b.svr_port
ORDER BY zone

*************************** 1. row ***************************
                zone: zone1
              svr_ip: 1.2.3.4
            svr_port: 22602
       total_size_GB: 8.000
        used_size_GB: 0.307
        free_size_GB: 7.693
disk_used_percentage: 4.00
```

If the `disk_used_percentage` value exceeds the default alert threshold, which is 97%, the alert reported by OCP is valid.


### Full log disk

> The issue of a full log disk rarely occurs because expired logs are recycled.

Check whether the alert reported by OCP is valid on the affected node. The cluster and host information for the node can be found in the alert.

Log in to the sys tenant and connect to the `oceanbase` database. Run the following command to check whether the log disk usage in a tenant exceeds the threshold.

```
select a.svr_ip,a.svr_port,a.tenant_id,b.tenant_name,
    CAST(a.data_disk_in_use/1024/1024/1024 as DECIMAL(15,2)) data_disk_use_G, 
    CAST(a.log_disk_size/1024/1024/1024 as DECIMAL(15,2)) log_disk_size, 
    CAST(a.log_disk_in_use/1024/1024/1024 as DECIMAL(15,2)) log_disk_use_G,
    log_disk_in_use/log_disk_size 'usage%'
from oceanbase.__all_virtual_unit a,dba_ob_tenants b 
where a.tenant_id=b.tenant_id\G

*************************** 1. row ***************************
         svr_ip: 1.2.3.4
       svr_port: 22602
      tenant_id: 1
    tenant_name: sys
data_disk_use_G: 0.10
  log_disk_size: 2.00
 log_disk_use_G: 1.54
         usage%: 0.7693
*************************** 2. row ***************************
         svr_ip: 1.2.3.4
       svr_port: 22602
      tenant_id: 1001
    tenant_name: META$1002
data_disk_use_G: 0.07
  log_disk_size: 0.60
 log_disk_use_G: 0.43
         usage%: 0.7174
*************************** 3. row ***************************
         svr_ip: 1.2.3.4
       svr_port: 22602
      tenant_id: 1002
    tenant_name: mysql
data_disk_use_G: 0.05
  log_disk_size: 5.40
 log_disk_use_G: 3.13
         usage%: 0.5789
```


## Troubleshooting Procedure

### Full data disk

#### Check whether the operating system disk that stores data files has enough remaining capacity for allocation.

If so, modify the cluster-level parameter [datafile_size](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715485) or [datafile_disk_percentage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715434) to increase the available capacity of the data disk for the database.

Run the following commands to check the values of the `datafile_size` and `datafile_disk_percentage` parameters:

```
show parameters like 'datafile_size'\G
*************************** 1. row ***************************
         zone: zone1
     svr_type: observer
       svr_ip: 1.2.3.4
     svr_port: 22602
         name: datafile_size
    data_type: CAPACITY
        value: 2G
         info: size of the data file. Range: [0, +∞)
      section: SSTABLE
        scope: CLUSTER
       source: DEFAULT
   edit_level: DYNAMIC_EFFECTIVE
default_value: 0M
    isdefault: 0
1 row in set (0.006 sec)
```

The default value of the `datafile_size` parameter is `0M`. If the default value is used, the available capacity of the data disk is controlled by the `datafile_disk_percentage` parameter.

```
show parameters like 'datafile_disk_percentage'\G
*************************** 1. row ***************************
         zone: zone1
     svr_type: observer
       svr_ip: 11.158.31.20
     svr_port: 22602
         name: datafile_disk_percentage
    data_type: INT
        value: 0
         info: the percentage of disk space used by the data files. Range: [0,99] in integer
      section: SSTABLE
        scope: CLUSTER
       source: DEFAULT
   edit_level: DYNAMIC_EFFECTIVE
default_value: 0
    isdefault: 1
1 row in set (0.006 sec)
```
The default value of the `datafile_disk_percentage` parameter is `0`. If the default value is used, the system automatically calculates the percentage of the total disk space occupied by the data file in Shared-Nothing (SN) mode or local cache in Shared-Storage (SS) mode based on whether the logs and data share the same disk.
- If the same disk is shared, the percentage of the total disk space occupied by data files or local cache is 60%.
- If the disk is not shared, the percentage of the total disk space occupied by data files or local cache is 90%.
If this parameter and the `datafile_size` parameter are both specified, the value of the `datafile_size` parameter prevails.

Run the following commands to set the parameters to greater values:

```
-- Set the size of the data file to 80 GB.
obclient> ALTER SYSTEM SET datafile_size = '80G';

-- Alternatively, set the percentage of the total disk space occupied by the data file to 95%.
obclient> ALTER SYSTEM SET datafile_disk_percentage = 90;
```

**<font color="red">OceanBase Database supports auto scale-out of disk space available for data files based on the actual situation. We recommend that you set the `datafile_next` and `datafile_maxsize` parameters for auto scale-out when you deploy a cluster. For more information, see [Configure automatic scale-out of disk space for data files](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714935). </font>**

**<font color="red">In a production environment, we recommend that the size of the log disk be at least three times the memory size of the host. To avoid I/O performance issues, we recommend that you mount the data directory and the log directory to different disks. </font>**


#### If the system disk has no remaining capacity for allocation, add nodes to the zone and migrate resource units to evenly distribute data across nodes.

You can perform GUI-based operations in OCP to add nodes to the zone and migrate resource units. For more information, see [Migrate a resource unit from an OceanBase Database tenant](https://en.oceanbase.com/docs/common-ocp-10000000001899145).

If an OBServer node hosts resource units of multiple tenants, migrate the resource units to evenly distribute data across nodes.

If an OBServer node hosts only one user tenant, purge the recycle bin to delete redundant data.


### Full log disk

Check whether the log disk of the cluster has remaining capacity for allocation. If the value of the `log_disk_free` parameter is 0, the log disk has no remaining capacity for allocation.
```
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
from gv$ob_servers\G
*************************** 1. row ***************************
             zone: zone1
         observer: 11.158.31.20:22602
        cpu_total: 8
     cpu_assigned: 4
         cpu_free: 4
     memory_total: 8.00
    system_memory: 1.00
     mem_assigned: 3.00
      memory_free: 4.00
log_disk_capacity: 21.00
log_disk_assigned: 8.00
    log_disk_free: 13.00
        data_disk: 8.00
   data_disk_used: 0.27
   data_disk_free: 7.73
1 row in set (0.006 sec)
```

If the value of the `log_disk_free` parameter is not 0, the log disk has remaining capacity for allocation. In this case, you can set the log disk size to a greater value for the resource unit of the tenant.
```
ALTER RESOURCE UNIT unit_name LOG_DISK_SIZE = '10G';
```

If the value of the `log_disk_free` parameter is 0, the log disk space allocated to the cluster is used up. You can run the ``df -h`` command to check whether all the capacity of the disk to which the log directory of the node is mounted is allocated to the log directory.

If the disk has remaining capacity for allocation, you can modify the cluster-level parameter [log_disk_size](log_disk_https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715277) or [log_disk_percentage](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715452) to increase the log disk size available for the cluster. Then, run the ``ALTER RESOURCE UNIT`` command to increase the log disk size available for the tenant.

```
ALTER system SET log_disk_size = '40G';

ALTER system SET log_disk_percentage = 90;
```

If the operating system disk has no remaining capacity for allocation, stop the write operations to the abnormal tenant. Otherwise, the space temporarily released from the clog disk can be quickly used up again. At the same time, modify the [log_disk_utilization_limit_threshold](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715555) parameter to increase the threshold of the clog disk usage from 95% to 98%.
```
ALTER system SET log_disk_utilization_limit_threshold = 98;
```

Wait a period of time until clogs have been synchronized. The capacity is then automatically recycled by the database system and the cluster can be automatically restored.


## References

- [Quick Fixes for OceanBase Issues](https://open.oceanbase.com/blog/13250502949)

- [Emergency response](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714619)