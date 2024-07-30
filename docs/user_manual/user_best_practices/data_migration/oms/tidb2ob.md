---
title: TiDB 迁移到 OB
weight: 2
---


如果 TiDB 集群没有开启 TiCDC，那么只能做数据迁移；如果需要做数据迁移+增量同步，需要部署 TiCDC 并且创建 Kafka 的同步任务，并且表要有主键。

集群已经存在 TiCDC 以及 Kafka 任务可以直接在创建数据源的时候进行指定，如果当前集群并没有部署 TiCDC，可以通过后面的步骤进行添加。

![image.png](/img/data_migration/oms/tidb2ob/p0.png)

## 全量迁移

**一、迁移任务创建**

1. 添加数据源

![image.png](/img/data_migration/oms/tidb2ob/p1-1.png)

2. 发起迁移任务

![image.png](/img/data_migration/oms/tidb2ob/p1-2.png)

3. 选择源端和目标端

![image.png](/img/data_migration/oms/tidb2ob/p1-3.png)

4. 选择迁移类型

![image.png](/img/data_migration/oms/tidb2ob/p1-4.png)

如果需要做反向增量，也就是后续切换以后，OB 数据反向同步到 TiDB，那么需要绑定 OCP，从 OCP 获取 Config Url，并且集群需要开启日志归档。

这里需要用 sys 租户下的用户及密码。

![image.png](/img/data_migration/oms/tidb2ob/p1-5.png)

5. 选择迁移对象

可以重命名，也可以多表汇合等操作
![image.png](/img/data_migration/oms/tidb2ob/p1-6.png)

6. 选择迁移并发以及冲突处理

这里一定要注意下面的资源，选择当前机器满足的速度，比如选择了快速，但是机器内存低于8G，那么迁移任务会失败
![image.png](/img/data_migration/oms/tidb2ob/p1-7.png)


7. 预检查通过后，启动项目

![image.png](/img/data_migration/oms/tidb2ob/p1-8.png)

**二、开始数据迁移**

会根据迁移任务创建时选择的迁移类型的流程开始执行。

失败可以查看详情，修复完成后，点击恢复即可继续运行。
![image.png](/img/data_migration/oms/tidb2ob/p2-1.png)
![image.png](/img/data_migration/oms/tidb2ob/p2-2.png)

当前状态表示已经迁移+校验完成，等待后续应用切换后配合做正向切换。

![image.png](/img/data_migration/oms/tidb2ob/p2-3.png)

进入下一个阶段，默认不会进行正向切换，需要配合应用切换手动执行
![image.png](/img/data_migration/oms/tidb2ob/p2-4.png)
![image.png](/img/data_migration/oms/tidb2ob/p2-5.png)


**三、反向增量验证**

![image.png](/img/data_migration/oms/tidb2ob/p3-1.png)


## 部署 TiCDC 以支持增量

1. 扩容 cdc

```sql
# 创建 TiCDC 扩容配置文件

[tidb@iZ0jl7bmjvyd7ojkpcdiggZ ~]$ cat add-cdc.yaml
cdc_servers:
  - host: xx.xx.xx.xx
    port: 8300
    deploy_dir: "/tidb-deploy/cdc-8300"
    data_dir: "/tidb-data/cdc-8300"
    log_dir: "/tidb-deploy/cdc-8300/log"
 
# 查询集群列表，获取集群信息
tiup cluster list

# 扩容 TiCDC
tiup cluster scale-out tidb-test add-cdc.yaml
```

2. 部署 Kafka，安装步骤这里省略，需要注意 Kafka 跟 TiDB 版本的对应关系。

3. 创建 Kafka 同步任务

```sql
# 需要到 TiCDC 的安装目录下执行。
# 查询任务列表
./cdc cli changefeed list --pd=http://172.xx.xxx.xx:2379

# 创建同步任务
./cdc cli changefeed create --pd=http://172.xx.xxx.xx:2379 --sink-uri="kafka://127.0.0.1:9092/test-topic?kafka-version=2.4.0&partition-num=6&max-message-bytes=671088&replication-factor=1" --changefeed-id="simple-replication-task2" --sort-engine="unified"

# 查询单个任务详情
./cdc cli changefeed query --pd=http://172.xx.xxx.xx:2379 --changefeed-id=simple-replication-task2
```

返回 Create changefeed successfully! 即创建成功

4. 新建 TiDB 数据源
![image.png](/img/data_migration/oms/tidb2ob/p4-1.png)
![image.png](/img/data_migration/oms/tidb2ob/p4-2.png)


**后续操作**

创建迁移任务的步骤跟上面相同，因为装了 TiCDC 和 Kafka，所以现在有了【增量迁移】选项
![image.png](/img/data_migration/oms/tidb2ob/p4-3.png)

后续任务也增加了【增量同步】步骤

![image.png](/img/data_migration/oms/tidb2ob/p4-4.png)

如果组件有问题，可以先检查下组件监控
![image.png](/img/data_migration/oms/tidb2ob/p4-5.png)

测试增量效果
![image.png](/img/data_migration/oms/tidb2ob/p4-6.png)



