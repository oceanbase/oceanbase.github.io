---
title: 单机部署扩展分布式集群
weight: 16
---

# **单机部署扩展分布式集群**

OceanBase 4.x 版本推出了单机部署和分布式部署两种部署模式，并且支持单机扩展到分布式的架构，有了这种模式，可以很方便的解决小业务成长为大业务之后，扩展困难的问题，并且节省一定的机器资源。以下使用命令行的方式，记录集群扩展步骤。

> 注：以下操作基于社区版4.2版本

> 另：如果集群使用OCP平台做了接管，可以直接在OCP上进行扩展操作，在集群中添加zone即可。

## **查看集群当前情况**
查看当前zone情况
```sql
obclient [oceanbase]> select * from dba_ob_zones;
+-------+----------------------------+----------------------------+--------+-----+----------------+-----------+
| ZONE  | CREATE_TIME                | MODIFY_TIME                | STATUS | IDC | REGION         | TYPE      |
+-------+----------------------------+----------------------------+--------+-----+----------------+-----------+
| zone1 | 2023-08-22 17:37:30.158883 | 2023-08-22 17:37:30.159941 | ACTIVE |     | sys_region     | ReadWrite |
+-------+----------------------------+----------------------------+--------+-----+----------------+-----------+
1 rows in set (0.021 sec)
```
查看当前server情况
```sql
obclient [oceanbase]> select * from dba_ob_servers;
+---------------+----------+----+-------+----------+-----------------+--------+----------------------------+-----------+-----------------------+----------------------------+----------------------------+-------------------------------------------------------------------------------------------+-------------------+
| SVR_IP        | SVR_PORT | ID | ZONE  | SQL_PORT | WITH_ROOTSERVER | STATUS | START_SERVICE_TIME         | STOP_TIME | BLOCK_MIGRATE_IN_TIME | CREATE_TIME                | MODIFY_TIME                | BUILD_VERSION                                                                             | LAST_OFFLINE_TIME |
+---------------+----------+----+-------+----------+-----------------+--------+----------------------------+-----------+-----------------------+----------------------------+----------------------------+-------------------------------------------------------------------------------------------+-------------------+
| 172.24.255.17 |     2882 |  1 | zone1 |     2881 | YES             | ACTIVE | 2023-08-22 17:37:40.814023 | NULL      | NULL                  | 2023-08-22 17:37:30.449287 | 2023-08-22 17:37:42.220860 | 4.2.0.0_100010022023081817-0bdf1c0c5674e88c5ae9a8d0ae4f8077465d7fae(Aug 18 2023 17:32:49) | NULL              |
+---------------+----------+----+-------+----------+-----------------+--------+----------------------------+-----------+-----------------------+----------------------------+----------------------------+-------------------------------------------------------------------------------------------+-------------------+
1 rows in set (0.001 sec)
```
查看当前租户副本情况
```sql
obclient [oceanbase]> SELECT TENANT_ID,TENANT_NAME,TENANT_TYPE,PRIMARY_ZONE,LOCALITY FROM oceanbase.DBA_OB_TENANTS;
+-----------+-------------+-------------+--------------+---------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | PRIMARY_ZONE | LOCALITY      |
+-----------+-------------+-------------+--------------+---------------+
|         1 | sys         | SYS         | RANDOM       | FULL{1}@zone1 |
|      1001 | META$1002   | META        | RANDOM       | FULL{1}@zone1 |
|      1002 | ocp         | USER        | RANDOM       | FULL{1}@zone1 |
+-----------+-------------+-------------+--------------+---------------+
3 rows in set (0.010 sec)
```

## **新节点安装启动进程**
服务器环境配置，保证和已安装节点环境配置相同
具体环境配置参考官方文档：[部署前准备](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000035594)
检查安装包，建议使用admin用户，进程启动也是用admin用户
```sql
[admin@ob2 rpms]$ ll
-rw-r--r-- 1 admin admin 86234124 Aug 22 17:45 oceanbase-ce-4.2.0.0-100010022023081817.el7.x86_64.rpm
-rw-r--r-- 1 admin admin   158316 Aug 22 17:45 oceanbase-ce-libs-4.2.0.0-100010022023081817.el7.x86_64.rpm
```

