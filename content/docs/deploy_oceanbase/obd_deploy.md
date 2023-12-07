---
title: 通过 OBD 部署集群
weight: 3
---

<font color=#008000>OBD 创建集群适用于快速部署集群用来测试，如果是线上环境，建议使用 OCP。</font>

## **机器初始化（强烈建议）**

强烈建议做机器初始化，防止后面使用过程中因为配置问题导致的数据库异常，避免类似于句柄不足、内存泄漏等问题。

操作需要登录到每台机器，在 root 用户下完成。

### **检测及安装 NTP 服务**

1. 执行以下命令，如果输出 running 表示 NTP 服务正在运行：
```
sudo systemctl status ntpd.service
ntpd.service - Network Time Service
Loaded: loaded (/usr/lib/systemd/system/ntpd.service; disabled; vendor preset: disabled)
Active: active (running) since 一 2017-12-18 13:13:19 CST; 3s ago
```

   - 若返回报错信息 Unit ntpd.service could not be found.，请尝试执行以下命令，以查看与 NTP 进行时钟同步所使用的系统配置是 chronyd 还是 ntpd：
```
sudo systemctl status chronyd.service
chronyd.service - NTP client/server
Loaded: loaded (/usr/lib/systemd/system/chronyd.service; enabled; vendor preset: enabled)
Active: active (running) since Mon 2021-04-05 09:55:29 EDT; 3 days ago
```
若发现系统既没有配置 chronyd 也没有配置 ntpd，则表示系统尚未安装任一服务。此时，应先安装其中一个服务，并保证它可以自动启动，默认使用 ntpd。如果你使用的系统配置是 chronyd，请直接执行步骤 3。

2. 执行 ntpstat 命令检测是否与 NTP 服务器同步：

注意： Ubuntu 系统需安装 ntpstat 软件包。

```
ntpstat
```

   - 如果输出 synchronised to NTP server，表示正在与 NTP 服务器正常同步：
   
```
synchronised to NTP server (85.199.214.101) at stratum 2
time correct to within 91 ms
polling server every 1024 s
```

   - 以下情况表示 NTP 服务未正常同步：
    ```
    unsynchronised
    ```

   - 以下情况表示 NTP 服务未正常运行：
    ```
    Unable to talk to NTP daemon. Is it running?
    ```

3. 执行 chronyc tracking 命令查看 Chrony 服务是否与 NTP 服务器同步。

注意：该操作仅适用于使用 Chrony 的系统，不适用于使用 NTPd 的系统。

```
chronyc tracking
```

   - 如果该命令返回结果为 Leap status : Normal，则代表同步过程正常。
```
Reference ID    : 5EC69F0A (ntp1.time.nl)
Stratum         : 2
Ref time (UTC)  : Thu May 20 15:19:08 2021
System time     : 0.000022151 seconds slow of NTP time
Last offset     : -0.000041040 seconds
RMS offset      : 0.000053422 seconds
Frequency       : 2.286 ppm slow
Residual freq   : -0.000 ppm
Skew            : 0.012 ppm
Root delay      : 0.012706812 seconds
Root dispersion : 0.000430042 seconds
Update interval : 1029.8 seconds
Leap status     : Normal
```

   - 如果该命令返回结果如下，则表示同步过程出错：
    ```
    Leap status    : Not synchronised	
    ```

   - 如果该命令返回结果如下，则表示 Chrony 服务未正常运行：
    ```
    506 Cannot talk to daemon
    ```

如果要使 NTP 服务尽快开始同步，执行以下命令。可以将 pool.ntp.org 替换为你的 NTP 服务器：
```
sudo systemctl stop ntpd.service && \
sudo ntpdate pool.ntp.org && \
sudo systemctl start ntpd.service
```

如果要在 CentOS 7 系统上手动安装 NTP 服务，可执行以下命令：
```
sudo yum install ntp ntpdate && \
sudo systemctl start ntpd.service && \
sudo systemctl enable ntpd.service
```

### **配置 limits.conf**

在 /etc/security/limits.conf 配置文件中添加以下内容：
```
root soft nofile 655350
root hard nofile 655350
* soft nofile 655350
* hard nofile 655350
* soft stack 20480
* hard stack 20480
* soft nproc 655360
* hard nproc 655360
* soft core unlimited
* hard core unlimited
```

退出当前会话，重新登录。执行以下命令，查看配置是否生效。
```
ulimit -a
```

### **配置 sysctl.conf**

