---
title: 分区相关SQL
weight: 2
---
# **分区相关 SQL**

> **说明**
>
> 本文 SQL 均需在用户租户下执行。

- 查看 test 库下 t1 表 Leader 分布

  ```sql
  select * from oceanbase.DBA_OB_TABLE_LOCATIONS 
  where DATABASE_NAME='test' and TABLE_NAME='t1' 
  and ROLE='LEADER';
  ```

- 计算 test 库下分区个数（包含索引分区）

  ```sql
  select count(*) from oceanbase.DBA_OB_TABLE_LOCATIONS
  where DATABASE_NAME='test' and ROLE='LEADER';
  ```

- 计算 test 库在某个 OBServer 节点上分区个数

  ```sql
  select count(*) from oceanbase.DBA_OB_TABLE_LOCATIONS 
  where SVR_IP='xxx.xxx.xxx.xxx' 
  and database_name='test' 
  and ROLE='LEADER';
  ```
