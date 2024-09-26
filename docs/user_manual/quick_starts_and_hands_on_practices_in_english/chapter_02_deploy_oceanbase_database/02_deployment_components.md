---
title: Ecosystem components for deployment
weight: 3
---

# 2.2 Ecosystem components for deployment

Generally, OceanBase Deployer (OBD), OceanBase Cloud Platform (OCP), and ob-operator are used to deploy OceanBase Database. The deployment tools apply to different scenarios.

* For enterprise users, OCP is recommended because it provides a wide range of O&M features that can facilitate O&M management in the future.

* For individual users or enterprise users with a few resources, OBD is recommended because this CLI-based tool consumes the fewest resources.

* For Kubernetes users, ob-operator is recommended because it allows the users to use OceanBase Database in line with their existing habits.

The following table compares the three deployment tools.

|        Comparison item        |       OBD        |                             OCP                              |        ob-operator        |
| ---------------------- | ---------------- | ------------------------------------------------------------ | ------------------------- |
| Supported OceanBase Database versions         | V3.1.x and V4.x     | V3.1.x and V4.x                                                 | V4.x           |
| Online/Offline deployment          | Both supported           | Only offline deployment supported                                               | Both supported            |
| Compiled installation packages | Supported             | Supported                                                       | Supported                    |
| High availability<blockquote>**Note**<br></br>This refers to the high availability of the tool itself, not the high availability of the deployed OceanBase cluster. </blockquote>         | Not supported           | Supported                                                         | Supported (based on Kubernetes)          |
| Standalone and multi-node deployment | Supported             | Not supported                                                       | Supported                      |
| Security                 | Depending on operating system permissions | High (A user role-based permission isolation mechanism is provided to ensure resource security.) | Depending on the permission system of Kubernetes          |
| Ecosystem integration method               | Open source code        | Open APIs                                                     | Open source code                  |
| Difficulty of getting started                | Low               | Medium                                                           | Depending on the familiarity with the Kubernetes environment |
| Resource consumption                   | Low             | High                                                           | Medium                        |

The following table describes the feature support of the tools.

> **Note**
>
> The feature support information in the following table is provided based on OBD V2.8.0, OCP V4.3.0, and ob-operator V2.2.0 (Dashboard V0.3.0). The feature support may vary across versions. To obtain accurate feature support information, see the official documentation for the specific version of the tool you are using.

|   Feature   |          OBD           | OCP  | ob-operator |
| -------------- | ---------------------- | ---- | ----------- |
| Tenant creation       | Supported                   | Supported | Supported        |
| Tenant viewing       | Supported                   | Supported | Supported        |
| Database management     | Not supported                 | Supported | Not supported      |
| User permission management   | Not supported                 | Supported | Not supported      |
| Resource management      | Not supported                 | Supported | Supported      |
| Resource isolation       | Not supported                 | Supported | Not supported      |
| Major compaction management       | Not supported                 | Supported | Not supported      |
| Backup and restore       | Not supported                 | Supported | Supported        |
| Monitoring and alerting       | Monitoring is supported but alerting is not.     | Supported | Supported        |
| Scaling         | Scale-out is supported but scale-in is not.   | Supported | Supported        |
| TopSQL and SlowSQL | Not supported                 | Supported | Not supported      |
| Transaction diagnostics       | Not supported                 | Supported | Not supported      |
| Deadlock diagnostics       | Not supported                 | Supported | Not supported      |
| Session management       | Not supported                 | Supported | Not supported      |
| Primary and standby databases         | Supported                   | Supported | Supported        |

You can select an appropriate tool to deploy OceanBase Database as needed based on the comparison results in the preceding tables.
