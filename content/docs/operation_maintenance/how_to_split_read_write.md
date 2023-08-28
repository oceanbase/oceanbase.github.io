---
title: OceanBase如何实现读写分离
weight: 15
---

# **OceanBase如何实现读写分离**

在我们实际业务场景中，经常会遇到一类业务场景，既有OLTP类的在线业务，又有OLAP类的分析业务，两种类型的业务同时跑在一套数据库集群上，这对数据库的配置等要求就相对较高，因此我们一般会采用读写分离的方式，将一部分的读请求，路由到 Follower 副本上，从而降低复杂分析计算对资源的侵占，影响在线业务的响应延迟。
OceanBase数据库也提供了读写分离的能力，通过多种配置方式可以轻松实现，在配置之前，先简单介绍下OceanBase的架构和路由策略
## **OBProxy路由策略**
在部署OceanBase集群时，需要部署一个OBProxy来做请求的路由转发，如下图，所有业务的请求，经过OBProxy转发之后，会自动访问到数据的 Leader 副本上。
![image.png](/img/operation_maintenance/how_to_split_read_write/a.png)
这里的OBProxy路由策略其实遵循以下三个策略：

- Primary Zone 路由：第一优先级
- LDC 路由：第二优先级
- 随机路由：第三优先级
### **Primary Zone 路由**
默认情况，即会将租户请求发送到租户的 primary zone 所在的机器上，OBProxy 在主副本路由时，存在找不到表或者分区 Leader 副本的情况（首次连接、缓存失效、分区计算失败、无法获取表名等原因），通过 Primary Zone 路由可以尽量发往主副本，方便快速寻找 Leader 副本。
OBProxy 配置项 enable_primary_zone 控制是否启用Primary zone路由，默认是开启的。
关于Primary Zone相关概念以及配置方式，可参考官方文档介绍：[副本管理](https://www.oceanbase.com/docs/common-oceanbase-database-1000000000036283)
### **LDC 路由**
LDC 路由是基于地理位置的路由，其中有两个重要的概念：

- IDC：表示逻辑机房概念
- Region：表示城市的概念。

OBProxy 和 OBServer 都可以设置 LDC 信息。通过 LDC 信息，OBProxy 可以确定和 OceanBase 数据库的位置关系。当设置了 LDC 信息后，OBProxy 就会默认使用 LDC 路由。
LDC路由策略：是指OBProxy按照根据城市/机房等信息就近路由访问OBServer。
OBProxy 配置项 proxy_idc_name 控制是否开启 LDC 路由策略。
### **随机路由**
通过优先级路由后，如果还有多个副本，则进行随机路由。如未开启 Primary Zone 路由或者未设置 LDC 路由，就会直接使用随机路由。
关于OBProxy路由详细信息，可参考官网文档介绍：[数据路由](https://www.oceanbase.com/docs/enterprise-odp-enterprise-cn-10000000001715896)
## **读写分离配置**
要实现真正的读写分离，还需要进一步设置，因为默认情况下，所有的请求都是发送到数据的 Leader 副本上，即强一致性的请求，因为 OLAP 的分析计算，一般对于数据的一致性要求不高，因此可以在开启弱一致性查询之后，实现请求访问到 Follower 副本。
### **弱一致性读设置**
弱一致性读设置有三种方式：

- SQL级别设置
- 会话级别设置
- 修改OBProxy配置项实现

1、SQL级别设置，即在请求的SQL中，加上弱一致性读的Hint，方法如下：
```sql
obclient> select /*+READ_CONSISTENCY(WEAK)*/ * from t1;
```

2、会话级别设置，分Global级别和Session级别，修改变量 ob_read_consistency

| **属性** | **描述** |
| --- | --- |
| 参数类型 | enum |
| 默认值 | STRONG |
| 取值范围 | 0：空字符串  1：FROZEN   2：WEAK   3：STRONG |
| 生效范围 | Global     Session |

执行如下命令进行设置
```sql
obclient> set global ob_read_consistency=‘weak’
```

3、修改OBProxy配置项实现：通过 Hint 的方式设置弱读需要修改 SQL，修改 SQL 会有一定的业务侵入性，为了不侵入业务，可以指定连接某个OBProxy的所有请求都为弱一致性读，修改方式如下：
通过要设置为弱一致性读的OBProxy连接到数据库，执行如下命令进行修改
```sql
alter proxyconfig set obproxy_read_consistency = 1;
```
> 该配置项取值为 0 和 1，默认为 0，表示强读（需要读到最新的数据）。1 表示弱读。


以上三种方式各有优劣势，通过Hint的方式，需要修改SQL，如果SQL数量比较多，则修改起来工作量大，并且对业务代码有一定侵入性，但是比较方便灵活，对于分析请求场景需求不高的情况，可修改个别SQL快速实现弱一致性。会话级别的设置，如果是全局设置，则会导致所有的连接会话都开启弱一致性读，如果只开启Session级别，则每开启一个Session都需要先执行以下命令，也有一定业务的入侵。通过修改OBProxy配置，在分析请求比较多且复杂的场景，则是最方便的方式，所有连接这个OBProxy的SQL默认开启弱一致性读。

开启弱一致性读只是配置读写分离的第一步，在开启弱一致性读时，如果没有设置LDC策略，所有的请求还是会按照最开始讲到的 OBProxy 路由策略，优先发送到primary zone，如果未设置primary zone，即primary zone为random，那么请求会按照随机路由的策略，随机发送到任意副本，因此时有可能发送到 Leader 副本，并未实现完全的读写分离。

### **LDC设置**
前面介绍到 LDC 包含了 IDC 机房信息和 Region 城市信息。一个城市，包含一个或多个IDC，每个IDC中可部署一个或多个Zone。如下图，是一个典型的两地三中心部署方案，两个城市Region1 和 Region2，以及三个机房 idc1、idc2 和 idc3，其中 idc1 和 idc 3都包含了两个zone。另外还有3个OBProxy，分别部署在三个idc中。
![image.png](/img/operation_maintenance/how_to_split_read_write/b.png)
LDC的设置，要分别设置OBProxy和OBServer，使其对应上之后，才会实现真正的就近访问。
1、OBServer设置：
OceanBase 数据库的每个 Zone 都可以设置 Region 属性或 IDC 属性，Region 通常设置为城市名（大小写敏感），IDC 代表该 Zone 所处的机房信息，通常设置机房名（小写）
设置SQL如下：
```sql
alter system modify zone "zone1" set region = "BEIJING";
alter system modify zone "zone1" set idc = "idc1";
```
修改完成后，通过执行 select * from DBA_OB_ZONES; 进行查询
```sql
obclient [oceanbase]> select * from DBA_OB_ZONES;
+-------+----------------------------+----------------------------+--------+------+----------+-----------+
| ZONE  | CREATE_TIME                | MODIFY_TIME                | STATUS | IDC  | REGION   | TYPE      |
+-------+----------------------------+----------------------------+--------+------+----------+-----------+
| zone1 | 2023-06-16 18:32:40.102484 | 2023-08-17 17:36:57.810787 | ACTIVE | idc1 | BEIJING  | ReadWrite |
| zone2 | 2023-06-16 18:32:40.102484 | 2023-08-17 17:37:06.622934 | ACTIVE | idc2 | BEIJING  | ReadWrite |
| zone3 | 2023-06-16 18:32:40.102484 | 2023-08-17 17:37:11.816791 | ACTIVE | idc3 | SHANGHAI | ReadWrite |
+-------+----------------------------+----------------------------+--------+------+----------+-----------+
3 rows in set (0.012 sec)
```

2、OBProxy设置：
方法一：ODP 进程启动时通过 -o 参数指定设置 LDC 信息
```sql
cd /opt/taobao/install/obproxy
./bin/obproxy -o proxy_idc_name=idc1
```
方法二：通过执行 SQL 语句设置 LDC 信息
```sql
obclient> alter proxyconfig set proxy_idc_name='idc1';
```
通过执行 show proxyinfo idc 命令，可检查是否设置成功
```sql
obclient [oceanbase]> show proxyinfo idc;
+-----------------+--------------+----------------+----------------+--------------+--------------+--------------+
| global_idc_name | cluster_name | match_type     | regions_name   | same_idc     | same_region  | other_region |
+-----------------+--------------+----------------+----------------+--------------+--------------+--------------+
| idc1            | obcluster    | MATCHED_BY_IDC | [[0]"BEIJING"] | [[0]"zone1"] | [[0]"zone2"] | [[0]"zone3"] |
+-----------------+--------------+----------------+----------------+--------------+--------------+--------------+
1 row in set (0.001 sec)
```

在OBProxy设置完成之后，查看OBProxy的LDC信息，可以在regions_name 和 same_idc中看到，OBProxy和对应的region和zone已经实现了自动匹配，这个时候，业务访问idc1 的这个OBProxy，默认会将请求路由到zone1的OBServer上。

但是这样也无法保证OLAP类的读请求都访问到 Follower副本，因此还需要再进一步设置。

### **FOLLOWER_FIRST设置**
在设置了LDC路由策略之后，弱一致性的读请求只会就近访问，为了保证弱一致性的读请求能够优先路由到Follower 副本上，还需要对OBProxy设置 proxy_route_policy 参数，这个参数有两个值：

- FOLLOWER_FIRST：优先发往备副本，如果无备副本可用则发往主副本。
- FOLLOWER_ONLY：只能发往备副本，如果无备副本可用则报错。

设置方式如下，通过连接OBProxy，执行如下命令
```sql
obclient [oceanbase]> alter proxyconfig set proxy_route_policy="follower_first";
Query OK, 0 rows affected (0.005 sec)

obclient [oceanbase]> show proxyconfig like "%proxy_route_policy%";
+--------------------+----------------+--------------------+-------------+---------------+
| name               | value          | info               | need_reboot | visible_level |
+--------------------+----------------+--------------------+-------------+---------------+
| proxy_route_policy | follower_first | proxy route policy | false       | SYS           |
+--------------------+----------------+--------------------+-------------+---------------+
1 row in set (0.002 sec)
```
通过以上的设置，那么就可以实现弱一致性的优先访问 follower 副本的策略。

通过以上集中方式的设置，我们就可以灵活配置读写分离的方案，以下举几个常见的读写分离案例，以供大家参考
## **读写分离案例**
### **案例一：本地备优先读**

**设置条件：**

1. 会话级别设置弱一致性读 **或者** SQL 请求加 弱一致性读 Hint
2. 设置LDC策略，OBProxy 和 OBServer 绑定
3. 配置了FOLLOWER_FIRST

**路由策略：**

1. 默认情况下，强一致性读以及增删改的SQL，依然访问 Leader 副本；
2. 开启弱一致性读的 SQL 请求，连接串中指定访问的 OBProxy，OBProxy 默认会将请求路由到本地 Follower 副本，如果本地该数据的副本为 Leader 副本，则自动路由到同 Region 中其他 IDC 的 Follower 副本，如下图中红色线条，跨 IDC 访问数据。

**优缺点：**

1. 优点：配置简单，不需要单独配置一个弱一致性读的 OBProxy；
2. 缺点：如果本地副本是 Leader 副本，则会跨 IDC 访问，SQL 需要改造，对业务有一定影响。

![image.png](/img/operation_maintenance/how_to_split_read_write/c.png)

### **案例二：只读zone**

**设置条件：**

1. 设置弱一致性读 OBProxy：obproxy_read_consistency = 1;
2. 设置Primary Zone为：zone1,zone2;zone3
3. 设置LDC策略，OBProxy 和 OBServer 绑定
4. 配置了FOLLOWER_FIRST

**路由策略：**

1. 需要弱一致性读的SQL，连接设置了弱读的 OBProxy，其余SQL连接正常OBProxy；
2. 通过连接弱读的 OBProxy 的所有 SQL，会基于 LDC 路由策略，以及 FOLLOWER_FIRST策略，会自动访问本地 Follower 副本。
3. 因为设置了 Primary Zone（zone1,zone2;zone3），所有的 Leader 副本都被迁移到了zone1 和zone2中，因此zone3默认情况下都为Follower 副本，那么zone3的副本就可以只给弱一致性读的分析计算类SQL提供服务。

**优缺点：**

1. 优点：zone级别隔离读写请求，隔离相比方案一更彻底；
2. 缺点：需要单独配置一个弱读的OBProxy，需要设置Primary Zone。

![image.png](/img/operation_maintenance/how_to_split_read_write/d.png)

### **方案三：只读副本**
OceanBase 中除了默认的全功能性副本之外，还有一种只读型副本，只读型副本的名称为 READONLY，简称 R，区别于全功能副本，只读副本提供读的能力，不提供写的能力，只能作为日志流的 Follower 副本，不参与选举及日志的投票，不能当选为日志流的 Leader 副本。
利用只读副本，我们就可以专门再配置一个zone，只放只读型副本，专门提供给OLAP分析计算类请求，并且只读副本出现故障，并不会影响主集群服务。

**设置条件：**

1. 设置弱一致性读 OBProxy：obproxy_read_consistency = 1;
2. 配置只读型副本
3. 设置LDC策略，OBProxy 和 OBServer 绑定
4. 配置了FOLLOWER_FIRST

**路由策略：**

1. 主集群正常提供服务，AP类请求，走独立的OBProxy，访问只读型副本；

**优缺点：**

1. 优点：OLAP与OLTP完全隔离，互相不受任何影响；
2. 缺点：需要更多的资源来提供给只读型副本。

![image.png](/img/operation_maintenance/how_to_split_read_write/e.png)

以上是几种比较典型的读写分离方案，用户还可以根据自己情况，灵活配置。
## **大查询策略**
除此之外，在内核层面，OceanBase 还会对大查询进行资源限制，减少大查询对小查询的资源占用。
配置大查询的参数为 large_query_threshold，超过这个参数设置的阈值，则认为是大查询

| **属性** | **描述** |
| --- | --- |
| 参数类型 | 时间类型 |
| 默认值 | 5s |
| 取值范围 | [1ms, +∞) |
| 是否重启 OBServer 节点生效 | 否 |

如果系统中同时运行着大查询和小查询，OceanBase 数据库会将一部分 CPU 资源分配给大查询，并通过配置参数 large_query_worker_percentage（默认值为 30%）来限制执行大查询最多可以使用的租户活跃工作线程数。

| **属性** | **描述** |
| --- | --- |
| 参数类型 | 双精度浮点数 |
| 默认值 | 30 |
| 取值范围 | [0, 100] |
| 是否重启 OBServer 节点生效 | 否 |

OceanBase 数据库通过限制大查询能使用的租户活跃工作线程数来约束大查询最多能够使用的 CPU 资源，以此来保证系统还会有足够的 CPU 资源来执行 OLTP（例如，交易型的小事务）负载。通过这样的方式来保证对响应时间比较敏感的 OLTP 负载能够得到足够多的 CPU 资源尽快地被执行。另外需要注意的是，虽然 OceanBase 数据库可以做到大查询和 OLTP 资源的分配，large_query_threshold 参数也应设置在一个在合理的范围内，不应该设置成为一个过大的值。否则大查询很容易抢占系统的 CPU 资源而挤进而引发 OLTP 响应过慢甚至队列堆积的问题。