1. 在 /etc/sysctl.conf 配置文件中添加以下内容：
```
# for oceanbase
## 修改内核异步 I/O 限制
fs.aio-max-nr=1048576

## 网络优化
net.core.somaxconn = 2048
net.core.netdev_max_backlog = 10000 
net.core.rmem_default = 16777216 
net.core.wmem_default = 16777216 
net.core.rmem_max = 16777216 
net.core.wmem_max = 16777216

net.ipv4.ip_local_port_range = 3500 65535 
net.ipv4.ip_forward = 0 
net.ipv4.conf.default.rp_filter = 1 
net.ipv4.conf.default.accept_source_route = 0 
net.ipv4.tcp_syncookies = 0 
net.ipv4.tcp_rmem = 4096 87380 16777216 
net.ipv4.tcp_wmem = 4096 65536 16777216 
net.ipv4.tcp_max_syn_backlog = 16384 
net.ipv4.tcp_fin_timeout = 15 
net.ipv4.tcp_max_syn_backlog = 16384 
net.ipv4.tcp_tw_reuse = 1 
net.ipv4.tcp_tw_recycle = 1 
net.ipv4.tcp_slow_start_after_idle=0

vm.swappiness = 0
vm.min_free_kbytes = 2097152
# 修改进程可以拥有的虚拟内存区域数量
vm.max_map_count = 655360

# 此处为 OceanBase 数据库的 data 目录
kernel.core_pattern = /data/core-%e-%p-%t
```
其中，kernel.core_pattern 中的 /data 为 OceanBase 数据库的 data 目录。
注意：max_map_count 配置不合理的情况下，可能会导致严重的内存泄露。

2. 加载配置
```
sysctl -p
```

### **关闭防火墙**

```
systemctl disable firewalld 
systemctl stop firewalld 
systemctl status firewalld
```

### **关闭 SELinux**

在 /etc/selinux/config 配置文件中修改对应配置项为以下内容：
```
SELINUX=disabled
```

执行以下命令或重启服务器，使更改生效：
```
setenforce 0
```

执行以下命令，查看更改是否生效：
```
sestatus
```

### **关闭透明大页：**

对于 Red Hat 操作系统，需要运行以下命令，手动关闭透明大页：
```
echo never > /sys/kernel/mm/redhat_transparent_hugepage/enabled
```
对于 CentOS 操作系统，需要运行以下命令，手动关闭透明大页：
```
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

### **规划目录**

需要创建的目录（可根据自己的业务情况调整）

- /data 为数据盘。
- /redo 存放 redo 日志。
- /home/admin/oceanbase 存放 OceanBase 数据库的二进制文件和运行日志。

其中，数据盘和日志盘建议分盘，避免相互影响；日志盘大小建议是 OB 内存的 3-4倍；磁盘空间默认会预占用，后续数据新增会自动从这里面分配。

### **创建 admin 用户**

1. 执行以下命令，创建账户 admin。
```
useradd -U admin -d /home/admin -s /bin/bash
mkdir -p /home/admin
chown -R admin:admin /home/admin
```

2. 执行以下命令，为账户 admin 设置密码。
```
passwd admin
```

3. 为账户 admin 设置 sudo 权限。执行以下命令，打开 /etc/sudoers 文件，在 /etc/sudoers 文件添加以下内容：
```
[root@test001 ~]# vim /etc/sudoers
# 添加如下内容：
## Same thing without a password
# %wheel        ALL=(ALL)       NOPASSWD: ALL
admin       ALL=(ALL)       NOPASSWD: ALL
```

4. 授权目录
```
chown -R admin:admin /data
chown -R admin:admin /redo
chown -R admin:admin /home/admin
```

### **中控机配置 admin 用户 SSH免密**

admin 用户登录 OBD 所在机器

1. 在中控机器上运行以下命令生成 SSH 公钥和私钥：
```
ssh-keygen -t rsa
```

2. 将中控机的公钥复制到目标机器的 authorized_keys 文件中：
```
ssh-copy-id -i ~/.ssh/id_rsa.pub <user>@<server_ip>
```

## **创建集群**

1. 编辑配置文件

在 ~/.oceanbase-all-in-one/conf 下有常用的配置模版

- 单机部署配置样例：mini-single-example.yaml、single-example.yaml
- 单机部署 + ODP 配置样例：mini-single-with-obproxy-example.yaml、single-with-obproxy-example.yaml
- 分布式部署配置样例：mini-distributed-example.yaml、distributed-example.yaml
- 分布式部署 + ODP 配置样例：mini-distributed-with-obproxy-example.yaml、distributed-with-obproxy-example.yaml
- 分布式部署全部组件：all-components-min.yaml、all-components.yaml

配置文件事例：
```
## Only need to configure when remote login is required
user:
  username: admin
  password: 
