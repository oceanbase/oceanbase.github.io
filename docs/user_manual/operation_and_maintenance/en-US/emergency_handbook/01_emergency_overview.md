---
title: Overview
weight: 1
---

We have been updating *OceanBase Advanced Tutorial for DBAs* for some time, and now it's time to talk about troubleshooting.

Some relevant documents are already available for your reference, such as the blog [Quick Fixes for OceanBase Issues](https://open.oceanbase.com/blog/13250502949) written by an OceanBase engineer and the [Emergency response](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714619) chapter in the official documentation of OceanBase Database.

However, the scenarios and solutions provided in these documents are not systematic or intuitive enough for users of OceanBase Database Community Edition.

Additionally, considering suggestions from community users such as @oceanvoice and @Zhang Yuqi, we will provide a more systematic and comprehensive troubleshooting manual in this advanced tutorial.

The manual will summarize issues that may occur when you use OceanBase Database and provide corresponding solutions. **<font color="red">While these issues may not be common, they can have a serious impact and require database administrators (DBAs) to conduct preliminary analysis and take immediate corrective measures.</font>** The contents are likely to be as follows:

* Overview

* Slow response

* High CPU load

* Node failures

* Hardware and infrastructure exceptions

  * Network jitter

  * Disk issues

* Exceptions caused by load changes

  * Full log/data disk

* ...



The following figure shows the troubleshooting mind map of OceanBase Database.

![image](/img/user_manual/operation_and_maintenance/en-US/emergency_handbook/01_emergency_overview/001.png)


## What's More

This topic provides only an overview of the troubleshooting manual and does not contain much in-depth content, for which we apologize. To make up for this, we provide the following **<font color="red">common method for quick recovery in the event of serious OceanBase faults, especially when services are interrupted</font>**. Briefly speaking, you can take the following steps:

- If only one tenant is faulty in a cluster, execute the `ALTER TENANT [SET] PRIMARY_ZONE` statement to change the primary zone of the tenant for leader switchover.

- If only one node is faulty in a cluster, stop or isolate the node.

- If all nodes are faulty in a cluster, restart the nodes one by one.

- If issues persist after all nodes are restarted in the cluster, perform a failover to switch the standby cluster to the primary role.

- Always analyze faults only after they have been handled and the service has been recovered.


## Coming Soon

If you encounter cluster issues that are not covered in this manual, you need to contact engineers on duty in the OceanBase community forum to obtain technical support in most cases. As O&M staff, you do not need to further understand the issues. Therefore, these issues are assigned lower priorities. After the advanced tutorial is completed, we will add relevant content in the "Official Selection" module of the OceanBase community forum.

  * sys tenant or RootService exceptions

  * Memory leak

  * Disk space leak

  * Long-running transaction

  * Suspended transaction

  * Core dump

  * ...


## References

- [Quick Fixes for OceanBase Issues](https://open.oceanbase.com/blog/13250502949)

- [Emergency response](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714619)