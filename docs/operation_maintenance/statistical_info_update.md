---
title: 统计信息更新
weight: 7
---
# **统计信息更新**

OceanBase 数据库中表的统计信息过期判断标准为：如果当前表增量的 DML 次数（上一次收集统计信息时 DML 次数到本次收集统计信息期间发生的增/删/改总次数）超过设置的阈值时就会过期。阈值的默认值是 10%。

## **手动收集统计信息**

语法如下：

```sql
analyze_stmt:
ANALYZE TABLE table_name UPDATE HISTOGRAM ON column_name_list WITH INTNUM BUCKETS
```

示例：收集表 tbl1 的统计信息，列的桶个数为 30 个。

```sql
ANALYZE TABLE tbl1 UPDATE HISTOGRAM ON a, b, c, d WITH 30 BUCKETS;
```

OceanBase 数据库 MySQL 模式下用于查询相关统计信息的视图如下表所示:

| 视图名称 | 描述 |
| --- | --- |
| OCEANBASE.DBA_TAB_STATISTICS | 用于查询表级的统计信息。 |
| OCEANBASE.DBA_TAB_COL_STATISTICS | 用于查询 GLOBAL 级别的列级统计信息。 |
| OCEANBASE.DBA_PART_COL_STATISTICS | 用于查询 PARTITON 级别的列级统计信息。 |
| OCEANBASE.DBA_SUBPART_COL_STATISTICS | 用于查询 SUBPARTITON 级别的列级统计信息。 |
| OCEANBASE.DBA_TAB_HISTOGRAMS | 用于查询 GLOBAL 级别的列级直方图统计信息。 |
| OCEANBASE.DBA_PART_HISTOGRAMS | 用于查询 PARTITON 级别的列级直方图统计信息。 |
| OCEANBASE.DBA_SUBPART_HISTOGRAMS | 用于查询 SUBPARTITON 级别的列级直方图统计信息。 |
| OCEANBASE.DBA_IND_STATISTICS | 用于查询索引统计信息。 |
