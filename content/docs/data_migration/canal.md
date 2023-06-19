---
title: Canal
weight: 3
---
# **使用 Canal 从 MySQL 数据库同步数据到 OceanBase 数据库**

Canal 是 Alibaba 开源的一个产品，主要用途是基于 MySQL 数据库增量日志解析，提供增量数据订阅和消费。

本文档主要介绍使用 Canal 的 canal.deployer 和 canal.adapter 组件从 MySQL 数据库同步数据至 OceanBase 数据库。

> **说明**
>
> 您可参考官网 OceanBase 数据库文档 [使用 Canal 从 OceanBase 数据库同步数据到 MySQL 数据库](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001697230) 一文使用 Canal 和 oblogproxy 组件从 OceanBase 数据库同步数据至 MySQL 数据库。

## **架构原理**

- canal deployer：Canal 的 Server 端，进行 binlog 到 CanalEntry 的转换。

- canal adapter：Canal 的客户端适配器，解析 CanalEntry 并将增量变动同步到目的端。

Canal 相关信息访问地址：<https://github.com/alibaba/canal/releases>。

## **操作步骤**

### **步骤一：MySQL 相关设置**

1. 修改 MySQL 配置文件 `my.cnf`。

   配置文件 `my.cnf` 位置：`/etc/my.cnf`。先开启 binlog 写入功能，配置 binlog-format 为 ROW 模式，配置后需重启 MySQL 生效。

   示例如下：

   ```bash
   log-bin=mysql-bin # 开启 binlog
   binlog-format=ROW # 选择 ROW 模式
   server_id=1 # 配置 MySQL replaction 需要定义，不要和 canal 的 slaveId 重复
   ```

2. 创建一个 MySQL 用户。

   创建一个连接 MySQL 的用户，用户名为 `canal`，并为 `canal` 授予所有库的读写权限。

   示例如下：

   ```sql
   MySQL [(none)]> CREATE USER 'canal'@'%' IDENTIFIED BY '******';
   Query OK, 0 rows affected

   MySQL [(none)]> GRANT SELECT,REPLICATION SLAVE,REPLICATION CLIENT ON *.* TO 'canal'@'%';
   Query OK, 0 rows affected

   MySQL [(none)]> FLUSH PRIVILEGES;
   Query OK, 0 rows affected
   ```

3. 创建一个测试数据库。

   创建数据库 `test_mysql_to_ob`，表 `tbl1` 和 `tbl2`，并插入数据。

   ```sql
   MySQL [(none)]> CREATE DATABASE test_mysql_to_ob;
   Query OK, 1 row affected

   MySQL [(none)]> USE test_mysql_to_ob;
   Database changed
   
   MySQL [test_mysql_to_ob]> CREATE TABLE tbl1(col1 INT PRIMARY KEY, col2 VARCHAR(20),col3 INT);
   Query OK, 0 rows affected

   MySQL [test_mysql_to_ob]> INSERT INTO tbl1 VALUES(1,'China',86),(2,'Taiwan',886),(3,'Hong Kong',852),(4,'Macao',853),(5,'North Korea',850);
   Query OK, 5 rows affected
   Records: 5  Duplicates: 0  Warnings: 0

   MySQL [test_mysql_to_ob]> CREATE TABLE tbl2(col1 INT PRIMARY KEY,col2 VARCHAR(20));
   Query OK, 0 rows affected

   MySQL [test_mysql_to_ob]> INSERT INTO tbl2 VALUES(86,'+86'),(886,'+886'),(852,'+852'),(853,'+853'),(850,'+850');
   Query OK, 5 rows affected
   Records: 5  Duplicates: 0  Warnings: 0
   ```

### **步骤二：Canal 的下载和安装**

> **说明**
>
> 本节以 Canal V1.1.5 为例提供操作指导，仅供参考。推荐使用 Canal V1.1.5 版本。

