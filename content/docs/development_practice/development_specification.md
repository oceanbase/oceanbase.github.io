---
title: 开发规范
weight: 1
---
# **开发规范**

> **说明**
>
> 本文档规范仅供参考。

## **1. 总则**

### **1.1 目标**

为了项目组规范使用 OceanBase 分布式数据库产品，拟定关于 OceanBase 产品的开发指引及规范。

### **1.2 适用范围**

本规范适用于参与各类应用实现中需使用到数据库基础数据管理功能的业务人员和技术人员，以及负责应用投产后的运维人员。

### **1.3 术语定义**

**租户（tenant）**

OceanBase 数据库是一个多租户的数据库。在一个 OceanBase 数据库集群之中，可以提供多个数据库服务的实例。每个数据库服务的实例不感知其他实例的存在。这些不同的实例，每一个实例叫做一个租户。租户拥有一组计算和存储资源，提供一套完整独立的数据库服务。

**NDV（Number of Distinct Values）**

数据列所包含的不同值的数量，或称为区分度。数值越大，平均每个值过滤出来的行数越少，索引过滤效果越好。

**复合索引（Composite Index）**

包含一个以上列的索引，也称为联合索引。

**执行计划（Execution Plan）**

数据库 SQL 执行使用的一种可行策略，以改善性能并让 SQL 更快、更准确地处理。通过在 SQL 语句之前增加 explain 关键字，显示具体的执行计划。不同的数据库其执行计划的显示内容有所不同。

**表连接（Table Join）**

多张表关联查询时进行的合并操作。数据库优化器根据表的大小和查询条件等信息，选择一个最低成本的表连接方式来进行表连接操作。常见的表连接方式有嵌套循环连接（Nested Loop Join），散列连接（Hash Join），排序合并连接（Sort Merger Join）。

**驱动表（Drive Table）**

又称外层表(Outer Table)，表连接中的基础表，并以此表的数据为依据，逐步获得其它表（被驱动表）的数据，直至最终查询到所有满足条件的数据的第一个表。左连接中，左表是驱动表，右表是被驱动表；右连接中，右表是驱动表，左表是被驱动表；内连接中，表数据量较小的表会由数据库自动选择作为驱动表去驱动大表。

**死锁（Dead Lock）**

两个或多个事务各自占有对方的期望获得的资源，形成的循环等待，彼此无法继续正常执行的一种状态。

**自增列（Auto Increment Column）**

如果创建表时需要某个数值列的值不重复并且保持递增，这就是自增列。列的类型需定义为 AUTO_INCREMEN。

**序列（Sequence）**

在数据库中按照一定规则自增的一种数字序列。

## **2. 数据库设计**

OceanBase 数据库对于使用者来讲，自上而下结构为：集群(cluster) -> 租户(tenant) -> 数据库（database）-> 表（table）；OceanBase 数据库支持 MySQL 和 Oracle 两种模式，模式为租户级别，在创建租户的时候指定。

### **2.1 租户命名设计**

1. 【推荐】普通租户名：小写 32 字符，t + 应用标识（4 位）+ 租户编号（XX，从 00 开始）。

2. 【推荐】单元化租户名：2 字符，t + 应用标识（4 位）+ Zone 类型（G/C/R）+ 租户编号（XX，从 00 开始）。

### **2.2 数据库命名设计**

1. 【建议】数据库名：应用标识（4 位）+ 子应用名（最多 4 位，可选）+ db，例如：gcdsdb 或 gcdsamndb（Oracle 租户请忽略）。

### **2.3 表命名设计**

1. 【强制】MySQL 租户表名称必须控制在 64 个字节以内。

2. 【强制】创建表名和列名时统一使用小写，禁止大小写混用。

3. 【强制】表名和列名只能使用字母、数字和下划线，并且必须以字母开头，不得使用系统保留字和特殊字符。表名禁止两个下划线中间只出现数字。

4. 【推荐】联机业务表和批量业务表分开存放，防止跑批时影响联机业务。

### **2.4 字段设计**

1. 【强制】每张表上都必须设定主键。

2. 【强制】MySQL 模式小数类型使用 decimal 类型存储，禁止使用 double，float。

