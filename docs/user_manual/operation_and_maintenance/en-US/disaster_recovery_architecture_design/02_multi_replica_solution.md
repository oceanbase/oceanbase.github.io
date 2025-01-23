---
title: Multi-replica High Availability Solution
weight: 2
---

## Multi-replica High Availability Solution Based on Paxos

  This solution is implemented based on the Paxos protocol. Generally, multiple replicas, such as three or five replicas, constitute a cluster and provide disaster recovery capabilities.

  If a minority of replicas, such as one out of three or two out of five, are unavailable, the database can automatically execute a failover and recover services with a recovery point objective (RPO) of 0 and a recovery time objective (RTO) of less than 8 seconds.

You can flexibly adjust the distribution of Internet data centers (IDCs) in different zones and regions of a cluster, as well as the distribution of replicas for tenants in the zones, to adjust the deployment mode of tenants and achieve different levels of disaster recovery.

The following table describes the disaster recovery levels supported in OceanBase Database.

|    Deployment mode   | Optimal number of replicas  |         Disaster recovery scenario       |       Disaster recovery capability      |
|-------------|------------|-----------------------|-------------------|
| Single IDC       | 3      | This deployment mode is applicable to scenarios with only a single IDC. Three replicas in the same IDC form a cluster. We recommend that you deploy the replicas of the same copy of data on a group of servers with the same disaster recovery capability, such as the same rack or the same power supply. | <ul><li>Able to cope with failures of a minority of nodes.</li> <li>Unable to cope with IDC-level failures or city-wide failures. IDC-level failures include network disconnection and power outage of the IDC. City-wide failures include natural disasters such as earthquakes, tsunamis, and hurricanes.</li></ul> |
| Three IDCs in the same region   | 3     | This deployment mode is applicable to scenarios with three IDCs in a city. Three IDCs in the same city form a cluster. Each IDC is a zone. The network latency between the IDCs generally ranges from 0.5 ms to 2 ms. | <ul><li>Able to cope with failures of a minority of nodes.</li> <li>Able to cope with single-IDC failures.</li> <li>Unable to cope with city-wide failures.</li></ul> |
| Three IDCs across two regions   | 5     | This deployment mode is applicable to scenarios with two IDCs in a city. The primary city and the standby city form a cluster with five replicas. The primary city has four replicas distributed in two IDCs and the standby city has one replica. When an IDC fails, at most two replicas are lost, and the remaining three replicas are still available. | <ul><li>Able to cope with failures of a minority of nodes.</li> <li>Able to cope with single-IDC failures.</li> <li>Unable to cope with failures in the primary city.</li></ul> |
| Five IDCs across three regions   | 5     | This deployment mode is applicable to scenarios where city-level disaster recovery is required. Five replicas in three cities form a cluster. Two cities each have two replicas, and a third city has one replica. In the case of an IDC-level or city-wide failure, the remaining replicas are still available and can guarantee an RPO of 0. | <ul><li>Able to cope with failures of a minority of nodes.</li> <li>Able to cope with failures of a minority of IDCs.</li> <li>Able to cope with failures of a minority of cities.</li></ul> |


The following figures show the three deployment modes.

* Three IDCs in the same region

  ![Three IDCs in the same region](https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/doc/img/observer-enterprise/V4.2.1/manage/three-IDCs-in-the-same-city.jpg)

* Three IDCs across two regions

  ![Three IDCs across two regions](https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/doc/img/observer-enterprise/V4.2.1/manage/three-IDCs-across-two-regions1.jpg)

* Five IDCs across three regions

  ![Five IDCs across three regions](https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/doc/img/observer-enterprise/V4.2.1/manage/five-IDCs-across-three-regions1.jpg)

The deployment mode of OceanBase Database is described by the locality of tenants. For more information about the locality settings in the three deployment modes, see "Manage replicas." You can adjust the locality of tenants to flexibly adjust the deployment mode and achieve different levels of disaster recovery. For more information, see [Locality](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714976).

The core logic of multi-replica disaster recovery is to ensure that transaction logs are committed in the majority of replicas based on the Paxos protocol. If a minority of replicas fail, the election protocol guarantees automatic recovery with an RPO of 0. If a majority of replicas fail, manual intervention is required. You can pull up the service based on a single replica. The minority of replicas may not contain the latest data. Therefore, the last part of data may be lost.
> **Notice**
>
> Pulling up the service based on a single replica is not a regular O&M operation, but the last resort taken when a cluster cannot be recovered. It may cause data loss and dual leaders. If you want to perform this operation, contact OceanBase Technical Support for instructions. This topic does not provide operation details.


In the financial industry, a conventional relational database is usually deployed in the architecture of three IDCs across two regions. Two IDCs in the same city are deployed in primary/standby mode, and one IDC in the other city is deployed in cold standby mode. The native semi-synchronization mechanism of the database ensures that business updates are also synchronized to the standby database. However, it is not a strong consistency mechanism. When the primary database fails, the latest updates may have not been synchronized to the standby database, and forcibly switching the standby database to a primary database may cause data loss. Therefore, for conventional relational databases in the architecture of three IDCs across two regions, only one of the high availability and strong consistency features can be implemented, and the consistency, availability, partition tolerance (CAP) theorem applies. However, Paxos-based multi-replica disaster recovery of OceanBase Database achieves lossless city-level disaster recovery and geo-disaster recovery, with an RPO of 0 and an RTO of less than 8 seconds.

In the multi-replica disaster recovery architecture of OceanBase Database, applications are aware of only one data source and are unaware of details of internal replication in the database. In addition, this architecture provides lossless single-server, IDC-level, and even city-level disaster recovery with an RTO of less than 8 seconds.

### Single-server disaster recovery

The heartbeat mechanism of OceanBase Database can automatically monitor OBServer node failures. OceanBase Database Proxy (ODP) can also detect OBServer node failures to avoid impact on applications. If an OBServer node is connected but abnormal, you must immediately isolate the OBServer node to avoid transient impact on applications due to the ping-pong effect. For more information, see [Isolate a node](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714999). If the leader automatically elected after you isolate the OBServer node is not the optimal choice, you can manually switch the primary zone to a specific zone. For more information, see [Database-level high availability](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715084).

Follow-up operations vary based on the following scenarios:

* If the failed OBServer node can be restarted:
  
  After you restart the OBServer node, it can resume services when the heartbeat connection to RootService is restored, regardless of the previous heartbeat status of the OBServer node. For more information, see [Restart a node](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714995).

* If the failed OBServer node is damaged and cannot be restarted:
  
  Remove the failed OBServer node and put a new OBServer node online. For more information, see [Replace a node](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715006).

### IDC-level disaster recovery

IDC-level disaster recovery requires that the cluster be deployed in multiple IDCs, such as three IDCs in the same region or three IDCs across two regions. In this deployment mode, if a minority of replicas are unavailable due to IDC failures, the remaining majority of replicas can still provide services, ensuring zero data loss. If an IDC failure affects only a single zone, you can run the STOP ZONE command to isolate the failed replica. For more information, see [Isolate a zone](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714999). If an IDC failure affects multiple zones, you can manually switch the leader to a specific zone. For more information, see [Database-level high availability](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715084).

### City-level disaster recovery

City-level disaster recovery requires that the cluster be deployed in multiple cities, such as five IDCs across three regions. In this deployment mode, at most two replicas are lost in the case of a city-wide failure, and the remaining majority of replicas can still provide services, ensuring zero data loss. If the leader automatically elected is not the optimal choice or if you want to avoid the intermittent impact of city-wide failures, you can manually switch the leader to the optimal zone. For more information, see [Database-level high availability](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715084).