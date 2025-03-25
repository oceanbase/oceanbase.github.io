---
slug: flashback-query
title: 'Practice of Flashback Queries in OceanBase Database'
---

 Misoperations such as deleting data by mistake are common in the daily work of database administrators (DBAs). To help them address these issues, we need to know how to restore data.

 OceanBase Database supports record-specific flashback queries, which allow you to obtain data of a specific historical version. Let's have a look at how to use this feature in advance when it might be needed unexpectedly.

 In a flashback query, `undo_retention` is used to specify the time range of data versions to be retained in minor compactions. When `undo_retention` is set to `0`, multi-version minor compaction is disabled, which indicates that only the latest version of row data is retained in the minor compaction file. When `undo_retention` is set to a value greater than 0, multi-version minor compaction is enabled, and multiple versions of row data within the specified period in seconds are retained in the minor compaction file. To recover accidentally deleted data, you can first increase the value of `undo_retention` and set `undo_retention` to the default value after data is restored.

Default value:

1800, in seconds

Value range:

\[0, 4294967295\]

## 1. Preparations

Change the value of `undo_retention` and enable the recycle bin.

```
    #Change the value of undo_retention.
    obclient [test]> ALTER SYSTEM SET undo_retention=1800;
    Query OK, 0 rows affected (0.004 sec)
    
    obclient [test]> SHOW PARAMETERS LIKE 'undo_retention';
    +-------+----------+-----------------+----------+----------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+--------+---------+-------------------+---------------+-----------+
    | zone  | svr_type | svr_ip          | svr_port | name           | data_type | value | info                                                                                                                                                                           | section | scope  | source  | edit_level        | default_value | isdefault |
    +-------+----------+-----------------+----------+----------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+--------+---------+-------------------+---------------+-----------+
    | zone1 | observer | 192.168.150.116 |     2882 | undo_retention | INT       | 1800  | the low threshold value of undo retention. The system retains undo for at least the time specified in this config when active txn protection is banned. Range: [0, 4294967295] | TENANT  | TENANT | DEFAULT | DYNAMIC_EFFECTIVE | 1800          |         1 |
    +-------+----------+-----------------+----------+----------------+-----------+-------+--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+---------+--------+---------+-------------------+---------------+-----------+
    1 row in set (0.004 sec)
    
    # Enable the recycle bin and log in again to reconnect to the database.
    bclient [test]> SET GLOBAL recyclebin = on;
    Query OK, 0 rows affected (0.002 sec)
    
    obclient [test]> SHOW VARIABLES LIKE 'recyclebin';
    +---------------+-------+
    | Variable_name | Value |
    +---------------+-------+
    | recyclebin    | ON    |
    +---------------+-------+
    1 row in set (0.001 sec)
```

## 2. Flash Back to the State Before a DML Operation

### 2.1 Create a table and prepare the required data
```
    obclient [test]> create table banjin_flash (id int ,name varchar(10),dizhi varchar(10),primary key (id));
    insert into banjin_flash values (1,'zhangsan','Beijing');
    insert into banjin_flash values (2,'lisi','Shanghai');
    insert into banjin_flash values (3,'wangwu','Tianjin');
    Query OK, 0 rows affected (0.050 sec)
    
    obclient [test]> insert into banjin_flash values (1,'zhangsan','Beijing');
    Query OK, 1 row affected (0.008 sec)
    
    obclient [test]> insert into banjin_flash values (2,'lisi','Shanghai');
    Query OK, 1 row affected (0.001 sec)
    
    obclient [test]> insert into banjin_flash values (3,'wangwu','Tianjin');
    Query OK, 1 row affected (0.001 sec)
    
    obclient [test]> insert into banjin_flash values (4,'zhaoliu','Hebei');
    Query OK, 1 row affected (0.001 sec)
```

### 2.2 Modify the table

Modify the table and record the current date and time returned by the NOW() function to facilitate subsequent data restoration.
```
    obclient [test]> select now();
    +---------------------+
    | now()               |
    +---------------------+
    | 2024-10-20 17:31:13 |
    +---------------------+
    1 row in set (0.000 sec)
    
    obclient [test]> update banjin_flash set dizhi = 'Hunan' where name='lisi';
    Query OK, 1 row affected (0.003 sec)
    Rows matched: 1  Changed: 1  Warnings: 0
    
    obclient [test]> select now();
    +---------------------+
    | now()               |
    +---------------------+
    | 2024-10-20 17:31:30 |
    +---------------------+
    1 row in set (0.000 sec)
    
    obclient [test]> delete from banjin_flash;
    Query OK, 4 rows affected (0.002 sec)
    
    obclient [test]> select now();
    +---------------------+
    | now()               |
    +---------------------+
    | 2024-10-20 17:31:52 |
    +---------------------+
    1 row in set (0.000 sec)
```

