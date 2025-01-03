---
title: 参数模板
weight: 1
---

> 参数模板这个需求源自于一些做微服务的客户。客户的业务场景是 SaaS 平台，集群中会有大量相同业务的租户，但是每创建一个租户都需要单独设置一批租户参数。在 SaaS 业务中，尤其是在存在大量租户的场景下，设置租户参数的工作量会非常大。
>
> 同时，我们也不断收到很多其他用户提出的类似诉求，用户普遍希望 OceanBase 能够根据不同的业务场景，提供一个一键适配的 best practice 参数配置。用户只需设置集群或者租户的业务场景，系统就会自动对各种参数进行调优，以适配不同的场景。
>
> OceanBase 最近根据用户提出的这两类需求，为大家提供了一个 “参数模板” 的功能。通过 OCP 或 OBD 创建集群和租户时，会针对不同的业务场景，做出不同参数优化，提供更加合适的默认参数。


## 背景
最近一段时间接触了一些 OceanBase 社区版的用户，发现大家的使用场景多种多样，但 OceanBase 的默认参数/配置项并不是适用所有场景，不同的使用场景往往有不同的参数设置最佳实践。例如 ob_query_timeout 默认是 10s，对于简单 OLTP 场景可能没问题，但对于 OLAP 类业务，尤其是耗时极长的复杂查询来说，可能并不合适。

为了能够对不同使用场景的集群和租户，提供更加合适的默认参数，OceanBase 近期提供了一个 “参数模板” 的功能，这两天试用了下，在这里简单做一个记录，供大家参考。

我自己测试过程中使用的 OBServer 社区版版本号是 4.3.2.1， OCP 社区版版本号是 4.3.1。**推荐大家使用的 OCP 社区版版本号是 4.3.2 及以上版本，修复了一些已知问题，参数模板功能会更加完善。**

## 检查参数模板的配置文件
在 OceanBase 的 OBServer 源码中，会维护若干种场景的配置项和参数默认值，并通过 RPM 包输出。用户在 OCP 中上传 OB 4.3 及以上版本的软件包时，OCP 后台会自动解析软件包中的配置文件，保存到集群/租户参数模板中。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/001.png)

解析配置文件并保存到特定的 meta 表中，可能需要一分钟左右，大家如果在 OCP 界面一直看不到参数模板的各种选项，可以确认 OCP 是否完成参数模板配置解析。步骤如下：

1. 在 OCP 的 **租户 - 租户管理** 中复制 ocp_meta 租户的登录连接串

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/002.png)

2. 通过刚刚复制的连接串，登录相应的 OBServer 节点中的 ocp_meta 租户。

```sql
[xiaofeng.lby@obvos-dev-d3 /home/xiaofeng.lby]
$mysql -h1.2.3.4 -P2881 -u root@ocp_meta -p YourPassword

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 3221740061
Server version: 5.7.25 OceanBase_CE 4.2.1.2
Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```

3. 场景参数模板属于后台参数模板，虽然直接在参数模板页面看不到，但可以从 metadb 中确认是否存在。

```sql
MySQL [(none)]> use meta_database;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A
Database changed

-- 查看集群级别的参数模板种类。这里只是示例，大家可以删除 limit 1 后执行。
MySQL [meta_database]> select * from meta_database.ob_cluster_parameter_template where `group` = 'scenario' limit 1 \G
*************************** 1. row ***************************
             id: 1001
    create_time: 2024-09-20 14:28:09
    update_time: 2024-09-20 14:28:09
           name: cluster parameter template for scenario HTAP, version 4.3.2.1-100000102024081217
     creator_id: 200
    modifier_id: 200
    description: cluster parameter template for scenario HTAP, version 4.3.2.1-100000102024081217
       built_in: 0
extra_data_json: {"fullVersion":"4.3.2.1-100000102024081217","scenario":"HTAP"}
          group: scenario
1 row in set (0.04 sec)

-- 查看租户级别的参数模板种类。这里只是示例，大家可以删除 limit 1 后执行。
MySQL [meta_database]> select * from meta_database.ob_tenant_parameter_template where `group` = 'scenario' limit 1 \G
*************************** 1. row ***************************
             id: 1001
    create_time: 2024-09-20 14:28:09
    update_time: 2024-09-20 14:28:09
           name: tenant parameter template for scenario HTAP, version 4.3.2.1-100000102024081217
     creator_id: 200
    modifier_id: 200
    description: tenant parameter template for scenario HTAP, version 4.3.2.1-100000102024081217
compatible_type: ALL
       built_in: 0
extra_data_json: {"fullVersion":"4.3.2.1-100000102024081217","scenario":"HTAP"}
          group: scenario
1 row in set (0.04 sec)
```



