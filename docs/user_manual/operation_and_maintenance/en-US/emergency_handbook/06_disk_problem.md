---
title: Disk Issues
weight: 6
---

## Business and Database Symptoms

The database is not putting pressure on disk I/O, but the io_await value remains high.

> io_await indicates the average amount of time an I/O request waits in a queue to be processed, which reflects the I/O processing efficiency. If the io_await value is small, the I/O queue is not congested.
>
> When the io_await value approaches the svctm value, waiting in the I/O queue is almost not required. The svctm metric reflects disk performance, which is usually lower than 20 ms.

## Troubleshooting Approach

OceanBase Cloud Platform (OCP) provides two io_await monitoring metrics: [os_tsar_nvme_ioawait](https://en.oceanbase.com/docs/common-ocp-10000000001899727) and [os_tsar_sda_ioawait](https://en.oceanbase.com/docs/common-ocp-10000000001899731). If the value of any metric is abnormal, OCP reports an alert by default.

![image](/img/user_manual/operation_and_maintenance/en-US/emergency_handbook/06_disk_problem/1.png)

- If the amount of business traffic is small and no other processes consume the disk I/O, the issue is due to data migration, replication, and major compaction. The common solution to this issue is to downgrade some tasks with high I/O load.

- If no such tasks exist, check whether the disk itself is faulty. In most cases, if an exception such as a disk recognition failure occurs, OCP reports an alert indicating that the OBServer node is unavailable, rather than an alert relevant to io_await.

## Troubleshoot Disk Faults

The troubleshooting procedure for disk faults is similar to that for node failures or network jitter.

To put it simply, if faulty disks are the minority, you can troubleshoot the issue as follows:

- Rely on the high-availability mechanism of OceanBase Database to implement self-healing.

- General disk faults cannot be fixed in a short period of time. You need to put new hosts online for the cluster.

- Switch back to the original primary zone during off-peak hours for the tenant.

It is rare for disk faults to occur on all the nodes where the majority of replicas reside. If you encounter this issue, switch to the standby cluster.


## Troubleshoot High Disk I/O

High disk I/O usually occurs due to major compactions, also known as daily compactions. You can check in OCP to see if the system is running a major compaction.

![image](/img/user_manual/operation_and_maintenance/en-US/emergency_handbook/06_disk_problem/2.png)

If so, you can suspend the major compaction and then resume it during off-peak hours.
```
-- Suspend the running major compaction.
ALTER SYSTEM SUSPEND MERGE [ZONE [=] 'zone'];

-- Resume the major compaction.
ALTER SYSTEM RESUME MERGE [ZONE [=] 'zone'];
```

Other causes, such as data import/export and backup, are rarely seen. For more information, see [Node disk I/O high](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001717376). However, the descriptions of parameter definitions and modifications in the reference topic may contain errors. We recommend that you visit the official website to learn about a parameter before you modify it.

We recommend that you do not manually modify parameters to limit the resources for major and minor compactions, as these parameters do not have recommended values, and your modifications may not have a positive effect. You can adjust the daily compaction time to avoid overlapping business peak hours, which may be an optimal method.