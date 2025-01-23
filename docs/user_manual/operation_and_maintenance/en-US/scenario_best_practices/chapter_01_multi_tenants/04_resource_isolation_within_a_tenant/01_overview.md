---
title: Overview
weight: 1
---

In OceanBase Database, resource units are the basic units for allocating resources to tenants during tenant creation. To some extent, resource isolation between tenants can be considered a native feature of OceanBase Database.

In OceanBase Database Community Edition, each tenant is equivalent to a MySQL instance. For user-level resource isolation and more fine-grained resource isolation within a tenant, you need to configure related settings by referring to this topic.

## Resource Isolation Within a Tenant

In OceanBase Database, the procedural language (PL) package `DBMS_RESOURCE_MANAGER` is used to manage resource allocation in a database to implement resource isolation.

You can use the `DBMS_RESOURCE_MANAGER` package to configure the following types of resource isolation in a tenant based on the granularity of resource usage:

* User-level resource isolation

  User-level resource isolation specifies the mapping between a user and a resource group. All SQL statements initiated by the specified user can be executed by using only the resources in the resource group mapped to the user.

* SQL statement-level resource isolation

  SQL statement-level resource isolation is finer-grained than user-level resource isolation. You can bind the SQL statements that meet a specified condition to a specified resource group to implement SQL statement-level resource isolation. If multiple accounts exist in the business system, when an order of an account is processed, a transaction is enabled to execute a batch of SQL statements related to this account. Generally, the account is specified in the `WHERE` clause. Different accounts may involve different amounts of data. If accounts involving a large amount of data use up the CPU resources, the orders of accounts involving a small amount of data cannot be processed. You can bind SQL statements for processing different orders with different resource groups. In this way, SQL statements for different orders can use resources in different resource groups.

* Function-level resource isolation

  Function-level resource isolation specifies the mapping between a background task and a resource group. In this way, resources are isolated for different types of tasks. At present, you can control the CPU resources available for the background tasks.

## DBMS_RESOURCE_MANAGER Package

The `DBMS_RESOURCE_MANAGER` package is used to maintain the following elements:

* Resource groups: A resource group is a collection of sessions that are grouped based on resource requirements. The system allocates resources to a resource group rather than to individual sessions.

* Resource management plans: A resource management plan is a container of plan directives and specifies how resources are allocated to resource groups. You can activate a specific resource management plan to control the allocation of resources.

* Plan directives: A plan directive associates a resource group with a resource management plan and specifies how resources are allocated to this resource group.

For more information about the `DBMS_RESOURCE_MANAGER` package, see [DBMS_RESOURCE_MANAGER](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001784731) in MySQL mode.