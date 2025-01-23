---
title: Background Knowledge of Tenants
weight: 2
---

> The content marked red in this topic is easily ignored when you use OceanBase Database in a test or production environment, which may lead to serious impact. Therefore, we recommend that you pay more attention to such content.

## Definition

Tenants are created within a cluster. OceanBase Database is built based on a multi-tenant architecture. The multi-tenant architecture applies to scenarios such as resource consolidation and software as a service (SaaS) services and simplifies O&M.

A cluster is a physical concept in the deployment layer and is a collection of zones and nodes. Zones and nodes have attributes such as region. A tenant is a logical concept in the resource layer and is a resource unit defined on a physical node. You can specify the specifications for a resource unit, such as the CPU, memory, log disk space, and IOPS.

**Tenants in OceanBase Database are similar to database instances of conventional databases. A tenant is associated with resources by using a resource pool and thereby exclusively occupies a resource quota. The resource quota can be dynamically adjusted. You can create database objects such as databases, tables, and users in a tenant.**

The concepts of unit config, resource unit, and resource pool are the basis for understanding the concept of tenant.

* Unit config

  A unit config defines the amounts of general physical resources, such as the CPU, memory, disk space, and IOPS. When you create a resource pool, you must specify its unit config and then create resource units based on the unit config.

* Resource unit

  Resource unit is a very important concept in tenant management. OceanBase Database manages physical resources based on resource units. A resource unit is a collection of physical resources such as CPU, memory, disk space, and IOPS. A resource unit is also the basic unit for resource scheduling. It has location attributes such as node, zone, and region. A node is the abstraction of a server and a zone is the abstraction of an IDC. You can modify the deployment mode of a tenant by modifying the location attributes of its resource units.

* Resource pool

  Each resource unit belongs to a resource pool. A resource pool consists of multiple resource units. A resource pool is the basic unit in resource allocation. Resource units in the same resource pool have the same unit config. In other words, the sizes of physical resources are the same for all resource units in the resource pool.

  ![Resource pool](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/001.png)

  The preceding figure shows a resource pool named `a_pool` that consists of six resource units. The resource pool has the following attributes:

  * `ZONE_LIST`: the distribution of resource units in zones, which is `ZONE_LIST='zone1,zone2,zone3'` in this example.
  * `Unit_NUM`: the number of resource units in each zone specified by `ZONE_LIST`, which is `2` in this example.
  * `Unit_CONFIG_ID`: the ID of the unit config associated with the resource pool. The unit config defines the amounts of physical resources in each resource unit, such as the CPU, memory, log disk space, and IOPS.

The physical concepts and logical concepts are associated based on resource units in OceanBase Database. Each tenant has multiple resource units distributed on multiple nodes in multiple zones. The resource units on each node belong to different tenants. To be short, a cluster consists of nodes and a node is the container of resource units. A tenant consists of resource units and a resource unit is the container of database objects.

When you create a tenant, you can set `RESOURCE_POOL_LIST` to specify the resource pool associated with the tenant. The resource units in this resource pool are intended for this tenant. For example, set `RESOURCE_POOL_LIST` to `a_pool` for Tenant `a`. The following figure shows the deployment.

![Tenant resource pool](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/002.png)

This tenant is deployed across three zones and each zone has two resource units. You can modify the `Unit_CONFIG_ID` parameter for the `a_pool` resource pool to dynamically adjust the physical resources for this tenant.

You can also modify the distribution of resource units on different nodes in the same zone, which is called resource unit migration, to achieve load balancing among the nodes. When a node fails, you can migrate the resource units on it to other nodes in the same zone to implement disaster recovery. You can modify the distribution of resource units in different zones, namely, modify the locality of the tenant, to adjust the deployment mode of the tenant, thereby achieving different disaster recovery levels. General deployment modes include three IDCs in the same city, three IDCs across two regions, and five IDCs across three regions.

## Tenant Types

Three types of tenants are supported in OceanBase Database V4.0 and later: sys tenant, user tenant, and meta tenant.