### 2.3 Flash back data

```
    obclient [test]> select * from banjin_flash;
    Empty set (0.001 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:31:30') * 1000;
    +----+----------+--------+
    | id | name     | dizhi  |
    +----+----------+--------+
    |  1 | zhangsan | Beijing   |
    |  2 | lisi     | Hunan   |
    |  3 | wangwu   | Tianjin   |
    |  4 | zhaoliu  | Hebei   |
    +----+----------+--------+
    4 rows in set (0.000 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:31:13') * 1000;
    +----+----------+--------+
    | id | name     | dizhi  |
    +----+----------+--------+
    |  1 | zhangsan | Beijing   |
    |  2 | lisi     | Shanghai   |
    |  3 | wangwu   | Tianjin   |
    |  4 | zhaoliu  | Hebei   |
    +----+----------+--------+
    4 rows in set (0.000 sec)
```

In the results of the preceding two flashback queries, data at different points in time is returned: the data before the deletion is returned for the first query, and the data before the update is returned for the second query.

You can insert the restored data into the backup table for subsequent operations.

## 3. Flash Back to the State Before a DDL Operation

### 3.1 Flash back the table to the state before an ADD COLUMN operation
```
    obclient [test]> alter table banjin_flash add column dianhua decimal(11) default 1;
    Query OK, 0 rows affected (0.038 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:44:43') * 1000;
    +----+----------+--------+---------+
    | id | name     | dizhi  | dianhua |
    +----+----------+--------+---------+
    |  1 | zhangsan | Beijing   |       1 |
    |  2 | lisi     | Hunan   |       1 |
    |  3 | wangwu   | Tianjin   |       1 |
    |  4 | zhaoliu  | Hebei   |       1 |
    +----+----------+--------+---------+
    4 rows in set (0.002 sec)
    
    obclient [test]> alter table banjin_flash add column dianhua1 decimal(11) ;
    Query OK, 0 rows affected (0.034 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:44:43') * 1000;
    +----+----------+--------+---------+----------+
    | id | name     | dizhi  | dianhua | dianhua1 |
    +----+----------+--------+---------+----------+
    |  1 | zhangsan | Beijing   |       1 |     NULL |
    |  2 | lisi     | Hunan   |       1 |     NULL |
    |  3 | wangwu   | Tianjin   |       1 |     NULL |
    |  4 | zhaoliu  | Hebei   |       1 |     NULL |
    +----+----------+--------+---------+----------+
    4 rows in set (0.001 sec)
```

In the preceding flashback query result, the default value is used in the added columns. If no default value is available, NULL is used.

### 3.2 Restore the table to the state before a DROP COLUMN operation

```    
    obclient [test]>  alter table banjin_flash drop column dianhua1;
    Query OK, 0 rows affected (0.251 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:44:43') * 1000;
    ERROR 1412 (HY000): Unable to read data -- Table definition has changed
``` 

The table cannot be restored after a column is dropped. The following error is returned in this case: ERROR 1412 (HY000): Unable to read data -- Table definition has changed.

### 3.3 Flash back the table to the state before a DROP TABLE operation
```
    obclient [test]> drop table banjin_flash;
    Query OK, 0 rows affected (0.022 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:51:30') * 1000;
    ERROR 1146 (42S02): Table 'test.banjin_flash' doesn't exist
```

If the table is dropped, it cannot be directly restored. An error is returned, indicating that the table does not exist.

In this case, restore the table from the recycle bin and perform a flashback query again.
```
    obclient [test]> select * from banjin_flash;
    Empty set (0.001 sec)
    
    obclient [test]> show recyclebin;
    +--------------------------------+---------------+-------+----------------------------+
    | OBJECT_NAME                    | ORIGINAL_NAME | TYPE  | CREATETIME                 |
    +--------------------------------+---------------+-------+----------------------------+
    | __recycle_$_1_1729417897979024 | banjin_flash  | TABLE | 2024-10-20 17:51:37.978166 |
    +--------------------------------+---------------+-------+----------------------------+
    1 row in set (0.002 sec)
    
    obclient [test]> FLASHBACK TABLE __recycle_$_1_1729417897979024 TO BEFORE DROP;
    Query OK, 0 rows affected (0.033 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:51:30') * 1000;
    +----+----------+--------+
    | id | name     | dizhi  |
    +----+----------+--------+
    |  1 | zhangsan | Beijing   |
    |  2 | lisi     | Shanghai   |
    |  3 | wangwu   | Tianjin   |
    |  4 | zhaoliu  | Hebei   |
    +----+----------+--------+
    4 rows in set (0.008 sec)
```

