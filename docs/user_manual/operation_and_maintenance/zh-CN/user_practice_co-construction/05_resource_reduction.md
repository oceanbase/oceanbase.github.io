---
title: OceanBase 空间缩容实践
weight: 5
---
> 本文作者：庆涛（OceanBase 社区论坛账号：@obpilot）

0B 区别于其他数据库的一个特点是它的多租户和资源管理技术。这点很多人在初次部署 OB 时就发现了。比如说机器资源不够的时候，OB 启动会失败。OB 启动后，没有业务数据的情况下就占用磁盘大量空间等。这其中的细节原理在以前很多关于 OB 部署的文章里都有解释。

本文就解决一个问题，如何对 OB 的数据文件进行缩容。

## 1. OB 空间资源分配原理和实践
在对数据文件进行缩容之前，首先要了解 OB 的空间资源分配原理。

OB 架构独特之一是多租户，设计思想是在多台无共享架构下的 PC 服务器上运行 OB 进程,攫取主机的主要资源组件为一个数据库资源池（集群），然后从集群里分配自定义的资源以租户（实例）形式给用户使用。所以 OB 部署后即使没有业务也会占用大量内存和磁盘空间。内存资源的使用以前已经介绍过原理，本文主要介绍空间资源。OB 进程（名字：`observer`）对空间资源的使用是分为三部分：运行日志、数据文件、事务日志文件。

### 1.1 OB 运行日志
默认在 OB 软件安装目录下的 `log`里。企业版默认路径是：`/home/admin/oceanbase/log` 。OB 进程的运行日志（`observer.log`、`rootservice.log`）内容非常多，根据日志级别可以调整。日志内容主要是面向 OB 内核开发的，对普通用户可读性很差，还占用空间。生产环境建议为此预留 `300+G` 的空间，不然出问题的时候查不到日志（被清理了）就很麻烦。随着 OB 版本的迭代，OB 逐步在丰富这个日志文件的管理策略。除了可以控制日志级别、日志数量，近期版本还可以对过往日志进行压缩（压缩比高达`10:1`）。

![示例图片](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/05_resource_reduction/001.png)


上面是一些关键配置供参考，有兴趣的可以查阅官网。可以在进程初始化时指定，也可以事后修改。

### 1.2 OB 数据文件
OB 进程只有一个数据文件，文件的大小就看你给的文件系统有多大空间，从几个 G 到几十 T 都行。OB 早期研发设计的时候觉得一个文件编程方便。现在看来对运维也非常方便。不管你的 OB 是怎么部署，OB 在每个节点上的进程只有一个数据文件。这个文件的大小通过三个参数控制：

+ `datafile_size`:数据文件初始大小。  
如果你不希望 OB 一开始就占用很多空间，这个值就不要太大。生产可以 `100G` 起步。
+ `datafile_disk_percentage`:数据文件初始大小占文件系统可用空间比例。  
早期 OB 版本这个参数默认 90% 。这个参数跟上面参数二选一。如果两个参数都不设置（为0），那么 OB 又取了 90% 的默认值。这就是为什么大部分人部署 OB 后空间使用很大导致剩余空间不足。
+ `datafile_next`：数据文件增长一次增长的大小，默认是 0 表示不增长。这个还是要设置的，一般设置为 1G 就行。
+ `datafile_maxsize`：数据文件最大大小，数据文件可以增长，但不能无限制增长，一定要设置一个文件系统能接受的大小。这个参数可以变大或变小，但是不能比当前的数据文件大小要小。也就是说，OB 的数据文件实际大小只能变大不能变小。

最佳实践：OB 进程启动的时候设置 `datafile_size` 初始大小（如 10G10G），设置数据文件最大大小 `datafile_maxsize`（如 500G~20T，在文件系统空间可以接受的范围内）。当 OB 数据文件增长后，就不能通过调整数据文件参数来缩小其大小，后面会介绍如何对数据文件进行缩容。

缩容之前也需要计算一下当前数据文件中实际使用空间大小，可以在 OCP 的集群的资源管理页面里查看已使用的日志空间和数据文件空间，或者用下面 SQL 查询也可以。

