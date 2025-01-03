---
title: Other common test items
weight: 8
---

# 3.7 Other common test items

## Parallel import

Create an empty table named `customer2` with the same schema as the `customer` table in the TPC-H benchmark test. Then, execute the `INSERT INTO ...SELECT` statement to insert all the 15 million rows of the `customer` table into the `customer2` table. Insert the data when parallel DML (PDML) is enabled and disabled respectively to observe the effects and differences. 

Copy the schema of the `customer` table and create an empty table named `customer2` based on the copied schema. 

```sql
CREATE TABLE customer2 LIKE customer;
```

* Insert data without enabling PDML

   After you create the `customer2` table, insert data into the table without enabling PDML. This is a large transaction that involves 15 million rows. Therefore, you need to set the maximum execution time of SQL statements in OceanBase Database to a larger value, in μs.

   ```sql
   SET ob_query_timeout = 21600000000;
   ```

   Execute the following statement to insert data:

   ```shell
   obclient [test]> INSERT INTO customer2 SELECT * FROM customer;
   ```

   According to the following output, when PDML is disabled, it takes 110 seconds for a single transaction to insert 15 million rows in OceanBase Database. 

   ```shell
   Query OK, 15000000 rows affected (1 min 50.043 sec)
   Records: 15000000  Duplicates: 0  Warnings: 0
   ```

* Insert data with PDML enabled

   Add a hint to the statement to enable PDML. Before you insert data again, you need to execute the following statement to truncate the data inserted earlier: 

   ```shell
   obclient [test]> TRUNCATE TABLE customer2;
   ```

   Generally, if you do not need to execute multiple SQL statements in parallel, you can set the degree of parallelism (DOP) of a single SQL statement to the number of CPU cores of the tenant. Here is an example:

   ```shell
   obclient [test]> INSERT /*+ parallel(22) enable_parallel_dml */ INTO customer2 SELECT * FROM customer;
   ```

   According to the following output, after PDML is enabled, the time taken to insert 15 million rows is reduced to about 17.3 seconds. 

   ```shell
   Query OK, 15000000 rows affected (17.319 sec)
   Records: 15000000  Duplicates: 0  Warnings: 0
   ```

To sum up, PDML can help improve the performance by about 6.3 times. You can enable PDML in scenarios that involve batch data processing. 

## Data compression

OceanBase Database has its own storage engine based on the log-structured merge-tree (LSM-tree) structure. Data is roughly classified into baseline data and incremental data. Baseline data is stored in SSTables on the disk, and incremental data is stored in MemTables in the memory. In this way, data can be stored on the disk in a more compact manner. Baseline data on the disk is not frequently updated, and OceanBase Database re-compresses the baseline data based on a general compression algorithm. Therefore, data stored in OceanBase Database has a high compression ratio without compromising the query or write performance. 

You can import a large amount of data to OceanBase Database and check the data compression ratio. You can use the test data for the TPC-H benchmark in the '3.5 Run the TPC-H benchmark' section. After you import the data, initiate a major compaction to compact and compress the incremental data with the baseline data. 

1. Initiate a major compaction.

   Log on as the root user to the sys tenant and execute the following statement: 

   ```shell
   obclient [oceanbase]> ALTER SYSTEM major freeze tenant=mysql_tenant;
   ```

   In the statement, `mysql_tenant` is the tenant on which a data compression test is to be performed. You need to replace it with the actual tenant name. 

2. Check whether the major compaction is completed.

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

3. View the occupied storage space.

   Execute the following statement in the sys tenant to view the storage space occupied after data is imported. Here, the storage space occupied by the leaders of the `lineitem` table is queried. 

   ```shell
   obclient [oceanbase]> select t1.table_name,
       round(sum(t2.data_size)/1024/1024/1024,2) as data_size_gb,
       round(sum(t2.required_size)/1024/1024/1024,2) as required_size_gb
       from dba_ob_tenants t,cdb_ob_table_locations t1,cdb_ob_tablet_replicas t2
       where t.tenant_id=t1.tenant_id
       and t1.svr_ip=t2.svr_ip
       and t1.tenant_id=t2.tenant_id
       and t1.ls_id=t2.ls_id
       and t1.tablet_id=t2.tablet_id
       and t1.role='leader'
       and t.tenant_name='perf'
       and t1.database_name='test'
       and t1.table_name='lineitem'
       group by t1.table_name
       order by 3 desc;
   ```

   According to the following output, the total size of data before it is imported to the `lineitem` table is 75 GB, the data size after compression is 22.15 GB, and the required disk space is 23.11 GB, achieving a compression ratio of 3.2, which is calculated by dividing 75 by 23.11. 

   > **Note**
   >
   > In the output, the value of `required_size_gb` is greater than that of `data_size_gb` because the minimum unit for data storage is macroblock, which is 2 MB in size. 

   ```shell
   +------------+--------------+------------------+
   | table_name | data_size_gb | required_size_gb |
   +------------+--------------+------------------+
   | lineitem   |        22.15 |            23.11 |
   +------------+--------------+------------------+
   ```

## High availability

High-availability disaster recovery at the cluster level is one of the highlights of a distributed database and is measured based on the recovery time objective (RTO). OceanBase Database V4.x has achieved an RTO of less than 8s. 

