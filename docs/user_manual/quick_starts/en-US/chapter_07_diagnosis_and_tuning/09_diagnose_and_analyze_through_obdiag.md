---
title: Use obdiag for diagnostics and analytics
weight: 10
---

# 7.9 Use obdiag for diagnostics and analytics

You can use OceanBase Diagnostic Tool (obdiag) for diagnostics and analytics.

## About obdiag

In the native distributed database system OceanBase Database, root cause analysis for faults is complex because many factors may be involved, such as the server environment, parameters, and running load. Experts must collect and analyze extensive information during troubleshooting. Therefore, obdiag is introduced to help efficiently collect information scattered on various nodes and find their association.

![obdiag](/img/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/09_diagnose_and_analyze_through_obdiag/001.png)

### Benefits

obdiag is an agile diagnostic tool designed for OceanBase Database. It provides the following benefits:

- **Lightweight**: You can deploy obdiag by using the RPM package or OceanBase Deployer (OBD) with a few clicks. The RPM package is less than 30 MB in size. You can deploy it on an OBServer node or any server that can connect to nodes in the OceanBase cluster, for example, a jump server or control server.

- **Easy to use**: You can perform installation, cluster inspection, information collection, diagnostics, and root cause analysis all by using commands.

- **Open source**: obdiag is developed based on Python. The source code is 100% open-source. For more information, visit the [GitHub code repository](https://github.com/oceanbase/obdiag).

- **High scalability**: The inspection, scenario-based information collection, and root cause analysis features of obdiag are all available as add-ons. You can add custom diagnostic scenarios at low costs.

![Benefits](/img/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/09_diagnose_and_analyze_through_obdiag/002.png)

### Features

obdiag can scan, collect, analyze, and diagnose information such as the logs, SQL audit records, and the process stack information of OceanBase Database. You can use obdiag with ease, no matter whether your OceanBase cluster is deployed manually or by using OceanBase Cloud Platform (OCP) or OBD. obdiag has the following features:

![Features](/img/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/09_diagnose_and_analyze_through_obdiag/003.png)

- **Cluster inspection**: You can use `obdiag check` commands to inspect the status of an OceanBase cluster. The inspection process analyzes the cluster from perspectives of the system kernel parameters and internal tables, identifies the causes of existing or possible exceptions, and provides O&M suggestions.

- **Diagnostic analysis**: You can use `obdiag analyze` commands to analyze diagnostic information of OceanBase Database. These commands allow you to analyze OceanBase Database logs to identify errors that have occurred, as well as enable end-to-end diagnostics to locate slow execution.

- **Information collection**: You can use `obdiag gather` commands to collect diagnostic information of OceanBase Database, including basic information and information for specific scenarios.

- **Root cause analysis**: You can use `obdiag rca` commands to analyze diagnostic information of OceanBase Database. These commands allow you to analyze exceptions of OceanBase Database to identify causes of these exceptions.

## Install and deploy obdiag

### Install obdiag

You can use obdiag independently or in combination with OBD.

#### Method 1: Use obdiag independently

If the cluster to be diagnosed is not deployed by using OBD, you can run the following commands to install and deploy obdiag:

- Online deployment (when Internet access is available)

  ```bash
  sudo yum install -y yum-utils
  sudo yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
  sudo yum install -y oceanbase-diagnostic-tool
  source /usr/local/oceanbase-diagnostic-tool/init.sh
  ```

- Offline deployment (when Internet access is unavailable)
  
  Download the obdiag package of the latest version from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter).

  ```bash
  yum install -y oceanbase-diagnostic-tool*.rpm
  source /usr/local/oceanbase-diagnostic-tool/init.sh
  ```

- Deployment on a Debian-based system, such as Ubuntu
  
  Download the obdiag package of the latest version from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter).

  ```bash
  apt-get update
  apt-get install alien -y
  alien --scripts --to-deb  oceanbase-diagnostic-tool*.rpm # Convert the RPM package to a DEB package.
  dpkg -i oceanbase-diagnostic-tool*.deb
  source /usr/local/oceanbase-diagnostic-tool/init.sh
  ```

#### Method 2: Use obdiag in combination with OBD

If the cluster to be diagnosed is deployed by using OBD, we recommend that you upgrade OBD to V2.5.0 or later. Then, you can directly run obdiag commands in OBD. For more information about the commands, see [obdiag commands](https://en.oceanbase.com/docs/community-obd-en-10000000001181576).

- Online deployment (when Internet access is available)

  ```bash
  Enable OBD to pull remote images.
  obd mirror enable remote
  Deploy obdiag by using OBD.
  obd obdiag deploy
  ```

- Offline deployment (when Internet access is unavailable)

  Download the obdiag package of the latest version from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter).

  ```bash
  Copy the offline obdiag package to the image repository of OBD.
  obd mirror clone oceanbase-diagnostic-tool-xxxxxxxx.rpm
  Deploy obdiag by using OBD.
  obd obdiag deploy
  ```

### Configure obdiag

