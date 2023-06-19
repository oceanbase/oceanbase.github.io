---
title: 扩缩容
weight: 2
---
# **集群扩缩容**

本节介绍的是通过 OBD 手动扩缩容的方式，如果集群通过 OCP 管理，那么也可以直接在 OCP 上操作。

集群扩缩容包括两种，一种是节点，即扩容每个 Zone 内的 OBServer 的数量；还有一种是 Zone，即增减 Zone 的数量。两种操作都需要在 sys 租户下进行。

## **扩容**

### **扩容节点**

#### **场景**

本例从 1-1-1 的集群架构扩容到 2-2-2 的集群架构

#### **操作流程**

1. 新建新增节点的配置文件

   新增节点配置建议跟集群配置保持一致，防止资源量以及性能跟其他节点不同，可以参照 [部署 OceanBase/配置文件](../deploy_oceanbase/configuration_file.md)。

2. 使用 OBD 部署新节点

   ```bash
   obd cluster deploy new_observer -c add_observer.yaml
   ```

3. 启动节点

   ```bash
   obd cluster start new_observer
   ```

4. 将节点添加到集群

   使用 root 用户登录集群的 sys 租户，并执行如下命令。

   ```sql
   alter system add server 'xxx.xxx.x.xxx:2882' zone 'zone1';
   alter system add server 'xxx.xxx.x.xxx:2882' zone 'zone2';
   alter system add server 'xxx.xxx.x.xxx:2882' zone 'zone3';
   ```

5. 确认集群节点信息

   ```bash
   # 集群内通过如下 SQL 命令查询
   select * from __all_server;
   
   # OBD 查询
   obd cluster display cluster_name
   ```

6. 添加成功后，根据业务实际情况，调整租户的资源配置，即调大 UNIT_NUM。

   ```bash
   ALTER RESOURCE TENANT tenant1 UNIT_NUM 2; 
   ```

### **扩容 Zone**

#### **场景**

本例从 zone1,zone2,zone3 扩容为 zone1,zone2,zone3,zone4,zone5

#### **操作流程**

前面增加节点的操作跟扩容节点相同，需要注意的是zone需要变化

1. 添加 zone

   ```bash
   alter system add zone 'zone4' region 'sys_region';
   alter system start zone 'zone4';
   alter system add zone 'zone5' region 'sys_region';
   alter system start zone 'zone5';
   ```

2. 通过修改租户的 Locality 来增加副本。根据 Locality 的变更规则，每次只能增加一个 Zone 内的 Locality，Locality 的变更规则相关信息请参见官网 OceanBase 数据库文档 [Locality 概述](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699416)。

   ```sql
   obclient>ALTER TENANT tenant1 LOCALITY='F@zone1,F@zone2,F@zone3,F@zone4';
   
   obclient>ALTER TENANT tenant1 LOCALITY='F@zone1,F@zone2,F@zone3,F@zone4,F@zone5';
   ```

操作结束后，本次扩容完成。

## **缩容**

### **缩容 Zone**

#### **场景**

在进行集群的缩容操作前，需要确认集群中资源对当前负载有较多冗余，查看集群中资源的详细信息的相关操作请参见常用SQL。
本案例中的缩容是将集群中租户的 5 副本降为 3 副本的场景。

#### **操作步骤**

1. （可选）如果租户使用了 z4 或 z5 作为 Primary Zone，则需要修改该租户的 Primary Zone。

   ```sql
   obclient> ALTER TENANT tenant_name PRIMARY_ZONE='z1,z2,z3';
   ```

2. 通过修改租户 tenant1 的 Locality 来删除副本。根据 Locality 的变更规则，每次只能删除一个 Zone 内的 Locality，Locality 的变更规则相关信息请参见官网 OceanBase 数据库文档 [Locality 概述](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699416)。

   ```sql
   obclient>ALTER TENANT tenant1 LOCALITY='F@z1,F@z2,F@z3,F@z4';
   
   obclient>ALTER TENANT tenant1 LOCALITY='F@z1,F@z2,F@z3';
   ```

