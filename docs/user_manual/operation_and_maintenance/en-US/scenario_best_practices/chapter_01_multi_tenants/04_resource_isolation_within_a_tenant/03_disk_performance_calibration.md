---
title: Prepare for IOPS Resource Isolation
weight: 3
---
## Calibrate the Disk Performance

Before you perform IOPS resource isolation, you must calibrate the disk performance. If IOPS resource isolation is not required, skip this step.

### Calculate the baseline IOPS value

Disk performance calibration is mainly about calibrating the IOPS value of the disk. The formula for calculating the baseline IOPS value is as follows:

`Baseline IOPS value = Min(Maximum IOPS value supported by the disk, (Target bandwidth/Amount of data involved in I/O operations))`

You must consider the following aspects when you determine the target bandwidth:

* Specifications of the server, specifically, the bandwidth limit of the disk

* Sensitivity requirements on the response time (RT)

* Bandwidth used by the I/O manager, which must be excluded

* 10 to 20 MB/s of bandwidth reserved for clogs

The baseline IOPS value for 16 KB reads on the disk is calculated as follows: Assume that the bandwidth limit of the disk is 600 MB/s, the IOPS is 30,000, and your business is highly sensitive to the RT. The probability of jitters will significantly increase if the entire bandwidth is used. Therefore, 400 MB/s is taken as the target bandwidth considering other factors such as the bandwidth reserved for clogs. The maximum IOPS allowed for 16 KB reads with a bandwidth of 400 MB/s is `(400 × 1024 KB)/16 KB = 25600`. Therefore, you can calibrate the IOPS value to 25600. If the calculated IOPS value reaches or exceeds the IOPS limit of the disk, such as 10000, you can calibrate the IOPS value to 10000.

### Calibration methods

OceanBase Database provides the disk performance calibration feature for you to calibrate the read/write performance of the disk where an OBServer node resides. At present, OceanBase Database supports two disk performance calibration modes:

* Automatic calibration: A background automatic calibration job is triggered by the `ALTER SYSTEM RUN JOB` statement.

* Manual calibration: You can refresh the disk performance information for manual calibration.

### Automatic calibration

If the current OceanBase cluster runs with zero load and the data disk has much idle space, you can execute the `ALTER SYSTEM RUN JOB` statement to trigger a background job to automatically calibrate the disk performance. In this mode, the system automatically calibrates the data disk.

1. Log in to the `sys` tenant of the cluster as the `root` user.

   Note that you must specify the corresponding parameters in the following sample code based on your actual database configurations.

   ```shell
   obclient -h10.xx.xx.xx -P2883 -uroot@sys#obdemo -p***** -A
   ```

2. Trigger a disk calibration job by using an appropriate statement based on business scenarios.

   * Trigger a disk calibration job for all OBServer nodes in a cluster
     
     The syntax is as follows:

     ```sql
     ALTER SYSTEM RUN JOB "job_name";
     ```

     In the statement, `job_name` specifies the name of the background job. To trigger a background disk calibration job, specify `io_calibration`.

     Here is an example:

     ```sql
     ALTER SYSTEM RUN JOB "io_calibration";
     ```

   * Trigger a disk calibration job for all OBServer nodes in a specified zone

     The syntax is as follows:

     ```sql
     ALTER SYSTEM RUN JOB "job_name" ZONE [=] zone_name;
     ```

     The parameters are described as follows:

     * `job_name`: the name of the background job. To trigger a background disk calibration job, specify `io_calibration`.
     * `zone_name`: the name of the zone for which the disk calibration job is to be triggered. At present, you can specify only one zone.

     Here is an example:

     ```sql
     ALTER SYSTEM RUN JOB "io_calibration" ZONE = zone1;
     ```

   * Trigger a disk calibration job for a specified OBServer node

     The syntax is as follows:

     ```sql
     ALTER SYSTEM RUN JOB "job_name" SERVER [=] 'svr_ip:svr_port';
     ```

     The parameters are described as follows:

     * `job_name`: the name of the background job. To trigger a background disk calibration job, specify `io_calibration`.
     * `svr_ip`: the IP address of the OBServer node for which the disk calibration job is to be triggered. At present, you can specify only one OBServer node.
     * `svr_port`: the remote procedure call (RPC) port of the OBServer node for which the disk calibration job is to be triggered.

     Here is an example:

     ```sql
     ALTER SYSTEM RUN JOB "io_calibration" SERVER = 'xx.xx.xx.1:2882';
     ```

