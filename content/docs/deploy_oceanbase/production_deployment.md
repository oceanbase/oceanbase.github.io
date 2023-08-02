---
title: 生产部署最佳实践
weight: 4
---

# **生产部署最佳实践**

## **基础介绍**
### **OceanBase4.x版本常用资源参数简介及计算方式**
|  | 参数 | 解释 | 特性 | 小课堂 |
| --- | --- | --- | --- | --- |
| CPU资源参数 | cpu_count | OB可使用的CPU核数，参数为数值，例如：16，设置为0，系统自动检测并设置 | 不支持动态调整 | 修改该参数需要重启集群才能生效 |
| 内存资源参数 | memory_limit | OB可使用的内存大小，参数需要带单位，例如：32G | 支持动态调整 | 1. memory_limit没有上限边界，建议按实际内存free -m信息中的free列剩余大小进行规划设置。<br>2. 支持动态增大和缩小，但不能比已分配出去的内存还小。<br>3. memory_limit优先级大于memory_limit_percentage，即同时设置，以memory_limit生效。|
|内存资源参数| memory_limit_percentage | OB可用内存占总内存的百分比，参数为数值，例如：80（表示80%） | 支持动态调整 |  |
| 内存资源参数|system_memory | OB的500租户的内存，即OB系统内部运行内存，参数需要带单位，例如：30G | 支持动态调整 | 1. system_memory取值计算方式：<br>-- 16G<=memory_limit <=32G，system_memory=3-5G <br>-- 32G<=memory_limit <=64G，system_memory=5-10G <br>-- memory_limit >64G，system_memory=取整数部分（3 *（memory_limit的平方根-3G））<br>2. system_memory和sys租户没关系，sys租户是OB部署完成由系统自建的自适应资源租户，租户ID为1，而system_memory对应的租户ID为500。|
| 磁盘资源参数 | datafile_size | OB数据目录预占用大小，参数需要带单位，例如：32G | 预占用，不支持调小 | 1. 预占用会提前申请磁盘空间，部署完成查看磁盘使用很大，属于正常现象。<br>2. datafile_size优先级大于datafile_disk_percentage。|
| 磁盘资源参数|datafile_disk_percentage | OB数据目录预占用目录百分比，参数为数值，例如：80（表示80%） | 预占用，不支持调小 |  |
| 磁盘资源参数|log_disk_size | OB日志数据目录预占用大小，参数需要带单位，例如：32G | 预占用，支持动态调整 | 1. log_disk_size取值计算方式：log_disk_size>=memory_limit * 3 <br>2. 预占用会提前申请磁盘空间，部署完成查看磁盘使用很大，属于正常现象。<br>3. log_disk_size优先级大log_disk_percentage。|
| 磁盘资源参数 |log_disk_percentage | OB数据目录预占用目录百分比，参数为数值，例如：80（表示80%） | 预占用 支持动态调整 | |
| 系统日志参数 | enable_syslog_recycle | 是否开启OB系统日志回收，建议开启 | 需要和max_syslog_file_count参数搭配使用 | |
| 系统日志参数 | max_syslog_file_count | 在回收OB系统日志文件之前最大保留OB系统日志个数 | 需要和enable_syslog_recycle参数搭配使用 | 单个系统日志256M，建议生产环境按需要日志保留天数需要，来设置系统日志个数。<br>注意：OB系统日志打印较大较频繁，需要关注设置个数和磁盘大小关系，防止磁盘被占满。 |