To configure obdiag, you can create a user-defined configuration file in a custom path, or use the system configuration file, which you do not need to modify in most cases. The following sections describe the two configuration files.

#### User-defined configuration file

You can create or edit a user-defined configuration file by running the `obdiag config <option>` command. By default, the configuration file is named `config.yml` and is stored in the `~/.obdiag/` directory. Template configuration files are stored in the `~/.obdiag/example` directory.

```bash
obdiag config -h <db_host> -u <sys_user> [-p password] [-P port]
```

The following table describes the parameters.

| Parameter | Required? | Description |
| --- | --- | --- |
| db_host | Yes | The IP address used to connect to the `sys` tenant of the OceanBase cluster. |
| sys_user | Yes | The username used to connect to the `sys` tenant of the OceanBase cluster. To avoid permission issues, we recommend that you use `root@sys`. If you connect to the cluster by using OceanBase Database Proxy (ODP), the value of this parameter must include the cluster name, for example, `root@sys#obtest`. |
| -p password | No | The password used to connect to the `sys` tenant of the OceanBase cluster. This parameter is left empty by default. |
| -P port | No | The port used to connect to the `sys` tenant of the OceanBase cluster. Port `2881` is used by default. |

Here are some examples:

- A password is specified.
  
  ```shell
  obdiag config -hxx.xx.xx.xx -uroot@sys -p***** -P2881
  ```

- No password is specified.
  
  ```shell
  obdiag config -hxx.xx.xx.xx -uroot@sys -P2881
  ```

- ODP is used for connection.
  
  ```shell
  obdiag config -hxx.xx.xx.xx -uroot@sys#obtest  -p***** -P2883
  ```

After the execution is completed, the new configuration is generated in the `config.yml` configuration file, and the original configuration file, if it contains configuration information, is backed up to the `~/.obdiag/` directory as a `backup_conf` file.

**Tips:**

- Manage the configuration files of multiple clusters:

  You can directly specify the configuration files of target clusters in obdiag commands. Here is an example:

  ```shell
  obdiag gather log –c cluster_1.yaml
  obdiag gather log –c cluster_2.yaml
  ```

- If a cluster is deployed by using OBD, you can directly use obdiag commands in the cluster without generating a configuration file. When you run obdiag commands in OBD, you must add `obd` to the commands and specify the cluster name. For example, `obdiag gather log` is replaced with `obd obdiag gather log <cluster_name>`. OBD will generate a configuration file for obdiag.

#### System configuration file

The system configuration file is named `inner_config.yml` and located in the `/usr/local/oceanbase-diagnostic-tool/conf/` directory.

```yaml
obdiag:
  basic:
    config_path: ~/.obdiag/config.yml # The path of the user-defined configuration file.
    config_backup_dir: ~/.obdiag/backup_conf # The path where the backup of the original configuration file is stored when you run the `obdiag config` command.
    file_number_limit: 20 # The maximum number of files returned for a collection command on a single remote host.
    file_size_limit: 2G # The maximum size of the compressed file returned for a collection command on a single remote host.
  logger:
    log_dir: ~/.obdiag/log # The path where the execution log file of obdiag is stored.
    log_filename: obdiag.log # The name of the execution log file of obdiag.
    file_handler_log_level: DEBUG # The lowest level of execution logs of obdiag to be recorded.
    log_level: INFO # The execution log level of obdiag.
    mode: obdiag
    stdout_handler_log_level: INFO # The lowest level of obdiag logs to be displayed.
check: # Parameters required for inspection. Usually, you do not need to modify parameters in this section.
  ignore_version: false # Specifies whether to ignore the version of OceanBase Database.
  report:
    report_path: "./check_report/" # The output path of the inspection report.
    export_type: table # The type of the inspection report.
  package_file: "~/.obdiag/check_package.yaml" # The path of the inspection package file.
  tasks_base_path: "~/.obdiag/tasks/" # The basic directory of inspection tasks.
gather:
  scenes_base_path: "~/.obdiag/gather/tasks" # The directory of `gather` tasks.
rca:
  result_path: "./rca/" # The storage path of root cause analysis results.
```

> **Note**
>
> You can modify the `obdiag.basic.file_number_limit` and `obdiag.basic.file_size_limit` parameters if the number of log files on the remote host or the size of the compressed file exceeds the specified upper limit during log collection.

## Use obdiag

### Cluster inspection

You can use `obdiag check` commands to inspect the status of an OceanBase cluster. The inspection process analyzes the cluster from perspectives of the system kernel parameters and internal tables, identifies the causes of existing or possible exceptions, and provides O&M suggestions.

#### Supported scenarios

```shell
obdiag check list
```

The output is as follows:

```shell

[check cases about observer]:
------------------------------------------------------------------------------------------------------------------
command                              info_en                                                    info_cn            
------------------------------------------------------------------------------------------------------------------
obdiag check                         default check all task without filter                      默认执行除filter组里的所有巡检项
obdiag check --cases=ad              Test and inspection tasks                                  测试巡检任务             
obdiag check --cases=build_before    Deployment environment check                               部署环境检查             
obdiag check --cases=sysbench_run    Collection of inspection tasks when executing sysbench     执行sysbench时的巡检任务集合 
obdiag check --cases=sysbench_free   Collection of inspection tasks before executing sysbench   执行sysbench前的巡检任务集合 
------------------------------------------------------------------------------------------------------------------

[check cases about obproxy]:
-----------------------------------------------------------------------------------------------
command                              info_en                                 info_cn            
-----------------------------------------------------------------------------------------------
obdiag check                         default check all task without filter   默认执行除filter组里的所有巡检项
obdiag check --obproxy-cases=proxy   obproxy version check                   obproxy 版本检查       
-----------------------------------------------------------------------------------------------
```

#### Commands

```bash
# Run all inspection items by default
obdiag check

# Check the deployment environment
obdiag check --cases=build_before

# List the inspection tasks when a Sysbench benchmark is run 
obdiag check --cases=sysbench_run

# List the inspection tasks before a Sysbench benchmark is run 
obdiag check --cases=sysbench_free

# Check the version of ODP
obdiag check --obproxy-cases=proxy
```

### Diagnostic analysis

#### Syntax

```bash
obdiag analyze <analyze type> [options]
```

Valid values of the `analyze type` parameter are as follows:

- `log`: analyzes logs of OceanBase Database.

- `flt_trace`: performs end-to-end diagnostics.

#### Commands

You can run `obdiag analyze` commands to analyze logs of an OceanBase cluster online, or specify the `--files` option to enable offline analysis.

```bash
# Analyze the logs of the last hour online. When you run this command, obdiag pulls and analyzes the logs of the last hour from the remote host to diagnose the errors that have occurred.
obdiag analyze log --since 1h


# Analyze the logs of the last 30 minutes online. When you run this command, obdiag pulls and analyzes the logs of the last 30 minutes from the remote host to diagnose the errors that have occurred.
obdiag analyze log --since 30m


# Analyze a specified log file offline
obdiag analyze log --files observer.log.20230831142211247 

# Analyze the log files in a specified directory offline
obdiag analyze log --files ./test/
```

#### End-to-end diagnostics

**What is end-to-end diagnostics?** OceanBase Database is a distributed database in which the call links are complex. When a timeout issue occurs, O&M engineers cannot quickly locate whether the issue is caused by OceanBase Database components or the network. They can only analyze the issue based on experience and OceanBase Database logs. OceanBase Database V4.0 provides the trace log feature for end-to-end diagnostics. Two paths are involved in end-to-end tracing. In one path, the application sends a request to ODP by using a client, such as Java Database Connectivity (JDBC) or Oracle Call Interface (OCI), to access an OBServer node. The access result is returned to the application. In the other path, the application directly accesses an OBServer node by using a client, and the access result is returned to the application. In end-to-end diagnostics, all components are diagnosed.

***Working mechanism***

```bash
┌────────┐       ┌─────────────────────────────┐       ┌────────────────────────────┐
│ Server 1 │------>│ Search and filter the logs related to the specified flt_trace_id. │------>│ Return filtered logs to the node where obdiag is deployed. │---┐
└────────┘       └─────────────────────────────┘       └────────────────────────────┘   │
┌────────┐       ┌─────────────────────────────┐       ┌────────────────────────────┐   │    ┌────────────────────────────────┐
│ Server 2 │------>│ Search and filter the logs related to the specified flt_trace_id. │------>│ Return filtered logs to the node where obdiag is deployed. │---┼--->│ Aggregate logs obtained from parent and child nodes and generate a trace tree based on the hierarchical relationship between nodes.
└────────┘       └─────────────────────────────┘       └────────────────────────────┘   │    └────────────────────────────────┘
┌────────┐       ┌─────────────────────────────┐       ┌────────────────────────────┐   │
│ Server N │------>│ Search and filter the logs related to the specified flt_trace_id. │------>│ Return filtered logs to the node where obdiag is deployed. │---┘
└────────┘       └─────────────────────────────┘       └────────────────────────────┘
```

**Syntax**

```bash
obdiag analyze flt_trace [options]
```

##### Step 1: Find the ID of a suspected slow SQL statement

If you suspect that an SQL statement is slow, you can query the `gv$ob_sql_audit` view to obtain its `flt_trace_id` value. Here is an example:

```sql
OceanBase(root@test)>select query_sql, flt_trace_id from oceanbase.gv$ob_sql_audit where query_sql like 'select @@version_comment limit 1';
```

The output is as follows:

```shell
+----------------------------------+--------------------------------------+
| query_sql                        | flt_trace_id                         |
+----------------------------------+--------------------------------------+
| select @@version_comment limit 1 | 00060aa3-d607-f5f2-328b-388e17f687cb |
+----------------------------------+--------------------------------------+
1 row in set
```

The result indicates that the `flt_trace_id` value of the suspected SQL statement is `00060aa3-d607-f5f2-328b-388e17f687cb`.

You can also obtain the `flt_trace_id` value by searching the `trace.log` file of ODP or OceanBase Database. Here is an example:

```shell
head trace.log

[2023-12-07 22:20:07.242229] [489640][T1_L0_G0][T1][YF2A0BA2DA7E-00060BEC28627BEF-0-0] {"trace_id":" 00060bec-275e-9832-e730-7c129f2182ac","name":" close_das_task","id":" 00060bec-2a20-bf9e-56c9-724cb467f859","start_ts":1701958807240606,"end_ts":1701958807240607,"parent_id":" 00060bec-2a20-bb5f-e03a-5da01aa3308b","is_follow":false}
```

The result indicates that the `flt_trace_id` value of the suspected SQL statement is `00060bec-275e-9832-e730-7c129f2182ac`.

##### Step 2: Run the end-to-end diagnostics command

```bash
obdiag analyze flt_trace --flt_trace_id 000605b1-28bb-c15f-8ba0-1206bcc08aa3

root node id: 000605b1-28bb-c15f-8ba0-1206bcc08aa3

TOP time-consuming leaf span:
+---+----------------------------------+-------------+---------------------+
| ID| Span Name                        | Elapsed Time|      NODE           |
+---+----------------------------------+-------------+---------------------+
| 18| px_task                          | 2.758 ms    | OBSERVER(xx.xx.xx.1)|
| 5 | pc_get_plan                      | 52 μs       | OBSERVER(xx.xx.xx.1)|
| 16| do_local_das_task                | 45 μs       | OBSERVER(xx.xx.xx.1)|     
| 10| do_local_das_task                | 17 μs       | OBSERVER(xx.xx.xx.1)|
| 17| close_das_task                   | 14 μs       | OBSERVER(xx.xx.xx.1)|     
+---+----------------------------------+-------------+---------------------+
Tags & Logs:
-------------------------------------
18 - px_task  Elapsed: 2.758 ms 
     NODE:OBSERVER(xx.xx.xx.1)
     tags: [{'group_id': 0}, {'qc_id': 1}, {'sqc_id': 0}, {'dfo_id': 1}, {'task_id': 1}]
5 - pc_get_plan  Elapsed: 52 μs 
    NODE:OBSERVER(xx.xx.xx.1)
16 - do_local_das_task  Elapsed: 45 μs 
     NODE:OBSERVER(xx.xx.xx.3)
10 - do_local_das_task  Elapsed: 17 μs 
     NODE:OBSERVER(xx.xx.xx.1)
17 - close_das_task  Elapsed: 14 μs 
     NODE:OBSERVER(xx.xx.xx.3)

Details:
+---+----------------------------------+-------------+---------------------+
| ID| Span Name                        | Elapsed Time|  NODE               |
+---+----------------------------------+-------------+---------------------+
| 1 | TRACE                            | -           | -                   |
| 2 | └─com_query_process              | 5.351 ms    | OBPROXY(xx.xx.xx.1) |
| 3 |   └─mpquery_single_stmt          | 5.333 ms    | OBSERVER(xx.xx.xx.1)|
| 4 |     ├─sql_compile                | 107 μs      | OBSERVER(xx.xx.xx.1)|
| 5 |     │ └─pc_get_plan              | 52 μs       | OBSERVER(xx.xx.xx.1)|
| 6 |     └─sql_execute                | 5.147 ms    | OBSERVER(xx.xx.xx.1)|
| 7 |       ├─open                     | 87 μs       | OBSERVER(xx.xx.xx.1)|
| 8 |       ├─response_result          | 4.945 ms    | OBSERVER(xx.xx.xx.1)|
| 9 |       │ ├─px_schedule            | 2.465 ms    | OBSERVER(xx.xx.xx.1)|
| 10|       │ │ ├─do_local_das_task    | 17 μs       | OBSERVER(xx.xx.xx.1)|
| 11|       │ │ ├─px_task              | 2.339 ms    | OBSERVER(xx.xx.xx.2)|
| 12|       │ │ │ ├─do_local_das_task  | 54 μs       | OBSERVER(xx.xx.xx.2)|
| 13|       │ │ │ └─close_das_task     | 22 μs       | OBSERVER(xx.xx.xx.2)|
| 14|       │ │ ├─do_local_das_task    | 11 μs       | OBSERVER(xx.xx.xx.1)|
| 15|       │ │ ├─px_task              | 2.834 ms    | OBSERVER(xx.xx.xx.3)|
| 16|       │ │ │ ├─do_local_das_task  | 45 μs       | OBSERVER(xx.xx.xx.3)|
| 17|       │ │ │ └─close_das_task     | 14 μs       | OBSERVER(xx.xx.xx.3)|
| 18|       │ │ └─px_task              | 2.758 ms    | OBSERVER(xx.xx.xx.1)|
| 19|       │ ├─px_schedule            | 1 μs        | OBSERVER(xx.xx.xx.1)|
| 20|       │ └─px_schedule            | 1 μs        | OBSERVER(xx.xx.xx.1)|
| ..|       ......                     | ...         |  ......             |
+---+----------------------------------+-------------+---------------------+

For more details, please run cmd ' cat analyze_flt_result/000605b1-28bb-c15f-8ba0-1206bcc08aa3.txt '
```