3. Query the disk I/O calibration status.

   After you trigger a disk calibration job, you can query the `GV$OB_IO_CALIBRATION_STATUS` or `V$OB_IO_CALIBRATION_STATUS` view for the I/O calibration status.

   ```sql
   SELECT * FROM oceanbase.V$OB_IO_CALIBRATION_STATUS;
   ```

   The query result is as follows:

   ```shell
   +----------------+----------+--------------+-------------+----------------------------+-------------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | STATUS      | START_TIME                 | FINISH_TIME |
   +----------------+----------+--------------+-------------+----------------------------+-------------+
   | xx.xx.xx.197   |     2882 | DATA         | IN PROGRESS | 2023-06-27 14:30:38.393482 | NULL        |
   +----------------+----------+--------------+-------------+----------------------------+-------------+
   1 row in set
   ```

   Possible I/O calibration states include the following ones:

   * `NOT AVAILABLE`: I/O calibration is not started.
   * `IN PROGRESS`: I/O calibration is in progress.
   * `READY`: I/O calibration is completed.
   * `FAILED`: I/O calibration failed.
   
   In the sample query result, the value of the `STATUS` column is `IN PROGRESS`, indicating that disk I/O calibration is in progress. After the disk I/O calibration is completed, the value of the `STATUS` column changes to `READY`, and the completion time is displayed in the `FINISH_TIME` column.

   ```shell
   +----------------+----------+--------------+--------+----------------------------+----------------------------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | STATUS | START_TIME                 | FINISH_TIME                |
   +----------------+----------+--------------+--------+----------------------------+----------------------------+
   | xx.xx.xx.197   |     2882 | DATA         | READY  | 2023-06-27 14:25:20.202022 | 2023-06-27 14:27:00.398748 |
   +----------------+----------+--------------+--------+----------------------------+----------------------------+
   1 row in set
   ```

4. Verify whether the disk I/O calibration takes effect.

   After the disk I/O calibration is completed, you can query the `GV$OB_IO_BENCHMARK` or `V$OB_IO_BENCHMARK` view to check whether the calibration takes effect.

   ```sql
   SELECT * FROM oceanbase.GV$OB_IO_BENCHMARK;
   ```

   A sample query result is as follows:

   ```shell
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | MODE  | SIZE    | IOPS   | MBPS | LATENCY |
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   | xx.xx.xx.197   |     2882 | DATA         | READ  |    4096 | 124648 |  486 |     128 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |    8192 | 118546 |  926 |     134 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |   16384 |  98870 | 1544 |     161 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |   32768 |  73857 | 2308 |     216 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |   65536 |  48015 | 3000 |     332 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |  131072 |  33780 | 4222 |     473 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |  262144 |  20650 | 5162 |     774 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  |  524288 |  12111 | 6055 |    1321 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  | 1048576 |   6237 | 6237 |    2565 |
   | xx.xx.xx.197   |     2882 | DATA         | READ  | 2097152 |   2762 | 5524 |    5795 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |    4096 |  49771 |  194 |     321 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |    8192 |  48566 |  379 |     329 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |   16384 |  42784 |  668 |     373 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |   32768 |  35187 | 1099 |     454 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |   65536 |  24892 | 1555 |     642 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |  131072 |  12720 | 1590 |    1257 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |  262144 |   6889 | 1722 |    2322 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE |  524288 |   3452 | 1726 |    4636 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE | 1048576 |   1689 | 1689 |    9481 |
   | xx.xx.xx.197   |     2882 | DATA         | WRITE | 2097152 |    876 | 1752 |   18296 |
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   20 rows in set
   ```

   The columns in the query result are described as follows:

   * `STORAGE_NAME`: the name of the storage disk. `DATA` indicates a data disk.
   * `MODE`: the I/O mode, which can be read or write.
   * `SIZE`: the size of each I/O request, in bytes.
   * `IOPS`: the number of I/O requests completed per second.
   * `MBPS`: the disk bandwidth, in MB/s.
   * `LATENCY`: the RT of the disk, in microseconds.

### Manual calibration

If the current OceanBase cluster runs at a load, you can actively refresh the disk performance information to manually calibrate the disk performance.

1. Log in to the `sys` tenant of the cluster as the `root` user.

   Note that you must specify the corresponding parameters in the following sample code based on your actual database configurations.

   ```shell
   obclient -h10.xx.xx.xx -P2883 -uroot@sys#obdemo -p***** -A
   ```

