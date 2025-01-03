---
title: Perform O&M by using OBD
weight: 3
---

# 5.2 Perform O&M by using OBD

OceanBase Deployer (OBD) is a tool for installing and deploying open source ecosystem components of OceanBase. It can also be used to manage deployed components. For example, you can use OBD to restart, upgrade, scale out, and diagnose these components. This topic describes how to use OBD for O&M.

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing or the Long-Term Support (LTS) version. You can switch to another version as needed in the upper-left corner of the document page.

You can run the following command to view the basic information of level-1 directories of OBD. Based on this information, you can learn about the management and O&M methods of OBD, as well as the considerations.

```shell
[admin@test001 ~]$ tree -L 1 ~/.obd
```

The output is as follows:

```shell

/home/admin/.obd
├── cluster         # Stores the configuration file of the deployed cluster. We recommend that you do not directly edit this configuration file. You can run the obd cluster edit-config command to modify the cluster configurations. This directory contains a hidden file named .data, which records the name of the deployed cluster, information about components, and deployment status. We recommend that you do not directly edit this configuration file.
├── config_parser
├── lock
├── log             # Stores the operation logs of OBD commands.
├── mirror          # Stores the installation package in the local repository and the .repo file in the remote repository.
├── optimize
├── plugins         # Stores plug-ins of components.
├── repository     
└── version         # Records the OBD version. 
```

## Modify parameters of an OceanBase cluster

To modify the system parameters of an OceanBase cluster, you can run the `obd cluster edit-config` command in OBD to modify the deployment configuration file. Run the following command to view the `parameter.yaml` file to obtain the OceanBase cluster parameters that can be modified in OBD:

```shell
find ~/.obd/plugin/${component} "parameter.yaml"
```

You must replace `${component}` in the command with the name of the target component. In this example, it is replaced with `oceanbase-ce` to view the parameters of OceanBase Database.

Modifications to parameters in the `parameter.yaml` file may take effect in one of the following ways. The specific method by which the modifications take effect is also displayed in the output of the `obd cluster edit-config` command.

* If `need_redeploy` is set to `true` for a parameter, you must run the `obd cluster redeploy` command for the modifications to take effect. This command will uninstall the service, clear data, and deploy a new cluster. Proceed with caution.

* If `need_restart` is set to `true` for a parameter, you must run the `obd cluster restart` command for the modifications to take effect. This command will restart the service. Pay attention to the impact of service interruptions in a production environment.

* If `need_reload` is set to `true` for a parameter, you must run the `obd cluster reload` command for the modifications to take effect.

The following describes the general O&M procedure in OBD through an example of modifying the resource parameters of an OceanBase cluster and scaling out the resources of a user tenant.

1. View the cluster list.

   ```shell
   [admin@test001 ~]$ obd cluster list
   ```

   The output is as follows:

   ```shell
   +--------------------------------------------------------+
   |                      Cluster List                      |
   +------+-------------------------------+-----------------+
   | Name | Configuration Path            | Status (Cached) |
   +------+-------------------------------+-----------------+
   | test | /home/admin/.obd/cluster/test | running         |
   +------+-------------------------------+-----------------+
   ```

2. Modify the configuration file.

   For parameters included in the deployment configuration file, run the `obd cluster edit-config` command to modify them. For parameters not included in the file, you can log on to the database and execute the `alter system set Parameter name='Parameter value';` statement to modify them.

   ```shell
   [admin@test001 ~]$ obd cluster edit-config test
   ```

   After you run the command, find the oceanbase-ce module in the configuration file that is opened. Here is an example:

   ```yaml
   oceanbase-ce:
     servers:
       - 10.10.10.1
     global:
       home_path: /home/admin/oceanbase
       data_dir: /obdata/data
       redo_dir: /obdata/log
       devname: eth0
       mysql_port: 2881 
       rpc_port: 2882 
       zone: zone1
       cluster_id: 1
       memory_limit: 32G 
       system_memory: 5G 
       datafile_size: 100G 
       datafile_next: 0G
       datafile_maxsize: 0G
       log_disk_size: 100G 
       cpu_count: 16
       production_mode: false
       enable_syslog_wf: false 
       enable_syslog_recycle: true 
       max_syslog_file_count: 10
       root_password ******
   ```

   Change the value of the `memory_limit` parameter to `50G`, `system_memory` to `10G`, and `log_disk_size` to `150G` in the configuration file. Then, run the `:x` command to save the configuration file and exit.

   When you increase resource parameter values, make sure that the new values do not exceed the range of the remaining resources on servers. When you decrease resource parameter values, make sure that the new values are not smaller than the sizes of resources that have been allocated to or occupied by tenants. For more information about the relationships among resource parameters, see the **Common resource parameters of OceanBase Database and their calculation methods** section in **2.1 Deploy OceanBase database - Preparations before deployment**.

   > **Notice**
   >
   > You cannot decrease the value of the `datafile_size` parameter.

