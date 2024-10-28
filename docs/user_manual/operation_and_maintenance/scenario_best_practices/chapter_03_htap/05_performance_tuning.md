---
title: SQL 性能诊断和调优
weight: 5
---


SQL 性能诊断和调优，是在收集《进阶教程》用户建议过程中，大家最常提到的需求。

不过，我们在社区论坛问答区，回答用户 SQL 调优问题的过程中，发现绝大多数问题都可以通过创建一个合适的索引轻松解决，很少有《入门教程》第七章解决不了的 SQL 性能调优问题。

在前一段儿时间，我们也为大家整理了[【OceanBase DBA 入门教程】完整版学习笔记](https://ask.oceanbase.com/t/topic/35613279)。所以，我们舍远求近、就地取材，在这里强烈推荐大家完整阅读[《入门教程》第七章](https://www.oceanbase.com/docs/community-tutorials-cn-1000000001390070)（这一章是我前一段时间呕心沥血为大家整理的内容）。

在前面的 “SQL 引擎概述” 小节中，列出了需要大家掌握的 SQL 性能诊断调优内容：

- 统计信息和计划缓存

- 阅读和管理执行计划

- 常见的几种 SQL 调优方式

- SQL 性能问题的通用排查思路和几种典型场景

- SQL 性能问题分析工具

上述这些内容都可以在《入门教程》第七章中学到（也可以只学这些内容），如果实在没有耐心阅读第七章的全部内容，那么就推荐阅读红框标注的这三个小节。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/05_performance_tuning/001.png)


如果连这三个小节都没有耐心去阅读的话，那么就推荐阅读下面这两个小节右侧用红框标注的这几个段落，可以消除在 SQL 性能分析过程中一大部分去 OceanBase 社区论坛问答区提问的开销。

一个是常见 SQL 调优方式中的：统计信息、计划缓存、索引调优。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/05_performance_tuning/002.png)

一个是典型场景和排查思路这一小节的完整内容。

![image.png](/img/user_manual/operation_and_maintenance/scenario_best_practices/chapter_03_htap/05_performance_tuning/003.png)



## 《SQL 调优实践记录》（预告）

虽然这次《进阶教程》在 “SQL 调优方法” 部分，暂时不增加 “教程向” 的新内容。

不过，我在《入门教程》第七章中曾说过：“阅读完之后，不能保证大家就地成为 SQL 性能分析专家。成长为专家的路上，需要循序渐进，在大量的实践中逐步积累经验，还是那句老话：‘无他，唯手熟尔’。” 

因此，我和 SQL 调优专家絮语老哥，会对在论坛里看到的一些典型的 SQL 调优问题，进行记录和总结，然后在 [OceanBase 社区论坛 —— 官方精华板块](https://ask.oceanbase.com/c/well-chosen/75) 中，以 《SQL 调优实践记录》的形式给大家进行分享，并逐步形成一个 “实践向” 的专题。

例如：[【有问必答】分析一个在不同 collation 的字符串连接时，无法利用索引的问题](https://ask.oceanbase.com/t/topic/35613940)。

在这个 SQL 调优实践专题中，会以真实遇到的用户问题，逐步为大家介绍典型的 SQL 调优实践，包括：

- 各种无法充分利用索引的问题

- 计划中的 join 方式不优导致的问题

- 计划中的 shuffle 方式不优导致的问题

- 计划中的 order 方式不优导致的问题

- 分区数据倾斜导致的问题

- 等等等等

这里先挖个坑，等我和絮语一起慢慢填。

## 推荐阅读

[OceanBase 社区论坛 —— 官方精华板块](https://ask.oceanbase.com/c/well-chosen/75)

[OceanBase DBA 入门教程 —— 完整版学习笔记](https://ask.oceanbase.com/t/topic/35613279)