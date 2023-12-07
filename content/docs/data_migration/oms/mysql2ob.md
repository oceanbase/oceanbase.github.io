---
title: MySQL 迁移到 OB
weight: 1
---


对于无主键表，现在 OMS 不支持增量同步以及数据校验，所以如果要同步的表包括主键表+无主键表，那么后续增量同步任务，需要将无主键表剔除掉，或者保证无主键表没有变更。

如果需要做反向增量，也就是后续切换以后，OB 数据反向同步到 MySQL，那么需要绑定 OCP，从 OCP 获取 Config Url，并且集群需要开启日志归档。用户信息需要用 sys 租户下的用户及密码。

如果想要直接用 OMS 做指定位点的增量同步，现在还不支持，现在只能指定某个时间戳，不能明确到某个 position 或者 GTID。

下面的迁移任务主要包含两种，包含无主键表+主键表的迁移和仅主键表的迁移。

## 创建包含无主键表的迁移任务

**一、创建迁移任务**

1. 创建迁移任务，选择全部表迁移

![image.png](/img/data_migration/oms/mysql2ob/p1-1-1.png)

2. 选择迁移类型

如果包含主键表，并且需要增量同步，可以按需选择；否则的话可以不选择增量同步和全量检验。

![image.png](/img/data_migration/oms/mysql2ob/p1-2-1.png)

3. 选择迁移对象

![image.png](/img/data_migration/oms/mysql2ob/p1-3-1.png)

4. 创建迁移任务

这里一定要注意下面的资源，选择当前机器满足的速度，比如选择了快速，但是机器内存低于8G，那么迁移任务会失败
![image.png](/img/data_migration/oms/mysql2ob/p1-4-1.png)
![image.png](/img/data_migration/oms/mysql2ob/p1-4-2.png)

5. 预检查，检查通过后，任务启动

![image.png](/img/data_migration/oms/mysql2ob/p1-5-1.png)

**二、开始数据迁移**

任务启动后，会按照任务顺序来操作。
![image.png](/img/data_migration/oms/mysql2ob/p2-1.png)

对于有主键的表，增量迁移是没有问题的。
![image.png](/img/data_migration/oms/mysql2ob/p2-2.png)

如果想要看到 DDL 和 DML 的统计，需要暂停任务再开启
![image.png](/img/data_migration/oms/mysql2ob/p2-3.png)

全量校验只会校验有主键表
![image.png](/img/data_migration/oms/mysql2ob/p2-4.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-5.png)

如果无主键表进行变更，那么不会做增量同步，并且任务会报错。
![image.png](/img/data_migration/oms/mysql2ob/p2-6.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-7.png)

解决方法，可以通过更新增量同步组件的配置，将无主键表去掉。
![image.png](/img/data_migration/oms/mysql2ob/p2-8.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-9.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-10.png)

去掉以后，该组件会自动重启，恢复正常，对于去除掉的无主键表的新增变更将自动忽略。

当确认数据同步没问题，准备应用切换，可以手动进入下一阶段。
默认不会进行自动正向切换，需要配合应用切换手动执行
![image.png](/img/data_migration/oms/mysql2ob/p2-11.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-12.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-13.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-14.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-15.png)

反向增量效果验证
![image.png](/img/data_migration/oms/mysql2ob/p2-16.png)
![image.png](/img/data_migration/oms/mysql2ob/p2-17.png)


## 创建主键表迁移任务

1. 创建迁移任务，仅支持唯一键表迁移

![image.png](/img/data_migration/oms/mysql2ob/p3-1.png)

2. 按需选择迁移类型

![image.png](/img/data_migration/oms/mysql2ob/p3-2.png)

中间过程同上，这里省略...

3. 任务启动

如果数据库中包含唯一键表和非唯一键表，只会迁移唯一键表。
![image.png](/img/data_migration/oms/mysql2ob/p3-3.png)

4. 效果验证

![image.png](/img/data_migration/oms/mysql2ob/p3-4.png)

后续步骤也同上，这里忽略...