## 4. Flash Back to the State Before a TRUNCATE Operation

TRUNCATE is a special DDL operation, for which the flashback feature needs to be described separately.
```
    obclient [test]> insert into banjin_flash values (1,'zhangsan','Beijing');
    Query OK, 1 row affected (0.007 sec)
    
    obclient [test]> insert into banjin_flash values (2,'lisi','Shanghai');
    Query OK, 1 row affected (0.001 sec)
    
    obclient [test]> insert into banjin_flash values (3,'wangwu','Tianjin');
    Query OK, 1 row affected (0.001 sec)
    
    obclient [test]> insert into banjin_flash values (4,'zhaoliu','Hebei');
    Query OK, 1 row affected (0.001 sec)
    
    obclient [test]> 
    obclient [test]> select now();
    +---------------------+
    | now()               |
    +---------------------+
    | 2024-10-20 18:42:47 |
    +---------------------+
    1 row in set (0.000 sec)
    
    obclient [test]> update banjin_flash set dizhi = 'Hunan' where name='lisi';
    Query OK, 1 row affected (0.002 sec)
    Rows matched: 1  Changed: 1  Warnings: 0
    
    obclient [test]> select now();
    +---------------------+
    | now()               |
    +---------------------+
    | 2024-10-20 18:42:48 |
    +---------------------+
    1 row in set (0.000 sec)
    
    obclient [test]> truncate table banjin_flash;
    Query OK, 0 rows affected (0.040 sec)
    
    obclient [test]> SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 18:42:47') * 1000;
    ERROR 1412 (HY000): Unable to read data -- Table definition has changed
```

"ERROR 1412 (HY000): Unable to read data -- Table definition has changed" is reported when you flash back the table to the state before it was truncated.

The definition and procedure of a TRUNCATE operation are as follows according to the OceanBase Database official website:

To execute the `TRUNCATE TABLE` statement, you must have the `DROP` privilege on the table. It is a DDL statement.

`TRUNCATE TABLE` and `DELETE FROM` have the following differences:

*   **A TRUNCATE operation drops a table and creates it again.** It is much faster than deleting data row by row, especially for large tables.
*   The output of `TRUNCATE TABLE` always indicates that 0 rows were affected.
*   When you use `TRUNCATE TABLE`, the table management program does not record the last `AUTO_INCREMENT` value, but resets it to zero.
*   The `TRUNCATE TABLE` statement cannot be executed during transactions or when the table is locked. Otherwise, an error is returned.
*   If the table definition file is valid, you can use the `TRUNCATE TABLE` statement to recreate the table as an empty table, even if the data or indexes are corrupted.

Although the table is dropped before recreation, the dropped table is not moved to the recycle bin. Proceed with caution.
```
    obclient [test]> TRUNCATE TABLE BANJIN_FLASH;
    Query OK, 0 rows affected (0.042 sec)
    
    obclient [test]> show recyclebin;
    Empty set (0.002 sec)
```

## 5. Command Summary
```
    # Modify the value of undo_retention.
    ALTER SYSTEM SET undo_retention=1800;
    
    # View the undo_retention parameter.
    SHOW PARAMETERS LIKE 'undo_retention';
    
    # Enable the recycle bin.
    bclient [test]> SET GLOBAL recyclebin = on;
    
    # View the recycle bin status.
    SHOW VARIABLES LIKE 'recyclebin';
    
    # Perform a flashback query.
    SELECT * FROM banjin_flash AS OF SNAPSHOT time_to_usec('2024-10-20 17:31:13') * 1000;
    # Alternatively, use the following two statements together.
    SELECT time_to_usec('2024-10-20 06:42:40') * 1000;
    SELECT * FROM banjin_flash AS OF SNAPSHOT 1729377760000000000;
    
    # View the recycle bin.
    show recyclebin;
    
    # Restore a dropped table from the recycle bin.
    FLASHBACK TABLE __recycle_$_1_1729417897979024 TO BEFORE DROP;
    
    # Table and data
    create table banjin_flash (id int ,name varchar(10),dizhi varchar(10),primary key (id));
    insert into banjin_flash values (1,'zhangsan','Beijing');
    insert into banjin_flash values (2,'lisi','Shanghai');
    insert into banjin_flash values (3,'wangwu','Tianjin');
    insert into banjin_flash values (4,'zhaoliu','Hebei');
    
    #Data operations
    select now();
    update banjin_flash set dizhi = 'Hunan' where name='lisi';
    select now();
    delete from banjin_flash;
    select now();
    
    alter table banjin_flash add column dianhua decimal(11) default 1;
    
    alter table banjin_flash drop column dianhua;
```