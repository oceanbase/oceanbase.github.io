---
title: 安装部署工具 - OBD
weight: 1
---


## 方法一：使用 all-in-one 安装包安装 OBD（推荐）

all-in-one 安装包是 OceanBase 社区版一键安装包，包括数据库软件和 OBD、OBProxy、OBClient、OCP Express（从4.1版本开始）、Prometheus、Grafana。可以在安装好 OBD 以后快速部署集群。

**在线安装：**

```
[admin@test001 ~]$ bash -c "$(curl -s https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/download-center/opensource/oceanbase-all-in-one/installer.sh)"
[admin@test001 ~]$ source ~/.oceanbase-all-in-one/bin/env.sh
```

**离线安装：**

如果机器无法连接网络，可以通过下载安装包的方式安装。

1. 从 [OceanBase 软件下载中心](https://www.oceanbase.com/softwarecenter) 下载最新的 all-in-one 安装包，并将其复制到中控机中
2. 解压安装
```
[admin@test001 ~]$ tar -xzf oceanbase-all-in-one-*.tar.gz
[admin@test001 ~]$ cd oceanbase-all-in-one/bin/
[admin@test001 bin]$ ./install.sh
[admin@test001 bin]$ source ~/.oceanbase-all-in-one/bin/env.sh
```

## 方法二：使用 RPM 包安装

**在线安装**
```
[admin@test001 ~]$ sudo yum install -y yum-utils
[admin@test001 ~]$ sudo yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
[admin@test001 ~]$ sudo yum install -y ob-deploy
[admin@test001 ~]$ source /etc/profile.d/obd.sh
```

**离线安装**
若您的机器无法连接网络，您可从 [OceanBase 软件下载中心](https://www.oceanbase.com/softwarecenter) 下载所需版本的 OBD。

在 CentOS 或 RedHat 系统上，执行如下命令安装 OBD：

```
sudo yum install ob-deploy-*.rpm
```
在 Ubuntu 或 Debian 系统上，执行如下命令安装 OBD：

```
sudo alien --scripts -i ob-deploy-*.rpm
```

**配置 OBD**

在线部署 OceanBase 集群或通过 all-in-one 安装包部署 OceanBase 集群，无需配置。

1. 执行如下命令禁用远程仓库
```
obd  mirror disable remote
```

2. 确认 Type=remote 对应的 Enabled变成了 False，则说明已关闭远程镜像源
```
obd mirror list
```

3. 在安装包所在目录执行如下命令将下载好的安装包上传到本地仓库
```
obd mirror clone *.rpm
```

4. 查看本地仓库的安装包列表
```
obd mirror list local
```

在输出的列表中查看到部署所需安装包即表示上传成功。