3. 执行以下命令，停止 z4、z5。

   ```sql
   obclient> ALTER SYSTEM STOP ZONE z4;
   
   obclient> ALTER SYSTEM STOP ZONE z5;
   ```

4. 缩小资源池 pool1 的 ZONE_LIST 范围，从而将 z4、z5 从资源池中移出。

   ```sql
   obclient> ALTER RESOURCE POOL pool1 ZONE_LIST=('z1','z2','z3');
   ```

5. 执行以下语句，从集群中删除 Zone 中的 OBServer 节点。

   > **注意**
   >
   > 本示例中，仅租户 tenant1 使用了 z4、z5 上的资源，在实际场景中，如果有其他租户也使用了 z4 或 z5，则还需要对这些租户也执   行一遍前面的步骤（步骤 2 ~ 步骤 5）。

   ```sql
   obclient> ALTER SYSTEM DELETE SERVER 'xxx.xxx.x.xx4:2882';
   
   obclient> ALTER SYSTEM DELETE SERVER 'xxx.xxx.x.xx5:2882';
   ```

   删除后，可以执行以下语句，确认列表中已查询不到这些 OBServer 节点，则表示删除成功。

   ```sql
   obclient> SELECT * FROM oceanbase.DBA_OB_SERVERS;
   ```

6. 确认 OBServer 节点删除成功后，执行以下语句，从集群中删除 Zone。

   ```sql
   obclient> ALTER SYSTEM DELETE ZONE z4;
   
   obclient> ALTER SYSTEM DELETE ZONE z5;
   ```

   删除后，可以执行如下语句，确认列表中已查询不到这些 Zone，则表示删除成功。结束后，本次缩容完成。

### **缩容节点**

#### **场景**

在进行集群的缩容操作前，需要确认集群中资源对当前负载有较多冗余，查看集群中资源的详细信息的相关操作请参见常用SQL。
该案例场景为当前集群中共包含 3 个可用区 z1、z2、z3，每个 Zone 内包含 2 个 OBServer 节点，将每个 Zone 缩容到 1 个 OBServer 节点。

#### **操作步骤**

1. 使用 root 用户登录集群的 sys 租户。

2. 执行以下命令，从集群中删除各 Zone 中的 OBServer 节点。

   > **注意**
   >
   > 由于当前版本暂不支持调小租户的 UNIT_NUM，该缩容方式仅适用于当前集群中 Unit 数量小于或等于计划删除 OBserver 节点后的单个 Zone 中的可用 OBserver 节点数量。例如，本示例中，如果租户 tenant1 的 UNIT_NUM 为 2，则删除各 Zone 中的 OBServer 时会失败。

   xxx.xxx.x.xx1、xxx.xxx.x.xx2、xxx.xxx.x.xx3 分别表示待删除的节点的 IP 地址。

   ```sql
   obclient> ALTER SYSTEM DELETE SERVER 'xxx.xxx.x.xx1:2882' ZONE='z1';
   obclient> ALTER SYSTEM DELETE SERVER 'xxx.xxx.x.xx2:2882' ZONE='z2';
   obclient> ALTER SYSTEM DELETE SERVER 'xxx.xxx.x.xx3:2882' ZONE='z3';
   ```

   删除后，可执行以下语句，确认列表中已查询不到这些 OBServer 节点则表示删除成功。

   ```sql
   obclient> SELECT * FROM oceanbase.DBA_OB_SERVERS;
   ```

## **租户资源的扩缩容**

租户资源的扩缩容也是包括两种，一种是增加租户的资源单元（unit）配置大小；另一种是增加租户的资源单元（unit）数量。两种操作均需在 sys 租户下进行操作。

### **前提条件**

在进行租户的扩容和缩容操作前，需要进行以下操作：

- 由于空闲的资源池会被计算为占用的资源，故在扩容前，如果有租户被删除，建议与租户对应的资源池也一并删除，以便释放资源。删除资源池的相关操作请参见官网 OceanBase 数据库文档 [删除资源池](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001701230)。

