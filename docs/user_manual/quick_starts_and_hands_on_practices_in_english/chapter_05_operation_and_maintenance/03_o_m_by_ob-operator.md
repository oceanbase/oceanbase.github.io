---
title: Perform O&M by using ob-operator
weight: 4
---

# 5.3 Perform O&M by using ob-operator

ob-operator is a tool built based on the Kubernetes Operator framework for managing OceanBase clusters in Kubernetes. It provides a simple and reliable method for containerized deployment of OceanBase clusters, simplifying the O&M of OceanBase clusters. ob-operator defines various resources for OceanBase Database and implements the corresponding coordination logic. It enables you to manage OceanBase Database in a declarative manner, similar to managing native Kubernetes resources. With the latest version of ob-operator, you can manage OceanBase clusters in Kubernetes on the GUI of Dashboard. The resource management operations that you initiate on the GUI are executed by calling Kubernetes APIs. Specifically, you can get an overview of clusters, create clusters and tenants, view monitoring metrics, perform backup and restore, upgrade clusters, and scale clusters. At present, only images of OceanBase Database Community Edition are supported. For the complete O&M documentation, see [ob-operator](https://en.oceanbase.com/docs/ob-operator-doc-en). This topic describes how to perform some core O&M operations by using the configuration file.

## ob-operator components

Customer Resource Definition (CRD): a custom resource in Kubernetes.

```bash
$kubectl get crds | grep oceanbase.com
```

The output is as follows:

```shell
obtenantbackups.oceanbase.oceanbase.com          2024-05-07T11:29:58Z
obtenantrestores.oceanbase.oceanbase.com         2024-05-07T11:29:58Z
obtenantoperations.oceanbase.oceanbase.com       2024-05-07T11:29:58Z
obtenants.oceanbase.oceanbase.com                2024-05-07T11:29:58Z
obresourcerescues.oceanbase.oceanbase.com        2024-05-07T11:29:58Z
obclusteroperations.oceanbase.oceanbase.com      2024-05-30T04:01:44Z
obclusters.oceanbase.oceanbase.com               2024-05-07T11:29:58Z
obparameters.oceanbase.oceanbase.com             2024-05-07T11:29:58Z
observers.oceanbase.oceanbase.com                2024-05-07T11:29:58Z
obtenantbackuppolicies.oceanbase.oceanbase.com   2024-05-07T11:29:58Z
obzones.oceanbase.oceanbase.com                  2024-05-07T11:29:58Z
```

Controller-manager: a custom program for processing resource changes related to OceanBase Database.

```bash
$kubectl get deployment -n oceanbase-system
```

The output is as follows:

```shell
NAME                           READY   UP-TO-DATE   AVAILABLE   AGE
oceanbase-controller-manager   1/1     1            1           113s
```

Dashboard: a web program that provides a GUI for managing OceanBase Database resources in Kubernetes.

```bash
$kubectl get deployment -n dashboard-test
```

The output is as follows:

```shell
NAME                                                 READY   UP-TO-DATE   AVAILABLE   AGE
oceanbase-dashboard-oceanbase-dashboard-1723107702   1/1     1            1           17h
```

## High availability in different deployment modes

For more information, see [High availability](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195669).

| Cluster mode | Description | Restriction |
| --- | --- | --- |
| Regular mode | An OBServer node is associated based on the pod IP address. In this mode, a failure of the minority of OBServer nodes is tolerable. If Calico is used as the network plug-in, you can perform fault recovery when the majority of nodes fail. For more information, see [Restore service from node failure](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195666). | We recommend that you use Calico as the network plug-in and deploy at least three zones for an OceanBase cluster and at least three replicas for a tenant. |
| Standalone mode | `127.0.0.1` is used as the IP address. This mode applies to deployment scenarios with small specifications. We recommend that you use this mode in combination with a distributed storage system to achieve high availability through storage redundancy, or back up tenant data for disaster recovery. For more information about tenant data backup, see [Back up a tenant](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195667). | The OceanBase Database version must be V4.2.0.0 or later. Only a standalone database can be started, with no scalability. |
| Service mode | A service (IP address) is created for each pod. An OBServer node is associated based on the service address, which ensures that the IP address of the node remains fixed. | The OceanBase Database version must be V4.2.1.4 or later. However, OceanBase Database V4.2.2.x is not supported. |

> **Note**
>
> In the regular mode and service mode, OceanBase Database allows you to create a standby tenant for a primary tenant. When a fault occurs in the primary tenant, you can quickly switch your business to the standby tenant to reduce the impact on business. For more information about primary and standby tenants, see [Physical standby tenant](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195665).

## O&M of an OceanBase cluster

The O&M of an OceanBase cluster is implemented by modifying the cluster resources in Kubernetes. The current implementation logic is to deliver the cluster resource modifications to target resources.

![Cluster information](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/001.png)

### Create a tenant

For more information about how to create a tenant, see [Create a tenant](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195672).

Take note of the following considerations:

1. Before tenant creation, make sure that the version of ob-operator is V2.1.0 or later. We recommend that you use the latest version.

2. You need to specify the resource name (`kind`), namespace (`namespace`), cluster name (`spec.obcluster`), tenant name (`spec.tenantName`), number of units (`spec.unitNum`), character set (`spec.charset`), access allowlist (`spec.connectWhiteList`), and resource pool size (`pools.*`).

3. Before tenant creation, make sure that the OceanBase cluster runs properly.

4. Before tenant creation, make sure that the transaction log disk size for a business tenant is three to four times the memory size of the tenant.

5. Before tenant creation, make sure that the memory size specified for a business tenant in the configuration fie is not smaller than the value of `__min_full_resource_pool_memory`. You can run the following command to view the parameter value: `select * from oceanbase.GV$OB_PARAMETERS where name ='__min_full_resource_pool_memory';`.

6. To create a normal user after tenant creation, you need to log on to the tenant and create the user by using an SQL statement.

7. After tenant creation, if `secret` in the `spec.credentials.root` field is not specified in the configuration file, the password of the `root` user of the tenant is empty by default. We recommend that you change the password on the GUI of Dashboard as needed.

For example, after the following sample YAML file is applied to a running Kubernetes cluster, ob-operator will automatically create the unit config, resource unit, and resource pool as specified, and create a tenant that uses the resource pool.

```shell
kubectl apply -f demo-tenant.yaml
```

```yaml
apiVersion: oceanbase.oceanbase.com/v1alpha1
kind: OBTenant
metadata:
  name: demo-tenant
  namespace: default
spec:
  obcluster: test
  tenantName: demo_tenant
  unitNum: 1
  charset: utf8mb4
  connectWhiteList: "%"
  forceDelete: true
  pools:
    - zone: zone1
      type:
        name: Full
        replica: 1
        isActive: true
      resource:
        maxCPU: 1
        memorySize: 2Gi
        minCPU: 1
        maxIops: 1024
        minIops: 1024
        iopsWeight: 2
        logDiskSize: 4Gi
```

The following figure shows the GUI provided by Dashboard for creating a tenant.

![Create a tenant](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/002.png)

### Modify the resource specifications for a tenant

For more information, see [Manage resources](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195681).

You can directly modify the resource specifications in the YAML file and then apply the configuration file again. You can manage tenant replicas and other tenant parameters in the same way. For more information, see [Manage replicas](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195679) and [Modify other parameters](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195680).

For example, if you change the value of the `memorySize` resource parameter from `2Gi` to `5Gi` in the configuration file and apply the configuration file to the cluster again, ob-operator will scale out the resource pool. (We recommend that you also change the value of `logDiskSize` to three to four times the value of `memorySize`.)

```shell
kubectl apply -f demo-tenant.yaml
```

```yaml
apiVersion: oceanbase.oceanbase.com/v1alpha1
kind: OBTenant
metadata:
  name: demo-tenant
  namespace: default
spec:
  obcluster: test
  tenantName: demo_tenant
  unitNum: 1
  charset: utf8mb4
  connectWhiteList: "%"
  forceDelete: true
  pools:
    - zone: zone1
      type:
        name: Full
        replica: 1
        isActive: true
      resource:
        maxCPU: 1
        memorySize: 5Gi
        minCPU: 1
        maxIops: 1024
        minIops: 1024
        iopsWeight: 2
        logDiskSize: 15Gi
```

> **Notice**
>
> Some tenant O&M operations involve multiple tenants, so the resources consumed by these operations cannot be defined in tenant resources. Instead, dedicated tenant O&M resources are defined for operations such as user password change, log replay, switchover, and failover. For more information about tenant O&M, see [Perform tenant O&M operations](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195670).
>
> In addition, O&M resources can also be archived as operation logs. You can check the archived logs to learn about the operations performed on a tenant and the operation configurations.

The following figures show the GUI provided by Dashboard for modifying the resource specifications for a tenant.

![Modify tenant resources](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/003.png)

![Modify tenant resources](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/004.png)

### Back up data

For more information, see [Back up a tenant](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195667).

To back up a tenant by using ob-operator, you need to create a backup strategy that specifies the following information: the cluster to which the tenant belongs, tenant, data restore window, backup address, and backup cycle. After a backup strategy is created, ob-operator will perform a full backup first and then perform incremental backup and full backup based on the specified backup cycle. At present, ob-operator supports only tenant-level backup.

Take note of the following considerations:

1. Before backup, make sure that all nodes in the OceanBase cluster are normal. A cluster in the upgrading state does not support backup.

2. At present, only Network File System (NFS) and Alibaba Cloud Object Storage Service (OSS) are supported as the backup media. To use NFS, make sure that NFS is deployed, a backup volume is configured during OceanBase cluster deployment, and the database has access to the volume with read and write permissions. For more information about NFS deployment, see [Deploy NFS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001166501).

3. Before backup, we recommend that you initiate a major compaction to ensure data consistency and improve backup efficiency. For more information about how to initiate a major compaction, see [Manually initiate a major compaction](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001230904).

4. After backup, it is prohibited to manually run the `rm` command to delete the data files that are being backed up. Doing so may cause issues such as archive log backup failures and data backup failures.

5. A full data copy and an incremental data copy together constitute the complete dataset. If only one backup of the full data copy exists, the backup will not be deleted even if its retention period elapses.

   For example, the following backup strategy specifies to perform full backup at 00:30 a.m. every Saturday and perform incremental backup at 01:30 a.m. every day. The backup destination is an NFS path, which must be mounted during cluster creation.

   ```yaml
   apiVersion: oceanbase.oceanbase.com/v1alpha1
   kind: OBTenantBackupPolicy
   metadata:
     name: obtenantbackuppolicy-sample
     namespace: oceanbase
   spec:
     obClusterName: "test"
     tenantCRName: "demo-tenant"
     jobKeepWindow: "1d"
     dataClean:
       recoveryWindow: "8d"
     logArchive:
       destination:
         type: "NFS"
         path: "t1/log_archive_custom_1019"
       switchPieceInterval: "1d"
     dataBackup:
       destination:
         type: "NFS"
         path: "t1/data_backup_custom_enc"
       fullCrontab: "30 0 * * 6"
       incrementalCrontab: "30 1 * * *"
   ```

The following figure shows the GUI provided by Dashboard for creating a backup strategy.

![Create a backup strategy](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/005.png)

### Restore data

For more information, see [Restore data from a backup](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195668).

OceanBase Database V4.x compatible with ob-operator supports only tenant-level physical restore. Therefore, the physical restore configurations are included in a tenant configuration file. OBTenant and OBTenantRestore resources are key to data restore from a backup. You can use OBTenant resources to define tenants and OBTenantRestore resources to define tenant restore jobs. A tenant restore job creates a new tenant. Therefore, you must use parameters in the `spec.source` section in the configuration file of the OBTenant resource to specify the tenant restore source. When the specified parameters take effect, ob-operator creates the OBTenantRestore resource required to execute the restore job.

Take note of the following considerations:

1. We recommend that the destination and source clusters be of the same database version.

2. At present, OceanBase Database allows you to restore backup data only to OceanBase Database of the same version or a later version. You cannot restore backup data from V3.x to V4.x.

3. You cannot restore backup data of a special version such as V4.0.x to V4.1.x or later.

4. You can use the `tenantRole:STANDBY/PRIMARY` parameter in the configuration file to specify whether to restore the tenant as a standby tenant. If you do not specify this parameter, the tenant is restored as a primary tenant, meaning it will be an independent tenant that no longer synchronizes data from the source tenant.

5. Make sure that the destination cluster is normal.

6. Make sure that the remaining resources, especially the remaining data disk space, in the destination cluster are sufficient for the restore.

7. If the restore source is an NFS path, make sure that the backup volume mounted to the OceanBase cluster is available, and the destination cluster has access to the volume with read and write permissions.

The following example restores the tenant as a primary tenant. You can choose to restore the tenant as a standby tenant by setting `tenantRole` to `STANDBY` and adjusting standby tenant configurations. For more information, see [Physical standby tenant](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195665).

```yaml
apiVersion: oceanbase.oceanbase.com/v1alpha1  
kind: OBTenant  
metadata:  
  name: t1s
  namespace: oceanbase
spec: 
  obcluster: test
  tenantName: t1s
  unitNum: 1 
  charset: utf8mb4  
  connectWhiteList: '%'
  forceDelete: true
  tenantRole: PRIMARY # Specifies to restore the tenant as a primary tenant.
  source: # The data source of the tenant.
    restore: 
      bakDataSource: 
        type: "OSS" # The information for accessing backup data in the backup media.
        path: "oss://operator-backup-data/backup-t1?host=oss-cn-xxxx.aliyuncs.com"
        ossAccessSecret: "oss-access"
      archiveSource:
        type: "OSS" # The information for accessing archive data in the backup media.
        path: "oss://operator-backup-data/archive-t1?host=oss-cn-xxxx.aliyuncs.com"
        ossAccessSecret: "oss-access"
      until: 
        unlimited: false  # The value "true" specifies to restore data to the latest timestamp.
        timestamp: "2024-05-05 10:00:00"  # The timestamp to which data is to be restored.
    tenant: t1  # The name of the primary tenant. This parameter takes effect only when the tenant is restored as a standby tenant.
  pools:
    - zone: zone1
      type: 
        name: Full 
        replica: 1
        isActive: true
      resource:
        maxCPU: 1000m 
        memorySize: 2Gi 
        minCPU: 1 
        maxIops: 1024 
        minIops: 1024
        logDiskSize: 5Gi
```

### Scale out or scale up a cluster

To scale out a cluster means to expand it horizontally, while to scale up a cluster means to expand it vertically.

#### Scale out a cluster

For more information, see [Add zones to a cluster](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195676).

To scale out a cluster, you can add zones to the cluster by modifying the original deployment configuration file, thereby increasing the number of tenant replicas.

Take note of the following considerations:

1. Before the scale-out, make sure that the OceanBase cluster is in the `running` state.

2. Before the scale-out, make sure that servers have sufficient resources for the new zones.

3. Before the scale-out, ob-operator determines the distribution of OBServer nodes based on the setting of `nodeSelector` in the configuration file of OceanBase Database. To specify a node, you need to configure labels for Kubernetes nodes. Otherwise, Kubernetes automatically selects a node. For more information, see [Create a cluster](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195661).

4. After the scale-out, you need to manually add replicas for the tenant. For more information, see [Manage replicas](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195679).

5. After the scale-out, if the primary zone is selected based on the configured priority sequence, the computing performance of the cluster will not improve. If the primary zone is randomly selected, the performance of partitioned tables may be compromised depending on the business scenario. For example, after the scale-out, the partitions of a partitioned table will be distributed across more nodes. This means the number of partitions per node decreases, which increases computing speed. However, the network I/O may rise due to access across more nodes.

The following figure shows the GUI provided by Dashboard for adding a zone.

![Add a zone](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/006.png)

#### Scale up a cluster

For more information, see [Add OBServer nodes to zones](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195677).

To scale up a cluster, you can add OBServer nodes to an existing zone by modifying the original deployment configuration file, thereby increasing the resources available to the tenant, improving the business performance of the tenant, and expanding the storage capacity of the cluster.

Take note of the following considerations:

1. Before the scale-up, make sure that the OceanBase cluster is in the `running` state.

2. Before the scale-up, make sure that servers have sufficient resources for the new OBServer nodes.

3. Before the scale-up, ob-operator determines the distribution of OBServer nodes based on the setting of `nodeSelector` in the configuration file of OceanBase Database. To specify a node, you need to configure labels for Kubernetes nodes. Otherwise, Kubernetes automatically selects a node. For more information, see [Create a cluster](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195661).

4. Before the scale-up, you can adjust the number of replicas in each zone in the `topology` section of the configuration file. We recommend that you specify the same number of replicas for each zone.

5. After the scale-up, data in the tenant will not be automatically distributed to the new nodes. You need to change the number of units in the resource pool of the tenant. In this case, a resource pool with the same configuration as the existing nodes in the zone is created on the newly added OBServer nodes. Then, data in the tenant can be distributed to the new nodes. For more information about how to change the number of units, see [Manage resources](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195681).

The following figure shows the GUI provided by Dashboard for adding OBServer nodes to a zone.

![Scale-up](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/007.png)

### Scale in or scale down a cluster

To scale in a cluster means to shrink it horizontally, while to scale down a cluster means to shrink it vertically.

#### Scale in a cluster

For more information, see [Delete zones from a cluster](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195675).

To scale in a cluster, you can delete zones from the cluster by modifying the original deployment configuration file, thereby reducing the number of tenant replicas.

Take note of the following considerations:

1. Before the scale-in, make sure that the OceanBase cluster is in the `running` state.

2. Make sure that the remaining zones after the scale-in are still the majority. In other words, for a cluster with N zones, the number of remaining zones must be equal to or greater than N/2 after the scale-in. However, you cannot scale in a multi-zone cluster into a single-zone cluster.

3. Before the scale-in, make sure that the zones to be deleted have no replicas. That is, you first need to delete tenant replicas. For more information, see [Manage replicas](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195679).

#### Scale down a cluster

For more information, see [Delete OBServer nodes from zones](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195678).

To scale down a cluster, you can delete OBServer nodes from the existing zones by modifying the original deployment configuration file, thereby reducing server resource consumption and increasing the disk utilization of the cluster.

Take note of the following considerations:

1. Before the scale-down, make sure that the OceanBase cluster is in the `running` state.

2. Before the scale-down, data on the OBServer nodes to be deleted will be migrated to other OBServer nodes in the same zone. Therefore, you need to make sure that the remaining OBServer nodes have sufficient resources, especially sufficient disk space.

The following figure shows the GUI provided by Dashboard for deleting OBServer nodes from a zone.

![Scale-down](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/008.png)

### Upgrade a cluster

For more information, see [Upgrade a cluster](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195659).

To upgrade an OceanBase cluster, you can change the value of `image` in `spec` to the image of the target version in the original deployment configuration file.

Take note of the following considerations:

1. Before the upgrade, make sure that the cluster is in the `running` state.

2. Before the upgrade, you need to verify whether ob-operator needs to be upgraded. We recommend that you use ob-operator of the latest matching version. For more information about how to upgrade ob-operator, see [Upgrade](https://en.oceanbase.com/docs/community-ob-operator-doc-en-10000000001195647).

The following figure shows the GUI provided by Dashboard for upgrading a cluster.

![Upgrade](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_05_operation_and_maintenance/03_o_m_by_ob-operator/009.png)
