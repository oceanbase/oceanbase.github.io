---
title: SQL Performance Diagnostics and Tuning
weight: 5
---


SQL performance diagnostics and tuning are the most frequently mentioned requirements when collecting user suggestions on the **OceanBase Advanced Tutorial for DBAs** ("**Advanced Tutorial**" for short).

However, when we answered users' questions about SQL tuning in the Q&A section of the OceanBase community forum, we found that most issues can be easily solved by creating a suitable index and few SQL performance tuning issues cannot be solved based on Chapter 7 of the **OceanBase Quick Starts for DBAs** ("**Quick Starts**" for short).

We have prepared the complete study notes of [OceanBase Quick Starts for DBAs](https://oceanbase.github.io/docs/user_manual/quick_starts/en-US/chapter_01_overview_of_the_oceanbase_database/overview). Therefore, we strongly recommend that you read through [Chapter 7](https://oceanbase.github.io/docs/user_manual/quick_starts/en-US/chapter_07_diagnosis_and_tuning/introduction) of the **Quick Starts**.

The "Background Knowledge of the SQL Engine" topic has described the following knowledge about SQL performance diagnostics and tuning:

- Statistics and plan cache

- Execution plan reading and management

- Common SQL tuning methods

- Typical scenarios and general troubleshooting logic for SQL performance issues

- Tools for analyzing SQL performance issues

All of the above content is available in Chapter 7 of the **Quick Starts** (or you can learn only the above content). If you really do not have the patience to read through Chapter 7, we recommend that you read the three sections framed in red in the following figure.

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/05_performance_tuning/001.png)


If you still do not have the patience to read these three sections, we recommend that you read the paragraphs framed in red of the following two sections on the right side of the following figures. This can eliminate your overhead in asking questions in the Q&A section of the OceanBase community forum during SQL performance analysis.

"Common SQL tuning methods" section: Statistics, Plan cache, and Index tuning

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/05_performance_tuning/002.png)

"Typical scenarios and troubleshooting logic for SQL performance issues" section

![image.png](/img/user_manual/operation_and_maintenance/en-US/scenario_best_practices/chapter_03_htap/05_performance_tuning/003.png)



## "SQL Tuning Practices" Topic (Under Planning)

For the time being, we are not going to add any new tutorial-oriented content related to SQL tuning methods in the **Advanced Tutorial**.

However, as I mentioned in Chapter 7 of the **Quick Starts**: "You are not likely to become an expert in SQL performance analysis simply by reading them. You must also gradually accumulate experience in extensive practices." 

Therefore, Xuyu, an expert in SQL tuning, and I will record and summarize some typical SQL tuning issues posted in the OceanBase community forum, and share these issues with you in the "SQL Tuning Practices" topic under the [Well-chosen](https://ask.oceanbase.com/c/well-chosen/75) section on the OceanBase community forum.

Example: [SQL Tuning Practices: Index Failure Caused by Collation](https://ask.oceanbase.com/t/topic/35613940)

In this "SQL Tuning Practices" topic, we will gradually introduce typical SQL tuning practices based on actual problems encountered by users, including:

- Failure to make full use of indexes

- Exceptions caused by poor join methods in plans

- Exceptions caused by poor shuffle methods in plans

- Exceptions caused by poor order methods in plans

- Exceptions caused by partition data skew

- Others

More information is to be supplemented by Xuyu and I.

## References

[Well-chosen](https://ask.oceanbase.com/c/well-chosen/75) section on the OceanBase community forum

Complete study notes of [OceanBase Quick Starts for DBAs](https://oceanbase.github.io/docs/user_manual/quick_starts/en-US/chapter_01_overview_of_the_oceanbase_database/overview)