## 设置集群级的参数模板
用户在创建 4.3 及以上版本集群时，根据真实使用场景，可以选择以下几种场景参数模板。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/003.png)

步骤比较简单，在 OCP 中的 **创建集群** 页面，配置集群参数时，可以使用默认参数配置，也可以打开 **参数配置** 模块，并配置集群参数：

+ 可以逐个添加启动参数项并为其配置值。
+ 也可以单击 **参数模板**，然后选择一个参数模板，系统会将模板中的参数连同配置自动填充到此处。

测试使用的 OBServer 社区版 4.3.2.1 目前提供了 5 种内置参数模板，官网上的具体说明如下：

| 模板 | 说明 |
| --- | --- |
| HTAP 默认参数模板 | 适用于混合 OLAP 和 OLTP 工作负载。通常用于从活动运营数据、欺诈检测和个性化建议中获取即时见解。   该模板适用于 OceanBase V4.3.0 及以上版本。 |
| OLAP 默认参数模板 | 用于实时数据仓库分析场景。   该模板适用于 OceanBase V4.3.0 及以上版本。 |
| COMPLEX_OLTP 默认参数模板 | 适用于银行、保险系统等工作负载。他们通常具有复杂的联接、复杂的相关子查询、用 PL 编写的批处理作业，以及长事务和大事务。有时对短时间运行的查询使用并行执行。   该模板适用于 OceanBase V4.3.0 及以上版本。 |
| KV 默认参数模板 | 用于键值工作负载和类似 hbase 的宽列工作负载，这些工作负载通常具有非常高的吞吐量并且对延迟敏感。   该模板适用于 OceanBase V4.3.0 及以上版本。 |
| 2.2.77 默认参数模板 | OceanBase 集群 V2.2.77 版本推荐使用的参数设置，供生产环境使用。 |


## 设置租户级的参数模板
![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/004.png)

步骤同样比较简单，在 **OCP 的 租户 - 新建租户** 界面中，打开 **参数配置** 模块，并配置租户参数：

+ 可以逐个添加启动参数项并为其配置值。
+ 也可以单击 **参数模板**，选择一个参数模板，系统会将模板中的参数连同配置自动填充到此处。



## 遇到的问题及解决方法（OCP 4.3.2 社区版已修复）
在试用过程中，遇到了一个小 BUG：在通过 OLAP 参数模板来创建租户时，由于 OCP 记录的部分元数据信息有误，导致误判断了个别参数的类型，导致租户创建失败（创建集群，以及通过除 OLAP 以外的参数模板创建租户，均不会触发这个 BUG）。报错信息如下：

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/005.png)

OCP 的同学表示这个是已知问题，在 OCP 4.3.2 社区版中会被修复。如果使用的是更早的版本，可以先通过在选择 OLAP 参数模板后，临时删除这几个没显示取值类型的参数（即图中的 parallel_degree_policy、_io_read_batch_size、_io_read_redundant_limit_percentage）。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/006.png)

租户创建好之后，手动去 **租户 - 参数管理** 中对这三个参数进行设置即可。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/007.png)

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/01_parameter_templates/008.png)



