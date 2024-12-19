---
title: OBServer 中其他非预期的报错
weight: 6
---
## 背景

很多社区版用户在遇到非预期报错后，会到 OceanBase 论坛中进行提问。

但提问时只提供一个错误码往往是不够的，一般还需要附带上 OBServer 版本信息、执行的操作序列，以及相关日志信息，以便值班的技术支持同学在本地复现和协助排查根因。

类似于下面这个帖子，如果只提供一个错误码和对应的报错信息 Internal error，大概率是看不出问题原因的，还需要用户协助提供这个错误码对应的日志信息。

![image](/img/user_manual/operation_and_maintenance/emergency_handbook/08_how_to_ask/001.png)


**<font color="red">这一小节就简单为大家介绍下，在遇到非预期的报错时，需要为论坛值班同学提供哪些信息，以及如何捞取 OBServer 的日志。</font>**

## 需要提供的信息

提供信息的目的是为了让技术支持同学能够在他的本地环境中复现用户遇到的问题，一般情况下，需要提供：
- 报错涉及的表结构。
- 导致报错的 SQL 执行序列。
- 报错对应的日志信息。


## 捞取报错对应的 OBServer 日志信息


比如说我在一个特殊的 OBServer 版本中，想创建一个名字叫 zlatan_db 的 database，结果遇到了报错：
```
obclient> create database zlatan_db;
ERROR 4016 (HY000): Internal error
```

然后我想捞日志出来看一眼。

### 方法一：select last_trace_id()

第一种方法是：在同一个 session 中，紧接着报错的 SQL，去执行 ``select last_trace_id()``。
```
obclient> create database zlatan_db;
ERROR 4016 (HY000): Internal error

obclient> select last_trace_id();
+------------------------------------+
| last_trace_id()                    |
+------------------------------------+
| Y584A0B9E1F14-0006299CA6E2263B-0-0 |
+------------------------------------+
1 row in set (0.00 sec)
```
然后拿着这个 trace_id 去类似于 ``/home/user_name/oceanbase/log`` 的日志目录中 grep 一下。

如果目录里的日志文件不多，可以直接 grep trace_id *。
```
grep Y584A0B9E1F14-0006299CA6E2263B-0-0 * > zlatan.log
```
否则可以考虑根据报错发生的时间范围，grep 在这个时间范围内生产的指定几个 log 文件。
```
grep Y584A0B9E1F14-0006299CA6E2263B-0-0 observer.log.2024121918* rootservice.log.2024121918* > zlatan.log
```
最后把 zlatan.log 当做附件上传到论坛的问题帖中。

如果大家愿意再自己多走一步的话，可以在这个 zlatan.log 文件里把 ``ret=-4016``（因为报错的错误码是 4016）这个关键字高亮一下。按日志时间顺序看，最早出现 ``ret=-4016`` 的地方，就是问题发生的直接原因。

![image](/img/user_manual/operation_and_maintenance/emergency_handbook/08_how_to_ask/002.png)

```
rootservice.log.20241219182047574:[2024-12-19 18:12:51.807165] WDIAG [RS] 
create_database (ob_root_service.cpp:3039) [44788][DDLQueueTh0][T0]
[Y584A0B9E1F14-0006299CA6E2263B-0-0] [lt=18][errcode=-4016]
create database failed, because db_name is forbidden by zlatan. just for test.(ret=-4016)

rootservice.log.20241219182047574:[2024-12-19 18:12:51.807177] WDIAG [RS] process_ 
(ob_rs_rpc_processor.h:206) [44788][DDLQueueTh0][T0]
[Y584A0B9E1F14-0006299CA6E2263B-0-0] [lt=10][errcode=-4016] process failed(ret=-4016)

rootservice.log.20241219182047574:[2024-12-19 18:12:51.807187] INFO  [RS] 
process_ (ob_rs_rpc_processor.h:226) [44788][DDLQueueTh0][T0]
[Y584A0B9E1F14-0006299CA6E2263B-0-0] [lt=8] [DDL] 
execute ddl like stmt(
    ret=-4016, cost=117618, ddl_arg=ddl_stmt_str:"create database zlatan_db", 
    exec_tenant_id:1002, ddl_id_str:"", sync_from_primary:false, 
    based_schema_object_infos:[], parallelism:0, task_id:0, consumer_group_id:0)
```

所以这个 4016 报错的直接原因就是：``create database failed, because db_name is forbidden by zlatan. just for test.``。

这个是因为在我自己编译安装的这个特殊 OBServer 版本中，修改了一些代码，不允许用户创建名字叫 zlatan_db 的 database。大家肯定不会遇到，不用担心~
```
int ObRootService::create_database(
    const ObCreateDatabaseArg &arg,
    UInt64 &db_id)
{
  int ret = OB_SUCCESS;
  
  // other codes, we ignore
  // ...
  
  // add by zlatan, just for debug
  ObString forbidden_db_name = "zlatan_db";
  if (arg.database_schema_.get_database_name_str() == forbidden_db_name) {
    ret = OB_ERR_UNEXPECTED;
    LOG_WARN("create database failed, because db_name is forbidden by zlatan. just for test.", K(ret));
  }

  return ret;
}
```

### 方法二：grep "ret=-errno"

第一种方法在使用上有一些限制，**需要在在同一个 session 中，紧接着报错的 SQL，去执行 ``select last_trace_id()``**。

如果在报错 SQL 之后，已经执行了其他 SQL，或者已经退出对应 session，可以在日志里先通过 ``grep "ret=-errno"``，获取 trace_id。

```
$grep "ret=-4016" *
observer.log.20241219181453955:[2024-12-19 18:12:51.807313]
WDIAG [RPC] send (ob_poc_rpc_proxy.h:176) [46486][T1002_L0_G0][T1002]
[Y584A0B9E1F14-0006299CA6E2263B-0-0] [lt=10][errcode=-4016]
execute rpc fail(addr="11.158.31.20:22602", pcode=520, ret=-4016, timeout=999999400)
...
```

现在有了 trace_id，就回到了方法一，通过 trace_id ``Y584A0B9E1F14-0006299CA6E2263B-0-0`` 去 grep 出完整日志即可。

```
grep Y584A0B9E1F14-0006299CA6E2263B-0-0 * > zlatan.log
```

### 方法三：OCP 白屏捞日志

如果不喜欢在黑屏命令行中 grep 日志，可以用 OCP 提供的白屏日志服务。关键字还是 ``ret=-errno``，而且更便捷地选择日志的时间范围。

![image](/img/user_manual/operation_and_maintenance/emergency_handbook/08_how_to_ask/003.png)

## 捞到日志之后

拿着日志去社区论坛发帖提问即可。