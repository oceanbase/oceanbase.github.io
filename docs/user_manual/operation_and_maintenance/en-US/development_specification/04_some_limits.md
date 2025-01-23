---
title: Limitations
weight: 4
---
> Note:
>
> At present, *OceanBase Advanced Tutorial for DBAs* applies only to MySQL tenants of OceanBase Database Community Edition. Features of Oracle tenants of OceanBase Database Enterprise Edition are not described in this topic. For more information about the differences between the two editions, see [Differences between Enterprise Edition and Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714481).


## Cluster Name Length

| **Item** | **Maximum length** |
|------------------------|----------------------|
| &emsp;&emsp;&emsp;&emsp;&emsp;Cluster name&emsp;&emsp;&emsp;&emsp;&emsp;| &emsp;&emsp;&emsp;&emsp;&emsp;128 bytes&emsp;&emsp;&emsp;&emsp;&emsp;|

## Identifier Length

  | **Item** | **Maximum length** |
  |------------|-----------------|
  | &emsp;&emsp;&emsp;&emsp;&emsp; Username &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 bytes &emsp;&emsp;&emsp;&emsp;&emsp;     |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Tenant name &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 63 bytes   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Database name &emsp;&emsp;&emsp;&emsp;     |  &emsp;&emsp;&emsp;&emsp;&emsp; 128 bytes   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Table name &emsp;&emsp;&emsp;&emsp;       |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 characters    |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Column name &emsp;&emsp;&emsp;&emsp;       |  &emsp;&emsp;&emsp;&emsp;&emsp; 128 bytes   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Index name &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 bytes    |
  | &emsp;&emsp;&emsp;&emsp;&emsp; View name &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 bytes    |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Alias &emsp;&emsp;&emsp;&emsp;       |  &emsp;&emsp;&emsp;&emsp;&emsp; 255 bytes   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; Table group name &emsp;&emsp;&emsp;&emsp;      |  &emsp;&emsp;&emsp;&emsp;&emsp; 127 bytes   |
  | &emsp;&emsp;&emsp;&emsp;&emsp; User-defined variable &emsp;&emsp;    |  &emsp;&emsp;&emsp;&emsp;&emsp; 64 characters    |


## ODP Connections

### Connections to databases

When you connect to OceanBase Database V4.x by using OceanBase Database Proxy (ODP), free routing between primary and standby databases is not supported.

### Maximum number of connections

|       Item        |                     Upper limit                      |
|-----------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Number of connections per ODP &emsp; | It is specified by the `client_max_connections` parameter of ODP. The default value is `8192`. <main id="notice" type='explain'><h4>Note</h4><p>You can increase the number of ODP nodes or the value of the <code>client_max_connections</code> parameter to increase the maximum number of connections for a cluster. </p></main>|

## Number of Partition Replicas

|         Item         |           Upper limit            |
|:---:|:---:|
| Number of partition replicas per OBServer node | Unlimited. <br></br>You can estimate the number of partition replicas of each OBServer node based on the memory size of the tenant. 1 GB of memory supports about 20,000 tablets. |

## Single Table

|  Item   |   Upper limit    |
|:---:|:---:|
| Row length   | 1.5 MB   |
| Number of columns    | 4,096    |
| Number of indexes  | 128     |
| Total number of index columns | 512     |
| Index length  | 16 KB    |
| Total number of primary key columns | 64      |
| Primary key length  | 16 KB       |
| Number of partitions  | 8,192 to 65,536. <br></br>The maximum number of partitions in a single table in MySQL mode is specified by the tenant-level parameter <code>max_partition_num</code>. The default value is `8192`.   |

## Single Column

|   Item    |   Upper limit    |
|:---:|:---:|
| &emsp;&emsp;&emsp;&emsp;&emsp; Length of an index column &emsp;&emsp;&emsp;&emsp;&emsp; | &emsp;&emsp;&emsp;&emsp;&emsp; 16 KB &emsp;&emsp;&emsp;&emsp;&emsp;  |

## String Type

  |   **Item**    | **Maximum length**     |
  |:---:|:---:|
  |  &emsp;&emsp;&emsp;&emsp;&emsp;&emsp; `CHAR` &emsp;&emsp;&emsp;&emsp;&emsp;         |  &emsp;&emsp;&emsp;&emsp;&emsp; 256 characters &emsp;&emsp;&emsp;&emsp;&emsp;          |
  | `VARCHAR`     | 262,144 characters     |
  | `BINARY`      | 256 bytes         |
  | `VARBINARY`   | 1,048,576 bytes     |
  | `TINYBLOB`    | 255 bytes         |
  | `BLOB`        | 65,535 bytes       |
  | `MEDIUMBLOB`  | 16,777,215 bytes    |
  | `LONGBLOB`    | 536,870,910 bytes   |
  | `TINYTEXT`    | 255 bytes         |
  | `TEXT`        | 65,535 bytes       |
  | `MEDIUMTEXT`  | 16,777,215 bytes    |
  | `LONGTEXT`    | 536,870,910 bytes   |

## Feature Usage

The following table describes the limitations for using the Physical Standby Database feature.

| Item                         |   Description                                                               |
|:---:|:---:|
| Maximum number of standby tenants supported by one primary tenant  | Unlimited.                                                                   |
| Whether homogeneous resources are required for the primary and standby tenants    | Resources of the primary and standby tenants do not need to be homogeneous. We recommend that you use the same resource specifications for the primary and standby tenants.                          |
| Parameters                         | The parameters of the primary tenant are independent of those of a standby tenant, and parameter modifications are not physically synchronized. After you modify a parameter of the primary tenant, you must assess whether to modify the corresponding parameter of the standby tenants.  |
| System variables                       | System variables of the primary and standby tenants are physically synchronized. If you modify a system variable of the primary tenant, the system synchronously modifies the corresponding system variable of the standby tenants.             |
| Users and passwords                  | You can create users and change user passwords only in the primary tenant. The updated information is synchronized to the standby tenants.                                            |
| Read/write operations                       | A standby tenant supports only read operations.                   |
| Minor and major compactions                     | Minor compactions in the primary tenant are independent of those in the standby tenants. <br></br>Major compactions are not performed in a standby tenant. Instead, the major compaction information is synchronized from the primary tenant to the standby tenants.                             |
| Switchover                | All replicas of log streams of the standby tenants must be online.                        |
| Failover                  | All replicas of log streams of the standby tenants must be online.                                    |