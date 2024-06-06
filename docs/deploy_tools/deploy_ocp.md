---
title: 集群管理平台 - OCP
weight: 2
---

> 安装的版本是 OCP V4.0.3_CE_BP1，该版本集成为 ALL-IN-ONE 软件包，可以直接在页面安装部署集群以及服务，与其他的版本安装方式可能不同，其他版本安装可以参考官网。

## 启动 ocp-installer

1. 下载并解压软件包

```
tar -xf ocp-server-all-in-one-1.0.0-YYYYMMDDhhmmss.el7.x86_64.tar.gz
```

2. 安装部署程序

```
cd ocp-server-all-in-one/bin && sh install.sh
```

3. 环境变量

```
source ~/.ocp-server-all-in-one/bin/env.sh
```

4. 执行 ocp-installer install ，并根据返回的 IP 地址在浏览器中打开链接开始部署，-pxxx 可以自定义端口。

```
[root@obtest bin]# ocp-installer install
Disable remote ok
start Ocp Installer install in 0.0.0.0:8680
please open http://172.xx.xx.xx:8680
```

## 开始部署

1. 向导页面点击开始部署

![image.png](/img/deploy_tools/deploy_ocp/p1.png)

2. 先选择 OCP MetaDB 的配置方式，

- 创建全新的 OceanBase 数据库，会在后续操作中选择机器、配置来部署集群以及创建租户；
- 使用已有的 OceanBase 数据库，则需要填写已有集群的配置信息来创建 MetaDB 租户。
  ![image.png](/img/deploy_tools/deploy_ocp/p2.png)

3. 配置 MetaDB 集群信息

填写 MetaDB 集群部署的信息，包括主机（可以多台）、部署用户、路径等。等待配置检查完成。

<div style="color: red">注意：root@sys 密码一定要保存好，后续登陆 sys 租户需要用这个密码，并且没办法修改和找回。</div>

![image.png](/img/deploy_tools/deploy_ocp/p3.png)

4. MetaDB 集群资源分配

- 内存总数为系统中 free 的内存数，如果缓存占用太多可以手动刷新一下。
- memory_limit 为分配给集群的内存大小。
- 日志文件是指 CLOG 文件的大小，建议是内存的 3 倍。
- 数据文件和日志文件会先预占用分配的空间大小，所以建议合理分配空间，强烈建议日志和数据文件分盘，避免相互影响。

![image.png](/img/deploy_tools/deploy_ocp/p4.png)

5. MetaDB 集群部署预检查

如果有一些检查没有通过，可以通过失败项内的详情，到官网或者论坛寻找解决方案。
![image.png](/img/deploy_tools/deploy_ocp/p5.png)

6. 集群部署

可以通过部署日志查看集群、链接、账密信息等。

如果部署失败，也可以通过这里查看报错步骤以及失败原因，修复完成后重新部署。
![image.png](/img/deploy_tools/deploy_ocp/p6.png)

7. OCP 配置

配置 OCP 服务信息，包括管理员（admin）密码、路径、端口等。

配置元信息租户和监控租户的账号密码，这两个租户的 root 密码实际为空（可以用配置的密码和空密码尝试）。

![image.png](/img/deploy_tools/deploy_ocp/p7.png)

8. OCP 服务及租户资源分配

包括 OCP 服务、元信息租户以及监控租户的 CPU 及内存分配。

元信息租户不小于 1C2G，监控租户不小于 2C4G。

![image.png](/img/deploy_tools/deploy_ocp/p8.png)

9.  OCP 服务预检查

![image.png](/img/deploy_tools/deploy_ocp/p9.png) 10. 部署 OCP 服务

访问地址为页面展示的地址。

<div style="color: red">管理员密码一定要记住，否则将没办法登录 OCP 平台。</div>

![image.png](/img/deploy_tools/deploy_ocp/p10.png)

11. 登录 OCP

![image.png](/img/deploy_tools/deploy_ocp/p11.png)
![image.png](/img/deploy_tools/deploy_ocp/p12.png)

接下来就可以做创建集群、集群管理维护等一系列的操作了。