In OceanBase Database of a version earlier than V4.x, only two types of tenants exist: sys tenant and user tenant. Data of a user tenant may be mistakenly stored in the sys tenant, resulting in a large amount of data in the sys tenant. This causes a series of issues such as too many resources occupied by the sys tenant, coarse-grained resource statistics, and insufficient resource isolation, thereby causing a great challenge to the stability of the cluster. In OceanBase Database V4.0 and later, a meta tenant is configured for each user tenant to manage the private data of this user tenant. The meta tenant uses the resources of the user tenant.

RootService implements cluster management, tenant management, resource management, load balancing, daily compaction scheduling, and migration and replication in the sys tenant of OceanBase Database. The sys tenant is a database instance used to process public cluster management tasks within OceanBase Database.

### Overview

* sys tenant

  The sys tenant is automatically created when you create an OceanBase cluster. Its lifecycle is consistent with that of the cluster. It manages the lifecycles of the cluster and all user tenants in the cluster. The sys tenant has only one log stream with the ID 1, supports only single-point writes, and does not support scaling. You can create user tables in the sys tenant. All user tables and system tables are served by the No.1 log stream. The data of the sys tenant is the private data of the cluster and does not support physical backup or restore.

  Application systems access OceanBase Database from the sys tenant. The client parses the configuration file of an application system and obtains the IP address list of the sys tenant from the config server. Then, the client accesses the sys tenant to obtain the metadata and connects to the target tenant. The stability of the sys tenant is challenged by its capacity. When multiple application systems restart simultaneously, the surge in connection requests can overwhelm the worker threads of the sys tenant, leading to failures in establishing connections between the application systems and the target tenants. The sys tenant does not support horizontal scaling. You can perform vertical scaling or adjust cluster parameters for the sys tenant.

  Though the multi-replica mechanism ensures that the sys tenant can tolerate failures of a minority of nodes, the sys tenant is still a single point in the cluster. If the sys tenant in an OceanBase cluster becomes abnormal due to a kernel bug, the service availability of the cluster is affected, thereby causing connection establishment failures on the client and management exceptions in the cluster. Therefore, the stability of the sys tenant is essential to the stability of the OceanBase cluster. The system provides a detection mechanism for detecting exceptions of the sys tenant. When an exception is detected, you can use O&M commands to forcibly switch the leader role to recover services. You can also use an external admin tool to forcibly switch services to the new leader and then isolate the abnormal server.
  
  <font color="red">**Notice: The sys tenant is designed for managing clusters and tenants. It does not provide complete database features. Do not use the sys tenant in a production or test environment, where you need to create and use user tenants.**</font>


* User tenant

  A user tenant is a tenant created by a user. It provides complete database features. OceanBase Database Community Edition supports only the MySQL mode. A user tenant can distribute its service capabilities on multiple servers and supports dynamic scaling. Log streams are automatically created and deleted based on user configurations. The data of a user tenant, such as the schema data, user table data, and transaction data, requires stronger data protection and higher availability. Physical synchronization and physical backup and restore of user tenant data across clusters are supported.

* Meta tenant

  Meta tenants are used for internal management in OceanBase Database. When you create a user tenant, a corresponding meta tenant is automatically created. The lifecycle of a meta tenant is the same as that of its user tenant. You can use a meta tenant to store and manage tenant-level private data of the corresponding user tenant. This private data, such as parameters and information about locations, replicas, log stream status, backup and restore, and major compactions, does not require cross-database physical synchronization or physical backup and restore. You cannot log in to a meta tenant. You can only query the data in a meta tenant from views in the sys tenant. A meta tenant has no independent resource units. When a meta tenant is created, resources are reserved for it by default. The resources are deducted from those of the corresponding user tenant.

User tenants and meta tenants are associated. A user tenant stores the data of users, including tables created by users and some system tables. This data must be synchronized between the primary and standby clusters and is also needed during physical backup and restore. A meta tenant stores the private data of the corresponding user tenant to support the running of the user tenant. Meta tenants are separately created in the primary and standby clusters. A meta tenant will also be created for a user tenant restored based on the physical backup data. Therefore, the data stored in a meta tenant does not need to be synchronized between the primary and standby clusters or backed up. Similar to a meta tenant, the sys tenant stores the private data of the cluster to support the running of the cluster. This data also does not need to be synchronized between the primary and standby clusters or physically backed up.

![Tenant type 1](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/003.png)

As shown in the preceding figure:

* A tenant is an instance in OceanBase Database and exclusively occupies part of the physical resources. It is similar to a Docker container in a cloud environment.
* The sys tenant is created by default for an OceanBase cluster and its lifecycle is consistent with that of the cluster. It manages the lifecycles of the cluster and all user tenants in the cluster.
* A user tenant is created by a user. One user tenant corresponds to one meta tenant, and they have the same lifecycle.
* Private data refers to the data required to support the running of a cluster or user tenant. Each cluster or tenant has its own data, which does not need to be synchronized between the primary and standby clusters or physically backed up.
* Non-private data refers to the user data, including the tables created by users and some system tables. This part of data must be synchronized between the primary and standby clusters and physically backed up.
* The sys tenant or meta tenant has only one log stream with the ID 1 and does not support scaling.
* You can dynamically create and delete log streams for a user tenant to implement horizontal scaling.

### Tenant information query

You can log in to the sys tenant and query the `DBA_OB_TENANTS` view for information about all tenants. `TENANT_TYPE` indicates the tenant type. The value `SYS` indicates the sys tenant, `META` indicates a meta tenant, and `USER` indicates a user tenant. The ID of the sys tenant is 1. Among tenants whose IDs are greater than 1000, an even ID number indicates a user tenant, and an odd number indicates a meta tenant. The ID of a user tenant is equal to that of the corresponding meta tenant plus 1.

Here is an example:

```shell
obclient [oceanbase]>  SELECT * FROM DBA_OB_TENANTS;
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | CREATE_TIME                | MODIFY_TIME                | PRIMARY_ZONE | LOCALITY      | PREVIOUS_LOCALITY | COMPATIBILITY_MODE | STATUS | IN_RECYCLEBIN | LOCKED | TENANT_ROLE | SWITCHOVER_STATUS | SWITCHOVER_EPOCH | SYNC_SCN            | REPLAYABLE_SCN      | READABLE_SCN        | RECOVERY_UNTIL_SCN  | LOG_MODE     | ARBITRATION_SERVICE_STATUS |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
|         1 | sys         | SYS         | 2023-05-17 18:10:19.940353 | 2023-05-17 18:10:19.940353 | RANDOM       | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1001 | META$1002   | META        | 2023-05-17 18:15:21.455549 | 2023-05-17 18:15:36.639479 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1002 | mysql001    | USER        | 2023-05-17 18:15:21.461276 | 2023-05-17 18:15:36.669988 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684395321137516636 | 1684395321137516636 | 1684395321052204807 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
|      1003 | META$1004   | META        | 2023-05-17 18:18:19.927859 | 2023-05-17 18:18:36.443233 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1004 | oracle001   | USER        | 2023-05-17 18:18:19.928914 | 2023-05-17 18:18:36.471606 | zone1        | FULL{1}@zone1 | NULL              | ORACLE             | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684395321137558760 | 1684395321137558760 | 1684395320951813345 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
5 rows in set
```

### Differences among different types of tenants

The following table compares the key characteristics of the three types of tenants from the user perspective.

| Comparison item | sys tenant | User tenant | Meta tenant |
|------|---------|---------|-----------|
| Tenant ID | Fixed value: 1 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;| Minimum value: 1002 &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;| Minimum value: 1001<br></br> Relationship with the user tenant ID: meta tenant ID + 1 = user tenant ID |
| Tenant type | SYS    | USER | META |
| Tenant naming rule | sys    | The name consists of letters, digits, and underscores (_). | The format is `META${user_tenant_id}`. For example, if the user tenant ID is 1002, the meta tenant name is META$1002. |
| Data attribute | Private cluster data    | Non-private tenant data | Private tenant data |
| Scalability | Horizontal scaling is not supported. Only one log stream is available.    | Dynamic scale-out and scale-in are supported. | Horizontal scaling is not supported. Only one log stream is available. |
| O&M operations | <ul><li>Create: not supported</li><li>Drop: not supported &emsp;</li><li>Rename: not supported</li><li>User login: supported</li><li>Modify the locality: supported</li><li>Modify the primary zone setting: supported</li></ul>   | <ul><li>Create: supported</li><li>Drop: supported</li><li>Rename: supported</li><li>User login: supported</li><li>Modify the locality: supported</li><li>Modify the primary zone setting: supported</li></ul>  | <ul><li>Create: not supported</li><li>Drop: not supported</li><li>Rename: not supported</li><li>User login: not supported</li><li>Modify the locality: not supported</li><li>Modify the primary zone setting: not supported</li></ul>  |
| External data access interface | Views in the sys tenant    | <ul><li>In the sys tenant:<ul><li>The `CDB_xxx` views and dynamic performance views display the data of all user tenants. </li><li>The `DBA_OB_TENANTS` view displays information about all user tenants. </li></ul></li><li> In a user tenant, the data of the current tenant is displayed. </li></ul>| You cannot log in to a meta tenant. However, you can access its data from a user tenant or the sys tenant. <ul><li>In the sys tenant:<ul><li> The `CDB_xxx` views and dynamic performance views display the data of all meta tenants. </li><li>The `DBA_OB_TENANTS` view displays information about all meta tenants. </li></ul></li><li> The data managed by a meta tenant is displayed in the views of the corresponding user tenant. For example, the `DBA_OB_LS_LOCATIONS` view displays the routing information and the `GV$OB_PARAMETERS` view displays the parameter information. </li></ul> |