You can use the oltp_read_write.lua test case of Sysbench to simulate continuous business requests. During stress testing, you can run `kill -9` to make a leader faulty and then observe the period during which the queries per second (QPS) or transactions per second (TPS) value decreases to and remains 0. 

Here, you need to specify the `--mysql-ignore-errors` parameter to ignore the 1062, 2013, 4265, 5066, 6002, 6213, 6224, 6222, 4746, 4012, 4009, 4250, 4009, and 4038 error codes, so that the client is not disconnected due to an error code. Here is an example:

```shell
sysbench oltp_read_write.lua --mysql-host=xxx --mysql-port=xxx --mysql-user=root@mysql --mysql-db=sysbench --mysql-password=test --threads=400 --report-interval=1 --tables=10 --table_size=500000 --mysql-ignore-errors=1062,2013,4265,5066,6002,6213,6224,6222,4746,4012,4009,4250,4009,4038 --time=600 --db-ps-mode=disable run
```

According to the following output, the TPS value remains at about 500 and decreases within the period from 21s to 27s, which means that services resume within 8s. In other words, the RTO is less than 8s. 

```shell
[ 13s ] thds: 400 tps: 190.00 qps: 3431.03 (r/w/o: 2700.03/380.00/351.00) lat (ms,99%): 1938.16 err/s: 0.00 reconn/s: 0.00
[ 14s ] thds: 400 tps: 452.00 qps: 8034.99 (r/w/o: 6234.99/885.00/915.00) lat (ms,99%): 2045.74 err/s: 0.00 reconn/s: 0.00
[ 15s ] thds: 400 tps: 464.00 qps: 8466.98 (r/w/o: 6591.98/945.00/930.00) lat (ms,99%): 1304.21 err/s: 0.00 reconn/s: 0.00
[ 16s ] thds: 400 tps: 404.00 qps: 7723.98 (r/w/o: 6036.98/865.00/822.00) lat (ms,99%): 1280.93 err/s: 0.00 reconn/s: 0.00
[ 17s ] thds: 400 tps: 515.99 qps: 8798.78 (r/w/o: 6818.83/971.98/1007.97) lat (ms,99%): 1479.41 err/s: 0.00 reconn/s: 0.00
[ 18s ] thds: 400 tps: 546.01 qps: 9694.12 (r/w/o: 7528.10/1071.01/1095.01) lat (ms,99%): 1149.76 err/s: 0.00 reconn/s: 0.00
[ 19s ] thds: 400 tps: 555.99 qps: 9973.84 (r/w/o: 7746.88/1109.98/1116.98) lat (ms,99%): 861.95 err/s: 0.00 reconn/s: 0.00
[ 20s ] thds: 400 tps: 551.02 qps: 10089.34 (r/w/o: 7873.26/1121.04/1095.04) lat (ms,99%): 846.57 err/s: 0.00 reconn/s: 0.00
[ 21s ] thds: 400 tps: 267.00 qps: 4857.99 (r/w/o: 3763.99/534.00/560.00) lat (ms,99%): 831.46 err/s: 0.00 reconn/s: 0.00
[ 22s ] thds: 400 tps: 0.00 qps: 0.00 (r/w/o: 0.00/0.00/0.00) lat (ms,99%): 0.00 err/s: 0.00 reconn/s: 0.00
[ 23s ] thds: 400 tps: 0.00 qps: 0.00 (r/w/o: 0.00/0.00/0.00) lat (ms,99%): 0.00 err/s: 0.00 reconn/s: 0.00
[ 24s ] thds: 400 tps: 0.00 qps: 0.00 (r/w/o: 0.00/0.00/0.00) lat (ms,99%): 0.00 err/s: 0.00 reconn/s: 0.00
[ 25s ] thds: 400 tps: 0.00 qps: 0.00 (r/w/o: 0.00/0.00/0.00) lat (ms,99%): 0.00 err/s: 0.00 reconn/s: 0.00
[ 26s ] thds: 400 tps: 0.00 qps: 211.00 (r/w/o: 90.00/0.00/121.00) lat (ms,99%): 0.00 err/s: 0.00 reconn/s: 178.00
[ 27s ] thds: 400 tps: 3.00 qps: 1765.86 (r/w/o: 1531.88/10.00/223.98) lat (ms,99%): 6594.16 err/s: 0.00 reconn/s: 174.99
[ 28s ] thds: 400 tps: 449.03 qps: 10079.67 (r/w/o: 8246.55/935.06/898.06) lat (ms,99%): 7895.16 err/s: 0.00 reconn/s: 2.00
[ 29s ] thds: 400 tps: 612.00 qps: 10188.00 (r/w/o: 7714.00/1268.00/1206.00) lat (ms,99%): 816.63 err/s: 0.00 reconn/s: 0.00
[ 30s ] thds: 400 tps: 550.03 qps: 10166.58 (r/w/o: 7971.46/1084.06/1111.06) lat (ms,99%): 831.46 err/s: 0.00 reconn/s: 0.00
[ 31s ] thds: 400 tps: 571.96 qps: 10246.31 (r/w/o: 7956.46/1139.92/1149.92) lat (ms,99%): 831.46 err/s: 0.00 reconn/s: 0.00
```
