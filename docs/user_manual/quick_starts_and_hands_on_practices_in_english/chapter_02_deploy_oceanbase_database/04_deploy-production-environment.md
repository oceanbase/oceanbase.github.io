---
title: Deploy OceanBase Database in a production environment
weight: 5
---

# 2.4 Deploy OceanBase Database in a production environment

## High availability deployment solutions

OceanBase Database Community Edition uses a shared-nothing architecture with multiple replicas to ensure zero single point of failure (SPOF) and system continuity. It supports high availability and disaster recovery at the node, Internet data center (IDC), and region levels. You can deploy OceanBase Database Community Edition in a single IDC, two IDCs in the same region, three IDCs across two regions, or five IDCs across three regions.

At present, OceanBase Database provides seven high availability deployment solutions, the following four of which are supported by the Community Edition. For more information about the high availability solutions, see [HA deployment solutions for OceanBase clusters](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103376).

* Three replicas in three IDCs in the same region

* Five replicas in five IDCs across three regions

* Primary/Standby deployment of two IDCs in the same region

* Primary/Standby deployment of three IDCs across two regions

In OceanBase Database V4.1.0 and later, the Physical Standby Database solution is provided in the form of primary/standby tenants. Clusters are no longer assigned the primary or standby role and are only containers of primary and standby tenants. For more information, see [Overview](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103965).

> **Notice**
>
> OceanBase Database Community Edition does not support the arbitration service. Therefore, you cannot use high availability deployment solutions related to the arbitration service.

## Plan the deployment of an OceanBase cluster

For the requirements for deployment in a production environment, see '2.1 Preparations before deployment'. This section describes how to plan the deployment of an OceanBase cluster.

OceanBase Database runs as a cluster. In a production environment, an OceanBase cluster contains at least three servers (nodes). In other words, the business data in the cluster is available in three replicas, so the cluster is also referred to as a three-replica cluster.

In a production environment, an `observer` process runs on each server, with each server representing a node. By default, the `observer` process on each node listens on ports `2881` and `2882`. The data directory and transaction log directory are deployed on separate disks for each node. The minimum memory required to start the `observer` process is 6 GB per node. However, in a production environment, at least 16 GB of memory is required, with 32 GB recommended for optimal performance.

> **Notice**
>
> In this context, the minimum memory refers to the remaining memory shown in the `free` column of the `free -g` command output, not the total server memory listed in the `total` column.

After you deploy OceanBase Database, you need to deploy OceanBase Database Proxy (ODP), also known as OBProxy. ODP is also a single-process software solution and a reverse proxy used to access OceanBase Database. You can directly access OBServer nodes. However, we recommend that you access the OceanBase cluster through ODP.

You can deploy ODP on the application server, an independent server, or an OBServer node. You can deploy multiple ODPs. We recommend that you deploy at least two ODPs in a production environment.

## Deploy an OceanBase cluster by using OCP

The following table describes the architecture of a common OceanBase cluster deployed by using OceanBase Cloud Platform (OCP).

| Four-node environment |           Deployed components           |                              Description                              |
| ---------- | ---------------------------- | -------------------------------------------------------------- |
| Node A     | OCP and MetaDB                  | Serves as the node shared by OCP and MetaDB. We recommend that you do not mix MetaDB with the business cluster. |
| Node B     | OceanBase Database, ODP, and OCP-Agent | Serves as an OBServer node, an ODP service node, and an OCP-Agent service node.     |
| Node C     | OceanBase Database, ODP, and OCP-Agent | Serves as an OBServer node, an ODP service node, and an OCP-Agent service node.                                                         |
| Node D     | OceanBase Database, ODP, and OCP-Agent | Serves as an OBServer node, an ODP service node, and an OCP-Agent service node.                                                         |

Why is OCP recommended for deploying and managing an OceanBase cluster?

* Enterprise-grade cluster management

  OCP is an enterprise-grade management platform designed for OceanBase Database. It provides comprehensive cluster management features, such as installation, O&M, performance monitoring, configuration, upgrade, deletion, and full-lifecycle host and tenant management. It can help you improve the O&M efficiency and reduce the IT costs.

* Tenant and resource management

  OCP provides comprehensive management features for OceanBase Database tenants, including creation, topology display, performance monitoring, session management, and parameter management. It also enables resource management for OceanBase Database, covering hosts, networks, and software packages, to ensure efficient resource utilization and optimization.

* Monitoring and alerting

  OCP implements a multidimensional monitoring and alerting mechanism, which comprises the real-time monitoring and custom alerting strategies for clusters, tenants, and hosts to help detect and handle potential issues in a timely manner.

