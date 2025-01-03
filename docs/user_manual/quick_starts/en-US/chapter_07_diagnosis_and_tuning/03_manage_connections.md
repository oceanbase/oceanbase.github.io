---
title: Manage OceanBase Database connections
weight: 4
---

# 7.3 Manage OceanBase Database connections

This topic contains three parts: principles, client sessions, and server sessions. A client session is established between a client and OceanBase Database Proxy (ODP). A server session is established between ODP and an OBServer node.

## Principles

### Background information

ODP provides database access and routing features for you to connect to and use OceanBase Database. When you use database features, ODP interacts with OBServer nodes in a transparent way. Connection management is crucial to the interaction process.

### Features

ODP provides the following connection management features:

1. Proxy: ODP serves both as a client and as a server. It also ensures that the interaction behavior conforms to the MySQL protocol.

2. Connection: ODP provides a wide range of connection features. For example, it allows you to access different clusters and tenants. It also supports physical standby databases, prepared statements in the distributed architecture, and the `kill` and `show processlist` statements.

3. High availability: ODP can handle issues such as timeouts, server status changes, and network status changes and shield backend exceptions to ensure that users are not distracted by such issues.

### Connection mapping

When you connect to a standalone database from a client, only one physical connection exists between your client and the database, as shown in the following figure.

![Standalone mapping](/img/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/03_manage_connections/001.png)

When you use ODP to connect to OceanBase Database, one physical connection exists between your client and ODP, and multiple physical connections can exist between ODP and OBServer nodes, as shown in the following figure. The connection between your client and ODP is called a client session, and those between ODP and OBServer nodes are called server sessions.

![Server session mapping](/img/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/03_manage_connections/002.png)

If the data accessed by your client is stored on different OBServer nodes, ODP will create multiple physical connections to OceanBase Database. It will also manage and reuse these connections. However, your client perceives only one logical connection. This allows ODP to provide a wide range of features, such as primary/standby cluster separation, read/write splitting, data access request routing for partitioned tables, prepared statements in a distributed architecture, and backend exception shielding.

### Connection features

ODP changes the mapping of database connections to M-to-N. Therefore, some connection features require additional treatment. For example, when you execute the `show processlist` statement to query the number of connections, you can view the number of connections between your client and ODP, but not the number of connections between ODP and OceanBase Database.

The following describes common connection features:

- Connection stickiness: ODP has not implemented status synchronization for all features, such as transactions, temporary tables, and cursors. For these features, ODP sends follow-up requests to the node where the status starts, so that status synchronization is not required. However, this does not fully utilize the advantages of distributed systems. Therefore, ODP will gradually support the distributed implementation of related features in the sequence of significance.

- Combined use of the `show processlist` and `kill` statements: The `show processlist` statement shows the connections between your client and servers. For ODP, this statement shows only the connection between your client and ODP, and does not show the connections between ODP and OBServer nodes. The `kill` statement closes a client session. After the client session is closed, ODP closes the corresponding server sessions. Before you execute the `kill` statement, you must obtain the connection ID by using the `show processlist` statement.

- Impact on load balancing: The `show processlist` and `kill` statements are specially treated. Therefore, they can work properly only when they are sent to the same ODP node. In scenarios that require load balancing, such as a public cloud, multiple ODP nodes are mounted to a load balancer. In this case, if the `show processlist` and `kill` statements are sent over two different connections, the load balancer may forward the requests to different ODP nodes. Therefore, we recommend that you do not use these statements in such scenarios.

## Client sessions

This section describes general operations performed on a client session, which is established between a client and ODP.

### View client sessions

When you use ODP to connect to OceanBase Database, you can execute the `SHOW PROXYSESSION` statement in the `sys` tenant to query all client sessions of all tenants in ODP. You can also execute this statement in a user tenant to query the current client session. The SQL syntax is as follows:

```sql
obclient> show proxysession;
```

The output is as follows:

```shell
+--------------------+---------+-------------------------------+--------+------+--------------------+-----------+-------------+-------------------+-------------------+-------+-------+-----------+
| proxy_sessid       | Id      | Cluster                       | Tenant | User | Host               | db        | trans_count | svr_session_count | state             | tid   | pid   | using_ssl |
+--------------------+---------+-------------------------------+--------+------+--------------------+-----------+-------------+-------------------+-------------------+-------+-------+-----------+
| 838175694068187151 | 1048577 | obn.xiaofeng.lby.123.456.78.9 | sys    | root | 123.456.78.9:39012 | oceanbase |           0 |                 1 | MCS_ACTIVE_READER | 73180 | 73104 |         0 |
| 838175694068187149 |       5 | obn.xiaofeng.lby.123.456.78.9 | mysql  | root | 123.456.78.9:38027 | test      |           0 |                 1 | MCS_ACTIVE_READER | 73104 | 73104 |         0 |
| 838175694068187150 |  524297 | obn.xiaofeng.lby.123.456.78.9 | mysql  | root | 123.456.78.9:38270 | oceanbase |           0 |                 1 | MCS_ACTIVE_READER | 73179 | 73104 |         0 |
+--------------------+---------+-------------------------------+--------+------+--------------------+-----------+-------------+-------------------+-------------------+-------+-------+-----------+
3 rows in set
```

The following table describes the fields in the return result.

| Field | Description |
| --- | --- |
| proxy_sessid | The ID of the client session allocated by OceanBase Database. |
| Id | The ID of the client session allocated by ODP. It is equivalent to `cs_id` mentioned later. |
| Cluster | The name of the OceanBase cluster to which the client session belongs. |
| Tenant | The tenant account for connecting to the OceanBase cluster. |
| User | The username for connecting to the OceanBase cluster. |
| Host | The IP address and port number of the client. |
| db | The database in which the statement is executed. |
| trans_count | The number of transactions completed in the client session. |
| svr_session_count | The total number of sessions held between ODP and OceanBase Database. |
| state | The status of the client session. Valid values: <ul><li>`MCS_INIT`</li><li>`MCS_ACTIVE_READER`</li><li>`MCS_KEEP_ALIVE`</li><li>`MCS_HALF_CLOSE`</li><li>`MCS_CLOSED`</li></ul> |
| tid | The thread ID. |
| pid | The process ID. |
| using_ssl | Indicates whether the client session uses the Secure Sockets Layer (SSL) protocol for transmission. |

### View the details of a client session

When you use ODP to connect to OceanBase Database, you can execute the `SHOW PROXYSESSION ATTRIBUTE` statement in the `sys` tenant to query the details of a specified client session in ODP, including server sessions involved in the client session. You can also execute this statement in a user tenant to query the details of the current session.

The SQL syntax is as follows:

```sql
SHOW PROXYSESSION ATTRIBUTE [id [like 'xxx']]
```

The fields are described as follows:

- If `id` is not specified, the details of the current session are returned (supported since ODP V1.1.0). Fuzzy search is supported for retrieving the value of a specified attribute in the current session (supported since ODP V1.1.2).

- If `id` is specified, fuzzy search is supported for retrieving the value of a specified attribute (supported since ODP V1.1.0).

- Here, you can set `id` to the value of `cs_id` or `CONNECTION_ID`, and the same results are returned.

  `cs_id` indicates the ID of a client session in ODP. `CONNECTION_ID` indicates the ID of a client session in OceanBase Database. In MySQL mode, you can execute `SELECT CONNECTION_ID();` statement to query `CONNECTION_ID`. For more information about `CONNECTION_ID`, see [CONNECTION_ID](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001032377).

- The `like` clause supports fuzzy search. Supported wildcard characters are the percent sign (`%`) and the underscore (`_`).

Here is an example:

```sql
obclient> SHOW PROXYSESSION;
+--------------------+------+---------+--------+------+-----------------+------+-------------+-------------------+-------------------+---------+---------+
| proxy_sessid       | Id   | Cluster | Tenant | User | Host            | db   | trans_count | svr_session_count | state             | tid     | pid     |
+--------------------+------+---------+--------+------+-----------------+------+-------------+-------------------+-------------------+---------+---------+
| 756006681247547396 |    2 |  ob1.cc | sys    | root | 127.0.0.1:22540 | NULL |           0 |                 1 | MCS_ACTIVE_READER | 2230520 | 2230520 |
+--------------------+------+---------+--------+------+-----------------+------+-------------+-------------------+-------------------+---------+---------+
1 row in set

obclient> SHOW PROXYSESSION ATTRIBUTE;
+----------------------------------+----------------------+----------------+
| attribute_name                   | value                | info           |
+----------------------------------+----------------------+----------------+
| proxy_sessid                     | 756006681247547396   | cs common      |
| cs_id                            | 2                    | cs common      |
| cluster                          | ob1.cc               | cs common      |
| tenant                           | sys                  | cs common      |
| user                             | root                 | cs common      |
| host_ip                          | 127.0.0.1            | cs common      |
| host_port                        | 22540                | cs common      |
| db                               | NULL                 | cs common      |
| total_trans_cnt                  | 0                    | cs common      |
| svr_session_cnt                  | 1                    | cs common      |
| active                           | true                 | cs common      |
| read_state                       | MCS_ACTIVE_READER    | cs common      |
······
# Subsequent outputs omitted
39 rows in set

obclient> SHOW PROXYSESSION ATTRIBUTE 2 like '%id%';
+------------------------+--------------------+----------------+
| attribute_name         | value              | info           |
+------------------------+--------------------+----------------+
| proxy_sessid           | 756006681247547396 | cs common      |
| cs_id                  | 2                  | cs common      |
| tid                    | 2230520            | cs common      |
| pid                    | 2230520            | cs common      |
| last_insert_id_version | 0                  | cs var version |
| server_sessid          | 2147549201         | last used ss   |
| ss_id                  | 4                  | last used ss   |
| last_insert_id_version | 0                  | last used ss   |
+------------------------+--------------------+----------------+
8 rows in set

obclient> SHOW PROXYSESSION ATTRIBUTE 2147549201 like '%id%';
+------------------------+--------------------+----------------+
| attribute_name         | value              | info           |
+------------------------+--------------------+----------------+
| proxy_sessid           | 756006681247547396 | cs common      |
| cs_id                  | 2                  | cs common      |
| tid                    | 2230520            | cs common      |
| pid                    | 2230520            | cs common      |
| last_insert_id_version | 0                  | cs var version |
| server_sessid          | 2147549201         | last used ss   |
| ss_id                  | 4                  | last used ss   |
| last_insert_id_version | 0                  | last used ss   |
+------------------------+--------------------+----------------+
8 rows in set
```

The following table describes the fields in the return result.

| Field | Description |
| -------------- | -------- |
| attribute_name | The attribute name. |
| value          | The attribute value. |
| info           | The basic information. |

The following table describes the general attributes.

| Attribute | Description |
| --- | --- |
| proxy_sessid | The ID of the client session allocated by OceanBase Database. |
| cs_id | The ID of the client session allocated by ODP. It is equivalent to `Id` mentioned earlier. |
| cluster | The name of the OceanBase cluster to which the client session belongs. |
| tenant | The tenant account for connecting to the OceanBase cluster. |
| user | The username for connecting to the OceanBase cluster. |
| host_ip | The IP address of the client. |
| host_port | The port number of the client. |
| db | The database in which the statement is executed. |
| total_trans_cnt | The total number of transactions transmitted by ODP. |
| svr_session_cnt | The total number of sessions held between ODP and OceanBase Database. |
| active | Indicates whether the session is active. |
| read_state | The status of the client session. Valid values: <ul><li>`MCS_INIT`</li><li>`MCS_ACTIVE_READER`</li><li>`MCS_KEEP_ALIVE`</li><li>`MCS_HALF_CLOSE`</li><li>`MCS_CLOSED`</li></ul> |
| tid | The thread ID. |
| pid | The process ID. |
| modified_time | The time when the session was last modified. |
| reported_time | The time when the session was reported. |
| hot_sys_var_version | The target system variable version in real-time updates. |
| sys_var_version | The system variable version. |
| user_var_version | The user variable version. |
| last_insert_id_version | The last inserted ID version. |
| db_name_version | The database name version. |
| server_ip | The IP address of the OBServer node. |
| server_port | The port number of the OBServer node. |
| server_sessid | The session ID of the OBServer node. |
| ss_id | The ID of the server session in ODP. |

