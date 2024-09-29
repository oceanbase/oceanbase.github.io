---
title: Run the Sysbench benchmark
weight: 4
---

# 3.3 Run the Sysbench benchmark

Sysbench is a LuaJIT-based multi-thread benchmark tool that allows you to write scripts to test the CPU, memory, thread, I/O, and database performance. It is often used to evaluate and test the database workload under various system parameter configurations. You can run the Sysbench benchmark to test a variety of database businesses by customizing Lua scripts without modifying the source code. 

This topic describes two methods to run the Sysbench benchmark on OceanBase Database in a CentOS Linux 7.9 environment based on the x86 architecture.

* Use OceanBase Deployer (OBD) to run the benchmark. 

* Use the official Sysbench tool to manually run the Sysbench benchmark step by step. 

## Use obdiag to inspect the cluster before running the benchmark

OceanBase Database is a native distributed database system. Root cause analysis for faults is complex because a variety of factors need to be considered, such as the server environment, parameters, and runtime load. Experts must collect and analyze extensive information during troubleshooting. Therefore, [OceanBase Diagnostic Tool obdiag](https://en.oceanbase.com/docs/common-obdiag-en-10000000001574808) is introduced to help efficiently collect information scattered on various nodes. Before you run the Sysbench benchmark, you can use obdiag to perform a health check on OceanBase Database. 

## Prepare the environment

* Java Development Kit (JDK): Use V1.8u131 or later.

* Sysbench: Use Sysbench V1.0 or later.

* CMake: Run the `sudo yum install make` command to install CMake.

* Automake: Run the `sudo yum install automake` command to install Automake.

* Autoconf: Run the `sudo yum install autoconf` command to install Autoconf.

* Libtool: Run the `sudo yum install libtool` command to install Libtool.

* GNU Compiler Collection (GCC): Run the `sudo yum install gcc` command to install GCC.

* MariaDB-devel: Run the `sudo yum install mariadb-devel mariadb` command to install MariaDB-devel.

* OceanBase Client (OBClient): For information about OBClient, see the [GitHub repository](https://github.com/oceanbase/obclient).

> **Notice**
>
> In OBClient V2.2.0 or later, the OceanBase 2.0 protocol and end-to-end tracing are enabled by default, which will affect the performance in the Sysbench benchmark. We recommend that you set the `export ENABLE_PROTOCOL_OB20` environment variable to `0` to disable the protocol. 

## Test plan

The Sysbench benchmark requires five servers, one for deploying Sysbench and OBD, one for deploying OceanBase Database Proxy (ODP) separately, and three for deploying an OceanBase cluster that has three zones, with each containing one OBServer node. 

> **Notice**
>
> * We recommend that you deploy ODP on a separate server to avoid resource contention with OceanBase Database. 
>
> * We recommend that you set input/output operations per second (IOPS) to a value greater than 10000, and configure three disks for system logs, transaction logs, and data files, respectively. 
>
> * If you use OBD to deploy the cluster, we recommend that you do not use the `obd cluster autodeploy` command. This is because for consideration of system stability, the command will not maximize the resource utilization. We recommend that you customize the OBD configuration file to maximize the resource utilization. 

### Test environment (Alibaba Cloud ECS)

| Service type | ECS type | Number of instances | Number of CPU cores | Memory |
| -------- | --------------- | ------ | ---------- | ------------------------------------------------------------------------------------- |
| OceanBase Database | ecs.g7.8xlarge | 3 | 32 | 128 GB. The system disk of each server is sized 300 GB. Two 400 GB cloud disks are mounted as the clog disk and data disk, respectively. The performance level is PL1. |
| Sysbench | ecs.c7.4xlarge | 1 | 16 | 32 GB |
| ODP | ecs.c7.16xlarge | 1 | 64 | 128 GB |

### Software versions

| Service type | Software version |
| ---------------- | -------------------- |
| OceanBase Database | OceanBase_CE 4.2.1.0 |
| ODP | OBProxy_CE 4.2.1.0 |
| Sysbench | 1.0.20 |

### Tenant specifications

After deployment, you need to create a tenant and a user for running the Sysbench benchmark. The sys tenant is a built-in tenant for cluster management and cannot be used for testing. Set the `primary_zone` parameter to `RANDOM`, which means that the leader of a new partition is randomly distributed to any OBServer node. 

```sql
CREATE RESOURCE UNIT sysbench_unit max_cpu 26, memory_size '100g';
CREATE RESOURCE POOL sysbench_pool unit = 'sysbench_unit', unit_num = 1, zone_list=('zone1','zone2','zone3');
CREATE TENANT sysbench_tenant resource_pool_list=('sysbench_pool'),  zone_list('zone1', 'zone2', 'zone3'), primary_zone=RANDOM, locality='F@zone1,F@zone2,F@zone3' set variables ob_compatibility_mode='mysql', ob_tcp_invited_nodes='%';
```

## Use OBD to run the benchmark

> **Note**
>
> If you use OBD to run the test, the test cluster must be a cluster managed by OBD. By default, a cluster deployed by using OBD is managed by OBD. To use a cluster deployed by using another method as the test cluster, you need to take over the cluster to OBD. For more information, see [User Guide of OBD](https://en.oceanbase.com/docs/community-obd-en-10000000001181553) in OceanBase Deployer Documentation. 

1. Install ob-sysbench.

   The ob-sysbench tool encapsulates the native Sysbench tool to improve the ease of use. Run the following command to install ob-sysbench: 

   ```shell
   sudo yum install -y yum-utils
   sudo yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
   sudo yum install ob-sysbench
   ```

2. Write the test script.

   In this example, the script is named `ob_sysbench.sh`. You can specify a custom name. In the script, `deploy_name` specifies the cluster name and `tenant_name` specifies the name of the test tenant, which is `sysbench_tenant` in the 'Tenant specifications' section. You need to modify the cluster name and tenant name based on the actual situation. 

   ```shell
   #!/bin/bash
   export ENABLE_PROTOCOL_OB20=0

   echo "run oltp_point_select test"
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_point_select.lua --table-size=1000000 --threads=32 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_point_select.lua --table-size=1000000 --threads=64 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_point_select.lua --table-size=1000000 --threads=128 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_point_select.lua --table-size=1000000 --threads=256 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_point_select.lua --table-size=1000000 --threads=512 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_point_select.lua --table-size=1000000 --threads=1024 --rand-type=uniform

   echo "run oltp_read_only test"
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_only.lua --table-size=1000000 --threads=32 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_only.lua --table-size=1000000 --threads=64 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_only.lua --table-size=1000000 --threads=128 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_only.lua --table-size=1000000 --threads=256 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_only.lua --table-size=1000000 --threads=512 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_only.lua --table-size=1000000 --threads=1024 --rand-type=uniform

   echo "run oltp_write_only test"
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_write_only.lua --table-size=1000000 --threads=32 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_write_only.lua --table-size=1000000 --threads=64 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_write_only.lua --table-size=1000000 --threads=128 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_write_only.lua --table-size=1000000 --threads=256 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_write_only.lua --table-size=1000000 --threads=512 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_write_only.lua --table-size=1000000 --threads=1024 --rand-type=uniform

   echo "run oltp_read_write test"
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_write.lua --table-size=1000000 --threads=32 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_write.lua --table-size=1000000 --threads=64 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_write.lua --table-size=1000000 --threads=128 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_write.lua --table-size=1000000 --threads=256 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_write.lua --table-size=1000000 --threads=512 --rand-type=uniform
   obd test sysbench <deploy_name> --tenant=<tenant_name> --script-name=oltp_read_write.lua --table-size=1000000 --threads=1024 --rand-type=uniform
   ```

3. Run the benchmark.

   ```shell
   ./ob_sysbench.sh
   ```

   After you run the script, the system lists the steps and outputs. This process takes a longer time when a larger amount of data is involved. The `obd test sysbench` command automatically completes all operations, including generating test data, tuning performance parameters, importing data, and running the benchmark. For more information about the command, see **obd test sysbench** in [OBD Command > Testing commands](https://en.oceanbase.com/docs/community-obd-en-10000000001181574) in OceanBase Deployer Documentation. 

## Manually run the Sysbench benchmark

### Step 1: Install Sysbench

Perform the following steps to install Sysbench: 

1. Download Sysbench.

   Download Sysbench from the [GitHub repository](https://github.com/akopytov/sysbench/releases/tag/1.0.20). 

2. Decompress the Sysbench package.

   ```shell
   [admin@test ~]$ unzip sysbench-1.0.20.zip
   ```

3. Compile Sysbench.

   Go to the directory where Sysbench is decompressed and run the following command to compile Sysbench:

   ```shell
   [admin@test ~]$ cd sysbench-1.0.20
   [admin@test sysbench-1.0.20]$ ./autogen.sh
   [admin@test sysbench-1.0.20]$ ./configure --prefix=/usr/sysbench/ --with-mysql-includes=/usr/include/mysql/ --with-mysql-libs=/usr/lib64/mysql/ --with-mysql
   [admin@test sysbench-1.0.20]$ make
   [admin@test sysbench-1.0.20]$ sudo make install
   ```

   The following table describes the parameters.

   | Parameter | Description |
   |-----------------------|------------------------------|
   | --prefix | The installation directory of Sysbench. |
   | --with-mysql-includes | The `includes` directory of MySQL. |
   | --with-mysql-libs | The `lib` directory of MySQL. |
   | --with-mysql | Specifies whether MySQL is supported. By default, MySQL is supported. |

4. Verify whether Sysbench is successfully installed.

   Run the following command to verify whether Sysbench is successfully installed:

   ```shell
   [admin@test sysbench-1.0.20]$ /usr/sysbench/bin/sysbench --help
   ```

   If the following information is returned, Sysbench is successfully installed: 

   ```shell
   Usage:
      sysbench [options]... [testname] [command]
   Commands implemented by most tests: prepare run cleanup help
   ```

### Step 2: Tune parameters

Before you run the Sysbench benchmark, you need to tune related parameters. 

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

### Step 3: Run the Sysbench benchmark

> **Note**
>
> This section uses the `oltp_read_write.lua` test case as an example and 32 processes are started. In the `sysbench-1.0.20/src/lua` directory, test cases for different scenarios are stored, such as `oltp_point_select.lua`, `oltp_read_only.lua`, and `oltp_write_only.lua`. 

1. Clear data.

   ```shell
   [admin@test lua]$ /usr/sysbench/bin/sysbench oltp_read_write.lua --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-db=test --mysql-user=$user@$tenant --mysql-password=****** --table_size=1000000 --tables=30 --threads=32 --report-interval=10 --rand-type=uniform --time=60 cleanup
   ```

2. Initialize the test data.

   ```shell
   [admin@test lua]$ /usr/sysbench/bin/sysbench oltp_read_write.lua --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-db=test --mysql-user=$user@$tenant --mysql-password=****** --table_size=1000000 --tables=30 --threads=32 --report-interval=10 --rand-type=uniform --time=60 prepare
   ```

3. Run the benchmark.

   ```shell
   [admin@test lua]$ /usr/sysbench/bin/sysbench oltp_read_write.lua --mysql-host=x.x.x.x --mysql-port=xxxx --mysql-db=test --mysql-user=$user@$tenant --mysql-password=****** --table_size=1000000 --tables=30 --threads=32 --report-interval=10 --time=60 --rand-type=uniform --db-ps-mode=disable run
   ```

## Test results

Point Select performance

| Threads | V4.2.1 QPS | V4.2.1 95% Latency (ms) |
| ------- | ---------- | ----------------------- |
| 32 | 138746.60 | 0.26 |
| 64 | 252231.37 | 0.29 |
| 128 | 447755.19 | 0.34 |
| 256 | 730315.66 | 0.48 |
| 512 | 1009966.93 | 0.90 |
| 1024 | 1012734.80 | 2.66 |

Read Only performance

| Threads | V4.2.1 QPS | V4.2.1 95% Latency (ms) |
| ------- | ---------- | ----------------------- |
| 32 | 121733.00 | 4.65 |
| 64 | 221563.16 | 5.09 |
| 128 | 392138.56 | 5.67 |
| 256 | 577951.13 | 8.58 |
| 512 | 763726.51 | 17.01 |
| 1024 | 740835.95 | 38.94 |

Write Only performance

| Threads | V4.2.1 QPS | V4.2.1 95% Latency (ms) |
| ------- | ---------- | ----------------------- |
| 32 | 43984.28 | 7.17 |
| 64 | 82554.92 | 6.55 |
| 128 | 114874.89 | 10.09 |
| 256 | 181982.10 | 12.52 |
| 512 | 253635.91 | 19.29 |
| 1024 | 292482.33 | 36.89 |

Read/Write performance

| Threads | V4.2.1 QPS | V4.2.1 95% Latency (ms) |
| ------- | ---------- | ----------------------- |
| 32 | 72554.47 | 11.87 |
| 64 | 139369.33 | 11.65 |
| 128 | 247061.25 | 12.30 |
| 256 | 313660.08 | 23.95 |
| 512 | 497734.89 | 25.74 |
| 1024 | 547816.87 | 54.83 |

## High performance deployment and troubleshooting

The test results may not be as expected because the installation and configuration of OceanBase Database, creation of the business tenant, and usage details of Sysbench vary depending on the environment. Some cases about performance issues are provided for your reference. For more information about the cases, see [Reference > Performance test > Achieve high performance with Sysbench on OceanBase Database: deployment and troubleshooting](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103505) in OceanBase Database Documentation. 
