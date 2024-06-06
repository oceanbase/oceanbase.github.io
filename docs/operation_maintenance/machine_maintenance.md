---
title: 机器维护
weight: 3
---
# **机器维护**

本文介绍如何对机器进行临时停机维护。

## **OBServer 节点停机维护**

### **操作步骤**

重启节点的主要流程为：停止服务 -> 转储 -> 关闭进程 -> 启动进程 -> 启动服务。

1. 根据预估维护时间调整 server_permanent_offline_time

   ```sql
   alter system server_permanent_offline_time='2h';
   ```

   在 OceanBase 数据库中，server_permanent_offline_time 配置项的名称为“永久下线时长”，是用来控制集群中某个节点的不可用时长，超过设置的时长后，OceanBase 数据库会将其踢出成员列表。

2. 使用 root 用户登录到集群的 sys 租户。

   ```shell
   obclient -h10.xx.xx.xx -P2883 -uroot@sys -p -A
   ```

3. 执行以下命令，进行节点隔离。

   > **说明**
   >
   > 如果可以接受节点停止服务，也可以跳过本步骤。

   ```sql
   obclient [(none)]> ALTER SYSTEM STOP SERVER 'svr_ip:svr_port';
   ```

   端口默认为 2882。

   执行成功后，可以查询 oceanbase.DBA_OB_SERVERS 视图中该 Server 的 STATUS 字段，可以看到字段值仍为 ACTIVE 不变，但 STOP_TIME 字段的值由 NULL 变为停止服务的时间点。

   STOP SERVER 命令在多副本架构的基础上能够达到业务无损的重启效果，STOP SERVER 命令执行以下逻辑：

   - 将待重启节点上的 Leader 全部切走，并保证除了重启节点以外的其他节点上的副本满足多数派。

   - 在 Root Service 上将待重启节点标记为 stopped（节点状态为 ACTIVE 状态且 stop_time 字段大于 0），客户端识别后，不会将业务请求路由到该节点。

   最终成功 Stop Server 后，重启节点不会引起无主选举及客户端报错等问题，对业务流量完全透明。

4. 执行以下命令，对待重启的节点进行转储操作，以便缩短重启后回放 Redo Log 的时间，加速重启。

   ```sql
   obclient [(none)]> ALTER SYSTEM MINOR FREEZE SERVER = ('svr_ip:svr_port');
   ```

5. 确认是否转储成功，需要等待转储结束方可执行下一步操作。

   ```sql
   SELECT * FROM oceanbase.GV$OB_TABLET_COMPACTION_PROGRESS WHERE TYPE='MINI_MERGE'\G
   ```

6. 停止 observer 进程。

   1. 使用 admin 用户登录待停止进程的节点所在的机器。

   2. 通过命令行工具进入 /home/admin/oceanbase/bin 目录。

   3. 停止 observer 进程。

   4. 执行以下命令，确认进程是否已停止。

      ```bash
      kill `pidof observer`
      ps -ef | grep observer | grep -v grep
      ```

7. （可选）如果需要维修机器，在本步骤对机器进行短暂的维修。

8. 启动 observer 进程。

   1. 使用 admin 用户登录待启动进程的节点所在的机器。

   2. 启动 observer 进程

      ```bash
      [admin@xxx oceanbase]$ cd /home/admin/oceanbase  &&  ./bin/observer
      ```

9. 执行以下命令，启动节点服务。

   ```shell
   obclient [(none)]> ALTER SYSTEM START SERVER 'svr_ip:svr_port';
   ```

   执行成功后，可以查询 oceanbase.DBA_OB_SERVERS 视图中的 START_SERVICE_TIME 字段，该字段表示节点启动服务的时间。如果该值为 NULL，则表示该节点的服务还没有启动。

## **OBProxy 停机维护**

OceanBase Database Proxy（简称 ODP）是 OceanBase 数据库专用的代理服务器，正常情况下单节点重启对业务没有影响。

### **停止 obproxy 进程**

1. 使用 admin 用户登录到 obproxy 进程所在的机器。

2. 执行以下命令，查看 obproxy 进程的进程号。

   ```shell
   $ps -ef | grep obproxy
   admin     37360      0  6 11:35 ?        00:00:09 bin/obproxy
   admin     43055  36750  0 11:37 pts/10   00:00:00 grep --color=auto obproxy
   root      85623      1  0 Jun02 ?        00:15:19 /home/admin/ocp_agent/obagent/obstat2 -o http://xx.xx.xx.xx:81 -c test323 __obproxy__ -f 20
   ```

   示例中查询到 ODP 的进程号为 37360。

3. 执行如下命令，根据查询到的进程号，停止 obproxy 进程。

   ```shell
   $kill -9 37360
   ```

4. 停止成功后，再次执行以下命令，确认 obproxy 进程已不存在。

   ```shell
   $ps -ef|grep obproxy
   ```

### **启动 obproxy 进程**

#### **背景信息**

支持通过以下两种方式来启动 obproxy 进程：

- 在启动命令中指定 -r 参数来指定 OceanBase 集群的 RootServer 信息。该启动方式不需要额外配置，一般用于开发调试阶段。

- 在启动命令中指定 obproxy_config_server_url 参数项来查询获取 OceanBase 集群的 RootServer 信息。该方式需要配置 obproxy_config_server_url，故会依赖 Config Server 的启动，建议使用该方式启动 ODP。

#### **操作步骤**

1. 使用 admin 用户登录到待启动的 ODP 所在的机器。

2. 进入 ODP 的安装目录。

3. 执行以下命令，启动 ODP。

   - 在启动命令中指定 -r 参数命令如下：

     ```shell
     $./bin/obproxy -p6789 -r'ip:port' -e -n appname -o obproxy_config_server_url='' -c cluster_name
     ```

     示例：

     ```bash
     $./bin/obproxy -r'10.10.10.1:26506;10.10.10.2:26506' -n test -c mycluster
     ```

   - 在启动命令中指定 obproxy_config_server_url 参数命令如下：

     ```shell
     $./bin/obproxy -p6789 -e -n appname -o obproxy_config_server_url='your_config_url'
     ```

     示例：

     ```bash
     $./bin/obproxy -n test -o obproxy_config_server_url='http://xx.xx.xx.xx:8877/obproxy_config'
     ```

4. 启动后，执行以下命令，查看 obproxy 进程是否存在。

   ```shell
   $ps -ef|grep obproxy
   ```

## **Prometheus**

可以直接重启，但是这段时间的监控告警会没办法发出。或者重新部署一个 Prometheus，让其接管这个集群，并将当前 Prometheus 下线掉。但是使用此方法后历史的监控数据可能就没办法查看了。

## **OBAgent**

OBAgent 是一个监控采集框架。OBAgent 支持推、拉两种数据采集模式，可以满足不同的应用场景。正常情况下停止机器的 OBAgent 会导致监控不到对应机器的信息，机器维护直接停就可以了，重启后恢复。

## **OCP**

待补充，敬请期待。