* Automatic O&M

  You can use OCP to install, upgrade, scale out, and uninstall OceanBase clusters with a few clicks. This simplifies the O&M process and reduces human errors.

* Enhanced security

  OCP provides user management and role management features for fine-grained control of database access permissions. It also supports the management of personal settings, passwords, and alert subscription.

* GUI and user experience

  OCP is built based on an object-oriented architecture to provide clear feature modules and smooth operation paths. It visually displays the topologies of clusters and tenants, along with resource usage information, enabling O&M personnel to efficiently manage database clusters in an intuitive manner.

* Cluster takeover

  OCP can take over clusters deployed by using OceanBase Deployer (OBD), OBShell, or OCP.

In summary, OCP can significantly improve the cluster management and O&M efficiency for OceanBase Database, ensuring system stability and security to better support business growth.

### Install OCP

Before installing OCP, you need to understand the following key points:
  
* What is MetaDB?

  MetaDB is a database dedicated to the storage of OCP metadata and monitoring data. At present, only OceanBase Database can serve as the MetaDB. You can deploy OceanBase Database to be serve as the MetaDB in standalone or cluster mode. You can deploy it on the same server as OCP or separately.
  
  > **Notice**
  >
  > We recommend that you do not use MetaDB as a business database in a production environment.  
  
* What are MetaDB meta tenants?

  MetaDB meta tenants include the `ocp_meta` tenant for metadata management and the `ocp_monitor` tenant for monitoring data management. You can define the tenant names.
  
  > **Notice**
  >
  > It is prohibited to use two different users in the same tenant to replace the `ocp_meta` tenant and `ocp_monitor` tenant. In other words, the `ocp_meta` tenant and `ocp_monitor` tenant must be two different tenants.  

* How to implement OCP high availability?

  To implement OCP high availability, you need to implement high availability for both the OCP service and the MetaDB. Specifically, you must deploy the OCP service on at least two nodes and the MetaDB on at least three nodes. Generally, you can use three servers to deploy a three-node OCP cluster and a three-node MetaDB cluster to implement OCP high availability.

