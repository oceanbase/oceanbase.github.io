---
title: 各种 max value 限制
weight: 4
---
> 说明：
>
> 目前 DBA 进阶教程的内容暂时对应的是 OceanBase 社区版本 MySQL 模式的租户，本小节的架构部分不涉及商业版 Oracle 模式下的内容。社区版和商业版的能力区别详见：[官网链接](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428510)。


# 使用限制

## 集群名长度限制

| **数据项**              | **最大长度**           |
|------------------------|----------------------|
| &emsp;&emsp;&emsp;&emsp;&emsp;集群名&emsp;&emsp;&emsp;&emsp;&emsp;| &emsp;&emsp;&emsp;&emsp;&emsp;128 字节&emsp;&emsp;&emsp;&emsp;&emsp;|

## 标识符长度限制

  | **数据项** | **最大长度**    |
  |------------|-----------------|
  | &emsp;&emsp;&emsp;&emsp;&emsp; 用户名 &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 字节 &emsp;&emsp;&emsp;&emsp;&emsp;     |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 租户名 &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 63 字节   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 数据库名 &emsp;&emsp;&emsp;&emsp;     |  &emsp;&emsp;&emsp;&emsp;&emsp; 128 字节   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 表名 &emsp;&emsp;&emsp;&emsp;       |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 字符    |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 列名 &emsp;&emsp;&emsp;&emsp;       |  &emsp;&emsp;&emsp;&emsp;&emsp; 128 字节   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 索引名 &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 字节    |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 视图名 &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 字节    |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 别名 &emsp;&emsp;&emsp;&emsp;       |  &emsp;&emsp;&emsp;&emsp;&emsp; 255 字节   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 表组名 &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 127 字节   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; 用户定义变量 &emsp;&emsp;    |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 字符    |


## ODP(OceanBase Database Proxy) 连接限制

### 连接数据库限制

V4.x 版本中，通过 ODP 方式连接数据库时，不支持主备库自由路由。

### 最大连接数限制

|       类型        |                     最大限制                      |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| 单个 ODP 的连接数 &emsp; | 由 ODP 的 `client_max_connections` 参数控制，默认为 8192。 <main id="notice" type='explain'><h4>说明</h4><p>您可以通过增加 ODP 节点数或者修改 <code>client_max_connections</code> 配置项值的方式来增大集群的连接总数限制。</p></main>|

## 分区副本数限制

|         类型         |           最大限制            |
|:---:|:---:|
| 每个 OBServer 节点的分区副本数 | 无严格限制 <br></br>每个 OBServer 节点的分区副本数可根据租户内存大小来预估，1G 内存约支持约 2 万 tablet。 |

## 单个表的限制

|  类型   |   最大值限制    |
|:---:|:---:|
| 行长度   | 1.5 M 字节   |
| 列数    | 4096 列    |
| 索引个数  | 128 个     |
| 索引总列数 | 512 列     |
| 索引长度  | 16K    |
| 主键总列数 | 64 列      |
| 主键长度  | 16K       |
| 分区个数  | 8192 ~ 65536 个 <br></br> MySQL 模式下单个表允许的最大分区数由租户级配置项 <code>max_partition_num</code>控制，默认为 8192 个。   |

## 单列的限制

|   类型    |   最大限制    |
|:---:|:---:|
| &emsp;&emsp;&emsp;&emsp;&emsp; 索引单个列长度 &emsp;&emsp;&emsp;&emsp;&emsp; | &emsp;&emsp;&emsp;&emsp;&emsp; 16K &emsp;&emsp;&emsp;&emsp;&emsp;  |

## 字符串类型限制

  |   **类型**    | **最大长度**     |
  |:---:|:---:|
  |  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; `CHAR` &emsp;&emsp;&emsp;&emsp;&emsp;         |  &emsp;&emsp;&emsp;&emsp;&emsp; 256 字符 &emsp;&emsp;&emsp;&emsp;&emsp;          |
  | `VARCHAR`     | 262144 字符     |
  | `BINARY`      | 256 字节         |
  | `VARBINARY`   | 1048576 字节     |
  | `TINYBLOB`    | 255 字节         |
  | `BLOB`        | 65535 字节       |
  | `MEDIUMBLOB`  | 16777215 字节    |
  | `LONGBLOB`    | 536870910 字节   |
  | `TINYTEXT`    | 255 字节         |
  | `TEXT`        | 65535 字节       |
  | `MEDIUMTEXT`  | 16777215 字节    |
  | `LONGTEXT`    | 536870910 字节   |

## 功能使用限制

物理备库的使用限制如下表所示。

| 限制项                         |   具体描述                                                               |
|:---:|:---:|
| 同一个主租户支持的最大备租户个数  | 无限制                                                                   |
| 主租户和备租户是否要求资源同构    | 不要求同构。建议主租户和备租户使用相同的资源规格。                          |
| 配置项                         | 主租户与备租户的配置项相互独立，不会物理同步。如果修改了主租户的配置项，需要评估是否需要修改备租户的相同配置项。  |
| 系统变量                       | 主租户和备租户的系统变量物理同步，如果在主租户上修改了系统变量，系统会同步修改备租户的相同系统变量。             |
| 用户及用户密码                  | 仅支持在主租户上创建用户和修改用户密码，更新后信息会同步给备租户。                                            |
| 读写操作                       | 备租户支持读操作，不支持写操作。                   |
| 转储与合并                     | 主租户和备租户的转储相对独立。<br></br>备租户从主租户同步合并信息，不支持独立合并。                             |
| Switchover 限制                | 要求备租户日志流的所有副本在线                        |
| Failover 限制                  | 要求备租户日志流的所有副本在线                                    |