## 不同模板参数的性能测试
### 典型用户生产环境介绍
君野大佬帮忙对几种不同的模板参数，在代表不同场景的 benchmark 中进行了测试。在展示测试结果之前，先简单介绍下 OceanBase 社区版当前的 5 种典型用户生产环境：

+ express_oltp：互联网应用，简单的 CRUD SQL，大量点查，高并发
+ complex_oltp：传统行业应用，有复杂查询，大量 PL 和批作业
+ olap：在线分析处理和数仓
    - 典型负载：导入 -> 转换 -> 查询 -> 报表
        * 轻量：
            + ELT 而不是 ETL；
            + 使用 SQL 做数据转换；使用物化视图做实时加速；使用 SQL 做实时查询
            + 周边依赖简单轻量（无或少外部依赖）
    - 性能指标：响应时间秒级到小时级
    - 数据规模：100 TB
    - 数据模型：star-schema 多表关联；宽表多维 ad-hoc 查询
    - 读写模式：读多写少；写入为批量写入、update 少；查询种数少、查询并发低；查询以大范围扫描为主
    - 代表 benchmark：TPC-DS, TPC-H, ClickBench, SSB
    - 应用场景：实时数仓；营销分析；汇聚分析；Ad-hoc 查询；
+ htap：TP 增强混合负载
    - 实时轻量级报表
        * 典型负载：在线事务写入->批作业->实时报表
        * 代表 benchmark：TPC-C + TPC-H, hybench
        * 分析数据规模：10TB
        * 性能指标：分析型查询响应时间亚秒级
        * 数据模型：大多按照关系模型范式设计
        * 读写模式：读多写多、读写并发都高；数据实时写入，包括事务型小数据量高并发写入和批量大事务写入；读包括事务型短查询和分析型大查询；
        * 应用场景：BI 报表；替换 “分库分表 + 汇聚库” 双库；Ad-hoc 查询；实时风控
    - 准实时决策分析
        * 典型负载：高并发在线交易 + 大规模实时数据分析
        * 分析数据规模：100TB
        * 性能指标：分析型查询响应时间压秒级到小时级
        * 数据模型：大多按照关系模型范式设计
        * 读写模式：读多写多、读写并发都高；数据实时写入，包括事务型小数据量高并发写入和批量大事务写入；读包括事务型短查询和分析型大查询，可以在应用端分离开；分析型查询允许数据稍旧；
        * 代表benchmark：TPC-C + TPC-DS，TPC-C + ClickBench
        * 应用场景：BI 报表；替换 “分库分表 + 汇聚库” 双库；Ad-hoc 查询；
+ kv：OBKV 接口定义的 HBase 兼容和 Key-Value 表模型访问模式，单分区访问，无 SQL 层。