* What are the resource requirements for an OCP server?

  Assume that no more than 10 OBServer nodes are managed in OCP. If the MetaDB and OCP are deployed on the same server, the physical server requires 17 CPU cores and 60 GB of memory. For more information about the resource requirements, see [Host planning](https://en.oceanbase.com/docs/common-ocp-10000000001484440).

  |           Module           | CPU | Memory |
  | ------------------------ | --- | ---- |
  | OCP-Server          | 4 cores   | 8 GB   |
  | sys tenant of MetaDB        | 5 cores   | 28 GB  |
  | `ocp_meta` tenant of MetaDB    | 4 cores   | 8 GB   |
  | `ocp_monitor` tenant of MetaDB | 4 cores   | 16 GB  |
  
  > **Notice**
  >
  > For other resource requirements for MetaDB deployment, see the deployment requirements of OceanBase Database.

We recommend that you deploy OCP of the latest version on the GUI. For the deployment process, see [Installation process](https://en.oceanbase.com/docs/common-ocp-10000000001483897).

### Deploy an OceanBase cluster by using OCP

Before deploying an OceanBase cluster by using OCP, you need to understand the following key points:

* Which software packages need to be uploaded for the deployment?

  Log on to the OCP console, choose **System Management** > **Packages**, and check whether the installation packages listed in the following table are present. The absence of any of these installation packages will cause the cluster deployment process to fail.

  |   Component    |                   Package name                   |              Description                             |
  | --------- | --------------------------------------- | --------------------------------------------- |
  | OCP-Agent | <ul><li>ocp-agent-ce-\*.x86_64.rpm</li><li>ocp-agent-ce-\*.aarch64.rpm</li></ul>                    | The package for deploying OCP-Agent, which is automatically uploaded after OCP is deployed. |
  | OceanBase | <ul><li>oceanbase-ce-\*.rpm</li><li>oceanbase-ce-libs-\*.rpm</li><li>oceanbase-ce-utils-\*.rpm</li></ul> | The packages for deploying the following components respectively: <ul><li>OceanBase Database</li><li>OceanBase libraries</li><li>OceanBase utilities</li></ul>  |
  | ODP   | obproxy-ce-*.rpm                        | The package for deploying ODP.  |
  
* What are the considerations for adding a host?

  * Disable the firewall and SELinux on the host node.

  * Use a static IP address for the host node.

  * Synchronize the clock source of the host node with that of the OCP node.

  * Create the credential user for the host node in advance.

  * Make sure that the deployment (credential) user of the host node has `sudo` permissions.

  * Make sure that the deployment (credential) user of the host node and OCP node has the permission to run the `clockdiff` command. If this user does not have the required permission, you can run the `setcap cap_net_raw+ep /usr/sbin/clockdiff` command as the `root` user to grant the permission.

* What are the considerations for creating a cluster?

  To customize system parameters, such as the number of system log files to retain and the size of preallocated disk space, see the **Common resource parameters of OceanBase Database and their calculation methods** section in '2.1 Preparations before deployment'.

* What are the considerations after deployment?

  * Create a user tenant for business. The default tenant `sys` has a few resources and is used only for cluster management.

  * Deploy an ODP cluster. We recommend that you deploy an ODP cluster that comprises at least two nodes. If the business volume is large, we recommend that you deploy the ODP cluster on dedicated servers.

For more information about how to deploy an OceanBase cluster, create a user tenant, and deploy an ODP cluster, see topics under [Quick Start](https://en.oceanbase.com/docs/common-ocp-10000000001483664).

## Deploy an OceanBase cluster by using OBD

OBD supports the deployment and management of multiple ecosystem components of OceanBase Database, and will incorporate more ecosystem components in later versions. Apart from GUI-based deployment to simplify automatic deployment, OBD provides general O&M capabilities such as package manager, stress test software, and cluster management.

The following table describes the architecture of a common OceanBase cluster deployed by using OBD.

| Four-node environment |           Deployed components           |                              Description                              |
| ---------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Node A     | OBD and OCP Express                   | Serves as the central control node for OBD deployment management, O&M, and monitoring services. OCP Express does not have an independent MetaDB. An OCP Express meta tenant will be created in the business cluster. |
| Node B     | OceanBase Database, ODP, and OBAgent | Serves as an OBServer node, an ODP service node, and an OBAgent service node.                                                 |
| Node C     | OceanBase Database, ODP, and OBAgent | Serves as an OBServer node, an ODP service node, and an OBAgent service node.                                                 |
| Node D     | OceanBase Database, ODP, and OBAgent | Serves as an OBServer node, an ODP service node, and an OBAgent service node.                                                 |

> **Note**
>
> The central control node of OBD does not have high requirements for the server configurations. We recommend that you configure at least four CPU cores and 8 GB of memory for it.

### Install OBD

Apart from running a script to use the all-in-one package for quick OBD deployment, you can also use an RPM package for local deployment or configure a YUM repository for online deployment.

For more information, see [Install and configure OBD](https://en.oceanbase.com/docs/community-obd-en-10000000001181584).

### Deploy an OceanBase cluster by using OBD

Before deploying an OceanBase cluster by using OBD, you need to understand the following key points:

* When do you need to choose OCP Express?
  
  OCP Express is the lightweight edition of OCP and applies to development environments, test environments, and small- and medium-scale production environments, such as a standalone or three-node OceanBase cluster. At present, OCP Express does not support the core cluster O&M and management features, such as deployment, upgrade, scaling, backup and restore, and monitoring and alerting.
  
* What are the considerations for deploying a cluster by using OBD?

  * OBD remotely performs installation and deployment by using the Secure Shell (SSH) protocol. The OCP Express service relies on `java-1.8.0-openjdk`. Therefore, you must use SSH to verify whether the Java environment is available.

  * If the node where OBD resides cannot connect to the Internet, download the desired installation packages in advance, run the `obd mirror clone *.rpm` command to add the packages to the local repository of OBD, and run the `obd mirror disable remote` command to disable all remote repositories.

For the deployment procedure, visit the following links based on the deployment method:

* GUI-based deployment: See [Deploy an OceanBase cluster on the GUI](https://en.oceanbase.com/docs/community-obd-en-10000000001181583).

* CLI-based deployment: See [Deploy OceanBase Database in a production environment by using the CLI](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001104023).

> **Note**
>
> If an error is returned when you deploy a cluster by using OBD, you can find the solution by referring to [Error codes](https://en.oceanbase.com/docs/community-obd-en-10000000001181558).

### Common OBD commands

OBD provides a wide range of commands, including the quick deployment command, cluster commands, mirror and repository commands, testing commands, tool commands, and obdiag commands. Here are some common OBD commands:

```bash
# View the repository list.
obd mirror list

# Disable remote repositories.
obd mirror disable remote

# Enable remote repositories.
obd mirror enable remote

# View the list of deployed services.
obd cluster list

# View the details of a deployed service.
obd cluster display <deploy name>

# Specify the configuration file for installing a service.
obd cluster deploy <deploy name> -c <deploy file>

# Destroy a deployed service. This operation is highly risky and will clear all data of the service.
obd cluster destroy <deploy name>

# Edit or view the deployment configuration file.
obd cluster edit-config <deploy name>

# Start, stop, or restart a service.
obd cluster start/stop/restart <deploy name>

# Start, stop, or restart a service module. You can run the obd cluster edit-config command to view the module name.
obd cluster start/stop/restart <deploy name> -c <component name>

# Start, stop, or restart the specified nodes of a service module. You can run the obd cluster edit-config command to view the module name and node IP addresses.
obd cluster start/stop/restart <deploy name> -c <component name> -s IP1,IP2

# Reload the configurations of a service. After you run the obd cluster edit-config command to modify the configurations, the CLI will prompt you to run this command to reload them.
obd cluster reload <deploy name>

# Create a standalone OceanBase cluster with the minimum specifications of two CPU cores and 6 GB of memory.
obd demo

# Deploy a service with the specified service name and ports in a demon environment.
obd demo -c oceanbase-ce --oceanbase-ce.mysql_port=3881 --oceanbase-ce.rpc_port=3882

# Create a user tenant to make full use of the remaining resources.
obd cluster tenant create <deploy name> -n <tenant name>

# Run a performance test. At present, you can run the mysqltest test, Sysbench benchmark, TPC-H benchmark, and TPC-C benchmark.
obd test mysqltest/sysbench/tpch/tpcc

# Use obdiag to inspect an OceanBase cluster.
obd obdiag check --cases=<deploy name>

# Collect the diagnostic information of the specified OceanBase cluster.
obd obdiag gather all <deploy name>

# Analyze the system logs in the specified period of the specified OceanBase cluster.
obd obdiag analyze log <deploy name> --from 2024-02-06 18:00:00 --to 2024-02-06 18:10:00

# Analyze the trace logs of the specified OceanBase cluster for end-to-end diagnostics.
obd obdiag analyze flt_trace <deploy name>

# Perform root cause analysis in the following scenarios: ODP disconnection, holding of a cluster major compaction, and lock conflict.
obd obdiag rca --scene=disconnection/major_hold/lock_conflict
```

For more information about OBD commands, see topics under [OBD Command](https://en.oceanbase.com/docs/community-obd-en-10000000001181577).

## Deploy an OceanBase cluster by using ob-operator

### Prerequisites for deployment in a production environment

Make sure that the following conditions are met:

* You have an available Kubernetes cluster with at least nine CPUs, 33 GB of memory, and 360 GB storage space.

* You have installed cert-manager in the Kubernetes cluster. For more information about how to install cert-manager, see [Installation](https://cert-manager.io/docs/installation/).

* Your Kubernetes cluster has at least one available storage class. If no storage class is available, you can install local-path-provisioner and make sure that the specified destination has sufficient storage space. It will provide the `local-path` storage class and use the local storage on cluster nodes. For more information about how to install local-path-provisioner, see [Installation](https://github.com/rancher/local-path-provisioner).

* You have deployed ob-operator. For the deployment procedure, see [Deploy](https://oceanbase.github.io/ob-operator/docs/manual/deploy-ob-operator).

### Deployment requirements

The following table describes the requirements for deployment by using ob-operator.

|    Service     |                                                  Requirement                                                   |                                                                                  Description                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ob-operator | ob-operator V2.x is required.                                                                     | We recommend that you use ob-operator of the latest version for more complete features.                                                                                                                                                      |
| OceanBase Database  | <ul><li>The OceanBase Database version must be V4.0.0 or later. A Long-Term Support (LTS) version, such as V4.2.1, is recommended. </li><li>We recommend that you deploy a three-node cluster and configure physical server resources as recommended. </li></ul> | If OceanBase Database requires 16 CPU cores and 32 GB of memory, the minimum resource configurations for the container are 16 CPU cores and 36 GB of memory. By default, 90% of the memory is allocated to OceanBase Database. |
| Kubernetes         | ob-operator has been adapted to the Calico network plug-in. To ensure that each node in a normal cluster has a unique pod IP address, use Calico as the network plug-in of Kubernetes.                                                                              | ob-operator supports pod affinity settings. We recommend that you use nodeSelector to distribute the OBServer nodes to different hosts.                                                                |

For information about how to deploy OceanBase Database by using ob-operator, see [Create a cluster](https://oceanbase.github.io/ob-operator/docs/manual/ob-operator-user-guide/cluster-management-of-ob-operator/create-cluster).
