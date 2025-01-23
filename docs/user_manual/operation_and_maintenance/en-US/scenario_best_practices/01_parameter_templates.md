---
title: Parameter Templates
weight: 1
---

> Parameter templates are required by microservice customers. These customers run their business on a software as a service (SaaS) platform. Tenants in the same cluster may run the same business. However, tenant parameters must be configured each time a tenant is created. In a SaaS-based business scenario with a large number of tenants, the workload in configuring tenant parameters is heavy.
>
> Other users also raise similar requirements. They hope that templates of recommended parameter settings can be provided for different business scenarios. After a business scenario is specified for a cluster or tenant, the system automatically tunes various parameters to adapt to the scenario.
>
> To meet these requirements, OceanBase Database provides the parameter template feature. For a cluster or tenant created by using OceanBase Cloud Platform (OCP) or OceanBase Deployer (obd), parameters and their default settings are tuned to cater to business needs in different scenarios.


## Background Information
I have recently come into contact with some users of OceanBase Database Community Edition and found that their application scenarios are diverse. However, the default parameter/variable settings provided by OceanBase Database do not apply to all scenarios. The recommended parameter/variable settings vary based on the application scenario. For example, the default value of the `ob_query_timeout` variable is `10s`, which is acceptable for simple online transaction processing (OLTP) scenarios but may not be suitable for online analytical processing (OLAP) business, especially for time-consuming complex queries.

To provide more suitable default parameter settings for clusters and tenants in different application scenarios, OceanBase Database provides the parameter template feature. I have tried this feature for a few days and here are my usage records for your reference.

I used OceanBase Database Community Edition V4.3.2.1 and OCP Community Edition V4.3.1 for testing. **We recommend that you use OCP Community Edition V4.3.2 or later, which fixes some known bugs and provides comprehensive parameter template functionality.**

## Check the Configuration File for Parameter Templates
In the OBServer source code of OceanBase Database, parameters and their default settings for various scenarios are maintained and output as an RPM package. When you upload the software package of OceanBase Database V4.3.0 or later to OCP, the configuration file in the software package is automatically parsed in the background of OCP and saved as a parameter template of the cluster or tenant.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/01_parameter_templates/001.png)

It takes about 1 minute to parse the configuration file and save it to a certain meta table. If you cannot see the options of the parameter template on the OCP GUI after waiting for a long time, confirm whether OCP has finished parsing the parameter template configuration file. The procedure is as follows:

1. Log in to the OCP console, choose **Tenants** > **User Management**, and copy the login connection string of the `ocp_meta` tenant.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/01_parameter_templates/002.png)

2. Log in to the `ocp_meta` tenant on the corresponding OBServer node by using the copied connection string.

```sql
[xiaofeng.lby@obvos-dev-d3 /home/xiaofeng.lby]
$mysql -h1.2.3.4 -P2881 -u root@ocp_meta -p YourPassword

Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 3221740061
Server version: 5.7.25 OceanBase_CE 4.2.1.2
Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.
Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
```

3. A scenario-based parameter template is saved in the background. You cannot directly see it on the parameter template page but you can confirm in the MetaDB whether it exists.

