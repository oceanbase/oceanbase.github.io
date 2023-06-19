---
title: 配置文件
weight: 3
---
# **配置文件**

本文介绍使用 OBD 部署 OceanBase 数据库时所用配置文件中各个配置项的含义，并着重介绍几个需重点关注的配置项。

## **基础配置文件**

根据您安装 OBD 方式的不同有如下几种查看配置文件的途径。

- 如您通过 OBD RPM 包直接安装 OBD，可在　`/usr/obd/example` 目录下查看配置文件。

- 如您通过 all-in-one 安装包安装 OBD，可在 `~/.oceanbase-all-in-one/conf` 目录下查看配置文件。

- 您也可直接从 OBD 的 [GitHub 仓库](https://github.com/oceanbase/obdeploy/tree/master/example) 获取配置文件。

此处以 `distributed-with-obproxy-example.yaml` 为例介绍各配置项含义。

```shell
#如果中控机（OBD 机器）是远程访问 OBServer 节点，需要提供用户和密码或者用户和对应的私钥。（如果部署单节点，只有在 IP 为127.0.0.1，用户为当前用户时才不需要身份校验，其他时候需要填写正确的密码或者密钥。）
user:
   username: admin
#   password: your password if need
   key_file: /home/admin/.ssh/id_rsa
#   port: your ssh port, default 22
#   timeout: ssh connection timeout (second), default 30
oceanbase-ce:
  servers: # 表示 OBServer 节点，需要调整 IP 为自己的规划的 OBServer 节点 IP
    - name: server1
      ip: x.x.x.x
    - name: server2
      ip: x.x.x.x
    - name: server3
      ip: x.x.x.x
  global:
    devname: eth0 # 表示OBServer节点对应的主机IP对应的网卡名
    memory_limit: 64G # 表示 OBServer 进程最大能使用的内存上限
    system_memory: 30G # 表示从 memory_limit 划出指定大小的内存做保留系统内存，在 OceanBase 数据库中这部分内存不属于任何一个租户，在内部称之为500租户
    datafile_size: 200G # 表示OceanBase预分配的数据文件大小，会立即从磁盘上将指定的大小占用，目前改参数生效后不支持调小，只能调大，建议初始设置不宜太大，可分配磁盘空间50%的大小
    log_disk_size: 200G # 表示OceanBase预分配的redo日志文件大小，会立即从磁盘上将指定的大小占用。
    datafile_next: 200G # 控制磁盘空间的增长步长，用于设置自动扩容
    datafile_maxsize: 1T # 限制磁盘空间的最大可用上限，用于设置自动扩容
    cpu_count: 16
    syslog_level: WARN # 默认是info级别，会生成大量的observer日志，可以根据需要调整WARN，或者ERROR级别
    enable_syslog_wf: false # 设置是否把 WARN 以上级别的系统日志打印到一个单独的日志文件中。默认值为 true。
    enable_syslog_recycle: true # 指定是否自动回收系统日志，需要和 max_syslog_file_count 参数搭配使用，当 max_syslog_file_count 设置为非 0 值时才会生效。
    max_syslog_file_count: 10 # 设置在回收日志文件之前可以容纳的日志文件数量。默认最多保留4个observer日志，每个observer日志文件256M，建议结合磁盘大小保留尽可能多的日志，避免有问题排查的时候发现日志已经被循环复用了
    appname: obcluster #指定的是OceanBase集群的名字，必须跟obproxy部分的obproxy->global->cluster_name保持一致。后续可以通过show parameters like 'cluster'; 查看，value 值即为集群的名字。
    root_password: ****** # 将对应的注释打开，填写的是sys租户下的root用户的密码
    proxyro_password: ******  # 将对应的注释打开，填写的是sys租户下proxyro用户的密码
  server1: # 首先需要说明一下这个层级的server1/server2/server3 分别对应的是 oceanbase-ce -> servers -> name 名字可以修改，做到一一对应即可
    mysql_port: 2881 # 作为外部连接OceanBase的端口，默认是2881，可以自定义，在集群启动后不允许修改
    rpc_port: 2882 # 作为OceanBase的内部的rpc通信端口，默认是2882，可以自定义，在集群启动后不允许修改
    home_path: /home/admin/observer #OceanBase的工作目录，软件/lib/etc等都在这个路径下
    data_dir: /data # OceanBase的data目录,默认在$home_path/store，$home_path/store/$appname部署，建议软链接到独立盘部署
    redo_dir: /redo # OceanBase的redo目录，建议软链接到独立盘部署
    zone: zone1 # zone1 指定的observer对应的zone名称
  server2:
    mysql_port: 2881
    rpc_port: 2882
    home_path: /home/admin/observer
    data_dir: /data
    redo_dir: /redo
    zone: zone2
  server3:
    mysql_port: 2881
    rpc_port: 2882
    home_path: /home/admin/observer
    data_dir: /data
    redo_dir: /redo
    zone: zone3
obproxy-ce:
  depends:
    - oceanbase-ce
  servers: #表示 OBProxy 的节点，需要调整 IP 为我们自己的规划的 OBProxy 节点 IP，如果有多个 OBProxy 节点，可以参照oceanbase-ce -> servers 的格式书写
    - name: server1
      ip: x.x.x.x
    - name: server2
      ip: x.x.x.x
    - name: server3
      ip: x.x.x.x
  global:
    listen_port: 2883 # 表示 OBProxy 对外提供的访问端口，默认 2883，可以自定义
    prometheus_listen_port: 2884 # 表示对外提供对接prometheus port的端口，默认2884，可以自定义
    home_path: /home/admin/obproxy # 表示obproxy的工作目录,包括bin/lib/etc/log等子目录
    # format: ip:mysql_port;ip:mysql_port. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    # rs_list: x.x.x.x:2881;x.x.x.x:2881;x.x.x.x:2881
    enable_cluster_checkout: false
    cluster_name: obcluster # 表示obproxy可以对接的OceanBase集群的名字，目前依赖已经自动跟 oceanbase-ce -> global -> appname 保持一致，了解即可
    skip_proxy_sys_private_check: true
    obproxy_sys_password: ****** # 表示管理obproxy的root@proxysys用户的密码
    observer_sys_password: ****** # 对应OceanBase集群proxyro@sys的密码，目前的依赖已经自动跟 oceanbase-ce -> global -> proxyro_password 密码保持一致，了解即可
```

其中您需重点关注的配置项有如下几个。

| 配置项         | 是否必选  | 默认值 | 说明  |
|---------------|-----------|-------|-------|
| memory_limit  | 可选      | 0     | observer 进程能从环境中获取的最大内存，推荐配置为系统总内存的 80%~90%，未配置的情况下以 `memory_limit_percentage` 配置项为准，配置项详细介绍请参考 [memory_limit](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001700950) 和 [memory_limit_percentage](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699328)。  |
| system_memory | 可选      | 0M    | 保留的系统内存，该参数值会占用 `memory_limit` 的内存，推荐配置为 `memory_limit` 的 10%，未配置的情况下 OceanBase 数据库会自适应。  |
| datafile_size | 可选      | 0     | 指定对应节点数据文件（block_file）大小，未配置的情况下以 `datafile_disk_percentage` 配置项为准，详细介绍请参考 [datafile_size](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001702095) 和 [datafile_disk_percentage](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001702094)。  |
| log_disk_size | 可选      | 0     | 用于设置 Redo 日志磁盘的大小，未配置的情况下以log_disk_percentage 配置项为准，详细介绍请参考 [log_disk_size](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001702124) 和 [log_disk_percentage](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001702125)。  |
| cpu_count     | 可选      | 0     | OBServer 节点可用 CPU 总数。推荐配置为系统 CPU 总数（总数可通过 lscpu 查看）。     |

表格中提及的配置项均可通过如下命令查询修改。

```sql
# 查询配置项
show parameters where name = 'xxx';

# 修改配置项，以 memory_limit 为例
alter system set memory_limit='32G';
```

## **其他组件**

- OBAgent：监控采集框架。OBAgent 默认支持的插件包括主机数据采集、OceanBase 数据库指标的采集、监控数据标签处理和 Prometheus 协议的 HTTP 服务。

- OCP Express：基于 Web 的 Oceanbase 数据库 4.x 管理工具，融合在 OceanBase 数据库集群中，支持对数据库集群关键性能及基本数据库管理功能。详细信息请参考官网 OceanBase 数据库文档 [OceanBase 云平台 Express (OCP Express)](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001692855)。

- Prometheus：开源监控解决方案，用于收集和聚合指标作为时间序列数据。若想监控到 OBServer 及服务器相关的数据，必须安装 OBAgent。

- Grafana：可视化工具。

> **说明**
>
> 如果需要部署其中的任意一个或多个组件，可以参照配置文件添加对应组件的配置信息。各个组件的独立配置均可以在上文提到的途径下对应名字的文件夹内查看。