```sql
select a.svr_ip, 
	round(sum(a.data_disk_in_use)/1024/1024/1024 ) data_disk_use_G, 
    round(sum(a.log_disk_in_use)/1024/1024/1024 ) log_disk_use_G 
from oceanbase.__all_virtual_unit a,oceanbase.dba_ob_tenants b 
where a.tenant_id=b.tenant_id 
group by svr_ip ;
```

### 1.3 OB 事务日志文件
OB 的其他日志文件还有`slog`和`clog`。`slog` 是数据文件的索引，而`clog`是跟 OB 的事务有关，也是传统意义上的`redolog`。OB 从1.x~3.x，所有租户的事务日志是混合在一起的，OB 4.x 推出日志流 LS 功能后，事务日志按租户存放，并且日志流的粒度从以前的分区（分区组）扩大到近似租户粒度（每个租户下默认内部表一个日志流，业务表一个日志流）。日志流起始可以理解为 OB 数据同步方向的最小单位。所以当 OB 将主可用区（`primary_zone`）从单`zone`变更为多`zone`后，就会多出 1-2 个日志流。当使用复制表后，还会额外多出一个日志流（复制表的同步策略不是 `Paxos` 多数派同步，而是全同步）。

OB 4.x 后 OB 进程总的事务日志空间是通过下面两个参数控制：

+ `log_disk_size` : 进程初始化后会预分配的日志目录空间大小（可以立即为日志资源池）。具体形式就是目录下`/data/log1/obdemo/clog/log_pool`有很多固定大小（64MB）的日志文件。
+ `log_disk_percentage` : 作用跟上面一样，只不过是按文件系统可用空间比例控制的。

OB 在创建租户的时候，租户要指定 `log_disk_size`，其大小就是从 OB 进程的日志资源池（`log_pool`目录）里分配。如果进程的日志空间资源不足，租户资源池就分配报错。OB 租户在拿到确定的日志空间后，就在租户内部循环利用这个空间。OB 的 `clog` 内部使用可以循环覆盖。不过也存在一些场景下事务的 `clog` 由于还被需要不能被覆盖。这个原理很好理解，场景却非常多。这里就不列举了。一般来说尽量减少大事务、OB 每日合并和备份要正常、设置适当的数据文件转储参数。

![示例图片](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/05_resource_reduction/002.png)

OB 租户的事务日志空间是可以在线调整的（变大或变小）。变小的时候，租户会将这部分空间归还给集群的日志空间池子。变小的前提也是对应的`clog`可以释放掉。在某些特殊场景下当租户某些事务的`clog`不能释放时，这个变小会失败。最佳实践：租户事务日志空间的大小建议为租户内存资源的 2~4 倍（内存越大，倍数可以越小），这样租户的事务很繁忙的时候瓶颈不会出在 `clog` 空间上。这个空间不要太小（比如说十几 G，这个就有点抠门了。）

### 1.4 磁盘存储空间分配实践
OB 部署的时候，上面三个 OB 空间建议使用独立的文件系统目录。有的时候交付会说用不同的盘，盘最终也是要格式化为文件系统并挂载。所以这里说的是独立的文件系统。

目录最佳实践如下：

```bash
/home/   -- 不同的盘或者跟 OS 一起的盘
     |-  admin/oceanbase/log         -- 运行日志空间
     |-  admin/oceanbase/store/obdemo/
                                 |- sstable -> /data/l/obdemo/sstable     -- 数据文件空间
                                 |- slog -> /data/log1/obdemo/slog
                                 |- clog -> /data/log1/obdemo/clog        -- 事务日志空间
/data/1        --- 不同的盘
/data/log1     -- 不同的盘
```

如果数据文件跟事务日志文件共用一个文件系统，在空间的分配策略上要先考虑事务日志文件，然后约束数据文件的最大大小，确保数据文件空间的增长不会导致事务日志文件无法分配必要的空间。

通常建议前面提到的每个跟文件大小有关的参数都建议明确设置，不要使用默认值。但是如果 OB 机器配置很好（磁盘容量很大），运维的重点根本不在这点磁盘空间上，那可以都使用默认值。

