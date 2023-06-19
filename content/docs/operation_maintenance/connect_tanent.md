---
title: 连接租户
weight: 6
---
# **连接租户**

OceanBase 数据库开源版仅兼容 MySQL 租户，连接协议兼容 MySQL 5.6。因此使用 MySQL 命令行客户端或者图形化工具理论上也能连接 OceanBase 数据库的租户。此外，OceanBase 数据库也提供专属的命令行客户端工具 OBClient 和图形化客户端工具 ODC。

## **客户端连接**

OceanBase 数据库 MySQL 租户支持传统 MySQL 客户端以及 OBClient 客户端连接，跟传统 MySQL 不一样的地方是用户名的格式。

> **说明**
>
> OceanBase 数据库当前版本支持的 MySQL 客户端版本包括 V5.5、V5.6 和 V5.7。

连接示例如下：

```bash
mysql -h xxx.xxx.xxx.xxx -uroot@sys#obdemo -P2883 -p -c -A oceanbase

obclient -h xxx.xxx.xxx.xxx -uroot@sys#obdemo -P2883 -p -c -A oceanbase
```

说明：

- -h：提供 OceanBase 数据库连接 IP，通常是一个 ODP 地址。

- -u：提供租户的连接账户，通过 ODP 连接时格式有四种：用户名@租户名#集群名、集群名:租户名:用户名、集群名-租户名-用户名、集群名.租户名.用户名，推荐使用 用户名@租户名#集群名。如果是直连 OBServer 节点，用户名需去掉集群名。MySQL 租户的管理员用户名默认是 root。

- -P：提供 OceanBase 数据库连接端口，通过 ODP 连接时为 listen_port 配置项的值，默认是 2883；通过 OBServer 节点直连时为 mysql_port 配置项的值，默认为 2881。连接端口均可在部署 OceanBase 数据库时自定义。

- -p：提供账户密码，为了安全可以不提供，改为在后面提示符下输入，密码文本不可见。

- -c：表示在 MySQL 运行环境中不要忽略注释。

- -A：表示在 MySQL 连接数据库时不自动获取统计信息。

- oceanbase：访问的数据库名，可以改为业务数据库。

新创建的业务租户的管理员（root）密码默认为空，需要修改密码。

```bash
mysql -h x.x.x.x -uroot@obmysql#obdemo -P2883 -p -c -A oceanbase

MySQL [oceanbase]> alter user root identified by 'b******t' ;
Query OK, 0 rows affected (0.118 sec)
```

## **OceanBase 连接驱动（JDBC）**

OceanBase 数据库目前支持的应用主要是 Java 和 C/C++ 。

- Java 语言
  
  - MySQL 官方 JDBC 驱动下载地址：[MySQL Connector/J 5.1.46](https://downloads.mysql.com/archives/c-j/)

  - OceanBase 官方 JDBC 驱动下载地址：[OceanBase-Client](https://help.aliyun.com/document_detail/212815.html)

- C 语言
  
  - 具体驱动说明请参考官网文档：[OceanBase Connector/C 简介](https://www.oceanbase.com/docs/community-connector-c-cn-10000000000017244)
  
  - 下载地址：[OceanBase Connector/C 下载](https://github.com/oceanbase/obconnector-c)

## **DBeaver 客户端连接**

DBeaver 是一款通用的数据库客户端工具，其原理是使用各个数据库提供的 JDBC 驱动连接数据库，支持常见的关系型数据库、非关系型数据库、分布式数据库等等。使用 OceanBase 提供的 JDBC 驱动或者 MySQL 官方驱动，DBeaver 也可以连接 OceanBase 数据库的 MySQL 租户。

官方下载地址：<https://dbeaver.io/download/>

DBeaver 连接 OceanBase 数据库时可选择 MySQL 数据库类型，第一次使用会自动下载官方 MySQL 驱动。详细操作可参考 OceanBase 数据库文档 [通过 DBeaver 连接数据库](https://www.oceanbase.com/docs/community-observer-cn-10000000001879671) 一文。

## **ODC 客户端连接**

OceanBase 提供官方图形化客户端工具 OceanBase Developer Center，简称 ODC，是目前对 OceanBase 数据库适配性最好的客户端工具。该工具的详细信息请参考官网文档 [OceanBase 开发者中心](https://www.oceanbase.com/docs/enterprise-odc-doc-cn-10000000000833893) 。

ODC 下载地址：[下载客户端版 ODC](https://help.aliyun.com/document_detail/212816.html?spm=a2c4g.11186623.6.848.2cb5535fzdJK9X) 。
