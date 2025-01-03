---
title: 历史数据归档最佳实践
weight: 3
---

> 本文中标红的内容，均为用户在使用 OceanBase 进行测试和生产过程中容易被忽略的问题，且忽略后往往可能会造成严重影响。希望大家能够重点关注。

## 背景
随着数据量的爆炸式增长，企业和组织在数据库管理上面临越来越严峻的挑战。数据库性能下降、存储成本上升、数据运维复杂度增加，这些问题让 DBA 和开发者的数据管理变得更加困难。

为应对这些挑战，需要对数据生命周期进行更加精细化的管理，包括在线、近线、归档到销毁四个阶段。其中，近线阶段和归档阶段的历史库管理尤为关键。历史数据存储在近线和归档阶段都发挥着重要作用。在归档阶段，可采用数据库或离线文件的形式。而对于仍需进行少量查询的归档数据，则通常选择历史库方案。历史库方案实际上是实现冷热数据分离的策略，通过减轻在线库负担来提升其性能。<font color="red">**历史库的冷数据通常具有低频访问的特点，建议选择磁盘空间较大、CPU 配置较低的机型，以实现成本节约的目的。**</font>

> 说明：“近线阶段”（Nearline Stage）是一个位于数据活跃使用（在线阶段）与长期存档或备份（归档阶段）之间的特定阶段。近线阶段的主要特点是数据访问频率相对较低，但仍需保持较快的恢复或访问速度，以应对不时之需。

历史库的引入给数据库管理系统带来了新的挑战，我们对此的理解主要来自于用户对数据管理解决方案的迫切期待。在与用户的交流中，我们发现许多用户迫切需要一种能够有效处理大规模历史数据的解决方案，同时希望在降低成本的同时不影响性能和数据可用性。这些反馈深刻地影响了我们对历史库的理解。因此，我们期望历史库能够具备以下特点：

- 大容量的存储空间，支持大量数据的存储和在线库数据高效持续导入。

- 具备良好的可扩展性，能够处理不断增加的数据量而无需调整存储架构。

- 提供更低的存储成本，以更少的磁盘空间和更经济的存储介质存储更多数据。

- 提供一定的查询能力，支持高效的少量事务型查询，同时也能够支持高效的分析型查询。

- 对应用和在线库保持相同的访问接口，降低应用复杂度。

当面对这些需求时，OceanBase 成为一种天然的选择。其具备良好的单机分布式扩展能力和 HTAP 混合负载处理能力，使其能够高效地支持业务系统的在线库和历史库场景。更为重要的是，OceanBase 在满足业务需求的同时，能够降低至少一半的存储成本。据部分客户反馈，将业务历史库从其他数据库迁移至 OceanBase 后，存储成本普遍可降低 80% 左右，这也是许多用户在历史库场景选择 OceanBase 的主要原因之一。
![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/001.png)
随着历史库产品架构的设计，我们进一步思考历史库的存储架构问题：

- 首先，<font color="red">**关于历史库的数据库架构是否需要与在线库保持一致的问题，我们认为不需要**</font>。在线库可能出于数据规模和性能的需要，采取分库分表等架构，但历史库对性能的要求通常较低。分库分表架构对数据库的部署运维、备份恢复都带来额外的成本。特别是采用 OceanBase 作为历史库时，单表轻松承载几十 TB 的数据规模，即使数据规模很大也可以采用分区表。

- 其次，关于历史库是否应该支持数据更新的问题，技术上是可行的，历史库可以支持更新，也可以设定为只读。<font color="red">**从历史库整体成本的角度考虑，我们建议尽量采用只读历史库的方案。**</font>只读历史库随机读写更少，可以使用更廉价的存储硬件，如 SATA 盘而不是 SSD。此外，只读历史库也降低了历史库自身的备份成本，只需要维护一份备份副本。

- 最后，对于数据归档应尽可能减少对在线库的影响的问题，这是非常重要的。在线库是企业业务持续稳定运行的关键，在数据规模较大的场景下，大批量数据的读取、计算、删除会给在线库造成压力。因此，<font color="red">**在选择数据归档的方法时，必须注意要能够保障在线库的稳定性。**</font>




本小节内容主要介绍用户在选择使用 OceanBase 作为归档库后，通过归档工具和迁移同步工具来构建数据归档链路的几种常见方法，以及过程中需要注意的一些问题。

## 通过 ODC 进行数据归档（推荐）

这部分内容会重点介绍如何通过 ODC（OceanBase Developer Center）进行历史库的数据归档和管理。推荐 ODC 的原因是相比 OMS 以及其他迁移同步工具，ODC 对数据归档场景专门做了大量适配工作，最为易用。

大家可以只关注以下内容中的（零）、（一）、（二）三个小节，因为其中包括一些安装部署过程中容易忽略的点，以及使用数据归档功能前的注意事项。

ODC 的数据归档功能十分易用，（四）、（五）小节在白屏下的操作，相信大家肯定可以信手拈来，所以不必细读。


