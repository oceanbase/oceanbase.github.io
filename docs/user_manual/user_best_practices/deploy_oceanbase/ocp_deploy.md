---
title: 通过 OCP 部署&接管集群
weight: 4
---

> 当前使用版本：社区版 OCP-4.2.0

**创建集群主要步骤：**

前置准备：机器初始化。

上传软件包：第一次创建需要。

添加主机：包括账号密码、机房等。

创建集群：定义集群信息。

关联 OBProxy 集群：OB 代理。

## **前置准备**

### **规划目录**

需要创建的目录（可根据自己的业务情况调整）

- /data 为数据盘。
- /redo 存放 redo 日志。
- /home/admin/oceanbase 存放 OceanBase 数据库的二进制文件和运行日志。

其中，数据盘和日志盘建议分盘，避免相互影响；日志盘大小建议是 OB 内存的 3-4 倍；磁盘空间默认会预占用，后续数据新增会自动从这里面分配。

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

### **安装 MySQL Client**

```
centos： yum install mysql -y
ubuntu：apt-get install mariadb-client -y
```

## **上传软件包**

软件包下载地址：[https://www.oceanbase.com/softwarecenter](https://www.oceanbase.com/softwarecenter)

需要安装的软件包：

- OceanBase 数据库 (OBServer 服务)
- 依赖库 (OceanBase Libs)
- 工具集成包 (OceanBase Utils)
- OceanBase 数据库代理 (OBProxy)
- OCP 监控工具 (OCP-Agent)

OCP-Agent 需要到 OCP 服务所在的服务器下载，然后上传

```
[root@obtest ~]# find /  -name "t-oceanbase-ocp-agent*"
/root/.ocp-server-all-in-one/ocp-installer/usr/ocp-installer/rpm/t-oceanbase-ocp-agent-4.2.0-20231017100200.alios7.aarch64.rpm
/root/.ocp-server-all-in-one/ocp-installer/usr/ocp-installer/rpm/t-oceanbase-ocp-agent-4.2.0-20231017100200.alios7.x86_64.rpm
/root/ocp-server-all-in-one/rpms/t-oceanbase-ocp-agent-4.2.0-20231017100200.alios7.aarch64.rpm
/root/ocp-server-all-in-one/rpms/t-oceanbase-ocp-agent-4.2.0-20231017100200.alios7.x86_64.rpm
```

查看所有软件包：
![image.png](/img/deploy_oceanbase/ocp_deploy/p1.png)

## **添加主机**

1. 填写主机信息

涉及到的操作：【新增机型】、【新增机房】、【新增区域】、【新增凭据】

- 机房对应 IDC，区域对应 REGION，可以是实际的也可以是虚拟的；
- 凭证为用户密码，建议使用 admin 用户；
- 添加完成，建议完成主机标准化，相当于将 OBD 初始化操作集成到了这个功能，而不需要手动操作，避免因配置不正确影响线上稳定性。

![image.png](/img/deploy_oceanbase/ocp_deploy/p2.png)

2. 查看主机状态

添加主机完成后，需要等待主机创建完成

- 新提交：表示添加主机任务还在进行中
- 空闲：表示添加主机任务已经完成
- 空闲（黄色叹号）：表示未做主机标准化，**强烈建议进行主机标准化操作，进行风险检查以及自动修复。**
- 失败：添加主机任务失败，可以通过任务中心查看详情

![image.png](/img/deploy_oceanbase/ocp_deploy/p3.png)
![image.png](/img/deploy_oceanbase/ocp_deploy/p4.png)
![image.png](/img/deploy_oceanbase/ocp_deploy/p5.png)

比如找不到 OCP-Agent，将上面提到的安装包上传重试即可。
![image.png](/img/deploy_oceanbase/ocp_deploy/p6.png)

## **创建集群**

1. 点击创建集群

![image.png](/img/deploy_oceanbase/ocp_deploy/p7.png)

2. 定义集群信息

![image.png](/img/deploy_oceanbase/ocp_deploy/p8.png)

参数默认不需要设置，会自动占用 80% - 90% 的资源，如果只是测试或者不想全部占用，可以自己配置。

可以参考【通过 OBD 部署集群】里的参数。

![image.png](/img/deploy_oceanbase/ocp_deploy/p9.png)

3. 提交表单

提交会让二次确认信息，没问题后则会真正的开始创建任务。可以到任务中心查看任务进度。
![image.png](/img/deploy_oceanbase/ocp_deploy/p10.png)
![image.png](/img/deploy_oceanbase/ocp_deploy/p11.png)

4. 创建任务完成后查看集群信息
   ![image.png](/img/deploy_oceanbase/ocp_deploy/p12.png)

## **关联 OBProxy 集群**

1. 点击开始创建

![image.png](/img/deploy_oceanbase/ocp_deploy/p13.png)

2. 创建 OBProxy 集群，并关联 OB 集群

建议使用 ConfigUrl，后续 OMS 等工具需要用到。
![image.png](/img/deploy_oceanbase/ocp_deploy/p14.png)
![image.png](/img/deploy_oceanbase/ocp_deploy/p15.png)

3. 表单提交后可以通过任务中心查看进度
   ![image.png](/img/deploy_oceanbase/ocp_deploy/p16.png)

## **接管已有集群**

1. 添加主机（同上）

2. 接管集群

![image.png](/img/deploy_oceanbase/ocp_deploy/p17.png)

3. 填写集群连接信息

proxyro 密码，建议填写。
![image.png](/img/deploy_oceanbase/ocp_deploy/p18.png)

4. 预检查
   ![image.png](/img/deploy_oceanbase/ocp_deploy/p19.png)

如果出现 IDC、REGION 不一致的报错，可以手动修改主机上的【机房】以及【区域】来对应集群实际的 IDC 和 REGION。或者修改集群的 IDC 与 REGION 信息。

查询集群 IDC 与 REGION 信息：

```
obclient [oceanbase]> select * from dba_ob_zones;
+-------+----------------------------+----------------------------+--------+-----+------------+-----------+
| ZONE  | CREATE_TIME                | MODIFY_TIME                | STATUS | IDC | REGION     | TYPE      |
+-------+----------------------------+----------------------------+--------+-----+------------+-----------+
| zone1 | 2023-08-23 16:56:33.745432 | 2023-08-23 16:56:33.745432 | ACTIVE |     | sys_region | ReadWrite |
| zone2 | 2023-08-23 16:56:33.745432 | 2023-08-23 16:56:33.745432 | ACTIVE |     | sys_region | ReadWrite |
| zone3 | 2023-08-23 16:56:33.745432 | 2023-08-23 16:56:33.745432 | ACTIVE |     | sys_region | ReadWrite |
+-------+----------------------------+----------------------------+--------+-----+------------+-----------+
3 rows in set (0.095 sec)
```

修改 IDC 与 REGION 信息：

```
ALTER SYSTEM MODIFY zone zone1 SET IDC='old2',REGION='sys_region';
```

5. 等待接管任务完成，可以查看集群获取集群信息
   ![image.png](/img/deploy_oceanbase/ocp_deploy/p20.png)
