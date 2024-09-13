---
title: 备份恢复
weight: 5
---

## 日志备份状态查询

`root@sys` 登陆查询，

```
SELECT
  *
FROM
  (
    SELECT
      incarnation,
      round_id AS log_archive_round,
      tenant_id,
      path AS backup_dest,
      if(start_scn_display != '', start_scn_display, NULL) AS min_first_time,
      if(
        checkpoint_scn_display != '',
        checkpoint_scn_display,
        NULL
      ) AS max_next_time,
      status,
      if(
        checkpoint_scn != '',
        truncate(
          (time_to_usec(now()) - checkpoint_scn / 1000) / 1000000,
          4
        ),
        NULL
      ) AS delay,
      now(6) AS check_time
    FROM
      cdb_ob_archivelog_summary
      right JOIN (
        SELECT
          tenant_id AS _tenant_id,
          MAX(round_id) AS _round_id
        FROM
          cdb_ob_archivelog_summary
        GROUP BY
          _tenant_id
      ) AS t ON tenant_id = t._tenant_id
      AND round_id = t._round_id
  )
limit
  0, 100;
```

## 全量备份状态查询

`root@sys` 登陆查询，

```
SELECT
  *
FROM
  (
    SELECT
      job_id,
      incarnation,
      tenant_id,
      backup_set_id,
      backup_type,
      path AS backup_dest,
      start_timestamp AS start_time,
      end_timestamp AS end_time,
      now(6) AS check_time,
      status,
      comment,
      description,
      'TENANT' AS backup_level
    FROM
      (
        SELECT
          job_id,
          incarnation,
          tenant_id,
          backup_set_id,
          backup_type,
          path,
          start_timestamp,
          NULL AS end_timestamp,
          status,
          comment,
          description
        FROM
          cdb_ob_backup_jobs
        UNION
        SELECT
          job_id,
          incarnation,
          tenant_id,
          backup_set_id,
          backup_type,
          path,
          start_timestamp,
          end_timestamp,
          status,
          comment,
          description
        FROM
          cdb_ob_backup_job_history
      )
    WHERE
      tenant_id != 1
    ORDER BY
      start_time DESC
  );
```