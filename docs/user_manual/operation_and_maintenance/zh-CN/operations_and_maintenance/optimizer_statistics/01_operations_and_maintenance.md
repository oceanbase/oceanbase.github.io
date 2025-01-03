---
title: 统计信息运维手册
weight: 1
---

> **<font color="red">本篇统计信息运维手册，对应的 OceanBase 数据内核版本是 4.2.0 及以上的社区版本。统计信息收集默认会刷新该表的 plan cache，业务高峰期非统计信息问题，收集统计信息需要慎重！</font>**

## 统计信息基础知识 / 操作

在阅读本篇内容之前，建议先学习《OceanBase DBA 进阶教程》中的 [“统计信息”](https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390071#0-title-%E7%BB%9F%E8%AE%A1%E4%BF%A1%E6%81%AF) 部分。

> 如果已经对 OceanBase 中的统计信息有了初步了解，可以跳过基础知识部分，直接阅读下面的内容。




## 自动统计信息收集问题排查 {#自动统计信息收集问题排查}
### 自动统计信息收集工作原理
目前自动统计信息收集任务是基于 DBMS_SCHEDULER 系统包实现，以周为单位，定义了如下 7 个窗口的定时执行任务：

| **维护窗口名字** | **开始时间 / 频率** | **最大收集时长** |
| :---: | :---: | :---: |
| **MONDAY_WINDOW** | 22:00/per week | 4 hours |
| **TUESDAY_WINDOW** | 22:00/per week | 4 hours |
| **WEDNESDAY_WINDOW** | 22:00/per week | 4 hours |
| **THURSDAY_WINDOW** | 22:00/per week | 4 hours |
| **FRIDAY_WINDOW** | 22:00/per week | 4 hours |
| **SATURDAY_WINDOW** | 6:00/per week | 20 hours |
| **SUNDAY_WINDOW** | 6:00/per week | 20 hours |

自动收集收集的是统计信息缺失或者统计信息过期的表，按照增量收集的方式进行收集。也就是只收集数据变化的分区，而不用重新收集整个表的统计信息。过期标准是看针对每个分区来说增量的 DML info 变化是否满足过期的阈值（默认：10%，即单个分区距离上一次收集期间增删改的总量不超过当前表数据量的 10%）。


### 自动统计信息收集是否正常排查 {#自动统计信息收集是否正常排查}
请按照如下步骤进行排查：

+ **步骤一：按照租户类别使用如下 SQL 查询进行检查，主要检查最近一天内的所有租户自动收集是否有正常调度。如果调度正常，跳转步骤二，否则请先参考本文中的 “[自动统计收集任务调度问题排查](#自动统计收集任务调度问题排查)” 部分。**

```sql

-- sys租户，查询非空则说明有租户调度异常（推荐）

SELECT tenant_id AS failed_scheduler_tenant_id
FROM   oceanbase.__all_tenant t
WHERE  NOT EXISTS(SELECT 1
                  FROM oceanbase.__all_virtual_task_opt_stat_gather_history h
                  WHERE  TYPE = 1
                  AND start_time > date_sub(now(), interval 1 day)
                  AND h.tenant_id = t.tenant_id);


-- MySQL 模式的普通租户，查询为空则说明有租户调度异常

SELECT *
FROM   oceanbase.dba_ob_task_opt_stat_gather_history
WHERE  start_time > date_sub(now(), interval 1 day)
       AND TYPE = 'AUTO GATHER';
```

**步骤二：按照租户类别使用如下 SQL 查询进行检查，获取过去一天的自动收集是表收集失败列表。如果为空则说明自动收集正常，如果非空，则跳转步骤三进一步检查失败原因。**

```sql

-- sys 租户，获取的所有租户信息。也可以指定租户查询（推荐）

SELECT t_opt.tenant_id,
       t_opt.task_id,
       task_opt.start_time AS task_start_time,
       task_opt.end_time   AS task_end_time,
       d.database_name,
       t.table_name,
       t_opt.table_id,
       t_opt.ret_code,
       t_opt.start_time,
       t_opt.end_time,
       t_opt.memory_used,
       t_opt.stat_refresh_failed_list,
       t_opt.properties
FROM   (
              SELECT tenant_id,
                     task_id,
                     start_time,
                     end_time,
                     table_count
              FROM   oceanbase.__all_virtual_task_opt_stat_gather_history
              WHERE  type = 1
--            AND    tenant_id = {tenant_id} -- 这里可以指定目标租户的 tenant_id
              AND    start_time > date_sub(Now(), interval 1 day)) task_opt
JOIN   oceanbase.__all_virtual_table_opt_stat_gather_history t_opt
JOIN   oceanbase.__all_virtual_table t
JOIN   oceanbase.__all_virtual_database d
WHERE  t_opt.ret_code != 0
AND    task_opt.task_id = t_opt.task_id
AND    task_opt.tenant_id = t_opt.tenant_id
AND    t_opt.tenant_id = t.tenant_id
AND    t_opt.table_id = t.table_id
AND    t.tenant_id = d.tenant_id
AND    t.database_id = d.database_id
AND    t_opt.table_id > 200000;


-- MySQL 模式的普通租户

SELECT task_opt.task_id,
       task_opt.start_time AS task_start_time,
       task_opt.end_time   AS task_end_time,
       t_opt.owner,
       t_opt.table_name,
       t_opt.start_time,
       t_opt.end_time,
       t_opt.memory_used,
       t_opt.stat_refresh_failed_list,
       t_opt.properties
FROM   (SELECT task_id,
               start_time,
               end_time
        FROM   oceanbase.dba_ob_task_opt_stat_gather_history
        WHERE  start_time > Date_sub(Now(), interval 1 day)
               AND TYPE = 'AUTO GATHER') task_opt
       join oceanbase.dba_ob_table_opt_stat_gather_history t_opt
         ON task_opt.task_id = t_opt.task_id
            AND t_opt.status != 'SUCCESS'
            AND owner != 'oceanbase';  
```

+ **步骤三，针对上述收集失败的表，按照如下场景选择应对方式：**

1. **<font color="red">（最常见场景） </font>** 收集失败的表是一个数据量大表（行数超过上亿），长时间没收集成功，出现收集超时报错 ret=-4012，请按照如下方式进行解决：[“自动收集卡在超大表运维手段”](#自动收集卡在超大表运维手段)。

2. 租户中的表太多，大部分表都需要重新收集统计信息，但是收集窗口时间有限，导致未收集完成。该场景下需要考虑重新对该租户在 **<font color="red">业务低峰期</font>** 的时候手动收集一次，收集策略可参考：[《手动统计信息收集命令使用手册》](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/optimizer_statistics/command)。

3. 非超时报错，其他错误码，请先在 **<font color="red">业务低峰期 </font>** 对该表重新手动收集一次统计信息（详见：《手动统计信息收集命令使用手册》）。后续继续观察，同时将该报错问题反馈给 OceanBase 社区论坛的官方值班同学。

## 自动统计收集任务调度问题排查 {#自动统计收集任务调度问题排查}
可以根据当前的租户情况，使用如下查询检查自动收集任务是否调度正常：

+ **sys 租户(需要指定目标租户的 tenant_id)**：

```sql
-- 查询目标租户所有窗口是否正常在调度执行，主要检查对应的调度是否正常，时间有无错乱等：

SELECT tenant_id,
       job_name,
       what,
       start_date,
       this_date,
       last_date,
       next_date,
       enabled
FROM   oceanbase.__all_virtual_tenant_scheduler_job
WHERE  tenant_id = {tenant_id}
       AND job_name IN ( 'MONDAY_WINDOW', 'TUESDAY_WINDOW', 'WEDNESDAY_WINDOW',
                            'THURSDAY_WINDOW',
                     'FRIDAY_WINDOW', 'SATURDAY_WINDOW', 'SUNDAY_WINDOW' )
       AND job != 0; 


-- 查询目标租户上一次调度执行情况, 主要检查 code 字段是否为 0 （错误码为 0 表示 success）:

SELECT *
FROM OCEANBASE.__ALL_VIRTUAL_TENANT_SCHEDULER_JOB_RUN_DETAIL
WHERE tenant_id = {tenant_id}
ORDER BY time;
```

+ **MySQL 模式的普通租户:**

```sql
-- 查询当前租户所有窗口是否正常在调度执行:

SELECT job_name,
       job_action,
       start_date,
       last_start_date,
       next_run_date,
       enabled
FROM   oceanbase.dba_scheduler_jobs
WHERE  job_name IN ( 'MONDAY_WINDOW', 'TUESDAY_WINDOW', 'WEDNESDAY_WINDOW',
                     'THURSDAY_WINDOW',
                     'FRIDAY_WINDOW', 'SATURDAY_WINDOW', 'SUNDAY_WINDOW' ); 

-- 查询当前租户上一次调度执行情况（code 字段是否为 0）:

SELECT *
FROM OCEANBASE.__ALL_TENANT_SCHEDULER_JOB_RUN_DETAIL
ORDER BY time;
```

如果上述查询结果调度异常，可以将该报错问题反馈给 OceanBase 社区论坛的官方值班同学。

## 自动收集卡在超大表运维手段 {#自动收集卡在超大表运维手段}
当前业务场景中有比较多的租户，因为有一个大表收集缓慢，导致自动收集任务失败，是否是这个原因导致可通过 [“自动统计信息收集问题排查”](#自动统计信息收集问题排查) 来确认，当确认是某个大表所导致的问题，可以使用如下策略进行运维：

+ **步骤一：使用如下 SQL 检查当前大表过去一段时间的收集情况，观察是否都是一个收集耗时长的过程，如果查询 sys 租户的 ret_code 字段非 0 表示收集失败，查询业务租户视图的 status 字段非 'SUCCESS' 或者 NULL 表示收集失败**

```sql
-- sys 租户

SELECT *
FROM   oceanbase.__all_virtual_table_opt_stat_gather_history
WHERE  table_id = {table_id}
ORDER  BY start_time; 

-- MySQL 模式的普通租户

SELECT *
FROM   oceanbase.dba_ob_table_opt_stat_gather_history
WHERE  table_name = '{table_name}'
ORDER  BY start_time;
```

+ **步骤二：可以考虑大表的收集策略，参考这个标准：**[“大表统计信息收集策略调整“](#大表统计信息收集策略调整)

+ **步骤三：调整完收集策略之后，需要明确是否有必要重新手动收集一次该表的统计信息。如果该表统计信息过期很严重，相关查询的计划生成都有问题，则可以考虑看系统资源是否充足，加大并行收集统计信息；其他情况如果想确认下步骤二设置的策略能否有效，推算自动统计信息收集能发成功，则可以使用如下查询**

```plsql
-- MySQL 模式的普通租户
-- 为了稳定，本次收集统计信息不刷新 plan cache 重新生成计划
call dbms_stats.gather_table_stats('database_name','table_name', no_invalidate=>true);              
```

+ **步骤四：如果当前租户已经长时间出现大表收集卡住的问题，可以通过 [“快速获取当前租户中统计信息过期或者统计信息缺失的表”](#快速获取当前租户中统计信息过期或者统计信息缺失的表) 中的方式查询当前租户中是否已经存在大量表统计信息缺失或者过期的问题，如果存在则需要在<font color="red">业务低峰期</font>手动重新收集相关表的统计信息（参考《手动统计信息收集命令使用手册》 ）。**

+ **步骤五：以上步骤完成之后，最后一步可以考虑调整自动统计信息收集发起任务的时间，<font color="red">尽量错开业务的高峰期，放到每日合并之后进行</font>。调整自动收集任务时间参考：[调整自动统计信息收集的调度时间](#调整自动统计信息收集的调度时间)**

如果上述步骤有不清楚的地方，或者操作过程有异常的问题，请联系 OceanBase 社区论坛值班同学协助排查。

## 统计信息常用运维手段
### 禁止/启用自动统计信息收集
通过如下方式进行禁止或启用自动统计信息收集，同时需要注意的是启用自动统计信息收集之后需要重新调整。

```sql
-- MySQL 租户:
-- 禁止
call dbms_scheduler.disable('MONDAY_WINDOW');
call dbms_scheduler.disable('TUESDAY_WINDOW');
call dbms_scheduler.disable('WEDNESDAY_WINDOW');
call dbms_scheduler.disable('THURSDAY_WINDOW');
call dbms_scheduler.disable('FRIDAY_WINDOW');
call dbms_scheduler.disable('SATURDAY_WINDOW');
call dbms_scheduler.disable('SUNDAY_WINDOW');

-- 启用
call dbms_scheduler.enable('MONDAY_WINDOW');
call dbms_scheduler.enable('TUESDAY_WINDOW');
call dbms_scheduler.enable('WEDNESDAY_WINDOW');
call dbms_scheduler.enable('THURSDAY_WINDOW');
call dbms_scheduler.enable('FRIDAY_WINDOW');
call dbms_scheduler.enable('SATURDAY_WINDOW');
call dbms_scheduler.enable('SUNDAY_WINDOW');
```

### 快速获取当前租户中统计信息过期或者统计信息缺失的表 {#快速获取当前租户中统计信息过期或者统计信息缺失的表}
通过如下查询，可以在业务租户中查询统计信息缺失或者过期的表，并且按照数据量排序：

```sql
-- MySQL 租户

SELECT v2.database_name,
       v2.table_name,
       Sum(inserts - deletes) row_cnt
FROM   oceanbase.dba_tab_modifications v1,
       (SELECT DISTINCT database_name AS DATABASE_NAME,
                        table_name    AS table_name
        FROM   oceanbase.dba_ob_table_stat_stale_info
        WHERE  is_stale = 'YES'
               AND database_name != 'oceanbase') v2
WHERE  v1.table_name = v2.table_name
GROUP  BY v2.database_name,
          v2.table_name
ORDER  BY row_cnt; 
```

### 大表统计信息收集策略调整 {#大表统计信息收集策略调整}
针对大表的统计信息收集，其收集耗时主要在三个地方：

1. **表数据量大，收集需要全表扫，耗时高；**

2. **直方图收集涉及复杂的计算，带来额外成本的耗时；**

3. **大分区表默认收集二级分区、一级分区、全表的统计信息和直方图，3 * (cost (全表扫) + cost (直方图))代价（<font color="red">内核422及其以上的版本已优化，421版本暂未解决</font>）**

因此根据上述耗时点，可以根据表的实际情况及相关查询情况进行优化，给出如下建议：

+ 设置合适的默认收集并行度，需要注意的是设置并行度之后，需要调整相关的自动收集任务在业务低峰期进行（[“调整自动统计信息收集的调度时间”](#调整自动统计信息收集的调度时间)），避免影响业务，**<font color="red">建议并行度控制 8 个以内。</font>** 可使用如下方式设置：

```sql
-- MySQL 租户：
call dbms_stats.set_table_prefs('database_name', 'table_name', 'degree', '8');
```

+ 设置默认列的直方图收集方式，考虑给数据分布均匀的列设置不收集直方图：

```sql
-- MySQL 租户

-- 1.如果该表所有列的数据分布都是均匀的，可以使用如下方式设置所有列都不收集直方图：

call dbms_stats.set_table_prefs('database_name', 'table_name', 'method_opt', 'for all columns size 1');

-- 2.如果该表仅极少数列数据分布不均匀，需要收集直方图，其他列都不需要，则可以使用如下方式设置(c1,c2收集直方图，c3,c4,c5不收集直方图)

call dbms_stats.set_table_prefs('database_name', 'table_name', 'method_opt', 'for columns c1 size 254, c2 size 254, c3 size 1, c4 size 1, c5 size 1');
```

+ 设置默认分区表的收集粒度，针对一些分区表，形如 hash 分区/ key 分区之类的，可以考虑只收集全局的统计信息，或者也可以设置分区推导全局的收集方式：

```sql
-- MySQL租户

-- 1.设置只收集全局的统计信息
call dbms_stats.set_table_prefs('database_name', 'table_name', 'granularity', 'GLOBAL');

-- 2.设置分区推导全局的收集方式
call dbms_stats.set_table_prefs('database_name', 'table_name', 'granularity', 'APPROX_GLOBAL AND PARTITION');
```

+ **<font color="red">慎用设置大表采样的方式收集统计信息，设置大表采样收集时，直方图的样本数量也会变得很大，存在适得其反的效果，设置采样的方式收集仅仅适合只收集基础统计信息，不收集直方图的场景</font>**

```sql
-- MySQL 租户，删除 granularity

-- 1.设置所有列都不收集直方图：
call dbms_stats.set_table_prefs('database_name', 'table_name', 'method_opt', 'for all columns size 1');

-- 2.设置采样比例为 10%
call dbms_stats.set_table_prefs('database_name', 'table_name', 'estimate_percent', '10');
```

      除此之外，如果需要清空 / 删除已设置的默认收集策略，只需要指定清除的属性即可。可以使用如下方式：

```sql
-- MySQL 租户，删除 granularity

call dbms_stats.delete_table_prefs('database_name', 'table_name', 'granularity');
```

     如果设置好了相关收集策略，需要查询是否设置成功，可以使用如下方式查询：

```sql
-- MySQL 租户，如获取指定的并行度 degree

select dbms_stats.get_prefs('degree', 'database_name','table_name') from dual;
```
除了上述方式以外，也可以考虑能否手动收集完大表统计信息之后，锁定相关的统计信息，具体场景及使用方式参考：[如何锁定统计信息，避免统计信息更新](#如何锁定统计信息，避免统计信息更新)

### 如何锁定统计信息，避免统计信息更新 {#如何锁定统计信息，避免统计信息更新}
针对一些整体数据分布变化不太大，想要维持相关表的查询计划稳定，可以使用如下的方式考虑锁定 / 解锁表的统计信息：

```sql
-- MySQL 租户, 锁定表的统计信息
call dbms_stats.lock_table_stats('database_name', 'table_name');

-- MySQL 租户, 解锁表的统计信息
call dbms_stats.unlock_table_stats('database_name', 'table_name');
```

**<font color="red">需要注意的是当表的统计信息锁定之后，自动收集将不会更新，适用于一些对数据变化不太大、数据值不敏感的场景。</font>** 如果需要重新收集锁定的统计信息，需要先将其解锁。

### 统计信息收集慢的策略调整
如果在表的统计信息收集过程中，感觉表收集很慢，可以按照如下策略调整统计信息收集策略：

1. **<font color="red">优先选择关闭直方图的收集</font>**（method_opt => 'for all columns size 1'），因为现阶段收集直方图是最费时的操作，同时很多场景目前也还用不上直方图。可以通过如下命令直接设置表不收集直方图：

```sql
call dbms_stats.set_table_prefs('database_name', 
                                'table_name', 
                                'method_opt', 
                                'for all columns size 1');
```

2. **<font color="red">增加并行度（degree=>xx）</font>**，在业务低峰期可以考虑适当增加并行度，加速统计信息的收集。
3. 可以使用PARTITION的方式收集统计信息

同时，**<font color="red">不建议直接调整 estimate_percent 这个选项</font>**。默认情况下，直方图收集是采样少量数据后计算的；如果调整了这个配置项，直方图会直接根据这里指定的比例进行采样收集。这反而会大幅度拖慢直方图的收集，同时基础统计信息收集也没有那么准确。

## 参考资料
- [OceanBase 官网文档：统计信息和估行机制](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001576721)

- [OceanBase 社区论坛](https://ask.oceanbase.com/)
