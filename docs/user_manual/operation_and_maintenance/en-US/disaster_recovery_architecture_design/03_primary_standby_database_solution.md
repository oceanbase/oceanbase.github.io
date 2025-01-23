---
title: Physical Standby Database Solution Based on Asynchronous Log Replication
weight: 3
---

  This solution is similar to the primary/standby replication solution of traditional databases. Redo logs are replicated among tenants in two or more clusters to form a tenant-level primary/standby relationship. This provides two types of disaster recovery capabilities: switchover and failover.

  This solution is mainly designed for disaster recovery purposes in dual-IDC or dual-region scenarios. The primary tenant provides read and write capabilities, whereas the standby tenants provide read-only and disaster recovery capabilities. When a switchover is performed, the roles of the primary and standby tenants are switched without data loss (RPO = 0) within seconds (RTO within seconds).

  If the cluster of the primary tenant fails, you can perform a failover to make a standby tenant the new primary tenant. In this case, data loss may occur (RPO > 0), and the failover occurs within seconds (RTO within seconds).


## Disaster Recovery with the Physical Standby Database Solution

The Physical Standby Database solution allows you to deploy one primary tenant and one or more standby tenants. The primary tenant provides read and write services for your business. The standby tenants synchronize business data written in the primary tenant from redo logs in real time.

You can deploy a primary tenant and its standby tenants in multiple OceanBase clusters that are close to each other or far apart, or in the same OceanBase cluster. In other words, an OceanBase cluster can contain only primary tenants or standby tenants, or both. Tenant names, resource specifications, configurations, and locality of the primary and standby tenants can be different.

In addition, the primary and standby tenants can be single-replica tenants, multi-replica tenants, or tenants with arbitration-based high availability. Different deployment modes provide different levels of replica-based disaster recovery for tenants.

The tenant-level Physical Standby Database solution is highly flexible. You can deploy the solution in the following typical modes:

### A cluster contains only primary or standby tenants

In this deployment mode, you deploy multiple OceanBase clusters, and each OceanBase cluster contains primary or standby tenants.

This deployment mode allows you to use the Physical Standby Database solution for remote disaster recovery.

The following figure shows the architecture of this deployment mode.

![A cluster contains only primary or standby tenants](https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/doc/img/observer-enterprise/V4.2.1/manage/only-primary-tenants-or-standby-tenants-in-a-cluster.png)

### A cluster contains both primary and standby tenants

In this deployment mode, you deploy multiple OceanBase clusters, and each cluster contains both primary and standby tenants or only primary tenants.

You can use this deployment mode in the following typical scenario:

Your business requires read/write and geo-disaster recovery in two different regions. Therefore, you must deploy both primary and standby databases in each region. In a database using other primary/standby solutions, you must deploy two or more clusters in each of the two regions, and clusters across regions work in primary/standby mode.

If you use OceanBase Database, you need to only deploy one cluster in each of the two regions, and deploy primary and standby tenants in the two clusters to meet your business requirements. This greatly simplifies management of database clusters. The following figure shows the architecture of this deployment mode.

![A cluster contains both primary and standby tenants](https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/doc/img/observer-enterprise/V4.2.1/manage/both-primary-tenants-and-standby-tenants-in-a-cluster.png)

### Primary and standby tenants belong to one cluster

In this deployment mode, you deploy only one OceanBase cluster, and the primary tenant and one or more standby tenants belong to the same OceanBase cluster.

You can use this deployment mode in the following scenario:

You need to retain a database snapshot in a business tenant before a business upgrade. You can create a standby tenant for real-time synchronization in the same cluster of the business tenant and suspend the synchronization to the standby tenant before the business upgrade. Then, you can perform any read/write operations, such as starting a business upgrade, in the primary tenant, without affecting the standby tenant. If the business upgrade fails, you can delete the primary tenant and set the standby tenant to a new primary tenant. You can change the name of the new primary tenant to that of the original primary tenant so that access to the proxy remains unchanged.

The following figure shows the architecture of this deployment mode.

![Primary and standby tenants belong to one cluster](https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/doc/img/observer-enterprise/V4.2.1/manage/the-primary-tenant-and-the-standby-tenant-in-the-same-cluster.png)
