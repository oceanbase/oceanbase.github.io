---
title: Connect to a tenant
weight: 8
---

# 2.7 Connect to a tenant

OceanBase Database Community Edition provides only the MySQL mode and supports the MySQL 5.7 protocol. Therefore, you can use a MySQL command-line client or GUI tool to connect to a MySQL tenant of OceanBase Database. OceanBase Database also provides a dedicated command-line client, OBClient, and a GUI client, OceanBase Developer Center (ODC).

## Connect to a tenant by using ODC

OceanBase Database provides a GUI client named ODC. For more information about ODC, see [OceanBase Developer Center](https://en.oceanbase.com/docs/odc) documentation.

You can download ODC from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter).

The procedure for connecting to OceanBase Database by using ODC is as follows. For more information, see [Create a data source](https://en.oceanbase.com/docs/common-odc-10000000001281861).

1. Create a connection.

   ![Create a connection](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_02_deploy_oceanbase_database/07_connecting-tenants/001.png)

2. Save and open the connection.

   ![Open the connection](/img/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_02_deploy_oceanbase_database/07_connecting-tenants/002.png)

## Connect to a tenant by using a MySQL client

> **Note**
>
> This section provides only a brief introduction. For more information about how to connect to an OceanBase Database tenant by using a MySQL client, see [Connect to an OceanBase Database tenant by using the mysql client](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104074).

You can connect to a MySQL tenant of OceanBase Database by using a conventional MySQL client. Except for the username format, the connection method is basically the same as connecting to a conventional MySQL tenant. Here is an example:

```shell
mysql -h10.10.10.1 -uroot@sys#obtest -P2883 -p -c -A oceanbase
```

The output is as follows:

```shell
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 900573
Server version: 5.6.25 OceanBase_CE 4.2.1.7 (r107000162024060611-69b64b84b656a4cfa126dab60b4e66dc1bc156ca) (Built Jun 6 2024 11:51:48)

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [oceanbase]> 
```

The parameters are described as follows:

* `-h`: the IP address for connecting to OceanBase Database. The value is the IP address of an OBServer node in the case of direct connection, and is the IP address of OceanBase Database Proxy (ODP), also known as OBProxy, in the case of connection through ODP.

* `-u`: the tenant account. Two formats are supported in the case of connection through ODP: `username@tenant name#cluster name` and `cluster name:tenant name:username`. The cluster name is not required in the case of direct connection to an OBServer node. The default username of the administrator of a MySQL tenant is `root`. If only the username is specified, you will log on to the sys tenant by default.
  
  > **Note**
  >
  > If you connect to an OceanBase cluster by using ODP, you can obtain the cluster name in the following way:
  >
  > 1. Connect to OceanBase Database directly.
  >
  > 2. Execute the `SHOW PARAMETERS LIKE 'cluster';` statement to query the cluster name. In the query result, `VALUE` indicates the name of the OceanBase cluster.

* `-P`: the port for connecting to OceanBase Database. It is the value of the `mysql_port` parameter in the case of direct connection, and the value of the `listen_port` parameter in the case of connection through ODP.

* `-p`: the account password. For security reasons, we recommend that you enter the password at the prompt, where it will be masked.

* `-c`: specifies not to ignore comments in the runtime environment of MySQL.
  
  > **Note**
  >
  > Hints are special comments that are not affected by the `-c` parameter.

* `-A`: specifies not to automatically retrieve the statistical information when connecting to a database by using a MySQL client.

* `oceanbase`: the name of the database to be accessed. You can change it to the name of a business database.

## Connect to a tenant by using OBClient

> **Note**
>
> This section provides only a brief introduction. For more information about how to connect to an OceanBase Database tenant by using OBClient, see [Connect to an OceanBase Database tenant by using OBClient](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104073).

OceanBase Database provides a dedicated command-line client named OBClient. You can download it from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter). The usage method of OBClient is the same as that of the MySQL client. Here is an example:

```shell
obclient -h10.10.10.1 -uroot@test1#obtest -P2883 -p -c -A oceanbase
```

The output is as follows:

```shell
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MySQL connection id is 900551
Server version: 5.6.25 OceanBase_CE 4.2.1.7 (r107000162024060611-69b64b84b656a4cfa126dab60b4e66dc1bc156ca) (Built Jun 6 2024 11:51:48)

Copyright (c) 2000, 2018, OceanBase and/or its affiliates. All rights reserved.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

obclient [oceanbase]> 
```

The parameters are described as follows:

* `-h`: the IP address for connecting to OceanBase Database. The value is the IP address of an OBServer node in the case of direct connection, and is the IP address of ODP in the case of connection through ODP.

* `-u`: the tenant account. Two formats are supported in the case of connection through ODP: `username@tenant name#cluster name` and `cluster name:tenant name:username`. The cluster name is not required in the case of direct connection to an OBServer node. The default username of the administrator of a MySQL tenant is `root`. If only the username is specified, you will log on to the sys tenant by default.
  
  > **Note**
  >
  > If you connect to an OceanBase cluster by using ODP, you can obtain the cluster name in the following way:
  >
  > 1. Connect to OceanBase Database directly.
  >
  > 2. Execute the `SHOW PARAMETERS LIKE 'cluster';` statement to query the cluster name. In the query result, `VALUE` indicates the name of the OceanBase cluster.

* `-P`: the port for connecting to OceanBase Database. It is the value of the `mysql_port` parameter in the case of direct connection, and the value of the `listen_port` parameter in the case of connection through ODP.

* `-p`: the account password. For security reasons, we recommend that you enter the password at the prompt, where it will be masked.

* `-c`: specifies not to ignore comments in the runtime environment of OBClient.
  
  > **Note**
  >
  > Hints are special comments that are not affected by the `-c` parameter.

* `-A`: specifies not to automatically retrieve the statistical information when connecting to a database by using OBClient.

* `oceanbase`: the name of the database to be accessed. You can change it to the name of a business database.

## OceanBase connection driver (JDBC)

At present, OceanBase Database supports Java, C/C++, Python, and Go. For more information, see OceanBase Database Documentation.

### Java

* [Connect to OceanBase Database by using Spring Boot](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106147)

* [Connect to OceanBase Database by using MyBatis](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106149)
  
* [Connect to OceanBase Database by using Spring Batch](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106150)

* [Connect to OceanBase Database by using Spring Data JDBC](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106146)

* [Connect to OceanBase Database by using Spring Data JPA](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106148)

* [Connect to OceanBase Database by using Hibernate](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106151)

### C/C++

[Build a C application](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103589)

### Python

* [Connect to OceanBase Database by using mysqlclient](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106153)

* [Connect to OceanBase Database by using PyMySQL](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106152)

### Go

* [Connect to OceanBase Database by using Go-SQL-Driver/MySQL](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001133593)

* [Connect to OceanBase Database by using GORM](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001133594)