3. 【强制】对于字符类型，MySQL 模式建议采用 VARCHAR，不建议使用 NCHAR、NVARCHAR、NVARCHAR2、NCLOB。

4. 【强制】禁止使用枚举列类型：enum(‘x’,’y’,’z’)，需使用字符串类型替代。

5. 【强制】对于日期类型，有时间精度要求的业务，可以使用 DATATIME；对精度没要求的，设置为 DATE 即可；不要使用字符作为时间字段的数据类型；建议不要使用 TIMESTAMP，范围有限而且要避免 TIMESTAMP+TIME_ZONE=‘SYSTEM’ 的问题。

6. 【推荐】非定长字段建议使用 varchar。

7. 【推荐】建议表上默认添加 gmt_create 和 gmt_modified 两字段，记录创建和变更时间；gmt_create 加上 default current_timestamp 属性，gmt_modified 加上 default current_timestamp on update current_timestamp 属性。

8. 【强制】建议表中所有字段都配置为 NOT NULL 属性，并根据业务需要定义 DEFAULT 值。

9. 【强制】每个字段应加注释。

10. 【强制】禁止使用外键自引用且级联删除更新的表字段约束定义，否则可能导致重复删除的问题。

### **2.5 自增列设计**

1. 【强制】创建序列必须指定 cache 大小，cache 值可设置为租户 tps*100*60*60*24。

2. 【强制】序列禁止添加 order 属性。

3. 【强制】自增列字段使用 bigint，禁止使用 int 类型，防止存储溢出。

4. 【强制】禁止使用自增列作为分区键。因为当使用自增列作为分区键时， 不保证自增列的值分区内自增，并且性能损耗较大。

### **2.6 分区表设计**

OceanBase 数据库在 MySQL 模式下支持 range/range columns 分区、hash/key 分区和 list/list columns 分区，支持二级分区。

1. 【注意】分区表的分区规则在表创建的时候需要指定，OceanBase 数据库 4.0 以后版本才支持将非分区表在线改造成分区表的 offline DDL 操作。

2. 【推荐】分区表索引建议：按照本地索引 -> 全局分区索引 -> 全局索引的顺序进行选择，只有在有必要的时候才使用全局索引，原因是全局索引会降低 DML 的性能，可能会因此产生分布式事务。

3. 【强制】分区表的查询或修改必须带上分区键。

4. 【强制】对于 range 分区，需要业务自行做分区管理，定时增加分区，避免分区越界问题。

5. 【推荐】range 分区不建议指定 MAXVALUE ，否则后续无法新增分区。

6. 【推荐】在业务查询条件明确的情况下根据业务场景进行分区规划，分区目的是要利用分区裁剪的能力提高查询效率，禁止在场景不明确的情况下随意规划分区规则。如果查询条件部分场景下仅能覆盖一级分区，建议按照一级分区规划，不需要强行规划为二级分区。

7. 【推荐】OceanBase 数据库 4.0 以前版本，需要控制一个事务中的分区数参与数量，建议 XA 事务的分区参与数在 600 以内，普通事务的分区参与数在 1000 以内。需要注意 insert select 存在未按结果集裁剪，导致事务提交按照所有分区作为参与者的情况。

8. 【推荐】使用分区表时要选择合适的拆分键（列）以及拆分策略。

9. 【推荐】为保证 HASH 分区模式下分区间数据均衡，MySQL 模式下分数个数建议采用奇数个分区，即 3、7、15、31 这样。

10. 【强制】禁止使用生成列作为分区键。

11. 【强制】有历史数据清理的表，需要根据业务使用场景和清理周期进行分区表设计。如交易流水表，可按日分区并按日删除旧分区。

12. 【注意】关于分区键在多维业务查询场景下的选择，如账号和卡号同时存在情况下，需根据业务使用频率和业务重要性等维度来考虑分区键的选择。

### **2.7 索引设计**

在 OceanBase 数据库中，索引可以分为两种类型：本地索引和全局索引，默认创建的是全局索引。两者之间的区别在于：本地索引与分区数据共用分区，全局索引为单独分区；创建本地的索引需要指定 local 关键字，未指定或者指定 global 关键字为全局索引。

1. 【推荐】分区表建议优先创建 LOCAL 索引。

2. 【强制】不允许创建全文索引。

3. 【强制】单个索引字段值的总长度不能超过 64KB。

