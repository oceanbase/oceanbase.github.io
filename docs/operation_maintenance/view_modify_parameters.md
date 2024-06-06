---
title: 查看及修改参数
weight: 5
---
# **查看及修改参数**

本文介绍如何查看和修改集群参数、租户参数。

## **集群参数**

OceanBase 数据库以集群形态运行，提供多租户（也叫多实例）能力。集群初始化成功后，默认会有一个 sys 租户，用以保存集群的所有元数据、参数等。您也可通过登录 sys 租户管理 OceanBase 集群。

### **查看和修改 OceanBase 集群参数**

您可通过命令 `show parameters [ like '%参数名特征%' ] ;` 或 `show parameters where name in ( '参数名1' , '参数名2' ) ;` 查看 OceanBase 集群参数。

在命令 `show parameters [ like '%参数名特征%' ] ;` 中不带 like 子句表示查看所有参数。

现在以查看参数 memory_limit 和 memory_limit_percentage 为例进行讲解。

首先这两个参数是指定进程 observer 启动后能获取的最大内存，如果分配不出来进程可能会启动失败或运行异常。这个内存可以指定大小，也可以指定总可用内存的比例。无论使用哪种方法，都需要确保实际可以使用的内存不少于 8G。

这两个参数实际只有一个生效，取两个参数中的最低值。memory_limit 设置为 0 时就表示不限制。使用哪个参数控制进程 observer 内存大小由运维人员决定。生产环境中，机器内存很大的时候，通常是通过 memory_limit_percentage 控制，默认值是 80（表示总可用内存的 80%）。

```sql
MySQL [oceanbase]> show parameters like 'memory_limit%';
+-------+----------+---------------+----------+-------------------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+
| zone  | svr_type | svr_ip        | svr_port | name                    | data_type | value | info                                                                                                                           | section  | scope   | source  | edit_level        |
+-------+----------+---------------+----------+-------------------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+
| zone1 | observer | x.x.x.x       |     2882 | memory_limit_percentage | NULL      | 80    | the size of the memory reserved for internal use(for testing purpose). Range: [10, 90]                                         | OBSERVER | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
| zone1 | observer | x.x.x.x       |     2882 | memory_limit            | NULL      | 8G    | the size of the memory reserved for internal use(for testing purpose), 0 means follow memory_limit_percentage. Range: 0, [8G,) | OBSERVER | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
+-------+----------+---------------+----------+-------------------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+
2 rows in set (0.002 sec)

MySQL [oceanbase]> show parameters where name in ('memory_limit','memory_limit_percentage')\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: memory_limit_percentage
 data_type: NULL
     value: 80
      info: the size of the memory reserved for internal use(for testing purpose). Range: [10, 90]
   section: OBSERVER
     scope: CLUSTER
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
*************************** 2. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: memory_limit
 data_type: NULL
     value: 8G
      info: the size of the memory reserved for internal use(for testing purpose), 0 means follow memory_limit_percentage. Range: 0, [8G,)
   section: OBSERVER
     scope: CLUSTER
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
2 rows in set (0.002 sec)0
```

上述参数输出结果说明如下：

| 列名 | 列值 | 备注 |
| --- | --- | --- |
| zone | zone1 | 节点的 Zone 名称 |
| svr_type | observer | 节点类型 |
| svr_ip | x.x.x.x | 节点 IP |
| svr_port | 2882 | 节点 RPC 端口 |
| name | memory_limit_percentage | 参数名 |
| data_type | NULL | 参数类型 |
| value | 80 | 参数值 |
| info | the size of the memory reserved for internal use(for testing purpose). Range [10, 90] | 参数的描述。 该参数的这个描述不是很准确，这是限制进程 observer 能分配的最大内存 |
| section | OBSERVER | 参数归类 |
| scope | CLUSTER | 参数生效范围 |
| edit_level | DYNAMIC_EFFECTIVE | 参数生效时机：动态生效 / 需要重启 |

