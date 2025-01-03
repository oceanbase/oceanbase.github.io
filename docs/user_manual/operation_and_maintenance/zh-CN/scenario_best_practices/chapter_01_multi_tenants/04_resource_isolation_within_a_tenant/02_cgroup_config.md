---
title: CPU 资源隔离准备工作
weight: 2
---

## 配置 cgroup

**使用限制及注意事项**

* 由于设置资源隔离对性能影响比较大，以下场景下不建议使用 cgroup 功能进行租户的资源隔离：

  * 单租户场景，即集群中只有一个租户

  * 租户之间有业务关联的场景，例如，不同的微服务放在不同的租户，从而租户相互间呈上下游关系

  * 小规格租户场景，即 CPU 为 2C 或 4C 的租户

* 使用 cgroup 功能时，如果安装 OceanBase 数据库的操作系统为 Alibaba Cloud Linux，则要求其操作系统版本为 Alibaba Cloud Linux 4.19 及以上版本。

* **开启 cgroup 会导致 OceanBase 数据库的性能有所下降，请权衡隔离性和性能后再确认是否开启**。

### 步骤一：配置 cgroup 系统目录

<main id="notice" type='notice'>
<h4>注意</h4>
<ul>
<li>cgroup 系统目录的配置操作需要在 OceanBase 数据库软件安装前进行。</li>
<li>配置 cgroup 系统目录时需要 <code>root</code> 用户权限。</li>
</ul>
</main>

本节以在一台 OBServer 上，使用 `usercg` 用户配置 cgroup 系统目录为例，如果有多台 OBServer，则每台 OBServer 上都需要配置。

1. 使用 `usercg` 用户登录到 OBServer 服务器。

2. 执行以下命令，挂载 `/sys/fs/cgroup` 目录。

   说明：如果已经存在 <code>/sys/fs/cgroup</code> 目录，则可忽略该步骤。

   ```shell
   [usercg@xxx /]$ sudo mount -t tmpfs cgroups /sys/fs/cgroup
   ```

   其中，`cgroups` 为自定义名称，用于在查看 Mount 信息时进行标识。

   挂载结果如下所示。

   ```shell
   $df
   Filesystem      1K-blocks       Used Available Use% Mounted on
   /               293601280   28055472 265545808  10% /
   /dev/v01d      2348810240 2113955876 234854364  91% /data/1
   /dev/v02d      1300234240 1170211208 130023032  91% /data/log1
   shm              33554432          0  33554432   0% /dev/shm
   /dev/v04d       293601280   28055472 265545808  10% /home/usercg/logs
   cgroups         395752136          0 395752136   0% /sys/fs/cgroup
   ```

3. 创建 `/sys/fs/cgroup/cpu` 目录并修改 Owner，用于后续挂载 cpu 子系统。

   ```shell
   [usercg@xxx /]$ sudo mkdir /sys/fs/cgroup/cpu

   [usercg@xxx /]$ sudo chown usercg:usercg -R /sys/fs/cgroup/cpu
   ```
    说明：如果已经存在 <code>/sys/fs/cgroup/cpu</code> 目录且目录为空，则可忽略该步骤。

4. 挂载 cpu 子系统。

   创建一个名为 `cpu` 的层级，在该层级上附加 `cpu` 子系统，并且将层级挂载到 `/sys/fs/cgroup/cpu` 目录。

   ```shell
   [usercg@xxx /]$ sudo mount -t cgroup -o cpu cpu /sys/fs/cgroup/cpu
   ```
  
5. 创建名为 `oceanbase` 的子目录，并修改其 Owner 为 `usercg`。

   ```shell
   [usercg@xxx /]$ sudo mkdir /sys/fs/cgroup/cpu/oceanbase

   [usercg@xxx /]$ sudo chown usercg:usercg -R /sys/fs/cgroup/cpu/oceanbase
   ```

