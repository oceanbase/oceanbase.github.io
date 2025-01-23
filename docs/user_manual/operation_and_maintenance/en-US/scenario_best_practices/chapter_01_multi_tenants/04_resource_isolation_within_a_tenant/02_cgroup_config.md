---
title: Prepare for CPU Resource Isolation
weight: 2
---

## Configure Cgroups

**Limitations**

* Resource isolation considerably compromises performance. We recommend that you do not use the control group (cgroup) feature to isolate tenant resources in the following scenarios:

  * Single-tenant scenarios that have only one tenant in the cluster.

  * Scenarios where tenants are associated with each other. For example, multiple tenants serve different microservices, resulting in an upstream and downstream relationship among the tenants.

  * Small-scale tenant scenarios where each tenant has two or four CPU cores.

* If the operating system of the OBServer node is Alibaba Cloud Linux, to use the cgroup feature, the operating system version must be 4.19 or later.

* **Enabling the cgroup feature compromises the performance of OceanBase Database. Therefore, weigh the isolation benefits and performance loss before you enable the cgroup feature.**

### Step 1: Configure the cgroup system directory

<main id="notice" type='notice'>
<h4>Notice</h4>
<ul>
<li>You must configure the cgroup system directory before you install OceanBase Database. </li>
<li>You must obtain the <code>root</code> user privileges before you configure the cgroup system directory. </li>
</ul>
</main>

This section describes how to configure the cgroup system directory on one OBServer node as the `usercg` user. If the OceanBase cluster consists of multiple OBServer nodes, you must configure the cgroup system directory on each OBServer node.

1. Log in as the `usercg` user to the OBServer node.

2. Run the following command to mount the `/sys/fs/cgroup` directory:

   Note: If the <code>/sys/fs/cgroup</code> directory already exists, skip this step.

   ```shell
   [usercg@xxx /]$ sudo mount -t tmpfs cgroups /sys/fs/cgroup
   ```

   `cgroups` is a custom name for identification when you view the mount information.

   The mounting result is as follows:

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

3. Create a directory named `/sys/fs/cgroup/cpu` and change its owner. This directory is used for mounting the `cpu` subsystem later.

   ```shell
   [usercg@xxx /]$ sudo mkdir /sys/fs/cgroup/cpu

   [usercg@xxx /]$ sudo chown usercg:usercg -R /sys/fs/cgroup/cpu
   ```
    Note: If the <code>/sys/fs/cgroup/cpu</code> directory already exists and is empty, skip this step.

4. Mount the `cpu` subsystem.

   Create a directory hierarchy named `cpu`, attach the `cpu` subsystem to this hierarchy, and mount this hierarchy to the `/sys/fs/cgroup/cpu` directory.

   ```shell
   [usercg@xxx /]$ sudo mount -t cgroup -o cpu cpu /sys/fs/cgroup/cpu
   ```
  
5. Create a subdirectory named `oceanbase` and change its owner to `usercg`.

   ```shell
   [usercg@xxx /]$ sudo mkdir /sys/fs/cgroup/cpu/oceanbase

   [usercg@xxx /]$ sudo chown usercg:usercg -R /sys/fs/cgroup/cpu/oceanbase
   ```

6. Run the following commands to set the `oceanbase` directory to inherit the CPU and memory configurations from the upper-level directory and set the lower-level directories of the `oceanbase` directory to automatically inherit its configurations.

   <main id="notice" type='notice'>
   <h4>Notice</h4>
   <p>At present, the <code>cpu</code>, <code>cpuset</code>, and <code>cpuacct</code> subsystems cannot be mounted to different directories. If they are mounted to different directories on your server, clear the mounting information and then run the <code>sudo mount -t cgroup -o cpuset,cpu,cpuacct cpu /sys/fs/cgroup/cpu</code> command to mount them to the same directory. </p>
   </main>

   Confirm that the `cpu`, `cpuset`, and `cpuacct` subsystems are mounted to the same directory and then run the following commands:

   ```shell
   [usercg@xxx /]$ sudo sh -c "echo `cat /sys/fs/cgroup/cpu/cpuset.cpus` > /sys/fs/cgroup/cpu/oceanbase/cpuset.cpus"

   [usercg@xxx /]$ sudo sh -c "echo `cat /sys/fs/cgroup/cpu/cpuset.mems` > /sys/fs/cgroup/cpu/oceanbase/cpuset.mems"

   [usercg@xxx /]$ sudo sh -c "echo 1 > /sys/fs/cgroup/cpu/oceanbase/cgroup.clone_children"
   ```

### Step 2: Deploy OceanBase Database

After the `cgroup` system directory is configured, you can deploy OceanBase Database Community Edition. For more information about how to deploy OceanBase Database Community Edition, see [Deploy an OceanBase cluster through the GUI of OCP](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001717430).

