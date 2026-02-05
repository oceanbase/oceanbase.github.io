
# 前言

这套 OceanBase 的社区课程叫《Easy "Data x AI"》。

OceanBase 社区，一直想做一套主题为 Data x AI 的课程，面向的人群是：

+ 希望能够构建高性能 AI 应用的开发者
+ 希望拥抱 AI 的 DBA
+ 希望获取 AI 知识的朋友

# 为啥想做这套社区课程？
## For 希望能够构建高性能 AI 应用的开发者：
> 工欲善其事，必先利其器。
>

我去年接触了很多的 AI 应用开发者，大家都用 AI 做出了各种各样的应用 demo，然后开始有一部分人开始想尝试把这些 demo 进行工程化和产品化。

但是大家在把 demo 产品化的过程中，发现存在一些共同的痛点，就是 AI demo 中涉及到的各种基础设施在 demo 中勉强可以用，但是在从 demo 往一个完整的工程项目转化的过程中，数据的形态会越来越多元化。

比如在 demo 里，可能只涉及文本或者结构化数据的存储和查询。但是真正的 AI 应用里，还需要处理多模态的数据，比如图像、音频、视频、知识图谱、关系网络等等。这时候就需要推翻 demo 的架构，重新选择应用的各个组件，最好是 AI 应用需要的各种能力，这些组件原生就支持，这样可以大幅简化应用的架构。然后还需要关注这些组件的资源占用、计算性能情况等等。

除此以外，还有就是如果一款 AI 应用真的有用户在日常会持续使用，那么上下文就会越来越长，上下文变长，模型对关键信息的检索能力就会下降 —— 这种现象叫 "上下文腐化"。上下文腐化的原因，简而言之，主要原因还是注意力是有限的资源，信息越多，每个信息被分到的关注就会越少。还有就是 Transformer 是 O(n²) 计算复杂度，**上下文翻 10 倍，需要用到的算力就会翻 100 倍。**

还有一点很重要的就是，这些和数据存储、计算相关的组件，还需要和主流的 AI 框架深度融合，比如可以完美兼容 Dify、RagFlow、LangChain、FastGPT、CAMEL-AI 等等最主流的 AI 框架。最好能够在使用这些 AI 框架的时候，直接在配置文件里能选择一下，就能一键把这些最合适的底层设施都部署好。