## **部署要求**
### **生产场景OB集群要求**
| 模块 | 要求 | 说明 |
| --- | --- | --- |
| 服务器 | 支持主流服务器和国产化适配软硬件|- 已适配基于硬件整机中科可控 H620 系列、华为 TaiShan 200 系列、长城擎天 DF720 等整机。<br>- 已适配支持海光 7185/7280、鲲鹏 920、飞腾 2000+ 等 CPU。<br>- 已适配支持麒麟 V4、V10 和 UOS V20 等国产操作系统，并适配上层中间件东方通 TongWeb V7.0、金蝶 Apusic 应用服务器软件 V9.0 等 |
| 操作系统 | 支持x86、ARM架构 | - Alibaba Cloud Linux 2/3 版本（内核 Linux 3.10.0 版本及以上）。<br>- Anolis OS 8.X 版本（内核 Linux 3.10.0 版本及以上）。<br>- Red Hat Enterprise Linux Server 7.X 版本、8.X 版本（内核 Linux 3.10.0 版本及以上）。<br>- CentOS Linux 7.X 版本、8.X 版本（内核 Linux 3.10.0 版本及以上）。<br>- Debian 9.X 版本及以上版本（内核 Linux 3.10.0 版本及以上）。Ubuntu 20.X 版本及以上版本（内核 Linux 3.10.0 版本及以上）。<br>- SUSE / OpenSUSE 15.X 版本及以上版本（内核 Linux 3.10.0 版本及以上）。<br>- KylinOS V10 版本。统信 UOS 1020a/1021a/1021e/1001c 版本。<br>- 科方德 NFSChina 4.0 版本及以上。浪潮 Inspur kos 5.8 版本 |
| CPU | 最低4核，推荐32核以上 | 此为分配给OB的最低核数，非服务器总核数 |
| 内存 | 最低32G，推荐256G以上 | 此为分配给OB的最低内存，非服务器总内存大小 |
| SWAP | 禁止使用SWAP功能 | SWAP交换分区会影响整个集群性能 |
| 磁盘类型 | 磁盘类型：SSD | |
| 文件系统| 文件系统：XFS、EXT4 | 不支持其他文件系统，数据大于16T，推荐使用XFS文件系统 |
| 磁盘容量 | 总磁盘容量：内存的6倍以上 |
| 分盘 |数据盘大小：最低20G日志盘大小：最低96G | - 日志盘+数据盘容量推荐是分配给OB内存大小的6倍以上，即（memory_limit * 6）； <br>- 数据盘和日志盘一定要分盘，否则影响性能； <br>- 数据盘大小可根据业务数据量评估； <br>- 日志盘大小推荐根据分配给OB总内存 * 3 进行规划 （memory_limit * 3）|
| RAID | 支持 | RAID阵列缓存需要使用write through模式； |
| 网卡 | 最低千兆，推荐万兆 |  |
|  |  |  |


### **生产场景OCP配置要求**
管理 10 台业务 OBServer 所需的资源为例，即这台物理机需要有 24 个 CPU 和 64G 内存。
其中OCP所需4C 8G，METADB所需13C 52G，剩余资源为操作系统使用。

| 模块 | CPU | 内存 |
| --- | --- | --- |
| ocp-server | 4 | 8G |
| metadb租户 | 4 | 8G |
| monitor租户 | 4 | 16G |
| sys_memory | 5 | 28G |

### **常见问题-服务器初始化要求**
| 模块 | 要求 | 操作 | 说明 |
| --- | --- | --- | --- |
| 防火墙 | 关闭| #开机不自启 <br>systemctl disable firewalld <br>#关闭防火墙 <br>systemctl stop firewalld | 涉及OB以及OB生态组件节点建议关闭，如有防火墙开放需求，参考[OceanBase 服务端进程 & 生态产品默认端口号](https://ask.oceanbase.com/t/topic/35603118) |
| SELinux | 关闭 | <br>#将 SELINUX 的配置修改为 disabled，重启服务器生效 <br>vim /etc/selinux/config <br>SELINUX=disabled <br>#立即生效命令 <br>setenforce 0 | SELinux开启会占用较多系统资源，且对文件权限和访问控制进行限制等。 |
| 时钟同步 | 开启 | 参考 初始化服务器  | OB生态组件均需要进行同步（包括OCP、OCP-Express、OB、OBProxy） |



### **常见问题-软件依赖要求**
| 环境包 | 要求 | 原因 |
| --- | --- | --- |
| mysql | 强依赖 | OCP部署OB依赖mysql命令 |
| nc | 强依赖 | OCP部署OB依赖nc命令 |
| python | python2.7及其以上 | OCP添加主机依赖，不能是python2命令 |
| jdk | java-1.8.0-openjdk | OBD部署OCP-EXPRESS依赖 |
| ntp/Chrony | 非强依赖 | OB集群要求时差小于100ms |
| nfs | 非强依赖 | OB远程备份介质依赖 |
| docker | 非强依赖，不支持docker-man | OCP部分版本使用docker部署ocp-server服务 |


## **部署场景及注意事项**
### **3台及以下服务器推荐OBD白屏部署和管理。**

**部署规划：**

| 3节点集群 | 部署组件 | 说明 |
| --- | --- | --- |
| 节点A | OBSERVER、OBPROXY、OBAgent、OBD | 1. 不推荐部署2节点集群，无法满足多数派，不具备高可用能力。<br>2. 单节点部署建议开启数据备份功能。|
| 节点B | OBSERVER、OBPROXY、OBAgent、OCP-EXPRESS |  |
| 节点C | OBSERVER、OBPROXY、OBAgent |  |

**注意事项一：**

部署用户配置：支持任意用户部署，无需sudo权限，推荐admin用户，后续OCP接管集群方便。

前提：目标节点已存在该用户，且有安装目录、数据目录、日志目录所属权限。
![image.png](/img/deploy_oceanbase/production_deployment/1690464188720-1544a836-bde3-4465-8b6a-ec55e0cf0d38.png)

**注意事项二：**

