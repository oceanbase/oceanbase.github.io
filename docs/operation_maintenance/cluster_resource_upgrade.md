---
title: 集群资源升配
weight: 13
---

## **主机资源升配**
### **内存、CPU升配**

**场景**

1. OB集群主机资源均为虚拟机（其他可扩容资源的同理）。
2. 前期规划OB业务集群时，CPU、内存、存储资源有限，后期业务量上升需要针对集群内主机进行升配。
3. OB集群已对外提供服务，不可以停止整个集群，要做到业务无感知。

**注意**

- 集群内主机必须逐台操作（强烈建议主 Zone 下的 OBServer 主机放到最后操作），完成单台所有操作后再进行下一台升配操作。
- 如果存在业务直连 OBServer 或者 OBProxy 的情况，需要提前切换到可用的节点，否则会导致这部分请求异常。访问集群使用 OCP ConfigUrl 的业务不受影响。
- 如果停机升配时间比较长，需要根据预估维护时间调整 server_permanent_offline_time，否则停机超过设置的时长后，OceanBase 数据库会将其踢出成员列表。

**单台操作流程**

1. OCP - 集群 - 总览 - OBServer 列表部分，单击目标主机列的“停止服务”，刷新页面等待该 OBServer 处于“服务已停止状态”。可参考[官方文档](https://www.oceanbase.com/docs/community-ocp-cn-10000000000866357)。
2. poweroff 关机。
3. 通过虚拟化底层实现方案升级对应虚拟机 CPU、内存配置。
4. 开启虚拟机。
5. OCP - 主机 - 主机列表， 看到该主机处于“”离线中“”状态， 右侧下拉选择“重启OCP Agent”，刷新页面等待该主机处于“在线”状态。
6. OCP - 集群 - 总览 - OBServer 列表可以看到该 OBServer 处于“不可用”状态，点击启动，刷新页面等待该 OBServer 处于“运行中”状态，该目标主机升配完成。
7. 由于我们每台 OBServer 上还部署了 OBProxy，所以要去 OCP - OBProxy- OBProxy集群内 - 总览 - OBProxy 列表中执行本主机 OBProxy 重启，刷新页面等待该主机处于“在线状态”。

**后续操作**

所有主机操作完毕后，可以按需调整集群级别参数  memory_limit 或 memory_limit_percentage。

1. OCP创建的集群默认情况下 memory_limit_percentage 为80，该参数指定最大可用内存占比百分数，只有 memory_limit 参数为0时生效。
2. memory_limit 参数默认为0。
3. 当主机内存非常大的时候，建议使用 memory_limit 参数设置具体数值，以提升资源利用率。


### **硬盘扩容**

同理，不过如果硬盘可以在线扩容则不需要重启操作。如果想要了解硬盘扩容如何操作，可以自行搜索"Linux磁盘在线扩容"相关文章。

**后续操作**

所有主机操作完毕后，可以按需调整集群级别参数 datafile_size 或 datafile_disk_percentage。

其中，当 datafile_disk_percentage 与 datafile_size 同时配置时，以 datafile_size 设置的值为准。