OceanBase 集群参数可通过命令 alter system set 参数名='参数值' [ server = '节点IP:节点RPC端口' ] ; 进行修改。不指定 server 子句表示参数修改应用于所有 OceanBase 集群节点。

示例：调整参数 syslog_level 值为 USER_ERROR。

```sql
MySQL [oceanbase]> alter system set syslog_level = 'USER_ERR' server='x.x.x.x:2882' ;
Query OK, 0 rows affected (0.021 sec)

MySQL [oceanbase]> show parameters like 'syslog_level'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: syslog_level
 data_type: NULL
     value: USER_ERR
      info: specifies the current level of logging. There are DEBUG, TRACE, INFO, WARN, USER_ERR, ERROR, six different log levels.
   section: OBSERVER
     scope: CLUSTER
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.002 sec)
```

### **OceanBase 集群参数文件**

上述参数的修改都是立即生效，并且参数修改会持久化到 OceanBase 集群节点自己的参数文件。

> **注意**
>
> 此处的 OceanBase 集群节点自己的参数文件，不是指前面提到的 OBD 集群部署参数文件。

通常 OceanBase 集群每个节点的启动目录下都会有一个目录 etc，保存了该节点进程的参数文件 observer.config.bin。observer.config.bin 是一个 binary 类型的文件，不能直接用 cat 命令读取，您可使用 strings 命令读取。该文件也不建议直接修改，您可通过上面提到的命令进行修改。

```bash
[admin@obce00 oceanbase-ce]$ pwd
/home/admin/oceanbase-ce
[admin@obce00 oceanbase-ce]$ tree -L 2
.

├── bin
│   └── observer -> /home/admin/.obd/repository/oceanbase-ce/3.1.0/84bd2fe27f8b8243cc57d8a3f68b4c50f94aab80/bin/observer
├── etc
│   ├── observer.config.bin
│   └── observer.config.bin.history
├── etc2
│   ├── observer.conf.bin
│   └── observer.conf.bin.history
├── etc3
│   ├── observer.conf.bin
│   └── observer.conf.bin.history

<省略掉无关内容>

9 directories, 20 files
```

从上述目录结构可得，启动目录下有三个文件夹：etc、etc2、etc3，每个文件夹下都有其参数文件及其历史文件备份。

observer 进程默认会读取文件夹 etc 中的参数文件，其他两个目录是参数文件的备份，这个备份路径也是通过参数 config_additional_dir 指定的，默认值是同一个启动目录的 etc2 和 etc3。

生产环境一般会将 etc 设置到其他磁盘，这样会更加安全。当前 OBD 版本还是把它放到同一块盘，但参数文件需要放到哪里并没有具体规定，您可自行修改。

> **说明**
>
> etc2 和 etc3 下的参数文件名跟 etc 下参数文件名并不完全一致。

```sql
MySQL [oceanbase]> show parameters like 'config_additional_dir'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: config_additional_dir
 data_type: NULL
     value: etc2;etc3
      info: additional directories of configure file
   section: OBSERVER
     scope: CLUSTER
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.002 sec)

[admin@obce00 oceanbase-ce]$ strings etc/observer.config.bin | grep -n memory_limit
25:memory_limit=8G
[admin@obce00 oceanbase-ce]$ strings etc2/observer.conf.bin | grep -n memory_limit
25:memory_limit=8G
[admin@obce00 oceanbase-ce]$ strings etc3/observer.conf.bin | grep -n memory_limit
25:memory_limit=8G
```

查看实际参数文件内容，可以看出不是所有参数都在这个参数文件中。只有那些被 alter system set 命令修改过的参数，以及在进程 observer 启动时通过 -o 指定的参数才会记录在参数文件里。其他参数都是取默认值（写在进程 observer 的代码里）。

### **使用 OBD 修改 OceanBase 集群参数**

上文中直接在 OceanBase 集群里修改参数后，会立即同步到集群节点自身的参数文件中，但是不会同步到 OBD 的集群部署配置文件中（后期 OBD 可能会改进这个功能）。