### 各场景模板参数的默认值
+ 系统变量：详见 [github 链接](https://github.com/oceanbase/oceanbase/blob/4.3.3/src/share/system_variable/default_system_variable.json)。
+ 配置项：[详见 github 链接](https://github.com/oceanbase/oceanbase/blob/4.3.3/src/share/parameter/default_parameter.json)。

### 测试环境
#### 测试版本
+ observer : 4.3.2 社区版
+ obproxy : 4.2.3 社区版

##### 硬件环境
+ observer 3 台 32c256g，机型为 [ecs.r7.8xlarge](https://help.aliyun.com/zh/ecs/user-guide/overview-of-instance-families#9e4ed29e73q6z)，日志盘使用系统盘，clog 和 data 盘单独挂载两块云盘，磁盘性能级别为 PL1。
+ obproxy 单独部署在一台 64c128g [ecs.c7.16xlarge](https://help.aliyun.com/document_detail/25378.html#c7)。

##### 操作系统
操作系统为 CentOS 7.9 64位

```shell
echo "vm.max_map_count=655360" >> /etc/sysctl.conf; sysctl -p (obd启动检查项)
sudo sysctl -w kernel.sched_migration_cost_ns=0 （对标公有云内核参数优化）
```

##### 租户规格
28c180g，3F，primary_zone=RANDOM

```shell
## 命令中的 scenario 取值为 express_oltp、complex_oltp、olap、htap、kv
obd cluster tenant create perf --max-cpu=28 --memory-size=180G -n mysql_tenant -o ${scenario}
```

##### 部署配置文件
```sql
oceanbase-ce:
  version: 4.3.2.0
  servers:
    - name: server1
      ip: 略
    - name: server2
      ip: 略
    - name: server3
      ip: 略
  global:
    scenario: ${scenario}
    home_path: /root/observer
    data_dir: /data/1/storage
    redo_dir: /data/2/redo
    devname: eth0
    memory_limit: 240G
    log_disk_size: 700G
    datafile_disk_percentage: 93
    root_password: 123456
    mysql_port: 2881
    rpc_port: 2882
  server1:
    zone: zone1
  server2:
    zone: zone2
  server3:
    zone: zone3
obproxy-ce:
  version: 4.2.3.0
  depends:
    - oceanbase-ce
  servers:
    - 略
  global:
    listen_port: 2886 ## External port. The default value is 2883.
    home_path: /root/obproxy
    enable_cluster_checkout: false
    skip_proxy_sys_private_check: true
    enable_strict_kernel_release: false
```

### 调参说明
性能数据基于各租户类型默认调参 + 各 workload 基础调参

#### workload 基础调参
sysbench

```sql
ALTER system SET enable_sql_audit=false;
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

tpcc

```sql
#proxy
ALTER proxyconfig SET proxy_mem_limited='4G';
ALTER proxyconfig set enable_compression_protocol=false;

#sys
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

tpch

```sql
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#测试租户
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

tpcds

```sql
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#测试租户
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

### 测试数据
#### sysbench
**调参**

```yaml
ALTER system SET enable_sql_audit=false;
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

**测试命令**

使用 obd 封装的原生 sysbench 压测流程，obd 使用的 ob-sysbench 依赖 libobclient，这里在环境中执行 export ENABLE_PROTOCOL_OB20=0，关闭 v2 协议，与原生 sysbench 保持一致

```sql
obd test sysbench rn --tenant=perf --script-name=xxx.lua --table-size=1000000 --threads=xx  --report-interval=1 --rand-type=uniform --time=30 --db-ps-mode=disable 
```



**测试数据 (QPS/95%rt)**

**Point Select 性能**

| Threads | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 163457.60/0.22 | 162747.70/0.22 | 161428.80/0.23 | 162948.95/0.20 | 163204.29/0.20 |
| 64 | 296206.41/0.25 | 291823.36/0.26 | 291583.48/0.26 | 293622.63/0.25 | 295541.97/0.25 |
| 128 | 505203.80/0.30 | 493859.95/0.31 | 492135.78/0.31 | 498132.19/0.31 | 505266.56/0.30 |
| 256 | 798005.94/0.45 | 794547.97/0.47 | 803165.10/0.49 | 797304.31/0.45 | 794627.82/0.45 |
| 512 | 1039286.05/0.90 | 1023822.11/1.14 | 1022666.33/1.12 | 1032713.76/0.90 | 1016045.20/0.92 |
| 1024 | 1013992.61/2.39 | 1011295.14/2.39 | 997362.00/2.57 | 1004848.34/2.48 | 990136.68/2.52 |


**Read Only 性能**

| Threads | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 134791.19/4.10 | 136145.15/3.97 | 137486.55/3.96 | 137327.53/3.95 | 137750.08/3.96 |
| 64 | 244754.37/4.49 | 244093.17/4.57 | 244641.01/4.57 | 244586.46/4.57 | 247914.45/4.49 |
| 128 | 416929.45/5.37 | 420143.73/5.47 | 419772.35/5.28 | 420445.05/5.28 | 421381.09/5.28 |
| 256 | 613453.13/7.56 | 611436.43/8.28 | 603989.96/8.28 | 610998.14/7.43 | 607015.73/8.13 |
| 512 | 725364.76/16.12 | 738362.91/17.65 | 736059.64/15.83 | 720899.31/16.12 | 693449.90/26.20 |
| 1024 | 715777.22/41.10 | 707831.35/42.61 | 697077.19/44.17 | 706809.11/42.61 | 699619.03/44.83 |


**Write Only 性能**

| Threads | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 50914.06/5.00 | 52894.62/4.91 | 50589.47/5.67 | 52088.46/4.74 | 54033.87/4.41 |
| 64 | 90119.99/5.47 | 93447.67/5.37 | 90202.65/5.37 | 90264.56/5.57 | 94874.07/5.00 |
| 128 | 164488.33/5.77 | 166099.69/5.57 | 159493.96/5.99 | 159005.24/6.09 | 162650.65/5.57 |
| 256 | 242240.38/8.13 | 241749.01/8.43 | 232320.85/8.43 | 230522.31/8.74 | 238971.17/7.84 |
| 512 | 304060.67/13.70 | 306416.65/13.70 | 299155.86/13.70 | 289147.63/13.95 | 301695.38/13.22 |
| 1024 | 345068.37/23.52 | 348929.05/26.20 | 306096.92/29.72 | 327905.15/27.17 | 313276.26/30.81 |


**Read Write 性能**

| Threads | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 90881.38/7.84 | 88141.94/8.28 | 88216.59/8.58 | 89948.44/7.98 | 90592.37/7.98 |
| 64 | 159748.46/8.90 | 160695.31/9.06 | 157714.41/10.09 | 157230.31/9.39 | 161391.32/8.90 |
| 128 | 273142.95/10.46 | 275431.02/10.27 | 272648.28/10.27 | 269700.79/11.24 | 275952.12/10.46 |
| 256 | 391348.85/15.27 | 402154.83/15.00 | 382679.53/16.71 | 383447.47/15.27 | 405787.34/14.46 |
| 512 | 465031.62/28.67 | 462574.18/33.72 | 466465.96/26.20 | 461249.29/27.66 | 464724.24/27.66 |
| 1024 | 525924.96/52.89 | 535977.26/48.34 | 510540.58/58.92 | 522066.61/51.02 | 521969.84/51.94 |


#### tpcc
**调参**

```yaml
#proxy
ALTER proxyconfig SET proxy_mem_limited='4G';
ALTER proxyconfig set enable_compression_protocol=false;

#sys
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

****

**测试命令**

使用 obd 封装的 tpcc 压测流程，详细流程见官网：[https://www.oceanbase.com/docs/common-oceanbase-database-0000000001954654](https://www.oceanbase.com/docs/common-oceanbase-database-0000000001954654)

```sql
obd test tpcc rn --tenant=perf --tmp-dir=/data/2/tpcc  --warehouses=1000 --load-workers=40 --terminals=800 --run-mins=5 -v -O 2
```

****

**测试数据**

|  | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| tpmC (NewOrders) | 292204.95 | 302608.69 | 264422.69 | 294316.6 | 286362.9 |
| tpmTOTAL | 648918.9 | 672866.36 | 587580.74 | 654271.82 | 636369.93 |
| Transaction Count | 3246324 | 3366013 | 2939166 | 3272514 | 3183132 |


#### tpch
**调参**

```yaml
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#测试租户
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

****

**测试命令**

使用 obd 封装的 tpch 压测流程，详细流程见官网：[https://www.oceanbase.com/docs/common-oceanbase-database-0000000001953497](https://www.oceanbase.com/docs/common-oceanbase-database-0000000001953497)

```sql
obd test tpch rn --user=root --test-server=server1 --tmp-dir=/data/2/ob   --tenant=perf --remote-tbl-dir=/home/admin -s 100
```

**测试数据（均使用列存表）**

|  | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Q1 | 32.33s | 9.86s | 1.83s | 3.03s | 1.90s |
| Q2 | 1.42s | 0.52s | 0.22s | 0.26s | 0.22s |
| Q3 | 7.79s | 2.58s | 0.52s | 0.91s | 0.54s |
| Q4 | 9.55s | 3.01s | 0.27s | 0.66s | 0.27s |
| Q5 | 15.77s | 4.59s | 0.73s | 1.29s | 0.70s |
| Q6 | 0.25s | 0.11s | 0.06s | 0.06s | 0.05s |
| Q7 | 9.76s | 3.65s | 1.19s | 1.76s | 1.18s |
| Q8 | 5.72s | 1.85s | 0.39s | 0.61s | 0.38s |
| Q9 | 25.26s | 8.93s | 1.88s | 3.28s | 1.88s |
| Q10 | 3.96s | 1.74s | 0.46s | 0.75s | 0.46s |
| Q11 | 2.01s | 0.61s | 0.14s | 0.21s | 0.13s |
| Q12 | 6.00s | 1.89s | 0.33s | 0.66s | 0.39s |
| Q13 | 8.40s | 3.43s | 1.64s | 1.94s | 1.64s |
| Q14 | 0.99s | 0.45s | 0.19s | 0.25s | 0.19s |
| Q15 | 1.29s | 0.64s | 0.31s | 0.34s | 0.31s |
| Q16 | 2.69s | 1.07s | 0.53s | 0.61s | 0.51s |
| Q17 | 3.85s | 1.15s | 0.21s | 0.31s | 0.20s |
| Q18 | 17.53s | 5.51s | 1.33s | 1.96s | 1.27s |
| Q19 | 1.49s | 0.60s | 0.24s | 0.31s | 0.23s |
| Q20 | 6.02s | 2.38s | 1.33s | 1.33s | 1.30s |
| Q21 | 26.01s | 9.11s | 2.70s | 3.60s | 2.74s |
| Q22 | 6.01s | 2.23s | 0.79s | 1.00s | 0.78s |
| Total | 194.10s | 65.91s | 17.26s | 25.13s | 17.28s |


#### tpcds
**调参**

```yaml
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#测试租户
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

****

**测试命令**

数据量为 100G，测试流程详见：[https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000931730](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000931730)



**测试数据（均使用列存表）**

| Query | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| Q1 | 0.62 | 0.33 | 0.21 | 0.21 | 0.20 |
| Q2 | 10.19 | 3.29 | 0.99 | 1.26 | 0.99 |
| Q3 | 0.20 | 0.13 | 0.11 | 0.11 | 0.11 |
| Q4 | 36.42 | 17.89 | 11.29 | 11.90 | 11.39 |
| Q5 | 3.95 | 1.79 | 0.98 | 1.11 | 1.00 |
| Q6 | 0.55 | 0.31 | 0.22 | 0.23 | 0.32 |
| Q7 | 0.81 | 0.38 | 0.19 | 0.21 | 0.29 |
| Q8 | 0.55 | 0.32 | 0.24 | 0.24 | 0.22 |
| Q9 | 2.15 | 0.95 | 0.47 | 0.51 | 0.48 |
| Q10 | 1.81 | 0.85 | 0.52 | 0.54 | 0.50 |
| Q11 | 22.09 | 10.94 | 7.09 | 7.35 | 7.13 |
| Q12 | 0.47 | 0.29 | 0.22 | 0.24 | 0.23 |
| Q13 | 0.53 | 0.27 | 0.18 | 0.19 | 0.19 |
| Q14 | 81.19 | 26.90 | 7.86 | 10.40 | 8.01 |
| Q15 | 0.71 | 0.43 | 0.38 | 0.39 | 0.39 |
| Q16 | 5.18 | 1.74 | 0.57 | 0.73 | 0.57 |
| Q17 | 1.26 | 0.64 | 0.39 | 0.44 | 0.41 |
| Q18 | 0.71 | 0.39 | 0.26 | 0.28 | 0.37 |
| Q19 | 0.30 | 0.20 | 0.15 | 0.16 | 0.16 |
| Q20 | 0.39 | 0.26 | 0.19 | 0.21 | 0.20 |
| Q21 | 0.99 | 0.39 | 0.16 | 0.20 | 0.17 |
| Q22 | 4.93 | 2.14 | 1.12 | 1.26 | 1.14 |
| Q23 | 92.37 | 34.42 | 13.27 | 16.41 | 13.41 |
| Q24 | 3.47 | 1.55 | 0.84 | 0.93 | 0.85 |
| Q25 | 1.14 | 0.59 | 0.41 | 0.43 | 0.40 |
| Q26 | 0.49 | 0.26 | 0.16 | 0.19 | 0.16 |
| Q27 | 1.14 | 0.54 | 0.31 | 0.33 | 0.31 |
| Q28 | 1.37 | 0.95 | 0.83 | 0.84 | 0.86 |
| Q29 | 3.94 | 1.34 | 0.46 | 0.56 | 0.45 |
| Q30 | 0.40 | 0.27 | 0.22 | 0.22 | 0.22 |
| Q31 | 2.37 | 1.08 | 0.60 | 0.67 | 0.59 |
| Q32 | 0.12 | 0.11 | 0.10 | 0.10 | 0.10 |
| Q33 | 1.21 | 0.87 | 0.63 | 0.66 | 0.62 |
| Q34 | 2.22 | 0.77 | 0.22 | 0.29 | 0.20 |
| Q35 | 3.57 | 1.51 | 0.76 | 0.85 | 0.72 |
| Q36 | 1.98 | 0.85 | 0.29 | 0.40 | 0.29 |
| Q37 | 0.52 | 0.32 | 0.23 | 0.24 | 0.23 |
| Q38 | 7.00 | 2.99 | 1.50 | 1.70 | 1.52 |
| Q39 | 2.98 | 1.31 | 0.72 | 0.81 | 0.71 |
| Q40 | 0.29 | 0.18 | 0.15 | 0.15 | 0.14 |
| Q41 | 0.04 | 0.04 | 0.04 | 0.03 | 0.04 |
| Q42 | 0.18 | 0.12 | 0.10 | 0.10 | 0.10 |
| Q43 | 3.89 | 1.43 | 0.47 | 0.60 | 0.47 |
| Q44 | 0.50 | 0.45 | 0.44 | 0.46 | 0.45 |
| Q45 | 0.47 | 0.37 | 0.35 | 0.36 | 0.35 |
| Q46 | 0.97 | 0.46 | 0.28 | 0.30 | 0.27 |
| Q47 | 5.12 | 2.11 | 0.99 | 1.11 | 0.98 |
| Q48 | 0.54 | 0.29 | 0.17 | 0.18 | 0.16 |
| Q49 | 1.25 | 0.96 | 0.84 | 0.85 | 0.82 |
| Q50 | 8.07 | 2.36 | 0.44 | 0.65 | 0.44 |
| Q51 | 22.35 | 7.02 | 2.81 | 3.04 | 2.83 |
| Q52 | 0.17 | 0.13 | 0.10 | 0.10 | 0.10 |
| Q53 | 1.56 | 0.52 | 0.17 | 0.20 | 0.16 |
| Q54 | 2.24 | 0.97 | 0.54 | 0.57 | 0.52 |
| Q55 | 0.14 | 0.11 | 0.10 | 0.10 | 0.10 |
| Q56 | 0.67 | 0.61 | 0.60 | 0.59 | 0.57 |
| Q57 | 2.88 | 1.29 | 0.66 | 0.74 | 0.67 |
| Q58 | 1.15 | 0.85 | 0.69 | 0.69 | 0.68 |
| Q59 | 18.73 | 6.56 | 2.10 | 2.64 | 2.04 |
| Q60 | 1.16 | 0.85 | 0.67 | 0.69 | 0.66 |
| Q61 | 0.41 | 0.33 | 0.29 | 0.29 | 0.29 |
| Q62 | 3.00 | 1.15 | 0.37 | 0.47 | 0.36 |
| Q63 | 1.57 | 0.52 | 0.16 | 0.20 | 0.16 |
| Q64 | 6.74 | 3.01 | 1.45 | 1.71 | 1.42 |
| Q65 | 4.18 | 1.66 | 0.73 | 0.86 | 0.70 |
| Q66 | 1.00 | 0.61 | 0.38 | 0.40 | 0.37 |
| Q67 | 21.56 | 13.49 | 10.43 | 10.28 | 10.44 |
| Q68 | 0.37 | 0.26 | 0.22 | 0.23 | 0.22 |
| Q69 | 1.23 | 0.66 | 0.48 | 0.50 | 0.47 |
| Q70 | 5.39 | 2.26 | 1.15 | 1.28 | 1.16 |
| Q71 | 1.20 | 0.67 | 0.42 | 0.45 | 0.40 |
| Q72 | 22.39 | 14.68 | 10.40 | 11.09 | 10.44 |
| Q73 | 0.63 | 0.32 | 0.17 | 0.20 | 0.17 |
| Q74 | 14.22 | 6.83 | 3.68 | 3.93 | 3.59 |
| Q75 | 6.72 | 2.80 | 1.42 | 1.55 | 1.39 |
| Q76 | 0.39 | 0.38 | 0.39 | 0.38 | 0.38 |
| Q77 | 1.39 | 0.88 | 0.73 | 0.72 | 0.70 |
| Q78 | 14.46 | 5.91 | 2.57 | 3.00 | 2.56 |
| Q79 | 2.66 | 1.17 | 0.48 | 0.56 | 0.48 |
| Q80 | 2.94 | 1.50 | 0.97 | 1.00 | 0.95 |
| Q81 | 0.63 | 0.29 | 0.16 | 0.18 | 0.16 |
| Q82 | 0.78 | 0.45 | 0.32 | 0.33 | 0.37 |
| Q83 | 1.14 | 0.75 | 0.58 | 0.59 | 0.58 |
| Q84 | 0.58 | 0.28 | 0.18 | 0.18 | 0.18 |
| Q85 | 0.71 | 0.45 | 0.36 | 0.36 | 0.36 |
| Q86 | 1.14 | 0.56 | 0.34 | 0.39 | 0.35 |
| Q87 | 7.29 | 3.04 | 1.59 | 1.72 | 1.57 |
| Q88 | 1.83 | 0.78 | 0.29 | 0.36 | 0.29 |
| Q89 | 1.78 | 0.72 | 0.23 | 0.32 | 0.24 |
| Q90 | 0.44 | 0.22 | 0.14 | 0.15 | 0.14 |
| Q91 | 0.14 | 0.11 | 0.10 | 0.10 | 0.10 |
| Q92 | 0.11 | 0.10 | 0.10 | 0.10 | 0.10 |
| Q93 | 7.68 | 2.24 | 0.47 | 0.64 | 0.47 |
| Q94 | 2.74 | 1.08 | 0.49 | 0.56 | 0.49 |
| Q95 | 39.75 | 18.00 | 6.97 | 8.23 | 6.72 |
| Q96 | 2.43 | 0.78 | 0.20 | 0.26 | 0.20 |
| Q97 | 7.34 | 2.64 | 1.01 | 1.22 | 1.04 |
| Q98 | 0.64 | 0.42 | 0.31 | 0.33 | 0.31 |
| Q99 | 6.00 | 2.16 | 0.68 | 0.80 | 0.65 |
| Total  | 570.64s | 242.76s | 119.88s | 134.26s | 119.98s |


### 总结
通过参数模板创建租户后，在代表相应场景的 benchmark 测试中性能提升效果很明显。参数模板这个功能，后续必定会在 OceanBase 的用户中逐渐普及开来，推荐大家一试~