## 2 OB 数据文件缩容
如果一开始没有设置好参数，导致数据文件很大了，要缩容这个数据文件的方法就是重建这个节点。

通常通过 OCP 也可以重建一个节点。这个任务会有点长（连软件一并重装了，启动参数沿用集群当前参数）。如果 OCP 任务因为别的原因出错了，OCP 的流程就无法走下去，此时就需要手动重建 OB 节点。

手动快速重建三副本架构 OB 集群的一个节点（五副本同理，不适合单副本架构）。利用 OB 部署最基本的原理。即使出错也是能快速应对。这个基本上是三副本 OB 集群里重建某个 OB 节点的最快速的方法。不过，这种方法也有一定操作风险，重建节点的时候三副本缺一个，不再有高可用能力。如果集群架构是 `2-2-2` ，操作起来会更稳妥一些，但是这个会触发 OB 内部两次数据迁移的过程。如果是集群架构是 `1-1-1`，则操作期间不能出现其他节点故障。

所以，这个 OB 节点数据文件缩容的方法属于高级技巧，谨慎使用。在执行之前也建议先回顾一下 OB 集群的手动部署过程和原理。这里就不再重复。

接下来就是 OB 数据文件缩容的步骤。

### 2.1 OB 集群合并
为了降低操作风险，做之前先对整个 OB 集群发起一次合并。这一步是可选的操作，建议做。

```sql
mysql -h10.0.0.65 -uroot@sys#obdemo -P2883 -p -c -A oceanbase
alter system major freeze tenant=all;
```

然后等集群所有租户合并完毕。

### 2.2 OB 节点下线
首先要让这个 OB 节点下线（OFFLINE）。这里不需要对 OB 集群去 `stop zone`，而是将 OB 集群节点默认的下线判定时间参数 `server_permanent_offline_time` 从默认值 `3600s` 改为 `300s` 。当然修改的时候只改这个节点的参数。方法如下。

```bash
mysql -h10.0.0.65 -uroot@sys#obdemo -P2883 -p -c -A oceanbase
alter system set server_permanent_offline_time='300s' server = '10.0.0.65:2882';
```

然后停掉这个节点进程。

```bash
kill -9 `pidof observer`
```

5 分钟后， OB 集群就会判定这个节点永久下线，开始从集群里删除节点上对应的副本登记信息。通过观察 OB 集群的事件表 __all_rootservice_event_history 可以确认这个过程。

```sql
select gmt_create ,module,event,name1,value1,name2,value2,name3,value3,name4,value4 
from oceanbase.__all_rootservice_event_history
where 1=1
 and module in ('disaster_recovery') -- and event like 'disaster_recovery%'
order by gmt_create  desc limit 500;
```

结果记录里会出现下列事件：

+ `disaster_recovery_start`
+ `start_remove_ls_paxos_replica`
+ `finish_remove_ls_paxos_replica`

### 2.3 清理 OB 相关目录
这一步就非常重要。我们的目的只是重建数据文件，不是重装 OB 软件。所以要保留 OB 软件介质，软件相关目录，以及 OB 进程原来的启动参数文件 `etc/observer.config.bin` ，清除掉上次运行文件、运行日志文件等（清理干净，否则影响后面进程启动）。

具体方法如下：

```bash
cd /home/admin/oceanbase
/bin/rm -rf audit/* run/* log/*
/bin/rm -rf /data/{1,log1}/obdemo/*/*
```

这里删除的路径非常有讲究,如果你少写一个 `*` 可能导致路径多删除了。那么你就要按照前面手动部署的方法补充好数据文件目录和事务日志目录的拓扑。所以，事先要记录一个正常的 OB 节点的数据文件和事务日志文件布局。这里是要保持目录结构，删除目录下的实际文件。如果你不确认，就将 `/bin/rm -rf` 替换为 `/bin/rm -ri` 一一确认删除的文件。

### 2.4 再次启动 OB 进程
此时，只需要启动 OB 进程，由于前面保留了上次启动参数，这次就不用指定完整的启动参数（如果参数文件被删除了，那就要指定完整的启动参数，具体参考手动部署时拉起 OB 进程的参数并且将参数改为实际 OB 集群的参数。具体的参数就要去查看其他 OB 节点的参数文件了）。