### Information collection

obdiag allows you to collect basic information and information for specific scenarios.

#### Collect basic information

Syntax:

```bash
obdiag gather <gather type> [options]
```

Valid values of the `gather type` parameter are as follows:

- `log`: collects logs of the specified OceanBase cluster.

- `sysstat`: collects information about nodes in the specified OceanBase cluster.

- `clog`: collects the clogs of the specified OceanBase cluster.

- `slog`: collects the slogs of the specified OceanBase cluster.

- `plan_monitor`: collects the execution details of parallel SQL statements with the specified trace ID in the specified OceanBase cluster.

- `stack`: collects the stack information of the specified OceanBase cluster.

- `perf`: collects the performance information of the specified OceanBase cluster.

- `obproxy_log`: collects the logs of the ODP node on which the specified OceanBase cluster depends.

- `all`: collects the diagnostic information of the specified OceanBase cluster, including the logs, node information, stack information, and performance information of the cluster.

#### Collect information for specific scenarios

You can use `obdiag gather scenes` commands to collect the information required for troubleshooting specific issues. These commands help address the pain point in collecting information on distributed nodes.

##### Supported scenarios

You can run the `obdiag gather scene list` command to query the scenarios supported for information collection.

```bash
obdiag gather scene list

[Other Problem Gather Scenes]:
---------------------------------------------------------------------------------------
command                                                   info_en               info_cn
---------------------------------------------------------------------------------------
obdiag gather scene run --scene=other.application_error   [application error]   [应用报错问题]
---------------------------------------------------------------------------------------

[Obproxy Problem Gather Scenes]:
----------------------------------------------------------------------------------
command                                           info_en             info_cn
----------------------------------------------------------------------------------
obdiag gather scene run --scene=obproxy.restart   [obproxy restart]   [obproxy无故重启]
----------------------------------------------------------------------------------

[Observer Problem Gather Scenes]:
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
command                                                                                                                                   info_en                                       info_cn
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
obdiag gather scene run --scene=observer.backup                                                                                           [backup problem]                              [数据备份问题]
obdiag gather scene run --scene=observer.backup_clean                                                                                     [backup clean]                                [备份清理问题]
obdiag gather scene run --scene=observer.clog_disk_full                                                                                   [clog disk full]                              [clog盘满]
obdiag gather scene run --scene=observer.cluster_down                                                                                     [cluster down]                                [集群无法连接]
obdiag gather scene run --scene=observer.compaction                                                                                       [compaction]                                  [合并问题]
obdiag gather scene run --scene=observer.cpu_high                                                                                         [High CPU]                                    [CPU高]
obdiag gather scene run --scene=observer.delay_of_primary_and_backup                                                                      [delay of primary and backup]                 [主备库延迟]
obdiag gather scene run --scene=observer.io                                                                                               [io problem]                                  [io问题]
obdiag gather scene run --scene=observer.log_archive                                                                                      [log archive]                                 [日志归档问题]
obdiag gather scene run --scene=observer.long_transaction                                                                                 [long transaction]                            [长事务]
obdiag gather scene run --scene=observer.memory                                                                                           [memory problem]                              [内存问题]
obdiag gather scene run --scene=observer.perf_sql --env "{db_connect='-h127.0.0.1 -P2881 -utest@test -p****** -Dtest', trace_id='Yxx'}"   [SQL performance problem]                     [SQL性能问题]
obdiag gather scene run --scene=observer.px_collect_log --env "{trace_id='Yxx', estimated_time='2024-04-19 14:46:17'}"                    [Collect error source node logs for SQL PX]   [SQL PX 收集报错源节点日志]
obdiag gather scene run --scene=observer.recovery                                                                                         [recovery]                                    [数据恢复问题]
obdiag gather scene run --scene=observer.restart                                                                                          [restart]                                     [observer无故重启]
obdiag gather scene run --scene=observer.rootservice_switch                                                                               [rootservice switch]                          [有主改选或者无主选举的切主]
obdiag gather scene run --scene=observer.sql_err --env "{db_connect='-h127.0.0.1 -P2881 -utest@test -p****** -Dtest', trace_id='Yxx'}"    [SQL execution error]                         [SQL 执行出错]
obdiag gather scene run --scene=observer.suspend_transaction                                                                              [suspend transaction]                         [悬挂事务]
obdiag gather scene run --scene=observer.unit_data_imbalance                                                                              [unit data imbalance]                         [unit迁移/缩小 副本不均衡问题]
obdiag gather scene run --scene=observer.unknown                                                                                          [unknown problem]                             [未能明确问题的场景]
----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

```

##### Commands

Syntax:

```bash
obdiag gather scene run --scene={SceneName}
```

