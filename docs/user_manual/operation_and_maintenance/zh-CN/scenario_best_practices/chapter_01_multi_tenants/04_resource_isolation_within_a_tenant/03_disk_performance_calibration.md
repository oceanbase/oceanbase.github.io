---
title: IOPS 资源隔离准备工作
weight: 3
---
## 磁盘性能校准

在控制 IOPS 资源隔离前，需要进行磁盘性能校准。如果您不需要控制 IOPS 资源隔离，请跳过此步骤。

### IOPS 基准值的计算

磁盘性能的校准主要是对磁盘的 IOPS 值进行校准。IOPS 基准值的计算公式如下：

`IOPS 基准值= Min(磁盘限制的 IOPS 值, (目标带宽 / I/O 操作的数据量))`

其中，目标带宽的取值需要考虑以下几个方面：

* 机器的规格，即实际申请的磁盘的限制带宽。

* 业务对 RT（Response Time）的敏感度要求。

* 需要除去 IO Manager 所使用的部分带宽。

* 通常需要为 Clog 预留 10~20 MB 的带宽。

以 16 KB 读数据为例，为磁盘计算 16 KB 读数据对应的 IOPS 基准值的方法如下。假设当前使用的磁盘的限制带宽为 600 MB，IOPS 为 30000，且业务对 RT 敏感度较高，如果完全使用 600 MB 时会导致抖动概率大大增加，再除去为 Clog 预留的带宽，综合考虑确认目标带宽为 400 MB。使用 16 KB 读数据计算出 400 MB 带宽最多可达到的 IOPS 为 `(400 * 1024 KB)/16 KB=25600`，故可以将 IOPS 的值校准为 25600。如果计算出来的 IOPS 值已经达到或超过了该磁盘的 IOPS 上限，例如，某种磁盘的 IOPS 最高为 10000，则可以将 IOPS 的值校准为 10000。

### 校准方式

OceanBase 数据库的磁盘性能校准功能用于对 OBServer 节点所在磁盘的读写性能进行校准。OceanBase 数据库当前支持通过以下两种方式进行磁盘的性能校准：

* 自动校准：通过 `JOB` 语句触发后台任务自动校准。

* 手动校准：通过主动刷新磁盘校准信息来手动校准。

### 自动校准

如果当前 OceanBase 集群为空负载，且磁盘有较多空闲空间，您可以通过 `JOB` 语句触发后台任务的方式自动对磁盘性能进行校准。该方式下，系统默认会对数据盘执行一次磁盘校准任务。

1. 使用 `root` 用户登录到集群的 `sys` 租户。

   连接示例如下，连接数据库时请以实际环境为准。

   ```shell
   obclient -h10.xx.xx.xx -P2883 -uroot@sys#obdemo -p***** -A
   ```

2. 根据业务使用场景，选择合适的命令，触发磁盘校准任务。

   * 对集群内的所有 OBServer 节点触发磁盘校准任务

     ```sql
     ALTER SYSTEM RUN JOB "job_name";
     ```

     其中，`job_name` 为指定的后台任务名称。磁盘校准任务对应的后台任务名称为 `io_calibration`。

     示例：

     ```sql
     ALTER SYSTEM RUN JOB "io_calibration";
     ```

   * 对指定 Zone 内的所有 OBServer 节点触发磁盘校准任务

     语句如下：

     ```sql
     ALTER SYSTEM RUN JOB "job_name" ZONE [=] zone_name;
     ```

     相关参数说明如下：

     * `job_name`：指定的后台任务名称。磁盘校准任务对应的后台任务名称为 `io_calibration`。
     * `zone_name`：指定待触发磁盘校准任务的 Zone。当前仅支持指定一个 Zone。

     示例：

     ```sql
     ALTER SYSTEM RUN JOB "io_calibration" ZONE = zone1;
     ```

   * 对指定的某个 OBServer 节点触发磁盘校准任务

     语句如下：

     ```sql
     ALTER SYSTEM RUN JOB "job_name" SERVER [=] 'svr_ip:svr_port';
     ```

     相关参数说明如下：

     * `job_name`：指定的后台任务名称。磁盘校准任务对应的后台任务名称为 `io_calibration`。
     * `svr_ip`：指定待触发磁盘校准任务的 OBServer 节点的 IP。当前仅支持指定一个 OBServer 节点。
     * `svr_port`：指定待触发磁盘校准任务的 OBServer 节点的 RPC 端口。

     示例：

     ```sql
     ALTER SYSTEM RUN JOB "io_calibration" SERVER = 'xx.xx.xx.1:2882';
     ```