## User Tenant

A user tenant is similar to a general database management system. It is equivalent to a database instance. User tenants are created in the sys tenant based on business needs and provide complete database features. You cannot use the sys tenant or meta tenants in a production or test environment. Instead, you need to create and use user tenants.

The characteristics of a user tenant are the same as that of a database instance. Major characteristics are as follows:

* Users can be created in a user tenant.
* All objects such as databases (supported only in MySQL mode) and tables can be created in a user tenant.
* A user tenant has a separate set of system tables and system views.
* A user tenant has a separate set of system variables.
* A user tenant has other characteristics of a database instance.

The metadata of all user data is stored in user tenants. Each tenant is assigned a unique namespace that is isolated from other namespaces.

A cluster has only one sys tenant, through which you can create and manage user tenants in the cluster. You can create and manage database objects such as users, databases, tables, and views in a user tenant. The following figure shows the hierarchical relationship between database objects in OceanBase Database.

![Tenant](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_01_multi_tenants/02_background_knowledge/004.png)

Users that are created in a user tenant can log in only to this user tenant and are invisible to other tenants. You can query the `mysql.user` view for user information.

Tables created in a user tenant are invisible to other tenants. You can query the `information_schema.tables` view for information about all user tables in the current tenant.

A user tenant can modify only its own system variables. You can query the `information_schema.global_variables` and `information_schema.session_variables` views for system variables of a tenant. You can also execute the `SHOW VARIABLES` statement to query the system variables of a tenant.

## System Variables and Parameters

You can configure system variables and parameters to ensure that the behavior of OceanBase Database meets your business needs.

Different system variables and parameters may take effect on a different scope, which can be the entire cluster, the current tenant, or the current session.

### Tenant system variables

**In OceanBase Database, all system variables take effect only for the current tenant. Therefore, system variables are also referred to as tenant system variables.**

When you set a system variable, you can add the `Global` or `Session` keyword to specify the effective scope of the system variable within the tenant.
* A global variable is used to implement a global modification. Users in the same database tenant share the settings of global variables. Modifications to global variables remain effective after you exit the session. In addition, modifications to global variables do not take effect on the currently open session and take effect only after a new session is established.
* A session variable is used to implement a session-level modification. In other words, the modification takes effect only for the current session. When a new client is connected to the database, the database copies global variables to automatically generate session-level variables.

### Parameters

OceanBase Database provides cluster-level and tenant-level parameters.

* Cluster-level parameters specify the basic information and performance and security options of an entire OceanBase cluster. Typical cluster-level parameters are those used for global tasks, such as data backup and restore, and load balancing. Usually, cluster-level parameters are specified during cluster startup and are seldom modified.

* Tenant-level parameters specify feature options of one or more tenants to optimize specific configurations of the tenants. Typical tenant-level parameters are those used for the storage engine, SQL execution strategies, and access control. Usually, tenant-level parameters are specified when you create and manage a tenant, and can be modified as needed at any time.

To query whether a parameter is a cluster-level or tenant-level parameter, execute the following statement:

```shell
obclient [test]> SHOW PARAMETERS; -- Queries all system parameters.

obclient [test]> SHOW PARAMETERS like 'cpu_quota_concurrency'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: 11.158.31.20
  svr_port: 22602
      name: cpu_quota_concurrency
 data_type: NULL
     value: 4
      info: max allowed concurrency for 1 CPU quota. Range: [1,20]
   section: TENANT
     scope: TENANT
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.004 sec)

obclient [test]> SHOW PARAMETERS like 'max_string_print_length'\G
*************************** 1. row ***************************
      zone: zone1
  svr_type: observer
    svr_ip: 11.158.31.20
  svr_port: 22602
      name: max_string_print_length
 data_type: NULL
     value: 500
      info: truncate very long string when printing to log file. Range:[0,]
   section: OBSERVER
     scope: CLUSTER
    source: DEFAULT
edit_level: DYNAMIC_EFFECTIVE
1 row in set (0.005 sec)
```

If the value in the `scope` column is `CLUSTER`, the parameter takes effect for the entire cluster. If the value is `TENANT`, the parameter takes effect for the current tenant.

If the value in the `edit_level` column is `DYNAMIC_EFFECTIVE`, the modification takes effect immediately. If the value is `STATIC_EFFECTIVE`, the modification takes effect after the OBServer node is restarted.

**Notice**

**In the preceding query result, the `section` column can be easily confused with the `scope` column. Its valid values include `LOAD_BALANCE`, `DAILY_MERGE`, `RPC`, `TRANS`, and `LOCATION_CACHE`, and can even be `TENANT` or `OBSERVER`, as shown in the preceding example. <font color="red">The `section` column is just a tag that indicates the module to which the parameter is related, and does not indicate the effective scope of the parameter. Familiarize yourself with the meanings of the two columns.</font>**

**We recommend that you pay special attention to value `TENANT` or `OBSERVER` of the `section` column, which does not mean that the parameter takes effect for the current tenant or for the OBServer node of the current session. Instead, such a value may indicate that the R&D personnel cannot decide the module to categorize the corresponding parameter.**  


<br></br>
<br></br>
The following table compares parameters and system variables.

| Comparison item   | Parameter | System variable |
|---------|-----------|---------|
| Effective scope &emsp;&emsp;&emsp;&emsp; | Effective in a cluster, zone, server, or tenant. | Effective globally or at the session level in a tenant. &emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp; |
| Effective scope | <ul><li> Dynamically take effect: The value of <code>edit_level</code> is <code>dynamic_effective</code>.</li><li> Take effect upon restart: The value of <code>edit_level</code> is <code>static_effective</code>.</li></ul> | <ul><li> A session-level variable takes effect only for the current session. </li><li> A global variable does not take effect on the current session and takes effect only on new sessions established upon re-login. </li></ul> |
| Modification | <ul><li>Modification can be performed by using SQL statements, for example, <br></br><code>Alter SYSTEM SET schema_history_expire_time='1h';</code>.</li><li>Modification can be performed by using startup parameters, for example, <br></br><code>cd /home/admin/oceanbase && ./bin/observer -o "schema_history_expire_time='1h'";</code>. </li></ul>| Modification can be performed only by using SQL statements. Here is an example:<ul><li>MySQL mode<br></br><code>SET ob_query_timeout = 20000000;</code><br></br><code>SET GLOBAL ob_query_timeout = 20000000;</code><br></br></li></ul> |
| Query | You can query a parameter by using the `SHOW PARAMETERS` statement, for example, `SHOW PARAMETERS LIKE 'schema_history_expire_time';`. | You can query a variable by using the `SHOW [GLOBAL] VARIABLES` statement. Here are some examples: <ul><li>`SHOW VARIABLES LIKE 'ob_query_timeout';`</li></ul> <ul><li>`SHOW GLOBAL VARIABLES LIKE 'ob_query_timeout';`</li></ul> |
| Persistence   | Parameters are persisted into internal tables and configuration files and can be queried from the <code>observer.config.bin</code> and <code>observer.config.bin.history</code> files in the <code>/home/admin/oceanbase/etc</code> directory. | Only global variables are persisted. |
| Lifecycle | Long. A parameter remains effective for the entire duration of a process. | Short. A system variable takes effect only after the tenant schema is created. |