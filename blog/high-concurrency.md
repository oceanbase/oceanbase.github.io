---
slug: high-concurrency
title: High Concurrency of OceanBase
---

As large-scale promotions become the norm, it is a severe challenge for enterprises to ensure a smooth shopping experience for users during peak times, apart from annual shopping festivals such as "Double 11" and "618", by designing their application architecture and database architecture effectively to handle traffic surges. Based on its 10 years of experience in supporting "Double 11" as well as its features of online scaling, high concurrency, and low latency, OceanBase Database can quickly respond to business load changes without affecting the business, thereby improving system throughput during flash sales.

[**Click to see more about scaling solutions for large-scale promotions>>**](https://www.oceanbase.com/solution/ecommerce)

<!-- truncate -->

## **Cases**

[**Haidilao: stable support for holiday traffic peaks**](https://www.oceanbase.com/customer/haidilao)

[**POP MART: handle traffic spikes of a hundredfold during flash sales**](https://www.oceanbase.com/customer/popmart)

## **Key high-concurrency techniques of OceanBase Database**

A database system must ensure both the correctness and high concurrency of the database. **The key to ensure database correctness in high-concurrency scenarios is to ensure the ACID properties of transactions.** Isolation (I) in ACID means that parallel execution of concurrent transactions produces the same effect as serial execution of those transactions. This kind of isolation is a serializable isolation. A serializable isolation is often accompanied by a large amount of conflict wait time or a large number of conflict failures. Therefore, the costs are relatively high.

To provide better performance of concurrent execution, the database has to relax the validation on schedules, allowing more non-serializable schedules to be run. The result of multiple concurrent transactions may no longer be equivalent to the result of any kind of serializable execution. The following promises must be made to regulate the database use: what kinds of errors will occur and what will not. These promises reflect the isolation levels of the database.

Based on three phenomena that can lead to data errors in the concurrent execution of transactions, the SQL-92 standard defines a set of isolation levels. It defines four isolation levels based on whether they allow each of the phenomena. **A critique of ANSI SQL Isolation Levels**, a paper published in 1995, identified a number of problems with the definitions of isolation levels in the SQL-92 standard.

1. The definition of phenomena in SQL-92 is too narrow. It is impossible to achieve serializable isolation even if the three phenomena are excluded.
2. Several new phenomena are added: dirty write, lost update, read skew, and write skew.

### **Consistency of distributed transactions**

For concurrent transactions, distributed databases face more challenges than standalone databases.

**The first challenge is read/write concurrency.**

In distributed database systems, a two-phase commit protocol or rollback compensation mechanism is usually used to ensure atomicity of distributed transactions. Regardless of which mechanism is used, the read/write concurrency problem exists. Take two-phase commit as an example, it involves two phases: prepare phase and commit phase. After all participants are prepared to commit, the coordinator will initiate a commit request to them. It is impossible to guarantee that all participants will commit at the same time in the protocol.

Suppose T1 is a transaction that transfers $50 from account A to account B. T1 is in the process of committing. The modification to account A has been committed, and the modification to account B is being committed. What are the balance values of accounts A and B read by the concurrent transaction T2?

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221222816-a931bbcf-a0ef-4bca-8572-3ec63042a62b.png)

**The other challenge is external consistency that distributed database systems often face.**

Suppose a user places an order on Taobao and the payment is successful.

The order transaction T1 and the payment transaction T2 are located on different servers. T1 and T2 are committed separately. The version number of T1 is 1000, and that of T2 is 800. Assume that the system also has a read transaction T3, whose snapshot version number is 900. T3 can read the successful payment information but cannot read the order information. It violates the business semantics.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221277781-781e9486-aa16-4a67-b0e7-f37a4e6a1172.png)

### **Scheduling algorithms of concurrent transactions**

We have described the challenges brought by concurrent transactions. The behavior of concurrent transactions depends on the scheduling. General concurrent transaction scheduling methods are as follows:

- The first method is two-phase locking. Two-phase locking is a pessimistic concurrency control method that guarantees serializable schedules of concurrent transactions. Different levels of isolation can be implemented by adjusting the strategy of reading and acquiring locks.
- The second method is about concurrency control in an optimistic way, which includes timestamp ordering concurrency control and optimistic concurrency control (OCC).
- The third method is the multi-version concurrency control mechanism that is widely used by popular databases.

This post focuses on two-phase locking and multi-version concurrency control.

### **Two-phase locking**

As the name implies, the two-phase locking protocol involves two phases: the locking phase and the unlocking phase. In the locking phase, each transaction requests the locks that it needs from the lock manager but it cannot release any locks. Each transaction can request for a read or write lock. When the lock manager denies the lock requests, the transactions need to wait. When the transactions enter the unlocking phase, no more lock requests can be made. In database practices, a strict two-phase locking technique is employed. That means transactions can release locks only after they are committed.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221384181-94e3c4f5-fa76-4eee-b9b9-75251890d6d8.png)