所以，在您使用 OBD 工具重启 OceanBase 集群时，默认又会带参数启动进程 observer。如果前面在 OceanBase 集群里修改的参数在 OBD 集群部署配置文件中也有，并且 OBD 集群部署配置文件的值还是未经修改的，那就意味着修改过的参数又被调整回原来的设置值了（运维需要理解这里变化的原理）。

针对这个问题，OBD 提供两个解决思路：

- 手动同步修改 OBD 集群部署配置文件中的参数值（以后工具可能会自动同步）。

- OBD 重启集群的时候不带参数启动节点进程。

您可使用命令 obd cluster edit-config 编辑集群部署配置文件，退出时会保存到上文的工作目录中。

```bash
obd cluster edit-config obce-single

保存时输出：
oceanbase-ce-3.1.0 already installed.
Search param plugin and load ok
Parameter check ok
Save deploy "obce-single" configuration
deploy "need reload"
```

使用命令 edit-config 退出后会提示 reload 集群配置。

```bash
[admin@obce00 ~]$ obd cluster reload obce-single
Get local repositories and plugins ok
Open ssh connection ok
Cluster status check ok
Connect to observer ok
obce-single reload
```

> **说明**
>
> 如果 OBD 命令运行出错，可以运行命令 `tail -n 50 ~/.obd/log/obd` 查看日志。

### **进程启动时指定参数**

前面说到 OBD 在启动集群节点进程 observer 时，会在命令行下通过 -o 指定参数。对于运维来说，如果某个节点的进程 observer 因为某种原因退出，启动进程是当务之急。可能需要调整某个参数再启动一次，通过 OBD 工具会导致效率低下。所以，掌握 OceanBase 集群节点进程 observer 的启动方法是很有必要的。

首先进入到工作目录。必须在上一次启动 observer 进程的工作目录（假设它是正确的）下再次尝试。前面分析过，工作目录在 OBD 集群部署配置文件中指定 home_path。本教程里工作目录都默认是 /home/admin/oceanbase-ce。进程 observer 启动后会在这个目录找目录 etc，找默认的参数文件 observer.config.bin。启动后的日志会默认写到 log/{observer.log, rootservice.log, election.log}。所以，工作目录不能错，目录的权限也不能错。

示例：不带参数启动进程 observer 。为了模拟故障，先强行杀掉进程 observer。

```bash
[admin@obce00 ~]$ cd
[admin@obce00 ~]$ cd oceanbase-ce/
[admin@obce00 oceanbase-ce]$ kill -9 `pidof observer`
[admin@obce00 oceanbase-ce]$ sleep 3
[admin@obce00 oceanbase-ce]$ ps -ef|grep observer
admin      35278   28904  0 11:26 pts/2    00:00:00 grep --color=auto observer
[admin@obce00 oceanbase-ce]$ pwd
/home/admin/oceanbase-ce
[admin@obce00 oceanbase-ce]$ bin/observer
bin/observer
[admin@obce00 oceanbase-ce]$ ps -ef|grep observer
admin      35280       1 99 11:26 ?        00:00:06 bin/observer
admin      35848   28904  0 11:26 pts/2    00:00:00 grep --color=auto observer
[admin@obce00 oceanbase-ce]$ netstat -ntlp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:2881            0.0.0.0:*               LISTEN      35280/bin/observer
tcp        0      0 0.0.0.0:2882            0.0.0.0:*               LISTEN      35280/bin/observer
```

示例：带参数启动进程 observer。为了模拟故障，先强行杀掉进程 observer。

```bash
[admin@obce00 oceanbase-ce]$ kill -9 `pidof observer`
[admin@obce00 oceanbase-ce]$ sleep 3
[admin@obce00 oceanbase-ce]$ bin/observer -o "max_syslog_file_count=15,datafile_size=60G"
bin/observer -o max_syslog_file_count=15,datafile_size=60G
optstr: max_syslog_file_count=15,datafile_size=60G
[admin@obce00 oceanbase-ce]$ ps -ef|grep observer
admin      35867       1 99 11:34 ?        00:00:09 bin/observer -o max_syslog_file_count=15,datafile_size=60G
admin      36435   28904  0 11:34 pts/2    00:00:00 grep --color=auto observer
[admin@obce00 oceanbase-ce]$ netstat -ntlp
(Not all processes could be identified, non-owned process info
 will not be shown, you would have to be root to see it all.)
Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      -
tcp        0      0 0.0.0.0:2881            0.0.0.0:*               LISTEN      35867/bin/observer
tcp        0      0 0.0.0.0:2882            0.0.0.0:*               LISTEN      35867/bin/observer
```