3. Reload the configurations.

   After you modify and save the configuration file, OBD will output the reload command. Here is an example of the output:

   ```shell
   Search param plugin and load ok
   Search param plugin and load ok
   Parameter check ok
   Save deploy "test" configuration
   Use `obd cluster reload test` to make changes take effect.
   Trace ID: 12ece7da-f32d-11ee-ae7a-00163e046d79
   If you want to view detailed obd logs, please run: obd display-trace 12ece7da-f32d-11ee-ae7a-00163e046d79
   ```

   You can run the `obd cluster reload test` command provided in the preceding output for the modifications to take effect.

   ```shell
   [admin@test001 ~]$ obd cluster reload test 
   ```

   The output is as follows:

   ```shell
   Get local repositories and plugins ok
   Load cluster param plugin ok
   Open ssh connection ok
   Cluster status check ok
   Connect to observer 10.10.10.1:2881 ok
   test reload
   Trace ID: 70529604-f32d-11ee-a216-00163e046d79
   If you want to view detailed obd logs, please run: obd display-trace 70529604-f32d-11ee-a216-00163e046d79
   ```

4. Verify the modifications.

   Log on to the `sys` tenant of OceanBase Database as the `root` user, and run the following command to verify whether a parameter is modified. The `memory_limit` parameter is used as an example here.

   ```shell
   obclient [oceanbase]> show parameters like 'memory_limit';
   ```

   The output is as follows:

   ```shell
   +-------+----------+----------------+----------+--------------+-----------+-------+---------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+
   | zone  | svr_type | svr_ip         | svr_port | name         | data_type | value | info                                                                                                                            | section  | scope   | source  | edit_level        |
   +-------+----------+----------------+----------+--------------+-----------+-------+---------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+
   | zone1 | observer | 10.10.10.1     |     2882 | memory_limit | NULL      | 50G   | the size of the memory reserved for internal use(for testing purpose), 0 means follow memory_limit_percentage. Range: 0, [1G,). | OBSERVER | CLUSTER | DEFAULT | DYNAMIC_EFFECTIVE |
   +-------+----------+----------------+----------+--------------+-----------+-------+---------------------------------------------------------------------------------------------------------------------------------+----------+---------+---------+-------------------+
   ```

5. View the available resources of the OceanBase cluster.

   ```shell
   obclient [oceanbase]> select zone,svr_ip,svr_port,cpu_capacity,cpu_assigned_max,cpu_capacity-cpu_assigned_max as cpu_free,round(memory_limit/1024/1024/1024,2) as memory_total_gb,round((memory_limit-mem_capacity)/1024/1024/1024,2) as system_memory_gb,round(mem_assigned/1024/1024/1024,2) as mem_assigned_gb,round((mem_capacity-mem_assigned)/1024/1024/1024,2) as memory_free_gb,round(log_disk_capacity/1024/1024/1024,2) as log_disk_capacity_gb,round(log_disk_assigned/1024/1024/1024,2) as log_disk_assigned_gb,round((log_disk_capacity-log_disk_assigned)/1024/1024/1024,2) as log_disk_free_gb,round((data_disk_capacity/1024/1024/1024),2) as data_disk_gb,round((data_disk_in_use/1024/1024/1024),2) as data_disk_used_gb,round((data_disk_capacity-data_disk_in_use)/1024/1024/1024,2) as data_disk_free_gb from gv$ob_servers;
   ```

   The output is as follows:

   ```shell
   +-------+----------------+----------+--------------+------------------+----------+-----------------+------------------+-----------------+----------------+----------------------+----------------------+------------------+--------------+-------------------+-------------------+
   | zone  | svr_ip         | svr_port | cpu_capacity | cpu_assigned_max | cpu_free | memory_total_gb | system_memory_gb | mem_assigned_gb | memory_free_gb | log_disk_capacity_gb | log_disk_assigned_gb | log_disk_free_gb | data_disk_gb | data_disk_used_gb | data_disk_free_gb |
   +-------+----------------+----------+--------------+------------------+----------+-----------------+------------------+-----------------+----------------+----------------------+----------------------+------------------+--------------+-------------------+-------------------+
   | zone1 | 10.10.10.1     |     2882 |           16 |               16 |        0 |           50.00 |            10.00 |           27.00 |          13.00 |               150.00 |               100.00 |            50.00 |       100.00 |              0.04 |             99.96 |
   +-------+----------------+----------+--------------+------------------+----------+-----------------+------------------+-----------------+----------------+----------------------+----------------------+------------------+--------------+-------------------+-------------------+
   ```

