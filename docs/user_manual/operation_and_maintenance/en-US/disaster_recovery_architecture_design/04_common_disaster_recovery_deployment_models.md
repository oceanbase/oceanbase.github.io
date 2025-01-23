---
title: Common Deployment Solutions for Disaster Recovery
weight: 4
---

## Common Deployment Solutions for Disaster Recovery
You can use different high-availability solutions in combination. The following table lists the deployment solutions that we recommend for OceanBase Database. You can flexibly choose a deployment solution based on the Internet data center (IDC) configuration and your performance and availability requirements.

|   Deployment solution         |       Disaster recovery capability                                |  RTO  | RPO  |
|-------------------|-----------------------------------------------|-------|------|
| Three replicas in an IDC       | Lossless disaster recovery at the server or rack level (when a minority of replicas fail) | < 8 seconds | 0    |
| Physical standby databases for two IDCs in the same region | Lossy disaster recovery at the IDC level (when the primary IDC fails)                   | Within seconds   | > 0 |
| Three replicas across three IDCs in the same region   | Lossless disaster recovery at the IDC level (when a minority of replicas fail)               | < 8 seconds  | 0    |
| Physical standby databases for two IDCs across two regions | Lossy disaster recovery (when a region fails)                          | Within seconds   | > 0 |
| Physical standby databases for three IDCs across two regions | Lossless disaster recovery (when an IDC fails) or lossy disaster recovery (when a region fails)                          | Within seconds  | When an IDC fails, the RPO is 0. When a region fails, the RPO is greater than 0. |
| Five replicas in three IDCs across three regions   | Lossless disaster recovery (when a region fails)                          | < 8 seconds  | 0  |
| Five replicas in five IDCs across three regions   | Lossless disaster recovery (when a region fails)                          | < 8 seconds  | 0  |


### Three replicas in an IDC

If you use only one IDC, you can deploy three or more replicas to achieve lossless disaster recovery at the OBServer node level. If an OBServer node or a minority of OBServer nodes fails, services remain available without data loss. If the IDC contains multiple racks, you can deploy a zone for each rack to achieve lossless disaster recovery at the rack level.

### Physical standby databases for two IDCs in the same region

To achieve disaster recovery at the IDC level with two IDCs in the same region, you can use a physical standby database and deploy a cluster in each IDC. If one of the IDCs is unavailable, another IDC can take over the services. If the standby IDC is unavailable, business data is not affected and services remain available. If the primary IDC is unavailable, the standby database takes over business services. In the second case, data loss may occur because data in the primary database may not be fully synchronized to the standby database.


**Characteristics**

* An OceanBase cluster is deployed in each IDC. One serves as the primary database and the other serves as the standby database. Each cluster has a separate Paxos group to maintain data consistency across multiple replicas.
* Data is synchronized between clusters by using redo logs, which is similar to the leader-follower replication of conventional databases. Data can be synchronized in asynchronous mode, which is similar to Maximum Performance mode of Oracle Data Guard.

**Solution diagram**

![3](/img/user_manual/operation_and_maintenance/en-US/disaster_recovery_architecture_design/04(2).png)


### Three replicas across three IDCs in the same region

If three IDCs are available in the same region, you can deploy a zone in each IDC to achieve lossless disaster recovery at the IDC level. If one of the IDCs is unavailable, the other two IDCs can continue to provide services without data loss. This deployment architecture does not rely on physical standby databases, but cannot provide disaster recovery capabilities at the region level.

**Characteristics**

* Three IDCs in the same region form a cluster. Each IDC is a zone, with network latency ranging from 0.5 ms to 2 ms.
* If an IDC fails, the remaining two replicas are still in the majority. They can enable redo log synchronization and guarantee a recovery point objective (RPO) of 0.
* This deployment solution cannot cope with city-wide disasters.

**Solution diagram**

![1](/img/user_manual/operation_and_maintenance/en-US/disaster_recovery_architecture_design/04(1).png)

### Physical standby databases for two IDCs across two regions

If you want to achieve region-level disaster recovery but have only one IDC in each region, you can use the physical standby database architecture. Specifically, you can specify one region as the primary region to deploy the primary database, and specify the other region as the standby region to deploy the standby database. When the standby region is unavailable, business services in the primary region are not affected. When the primary region is unavailable, the standby database becomes the new primary database to continue to provide services. In this case, business data loss may occur.

Furthermore, you can use two IDCs in two regions to implement the dual-active architecture and deploy two sets of physical standby databases. In this case, the two regions are in primary/standby mode. This allows you to manage resources in an efficient manner and achieve higher disaster recovery performance.

### Physical standby databases for three IDCs across two regions

If you have three IDCs in two regions, you can use the "physical standby databases for three IDCs across two regions" solution to provide disaster recovery at the region level.

The region with two IDCs serves as the primary region. Each IDC in the primary region is deployed with one or two full-featured replicas. The primary region provides the database read and write services. The arbitration service and physical standby database are deployed in the IDC in the standby region to provide disaster recovery services.

If a fault occurs in an IDC in the primary region, the arbitration service performs automatic downgrade to restore services within seconds without data loss. If both IDCs in the primary region fail at the same time, the physical standby database takes over the services of the primary database. In this case, the RPO is greater than 0 with data loss.

**Characteristics**

* Five replicas in the primary and standby regions form a cluster. When an IDC in the primary region fails, at most two replicas become unavailable, and the remaining three replicas are still in the majority.
* An independent three-replica cluster is deployed in the standby region and serves as a standby database. Data is asynchronously synchronized from the primary database to the standby database.
* When the primary region encounters a disaster, the standby region can take over its services.

**Solution diagram**

![4](/img/user_manual/operation_and_maintenance/en-US/disaster_recovery_architecture_design/04(4).png)



### Five replicas in three IDCs across three regions

To support lossless disaster recovery at the region level, you need to use at least three regions based on the Paxos protocol. This solution involves three regions, each with one IDC. The IDCs in the first two regions have two replicas each, whereas the third IDC has only one replica. Compared with the "three IDCs across two regions" solution, this solution requires each transaction to be synchronized to at least two regions. Business applications must be tolerant of the latency introduced by cross-region replication.

### Five replicas in five IDCs across three regions

This deployment solution is similar to the "five replicas in three IDCs across three regions" solution. The difference is that with five replicas in five IDCs across three regions, each replica is deployed in a different IDC to further enhance the disaster recovery capabilities at the IDC level.


**Characteristics**

* Five IDCs across three regions form a cluster with five replicas.
* In the case of an IDC-level or city-wide failure, the remaining replicas are still in the majority and can guarantee an RPO of 0.
* The majority must contain at least three replicas. However, each region has at most two replicas. To reduce the latency for synchronizing redo logs, Region 1 and Region 2 must be close to each other.

**Solution diagram**

![2](/img/user_manual/operation_and_maintenance/en-US/disaster_recovery_architecture_design/04(3).png)