3. 查看磁盘 I/O 校准状态。

   触发磁盘校准任务后，您可以通过 `GV$OB_IO_CALIBRATION_STATUS` 或 `V$OB_IO_CALIBRATION_STATUS` 视图确认 I/O 校准状态。

   ```sql
   SELECT * FROM oceanbase.V$OB_IO_CALIBRATION_STATUS;
   ```

   查询结果如下：

   ```shell
   +----------------+----------+--------------+-------------+----------------------------+-------------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | STATUS      | START_TIME                 | FINISH_TIME |
   +----------------+----------+--------------+-------------+----------------------------+-------------+
   | xx.xx.xx.197   |     2882 | DATA         | IN PROGRESS | 2023-06-27 14:30:38.393482 | NULL        |
   +----------------+----------+--------------+-------------+----------------------------+-------------+
   1 row in set
   ```

   磁盘 I/O 校准状态分为以下几种：

   * `NOT AVAILABLE`：表示未开始 I/O 校准。
   * `IN PROGRESS`：表示正在进行 I/O 校准。
   * `READY`：表示 I/O 校准已完成。
   * `FAILED`：表示 I/O 校准执行失败。
   
   从查询结果可知，`STATUS` 字段的值为 `IN PROGRESS`，表示正在进行磁盘 I/O 校准。待磁盘 I/O 校准完成后，`STATUS` 字段的值会变成 `READY`，表示磁盘校准已完成，同时 `FINISH_TIME` 字段中会显示完成时间。

   ```shell
   +----------------+----------+--------------+--------+----------------------------+----------------------------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | STATUS | START_TIME                 | FINISH_TIME                |
   +----------------+----------+--------------+--------+----------------------------+----------------------------+
   | xx.xx.xx.197   |     2882 | DATA         | READY  | 2023-06-27 14:25:20.202022 | 2023-06-27 14:27:00.398748 |
   +----------------+----------+--------------+--------+----------------------------+----------------------------+
   1 row in set
   ```

4. 确认磁盘 I/O 校准是否生效。

   待磁盘 I/O 校准完成后，您可以通过 `GV$OB_IO_BENCHMARK` 或 `V$OB_IO_BENCHMARK` 视图确认磁盘 I/O 校准是否生效。

   ```sql
   SELECT * FROM oceanbase.GV$OB_IO_BENCHMARK;
   ```

   查询结果的示例如下：

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

   相关字段的说明信息如下：

   * `STORAGE_NAME`：表示存储名称。`DATA` 表示数据盘。
   * `MODE`：表示 I/O 模式为读或者写。
   * `SIZE`：表示单个 I/O 请求的数据量，单位为字节。
   * `IOPS`：表示每秒钟完成 I/O 请求的数量。
   * `MBPS`：表示磁盘带宽，单位为 MB/s。
   * `LATENCY`：表示磁盘响应时间，单位为 us。

### 手动校准

如果当前 OceanBase 集群中已有负载，您可以通过主动刷新磁盘校准信息的方式手动对磁盘性能进行校准。

1. 使用 `root` 用户登录到集群的 `sys` 租户。

   连接示例如下，连接数据库时请以实际环境为准。

   ```shell
   obclient -h10.xx.xx.xx -P2883 -uroot@sys#obdemo -p***** -A
   ```

