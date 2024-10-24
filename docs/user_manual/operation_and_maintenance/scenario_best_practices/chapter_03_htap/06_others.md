---
title: 其他
weight: 5
---

最后一个小节，给大家分享几个和 AP 场景相关，且推荐了解的内容。

## AP 场景参数配置最佳实践

- **<font color="red">最佳实践很简单，就是一句话：推荐直接用参数模板。</font>** 参数模板可以了却手动配置参数的烦恼，详见本教程的[《参数模板》](http://localhost:3000/docs/user_manual/operation_and_maintenance/scenario_best_practices/parameter_templates) 章节。

- 这里顺带把 OceanBase 文档团队同学整理的各个模板下的详细参数配置，也分享给大家，供感兴趣的同学参考：

    - [HTAP 场景配置项推荐配置](https://www.oceanbase.com/docs/common-best-practices-1000000001489644)

    - [OLAP 场景配置项推荐配置](https://www.oceanbase.com/docs/common-best-practices-1000000001489645)


## 并行执行最佳实践

- 推荐大家阅读 [《OceanBase 并行执行学习笔记》系列](https://open.oceanbase.com/blog/7083583808)。

    - 内容稍有门槛，但门槛不高，适合有 AP 需求的用户阅读学习 。推荐大家在掌握如何 “阅读和管理执行计划” 之后进行阅读。

- 推荐大家阅读 [《OceanBase v4.2 Auto DOP 功能说明》](https://open.oceanbase.com/blog/7439298336)。

    - Auto DOP 可以在一定程度上，解决需要手动设置并行度的不便。
    - **<font color="red">如果大家懒得阅读上面这几篇博客，至少需要了解设置并行度的最佳实践。</font>** 最佳实践很简单，一共只有两步：
        - 先根据机器性能，及可以接受的复杂查询对资源的占用比例，设置并行度上限，例如 ``set parallel_degree_limit = 32;``。
        - 打开 Auto DOP：``set parallel_degree_policy = AUTO;``。

## 列存最佳实践

- 推荐大家阅读[《进入 OLAP 领域的入场券 —— 列存引擎》](https://open.oceanbase.com/blog/11547010336)。
    
    - OceanBase 的列存功能正在逐步完善中，后续会在这里继续增加诸如 “列存副本” 等新增能力的最佳实践。    