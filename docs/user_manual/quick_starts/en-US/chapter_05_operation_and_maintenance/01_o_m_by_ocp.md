---
title: Perform O&M by using OCP
weight: 2
---

# 5.1 Perform O&M by using OCP

OceanBase Cloud Platform (OCP) Community Edition is an enterprise-grade management platform designed for OceanBase Database. In the console of OCP Community Edition, you can manage a database cluster throughout its entire lifecycle, including installation, O&M, performance monitoring, configuration, upgrade, as well as adding and deleting hosts. OCP also provides comprehensive management features for tenants, including creation, topology display, performance monitoring, session management, and parameter management. The monitoring and alerting feature of OCP allows you to set monitoring rules for clusters, tenants, and hosts. You can also configure to send alert notifications through HTTP or scripts. In terms of system management, OCP allows you to view and manage tasks, as well as customize parameter settings. In terms of security, OCP supports user and role management to ensure secure access to the database.

For more information about the basic management and O&M features of OCP, see [Cluster Management](https://en.oceanbase.com/docs/common-ocp-10000000001187441) and [O&M Best practices](https://en.oceanbase.com/docs/common-ocp-10000000001265200).

This topic describes the common O&M features of OCP.

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing or the Long-Term Support (LTS) version. You can switch to another version as needed in the upper-left corner of the document page.

## Take over a cluster

You can take over an external cluster that is deployed in another OCP to the current OCP. After the cluster is taken over, you can manage, monitor, and maintain it in the same way as clusters deployed in the current OCP.

> **Note**
>
> * All newly released OCP versions support taking over OceanBase clusters and OceanBase Database Proxy (ODP) clusters. ODP is also known as OBProxy.
>
> * OCP V4.2.1 and later support taking over only ODP clusters that are deployed by using OCP. This limitation does not apply to OceanBase clusters.

### Take over an OceanBase cluster

You can take over an OceanBase cluster deployed by using OceanBase Deployer (OBD) or another OCP to the current OCP and then maintain and manage it in the current OCP. At present, you can take over an OceanBase cluster that is manually created, created in OBD, or created in another OCP.

Take note of the following considerations:

* You can take over a manually created OceanBase cluster that passes the takeover check. Generally, we recommend that you take over a cluster that is deployed by using OBD or another OCP.

* By default, OCP takes over its own MetaDB. However, functional O&M operations, such as cluster restart and tenant deletion, are not supported. This is why we recommend that you do not mix MetaDB with the business cluster.
  
  Log on to the `ocp_meta` tenant of OceanBase Database as the `root` user, and run the following command in the `meta_database` database to update the metadata:

  ```sql
  update meta_database.config_properties set value='' where key='ocp.ob.cluster.ops.blacklist';
  ```

* Before you take over an OceanBase cluster that is deployed in another OCP, you must first move out the cluster. If an OceanBase cluster is managed by two OCPs, their OCP-Agent configurations may overwrite each other, affecting normal operations. For more information about how to move out a cluster, see [Migrate a cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483755).

* After you take over an OceanBase cluster deployed by using OBD to the current OCP, we recommend that you no longer maintain or manage the cluster by using OBD. To prevent configuration conflicts caused by OCP and OBD jointly managing the same cluster, you can perform the following steps to delete the management information of the cluster from OBD:
  
  1. View the name of the deployed cluster.

     ```shell
     obd cluster list
     ```

     The output is as follows:

     ```shell
     +--------------------------------------------------------------+
     |                         Cluster List                         |
     +------+-------------------------------------+-----------------+
     | Name | Configuration Path                  | Status (Cached) |
     +------+-------------------------------------+-----------------+
     | demo | /home/admin/.obd/cluster/demo       | running         |
     | test | /home/admin/.obd/cluster/test       | running         |
     +------+-------------------------------------+-----------------+
     ```

  2. Delete the management information of the cluster.

     In this example, the cluster is named `test`. You must replace the cluster name with the actual one.

     ```shell
     rm -rf /home/admin/.obd/cluster/test
     ```

  3. Verify the result.

     Run the `obd cluster list` command again to view the clusters managed by OBD. If the target cluster is not included in the output, the management information of the cluster is successfully deleted.

* If you forget the password of the `proxyro@sys` account when you configure takeover information, you can change the password by referring to [Manage the proxyro account](https://en.oceanbase.com/docs/common-ocp-10000000001483852).

* If the hosts of the cluster to be taken over have been added to OCP, make sure that the IDC and region of the hosts are consistent with those of the cluster. You can query the `DBA_OB_ZONES` view for the IDC and region of the cluster.
  
  If the information is inconsistent, perform the following steps to modify the IDC and region of the cluster to be taken over:

  1. Log on to the sys tenant of the cluster to be taken over as the `root` user.

     ```shell
     obclient -h10.10.10.1 -uroot@sys -P2883 -p
     ```

     For information about how to connect to an OceanBase Database tenant by using OBClient, see [Connect to an OceanBase tenant by using OBClient](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104073).

  2. Modify the IDC and region of the cluster to be taken over.

     ```sql
     ALTER SYSTEM ALTER ZONE zone1 SET REGION 'xxx',IDC 'xxx';
     ```

     You need to execute the preceding statement for all zones.

  3. View the IDC and region of the cluster to be taken over.

     ```shell
     SELECT * FROM oceanbase.DBA_OB_ZONES;
     ```

     For more information about the `DBA_OB_ZONES` view, see [oceanbase.DBA_OB_ZONES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104331).

* By default, SQL collection is disabled for the taken-over MetaDB. In other words, it is normal that the SQL diagnostics module has no data. You can enable SQL collection by setting `ocp.perf.collect.metadb.enabled` to `true` in the system parameter management module. For more information, see [Modify system parameters](https://en.oceanbase.com/docs/common-ocp-10000000001483714).

For more information about how to take over an OceanBase cluster by using OCP, see [Take over a cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483752).

### Take over an ODP cluster

You can take over ODPs in an ODP cluster deployed in another OCP to an existing ODP cluster (referred to as the destination ODP cluster) in the current OCP, and then maintain and manage the newly formed ODP cluster in the current OCP.

Take note of the following considerations:

* Before the takeover, make sure that at least one ODP cluster is available in the current OCP. If not, deploy an ODP cluster, which can be a single-node cluster, in the current OCP.

* Before the takeover, we recommend that you first move out the ODP cluster to which the ODPs to be taken over belong from the original OCP. For more information, see [Migrate an OBProxy cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483849) or [Move out an OBProxy cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483602).
  
  > **Notice**
  >
  > When you take over ODPs, the password of the `root@proxysys` account is required. If you forget the password, you need to reset the password before you move out the ODP cluster. For more information about how to reset the password of the `root@proxysys` account, see [Change the password of the proxysys user](https://en.oceanbase.com/docs/common-ocp-10000000001483857).

* You can take over only ODPs deployed in another OCP, rather than ODPs deployed by using OBD.

* The obproxy process running on the host of an ODP to be taken over is checked during the takeover. Make sure that the status of the ODP is normal and that only one obproxy process runs on the host.

* You must first associate the destination ODP cluster with the connectable OceanBase clusters of the ODPs to be taken over. In other words, the list of connectable OceanBase clusters of the destination ODP cluster must include the connectable OceanBase clusters of the ODPs to be taken over.

* The version of the ODPs to be taken over must be close to that of the destination ODP cluster. We recommend that they share the same major version, such as V4.1.x. The third digit x in the version number can differ.

For more information about how to take over an ODP by using OCP, see [Take over an OBProxy](https://en.oceanbase.com/docs/common-ocp-10000000001483860) or [Take over OBProxies](https://en.oceanbase.com/docs/common-ocp-10000000001483585).

## Move out a cluster

You can move out an OceanBase cluster or ODP cluster from the current OCP. A moved-out cluster can be taken over to and managed by another OCP.

### Move out an OceanBase cluster

To manage an OceanBase cluster in a new OCP, you can move out the cluster from its current OCP and take it over to the new OCP. This process does not affect the business operations or data of the cluster.

Take note of the following considerations:

* OCP Community Edition supports moving out clusters since V4.2.2.

* An OceanBase cluster that is being maintained or upgraded cannot be moved out. You can move out only a cluster in the `STOPPED`, `RUNNING`, or `UNAVAILABLE` state. For more information about how to view the status of a cluster, see [Query clusters](https://en.oceanbase.com/docs/common-ocp-10000000001484158).

* If no other services run on the hosts of the moved-out OceanBase cluster, we recommend that you delete the hosts after the cluster is moved out. For more information about how to delete a host, see [Remove a host](https://en.oceanbase.com/docs/common-ocp-10000000001483634).

For more information about how to move out an OceanBase cluster, see [Migrate a cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483755).

### Move out an ODP cluster

After moving out an OceanBase cluster, you can also move out the corresponding ODP cluster from OCP without affecting the business of the OceanBase cluster. The moved-out ODP cluster can be taken over to and managed by OCP again.

Take note of the following considerations:

* OCP Community Edition supports moving out clusters since V4.2.2.

* You can move out only an ODP cluster in the online state.

* If no other services run on the hosts of the moved-out ODP cluster, we recommend that you delete the hosts after the cluster is moved out.

For more information about how to move out an ODP cluster by using OCP, see [Migrate an OBProxy cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483849) or [Move out an OBProxy cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483602).

## Back up and restore data

The backup and restore service is a common disaster recovery solution of OceanBase Database. The service can implement tenant-level or cluster-level remote physical backup by using Network File system (NFS), Alibaba Cloud Object Storage Service (OSS), or Tencent Cloud Object Storage (COS) as the backup media, thereby ensuring data security. You can perform restore based on backups.

### Backup media

Before backup, you first need to deploy the backup media. At present, OceanBase Database supports three types of backup media: NFS, OSS, and COS. We recommend that you use OSS as the backup destination. This is because OSS is stateless and more stable than the stateful NFS4. To use NFS as the backup destination, we recommend that you use the dedicated NFS hardware device.

Take note of the following considerations:

* If you want to use NFS as the backup media, you need to use NFS4.1 or later. NFS3 has poor stability.

* In a multi-node cluster environment, you must use backup media. Otherwise, you cannot perform backup. In a single-node test environment, you can perform local backup, but this brings security risks.

* To use OSS as the backup media, make sure that OceanBase Database is of V4.1.0 or later. To use COS as the backup media, make sure that OceanBase Database is of V4.2.1 or later.

* To use NFS as the backup media, you must deploy the NFS client on each node of the OceanBase cluster.

* The user of the observer process must have the read and write permissions on the directories of the NFS client and server.

For more information about how to deploy NFS, see [Deploy NFS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103535).

### Backup

After you deploy the backup media, choose **Backup & Recovery** > **Backup** in the left-side navigation pane of the OCP console, and create a tenant-level or cluster-level backup strategy. A cluster-level backup strategy applies to all user tenants that do not have tenant-level backup strategies in the cluster. After a backup strategy is created, backup is triggered by default at 04:00 a.m. every day, rather than immediately. You can also manually initiate an immediate backup.

> **Note**
>
> If you want to manually initiate an immediate backup but **Automatic Major Compaction** was not selected in the backup strategy, we recommend that you manually initiate a major compaction before the backup. For more information about how to perform a major compaction, see [Perform a major compaction](https://en.oceanbase.com/docs/common-ocp-10000000001483790) or [Perform a major compaction](https://en.oceanbase.com/docs/common-ocp-10000000001483726).

The following figure shows the physical backup architecture of OceanBase Database.

![Data backup](/5.1.png)

Take note of the following considerations:

* Backup is supported only for user tenants, rather than the sys tenant or meta tenants.
  
  For more information about meta tenants, see the **Meta tenant** section in [Tenants](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103752).

* Backup comprises archive log backup and data backup. To back up data, you must first enable archive log backup. In other words, you cannot perform data backup only.

* You cannot perform backup for a cluster that is being upgraded. To view the status of a cluster, click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list.

* By default, second backup is disabled for OceanBase Database V4.x. To enable this feature, you need to change the value of the `ocp.backup.advanced-secondary-backup.enable` parameter to `true` in **System Parameters**.
  
  > **Note**
  >
  > At present, second backup is supported only when OSS is used as the backup media.
  
  For more information about how to modify system parameters, see [Modify system parameters](https://en.oceanbase.com/docs/common-ocp-10000000001483714).

* After you create a backup strategy, if you want to manually initiate a backup before the automatic backup is triggered, you must select the full backup method.

* A full data copy and an incremental data copy together constitute the complete dataset. If only one backup of the full data copy exists, the backup will not be deleted even if its retention period elapses.

* It is prohibited to manually run the `rm` command to delete the data files that are being backed up. Doing so may cause issues such as archive log backup failures and data backup failures.

* After you delete the backup strategy from OCP, existing files of backup data will not be deleted. If you want to delete backup data, you can manually run the `rm` command to delete the backup directory.

* If the restorable time point is empty or you cannot specify the source tenant on the backup and restore page, it may be because that the `ob_admin` file is absent from the `bin` directory under the installation path of OceanBase Database deployed by using OBD. In this case, download **OceanBase Utils** from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter) and run the following command to decompress the package. Then, copy the `ob_admin` file in the `usr/bin/` directory to the `bin` directory under the installation path of OceanBase Database.
  
  ```shell
  rpm2cpio oceanbase-ce-utils-<version> | cpio -idmv ./usr/bin/ob_admin
  ```

For more information about how to perform data backup, see [Backup and Recovery](https://en.oceanbase.com/docs/common-ocp-10000000001483547).

### Restore

OceanBase Database supports tenant-level restore, which allows you to create a tenant based on the existing data backups. The restore process consists of the restore and recovery of the system tables and user tables of the tenant. Restore returns the required baseline data to the OBServer nodes of the destination tenant. Recovery returns the incremental logs generated during the backup of the baseline data to the OBServer nodes.

The following figure shows the physical restore architecture of OceanBase Database.

![Data restore](/5.2.png)

Take note of the following considerations:

* We recommend that the destination and source clusters be of the same database version.

* At present, OceanBase Database allows you to restore backup data only to OceanBase Database of the same version or a later version. You cannot restore backup data from V3.x to V4.x.

* You cannot restore backup data of a special version such as V4.0.x to V4.1.x or later. In addition, you cannot restore backup data of V4.2.x to V4.3.x.

* If the restorable time point is empty or you cannot specify the source tenant on the restore page, it may be because that the `ob_admin` file is absent from the `bin` directory under the installation path of OceanBase Database deployed by using OBD. In this case, download **OceanBase Utils** from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter) and run the following command to decompress the package. Then, copy the `ob_admin` file in the `usr/bin/` directory to the `bin` directory under the installation path of OceanBase Database.
  
  ```shell
  rpm2cpio oceanbase-ce-utils-<version> | cpio -idmv ./usr/bin/ob_admin
  ```

* You can perform data restore in the following two ways:

  * If you create a standby tenant to restore data, the new tenant and the source tenant, by default, form a primary/standby relationship, and data is synchronized between them. To stop synchronization, you can decouple the standby tenant from the primary tenant. For more information about how to create a standby tenant and how to decouple a standby tenant from its primary tenant, see [Create a standby tenant](https://en.oceanbase.com/docs/common-ocp-10000000001483724) and [Decouple a standby tenant from its primary tenant](https://en.oceanbase.com/docs/common-ocp-10000000001483820).

  * If you choose to directly use backup files to restore data, you need to specify the restore point in time for the destination tenant, and data is not synchronized.

For more information about how to perform data restore, see [Backup and Recovery](https://en.oceanbase.com/docs/common-ocp-10000000001483547).

## Upgrade a cluster

You can upgrade the OceanBase clusters and ODP clusters managed by OCP.

### Upgrade OCP

Before you upgrade a cluster by using OCP, you first need to confirm whether OCP itself needs to be upgraded. Starting from OCP V4.2.0, the version of the OCP service is aligned with the version of OceanBase Database. The OCP service version must be consistent with the target version of the cluster to be upgraded. We recommend that you use the latest OCP version. You can also learn about the version upgrade dependencies based on the release notes of OCP.

At present, you can deploy OCP on the GUI of OBD or in a Docker container. The upgrade procedure varies depending on the deployment method.

* Upgrade OCP by using OBD
  
  Take note of the following considerations:

  * You can upgrade only OCP V4.0.3 and later by using OBD.

  * You must install a Java environment on the OCP node by using JDK 1.8, and the build version is at least 161.

  * You can use OBD to upgrade an OCP that is deployed in a Docker container. However, the container is closed during the upgrade and the OCP service is deployed again by using the RPM package. After the new OCP service is enabled, we recommend that you no longer use the Docker container to manage the OCP.

  * After you obtain the target OCP software package, we recommend that you run the `obd web upgrade` command for upgrade on the GUI of OBD.

* Upgrade OCP by using a Docker container

  You can use this method to upgrade an OCP deployed either in a Docker container or with an RPM package. After the upgrade, the OCP initially deployed with RPM will transition to a container deployment. Take note the following considerations:

  * You must first stop the Docker container before the upgrade.

  * The name of the new OCP container after the upgrade cannot be the same as that before the upgrade. Otherwise, the container cannot start.
  
  * To upgrade an OCP deployed with an RPM package, you first need to terminate the OCP-Server process. Then, pull the OCP image of the target version and configure the connection based on the tenant information of the original MetaDB to complete the upgrade.

For more information about how to upgrade OCP by using OBD and upgrade OCP by using a Docker container, see [Upgrade OCP on the GUI](https://en.oceanbase.com/docs/common-ocp-10000000001483962) and [Upgrade OCP using Docker containers](https://en.oceanbase.com/docs/common-ocp-10000000001483963).

### Upgrade an OceanBase cluster

Scenarios: Bugs in the source version need to be fixed, or new features in the target version are required.

Take note of the following considerations:

* Before you upgrade an OceanBase cluster, you need to upload three software packages: OceanBase Database package (oceanbase-ce-\*.rpm), dependency package (oceanbase-ce-libs-\*.rpm), and tool integration package (oceanbase-ce-utils-\*.rpm).

* Before the upgrade, you need to verify whether the current version can be upgraded to the target version. For more information, see the upgrade notes section in the release notes of the target version. For the release notes of OceanBase Database, visit the [link](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001376050).

* Before the upgrade, make sure that the cluster runs properly. You can click **Clusters** in the left-side navigation pane of the OCP console and then view the status of the cluster in the cluster list.

* If the cluster to be upgraded has three or more zones, we recommend that you perform a rolling upgrade, which is an online upgrade mode. Before you perform a rolling upgrade, make sure that all tenants have at least three replicas to ensure that the majority of replicas are available during the upgrade. Otherwise, the pre-upgrade check will fail.

* Rolling upgrade is not supported for a single-zone cluster. This is because the database service is stopped during the upgrade, which affects the business. You need to apply for an upgrade window before the upgrade.

* Note that the upgrade task cannot be rolled back after the **Pre check for upgrade** phase is completed. If the upgrade task fails, it is prohibited to skip or roll back the task, or change the task status to successful. This is because such operations may cause irreversible damage to the cluster and jeopardize business production. We recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

For more information about how to upgrade an OceanBase cluster by using OCP, see [Upgrade an OceanBase cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483529).

### Upgrade an ODP cluster

Scenarios: Bugs in the source version need to be fixed, new features in the target version are required, or the target version is necessary for compatibility.

Take note of the following considerations:

* When you upgrade an ODP cluster, all ODPs in the cluster are upgraded. Therefore, the cluster will stop providing services. If the current ODP cluster is providing services, we recommend that you upgrade ODPs in the cluster in batches based on the load balancing strategy.

* When you upgrade an ODP cluster that contains ODPs with different CPU architectures, if the selected installation package version is unavailable in any of those CPU architectures, the upgrade will fail.

For more information about how to upgrade an ODP cluster by using OCP, see [Upgrade an OBProxy cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483848).

## Scale OceanBase Database

You can scale OceanBase Database horizontally or vertically. Horizontal scaling, including scale-out and scale-in, increases or decreases the number of zones to control the number of tenant replicas. Vertical scaling, including scale-up and scale-down, increases or decreases the number of OBServer nodes to control the upper limits of tenant resources. Therefore, you can perform scaling to meet the requirements for disaster recovery, performance, and O&M in different business scenarios.

### Scale out or scale up OceanBase Database

This feature allows you to add more IDCs for OceanBase Database by using OCP, thereby providing more reliable high availability or implementing business migration. It also allows you to add OBServer nodes to existing IDCs without affecting business access.

#### Scale-out

Scale-out involves adding zones. When a zone is added, OBServer nodes are assigned to it. This increases the number of replicas in the cluster but does not raise the upper limits for usage of resources, including CPU, memory, and disk capacity. For example, the maximum size of data stored on the data disk will not increase, nor will the amount of overall resources in a single zone.

Scenarios: A standalone cluster needs to be transformed into a distributed one, or more zones need to be added for a cluster to provide higher disaster recovery capability.

1. Add a zone

   Take note of the following considerations:

   * Before you add a zone, verify whether the following three installation packages are displayed on the **Packages** page: OceanBase Database package (oceanbase-ce-\*.rpm), dependency package (oceanbase-ce-libs-\*.rpm), and tool integration package (oceanbase-ce-utils-\*.rpm).

   * Before you add a zone, you must first add hosts. We recommend that you perform server initialization for the hosts. For more information, see '**Deploy OceanBase database - Preparations before deployment**'.

   * Before you add a zone, make sure that the cluster is in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list.

   * If the scale-out task fails, you can roll back the task. If the rollback fails, we recommend that you do not skip the task or change the task status to successful. We recommend that you seek help in the [Q&A](https://ask.oceanbase.com/) section on the official website.

   * After a zone is added, if the primary zone is selected based on the configured priority sequence, the computing performance of the cluster will not improve. If the primary zone is randomly selected, the performance of partitioned tables may be compromised depending on the business scenario. For example, after the scale-out, the partitions of a partitioned table will be distributed across more nodes. This means the number of partitions per node decreases, which increases computing speed. However, the network I/O may rise due to access across more nodes.

   For more information about how to add a zone by using OCP, see [Add a zone](https://en.oceanbase.com/docs/common-ocp-10000000001483770).

2. Add a tenant replica

   After a zone is added, a replica will not be automatically added for the tenant. You need to go to the **Tenants** page, select the tenant, and add a replica for the tenant. For more information, see [Add a replica](https://en.oceanbase.com/docs/common-ocp-10000000001483744).

   Take note of the following considerations:

   1. If the cluster version is OceanBase Database V4.0.0 or later but earlier than V4.2.0, you can add only full-featured replicas.

   2. If the cluster version is OceanBase Database V4.2.0 or later, you can add only full-featured replicas and read-only replicas.

   3. When you upgrade the unit config, make sure that the log disk size is three to four times the memory size.

For more information about how to perform a scale-out by using OCP, see [Expand the high availability of OceanBase clusters and tenants](https://en.oceanbase.com/docs/common-ocp-10000000001483599).

#### Scale-up

Scale-up involves adding OBServer nodes to existing zones. This can increase the upper limits for usage of zone resources, including CPU, memory, and disk capacity, and improve the computing capability of the cluster. For example, if you scale up a cluster deployed with the 1-1-1 architecture to the 2-2-2 architecture, the amount of overall resources in a single zone will increase, and the computing capability will also improve.

Scenarios: The cluster performance reaches a bottleneck or the size of stored data reaches the threshold.

1. Add an OBServer node

   Take note of the following considerations:

   * Before you add an OBServer node, make sure that the host of the node uses the same hardware architecture as the cluster, such as the CPU architecture.

   * Before you add an OBServer node, you must first add a host. We recommend that you perform server initialization for the host and make sure that the node to be added uses the same resource configurations as existing nodes in the cluster. For more information, see '**Deploy OceanBase database - Preparations before deployment**'.

     > **Note**
     >
     > When you add an OBServer node to an OceanBase cluster in the OCP console, the node will be initialized. We recommend that you manually configure the node based on the configurations of existing nodes in the cluster to avoid errors.

   * Before you add an OBServer node, verify whether the following three installation packages are displayed on the **Packages** page: OceanBase Database package (oceanbase-ce-\*.rpm), dependency package (oceanbase-ce-libs-\*.rpm), and tool integration package (oceanbase-ce-utils-\*.rpm).

   * Before you add an OBServer node, make sure that the cluster is in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list.

   * If the task for adding an OBServer node fails, you can roll back the task. If the rollback fails, we recommend that you do not skip the task or change the task status to successful. We recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

   For more information about how to add an OBServer node by using OCP, see [Add an OBServer node](https://en.oceanbase.com/docs/common-ocp-10000000001483766).

2. Increase the number of resource units of a tenant

   After an OBServer node is added, data in the tenant will not be automatically distributed to the new node. You need to go to the **Tenants** page, select the tenant, and modify the number of units. For more information, see [Edit a tenant replica in a zone](https://en.oceanbase.com/docs/common-ocp-10000000001483743). After the number of units is increased, the tenant can use more OBServer nodes in the same zone. In this case, a resource pool with the same configuration as the existing nodes in the zone is created on the newly added OBServer node. Then, data in the tenant can be distributed to the new node.

   Take note of the following considerations:

   * In OceanBase Database V4.0 and later, the number of units in each zone of a tenant must be the same. For example, for a cluster deployed with the 2-2-1 or 2-1-1 architecture, you cannot set the number of units of the tenant to `2`. You can set the number of units to `2` only in the 2-2-2 architecture.

   * If the version of the cluster of a user tenant is OceanBase Database V4.2.0 or later and the tenant parameter `enable_rebalance` is set to `false`, you cannot change the number of units for zones.

   * The number of units in a zone cannot be larger than that of OBServer nodes in the same zone.

   * Before you increase the number of units for a tenant, make sure that both the cluster and tenant are in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list. You can click **Tenants** in the left-side navigation pane and then view the status of the tenant in the tenant list.

   * If the task for increasing the number of units fails, we recommend that you do not roll back the task, as this will not automatically restore the tenant to the original unit specifications. Additionally, do not skip the task or change the task status to successful. Instead, we recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

For more information about how to perform a scale-up by using OCP, see [Scale out an OceanBase cluster and scale up an OceanBase Database tenant](https://en.oceanbase.com/docs/common-ocp-10000000001483594).

### Scale in or scale down OceanBase Database

#### Scale-in

Scale-in involves reducing the number of tenant replicas and deleting corresponding zones and OBServer nodes in these zones. When you need to release hardware resources or reduce zones of a cluster for maintenance purposes, you can perform a scale-in.

1. Delete a replica

   Take note of the following considerations:

   * Before you delete a replica of a tenant, make sure that the tenant and its OceanBase cluster are in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list. You can click **Tenants** in the left-side navigation pane and then view the status of the tenant in the tenant list.

   * Before you delete a replica of a tenant, make sure that the remaining replicas after the deletion are still the majority. In other words, you can delete only one replica of a tenant with three replicas.

   * Before you delete a replica of a tenant, we recommend that you switch the leader role to another replica by modifying the primary zone of the tenant to ensure that the business is not affected after the replica is deleted. For more information about how to modify the primary zone of a tenant, see [Modify zone priorities](https://en.oceanbase.com/docs/common-ocp-10000000001483521).

   For more information about how to delete a replica by using OCP, see [Delete a tenant replica from a zone](https://en.oceanbase.com/docs/common-ocp-10000000001483745).

2. Delete a zone

   Take note of the following considerations:

   * Before you delete a zone, make sure that the cluster is in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list.

   * Before you delete a zone, make sure that the zone does not contain any tenant replicas.

   * If the task for deleting a zone fails, you can roll back the task. If the rollback fails, we recommend that you do not skip the task or change the task status to successful. We recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.
  
   For more information about how to delete a zone by using OCP, see [Delete a zone](https://en.oceanbase.com/docs/common-ocp-10000000001483771).

For more information about how to perform a scale-in by using OCP, see [Reduce the high availability of OceanBase clusters and tenants](https://en.oceanbase.com/docs/common-ocp-10000000001483593).

#### Scale-down

Scale-down involves deleting OBServer nodes from existing zones. You must first reduce the number of units of the tenant and then delete the corresponding OBServer nodes.

1. Reduce the number of units of a tenant

   When you need to reduce the number of OBServer nodes in a cluster or release cluster resources for other tenants, you can reduce the number of units of a tenant, allowing the tenant to use fewer OBServer nodes in the same zone. This process will randomly select an OBServer node in a zone, migrate the data on this node to another node in the same zone, and delete the resource pool on the node to be removed to release resources such as the CPU and memory. The space for the data disk and transaction log disk is preallocated and is not affected.

   Take note of the following considerations:

   * Before you reduce the number of units for a tenant, make sure that both the cluster and tenant are in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list. You can click **Tenants** in the left-side navigation pane and then view the status of the tenant in the tenant list.

   * Before you reduce the number of units for a tenant, we recommend that you perform a major compaction to release the occupied memory resources, thereby improving the scale-down efficiency. For more information about how to perform a major compaction, see [Perform a major compaction](https://en.oceanbase.com/docs/common-ocp-10000000001483790).

   * Before you reduce the number of units for a tenant, make sure that the available disk resources on the remaining OBServer nodes are sufficient for storing data in the tenant.

   * If you want to delete a specified OBServer node, you first need to migrate units on this node to another node. For more information, see [View the unit distribution](https://en.oceanbase.com/docs/common-ocp-10000000001483785).

   * If the version of the cluster of a user tenant is OceanBase Database V4.2.0 or later and the tenant parameter `enable_rebalance` is set to `false`, you cannot change the number of units for zones.

   * For a multi-zone cluster, if the cluster version is OceanBase Database V4.0.0 or later, you cannot reduce the number of units for a single zone, and only full-featured replicas are supported. For example, you can scale down a cluster or tenant with the 2-2-2 architecture only to the 1-1-1 architecture, rather than the 2-1-1 or 2-2-1 architecture.

   * If the task for reducing the number of units fails, we recommend that you do not roll back the task, skip the task, or change the task status to successful. We recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.
  
   For more information about how to reduce the number of units for a tenant by using OCP, see [Edit a tenant replica in a zone](https://en.oceanbase.com/docs/common-ocp-10000000001483743).

2. Delete an OBServer node

   You can delete an OBServer node from an existing zone to release server resources. For example, you can scale down a cluster with the 2-2-2 architecture to the 1-1-1, 2-1-1, or 2-2-1 architecture. We recommend that you delete the same number of OBServer nodes from each zone to ensure that resources are equally distributed among zones. Specifically, we recommend that you scale down a cluster to the N-N-N architecture.

   Take note of the following considerations:

   * Before you delete an OBServer node, make sure that the cluster is in the **Running** state. You can click **Clusters** in the left-side navigation pane and then view the status of the cluster in the cluster list.

   * Before you delete an OBServer node, make sure that the units on the OBServer node to be deleted have been migrated. You can view the corresponding unit migration task for confirmation.

   * If the task for deleting an OBServer node fails, we recommend that you do not skip the task or change the task status to successful. We recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

   For more information about how to delete an OBServer node by using OCP, see [Delete an OBServer](https://en.oceanbase.com/docs/common-ocp-10000000001483763).

For more information about how to perform a scale-down by using OCP, see [Scale in an OceanBase cluster and scale down an OceanBase Database tenant](https://en.oceanbase.com/docs/common-ocp-10000000001483597).

## Replace an OBServer node

You can use this feature when an OBServer node in cluster with three or more replicas encounters a fault such as a server startup failure or hardware fault, or when parameters are improperly set for a cluster with three or more replicas but you cannot reinstall the cluster. For example, if the space preallocated to the data disk is excessively large, you can replace the OBServer node to avoid potential risks caused by node faults, thereby implementing high cluster availability, business stability, and high O&M efficiency.

### Idle servers available

Scenarios: An OBServer node in a cluster becomes faulty due to external factors and cannot resume within a short period of time, while an idle server is available.

Take note of the following considerations:

* Make sure that the cluster is available. In other words, you can properly access tenants in the cluster.

* The idle server must use the same hardware architecture as the current cluster, and the host must be in the same IDC as the original host.

* The software and hardware resources of the idle server, such as the CPU, memory, and disk capacity, must be equal to or greater than those of the faulty node, especially the disk capacity.

* Before you replace an OBServer node, you must first add a host. We recommend that you perform server initialization for the host. For more information, see '**Deploy OceanBase database - Preparations before deployment**'.

* Before you replace an OBServer node, make sure that the software packages of OceanBase Database and OCP-Agent are displayed on the **Packages** page, and that the versions are consistent with those of the source cluster.

* During the replacement, if the faulty OBServer node is offline, you need to choose to skip the host maintenance step as prompted.

* If the replacement task fails, we recommend that you do not skip the task or change the task status to successful. We recommend that you submit a question in the [Q&A](https://ask.oceanbase.com/) section of the official website for assistance.

* If both the OceanBase Database service and the ODP service are deployed on the faulty node, you need to re-deploy the ODP service on the new node. For more information about how to add an ODP, see [Scale out an OBProxy cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483600).

For more information about how to replace an OBServer node by using OCP, see [Troubleshoot host issues in an OceanBase cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483582).

### Idle servers unavailable

If no idle server is available, a faulty OBServer node may pose hidden risks. For example, the cluster may enter the maintaining state. In this case, some O&M operations performed by OCP on the cluster may fail. If you must perform such O&M operations, such as cluster upgrade, certain risks may arise after emergency recovery. For example, after the emergency recovery process removes the faulty node, high availability may not be ensured or cluster performance may degrade.

Scenarios: The observer process on the faulty node is online, and the risks to business performance or cluster high availability are acceptable.

When an OBServer node becomes faulty and no idle server is available, troubleshoot the issue as follows:

* If the server fault can be resolved within a short period of time, modify the `server_permanent_offline_time` parameter and then stop the observer process. Evaluate the parameter value based on the time required to resolve the server fault.

* If the server fault cannot be resolved within a short period of time and the cluster contains multiple zones, each with multiple OBServer nodes (for example, in a 2-2-2 architecture), you can manually migrate the units from the faulty node to other nodes in the same zone and then delete the faulty OBServer node, provided that the remaining OBServer nodes have sufficient resources to accommodate the migrated units.

* If the server fault cannot be resolved within a short period of time and the cluster contains multiple zones, each with only one OBServer node, you can scale in the cluster.

For more information about how to replace an OBServer node by using OCP, see [Troubleshoot host issues in an OceanBase cluster](https://en.oceanbase.com/docs/common-ocp-10000000001483582).