### View the variables of a client session

You can use the `SHOW PROXYSESSION VARIABLES [all] id [like 'xx']` statement to query the variables of a client session.

- If `all` is not specified, the local session variables of the specified client session, including modified system and user variables, are returned.

- If `all` is specified, all session variables of the specified client session, including all system and user variables, are returned.

The fields are described as follows:

- Here, you can set `id` to the value of `cs_id` or `CONNECTION_ID`, and the same results are returned.

- `cs_id` indicates the ID of a client session in ODP. `CONNECTION_ID` indicates the ID of a client session in OceanBase Database. In MySQL mode, you can execute `SELECT CONNECTION_ID();` statement to query `CONNECTION_ID`. For more information about `CONNECTION_ID`, see [CONNECTION_ID](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001032377).

- The `like` clause supports fuzzy search. Supported wildcard characters are the percent sign (`%`) and the underscore (`_`).

Here are some examples:

1. Query session variables by `cs_id`.

   ```sql
   obclient> SHOW PROXYSESSION VARIABLES 3;
   ```

   The output is as follows:

   ```shell
   +-----------------------------------+------------------+-----------------+--------------------+--------------------------------------------+
   | variable_name                     | value            | info            | modified_type      | sys_variable_flag                          |
   +-----------------------------------+------------------+-----------------+--------------------+--------------------------------------------+
   | ob_proxy_global_variables_version | 1461742173142100 | changed sys var | cold modified vars |  && invisible && session_scope && readonly |
   | ob_proxy_user_privilege           | 65534            | changed sys var | cold modified vars |  && invisible && session_scope && readonly |
   | ob_capability_flag                | 654159           | changed sys var | cold modified vars |  && invisible && session_scope && readonly |
   | ob_enable_transmission_checksum   | 1                | changed sys var | cold modified vars |  && global_scope && session_scope          |
   | _min_cluster_version              | '4.1.0.1'        | user var        | cold modified vars |                                            |
   +-----------------------------------+------------------+-----------------+--------------------+--------------------------------------------+
   ```

2. Query session variables by `CONNECTION_ID`.

   ```sql
   obclient> SELECT CONNECTION_ID();
   +-----------------+
   | CONNECTION_ID() |
   +-----------------+
   |      2147549231 |
   +-----------------+
   1 row in set
   
   obclient> SHOW PROXYSESSION VARIABLES 2147549231;
   +-----------------------------------+------------------+-----------------+--------------------+--------------------------------------------+
   | variable_name                     | value            | info            | modified_type      | sys_variable_flag                          |
   +-----------------------------------+------------------+-----------------+--------------------+--------------------------------------------+
   | ob_proxy_global_variables_version | 1461742173142100 | changed sys var | cold modified vars |  && invisible && session_scope && readonly |
   | ob_proxy_user_privilege           | 65534            | changed sys var | cold modified vars |  && invisible && session_scope && readonly |
   | ob_capability_flag                | 654159           | changed sys var | cold modified vars |  && invisible && session_scope && readonly |
   | ob_enable_transmission_checksum   | 1                | changed sys var | cold modified vars |  && global_scope && session_scope          |
   | _min_cluster_version              | '4.1.0.1'        | user var        | cold modified vars |                                            |
   +-----------------------------------+------------------+-----------------+--------------------+--------------------------------------------+
   5 rows in set
   ```

