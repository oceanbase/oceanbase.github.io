---
title: Background Knowledge of the SQL Engine
weight: 2
---

> In the process of collecting suggestions for this advanced tutorial, many users hope to learn more about the background knowledge and the implementation principles of key technologies. Therefore, this topic is added here to brief the SQL engine of OceanBase Database.

## Overview of the SQL Engine
After a query is initiated in OceanBase Database:

- It first enters into the parser/resolver, a module where the kernel figures out the purpose and requirement of the query.

- Then, the query enters into the optimizer, which will select the best among a variety of implementation methods for the executor.

- The executor contains all details for executing the selected method. It will faithfully execute the query based on the plan recommended by the optimizer and return the result to the user.


The following figure shows the overall framework of the SQL engine of OceanBase Database.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/02_background_knowledge/001.png)


The preceding figure compares the features of the optimizer and executor in a business trip. The optimizer will enumerate all plans of traveling to the destination, evaluate the costs of these plans, and select the best one. Then, the executor will execute the selected plan.

As shown in the figure, the SQL engine involves a lot of content. However, you only need to delve into a few of the content.

## Basic Knowledge

OceanBase Database users need to know the basic knowledge about the SQL engine, which is only a very small proportion of all related knowledge.

After understanding the basic knowledge, you can spend less time troubleshooting.

### Optimizer
**<font color="red">You need to understand the following basic knowledge about the optimizer:</font>**
- **<font color="red">Statistics and plan cache</font>**
- **<font color="red">Execution plan reading and management</font>**
- **<font color="red">Common SQL tuning methods</font>**
- **<font color="red">Typical scenarios and general troubleshooting logic for SQL performance issues</font>**

### Executor
**<font color="red">You need to understand the following basic knowledge about the executor:</font>**
- **<font color="red">Parallel execution</font>**
- **<font color="red">Tools for analyzing SQL performance issues</font>**

### Others
**<font color="red">You need to understand the following basic knowledge related to analytical processing (AP):</font>**
- **<font color="red">Columnar storage</font>**

## Advanced Knowledge

During the communication with users, many users expressed their hope to have a deeper understanding of the key technical implementation principles of the SQL engine.

Here, I'll recommend some knowledge that I personally think is very valuable for learning, but I will not review them one by one.

If you can master both the basic and advanced knowledge, you will be an expert in the SQL engine.



### Optimizer

For advanced knowledge about the optimizer, see [Rewrite SQL Statements](https://open.oceanbase.com/blog/10900289).

The content in this blog is demanding for users and is applicable to those who hope to deeply understand SQL query rewrite. Before you read this blog, we recommend that you first learn how to read and manage execution plans.


### Executor

- Vectorized execution

    - Recommended blog: [Evolution Path of Database Engines: From Row Engine to Vectorized Engine](https://open.oceanbase.com/blog/12082655296)

    - This blog is merely intended for popularization. All code in this article is pseudocode. We recommend this blog for all OceanBase Database users.
    
    - By the way, to **<font color="red">achieve the optimal performance of vectorized execution</font>**, we recommend you enable vectorized execution and do not change the default value of `rowset` (which can be adaptively modified).


- Parallel execution

    - Recommended blog: [Mastering Parallel Execution in OceanBase Database](https://open.oceanbase.com/blog/7083583808)

    - The content in this blog is a little bit demanding and is **<font color="red">applicable to users who want to know about AP</font>**. Before you read this blog, we recommend that you first learn how to read and manage execution plans.

- Data access service (DAS)
    - Recommended blog: [Practices of SQL Tuning in OceanBase Database: Execution Plan Instability Caused by Dynamic Sampling](https://open.oceanbase.com/blog/12134198082#%E7%AC%AC%E4%BA%8C%E4%B8%AA%E9%97%AE%E9%A2%98)

    - With DAS, OceanBase Database does not need to use the REMOTE or EXCHANGE operator to transfer complex SQL queries or subplans among nodes, but directly interacts with the storage layer to pull remote storage-layer data through remote procedural calls (RPCs) in proper scenarios. This is to simplify remote and distributed execution plans into local plans.

    - Before you read this blog, we recommend that you first learn how to read and manage execution plans.

- Distributed pushdown
    - Recommended blog: [Pushdown Techniques in OceanBase Database](https://open.oceanbase.com/blog/5382203648)

    - Simply put, to better utilize parallel execution capabilities and reduce CPU and network overheads during distributed execution, the optimizer often pushes down some operators to lower-layer computing nodes when it generates execution plans. This is to make full use of the computing resources of the cluster to improve the execution efficiency.

    - Before you read this blog, we recommend that you first learn how to read and manage execution plans.

- Adaptive techniques of the execution engine
    - Recommended blog: [Adaptive Techniques in the OceanBase Database Execution Engine](https://open.oceanbase.com/blog/5250647552)

    - Simply put, adaptive techniques enable the execution engine to dynamically adjust the execution strategy based on actual data characteristics (for example, uneven data distribution), thereby improving the execution performance.

    - Before you read this blog, we recommend that you first learn how to read and manage execution plans.



### Others

- Columnar storage
    - Recommended blog: [Columnstore Engine: Your Ticket to OLAP](https://open.oceanbase.com/blog/11547010336)

- References
    - We strongly recommend that you watch the following video made by Xifeng: [Technical Mechanism and Practices of the HTAP Technology of OceanBase Database](https://www.oceanbase.com/video/9000963).