---
title: OBServer 节点 core 掉后如何收集堆栈
weight: 2
---
# **OBServer 节点 core 掉后如何收集堆栈**

本文介绍 OBServer 节点 core 掉后如何排查确认，并收集堆栈。

## **问题现象**

正常运行的 OBServer 突然异常退出。

## **问题排查**

可以通过如下几种方法排查 OBServer 是否 core 掉。

- 执行如下命令查看 OBServer 进程是否存在，若输出为 0 表示进程不存在。
  
  ```shell
  [root@x.x.x.x ~]$ ps -ef | grep 3.1.5 | grep -v grep | wc -l
  0
  ```

- 查看对应的 OBServer 日志里是否输出 `CRASH ERROR` 关键字，如下所示。
  
  ```shell
  [root@x.x.x.x ~]$ grep "CRASH ERROR" /home/admin/ob3.1.5/log/observer.log
  CRASH ERROR!!! sig=11, sig_code=0, sig_addr=59ef, timestamp=1683513011732829, tid=27670, tname=observer, trace_id=0-0, extra_info=((null)), lbt=0x9bac9c8 0x9b9d248 0x2ac7a28ac62f 0x2ac7a2f8a9fd 0x2ac7a2f8a893 0x9461d97 0x22ed172 0x2ac7a2ee7554 0x22ebe28
  ```

- 查看对应的 OBServer 机器 `/etc/sysctl.conf` 文件中指定的 kernel.core_pattern 位置是否生成对应的 core 文件，如下所示。
  
  ```shell
  [root@x.x.x.x ~]$ grep "kernel.core_pattern" /etc/sysctl.conf
  kernel.core_pattern = /home/admin/core_test/core-%e-%p-%t

  [root@x.x.x.x ~]$ ls -l /home/admin/core_test/core-observer-27670-1683513011
  -rw------- 1 admin admin 8723914752 5月   8 10:30 /home/admin/core_test/core-observer-27670-1683513011
  ```
  
  > **说明**
  >
  > - 如果没有指定 kernel.core_pattern，默认会在 OceanBase 数据库的 `home_path` 路径下生成 core.${ob_pid} 的文件。
  >
  > - 可以通过 ulimit -a 或者 ulimit -c 查看当前资源的限制，如果设置为 0 或者很小则会在发生节点 core 时无法生产 core 文件的情况。

## **收集堆栈**

### **安装 debuginfo**

在收集堆栈之前，需要先安装一下 oceanbase-ce-debuginfo 包。

> **注意**
>
> 需安装对应 OceanBase 数据库版本的 oceanbase-ce-debuginfo 包，比如当前使用的 OceanBase 数据库版本为：`Server version: 5.7.25 OceanBase 3.1.5 (r100000252023041721-6d73a6764190f46bbc0805dc27eea5ab08e1920c) (Built Apr 17 2023 21:10:15)`，则下载对应的 V3.1.5 版本 oceanbase-ce-debuginfo 包。

1. 下载的 oceanbase-ce-debuginfo 包

   ```shell
   wget https://mirrors.aliyun.com/oceanbase/community/stable/el/7/x86_64/oceanbase-ce-debuginfo-3.1.5-100000252023041721.el7.x86_64.rpm
   ```

2. 安装 debuginfo

   ```shell
   yum install oceanbase-ce-debuginfo-3.1.5-100000252023041721.el7.x86_64.rpm -y
   ```

   如果执行安装命令时提示如下内容，您可以使用 rpm --force 方式安装，示例入下。
  
   提示信息：

   ```shell
   file /usr/lib/debug from install of oceanbase-ce-debuginfo-3.1.5-100000252023041721.el7.x86_64 conflicts with file from package filesystem-3.2-25.el7.x86_64
   ```

   rpm 命令安装：

   ```shell
   rpm -ivh --force oceanbase-ce-debuginfo-3.1.5-100000252023041721.el7.x86_64.rpm
   ```

3. 将安装后的 observer.debug 文件拷贝到跟 OBServer 可执行文件同一级目录下

   ```shell
   [root@x.x.x.x opt]$ rpm -ql oceanbase-ce-debuginfo | grep observer.debug
   /usr/lib/debug/home/admin/oceanbase/bin/observer.debug
   [root@x.x.x.x opt]$ cp /usr/lib/debug/home/admin/oceanbase/bin/observer.debug /home/admin/ob3.1.5/bin/
   ```

### **收集堆栈**

我们需要借助 addr2line 或者 gdb 来收集发生 core 时刻的堆栈：

1. 使用 addr2line 收集堆栈

   ```shell
   # 如果没有 addr2line 命令，需要先安装 
   yum install -y binutils
   
   addr2line -pCfe /home/admin/ob3.1.5/bin/observer 0x9bac9c8 0x9b9d248 0x2b910122b62f 0x2b91019098ed 0x2b9101909783 0x946be28 0x22ed172 0x2b9101866554    0x22e
   safe_backtrace at ??:?
   oceanbase::common::coredump_cb(int, siginfo_t*) at ??:?
   ?? ??:0
   ?? ??:0
   ?? ??:0
   oceanbase::observer::ObServer::wait() at ??:?
   main at ??:?
   ?? ??:0
   _start at ??:?
   ```

2. 使用 gdb 命令收集

## **堆栈分析**

可以将堆栈信息发送到社区问答或者给到对应的社区支持人员，社区同学会帮忙分析处理。
