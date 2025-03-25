---
slug: tablet
title: 'What Is a Tablet in OceanBase Database V4.0? Why Is It Introduced?'
---

**OceanBase Database V4.0 introduces the concept of tablets. So, what is a tablet?**

You may have heard about this concept if you are familiar with the field of storage and databases. This concept can be traced back to the age when Google launched Bigtable. It simply refers to a part of data rows in a table, and the definition is still in use to this day. Actually, tablets can be found in the open source code as far back as OceanBase Database V0.4. Similar to Bigtable, a table in OceanBase Database V0.4 can be automatically split into multiple tablets. However, tablets were replaced with user-defined partitions in later versions of OceanBase Database, such as OceanBase Database Community Edition V3.1, for compatibility with traditional databases.

  

**Why does OceanBase Database reintroduce this concept in V4.0?**

This is because we want to distinguish partitions from tablets to improve flexibility. In OceanBase Database, partitions are a logical concept visible to users. For example, users can decide whether to use the HASH or RANGE partitioning method and the number of partitions. Unlike partitions, tablets are a physical concept. Generally, a non-partitioned table without indexes has only one partition, which corresponds to a tablet. The partition is identified by a unique ID in the table, and the tablet is identified by a unique ID in the tenant. A mapping exists between the partition ID and tablet ID to facilitate SQL routing. The mapping may be changed in some situations, for example, when partitions are exchanged. (The partition exchange feature has not been supported yet.)

  

**How do partitions and tablets map to each other?**

A partition in a table may contain one or more tablets, and the number of tablets contained is determined by the number of local indexes and whether the table contains large object (LOB) columns. A tablet is added to the partition each time a local index is created. If the table contains LOB columns, two more tablets are added.

  

**Summary**

A partition is a logic unit and is visible to users, which is the minimum unit for load balancing in OceanBase Database. Partitions mainly interact with the SQL layer. A tablet is a physical unit and is invisible to users, which is the minimum unit for compactions in OceanBase Database. Tablets mainly interact with the storage layer.