6. 执行以下命令，配置 `oceanbase` 目录继承上级的 CPU 和 Memory 配置，并设置对下级目录的自动继承。

   <main id="notice" type='notice'>
   <h4>注意</h4>
   <p>当前暂不支持 cpu、cpuset、cpuacct 三个子系统挂载在不同的目录，如果您的机器当前这三个子系统挂载在不同的目录，需要先清除挂载信息后，再执行 <code>sudo mount -t cgroup -o cpuset,cpu,cpuacct cpu /sys/fs/cgroup/cpu</code> 命令重新将这三个子系统挂载在同一目录。</p>
   </main>

   确认 cpu、cpuset、cpuacct 三个子系统挂载在相同的目录中后，执行以下命令：

   ```shell
   [usercg@xxx /]$ sudo sh -c "echo `cat /sys/fs/cgroup/cpu/cpuset.cpus` > /sys/fs/cgroup/cpu/oceanbase/cpuset.cpus"

   [usercg@xxx /]$ sudo sh -c "echo `cat /sys/fs/cgroup/cpu/cpuset.mems` > /sys/fs/cgroup/cpu/oceanbase/cpuset.mems"

   [usercg@xxx /]$ sudo sh -c "echo 1 > /sys/fs/cgroup/cpu/oceanbase/cgroup.clone_children"
   ```

### 步骤二：部署数据库

cgroup 系统目录配置成功后，即可部署 OceanBase 数据库社区版。OceanBase 数据库社区版的详细安装操作请参见：[通过 OCP 部署 OceanBase 集群](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001431674)。

<main id="notice" type='explain'>
  <h4>说明</h4>
  <p>社区版 OceanBase 数据库仅 V4.0.0 及以上版本支持 cgroup 完整功能。</p>
</main>

### 步骤三：与 OceanBase 数据库建立软链接

OceanBase 数据库安装成功后，需要建立 OceanBase 数据库软件的安装目录与 cgroup 系统目录的软链接。

1. 使用 `usercg` 用户登录到 OBServer 节点。

2. 手动建立 OceanBase 数据库软件的安装目录与 cgroup 系统目录的软链接。

   ```shell
   [usercg@xxx /home/usercg]$ cd /home/usercg/oceanbase/

   [usercg@xxx /home/usercg]
   $ ln -sf /sys/fs/cgroup/cpu/oceanbase/ cgroup
   ```

   其中：`/home/usercg/oceanbase/` 为 OceanBase 数据库软件的安装路径。

   执行成功后，结果如下所示。

   ```shell
   [usercg@xxx /home/usercg/oceanbase]
   $ll cgroup
   lrwxrwxrwx 1 usercg usercg 29 Dec  8 11:09 cgroup -> /sys/fs/cgroup/cpu/oceanbase/
   ```

3. 重新启动 observer 进程。

   需要停止 observer 进程后再重新启动 observer 进程，具体操作请参见：[重启节点](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428965)。

   observer 进程在启动时，检测到之前已经建立的软链接，就会在 `/sys/fs/cgroup/cpu/oceanbase/` 目录下继续创建 OceanBase 数据库 cgroup 目录。

### 步骤四：开启 cgroup 功能

OceanBase 数据库通过集群级配置项 `enable_cgroup` 来控制 OBServer 是否开启 cgroup 功能。默认该功能为 `True`，表示已开启，如果未开启，您可以参考以下操作，开启 cgroup 功能。

1. 使用 `root` 用户登录集群的 `sys` 租户。

2. 执行以下命令，开启 cgroup 功能。

   ```sql
   obclient> ALTER SYSTEM SET enable_cgroup=true;
   ```

   或者

   ```sql
   obclient> ALTER SYSTEM SET enable_cgroup=1;
   ```

   或者

   ```sql
   obclient> ALTER SYSTEM SET enable_cgroup=ON;
   ```

### 其他

成功配置 cgroup 系统目录并开启 cgroup 功能后，在应急情况下，可以通过各租户所在目录下的 `cpu.cfs_period_us`、`cpu.cfs_quota_us`、`cpu.shares` 等文件来控制租户内 CPU 资源的占用。一般不建议使用该方式进行资源隔离。