2. Actively refresh the disk performance information by using an appropriate statement based on business scenarios.

   * Refresh the disk performance information for all OBServer nodes in the cluster

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] [CALIBRATION_INFO [=] ("mode : size : latency : iops" [, "mode : size : latency : iops"])];
     ```

   * Clear the disk performance information of all OBServer nodes in the cluster

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] CALIBRATION_INFO = ("");
     ```

   * Refresh the disk performance information for all OBServer nodes in a specified zone

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] [CALIBRATION_INFO [=] ("mode : size : latency : iops "[, "mode : size : latency : iops"])] ZONE [=] zone_name;
     ```

   * Refresh the disk performance information for a specified OBServer node

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] [CALIBRATION_INFO [=] ("mode : size : latency : iops" [, "mode : size : latency : iops"])] SERVER [=] 'svr_ip:svr_port';
     ```

   The parameters are described as follows:

   * `STORAGE`: the name of the storage disk of OceanBase Database. At present, the value can be only `DATA`, which indicates a data disk.

   * `CALIBRATION_INFO`: the disk performance information to be refreshed. If you do not specify this parameter, the disk performance information is refreshed from the internal table by default. When you set `CALIBRATION_INFO`, you must specify at least one record for both the read and write modes. Otherwise, the system returns an error.

       <main id="notice" type='explain'>
       <h4>Note</h4>
       <p>When you specify disk performance information, if no stress testing data of the current disk is available, you can use the flexible I/O (FIO) tester to perform a performance stress test to obtain performance data of the current disk. For more information about the FIO tester, visit its <a href="https://fio.readthedocs.io/en/latest/index.html">official website</a>. </p>
       </main>

       * `mode`: the I/O mode. Valid values are `r`, `w`, `read`, and `write`.
       * `size`: the size of a single I/O request. The value must be followed by a unit, such as 4K. Supported units are KB (K), MB (M), and GB (G).
       * `latency`: the RT of the disk. If a numeric value is specified, the default unit is seconds. We recommend that you specify a unit together with a value and do not use the default unit. Supported units are us, ms, s, min, and h.
       * `iops`: the number of I/O requests processed per second.

   * `zone_name`: the zone for which the disk performance information is to be refreshed. At present, you can specify only one zone.
   * `svr_ip`: the IP address of the OBServer node for which the disk performance information is to be refreshed.
   * `svr_port`: the RPC port of the OBServer node for which the disk performance information is to be refreshed.
     
   Here is an example:

   * Refresh the disk performance information for the data disks of all OBServer nodes in the cluster from the internal table

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION;
      ```

   * Clear the disk performance information of data disks of all OBServer nodes in the cluster

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION CALIBRATION_INFO = ("");
      ```

   * Refresh the disk performance information for the data disks of all OBServer nodes in `zone1`

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION STORAGE = 'DATA' CALIBRATION_INFO = ("read:4K:100us:200000","write:2M:5ms:1500") ZONE = zone1;
      ```

      In this example, the refreshed disk performance information is as follows: The RT of random reads of 4 KB data is 100 μs with an IOPS value of 200000. The RT of random writes of 2 MB data is 5 ms with an IOPS value of 1500.

   * Refresh the disk performance information for the data disk of a specified OBServer node

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION STORAGE = 'DATA' CALIBRATION_INFO = ("read:4K:100us:200000","write:2M:5ms:1500") SERVER = 'xx.xx.xx.1:2882';
      ```

3. Verify whether the disk I/O calibration takes effect.

   After the disk performance information is refreshed, you can query the `GV$OB_IO_BENCHMARK` or `V$OB_IO_BENCHMARK` view to confirm whether the disk I/O calibration takes effect.

   ```sql
   SELECT * FROM oceanbase.GV$OB_IO_BENCHMARK;
   ```

   A sample query result is as follows:

   ```shell
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | MODE  | SIZE    | IOPS   | MBPS | LATENCY |
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   | xx.xx.xx.197   |     2882 | DATA         | READ  |    4096 | 200000 |  781 |     100 |
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   1 rows in set
   ```

   The columns in the query result are described as follows:

   * `STORAGE_NAME`: the name of the storage disk. `DATA` indicates a data disk.
   * `MODE`: the I/O mode, which can be read or write.
   * `SIZE`: the size of each I/O request, in bytes.
   * `IOPS`: the number of I/O requests completed per second.
   * `MBPS`: the disk bandwidth, in MB/s.
   * `LATENCY`: the RT of the disk, in microseconds.