4. 【强制】单个表上的索引个数建议不超过 5 个左右。

5. 【强制】索引名称必须控制在 64 个字符以内，主键索引命名为 pk_表名_字段名，唯一索引名为 uk_表名_字段名；普通索引名则为 idx_表名_字段名。

6. 【推荐】在建索引时，建议将表中可能会被查询投影、ORDER BY、GROUP BY 等操作频繁使用的列添加到索引后面，形成覆盖索引避免回表查询或排序。

7. 【推荐】组合索引列的个数控制在 3 个字段及以内，不能超过 5 个。

8. 【推荐】创建组合索引的时候，区分度（NDV）最高的在最左边，即唯一性越高的字段作为联合索引的前引导列。

9. 【强制】避免重复索引，冗余的索引影响数据的增删改效率，同时浪费存储成本，如索引 (a,b,c) 已创建的情况下不要再创建索引 (a) 和 (a,b)。

### **2.8 其它对象设计**

1. 【强制】MySQL 模式禁止在应用程序设计阶段使用外键、临时表、存储过程以及触发器

2. 【强制】禁止在 OceanBase 数据库中使用 dblink，跨租户访问建议采用应用接口调用实现。

3. 【强制】禁止在数据库列中存放大文件、介质、图片，音视频 建议将这些数据存入共享介质中，列中存放指向共享介质的 bucket 地址。

## **3. SQL 编写规范**

### **3.1 单表查询规范**

1. 【强制】SELECT 语句必须指定具体字段名称，禁止写成 “select *”。

2. 【推荐】统计行数使用 count(*)，会统计值为 NULL 的行。

3. 【推荐】建议使用 UNION ALL 替换 UNION，并且 UNION 分支尽量控制在 5 个以内。

4. 【强制】禁止大表查询使用全表扫描。

5. 【强制】SQL 语句中条件字段的数据类型保持一致，避免隐式转换。

6. 【强制】SQL 语句 select 投影字段中禁止使用数据库保留字。

7. 【推荐】建议 IN 子查询中条件常量值个数小于 100。

8. 【推荐】尽量避免 buffer 表场景出现，业务改造，如无法改造，考虑设置 table_mode='queuing' 来让转储线程对此类表走 buffer minor merge 合并多版本数据。

9. 【推荐】WHERE 条件里不建议在表字段做算术运算和函数计算。

10. 【强制】WHERE 条件上禁止变换恒真恒假条件，例如 SQL 中出现有 1=1，2=2 情况。

11. 【推荐】避免使用分页查询时深度分页 即不建议 offset 设置过大。

12. 【强制】对于非主键（唯一键）或主键关联查询应使用物理分页（即 SQL 中使用 limit），控制结果集返回的行数，严禁使用应用层 mybatis 数据分页,避免出现 JVM OOM。

13. 【推荐】SQL 查询不建议使用左模糊和全模糊，建议使用搜索引擎来解决模糊查询。

14. 【推荐】MySQL 模式下，通过 ANALYZE 语句进行统计信息收集。当业务发起对表数据大量删除或导入未进行合并时候，考虑通过手工方式收集统计信息。

15. 【注意】避免在 SQL 中对变量进行赋值，尤其是分布式处理结果赋值给变量。

### **3.2 增删改语句规范**

1. 【强制】删改语句必须带 WHERE 条件，避免形成大事务。

2. 【推荐】全表删除建议使用 TRUNCATE TABLE 语句。

3. 【强制】TRUNCATE TABLE 语句执行结束需要等待 1s~3s，确认数据清空后再操作插入数据。

4. 【强制】禁止使用 insert ignore 语句进行插入，应使用 replace into 、insert into（适用于 OceanBase 数据库 3.x 版本）。

### **3.3 多表关联规范**

1. 【推荐】多表连接查询推荐使用别名，且 SELECT 列表中要用别名引用字段。

2. 【推荐】TP 类场景尽量避免超过 5 个以上表关联 join，多表 join 需保证关联字段数据类型保持一致。AP 类场景按实际情况判断。

3. 【强制】多表关联必须有关联条件，禁止出现笛卡尔积（explain 看到 CARTESIAN 关键字）。

4. 【推荐】将多层子查询嵌套改写成表顺序连接。

