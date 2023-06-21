# OceanBase 用户手册


《OceanBase 用户手册》是 OceanBase 数据库的一站式解决方案，目的很简单，就是解决 OceanBase 使用的问题。

手册访问地址：<https://oceanbase.github.io>，本仓库存放手册站点的所有文档。

在这里，大家可以得到如下帮助：

- 跟自己业务场景类似的 OceanBase 成功案例；
- 测试、使用、运维过程中碰到的各种常见问题的解决方案；
- 常见的运维操作、开发规范、SOP；
- 故障处理以及止损方案；
- 还有 OceanBase 的一些运行机制和底层原理，也可以在这里看到。

当然，整个用户手册会更加的侧重于实操，并且内容会持续的更新迭代。

## 手册共建

非常欢迎大家一起共建 OceanBase 用户手册，分享自己使用 OceanBase 过程中碰到的任何问题以及使用到的 OceanBase 的场景。

这样，其他小伙伴在碰到同样的问题时，就可以快速的解决；碰到同样的业务场景，也可以有成功的案例可以参考。

## 如何共建

### 目录结构介绍

**文档**

content/docs 下面的内容就是 oceanbase.github.io 站点展示的内容，目录结构跟展示结构的相同。每个目录下面的 _index.md 文件可以定义目录展示格式，比如：展示顺序、别名等

文档的格式为 .md 类型的文件。同样的，文档同步也要注明别名、展示顺序等。

**图片**

所有图片统一放在 static/img，每个文档的图片需要放在 文档目录/文档名/ 这个目录下面。

比如下面的图片 framework.png，其实是 about_oceanbase/overall_architecture.md 里面的。

目录和文件命名建议统一使用小写。

```bash
├── content
│   ├── _index.md
│   └── docs
│       ├── about_oceanbase
│       │   ├── _index.md
│       │   ├── overall_architecture.md
│       │   └── overview.md
├── static
│   ├── img
│   │   └── about_oceanbase
│   │       └── overall_architecture
│   │           ├── framework.png
......
```

### 内容提交

**1. 克隆仓库到本地**

```bash
git clone git@github.com:oceanbase/oceanbase.github.io.git
```

**2. 新建分支并切换到新分支**

```bash
cd oceanbase.github.io
# 新建分支并切换
git checkout -b new_branch
# 查看当前所在的分支
git branch
```

**3. 添加内容**

**4. 本地调试**

```bash
# 返回仓库初始目录
cd oceanbase.github.io
# 启动服务
hugo server
# 浏览器打开，确认格式&内容是否正确
http://localhost:1313/
```

**5. 内容提交**

```bash
# 确认当前分支
git branch
# 添加当前变更
git add .
# 提交变更
git commit -m "提交内容"
# 推送本地分支变更到远程主机
git push origin new_branch
```

至此，提交完成。

**注意**

一定要对内容脱敏！
一定要对内容脱敏！
一定要对内容脱敏！

重要的事情说三遍，保证数据安全。

## 其他

手册使用过程中碰到的问题，可随时提 Issue 来反馈，或者直接提交 Pull Request 来进行修改，大家一起优化。
