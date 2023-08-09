---
title: 如何快速定位SQL问题
weight: 14
---
# **如何快速定位SQL问题**

大家在使用数据库的过程中，经常遇到慢sql，或者执行错误的sql，有些sql是很容易判断出来错误，以及sql运行比较慢的原因，但是有些sql就很难判断出来，如果遇到这种情况，我们该怎么处理，怎么判断SQL出错原因，以及是SQL需要优化，数据库本身配置是否设置好等，接下来我就跟大家简单介绍下，如何快速定位SQL问题。在开始之前，我们先来了解下一条SQL，在进入OceanBase数据库中执行时都经历了哪些模块。
## **访问路径**
首先我们从SQL的访问路径开始介绍，一条SQL从应用发出之后，一般会经过负载均衡（根据情况选择是否需要），然后到OBProxy，然后再到OBServer。大概流程如下图所示：
![image.png](/img/operation_maintenance/how_to_find_traceid/a.png)
OBProxy主要起到一个路由转发的作用，以及快速解析，根据OceanBase数据库中数据副本分布情况，直接将请求快速发送到对应的OBServer上。
SQL在进入OBServer之后，还会经历数据库内部很多模块，具体如下：
![image.png](/img/operation_maintenance/how_to_find_traceid/b.png)

SQL的在数据库内部的执行过程，这些模块具体的含义，可以参考官网文档：[SQL 请求执行流程](https://www.oceanbase.com/docs/common-oceanbase-database-1000000000033661)，在整个SQL执行过程中，会首先根据SQL的ip、port、自增序列号等信息生成一个全局唯一的trace_id，后续的sql跟踪，我们都使用这个trace_id来对sql进行定位追踪。

## **SQL错误**
这种问题一般都比较好处理，大多都是sql写的格式不对，或者库、表、列名等不存在，或者OceanBase语法不支持等，一般情况，根据返回的错误信息，就大致可以判断出错误原因。
但也有一些很隐蔽的错误，一时很难判断出具体是哪里错了，这个时候就要借助错误日志来帮助我们进行判断了，这里就举一个例子，这是在一个用户那里实实在在遇到的问题，用户的场景比较复杂，拿OceanBase用来做数据的清洗，将多张表进行关联计算，然后将数据写入到结果表中，而在执行其中一条SQL过程中，收到了这样一个报错：
```sql
ERROR 1292 (22007): Incorrect value 
```
当时用户收到这个报错后很茫然，因为用户的SQL长达200多行，并且有多层嵌套子查询和多张表关联查询，所以一时间很难判断出来是哪里出现了错误，SQL大致如下（脱敏后）：
```sql
REPLACE INTO abc.table1(
  m_id,
  st_id,
  con_id,
  `date`,
  t_ord,
  t_role,
  tag,
  con_pri,
  con_qu,
  con_in,
  update_time
)
SELECT 
	tmp5.m_id,
	tmp5.st_id,
	tmp5.con_id,
	tmp5.`date`,
	tmp5.t_ord_96,
	tmp5.t_role,
	tmp5.tag,
	cast(sum(tmp5.con_pri) as decimal(20,6)) as con_pri,
	cast(sum(tmp5.con_qu) as decimal(20,6)) as con_qu,
	cast(sum(tmp5.con_in) as decimal(20,6)) as con_in,
	current_timestamp
FROM 
	(
    SELECT 
    tmp4.m_id,
    tmp4.st_id,
    tmp4.con_id,
    tmp4.`date`,
    tmp4.t_ord,
    dstl2.t_ord_96,
    tmp4.t_role,
    tmp4.tag,
    case
    when tmp4.t_ord = dstl2.t_ord_96 then con_pri
    else 0
    end as con_pri,
    case
    when tmp4.t_ord = dstl2.t_ord_96 then con_qu
    else 0
    end as con_qu,
    case
    when tmp4.t_ord = dstl2.t_ord_96 then con_in
    else 0
    end as con_in
    FROM 
    (
      SELECT
      tmp3.m_id,
      tmp3.st_id,
      tmp3.con_id,
      tmp3.`date`,
      tmp3.t_ord_96 as t_ord,
      tmp3.t_role,
      tmp3.tag,
      tmp3.con_pri,
      cast(tmp3.con_qu as decimal(20,6)) as con_qu,
      cast(tmp3.con_qu * tmp3.con_pri as decimal(20,6)) as con_in
      FROM
      (
        SELECT 
        tmp2.m_id,
        tmp2.st_id,
        tmp2.con_id,
        tmp2.`date`,
        tmp2.t_ord_96,
        case
        when tmp2.con_name like '%xxx%' then 1
        when tmp2.con_name like '%x%' then 2
        when tmp2.con_name like '%xx%' then 3
        else
        case
        when tmp2.contract_type_name like '%xx%' then 4
        else 5
        end
        end as tag,
        case 
        when tmp2.con_name like '%xxxxx%' then tmp2.vendee_price
        else tmp2.sale_price
        end as con_pri,
        case 
        when tmp2.con_name like '%xxxxx%' then tmp2.vendee_energy
        else tmp2.sale_energy
        end as con_qu,
        tmp2.t_role
        FROM
        (
          select 
          tmp.m_id,
          tmp.st_id,
          tmp.st_name,
          tmp.member_id,
          tmp.con_id,
          tmp.con_name,
          dd.`date`,
          tmp.t_ord_96,
          tmp.sale_energy / (datediff(tmp.timepart_endtime, tmp.timepart_starttime) + 1) / tmp.re as sale_energy,
          tmp.sale_price,
          tmp.vendee_energy / (datediff(tmp.timepart_endtime, tmp.timepart_starttime) + 1) / tmp.re as vendee_energy,
          tmp.vendee_price,
          tmp.timepart_starttime,
          tmp.timepart_endtime,
          tmp.seller_member_name,
          tmp.contract_type_name,
          tmp.t_role
          from
          (
            select 
            tmp1.*,
            dstl.t_ord_96,
            count(1) over(PARTITION by member_id, con_id, time_division_range, timepart_endtime, timepart_starttime) as re
            from 
            (
              select 
              distinct 
              spcdp.m_id,
              ds.st_id,
              ds.st_name,
              spcdp.member_id, 
              spcdp.con_id,
              dc.con_name,
              spcdp.sale_energy, 
              spcdp.sale_price, 
              spcdp.vendee_energy, 
              spcdp.vendee_price, 
              spcdp.time_division_code,
              spcdp.time_division_name,
              case
              when dc.con_name like '%xx%' then 
              case 
              when substr(date_add(cast(concat('2022-10-01 ', right(spcdp.time_division_range, 5), ':00') as datetime), interval 1 hour), 12, 5) = '00:00' then concat(left(spcdp.time_division_range, 6), '24:00')
              else concat(left(spcdp.time_division_range, 6), substr(date_add(cast(concat('2022-10-01 ', right(spcdp.time_division_range, 5), ':00') as datetime), interval 1 hour), 12, 5))
              end
              else spcdp.time_division_range
              end as time_division_range, 
              spcdp.timepart_endtime,
              spcdp.timepart_starttime,
              dc.seller_member_name,
              dc.contract_type_name,
              case 
              when locate('x',dc.con_name) > 0 then 1
              when locate('x',dc.con_name) > 0 then 2
              else if(dc.con_qu>0,2,1)
              end as t_role
              from 
              (select distinct m_id, member_id, con_id, sale_energy, sale_price, vendee_energy, vendee_price, time_division_code, time_division_name, time_division_range, timepart_endtime, timepart_starttime from 
               select 
               DISTINCT
               if(spcdp.m_id is null,spcdpa.m_id,spcdp.m_id) as m_id,
               if(spcdp.member_id is null,spcdpa.member_id,spcdp.member_id) as member_id,
               if(spcdp.con_id is null,spcdpa.con_id,spcdp.con_id) as con_id,
               if(spcdp.sale_energy is null,spcdpa.sale_energy,spcdp.sale_energy) as sale_energy,
               if(spcdp.sale_price is null,spcdpa.sale_price,spcdp.sale_price) as sale_price,
               if(spcdp.vendee_energy is null,spcdpa.vendee_energy,spcdp.vendee_energy) as vendee_energy,	
               if(spcdp.vendee_price is null,spcdpa.vendee_price,spcdp.vendee_price) as vendee_price,
               if(spcdp.time_division_code is null,spcdpa.time_division_code,spcdp.time_division_code) as time_division_code,
               if(spcdp.time_division_name is null,spcdpa.time_division_name,spcdp.time_division_name) as time_division_name,
               if(spcdp.time_division_range is null,spcdpa.time_division_range,spcdp.time_division_range) as time_division_range,
               if(spcdp.timepart_endtime is null,spcdpa.timepart_endtime,spcdp.timepart_endtime) as timepart_endtime,
               if(spcdp.timepart_starttime is null,spcdpa.timepart_starttime,spcdp.timepart_starttime) as timepart_starttime,
               if(spcdp.creator is null,spcdpa.creator,spcdp.creator) as creator,
               if(spcdp.creation_time is null,spcdpa.creation_time,spcdp.creation_time) as creation_time,
               if(spcdp.modifier is null,spcdpa.modifier,spcdp.modifier) as modifier,
               if(spcdp.modification_time is null,spcdpa.modification_time,spcdp.modification_time) as modification_time
               from
               (
                 select * from ods.table2 where modification_time >= date_format(date_sub(current_date, interval 1 day), '%Y-%m-%d %T')
               ) spcdp  
               full join 
               (
                 select * from ods.table2_xxx where modification_time >= date_format(date_sub(current_date, interval 1 day), '%Y-%m-%d %T')
               ) spcdpa  
               on spcdp.m_id = spcdpa.m_id and spcdp.member_id = spcdpa.member_id and spcdp.con_id = spcdpa.con_id
               and spcdp.time_division_code = spcdpa.time_division_code and spcdp.timepart_starttime = spcdpa.timepart_starttime
               and spcdp.timepart_endtime = spcdpa.timepart_endtime
              )
              where m_id = 'PXBGS' and time_division_range <> '') spcdp
            inner join (select * from abc.table3 where service_provider_id = 1) ds on spcdp.member_id = ds.counterparty_code
            inner join (select * from abc.table4 where is_deleted <> 1) dc on spcdp.con_id = dc.con_id and ds.st_id = dc.st_id 
            and date(spcdp.timepart_starttime) between dc.contract_start_date and dc.contract_end_date
          ) tmp1
          left join 
          (
            select
            t_ord_96,
            CASE 
            when end_time_96 = '00:00:00' then '24:00'
            else left(end_time_96, 5)
            END as end_time_96
            from 
            abc.dim_spot_time_list
          ) dstl on dstl.end_time_96 > left(tmp1.time_division_range, 5) and dstl.end_time_96 <= right(tmp1.time_division_range, 5)
        ) as tmp
        left join abc.dim_date dd on dd.`date` BETWEEN date(tmp.timepart_starttime) and date(timepart_endtime)
      ) as tmp2
    ) as tmp3
    where tmp3.t_ord_96 is not null and tmp3.con_id <> 'xxxxxxxxxxxx' 
  ) as tmp4
		left join abc.dim_spot_time_list dstl2 on 1 = 1
	) as tmp5
	group by tmp5.m_id, tmp5.st_id, tmp5.con_id, tmp5.`date`, tmp5.t_ord_96, tmp5.t_role, tmp5.tag;

```
从这个SQL文本来看，整体还是比较复杂，想快速找到问题根因还是比较困难，这个时候就需要我们根据SQL执行过程中的trace_id，来一步步追踪问题的根因。
这里先说结论，通过对日志过滤排查，我们发现是字段类型强转，导致转出来的日期字段是无效的，所以报除了这个错误，当时获取到的日志如下（部分截取）：

```markdown
[2023-07-19 14:24:27.757645] WARN  [LIB.TIME] str_to_ob_time_with_date (ob_time_convert.cpp:1938) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=16] datetime is invalid or out of range(ret=-4219, str=2022-10-01 24:00:00, ob_time={mode_:3, parts:[2022, 10, 1, 24, 0, 0, 0, 0, 0, 0, 0], tz_name:"", tzd_abbr:"", time_zone_id:-1, transition_type_id:-1, is_tz_name_valid:false}, date_sql_mode={allow_invalid_dates:0, no_zero_date:0}, lbt()=0xb553efb 0xb4b501f 0xb4a0a96 0xb4a0731 0x80360d3 0x807ed03 0x8098f84 0x61dc801 0x8098f84 0x804c103 0x8098f84 0x7e3b29f 0x8098f84 0x686dcc7 0x8098f84 0x6669ef4 0x8098f84 0x7373827 0x7373e77 0x74e80f3 0x755c04b 0x756110c 0x7563293 0x737face 0x6eb659d 0x6eb7931 0x6ebf317 0x737face 0x743726d 0x737face 0x69a057d 0x737face 0x69ed74b 0x699f2b4 0x69df421 0x39cbc45 0x7a5d60f 0x7a5cd06 0x7a5b37d 0x7a94139 0x7a48812 0x7a2b8cb 0x7a2a815 0x3bbaed5 0x392f401 0x4602029 0x39277e4 0x46025c7 0xb5380c7 0xb53303a 0x7f1759d17ea5 0x7f1759a40b0d)
[2023-07-19 14:24:27.757663] WARN  [LIB.TIME] str_to_datetime (ob_time_convert.cpp:398) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=18] failed to convert string to datetime(ret=-4219)
[2023-07-19 14:24:27.757667] WARN  [SQL] common_string_datetime (ob_datum_cast.cpp:1104) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=4] str_to_datetime failed(ret=-4219, in_str=2022-10-01 24:00:00)
[2023-07-19 14:24:27.757671] WARN  [SQL] string_datetime (ob_datum_cast.cpp:2406) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=3] fail to exec common_string_datetime(expr, ObString(child_res->len_, child_res->ptr_), ctx, res_datum)(ret=-4219)
[2023-07-19 14:24:27.757673] WARN  [SQL] anytype_anytype_explicit (ob_datum_cast.cpp:6263) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=3] inner cast failed(ret=-4219)
[2023-07-19 14:24:27.757676] WARN  [SQL] eval_param_value (ob_expr.h:944) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=2] evaluate parameter failed(ret=-4219, param_index=0)
[2023-07-19 14:24:27.757679] WARN  [SQL.ENG] calc_date_adjust (ob_expr_date_add.cpp:144) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=2] eval param value failed
[2023-07-19 14:24:27.757682] WARN  [SQL] datetime_string (ob_datum_cast.cpp:3524) [7526][T1004_TNT_L0_G0][T1004][YB42AC116182-00060043C87B7F7D-0-0] [lt=2] eval arg failed(ret=-4219, ctx={batch_idx:8, batch_size:136, max_batch_size:256, frames_:0x7f12f57f0f90})
........
```

从日志的第一行，我们就可以看到datetime is invalid or out of range的报错，在这里就基本可以判断是datetime类型有问题，第二行的提示则更明显：failed to convert string to datetime，所以我们很快就可以定位到是在做string转datetime类型的时候，出现了错误，通过回看SQL可以找到，有两处使用cast函数来做字符串类型转时间类型的转换，然后根据用户提供的表数据，我们对问题进行复现，确信就是这里的错误。SQL中类型转换如下：
```sql
cast(concat('2022-10-01 ', right(spcdp.time_division_range, 5), ':00') as datetime)
```

那我们是怎么快速找到这条日志的呢，下面我把问题简化，重新复现报错现场，看下是怎么一步步找到关键日志，发现问题的。具体如下，简单创建两张表:
t1表：
```sql
CREATE TABLE `t1` (
  `a_id` int(11) DEFAULT NULL,
  `a_name` varchar(10) DEFAULT NULL,
  `a_time` varchar(10) DEFAULT NULL
)
```
t2表：
```sql
CREATE TABLE `t2` (
  `t_id` int(11) DEFAULT NULL,
  `t_name` varchar(10) DEFAULT NULL,
  `t_time` datetime DEFAULT NULL
)
```
其中t2表，是目标写入表，t1表是源数据表，t1表和t2表区别主要是第三个字段的类型不一样，一个是varchar，一个是datetime类型，源数据表t1中数据如下：
```sql
obclient [test]> select * from t1;
+------+--------+--------+
| a_id | a_name | a_time |
+------+--------+--------+
|    1 | test   | 24:00  |
+------+--------+--------+
1 row in set (0.011 sec)
```
模拟数据清洗并写入
```sql
obclient [test]> insert into t2 select a_id, a_name,cast(concat('2022-10-10 ', right(tb.a_time,5), ':00') as datetime) from t1 tb;
ERROR 1292 (22007): Incorrect value
```
可以看到出现了类似的报错，接下来我们就需要去日志里定位到这个报错，因为OceanBase的日志打印比较多，如果直接去找是很难快速定位到跟这条SQL相关的日志，这里就需要用到trace_id。前面我们说到每条SQL进入到数据库，都会产生一个唯一的trace_id，那这个trace_id是怎么获取呢，这里有几种方式：
方式一：
在SQL执行完成之后，通过select last_trace_id();获取
```sql
obclient [test]> select last_trace_id();
+-----------------------------------+
| last_trace_id()                   |
+-----------------------------------+
| YB42AC18FF11-0005FE3D398CC982-0-0 |
+-----------------------------------+
1 row in set (0.001 sec)
```
方式二：
通过查询 GV$OB_SQL_AUDIT 审计视图查询获取，根据query_sql字段过滤查询的关键字，获取对应的trace_id，关于审计视图的各字段含义，可参考官方文档：[GV$OB_SQL_AUDIT](https://www.oceanbase.com/docs/common-oceanbase-database-1000000000035692)
```sql
obclient [test]> select SVR_IP,SVR_PORT,TRACE_ID,,TENANT_NAME,SQL_ID,QUERY_SQL 
    ->     from oceanbase.gv$ob_sql_audit
    ->     where query_sql like "%right(tb.a_time,5)%"\G;
*************************** 1. row ***************************
                         SVR_IP: 172.24.255.17
                       SVR_PORT: 2882
                       TRACE_ID: YB42AC18FF11-0005FE3D398CC982-0-0
                    TENANT_NAME: obtest
                         SQL_ID: D8F4A48653895C3AAACE903CA04EDD21
                      QUERY_SQL: insert into t2 select a_id, a_name,cast(concat('2022-10-10 ', right(tb.a_time,5), ':00') as datetime) from t1 tb
1 rows in set (0.224 sec)
```
方式三：
开启enable_rich_error_msg参数，不过这个是集群级别的，需要在sys租户下开启
开启方式：
```sql
alter system set enable_rich_error_msg=true;
```
在开启之后，如果SQL执行报错，会自动返回trace_id和ip信息
```sql
obclient [test]> insert into t2 select a_id, a_name,cast(concat('2022-10-10 ', right(tb.a_time,5), ':00') as datetime) from t1 tb;
ERROR 1292 (22007): Incorrect value
[172.24.255.17:2882] [2023-08-03 20:42:36.361996] [YB42AC18FF11-0005FE3D398CC986-0-0]
```

以上三种方式，我们一般会采用第二种方式，方式一只能获取到trace_id，但是获取不到OBServer的IP信息，因为OceanBase为分布式数据库，一套集群一般会有多个OBServer节点，如果没有IP信息，我们很难得知这条SQL是在哪个OBServer节点上执行的。所以是需要这个IP信息方便我们拿着trace_id直接去机器上过滤日志。方式三需要开启集群级别的参数，有的租户并不一定需要这个，并且展示信息相对较少。
通过获取到的trace_id，以及SVR_IP信息，我们直接到172.24.255.17这台机器的/home/admin/oceanbase/log目录下，过滤observer.log，得到如下日志：

```markdown
[root@ob1 log]# grep "YB42AC18FF11-0005FE3D398CC982-0-0" observer.log
[2023-08-03 20:36:01.943682] WDIAG [LIB.TIME] str_to_ob_time_with_date (ob_time_convert.cpp:1948) [24791][T1012_L0_G0][T1012][YB42AC18FF11-0005FE3D398CC982-0-0] [lt=14][errcode=-4219] datetime is invalid or out of range(ret=-4219, str=2022-10-10 24:00:00, ob_time={mode_:3, parts:[2022, 10, 10, 24, 0, 0, 0, 0, 0, 0, 0], tz_name:"", tzd_abbr:"", time_zone_id:-1, transition_type_id:-1, is_tz_name_valid:false}, date_sql_mode={allow_invalid_dates:0, no_zero_date:0}, lbt()=0xf0bba8c 0xec2b439 0xec175b5 0xec17245 0xb24a08c 0xb2c0cb8 0x41329cc 0xb23d520 0xb2d4359 0x3fbefb0 0xa55f81d 0x3fbe901 0x411b7eb 0x9f87f2e 0x411b290 0x3fb8c7d 0x3ffbe9a 0x7f29409 0x3fb334e 0x3fb0562 0x3fabed9 0x3fa9d9a 0x3fa6768 0x6a0ad14 0xf3666c7 0xf35faca 0x7fc02405fea5 0x7fc023d88b0d)
[2023-08-03 20:36:01.943700] WDIAG [LIB.TIME] str_to_datetime (ob_time_convert.cpp:397) [24791][T1012_L0_G0][T1012][YB42AC18FF11-0005FE3D398CC982-0-0] [lt=19][errcode=-4219] failed to convert string to datetime(ret=-4219)
[2023-08-03 20:36:01.943705] WDIAG [SQL] common_string_datetime (ob_datum_cast.cpp:1190) [24791][T1012_L0_G0][T1012][YB42AC18FF11-0005FE3D398CC982-0-0] [lt=4][errcode=-4219] str_to_datetime failed(ret=-4219, in_str=2022-10-10 24:00:00)
[2023-08-03 20:36:01.943709] WDIAG [SQL] string_datetime (ob_datum_cast.cpp:2838) [24791][T1012_L0_G0][T1012][YB42AC18FF11-0005FE3D398CC982-0-0] [lt=4][errcode=-4219] fail to exec common_string_datetime(expr, ObString(child_res->len_, child_res->ptr_), ctx, res_datum)(ret=-4219)
[2023-08-03 20:36:01.943712] WDIAG [SQL] anytype_anytype_explicit (ob_datum_cast.cpp:8389) [24791][T1012_L0_G0][T1012][YB42AC18FF11-0005FE3D398CC982-0-0] [lt=3][errcode=-4219] inner cast failed(ret=-4219)
[2023-08-03 20:36:01.943715] WDIAG [SQL] cast_eval_arg_batch (ob_datum_cast.cpp:2306) [24791][T1012_L0_G0][T1012][YB42AC18FF11-0005FE3D398CC982-0-0] [lt=3][errcode=-4219] fail to eval one row(ret=-4219, i=0)
.......
```

从日志的前两行中，可以看到这次的报错，和用户日志中过滤出来的报错是一样的，因此我们就可以判断是这里的cast转换出现了错误。
这里为什么这样转换是不行的呢，我们可以看到在t1表中，a_time字段是varchar类型，具体数值是 24:00 ，通过concat('2022-10-10 ', right(tb.a_time,5), ':00') 拼接之后，组成的字符串是 "2022-10-10 24:00:00" ，乍一看貌似没有什么问题，但为什么会转换失败？实际我们细心观察就会发现，2022-10-10 24:00:00 在计算机中是一个非法时间，2022-10-10 24:00:00 其实已经到 2022-10-11 00:00:00，所以这块我们建议用户对这个字符串做下修改，不要使用24:00:00。
修改之后我们再来看一下执行情况。
首先t1表内容
```sql
obclient [test]> select * from t1;
+------+--------+--------+
| a_id | a_name | a_time |
+------+--------+--------+
|    1 | test   | 00:00  |
+------+--------+--------+
1 row in set (0.001 sec)
```
再次执行写入
```sql
obclient [test]> insert into t2 select a_id, a_name,cast(concat('2022-10-11 ', right(tb.a_time,5), ':00') as datetime) from t1 tb;
Query OK, 1 row affected (0.003 sec)

obclient [test]> select * from t2;
+------+--------+---------------------+
| t_id | t_name | t_time              |
+------+--------+---------------------+
|    1 | test   | 2022-10-11 00:00:00 |
+------+--------+---------------------+
1 row in set (0.001 sec)
```
可以看到执行写入成功，问题得以解决。
在实际生产过程中，我们还会遇到其他很多类型的错误，大多都是可以通过这种方式快速定位和解决问题。另外还有一种情况，就是我们遇到了慢SQL，导致整个数据库系统变卡，也影响到其他SQL的执行。下面就来看下如何快速定位慢SQL。

## **慢SQL**
慢SQL对于DBA来说，一直是一个比较头疼的地方，当遇到慢SQL的时候，总是需要想各种办法去优化慢SQL，如果不快速优化，就会引发一系列问题，那么在OceanBase中我们如何判断是慢SQL，以及如何发现慢SQL呢。
OceanBase中有一个参数 trace_log_slow_query_watermark 用来设置慢SQL的阈值，当SQL的执行超过这个阈值，那么OceanBase就会认为这是一条慢SQL，然后被记录，这个值默认是 1 秒。

| 属性 | 描述 |
| --- | --- |
| 参数类型 | 时间类型 |
| 默认值 | 1s |
| 取值范围 | [1ms， +∞) |
| 是否重启 OBServer 生效 | 否 |

那么，这些慢SQL信息具体记录在哪些地方呢，我们如何快速找到它呢？
方式一：
首先，我们前面提到所有的SQL的执行都会记录在observer.log的日志里，慢SQL也不例外，在observer.log日志里，我们可以过滤 slow query 关键字，就能获取到执行超过 1 秒的慢SQL，例如下面这条日志

```markdown
[root@ob1 log]# grep "slow query" observer.log
[2023-08-04 11:05:36.254730] TRACE [TRACE] after_process (obmp_base.cpp:142) [14092][T1_L0_G0][T1][YB42AC18FF11-0005FE3E568CA6E9-0-0] [lt=14] 
[slow query](TRACE=begin_ts=1691118333740472 2023-08-04 03:05:33.740472|[process_begin] u=0 in_queue_time:15, receive_ts:1691118333740456, enqueue_ts:1691118333740457
|[start_sql] u=0 addr:{ip:"127.0.0.1", port:23382}|[query_begin] u=1 trace_id:YB42AC18FF11-0005FE3E568CA6E9-0-0|[before_processor_run] u=3 
|[session] u=2 sid:3221725883, tenant_id:1|[calc_partition_location_begin] u=48 |[plc_serialize_begin] u=4 |[plc_serialize_end] u=5 
|[tl_calc_part_id_end] u=36 |[get_location_cache_begin] u=0 |[calc_partition_location_end] u=2 |[get_plan_type_end] u=1 |[pc_choose_plan] u=2 
|[check_priv] u=4 |[plan_id] u=1 plan_id:18101|[do_open_plan_begin] u=2 plan_id:18101|[sql_start_stmt_begin] u=0 |[sql_start_stmt_end] u=0 
|[exec_plan_begin] u=0 |[exec_plan_end] u=4 |[do_open_plan_end] u=0 |[get_row] u=1672 |[close_plan_begin] u=2512423 |[start_end_stmt] u=14 
|[end_stmt] u=0 |[close_plan_end] u=0 |[affected_rows] u=1 affected_rows:-1|[store_found_rows] u=0 found_rows:0, return_rows:296
|[auto_end_plan_begin] > u=0 |[auto_end_plan_end] u=2 |[query_end] u=19 |[process_end] u=10 run_ts:1691118333740476|total_timeu=2514256)
```

这条日志其实记录了很多信息，包括SQL的trace_id，以及执行总时间total_time和各个模块的执行时间。

方式二：
在OBProxy的日志目录里，专门有一个 obproxy_slow.log 的日志，这个日志也会记录所有的慢SQL信息，我们可以直接查看这个日志，发现执行慢的SQL

```markdown
2023-08-01 17:44:51.779606,odp,,,,obcluster:obtest:oceanbase,OB_MYSQL,,,OB_MYSQL_COM_QUERY,SELECT,success,,select /*+ ob_querytimeout(10000000000) */ sleep(5),5000864us,120us,0us,5000571us,Y0-00007FCC9D7BC3A0,YB42AC18FF13-0005FE3D2CBF2C76-0-0,,,0,172.24.255.19:2881
2023-08-03 14:30:47.370874,odp,,,,obcluster:obtest:test,OB_MYSQL,,,OB_MYSQL_COM_QUERY,SELECT,success,,select sleep(1),1011179us,86us,0us,1010966us,Y0-00007FCC9DBBD320,YB42AC18FF13-0005FE3D2CBF2CE3-0-0,,,0,172.24.255.19:2881
2023-08-03 16:41:08.255751,odp,,,,obcluster:obtest:test,OB_MYSQL,,,OB_MYSQL_COM_QUERY,DROP,success,,drop table chat_req_records,620960us,113us,0us,620687us,Y0-00007FCC9D7BD3E0,,,,0,172.24.255.19:2881
```

obproxy的慢SQL日志中总共有24个字段，根据这些字段，我们也可以获取到一些信息，有些字段为暂时留空，这些字段依次是

| 日志打印时间 | 2023-08-01 17:44:51.779606, |
| --- | --- |
| 当前应用名 | odp |
| TraceId | YB42AC18FF13-0005FE3D2CBF2C76-0-0 |
| RpcId | 
 |
| 逻辑数据源名称   | 
 |
| 物理库信息（cluster:tenant:database） | 
 |
| 数据库类型（OB/RDS） | obcluster:obtest:oceanbase |
| 逻辑表名 | OB_MYSQL |
| 物理表名 |  |
| SQL 命令（COM_QUERY、COM_STMT_PREPARE等） |  |
| SQL 类型（CRUD） | SELECT |
| 执行结果（success/failed） | success |
| 错误码（succ时为空） |  |
| SQL | select /*+ ob_querytimeout(10000000000) */ sleep(5) |
| 执行总耗时（ms，包括内部 SQL 执行耗时） | 5000864us |
| 预执行时间 | 120us |
| 链接建立时间 | 0us |
| 数据库执行时间 | 5000571us |
| 当前线程名（odp的内部线程ID） | Y0-00007FCC9D7BC3A0 |
| 系统穿透数据（系统灾备信息等） | YB42AC18FF13-0005FE3D2CBF2C76-0-0 |
| 穿透数据 |  |
| DBKey 名称 | 
 |
| 是否使用 BeyondTrust（version>= 2.0.20 1 是，0 否） | 0 |
| 后端 Server IP | 172.24.255.19:2881 |

方式三：
如果系统当前时段就很慢，可以查询正在执行的比较慢的SQL，通过视图 __all_virtual_processlist 根据 time 字段排序，获取当前系统中，正在执行的慢SQL。
查询SQL如下
```sql
SELECT USER,
   tenant,
   sql_id,
   concat(time, 's') as time,
   info,
   svr_ip,
   svr_port,
   trace_id
FROM __all_virtual_processlist
WHERE STATE = 'ACTIVE'
ORDER BY time DESC LIMIT 1
```
现在模拟一个慢SQL， select /*+ query_timeout(100000000) */ sleep(100);  查询结果如下
```sql
+------+--------+----------------------------------+------+---------------------------------------------------+---------------+----------+-----------------------------------+
| USER | tenant | sql_id                           | time | info                                              | svr_ip        | svr_port | trace_id                          |
+------+--------+----------------------------------+------+---------------------------------------------------+---------------+----------+-----------------------------------+
| root | obtest | DE47F6BC20D6E36C14AA4D90BDE3B083 | 2s   | select /*+ query_timeout(100000000) */ sleep(100) | 172.24.255.19 |     2882 | YB42AC18FF13-0005FE3D2CBF2D57-0-0 |
+------+--------+----------------------------------+------+---------------------------------------------------+---------------+----------+-----------------------------------+
1 row in set (0.003 sec)
```

方式四：
如果有OCP的话，也是可以在OCP上直接查看慢SQL，进到具体的租户下面，然后进到SQL诊断中，有慢SQL页面，这里的SQL文本，都是有相同SQL_ID的SQL
![image.png](/img/operation_maintenance/how_to_find_traceid/c.png)
这里再解释下SQL_ID，SQL_ID是每条SQL进入数据库之后，会根据SQL字符串生成一个md5值，所以执行相同的SQL 会有相同的SQL_ID，但是trace_id是不一样的。
想要查看某条SQL具体是哪次执行慢了，可以点击SQL文本进到下一个页面，拿到执行慢的那一次的 SQL 的trace_id。
![image.png](/img/operation_maintenance/how_to_find_traceid/d.png)

通过这几种方式，我们就可以很快获取到系统中执行的慢SQL，不过前两种方式和第四种方式只能获取到trace_id，而第三种方式可以直接获取到执行的SQL，以及SQL_ID。对于前两种方式，想要看具体的内容，还需要再进一步查询。这里又用到我们的 GV$OB_SQL_AUDIT 视图，可以根据视图中的trace_id直接定位到对应的SQL内容：
```sql
obclient [oceanbase]> select SVR_IP,SVR_PORT,TRACE_ID,TENANT_NAME,SQL_ID,QUERY_SQL,PLAN_ID
    ->     from gv$ob_sql_audit 
    ->     where trace_id = "YB42AC18FF13-0005FE3D2CBF2D57-0-0"\G;
*************************** 1. row ***************************
                         SVR_IP: 172.24.255.19
                       SVR_PORT: 2882
                       TRACE_ID: YB42AC18FF13-0005FE3D2CBF2D57-0-0
                    TENANT_NAME: obtest
                         SQL_ID: DE47F6BC20D6E36C14AA4D90BDE3B083
                      QUERY_SQL: select /*+ query_timeout(100000000) */ sleep(100)
                        PLAN_ID: 2518
1 row in set (0.146 sec)
```

通过这个查询，我们就知道了具体是哪条SQL执行慢了，并且获取到了SQL执行计划的PLAN_ID，接着就可以根据PLAN_ID去查找这条SQL的执行计划，根据执行计划再进一步排查
获取执行计划相关信息
```sql
obclient [oceanbase]> SELECT tenant_id,
    ->    svr_ip,
    ->    svr_port,
    ->    sql_id,
    ->    plan_id,
    ->    last_active_time,
    ->    first_load_time,
    ->    outline_data
    -> FROM GV$OB_PLAN_CACHE_PLAN_STAT
    -> WHERE TENANT_ID = 1012
    -> AND SQL_ID = 'DE47F6BC20D6E36C14AA4D90BDE3B083'
    -> AND SVR_IP = '172.24.255.19'
    -> AND SVR_PORT = 2882;
*************************** 1. row ***************************
       tenant_id: 1012
          svr_ip: 172.24.255.19
        svr_port: 2882
          sql_id: DE47F6BC20D6E36C14AA4D90BDE3B083
         plan_id: 2518
last_active_time: 2023-08-04 11:42:47.834366
 first_load_time: 2023-08-04 11:42:47.834366
    outline_data: /*+BEGIN_OUTLINE_DATA QUERY_TIMEOUT(100000000) OPTIMIZER_FEATURES_ENABLE('4.0.0.0') END_OUTLINE_DATA*/
1 row in set (0.019 sec)
```

得到这个查询的执行计划的编号（plan_id），这个执行计划第一次生成的时间（first_load_time）以及最后一次被使用的时间（last_active_time）

接着，就可以根据plan_id来获取这条SQL的物理执行计划
```sql
obclient [oceanbase]> SELECT OPERATOR, NAME, ROWS, COST FROM GV$OB_PLAN_CACHE_PLAN_EXPLAIN
    ->     WHERE TENANT_ID = 1012 AND
    ->     SVR_IP = '172.24.255.19' AND
    ->     SVR_PORT = 2882 AND
    ->     PLAN_ID = 2518;
+-----------------+------+------+------+
| OPERATOR        | NAME | ROWS | COST |
+-----------------+------+------+------+
| PHY_EXPR_VALUES | NULL |    1 |    0 |
+-----------------+------+------+------+
1 row in set (0.001 sec)
```

如果想要获取SQL的逻辑执行计划，可以直接使用 explain SQL 获取
```sql
obclient [test]> explain select /*+ query_timeout(100000000) */ sleep(100);
+--------------------------------------------------------------+
| Query Plan                                                   |
+--------------------------------------------------------------+
| ==========================================                   |
| |ID|OPERATOR  |NAME|EST.ROWS|EST.TIME(us)|                   |
| ------------------------------------------                   |
| |0 |EXPRESSION|    |1       |1           |                   |
| ==========================================                   |
| Outputs & filters:                                           |
| -------------------------------------                        |
|   0 - output([sleep(cast(100, DECIMAL(3, 0)))]), filter(nil) |
|       values({sleep(cast(100, DECIMAL(3, 0)))})              |
+--------------------------------------------------------------+
9 rows in set (0.007 sec)
```
接着就可以根据执行计划，来判断问题的原因。执行计划解读，可参考官网文档：[执行计划](https://www.oceanbase.com/docs/common-oceanbase-database-1000000000033850)，定位到问题之后，我们也有很多优化的方式，这些后续我们再展开来将，其中包括 hint， outline绑定等。
另外，在OceanBase 4.0版本之后，我们也推出了全链路追踪的功能，依靠全链路追踪，可以更快速的定位到一条SQL具体是哪里执行慢。相关全链路追踪文档，可以参考这里：[OceanBase 4.0 解读：全链路追踪要解决什么问题？从一条慢SQL说起](https://open.oceanbase.com/blog/1775421184)