安装软件，先安装lib库
```sql
[root@ob2 rpms]# ll
-rw-r--r-- 1 admin admin 86234124 8月  22 17:45 oceanbase-ce-4.2.0.0-100010022023081817.el7.x86_64.rpm
-rw-r--r-- 1 admin admin   158316 8月  22 17:45 oceanbase-ce-libs-4.2.0.0-100010022023081817.el7.x86_64.rpm
[root@ob2 rpms]# rpm -ivh oceanbase-ce-libs-4.2.0.0-100010022023081817.el7.x86_64.rpm
准备中...                          ################################# [100%]
正在升级/安装...
   1:oceanbase-ce-libs-4.2.0.0-1000100################################# [100%]
[root@ob2 rpms]# rpm -ivh oceanbase-ce-4.2.0.0-100010022023081817.el7.x86_64.rpm
准备中...                          ################################# [100%]
正在升级/安装...
   1:oceanbase-ce-4.2.0.0-100010022023################################# [100%]
```

创建目录，保持和已安装节点目录一致
```sql
[admin@OMS rpms]# sudo mkdir -p /obdata/{sstable,slog}
[admin@OMS rpms]# sudo mkdir -p /obredo/clog
[admin@OMS rpms]# sudo mkdir -p /home/admin/myoceanbase/oceanbase/{audit,etc2,etc3,log,run}
[admin@OMS rpms]# sudo chown -R admin:admin /obdata /obredo
```

初始化目录，创建目录软连接
```sql
[admin@OMS rpms]# ln -s /obredo/clog /obdata/clog
[admin@OMS rpms]# ln -s /obdata /home/admin/myoceanbase/oceanbase/store
```

手动启动节点，启动前配置下环境变量
```sql
export LD_LIBRARY_PATH=/home/admin/oceanbase/lib
```

执行进程启动命令，可以参考已启动节点
```sql
[admin@ob2 ~]$ /home/admin/oceanbase/bin/observer -I 172.24.255.18 -r '172.24.255.18:2882:2881' -p 2881 -P 2882 -z zone2 -n myoceanbase -c 1 -d /obdata -o __min_full_resource_pool_memory=2147483648,enable_syslog_recycle=True,enable_syslog_wf=False,max_syslog_file_count=4,memory_limit=23G,datafile_size=209G,system_memory=5G,log_disk_size=60G,cpu_count=16
/home/admin/oceanbase/bin/observer -I 172.24.255.18 -r 172.24.255.18:2882:2881 -p 2881 -P 2882 -z zone3 -n myoceanbase -c 1 -d /obdata -o __min_full_resource_pool_memory=2147483648,enable_syslog_recycle=True,enable_syslog_wf=False,max_syslog_file_count=4,memory_limit=23G,datafile_size=209G,system_memory=5G,log_disk_size=60G,cpu_count=16
local_ip: 172.24.255.18
rs list: 172.24.255.18:2882:2881
mysql port: 2881
rpc port: 2882
zone: zone3
appname: myoceanbase
cluster id: 1
data_dir: /obdata
optstr: __min_full_resource_pool_memory=2147483648,enable_syslog_recycle=True,enable_syslog_wf=False,max_syslog_file_count=4,memory_limit=23G,datafile_size=209G,system_memory=5G,log_disk_size=60G,cpu_count=16
```
启动命令参数解释：

| **参 数** | **说明** |
| --- | --- |
| -I &#124; -i <div style="width: 30pt">| <li>-I：指定待启动的节点 IP。在多机部署场景下，不能指定 127.0.0.1 作为目标 IP。建议使用指定 IP（例如：-I 10.10.10.1）来启动节点。<li>-i：指定网卡名，可通过 ifconfig 命令查看。<br>支持通过同时指定 IP 和网卡名（例如：-I 10.10.10.1 -i eth0）来启动节点。 |
| -p | 指定服务端口号，一般指定为 2881。 |
| -P | 指定 RPC 端口号，一般指定为 2882。 |
| -n | 指定集群名称。可自定义，不同集群名称不要重复即可。 |
| -z | 指定启动的 observer 进程所属的 Zone。 |
| -d | 指定集群主目录，初始化目录时创建的目录。除集群名字 $cluster_name 外，其他不要变动。 |
| -c | 指定集群 ID。为一组数字，可以自定义，不同集群不要重复即可。 |
| -l | 指定日志级别。 |
| -r | 指定 RS 列表，格式是 $ip:2882:2881，分号分割，表示 Root Service 信息。 |
| -o | 指定集群启动参数，需要根据实际情况设置。<li>- system_memory：指定 OceanBase 内部保留内存，默认是 30G ，机器内存比较少的情况下把这个调小，影响就是可能在性能测试时有内存不足问题。<li>- datafile_size：指定 OceanBase 数据文件 sstable 的大小（一次性初始化），根据 /data/1/ 可用空间评估，建议不少于 100G，同时又保留一些剩余空间。|