## **租户参数**

### **通过 SYS 租户修改业务租户参数**

上一节介绍了 OceanBase 集群参数设置，其中有部分参数生效范围是租户（TENANT）。在 OceanBase 内部租户（sys）里，可以修改业务实例的部分参数。比如参数 writing_throttling_trigger_percentage，用于对指定租户进行内存限流（增量内存使用率达到这个阈值就对写入降速）。

```sql
MySQL [oceanbase]> show parameters like 'writing_throttling_trigger_percentage%'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: writing_throttling_trigger_percentage
 data_type: NULL
     value: 100
      info: the threshold of the size of the mem store when writing_limit will be triggered. Rang:(0, 100]. setting 100 means turn off writing limit
   section: TRANS
     scope: TENANT
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.002 sec)

MySQL [oceanbase]> alter system set writing_throttling_trigger_percentage = 90 tenant='obmysql';
Query OK, 0 rows affected (0.011 sec)
```

修改后的参数值只能在对应租户里查看。

```sql
$ mysql -h x.x.x.x -u root@obmysql -P 2881 -p -c -A oceanbase
Enter password:
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 3221538749
Server version: 5.7.25 OceanBase 3.1.0 (r3-b20901e8c84d3ea774beeaca963c67d7802e4b4e) (Built Aug 10 2021 08:10:38)

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [oceanbase]> show parameters like 'writing_throttling_trigger_percentage%'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: writing_throttling_trigger_percentage
 data_type: NULL
     value: 90
      info: the threshold of the size of the mem store when writing_limit will be triggered. Rang:(0, 100]. setting 100 means turn off writing limit
   section: TRANS
     scope: TENANT
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.004 sec)
```

### **修改业务租户参数**

在业务租户里，可以自己设置参数。比如，参数 writing_throttling_maximum_duration，用于控制增量内存的剩余内存根据当前写入速度的最长写入时间。触发写入限速后，剩余 memstore 的内存量预期在 writing_throttling_maximum_duration 时间内分配完。

> **说明**
>
> 该参数仅供参考，准确性不及参数 `writing_throttling_trigger_percentage`。

```sql
## 在业务租户里修改参数，后面就不需要指定租户名。

MySQL [oceanbase]> alter system set writing_throttling_maximum_duration = '2h';
Query OK, 0 rows affected (0.006 sec)

MySQL [oceanbase]> show parameters like 'writing_throttling_maximum_duration'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: x.x.x.x
  svr_port: 2882
      name: writing_throttling_maximum_duration
 data_type: NULL
     value: 2h
      info: maximum duration of writing throttling(in minutes), max value is 3 days
   section: TRANS
     scope: TENANT
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.004 sec)
```

### **修改业务租户变量**

OceanBase 租户还有一个名为变量（VARIABLE）的设计，这个和 MySQL 实例很像。变量其实就是租户的参数。可以在租户全局层面修改，也可以在会话层面修改，很多变量和对应的 SQL HINT 还可在语句级别修改。

全局层面的修改影响的是后续的会话，会话层面的修改仅影响当前会话，语句级别的修改只影响当前语句。

初次使用 OceanBase 租户时，建议调整租户的几个超时参数。

- ob_query_timeout：语句执行超时时间，单位 us，默认值是 10000000 （即 10s）。建议根据业务 SQL 的平均执行时间水平调整。OLTP 场景调整小一些，OLAP 场景调整大一些。初学者建议调大 10 倍。