这里一定要修改的参数是重新指定数据文件的初始大小参数 `datafile_size`。这个才是我们重建 OB 节点的目的。这里指定的初始大小尽量能够容纳当前集群里的业务数据量，否则 OB 进程还是会自动扩展数据文件大小。当然也可以重新制定参数  `datafile_maxsize`

下面启动示例：

```bash
su - admin
cd oceanbase && bin/observer -o "datafile_size=100G,datafile_next=1G,datafile_maxsize=1000G"
```

很快用 `df -h` 命令就能看到数据文件目录已使用空间就变为 100G 了。

### 2.5 等待 OB 自动补齐数据
上面只是 OB 进程启动了，OB 还要在节点上自动补齐数据。这个过程时间的长短就看节点要承载的数据量有多大了。补数据的原理是 OB 发现三副本数据不全，根据租户的 `locality` 设置自动补齐当前节点的数据，数据复制来源是另外一个备副本。如果是 `2-2-2` 架构的集群，则是 OB 的负载均衡机制发挥作用。

可以通过观察 OB 集群的事件表来观察 OB 补齐副本数据的过程。

```bash
select gmt_create ,module,event,name1,value1,name2,value2,name3,value3,name4,value4 
from oceanbase.__all_rootservice_event_history
where 1=1
 and module in ('disaster_recovery') -- and event like 'disaster_recovery%'
order by gmt_create  desc limit 500;
```

此时会看到日志流副本补充恢复的记录。事件包含：

+ `start_add_ls_replica`
+ `finish_add_ls_replica`
+ `disaster_recovery_finish`

恢复记录有租户级别的和全局级别的。一定要等到全局级别的恢复成功记录。恢复的过程中，会从其他备副本节点拉取数据，网络流量会比较大（默认网络占用比例由集群参数 `sys_bkgd_net_percentage` 设置），磁盘写吞吐也会比较高。

在上面的等待过程中，还有个关键步骤就是将永久离线时间参数改回去。不然，以后节点正常重启如果耗时过久，也会触发 OB 清理副本和重建副本的动作。

```sql
alter system set server_permanent_offline_time='3600s' server = '10.0.0.65:2882';
```

### 2.6 数据验证
注意： 一定要准确判断节点重建成功这个事件。特别是当你的目的是要挨个将三副本所有节点的数据文件缩容。如果一个节点副本没有重建完成 就开始做第二个节点了，将会人为导致多数派故障，也就没有了高可用能力，并且丢失了集群全部或部分数据。

所以，下面这个方法最终也要辅助判断一下。将业务租户的主可用区（`primary_zone`）都切换到重建节点所在节点上，如果查看日志流 LS 的主副本也在该节点上保持不变了，则说明 OB 在该节点上重建成功。

```sql
select MODIFY_TIME, tenant_id, ls_id, svr_ip,zone,role,MEMBER_LIST,PAXOS_REPLICA_NUMBER,REPLICA_TYPE,REBUILD 
from CDB_OB_LS_LOCATIONS where role in ('LEADER');
```

还有个办法就是租户数据切换到重建节点后，验证一下业务读写正常。

至此，一个 OB 节点的数据文件缩容成功。然后就可以做下一个节点。整个过程不用依赖 OCP 。

## 3. 总结
上面就是 OB 数据文件缩容的原理和步骤，只适合三副本（以及以上）的 OB 集群，其原理是重建节点的数据。在重新拉起 OB 进程时重新指定缩容后的数据文件大小。数据修复的过程是 OB 内部自动的。数据文件缩容后，如果用户还要缩容文件系统，那就是操作系统和 LVM 的知识了。

更多阅读参考：

+ [OB 4.2 手动部署实践](https://mp.weixin.qq.com/s/Zs0qwXKUT78JISxpuzXgbQ)
+ [OB 4.2 资源隔离原理](https://mp.weixin.qq.com/s/VwOEot4UGMWA899j13YAUQ)