- 进行租户缩容前，建议进行一轮转储以便释放租户正在使用的内存。手动触发转储的相关操作请参见官网 OceanBase 数据库文档 [手动触发转储](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001701236)。

- 查看集群中资源的分配情况，了解集群中资源的使用情况。查看集群节点的资源总量和分配状态的相关操作请参见官网 OceanBase 数据库文档 [查看集群的资源信息](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001701028)。

### **通过 SQL 语句修改租户的资源单元配置**

在通过调大和调小租户资源单元的配置（unit_config）进行扩容和缩容时，有以下两种场景：

- 当前租户配置了独立的资源单元配置，可以直接修改租户的资源单元配置。

- 多个租户使用了相同的资源单元配置，需要切换租户的资源单元配置。

确认租户是否使用了独立的资源单元配置的操作如下：

1. 使用 root 用户登录集群的 sys 租户。

2. 执行以下语句，获取待操作的租户所属的资源配置 ID。

   ```sql
   obclient> SELECT a.TENANT_NAME, b.UNIT_CONFIG_ID  FROM oceanbase.DBA_OB_TENANTS a,oceanbase.   DBA_OB_RESOURCE_POOLS b WHERE b.TENANT_ID=a.TENANT_ID;
   +-------------+----------------+
   | TENANT_NAME | UNIT_CONFIG_ID |
   +-------------+----------------+
   | sys         |              1 |
   | MySQL       |           1002 |
   | Oracle      |           1004 |
   +-------------+----------------+
   3 rows in set
   ```

根据查询结果，如果当前租户对应的 UNIT_CONFIG_ID 与其他租户相同，则表示有多个租户使用了相同的资源单元配置；如果当前租户中对应的 UNIT_CONFIG_ID 与其他租户均不相同，则表示该租户使用了独立的资源单元配置。

以下将通过这两种场景提供租户扩容和缩容的操作指导。

#### **注意事项**

在调大资源规格时，无论是通过修改资源配置还是切换资源配置，调整后的资源总量都必须满足以下要求：

```shell
Sum(min_cpu) <= CPU_CAPACITY;  // CPU 总的容量
Sum(max_cpu) <= CPU_CAPACITY * resource_hard_limit;  // CPU 总的容量 * 配置项的值(默认100)
Sum(memory_size) <= MEM_CAPACITY;  // 内存总的容量
Sum(log_disk_size) <= LOG_DISK_CAPACITY;  // 日志盘总的容量
```

否则，系统会报错，提示扩容失败。

#### **场景**

假设当前集群中共包含 3 个可用区 z1、z2、z3，每个 Zone 内包含 3 台 OBServer。集群中有一个普通租户 tenant1，其资源分配情况如下：

```sql
obclient> CREATE RESOURCE UNIT unit1 MAX_CPU 6, MIN_CPU 6, MEMORY_SIZE '36G', MAX_IOPS 1024, MIN_IOPS 1024, IOPS_WEIGHT=0, LOG_DISK_SIZE = '4G';

obclient> CREATE RESOURCE POOL pool1 UNIT 'unit1', UNIT_NUM 2, ZONE_LIST ('z1','z2','z3');

obclient>CREATE TENANT tenant1 resource_pool_list=('pool1');
```

#### **租户配置了独立的资源单元配置的场景**

如果待操作的租户配置了独立的资源单元配置，您可以直接通过修改租户的 unit_config 来完成租户的扩容和缩容。
方法如下：

1. 进入 oceanbase 数据库。

   ```sql
   obclient>USE oceanbase;
   ```

2. 执行以下语句，获取待操作的租户所使用的资源配置 ID。

   ```sql
   obclient> SELECT a.TENANT_NAME, b.UNIT_CONFIG_ID  FROM oceanbase.DBA_OB_TENANTS a,oceanbase.   DBA_OB_RESOURCE_POOLS b WHERE b.TENANT_ID=a.TENANT_ID;
   +-------------+----------------+
   | TENANT_NAME | UNIT_CONFIG_ID |
   +-------------+----------------+
   | sys         |              1 |
   | MySQL       |           1001 |
   | Oracle      |           1002 |
   +-------------+----------------+
   3 rows in set
   ```

