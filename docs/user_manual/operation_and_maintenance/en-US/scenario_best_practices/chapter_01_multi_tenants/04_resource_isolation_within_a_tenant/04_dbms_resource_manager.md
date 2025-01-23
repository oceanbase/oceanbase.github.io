---
title: Configure Resource Isolation Within a Tenant
weight: 4
---

This topic describes how to configure resource isolation within a MySQL tenant.

## Prerequisites

* You have familiarized yourself with the "Overview" topic under "Resource Isolation Within a Tenant".
* You have configured the control group (cgroup) directory and enabled the cgroup feature, if you need to implement isolation of CPU resources, which relies on cgroups. For more information, see the "Prepare for CPU Resource Isolation" topic.

  When you configure user-level or function-level resource isolation, you do not need to configure cgroups if CPU resource isolation is not required. When you configure SQL statement-level resource isolation, you must configure cgroups regardless of whether CPU resource isolation is required.

* You have calibrated the disk performance before you implement IOPS resource isolation. For more information, see the "Prepare for IOPS Resource Isolation" topic.

  If you need to implement only CPU resource isolation, you do not need to calibrate the disk performance.

* You have created a user for which resource isolation is to be implemented.

* You have created the database, table, and column for which resource isolation is to be implemented, if you need to implement SQL statement-level resource isolation.

## (Optional) Step 1: Specify Valid Values for the MAX_IOPS and MIN_IOPS Parameters of the Tenant

Note: If you have set <code>MAX_IOPS</code> and <code>MIN_IOPS</code> to the baseline IOPS value for 16 KB reads when you create the unit config for the tenant, or if IOPS resource isolation is not required, skip this step.

Before you configure a resource isolation plan after disk calibration, make sure that the <code>MAX_IOPS</code> and <code>MIN_IOPS</code> parameters in the unit config of the tenant are set to valid values that are not greater than the baseline IOPS value for 16 KB reads.

1. Log in to the `sys` tenant of the cluster as the `root` user.

2. Execute the following statement to query the unit config of the tenant for which resource isolation is to be implemented:

   ```sql
   obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS;
   ```

   A sample query result is as follows:

   ```shell
   +----------------+-----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
   | UNIT_CONFIG_ID | NAME            | CREATE_TIME                | MODIFY_TIME                | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS            | MIN_IOPS            | IOPS_WEIGHT |
   +----------------+-----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
   |              1 | sys_unit_config | 2023-12-19 13:55:04.463295 | 2023-12-19 13:56:08.969718 |       3 |       3 |  2147483648 |    3221225472 | 9223372036854775807 | 9223372036854775807 |           3 |
   |           1001 | small_unit      | 2023-12-19 13:56:09.851665 | 2023-12-19 13:56:09.851665 |       1 |       1 |  2147483648 |    6442450944 | 9223372036854775807 | 9223372036854775807 |           1 |
   |           1002 | medium_unit     | 2023-12-19 13:56:10.030914 | 2023-12-19 13:56:10.030914 |       8 |       4 |  8589934592 |   25769803776 | 9223372036854775807 | 9223372036854775807 |           4 |
   |           1003 | large_unit      | 2023-12-19 13:56:10.112115 | 2023-12-19 13:56:10.112115 |      16 |       8 | 21474836480 |   64424509440 | 9223372036854775807 | 9223372036854775807 |           8 |
   +----------------+-----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+---------------------+---------------------+-------------+
   4 rows in set
   ```

   If the default value `INT64_MAX` (which is `9223372036854775807`) is used for the `MAX_IOPS` and `MIN_IOPS` parameters of the tenant, you must replan the IOPS resources for the tenant.
   
3. Execute the following statement to query the OBServer nodes on which the tenant is deployed:

   ```sql
   obclient [oceanbase]> SELECT DISTINCT SVR_IP, SVR_PORT FROM oceanbase.CDB_OB_LS_LOCATIONS WHERE tenant_id = xxxx;
   ```

   A sample query result is as follows:

   ```shell
   +----------------+----------+
   | SVR_IP         | SVR_PORT |
   +----------------+----------+
   | xx.xxx.xxx.xx1 |    xxxx1 |
   | xx.xxx.xxx.xx1 |    xxxx2 |
   | xx.xxx.xxx.xx1 |    xxxx3 |
   +----------------+----------+
   3 rows in set
   ```

