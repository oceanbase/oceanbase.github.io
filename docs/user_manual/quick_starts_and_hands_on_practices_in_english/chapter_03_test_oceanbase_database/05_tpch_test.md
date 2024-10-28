---
title: Run the TPC-H benchmark
weight: 6
---

# 3.5 Run the TPC-H benchmark

This topic describes two methods to run the Transaction Processing Performance Council Benchmark H (TPC-H) benchmark on OceanBase Database in a CentOS Linux 7.9 environment based on the x86 architecture.

* Use OceanBase Deployer (OBD) to run the benchmark. 

* Manually run the benchmark step by step. 

## TPC-H overview

TPC-H is a business intelligence test set developed by the Transaction Processing Performance Council (TPC) of the United States to simulate the decision-making process of applications. It is commonly used in academia and industry for evaluating the performance of decision support applications. 

### Database model

The TPC-H model is a typical snowflake schema, which comprises eight tables. The `nation` and `region` tables have fixed amounts of data. The data amounts of the other six tables are correlated with the scale factor (SF). You can set the SF to 1, 100, or 1000, which respectively represents 1 GB, 100 GB, or 1000 GB. The amount of data in each table is determined based on the specified SF. 

* `part`: records parts information. The primary key is `p_partkey`, whose value range is 1 to SF × 200,000. This table is associated with the `partsupp` table. 

* `supplier`: records supplier information. The primary key is `s_suppkey`, whose value range is 1 to SF × 10,000. This table is associated with the `partsupp`, `customer`, and `nation` tables. 

* `partsupp`: records parts supply information. The primary keys are `ps_partkey` and `ps_suppkey`. This table is associated with the `part`, `supplier`, and `lineitem` tables. 

* `customer`: records consumer information. The primary key is `c_custkey`, whose value range is 1 to SF × 150,000. This table is associated with the `orders` table. 

* `orders`: records order information. The primary key is `o_orderkey`, whose value range is 1 to SF × 1,500,000. This table is associated with the `lineitem` table. 

* `lineitem`: records information about commodities on sale. The primary keys are `l_orderkey` and `l_linenumber`. This table contains the largest amount of data. 

* `nation`: records country information. The primary key is `n_nationkey`. This table contains information about 25 fixed countries. 

* `region`: records region information. The primary key is `r_regionkey`. This table contains information about five fixed regions. 

### SQL type

The TPC-H standard comprises 22 SQL statements, which are all query operations that aim to assess the following data analysis capabilities of databases:

* Aggregation

* Join

* Expression calculation

* Subqueries

* Parallelism and concurrency

### Metrics

TPC-H implements a data warehouse in the Third Normal Form (3NF) that contains eight basic relationships. The main evaluation metric is the response time of each query from its submission to the return of results. The TPC-H benchmark measures the number of queries executed per hour (QphH@size) in a database. `H` indicates the average number of complex queries executed per hour and `size` indicates the scale of the database. This metric reflects the query processing capacity of a database system. 

## Use obdiag to inspect the cluster before running the benchmark