### （零）冷热数据分离，提升在线库性能
通常情况下，一部分业务数据在一段时间后就很少被访问或者不再被访问（我们称之为“冷”数据）。解决思路是将访问频率较低的“冷”数据归档到历史库中，而在线库则只保留最近某一段时间的数据。

传统的数据归档方式常常需要耗费大量的时间和人力，并且存在操作错误、数据丢失等风险。此外，手动归档操作的繁琐性也限制了数据管理的效率和工作的灵活性。

**面对这些问题，ODC 从 4.2.0 版本引入了数据归档功能，旨在解决数据管理中的难题，提高工作效率和数据安全性。ODC 支持定时将源数据库中的表数据归档至其它目标数据库中，以解决因线上数据增多影响查询性能与业务运作的问题。**

下图是 ODC 的数据归档能力概览：
![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/002.png)

### （一）安装部署 ODC

安装部署 ODC 的过程详见：[官方文档 - 部署 Web 版 ODC](https://www.oceanbase.com/docs/common-odc-1000000001418151)

<font color="red">**这里里提出几个在安装部署 ODC 时，需要大家特别注意的点：**</font>

1. ODC 分为桌面版和 Web 版，桌面版不支持数据生命周期管理（数据归档功能就在这里）、项目协同管理、以及数据脱敏与审计功能，类似于 navicat、DBeaver 等白屏化工具，更适合个人开发者。<font color="red">**需要使用数据归档功能的用户请安装 Web 版的 ODC**</font>。
2. 归档功能需要有 OBProxy。且在启动 ODC 时需要注意 docker run 命令中的 DATABASE_PORT 需要填写成 proxy 的端口号，而非 observer 的端口号。
```
#!/usr/bin/env bash
docker run -v /var/log/odc:/opt/odc/log   -v /var/data/odc:/opt/odc/data \
-d -i --net host --cpu-period 100000 --cpu-quota 400000 --memory 8G --name "obodc" \
-e "DATABASE_HOST=xxx.xx.xx.xx" \
-e "DATABASE_PORT=xxxxx" \
-e "DATABASE_USERNAME=[用户名]@[租户名称]#[集群名称]" \
-e "DATABASE_PASSWORD=******" \
-e "DATABASE_NAME=odc_metadb" \
-e "ODC_ADMIN_INITIAL_PASSWORD=******" \
oceanbase/odc:4.2.2
```
3. <font color="red">**如果 ODC 的租户资源给的特别少，例如 1.5c5g，那么 odc 启动大概需要一分半钟，如果不能立即登录网页的话，不要心急**</font>，可以通过`` cd /var/log/odc`` 后 ``tail -F odc.log`` 观察初始化的过程。过程中可以看到 localIpAddress=xxx.xx.xx.xx, listenPort=8989，后面需要用这个 ip 和 port（默认 8989）去在网页上登录 http://xxx.xx.xx.xx:8989/ ，最后看到类似于 `` Started OdcServer in 96.934 seconds `` 的内容，就是初始化成功了。
![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/003.png)

4. 最好提前在官方文档上看一下你要使用的功能[有没有什么限制](https://www.oceanbase.com/docs/common-odc-1000000001418139#3-title-%E5%8A%9F%E8%83%BD%E9%99%90%E5%88%B6)，如果有的话，要在创建新数据源时准备好。
![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/004.png)

例如数据归档要有 proxy，并且在配置数据源的时候需要通过 proxy 连接（用 proxy 连接的连接串进行智能解析，见下图）。
![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/005.png)

安装完成之后，通过复制黏贴数据库的连接串，并点击智能解析就可以创建新的数据源了，信息在智能解析之后会替你自动填写好（见上图）。<font color="red">**这里最后还有几个要注意的点：**</font>
- 本地安装的 OB 集群，类型要选择 OceanBase MySQL，不要乱选，例如选择 MySQL Cloud。如果 OB 集群是本地安装的，却选择了 MySQL Cloud，也是可以成功创建数据源的，但是可能会出一些非预期的问题，例如可能会默认连到 sys 租户上。
- 记得要点一下测试连接看看用户名、密码啥的有没有填错。
- 要勾选上使用 sys 租户账号查询租户视图，否则用不了完整功能，例如数据归档。

上面这些内容都是本文作者本人在安装部署过程中，实打实踩过的坑，希望能够帮助到大家……

### （二）[使用 ODC 进行数据归档的注意事项](https://www.oceanbase.com/docs/common-odc-1000000001418039)

- 前提条件：
    - 归档的表中必须包含主键。

- 前置条件：

   - 需保证源端表字段在目标端兼容，数据归档不处理字段兼容性问题。

   - MySQL 数据源暂不支持 CPU 内存防爆能力。

   - 同构归档链路二级分区不支持表结构同步，异构数据库不支持结构同步以及自动建表。

- 归档链路支持：

   - OceanBase MySQL 到 OceanBase MySQL 。

   - OceanBase Oracle 到 OceanBase Oracle。

   - MySQL 到 MySQL。

   - MySQL 到 OceanBase MySQL。

   - OceanBase MySQL 到 MySQL。

   - Oracle 到 Oracle。

   - Oracle 到 OceanBase Oracle。

   - OceanBase Oracle 到 Oracle。

   - PostgreSQL 到 OceanBase MySQL。

- 以下情况不支持归档：

  - OceanBase MySQL 及 MySQL 数据源若表中不包含主键 PRIMARY KEY 或唯一非空索引，不支持归档。

  - OceanBase Oracle、Oracle 和 PostgreSQL 数据源若表中不包含主键 PRIMARY KEY，不支持归档。

  - OceanBase Oracle 数据源若表中包含 JSON、XMLTYPE 字段类型，不支持归档。

  - PostgreSQL 数据源若表定义中包含数组类型、复合类型、枚举类型、几何类型、XML 类型、HSTORE 类型、全文检索，不支持归档。

  - 若归档条件中包含 limit 语句，不支持归档。

  - 若表中包含外键，不支持归档。

- 以下归档链路不支持自动建表及表结构同步

  - Oracle 到 OceanBase Oracle
  - OceanBase Oracle  到 Oracle
  - MySQL 到 OceanBase MySQL
  - OceanBase MySQL 到 MySQL
  - PostgreSQL 到 OceanBase MySQL


### （三）新建「数据归档」工单

在 ODC 中，点击「工单」-> 「新建工单」-> 「数据归档」，进入数据归档工单的创建页，填写工单详情。这里我们配置了 tb_order 表从在线库到历史库的归档任务，勾选了归档完成后清理源端已归档数据。注意这里使用了变量 archive_date，其值设置为当前时间往前偏移 1 年，通过在过滤条件中引用变量的方式，可以实现每次执行归档任务都归档 1 年前的数据。

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/006.png)

ODC 数据归档支持多种执行调度策略，可以立即执行、指定时间执行，也可以周期执行。还支持配置结构同步、数据插入策略和限流策略。结构同步时可根据需要选择是否同步分区和索引，因为历史库可能会和在线库有不同的分区设计，历史库和在线库的查询需求也不一样也可以通过更少的索引进一步降低存储成本。

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/007.png)