3. 执行以下语句，获取待操作租户的资源配置详细信息。

   ```sql
   obclient> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS WHERE UNIT_CONFIG_ID='1001';
   +----------------+-------+---------+---------+-------------+---------------+----------+----------+-------------+
   | UNIT_CONFIG_ID | NAME  | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS | MIN_IOPS | IOPS_WEIGHT |
   +----------------+-------+---------+---------+-------------+---------------+----------+----------+-------------+
   |           1001 | unit1 |       6 |       6 | 38654705664 |    4294967296 |     1024 |     1024 |           0 |
   +----------------+-------+---------+---------+-------------+---------------+----------+----------+-------------+
   1 row in set
   ```

4. 根据获取的资源单元配置信息，修改 unit1 的配置。

   - 调大 unit1 的配置

     ```sql
     obclient> ALTER RESOURCE UNIT unit1 MAX_CPU 8, MIN_CPU 8, MEMORY_SIZE '40G', MAX_IOPS 1024, MIN_IOPS 1024, IOPS_WEIGHT 0, LOG_DISK_SIZE '6G';
     ```

   - 调小 unit1 的配置

     ```sql
     obclient> ALTER RESOURCE UNIT unit1 MAX_CPU 5, MIN_CPU 5, MEMORY_SIZE '5G', MAX_IOPS 1024, MIN_IOPS 1024, IOPS_WEIGHT 0, LOG_DISK_SIZE '2G';
     ```

#### **多个租户使用了相同的资源单元配置的场景**

如果多个租户共用了同一个资源单元配置模版，则不能通过简单的调大资源单元配置来实现租户的扩容和缩容。因为一旦修改，将导致使用相同资源单元配置模版的所有租户同时进行了扩容或缩容。此场景下，需要先创建独立的资源单元配置后，再为租户切换资源单元配置。

例如，待扩容或缩容的租户为 tenant1，但由于 tenant1、tenant2 均使用了 unit1 作为资源单元配置，因此需要创建一个新的资源单元。

1. 使用 root 用户登录集群的 sys 租户。

2. 进入 oceanbase 数据库。

3. 创建一个独立的资源单元配置。其中，unit2为新建的资源单元的名称，名称需要保证全局唯一。

   - 创建比当前资源单元配置高的 unit2
  
     ```sql
     obclient> CREATE RESOURCE UNIT unit2 MAX_CPU 8, MIN_CPU 8, MEMORY_SIZE '20G', MAX_IOPS 1024, MIN_IOPS 1024, IOPS_WEIGHT 0, LOG_DISK_SIZE '6G';
     ```

   - 创建比当前资源单元配置低的 unit3

     ```sql
     obclient> CREATE RESOURCE UNIT unit3 MAX_CPU 5, MIN_CPU 5, MEMORY_SIZE '5G', MAX_IOPS 1024, MIN_IOPS 1024, IOPS_WEIGHT 0, LOG_DISK_SIZE '2G';
     ```

4. 修改租户的资源池，将资源池的资源单元配置替换为刚刚新创建的 Unit。其中，unit2 和 unit3 为刚刚新创建的 Unit。

   ```sql
   obclient> ALTER RESOURCE POOL pool1 unit='unit2';

   obclient> ALTER RESOURCE POOL pool1 unit='unit3';
   ```

#### **后续处理**

操作结束后，您可以通过 oceanbase.DBA_OB_UNIT_CONFIGS 视图，确认当前租户的 unit_config 是否修改成功。

```sql
obclient> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS;
```

更多 DBA_OB_UNIT_CONFIGS 视图的字段及说明信息请参见官网 OceanBase 数据库文档 [DBA_OB_UNIT_CONFIGS](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699272)。

### **通过修改 UNIT_NUM**

对租户内资源的扩容还可以通过调大资源池中的 UNIT_NUM 来实现。当前暂不支持通过调小资源池中的 UNIT_NUM 来进行缩容。

#### **前提条件**

在进行租户的扩容操作前，需要进行以下操作：