```sql
MySQL [(none)]> use meta_database;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A
Database changed

-- View cluster-level parameter template types. Here is an example. You can delete limit 1 and then execute the statement.
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

-- View tenant-level parameter template types. Here is an example. You can delete limit 1 and then execute the statement.
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



## Set a Cluster-level Parameter Template
When you create a cluster of OceanBase Database V4.3.0 or later, you can select a parameter template based on the application scenario.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/01_parameter_templates/003.png)

The procedure is simple. On the **Create Cluster** page of the OCP console, you can either use the default parameter settings or enable **Parameter Settings** to modify cluster parameters.

+ You can add and configure startup parameters one by one.
+ You can also click **Parameter Template** and select a parameter template. The system will automatically populate the parameters and their values from the template on the cluster parameter configuration page.

OceanBase Database V4.3.2.1 used for testing provides five built-in parameter templates, which are described in the following table.

| Template | Description |
| --- | --- |
| Default Parameter Template for HTAP | Suitable for hybrid transactional and analytical processing (HTAP) workloads. You can use it to quickly get insights from campaign operation data, fraud detection, and scenario-specific recommendations. This template applies to OceanBase Database V4.3.0 and later. |
| Default Parameter Template for OLAP | Suitable for real-time data warehouse analytics. This template applies to OceanBase Database V4.3.0 and later. |
| Default Parameter Template for COMPLEX_OLTP | Suitable for workloads such as banking and insurance systems. These workloads often involve complex join operations, complex subqueries, batch processing jobs compiled in PL, long-running transactions, and large transactions. Short-running queries are sometimes executed in parallel. This template applies to OceanBase Database V4.3.0 and later. |
| Default Parameter Template for KV | Suitable for workloads involving a high throughput and are sensitive to latency, such as key-value workloads and wide-column workloads of an HBase database. This template applies to OceanBase Database V4.3.0 and later. |
| Default Parameter Template for OceanBase Database V2.2.77   | The template recommended for a production cluster of OceanBase Database V2.2.77. |


## Set a Tenant-level Parameter Template
![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/01_parameter_templates/004.png)

Log in to the OCP console and choose **Tenants** > **Create Tenant**. On the page that appears, enable **Parameter Settings** and configure the tenant parameters.

+ You can add and configure startup parameters one by one.
+ You can also click **Parameter Template** and select a parameter template. The system will automatically populate the parameters and their values from the template on the tenant parameter configuration page.



## Solution to a Known Bug (Fixed in OCP Community Edition V4.3.2)
When a user creates a tenant in OCP by using the Default Parameter Template for OLAP, OCP misjudges the types of some parameters because part of the metadata recorded by OCP is incorrect. As a result, the tenant fails to be created. This bug does not occur in cluster creation or when a tenant is created by using other parameter templates.


This bug has been fixed in OCP Community Edition V4.3.2. If you use the Default Parameter Template for OLAP to create a tenant in OCP of a version earlier than V4.3.2, you can temporarily delete the parameters without a value type, namely, `parallel_degree_policy`, `_io_read_batch_size`, and `_io_read_redundant_limit_percentage`.


After the tenant is created, choose **Tenants** > **Parameter Management** and manually configure these three parameters.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/01_parameter_templates/007.png)




## Performance Tests with Different Parameter Templates
### Typical production environments
Our team member Junye has tested the parameter templates in different benchmarks. Currently, OceanBase Database Community Edition provides five typical production environments:

+ EXPRESS_OLTP: for Internet applications featuring simple CRUD statements, a large number of point queries, and high concurrency
+ COMPLEX_OLTP: for traditional industry applications featuring complex queries, a large number of PL queries, and batch processing jobs
+ OLAP: online analytical processing and data warehousing.
    - Typical load: import -> conversion -> query -> report generation
        * Lightweight:
            + Extract, load, transform (ELT) rather than extract, transform, load (ETL)
            + SQL used for data conversion and real-time queries, and materialized views used for real-time acceleration
            + Simple and lightweight dependencies, namely, no or a few external dependencies
    - Performance metric: response time, ranging from seconds to hours
    - Data size: 100 TB
    - Data model: star schema for multi-table joins and multidimensional ad-hoc queries on wide tables
    - Read/Write mode: more reads than writes, batch writes with a few updates, a few query types with a low query concurrency, and queries featuring wide-range scan
    - Typical benchmarks: TPC-DS, TPC-H, ClickBench, and Star Schema Benchmark (SSB)
    - Application scenarios: real-time warehousing, marketing analysis, aggregation analysis, and ad-hoc queries
+ HTAP: hybrid load processing with enhanced transaction processing (TP) capabilities
    - Real-time lightweight reports
        * Typical load: online transaction write -> batch processing job -> real-time report
        * Typical benchmarks: TPC-C + TPC-H, and Hybench
        * Data size: 10 TB
        * Performance metric: subsecond-level response time of an analytical query
        * Data model: basically designed in accordance with the relational model paradigm
        * Read/Write mode: heavy reads and writes with high read and write concurrency. Data is written in real time, including high-concurrency writes of transactions involving small amounts of data and batch writes of large transactions. Data reads include transactional short queries and analytical large queries.
        * Application scenarios: (a) BI reports, (b) substitute for the "database/table sharding + aggregated database" dual-database instance architecture, (c) ad-hoc queries, and (d) real-time risk control
    - Quasi-real-time decision analysis
        * Typical load: online transactions with a high concurrency and large-scale real-time data analysis
        * Data size: 100 TB
        * Performance metric: response time of an analytical query, ranging from subseconds to hours
        * Data model: basically designed in accordance with the relational model paradigm
        * Read/Write mode: heavy reads and writes with high read and write concurrency. Data is written in real time, including high-concurrency writes of transactions involving small amounts of data and batch writes of large transactions. Data reads include transactional short queries and analytical large queries, which can be separated on the application side. Analytical queries support old data.
        * Typical benchmarks: TPC-C + TPC-DS, and TPC-C + ClickBench
        * Application scenarios: (a) BI reports, (b) substitute for the "database/table sharding + aggregated database" dual-database instance architecture, and (c) ad-hoc queries
+ KV: applicable to OBKV HBase-compatible access and key-value table access, single-partition access, and no-SQL layer.

### Default values for parameters in templates
+ System variables: For more information, see [GitHub](https://github.com/oceanbase/oceanbase/blob/4.3.3/src/share/system_variable/default_system_variable.json).
+ Parameters: For more information, see [GitHub](https://github.com/oceanbase/oceanbase/blob/4.3.3/src/share/parameter/default_parameter.json).

### Test environment
#### Test versions
+ OceanBase Database Community Edition: V4.3.2
+ OceanBase Database Proxy (ODP) Community Edition: V4.2.3

##### Hardware environment
+ Three OBServer nodes are deployed on [ecs.r7.8xlarge servers](https://www.alibabacloud.com/help/en/ecs/user-guide/instance-specification-naming-and-classification?spm=a2c63.p38356.help-menu-25365.d_4_1_2_0.30363520na3b5u), each with 32 CPU cores and 256 GB of memory. The system disk is used as the system log disk, while two PL1 ESSDs are mounted to store clogs and data, respectively.
+ ODP is deployed on a separate [ecs.c7.16xlarge server](https://www.alibabacloud.com/help/en/ecs/user-guide/overview-of-instance-families?spm=a2c63.m28257.0.i3) with 64 CPU cores and 128 GB of memory.

##### Operating system
The operating system is CentOS 7.9 64-bit.

```shell
echo "vm.max_map_count=655360" >> /etc/sysctl.conf; sysctl -p (obd startup check items)
sudo sysctl -w kernel.sched_migration_cost_ns=0 (optimization based on kernel parameters of ApsaraDB for OceanBase)
```

##### Tenant specifications
28 CPU cores, 180 GB of memory, three full-featured replicas, and `primary_zone` set to `RANDOM`

```shell
## Valid values of scenario in the command are express_oltp, complex_oltp, olap, htap, and kv.
obd cluster tenant create perf --max-cpu=28 --memory-size=180G -n mysql_tenant -o ${scenario}
```

##### Deployment configuration file
```sql
oceanbase-ce:
  version: 4.3.2.0
  servers:
    - name: server1
      ip: omitted
    - name: server2
      ip: omitted
    - name: server3
      ip: omitted
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
    - omitted
  global:
    listen_port: 2886 ## External port. The default value is 2883.
    home_path: /root/obproxy
    enable_cluster_checkout: false
    skip_proxy_sys_private_check: true
    enable_strict_kernel_release: false