点击新建任务，会显示归档 SQL 的预览，进一步确认需要归档的数据范围。

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/008.png)

可以看到，通过 ODC 数据归档任务，只需简单配置，就可以成功地将冷数据从在线库归档到了历史库，实现了在线库的冷热数据分离。那么我们完成这个过程就足够么，如果我们因为业务变动或误操作，需要将已归档到历史库的数据恢复到在线库又该如何处理呢？新建一个反向归档任务不可谓不行，但我们既要花费精力重新配置新任务，又要担心配置错误引入问题。ODC 已经为用户考虑到了这一点，提供了一键回滚功能。我们以刚才的任务为例，现在需要将已经归档的数据回滚到在线库，我们仅需要在执行记录页，点击数据归档任务记录后的回滚按钮，即可发起归档回滚任务。

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/009.png)


### （四）过期数据清理，降低存储成本
ODC 的数据归档功能来实现在线库的冷热数据分离，将冷数据迁移到历史库，以达到降低成本、提高效率的目的。然而，你可能会问，历史库难道不需要成本吗？地主家也没有余粮啊。

实际上，一旦业务的冷数据进入历史库，它并不一定需要永久保留。在经过一段时间后，部分冷数据可能会处于“过期”状态，完全不会再被使用，比如日志型数据。如果能及时清理掉这些过期数据，那么我们的存储成本会进一步降低。为了解决这个问题，ODC 提供了数据清理功能定期清理数据库中的过期数据，从而进一步优化存储资源的利用。


### （五）新建「数据清理」工单
在 ODC 中，点击「工单」-> 「新建工单」-> 「数据清理」，进入数据清理工单的创建页，看到这个页面是不是非常熟悉，数据清理工单的配置与数据归档工单基本一致，这里我们不再赘述，直接创建一个周期性清理的工单。ODC 数据清理也支持联动历史库做清理前的数据校验。

![image](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_02_archive_database/03_data_archive_best_practices/010.png)



## 通过 OMS 进行数据归档

这一部分内容，详见上一部《入门教程》的相关章节：[《通过 OMS 进行数据迁移和同步》](https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390112)。

<font color="red">**这里只强调一个需要大家特别注意的点：通过 OMS 进行数据归档的过程中，建议只走全量迁移，不要开增量同步。因为走增量同步的话，源端旧数据的清理动作也会被同步到目的端的归档库，容易造成误删归档数据的严重问题。**</font>

## 通过其他迁移工具数据归档

这一部分内容，详见上一部《入门教程》的相关章节：
- [《使用导数工具进行数据迁移》](https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390106)

- [《使用 SQL 命令进行数据迁移》](https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390111)

- [《通过其他工具进行数据的迁移同步》](https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390108)


<font color="red">**在这些迁移同步工具时，也要注意上面和 OMS 类似的问题！**</font>

## 推荐阅读

[ODC 官方文档](https://www.oceanbase.com/docs/common-odc-1000000001418008)