1. 下载软件包。

    下载 [canal.deployer-1.1.5.tar.gz](https://github.com/alibaba/canal/releases/download/canal-1.1.5/canal.deployer-1.1.5.tar.gz)。

    ```bash
    wget https://github.com/alibaba/canal/releases/download/canal-1.1.5/canal.deployer-1.1.5.tar.gz
    ```

2. 将压缩包解压至目录 `/Canal_Home/canal`。

    ```bash
    mkdir /Canal_Home/canal && tar -zxvf canal.deployer-1.1.5.tar.gz -C /Canal_Home/canal
    ```

3. 修改配置文件。

   canal.deployer 默认的配置文件为 `conf/canal.properties` 和 `conf/example/instance.properties`。这里是默认创建了一个 `instance` 叫 `example`。需要修改 `example` 的实例配置文件，修改数据库连接地址、用户名和密码。`canal.instance.connectionCharset` 代表数据库的编码方式对应到 Java 中的编码类型，比如 `UTF-8`，`GBK`，`ISO-8859-1`。

   示例如下：

   ```bash
   vi conf/example/instance.properties

   # mysql serverId
   canal.instance.mysql.slaveId = 1234
   #position info，需要改成自己的数据库信息
   canal.instance.master.address = xxx.xxx.xxx.xxx:3306 
   canal.instance.master.journal.name = 
   canal.instance.master.position = 
   canal.instance.master.timestamp = 
   #canal.instance.standby.address =
   #canal.instance.standby.journal.name =
   #canal.instance.standby.position =
   #canal.instance.standby.timestamp =
   #username/password，需要改成自己的数据库信息
   canal.instance.dbUsername = canal  
   canal.instance.dbPassword = ******
   canal.instance.defaultDatabaseName = 
   canal.instance.connectionCharset = UTF-8
   #table regex
   canal.instance.filter.regex = .*\\..*
   ```

4. 启动 Canal Server。

   ```bash
   cd /Canal_Home/canal && sh bin/startup.sh
   ```

5. 查看 server 日志。

   ```bash
   cat logs/canal/canal.log
   ```

6. 查看 instance 的日志。

   ```bash
   tail -f logs/canal/canal.log
   tail -f logs/example/example.log
   ```

7. 如需停止服务可执行下述命令。

   ```bash
   cd /Canal_Home/canal && sh bin/stop.sh
   ```

### **步骤三：部署 RDB 适配器**

Canal Adapter 提供了对多种目标容器的支持，对于 OceanBase 来说，主要使用它的 rdb 模块，目的端容器为 OceanBase。

1. 下载软件包。

   下载 [canal.adapter-1.1.5.tar.gz](https://github.com/alibaba/canal/releases/download/canal-1.1.5/canal.adapter-1.1.5.tar.gz)。

   ```bash
   wget https://github.com/alibaba/canal/releases/download/canal-1.1.5/canal.adapter-1.1.5.tar.gz
   ```

2. 将压缩包解压至目录 `/Canal_Home/adapter`。

   ```bash
   mkdir /Canal_Home/adapter && tar -zxvf canal.adapter-1.1.5.tar.gz -C /Canal_Home/adapter
   ```

3. 修改启动器配置。

   修改启动器配置：`conf/application.yml`。首先指定 `adapter` 源端类型，通过 `mode` 指定，这里选择 `tcp`。后面就要指定 `canal.tcp` 相关属性，包括 `canal server` 的 IP 和端口，数据库的连接用户和密码。之后指定 `adapter` 目标端连接信息。`instance` 是源端实例名称，在 canal 部署的时候定义的。key 是自定义，名字后面有用。jdbc 相关属性是目标端 OceanBase 的连接方式，可以使用 MySQL 自带的驱动。

   示例如下：

   ```bash
   mode: tcp #tcp kafka rocketMQ rabbitMQ
   flatMessage: true
   zookeeperHosts:
   syncBatchSize: 1000
   retries: 0
   timeout:
   accessKey:
   secretKey:
   consumerProperties:
   # canal tcp consumer
       canal.tcp.server.host: 127.0.0.1:11111
       canal.tcp.zookeeper.hosts:
       canal.tcp.batch.size: 500
       canal.tcp.username: 
       canal.tcp.password:
   canalAdapters:
   - instance: example # canal instance Name or mq topic name
     groups:
     - groupId: g1
       outerAdapters:
       - name: logger
       - name: rdb
         key: test_mysql_to_ob
         properties:
           jdbc.driverClassName: com.mysql.jdbc.Driver
           jdbc.url: jdbc:mysql://xxx.xxx.xxx.xxx:2883/test_data?useUnicode=true
           jdbc.username: root@mysql001#test4000
           jdbc.password: ******  
   ```

4. RDB 映射文件。

   修改 `conf/rdb/mytest_user.yml` 文件。其中，`destination` 指定的是 `canal instance` 名称；`outerAdapterKey` 是前面定义的 `key`；`mirrorDb` 指定数据库级别 DDL 和 DML 镜像同步。

   映射有两种：一是按表映射；二是整库映射。下面以整库映射为例进行配置，注释部分为按表映射的配置：

   ```bash
   [root@obce00 adapter]# cat conf/rdb/mytest_user.yml
   #dataSourceKey: defaultDS
   #destination: example
   #groupId: g1
   #outerAdapterKey: mysql1
   #concurrent: true
   #dbMapping:
   #  database: mytest
   #  table: user
   #  targetTable: mytest
   #  targetPk:
   #    id: id
   #  mapAll: true
   #  targetColumns:
   #    id:
   #    name:
   #    role_id:
   #    c_time:
   #    test1:
   #  etlCondition: "where c_time>={}"
   #  commitBatch: 3000 # 批量提交的大小
   # Mirror schema synchronize config
   dataSourceKey: defaultDS
   destination: example
   groupId: g1
   outerAdapterKey: test_mysql_to_ob
   concurrent: true
   dbMapping:
   mirrorDb: true
   database: test_data
   commitBatch: 1000
   ```

5. 启动 RDB。

   > **说明**
   >
   > 如果使用了 OceanBase 的驱动，则将目标库 OceanBase 驱动包放入 `lib` 文件夹。

   启动 canal-adapter 启动器。

   ```bash
   cd /Canal_Home/adapter && sh bin/startup.sh
   ```

6. 查看 RDB 日志。

   ```bash
   tail -f logs/adapter/adapter.log
   ```

7. 查看数据同步情况。

   在 MySQL 源端写入数据，在 OceanBase 目标端查看数据同步。

8. 如需停止服务可执行下述命令

   ```shell
   cd /Canal_Home/adapter && sh bin/stop.sh
   ```

## **功能限制**

- 同步的表必须有主键。否则，源端删除无主键表的任意一笔记录，同步到目标端会导致整个表被删除。

- DDL 支持新建表、新增列。
