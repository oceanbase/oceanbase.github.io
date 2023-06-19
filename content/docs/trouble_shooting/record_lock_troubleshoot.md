---
title: 行锁问题排查
weight: 1
---
# **行锁问题排查**

本文介绍行锁问题的排查思路，并提供部分排查案例。

## **适用版本**

OceanBase 4.x

> **说明**
>
> OceanBase 3.x 版本行锁问题排查可以参考：<https://www.oceanbase.com/knowledge-base/oceanbase-database-20000000016?back=kb>。

## **锁冲突问题的排查思路**

在业务环境中，可以将锁抽象为两个与行锁有密切关系的对象，即行锁的持有者与等待者。而行锁的持有者与等待者都是事务的一部分，因此在监控活跃事务中监控锁的持有者与等待者会对锁冲突的问题排查提供很大的帮助。

OceanBase 数据库提供了以下虚拟表，分别用于监控活跃事务、行锁持有者与行锁等待者。

**__all_virtual_trans_stat：用于监控活跃事务。**

各主要表列的说明如下表所示。

| **列名** | **说明** |
| --- | --- |
| svr_ip | 表示创建该事务上下文的 OBServer 节点的 IP 地址。 |
| session_id | 表示该事务上下文所属会话的唯一 ID。 |
| trans_id | 表示该事务的唯一 ID。 |
| participants | 表示当前事务的参与者列表。 |
| ctx_create_time | 表示事务上下文的创建时间。 |
| ref_cnt | 表示事务上下文当前的引用计数。 |
| state | 表示事务上下文当前的状态。 |
| part_trans_action | 表示当前语句处于的执行阶段，可选值为 1、2、3、4，分别代表如下含义。</br>1：说明语句的 task 正在执行。</br> 2：说明语句 task 执行完成。</br> 3：说明进入了事务提交阶段。</br> 4：说明事务正在进入回滚。  |
| is_exiting | 表示当前事务上下文是否正在退出。 |
| pending_log_size | 表示事务内存中有多少数据量需要去写 clog。 |

**__all_virtual_trans_lock_stat：记录了当前集群中所有活跃事务持有行锁的相关信息。**

各主要表列的说明如下表所示

| **列名** | **说明** |
| --- | --- |
| rowkey | 表示持有锁的行的 rowkey。 |
| session_id | 表示持有锁的事务所属的会话唯一 ID。 |
| proxy_session_id | 表示持有锁的事务所属客户端 OBProxy/Java Client 对应的 IP 地址与端口号。 |
| trans_id | 表示持有锁的事务的唯一 ID。 |

**__all_virtual_lock_wait_stat：统计了当前集群中所有等待行锁的请求或语句的相关信息。**

各主要表列的说明如下表所示

| **列名** | **说明** |
| --- | --- |
| session_id | 等待锁的事务所属的会话唯一 ID。 |
| tablet_id | 表示底层分片的 tablet_id。 |
| lock_ts | 表示该请求开始等待锁的时间点。 |
| abs_timeout | 表示等待锁的语句的绝对超时时间。 |
| try_lock_times | 表示等待锁的语句重试加锁的次数。 |
| block_session_id | 表示在该行第一个等待事务的 session_id。 |

> **说明：**
>
> - 等待锁分为两种情况，即写写冲突与读写冲突。对于读写冲突的情况，是由于事务中读语句的 read_snapshot_version 大于写语句的 prepare_version，但 commit_version 不能确定，因此需要等待写事务完成后才能读到写语句的修改
>
> - _all_virtual_lock_wait_stat 表中主要用于展示写写冲突的情况。

## **锁冲突问题的排查案例**

### **场景一**

业务使用了较大的超时事件，且存在一个会话中的未知长事务持有锁，阻塞了其他事务的执行，需要找到并停止该长事务。

#### **方案一：通过无法加锁的事务查询持有锁的事务**

1. 通过 show full processlist; 获取无法加锁的事务的 session_id，找到等待锁的行的 rowkey。

   ```sql
   MySQL [oceanbase]> select * from __all_virtual_lock_wait_stat where session_id=3222247256 \G
   *************************** 1. row ***************************
             svr_ip: x.x.x.x
           svr_port: 7801
          tenant_id: 1
          tablet_id: 200002
             rowkey: {"INT":1}
               addr: 47882047755232
          need_wait: 1
            recv_ts: 1684727706118418
            lock_ts: 1684727706119706
        abs_timeout: 1684727716018418
     try_lock_times: 1
    time_after_recv: 3750212
         session_id: 3222247256
   block_session_id: 3222247256
               type: 0
          lock_mode: 0
   last_compact_cnt: 0
   total_update_cnt: 2
   1 row in set (0.00 sec)
   ```

2. 可以发现等待锁的事务在等待主键为 pk 的行。

   ```sql
   MySQL [oceanbase]> select * from __all_virtual_trans_lock_stat where tablet_id=200002 and rowkey like '%{"INT":1}   %'\G
   *************************** 1. row ***************************
          tenant_id: 1
           trans_id: {txid:4008048}
             svr_ip: x.x.x.x
           svr_port: 7801
              ls_id: 1
           table_id: 0
          tablet_id: 200002
             rowkey: rowkey_object=[{"INT":1}]
         session_id: 3222015200
   proxy_session_id: NULL
    ctx_create_time: 2023-05-22 11:45:35.025896
       expired_time: 2023-05-23 11:45:35.024835
      row_lock_addr: 0
   1 row in set (0.01 sec)
   ```

3. 根据查到的 session_id 停止该事务的会话

   ```sql
   MySQL [oceanbase]> kill 3222015200;
   Query OK, 0 rows affected (0.00 sec)
   ```

