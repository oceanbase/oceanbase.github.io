---
slug: troubleshoot
title: 'Five Steps to Troubleshoot Process Crashes Based on Logs'
---

> About the author: Hu Chengqing, a database administrator (DBA) at Action Technology, specializes in fault analysis and performance optimization. For further discussion, subscribe to his blogs on [Jianshu](https://www.jianshu.com/u/a95ec11f67a8).  
> This article is original content from the open source community of Action Technology. Unauthorized use is prohibited. For reposts, please contact the editor and cite the source.  
> It will take you about 5 minutes to read the following content.

Background
----

The observer process crashes are hard to diagnose. They are typically caused by program bugs, corrupt files, bad disk sectors, or bad memory blocks.

A core dump file is automatically configured during the cluster deployment to capture memory information in the event of process crashes. It contains a snapshot of the program status at failure and the stack information for all threads, which are useful in debugging and crash analysis.

Sometimes, the core dump file may fail to be generated. In such cases, we must obtain stack information from `observer.log` to pinpoint the crash location in code and identify the cause. This method is what this article will discuss.

_This method applies to OceanBase Database of all versions as of the article's publication._

Procedure
----

### 1\. Find the crash logs

The observer process generates a section of logs similar to the following one upon a crash. You only need to search by the **CRASH ERROR** keywords.

```
    CRASH ERROR!!! sig=11, sig_code=2, \
    sig_addr=7f3edd31dffb, timestamp=1725496052323606, \
    tid=57605, tname=TNT_L0_1002, \
    trace_id=20970917872454-1707004480400037, \
    extra_info=((null)), lbt=0x9baead8 \
    0x9b9f358 0x7f43d58e562f \
    0x7f43d52525fc 0x95eeda9 \
    0x95ec568 0x95e6c0c \
    0x95e4c33 0x9cbf4c7 \
    0x93be9ee 0x939e320 \
    0x93bd64e 0x939c105 \
    0x939c6e6 0x2cff1c1 \
    0x9918a74 0x9917461 0x9913f1e
```


### 2\. Obtain the stack information of the crashed threads

Parse memory addresses to get the stack information, where each memory address corresponds to one stack frame.
```
    addr2line -pCfe /home/admin/oceanbase/bin/observer \
    0x9baead8 0x9b9f358 0x7f43d58e562f 0x7f43d52525fc \
    0x95eeda9 0x95ec568 0x95e6c0c 0x95e4c33 0x9cbf4c7 \
    0x93be9ee 0x939e320 0x93bd64e 0x939c105 0x939c6e6 \
    0x2cff1c1 0x9918a74 0x9917461 0x9913f1e
```    


The output is as follows:

*   Check the stack information from the top down, and ignore the first four lines, which are the fixed stack for processing crashes.
*   The crash occurs at line 5, in the `ObMPStmtExecute::copy_or_convert_str` function.

```
        safe_backtrace at ??:?
        oceanbase::common::coredump_cb(int, siginfo_t*) at ??:?
        ?? ??:0
        ?? ??:0
        oceanbase::observer::ObMPStmtExecute::copy_or_convert_str(oceanbase::common::ObIAllocator&, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, oceanbase::common::ObString const&, oceanbase::common::ObString&, long) at ??:?
        oceanbase::observer::ObMPStmtExecute::parse_basic_param_value(oceanbase::common::ObIAllocator&, unsigned int, oceanbase::common::ObCharsetType, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, char const*&, oceanbase::common::ObTimeZoneInfo const*, oceanbase::common::ObObj&) at ??:?
        oceanbase::observer::ObMPStmtExecute::parse_param_value(oceanbase::common::ObIAllocator&, unsigned int, oceanbase::common::ObCharsetType, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, char const*&, oceanbase::common::ObTimeZoneInfo const*, oceanbase::sql::TypeInfo*, oceanbase::sql::TypeInfo*, oceanbase::common::ObObjParam&, short) at ??:?
        oceanbase::observer::ObMPStmtExecute::before_process() at ??:?
        oceanbase::rpc::frame::ObReqProcessor::run() at ??:?
        oceanbase::omt::ObWorkerProcessor::process_one(oceanbase::rpc::ObRequest&, int&) at ??:?
        oceanbase::omt::ObWorkerProcessor::process(oceanbase::rpc::ObRequest&) at ??:?
        oceanbase::omt::ObThWorker::process_request(oceanbase::rpc::ObRequest&) at ??:?
        oceanbase::omt::ObThWorker::worker(long&, long&, int&) at ??:?
        non-virtual thunk to oceanbase::omt::ObThWorker::run(long) at ??:?
        oceanbase::lib::CoKThreadTemp<oceanbase::lib::CoUserThreadTemp<oceanbase::lib::CoSetSched> >::start()::{lambda()#1}::operator()() const at ??:?
        oceanbase::lib::CoSetSched::Worker::run() at ??:?
        oceanbase::lib::CoRoutine::__start(boost::context::detail::transfer_t) at ??:?
        trampoline at safe_snprintf.c:?
```

### 3\. Locate the line of code where the crash occurs

To locate the last line of code executed within the `ObMPStmtExecute::copy_or_convert_str` function, use GNU Debugger (GDB) 9.0 or later on the debug version to parse the memory addresses.

```
    ## Download the debug package of the corresponding version. If you are using an enterprise version, contact OceanBase Technical Support.
    https://mirrors.aliyun.com/oceanbase/community/stable/el/7/x86_64/
    
    ## Install the debug package.
    rpm2cpio oceanbase-ce-debuginfo-3.1.5-100010012023060910.el7.x86_64.rpm |cpio -div
    
    ## Use GDB to open the binary file.
    gdb ./usr/lib/debug/home/admin/oceanbase/bin/observer.debug
    
    ## Parse the memory addresses.
    (gdb) list *0x95eeda9
    0x95eeda9 is in oceanbase::observer::ObMPStmtExecute::copy_or_convert_str(oceanbase::common::ObIAllocator&, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, oceanbase::common::ObString const&, oceanbase::common::ObString&, long) (./src/observer/mysql/obmp_stmt_execute.cpp:1428).
    (gdb) list *0x95ec568
    0x95ec568 is in oceanbase::observer::ObMPStmtExecute::parse_basic_param_value(oceanbase::common::ObIAllocator&, unsigned int, oceanbase::common::ObCharsetType, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, char const*&, oceanbase::common::ObTimeZoneInfo const*, oceanbase::common::ObObj&) (./src/observer/mysql/obmp_stmt_execute.cpp:1237).
    (gdb) list *0x95e6c0c
    0x95e6c0c is in oceanbase::observer::ObMPStmtExecute::parse_param_value(oceanbase::common::ObIAllocator&, unsigned int, oceanbase::common::ObCharsetType, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, char const*&, oceanbase::common::ObTimeZoneInfo const*, oceanbase::sql::TypeInfo*, oceanbase::sql::TypeInfo*, oceanbase::common::ObObjParam&, short) (./src/observer/mysql/obmp_stmt_execute.cpp:1372).
    (gdb) list *0x95e4c33
    0x95e4c33 is in oceanbase::observer::ObMPStmtExecute::before_process() (./src/observer/mysql/obmp_stmt_execute.cpp:512).
    507    in ./src/observer/mysql/obmp_stmt_execute.cpp
```


Additional information:

The call stack in this case is as follows:
```
    ...
    ->ObMPStmtExecute::before_process() 
    -->ObMPStmtExecute::parse_param_value(oceanbase::common::ObIAllocator&, unsigned int, oceanbase::common::ObCharsetType, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, char const*&, oceanbase::common::ObTimeZoneInfo const*, oceanbase::sql::TypeInfo*, oceanbase::sql::TypeInfo*, oceanbase::common::ObObjParam&, short)
    --->ObMPStmtExecute::parse_basic_param_value(oceanbase::common::ObIAllocator&, unsigned int, oceanbase::common::ObCharsetType, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, char const*&, oceanbase::common::ObTimeZoneInfo const*, oceanbase::common::ObObj&)
    ---->ObMPStmtExecute::copy_or_convert_str(oceanbase::common::ObIAllocator&, oceanbase::common::ObCollationType, oceanbase::common::ObCollationType, oceanbase::common::ObString const&, oceanbase::common::ObString&, long) 
```    

### 4\. Analyze the code

The crash occurs within the `ObMPStmtExecute::copy_or_convert_str` function at **obmp\_stmt\_execute.cpp:1428**.

![Line 1428](http://action-weikai.oss-accelerate.aliyuncs.com/20241022/filename.png)

#### Purpose of the function

The `ObMPStmtExecute::copy_or_convert_str` function copies or converts the string specified by `src`, a request parameter from the statement protocol, based on the specified character set, and stores the result in `out`. `sig=11` in the crash information refers to signal 11, which indicates that the program accessed an invalid memory address. This is usually because a null pointer is used or the accessed memory is already released.

The crash occurs at `MEMCPY(buf + extra_buf_len, src.ptr(), src.length());`, where the `MEMCPY` function copies the source string to the allocated memory.

*   **buf + extra\_buf\_len**: the target address, which is the offset of the buffer pointer `buf` plus `extra_buf_len`
*   **src.ptr()**: the pointer to the source string
*   **src.length()**: the length of the source string, which specifies the number of bytes to be copied

Here, we can conclude that `src.ptr()` is a null pointer. If a core dump file is available, all you need to do for confirmation is to print the pointer variable by using GDB.

### 5\. Search the knowledge base

Search the official knowledge base by the name of the crashed function, which is **copy\_or\_convert\_str** in this case and find the corresponding [bug](https://www.oceanbase.com/knowledge-base/oceanbase-database-1000000000430545?back=kb).

_The code snippet where the crash occurs matches the bug description: When the `execute` protocol is processed, the `send long data` protocol has not finished handling `param_data`, causing the `execute` protocol to read a null pointer during the conversion of `param_data` and triggering a crash._

Conclusion
--

In most cases, you can analyze logs by following the preceding five steps to quickly identify the cause of an observer process crash. I hope you find this article useful.