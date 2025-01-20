---
title: 日志盘 / 数据盘写满
weight: 6
---

## 业务及数据库表现


### 数据盘满

收到 OCP 的数据盘告警，例如 [ob_host_data_path_disk_percent](https://www.oceanbase.com/docs/common-ocp-1000000001740702) 等。

业务报错，OBServer 可能无法转储、无法合并、内存无法释放，进而导致集群无法写入。

### 日志盘满

收到 OCP 的日志盘告警，例如 [ob_host_log_disk_percent_over_threshold](https://www.oceanbase.com/docs/common-ocp-1000000001740708) 等。

业务报错，OBServer 节点无法正常工作，影响选举。

> 上面两个官网链接的处理方法，前提是 “其它程序在 OceanBase 的 log 盘或者 data 盘产生了大量数据”。千万不要手动删除 OceanBase 的 log 文件和 data 文件，否则可能导致系统无法恢复。

## 排查方向

### 数据盘满

double check 一下 OCP 的告警是否属于误报：通过 sys 租户连 oceanbase 库，查看指定集群按节点统计数据盘的使用率情况，包含总分配大小、已使用大小、剩余可用大小等。

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

如果 disk_used_percentage 的值已经超过 OCP 告警的默认阈值（97%），可以确认告警无误。


### 日志盘满

> 因为过期日志会被回收，所以日志盘满的情况相对比较少见。

根据 OCP 告警中的集群和主机信息，在对应节点上进行 double check。

登录 sys 租户，连接 oceanbase 库，执行以下命令，查看是否存在某个租户的日志盘 usage 百分比出现异常。

```
select a.svr_ip,a.svr_port,a.tenant_id,b.tenant_name,
    CAST(a.data_disk_in_use/1024/1024/1024 as DECIMAL(15,2)) data_disk_use_G, 
    CAST(a.log_disk_size/1024/1024/1024 as DECIMAL(15,2)) log_disk_size, 
    CAST(a.log_disk_in_use/1024/1024/1024 as DECIMAL(15,2)) log_disk_use_G,
    log_disk_in_use/log_disk_size 'usage%'
from __all_virtual_unit a,dba_ob_tenants b 
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


## 应急流程

### 数据盘满

#### 首先检查存放数据盘的操作系统磁盘，是否还有空间可以分配。

如果有空间可以分配，考虑修改集群级别的配置项 [datafile_size](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576331) 或者 [datafile_disk_percentage](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576341)，增加数据库的数据盘可用空间大小。

通过如下命令确认 datafile_size 和 datafile_disk_percentage 的 value：

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

datafile_size 的默认值为 0M。当为默认值时，磁盘可用空间大小受 datafile_disk_percentage 配置项的影响。

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
datafile_disk_percentage 配置项的默认值也为 0。当为默认值时，系统会根据日志和数据是否共用同一磁盘来自动计算数据文件（ SN 模式）或本地缓存空间（SS 模式）占用其所在磁盘总空间的百分比：
- 共用时，数据文件或本地缓存空间占用其所在磁盘总空间的百分比为 60%。
- 独占时，数据文件或本地缓存空间占用其所在磁盘总空间的百分比为 90%。
该配置项与 datafile_size 同时配置时，以 datafile_size 设置的值为准。

通过以下命令调大配置项：

```
-- 设置数据文件的大小为 80G。
obclient> ALTER SYSTEM SET datafile_size = '80G';

-- 或者，设置数据文件占用其所在磁盘总空间的 95%。
obclient> ALTER SYSTEM SET datafile_disk_percentage = 90;
```

**<font color="red">OceanBase 数据库支持根据磁盘数据文件的实际使用情况来进行自动扩容，强烈推荐大家在部署集群时，通过 datafile_next 和 datafile_maxsize 这两个配置项来进行配置。详见官网文档中的[《配置磁盘数据文件的动态扩容》](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001574103)，亲测好用。</font>**

**<font color="red">大家在部署生产环境的集群时，为避免出现 IO 性能问题，推荐将数据目录和日志目录分别挂载到不同的磁盘上，并建议日志盘空间为主机内存空间的三倍以及以上。</font>**


#### 如果磁盘没有可用空间分配，则考虑在 zone 内添加新的节点，并通过迁移 Unit 的方式均衡节点间的数据分布。

在 zone 里添加节点，以及[迁移租户对应 unit](https://www.oceanbase.com/docs/common-ocp-1000000001739880) 的操作，都可以通过 OCP 白屏完成。

如果一个 OBServer 节点集中了多个租户的 unit，优先考虑通过手动迁移 Unit 的方式均衡数据。、

如果单节点内只有一个用户租户，则可以考虑通过清理回收站数据等方式，删除冗余数据。


### 日志盘满

检查集群的 log_disk 磁盘空间是否已经分配完，如果 log_disk_free 为 0，则表示已分配完。
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

如果 log_disk_free 不为 0，表示日志盘还有剩余空间，可以直接扩容该租户对应 unit 的 log_disk 大小。
```
ALTER RESOURCE UNIT unit_name LOG_DISK_SIZE = '10G';
```

如果 log_disk_free 为 0，说明为集群分配的日志盘已经用完。通过 ``df -h`` 等命令，检查节点上日志盘挂载的磁盘，是否已经全部分配给日志盘。

如果磁盘仍有剩余空间，可以修改集群级配置项 [log_disk_size](https://www.oceanbase.com/docs/community-observer-cn-10000000001879584) 或者 [log_disk_percentage](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576237)，增加集群的可用日志盘大小，然后再通过上面 ``ALTER RESOURCE UNIT`` 的命令，增加对应租户的日志盘大小。

```
ALTER system SET log_disk_size = '40G';

ALTER system SET log_disk_percentage = 90;
```

如果操作系统上的磁盘也已经被分配完，则主动停止问题租户的写入，防止 clog 盘临时腾挪的空间再次快速被业务写入打满。停写的同时，临时调大 clog 盘停写的阈值比例 [log_disk_utilization_limit_threshold](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576167)，由 95% 调整到 98%。
```
ALTER system SET log_disk_utilization_limit_threshold = 98;
```

后续可以观察一段时间，clog 追上之后，空间会被数据库系统自动回收，集群可以自动恢复。


## 参考

- 社区博客[《OceanBase 应急三板斧》](https://open.oceanbase.com/blog/13250502949)

- 官网文档中的[应急处理相关内容](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001573632)