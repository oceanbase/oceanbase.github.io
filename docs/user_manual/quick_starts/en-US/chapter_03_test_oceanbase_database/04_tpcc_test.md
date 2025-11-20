---
title: Run the TPC-C benchmark
weight: 5
---

# 3.4 Run the TPC-C benchmark

This topic describes two methods to run the Transaction Processing Performance Council Benchmark C (TPC-C) benchmark on OceanBase Database in a CentOS Linux 7.9 environment based on the x86 architecture.

* Use OceanBase Deployer (OBD) to run the benchmark. 

* Manually run the benchmark step by step. 

## TPC-C overview

TPC-C is an online transaction processing (OLTP) benchmark launched by TPC. Since its launch in 1992, TPC-C has become one of the industry standards for assessing the transaction processing capacity of databases. 

### Database model

The TPC-C model comprises nine data tables. The number of warehouses can be adjusted based on the actual situation of the system. Assume that the number of records in the `WAREHOUSE` table, namely the number of warehouses, is `W`. The initial data information in the database is as follows:

* The `STOCK` table must contain W × 100,000 records, indicating that each warehouse corresponds to the stock data of 100,000 types of commodities. 

* The `DISTRICT` table must contain W × 10 records, indicating that each warehouse serves 10 districts. 

* The `CUSTOMER` table must contain W × 10 × 3,000 records, indicating that 3,000 customers are distributed in each district. 

* The `HISTORY` table must contain W × 10 × 3,000 records, with one transaction history record for each customer. 

* The `ORDER` table must contain W × 10 × 3,000 records, indicating that 3,000 orders are generated in each district. 

* The `NEW-ORDER` table must contain W × 10 × 900 records, indicating that 900 new orders are generated in each district. 5 to 15 order lines will be randomly generated for each order. 

* The `ITEM` table must contain 100,000 commodity records, which is irrelevant with the number of warehouses. 

### Transaction types

The TPC-C model comprises five types of transactions.

* NewOrder transaction: A NewOrder transaction randomly selects 5 to 15 commodities from a warehouse to create an order. 1% of the transactions are rolled back. Generally, transactions of this type cannot account for more than 45% of all types of transactions. 

* Payment transaction: A payment transaction updates the balance of a customer to reflect the payment of the customer. Transactions of this type account for 43% of all types of transactions. 

* OrderStatus transaction: An OrderStatus transaction randomly selects a customer to query the latest order of the customer and displays the status of each commodity in the order. Transactions of this type account for 4% of all types of transactions. 

* Delivery transaction: A delivery transaction batch-processes orders, updates the balances of the customers who placed the orders, and deletes the orders from the NewOrder table. Transactions of this type account for 4% of all types of transactions. 

* Stock-Level transaction: A Stock-Level transaction analyzes the stock level status of commodities. Transactions of this type account for 4% of all types of transactions. 

### Metrics

In the TPC-C model, the transactions per minute (tpmC) value measures the maximum effective throughput of the system. Specifically, NewOrder transactions are counted, and the tpmC value is the number of new orders processed per minute. 

## Use obdiag to inspect the cluster before running the benchmark

