---
title: 常用参数配置
weight: 1
---
# **常用参数配置**

## **租户关键配置**

- **min_cpu**

参数说明：租户最小可用 CPU 数量（所有租户 min_cpu 之和 <= cpu_count）

推荐值：cpu_count/2

社区文档：[https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699430](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699430)

- **max_cpu**

参数说明：租户最大可用 CPU 数量（所有租户 max_cpu 之和 <= cpu_count * resource_hard_limit / 100）

推荐值：cpu_count/2 ~ cpu_count（或者和 min_cpu 设成一样）

社区文档：[https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699430](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699430)

- **cpu_quota_concurrency**

参数说明：租户每个 CPU 可以并发的线程数（max_cpu * cpu_quota_concurrency = 最大业务线程数）

推荐值：4（一般建议默认值不改，CPU 密集的压测可以改为 2）

社区文档：[https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699378](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001699378)

- **memory_size**

参数说明：资源单元能够提供的 Memory 的大小

推荐值：总内存的 50%~80%（如果要创建多个资源单元，则需要灵活分配）

- **log_disk_size**

参数说明：日志盘大小

推荐值：够用就行，比如设置为 40~80GB，如果数据量很大则可以设置更大的数值。

- **primary_zone**

参数说明：主副本分配到 Zone 内的优先级，逗号两侧优先级相同，分号左侧优先级高于右侧。比如 zone1,zone2;zone3

推荐值：

1. 三台机器规格相同且网络延迟相近，可以让 leader 均匀分布，以提高性能：RANDOM。
2. 如果其中一台性能更好，或者是为了方便统计和观察数据，也可以指定该 Zone，比如：'zone1'。
