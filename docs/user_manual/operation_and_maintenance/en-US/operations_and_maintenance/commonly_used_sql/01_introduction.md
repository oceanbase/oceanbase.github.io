---
title: Introduction
weight: 1
---

## Background Information
This chapter is provided based on a suggestion from the user Xuebei in the OceanBase community forum. Xuebei hopes that we can add some SQL statements or commands commonly used for O&M to this tutorial so that users can maintain OceanBase Database in CLI mode without the need to use specific features of OceanBase Cloud Platform (OCP).

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/02_commonly_used_sql/001.png)

In this chapter, we will summarize and share the SQL statements commonly used by OceanBase Technical Support for O&M over a long period of time. We hope it is helpful to users who are accustomed to using CLI to maintain OceanBase Database.

You can directly copy and use most of the SQL statements provided in each topic of this chapter. Other SQL statements may require you to modify parameters based on your business requirements before use.

If you have other requirements for the O&M of OceanBase Database, leave a comment on our post in the [OceanBase community](https://ask.oceanbase.com/t/topic/35610431). We will continue to improve this tutorial based on your opinions and suggestions.

## Considerations for View Queries in OceanBase Database V4.x
We recommend that you query metadata by using views in OceanBase Database V4.x. However, the performance of view queries may be poor. In this case, you can specify more query conditions to improve query performance, such as `tenant_id = 1001`.

In the sys tenant, you can query CDB views or DBA views in the `oceanbase` database. In a user tenant, you can query only DBA views in the `oceanbase` database as the root user in MySQL mode.

For more information about the changes of views, see [Changes in views in OceanBase Database V3.x and V4.x](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001785344).