**方案二：通过查询长事务**

1. 根据事务执行时间，找到执行时间最长且未结束事务的 trans_id。

   ```sql
   MySQL [oceanbase]> select * from __all_virtual_trans_stat where session_id!=0 order by ctx_create_time desc    limit 5\G
   *************************** 1. row ***************************
           tenant_id: 1
              svr_ip: x.x.x.x
            svr_port: 7801
          trans_type: 0
            trans_id: 4210669
          session_id: 3222110265
      scheduler_addr: "x.x.x.x:7801"
          is_decided: 0
               ls_id: 1
        participants: NULL
     ctx_create_time: 2023-05-22 16:40:44.737797
        expired_time: 2023-05-23 16:40:44.737797
             ref_cnt: 2
          last_op_sn: 7
       pending_write: 0
               state: 10
   part_trans_action: 2
      trans_ctx_addr: 0x2b8c278137d0
          mem_ctx_id: -1
    pending_log_size: 131
    flushed_log_size: 0
                role: 0
          is_exiting: 0
         coordinator: -1
   last_request_time: 2023-05-22 16:41:49.754470
               gtrid: NULL
               bqual: NULL
           format_id: -1
   ```

2. 通过事务的 trans_id 找到其所持有的所有锁，并根据 rowkey 明确哪一个是需要停止的服务，相同的 trans_id 说明是同一个事务内的不同行锁信息。

   ```sql
   MySQL [oceanbase]> select * from __all_virtual_trans_lock_stat where trans_id like '%4210669%'\G
   *************************** 1. row ***************************
          tenant_id: 1
           trans_id: {txid:4210669}
             svr_ip: x.x.x.x
           svr_port: 7801
              ls_id: 1
           table_id: 0
          tablet_id: 200002
             rowkey: rowkey_object=[{"INT":1}]
         session_id: 3222110265
   proxy_session_id: NULL
    ctx_create_time: 2023-05-22 16:40:44.737797
       expired_time: 2023-05-23 16:40:44.737797
      row_lock_addr: 0
   *************************** 2. row ***************************
          tenant_id: 1
           trans_id: {txid:4210669}
             svr_ip: x.x.x.x
           svr_port: 7801
              ls_id: 1
           table_id: 0
          tablet_id: 200002
             rowkey: rowkey_object=[{"INT":3}]
         session_id: 3222110265
   proxy_session_id: NULL
    ctx_create_time: 2023-05-22 16:40:44.737797
       expired_time: 2023-05-23 16:40:44.737797
      row_lock_addr: 0
   *************************** 3. row ***************************
          tenant_id: 1
           trans_id: {txid:4210669}
             svr_ip: x.x.x.x
           svr_port: 7801
              ls_id: 1
           table_id: 0
          tablet_id: 200002
             rowkey: rowkey_object=[{"INT":2}]
         session_id: 3222110265
   proxy_session_id: NULL
    ctx_create_time: 2023-05-22 16:40:44.737797
       expired_time: 2023-05-23 16:40:44.737797
      row_lock_addr: 0
   3 rows in set (0.00 sec)
   ```

3. 确认要停止的事务的 session_id 后，停止对应事务的会话。

   ```bash
   MySQL [oceanbase]> kill 3222110265;
   Query OK, 0 rows affected (0.00 sec)
   ```

### **场景二**

业务反馈某张表上执行的事务总超时，已知该表的表名以及库名，本场景以库名为 test，表名为 t0522 为例。

1. 根据库表信息找到对应的持锁事务，如果数据比较大，可以拆分SQL。

   ```sql
   MySQL [oceanbase]> select 
     avtls.trans_id,
     avtls.session_id, 
     avtls.proxy_session_id 
   from  
     __all_tablet_to_ls attl, 
     __all_table at, 
     __all_database ad, 
     __all_virtual_trans_lock_stat avtls 
   where 
     ad.database_name='test' 
     and ad.database_id = at.database_id 
     and at.table_name='t0522' 
     and at.table_id=attl.table_id 
     and attl.tablet_id=avtls.tablet_id 
     and attl.ls_id=avtls.ls_id 
   order by 
     avtls.ctx_create_time desc 
   limit 5;
   *************************** 1. row ***************************
           trans_id: {txid:3966830}
         session_id: 3221618369
   proxy_session_id: NULL
   1 row in set (0.01 sec)
   ```

2. 发现持有行锁的事务的 session_id 为 3221618369，可以根据trans_id 查看事务详情

   ```sql
   MySQL [oceanbase]> select * from __all_virtual_trans_stat where trans_id='3966830'\G
   *************************** 1. row ***************************
           tenant_id: 1
              svr_ip: x.x.x.x
            svr_port: 7801
          trans_type: 0
            trans_id: 3966830
          session_id: 3221618369
      scheduler_addr: "x.x.x.x:7801"
          is_decided: 0
               ls_id: 1
        participants: NULL
     ctx_create_time: 2023-05-22 16:12:01.161296
        expired_time: 2023-05-23 16:11:55.393787
             ref_cnt: 2
          last_op_sn: 3
       pending_write: 0
               state: 10
   part_trans_action: 2
      trans_ctx_addr: 0x2b8c278137d0
          mem_ctx_id: -1
    pending_log_size: 43
    flushed_log_size: 0
                role: 0
          is_exiting: 0
         coordinator: -1
   last_request_time: 2023-05-22 16:12:01.161296
               gtrid: NULL
               bqual: NULL
           format_id: -1
   1 row in set (0.01 sec)
   ```

3. kill 连接

   ```sql
   MySQL [oceanbase]> kill 3221618369;
   Query OK, 0 rows affected (0.00 sec)
   ```
