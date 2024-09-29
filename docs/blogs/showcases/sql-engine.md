---
title: 'Integrated SQL Engine in OceanBase Database'
slug: integrated-sql-engine
---

![oceanbase database](https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682301944833.jpg)

_Yang Zhifeng, OceanBase’s Chief Architect, lately introduced the evolution of the technical architecture of OceanBase Database from V0.5 to V4.0 and shared his thoughts along the journey. This article is only part of his sharing. Since the content of the sharing is so extensive, we will divide it into the following articles:_

_‒_ [_The architectural evolution of OceanBase Database_](https://medium.com/@oceanbase/the-architectural-evolution-of-oceanbase-database-9ab70506fc15)

<!-- truncate -->

_‒_ [_What is the integrated architecture of OceanBase Database?_](https://medium.com/@oceanbase/integrated-architecture-of-oceanbase-database-615dcf707f38)

_‒ SQL engine and transaction processing in the integrated architecture of OceanBase Database_

_‒ Performance of OceanBase Database in standalone mode: a performance comparison with MySQL 8.0_

_This article introduces the SQL engine and transaction processing in the integrated architecture of the OceanBase database._

We have designed the SQL execution engine of OceanBase Database based on many scenarios. Because we want it to be adaptive and provide the best performance in each scenario.

Generally speaking, each SQL statement can be executed in serial or parallel mode.

![oceanbase database](https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682302044156.jpg)

# Serial execution, parallel execution on a standalone server, and distributed parallel execution

In serial execution, if the table or partition involved is located on the local server, the execution process is exactly the same as that of an SQL statement on a local or standalone server. If the required data is stored on another server, OceanBase Database either fetches the remote data and processes it on the local server or performs remote execution. In remote execution, if all data required in a transaction is located on another server, OceanBase Database forwards the transaction to that server, which will access the storage, process the data, commit the transaction, and then return the results. If the data required in an SQL statement is located on many servers, to consume the minimal overhead comparable to serial execution on a standalone server, OceanBase Database performs distributed execution, pushes the computing tasks to each server for local processing, and then aggregates the results. This way, the degree of parallelism (DOP) is 1, and no extra resources are consumed. In the case of parallel execution, OceanBase Database supports parallel execution on a standalone server, distributed parallel execution, and parallel DML write.

As mentioned above, serial execution consumes minimal overhead. In this case, OceanBase Database performs serial scans on a single server without context switchover or remote data access, which is highly efficient. For a small business, serial execution is sufficient to meet the requirements. If you need to process a large amount of data, OceanBase Database also supports parallel execution on a standalone server. This capability is not supported by many open-source standalone databases. With enough CPUs, OceanBase Database can linearly shorten the processing time of an SQL statement by performing parallel execution. You only need to deploy OceanBase Database on a high-performance multiprocessor server and enable parallel execution.

![oceanbase database](https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682302118057.jpg)

OceanBase Database supports the parallel execution of distributed execution plans on multiple servers. This means that the DOP will no longer depend on the number of CPU cores of a standalone server. Hundreds or even thousands of CPU cores can be added to support a higher DOP.

# Serial execution: DAS execution and distributed execution

DAS execution and distributed execution are two types of serial execution supported in the OceanBase Database.

Data pull is a way to perform DAS execution with minimal resource consumption. If the required data is located on another server and only single-point query or table access by the index primary key is involved, OceanBase Database will pull the required data to the local server. The execution plan has the form of a local execution plan. The executor will automatically pull data. Sometimes, however, it is better to push down the computing tasks. Therefore, OceanBase Database also supports distributed execution. Note that distributed execution does not consume extra resources, and is performed with the same DOP as DAS execution.

For some special queries or large-scale scans, OceanBase Database will adaptively select the execution mode based on the cost to achieve the best results.

![oceanbase database](https://obportal.s3.ap-southeast-1.amazonaws.com/obc-blog/img/d105da79260f4d6a8a03571e4a2b17091682302163423.jpg)

The parallel execution framework of OceanBase Database adaptively handles both parallel executions on a standalone server and distributed parallel execution. Parallel execution can be performed by worker threads on the local server or many different servers. OceanBase Database has an adaptive data transmission layer in its distributed execution framework. In the case of parallel execution on a standalone server, the data transmission layer automatically converts the data interactions between the threads into replicas stored in the memory. In this way, the data transmission layer makes it possible to adaptively handle tasks in two different scenarios. In fact, the parallel execution engine schedules tasks for parallel execution on a standalone server and distributed parallel execution in the exact same way.

In the next articles, you will learn more details about transaction processing in OceanBase. Stay tuned!