3. Query session variables with `all` specified.

   ```sql
   obclient> SHOW PROXYSESSION VARIABLES all 3;
   ```

   The output is as follows:

   ```shell
   +-----------------------------------+-----------------------+---------+------------------------------+-----------------------------------------------+
   | variable_name                     | value                 | info    | modified_type                | sys_variable_flag                             |
   +-----------------------------------+-----------------------+---------+------------------------------+-----------------------------------------------+
   | ob_proxy_global_variables_version | 1461742173142100      | sys var | cold modified vars           |  && invisible && session_scope && readonly    |
   | ob_proxy_user_privilege           | 65534                 | sys var | cold modified vars           |  && invisible && session_scope && readonly    |
   | ob_capability_flag                | 654159                | sys var | cold modified vars           |  && invisible && session_scope && readonly    |
   | ob_enable_transmission_checksum   | 1                     | sys var | cold modified vars           |  && global_scope && session_scope             |
   | auto_increment_increment          | 1                     | sys var | cold modified vars           |  && global_scope && session_scope             |
   | auto_increment_offset             | 1                     | sys var | cold modified vars           |  && global_scope && session_scope             |
   ······
   # Subsequent outputs omitted
   ```

   The following table describes the fields in the return result.

   | Field | Description |
   | ----------------- | ------------------------------ |
   | variable_name | The name of the variable. |
   | value | The value of the variable. |
   | info | The type of the variable, which can be system variable or user variable. |
   | modified_type | The modification type of the variable, which is identified based on the modification frequency. |
   | sys_variable_flag | The scope of the system variable. |

   For more information about system variables, see [System variables](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001029272). For more information about user variables, see [SET](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001031759).

### Terminate a client session

You can use the `KILL (cs_id | connection_id)` statement to terminate a client session. The following sections describe how to terminate a client session based on the client session ID or connection ID.

If you perform a `KILL` operation on a session by specifying its `cs_id` or `CONNECTION_ID` and the session is terminated, the operation is successful. When you execute the `SHOW PROXYSESSION` statement, the client will re-establish a session, send the SQL statement to ODP for execution, and display the execution result.

#### Terminate a session by specifying the client session ID

1. Execute the `SHOW PROXYSESSION` statement to query the ID of the client session (`cs_id`) to be terminated.

   ```sql
   obclient> show proxysession;
   ```

   The output is as follows, where the value in the second column (`Id`) indicates the client session ID.

   ```sql
   +---------------------+--------+---------+--------+------+-----------------+------+-------------+-------------------+-------------------+------+------+-----------+
   | proxy_sessid        | Id     | Cluster | Tenant | User | Host            | db   | trans_count | svr_session_count | state             | tid  | pid  | using_ssl |
   +---------------------+--------+---------+--------+------+-----------------+------+-------------+-------------------+-------------------+------+------+-----------+
   | 7230691418559283266 |     68 |  ob1.cc | sys    | root | 127.0.0.1:50260 | NULL |           0 |                 1 | MCS_ACTIVE_READER | 8728 | 8728 |         0 |
   +---------------------+--------+---------+--------+------+-----------------+------+-------------+-------------------+-------------------+------+------+-----------+
   1 rows in set
   ```

2. Execute the following statement to terminate the session:

   ```sql
   obclient> kill 68;
   ERROR 1317 (70100): Query execution was interrupted
   ```

3. Execute the following statement to verify whether the session is terminated:

   ```sql
   obclient> select 88;
   ```

   The following output shows that the connection is lost.

   ```sql
   ERROR 2013 (HY000): Lost connection to MySQL server during query
   ```

#### Terminate a session by specifying the connection ID

1. Execute the following statement to query the connection ID of the current session:

   ```sql
   obclient> select CONNECTION_ID();
   ```

   The output is as follows:

   ```sql
   +-----------------+
   | CONNECTION_ID() |
   +-----------------+
   |      3221766868 |
   +-----------------+
   1 row in set
   ```

