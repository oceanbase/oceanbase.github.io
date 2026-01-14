# DataWhale x OB 课程内容初步规划

DataWhale 有一个 2.9K star 的[《大模型应用开发实战一：RAG 技术全栈指南》](https://github.com/datawhalechina/all-in-rag?tab=readme-ov-file)。

可以在这个的基础上，出一个类似的 《大模型应用开发实战二：向量数据库技术全栈指南》，为 DataWhale 已有课程缺少的内容做一些补充。

AI x DataBase 课程大纲：

+ 前言
+ 基础知识
    - 浅入了解向量数据库
    - AI 应用底层实现
        * 存储和检索向量数据
        * 构建和维护知识库
        * 管理用户记忆和上下文
+ 向量索引 / 全文索引的构建与优化
    - 向量索引使用指南
        * 使用基础
        * 类型选择
        * 参数说明和调优
        * 其他使用建议
    - 向量索引优化指南
        * 构建耗时的分析和优化
        * 内存问题的分析和优化
    - 全文索引使用指南
        * 原理简述
        * 使用方式
        * 调优手段
    - seekdb 向量搜索实践
+ 向量数据库进阶能力 —— 提升 AI 应用效果和性能
    - 混合搜索 —— 标量 / 向量 / 全文，大幅提升 AI 应用检索性能
    - AI Function —— PROMPT / EMBED / RERANK，SQL 调用大模型，体验 RAG 功能完全内置到数据库
    - AI Memory —— 解决 AI 应用中上下文窗口限制带来的记忆问题
+ 项目实战 —— 构建和优化 AI 应用
    - 实战一：快速构建 AI 应用（基于 Dify x seekdb）
    - 实战二：构建和维护知识库（基于 PowerRAG）
    - 实战三：优化 AI 的应用中的用户记忆（基于 PowerMem）
+ 附录（AI 应用开发者提效工具）
    - Text2SQL —— 数据检索新纪元
    - MCP Server 与 AI 工具集成指南 —— 用自然语言玩转 AI 原生数据库
    - Claude Code 插件使用指南 —— 打造懂向量数据库的 AI 编程助手
    - Cursor 插件使用指南 —— 让 Cursor AI 助手秒懂向量数据库