#   key_file: your ssh-key file path if need
#   port: your ssh port, default 22
#   timeout: ssh connection timeout (second), default 30
oceanbase-ce:
  servers:
    - name: server1
      # Please don't use hostname, only IP can be supported
      ip: 192.168.1.2
    - name: server2
      ip: 192.168.1.3
    - name: server3
      ip: 192.168.1.4
  global:
    production_mode: true
    # Please set devname as the network adaptor's name whose ip is  in the setting of severs.
    # if set severs as "127.0.0.1", please set devname as "lo"
    # if current ip is 192.168.1.10, and the ip's network adaptor's name is "eth0", please use "eth0"
    devname: eth0
    # if current hardware's memory capacity is smaller than 50G, please use the setting of "mini-single-example.yaml" and do a small adjustment.
    memory_limit: 64G # The maximum running memory for an observer
    # The reserved system memory. system_memory is reserved for general tenants. The default value is 30G.
    system_memory: 30G
    cpu_count: 32
    datafile_size: 300G # Size of the data file.
    log_disk_size: 200G # The size of disk space used by the clog files.
    enable_syslog_wf: false # Print system logs whose levels are higher than WARNING to a separate log file. The default value is true.
    enable_syslog_recycle: true # Enable auto system log recycling or not. The default value is false.
    max_syslog_file_count: 4 # The maximum number of reserved log files before enabling auto recycling. The default value is 0.
    # observer cluster name, consistent with obproxy's cluster_name
    appname: obtest
    # root_password: # root user password, can be empty
    root_password: password01
    # proxyro_password: # proxyro user pasword, consistent with obproxy's observer_sys_password, can be empty
    proxyro_password: password01
  # In this example , support multiple ob process in single node, so different process use different ports.
  # If deploy ob cluster in multiple nodes, the port and path setting can be same.
  server1:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /data
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /redo
    zone: zone1
  server2:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /data
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /redo
    zone: zone2
  server3:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /data
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /redo
    zone: zone3
obproxy-ce:
  # Set dependent components for the component.
  # When the associated configurations are not done, OBD will automatically get the these configurations from the dependent components.
  depends:
    - oceanbase-ce
  servers:
    - 192.168.1.2
    - 192.168.1.3
    - 192.168.1.4
  global:
    listen_port: 2883 # External port. The default value is 2883.
    prometheus_listen_port: 2884 # The Prometheus port. The default value is 2884.
    home_path: /home/admin/obproxy
    # oceanbase root server list
    # format: ip:mysql_port;ip:mysql_port. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    # rs_list: 192.168.1.2:2881;192.168.1.3:2881;192.168.1.4:2881
    enable_cluster_checkout: false
    # observer cluster name, consistent with oceanbase-ce's appname. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    cluster_name: obtest
    skip_proxy_sys_private_check: true
    enable_strict_kernel_release: false
    # obproxy_sys_password: # obproxy sys user password, can be empty. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    obproxy_sys_password: password01
    # observer_sys_password: # proxyro user pasword, consistent with oceanbase-ce's proxyro_password, can be empty. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    observer_sys_password: password01
```

需要关注的配置项：

【user】

| 参数 | 详情 | 
| --- | --- |
| password | 如果已经设置免密，则为空 | 

【oceanbase-ce】

| 参数 | 详情 | 
| --- | --- |
| production_mode | 如果给到OB的内存小于 16G，需要改成 false。 |
| memory_limit | 给到 OBServer 的内存大小。 |
| system_memory | 保留的系统内存，该参数值会占用 memory_limit 的内存，不建议给太小。 |
| cpu_count | 给到 OBServer 的 CPU 数量。 |
| datafile_size | 数据盘大小。 |
| log_disk_size | 日志盘大小，建议是内存的 3-4 倍。 |
| appname | 集群名字，跟下面 [obproxy-ce] - [cluster_name] 的定义保持一致。 |
| root_password | 建议手动定义，密码跟 [obproxy-ce] - [obproxy_sys_password] 以及 [obproxy-ce] - [observer_sys_password] 保持一致。 |
| proxyro_password | 建议跟 root_password 保持一致。 |
| home_path | 安装目录，OB 的本地配置以及运行日志都在这里。 |
| data_dir | 数据目录。 |
| redo_dir | 日志目录。 |
| zone | 逻辑概念，如果相同的话则只能单副本，不能保证可用性。建议至少3个以上。 |


如果需要监控、告警，可以增加 prometheus 和 obagent 配置。

2. 部署集群：
```
obd cluster deploy obtest -c obtest-config.yaml
```
注意：这里的 obtest 是指 OBD 部署集群名，可以理解为集群别名，跟配置文件中的集群名不是一个，建议保持一致防止后面弄混。

3. 启动集群：
```
obd cluster start obtest
```
如果因为配置问题导致启动失败，可以通过 obd cluster edit-config obtest 修改配置重试。

4. 查看集群状态
```
# 查看 OBD 管理的集群列表
obd cluster list 

# 查看 obtest 集群状态
obd cluster display obtest
```

## **连接集群**
通过 obd cluster display obtest 可以查询到 sys 租户 root 用户的连接串
```
# 通过 OBServer 连接到集群
mysql -h192.168.1.2 -P2881 -uroot@sys -p'password01' -Doceanbase -A

# 通过 OBProxy 连接到集群
mysql -h192.168.1.2 -P2883 -uroot@sys#obtest -p'password01' -Doceanbase -A
```

至此，集群创建完成。