```bash
# Application error
obdiag gather scene run --scene=other.application_error

# Unexpected restart of the obproxy process
obdiag gather scene run --scene=obproxy.restart

# Data backup exception
obdiag gather scene run --scene=observer.backup

# Backup cleanup exception
obdiag gather scene run --scene=observer.backup_clean

# Clog disk space exhausted
obdiag gather scene run --scene=observer.clog_disk_full 

# Major compaction exception
obdiag gather scene run --scene=observer.compaction 

# High CPU utilization
obdiag gather scene run --scene=observer.cpu_high

# Data latency between the primary and standby databases
obdiag gather scene run --scene=observer.delay_of_primary_and_backup 

# Log archiving exception
obdiag gather scene run --scene=observer.log_archive

# Long-running transaction
obdiag gather scene run --scene=observer.long_transaction 

# Memory exception
obdiag gather scene run --scene=observer.memory

# SQL performance exception. In the following example, the value of `trace_id` in the `env` parameter corresponds to the value of `trace_id` in the `gv$ob_sql_audit` view.
obdiag gather scene run --scene=observer.perf_sql --env "{db_connect='-hxx -Pxx -uxx -pxx -Dxx', trace_id='xx'}"   

# Restore exception
obdiag gather scene run --scene=observer.memory# 

# Unexpected restart of the observer process
obdiag gather scene run --scene=observer.restart  

# Leader switching in re-election with a leader or election without a leader
obdiag gather scene run --scene=observer.rootservice_switch  

# SQL execution error. In the following example, the value of `trace_id` in the `env` parameter corresponds to the value of `trace_id` in the `gv$ob_sql_audit` view.
obdiag gather scene run --scene=observer.sql_err --env "{db_connect='-hxx -Pxx -uxx -pxx -Dxx', trace_id='xx'}"    

# Suspended transaction
obdiag gather scene run --scene=observer.suspend_transaction 

# Data imbalance between units after unit migration or unit reduction
obdiag gather scene run --scene=observer.unit_data_imbalance 

# Unknown error
obdiag gather scene run --scene=observer.unknown

# When you collect PX logs of the source node that reports an error, the `trace_id` parameter is required and the `estimated_time` parameter is optional. The default value of `estimated_time` is the current time. PX logs generated one week earlier than the specified time will be collected based on the specified trace ID.
obdiag gather scene run --scene=observer.px_collect_log --env "{trace_id='Yxx', estimated_time='2024-04-19 14:46:17'}"
```

### Root cause analysis

You can use `obdiag rca` commands to analyze the diagnostic information of OceanBase Database. These commands allow you to analyze exceptions of OceanBase Database to identify the causes of these exceptions.

#### Supported scenarios

You can run the `obdiag rca list` command to query the scenarios supported for root cause analysis.

```bash
obdiag rca list 
```

#### Commands

You can run the following command to analyze the root cause of a specified issue.

```bash
obdiag rca run --scene=<scene_name>
```

Here is an example:

```bash
obdiag rca run --scene=disconnection 
```

The output is as follows:

```shell
+-----------------------------------------------------------------------------------------------------------+
|                                                   record                                                  |
+------+----------------------------------------------------------------------------------------------------+
| step | info                                                                                               |
+------+----------------------------------------------------------------------------------------------------+
|  1   | node:xxx.xxx.xxx obproxy_diagnosis_log: [2024-01-18 17:48:37.667014] [23173][Y0-00007FAA5183E710] |
|      | [CONNECTION](trace_type="CLIENT_VC_TRACE", connection_diagnosis={cs_id:1065, ss_id:4559,           |
|      | proxy_session_id:837192278409543969, server_session_id:3221810838,                                 |
|      | client_addr:" xxx.xxx.xxx.xxx:xxxx", server_addr:" xxx.xxx.xxx.xxx:2883", cluster_name:" obcluster",     |
|      | tenant_name:" sys", user_name:" root", error_code: -10010, error_msg:" An unexpected connection event  |
|      | received from client while obproxy reading request", request_cmd:" COM_SLEEP", sql_cmd:" COM_END",   |
|      | req_total_time(us):5315316}{vc_event:" VC_EVENT_EOS", user_sql:" "})                                 |
|  2   | cs_id:1065, server_session_id:3221810838                                                           |
|  3   | trace_type:CLIENT_VC_TRACE                                                                         |
|  4   | error_code: -10010                                                                                  |
+------+----------------------------------------------------------------------------------------------------+
The suggest: Need client cooperation for diagnosis
```

## Add diagnostics scenarios

This section describes how to add diagnostics scenarios to meet the diagnostics requirements of clusters.

### Add inspection scenarios

Inspection scenarios are stored in the `~/.obdiag/check` directory. The `obproxy_check_package.yaml` and `observer_check_package.yaml` files record the inspection items for ODP and OBServer nodes, respectively.