OceanBase Database is a native distributed database system. Root cause analysis for faults is complex because a variety of factors need to be considered, such as the server environment, parameters, and runtime load. Experts must collect and analyze extensive information during troubleshooting. Therefore, OceanBase Diagnostic Tool (obdiag) is introduced to help efficiently collect information scattered on various nodes. Before you run the TPC-H benchmark, you can use obdiag to perform a health check on OceanBase Database. For the check procedure, see the [obdiag Documentation](https://en.oceanbase.com/docs/obdiag-en). 

## Prepare the environment

* Java Development Kit (JDK): Use V1.8u131 or later.

* CMake: Run the `sudo yum install make` command to install CMake.

* GNU Compiler Collection (GCC): Run the `sudo yum install gcc` command to install GCC.

* MySQL-devel: Run the `sudo yum install mysql-devel` command to install MySQL-devel.

* Python driver: Run the `sudo yum install MySQL-python` command to install the Python driver.

* PrettyTable: Run the `pip install prettytable` command to install PrettyTable.

* OceanBase Client (OBClient): For information about OBClient, see the [GitHub repository](https://github.com/oceanbase/obclient).

## Test plan

The TPC-H benchmark requires four servers, one for deploying the TPC-H tool, ODP, and OBD, and three for deploying an OceanBase cluster that has three zones, with each containing one OBServer node. 

> **Notice**
>
> * We recommend that you set input/output operations per second (IOPS) to a value greater than 10000, and configure three disks for system logs, transaction logs, and data files respectively. 
>
> * If you use OBD to deploy the cluster, we recommend that you do not use the `obd cluster autodeploy` command. This is because for consideration of system stability, the command will not maximize the resource utilization. We recommend that you customize the OBD configuration file to maximize the resource utilization. 

### Test environment (Alibaba Cloud ECS)

| Service type | ECS type | Number of instances | Number of CPU cores | Memory |
| -------- | --------------- | ------ | ---------- | ------------------------------------------------------------------------------------- |
| OceanBase Database | ecs.g7.8xlarge | 3 | 32 | 128 GB. The system disk of each server is sized 300 GB. Two 400 GB cloud disks are mounted as the clog disk and data disk, respectively. The performance level is PL1. |
| ODP and TPC-H tool | ecs.c7.16xlarge | 1 | 32 | 128 GB |

### Software versions

| Service type | Software version |
| ---------------- | -------------------- |
| OceanBase Database | OceanBase_CE 4.2.1.0 |
| ODP | OBProxy_CE 4.2.1.0 |
| TPC-H | V3.0.0 |

### Tenant specifications

After deployment, you need to create a tenant and a user for the TPC-H benchmark. The sys tenant is a built-in tenant for cluster management and cannot be used for testing. Set the `primary_zone` parameter to `RANDOM`, which means that the leader of a new partition is randomly distributed to any OBServer node. 

```sql
CREATE RESOURCE UNIT tpch_unit max_cpu 26, memory_size '100g';
CREATE RESOURCE POOL tpch_pool unit = 'tpch_unit', unit_num = 1, zone_list=('zone1','zone2','zone3');
CREATE TENANT tpch_mysql resource_pool_list=('tpch_pool'),  zone_list('zone1', 'zone2', 'zone3'), primary_zone=RANDOM, locality='F@zone1,F@zone2,F@zone3' set variables ob_compatibility_mode='mysql', ob_tcp_invited_nodes='%', secure_file_priv = '/';
```

## Use OBD to run the benchmark

> **Note**
>
> If you use OBD to run the test, the test cluster must be a cluster managed by OBD. By default, a cluster deployed by using OBD is managed by OBD. To use a cluster deployed by using another method as the test cluster, you need to take over the cluster to OBD. For more information, see [User Guide of OBD](https://en.oceanbase.com/docs/obd-en) in OceanBase Deployer Documentation. 

1. Install obtpch

   ```shell
   sudo yum install -y yum-utils
   sudo yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
   sudo yum install obtpch
   sudo ln -s /usr/tpc-h-tools/tpc-h-tools/ /usr/local/
   ```

2. Run the benchmark.

   ```shell
   obd test tpch <deploy_name>  --tenant=<tenant_name> -s 100 --remote-tbl-dir=/tmp/tpch100
   ```

   * In the command, `deploy_name` specifies the cluster name and `tenant_name` specifies the tenant name, which is `tpch_mysql` in the [Tenant specifications](#Tenant_specifications) section. You need to modify the cluster name and tenant name based on the actual situation. 

   * The remote directory specified by `remote-tbl-dir` must have sufficient capacity to store TPC-H data. We recommend that you specify an independent disk to store loaded test data. 

   * The `obd test tpch` command automatically completes all operations, including generating test data, tuning performance parameters, importing data, and running the benchmark. For more information about the command, see **obd test tpch** in [OBD Command > Testing commands](https://en.oceanbase.com/docs/community-obd-en-10000000001181574) in OceanBase Deployer Documentation. 

## Manually run the TPC-H benchmark

### Step 1: Tune parameters

Before you run the TPC-H benchmark, you need to tune related parameters. 

Run the `obclient -h<host_ip> -P<host_port> -uroot@sys -A -p` command to connect to the sys tenant. Then, execute the following statements: 

```sql
ALTER SYSTEM flush plan cache GLOBAL;
ALTER system SET enable_sql_audit=false;
ALTER system SET enable_perf_event=false;
ALTER system SET syslog_level='PERF';
alter system set enable_record_trace_log=false;
```

Run the `obclient -h<host_ip> -P<host_port> -u<user_name>@<tenant_name> -A -p` command to connect to the test tenant. Then, execute the following statements: 

```sql
# Set the percentage of the SQL workspace memory to the total memory of the tenant
SET GLOBAL ob_sql_work_area_percentage = 80;
# Set the maximum execution time of an SQL statement
SET GLOBAL ob_query_timeout = 36000000000;
# Set the timeout period of transactions
SET GLOBAL ob_trx_timeout = 36000000000;
# Set the maximum size of network packets
SET GLOBAL max_allowed_packet = 67108864;
# Set the number of PX threads that can be requested by the tenant on each node
SET GLOBAL parallel_servers_target = 624;
```

### Step 2: Install the TPC-H tool

Perform the following steps to install the TPC-H tool: 

1. Download the TPC-H tool.

   Download the TPC-H tool from [TPC-H Tools Download](https://www.tpc.org/tpc_documents_current_versions/download_programs/tools-download-request5.asp?bm_type=TPC-H&bm_vers=3.0.0&mode=CURRENT-ONLY). 

2. Decompress the TPC-H tool package.

   ```shell
   [admin@test ~]$ unzip *-tpc-h-tool.zip
   ```

3. Modify the `Makefile` file.

   In the `TPC-H_Tools_v3.0.0/dbgen` directory, run the following command to copy the `makefile.suite` file and rename it as `Makefile`.

   ```shell
   [admin@test dbgen]$ cp makefile.suite Makefile
   ```

   Redefine the `CC`, `DATABASE`, `MACHINE`, and `WORKLOAD` parameters in the `Makefile` file. The content after the modification is as follows:

   ```shell
   CC      = gcc
   # Current values for DATABASE are: INFORMIX, DB2, TDAT (Teradata)
   #                                  SQLSERVER, SYBASE, ORACLE, VECTORWISE
   # Current values for MACHINE are: ATT, DOS, HP, IBM, ICL, MVS,
   #                                  SGI, SUN, U2200, VMS, LINUX, WIN32
   # Current values for WORKLOAD are: TPCH
   DATABASE= MYSQL
   MACHINE = LINUX
   WORKLOAD = TPCH
   ```

4. Modify the `tpcd.h` file.

   Modify the `tpcd.h` file in the `dbgen` directory and add new macro definitions. 

   ```shell
   [admin@test dbgen]$ vim tpcd.h
   ```

   Add the following content to the file:

   ```shell
   #ifdef MYSQL
   #define GEN_QUERY_PLAN ""
   #define START_TRAN "START TRANSACTION"
   #define END_TRAN "COMMIT"
   #define SET_OUTPUT ""
   #define SET_ROWCOUNT "limit %d;\n"
   #define SET_DBASE "use %s;\n"
   #endif
   ```

5. Compile the file.

   ```shell
   [admin@test dbgen]$ make
   ```

### Step 3: Generate data

Generate 10 GB, 100 GB, or 1 TB of data for the TPC-H benchmark based on the actual environment. Run the following command in the `dbgen` directory to generate 100 GB of data: 

```shell
[admin@test dbgen]$ ./dbgen -s 100
[admin@test dbgen]$ mkdir tpch100
[admin@test dbgen]$ mv *.tbl tpch100
```

### Step 5: Generate SQL query statements

You can perform the following steps to generate and modify the SQL query statements, or directly use the SQL query statements provided on [GitHub](https://github.com/oceanbase/obdeploy/tree/master/plugins/tpch/4.0.0.0/queries). If you use the SQL statements provided on GitHub, you need to change the value of the `cpu_num` parameter in the SQL statements to the actual concurrency. 

1. Copy the `qgen` and `dists.dss` files to the `queries` directory.

   ```shell
   [admin@test dbgen]$ cp qgen queries
   [admin@test dbgen]$ cp dists.dss queries
   ```

2. Create a script named `gen.sh` in the `queries` directory to generate SQL query statements.

   ```shell
   [admin@localhost queries]$ vim gen.sh
   ```

   The script content is as follows:

   ```shell
   #!/usr/bin/bash
   for i in {1..22}
   do  
   ./qgen -d $i -s 100 > db"$i".sql
   done
   ```

3. Run the `gen.sh` script.

   ```shell
   [admin@localhost queries]$ chmod +x  gen.sh
   [admin@localhost queries]$ ./gen.sh
   ```

4. Adjust the SQL query statements.

   ```shell
   [admin@localhost queries]$ dos2unix *
   ```

   For more information about the modified SQL query statements, see [GitHub](https://github.com/oceanbase/obdeploy/tree/master/plugins/tpch/3.1.0/queries). You need to change the value of the `cpu_num` parameter in the SQL statements provided on GitHub to the actual concurrency. We recommend that the concurrency value be the same as the total number of available CPU cores to achieve the optimal performance. You can run the following command in the sys tenant to query the total number of available CPU cores of a tenant: 

   ```sql
   SELECT sum(cpu_capacity_max) FROM __all_virtual_server;
   ```

   Here is a sample SQL query statement `q1` after modification:

   ```sql
   SELECT /*+    parallel(96) */   ---Specify the execution concurrency.
     l_returnflag,
     l_linestatus,
     sum(l_quantity) as sum_qty,
     sum(l_extendedprice) as sum_base_price,
     sum(l_extendedprice * (1 - l_discount)) as sum_disc_price,
     sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)) as sum_charge,
     avg(l_quantity) as avg_qty,
     avg(l_extendedprice) as avg_price,
     avg(l_discount) as avg_disc,
     count(*) as count_order
   FROM
     lineitem
   WHERE
     l_shipdate <= date '1998-12-01' - interval '90' day
   GROUP BY
     l_returnflag,
     l_linestatus
   ORDER BY
     l_returnflag,
     l_linestatus;
   ```

### Step 6: Create a table

Create a folder named `load` in the `dbgen` directory, and then create a table schema file named `create_tpch_mysql_table_part.ddl` in the `load` folder. 

```shell
[admin@localhost dbgen]$ mkdir load
[admin@localhost dbgen]$ cd load
[admin@localhost load]$ vim create_tpch_mysql_table_part.ddl
```

The file content is as follows:

```sql
DROP TABLE IF EXISTS lineitem;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS partsupp;
DROP TABLE IF EXISTS part;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS supplier;
DROP TABLE IF EXISTS nation;
DROP TABLE IF EXISTS region;
DROP TABLEGROUP IF EXISTS tpch_tg_lineitem_order_group;
DROP TABLEGROUP IF EXISTS tpch_tg_partsupp_part;

CREATE TABLEGROUP IF NOT EXISTS tpch_tg_lineitem_order_group binding true partition by key 1 partitions cpu_num;
CREATE TABLEGROUP IF NOT EXISTS tpch_tg_partsupp_part binding true partition by key 1 partitions cpu_num;

DROP TABLE IF EXISTS lineitem;
CREATE TABLE lineitem (
  l_orderkey BIGINT NOT NULL,
  l_partkey BIGINT NOT NULL,
  l_suppkey INTEGER NOT NULL,
  l_linenumber INTEGER NOT NULL,
  l_quantity DECIMAL(15,2) NOT NULL,
  l_extendedprice DECIMAL(15,2) NOT NULL,
  l_discount DECIMAL(15,2) NOT NULL,
  l_tax DECIMAL(15,2) NOT NULL,
  l_returnflag char(1) DEFAULT NULL,
  l_linestatus char(1) DEFAULT NULL,
  l_shipdate date NOT NULL,
  l_commitdate date DEFAULT NULL,
  l_receiptdate date DEFAULT NULL,
  l_shipinstruct char(25) DEFAULT NULL,
  l_shipmode char(10) DEFAULT NULL,
  l_comment varchar(44) DEFAULT NULL,
  PRIMARY KEY(l_orderkey, l_linenumber))row_format = condensed
  tablegroup = tpch_tg_lineitem_order_group
  partition by key (l_orderkey) partitions cpu_num;

DROP TABLE IF EXISTS orders;
CREATE TABLE orders (
  o_orderkey bigint not null,
  o_custkey bigint not null,
  o_orderstatus char(1) default null,
  o_totalprice bigint default null,
  o_orderdate date not null,
  o_orderpriority char(15) default null,
  o_clerk char(15) default null,
  o_shippriority bigint default null,
  o_comment varchar(79) default null,
  PRIMARY KEY (o_orderkey))row_format = condensed
  tablegroup = tpch_tg_lineitem_order_group
  partition by key(o_orderkey) partitions cpu_num;

DROP TABLE IF EXISTS partsupp;
CREATE TABLE partsupp (
  ps_partkey bigint not null,
  ps_suppkey bigint not null,
  ps_availqty bigint default null,
  ps_supplycost bigint default null,
  ps_comment varchar(199) default null,
  PRIMARY KEY (ps_partkey, ps_suppkey))row_format = condensed
  tablegroup tpch_tg_partsupp_part
  partition by key(ps_partkey) partitions cpu_num;

DROP TABLE IF EXISTS part;
CREATE TABLE part (
  p_partkey bigint not null,
  p_name varchar(55) default null,
  p_mfgr char(25) default null,
  p_brand char(10) default null,
  p_type varchar(25) default null,
  p_size bigint default null,
  p_container char(10) default null,
  p_retailprice bigint default null,
  p_comment varchar(23) default null,
  PRIMARY KEY (p_partkey))row_format = condensed
  tablegroup tpch_tg_partsupp_part
  partition by key(p_partkey) partitions cpu_num;

DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
  c_custkey bigint not null,
  c_name varchar(25) default null,
  c_address varchar(40) default null,
  c_nationkey bigint default null,
  c_phone char(15) default null,
  c_acctbal bigint default null,
  c_mktsegment char(10) default null,
  c_comment varchar(117) default null,
  PRIMARY KEY (c_custkey))row_format = condensed
  partition by key(c_custkey) partitions cpu_num;

DROP TABLE IF EXISTS supplier;
CREATE TABLE supplier (
  s_suppkey bigint not null,
  s_name char(25) default null,
  s_address varchar(40) default null,
  s_nationkey bigint default null,
  s_phone char(15) default null,
  s_acctbal bigint default null,
  s_comment varchar(101) default null,
  PRIMARY KEY (s_suppkey))row_format = condensed
  partition by key(s_suppkey) partitions cpu_num;

DROP TABLE IF EXISTS nation;
CREATE TABLE nation (
  n_nationkey bigint not null,
  n_name char(25) default null,
  n_regionkey bigint default null,
  n_comment varchar(152) default null,
  PRIMARY KEY (n_nationkey))row_format = condensed;

DROP TABLE IF EXISTS region;
CREATE TABLE region (
  r_regionkey bigint not null,
  r_name char(25) default null,
  r_comment varchar(152) default null,
  PRIMARY KEY (r_regionkey))row_format = condensed;
```

### Step 7: Load data

Write a script based on the data and SQL query statements generated in the preceding steps. Perform the following steps to load data: 

1. Create a script named `load.py`.

   ```shell
   [admin@localhost load]$ vim load.py
   ```

   The script content is as follows:

   ```python
   #!/usr/bin/env python
   #-*- encoding:utf-8 -*-
   import os
   import sys
   import time
   import commands
   hostname='$host_ip'  # Notice! ! Enter the host name of an OBServer node, for example, the IP address of the server where OBServer node A resides.
   port='$host_port'               # The port number of OBServer node A.
   tenant='$tenant_name'              # The tenant name.
   user='$user'               # The username.
   password='$password'           # The password.
   data_path='$path'         # Notice! ! Enter the directory of the table on the server where OBServer node A resides.
   db_name='$db_name'             # The database name.
   # Create a table.
   cmd_str='obclient -h%s -P%s -u%s@%s -p%s -D%s < create_tpch_mysql_table_part.ddl'%(hostname,port,user,tenant,password,db_name)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str='obclient -h%s -P%s -u%s@%s -p%s  -D%s -e "show tables;" '%(hostname,port,user,tenant,password,db_name)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c  -D%s -e "load data /*+ parallel(80) */ infile '%s/customer.tbl' into table customer fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c  -D%s -e "load data /*+ parallel(80) */ infile '%s/lineitem.tbl' into table lineitem fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c -D%s -e "load data /*+ parallel(80) */ infile '%s/nation.tbl' into table nation fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c  -D%s -e "load data /*+ parallel(80) */ infile '%s/orders.tbl' into table orders fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s   -D%s -e "load data /*+ parallel(80) */ infile '%s/partsupp.tbl' into table partsupp fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c  -D%s -e "load data /*+ parallel(80) */ infile '%s/part.tbl' into table part fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c  -D%s -e "load data /*+ parallel(80) */ infile '%s/region.tbl' into table region fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   cmd_str=""" obclient -h%s -P%s -u%s@%s -p%s -c  -D%s -e "load data /*+ parallel(80) */ infile '%s/supplier.tbl' into table supplier fields terminated by '|';" """ %(hostname,port,user,tenant,password,db_name,data_path)
   result = commands.getstatusoutput(cmd_str)
   print result
   ```

2. Load data.

   To load data, you need to install the OBClient. 

   ```shell
   [admin@localhost load]$ python load.py
   ```

   The output is as follows:

   ```shell
   (0,'')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.   \nTABLE_NAME\nT1\nLINEITEM\nORDERS\nPARTSUPP\nPART\nCUSTOMER\nSUPPLIER\nNATION\nREGION')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   (0, 'obclient: [Warning] Using a password on the command line interface can be insecure.')
   ```

3. Perform a major compaction.

   Log on as the root user to the sys tenant of the OceanBase cluster. Run the following command to compact SSTables and MEMTables of the current major version with the full static data of an earlier version, to ensure that the storage-layer statistics are more accurate and the generated execution plan is more stable. 

   `<your tenant name>` indicates the name of the test tenant, which is `tpch_mysql` in the [Tenant specifications](#Tenant_specifications) section. You need to replace it with the actual test tenant name. 

   ```shell
   obclient [oceanbase]> ALTER SYSTEM major freeze tenant=<your tenant name>;
   ```

4. Check whether the major compaction is completed.

   ```shell
   obclient [oceanbase]> SELECT * FROM oceanbase.CDB_OB_MAJOR_COMPACTION;
   ```

   If the value of the `STATUS` column in the returned information is `IDLE`, the major compaction is completed. 

   ```shell
   +-----------+---------------------+----------------------------+----------------------+---------------------+----------------------------+----------------------------+--------+----------+--------------+------+
   | TENANT_ID | FROZEN_SCN          | FROZEN_TIME                | GLOBAL_BROADCAST_SCN | LAST_SCN            | LAST_FINISH_TIME           | START_TIME                 | STATUS | IS_ERROR | IS_SUSPENDED | INFO |
   +-----------+---------------------+----------------------------+----------------------+---------------------+----------------------------+----------------------------+--------+----------+--------------+------+
   |         1 | 1709661601360541623 | 2024-03-06 02:00:01.360542 |  1709661601360541623 | 1709661601360541623 | 2024-03-06 02:06:25.027267 | 2024-03-06 02:00:01.382794 | IDLE   | NO       | NO           |      |
   |      1001 | 1709661602742784187 | 2024-03-06 02:00:02.742784 |  1709661602742784187 | 1709661602742784187 | 2024-03-06 02:05:36.148110 | 2024-03-06 02:00:02.780978 | IDLE   | NO       | NO           |      |
   |      1002 | 1709661600590790760 | 2024-03-06 02:00:00.590791 |  1709661600590790760 | 1709661600590790760 | 2024-03-06 02:05:43.819029 | 2024-03-06 02:00:00.641044 | IDLE   | NO       | NO           |      |
   +-----------+---------------------+----------------------------+----------------------+---------------------+----------------------------+----------------------------+--------+----------+--------------+------+
   ```

5. Collect statistics.

   Run the `obclient -h<host_ip> -P<host_port> -u<user_name>@<tenant_name> -p -A -D<db_name>` command to connect to the test tenant. Then, run the following command, where `$db_name` needs to be replaced with the `db_name` value configured in the `load.py` file: 

   ```shell
   obclient [oceanbase]> call dbms_stats.gather_schema_stats('$db_name',degree=>96);
   ```

### Step 8: Run the benchmark

You can write a script based on the data and SQL query statements generated in the preceding steps. Perform the following steps to run the benchmark: 

1. Write the `tpch.sh` test script in the `queries` directory.

   ```shell
   [admin@localhost queries]$ vim tpch.sh
   ```

   The script content is as follows:

   ```shell
   #!/bin/bash
   TPCH_TEST="obclient -h ${host_ip} -P ${host_port} -uroot@tpch_mysql  -D ${db_name}  -p${password} -c"
   # Run a warmup.
   for i in {1..22}
   do
       sql1="source db${i}.sql"
       echo $sql1| $TPCH_TEST >db${i}.log  || ret=1
   done
   # Run the formal test.
   for i in {1..22}
   do
       starttime=`date +%s%N`
       echo `date  '+[%Y-%m-%d %H:%M:%S]'` "BEGIN Q${i}"
       sql1="source db${i}.sql"
       echo $sql1| $TPCH_TEST >db${i}.log  || ret=1
       stoptime=`date +%s%N`
       costtime=`echo $stoptime $starttime | awk '{printf "%0.2f\n", ($1 - $2) / 1000000000}'`
       echo `date  '+[%Y-%m-%d %H:%M:%S]'` "END,COST ${costtime}s"
   done
   ```

2. Execute the test script.

   ```shell
   [admin@localhost queries]$ sh tpch.sh
   ```

## Test results

The performance test data is affected by various factors, such as hardware configurations, database installation and deployment modes, and resources allocated to the business tenant for testing. Therefore, the test results are for reference only and the actual performance data can vary depending on the environment. 

The size of the test dataset is 100 GB.

| Query ID | Response time of the three-node OceanBase Database V4.2.1 cluster (seconds) |
| -------- | -------------------------------------------------- |
| Q1 | 2.24 |
| Q2 | 0.48 |
| Q3 | 1.49 |
| Q4 | 0.66 |
| Q5 | 0.95 |
| Q6 | 0.14 |
| Q7 | 1.35 |
| Q8 | 1.09 |
| Q9 | 4.46 |
| Q10 | 0.95 |
| Q11 | 0.19 |
| Q12 | 1.34 |
| Q13 | 1.86 |
| Q14 | 0.41 |
| Q15 | 0.88 |
| Q16 | 0.67 |
| Q17 | 1.57 |
| Q18 | 0.91 |
| Q19 | 0.64 |
| Q20 | 1.12 |
| Q21 | 2.52 |
| Q22 | 1.11 |
| Total | 27.03 |