6. View the resource allocation information of tenants in the OceanBase cluster.

   ```shell
   select t4.tenant_id,t4.tenant_name,t1.name resource_pool_name, t1.unit_count, t2.`name` unit_config_name, t2.max_cpu, t2.min_cpu, round(t2.memory_size/1024/1024/1024,2) mem_size_gb, round(t2.log_disk_size/1024/1024/1024,2) log_disk_size_gb, t2.max_iops, t2.min_iops, t3.unit_id, t3.zone, concat(t3.svr_ip,':' ,t3.`svr_port`) observer from dba_ob_resource_pools t1 join dba_ob_unit_configs t2 on (t1.unit_config_id=t2.unit_config_id) join dba_ob_units t3 on (t1.`resource_pool_id` = t3.`resource_pool_id`) left join dba_ob_tenants t4 on (t1.tenant_id=t4.tenant_id) order by t4.tenant_name,t3.zone;
   ```

   The output is as follows:

   ```shell
   +-----------+-------------+--------------------+------------+------------------+---------+---------+-------------+------------------+---------------------+---------------------+---------+-------+---------------------+
   | tenant_id | tenant_name | resource_pool_name | unit_count | unit_config_name | max_cpu | min_cpu | mem_size_gb | log_disk_size_gb | max_iops            | min_iops            | unit_id | zone  | observer            |
   +-----------+-------------+--------------------+------------+------------------+---------+---------+-------------+------------------+---------------------+---------------------+---------+-------+---------------------+
   |         1 | sys         | sys_pool           |          1 | sys_unit_config  |       3 |       3 |        2.00 |             4.00 | 9223372036854775807 | 9223372036854775807 |       1 | zone1 | 10.10.10.1:2882     |
   |      1002 | test_tenant | test_tenant_pool   |          1 | test_tenant_unit |      13 |      13 |       25.00 |            96.00 | 9223372036854775807 | 9223372036854775807 |    1001 | zone1 | 10.10.10.1:2882     |
   +-----------+-------------+--------------------+------------+------------------+---------+---------+-------------+------------------+---------------------+---------------------+---------+-------+---------------------+
   ```

7. Upgrade the unit config of the `test_tenant` tenant.

   > **Note**
   >
   > If you add significant cluster resources, we recommend that you also add resources (except `system_memory`) for the `sys` tenant. Since the `sys` tenant hosts RootService and other key system processes, its performance issues can impair the response speed and processing capability of the entire cluster.

   The following command increases the memory size from `25G` to `35G` and the transaction log disk size from `96G` to `105G` for the tenant.

   ```shell
   obclient [oceanbase]> alter resource unit test_tenant_unit MEMORY_SIZE '35G',LOG_DISK_SIZE '105G';
   ```

   Take note of the following rules when you adjust the resource parameters of a tenant:

   * When you increase resource parameter values, make sure that the new values do not exceed the range of the remaining resources of the OceanBase cluster.

   * When you decrease resource parameter values, make sure that the memory size is not smaller than the value of `__min_full_resource_pool_memory`. You can log on to the `sys` tenant of the OceanBase cluster as the `root` user and execute the following statement to query the value of the `__min_full_resource_pool_memory` parameter:
  
     ```sql
     select * from oceanbase.GV$OB_PARAMETERS where name ='__min_full_resource_pool_memory';
     ```

   * When you decrease resource parameter values, make sure that the number of CPU cores is not smaller than 1, and that the value of `MAX_CPU` is not smaller than the value of `MIN_CPU`.

   * When you decrease resource parameter values, we recommend that you set `LOG_DISK_SIZE` to a value that is three to four times the memory size.