占用模式：生产场景不可使用最小可用模式，推荐使用最大占用+自定义方式规划。

数据目录、日志目录：必须分在不同的磁盘上，目录可自定义。
![image.png](/img/deploy_oceanbase/production_deployment/1690465100575-975e3b82-1f99-438e-b039-d8959ecc615e.png)

**注意事项三：**

更多配置：用户设置OB相关参数，其中devname默认使用本地 "lo" 网卡,需要自定义修改为实际IP对应的网卡名称，其他资源参数按需分配即可。
![image.png](/img/deploy_oceanbase/production_deployment/1690465462599-2727c584-fa88-417b-b554-eb9643040834.png)

### **4台及以上服务器集群推荐OCP部署和管理**
| 4节点集群 | 部署组件 | 说明 |
| --- | --- | --- |
| 节点A | OCP、OBSERVER（METADB） | 1. OCP节点服务器配置推荐24C 64G。<br>2. OCP建议使用单独的OB单机或集群当元数据库，不推荐把业务集群当OCP元数据库使用。|
| 节点B | OBSERVER、OBPROXY、OCP-Agent |  |
| 节点C | OBSERVER、OBPROXY、OCP-Agent |  |
| 节点D | OBSERVER、OBPROXY、OCP-Agent |  |

**注意事项一：**

部署顺序推荐，先部署OCP(内含METADB)，通过OCP再部署业务OB集群，同时OCP也支持接管OBD部署的OB集群。

**注意事项二：**

部署OCP时关于METADB的安装配置推荐按需调整，因为METADB会默认预占用服务器剩余内存的70%，数据和日志盘默认预占用磁盘空间90%。

标准24C 64G服务器，配置OCP参数参考如下
![image.png](/img/deploy_oceanbase/production_deployment/1690523425698-8adaf519-39f5-4ecd-a89f-08dc28848300.png)

自定义METADB参数参考如下(max_syslog_file_count和devname按需设置)：
![image.png](/img/deploy_oceanbase/production_deployment/1690523838581-8af2a164-80e2-42d6-b207-72bb607cac30.png)

meta租户信息：
![image.png](/img/deploy_oceanbase/production_deployment/1690523902920-c72407bb-293c-46a4-bf5e-5b1aba2a72cc.png)

monitor租户信息：
![image.png](/img/deploy_oceanbase/production_deployment/1690523945449-8dc39704-6253-418a-beee-b678a68247d1.png)

ocp-server配置信息：
![image.png](/img/deploy_oceanbase/production_deployment/1690524062853-dced09f9-0dd5-4ebf-8d53-d6cfb1ae5a72.png)

## **【重要】OB部署完成之后**

**不能使用sys租户充当业务租户使用**
**不能使用sys租户充当业务租户使用**
**不能使用sys租户充当业务租户使用**

### **1. 连接方式**

obproxy代理方式：
```sql
mysql -h xxx.xxx.xxx.xxx -uroot@租户名称#集群名称 -P2883 -p -c -A oceanbase
obclient -h xxx.xxx.xxx.xxx -uroot@租户名称#集群名称 -P2883 -p -c -A oceanbase
```

observer直连方式（不能带#集群名称）：
```sql
mysql -h xxx.xxx.xxx.xxx -uroot@租户名称 -P2881 -p -c -A oceanbase
obclient -h xxx.xxx.xxx.xxx -uroot@租户名称 -P2881 -p -c -A oceanbase
```

### **2. 创建一个业务租户(5C 10G)**

**SQL语句方式：**

   - 创建资源单元

```sql
CREATE RESOURCE UNIT unit_name1
max_cpu =5, min_cpu =5,
memory_size ='10G',
log_disk_size ='30G',
max_iops =10000, min_iops =10000, iops_weight =1;
```

   - 创建资源池

```sql
CREATE RESOURCE POOL pool_name1
UNIT = 'unit_name1',
UNIT_NUM = 1,
ZONE_LIST = ('zone1','zone2','zone3');
```

   - 创建租户

```sql
CREATE TENANT IF NOT EXISTS tenant_name1
charset='utf8mb4', comment 'mysql tenant/instance',
primary_zone='RANDOM',
resource_pool_list = ('pool_name1') set ob_tcp_invited_nodes = '%';
```

**OBD命令方式：**

```sql
obd cluster tenant create 部署名称 -n 租户名称 --max-cpu=5 --memory-size=10G --log-disk-size=30G --max-iops=10000 --iops-weight=1 --unit-num=1 --charset=utf8mb4

#不带参数将创建最大剩余资源租户
obd cluster tenant create 部署名称 -n 租户名称
```

**OCP白屏方式：**
![image.png](/img/deploy_oceanbase/production_deployment/1690526122198-61f4da88-5b00-4c52-8f1e-76b481776f5d.png)

