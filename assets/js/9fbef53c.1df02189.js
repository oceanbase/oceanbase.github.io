"use strict";(self.webpackChunkmy_docs_website=self.webpackChunkmy_docs_website||[]).push([[3916],{80162:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>c,contentTitle:()=>r,default:()=>h,frontMatter:()=>i,metadata:()=>o,toc:()=>l});var n=a(74848),s=a(28453);const i={title:"Factors affecting the performance of OceanBase Database",weight:3},r="3.2 Factors affecting the performance of OceanBase Database",o={id:"user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/influence_factor",title:"Factors affecting the performance of OceanBase Database",description:"The performance of a database is subject to a variety of factors. From the perspective of software, the code, algorithm, and system architecture directly affect the database performance. As a hybrid transactional and analytical processing (HTAP) database with high performance, OceanBase Database has undergone constant improvement in terms of performance and resource utilization during version iterations.",source:"@site/docs/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/02_influence_factor.md",sourceDirName:"user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database",slug:"/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/influence_factor",permalink:"/docs/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/influence_factor",draft:!1,unlisted:!1,editUrl:"https://github.com/oceanbase/oceanbase.github.io/tree/main/docs/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/02_influence_factor.md",tags:[],version:"current",sidebarPosition:2,frontMatter:{title:"Factors affecting the performance of OceanBase Database",weight:3},sidebar:"quick_starts_and_hands_on_practices_in_englishSidebar",previous:{title:"Overview",permalink:"/docs/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/overview_of_test"},next:{title:"Run the Sysbench benchmark",permalink:"/docs/user_manual/quick_starts_and_hands_on_practices_in_english/chapter_03_test_oceanbase_database/sysbench_test"}},c={},l=[{value:"Operating system parameters",id:"operating-system-parameters",level:2},{value:"Resource allocation",id:"resource-allocation",level:2},{value:"Disk partitioning",id:"disk-partitioning",level:3},{value:"Primary zone",id:"primary-zone",level:3},{value:"Partitioned tables",id:"partitioned-tables",level:3},{value:"Table groups",id:"table-groups",level:3},{value:"Local and global indexes",id:"local-and-global-indexes",level:3},{value:"Local indexes",id:"local-indexes",level:4},{value:"Global indexes",id:"global-indexes",level:4},{value:"Database parameter tuning",id:"database-parameter-tuning",level:2},{value:"OLTP scenarios",id:"oltp-scenarios",level:3},{value:"OLAP scenarios",id:"olap-scenarios",level:3},{value:"Major compactions and statistics collection",id:"major-compactions-and-statistics-collection",level:2},{value:"Major compactions",id:"major-compactions",level:3},{value:"Statistics collection",id:"statistics-collection",level:3}];function d(e){const t={a:"a",blockquote:"blockquote",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(t.h1,{id:"32-factors-affecting-the-performance-of-oceanbase-database",children:"3.2 Factors affecting the performance of OceanBase Database"}),"\n",(0,n.jsx)(t.p,{children:"The performance of a database is subject to a variety of factors. From the perspective of software, the code, algorithm, and system architecture directly affect the database performance. As a hybrid transactional and analytical processing (HTAP) database with high performance, OceanBase Database has undergone constant improvement in terms of performance and resource utilization during version iterations."}),"\n",(0,n.jsx)(t.p,{children:"Operating system parameters also affect the database performance. The operating system serves as a bridge between the software and the hardware of the database. Proper parameter configurations enable the operating system to manage resources and execute tasks in a more efficient manner. This involves refined control on core components such as the memory management, process scheduling, and I/O components."}),"\n",(0,n.jsx)(t.p,{children:"After software and hardware resources are properly configured, you can take measures, such as runtime data resource allocation, database parameter tuning, and O&M, to make full use of existing system resources to maximize the database performance without compromising system stability."}),"\n",(0,n.jsx)(t.h2,{id:"operating-system-parameters",children:"Operating system parameters"}),"\n",(0,n.jsx)(t.p,{children:"You can configure network, memory, and I/O parameters properly to optimize the resource utilization and improve the performance."}),"\n",(0,n.jsxs)("table",{children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{children:"Category"}),(0,n.jsx)("th",{children:"Parameter"}),(0,n.jsx)("th",{children:"Description"}),(0,n.jsx)("th",{children:"Recommended value/range"})]})}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{rowspan:"13",children:"Network parameters"}),(0,n.jsx)("td",{children:"net.core.somaxconn"}),(0,n.jsx)("td",{children:"The maximum length of the socket listening queue. Set this parameter to a large value if you frequently establish connections."}),(0,n.jsxs)("td",{children:[(0,n.jsx)("code",{children:"2048"}),". The default value is ",(0,n.jsx)("code",{children:"128"}),"."]})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.core.netdev_max_backlog"}),(0,n.jsx)("td",{children:"The length of the buffer queue processed by the protocol stack. A small value may lead to packet loss."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"10000"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.core.rmem_default"}),(0,n.jsx)("td",{children:"The default size of the receive buffer queue."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"16777216"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.core.wmem_default"}),(0,n.jsx)("td",{children:"The default size of the send buffer queue."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"16777216"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.core.rmem_max"}),(0,n.jsx)("td",{children:"The maximum size of the receive buffer queue."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"16777216"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.core.wmem_max"}),(0,n.jsx)("td",{children:"The maximum size of the send buffer queue."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"16777216"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.ip_local_port_range"}),(0,n.jsx)("td",{children:"The TCP/UDP port range for the local client. The local client uses a port within this range to initiate a connection with a remote client."}),(0,n.jsx)("td",{children:"[3500, 65535]"})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.tcp_rmem"}),(0,n.jsx)("td",{children:"The receive buffer size of the socket. You need to specify three values from left to right: minimum size, default size, and maximum size."}),(0,n.jsxs)("td",{children:[(0,n.jsx)("code",{children:"4096"})," (minimum size), ",(0,n.jsx)("code",{children:"87380"})," (default size), and ",(0,n.jsx)("code",{children:"16777216"})," (maximum size)."]})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.tcp_wmem"}),(0,n.jsx)("td",{children:"The send buffer size of the socket. You need to specify three values from left to right: minimum size, default size, and maximum size."}),(0,n.jsxs)("td",{children:[(0,n.jsx)("code",{children:"4096"})," (minimum size), ",(0,n.jsx)("code",{children:"65536"})," (default size), and ",(0,n.jsx)("code",{children:"16777216"})," (maximum size)."]})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.tcp_max_syn_backlog"}),(0,n.jsx)("td",{children:"The number of connections in the SYN_RECVD state."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"16384"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.tcp_fin_timeout"}),(0,n.jsx)("td",{children:"The duration of the FIN-WAIT-2 state after the socket is proactively disconnected."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"15"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.tcp_tw_reuse"}),(0,n.jsx)("td",{children:"Specifies whether to allow to reuse a socket in the TIME WAIT state."}),(0,n.jsxs)("td",{children:[(0,n.jsx)("code",{children:"1"}),", which means a socket in the TIME WAIT state can be reused."]})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"net.ipv4.tcp_slow_start_after_idle"}),(0,n.jsx)("td",{children:"Specifies whether to allow to perform a slow start when a TCP connection resumes from the idle state. Prohibiting slow start will reduce the network latency in some cases."}),(0,n.jsxs)("td",{children:[(0,n.jsx)("code",{children:"0"}),", which means that slow start is prohibited."]})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{rowspan:"2",children:"Memory parameters"}),(0,n.jsx)("td",{children:"vm.swappiness"}),(0,n.jsx)("td",{children:"Specifies whether to preferentially use the physical memory."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"0"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"vm.max_map_count"}),(0,n.jsx)("td",{children:"The number of virtual memory areas that a process can have."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"655360"})})]}),(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:"AIO parameters"}),(0,n.jsx)("td",{children:"fs.aio-max-nr"}),(0,n.jsx)("td",{children:"The number of asynchronous I/O (AIO) requests."}),(0,n.jsx)("td",{children:(0,n.jsx)("code",{children:"1048576"})})]})]}),"\n",(0,n.jsx)(t.h2,{id:"resource-allocation",children:"Resource allocation"}),"\n",(0,n.jsx)(t.h3,{id:"disk-partitioning",children:"Disk partitioning"}),"\n",(0,n.jsx)(t.p,{children:"An OBServer node depends on syslogs, transaction logs (clogs), and data files when it is running. Storing the log files on the same disk may incur risks due to hardware resource contention."}),"\n",(0,n.jsxs)(t.ul,{children:["\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsxs)(t.p,{children:["When the disk space occupied by clogs exceeds the value of ",(0,n.jsx)(t.a,{href:"https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105665",children:"log_disk_utilization_threshold"}),", which is 80% by default, clog files will be recycled. When the disk space occupied by clogs exceeds the value of ",(0,n.jsx)(t.a,{href:"https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105673",children:"log_disk_utilization_limit_threshold"}),", which is 95% by default, data write will be stopped on the OBServer node."]}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Operations, such as minor compactions and major compactions, that consume extra I/O resources may contend with business read/write requests for I/O resources, leading to business jitters."}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"The resource contention slows down data synchronization in OceanBase Change Data Capture (CDC)."}),"\n"]}),"\n"]}),"\n",(0,n.jsx)(t.p,{children:"You can take the following measures to address the risks:"}),"\n",(0,n.jsxs)(t.ul,{children:["\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"When resources on the OBServer node are sufficient, we recommend that you mount three solid-state drives (SSDs) for storage. If the OBServer node does not have three disks or uses Redundant Array of Independent Disks (RAID) for storage, you need to partition the disks or the logical volumes of the disk array."}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"You can enable log throttling to limit the disk I/O bandwidth available for syslogs. Here is an example:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-sql",children:"alter system set syslog_io_bandwidth_limit='10M';\n"})}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"You can enable syslog recycling and set the maximum number of syslog files. Here is an example:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-sql",children:"alter system set enable_syslog_recycle = true; alter system set max_syslog_file_count = 1000;\n"})}),"\n"]}),"\n"]}),"\n",(0,n.jsx)(t.h3,{id:"primary-zone",children:"Primary zone"}),"\n",(0,n.jsx)(t.p,{children:"In OceanBase Database, a leader is responsible for the read and write requests in strong-consistency scenarios. Therefore, the distribution of partition leaders determines the distribution of business traffic on OBServer nodes."}),"\n",(0,n.jsx)(t.p,{children:"The distribution of leaders is controlled by the primary zone, which describes the distribution preferences of leaders. Leaders carry the strong-consistency read/write business traffic. In other words, the primary zone determines the distribution of traffic in OceanBase Database."}),"\n",(0,n.jsxs)(t.p,{children:["For an OceanBase cluster deployed across multiple nodes, you can set the primary zone to ",(0,n.jsx)(t.code,{children:"RANDOM"})," to scatter leaders of different partitions on nodes in different zones, so as to maximize the resource utilization of each node in the cluster."]}),"\n",(0,n.jsx)(t.h3,{id:"partitioned-tables",children:"Partitioned tables"}),"\n",(0,n.jsx)(t.p,{children:"In OceanBase Database, partitioning allows you to decompose a table into multiple smaller and more manageable parts called partitions based on specific rules. A partitioned table horizontally splits a large table into multiple independent partitions."}),"\n",(0,n.jsx)(t.p,{children:"Partitioning brings the following benefits:"}),"\n",(0,n.jsxs)(t.ul,{children:["\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Higher availability"}),"\n",(0,n.jsx)(t.p,{children:"The unavailability of a partition does not necessarily mean that the entire table is unavailable. The query optimizer automatically removes unreferenced partitions from the query plan. Therefore, queries are not affected when the partitions are unavailable."}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Easier management of database objects"}),"\n",(0,n.jsxs)(t.p,{children:["A partitioned object has pieces that can be managed collectively or separately. You can use DDL statements to operate partitions rather than the whole table or index. Therefore, you can decompose resource-intensive tasks such as the recreation of an index or table. For example, you can move only one partition at a time. If an error occurs, you need to move only the partition again rather than move the table again. In addition, you can execute a ",(0,n.jsx)(t.code,{children:"TRUNCATE"})," statement on a partition to avoid unnecessary deletion of a large amount data."]}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Reduced contention for shared resources in online transaction processing (OLTP) systems"}),"\n",(0,n.jsx)(t.p,{children:"In OLTP scenarios, partitioning can reduce contention for shared resources. For example, a DML operation is performed on many partitions rather than one table."}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Enhanced query performance in data warehouses"}),"\n",(0,n.jsx)(t.p,{children:"In analytical processing (AP) scenarios, partitioning can speed up the processing of ad hoc queries. Partitioning keys can implement filtering. For example, if sales data is partitioned by sales time and you want to query the sales data of a quarter, you need to query only one or several partitions rather than the entire table."}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Better load balancing results"}),"\n",(0,n.jsx)(t.p,{children:"OceanBase Database stores data and implements load balancing by partition. Different partitions can be stored on different OBServer nodes in an OceanBase cluster. Therefore, different partitions of a partitioned table can be distributed on different OBServer nodes so that the data of a table can be evenly distributed across the entire OceanBase cluster."}),"\n"]}),"\n"]}),"\n",(0,n.jsx)(t.h3,{id:"table-groups",children:"Table groups"}),"\n",(0,n.jsx)(t.p,{children:"A table group is a logical concept. It represents a collection of tables. By default, data is randomly distributed to tables. In a distributed scenario, you can define a table group to control the physical closeness among a group of tables, thereby reducing the overhead and improving the performance."}),"\n",(0,n.jsxs)(t.p,{children:["In OceanBase Database V3.x, a table group is a partitioned one and tables joining a table group must have the same partitioning type as the table group. This imposes limitations on tables to be added to a table group. In OceanBase Database V4.2.0 and later, after you define the ",(0,n.jsx)(t.code,{children:"SHARDING"})," attribute, you can flexibly add tables with different partitioning types to a table group."]}),"\n",(0,n.jsxs)(t.p,{children:["Table groups with the ",(0,n.jsx)(t.code,{children:"SHARDING"})," attribute can be classified based on the attribute values."]}),"\n",(0,n.jsxs)(t.ul,{children:["\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsxs)(t.p,{children:["Table groups with the ",(0,n.jsx)(t.code,{children:"SHARDING"})," attribute set to ",(0,n.jsx)(t.code,{children:"NONE"}),": All partitions of all tables in such a table group are aggregated on the same server and the tables can have different partitioning types."]}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsxs)(t.p,{children:["Table groups with ",(0,n.jsx)(t.code,{children:"SHARDING"})," not set to ",(0,n.jsx)(t.code,{children:"NONE"}),": The data of each table in such a table group is distributed to multiple servers. To ensure consistent table data distribution, all tables in the table group must have the same partition definition, including the partitioning type, partition count, and partition value. The system schedules or aligns partitions with the same partition attribute to the same server to implement partition-wise join."]}),"\n"]}),"\n"]}),"\n",(0,n.jsxs)(t.p,{children:["For more information about table groups, see ",(0,n.jsx)(t.a,{href:"https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105763",children:"Reference > Database object management > MySQL mode > Create and manage table groups"})," in OceanBase Database Documentation."]}),"\n",(0,n.jsx)(t.h3,{id:"local-and-global-indexes",children:"Local and global indexes"}),"\n",(0,n.jsx)(t.h4,{id:"local-indexes",children:"Local indexes"}),"\n",(0,n.jsx)(t.p,{children:"Local indexes of a partitioned table are similar to those of a non-partitioned table. The data structure of indexes is also in a one-to-one correspondence with the data structure of the primary table. However, the primary table has been partitioned, so each partition of the primary table has its own separate index data structure. In the index data structure, each key only maps to the primary table in its partition, instead of that in other partitions. Therefore, this type of index is called the local index."}),"\n",(0,n.jsx)(t.h4,{id:"global-indexes",children:"Global indexes"}),"\n",(0,n.jsx)(t.p,{children:"Compared with the local index of a partitioned table, the global index of a partitioned table does not maintain the one-to-one relationship with the partitions of the primary table. Instead, it takes the data of all primary table partitions as a whole. In addition, one key of the global index may map to data in multiple primary table partitions if the index key has duplicate values. Furthermore, for a global index, you can define an independent data distribution mode, which can be the non-partitioned mode or partitioned mode. In partitioned mode, the partition structure of global indexes can be the same as or be different from that of the primary table. The partition mode of a global index is completely independent of that of the primary table, so a global index looks more like a separate table. Therefore, a global index is also called an index table."}),"\n",(0,n.jsx)(t.p,{children:"We recommend that you use global indexes in the following scenarios:"}),"\n",(0,n.jsxs)(t.ul,{children:["\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"In addition to the primary key, combinations of other columns must meet the global uniqueness requirement. This business requirement can only be met by using globally unique indexes."}),"\n"]}),"\n",(0,n.jsxs)(t.li,{children:["\n",(0,n.jsx)(t.p,{children:"Business queries cannot obtain the conditional predicate of the partitioning key, and the business table does not involve high-concurrency parallel write-in. To avoid scanning all partitions, you can create a global index based on the query conditions. When necessary, you can partition the global index based on a new partitioning key."}),"\n"]}),"\n"]}),"\n",(0,n.jsx)(t.p,{children:"Global indexes make it possible to ensure the global uniqueness of data and implement data re-partitioning and also meet the high requirements of some applications to query data from different dimensions. However, each data write operation may become a cross-IDC distributed transaction, which affects the writing performance in high-concurrency writing scenarios. If a business query can obtain the conditional predicate of the partitioning key, we still recommend that you create local indexes in OceanBase Database to exclude unqualified partitions by using the partition pruning feature of the database optimizer. This design considers both the query and writing performance to optimize the overall system performance."}),"\n",(0,n.jsx)(t.h2,{id:"database-parameter-tuning",children:"Database parameter tuning"}),"\n",(0,n.jsx)(t.p,{children:"OceanBase Database V4.x is extensively optimized to improve user experience, ease of use, and performance. You can achieve desired database performance by tuning basic parameters. You can also tune parameters based on the runtime environment and business scenarios to further improve the database performance."}),"\n",(0,n.jsx)(t.h3,{id:"oltp-scenarios",children:"OLTP scenarios"}),"\n",(0,n.jsxs)(t.p,{children:["To configure OceanBase Database parameters, run the ",(0,n.jsx)(t.code,{children:"obclient -h<host_ip> -P<host_port> -uroot@sys -A -p"})," command to connect to the sys tenant, and then execute the following statements:"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-shell",children:"# Disable SQL audit\r\nALTER system SET enable_sql_audit=false;\r\n# Disable information collection for performance events\r\nALTER system SET enable_perf_event=false;\r\n# Set the syslog level to ERROR to reduce generated logs\r\nALTER system SET syslog_level='ERROR';\r\n# Disable trace log recording\r\nalter system set enable_record_trace_log=false;\n"})}),"\n",(0,n.jsxs)(t.p,{children:["To configure OceanBase Database Proxy (ODP) parameters, run the ",(0,n.jsx)(t.code,{children:"obclient -h<host_ip> -P<host_port> -uroot@sys -A -p"})," command to connect to the sys tenant, and then execute the following statements:"]}),"\n",(0,n.jsxs)(t.blockquote,{children:["\n",(0,n.jsx)(t.p,{children:(0,n.jsx)(t.strong,{children:"Note"})}),"\n",(0,n.jsx)(t.p,{children:"To modify ODP parameters, you must log on to the sys tenant of the OceanBase cluster by using the IP address and port of ODP."}),"\n"]}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-shell",children:"# Increase the maximum runtime memory of ODP\r\nALTER proxyconfig SET proxy_mem_limited='4G';\r\n# Disable the compression protocol of ODP\r\nALTER proxyconfig set enable_compression_protocol=false;\n"})}),"\n",(0,n.jsx)(t.h3,{id:"olap-scenarios",children:"OLAP scenarios"}),"\n",(0,n.jsx)(t.p,{children:"To configure OceanBase Database parameters, connect to a user tenant and execute the following statements:"}),"\n",(0,n.jsx)(t.pre,{children:(0,n.jsx)(t.code,{className:"language-shell",children:"# Set the percentage of the SQL workspace memory to the total memory of the tenant\r\nSET GLOBAL ob_sql_work_area_percentage = 80;\r\n# Set the maximum execution time of an SQL statement\r\nSET GLOBAL ob_query_timeout = 36000000000;\r\n# Set the timeout period of transactions\r\nSET GLOBAL ob_trx_timeout = 36000000000;\r\n# Set the maximum size of network packets\r\nSET GLOBAL max_allowed_packet = 67108864;\r\n# Set the number of PX threads that can be requested by the tenant on each node\r\nSET GLOBAL parallel_servers_target = 624;\n"})}),"\n",(0,n.jsx)(t.h2,{id:"major-compactions-and-statistics-collection",children:"Major compactions and statistics collection"}),"\n",(0,n.jsx)(t.h3,{id:"major-compactions",children:"Major compactions"}),"\n",(0,n.jsx)(t.p,{children:"A major compaction compacts all dynamic and static data, which is a time-consuming operation. Specifically, a major compaction compacts SSTables and MEMTables of the current major version with the full static data of an earlier version to generate a new set of full data. During a major compaction, OceanBase Database compresses the data twice: semantics-based encoding within the database and general compression by using the specified compression algorithm. In general compression, the encoded data is compressed by using an algorithm such as LZ4. Compression saves storage space and greatly improves query performance. Compression has a slight impact on data write performance in OceanBase Database, which is built based on the log-structured merge-tree (LSM-tree) architecture."}),"\n",(0,n.jsx)(t.h3,{id:"statistics-collection",children:"Statistics collection"}),"\n",(0,n.jsx)(t.p,{children:"In a database, the optimizer tries to generate the optimal execution plan for each SQL query, most commonly, based on real-time and effective statistics and accurate row estimates. Statistics here refer to optimizer statistics, which are a set of data that describes the tables and columns in a database, and are the key for the cost model to select the optimal execution plan. The optimizer cost model selects an execution plan and optimizes plan selection based on the statistics on the tables, columns, predicates, and other objects involved in a query. Accurate and effective statistics can help the optimizer select the optimal execution plan."}),"\n",(0,n.jsx)(t.p,{children:"In OceanBase Database, the optimizer stores statistics as common data in internal tables and maintains a local cache of statistics to speed up access to statistics. In OceanBase Database of a version earlier than V4.0, statistics are collected during daily major compactions. However, statistics collected in this way are not always accurate because only incremental data is compacted in daily major compactions. In addition, the issue of data skew cannot be resolved because histogram information cannot be collected during daily major compactions. In OceanBase Database V4.0, statistics collection is decoupled from daily major compactions. In other words, statistics are not collected during daily major compactions and execution plans are not affected by daily major compactions."})]})}function h(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,n.jsx)(t,{...e,children:(0,n.jsx)(d,{...e})}):d(e)}},28453:(e,t,a)=>{a.d(t,{R:()=>r,x:()=>o});var n=a(96540);const s={},i=n.createContext(s);function r(e){const t=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:r(e.components),n.createElement(i.Provider,{value:t},e.children)}}}]);