8. View available resources of the OceanBase cluster again.

   ```shell
   obclient [oceanbase]> select zone,svr_ip,svr_port,cpu_capacity,cpu_assigned_max,cpu_capacity-cpu_assigned_max as cpu_free,round(memory_limit/1024/1024/1024,2) as memory_total_gb,round((memory_limit-mem_capacity)/1024/1024/1024,2) as system_memory_gb,round(mem_assigned/1024/1024/1024,2) as mem_assigned_gb,round((mem_capacity-mem_assigned)/1024/1024/1024,2) as memory_free_gb,round(log_disk_capacity/1024/1024/1024,2) as log_disk_capacity_gb,round(log_disk_assigned/1024/1024/1024,2) as log_disk_assigned_gb,round((log_disk_capacity-log_disk_assigned)/1024/1024/1024,2) as log_disk_free_gb,round((data_disk_capacity/1024/1024/1024),2) as data_disk_gb,round((data_disk_in_use/1024/1024/1024),2) as data_disk_used_gb,round((data_disk_capacity-data_disk_in_use)/1024/1024/1024,2) as data_disk_free_gb from gv$ob_servers;
   ```

   The output is as follows:

   ```shell
   +-------+----------------+----------+--------------+------------------+----------+-----------------+------------------+-----------------+----------------+----------------------+----------------------+------------------+--------------+-------------------+-------------------+
   | zone  | svr_ip         | svr_port | cpu_capacity | cpu_assigned_max | cpu_free | memory_total_gb | system_memory_gb | mem_assigned_gb | memory_free_gb | log_disk_capacity_gb | log_disk_assigned_gb | log_disk_free_gb | data_disk_gb | data_disk_used_gb | data_disk_free_gb |
   +-------+----------------+----------+--------------+------------------+----------+-----------------+------------------+-----------------+----------------+----------------------+----------------------+------------------+--------------+-------------------+-------------------+
   | zone1 | 10.10.10.1     |     2882 |           16 |               16 |        0 |           50.00 |            10.00 |           37.00 |           3.00 |               150.00 |               109.00 |            41.00 |       100.00 |              0.10 |             99.90 |
   +-------+----------------+----------+--------------+------------------+----------+-----------------+------------------+-----------------+----------------+----------------------+----------------------+------------------+--------------+-------------------+-------------------+
   ```

## Restart managed service components