2. Execute the following statement to terminate the session:

   ```sql
   obclient> kill 3221766868;
   ERROR 1317 (70100): Query execution was interrupted
   ```

3. Execute the following statement to verify whether the session is terminated:

   ```sql
   obclient> select 88;
   ```

   The following output shows that the connection is lost.

   ```sql
   ERROR 2013 (HY000): Lost connection to MySQL server during query
   ```

## Server sessions

This section describes general operations performed on a server session, which is established between ODP and an OBServer node.

### View server sessions

At present, you cannot use ODP to view server sessions. You can log on to the `sys` tenant of OceanBase Database as the `root` user and view all OBServer nodes in the cluster. Then, you can directly connect to the target OBServer node and view the server sessions.

This section provides only one method for you to view server sessions. For more information about the operations and output, see [View tenant sessions](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001166444).

1. Log on to the `sys` tenant of OceanBase Database as the `root` user and view all OBServer nodes in the cluster.

   ```sql
   obclient> select * from oceanbase. __all_server;
   ```

   The output is as follows:

   ```shell
   +----------------------------+----------------------------+------------+----------+----+------+------------+-----------------+--------+-----------------------+--------------------------------------------------------------------------+-----------+--------------------+--------------+----------------+
   | gmt_create                 | gmt_modified               | svr_ip     | svr_port | id | zone | inner_port | with_rootserver | status | block_migrate_in_time | build_version                                                            | stop_time | start_service_time | first_sessid | with_partition |
   +----------------------------+----------------------------+------------+----------+----+------+------------+-----------------+--------+-----------------------+--------------------------------------------------------------------------+-----------+--------------------+--------------+----------------+
   | 2023-02-28 15:45:53.230044 | 2023-02-28 15:46:25.577180 | 10.10.10.1 |     2882 |  3 | z3   |       2881 |               1 | ACTIVE |                     0 | 4.1.0.0_1-703037f0b023c8ffa880258463b25b1735cf27b3(Feb 28 2023 13:21:21) |         0 |   1677570376568330 |            0 |              1 |
   | 2023-02-28 15:45:53.197477 | 2023-02-28 15:46:25.534448 | 10.10.10.2 |     2882 |  2 | z2   |       2881 |               0 | ACTIVE |                     0 | 4.1.0.0_1-703037f0b023c8ffa880258463b25b1735cf27b3(Feb 28 2023 13:21:21) |         0 |   1677570376522994 |            0 |              1 |
   | 2023-02-28 15:45:53.113870 | 2023-02-28 15:46:25.098607 | 10.10.10.3 |     2882 |  1 | z1   |       2881 |               0 | ACTIVE |                     0 | 4.1.0.0_1-703037f0b023c8ffa880258463b25b1735cf27b3(Feb 28 2023 13:21:21) |         0 |   1677570378084150 |            0 |              1 |
   +----------------------------+----------------------------+------------+----------+----+------+------------+-----------------+--------+-----------------------+--------------------------------------------------------------------------+-----------+--------------------+--------------+----------------+
   3 rows in set
   ```

2. Select the target OBServer node and directly connect to it. 
   
   The following sample code directly connects to the OBServer node with the IP address `10.10.10.1` and the SQL port `2881`.

   ```sql
   [admin@test001 ~]$ obclient -h 10.10.10.1 -P2881 -uroot@sys -p -Doceanbase -A
   ```

3. Execute the `show processlist;` statement to query all sessions of the current OBServer node.

   ```shell
   obclient> show processlist;
   ```

   The output is as follows:

   ```shell
   +------------+---------+------------------+-----------+---------+------+--------+------------------+
   | Id         | User    | Host             | db        | Command | Time | State  | Info             |
   +------------+---------+------------------+-----------+---------+------+--------+------------------+
   | 3221812197 | root    | 10.10.10.1:48563 | oceanbase | Query   |    0 | ACTIVE | show processlist |
   | 3222117829 | proxyro | 10.10.10.1:37876 | oceanbase | Sleep   |    6 | SLEEP  | NULL             |
   | 3221709618 | root    | 10.10.10.1:51390 | oceanbase | Sleep   |  831 | SLEEP  | NULL             |
   +------------+---------+------------------+-----------+---------+------+--------+------------------+
   3 rows in set
   ```