5. 【推荐】冗余 SQL 多表查询考虑 CTE 优化改写。

6. 【强制】MySQL 模式对于 CTE recursive 语法避免递归行数超过 1000，递归深度越深效率越差。

### **3.4 事务规范**

1. 【强制】批量操作数据时，程序必须有异常处理能力，以及事务失败重试机制。

2. 【推荐】OceanBase 2.X 版本控制事务大小，单分区事务数据量不超过 100MB。大事务场景下，建议采用批量操作并及时 commit 提交。

3. 【强制】应用程序中禁止设置 timezone、SQL_mode 和 isolation_level 变量。

4. 【强制】事务隔离级别应使用默认的 RC 读已提交，目前 RR 和 serialize 对并发限制较大。

5. 【强制】OBProxy 路由 SQL 规则注意如下的情况：

    a. 以下几种情况，proxy 能够将请求发送至正确的 server，但是 server 反馈的信息可能不准，不建议使用。

       ```sql
       select '1'; 
       select * from t1;
       select '1' from dual;
       ```
  
    b. 以下几种情况，proxy 会强制将请求路由至上一次使用的 server，但是 server 反馈信息可能不准，不建议使用。

       ```sql
       show warnings; 
       select *from t1; 
       show count(*) errors; 
       select * from t1;
       ```

6. 【强制】DDL 和 DML 不要在同一个事务里面。

### **3.5 DDL 规范**

1. 【强制】TRUNCATE TABLE 语句执行结束需要等待 1s~3s，确认数据清空后再操作插入数据。

2. 【强制】在线 DDL 操作建议在业务低峰时段进行。

3. 【强制】OceanBase 数据库 3.x 之前版本 DDL 控制并发度不超过 40。

## **4. 字符集**

目前 OceanBase 数据库支持 utf8mb4、gbk、gb18030 和 binary，可以在租户级、database 级、表级、字段级、session 级设置字符集，字符集选定后，需要选定 collate。以 utf8mb4 为例，支持两种 collate，分别是 utf8mb4_general_ci 和 utf8mb4_bin，两者的区别在于 utf8mb4_general_ci 为大小写不敏感，utf8mb4_bin 为大小写敏感，这会影响排序和字符的比较。

collate 可以指定租户级、database 级、表级、字段级；优先级为字段 > 表级 > database 级 > 租户级，如果不指定，默认从上至下继承。

> **说明**
>
> 建议 database 级、表级、字段级均不要指定 collate。如果有大小写敏感的要求请在创建开发阶段提出，统一在租户级别指定。

表关联条件的两个字段的 collation type 要保持一致，否则会出现无法正确使用到索引的情况。

## **5. Java 应用访问 OceanBase 数据库规范**

OceanBase 数据库的 MySQL 租户兼容 MySQL 的连接协议，使用标准的 MySQL JDBC 可以连接 OceanBase 数据库的 MySQL 租户，驱动推荐使用 MySQL JDBC 5.1.47 版本。对于 OceanBase 数据库的 Oracle 租户，必须使用 OceanBase 自研的 oceanbase-client 驱动。

1. 【强制】Java 客户端（连接池 ConnectionProperties 或 JdbcUrl）需要添加对应超时和重连参数：socketTimeout、connectTimeout、useLocalSessionState。

   | 参数 | 说明 |
   | --- | --- |
   | socketTimeout | 网络读超时时间，如果不设置默认是 0，使用 OS 默认超时时间，根据实际情况来设置。 |
   | connectTimeout | 链接建立超时时间，如果不设置默认是 0，使用 OS 默认超时时间，根据实际情况来设置。 |
   | useLocalSessionState | 是否使用 autocommit，read_only 和 transaction isolation 的内部值，默认为 false，建议为 true。 |

