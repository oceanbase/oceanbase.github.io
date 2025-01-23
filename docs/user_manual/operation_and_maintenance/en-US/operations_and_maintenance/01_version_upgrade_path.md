---
title: Version Upgrade Path
weight: 1
---
## Background Information
This topic is provided based on a suggestion from the user Huangfu Hou on the OceanBase community forum. The user hopes that we can introduce the version upgrade path of OceanBase Database. In this topic, we will summarize and share the basic knowledge of OceanBase Database version upgrades, hoping it will be helpful to you.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/001.png)

If you have other requirements for the O&M of OceanBase Database, leave a comment on our post in the [OceanBase community](https://ask.oceanbase.com/t/topic/35610431). We will continue to improve this tutorial based on your opinions and suggestions.


## Product Version Number
Before we talk about the upgrade path, we will briefly introduce the product version numbers of OceanBase Database. A product version number represents the version of OBServer nodes, and it is incremented with each release.

+ The first digit of a version number represents the architecture level and is incremented only when the architecture is modified. As of September 5, 2024, the first digit of the latest version number is 4.
+ The second and third digits of a version number are incremented when major features of different levels are added.
+ The fourth digit of a version number represents the version of the bundle patch (BP), which is regularly released after a batch of bugfixes are bundled and packaged in each branch version.

Note that when the first three digits of two version numbers are the same, a larger fourth digit indicates a later version. However, this rule does not take effect when the first three digits of the two version numbers are different. To check whether specific bugfixes exist, you must view the product topology.

Some product version numbers may have one of the following suffixes:

+ CE: indicates Community Edition.
+ LTS: indicates Long-Term Support Edition. This edition provides long-term support to fix bugs that affect service stability.
+ HF: indicates HotFix Edition. This edition provides key bugfixes to resolve specific intractable issues.
+ GA: indicates General Availability Edition. This edition is secure and reliable, and therefore can be used for extensive deployment and daily operations in the production environment. For example, OceanBase Database V4.3.1 is of General Availability Edition. For more information, see [Official website](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001783557).

In the following figure, 4.2.1_BP8(LTS) indicates OceanBase Database V4.2.1 of Long-Term Support Edition in which eight BPs are released.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/002.png)

## Barrier Version
What is a barrier version? Let me start with my personal experience. I once downloaded OceanBase Database V4.2.3.1 and wanted to upgrade a test cluster from OceanBase Database V4.1.0.1 to this version by using OceanBase Cloud Platform (OCP). The test cluster supports only downtime upgrade because it is a single-replica cluster deployed on a single machine.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/003.png)

I thought the upgrade process would be simple, but OCP prompted me to upload an additional barrier version. That is, I must download the binary files of both OceanBase Database V4.2.1.2 and V4.2.3.1, and provide the files to OCP.

OCP directly upgraded the cluster to V4.2.3.1 after I followed the prompt, without requiring any additional manual operations.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/005.png)

The following content introduces the concept and purpose of a barrier version.

OceanBase Database supports rolling upgrade between many versions. During the rolling upgrade of a cluster, OBServer nodes of the source version are replaced with those of the target version in sequence. In this case, the database can provide services without downtime as long as the available OBServer nodes form the majority. OBServer nodes that have been upgraded still need to run as nodes of the source version until all the nodes in the cluster are upgraded. Therefore, the code of the source version must be retained in the target version, even if features of the source version are deprecated. This ensures that the cluster can be upgraded without downtime.

To reduce the cost of maintaining code compatibility between source and target versions, we recommend that you do not directly upgrade OceanBase Database from a much earlier version to the latest version. OceanBase Database uses barrier versions to resolve this issue. A barrier version must be passed through when you upgrade from a specific earlier version to a later version. Versions prior to a barrier version must first be upgraded to the barrier version, and only then can they be upgraded to a version later than the barrier version. This way, you do not need to worry about the issue of code compatibility between the latest version and versions prior to the closest barrier version.

If you find the explanation above difficult to understand, that's okay. Let me further introduce this concept based on the two figures below.

As shown in the first figure, there are five versions: A, B, C, D, and E, with C being the barrier version. You can directly upgrade OceanBase Database from A or B to C, or from C to D or E. However, you cannot directly upgrade OceanBase Database from A or B to D or E. To do this, you must upgrade it to C first.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/006.png)

Note that a version may be the barrier version for some versions but not for others.

The second figure shows four versions: A, B, C, and D, with C being the barrier version for A but not for B. To upgrade OceanBase Database from A to D, you must first upgrade it to C. However, you can directly upgrade OceanBase Database from B to D because C is not the barrier version for B.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/007.png)

Passing through the barrier version during the upgrade does not require node shutdown, but simply means that the cluster must first be upgraded to the barrier version and then to the target version.

## Upgrade Topology
This section describes the upgrade topology. The upgrade topology is defined by using the [oceanbase_upgrade_dep.yml](https://github.com/oceanbase/oceanbase/blob/develop/tools/upgrade/oceanbase_upgrade_dep.yml) file.

This file is stored in the installation directory, and its content may vary based on the version. Since the file path for compilation-based installation is different from that for installation using OCP, you need to find the path in the target version package by yourself.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/008.png)

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/009.png)

The upgrade topology consists of the following parameters:

+ `version`: the source version or a transition version during the upgrade.
+ `can_be_upgraded_to`: the target version to which the current version can be directly upgraded.
+ `deprecated`: indicates whether the current version is deprecated. Default value: `False`. The value `True` indicates that the current version has been deprecated and can serve as the source version or a transition version of the upgrade. We recommend that you do not specify a deprecated version as the target version of the upgrade.
+ `require_from_binary`: indicates whether the current version is a barrier version. Default value: `False`. 
+ `when_come_from`: the list of source versions for which the current version serves as the barrier version. This parameter is used together with the `require_from_binary` parameter.

![image.png](/img/user_manual/operation_and_maintenance/en-US/operations_and_maintenance/01_version_upgrade_path/010.png)

The preceding figure provides an example of upgrade topology, which is simplified and only for reference. The actual upgrade topology in the `oceanbase_upgrade_dep.yml` file is usually more complex.

In this example, the following four versions are available: V4.0.0.0, V4.0.0.1, V4.1.0.0, and V4.2.0.0. The setting `when_come_from: [4.0.0.0]` indicates that V4.1.0.0 is the barrier version for V4.0.0.0.

However, the value of the `when_come_from` parameter does not contain `4.0.0.1`, which indicates that you can directly upgrade from V4.0.0.1 to V4.2.0.0. V4.1.0.0 does not serve as the barrier version for V4.0.0.1.

In summary, you can regard the upgrade topology as a directed acyclic graph that displays the entire upgrade process. Unless a barrier version is specified for the source version, you can directly upgrade from the source version to the target version.

## What's More
Some users have commented on our post in the [OceanBase community forum](https://ask.oceanbase.com/t/topic/35611595/15), requesting a tool that can directly provide the upgrade path once the source and target versions are specified. This feature may be available in [obdiag](https://github.com/oceanbase/obdiag/issues/428). Stay tuned.
