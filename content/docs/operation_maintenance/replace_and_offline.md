---
title: 节点替换或下线
weight: 4
---
# **节点替换或下线**

## **OBServer**

### **添加节点**

1. 新建新增节点的配置文件

   新增节点配置建议跟集群配置保持一致，防止资源量以及性能跟其他节点不同，可以参照 [部署 OceanBase/配置文件](../deploy_oceanbase/configuration_file.md)。

2. OBD 部署新节点

   ```bash
   obd cluster deploy new_observer -c add_observer.yaml
   ```

3. 启动节点

   ```bash
   obd cluster start new_observer
   ```

4. 将节点添加到集群

   通过系统租户登录到集群，并执行如下命令

   ```sql
   alter system add server 'xxx.xxx.xxx.xxx:2882' zone 'zone1';
   ```

5. 确认集群节点信息

   ```sql
   # 集群内
   select * from __all_server;
   
   # OBD查询
   obd cluster display cluster_name
   ```

### **Unit 迁移**

将旧节点上的 Unit 迁移到新节点。更多关于 Unit 迁移的操作及说明，请参见 [Unit 迁移](https://www.oceanbase.com/docs/enterprise-oceanbase-database-cn-10000000001700597)。

1. 查询 oceanbase.DBA_OB_SERVERS 视图获取待替换节点的相关信息。查询示例如下：

   ```sql
   obclient [(none)]> SELECT * FROM oceanbase.DBA_OB_SERVERS;
   ```

2. 根据节点 IP 查询待替换的节点的 Unit 列表。语句如下：

   ```sql
   obclient [(none)]> SELECT  unit_id FROM  oceanbase.DBA_OB_UNITS WHERE SVR_IP = 'svr_ip';
   ```

   其中，svr_ip 需要根据实际情况填写待替换节点的 IP 地址。

3. 提交 Unit 迁移任务，将旧节点上的 Unit 迁移到同 Zone 的其他节点上。语句如下：

   ```sql
   obclient [(none)]> ALTER SYSTEM MIGRATE UNIT unit_id DESTINATION 'svr_ip:svr_port';
   ```

   相关参数说明如下：

   - unit_id：待迁移的 Unit 的 unit_id。

   - svr_ip:svr_port：新节点的 IP 地址和 RPC 端口号，端口号默认为 2882。

   每条命令仅支持迁移一个 Unit，多个 Unit 需要执行多次该命令。

4. 查询 oceanbase.DBA_OB_UNIT_JOBS 视图，确认 Unit 的迁移进度。

   ```sql
   obclient [(none)]> SELECT * FROM oceanbase.DBA_OB_UNIT_JOBS WHERE JOB_TYPE = 'MIGRATE_UNIT';
   +--------+--------------+------------+-------------+----------+----------------------------   +----------------------------+-----------+---------+----------+------------+------------+-------------+
   | JOB_ID | JOB_TYPE     | JOB_STATUS | RESULT_CODE | PROGRESS | START_TIME                 |    MODIFY_TIME                | TENANT_ID | UNIT_ID | SQL_TEXT | EXTRA_INFO | RS_SVR_IP  | RS_SVR_PORT |
   +--------+--------------+------------+-------------+----------+----------------------------   +----------------------------+-----------+---------+----------+------------+------------+-------------+
   |      4 | MIGRATE_UNIT | INPROGRESS |        NULL |        0 | 2023-01-04 17:22:02.208219 | 2023-01-04 17:22:02.   208219 |      1004 |    1006 | NULL     | NULL       | x.x.x.x    |        2882 |
   +--------+--------------+------------+-------------+----------+----------------------------   +----------------------------+-----------+---------+----------+------------+------------+-------------+
   ```

   如果查询结果为空，则表示 Unit 迁移完成。

## **删除旧节点**

等待旧节点上的所有 Unit 迁移完成后，将旧节点删除。具体操作如下：

1. 执行以下命令，删除旧节点。语句如下：

   ```sql
   obclient [(none)]> ALTER SYSTEM DELETE SERVER 'svr_ip:svr_port' [,'svr_ip:svr_port'...] [ZONE [=] 'zone_name']
   ```

   相关参数说明如下：

   - svr_ip：表示待删除的旧节点的 IP。

   - port：表示待删除的旧节点的 RPC 端口，默认为 2882。

   - zone_name：待删除的旧节点所属的 Zone。

2. 待操作结束后，查询 oceanbase.DBA_OB_SERVERS 视图，确认旧节点是否删除成功。

   ```sql
   obclient [(none)]> SELECT * FROM oceanbase.DBA_OB_SERVERS;
   ```

   如果列表中已经查询不到旧节点信息，则表示删除成功。如果列表中仍然有该节点，且该节点的状态为 DELETING，则表示该节点仍然在删除状态中。

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