You can run the `obd cluster stop` and `obd cluster start` commands, or the `obd cluster restart` command alone to restart the deployed service components. You can also choose to restart a specific component or a specific component on a specific node. For more information about the commands, see [Cluster commands](https://en.oceanbase.com/docs/community-obd-en-10000000001181575).

This section uses a three-node cluster, where ODP and OceanBase Database are co-deployed, as an example to describe how to use OBD for restart.

### Restart the entire cluster

```shell
[admin@@test001 /home/admin]$ obd cluster restart test2
```

Take note of the following considerations:

* Before you restart components, make sure that SSH connections have been established among all nodes where the components reside. Otherwise, you cannot restart the components even if you specify the node IP addresses.

* The status of a deployed cluster is `running` in the `obd cluster list` command output only if all components in the cluster have been restarted. If any component fails to be restarted, subsequent components will not be restarted.

  > **Notice**
  >
  > The status of the deployed cluster returned in the `obd cluster list` command output is not updated in real time. When a server restarts, the service component on the server may become abnormal while the status of the cluster is still displayed as `running`. Therefore, we recommend that after a server restarts, you run the `obd cluster display` command to verify whether all components are normal.

* If the status of the deployed cluster is not `running`, subsequent management operations, such as upgrade and scale-out, will be affected.

The output of the restart command is as follows, where the status of all components in the cluster is displayed:

```shell
Get local repositories and plugins ok
Load cluster param plugin ok
Open ssh connection ok
Cluster status check ok
Check before restart observer ok
Connect to observer ok
Server check ok
Observer restart ok
Wait for observer init ok
+--------------------------------------------------+
|                     observer                     |
+----------------+---------+------+-------+--------+
| ip             | version | port | zone  | status |
+----------------+---------+------+-------+--------+
| 10.10.10.1     | 4.2.1.2 | 2881 | zone1 | ACTIVE |
| 10.10.10.2     | 4.2.1.2 | 2881 | zone3 | ACTIVE |
| 10.10.10.3     | 4.2.1.2 | 2881 | zone2 | ACTIVE |
+----------------+---------+------+-------+--------+
obclient -h10.10.10.1 -P2881 -uroot -p'******' -Doceanbase -A

Check before start obproxy ok
Stop obproxy ok
Start obproxy ok
obproxy program health check ok
Connect to obproxy ok
+--------------------------------------------------+
|                     obproxy                      |
+----------------+------+-----------------+--------+
| ip             | port | prometheus_port | status |
+----------------+------+-----------------+--------+
| 10.10.10.1     | 2883 | 2884            | active |
| 10.10.10.2     | 2883 | 2884            | active |
| 10.10.10.3     | 2883 | 2884            | active |
+----------------+------+-----------------+--------+
obclient -h10.10.10.1 -P2883 -uroot@proxysys -p'******' -Doceanbase -A 

test2 restart
Trace ID: 471fd8d0-f33e-11ee-88aa-00163e046d79
If you want to view detailed obd logs, please run: obd display-trace 471fd8d0-f33e-11ee-88aa-00163e046d79
```

### Restart specified service components in the deployment configuration file

```shell
[admin@test001 /home/admin]$ obd cluster restart test2 -c obproxy-ce
```

Take note of the following considerations:

* The component name specified by `-c` is the component module name in the deployment configuration file, not the name displayed in the output of the `obd cluster display` command.

* To specify multiple component names, separate them with commas (`,`).

* If you choose to restart a service component separately, the status of the deployed cluster does not change. For example, if you restart a service component separately or restart service components sequentially for a cluster in the `stopped` state, the cluster will remain in the `stopped` state even after the restart is complete.

The output of the restart command is as follows, where the status of only specified components in the cluster is displayed:

```shell
Get local repositories and plugins ok
Load cluster param plugin ok
Open ssh connection ok
Cluster status check ok
Check before start obproxy ok
Stop obproxy ok
Start obproxy ok
obproxy program health check ok
Connect to obproxy ok
+--------------------------------------------------+
|                     obproxy                      |
+----------------+------+-----------------+--------+
| ip             | port | prometheus_port | status |
+----------------+------+-----------------+--------+
| 10.10.10.1     | 2883 | 2884            | active |
| 10.10.10.2     | 2883 | 2884            | active |
| 10.10.10.3     | 2883 | 2884            | active |
+----------------+------+-----------------+--------+
obclient -h10.10.10.1 -P2883 -uroot -p'******' -Doceanbase -A
succeed
Trace ID: 669dc098-f3dc-11ee-bafb-00163e046d79
If you want to view detailed obd logs, please run: obd display-trace 669dc098-f3dc-11ee-bafb-00163e046d79
```

### Restart specified service components on specified nodes in the deployment configuration file

```shell
[admin@test001 /home/admin]$ obd cluster start test2 -c oceanbase-ce  -s xx.xx.xx.2
```

Take note of the following considerations:

* To specify multiple component names or node IP addresses, separate them with commas (`,`).

* If an incorrect IP address is specified, OBD will skip this IP address and restart components on nodes with correct IP addresses.

* If an incorrect component name is specified, OBD will abort the restart process.

The output of the restart command is as follows:

```shell
Get local repositories ok
Search plugins ok
Open ssh connection ok
Load cluster param plugin ok
Cluster status check ok
Check before start observer ok
Start observer ok
observer program health check ok
Connect to observer 10.10.10.2:2881 ok
succeed
Trace ID: bb2082a0-f3db-11ee-8a93-00163e046d79
If you want to view detailed obd logs, please run: obd display-trace bb2082a0-f3db-11ee-8a93-00163e046d79
```

## Upgrade managed service components

You can upgrade service components in a cluster deployed by using OBD, such as OceanBase Database, ODP, and OceanBase Cloud Platform (OCP) Express. OBD does not support batch upgrade. This section describes how to upgrade OBD, OceanBase Database, ODP, and OCP Express in sequence.

> **Note**
>
> * To use OBD to upgrade cluster components, make sure that the cluster is managed by OBD. Otherwise, OBD cannot obtain the cluster information. By default, a cluster deployed by using OBD is managed by OBD. For a cluster not deployed with OBD, you first need to take over the cluster to OBD.
>
> * This section does not describe how to upgrade OCP. For information about how to upgrade OCP by using OBD, see [Upgrade OCP on the GUI](https://en.oceanbase.com/docs/common-ocp-10000000001483962).

### Upgrade OBD

You can upgrade OBD in online or offline mode, depending on whether Internet access is available in the current environment.

#### Online upgrade

1. Enable remote repositories.

   ```shell
   [admin@test001 /home/admin]$ obd mirror enable remote
   ```

2. Run the upgrade command.

   ```shell
   [admin@test001 /home/admin]$ obd update
   ```

#### Offline upgrade

In an offline environment, you first need to obtain the installation package of the target OBD version and upload the installation package to any directory in the current environment.

1. Disable remote repositories.

   ```shell
   [admin@test001 /home/admin]$ obd mirror disable remote
   ```

2. Clone the installation package to the local repository of OBD.

   ```shell
   [admin@test001 /home/admin]$ obd mirror clone ob-deploy-*.rpm
   ```

3. Run the upgrade command.

   ```shell
   [admin@test001 /home/admin]$ obd update 
   ```

### Upgrade OceanBase Database

Take note of the following considerations:

* Before the upgrade, you need to verify whether OBD needs to be upgraded. We recommend that you use the latest OBD version.

* If a tenant in the cluster to be upgraded has a standby tenant, you must first upgrade the cluster where the standby tenant resides or run the `obd cluster tenant switchover` command to switch the primary tenant in the current cluster to a standby tenant. We recommend that you upgrade the primary and standby clusters to the same version. For more information about the `obd cluster tenant switchover` command, see the **obd cluster tenant switchover** section in [Cluster commands](https://en.oceanbase.com/docs/community-obd-en-10000000001181575).

* Before the upgrade, you need to verify whether the current version can be upgraded to the target version. For more information, see the upgrade notes section in the release notes of the target version. For the release notes of OceanBase Database, visit the [link](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001376050).

* Before the upgrade, make sure that the deployed cluster is in the `running` state and the OceanBase cluster is normal.

* If the upgrade fails, you can run the upgrade command again. However, it is prohibited to modify system parameters of the cluster before the upgrade failure cause is confirmed. For example, it is prohibited to modify the `enable_ddl` and `enable_upgrade_mode` parameters. When the upgrade fails, you can run the `obd display-trace xxxx` command displayed in the output to view logs, or directly check the upgrade log file `upgrade_post.log`.

* The default upgrade mode is rolling upgrade and cannot be modified. During the upgrade, a node being upgraded will stop providing database services. If the cluster contains less than three zones or is a standalone cluster, you need to pay attention to the impact of the upgrade on business.

* If the target version is V4.0.x, V4.1.x, or V4.2.0 BETA, you need to restore the primary zone priorities of user tenants after the upgrade. Otherwise, the business performance may be compromised.

* After the upgrade, we recommend you upgrade other components to matching versions.

For more information, see [Upgrade OceanBase Database](https://en.oceanbase.com/docs/community-obd-en-10000000001181608).

### Upgrade ODP

You can upgrade ODP in online or offline mode, depending on whether Internet access is available in the current environment.

#### Online upgrade

1. Enable remote repositories.

   ```shell
   [admin@test001 /home/admin]$ obd mirror enable remote
   ```

2. View the versions of ODP in the corresponding remote repository.

   ```shell
   [admin@test001 /home/admin]$ obd mirror list oceanbase.community.stable | grep obproxy-ce
   ```

   The output is as follows, where the hash values of the corresponding versions of ODP (obproxy-ce) are displayed in the last column:

   ```shell
   [admin@test001 /home/admin]$ obd mirror list oceanbase.community.stable | grep obproxy-ce
   | obproxy-ce                   | 4.1.0.0 | 7.el8                  | x86_64 | 9f64a13645980e5c767fdbfc6aa0ff3fca7c2fe468d40aeb6c45ea2cccd863ba |
   | obproxy-ce                   | 4.2.0.0 | 7.el8                  | x86_64 | bac143e7cdedd98fd4458a66291b403b42d1f8effffb896452105020331b7053 |
   | obproxy-ce                   | 4.2.1.0 | 11.el8                 | x86_64 | eff4c01cef815c1323b70ae5105cc09d5711852baf3638b6cd12c5f9d09ffe7c |
   | obproxy-ce                   | 4.2.3.0 | 3.el8                  | x86_64 | 14958440fa70d669cf08671b3e5a2c3bdbec235fbe72960a9bc51e61b4ed6f8d |
   ```

3. Run the upgrade command.

   The following command upgrades ODP from an earlier version to V4.2.3. You need to replace the version number and hash value based on the actual situation.

   ```shell
   [admin@test001 /home/admin]$ obd cluster upgrade test2 -c obproxy-ce -V 4.2.3.0 --usable=14958440fa70d669cf08671b3e5a2c3bdbec235fbe72960a9bc51e61b4ed6f8d
   ```

#### Offline upgrade

In an offline environment, you first need to obtain the installation package of the target ODP version and upload the installation package to any directory in the current environment.

1. Disable remote repositories.

   ```shell
   [admin@test001 /home/admin]$ obd mirror disable remote
   ```

2. Clone the installation package to the local repository of OBD.

   ```shell
   [admin@test001 /home/admin]$ obd mirror clone obproxy-ce-*.rpm
   ```

3. View the list of installation packages in the local repository.

   ```shell
   [admin@test001 /home/admin]$ obd mirror list local |grep obproxy-ce
   | obproxy-ce                | 4.2.3.0   | 3.el7                  | x86_64  | 0490ebc04220def8d25cb9cac9ac61a4efa6d639 |
   | obproxy-ce                | 4.2.1.0   | 11.el7                 | x86_64  | 0aed4b782120e4248b749f67be3d2cc82cdcb70d |
   ```

4. Run the upgrade command.

   ```shell
   [admin@test001 /home/admin]$ obd cluster upgrade test2 -c obproxy-ce -V 4.2.3.0 --usable=0490ebc04220def8d25cb9cac9ac61a4efa6d639
   ```

5. Verify the ODP version.

   After the upgrade, log on to the `sys` tenant of OceanBase Database as the `root` user, and run the following command to query the ODP version:

   ```shell
   show proxyinfo binary\G
   ```

### Upgrade OCP Express

> **Note**
>
> At present, you can upgrade OCP Express only by running OBD commands on the CLI.

Take note of the following considerations:

* Before the upgrade, you need to verify whether OBD needs to be upgraded. We recommend that you use the latest OBD version.

* In an offline environment, you need to clone the installation packages of both OCP Express and OBAgent of a matching version to the local repository.

* Before the upgrade, you first need to verify the current and target versions of OCP Express. The methods for intra-version upgrade and inter-version upgrade are different. For example, the `obd cluster reinstall` command is used for intra-version upgrade, and the `obd cluster upgrade` command is used for inter-version upgrade.

* An upgrade failure does not affect the business database. You can run the `obd display-trace xxxx` command for troubleshooting.

* After the upgrade, the logon password of OCP Express will not be reset. You can log on and choose **Help** > **About OCP Express** to check the version number and release date to verify whether OCP Express is upgraded to the target version.

For more information, see [Upgrade OCP Express](https://en.oceanbase.com/docs/community-obd-en-10000000001181610).

## Scale out managed service components

OBD V2.5.0 and later support scale-out for all components except OCP-Server and oblogproxy in a cluster. For more information, see [Scale out a cluster and change cluster components](https://en.oceanbase.com/docs/community-obd-en-10000000001181616). This section describes the considerations and procedure for scaling out an OceanBase cluster by using OBD.

### Considerations

Take note of the following considerations:

* Before the scale-out, you need to verify whether OBD needs to be upgraded. We recommend that you use the latest OBD version.

* Before the scale-out, we recommend that you first perform server initialization for the nodes to be added. The deployment user and SSH connection information must be consistent with those of existing nodes in the cluster. For more information, see '**2.1 Deploy OceanBase database - Preparations before deployment**'.

* Before the scale-out, make sure that the OceanBase cluster is normal.

* Before the scale-out, make sure that OBClient is installed.

* You cannot modify the original cluster configurations in the `depends`, `global`, and `server` sections of the configuration file for a new node. You only need to configure the basic information for the new node. Make sure that the resource configurations and mounted directories of the new node are consistent with those of existing nodes in the cluster.

* During the scale-out, the `obd cluster scale_out` command will update the configuration information of the new node to the cluster deployment configuration file and perform a environment pre-check for the new node. If the new node passes the check, the command will install and start the OceanBase Database service on the new node, and then add the new node to the cluster.

* After the scale-out, you can run the `obd cluster display` command to check the cluster status.

* After the scale-out, you need to add a replica for the tenant. Otherwise, the tenant still has only one replica. For more information, see [Add replicas](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105989).

* After the scale-out, we recommend that you adjust the primary zone priorities of the tenant as needed.

* At present, OBD does not support scaling in a cluster.

* After the scale-out, you can add more OBServer nodes to each of the existing zones. You only need to specify the name of zones for which you want to add OBServer nodes in the scaling configuration file. Then, you can horizontally add resources for the tenant. For more information, see [Horizontal scaling of tenant resources](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106670).

### Procedure

The following example describes how to use OBD to scale out a standalone cluster into a three-zone cluster.

1. View information about the standalone cluster.

   ```shell
   [admin@test001 /home/admin]$obd cluster display Expansion
   ```

   In this example, the deployed cluster is named `Expansion`. You must replace the cluster name with the actual one. The output is as follows:

   ```shell
   Get local repositories and plugins ok
   Open ssh connection ok
   Cluster status check ok
   Connect to observer xx.xx.xx.1:2881 ok
   Wait for observer init ok
   +--------------------------------------------------+
   |                     observer                     |
   +----------------+---------+------+-------+--------+
   | ip             | version | port | zone  | status |
   +----------------+---------+------+-------+--------+
   | 10.10.10.1     | 4.2.1.2 | 2881 | zone1 | ACTIVE |
   +----------------+---------+------+-------+--------+
   obclient -hxx.xx.xx.1 -P2881 -uroot -p'******' -Doceanbase -A
   ```

2. Edit the scale-out configuration file.

   In this example, the scale-out configuration file is named `Expansion1_3.yaml`. You can change the file name.

   ```shell
   [admin@test001 /home/admin]$ vim Expansion1_3.yaml
   ```

   The file content is as follows:

   ```yaml
   oceanbase-ce:
     servers:
       - name: server2
         ip: 10.10.10.2
       - name: server3
         ip: 10.10.10.3
     server2:
       mysql_port: 2881
       rpc_port: 2882 
       home_path: /home/admin/oceanbase
       zone: zone2
     server3:
       mysql_port: 2881
       rpc_port: 2882 
       home_path: /home/admin/oceanbase
       zone: zone3
   ```

3. Run the scale-out command.

   ```shell
   [admin@test001 /home/admin]$obd cluster scale_out Expansion  -c Expansion1_3.yaml
   ```

   The following output indicates that the scale-out is successful:

   ```shell
   succeed
   Connect to observer 10.10.10.1:2881 ok
   scaling out ok
   Waiting for observers ready ok
   Execute ` obd cluster display Expansion ` to view the cluster status
   ```

4. Verify the scale-out result.

   ```shell
   [admin@test001 /home/admin]$ obd cluster display Expansion
   ```

   The output is as follows:

   ```shell
   Get local repositories and plugins ok
   Open ssh connection ok
   Cluster status check ok
   Connect to observer 10.10.10.1:2881 ok
   Wait for observer init ok
   +--------------------------------------------------+
   |                     observer                     |
   +----------------+---------+------+-------+--------+
   | ip             | version | port | zone  | status |
   +----------------+---------+------+-------+--------+
   | 10.10.10.1     | 4.2.1.2 | 2881 | zone1 | ACTIVE |
   | 10.10.10.2     | 4.2.1.2 | 2881 | zone2 | ACTIVE |
   | 10.10.10.3     | 4.2.1.2 | 2881 | zone3 | ACTIVE |
   +----------------+---------+------+-------+--------+
   obclient -h10.10.10.1 -P2881 -uroot -p'******' -Doceanbase -A
   ```
