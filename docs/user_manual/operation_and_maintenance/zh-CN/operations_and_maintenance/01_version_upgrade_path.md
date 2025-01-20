---
title: 版本升级路径
weight: 1
---
## 背景
《DBA 进阶教程》中的这篇内容，源自 OceanBase 社区论坛中一位叫做皇甫侯的用户的建议，这位用户希望我们能够为用户讲解一下 OceanBase 的版本升级路径。在这篇文档里，我会把个人认为需要用户了解的版本升级知识做一个简单的总结和分享，希望能够对大家有所帮助。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/001.png)

如果大家在对 OceanBase 的运维过程中，还有哪些希望了解的内容，欢迎在[《OceanBase 4.x 运维开发手册》用户意见收集](https://ask.oceanbase.com/t/topic/35610431)这个帖子里留言评论，我们会根据大家的意见和建议不断完善这个《DBA 进阶教程》。


## 产品版本号
在介绍升级路径之前，先简单介绍一下 OceanBase 的产品版本号，产品版本号代表 observer 的版本，每次发版时都会推高版本号：

+ 版本号的第一位代表架构的级别，修改架构才会推第一位版本号，目前（2024.09.05）最新版本是 4。
+ 版本号的第二/三位，代表新增了不同级别的大 feature。
+ 版本号第四位，则是代表每个分支版本下，定期对一批 bugfix 进行集中打包后发布的 BP (Bundle Patch) 版本。

这里需要注意的是，在前三位相同的情况下，第四位越大则代表当前版本推出越晚。前三位不同的情况下，无法通过产品版本号比较获得产品推出时间，因此一些 bugfix 是否存在需要根据产品拓扑图决定。

在每一位版本号后面还可能会有后缀，例如 CE、LTS、HF 等：

+ CE（Community Edition）代表社区版。
+ LTS（Long-Term Support）代表长期支持版，会在这个版本，长期解决稳定性 bug。
+ HF（HotFix）表示只增加了关键 bugfix 的版本，旨在解决个别 “走投无路” 难以绕过的问题。
+ GA（General Availability）代表稳定版本，是生产环境（即正式使用环境）下安全可靠的，可以广泛部署和用于日常业务操作的版本。在[官网](https://www.oceanbase.com/docs/common-oceanbase-database-cn-1000000001509391)上可以看到 4.3.1 就是一个 GA 版本。

例如下图中 4.2.1_BP8(LTS) 就表示是 4.2.1 这个版本中进行过 8 次 Bundle Patch 的长期支持版本。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/002.png)

## Barrier 版本
下载了一个 4.2.3.1 的 observer，想测试下通过 OCP 把很久很久之前部署的一个单机的 4.1.0.1 给升级到 4.2.3.1 版本（测试集群是单机单副本，所以没法儿轮转升级，只能停服升级）。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/003.png)

本以为吃着火锅唱着歌就能把级给升了，结果不巧，OCP 说还需要给它上传一个额外的 barrier 版本。也就是说，需要下载两个 observer 的 binary 提供给 OCP，一个是需要经停的 4.2.1.2，一个是终点站 4.2.3.1。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/004.png)

提供完了 barrier 版本的包就不用管了，OCP 会帮你把集群直接升级到最终的 4.2.3.1 版本。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/005.png)

正好也趁这个机会，在介绍升级拓扑之前，先说一下什么是 barrier 版本，以及 barrier 版本的作用。

OceanBase 在很多版本之间，都支持不停机地进行轮转升级。轮转升级就是说让集群里的各个低版本 observer 在升级过程中被轮流替换成高版本，因为是逐个替换，所以只要保持多数派的 observer 还在，就可以持续对外提供服务。在集群升级过程中，高版本的 observer 需要以低版本的模式持续运行一段时间，直到全部低版本的 observer 都被替换成高版本为止。因此高版本需要继续保留低版本上的老代码。也就是说，即使低版本的功能在高版本上被废弃了，为了支持不停机升级，高版本的 observer 中也需要保留被废弃掉的古老代码。

为了减少维护版本之间升级兼容性的开销，避免让一个超级古老的版本直接升级到当前最新版本，带来大量的兼容代码维护负担。OceanBase 引入了一个 barrier 版本的概念。barrier 版本指的是某个低版本升级到某个高版本过程中，必须要经停的版本。在此 barrier 版本之前的版本，必须要先升级到 barrier 版本，才能继续升级到后续版本。这样研发同学在代码中，就不必考虑最新版本和上一个 barrier 版本之前的各种兼容性问题了。