```shell
#tree
.
├── obproxy_check_package.yaml
├── observer_check_package.yaml
└── tasks
    ├── obproxy
    │   └── version
    │       └── bad_version.yaml
    └── observer
        ├── cluster
        │   ├── core_file_find.yaml
        │   ├── data_path_settings.yaml
        │   ├── deadlocks.yaml
        │   ├── ...
        ├── cpu
        │   └── oversold.yaml
        ├── disk
        │   ├── clog_abnormal_file.yaml
        │   ├── disk_full.yaml
        │   ├── disk_hole.yaml
        │   ├── ...
        ├── err_code
        │   ├── find_err_4000.yaml
        │   ├── ...
        ├── sysbench
        │   ├── sysbench_free_test_cpu_count.yaml
        │   ├── sysbench_free_test_memory_limit.yaml
        │   ├── sysbench_free_test_network_speed.yaml
        │   ├── ...
        ├── system
        │   ├── aio.yaml
        │   ├── dependent_software_swapon.yaml
        │   ├── dependent_software.yaml
        │   ├── ...
        └── version
            ├── bad_version.yaml
            └── old_version.yaml
```

The `tasks` directory stores existing inspection items, and each large inspection item corresponds to a YAML file. You can write a task script in the YAML format according to specific rules.

Here is a sample task script:

```bash
info: testinfo
task:
  - version: "[3.1.0,3.2.4]"
    steps:
      {steps_object}
  - version: "[4.2.0.0,4.3.0.0]"
    steps:
      {steps_object}
```

The following table describes the parameters.

| Parameter | Required? | Description |
| --- | --- | --- |
| info | Yes | The scenario to use the task script file. This information facilitates maintenance. |
| version | No | The OceanBase Database versions that the script is compatible with. The value is a range with complete version numbers in the form of a string. <br></br>A version number contains three digits for OceanBase Database V3.x, such as [3.1.1,3.2.0]. <br></br>A version number contains four digits for OceanBase Database V4.x, such as [4.1.0.0,4.2.0.0]. |
| steps | Yes | The list of steps to be executed. |

