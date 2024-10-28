---
title: Set parameters and variables
weight: 9
---

# 2.8 Set parameters and variables

## Parameters

This section describes the classification of parameters and how to view and modify parameters.

### Classification of parameters

In OceanBase Database, parameters are classified into cluster-level parameters and tenant-level parameters.

* Cluster-level parameters specify the basic information as well as performance and security options of an entire OceanBase cluster.

* Tenant-level parameters specify configurations and optimizations for one or more tenants. Typical tenant-level parameters are those used for the storage engine, SQL execution strategies, and access control. Usually, tenant-level parameters are specified when you create and manage a tenant, and can be modified as needed at any time.

### View parameters

At present, you can view parameters by using OceanBase Cloud Platform (OCP), OceanBase Deployer (OBD), or SQL statements. You can select an appropriate method as needed.

#### View parameters in OCP
  
This section briefly describes how to view cluster parameters in OCP. For more information, see [View parameters](https://en.oceanbase.com/docs/common-ocp-10000000001483787).

1. Log on to the OCP console.
  
2. In the left-side navigation pane, click **Clusters**.
  
3. In the **Clusters** list on the page that appears, find the target cluster and click its name.
  
4. In the left-side navigation pane of the page that appears, click **Parameter Management**.

#### View parameters in OBD
  
You can run the following command to view parameters. This command displays only the parameters specified in the configuration file, not all parameters of OceanBase Database. For more information about the parameters managed by OBD, see [parameter.yaml](https://github.com/oceanbase/obdeploy/blob/master/plugins/oceanbase/4.2.1.4/parameter.yaml) in the GitHub repository.

```shell
obd cluster edit-config obtest
```

In this command, `obtest` is a sample cluster name. You can run the `obd cluster list` command to query the actual cluster name and replace `obtest` with the actual name.

#### View parameters by using SQL statements
  
There are two methods for viewing parameters by using SQL statements. Pay attention to the following fields in the output:
  
* `SCOPE`: indicates the parameter level. The value `CLUSTER` indicates that the parameter is a cluster-level parameter. The value `TENANT` indicates that the parameter is a tenant-level parameter.

* `EDIT_LEVEL`: indicates whether the parameter can be modified and the effective mode.

  * `READONLY`: The parameter is read-only and cannot be modified.

  * `STATIC_EFFECTIVE`: The parameter can be modified and the modification takes effect upon a restart.

  * `DYNAMIC_EFFECTIVE`: The parameter can be modified and the modification takes effect dynamically.

  > **Notice**
  >
  > Some parameters with an `EDIT_LEVEL` value of `DYNAMIC_EFFECTIVE` cannot actually be modified. Pay special attention to such parameters during modification.

* Execute the `show parameters` statement to query parameters. Here are some examples:
  
  ```shell
  show parameters like '%memory%';
  show parameters like 'enable_rebalance' tenant='test3';
  show parameters where name like 'cpu_count';
  show parameters where name in ('memory_limit','cpu_count');
  ```

  > **Note**
  >
  > When you execute the `show parameters` statement to query parameters, some parameters can be queried from all tenants, while others can be queried only from the sys tenant.

* Query the `GV$OB_PARAMETERS` view for parameters. Here is an example:

  ```sql
  SELECT * FROM oceanbase.GV$OB_PARAMETERS WHERE NAME LIKE '%memstore%';
  ```

  The output is as follows:

  ```shell
  +---------------+----------+-------+---------+-----------+---------------------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+-------------------+
  | SVR_IP        | SVR_PORT | ZONE  | SCOPE   | TENANT_ID | NAME                      | DATA_TYPE | VALUE | INFO                                                                                                                                                                                                         | SECTION | EDIT_LEVEL        |
  +---------------+----------+-------+---------+-----------+---------------------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+-------------------+
  | 10.10.10.1    |     2882 | zone1 | CLUSTER |      NULL | memstore_limit_percentage | NULL      | 50    | used in calculating the value of MEMSTORE_LIMIT parameter: memstore_limit_percentage = memstore_limit / memory_size,memory_size, where MEMORY_SIZE is determined when the tenant is created. Range: (0, 100) | TENANT  | DYNAMIC_EFFECTIVE |
  +---------------+----------+-------+---------+-----------+---------------------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+-------------------+
  ```

  This method supports flexible filtering and allows queries from all tenants. For more information about the columns in the output, see [GV$OB_PARAMETERS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104422).

### Modify parameters

At present, you can modify parameters by using OCP, OBD, or SQL statements. You can select an appropriate method as needed.

#### Modify parameters in OCP
  
This section briefly describes how to modify cluster parameters. For more information, see [Modify parameters](https://en.oceanbase.com/docs/common-ocp-10000000001483789).

1. Log on to the OCP console.

2. In the left-side navigation pane, click **Clusters**.

3. In the **Clusters** list on the page that appears, find the target cluster and click its name.

4. In the left-side navigation pane of the page that appears, click **Parameter Management**.

5. (Optional) In the search box of the **Parameters** page, enter a parameter name to perform a fuzzy search.

6. Find the parameter to be modified and click **Change Value** in the **Actions** column.

7. In the dialog box that appears, modify the parameter value, effective scope, and effective objects. Then, click **OK**.

#### Modify parameters in OBD
  
For the parameters that can be modified in OBD, see [parameter.yaml](https://github.com/oceanbase/obdeploy/blob/master/plugins/oceanbase/4.2.1.4/parameter.yaml) in GitHub.

> **Notice**
>
> After you modify parameters with a `need_redeploy` value of `true`, you need to run the `obd cluster redeploy` command for the modifications to take effect. This command will destroy the current cluster and deploy a new one. Proceed with caution.

1. Run the following command to open the configuration file:

   ```sql
   obd cluster edit-config obtest
   ```

   In this command, `obtest` is a sample cluster name. You can run the `obd cluster list` command to query the actual cluster name and replace `obtest` with the actual name.
  
2. Modify parameters, save the configuration file, and exit. Then, run the reload command provided in the output.

   Here is a sample output. You need to run the `obd cluster reload obtest` command for the modifications to take effect.

   ```shell
   Search param plugin and load ok
   Search param plugin and load ok
   Parameter check ok
   Save deploy "obtest" configuration
   Use `obd cluster reload obtest` to make changes take effect.
   ```

   > **Notice**
   >
   > If OBD prompts you to run the `obd cluster redeploy` command after you modify a parameter, be sure to contact OceanBase Technical Support for confirmation. This is to prevent data loss that could occur due to the cluster redeployment initiated by the `obd cluster redeploy` command.

#### Modify parameters by using SQL statements
  
For more information about how to modify parameters by using SQL statements, see [Set parameters](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103822).

```sql
alter system set Parameter name='Parameter value' [tenant='xxx'];
```

> **Notice**
>
> For a cluster deployed by OBD, if you execute an SQL statement to view a parameter that has been modified by an OBD command, the parameter value returned is the new one. However, if you modify a parameter in the configuration file by using an SQL statement and then view this parameter by using an OBD command, the parameter value returned is the original one.

## Variables

System variables allow you to control behaviors of a database system, such as the cache size, number of concurrent connections, CPU utilization, and memory usage. You can also use system variables to configure various features of the database system.

### Classification of system variables

The system variables of OceanBase Database can be classified into global variables and session-level variables.

* A global variable is used to implement a global modification. Different users of the same database tenant share the settings of global variables. Modifications to global variables remain effective after you exit the session. In addition, modifications to global variables do not take effect on the currently open session and take effect only after a new session is established.

* A session-level variable is used to implement a session-level modification. When a client is connected to the database, the database copies global variables to automatically generate session-level variables. Modifications made to session-level variables apply to the current session only.

At present, you cannot query a table or view to determine whether a variable is read-only. Instead, you need to obtain this information from the source code package of the corresponding version. You can run the following command to query the read-only variables from the `ob_system_variable_init.json` file in the `src/share/system_variable/` directory.

```shell
cat ob_system_variable_init.json  | jq ". [] | {name,flags}" | grep -C 2 "READONLY" | grep -v "ORACLE_ONLY"
```

### View variables

In OCP, tenant parameters are variables. To view variables in OCP, see [View the parameters](https://en.oceanbase.com/docs/common-ocp-10000000001483741).

To view variables by using SQL statements, use any of the following methods:

* Query the `CDB_OB_SYS_VARIABLES` view

  You can query this view for the variables of all tenants only from the sys tenant. For more information about the `CDB_OB_SYS_VARIABLES` view, see [oceanbase.CDB_OB_SYS_VARIABLES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001167271).

  ```sql
  select * from oceanbase.CDB_OB_SYS_VARIABLES where name='ob_query_timeout' and tenant_id=x;
  ```

* Execute the `SHOW VARIABLES` statement
  
  You can execute the `SHOW VARIABLES` statement to view variables only of the current tenant.

  ```sql
  SHOW VARIABLES LIKE 'ob_query_timeout';
  ```

* Query the `DBA_OB_SYS_VARIABLES` view

  You can query this view for the variables only of the current tenant. For more information about the `DBA_OB_SYS_VARIABLES` view, see [oceanbase.DBA_OB_SYS_VARIABLES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001167780).

  > **Note**
  >
  > This view is introduced since OceanBase Database V4.2.2.

  ```sql
  select * from oceanbase.DBA_OB_SYS_VARIABLES where name='ob_query_timeout';
  ```

### Modify variables

In OCP, tenant parameters are variables. To modify variables in OCP, see [Modify a parameter](https://en.oceanbase.com/docs/common-ocp-10000000001483740).

To modify variables by using SQL statements, use either of the following methods as needed. For more information, see [Set variables](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103825).

* If you set a global variable, the setting does not take effect for the current session but for new sessions.
  
  ```sql
  set global ob_query_timeout=10000000;
  ```

* If you set a session-level variable, the setting takes effect only for the current session, and not for other sessions.

  ```sql
  set session ob_query_timeout=10000000;
  ```

## Comparison between parameters and variables

| Comparison item   | Parameter | System variable |
|---------|-----------|---------|
| Effective scope | Effective in a cluster, zone, server, or tenant. | Effective globally or at the session level in a tenant. |
| Effective method | <ul><li>Dynamically take effect: The value of <code>edit_level</code> is <code>dynamic_effective</code>.</li><li>Take effect upon restart: The value of <code>edit_level</code> is <code>static_effective</code>.</li></ul> | <ul><li>A session-level variable takes effect only for the current session. </li><li> A global variable does not take effect for the current session but for new sessions established upon re-logon. </li></ul> |
| Modification | <ul><li>Modification can be performed by using SQL statements. Example: <br></br><code>ALTER SYSTEM SET schema_history_expire_time='1h';</code>.</li><li>Modification can be performed by using startup parameters. Example: <br></br><code>cd /home/admin/oceanbase && ./bin/observer -o "schema_history_expire_time='1h'";</code>. </li></ul>| Modification can only be performed by using SQL statements. Examples: <ul><li><code>SET ob_query_timeout = 20000000;</code></li><li><code>SET GLOBAL ob_query_timeout = 20000000;</code></li></ul> |
| Query | You can query a parameter by using the `SHOW PARAMETERS` statement. Example: `SHOW PARAMETERS LIKE 'schema_history_expire_time';` | You can query a variable by using the `SHOW [GLOBAL] VARIABLES` statement. Examples: <ul><li><code>SHOW VARIABLES LIKE 'ob_query_timeout';</code></li><li><code>SHOW GLOBAL VARIABLES LIKE 'ob_query_timeout';</code></li></ul> |
| Persistence   | Parameters are persisted into internal tables and configuration files and can be queried from the <code>/home/admin/oceanbase/etc/observer.config.bin</code> and <code>/home/admin/oceanbase/etc/observer.config.bin.history</code> files. | Only global variables are persisted. |
| Lifecycle | Long. A parameter remains effective for the entire duration of a process. | Short. A system variable takes effect only after the tenant schema is created. |