## **添加zone**
回到已安装节点并登陆
执行添加zone
```sql
obclient [oceanbase]> alter system add zone zone2;
Query OK, 0 rows affected (0.003 sec)
```

执行激活zone
```sql
obclient [oceanbase]> alter system start zone zone2;
Query OK, 0 rows affected (0.003 sec)

obclient [oceanbase]> select * from dba_ob_zones;
+-------+----------------------------+----------------------------+--------+-----+----------------+-----------+
| ZONE  | CREATE_TIME                | MODIFY_TIME                | STATUS | IDC | REGION         | TYPE      |
+-------+----------------------------+----------------------------+--------+-----+----------------+-----------+
| zone1 | 2023-08-22 17:37:30.158883 | 2023-08-22 17:37:30.159941 | ACTIVE |     | sys_region     | ReadWrite |
| zone2 | 2023-08-22 17:50:09.193881 | 2023-08-22 17:50:20.712790 | ACTIVE |     | default_region | ReadWrite |
+-------+----------------------------+----------------------------+--------+-----+----------------+-----------+
2 rows in set (0.001 sec)
```

## **添加server**
向zone中添加server
```sql
obclient [oceanbase]> ALTER SYSTEM ADD SERVER '172.24.255.18:2882' ZONE 'zone2';
Query OK, 0 rows affected (0.015 sec)

obclient [oceanbase]> select * from dba_ob_servers;
+---------------+----------+----+-------+----------+-----------------+--------+----------------------------+-----------+-----------------------+----------------------------+----------------------------+-------------------------------------------------------------------------------------------+-------------------+
| SVR_IP        | SVR_PORT | ID | ZONE  | SQL_PORT | WITH_ROOTSERVER | STATUS | START_SERVICE_TIME         | STOP_TIME | BLOCK_MIGRATE_IN_TIME | CREATE_TIME                | MODIFY_TIME                | BUILD_VERSION                                                                             | LAST_OFFLINE_TIME |
+---------------+----------+----+-------+----------+-----------------+--------+----------------------------+-----------+-----------------------+----------------------------+----------------------------+-------------------------------------------------------------------------------------------+-------------------+
| 172.24.255.17 |     2882 |  1 | zone1 |     2881 | YES             | ACTIVE | 2023-08-22 17:37:40.814023 | NULL      | NULL                  | 2023-08-22 17:37:30.449287 | 2023-08-22 17:37:42.220860 | 4.2.0.0_100010022023081817-0bdf1c0c5674e88c5ae9a8d0ae4f8077465d7fae(Aug 18 2023 17:32:49) | NULL              |
| 172.24.255.18 |     2882 |  2 | zone2 |     2881 | NO              | ACTIVE | 2023-08-22 19:00:25.594024 | NULL      | NULL                  | 2023-08-22 19:00:16.206194 | 2023-08-22 19:00:27.409670 | 4.2.0.0_100010022023081817-0bdf1c0c5674e88c5ae9a8d0ae4f8077465d7fae(Aug 18 2023 17:32:49) | NULL              |
+---------------+----------+----+-------+----------+-----------------+--------+----------------------------+-----------+-----------------------+----------------------------+----------------------------+-------------------------------------------------------------------------------------------+-------------------+
2 rows in set (0.000 sec)
```

## **添加Resource Pool**
此时，租户的副本还只有一个，需要再手动添加副本。这里以ocp租户为例，将ocp租户进行扩容
```sql
obclient [oceanbase]> SELECT TENANT_ID,TENANT_NAME,TENANT_TYPE,PRIMARY_ZONE,LOCALITY FROM oceanbase.DBA_OB_TENANTS where tenant_name="ocp";
+-----------+-------------+-------------+--------------+---------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | PRIMARY_ZONE | LOCALITY      |
+-----------+-------------+-------------+--------------+---------------+
|      1002 | ocp         | USER        | RANDOM       | FULL{1}@zone1 |
+-----------+-------------+-------------+--------------+---------------+
1 row in set (0.017 sec)
```

