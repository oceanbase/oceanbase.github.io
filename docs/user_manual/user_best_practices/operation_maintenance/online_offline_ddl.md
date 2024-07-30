---
title: Online DDL 和 Offline DDL
weight: 11
---
# **Online DDL 和 Offline DDL**

本文介绍 OceanBase 数据库 4.0，4.1 和 4.2 版本中，Online DDL 与 Offline DDL 的列表。其中，Online 和 Offline 的区别是执行 DDL 时是否堵塞 DML。

## **Online DDL 列表**

| 分类| 操作| 备注|
| --- | --- | --- |
| 索引 | 增加索引 |全局/局部索引；同一条语句内加多个索引；全局索引带分区；空间索引（ V4.1 及之后版本）|
|  | 删除索引|  |
|  | 重建索引|  |
|  | 重命名索引|  |
| 列操作| 末尾加列 | 加 lob 列（text） |
|  | 添加 virtual 列 |  |
|  | 删除 virtual 列 |  |
|  | 修改列为 not null |  |
|  | 修改列为 null |  |
|  | 设列默认值 |  |
|  | 删除列默认值 |  |
|  | 修改自增列值 |  |
|  | 重命名列 |  |
|  | 增加列类型长度或精度 | int 的增长、varchar 的变长、number 类转换规则 |
| 外键约束操作 | 增加外键、check/not null 约束 |  |
|  | 删除外键、check/not null 约束 |  |
| 表操作 | 重命名表 |  |
|  | 修改行格式 |  |
|  | 修改块大小 |  |
|  | 修改压缩算法 |  |
|  | 优化表空间 |  |
| 分区操作 | 添加分区 |  |

## **Offline DDL列表**

| 分类 | 操作 | 备注 |
| --- | --- | --- |
| 列操作 | 中间加列（before/after/first） |  |
|  | 重排列（before/after/first） |  |
|  | 添加自增列 |  |
|  | 修改为自增列 |  |
|  | 修改列类型 |  |
|  | 加/删/改主键列 |  |
|  | 添加/删除 stored 生成列 |  |
|  | 删列 |  |
|  | 混合列操作在同一条 DDL 语句中 |  |
| 表操作 | truncate 表 |  |
|  | 转换字符集 |  |
|  | 删表 |  |
| 分区操作 | 修改分区规则 |  |
|  | 删除分区 | 锁分区 |
|  | truncate 分区 | 锁分区 |
