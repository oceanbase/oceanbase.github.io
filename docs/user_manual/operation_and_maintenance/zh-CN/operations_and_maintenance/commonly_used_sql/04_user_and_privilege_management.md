---
title: 用户及权限管理
weight: 4
---

## 对象列表

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

## MySQL 模式用户列表及全局权限授权情况

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

## MySQL 模式数据库权限授权情况

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

## Oracle 模式角色授权情况

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

## Oracle 模式角色列表

```
SELECT
  *
FROM
  dba_roles
ORDER BY
  role;
```

## Oracle 模式角色授权情况

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

## Oracle 模式系统权限授权情况

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

## Oracle 模式对象权限授权情况

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