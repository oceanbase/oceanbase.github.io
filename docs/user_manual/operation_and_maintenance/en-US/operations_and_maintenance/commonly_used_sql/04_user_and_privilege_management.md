---
title: User and Privilege Management
weight: 4
---

## Query Objects

```
SELECT
  object_type,
  object_name,
  owner AS schema_name
FROM
  dba_objects
WHERE
  object_type IN ('TABLE', 'VIEW', 'PROCEDURE')
  AND owner NOT IN ('SYS', 'oceanbase');
```

## Query Users and the Authorization of Global Privileges in MySQL Mode

```
SELECT
  `user`,
  `account_locked`,
  `select_priv`,
  `insert_priv`,
  `update_priv`,
  `delete_priv`,
  `create_priv`,
  `drop_priv`,
  `process_priv`,
  `grant_priv`,
  `index_priv`,
  `alter_priv`,
  `show_db_priv`,
  `super_priv`,
  `create_view_priv`,
  `show_view_priv`,
  `create_user_priv`,
  `password`
FROM
  `mysql`.`user`;
```

## Query the Authorization of Database Privileges in MySQL Mode

```
SELECT
  `db`,
  `user`,
  `select_priv`,
  `insert_priv`,
  `update_priv`,
  `delete_priv`,
  `create_priv`,
  `drop_priv`,
  `index_priv`,
  `alter_priv`,
  `create_view_priv`,
  `show_view_priv`
FROM
  `mysql`.`db`;
```

## Query the Authorization of Roles in Oracle Mode

```
SELECT
  *
FROM
  dba_role_privs
WHERE
  grantee = 'SYS'
ORDER BY
  grantee,
  granted_role;
```

```
SELECT
  *
FROM
  dba_role_privs
WHERE
  granted_role = 'SYS'
  AND grantee IN (
    SELECT
      username
    FROM
      dba_users
  )
ORDER BY
  grantee,
  granted_role;
```

```
SELECT
  *
FROM
  dba_role_privs
WHERE
  granted_role = 'SYS'
  AND grantee IN (
    SELECT
      role
    FROM
      dba_roles
  )
ORDER BY
  grantee,
  granted_role;
```

## Query Roles in Oracle Mode

```
SELECT
  *
FROM
  dba_roles
ORDER BY
  role;
```


## Query the Authorization of System Privileges in Oracle Mode

```
SELECT
  *
FROM
  dba_sys_privs
WHERE
  grantee = 'SYS'
ORDER BY
  grantee,
  privilege;
```

## Query the Authorization of Object Privileges in Oracle Mode

```
SELECT
  p.grantee,
  p.owner,
  o.object_type,
  o.object_name,
  p.privilege
FROM
  dba_tab_privs p
  JOIN dba_objects o ON p.owner = o.owner
  AND p.table_name = o.object_name
WHERE
  p.grantee = 'SYS'
ORDER BY
  p.grantee,
  p.owner,
  o.object_type,
  o.object_name,
  p.privilege;
```