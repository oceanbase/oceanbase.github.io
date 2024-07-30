---
title: 节点替换或下线
weight: 4
---
# **节点替换或下线**

## **OBServer**

OBServer 替换将提供三种场景：
  - 场景一：OBServer 所在服务器故障，需要重新安装系统，但是没有空闲的机器补充，后续初始化完需要将这台机器加入到集群，补齐副本。
  - 场景二：OBServer 所在服务器故障，可以补充空闲的机器；
  - 场景三：BServer 所在服务器存在已知问题（此时还未故障），需要用正常的机器替换掉。

> **注意**
>
> 新增节点操作可以参照 [扩缩容](./scale_in_out.md)，节点数量按需添加。如果IP、配置不变，那么部署完成后直接启动就可以了。
>
> 如果可以使用 OCP 来接管，推荐使用 OCP 直接进行添加/替换节点操作。
>
> 如下操作都是在 sys 租户下进行。


### **场景一：服务器故障并且后续需要复用&补齐副本**

1. 缩短永久下线时间，让集群主动将节点永久下线（这时候如果有可用的 OBServer 会自动补齐副本，该场景默认不会有）

   ```sql
   alter system set server_permanent_offline_time='20s';
   ```
2. 确认节点已经永久下线

   ```sql
   select * from DBA_OB_ROOTSERVICE_EVENT_HISTORY where event like "%permanent_offline%" order by 1 desc limit 10;
   ```

3. 观察日志流和副本是否已经没有该节点的信息

   ```sql
   select SVR_IP,ROLE,count(*) from CDB_OB_TABLE_LOCATIONS group by SVR_IP,ROLE;

   select SVR_IP,ROLE,count(*) from CDB_OB_LS_LOCATIONS group by SVR_IP,ROLE;
   ```

4. 等待机器维护完成，并完成前置工作（admin用户、目录、授权等）

5. 重新部署 OBserver 并加入到集群

6. 登录集群观察副本情况，正常情况下副本会自动补齐。

   ```sql
   select SVR_IP,ROLE,count(*) from CDB_OB_TABLE_LOCATIONS group by SVR_IP,ROLE;

   select SVR_IP,ROLE,count(*) from CDB_OB_LS_LOCATIONS group by SVR_IP,ROLE;
   ```

7. 将 server_permanent_offline_time 恢复

   ```sql
   alter system set server_permanent_offline_time='3600s';
   ```

### **场景二：服务器故障并且补充新的节点**

1. 缩短永久下线时间，让集群主动将节点永久下线（这时候如果有可用的observer会自动补齐副本，该场景默认不会有）

   ```sql
   alter system set server_permanent_offline_time='20s';
   ```

2. 确认节点已经永久下线

   ```sql
   select * from DBA_OB_ROOTSERVICE_EVENT_HISTORY where event like "%permanent_offline%" order by 1 desc limit 10;
   ```

3. 观察日志流和副本是否已经没有该节点的信息

   ```sql
   select SVR_IP,ROLE,count(*) from CDB_OB_TABLE_LOCATIONS group by SVR_IP,ROLE;

   select SVR_IP,ROLE,count(*) from CDB_OB_LS_LOCATIONS group by SVR_IP,ROLE;
   ```

4. 新增节点并启动服务

5. 将节点添加到集群中

   ```sql
   alter system add server 'xx.xx.xx.xx:2882' zone 'zone1';
   ```

6. 登录集群观察副本情况，确认已经没有故障节点，并且新节点已经在补齐副本和日志流

   ```sql
   select SVR_IP,ROLE,count(*) from CDB_OB_TABLE_LOCATIONS group by SVR_IP,ROLE;

   select SVR_IP,ROLE,count(*) from CDB_OB_LS_LOCATIONS group by SVR_IP,ROLE;
   ```

7. 删除旧的节点

   ```sql
   alter system delete server 'xx.xx.xx.xx:2882';
   ```

8. 将 server_permanent_offline_time 恢复

   ```sql
   alter system set server_permanent_offline_time='3600s';
   ```

### **场景三：服务器存在已知问题（此时还未故障），用正常的机器替换**

1. 新增节点并启动服务

2. 将节点加到集群

   ```sql
   alter system add server 'xx.xx.xx.xx:2882' zone 'zone1';
   ```

3. 确认集群节点信息

   ```sql
   SELECT * FROM oceanbase.DBA_OB_SERVERS;
   ```

4. 临时关闭 rebalance，否则租户会自动调度均衡

   ```sql
   alter system set enable_rebalance=False;
   ```

5. 根据节点 IP 查询待替换的节点的 Unit 列表。语句如下：

   ```sql
   SELECT  unit_id FROM  oceanbase.DBA_OB_UNITS WHERE SVR_IP = 'xx.xx.xx.xx';
   ```

   其中，svr_ip 需要根据实际情况填写待替换节点的 IP 地址。

6. 提交 Unit 迁移任务，将旧节点上的 Unit 迁移到新增的同 Zone 其他节点上。

   ```sql
   ALTER SYSTEM MIGRATE UNIT unit_id DESTINATION 'xx.xx.xx.xx:2882';
   ```

   其中，svr_ip 为新增节点的 IP 地址。

   每条命令仅支持迁移一个 Unit，多个 Unit 需要执行多次该命令。

7. 确认 Unit 的迁移进度

   ```sql
   # 查看迁移状态
   SELECT * FROM oceanbase.DBA_OB_UNIT_JOBS WHERE JOB_TYPE = 'MIGRATE_UNIT';
   
   # 如果 MIGRATE_FROM_SVR_IP和MIGRATE_FROM_SVR_PORT为空，则迁移完成
   SELECT * FROM  oceanbase.DBA_OB_UNITS WHERE SVR_IP = 'xx.xx.xx.xx';
   ```

8. 删除旧节点

   ```sql
   ALTER SYSTEM DELETE SERVER 'xx.xx.xx.xx:2882' ZONE = 'zone1';
   ```

9. 确认旧节点是否删除成功。

   ```sql
   SELECT * FROM oceanbase.DBA_OB_SERVERS;
   ```

   如果列表中已经查询不到旧节点信息，则表示删除成功。如果列表中仍然有该节点，且该节点的状态为 DELETING，则表示该节点仍然在删除状态中。

10. 恢复 rebalance。

      ```sql
      alter system set enable_rebalance=True;
      ```

## **Prometheus**

重新部署一个 Prometheus，让其接管这个集群，并将当前 Prometheus下线掉。不过历史的监控数据可能将无法查看。

## **OBAgent**

1. 修改 Prometheus 的配置文件，并将对应的 OBAgent 节点剔除

   类似于 /usr/local/prometheus-2.37.8.linux-amd64/prometheus_config/prometheus.yaml，根据实际情况来

2. 重启 Prometheus

   ```bash
   systemctl restart Prometheus
   ```

## **OBProxy**

待补充，敬请期待。

## **OCP**

待补充，敬请期待。
