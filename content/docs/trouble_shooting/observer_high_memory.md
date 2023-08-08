---
title: OBServer 内存占用高
weight: 3
---

# **OBServer 内存占用高**

## **场景：内存分配器缓存占用内存高**

**现象**

部署时配置 memory_limit 为48G， 内存一直用到46G， 并且不会下降，持续上升，虽然没有超过48G，但是因为 ocp 主机一共 64G 内存，很容易就触发内存告警阀值，扰乱真正有问题的告警消息

**查看当前内存配置**

```sql
select zone,svr_ip,svr_port,name,value from __all_virtual_sys_parameter_stat where name in ('memory_limit','memory_limit_percentage','system_memory') order by svr_ip,svr_port;
```

**排查方法**

登录 OBServer 服务器，进入observer日志目录， 搜索observer.log中"CHUNK_MGR"关键字
```bash
grep 'CHUNK_MGR' observer.log
```

结果如下，其中 freelist_hold 表示缓存内存，可以看到有三十多G内存是被缓存的没有释放

```bash
[2023-03-24 16:44:10.771913] INFO  [COMMON] ob_tenant_mgr.cpp:568 [3720][2][Y0-0000000000000000] [lt=4] [dc=0] [CHUNK_MGR] free=15982 pushes=13471449 pops=13455467 limit= 51,539,607,552 hold= 49,956,257,792 used= 16,439,574,528 freelist_hold= 33,516,683,264 maps= 258,350 unmaps= 250,521 large_maps= 255,745 large_unmaps= 250,459 memalign=0 virtual_memory_used= 55,661,019,136
```

**处理方法**

设置memory_chunk_cache_size参数为10G，也就是最多缓存10G。该参数可根据实际场景动态调整。

```sql
alter system set memory_chunk_cache_size="10G";
show parameters like "memory_chunk_cache_size";
```

处理完成后，内存马上就下来了，使用率恢复正常。

**注意**

缓存值是由 memory_chunk_cache_size 参数来控制的，默认为 0 不需要配置。