建议使用 cgroup 中的目录文件调用 `DBMS_RESOURCE_MANAGER` 系统包中的子程序 `CREATE_CONSUMER_GROUP` 创建的资源组，来进行资源隔离。

## 清除 cgroup 配置

OceanBase 数据库的版本升级后，cgroup 的目录结构可能会有变化，在重新部署新版本的 OceanBase 数据库前，需要删除原来配置的 cgroup 系统目录。

**前提条件**是需要确认 cgroup 配置所在的 OBServer 已停止运行，停止 OBServer 的相关操作请参见：[重启节点](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001428965)。

1. 使用 `admin` 用户登录 OBServer 服务器所在的机器。

2. 删除 OceanBase 数据库软件安装目录与 cgroup 目录的软链接。

   ```shell
   [admin@xxx /home/admin/oceanbase]
   $ll cgroup
   lrwxrwxrwx 1 admin admin 29 Dec  8 11:09 cgroup -> /sys/fs/cgroup/cpu/oceanbase/

   [admin@xxx /home/admin/oceanbase]
   $ rm -rf cgroup
   ```

3. 删除 cgroup 系统目录 `/sys/fs/cgroup/cpu/oceanbase`。

   由于 cgroup 系统目录中的文件需要从下往上递归删除，您可以创建一个脚本文件 `deletecgroupdir.sh` 来批量删除 cgroup 的系统目录。

   1. 创建脚本文件并填入内容保存。

      ```shell
      [admin@xxx /home/admin]$ vim deletecgroupdir.sh
      ```

      文件中需要填入的内容如下。

      ```JavaScript
      #! /bin/bash
      function read_dir(){
          for file in `ls $1`
               do
                     if [ -d $1"/"$file ]
                           then
                               read_dir $1"/"$file
                     fi
              done
              string=$1
              echo rmdir $string
              rmdir $string
      }
      # 读取第一个参数
      read_dir /sys/fs/cgroup/cpu/oceanbase
      ```

   2. 执行脚本，删除 cgroup 系统目录。
  
      ```shell
      [admin@xxx /home/admin]
      $sudo /bin/bash deletecgroupdir.sh
      ```

## 使用全局 CPU 资源的前后台隔离

为了实现更好的隔离效果，OceanBase 数据库支持了全局 CPU 资源的前后台隔离功能。该功能可以在全局层面上对所有租户的前台和后台任务进行 CPU 资源隔离。

### CPU 隔离概述

在高性能计算环境中，资源的合理分配与隔离对于确保系统稳定性和提升效率具有决定性作用。有效的资源隔离策略可以预防任务间的资源争夺和相互干扰，从而提升资源利用效率和整体服务质量。当前，OceanBase 数据库已实现了通过租户的 Unit 规格来配置租户间的资源隔离，以及通过 `DBMS_RESOURCE_MANAGER` 系统包来配置租户内的资源隔离。

在未开启全局 CPU 资源的前后台隔离功能时，OBServer 节点的 CPU 隔离包含租户间的 CPU 隔离和租户内的 CPU 隔离，其隔离效果如下图所示。

![开启全局 CPU 的前后台隔离前](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/02_cgroup_config/001.png)

隔离的层次为一个树状结构，租户之间的隔离策略由租户的 Unit 规格决定，每个租户内部还有各租户内任务的资源隔离，由 `DBMS_RESOURCE_MANAGER` 系统包来进行控制。

开启全局 CPU 资源的前后台隔离功能后，系统会在租户层级创建一个基于后台任务的子 cgroup。该后台子 cgroup 可以理解为一个 “虚拟租户”，即相当于一个 `MAX_CPU` 为配置项 `global_background_cpu_quota` 的值，并且 `MIN_CPU` 为 1 的虚拟租户。开启了全局 CPU 资源前后台隔离功能的隔离效果如下表所示。

![开启全局 CPU 的前后台隔离后](/img/user_manual/operation_and_maintenance/zh-CN/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/02_cgroup_config/002.png)

