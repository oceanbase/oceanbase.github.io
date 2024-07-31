# SIG 组织架构说明

本篇文档提供一个默认的 SIG 组织架构，包括 SIG 的职责、权限、申请条件、申请流程、退出条件等，各个 SIG 可以参考本篇文档直接使用或在此基础上进行修改或说明变更。

SIG 组织架构信息可以在各SIG目录的README和 membership.yml 文件中找到。

## Maintainer

通常由 1~3 人组成，可以有一个主要负责人，一些人协助。

### 职责

- 项目目标制定。制定项目 roadmap
- 项目管理。积极推进项目成功落地
- 社区建设。比如组织会议、文档管理规范、开发流程规范
- 成员指导。指导组内成员参与项目方案制定与研发

> 这里描述了多个任务，某个 Maintainer 可能只做其中一项任务


### 权限

与职责对等的权限，此外还有 Committer 的所有权限

### 申请条件
满足下面其中一个条件，可以由 Maintainer 发起申请。

- 身份为 Committer 最少半年
- 主导实现最少1个核心 feature 开发，或在某个项目中给出过方向性指导意见

### 申请

自己提交申请或由 SIG Maintainer 发起提议，不少于 2/3 TOC 审核通过并且新增 Maintainer 投票通过。

### 退出

Maintainer 不再活跃或不能再参与相关项目，可以由自己或其他 Maintainer 发起退出成员变更流程，不少于 2/3 TOC 审批通过后。

### 特殊情况

如果某个外部成员在日常活动中给出过重大指导意见或类似重大贡献，可以由 Maintainer 提议，由 TOC review 通过后合并 PR，将其加入 SIG Maintainer 列表。

## Committer
### 职责
- 某模块的主要功能设计、研发
- review 他人方案设计、代码
- 指导 contributor 和新人修复 BUG、实现 feature
- 积极参与小组相关议题讨论
### 权限
拥有特定模块代码合并的权限、拥有拒绝合并代码的权限

> 如果该 Committer 不负责开发，则不赋予其代码合并权限

### 申请
满足以下所有条件，可以由 Committer 或 Maintainer 发起申请，由不少于 2/3 Maintainer 审核通过。
- 身份为 Contributor；
- 最少修复过3个重大 BUG 或提交1个某个核心模块 feature，或在某项目中给出过重要指导意见(需要有记录)；

### 退出
满足下面其中一个条件，可以由自己或 Maintainer 发起退出成员变更流程。

- 成员无法参与项目；
- 半年内没有参与对应职责对应的活动。

## Contributor
### 职责
- 参与项目的开发、BUG修复
- 积极参与项目方案、议题的讨论

### 权限

可以参与SIG的日常交流，提出建议、贡献代码

### 申请
满足下面其中一个条件，由本人申请或由 SIG Maintainer 发起提议，不少于 2/3 Maintainer 审核通过。
- 成功提交过1个PR
- 提交过相关项目的设计方案

### 退出
满足下面其中一个条件，可以由自己、Committer 或 Maintainer 发起退出成员变更流程。

- 成员无法参与项目；
- 半年内没有参与过任何活动。

## 成员变更流程
- 在[oceanbase/community](https://github.com/oceanbase/community)中发起成员变更PR，PR 标题为 `SIG Membership Change: {name} ({role})`；
- 增加[投票记录](../votes/README_CN.md)；
- 审核通过后合并 PR，即变更成功。