### Terminate a server session

At present, you cannot use ODP to terminate server sessions. To terminate a server session, you can directly connect to the OBServer node.

1. Log on to the `sys` tenant of OceanBase Database as the `root` user and view all OBServer nodes in the cluster.

   ```sql
   obclient> select * from oceanbase. __all_server;
   ```

   The output is as follows:

   ```shell
   +----------------------------+----------------------------+------------+----------+----+------+------------+-----------------+--------+-----------------------+--------------------------------------------------------------------------+-----------+--------------------+--------------+----------------+
   | gmt_create                 | gmt_modified               | svr_ip     | svr_port | id | zone | inner_port | with_rootserver | status | block_migrate_in_time | build_version                                                            | stop_time | start_service_time | first_sessid | with_partition |
   +----------------------------+----------------------------+------------+----------+----+------+------------+-----------------+--------+-----------------------+--------------------------------------------------------------------------+-----------+--------------------+--------------+----------------+
   | 2023-02-28 15:45:53.230044 | 2023-02-28 15:46:25.577180 | 10.10.10.1 |     2882 |  3 | z3   |       2881 |               1 | ACTIVE |                     0 | 4.1.0.0_1-703037f0b023c8ffa880258463b25b1735cf27b3(Feb 28 2023 13:21:21) |         0 |   1677570376568330 |            0 |              1 |
   | 2023-02-28 15:45:53.197477 | 2023-02-28 15:46:25.534448 | 10.10.10.2 |     2882 |  2 | z2   |       2881 |               0 | ACTIVE |                     0 | 4.1.0.0_1-703037f0b023c8ffa880258463b25b1735cf27b3(Feb 28 2023 13:21:21) |         0 |   1677570376522994 |            0 |              1 |
   | 2023-02-28 15:45:53.113870 | 2023-02-28 15:46:25.098607 | 10.10.10.3 |     2882 |  1 | z1   |       2881 |               0 | ACTIVE |                     0 | 4.1.0.0_1-703037f0b023c8ffa880258463b25b1735cf27b3(Feb 28 2023 13:21:21) |         0 |   1677570378084150 |            0 |              1 |
   +----------------------------+----------------------------+------------+----------+----+------+------------+-----------------+--------+-----------------------+--------------------------------------------------------------------------+-----------+--------------------+--------------+----------------+
   3 rows in set
   ```

2. Directly connect to the target OBServer node.

   The following sample code directly connects to the OBServer node with the IP address `10.10.10.1` and the SQL port `2881`.

   ```shell
   [admin@test001 ~]$ obclient -h10.10.10.1 -P2881 -uroot@sys -p -Doceanbase -A
   ```

3. Execute the `show processlist;` statement to query all sessions of the current OBServer node.

   ```sql
   obclient> show processlist;
   ```

   The output is as follows:

   ```sql
   +------------+---------+------------------+-----------+---------+------+--------+------------------+
   | Id         | User    | Host             | db        | Command | Time | State  | Info             |
   +------------+---------+------------------+-----------+---------+------+--------+------------------+
   | 3221812197 | root    | 10.10.10.1:48563 | NULL      | Query   |    0 | ACTIVE | show processlist |
   | 3222117829 | proxyro | 10.10.10.1:37876 | oceanbase | Sleep   |    6 | SLEEP  | NULL             |
   | 3221709618 | root    | 10.10.10.1:51390 | NULL      | Sleep   |  831 | SLEEP  | NULL             |
   +------------+---------+------------------+-----------+---------+------+--------+------------------+
   3 rows in set
   ```

4. Execute the `kill <id>` statement to terminate the current session whose `Id` is `3221812197`.

   ```sql
   obclient> kill 3221812197;
   ERROR 2013 (HY000): Lost connection to MySQL server during query
   ```