<main id="notice" type='explain'>
  <h4>Note</h4>
  <p>Only OceanBase Database Community Edition V4.0.0 and later support the complete cgroup feature. </p>
</main>

### Step 3: Establish a soft link to OceanBase Database

After OceanBase Database is installed, establish a soft link between the installation directory of OceanBase Database and the cgroup system directory.

1. Log in as the `usercg` user to the OBServer node.

2. Manually establish a soft link between the installation directory of OceanBase Database and the cgroup system directory.

   ```shell
   [usercg@xxx /home/usercg]$ cd /home/usercg/oceanbase/

   [usercg@xxx /home/usercg]
   $ ln -sf /sys/fs/cgroup/cpu/oceanbase/ cgroup
   ```

   `/home/usercg/oceanbase/` is the installation directory of OceanBase Database.

   The execution result is as follows:

   ```shell
   [usercg@xxx /home/usercg/oceanbase]
   $ll cgroup
   lrwxrwxrwx 1 usercg usercg 29 Dec  8 11:09 cgroup -> /sys/fs/cgroup/cpu/oceanbase/
   ```

3. Restart the observer process.

   You must first stop the observer process and then restart it. For more information, see [Restart a node](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714995).

   If the observer process detects that a soft link has been established, it will create the cgroup directory in the `/sys/fs/cgroup/cpu/oceanbase/` directory.

### Step 4: Enable the cgroup feature

In OceanBase Database, the cluster-level `enable_cgroup` parameter specifies whether to enable the cgroup feature for the OBServer nodes in the cluster. The default value is `True`, which specifies to enable this feature. If this feature is disabled, perform the following steps to enable it.

1. Log in to the `sys` tenant of the cluster as the `root` user.

2. Execute any of the following statements to enable the cgroup feature:

   ```sql
   obclient> ALTER SYSTEM SET enable_cgroup=true;
   ```

   or

   ```sql
   obclient> ALTER SYSTEM SET enable_cgroup=1;
   ```

   or

   ```sql
   obclient> ALTER SYSTEM SET enable_cgroup=ON;
   ```

### Others

After you configure the cgroup system directory and enable the cgroup feature, in the case of emergencies, you can control the utilization of CPU resources in a tenant by using the `cpu.cfs_period_us`, `cpu.cfs_quota_us`, and `cpu.shares` files in the directory of the tenant. Generally, we recommend that you do not implement resource isolation in this way.

We recommend that you use the files in the cgroup system directory to call the `CREATE_CONSUMER_GROUP` subprogram in the `DBMS_RESOURCE_MANAGER` package to create resource groups for resource isolation.

## Clear Cgroup Configurations

After OceanBase Database is upgraded, the structure of the cgroup directory may change. Therefore, before you upgrade OceanBase Database, you must delete the original cgroup system directory.

To do so, make sure that you have stopped the OBServer node where the cgroup system directory is configured. For more information, see [Restart a node](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714995).

1. Log in to the server where the OBServer node is located as the `admin` user.

2. Delete the soft link between the installation directory of OceanBase Database and the cgroup system directory.

   ```shell
   [admin@xxx /home/admin/oceanbase]
   $ll cgroup
   lrwxrwxrwx 1 admin admin 29 Dec  8 11:09 cgroup -> /sys/fs/cgroup/cpu/oceanbase/

   [admin@xxx /home/admin/oceanbase]
   $ rm -rf cgroup
   ```