OceanBase Database is a native distributed database system. Root cause analysis for faults is complex because a variety of factors need to be considered, such as the server environment, parameters, and runtime load. Experts must collect and analyze extensive information during troubleshooting. Therefore, OceanBase Diagnostic Tool (obdiag) is introduced to help efficiently collect information scattered on various nodes. Before you run the TPC-C benchmark, you can use obdiag to perform a health check on OceanBase Database. For the check procedure, see the [obdiag Documentation](https://en.oceanbase.com/docs/obdiag-en). 

## Prepare the environment

* Java Development Kit (JDK): Use V1.8u131 or later.

* Java Database Connectivity (JDBC): Use mysql-connector-java-5.1.47. Other versions may incur syntax compatibility issues.

* Ant: Use Apache Ant 1.10 or later.

* Benchmark SQL: Use Benchmark SQL 5.0.

* OceanBase Client (OBClient): For information about OBClient, see the [GitHub repository](https://github.com/oceanbase/obclient).

## Test plan

The TPC-C benchmark requires five servers, one for deploying Benchmark SQL and OBD, one for deploying OceanBase Database Proxy (ODP) separately, and three for deploying an OceanBase cluster that has three zones, with each containing one OBServer node. 

> **Notice**
>
> * We recommend that you deploy ODP on a separate server to avoid resource contention with OceanBase Database. 
>
> * We recommend that you set input/output operations per second (IOPS) to a value greater than 10000, and configure three disks for system logs, transaction logs, and data files respectively. 
>
> * If you use OBD to deploy the cluster, we recommend that you do not use the `obd cluster autodeploy` command. This is because for consideration of system stability, the command will not maximize the resource utilization. We recommend that you customize the OBD configuration file to maximize the resource utilization. 

### Test environment (Alibaba Cloud ECS)

| Service type | ECS type | Number of instances | Number of CPU cores | Memory |
| -------- | --------------- | ------ | ---------- | ------------------------------------------------------------------------------------- |
| OceanBase Database | ecs.g7.8xlarge | 3 | 32 | 128 GB. The system disk of each server is sized 300 GB. Two 400 GB cloud disks are mounted as the clog disk and data disk, respectively. The performance level is PL1. |
| BenchmarkSQL | ecs.c7.4xlarge | 1 | 16 | 32 GB |
| ODP | ecs.c7.16xlarge | 1 | 64 | 128 GB |

### Software versions

| Service type | Software version |
| ---------------- | -------------------- |
| OceanBase Database | OceanBase_CE 4.2.1.0 |
| ODP | OBProxy_CE 4.2.1.0 |
| BenchmarkSQL | BenchmarkSQL V5.0 |

### Tenant specifications

After deployment, you need to create a tenant and a user for the TPC-C benchmark. The sys tenant is a built-in tenant for cluster management and cannot be used for testing. Set the `primary_zone` parameter to `RANDOM`, which means that the leader of a new partition is randomly distributed to any OBServer node. 

```sql
CREATE RESOURCE UNIT tpcc_unit max_cpu 26, memory_size '100g';
CREATE RESOURCE POOL tpcc_pool unit = 'tpcc_unit', unit_num = 1, zone_list=('zone1','zone2','zone3');
CREATE TENANT tpcc_tenant resource_pool_list=('tpcc_pool'),  zone_list('zone1', 'zone2', 'zone3'), primary_zone=RANDOM, locality='F@zone1,F@zone2,F@zone3' set variables ob_compatibility_mode='mysql', ob_tcp_invited_nodes='%';
```

### Test specifications

```shell
warehouses=1000
loadWorkers=40
terminals=600
runMins = 5
newOrderWeight = 45
paymentWeight = 43
orderStatusWeight = 4
deliveryWeight = 4
stockLevelWeight = 4
```

## Use OBD to run the benchmark

> **Note**
>
> If you use OBD to run the test, the test cluster must be a cluster managed by OBD. By default, a cluster deployed by using OBD is managed by OBD. To use a cluster deployed by using another method as the test cluster, you need to take over the cluster to OBD. For more information, see [User Guide of OBD](https://en.oceanbase.com/docs/obd-en) in OceanBase Deployer Documentation. 

1. Install obtpcc.

   ```shell
   sudo yum install -y yum-utils
   sudo yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
   sudo yum install obtpcc java
   ```

2. Run the benchmark.

   ```shell
   obd test tpcc <deploy_name> --tenant=<tenant_name> --warehouses=1000 --load-workers=40 --terminals=800 --run-mins=5
   ```

   In the command, `deploy_name` specifies the cluster name and `tenant_name` specifies the name of the test tenant, which is `tpcc_tenant` in the 'Tenant specifications' section. You need to modify the cluster name and tenant name based on the actual situation. The `obd test tpcc` command automatically completes all operations, including generating test data, tuning performance parameters, importing data, and running the benchmark. For more information about the command, see **obd test tpcc** in [OBD Command > Testing commands](https://en.oceanbase.com/docs/community-obd-en-10000000001181574) in OceanBase Deployer Documentation. 

## Manually run the TPC-C benchmark

### Step 1: Install Ant

Perform the following steps to install Ant: 

1. Download Ant.

   ```shell
   [admin@test ~]$ wget "http://archive.apache.org/dist/ant/binaries/apache-ant-1.10.6-bin.zip"
   ```

2. Install Ant.

   ```shell
   [admin@test ~]$ unzip apache-ant-1.10.6-bin.zip
   ```

3. Set environment variables.

   ```shell
   [admin@test ~]$ sudo vim /etc/profile
   ```

   The content is as follows:

   ```shell
   #ant
   export ANT_HOME=xx/apache-ant-1.10.6
   export PATH=xx/apache-ant-1.10.6/bin:$PATH
   ```

   Run the following command for the configuration to take effect:

   ```shell
   [admin@test ~]$ source /etc/profile
   ```

4. Verify whether Ant is successfully installed.

   Run the following command to verify whether Ant is successfully installed: 

   ```shell
   [admin@test ~]$ ant -version
   ```

   If the following information is returned, Ant is successfully installed: 

   ```shell
   Apache Ant(TM) version 1.10.6 compiled on May 2 2019
   ```

### Step 2: Install BenchmarkSQL

Perform the following steps to install BenchmarkSQL: 

1. Download BenchmarkSQL.

   Download BenchmarkSQL from [SourceForge](https://sourceforge.net/projects/benchmarksql/files/latest/download). 

2. Download the BenchmarkSQL package.

   ```shell
   [admin@test ~]$ unzip benchmarksql-5.0.zip
   ```

3. Compile BenchmarkSQL.

   ```shell
   [admin@test ~]$ cd benchmarksql-5.0
   [admin@test benchmarksql-5.0]$ ant
   ```

### Step 3: Modify BenchmarkSQL 5

BenchmarkSQL 5.0 does not support running the TPC-C benchmark on OceanBase Database. This section provides a step-by-step guide on how to modify the BenchmarkSQL 5.0 source code to support OceanBase Database. 

1. Add OceanBase Database-related information to the `jTPCC.java` file in the `benchmarksql-5.0/src/client/` directory.

   ```java
   if (iDB.equals("firebird"))
               dbType = DB_FIREBIRD;
           else if (iDB.equals("oracle"))
               dbType = DB_ORACLE;
           else if (iDB.equals("postgres"))
               dbType = DB_POSTGRES;
           else if (iDB.equals("oceanbase"))   // Add OceanBase Database-related information.
               dbType = DB_OCEANBASE;
           else
           {
               log.error("unknown database type '" + iDB + "'");
               return;
           }
   ```

2. Add OceanBase Database as a database type in the `jTPCCConfig.java` file in the `benchmarksql-5.0/src/client/` directory.

   ```java
   public final static int         
   DB_UNKNOWN = 0,
   DB_FIREBIRD = 1,
   DB_ORACLE = 2,
   DB_POSTGRES = 3,
   DB_OCEANBASE = 4;
   ```

3. Use "AS L" to specify "L" as the alias for SQL subqueries in the `jTPCCConnection.java` file in the `benchmarksql-5.0/src/client/` directory.

   ```java
   default:
                   stmtStockLevelSelectLow = dbConn.prepareStatement(
                       "SELECT count(*) AS low_stock FROM (" +
                       "    SELECT s_w_id, s_i_id, s_quantity " +
                       "        FROM bmsql_stock " +
                       "        WHERE s_w_id = ? AND s_quantity < ? AND s_i_id IN (" +
                       "            SELECT ol_i_id " +
                       "                FROM bmsql_district " +
                       "                JOIN bmsql_order_line ON ol_w_id = d_w_id " +
                       "                 AND ol_d_id = d_id " +
                       "                 AND ol_o_id >= d_next_o_id - 20 " +
                       "                 AND ol_o_id < d_next_o_id " +
                       "                WHERE d_w_id = ? AND d_id = ? " +
                       "        ) " +
                       "    )AS L");    // Use AS L to specify "L" as the alias.
                   break;
   ```

4. Recompile the modified source code.

   ```shell
   [admin@test benchmarksql-5.0]# ant
   ```

5. Create a file named `prop.oceanbase` in the `benchmarksql-5.0/run` directory. 

   The file content is as follows:

   ```java
   db=oceanbase
   driver=com.mysql.jdbc.Driver
   conn=jdbc:mysql://$host_ip:$port/$db_name?rewriteBatchedStatements=true&allowMultiQueries=true&useLocalSessionState=true&useUnicode=true&characterEncoding=utf-8&socketTimeout=30000000
   // Enter the full user information.
   user=$user@$tenant
   password=*****
   warehouses=1000
   loadWorkers=40
   terminals = 800
   database=$db_name
   //To run specified transactions per terminal- runMins must equal zero
   runTxnsPerTerminal=0
   //To run for specified minutes- runTxnsPerTerminal must equal zero
   runMins = 5
   //Number of total transactions per minute
   limitTxnsPerMin=0
   //Set to true to run in 4.x compatible mode. Set to false to use the
   //entire configured database evenly.
   terminalWarehouseFixed=true
   //The following five values must add up to 100
   //The default percentages of 45, 43, 4, 4 & 4 match the TPC-C spec
   newOrderWeight = 45
   paymentWeight = 43
   orderStatusWeight = 4
   deliveryWeight = 4
   stockLevelWeight = 4
   // Directory name to create for collecting detailed result data.
   // Comment this out to suppress.
   resultDirectory=my_result_%tY-%tm-%td_%tH%tM%tS
   osCollectorScript=./misc/os_collector_linux.py
   osCollectorInterval=1
   //osCollectorSSHAddr=user@dbhost
   //osCollectorDevices=net_eth0 blk_sda
   ```

   Parameters in `prop.oceanbase` are described as follows:

   * JDBC connection string: `conn=jdbc:mysql://x.x.x.x(ip):xx(port)/xxxx(dbname)?rewriteBatchedStatements=true&allowMultiQueries=true&useLocalSessionState=true&useUnicode=true&characterEncoding=utf-8&socketTimeout=3000000`

   * `rewriteBatchedStatements`:

      * This parameter is essential and cannot be ignored. It can affect the data import efficiency. 

      * If data import is slow, log on to the corresponding tenant and run the `show full processlist` command to check whether data import is enabled. 

      * The batch update feature is also used in NewOrder transactions. So, you need to enable it in both the data import and the benchmarking stages. 

   * `terminals`: the number of concurrent threads. The default value is `800`. You can adjust it for a MySQL tenant as needed. The value range is (0, 10 × value of `warehouses`]. 

   * `useLocalSessionState`: specifies whether to use the internal values (local values on the JDBC client) of `autocommit`, `read_only`, and `transaction isolation`. We recommend that you set the value to `true`. Otherwise, requests need to be sent to the remote terminal, which increases the request frequency and compromises the performance. 

   * `warehouses` and `loadWorkers`: the data volume in the stress test, which can be adjusted as needed. 

6. Add OceanBase Database as a database type to the `funcs.sh` file in the `benchmarksql-5.0/run` directory.

   ```shell
   function setCP()
   {
       case "$(getProp db)" in
   firebird)
       cp="../lib/firebird/*:../lib/*"
       ;;
   oracle)
       cp="../lib/oracle/*"
       if [ ! -z "${ORACLE_HOME}" -a -d ${ORACLE_HOME}/lib ] ; then
     cp="${cp}:${ORACLE_HOME}/lib/*"
       fi
       cp="${cp}:../lib/*"
       ;;
   postgres)
       cp="../lib/postgres/*:../lib/*"
       ;;
   oceanbase)      # Add the OceanBase database type.
       cp="../lib/oceanbase/*:../lib/*"
       ;;
       esac
       myCP=".:${cp}:../dist/*"
       export myCP
   }

   ... Omitted

   case "$(getProp db)" in
       firebird|oracle|postgres|oceanbase)  # Add the OceanBase database type.
       ;;
       "") echo "ERROR: missing db= config option in ${PROPS}" >&2
       exit 1
       ;;
       *)  echo "ERROR: unsupported database type 'db=$(getProp db)' in ${PROPS}" >&2
       exit 1
       ;;
   esac
   ```

7. Add the MySQL JDBC driver. We recommend that you use `mysql-connector-java-5.1.47.jar`.

   ```shell
   [admin@test benchmarksql-5.0]# mkdir lib/oceanbase/
   [admin@test benchmarksql-5.0]# cp xx/mysql-connector-java-5.1.47.jar lib/oceanbase/
   ```

   You need to replace `xx/mysql-connector-java-5.1.47.jar` with the actual path of the `mysql-connector-java-5.1.47.jar` package. 

8. Modify the `runDatabaseBuild.sh` file in the `benchmarksql-5.0/run` directory.

   ```shell
   AFTER_LOAD="indexCreates foreignKeys extraHistID buildFinish"
   # Modified code:
   AFTER_LOAD="indexCreates buildFinish"
   ```

9. Modify `.sql` files in BenchMarkSQL 5.0.

   Back up and rewrite the `tableCreates.sql` file in the `benchmarksql-5.0/run/sql.common` directory. 

   ```sql
   CREATE TABLE bmsql_config (
     cfg_name    varchar(30) PRIMARY KEY,
     cfg_value   varchar(50)
   );

   CREATE TABLEGROUP IF NOT EXISTS tpcc_group binding true partition by hash partitions 96;

   CREATE TABLE bmsql_warehouse (
     w_id        integer   not null,
     w_ytd       decimal(12,2),
     w_tax       decimal(4,4),
     w_name      varchar(10),
     w_street_1  varchar(20),
     w_street_2  varchar(20),
     w_city      varchar(20),
     w_state     char(2),
     w_zip       char(9),
     PRIMARY KEY(w_id)
   )tablegroup='tpcc_group' partition by hash(w_id) partitions 96;

   CREATE TABLE bmsql_district (
     d_w_id       integer       not null,
     d_id         integer       not null,
     d_ytd        decimal(12,2),
     d_tax        decimal(4,4),
     d_next_o_id  integer,
     d_name       varchar(10),
     d_street_1   varchar(20),
     d_street_2   varchar(20),
     d_city       varchar(20),
     d_state      char(2),
     d_zip        char(9),
     PRIMARY KEY (d_w_id, d_id)
   )tablegroup='tpcc_group' partition by hash(d_w_id) partitions 96;

   CREATE TABLE bmsql_customer (
     c_w_id         integer        not null,
     c_d_id         integer        not null,
     c_id           integer        not null,
     c_discount     decimal(4,4),
     c_credit       char(2),
     c_last         varchar(16),
     c_first        varchar(16),
     c_credit_lim   decimal(12,2),
     c_balance      decimal(12,2),
     c_ytd_payment  decimal(12,2),
     c_payment_cnt  integer,
     c_delivery_cnt integer,
     c_street_1     varchar(20),
     c_street_2     varchar(20),
     c_city         varchar(20),
     c_state        char(2),
     c_zip          char(9),
     c_phone        char(16),
     c_since        timestamp,
     c_middle       char(2),
     c_data         varchar(500),
     PRIMARY KEY (c_w_id, c_d_id, c_id)
   )tablegroup='tpcc_group' partition by hash(c_w_id) partitions 96;


   CREATE TABLE bmsql_history (
     hist_id  integer AUTO_INCREMENT,
     h_c_id   integer,
     h_c_d_id integer,
     h_c_w_id integer,
     h_d_id   integer,
     h_w_id   integer,
     h_date   timestamp,
     h_amount decimal(6,2),
     h_data   varchar(24)
   )tablegroup='tpcc_group' partition by hash(h_w_id) partitions 96;

   CREATE TABLE bmsql_new_order (
     no_w_id  integer   not null ,
     no_d_id  integer   not null,
     no_o_id  integer   not null,
     PRIMARY KEY (no_w_id, no_d_id, no_o_id)
   )tablegroup='tpcc_group' partition by hash(no_w_id) partitions 96;

   CREATE TABLE bmsql_oorder (
     o_w_id       integer      not null,
     o_d_id       integer      not null,
     o_id         integer      not null,
     o_c_id       integer,
     o_carrier_id integer,
     o_ol_cnt     integer,
     o_all_local  integer,
     o_entry_d    timestamp,
     PRIMARY KEY (o_w_id, o_d_id, o_id)
   )tablegroup='tpcc_group' partition by hash(o_w_id) partitions 96;

   CREATE TABLE bmsql_order_line (
     ol_w_id         integer   not null,
     ol_d_id         integer   not null,
     ol_o_id         integer   not null,
     ol_number       integer   not null,
     ol_i_id         integer   not null,
     ol_delivery_d   timestamp,
     ol_amount       decimal(6,2),
     ol_supply_w_id  integer,
     ol_quantity     integer,
     ol_dist_info    char(24),
     PRIMARY KEY (ol_w_id, ol_d_id, ol_o_id, ol_number)
   )tablegroup='tpcc_group' partition by hash(ol_w_id) partitions 96;

   CREATE TABLE bmsql_item (
     i_id     integer      not null,
     i_name   varchar(24),
     i_price  decimal(5,2),
     i_data   varchar(50),
     i_im_id  integer,
     PRIMARY KEY (i_id)
   );

   CREATE TABLE bmsql_stock (
     s_w_id       integer       not null,
     s_i_id       integer       not null,
     s_quantity   integer,
     s_ytd        integer,
     s_order_cnt  integer,
     s_remote_cnt integer,
     s_data       varchar(50),
     s_dist_01    char(24),
     s_dist_02    char(24),
     s_dist_03    char(24),
     s_dist_04    char(24),
     s_dist_05    char(24),
     s_dist_06    char(24),
     s_dist_07    char(24),
     s_dist_08    char(24),
     s_dist_09    char(24),
     s_dist_10    char(24),
     PRIMARY KEY (s_w_id, s_i_id)
   )tablegroup='tpcc_group' partition by hash(s_w_id) partitions 96;
   ```

   Back up and rewrite the `tableDrops.sql` file in the `benchmarksql-5.0/run/sql.common` directory. 

   ```sql
   DROP TABLE bmsql_config;
   DROP TABLE bmsql_new_order;
   DROP TABLE bmsql_order_line;
   DROP TABLE bmsql_oorder;
   DROP TABLE bmsql_history;
   DROP TABLE bmsql_customer;
   DROP TABLE bmsql_stock;
   DROP TABLE bmsql_item;
   DROP TABLE bmsql_district;
   DROP TABLE bmsql_warehouse;
   DROP TABLEGROUP tpcc_group;
   ```

   Back up and rewrite the `indexCreates.sql` file in the `benchmarksql-5.0/run/sql.common` directory. 

   ```sql
   CREATE INDEX bmsql_customer_idx1 ON  bmsql_customer (c_w_id, c_d_id, c_last, c_first) local;
   CREATE  INDEX bmsql_oorder_idx1 ON  bmsql_oorder (o_w_id, o_d_id, o_carrier_id, o_id) local;
   ```

   Back up and rewrite the `indexDrops.sql` file in the `benchmarksql-5.0/run/sql.common` directory. 

   ```sql
   ALTER TABLE bmsql_customer DROP INDEX bmsql_customer_idx1;
   ALTER TABLE bmsql_oorder DROP INDEX bmsql_oorder_idx1;
   ```

### Step 4: Tune parameters

Before you run the TPC-C benchmark, you need to tune related parameters. 

To tune parameters of ODP, run the `obclient -h<host_ip> -P<host_port> -uroot@sys -A -p` command to connect to the sys tenant. 

> **Note**
>
> To modify ODP parameters, you must log on to the sys tenant of the OceanBase cluster by using the IP address and port of ODP. 

```sql
# Increase the maximum runtime memory of ODP
ALTER proxyconfig SET proxy_mem_limited='4G';
# Disable the compression protocol of ODP
ALTER proxyconfig set enable_compression_protocol=false;
```

To tune OceanBase Database parameters, run the `obclient -h<host_ip> -P<host_port> -uroot@sys -A -p` command to connect to the sys tenant. 

```sql
# Disable SQL audit
ALTER system SET enable_sql_audit=false;
# Disable information collection for performance events
ALTER system SET enable_perf_event=false;
# Set the syslog level to ERROR to reduce generated logs
ALTER system SET syslog_level='ERROR';
# Disable trace log recording
alter system set enable_record_trace_log=false;
```

### Step 5: Run the TPC-C benchmark

1. Initialize the environment.

   ```shell
   [admin@test run]$ ./runDatabaseDestroy.sh prop.oceanbase
   ```

2. Create a table and import data into the table.

   ```shell
   [admin@test run]$ ./runDatabaseBuild.sh prop.oceanbase
   ```

3. Perform a major compaction.

   Log on as the root user to the sys tenant of the OceanBase cluster. Run the following command to compact SSTables and MEMTables of the current major version with the full static data of an earlier version, to ensure that the storage-layer statistics are more accurate and the generated execution plan is more stable. 

   `<your tenant name>` indicates the name of the test tenant, which is `tpcc_tenant` in the [Tenant specifications](#Tenant_specifications) section. You need to replace it with the actual test tenant name. 

   ```shell
   MySQL [oceanbase]> ALTER SYSTEM major freeze tenant=<your tenant name>;
   Query OK, 0 rows affected
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

5. Manually collect statistics.

   Run the `obclient -h<host_ip> -P<host_port> -u<user_name>@<tenant_name> -p -A -D<db_name>` command to connect to the test tenant. Then, run the following command, where `$db_name` needs to be replaced with the `database` value configured in the `prop.oceanbase` file: 

   ```sql
   call dbms_stats.gather_schema_stats('$db_name',degree=>96);
   ```

6. Run the stress test.

   ```shell
   [admin@test run]$ ./runBenchmark.sh prop.oceanbase
   ```

## Test results

The performance test data is affected by various factors, such as hardware configurations, database installation and deployment modes, and resources allocated to the business tenant for testing. Therefore, the test results are for reference only and the actual performance data can vary depending on the environment. 

```shell
TPC-C Result
Measured tpmC (NewOrders) = 289711.96
Measured tpmTOTAL = 644025.66
```