2. 【强制】useLocalSessionState=true，不能使用 `set autocommit=0/set tx_isolation='read-committed/set tx_read_only=0`，需要通过 JDBC 的接口方式调用，对应的接口为 `setAutoCommit(false)/setTransactionIsolation('read-committed')/setReadOnly(false)`。

    MySQL 租户连接示例：

    ```bash
    | String url = "jdbc:oceanbase://IP:端口/database?autoReconnect=true&socketTimeout=6000000& connectTimeout=60000&useLocalSessionState=true&useUnicode=true&characterEncoding=utf-8";
    String username = "用户名@租户名#集群名";
    String password = "***";    
    Connection conn = null;
    try {
    Class.forName("com.mysql.jdbc.Driver ");
    conn = DriverManager.getConnection(url, username, password);
    PreparedStatement ps = conn.prepareStatement("select to_char(sysdate,'yyyy-MM-dd HH24:mi:ss') from dual;");
    ResultSet rs = ps.executeQuery();
    rs.next();
    System.out.println("sysdate is:" + rs.getString(1));
    rs.close();
    ps.close();
    } catch (Throwable e) {
    e.printStackTrace();
    } finally {
    if (null != conn) {
    conn.close();
    }
    } |
    ```

## **6. 附录**

### **6.1 批量处理优化**

建议用批量 SQL 语句，减少与数据库交互次数。批量插入与批量更新 JDBC 配置示例：`jdbc:oceanbase://IP:2883/dbname? useServerPrepStmts=false&rewriteBatchedStatements=true&allowMultiQueries=true`

| 配置属性 | 默认值 | 说明 |
| --- | --- | --- |
| allowMultiQueries | false | 设置为 true 时，JDBC 驱动允许应用代码把多个 SQL 用分号（`;`）拼接在一起，作为一个 SQL 发给 server 端。 |
| rewriteBatchedStatements | false | 设置为 false 时，OceanBase 的 JDBC 驱动在默认情况下会无视 `executeBatch()` 语句，把批量执行的一组 SQL 语句拆散，一条一条地发给数据库，此时批量插入实际上是单条插入，直接造成较低的性能。要想实际执行批量插入，需要将该参数置为 true，驱动才会批量执行 SQL。</br>即使用 addBatch 方法把同一张表上的多条 insert 语句合在一起，做成一条 insert 语句里的多个 values 值的形式，提高 batch insert 的性能。必须使用 prepareStatement 方式来把每条 insert 做 prepare，然后再 addBatch，否则不能合并执行。 |
| useServerPrepStmts | false | 设置为 false 的时候采用文本协议，设置为 true 的时候会采用二进制协议。如果 rewriteBatchedStatements 设置为 true，则此选项将设置为 false。默认值：false。 |

> **注意**
>
> 使用批量更新中，需要如果一个 Batch 中存在对相同行的更新，不能走到批量更新的优化，为了保证更新顺序，退化为单条顺序执行。且在 OceanBase 数据库 3.2.3 版本前，批量更新中的语句必须是按主键更新才能走到批量更新的优化。

### **6.2 结果集使用**

数据库驱动会根据不同的参数设置选择对应的 ResultSet 实现类，分别对应三种查询方式：

- RowDataStatic 静态结果集，默认的查询方式，普通查询。

- RowDataDynamic 动态结果集，流式查询。

- RowDataCursor 游标结果集，服务器端基于游标查询。

建议小数据量场景的查询使用全量结果集；大数据量情况为避免客户端出现 OOM（Out of Memory）可以从应用控制查询结果集大小（例如，分页查询），或使用游标结果集与流式结果集的方式。

实际使用中往往需要根据用户的需求、内存大小等选择使用。可根据以下优劣势分析与实际场景结合选择使用。

### **6.3 Druid 建议**

将应用和数据库连接进行业务操作，建议使用连接池。如果是 Java 程序，推荐使用 Druid 连接池，Druid 的版本建议采用 V1.2.8 及以上版本。

1. 添加 Maven 依赖

   ```bash
   <dependency>
   <groupId>com.alibaba</groupId>
   <artifactId>druid</artifactId>
   <version>1.2.8</version>
   </dependency> 
   ```

