---
title: 社区版 OBD 问题排查手册
weight: 2
---

> 继社区版 OMS 研发负责人刘彻为大家提供《OMS 问题排查手册》之后，社区版 OBD 研发负责人谐云不甘落后，和我说在 2024 年内，也会为社区用户提供一个《社区版 OBD 问题排查手册》。
>
> 于是，谐云老哥携一众同学，在 2024.12.31 下班之前，终于写好了这个手册（勉强算是言而有信）。那就作为社区用户的元旦礼物吧，哈哈~

## OBD 问题排查思路
OBD 发生报错时，请先确认是否存在因官网文档中已提到的使用限制导致的异常。

下图为 OBD start 和 upgrade 发生报错时的整体排查思路：

![画板](/img/user_manual/operation_and_maintenance/tool_emergency_handbook/02_obd_troubleshooting_guide/001.png)

## oceanbase 错误信息概述及错误码
[oceanbase错误信息和错误码](https://www.oceanbase.com/docs/enterprise-oceanbase-database-cn-10000000000367311)

## 日志查看和位置说明
用户执行命令失败后可以直接使用终端控制台打印的 ``obd display-trace {trace-id}`` 查看该命令对应的详细日志具体操作如:

![](/img/user_manual/operation_and_maintenance/tool_emergency_handbook/02_obd_troubleshooting_guide/002.png)

![](/img/user_manual/operation_and_maintenance/tool_emergency_handbook/02_obd_troubleshooting_guide/003.png)

obd 日志路径: ~/.obd/log/obd

oceanbase-ce 日志路径: ``~/.obd/cluster/集群名/config.yaml`` 文件中 oceanbase-ce 组件下 home_path 的值。

obproxy-ce 日志路径: ``~/.obd/cluster/集群名/config.yaml`` 文件中 obproxy 组件下 home_path 的值。

ocp-server-ce 日志路径: ``~/.obd/cluster/集群名/config.yaml`` 文件中 ocp-server-ce 组件下 home_path 的值。

前端请求日志: ``~/.obd/app.log``。

obshell 日志路径: ``oceanbase-ce 部署目录/log_obshell/obshell.log``.

## Start 阶段常见问题
1. 端口号冲突时可以在配置文件中修改端口号或者 kill 掉占用该端口号的进程。
2. 安装路径或者数据目录不为空时可以修改路径或者确认可以删除后删除原有的路径。
3. 内存空间不足时可以在配置文件中修改 system_memory 和 memory_limit。
4. 若打印的报错信息后面有可执行命令，执行改命令后重新执行 start。
5. 若在 obd start 在 cluster bootstrap 阶段失败，需要检查 observer.log 的报错信息。

## Upgrade 阶段常见问题
1. 升级 OceanBase 报错 ``[ERROR] Too many match``，可以加上 ``--usable`` 参数
2. 升级 OceanBase 报错 ``fail to get upgrade graph: ‘NoneType’ object has no attribute ‘version’`` 说明不支持升级到该版本
3. 在执行升级操作时若出现执行时间过长或其他原因导致的 session 关闭，可以使用 nohup obd cluster upgrade 命令使 obd 在后台运行，而不会因为用户的退出而导致终止。
4. 在升级过程中由于创建的租户的 primary_zone 为 RANDOM，出现 ``__main__.MyError: 'upgrade checker failed with 2 reasons: [META$1002 tenant primary zone random before update not allowed] , [t1 tenant primary zone random before update not allowed]'`` 。解决方法可以连接 oceanbase 数据库后执行 ``ALTER TENANT tenant1 primary_zone='zone2';`` 该 sql 语句后再次执行升级命令。

## obd 状态说明
1. obd cluster list 查看的状态非实时状态，obd 状态是 obd 执行管理命令时触发状态更新。如果服务器重启，组件服务不会自动重启，但是此时 obd cluster list 状态仍然是服务器重启前的状态。
2. 如果 obd cluster list 展示的状态是 stopped, 使用 obd cluster start -c 挨个启动组件后, obd cluster list 展示的状态仍然是 stopped, 集群该状态会影响后面集群功能的操作，例如升级，创建租户等。

## 典型使用场景
### OBD 部署 OceanBase 集群 yaml 文件修改说明

**<font color="red"> 修改文件时注意 yaml 文件的缩进，不允许使用 tab 键，冒号后要有一个空格。 </font>**

```yaml
user:
   username: admin
#   password: your password if need
   key_file: /home/admin/.ssh/id_rsa.pub
#   port: your ssh port, default 22
#   timeout: ssh connection timeout (second), default 30

oceanbase-ce:
  servers: # 表示 observer 的节点，需要调整 IP 为自己的规划的 observer 节点 IP
    - name: server1
      ip: 1.2.3.4
  global:
    # 表示 observer 节点对应的主机 IP 对应的网卡名
    devname: eth0
    # 表示 observer 进程最大能使用的内存上限
    memory_limit: 8G
    # 表示从 memory_limit 划出指定大小的内存做保留系统内存，在 OceanBase 中这部分内存不属于任何一个租户，在内部称之为 500 租户
    system_memory: 4G
    # 表示 OceanBase 预分配的数据文件大小，会立即从磁盘上将指定的大小占用了，目前改参数生效后不支持调小，只能调大，建议初始设置不宜太大，可分配比如 50% 的大小
    datafile_disk_percentage: 20
    # 默认是 info 级别，会生成大量的 observer 日志，可以根据需要调整 WARN，或者 ERROR 级别
    syslog_level: WARN
    # Print system logs whose levels are higher than WARNING to a separate log file. The default value is true.
    enable_syslog_wf: false
    # Enable auto system log recycling or not. The default value is false.
    enable_syslog_recycle: true
    # 默认最多保留 4 个 observer 日志，每个 observer 日志文件 256M，建议结合磁盘大小保留尽可能多的日志，避免有问题排查的时候发现日志已经被循环复用了
    max_syslog_file_count: 10
    # 指定的是 OceanBase 集群的名字，必须跟 obproxy 部分的obproxy -> global -> cluster_name 保持一致。后续可以通过 show parameters like 'cluster'; 查看，注意查看的时候并不是 appname
    appname: obcluster
    # 将对应的注视打开，填写的是 sys 租户下的 root 用户的密码
    root_password: Root123@@Root123
    # 将对应的注视打开，填写的是 sys 租户下 proxyro 用户的密码
    proxyro_password: Root123@@Root123

  # 首先需要说明一下这个层级的 server1/server2/server3 分别对应的是 oceanbase-ce -> servers -> name 名字可以修改，做到一一对应即可  
  server1:
    # 作为外部连接 OceanBase 的端口，默认是 2881，可以自定义，在集群启动后不允许修改
    mysql_port: 2881
    # 作为 OceanBase 的内部的 rpc 通信端口，默认是 2882，可以自定义，在集群启动后不允许修改
    rpc_port: 2882
    # OceanBase的工作目录，软件 /lib/etc 等都在这个路径下
    home_path: /home/admin/observer
    # OceanBase 的 data 目录,默认在 $home_path/store，$home_path/store/$appname 部署，建议软链接到独立盘部署
    data_dir: /data
    # OceanBase 的 redo 目录，建议软链接到独立盘部署
    redo_dir: /redo
    # zone1 指定的 observer 对应的 zone 名称
    zone: zone1
```

### 报错后如何定位 OceanBase 错误日志
1. 直连 OceanBase 集群，根据服务器上的报错信息过滤日志

```yaml
root@observer109 log]#
mysql -h1.2.3.4 -P2881 -uroot@test1#ob_test_1 -p'Root123@@Root123' -A -c oceanbase

mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (42000): Access denied for user 'root'@'xxx.xxx.xxx.xxx' (using password: YES)
```

可以根据上面 oceanbase 返回的错误码 1045 去 observer.log 查找对应的错误码打印的错误日志进行排查

2. 连接指定的 obproxy 进行登录
    1. 明确访问的 OBProxy 的地址和当前执行的命令
    2. 登录到这台 OBProxy，根据执行的命令，检索到 `server_ip` 和 `trace_id`
    3. 登录到 `server_ip` 的机器上检索 `trace_id`
3. 连接 obproxy 的 vip 登录

如果我们的环境里有多台 OBProxy，访问的是最靠近用户侧提供的负载均衡的 vip，那么无法直接知道到底是访问的哪个 OBProxy。OceanBase 里有一个`gv$sql_audit`，我们可以通过该视图来确认我们使用的是哪个 OBProxy。

### 使用 OBD 在线 / 离线部署 OceanBase 集群
#### 在线安装
1. 安装依赖包

```yaml
yum install -y yum-utils
yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
yum -y install ob-deploy
```

2. 确认 obd 是否安装成功

```yaml
obd --version
```

3. 编辑 obd yaml 部署配置文件
4. 部署 oceanbase 集群
    1. 在使用 `obd cluster deploy` 之后会在当前对应的用户家目录下生成一个 ` .obd` 的隐藏目录。
    2. `${your_deploy_name}` 指定的名字跟配置文件中的 `app_name` 没有关系（名字可以一样，也可以不一样），可以根据需要设置。
    3. 这一步并不是真正的部署 OceanBase 集群，是创建目录结构、授权等。
```yaml
obd cluster deploy ${your_deploy_name} -c distributed-with-obproxy-example.yaml
```


5. 启动集群

```yaml
obd cluster start ${your_deploy_name}
```

+ 首次部署集群时 start 命令会做集群初始化，包括创建系统表、sys 租户等。
+ 非首次部署时 start 命令表示启动 OceanBase 集群。

6. 展示集群消息

```yaml
obd cluster display ${your_deploy_name}
```

#### 离线安装
1. 下载软件包。

```yaml
# 在可以联网的机器上下载
yum install -y yum-utils
yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo

mkdir -p /opt/ob_rpm
yum install --downloadonly ob-deploy --downloaddir=/opt/ob_rpm
```

2. 在中控机上安装 obd。

```yaml
# 上传第一步下载的软件包，如 /opt/ob_rpm 下
cd /opt/ob_rpm
yum install ob-deploy-*.rpm -y
```

3. 确认 obd 是否安装成功。

```yaml
obd --help
```

4. 关闭原创镜像源。

```yaml
obd --version
#如果obd版本小于 1.2.1，执行 obd update 升级

obd mirror disable remote
```

5. 将离线 rpm 包复制到本地镜像库。

```yaml
obd mirror clone /opt/ob_rpm/*.rpm
```

6. 编辑修改 obd yaml 文件。
7. 部署 oceanbase 集群。

```yaml
obd cluster deploy ${your_deploy_name} -c distributed-with-obproxy-example.yaml
```

8. 启动集群。

```yaml
obd cluster start ${your_deploy_name}
```

9. 展示集群信息。

```yaml
bd cluster display ${your_deploy_name}
```

### 使用 OBD 在线 / 离线升级 OceanBase 集群
#### 在线升级obd
1. 确认远程仓库开启状态

```yaml
obd mirror list
# 若 Enabled 列的状态为 False，则需要执行 obd mirror enable remote 开启远程仓库
```

2. 直接使用 `obd update` 命令升级 OBD。（此处需要 sudo 方式执行）

#### 离线升级 obd
前提条件：本地已上传了更新版本的 obd 的 rpm 包。

[下载地址在这里](https://www.oceanbase.com/softwarecenter?_gl=1*lntur4*_ga*NTQ3NzA5MjEwLjE3Mjk2NzYxNTI.*_ga_T35KTM57DZ*MTczMzkwMTI2OS45OC4xLjE3MzM5MTEyMjAuNTMuMC4w)。

1. 禁用远程镜像仓库。

```yaml
obd  mirror disable remote
```

2. 拷贝较高版本的 obd 的 rpm 包到本地镜像仓库。

```yaml
obd mirror clone /yourpath/ob-deploy-xxxx.el7.x86_64.rpm
```

3. 升级obd

```yaml
sudo obd update
```

#### 在线升级 oceanbase
前提条件：机器可以访问公网

1. 确认远程仓库开启状态

```yaml
obd mirror list
# 若 Enabled 列的状态为 False，则需要执行 obd mirror enable remote 开启远程仓库
```

2. 查看 md5 值，同版本升级，需要 md5 值做唯一验证。同版本升级，大版本号一致，需要根据版本日期确定对应升级版本的 md5 值

```yaml
obd mirror list oceanbase.community.stable | grep -e " oceanbase-ce " | grep -e " ob 版本号 "
```

3. 使用 `obd cluster upgrade` 命令升级 OceanBase 数据库。

```yaml
obd cluster upgrade testob -c oceanbase-ce -V ob_version --usable 升级中使用的镜像hash列表
```

4. 连接数据库验证升级后的版本

#### 离线升级 oceanbase
前提条件：本地已上传好 oceanbase 所需的 rpm 包

[下载地址在这里](https://www.oceanbase.com/softwarecenter?_gl=1*6elihe*_ga*NTQ3NzA5MjEwLjE3Mjk2NzYxNTI.*_ga_T35KTM57DZ*MTczMzkwMTI2OS45OC4xLjE3MzM5MTE5MjIuNTEuMC4w)。

1. 升级完的 OBD，远程仓库默认是开启状态，需要再次禁用。

```yaml
obd mirror disable remote
```

2. 拷贝 OceanBase 新版本的 rpm 包到本地镜像库。

```yaml
obd mirror clone /opt/oceanbase-ce-xxxx.rpm
obd mirror clone /opt/oceanbase-ce-libs-xxxx.rpm
obd mirror clone /opt/oceanbase-ce-utils-xxxx.rpm
```

3. 查看 md5 值，同版本升级，需要 md5 值做唯一验证。

```yaml
obd mirror list local
```

4. 升级 oceanbase

```yaml
obd cluster upgrade testob -c oceanbase-ce -V oceanbase版本号
```

#### 升级 obproxy
4.0.0.0 场景暂无最新小版本 OBProxy 的升级，如需升级 OBProxy 组件，请参考如下方法。

+ OBProxy 3.2.0 版本升级至 OBProxy 3.2.3 版本时，请参考 [如何升级 obproxy 到 obproxy-ce 3.2.3](https://www.oceanbase.com/docs/community-obd-cn-10000000001031931)
+ OBProxy 3.2.3 及其以上版本的升级步骤与 OceanBase 升级步骤一致，需要填写对应的组件名以及 MD5 值

#### FAQ
Q1:：升级 OceanBase 报错：``[ERROR] Too many match``

A1：检查升级命令是否有 --usable 参数，值为 md5 值。


Q2：升级 OceanBase 报错 ``fail to get upgrade graph: ‘NoneType’ object has no attribute ‘version’``

A2：3.x 版本不支持直接升级至 4.x。

### 自助诊断和诊断信息收集
1. 安装敏捷版诊断工具 obdiag。

    a. 非 OBD 部署的集群, 部署 obdiag 2.4.0，[请参考这个链接](https://www.oceanbase.com/docs/obdiag-cn?_gl=1*1rofi0f*_ga*NTQ3NzA5MjEwLjE3Mjk2NzYxNTI.*_ga_T35KTM57DZ*MTczMzgyODkwMi45My4xLjE3MzM4MjkzNTkuNTUuMC4w)。

    b. OBD部署的集群，且OBD 版本 >= 2.5.0 部署obdiag >= 1.5.2 [请参考这个链接](https://www.oceanbase.com/docs/community-obd-cn-1000000000487070)。

2. 通过 obdiag 工具一键巡检找原因。

    a. 非OBD部署的集群，执行巡检[请参考这个链接](https://www.oceanbase.com/docs/common-obdiag-cn-1000000001326848)，巡检最佳实践[请参考这个链接](https://open.oceanbase.com/blog/7217060640?_gl=1*1jihw9m*_ga*NTQ3NzA5MjEwLjE3Mjk2NzYxNTI.*_ga_T35KTM57DZ*MTczMzgyODkwMi45My4xLjE3MzM4Mjk2NjcuMzQuMC4w)。

    b. OBD部署的集群，执行巡检[请参考这个链接](https://www.oceanbase.com/docs/community-obd-cn-1000000000487070#11-title-obd%20obdiag%20check)。

3. ``obdiag rca run --scene=<scene_name>`` 根因分析功能。
    
    通过 ``obdiag rca run --scene=<scene_name>`` 功能可一键根因分析具体的场景，请[请参考这个链接](https://www.oceanbase.com/docs/common-obdiag-cn-1000000001102503?_gl=1*vtg7yl*_ga*NTQ3NzA5MjEwLjE3Mjk2NzYxNTI.*_ga_T35KTM57DZ*MTczMzgyODkwMi45My4xLjE3MzM4Mjk3MjEuNDYuMC4w)，并将分析结果拿到社区论坛发帖提问。如果是暂不支持的场景请执行step 4。
4. obdiag analyze log 功能分析日志
    
    通过 obdiag analyze log 功能可一键分析指定时间段的 OceanBase 日志，找出可能的错误信息，请[请参考这个链接](https://www.oceanbase.com/docs/common-obdiag-cn-1000000001326845)。如果分析结果不为 PASS，将分析结果拿到社区论坛发帖提问。如果分析结果为PASS，请执行step 5。

5. obdiag gather功能打包收集故障
    
    如果上面步骤未解决你的问题，请[请参考这个链接](https://www.oceanbase.com/docs/common-obdiag-cn-1000000001326886?_gl=1*1mo2ixi*_ga*NTQ3NzA5MjEwLjE3Mjk2NzYxNTI.*_ga_T35KTM57DZ*MTczMzgyODkwMi45My4xLjE3MzM4Mjk4MTIuMzkuMC4w)。用 obdiag gather 功能打包收集故障时刻前后的信息拿到社区论坛发帖提问。



## 特别鸣谢

进阶教程中的这一小节的内容，完全由其他同学完成的内容共建，我并未参与，算是偷了个大懒。

参与共建的同学有：
- 谐云（社区版 OBD 研发负责人）
- 潘佳瑶（开源管控研发同学）
- 秃蛙（头号 OBD 运维专家）
- 辞霜（技术支持同学）
- 旭辉（技术支持同学）

感谢研发同学谐云和潘佳瑶花费大量宝贵时间为社区用户提供这个问题排查手册！

感谢技术支持同学秃蛙、辞霜、旭辉在百忙之中抽出时间为这个手册进行细致的 review 工作！