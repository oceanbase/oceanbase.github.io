---
title: 常用操作
weight: 1
---
# **常用操作**

## **RootService 切主**

```sql
-- 操作
ALTER SYSTEM SWITCH REPLICA leader LS=1 SERVER='目标ip:rpc_port' TENANT ='sys';
-- 实例
ALTER SYSTEM SWITCH REPLICA leader LS=1 SERVER ='x.x.x.x:2882' TENANT ='sys'
```

## **清理租户并释放空间**

通过清理租户释放空间时需先执行 `drop tenant xxx force;` 命令删除租户，再执行 `drop resource pool xxx;` 命令删除对应的资源池，两条命令均成功执行才算释放空间。

> **注意**
>
> 该操作会清理租户下的所有数据。

## **普通用户租户查看自己租户下所有的表**

您可通过如下命令查询表类型，之后根据表类型查询表名。

```sql
-- 查询表类型
select distinct(OBJECT_TYPE) from DBA_OBJECTS;  
-- 根据表类型查表名
select OBJECT_NAME from DBA_OBJECTS where OBJECT_TYPE='table' ;
```

## **清理 OBD 管理的集群信息**

当 OBD 管理的集群被销毁后，直接删除 OBD 中该集群的存储信息即可彻底清理该集群，有如下两种方法。

* 方法一：您可执行 `obd cluster list` 命令查看集群所在的目录，通过 rm 命令清理目录即可，示例如下。
  
  ```shell
  [admin@obtest ~]$ obd cluster list
  +----------------------------------------------------------------------+
  |                             Cluster List                             |
  +-------------+--------------------------------------+-----------------+
  | Name        | Configuration Path                   | Status (Cached) |
  +-------------+--------------------------------------+-----------------+
  | test1       | /home/admin/.obd/cluster/test1       | destroyed       |
  | myoceanbase | /home/admin/.obd/cluster/myoceanbase | running         |
  +-------------+--------------------------------------+-----------------+

  [admin@obtest ~]$ rm -rf /home/admin/.obd/cluster/test1
  ```

* 方法二：您可通过 `cd  ~/.obd/cluster` 命令进入到 OBD 的集群信息目录下，删除对应的 Name 目录，示例如下。
  
  ```shell
  [admin@obtest ~]$ cd ~/.obd/cluster/
  [admin@obtest cluster]$ ll
  total 12
  drwxr-xr-x 2 admin admin 4096 Jun  1 12:04 myoceanbase
  drwxr-xr-x 2 admin admin 4096 May 26 14:22 test1

  [admin@obtest ~]$ rm -rf test1
  ```

## **日志打印相关**

### **调整日志文件以及记录数量**

```sql
-- 开启日志回收
alter system set enable_syslog_recycle=true
-- 关闭 wf 日志打印
alter system set enable_syslog_wf=false
-- 限制日志个数，按需调整（单个日志 256M）
alter system set max_syslog_file_count=10
-- 设置系统日志级别
syslog_level (DEBUG/TRACE/INFO/WARN/USER_ERR/ERROR)
```

### **调整慢查询日志记录配置**

SQL 执行时间默认情况下超过 1s 就会记录到 observer.log 日志或者在 OCP 白屏监控有记录。

该配置受租户参数 `trace_log_slow_query_watermark` 控制，可通过如下命令修改配置。

```sql
-- 查看参数配置
show parameters like '%trace_log_slow_query_watermark%';
-- 修改参数
alter system set trace_log_slow_query_watermark='2s';
```

### **OBProxy 日志打印**

您可通过系统租户（root@sys）或者 root@proxysys 连接集群修改 OBProxy 日志打印相关配置。

```sql
-- 查询参数
show proxyconfig like '%log_file_percentage%';
-- 修改参数
alter proxyconfig set log_file_percentage=75;
```

OBProxy 日志相关参数如下表所示。

| 参数 | 默认值 | 取值范围 | 解释 |
| --- | --- | --- | --- |
| **log_file_percentage** | 80 | [0, 100] | OBProxy 日志百分比阈值，超过阈值即进行日志清理。 |
| **log_dir_size_threshold** | 64GB | [256MB, 1T] | OBProxy 日志大小阈值。超过阈值即进行日志清理。 |
| **max_log_file_size** | 256MB | [1MB, 1G] | 单个日志文件的最大尺寸。 |
| **syslog_level** | INFO | DEBUG, TRACE, INFO, WARN, USER_ERR, ERROR | 日志级别。 |

## **SQL 并行执行**

您可通过增加并行加快索引创建，具体命令如下所示。

```sql
-- 增加 SQL 执行内存百分比
SET GLOBAL OB_SQL_WORK_AREA_PERCENTAGE = 30; 
-- 设置 DDL 并行度
SET SESSION _FORCE_PARALLEL_DDL_DOP = 32;
-- 并行度增加需要设置该参数，比所有并行度和大即可
SET GLOBAL PARALLEL_SERVERS_TARGET = 64;
```

> **说明**
>
> 持续更新中，敬请期待...
