---
title: Others
weight: 5
---

In this topic, I will share with you some information related to analytical processing (AP) scenarios.

## Recommended Configurations in AP Scenarios

- **<font color="red">Simply put, we recommend that you directly use a parameter template. </font>** Parameter templates can free you from manual parameter configuration. For more information, see [Parameter Templates](https://oceanbase.github.io/docs/user_manual/operation_and_maintenance/scenario_best_practices/parameter_templates) in this advanced tutorial.

- The detailed parameter configurations in each template are also available for your reference:

    - [Recommended configurations in HTAP scenarios](https://en.oceanbase.com/docs/common-best-practices-10000000001740745)

    - [Recommended configurations in OLAP scenarios](https://en.oceanbase.com/docs/common-best-practices-10000000001740746)


## Best Practices for Parallel Execution

- Recommended blog: [Mastering Parallel Execution in OceanBase Database](https://open.oceanbase.com/blog/7083583808)

    - The content in this blog is a little bit demanding and is applicable to users who want to know about AP. Before you read this blog, we recommend that you first learn how to read and manage execution plans.

- Recommended blog: [Auto DOP in OceanBase Database V4.2](https://open.oceanbase.com/blog/7439298336)

    - With the auto degree of parallelism (DOP) feature, you do not need to manually set a DOP.
    - **<font color="red">If you do not have time to read all the recommended blogs, you must know how to set an optimal DOP </font>** by simply performing the following two steps:
        - Set the maximum DOP based on the server performance and the acceptable resource usage by complex queries, for example, `set parallel_degree_limit = 32;`.
        - Specify `set parallel_degree_policy = AUTO;` to enable auto DOP.

## Best Practices for Columnar Storage

- Recommended blog: [Columnstore Engine: Your Ticket to OLAP](https://open.oceanbase.com/blog/11547010336)
    
    - The columnar storage feature of OceanBase Database is being improved. Best practices for new capabilities such as columnstore replicas will be added here later.    