开启全局 CPU 资源的前后台隔离功能后，即使不设置租户内的隔离策略，也会在整体层面上限制所有后台任务可使用的 CPU 资源上限（`global_background_cpu_quota`），从而有效地避免出现后台任务影响前台业务的情况。

### 适用场景

全局 CPU 资源的前后台隔离功能的推荐场景：

* 期望在整体层面上对后台任务进行隔离，避免后台任务影响到前台业务。

* 不希望计算与配置复杂的租户间或租户内资源隔离策略，特别是租户较多的时候配置起来比较繁琐

### 前提条件

使用全局 CPU 资源的前后台隔离功能要求 OBServer 节点已配置 cgroup 目录并开启 cgroup 功能。

### 注意事项

* 对于租户间的 CPU 隔离，在开启了全局 CPU 资源的前后台隔离功能后，每个租户的后台任务可使用的 CPU 上限会受到配置项 `global_background_cpu_quota` 值的限制，即每个租户的后台任务可使用的 CPU 上限实际为：`min(租户的 MAX_CPU, global_background_cpu_quota)`。

  <main id="notice" type='notice'>
  <h4>注意</h4>
  <p>对于 V4.2.1 及之后版本，为避免 sys 租户的处理请求受到干扰，sys 租户的 CPU 使用不受限制。</p>
  </main>

* 对于租户内的 CPU 隔离，在开启了全局 CPU 资源的前后台隔离功能后，在使用 `DBMS_RESOURCE_MANAGER` 系统包配置租户内的资源隔离时，租户下每个后台任务的 CPU 使用上限可以根据租户的所有后台任务可使用的总 CPU 上限来计算，即租户下每个后台任务的 CPU 使用上限实际为：`min(global_background_cpu_quota, 租户的 MAX_CPU) * 资源组内的 UTILIZATION_LIMIT`。

### 开启全局 CPU 资源的前后台隔离

OceanBase 数据库通过以下两个配置项来实现全局 CPU 资源的前后台隔离：

* `enable_global_background_resource_isolation`

  集群级配置项 `enable_global_background_resource_isolation` 用于控制是否开启前后台任务的 CPU 资源隔离。默认值为 `False`，表示不开启前后台任务的 CPU 资源隔离，即后台任务与前台任务在租户内隔离。需要重启 OBServer 节点才能生效。
  
  当其值为 `True` 时，表示开启前后台任务的 CPU 隔离，即后台任务会在租户的上层进行单独隔离。

  有关配置项 `enable_global_background_resource_isolation` 的更多说明，参见 [enable_global_background_resource_isolation](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001431456)。

* `global_background_cpu_quota`

  集群级配置项 `global_background_cpu_quota` 用于控制后台任务可使用的 CPU 配额。默认值为 `-1`，表示后台任务可使用的 CPU 资源不受 cgroup 限制。

  有关配置项 `global_background_cpu_quota` 的更多说明，参见 [global_background_cpu_quota](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001431282)。

开启全局 CPU 资源的前后台隔离的具体操作如下：

1. 使用 `root` 用户登录集群的 `sys` 租户。

2. 执行以下命令，开启前后台任务 CPU 资源的全局隔离。

   ```shell
   obclient> ALTER SYSTEM SET enable_global_background_resource_isolation = True;
   ```

3. 配置后台任务可使用的最大 CPU 配额。

   需要根据业务实际情况来配置后台任务可使用的 CPU 配额。配置时，要求该值需要小于当前 OBServer 节点的 CPU 配额。

   ```shell
   obclient> ALTER SYSTEM SET global_background_cpu_quota = 3;
   ```

4. 重启 OBServer 节点，使配置生效。

   配置生效后，系统会在原 cgroup 目录结构中，创建一个与所有租户同级的 `background` 目录，作为后台任务的 cgroup，并且在 `background` 目录下又会新建所有租户对应的 cgroup 目录。

### 后续操作

尽管通过开启全局 CPU 资源的前后台隔离功能可以达到在全局层面上限制后台任务的目的，如果还希望对后台任务做进一步精细的隔离调控，则需要通过 `DBMS_RESOURCE_MANAGER` 系统包来配置租户内的资源隔离。