4. Execute the following statement to query the baseline IOPS value of the disk on each OBServer node where the tenant is deployed. If the queried baseline IOPS value is less than the baseline IOPS value for 16 KB reads, set the queried baseline IOPS value as the upper IOPS limit of the node; otherwise, set the baseline IOPS value for 16 KB reads as the upper IOPS limit of the node.

   ```sql
   obclient [oceanbase]> SELECT * FROM oceanbase.GV$OB_IO_BENCHMARK WHERE MODE='READ' AND SIZE=16384;
   ```

   A sample query result is as follows:

   ```shell
   +----------------+----------+--------------+------+-------+-------+------+---------+
   | SVR_IP         | SVR_PORT | STORAGE_NAME | MODE | SIZE  | IOPS  | MBPS | LATENCY |
   +----------------+----------+--------------+------+-------+-------+------+---------+
   | xx.xxx.xxx.xx1 |    xxxx1 | DATA         | READ | 16384 | 48162 |  752 |     331 |
   | xx.xxx.xxx.xx1 |    xxxx2 | DATA         | READ | 16384 | 47485 |  741 |     336 |
   | xx.xxx.xxx.xx1 |    xxxx3 | DATA         | READ | 16384 | 48235 |  753 |     331 |
   +----------------+----------+--------------+------+-------+-------+------+---------+
   3 rows in set
   ```

   Plan the IOPS resources available for the tenant by using the queried disk calibration value of each node as the upper IOPS limit. Multiple tenants in a cluster may be deployed on the same OBServer nodes. You can allocate the IOPS resources based on the actual situation.
   
   Assume that a cluster has two tenants deployed on the same OBServer nodes, the baseline IOPS value for 16 KB reads is 20000 on each OBServer node, and the loads of the two tenants are similar. You can evenly distribute the IOPS resources to the two tenants based on the actual situation. Specifically, you can set the `MAX_IOPS` and `MIN_IOPS` parameters to 10000 for both tenants. You can also set `MIN_IOPS` to a value smaller than that of `MAX_IOPS` based on your business needs.

5. Execute the following statements to modify the values of `MAX_IOPS` and `MIN_IOPS`.

   We recommend that you modify the value of `MIN_IOPS` first and then that of `MAX_IOPS`.

   ```sql
   ALTER RESOURCE UNIT unit_name MIN_IOPS = xxx;
   ```

   ```sql
   ALTER RESOURCE UNIT unit_name MAX_IOPS = xxx;
   ```

## Step 2: Configure a Resource Isolation Plan

Assume that the current tenant contains two users: `tp_user` and `ap_user`.

You can configure a resource isolation plan to control the CPU and IOPS resources available for different users or background tasks.

1. Log in to a MySQL tenant of the cluster as the administrator of the tenant.

2. Call the `CREATE_CONSUMER_GROUP` subprogram in the `DBMS_RESOURCE_MANAGER` package to create a resource group.

   The syntax is as follows:

   ```sql
   CALL DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
   CONSUMER_GROUP => 'group_name' ,
   COMMENT => 'comments'
   );
   ```

   The parameters are described as follows:

   * `CONSUMER_GROUP`: the name of the resource group.

   * `COMMENT`: the comments on the resource group.

   For example, create two resource groups respectively named `interactive_group` and `batch_group`.

   ```shell
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
   CONSUMER_GROUP => 'interactive_group' ,
   COMMENT => 'TP'
   );
   ```

   ```shell
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_CONSUMER_GROUP(
   CONSUMER_GROUP => 'batch_group' ,
   COMMENT => 'AP'
   );
   ```

   You can query the `oceanbase.DBA_RSRC_CONSUMER_GROUPS` view to verify whether the resource groups are created. For more information about the `oceanbase.DBA_RSRC_CONSUMER_GROUPS` view, see [oceanbase.DBA_RSRC_CONSUMER_GROUPS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001785827).

3. Call the `CREATE_PLAN` subprogram in the `DBMS_RESOURCE_MANAGER` package to create a resource management plan.

   The syntax is as follows:

   ```sql
   CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN(
   PLAN => 'plan_name',
   comment => 'comments');
   ```

   The parameters are described as follows:

   * `PLAN`: the name of the resource management plan.
  
   * `COMMENT`: the comments on the resource management plan.

   For example, create a resource management plan named `daytime` and add comments.

   ```sql
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN(
   PLAN => 'daytime',
   comment => 'TPFirst');
   ```   

   You can query the `oceanbase.DBA_RSRC_PLANS` view to verify whether the resource management plan is created. For more information about the `oceanbase.DBA_RSRC_PLANS` view, see [oceanbase.DBA_RSRC_PLANS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001785831).