- 由于空闲的资源池会被计算为占用的资源，故在扩容前，如果有租户被删除，建议与租户对应的资源池也一并删除，以便释放资源。删除资源池的相关操作请参见 [删除资源池](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001701230)。

- 查看集群中资源的分配情况，了解集群中资源的使用情况。查看集群节点的资源总量和分配状态的相关操作请参见 [查看集群的资源信息](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001701028)。调大资源池的 UNIT_NUM 时，修改后的 UNIT_NUM 数量要小于或等于 Zone 内可用的 OBServer 节点数量。

> **注意**
>
> 调大资源池的 UNIT_NUM 时，修改后的 UNIT_NUM 数量要小于或等于 Zone 内可用的 OBServer 节点数量。

#### **通过 SQL 语句修改租户的 UNIT_NUM**

您可以通过调大租户的 UNIT_NUM 来进行租户的扩容。

#### **场景**

假设当前集群中共包含 3 个可用区 z1、z2、z3，每个 Zone 内包含 3 个 OBServer 节点。在集群中创建一个普通租户 MySQL，其资源分配情况如下：

```sql
obclient> CREATE RESOURCE UNIT unit1 MAX_CPU 6, MIN_CPU 6, MEMORY_SIZE '36G', MAX_IOPS 1024, MIN_IOPS 1024, IOPS_WEIGHT=0, LOG_DISK_SIZE '2G';

obclient> CREATE RESOURCE POOL pool1 UNIT 'unit1', UNIT_NUM 1, ZONE_LIST ('z1','z2','z3');

obclient> CREATE TENANT MySQL resource_pool_list=('pool1');
```

#### **调大 UNIT_NUM**

随着业务量的不断变大，每个 Zone 上 1 个 Unit 已经无法承载当前的业务量，因此需要考虑调大 UNIT_NUM 来提高租户的服务能力，以满足新的业务需求。

1. 使用 root 用户登录集群的 sys 租户。

2. 进入 oceanbase 数据库。

   ```sql
   obclient>USE oceanbase;
   ```

3. 执行以下语句，获取当前租户的资源配置信息。

   ```sql
   obclient> SELECT a.TENANT_NAME, b.RESOURCE_POOL_ID,b.NAME resource_pool_name,b.UNIT_CONFIG_ID,b. UNIT_COUNT FROM oceanbase.DBA_OB_TENANTS a,oceanbase.DBA_OB_RESOURCE_POOLS b WHERE b.TENANT_ID=a.TENANT_ID;
   +-------------+------------------+--------------------+----------------+------------+
   | TENANT_NAME | RESOURCE_POOL_ID | resource_pool_name | UNIT_CONFIG_ID | UNIT_COUNT |
   +-------------+------------------+--------------------+----------------+------------+
   | sys         |                1 | sys_pool           |              1 |          1 |
   | tenant1     |             1001 | pool1              |           1001 |          2 |
   | Oracle      |             1002 | pool002            |           1002 |          1 |
   +-------------+------------------+--------------------+----------------+------------+
   3 rows in set
   
   obclient> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS WHERE UNIT_CONFIG_ID='1001';
   +----------------+-------+---------+---------+-------------+---------------+----------+----------+-------------+
   | UNIT_CONFIG_ID | NAME  | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS | MIN_IOPS | IOPS_WEIGHT |
   +----------------+-------+---------+---------+-------------+---------------+----------+----------+-------------+
   |           1001 | unit1 |       6 |       6 | 38654705664 |    2147483648 |     1024 |     1024 |           0 |
   +----------------+-------+---------+---------+-------------+---------------+----------+----------+-------------+
   1 row in set
   ```

   其中，UNIT_COUNT 表示当前租户所分配的 UNIT_NUM 。

4. 执行以下语句，调大 UNIT_NUM 的数量。

   > **说明**
   >
   > 不支持通过指定 unit_id 的方式调大 UNIT_NUM 的数量。

   ```sql
   obclient>ALTER RESOURCE TENANT MySQL UNIT_NUM = 2;
   ```

   语句执行后，系统会直接在每个 Zone 内添加一个 Unit。
