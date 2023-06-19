---
title: 部署方式
weight: 2
---
# **部署方式**

根据不同的使用场景，OceanBase 提供了不同的部署方法，您可根据自身情况选择合适的部署方法。本文仅介绍 OBD 命令行部署的操作步骤，其他方式请参见 [相关文档](#相关文档) 中对应链接文档。

## **OBD 命令行部署操作步骤**

> **注意**
>
> - 以下内容以 x86 架构的 CentOS Linux 7.9 镜像作为环境，其他环境可能略有不同。
>
> - 强烈建议使用非 root 用户来部署。

### **步骤一：（可选）下载并安装 all-in-one 安装包**

从 OceanBase 数据库 V4.0.0 版本开始，OceanBase 提供统一的安装包 all-in-one package。您可以通过这个统一的安装包一次性完成 OBD、OceanBase 数据库、OBProxy、OBAgent 等组件的安装。

您也可根据实际需求从 [OceanBase 软件下载中心](https://www.oceanbase.com/softwarecenter) 选择部分组件下载安装或者指定组件的版本。

#### **在线安装**

若您的机器可以连接网络，可执行如下命令在线安装。

```shell
[admin@test001 ~]$ bash -c "$(curl -s https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/download-center/opensource/oceanbase-all-in-one/installer.sh)"
[admin@test001 ~]$ source ~/.oceanbase-all-in-one/bin/env.sh
```

#### **离线安装**

若您的机器无法连接网络，可参考如下步骤离线安装。

从 [OceanBase 软件下载中心](https://www.oceanbase.com/softwarecenter) 下载最新的 all-in-one 安装包，并将其复制到中控机任意目录下。

在安装包所在目录下执行如下命令解压安装包并安装。

```shell
[admin@test001 ~]$ tar -xzf oceanbase-all-in-one-*.tar.gz
[admin@test001 ~]$ cd oceanbase-all-in-one/bin/
[admin@test001 bin]$ ./install.sh
[admin@test001 bin]$ source ~/.oceanbase-all-in-one/bin/env.sh
```

### **步骤二：配置 OBD**

如果是在线部署 OceanBase 集群或通过 all-in-one 安装包部署 OceanBase 集群，则跳过步骤 1~3。

1. 禁用远程仓库

   ```shell
   [admin@test001 rpm]$ obd mirror disable remote
   ```

   > **说明**
   >
   > 安装 all-in-one 安装包后默认关闭远程仓库，您可通过 obd mirror list 命令进行确认，查看 Type=remote 对应的 Enabled 变成了 False，说明已关闭远程镜像源。

2. 将安装包添加至本地镜像库

   ```shell
   [admin@test001 rpm]$ obd mirror clone *.rpm
   ```

3. 查看本地镜像库中安装包列表

   ```shell
   [admin@test001 rpm]$ obd mirror list local
   ```

4. 选择及修改配置文件

   可以参照 [部署 OceanBase/配置文件](./configuration_file.md)。

### **步骤三：部署 OceanBase 集群**

1. 部署 OceanBase 集群

   ```shell
   [admin@test001 ~]$ obd cluster deploy obtest -c all-components.yaml
   ```

2. 启动 OceanBase 集群

   ```shell
   [admin@test001 ~]$ obd cluster start obtest
   ```

   当安装了 OCP Express 时，会输出 OCP Express 的访问地址。在阿里云或其他云环境下，安装程序可能因无法获取公网 IP 而输出内网地址，此 IP 非公网地址，您需要使用正确的地址。

3. 查看 OceanBase 集群状态

   ```shell
   # 查看 OBD 管理的集群列表
   [admin@test001 ~]$ obd cluster list
  
   # 查看 obtest 集群状态
   [admin@test001 ~]$ obd cluster display obtest
   ```

4. （可选）修改集群配置

   ```shell
   # 使用 edit-config 命令进入编辑模式，修改集群配置
   # 修改配置并保存退出后，OBD 会告知如何使得此次修改生效，复制 OBD 输出的命令即可
   [admin@test001 ~]$ obd cluster edit-config obtest
   Search param plugin and load ok
   Search param plugin and load ok
   Parameter check ok
   Save deploy "obtest" configuration
   Use `obd cluster reload obtest` to make changes take effect.
   [admin@test001 ~]$ obd cluster reload obtest
   ```

### **步骤四：连接 OceanBase 集群**

运行如下命令，使用 OBClient 客户端连接 OceanBase 集群。

```shell
obclient -h<IP> -P<PORT> -uroot@sys -p -c -A
# example
obclient -h10.10.10.4 -P2883 -uroot@sys -p -c -A
```

其中，`IP` 为连接 OceanBase 数据库的 IP 地址；`PORT` 为连接 OceanBase 数据库的的端口，直连时为 `mysql_port` 配置项的值，通过 OBProxy 连接时为 `listen_port` 配置项的值。

使用 OBClient 客户端连接 OceanBase 集群的详细操作可参见 [通过 OBClient 连接 OceanBase 租户](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001698768)。

## **相关文档**

### **白屏部署**

- 使用 OCP 部署可参见 OceanBase 数据库文档 [通过 OCP 部署 OceanBase 集群](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001700626) 一文。

- 使用 OBD 部署可参见 OceanBase 数据库文档 [通过 OBD 白屏部署 OceanBase 集群](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001697442)

### **命令行部署**

- 使用 OBD 部署可参见 OceanBase 数据库文档 [使用命令行部署 OceanBase 数据库生产环境](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001692942)

- 手动部署可参见问答区 SOP 文档 [【SOP 系列 04】手动部署 OceanBase 集群](https://ask.oceanbase.com/t/topic/28800061)