---
title: 安装目录结构
weight: 1
---


admin 用户部署的 OBServer 默认安装目录为 /home/admin/oceanbase，OBProxy 默认安装目录为 /home/admin/obproxy。

## OB 安装目录结构

```
[root@iZ0jlih98gpa0qilgrps38Z oceanbase]# tree -d
.
├── admin
├── audit
├── bin
├── cgroup -> /sys/fs/cgroup/cpu/oceanbase
├── etc
├── lib
├── log
├── run
├── store
│   └── test_cluster
│       ├── clog -> /data/log1/test_cluster/clog
│       ├── slog -> /data/1/test_cluster/slog
│       └── sstable -> /data/1/test_cluster/sstable
└── wallet
```

**admin 目录**

主要是一些系统包的构建 SQL，包名对应 SQL 文件前缀。

**bin 目录**

- observer：OB 服务启动二进制文件。
- ob_admin 是 OceanBase 数据库的配套运维工具（ocp 部署集群会自动安装），ob_admin 提供了 slog_tool、log_tool、dumpsst 和 dump_backup 功能，主要用于排查数据不一致、丢数据、错误数据等问题。
- ob_error 是 OceanBase 数据库的一个错误码解析工具，ob_error 可以根据您输入的错误码返回相对应的原因和解决方案。

**etc 目录**

这个目录主要关注 observer.config.bin。

observer.config.bin 是二进制加密文件，所以如果想要查看完整内容需要   strings observer.config.bin，并且不能手动修改文件，只能通过修改变量以及启动时 -o 指定变量修改，否则会导致 observer 起不来。

**lib 目录**

OBServer 依赖的 lib 库。

**log**

observer 运行日志文件目录。
- observer.log：observer 运行日志，后续问题排障都需要依赖这个日志。
- rootservice.log：RS 日志，RS 主要负责处理集群管理操作。
- election.log：选举日志。
- .wf 日志：每种日志 WARN 级别以上的日志会复制到对应的 wf 日志文件。
- 带日期的日志：每种日志的归档日志，是否自动回收以及保留数量可以通过 enable_syslog_recycle 和 max_syslog_file_count 来控制。

**run 目录**

服务运行的临时文件，包括 socket 以及 pid 文件。

**store 目录**

对应的是集群的 sstable、slog、clog 做的软连接。

- sstable ：数据目录
- slog：一些全局信息变更操作（如新增租户、分区创建、新增 SSTable 等）的 redolog
- clog：事务日志，数据变更产生的日志都在这里

## OBProxy 安装目录结构
```
[root@iZ0jlih98gpa0qilgrps38Z obproxy]# tree -d
.
├── bin
├── control-config
├── etc
├── lib
├── log
└── sharding-config
```

bin、etc、lib 这三个目录跟 OBServer 目录相似。

**log 目录**

- obproxy.log：obproxy 运行日志，后续问题排障都需要依赖这个日志。
- obproxy_error.log：错误日志，会记录执行错误的请求，包括 ODP 自身错误和 OBServer 返回错误。
- obproxy_digest.log：审计日志，记录执行时间大于参数 query_digest_time_threshold 阈值（默认 100ms）的请求和错误响应请求。
- obproxy_slow.log：慢日志，记录执行时间大于 slow_query_time_threshold 阈值（默认 500ms）的请求。
- obproxy_stat.log：统计日志，默认每分钟（monitor_stat_dump_interval 参数控制）输出一次。通过该日志可以查看 ODP 一分钟内 SQL 的执行情况。
- obproxy_limit.log：OBProxy 限流日志，如果发生限流，被限流的请求将打印到该日志中。
- obproxy_xflush.log： 是对 WARN 和 ERROR 日志的详细补充。
- obproxy_diagnosis.log： 是连接诊断接入监控系统的日志。