2. 配置建议，关注开启探活

   ```bash
   <bean id="dataSource" class="com.alibaba.druid.pool.DruidDataSource"
   init-method="init" destroy-method="close">
   <!-- 基本属性 url、user、password -->
   <property name="url" value="${jdbc_url}" />
   <property name="username" value="${jdbc_user}" />
   <property name="password" value="${jdbc_password}" />
   <!-- 配置初始化大小、最小、最大 -->
   <property name="initialSize" value="20" />
   <property name="minIdle" value="10" />
   <property name="maxActive" value="100" />
   <!-- 配置从连接池获取连接等待超时的时间，单位毫秒 -->
   <property name="maxWait" value="1000" />
   <!-- 配置间隔多久启动一次 DestroyThread，对连接池内的连接才进行一次检测，单位是毫秒。检测时：1.如果连接空闲并且超过 minIdle 以外的连接，如果空闲时间超过 minEvictableIdleTimeMillis 设置的值则直接物理关闭。2.在 minIdle 以内的不处理。-->
   <property name="timeBetweenEvictionRunsMillis" value="60000" />
   <!-- 配置一个连接在池中最大空闲时间，单位是毫秒 -->
   <property name="minEvictableIdleTimeMillis" value="300000" />
   <!-- 设置从连接池获取连接时是否检查连接有效性，为 true 时，每次都检查；为 false 时不检查 -->
   <property name="testOnBorrow" value="true" />
   <!-- 设置往连接池归还连接时是否检查连接有效性，为 true 时，每次都检查；为 false 时不检查 -->
   <property name="testOnReturn" value="false" />
   <!-- 如果为 true（默认 true），当应用向连接池申请连接，并且 testOnBorrow 为 false 时，连接池将会判断连接是否处于空闲状态，如果是，则验证这条连接是否可用，如果两者都为 true，则 testOnBorrow 优先级高，则不会使用到 testWhileIdle。-->
   <property name="testWhileIdle" value="true" />
   <!-- 检验连接是否有效的查询语句。如果数据库 Driver 支持 ping() 方法，则优先使用 ping() 方法进行检查，否则使用 validationQuery 查询进行检查。(Oracle jdbc Driver 目前不支持 ping 方法) -->
   <property name="validationQuery" value="select 1 from dual" />
   <!-- 单位：秒，检测连接是否有效的超时时间。底层调用 jdbc Statement 对象的 void setQueryTimeout(int seconds) 方法 -->
   <!-- <property name="validationQueryTimeout" value="1" />  -->
   <!-- 打开后，增强 timeBetweenEvictionRunsMillis 的周期性连接检查，minIdle 内的空闲连接，每次检查强制验证连接有效性. 参考：https://github.com/alibaba/druid/wiki/KeepAlive_cn -->
   <property name="keepAlive" value="true" />  

   <!-- 连接泄露检查，打开 removeAbandoned 功能 , 连接从连接池借出后，长时间不归还，将触发强制回连接。回收周期随 timeBetweenEvictionRunsMillis 进行，如果连接为从连接池借出状态，并且未执行任何 SQL，并且从借出时间起已超过 removeAbandonedTimeout 时间，则强制归还连接到连接池中。不要配置 removeAbandoned 参数，有可能造成异步断开连接。 -->
   <!-- property name="removeAbandoned" value="true" /--> 
   <!-- 超时时间，秒 -->
   <!-- property name="removeAbandonedTimeout" value="80"/-->
   <!-- 关闭 abanded 连接时输出错误日志，这样出现连接泄露时可以通过错误日志定位忘记关闭连接的位置 -->
   <!-- property name="logAbandoned" value="true" /-->
   <!-- 根据自身业务及事务大小来设置 -->
   <!-- property name="connectionProperties"          value="oracle.net.CONNECT_TIMEOUT=2000;oracle.jdbc.ReadTimeout=10000"></property-->
   <!-- 打开 PSCache，并且指定每个连接上 PSCache 的大小，Oracle 等支持游标的数据库，打开此开关，会以数量级提升性能，具体查阅 PSCache 相关资料。不建议配置 PSCache，否则有可能出现断开连接问题。 -->
   <!-- property name="poolPreparedStatements" value="true" /-->
   <!-- property name="maxPoolPreparedStatementPerConnectionSize" value="20" /-->   
   <!-- 配置监控统计拦截的 filters -->
   <!-- <property name="filters" value="stat,slf4j" /> -->
   <property name="proxyFilters">
   <list>
   <ref bean="log-filter" />
   <ref bean="stat-filter" />
   </list>
   </property>
   <!-- 配置监控统计日志的输出间隔，单位毫秒，每次输出所有统计数据会重置，酌情开启 -->
   <!-- property name="timeBetweenLogStatsMillis" value="120000" /-->
   </bean> 
   ```