如果大家觉得上面这两段介绍 barrier 作用的文字实在难以理解，也没有关系。只要看懂下面两张图，能够了解什么是 barrier 版本，基本也就够用了。

下图中有五个版本 A、B、C、D、E，其中 C 是 barrier 版本。对于 A、B 来说，都可以直接升级到 C。对于版本 C 来说，可以直接升级到 D 或 E。但是 A、B 无法直接升级到 D、E，他们升级到 D、E 的路径上，都需要经停版本 C，即先升级到版本 C，再升级到 D、E。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/006.png)

另外一个需要注意的点是 barrier 是针对某个版本的，即这个 barrier 可能对一些版本是 barrier，升级必须经停，对另一些则不是 barrier。

下图中有四个版本 A、B、C、D，其中 C 对于 A 来说是 barrier版本，那么如果 A 要升级到 D，就必须要经停 C，无法直接升级到 D，整个升级流程是 A -> C -> D。而 C 对于 B 来说不是 barrier 版本，所以 B 可以直接升级到 D。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/007.png)

这里需要注意的是，上面写的 “经停” 并不代表需要停机升级，只是比喻升级过程需要经历先升级到 barrier 版本，再升级到目标版本的这样一个过程。

## 升级拓扑
经停了 barrier 版本这一部分内容之后，终于来到了升级拓扑。定义升级拓扑图的文件叫 [oceanbase_upgrade_dep.yml](https://github.com/oceanbase/oceanbase/blob/develop/tools/upgrade/oceanbase_upgrade_dep.yml)，感兴趣的朋友，可以点开前面的链接看看 github 中的对应文件，文件里有不少有价值的中文注释供大家参考。

这个文件会放在安装目录里，不同版本的内容略有不同，因为发现编译安装和通过 OCP 安装的文件路径好像还不太一样，所以就请大家自行在准备升级到的最高版本的包里 find 下吧。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/008.png)

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/009.png)

升级拓扑主要由以下部分组成：

+ version: 待升级的版本，或者升级过程中经过的版本。
+ can_be_upgraded_to：当前版本可以直接升级到的版本号。
+ deprecated：缺省为 False。如果为 True，表示这个版本已经废除。可以作为升级的起点，可以作为升级过度版本，但是不建议作为升级目标版本。
+ require_from_binary：缺省为 False。如果为 True，表示是上面提到的 barrier 版本。
+ when_come_from：一般是一个列表，伴随 require_from_binary 出现，表示从列表中的版本升级时，需要经停当前版本。

![image.png](/img/user_manual/operation_and_maintenance/zh-CN/operations_and_maintenance/01_version_upgrade_path/010.png)

上图是一个升级的例子，为方便大家理解做了一些简化，不代表某个真实版本升级拓扑（不同版本的真实升级拓扑详见安装路径中的 oceanbase_upgrade_dep.yml 文件，一般可能会比上图略微复杂一些）。

图中左边有四个版本，分别是 4000、4001、4100、4200（这里偷懒省去数字之间的点号），其中 4100 是一个 barrier 版本，when_come_from: [4.0.0.0] 表示当低版本是从 4000 升级过来时，需要经停 4100。

但是因为 when_come_from 列表中没有 4001，所以 4001 可以直接升级到 4200，不需要经停 4100。这里再次强调下 barrier 版本是相对于某个版本而言的，例如这里的 4100 相对于 4000 是 barrier 版本，但是相对于 4001 则不是 barrier 版本。

大家可以这么理解：整个升级文件构成了一张类似于上图中右侧的有向无环图，整个升级流程就完全展示在这张升级拓扑图上。除非某个 barrier 版本指定说从某个特定的起始版本升级上来就需要经停它这个版本，否则就可以继续在这个图上往后不经停，直接升级到目标版本。（这段话稍微有一点儿绕，大家结合上面这个例子理解下~）

## What Else
在[社区论坛的帖子](https://ask.oceanbase.com/t/topic/35611595/15)里，有几个用户同时反馈说 “希望能通过一个工具，输入升级前后的版本，输出对应的升级路径”。这个重任就交给靖顺老哥正在不断完善的工具 [obdiag](https://github.com/oceanbase/obdiag/issues/428) 了 ！