3. Delete the cgroup system directory `/sys/fs/cgroup/cpu/oceanbase`.

   Files in the cgroup system directory must be recursively deleted from a lower-level directory to an upper-level directory. Therefore, you can create a script file named `deletecgroupdir.sh` to delete the cgroup system directory and its subdirectories.

   1. Create a script file, enter related content, and save the script file.

      ```shell
      [admin@xxx /home/admin]$ vim deletecgroupdir.sh
      ```

      You must enter the following content in the script file:

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
      # Read the first parameter.
      read_dir /sys/fs/cgroup/cpu/oceanbase
      ```

   2. Execute the script to delete the cgroup system directory.
  
      ```shell
      [admin@xxx /home/admin]
      $sudo /bin/bash deletecgroupdir.sh
      ```

## Configure Global CPU Resource Isolation for Foreground and Background Tasks

OceanBase Database supports global CPU resource isolation for foreground and background tasks in all tenants.

### Overview

In a high-performance computing environment, reasonable resource allocation and isolation are decisive in ensuring system stability and improving efficiency. An effective resource isolation strategy can prevent resource contention and interference between tasks, thereby improving the resource utilization efficiency and overall service quality. At present, OceanBase Database allows you to configure different unit configs for tenants to implement resource isolation between the tenants, and use the `DBMS_RESOURCE_MANAGER` system package to configure resource isolation within a tenant.

Before you enable global CPU resource isolation for foreground and background tasks on an OBServer node, the OBServer node supports CPU resource isolation between tenants and within a tenant, as shown in the following figure.

![Before global CPU resource isolation is enabled for foreground and background tasks](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/02_cgroup_config/001.png)

The isolation hierarchy is shown as a tree structure. The strategies of resource isolation between tenants depend on the unit configs of the tenants. The strategies of resource isolation between tasks within a tenant are determined by the `DBMS_RESOURCE_MANAGER` system package.

After you enable global CPU resource isolation for foreground and background tasks, the system creates a tenant-level sub-cgroup based on background tasks. The background sub-cgroup can be understood as a virtual tenant. The `MAX_CPU` value of the virtual tenant is the same as the value of the `global_background_cpu_quota` parameter, and the `MIN_CPU` value of the virtual tenant is `1`. The following figure shows the isolation hierarchy after global CPU resource isolation is enabled for foreground and background tasks.

![After global CPU resource isolation is enabled for foreground and background tasks](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/04_resource_isolation_within_a_tenant/02_cgroup_config/002.png)

After you enable global CPU resource isolation for foreground and background tasks, the maximum CPU resources available to all background tasks are limited by the `global_background_cpu_quota` parameter even if you do not specify strategies of resource isolation within a tenant. This prevents background tasks from affecting foreground tasks.

### Scenarios

We recommend that you enable global CPU resource isolation for foreground and background tasks in the following scenarios:

* You expect global resource isolation for background tasks to prevent them from affecting foreground tasks.

* You want to avoid calculation or configuration of complex strategies of resource isolation between tenants and within a tenant, especially when a large number of tenants are deployed.

### Prerequisites

You have configured the cgroup directory and enabled the cgroup feature on the OBServer node.

### Considerations

* CPU resources can be isolated between tenants. After you enable global CPU resource isolation for foreground and background tasks, the maximum CPU resources available for background tasks of each tenant are limited by the `global_background_cpu_quota` parameter and are equal to `min(MAX_CPU of the tenant, global_background_cpu_quota)`.

  <main id="notice" type='notice'>
  <h4>Notice</h4>
  <p>In OceanBase Database V4.2.1 and later, CPU resources for the <code>sys</code> tenant are not limited, to avoid impact on requests from the <code>sys</code> tenant. </p>
  </main>

* CPU resources can be isolated within a tenant. After you enable global CPU resource isolation for foreground and background tasks, you can use the `DBMS_RESOURCE_MANAGER` system package to configure resource isolation within a tenant. The maximum CPU resources available to each background task of the tenant are calculated based on the maximum CPU resources available for all background tasks of the tenant and are equal to `min(global_background_cpu_quota, MAX_CPU of the tenant) × UTILIZATION_LIMIT within the resource group`.

### Enable global CPU resource isolation for foreground and background tasks

In OceanBase Database, global CPU resource isolation for foreground and background tasks is controlled by the following two parameters:

* `enable_global_background_resource_isolation`

  This parameter specifies whether to enable global CPU resource isolation for foreground and background tasks. It is a cluster-level parameter. The default value is `False`, which specifies to disable global CPU resource isolation for foreground and background tasks. In this case, CPU resources for foreground and background tasks are isolated within a tenant. The setting takes effect only after you restart the OBServer node.
  
  The value `True` specifies to enable global CPU resource isolation for foreground and background tasks. In this case, CPU resources for background tasks are limited independently of tenants.

  For more information about the `enable_global_background_resource_isolation` parameter, see [enable_global_background_resource_isolation](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001719949).

* `global_background_cpu_quota`

  This parameter specifies the CPU quota available for background tasks. It is a cluster-level parameter. The default value is `-1`, which specifies that the CPU resources available for background tasks are not limited by the cgroup.

  For more information about the `global_background_cpu_quota` parameter, see [global_background_cpu_quota](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001719950).

To enable global CPU resource isolation for foreground and background tasks, perform the following steps:

1. Log in to the `sys` tenant of the cluster as the `root` user.

2. Execute the following statement to enable global CPU resource isolation for foreground and background tasks:

   ```shell
   obclient> ALTER SYSTEM SET enable_global_background_resource_isolation = True;
   ```

3. Specify the CPU quota available for background tasks based on your business needs.

   The value must be less than the CPU quota available for the current OBServer node.

   ```shell
   obclient> ALTER SYSTEM SET global_background_cpu_quota = 3;
   ```

4. Restart the OBServer node for the setting to take effect.

   After the setting takes effect, the system creates a `background` directory at the same level as all tenants in the original cgroup directory structure. The `background` directory acts as a cgroup directory for background tasks. The system also creates cgroup directories corresponding to all tenants in the `background` directory.

### What to do next

Global CPU resource isolation for foreground and background tasks limits the CPU resources for background tasks from a global perspective. If you expect finer-grained resource isolation for background tasks, you can use the `DBMS_RESOURCE_MANAGER` system package to configure resource isolation within a tenant.