<!-- 这是一张图片，ocr 内容为：CONTEXT CORRUPTION (0(N) ATTENTION REBUILD? AI DEMO OLD OEMO HIGH-PERFORMANCE AR TOOLS ARCHITECTURE DIFY RAGFLOW FASTOPT GAMEL-AL REGFLOW KNOWLEDGE ONE-CLICK GRAPH DEPLOYMENT HULTI DATA TYPES -->
![](/img/ai_courses/context-corruption.png)



**<span style={{ color: '#DF2A3F' }}>所以做这套课程的一个非常重要的目的就是，让大家在构建这个 AI 应用 demo 的时候，可以通过这样一套课程，快速对 AI 应用涉及到的基础设施的生态有一个了解，能够提前在做 AI demo 的时候，就把偏底层一些的组件给选对、选好，避免产品化的时候，还要重新设计架构，然后再把在 demo 里用到的这些组件全部再替换一遍。</span>**



## For 希望拥抱 AI 的 DBA：
> 如果此刻还不进场拥抱 AI，每天都将错过一个时代。
>

在 AI 时代，DBA 群体应该主动去了解 AI Native DataBase 和相关的新特性。但我接触到的一部分 DBA，只要听到 “向量、全文、混合搜索、AI Function” 这些新鲜特性，就纷纷说肯定用不到，表示只要了解基本的运维操作和基础的 CRUD 就够了。

因此，这里不再去讲向量数据库和相关的 AI 特性有多重要，也不去介绍如恶化通过 AI Function + 生成列（虚拟列）可以在表中创造功能强大的 AI 列，而是选择分享下面这个 DBA 一定都能看懂的简单例子：

DBA 朋友们大多都会熟悉 Create Table / Alter Table / Drop Table 等 DDL 操作，但在现在这个 Vibe Coding 平台满天飞的时代，也应该去学习和了解 AI Native DataBase 为这个需求发布的数据库新特性 —— Table Fork（类似地，还有 DataBase / Schema Fork 等） 。有些朋友对于 Vibe Coding 场景为啥需要 Fork Table 可能会有些疑问，那我就继续给大家举个例子：

以 Vibe Coding 平台为例。小李在用 AI 生成一个手办商城，他对 AI 说 “给商品表加一个限量版标签字段”，AI 自动生成了 ALTER TABLE 语句并执行。这时候平台就会自动创建一个 Table Fork，相当于给当前表结构打了个快照。

过了一会儿，小李通过 Vibe Coding 让 AI 去改了几个字段，加了价格折扣逻辑。结果一测试，发现折扣计算有 BUG，之前能跑的订单流程现在全挂了。这时候，Table Fork 的回滚能力就派上用场了。

小李在平台上会看到一个版本历史列表，显示：

+ “版本 1：初始电商模板”
+ “版本 2：加了限量版字段”
+ “版本 3：加了折扣逻辑”

他直接点击回滚到版本 2，整个表结构和数据瞬间恢复到加折扣之前的状态，订单流程又能跑了。

这个能力对 Vibe Coding 场景特别重要，因为 AI 生成的代码不一定每次都对，用户需要大胆尝试、快速试错。有了 Table Fork，每次修改都有后悔药，用户敢放心让 AI 改数据库，改坏了一键回滚，不用担心把数据搞乱。这就像 Git 对代码的版本管理，但 Table Fork 是对数据库表的版本管理。

而且 Table Fork 在各个 AI Native DataBase 中，往往都只是一个 DDL 操作，执行非常快速，可以在毫秒级完成 Fork 的动作，相比 Flyway 等数据库版本控制工具，提供的能力要更加灵活和强大。

![](/img/ai_courses/table-fork.png)

**<span style={{ color: '#DF2A3F' }}>因此，DBA 朋友们也可以通过这套课程，快速了解 AI Native DataBase 为 AI 时代发布的各种新特性，以及这些新特性的适用场景和最佳实践。如果此刻还不进场拥抱 AI，每天都将错过一个时代。</span>**



## For 希望获取 AI 知识的朋友们
> 在机器人越来越像人的时候，人不能越来越像机器人。
>

在人人都是 builder 的时代，希望通过这套社区课程，能让大家基于 Data x AI，释放出创造力，去尝试有趣的想法，去构建有用的事物。



# 想怎么做这套社区课程？
我们这个以 Data x AI 为主题的课程，目前还在筹备阶段，希望能在这套课程中，和大家一起逐步构建能力越来越强大的 AI 应用。同时也希望在这个过程中，能够让大家了解 AI 应用底层的 Data 长什么样子、起到了什么作用，以及应该如何基于这些知识，构建出架构简单、易于维护、性能强大的产品。

这套课程预计 2025 年 3 月初上线 OceanBase 官网的在线课堂，每周更新一期内容。并会在 [github](https://github.com/oceanbase/oceanbase.github.io) 上同步更新。届时欢迎各位老师们以来 [https://github.com/oceanbase/oceanbase.github.io](https://github.com/oceanbase/oceanbase.github.io) 提 issue 和 pr 的形式，参与课程的讨论和共建。

课程大纲如下：

| | 期数 | 标题 | 适合人群 | 实践内容 |
| --- | --- | --- | --- | --- |
| 基础篇 | 0 | 前言 | ALL | NULL |
| | 1 | 浅入了解向量数据库 | ALL | 简单 & 直观地了解观地向量存储 |
| | 2 | 零代码构建最简架构的 AI 应用（基于 FastGPT） | ALL | 体验知识库导入、知识库检索，快速构建信息问答应用 |
| | 3 | 浅入了解 AI Memory | ALL | 简单 & 直观地了解 AI Memory |
| | 4 | 零代码 / 低代码构建最简架构的 AI 应用（基于 Dify） | ALL | 体验从原型到生产的全流程 |
| | 5 | Skills | 开发者 / DBA | 基于 seekdb Skills 开发 AI 应用 For 开发者<br/>& <br/>开发并使用可以优化 SQL 执行计划 / 优化 schema 结构的 Skills For 有数据库基础人群 |
| 进阶篇 | 6 | 浅入了解混合搜索 | 开发者 / DBA | 通过 Vibe 一个小应用，直观地对比混合搜索的效果 |
| | 7 | AI Native DataBase 新特性及最佳实践 | 开发者 / DBA | 体验 AI Function、Table Fork、MCP Server for DB…… |
| | 8 | 基于 LangChain 高度定制 LLM 应用 | 开发者 | 体验通过底层的模块化能力，灵活构建 AI 应用 |
| | 9 | 基于 Camel AI 的多智能体协作与创新 | 开发者 | 体验多 Agent 交互 |
| | 10 | 尾声 | ALL | NULL |
| | 11 | 附录 | ALL | NULL |
| 高阶篇 | To be Continue... | | | |


> 说明：以上大纲可能并非最终版本



# 欢迎各位佬友积极参与课程共建！
**这个 Data x AI 的课程，不仅会介绍偏底层的 Data 应该怎么用，还会有各个主流 AI 社区的技术老师，为大家介绍各种偏上层的 AI 平台应该怎么玩儿。**

OceanBase 社区和 AI 方向的生态社区合作很多，和各个 AI 平台也有非常多的生态对接和深度融合。在前一阵儿的社区嘉年华活动中，各个 AI 社区的核心技术同学都已经接受了我们的邀请，会一起参与本次 Data x AI 系列课程的共建。共建人员会包括：FastGPT、Dify、LangChain、CAMEL-AI、RagFlow、NVIDIA 等各个 AI 社区的技术专家。

当这套课程的更新进度，达到 DataWhale 的立项标准的时候，我们也希望能够把这套 Data x AI 主题的课程，作为一个项目，贡献给 Datawhale 社区~

<!-- 这是一张图片，ocr 内容为：蚂蚁开源 OCEANBASE ANT OPEN SOURCE 技术合作社区 DIFYRAGFIOW FASTGPT CAMEL-AI TEN WASMEDGERUNTIME LANGCHAIN COMMUNITY 蚂蚁百灵 TRANSFORMATIVE EXTENSIONS NETWORK DATAWHALE -->
![](/img/ai_courses/community-partners.png)

******

# 福利环节
活动过程中，每通过一个课后小测，就可以获取 OceanBase 社区积分，以及一次抽奖定制礼物的机会。

每节课程结束之后，也都会为通过课后小测的同学们，再额外抽取各个 AI 社区为本次课程特别赞助的定制礼品，以及和当期课程有关的书籍（例如下面这本书的作者张海立老师就会在本课程中，亲自为大家分享和 LangChain / LangGraph 相关的知识）等特殊福利。

<!-- 这是一张图片，ocr 内容为：BROADVIEW WWW,BROAFVLEW.COM.CA LANGCHAIN 冰袋 爱海立德士记,然设龙0筑薯 LANGCHAIN实战 从原型到生产,动手打造LLM应用 张海立曹士坦郭祖龙编著 中国工信出版集团 -->
![](/img/ai_courses/langchain-book.png)



所有参与课程学习的同学，也均可向 OB 社区小助手（微信号：OBCE666）申请成为讲师、助教、内容共建者。

参与课程共建的同学，可以获得 OBCP 免费券、限量版开发者 T 恤等社区定制礼品，还有机会成为 OceanBase 社区版主、OceanBase 社区大使、OceanBase 社区年度之星，并享受相应权益。

# 最后
欢迎各位佬友扫码加入课程交流微信群，和我们一起参与课程内容的讨论和共建！

<!-- 这是一张图片，ocr 内容为：扫描二维码加入群聊 -->
![](/img/ai_courses/qrcode-group.png)