Take a look at an example of a strict two-phase locking scheduling case. Assume T1 is a transaction that transfers USD 10 from account A to account B. During the transfer, a mutually exclusive lock is placed on accounts A and B respectively. Transaction T2 requires a read lock to read the balances of accounts A and B. However, due to the mutually exclusive locks, the read request from T2 has to wait. T2 can only release the exclusive locks after transaction T1 is committed. At last, T2 reads the values of accounts A (90) and B (110) and the total value satisfies the constraint that the sum of the two accounts is equal to 200.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221459615-669f85f8-ae26-4d14-a862-179ce623eace.png)

The two-phase locking protocol is relatively simple to implement. But when a transaction finds a lock conflict, the transaction needs to wait, which may reduce the concurrent processing capacity of the database. In addition, multiple concurrent transactions are likely to cause deadlocks because they tend to contend for locks.

### **Multi-version concurrency control**

To solve the problem of read/write conflict, many databases use the mechanism of multi-version concurrency control. The biggest benefit of this mechanism is that readers do not block writers and writers do not block readers, which greatly improves the concurrency capacity of the system.

Take the implementation of multi-version concurrency control in MySQL InnoDB as an example. InnoDB data blocks record the latest version of data. Multiple old versions of data are recorded in undo logs. InnoDB adds two hidden fields to each row: transaction ID field, which records the identifier for the last transaction that modified the row, and a rollback pointer, which points to old versions of data. The initial content of the row can be traced back through the rollback pointer of the current record. Before a transaction modifies a row in InnoDB, it first locks the row with a mutually exclusive lock to prevent other transactions from modifying the row simultaneously. Then, it writes an undo log and a redo log. Finally, it updates the row data, changes the transaction ID of the row to its ID, and points the rollback pointer to the undo log it just wrote. This is a brief process of how a transaction modifies the data in InnoDB.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221536100-26733a35-ce30-4043-a16c-b4db0d47ee1a.png)

Take a look at the read process of a transaction. Before a transaction reads the data, it is assigned a read view, which represents the visible scope of the current transaction. The read view contains several pieces of information. First, the ID of this transaction. Second, the list of active transactions and the upper and lower limits of these transactions. After the read view is assigned, the snapshot of the transaction is established. Then, the transaction reads the row records and checks the row records based on the read view. If the current row is invisible, the rollback pointer is used to find the old versions of data. In the read process, the transaction first checks the current transaction ID of the row. If the ID is in the list of active transactions or larger than the maximum transaction ID of the read view, the row data is invisible to the transaction and the transaction needs to find old versions of data. Otherwise, the row data is visible.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/180072/1604304172889-f4478653-ab85-47e0-976c-957f18321415.png?x-oss-process=image%2Fresize%2Cw_1500)

### **Multi-version management**

OceanBase Database implements multi-version concurrency control based on mutual exclusive locks. The storage engine of OceanBase Database uses an LSM-tree architecture to split data into static data and dynamic data. Dynamic data is stored in MemTables and periodically dumped to the disk. MemTables use B+Tree and dual hash index structures to keep data stored. The B+Tree structure is used for range query while hash indexes are used for single row query.

The leaf nodes of the B+Tree structure store the meta information of the row data. The meta information contains many fields. Only three fields are introduced here: primary key information, lock information, and linked-list pointer.

- Lock information indicates whether a transaction holds a row lock. Before a transaction modifies data, it needs to acquire a row lock.
- A linked-list points to multiple versions of the data. Each version only keeps incremental information. For example, if only one field is modified at a time, only modifications to that field are recorded.

As you can see from the following figure, the row with a primary key equal to 1 has been modified three times. The first modification is an insert operation by a transaction with a version number of 1000. The second modification to the field b is made by a transaction with a version number of 1005. The third modification to the field b is made by a transaction with an infinite version number, indicating that the current transaction is not committed.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/180072/1604307652308-90813d94-5b83-4545-9f6c-e76eb85d2456.png?x-oss-process=image%2Fresize%2Cw_1500)

### **Mechanism and implementation of multi-version concurrency control**

The OceanBase distributed database system schedules transactions to ensure that concurrent transactions do not cause consistency issues. Assume that the system has three concurrent transactions, which are read/write transaction T1, read/only transaction T2, and read/write transaction T3. T1 does not commit and holds a lock on row 1.

T3 needs to acquire the row lock of row 1 before it modifies row 1. The lock of row 1 is held by T1, T3 needs to wait until T1 is committed and the row lock is released. T2 is a read-only transaction with a snapshot version number of 1008. Before T2 reads data, it first finds the metadata of the row by the index structure. Then, it finds the committed data with a maximum version number smaller than the snapshot version number based on the snapshot version number. The following figure shows that T2 is able to read the committed data with version number 1005. The preceding is the internal read/write concurrency control mechanism of OceanBase Database. This mechanism solves the write/write conflicts using the mutually exclusive locks on the rows. A multi-version mechanism is used to ensure that readers do not block writers and writers do not block readers.