```

### Tune parameters
In this section, performance data is tested based on the tuned basic workload parameters and default parameter settings for different types of tenants.

#### Tune basic workload parameters
Sysbench

```sql
ALTER system SET enable_sql_audit=false;
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

TPC-C

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

TPC-H

```sql
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#Test tenant
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

TPC-DS

```sql
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#Test tenant
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

### Test data
#### Sysbench
**Parameter tuning**

```yaml
ALTER system SET enable_sql_audit=false;
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

**Test command**

The native Sysbench benchmark process encapsulated by obd is used. The ob-sysbench used by obd depends on LibOBClient. You need to run `export ENABLE_PROTOCOL_OB20=0` to disable the OceanBase 2.0 protocol to keep consistent with the native Sysbench benchmark.

```sql
obd test sysbench rn --tenant=perf --script-name=xxx.lua --table-size=1000000 --threads=xx  --report-interval=1 --rand-type=uniform --time=30 --db-ps-mode=disable 
```



**Test data (QPS/95% RT)**

**POINT_SELECT performance**

| Threads | EXPRESS_OLTP | COMPLEX_OLTP | OLAP | HTAP | KV |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 163457.60/0.22 | 162747.70/0.22 | 161428.80/0.23 | 162948.95/0.20 | 163204.29/0.20 |
| 64 | 296206.41/0.25 | 291823.36/0.26 | 291583.48/0.26 | 293622.63/0.25 | 295541.97/0.25 |
| 128 | 505203.80/0.30 | 493859.95/0.31 | 492135.78/0.31 | 498132.19/0.31 | 505266.56/0.30 |
| 256 | 798005.94/0.45 | 794547.97/0.47 | 803165.10/0.49 | 797304.31/0.45 | 794627.82/0.45 |
| 512 | 1039286.05/0.90 | 1023822.11/1.14 | 1022666.33/1.12 | 1032713.76/0.90 | 1016045.20/0.92 |
| 1024 | 1013992.61/2.39 | 1011295.14/2.39 | 997362.00/2.57 | 1004848.34/2.48 | 990136.68/2.52 |


**READ_ONLY performance**

| Threads | EXPRESS_OLTP | COMPLEX_OLTP | OLAP | HTAP | KV |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 134791.19/4.10 | 136145.15/3.97 | 137486.55/3.96 | 137327.53/3.95 | 137750.08/3.96 |
| 64 | 244754.37/4.49 | 244093.17/4.57 | 244641.01/4.57 | 244586.46/4.57 | 247914.45/4.49 |
| 128 | 416929.45/5.37 | 420143.73/5.47 | 419772.35/5.28 | 420445.05/5.28 | 421381.09/5.28 |
| 256 | 613453.13/7.56 | 611436.43/8.28 | 603989.96/8.28 | 610998.14/7.43 | 607015.73/8.13 |
| 512 | 725364.76/16.12 | 738362.91/17.65 | 736059.64/15.83 | 720899.31/16.12 | 693449.90/26.20 |
| 1024 | 715777.22/41.10 | 707831.35/42.61 | 697077.19/44.17 | 706809.11/42.61 | 699619.03/44.83 |


**WRITE_ONLY performance**

| Threads | EXPRESS_OLTP | COMPLEX_OLTP | OLAP | HTAP | KV |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 50914.06/5.00 | 52894.62/4.91 | 50589.47/5.67 | 52088.46/4.74 | 54033.87/4.41 |
| 64 | 90119.99/5.47 | 93447.67/5.37 | 90202.65/5.37 | 90264.56/5.57 | 94874.07/5.00 |
| 128 | 164488.33/5.77 | 166099.69/5.57 | 159493.96/5.99 | 159005.24/6.09 | 162650.65/5.57 |
| 256 | 242240.38/8.13 | 241749.01/8.43 | 232320.85/8.43 | 230522.31/8.74 | 238971.17/7.84 |
| 512 | 304060.67/13.70 | 306416.65/13.70 | 299155.86/13.70 | 289147.63/13.95 | 301695.38/13.22 |
| 1024 | 345068.37/23.52 | 348929.05/26.20 | 306096.92/29.72 | 327905.15/27.17 | 313276.26/30.81 |


**READ_WRITE performance**

| Threads | EXPRESS_OLTP | COMPLEX_OLTP | OLAP | HTAP | KV |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 32 | 90881.38/7.84 | 88141.94/8.28 | 88216.59/8.58 | 89948.44/7.98 | 90592.37/7.98 |
| 64 | 159748.46/8.90 | 160695.31/9.06 | 157714.41/10.09 | 157230.31/9.39 | 161391.32/8.90 |
| 128 | 273142.95/10.46 | 275431.02/10.27 | 272648.28/10.27 | 269700.79/11.24 | 275952.12/10.46 |
| 256 | 391348.85/15.27 | 402154.83/15.00 | 382679.53/16.71 | 383447.47/15.27 | 405787.34/14.46 |
| 512 | 465031.62/28.67 | 462574.18/33.72 | 466465.96/26.20 | 461249.29/27.66 | 464724.24/27.66 |
| 1024 | 525924.96/52.89 | 535977.26/48.34 | 510540.58/58.92 | 522066.61/51.02 | 521969.84/51.94 |


#### TPC-C
**Parameter tuning**

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

**Test command**

The TPC-C benchmark process encapsulated by obd is used. For more information, see [Run the TPC-C benchmark on OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000000919959).

```sql
obd test tpcc rn --tenant=perf --tmp-dir=/data/2/tpcc  --warehouses=1000 --load-workers=40 --terminals=800 --run-mins=5 -v -O 2
```

****

**Test data**

|  | express_oltp | complex_oltp | olap | htap | kv |
| :---: | :---: | :---: | :---: | :---: | :---: |
| tpmC (NewOrders) | 292204.95 | 302608.69 | 264422.69 | 294316.6 | 286362.9 |
| tpmTOTAL | 648918.9 | 672866.36 | 587580.74 | 654271.82 | 636369.93 |
| Transaction Count | 3246324 | 3366013 | 2939166 | 3272514 | 3183132 |


#### TPC-H
**Parameter tuning**

```yaml
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#Test tenant
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

****

**Test command**

The TPC-H benchmark process encapsulated by obd is used. For more information, see [Run the TPC-H benchmark on OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000000919955).

```sql
obd test tpch rn --user=root --test-server=server1 --tmp-dir=/data/2/ob   --tenant=perf --remote-tbl-dir=/home/admin -s 100
```

**Test data (columnstore tables used)**

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


#### TPC-DS
**Parameter tuning**

```yaml
#sys
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
select sleep(5);
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;

#Test tenant
SET GLOBAL ob_sql_work_area_percentage = 80;
SET GLOBAL ob_query_timeout = 36000000000;
SET GLOBAL ob_trx_timeout = 36000000000;
SET GLOBAL max_allowed_packet = 67108864;
## parallel_servers_target = max_cpu * server_num * 8
SET GLOBAL parallel_servers_target = 624;
```

****

**Test command**

The test data volume is 100 GB. For the test process, see [Run the TPC-DS benchmark on OceanBase Database](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000931730).



**Test data (columnstore tables used)**

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


### Summary
After a tenant is created by using a parameter template, the benchmark results for the corresponding business scenario show that the performance is significantly improved. The parameter template feature will be gradually popularized among OceanBase Database users. We recommend that you have a try.