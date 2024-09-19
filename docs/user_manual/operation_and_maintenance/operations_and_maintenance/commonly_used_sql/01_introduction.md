---
title: 前言
weight: 1
---

## 背景
《DBA 进阶教程》中的这一章节的内容，源自 OceanBase 社区论坛中雪北的建议，这位用户希望我们能够在教程中增加一些运维常用的 SQL 或者命令，用于替换 OCP 工具的部分功能，以便在命令行模式中对数据库进行运维操作。

![image.png](/img/user_manual/operation_and_maintenance/operations_and_maintenance/02_commonly_used_sql/001.png)

在这篇文档里，我会把 OceanBase 技术支持同学长期总结出来的运维常用 SQL，做一个简单的汇总和分享，希望能够对习惯使用命令行对 OceanBase 进行运维的朋友有所帮助。

大家可以参考本章各小节中提供的运维 SQL，大部分都可以直接复制使用，少部分可能需要根据实际需求修改 SQL 中的相关参数。

如果大家在对 OceanBase 的运维过程中，还有哪些希望了解的内容，欢迎在[《OceanBase 4.x 运维开发手册》用户意见收集](https://ask.oceanbase.com/t/topic/35610431)这个帖子里留言评论，我们会根据大家的意见和建议不断完善这个《DBA 进阶教程》。

## OceanBase 4.x 视图查询注意事项
由于 OceanBase 4.x 统一推荐使用视图进行元信息查询，但由于一些情况下视图查询性能较差，在查询时尽量增加查询条件，如增加 tenant_id = 1001 等。

系统租户下，查询 oceanbase 数据库 cdb 视图或 dba 视图。用户租户下，MySQL 模式使用 root 登陆查询 oceanbase 数据库，或 Oracle 模式使用 SYS 用户登陆，查询 dba 视图。

最后再附一个 OceanBase 的官方文档[《3.x 与 4.x 视图变更》](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000000218192)。