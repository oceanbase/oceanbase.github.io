---
title: Use OBLogProxy for incremental log proxying
weight: 5
---

# 4.4 Use OBLogProxy for incremental log proxying

OBLogProxy is the incremental log proxy service of OceanBase Database. It establishes connections with OceanBase Database to read incremental logs and provides downstream services with change data capture (CDC) capabilities. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Overview

OBLogProxy supports two modes: binlog mode and CDC mode. 

* The binlog mode of OBLogProxy is designed for compatibility with MySQL binlogs. It allows you to use MySQL binlog incremental parsing tools to synchronize OceanBase Database logs in real time. Thereby, you can smoothly use MySQL binlog tools with OceanBase Database. 

* OBLogProxy in CDC mode subscribes to data changes in OceanBase Database and synchronizes these data changes to downstream services in real time for real-time or quasi-realtime data replication and synchronization. 

## Install OBLogProxy

You can install OBLogProxy by downloading the installation package or using the source code. This section describes how to install OBLogProxy by downloading the installation package. 

> **Notice**
>
> OBLogProxy occupies resources separately. We recommend that you deploy OBLogProxy and OceanBase Database separately to avoid affecting the performance of OceanBase Database. 

1. Download the installation package of OBLogProxy from [OceanBase Download Center](https://en.oceanbase.com/softwarecenter) or [GitHub](https://github.com/oceanbase/oblogproxy/releases). 

2. Run the following command to install OBLogProxy: 

   ```shell
   rpm -i oblogproxy-{version}.{arch}.rpm
   ```

   By default, OBLogProxy is installed in the `/usr/local/oblogproxy` directory. 

By default, the configuration file `conf.json` of OBLogProxy is stored in the `/conf` directory. We recommend that you do not make changes without fully understanding the parameters.

## Synchronize logs in binlog mode

The binlog mode of OBLogProxy is designed for compatibility with MySQL binlogs. It allows you to synchronize OceanBase Database logs by using MySQL binlog tools. Thereby, you can smoothly use MySQL binlog tools with OceanBase Database. 

The binlog mode of OBLogProxy provides the same features as MySQL 5.7:

* Position-based subscription. In position-based mode, the subscriber locates and reads change logs based on the binlog position, that is, the binlog file name and offset. Subscription in this mode is based on physical locations. 

* GTID-based subscription. Global transaction identifiers (GTIDs) uniquely identify and track transactions in a distributed environment. In GTID-based mode, each transaction has a unique GTID, which is immune to binlog file changes and offsets. Subscription in this mode is based on logical locations. 

### Limitations

* The binlog mode does not support the extended semantics of enum and set. For example, set supports more than 64 definitions and duplication, and enum supports the insertion of undefined data (such as `''`). 

* The binlog mode does not support varchar(65536) definitions. 

* The binlog mode does not support the gis type. 

## Synchronize logs in CDC mode

The CDC mode is used for real-time data synchronization. OBLogProxy in CDC mode subscribes to data changes in OceanBase Database (with the help of [OBLogClient](https://github.com/oceanbase/oblogclient)) and synchronizes these data changes to downstream services in real time for real-time or quasi-realtime data replication and synchronization. Synchronization in CDC mode involves the following steps:

1. After OBLogClient is started, it sends a message to OBLogProxy, specifying the username, password, database tables, incremental link timestamp, and other information about the OceanBase database to subscribe to. OBLogProxy itself is stateless, and all the subscription information is passed by OBLogClient. 

2. After receiving the request from OBLogClient, OBLogProxy authenticates the subscribed OceanBase database. If the authentication fails, it returns the reason for the failure to OBLogClient. If the authentication succeeds, OBLogProxy starts an oblogreader subprocess and passes the connection and other related information to the oblogreader subprocess at startup. 

3. The oblogreader subprocess pulls and parses clogs and sends them to the downstream in a certain data format to complete data subscription. 