2. 根据业务使用场景，选择合适的命令，主动刷新磁盘校准信息。

   * 对集群内的所有 OBServer 节点刷新一次磁盘性能信息

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] [CALIBRATION_INFO [=] ("mode : size : latency : iops" [, "mode : size : latency : iops"])];
     ```

   * 清除集群内所有 OBServer 节点的磁盘性能信息

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] CALIBRATION_INFO = ("");
     ```

   * 对指定 Zone 内的所有 OBServer 节点刷新一次磁盘校准信息

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] [CALIBRATION_INFO [=] ("mode : size : latency : iops "[, "mode : size : latency : iops"])] ZONE [=] zone_name;
     ```

   * 对指定的 OBServer 节点刷新一次磁盘校准信息

     ```sql
     ALTER SYSTEM REFRESH IO CALIBRATION [STORAGE [=] 'storage_name'] [CALIBRATION_INFO [=] ("mode : size : latency : iops" [, "mode : size : latency : iops"])] SERVER [=] 'svr_ip:svr_port';
     ```

   相关参数说明如下：

   * `STORAGE`：指定 OceanBase 数据库存储盘的名称，当前仅支持 `DATA`，即数据盘。

   * `CALIBRATION_INFO`：指定待刷新的磁盘校准信息。如果不指定，则默认从内部表刷新磁盘性能信息。`CALIBRATION_INFO` 列表中，读、写模式都至少需要指定一条记录，否则系统会报错。

       <main id="notice" type='explain'>
       <h4>说明</h4>
       <p>指定磁盘校准信息时，如果当前没有相关磁盘的压测数据，您可以使用 FIO 工具执行一次性能压测来获取当前磁盘的性能数据，有关 FIO 工具的详细介绍及使用，请参见 <a href="https://fio.readthedocs.io/en/latest/index.html">FIO 工具官网</a>。</p>
       </main>

       * `mode`：指定 I/O 模式，支持 `r`、 `w`、`read` 或 `write`。
       * `size`：指定单个 I/O 请求的数据量，设置时必须指定为带单位的数值，例如：4K，单位支持 K、KB、M、MB、G、GB。
       * `latency`：指定磁盘响应时间，默认单位为秒，即如果指定的值为纯数字，则其单位默认为秒。强烈建议设置时指定单位，不要使用默认单位，单位支持 us、ms、s、min、h。
       * `iops`：指定每秒钟完成 I/O 请求的数量，单位为 1。

   * `zone_name`：指定待刷新磁盘校准信息的 Zone。当前仅支持指定一个 Zone。
   * `svr_ip`：指定待刷新磁盘校准信息的 OBServer 节点的 IP。
   * `svr_port`：指定待刷新磁盘校准信息的 OBServer 节点的 RPC 端口。
     
   示例：

   * 对集群内所有 OBServer 节点的数据盘从内部表刷新一次磁盘性能信息

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION;
      ```

   * 清除集群内所有 OBServer 节点数据盘的磁盘性能信息

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION CALIBRATION_INFO = ("");
      ```

   * 对 `zone1` 内的所有 OBServer 节点的数据盘刷新一次磁盘校准信息

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION STORAGE = 'DATA' CALIBRATION_INFO = ("read:4K:100us:200000","write:2M:5ms:1500") ZONE = zone1;
      ```

      本示例中，刷新的磁盘校准信息为：4KB 数据随机读的 RT 为 100 微秒，IOPS 为 200000，2MB 数据随机写的 RT 为 5 毫秒，IOPS 为 1500。

   * 对指定 OBServer 节点的数据盘刷新一次磁盘校准信息

      ```sql
      ALTER SYSTEM REFRESH IO CALIBRATION STORAGE = 'DATA' CALIBRATION_INFO = ("read:4K:100us:200000","write:2M:5ms:1500") SERVER = 'xx.xx.xx.1:2882';
      ```

3. 确认磁盘 I/O 校准是否生效。

   待磁盘校准信息刷新完成后，您可以通过 `GV$OB_IO_BENCHMARK` 或 `V$OB_IO_BENCHMARK` 视图确认磁盘 I/O 校准是否生效。

   ```sql
   SELECT * FROM oceanbase.GV$OB_IO_BENCHMARK;
   ```

   查询结果的示例如下：

   ```shell
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | MODE  | SIZE    | IOPS   | MBPS | LATENCY |
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   | xx.xx.xx.197   |     2882 | DATA         | READ  |    4096 | 200000 |  781 |     100 |
   +----------------+----------+--------------+-------+---------+--------+------+---------+
   1 rows in set
   ```

   相关字段的说明信息如下：

   * `STORAGE_NAME`：表示存储名称。`DATA` 表示数据盘。
   * `MODE`：表示 I/O 模式为读或者写。
   * `SIZE`：表示单个 I/O 请求的数据量，单位为字节。
   * `IOPS`：表示每秒钟完成 I/O 请求的数量。
   * `MBPS`：表示磁盘带宽，单位为 MB/s。
   * `LATENCY`：表示磁盘响应时间，单位为微秒。