4. Call the `CREATE_PLAN_DIRECTIVE` subprogram in the `DBMS_RESOURCE_MANAGER` package to create a plan directive, which is used to limit the CPU and IOPS resources available for the resource group when the resource management plan is enabled. The syntax is as follows:

   ```sql
   CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE (
      PLAN => 'plan_name',
      GROUP_OR_SUBPLAN => 'group_name' ,
      COMMENT  => 'comments',
      MGMT_P1 => int_value,
      UTILIZATION_LIMIT => int_value,
      MIN_IOPS => int_value,
      MAX_IOPS => int_value,
      WEIGHT_IOPS => int_value);
   ```

   Call the `UPDATE_PLAN_DIRECTIVE` subprogram in the `DBMS_RESOURCE_MANAGER` package to update the plan directive. Here is an example:

   ```sql
   obclient [test]> CALL DBMS_RESOURCE_MANAGER.UPDATE_PLAN_DIRECTIVE(
   PLAN => 'daytime',
   GROUP_OR_SUBPLAN => 'interactive_group' ,
   COMMENT => 'new',
   MGMT_P1 => 40,
   UTILIZATION_LIMIT => 60);
   MIN_IOPS => 40,
   MAX_IOPS => 80,
   WEIGHT_IOPS => 70);
   ```

   The parameters are described as follows:

   * `PLAN`: the name of the resource management plan.

   * `GROUP_OR_SUBPLAN`: the resource group.
  
   * `COMMENT`: the comments on the plan directive. The default value is `NULL`.

   * `MGMT_P1`: the maximum percentage of CPU resources available when the system runs at full load. The default value is `100`.
  
   * `UTILIZATION_LIMIT`: the upper limit on the CPU resources available for the resource group. The default value is `100`. The value range is (0, 100\]. The value `100` indicates that all CPU resources of the tenant are available for the resource group. The value `70` indicates that at most 70% of the CPU resources of the tenant are available for the resource group.

   * `MIN_IOPS`: the IOPS resources reserved for the resource group in the case of I/O resource contention. The sum of `MIN_IOPS` values of all resource groups cannot exceed 100. The default value is `0`.

   * `MAX_IOPS`: the maximum IOPS resources available for the resource group. The sum of `MAX_IOPS` values of all resource groups can exceed 100. The default value is `100`.

   * `WEIGHT_IOPS`: the weight for IOPS resources. The sum of `WEIGHT_IOPS` values of all resource groups can exceed 100. The default value is `0`.

   Here is an example:
   
   * Create a plan directive as follows: Set the resource plan to `daytime`, the resource group to `interactive_group`, and the maximum CPU resources available to 80% of the total CPU resources of the tenant. Set the minimum IOPS resources available upon I/O contention to 30% of the total IOPS resources, the maximum IOPS resources available to 90% of the total IOPS resources, and the weight of IOPS resources to 80.

      ```shell
      obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE(
      PLAN => 'daytime',
      GROUP_OR_SUBPLAN => 'interactive_group' ,
      COMMENT  => '',
      UTILIZATION_LIMIT =>80,
      MIN_IOPS => 30,
      MAX_IOPS => 90,
      WEIGHT_IOPS => 80);
      ```
    
   * Create a plan directive as follows: Set the resource plan to `daytime`, the resource group to `batch_group`, and the maximum CPU resources available to 40% of the total CPU resources of the tenant. Set the minimum IOPS resources available upon I/O contention to 40% of the total IOPS resources, the maximum IOPS resources available to 80% of the total IOPS resources, and the weight of IOPS resources to 70.

      ```shell
      obclient [test]> CALL DBMS_RESOURCE_MANAGER.CREATE_PLAN_DIRECTIVE(
      PLAN => 'daytime',
      GROUP_OR_SUBPLAN => 'batch_group' ,
      COMMENT  => '',
      UTILIZATION_LIMIT => 40,
      MIN_IOPS => 40,
      MAX_IOPS => 80,
      WEIGHT_IOPS => 70);
      ```

   You can query the `oceanbase.DBA_RSRC_PLAN_DIRECTIVES` and `oceanbase.DBA_OB_RSRC_IO_DIRECTIVES` views to verify whether the plan directives are created.

   For more information about the `oceanbase.DBA_RSRC_PLAN_DIRECTIVES` view, see [oceanbase.DBA_RSRC_PLAN_DIRECTIVES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001785829).

   For more information about the `oceanbase.DBA_OB_RSRC_IO_DIRECTIVES` view, see [oceanbase.DBA_OB_RSRC_IO_DIRECTIVES](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001785796).