For more information about the tutorial, see [Use obdiag to inspect an OceanBase cluster](https://en.oceanbase.com/docs/common-obdiag-en-10000000001574823).

### Add information collection scenarios

Information collection scenarios are stored in the `~/.obdiag/gather/tasks` directory. The YAML files in the `obproxy`, `observer`, and `other` directories record the information collection scenarios for ODP, OBServer nodes, and other components, respectively.

```bash
#tree
.
├── obproxy
│   └── restart.yaml
├── observer
│   ├── backup_clean.yaml
│   ├── backup.yaml
│   ├── clog_disk_full.yaml
│   ├── cluster_down.yaml
│   ├── compaction.yaml
│   ├── delay_of_primary_and_backup.yaml
│   ├── io.yaml
│   ├── log_archive.yaml
│   ├── long_transaction.yaml
│   ├── memory.yaml
│   ├── recovery.yaml
│   ├── restart.yaml
│   ├── rootservice_switch.yaml
│   ├── suspend_transaction.yaml
│   ├── unit_data_imbalance.yaml
│   └── unknown.yaml
└── other
    └── application_error.yaml
```

The method for adding an information collection scenario is similar to that of [adding an inspection scenario](#Add_inspection_scenarios). Here is an example:

```yaml
#cat backup.yaml
info_en: "[backup problem]"
info_cn: "[Data backup problem]"
command: obdiag gather scene run --scene=observer.backup
task:
  - version: "[2.0.0.0, 4.0.0.0]"
    steps:
      - type: sql
        sql: "show variables like 'version_comment';"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.v$ob_cluster"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase. __all_zone WHERE name='idc';"
        global: true
      - type: sql
        sql: "select svr_ip,zone,with_rootserver,status,block_migrate_in_time,start_service_time,stop_time,build_version from oceanbase. __all_server order by zone;"
        global: true
      - type: sql
        sql: "SELECT zone, concat(svr_ip, ':' , svr_port) observer, cpu_capacity, cpu_total, cpu_assigned, cpu_assigned_percent, mem_capacity, mem_total, mem_assigned, mem_assigned_percent, unit_Num, round(`load`, 2) `load`, round(cpu_weight, 2) cpu_weight, round(memory_weight, 2) mem_weight, leader_count FROM oceanbase. __all_virtual_server_stat ORDER BY zone,svr_ip;"
        global: true
      - type: sql
        sql: "select tenant_id,tenant_name,primary_zone,compatibility_mode from oceanbase. __all_tenant;"
        global: true
      - type: sql
        sql: "show parameters like '%syslog_level%';"
        global: true
      - type: sql
        sql: "show parameters like '%syslog_io_bandwidth_limit%';"
        global: true
      - type: sql
        sql: "select count(*),tenant_id,zone_list,unit_count from oceanbase. __all_resource_pool group by tenant_id,zone_list,unit_count;"
        global: true
      - type: sql
        sql: "show parameters like '%auto_delete_expired_backup%';"
        global: true
      - type: sql
        sql: "select * from oceanbase. __all_virtual_backup_task;"
        global: true
      - type: sql
        sql: "select * from oceanbase. __all_virtual_backup_info;"
        global: true
      - type: sql
        sql: "select * from oceanbase. __all_virtual_sys_task_status where comment like '%backup%';"
        global: true
      - type: sql
        sql: "select count(*),status from oceanbase. __all_virtual_pg_backup_task group by status;"
        global: true
      - type: sql
        sql: "select svr_ip, log_archive_status, count(*) from oceanbase. __all_virtual_pg_backup_log_archive_status group by svr_ip, log_archive_status;"
        global: true
      - type: sql
        sql: "select * from oceanbase. __all_rootservice_event_history where gmt_create > ${from_time} and gmt_create < ${to_time} order by gmt_create desc;"
        global: true
      - type: sql
        sql: "select b.* from oceanbase. __all_virtual_pg_backup_log_archive_status a,oceanbase. __all_virtual_pg_log_archive_stat b where a.table_id=b.table_id and a.partition_id=b.partition_id  order by log_archive_cur_ts limit 5;"
        global: true
      - type: log
        global: false
        grep: ""
      - type: sysstat
        global: false
        sysstat: ""
  - version: "[4.0.0.0, *]"
    steps:
      - type: sql
        sql: "show variables like 'version_comment';"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.DBA_OB_ZONES;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.DBA_OB_SERVERS;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.GV$OB_SERVERS;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.DBA_OB_RESOURCE_POOLS;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.DBA_OB_TENANTS;"
        global: true
      - type: sql
        sql: "SELECT c.TENANT_ID, e.TENANT_NAME, concat(c.NAME, ': ', d.NAME) `pool:conf`,concat(c.UNIT_COUNT, ' unit: ', d.min_cpu, 'C/', ROUND(d.MEMORY_SIZE/1024/1024/1024,0), 'G') unit_info FROM oceanbase.DBA_OB_RESOURCE_POOLS c, oceanbase.DBA_OB_UNIT_CONFIGS d, oceanbase.DBA_OB_TENANTS e WHERE c.UNIT_CONFIG_ID=d.UNIT_CONFIG_ID AND c.TENANT_ID=e.TENANT_ID AND c.TENANT_ID>1000 ORDER BY c.TENANT_ID;"
        global: true
      - type: sql
        sql: "SELECT a.TENANT_NAME,a.TENANT_ID,b.SVR_IP FROM oceanbase.DBA_OB_TENANTS a, oceanbase.GV$OB_UNITS b WHERE a.TENANT_ID=b.TENANT_ID;"
        global: true
      - type: sql
        sql: "show parameters like '%syslog_level%';"
        global: true
      - type: sql
        sql: "show parameters like '%syslog_io_bandwidth_limit%';"
        global: true
      - type: sql
        sql: "show parameters like '%backup%';"
        global: true
      - type: sql
        sql: "show parameters like '%ha_low_thread_score%';"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.CDB_OB_BACKUP_PARAMETER"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.CDB_OB_BACKUP_JOBS limit 20;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.DBA_OB_ROOTSERVICE_EVENT_HISTORY WHERE module='backup_data' AND event ='start_backup_data';"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase.CDB_OB_BACKUP_TASKS limit 20;"
        global: true
      - type: sql
        sql: "SELECT * FROM oceanbase. __all_virtual_backup_schedule_task limit 20"
        global: true
      - type: sql
        sql: "SELECT * from oceanbase.CDB_OB_BACKUP_JOB_HISTORY where STATUS = 'FAILED' limit 20;"
        global: true
      - type: log
        global: false
        grep: ""
      - type: sysstat
        global: false
        sysstat: ""
```

The parameters are described as follows:

- `info_en`: the scenario description in English to be returned by the `obdiag gather scene list` command.

- `info_cn`: the scenario description in Chinese to be returned by the `obdiag gather scene list` command.

- `command`: the command to be run.

- `task.version`: the OceanBase Database version supported by obdiag.

- `task.steps.type`: the type of the execution step. Valid values are `ssh`, `sql`, `log`, `obproxy_log`, and `sysstat`.

- `task.steps.type.global`: specifies whether to execute the step only on one node or on all nodes. The value `true` specifies to execute the step only on the first node. The value `false` specifies to execute the step on each node.

### Add root cause analysis scenarios

Root cause analysis scenarios are recorded in Python files under the `~/.obdiag/rca` directory. To add a root cause analysis scenario, you must configure specific link logic for root cause analysis in the Python code. For more information, see [obdiag Project Developer Guide](https://oceanbase.yuque.com/org-wiki-obtech-vh7w9r/imzr6c/or82ioetg06ta27e).

```bash
#tree
.
├── ddl_disk_full_scene.py 
├── disconnection_scene.py
├── lock_conflict_scene.py
├── ...
└── major_hold_scene.py
```

## Summary

obdiag supports cluster inspection, diagnostic analysis, and information collection. You can easily inspect an OceanBase cluster and recover the cluster based on the diagnostics report. If a cluster encounters an unknown exception, obdiag allows you to analyze the logs to narrow the troubleshooting scope. If a cluster encounters a known exception, obdiag allows you to directly analyze the root cause based on the root cause analysis report. If the problem persists, you can collect diagnostic information and post it to the QA module in the OceanBase community or send it to OceanBase Technical Support.

![Overall process](/img/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/09_diagnose_and_analyze_through_obdiag/004.png)