添加副本前，需要给新增的节点上添加resource_pool，添加resource pool有两种方式，一种是新建resource pool，一种是将现有租户的resource pool扩展到新的节点上
### **方式一：新增resource pool**
添加unit模版（可使用已有unit模版或新建unit模版）-> 新增resource_pool -> 为租户添加resource_pool
这里使用已有的unit模版，尽量保证每个副本的资源配置相同，查看ocp租户的unit模版名
```sql
obclient [oceanbase]> select * from DBA_OB_UNIT_CONFIGS;
+----------------+---------------------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
| UNIT_CONFIG_ID | NAME                      | CREATE_TIME                | MODIFY_TIME                | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS            | MIN_IOPS            | IOPS_WEIGHT |
+----------------+---------------------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
|              1 | sys_unit_config           | 2023-08-22 17:37:30.017366 | 2023-08-22 17:37:30.017366 |       1 |       1 |  2147483648 |    2147483648 | 9223372036854775807 | 9223372036854775807 |           1 |
|           1003 | ocp_unit                  | 2023-08-22 17:43:41.451573 | 2023-08-22 17:43:41.451573 |       1 |       1 |  2147483648 |    6442450944 | 9223372036854775807 | 9223372036854775807 |           1 |
+----------------+---------------------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
2 rows in set (0.001 sec)
```

或者使用如下方式查看租户的unit名称
```sql
SELECT NAME FROM DBA_OB_UNIT_CONFIGS WHERE UNIT_CONFIG_ID
IN
(SELECT UNIT_CONFIG_ID FROM DBA_OB_UNITS WHERE TENANT_ID
IN
(SELECT TENANT_ID FROM DBA_OB_TENANTS WHERE TENANT_NAME='ocp'));
```

查看当前ocp租户的resource_pool

```sql
obclient [oceanbase]> select * from DBA_OB_RESOURCE_POOLS;
+------------------+----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
| RESOURCE_POOL_ID | NAME     | TENANT_ID | CREATE_TIME                | MODIFY_TIME                | UNIT_COUNT | UNIT_CONFIG_ID | ZONE_LIST | REPLICA_TYPE |
+------------------+----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
|                1 | sys_pool |         1 | 2023-08-22 17:37:30.020615 | 2023-08-22 17:37:30.027149 |          1 |              1 | zone1     | FULL         |
|             1001 | ocp_pool |      1002 | 2023-08-22 17:37:43.620077 | 2023-08-22 17:43:41.475641 |          1 |           1003 | zone1     | FULL         |
+------------------+----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
2 rows in set (0.003 sec)
```
可以看到ocp租户的unit模版为ocp_unit，因此再新建一个resource pool，使用ocp_unit 模版

添加resource_pool
```sql
root@oceanbase03:43:05>create resource pool ocp_pool2 unit="ocp_unit", unit_num=1,zone_list=('zone2');
Query OK, 0 rows affected (0.02 sec)

obclient [oceanbase]> select * from DBA_OB_RESOURCE_POOLS;
+------------------+-----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
| RESOURCE_POOL_ID | NAME      | TENANT_ID | CREATE_TIME                | MODIFY_TIME                | UNIT_COUNT | UNIT_CONFIG_ID | ZONE_LIST | REPLICA_TYPE |
+------------------+-----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
|                1 | sys_pool  |         1 | 2023-08-22 17:37:30.020615 | 2023-08-22 17:37:30.027149 |          1 |              1 | zone1     | FULL         |
|             1001 | ocp_pool  |      1002 | 2023-08-22 17:37:43.620077 | 2023-08-22 17:43:41.475641 |          1 |           1003 | zone1     | FULL         |
|             1002 | ocp_pool2 |      NULL | 2023-08-22 18:50:46.640215 | 2023-08-22 18:50:46.640215 |          1 |           1004 | zone2     | FULL         |
+------------------+-----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
2 rows in set (0.003 sec)
```
resource_pool的tenant_id为NULL，为ocp租户添加新建的resource_pool
```sql
root@oceanbase03:55:12> alter tenant ocp resource_pool_list=('ocp_pool','ocp_pool2');
Query OK, 0 rows affected (0.79 sec)

obclient [oceanbase]> select * from DBA_OB_RESOURCE_POOLS;
+------------------+-----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
| RESOURCE_POOL_ID | NAME      | TENANT_ID | CREATE_TIME                | MODIFY_TIME                | UNIT_COUNT | UNIT_CONFIG_ID | ZONE_LIST | REPLICA_TYPE |
+------------------+-----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
|                1 | sys_pool  |         1 | 2023-08-22 17:37:30.020615 | 2023-08-22 17:37:30.027149 |          1 |              1 | zone1     | FULL         |
|             1001 | ocp_pool  |      1002 | 2023-08-22 17:37:43.620077 | 2023-08-22 17:43:41.475641 |          1 |           1003 | zone1     | FULL         |
|             1002 | ocp_pool2 |      1002 | 2023-08-22 18:50:46.640215 | 2023-08-22 18:50:46.640215 |          1 |           1004 | zone2     | FULL         |
+------------------+-----------+-----------+----------------------------+----------------------------+------------+----------------+-----------+--------------+
2 rows in set (0.003 sec)
```
可以看到，租户ocp在新加入的机器上已经有了resource pool