- ob_trx_idle_timeout：事务空闲超时时间，单位 us，默认值是 120000000（即 120s）。建议根据业务事务平均空闲时间水平调整。空闲事务会占用连接，并可能持有锁不释放，导致高并发时阻塞和死锁概率增加，不建议调大。

- ob_trx_timeout：事务未提交超时时间，单位 us，默认值是 100000000 （即 100s）。建议根据业务事务平均持续时间水平调整。事务长期不提交，会占用连接、可能持有锁不释放，导致高并发时阻塞和死锁概率增加，不建
议调大。如果是后台跑批业务，建议在会话级别调大。

- ob_trx_lock_timeout：事务申请加锁等待超时时间，单位 us，默认值是 -1，即不控制。超时依然会受 ob_query_timeout 限制。当调大语句超时时间变量（ob_query_timeout）后，可以将这个锁等待超时改为 10000000 （即 10s），以减少阻塞和死锁的概率。

您可运行以下命令查看和修改变量：

```sql
show global | session variables like '%变量名部分字段%' ;

set global | session 变量名 =  '变量值' ;
```

示例：

```sql
MySQL [oceanbase]> show global variables like '%timeout%';
+---------------------+------------------+
| Variable_name       | Value            |
+---------------------+------------------+
| connect_timeout     | 10               |
| interactive_timeout | 28800            |
| lock_wait_timeout   | 31536000         |
| net_read_timeout    | 30               |
| net_write_timeout   | 60               |
| ob_pl_block_timeout | 3216672000000000 |
| ob_query_timeout    | 10000000         |
| ob_trx_idle_timeout | 120000000        |
| ob_trx_lock_timeout | -1               |
| ob_trx_timeout      | 100000000        |
| wait_timeout        | 28800            |
+---------------------+------------------+
11 rows in set (0.002 sec)

MySQL [oceanbase]> set global ob_query_timeout = 100000000;
Query OK, 0 rows affected (0.015 sec)

MySQL [oceanbase]> set global ob_trx_timeout = 1000000000;
Query OK, 0 rows affected (0.014 sec)

MySQL [oceanbase]> set global ob_trx_idle_timeout = 1200000000;
Query OK, 0 rows affected (0.010 sec)

MySQL [oceanbase]> SET GLOBAL ob_trx_lock_timeout=10000000;
Query OK, 0 rows affected (0.011 sec)
```

对于复杂的 SQL 场景或者 OLAP 场景，租户还需要调整 ob_sql_work_area_percentage 变量。该变量影响 SQL 里排序统计能利用的内存大小，可以根据情况进行调整。

```sql
set global ob_sql_work_area_percentage=50;
```

### **通过 SYS 租户修改业务租户变量**

> **注意**
>
> 部分变量属于租户初始化变量，不能在业务租户里直接修改，需要在 sys 租户里修改。

示例：

```sql
$ mysql -h x.x.x.x -uroot@obmysql#obdemo -P2883 -p****** -c -A oceanbase -Ns
MySQL [oceanbase]> set global lower_case_table_names=0;
ERROR 1238 (HY000): Variable 'lower_case_table_names' is a read only variable

$mysql -h x.x.x.x -uroot@sys#obdemo -P2883 -p****** -c -A oceanbase -Ns
MySQL [oceanbase]> alter tenant obmysql set variables lower_case_table_names=0;

$ mysql -h x.x.x.x -uroot@obmysql#obdemo -P2883 -p****** -c -A oceanbase -Ns
MySQL [oceanbase]> show global variables like 'lower_case_table_names';
lower_case_table_names  0
```

有些变量比较特殊，比如：

- 变量 ob_tcp_invited_nodes，表示租户访问 IP 白名单。初始化租户的时候在 sys 租户中设置，后期可以在业务租户里修改。

  ```sql
  set global ob_tcp_invited_nodes='x.x.x.x/16,127.0.0.1';
  ```
  
  如果业务租户设置错误导致无法登录，可以通过 sys 租户再改回正确值。

- 变量 ob_compatibility_mode 表示租户兼容性。这个在租户创建时指定，后期不能修改。