The multi-version concurrency control mechanism in OceanBase Database is very simple to implement. The snapshot version is a timestamp. The transaction visibility of row records can be determined by comparing the sizes of timestamps without the need to maintain active transactions. In some distributed database systems, a global transaction manager is maintained, which is used to determine transaction snapshots. If the system has multiple concurrent transactions, the global transaction manager can become the bottleneck of the cluster. OceanBase Database does not need to maintain a global transaction manager. Another point is that the lock information is stored on the row metadata in OceanBase Database, eliminating the need for an additional lock manager.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/180072/1604307986350-c0c98d47-c314-46d0-bda5-9f067e0bc1d8.png?x-oss-process=image%2Fresize%2Cw_1500)

Back to the read/write concurrency problem discussed in the beginning. When T1 is committing, the modification to account A is committed and the modification to account B is being committed. To solve the read/write concurrency problem, a two-phase locking schema is used in some distributed systems. That means T2 needs to acquire a read lock before it can read the balances of accounts A and B after T1 is committed.

In the OceanBase distributed database system, the read request will first find data of the corresponding version based on the snapshot version number. Assume that the version number of the committed transaction T1 is smaller than the snapshot version number of T2. T2 can read modifications made by T1. If T2 finds that row B is in the committing state, T2 needs to wait until row B is committed. This ensures that T2 can read data on both row A and row B. The time window that T2 needs to wait in this scenario starts from the prepare phase and ends at the commit phase. This is much shorter than the time spent to acquire a lock in the two-phase locking process.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221770870-f198b243-22c0-479a-b2eb-2260da52abdc.png)

Another issue that troubles distributed database systems is external consistency.

For example, to purchase a phone on Taobao, you need to place an order first, and then pay for that order. Order placement and payment are two transactions. Assume that they are T1 and T2 respectively and are handled on two servers that generate independent commit versions. The commit version of T1 is 1000 and that of T2 is 800. When you start a query transaction T3, the version number of which is 900, T3 can read the payment information, but not the order information. This does not agree with the actual order of the transactions, and is therefore an external consistency problem.

### **Global timestamp service (GTS)**

**To address external consistency, OceanBase Database introduces the GTS, which assigns snapshot versions and commit versions based on a global timestamp.**

In the following figure, you can see that transactions T1 and T2 each requests a timestamp from GTS upon commit as its commit version. Transaction T3 also requests a timestamp as its snapshot version. GTS ensures that TS1 < TS2 < TS3. In other words, if T3 is able to read data modified by T2, it must also be able to read data modified by T1. External consistency is therefore ensured.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221874136-d344c528-d27d-4ae0-90c8-807e06904eba.png)

### **Early lock release (ELR)**

A nuisance in single-server database systems, hotspot row updates present a bigger challenge for distributed databases. The longer the row locks are held, the more the performance of the update is affected.

Transactions in a distributed database have longer delays than that in a single-server database. Therefore, row locks are held longer in a distributed database. This problem is more serious in a deployment model with five IDCs across three regions, where log synchronization may cause a delay of up to dozens of milliseconds. OceanBase addresses this problem using the ELR feature.

In a conventional database, row locks are added when a transaction is running and released after the transaction is persisted. In OceanBase Database, row locks are also added when a transaction is running. The difference is that locks can be released as soon as the system receives the request to commit the transaction, without waiting for the persistence of the transaction. In the following figure, you can see that transactions take place one after another without ELR. When ELR is enabled, the next transaction is able to acquire locks before the previous transaction is persisted. The duration in which the locks are held is significantly reduced.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/23425/1604221996559-1b3cf217-088a-4046-8935-a2811d47e43b.png)

We measured the time required by each phase of running an OLTP update transaction in a test. It took 60 μs to generate the execution plan, 50 μs to perform the DML operation, 33 μs to write the clog, and an additional 170 μs to synchronize that clog. The transaction held its locks for about 270 μs during the execution process. When ELR is enabled, this duration is reduced by 65%, which means the performance of hotspot row updates can be tripled.

![](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/180072/1604312990338-3c7dfd2d-9224-43a1-ad1f-0b9afd93a30c.png?x-oss-process=image%2Fresize%2Cw_1500)

When you were learning about the ELR feature, some of you may have wondered: What if a preceding transaction fails to persist? How should subsequent transactions be handled?

When one transaction fails, all subsequent transactions must be rolled back. This is what is referred to as a cascading rollback and must be avoided, as pointed out by many papers related to database management. However, in actual application scenarios and tests, the possibility of a transaction failure and cascading rollback is very low.

To support cascading rollback, you must maintain the dependencies among transactions on each hotspot row. You can create a linked list that contain all transactions that modify the same row. This ensures that when a transaction fails, all subsequent transactions can be rolled back. For example, transactions T1, T2, and T3 modify data of the same hotspot row. Before T1 is persisted, it releases the row lock so that T2 may acquire the lock. T2 also releases the lock early for T3 to acquire lock. As a result, T3 depends on T2, and T2 depends on T1. A linked list is created based on these dependencies so that, if T1 is not persisted, both T2 and T3 are rolled back to ensure the data is correct.