### **方式二：扩展已有resource pool**
直接修改现有租户的resource pool
```sql
root@oceanbase03:55:12> ALTER RESOURCE POOL ocp_pool ZONE_LIST=('zone1','zone2');
```

## **添加租户副本**

修改租户的locality
```sql
obclient [oceanbase]> ALTER TENANT ocp locality="F@zone1, F@zone2";
Query OK, 0 rows affected (0.139 sec)
```

> 注：这里有两个前提条件
> - 添加副本时，primary zone所在的region内至少要有2个全功能型副本，否则就会添加失败，报错“primary zone F type replica not enough in its region not allowed”；
> - primary region不能多于1个，否则会报“ERROR 1235 (0A000): tenant primary zone span regions not supported”；
> - 这些限制目的主要是防止多数派能跨region，造成延迟过大

```sql
obclient [oceanbase]> ALTER TENANT ocp locality="F@zone1, F@zone2";
ERROR 4179 (HY000): primary zone F type replica not enough in its region not allowed

obclient [oceanbase]> ALTER TENANT ocp locality="F@zone1, F@zone2, F@zone3";
ERROR 1235 (0A000): tenant primary zone span regions not supported
```

查看副本添加任务情况
```sql
obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_TENANT_JOBS WHERE JOB_TYPE = 'ALTER_TENANT_LOCALITY';
+--------+-----------------------+------------+-------------+----------+----------------------------+----------------------------+-----------+----------------------------------------------+---------------+---------------+-------------+
| JOB_ID | JOB_TYPE              | JOB_STATUS | RESULT_CODE | PROGRESS | START_TIME                 | MODIFY_TIME                | TENANT_ID | SQL_TEXT                                     | EXTRA_INFO    | RS_SVR_IP     | RS_SVR_PORT |
+--------+-----------------------+------------+-------------+----------+----------------------------+----------------------------+-----------+----------------------------------------------+---------------+---------------+-------------+
|      1 | ALTER_TENANT_LOCALITY | SUCCESS    |           0 |      100 | 2023-08-23 12:00:33.923511 | 2023-08-23 12:10:58.213438 |      1002 | ALTER TENANT ocp locality="F@zone1, F@zone2" | FULL{1}@zone1 | 172.24.255.17 |        2882 |
+--------+-----------------------+------------+-------------+----------+----------------------------+----------------------------+-----------+----------------------------------------------+---------------+---------------+-------------+
1 rows in set (0.017 sec)
```
当 JOB_STATUS 为 SUCCESS，则表示添加成功

再次查看租户的副本情况
```sql
obclient [oceanbase]> SELECT TENANT_ID,TENANT_NAME,TENANT_TYPE,PRIMARY_ZONE,LOCALITY FROM oceanbase.DBA_OB_TENANTS where tenant_name="ocp";
+-----------+-------------+-------------+--------------+------------------------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | PRIMARY_ZONE | LOCALITY                     |
+-----------+-------------+-------------+--------------+------------------------------+
|      1002 | ocp         | USER        | zone1;zone2  | FULL{1}@zone1, FULL{1}@zone2 |
+-----------+-------------+-------------+--------------+------------------------------+
1 row in set (0.004 sec)
```

