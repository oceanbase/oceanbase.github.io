---
title: 集群常用SQL
weight: 3
---
# **集群状态常用 SQL**

- 查看集群中各 OBServer 节点状态、启动时间、版本等

  ```sql
  select * from DBA_OB_SERVERS;
  ```

- 查看各个 Zone 状态、IDC、Region、TYPE 等信息

  ```sql
  select * from DBA_OB_ZONES;
  ```

  ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/65656351/1684296013159-3f43260f-756c-4d58-bee5-d2d8cde8327e.png#clientId=uab26b267-0ee0-4&from=paste&height=136&id=u271a5307&originHeight=272&originWidth=1526&originalType=binary&ratio=2&rotation=0&showTitle=false&size=61376&status=done&style=none&taskId=uacdcf21f-4801-47a4-b253-da789f62cf3&title=&width=763)

- 查看数据库版本

  ```sql
  show variables like 'version_comment';
  ```

  ![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2023/png/65656351/1684295609226-259e79a9-ef3b-451f-9087-a460103e174a.png#clientId=uab26b267-0ee0-4&from=paste&height=104&id=u4ad3eb19&originHeight=208&originWidth=1890&originalType=binary&ratio=2&rotation=0&showTitle=false&size=34240&status=done&style=none&taskId=ubbeb30c4-8673-40fa-b428-f9f7acf3d8c&title=&width=945)

- 查看 RootService 主节点

  ```sql
  select svr_ip as RootService from DBA_OB_SERVERS where with_rootserver='yes';
  ```