5. Call the `SET_CONSUMER_GROUP_MAPPING` subprogram in the `DBMS_RESOURCE_MANAGER` package to create a matching rule for resource isolation based on your business scenario.

   The syntax is as follows:

   ```sql
   CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
      ATTRIBUTE => 'column | user | function', 
      VALUE => 'values',
      CONSUMER_GROUP => 'group_name');
   ```

   The parameters are described as follows:

   * `ATTRIBUTE`: the attribute type. The attribute name is case-insensitive.
      
     * The value `column` indicates SQL statement-level resource isolation.
     
     * The value `user` indicates user-level resource isolation.
     
     * The value `function` indicates function-level resource isolation.

   * `VALUE`: the attribute value.
   
     * If the attribute type is `column`, specify the database name, table name, column name, constant value, and username.

       Specifically:

       * The database name and username are optional. The default database name is the name of the current database. If no username is specified, the settings take effect for all users, including those created later in the current tenant.

       * The table name, column name, and constant value are required, and each of them can have only one value. The constant value must be a number or string.

       * When you specify the table name, column name, and username, the specified table, column, and user must exist.
     
     * If the attribute type is `user`, specify the username. At present, you can specify only one username.

     * If the attribute type is `function`, specify a background task corresponding to the directed acyclic graph (DAG) thread. Eight types of background tasks are supported: `compaction_high`, `ha_high`, `compaction_mid`, `ha_mid`, `compaction_low`, `ha_low`, `ddl`, and `ddl_high`. At present, you can specify only one task.

   * `CONSUMER_GROUP`: the resource group to bind. When an SQL statement hits the matching rule specified by the `VALUE` parameter, this statement is bound to the specified resource group for execution. At present, an SQL statement can be bound only to one resource group.

        If no resource group is specified, the built-in resource group `OTHER_GROUPS` is bound by default. The resources of the built-in resource group `OTHER_GROUPS` are as follows:
        
        * `MIN_IOPS` = 100 – SUM(Resources of other resource groups in the tenant)
        
        * `MAX_IOPS` = 100
        
        * `WEIGHT_IOPS` = 100

   Here is an example:

   * Create a matching rule for SQL statement-level resource isolation.

      * Specify to bind an SQL statement that is initiated by the `tp_user` user and that has a `WHERE` clause containing `test.t.c3 = 3` to the `batch_group` resource group for execution by using the CPU and IOPS resources available for the resource group.

        <main id="notice" type='notice'>
        <h4>Notice</h4>
        <p>An SQL statement can be bound to the <code>batch_group</code> resource group provided that <code>c3</code> is parsed into <code>test.t.c3</code> but the statement does not necessarily need to contain <code>test.t.</code>. For example, the statement <code>SELECT * FROM test.t WHERE c3 = 1;</code> can be bound to the resource group. </p>
        </main>

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'column',
        VALUE => 'test.t.c3=3 for tp_user',
        CONSUMER_GROUP => 'batch_group');
        ```

      * Specify to bind an SQL statement that has a `WHERE` clause containing `t.c3=5` to the `interactive_group` resource group for execution by using the CPU and IOPS resources available for the resource group.

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'column',
        VALUE => 't.c3=5',
        CONSUMER_GROUP => 'interactive_group');
        ```

       You can also use a hint to bind an SQL statement to a resource group without calling the `SET_CONSUMER_GROUP_MAPPING` subprogram. For example, if you want the `SELECT * FROM T` statement to use resources available for the `batch_group` resource group during execution, you can use a hint to bind the statement to the resource group.

      ```shell
      obclient [test]> SELECT /*+resource_group('batch_group')*/ * FROM t;
      ```

      <main id="notice" type='explain'>
      <h4>Note</h4>
      <p>If the resource group specified by the hint does not exist, the default resource group <code>OTHER_GROUPS</code> is used. </p>
      </main>

   * Create a matching rule for user-level resource isolation.

      * Specify to bind SQL statements initiated by the `tp_user` user to the `interactive_group` resource group for execution by using the CPU and IOPS resources available for the resource group.

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'user',
        VALUE => 'tp_user',
        CONSUMER_GROUP => 'interactive_group');
        ```

      * Specify to bind SQL statements initiated by the `ap_user` user to the `batch_group` resource group for execution by using the CPU and IOPS resources available for the resource group.

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'user',
        VALUE => 'ap_user',
        CONSUMER_GROUP => 'batch_group');
        ```

   * Create a matching rule for function-level resource isolation.

      * Specify to bind `compaction_high` tasks to the `interactive_group` resource group for execution by using the CPU and IOPS resources available for the resource group.

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'function',
        VALUE => 'compaction_high',
        CONSUMER_GROUP => 'interactive_group');
        ```

      * Specify to bind `ddl_high` tasks to the `batch_group` resource group for execution by using the CPU and IOPS resources available for the resource group.

        ```shell
        obclient [test]> CALL DBMS_RESOURCE_MANAGER.SET_CONSUMER_GROUP_MAPPING(
        ATTRIBUTE => 'function',
        VALUE => 'ddl_high',
        CONSUMER_GROUP => 'batch_group');
        ```

   You can query the `oceanbase.DBA_RSRC_GROUP_MAPPINGS` view to verify whether the matching rule is created. For more information about the `oceanbase.DBA_RSRC_GROUP_MAPPINGS` view, see [oceanbase.DBA_RSRC_GROUP_MAPPINGS](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001785828).

6. Enable a proper resource management plan for a resource group.

   The resources available for a resource group vary based on the resource management plan. Therefore, you must enable a proper resource management plan for a resource group.

   ```sql
   obclient [test]> SET GLOBAL resource_manager_plan = 'daytime';
   ```

   <main id="notice" type='explain'>
   <h4>Note</h4>
   <p>If resource usage does not need to be limited, you can execute the <code>SET GLOBAL resource_manager_plan = '';</code> statement to disable all resource management plans. </p>
   </main>

## Considerations

* After a matching rule for user-level resource isolation is added, if you delete the user and create the user again, this matching rule still applies.

* A matching rule for resource isolation does not take effect immediately after it is added, but is expected to take effect within 10 seconds. The time may vary based on the actual environment.

* SQL statement-level resource isolation has a higher priority than user-level resource isolation and function-level resource isolation.

* After a matching rule for resource isolation is added, it takes effect only in the `SELECT`, `INSERT`, `UPDATE`, and `DELETE` statements, and does not take effect in data definition language (DDL), data control language (DCL), or procedural language (PL) statements. It can take effect in prepared statements.

## Impact on Performance

* The system performance will not be affected after user-level resource isolation and function-level resource isolation are enabled. This is because the resource group used for executing an SQL statement is determined before the SQL statement is parsed.

* The impact of SQL statement-level resource isolation on performance is caused by retries. In user-level and function-level resource isolation, the resource group used for executing an SQL statement is determined before the SQL statement is parsed. However, in SQL statement-level resource isolation, the resource group used for executing an SQL statement is determined when the SQL statement is parsed or hits the plan cache. If the system detects that the resource group being used is not the determined resource group, the system will perform a retry to use the resources in the resource group determined based on the matching rule to execute this SQL statement.

  The impact of SQL statement-level resource isolation falls into three cases:

  1. If an SQL statement does not hit any matching rule, SQL statement-level resource isolation has no impact on the performance.

  2. If an SQL statement hits a matching rule that specifies to use the `batch_group` resource group, this SQL statement is executed by using resources in the `batch_group` resource group. The next SQL statement is also preferentially executed by using resources in this resource group. When the system detects that the matching rule hit by another SQL statement is bound to a different resource group, it will perform a retry to use resources in the new resource group to execute this statement. To continuously execute a batch of SQL statements that are bound to the same resource group, you can use this strategy so that the system needs to retry only the first SQL statement. This reduces the number of retries and causes slight impact on the performance.

  3. If the expected resource group of each SQL statement is different from that of the previous statement, the system must retry for each SQL statement. This greatly affects the performance.