再添加新的节点，使用同样方式即可。

添加zone3及租户副本
```sql
obclient [oceanbase]> ALTER TENANT ocp locality="F@zone1, F@zone2, F@zone3";
Query OK, 0 rows affected (0.121 sec)
```
添加成功
```sql
obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_TENANT_JOBS WHERE JOB_TYPE = 'ALTER_TENANT_LOCALITY';
+--------+-----------------------+------------+-------------+----------+----------------------------+----------------------------+-----------+-------------------------------------------------------+------------------------------+---------------+-------------+
| JOB_ID | JOB_TYPE              | JOB_STATUS | RESULT_CODE | PROGRESS | START_TIME                 | MODIFY_TIME                | TENANT_ID | SQL_TEXT                                              | EXTRA_INFO                   | RS_SVR_IP     | RS_SVR_PORT |
+--------+-----------------------+------------+-------------+----------+----------------------------+----------------------------+-----------+-------------------------------------------------------+------------------------------+---------------+-------------+
|      1 | ALTER_TENANT_LOCALITY | SUCCESS    |           0 |      100 | 2023-08-23 12:00:33.923511 | 2023-08-23 12:10:58.213438 |      1002 | ALTER TENANT ocp locality="F@zone1, F@zone2"          | FULL{1}@zone1                | 172.24.255.17 |        2882 |
|      2 | ALTER_TENANT_LOCALITY | SUCCESS    |           0 |      100 | 2023-08-23 13:47:51.957014 | 2023-08-23 14:00:14.633674 |      1002 | ALTER TENANT ocp locality="F@zone1, F@zone2, F@zone3" | FULL{1}@zone1, FULL{1}@zone2 | 172.24.255.17 |        2882 |
+--------+-----------------------+------------+-------------+----------+----------------------------+----------------------------+-----------+-------------------------------------------------------+------------------------------+---------------+-------------+
2 rows in set (0.003 sec)
```

查看租户副本情况
```sql
obclient [oceanbase]> SELECT TENANT_ID,TENANT_NAME,TENANT_TYPE,PRIMARY_ZONE,LOCALITY FROM oceanbase.DBA_OB_TENANTS where tenant_name="ocp";
+-----------+-------------+-------------+--------------+---------------------------------------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | PRIMARY_ZONE | LOCALITY                                    |
+-----------+-------------+-------------+--------------+---------------------------------------------+
|      1002 | ocp         | USER        | zone1;zone2  | FULL{1}@zone1, FULL{1}@zone2, FULL{1}@zone3 |
+-----------+-------------+-------------+--------------+---------------------------------------------+
1 row in set (0.006 sec)
```

## **高可用测试**
创建一张表并插入一条数据
```sql
obclient [test]> create table t1(id int);
Query OK, 0 rows affected (0.194 sec)

obclient [test]> insert into t1 values(111);
Query OK, 1 row affected (0.008 sec)

obclient [test]> select * from t1;
+------+
| id   |
+------+
|  111 |
+------+
1 row in set (0.002 sec)
```

查看表的leader所在节点
![image.png](/img/operation_maintenance/single2distribution/a.png)

表leader在 172.24.255.17 上，通过shell写个脚本，循环每隔一秒查询下t1表
```shell
#!/bin/bash

for ((i=1;i<1000; i++));
do
time=$(date "+%Y-%m-%d %H:%M:%S")
obclient -h172.24.255.17 -P2883 -u'root@obtest#myoceanbase' -p'xxxx' -Dtest -A -e "select * from t1;" > /dev/null;
if [ $? -eq 0 ]; then
    echo $time: "SUCCESS"
else
    echo $time: "FAILED"
fi
sleep 1;
done
```

然后把 172.24.255.17 机器上的observer进程kill掉，看下是否能自动实现切换
![image.png](/img/operation_maintenance/single2distribution/b.png)

从下面的执行结果来看，SQL在卡了5s左右之后，继续输出了结果，并且因为Paxos协议，这个切换过程中，可以保证数据没有丢失。
![image.png](/img/operation_maintenance/single2distribution/c.png)

再次查看表LEADER情况，可以看到进程杀死之后，LEADER切换到了172.24.255.18上
![image.png](/img/operation_maintenance/single2distribution/d.png)
