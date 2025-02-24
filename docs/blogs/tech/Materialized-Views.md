---
slug: Materialized-Views
title: 'Explore Data Warehouses with Columnar Storage and Materialized Views of OceanBase Database'
---



> "Making Technology Visible | The OceanBase Preacher Program" is a yearly technical writing contest hosted by OceanBase, and co-sponsored by Modb\.pro, ITPUB, and CSDN, three major tech media platforms. Four rounds are organized to assess articles quarterly. Each year, we award the best writer, or preacher. This article, by Zhang Xiao, is among the most outstanding pieces of round 1.

  

Starting from V4.3, OceanBase Database supports row-based storage, columnar storage, and refreshable materialized views. These features extend the versatility and potential of OceanBase Database. After a year of working with data warehouses, I have recently tested and explored these features. With these features, you can build data warehouses based on OceanBase Database in both stream processing and batch processing scenarios.

1 Feature Comparison
------

### 1.1 Row-based storage versus columnar storage

The classic databases that we are familiar with, such as InnoDB of MySQL and the native storage engine of Oracle, all adopt row-based storage. When I first started in the field, I never imagined that databases with columnstore engines would become necessary. As data volumes grew and large-scale report queries became more complex, the query performance of a database without hardware upgrades began to decline.

Columnar storage is the solution. While row-based storage is designed for transactions, columnar storage is ideal for scenarios where only some columns are read, especially for queries that require just a few columns. Columnar storage also offers a higher compression ratio, incurring less costs when processing larger amounts of business data. Unlike row-based storage, which relies on high-performance storage, columnar storage can work with regular storage, making it an ideal fit for data warehouses.

Instead of simply supporting columnar storage, OceanBase Database V4.3 combines both row-based storage and columnar storage into an integrated architecture, balancing query performance for transaction processing (TP) and analytical processing (AP). This feature caught my attention at the launch event and had me thinking for months about how to apply it to my current work and testing efforts.

### 1.2 Materialized view versus table

Oracle was the first mainstream database to use materialized views. Unlike regular views, materialized views store a physical copy of the query results. This enables fast access to the results of complex queries. Materialized views have continued to evolve, all the way to Oracle Database 23ai.

OceanBase Database V4.3.3 has also made significant progress in its materialized view feature. Some may ask, with columnar storage available, is there still a need for materialized views? Or rather, what are the advantages of materialized views and columnstore tables, and how do their applicable scenarios differ?

I've had the same question, and the answer lies in the storage engine: log-structured merge-tree (LSM-tree).

With the LSM-tree-based storage engine, columnstore tables in OceanBase Database support transactions. This enables streaming writes while ensuring atomicity, consistency, isolation, and durability (ACID), making OceanBase Database an ideal choice for serving as a real-time data warehouse. OceanBase Database also delivers high execution efficiency by supporting parallel queries and multiple replicas. Data warehouses process more reads than writes. In such scenarios, especially when data of only a few columns in wide tables is read, columnar storage provides obvious benefits.

Materialized views, with their refresh mechanism, are ideal for tasks such as aggregation, distribution, and multi-table joins to store the results of common queries on disks. Compared to columnar storage, materialized views, due to their periodic refresh mechanism, are more suited for batch processing. Batch processing is less time-sensitive than stream processing but requires efficient handling of large datasets. Sometimes, batch processing also involves extract, transform, load (ETL) tasks.

2 Build a Real-time Data Warehouse by Using OceanBase Database
---------

### 2.1 Technical requirements for building a real-time data warehouse

As its name suggests, a real-time data warehouse differs from a conventional offline data warehouse in timeliness. In the past, data warehouses usually had a one-day delay in data timeliness (T+1). This is inflexible for metrics requiring real-time computation and immediate results. If a logic issue with the data warehouse occurs, it might not be discovered until the next day, leading to untimely adjustments and reruns of tasks. However, a company has many business metrics that need real-time computation and fast feedback to relevant departments.

To build a real-time data warehouse, the following technical requirements must be met:

**(1) High performance**: The prerequisite to timeliness is high performance. A product suitable for serving as a real-time data warehouse must have extremely low latency, typically ranging from milliseconds to seconds, to ensure timely data processing.

**(2) Data integration**: The upstream of a data warehouse may include databases from various production systems or even offline data files. A product suitable for serving as a real-time data warehouse must offer rich data integration interfaces to meet diverse needs.

**(3) Scalability**: In addition to processing data in real time, a real-time data warehouse must also support instant scaling. An offline data warehouse does not require high scalability because batch jobs are run at night. In contrast, a real-time data warehouse needs high scalability to handle resource bottlenecks and, therefore, ensure timeliness.

**(4) Security**: Timeliness brings higher security requirements, because real-time computation often involves crucial data. This imposes greater security and privacy demands, requiring measures such as data encryption and access control to ensure data security and reliability.

**(5) Flexible querying and analysis**: A real-time data warehouse is used in diverse scenarios, requiring the database to offer rich query and analysis tools that support complex query statements and data analysis models.

### 2.2 Capabilities of OceanBase Database

Timeliness: OceanBase Database V4.3 supports real-time (T+0) writes, allowing data to be imported quickly for real-time analysis.

**(1) High performance**: As mentioned earlier, the columnstore and vectorized engines in OceanBase Database V4.3 significantly boost query performance, especially in wide table scenarios. In my test, OceanBase Database V4.3 is comparable with mainstream columnstore databases in the industry in wide table queries, enabling real-time analysis in seconds. Despite additional overheads incurred by support for transactions, OceanBase Database delivers sufficient performance in columnar storage.

**(2) Data integration**: OceanBase Database V4.3 and later support integration with MySQL and Oracle, as well as integration with other mainstream open source databases such as PostgreSQL and ClickHouse through tools in the Flink ecosystem. Additionally, the direct load feature of OceanBase Database has been enhanced, providing the integration capabilities required for serving as a real-time data warehouse.

**(3) Scalability**: The cloud-native distributed architecture of OceanBase Database supports high-concurrency reads and writes and horizontal scaling based on business needs to handle increasing data volumes and user requests. In my test, replicas and OBServer nodes can be scaled out in minutes. However, the time increases as data and business grow.

**(4) Security**: OceanBase Database V4.3.3 offers enhanced security features such as resource and permission isolation between tenants, database security auditing, data encryption for storage and transmission, network-based access control, and password complexity restrictions, meeting the Level 3 requirements of Multi-Level Protection Scheme (MLPS).

**(5) Flexible querying and analysis**: OceanBase Database V4.3.3 supports most common data types, including `ARRAY`. The database also supports both the rule-based optimizer (RBO) and the cost-based optimizer (CBO). With additional features such as full-text index, vector retrieval, columnar storage, and materialized views, OceanBase Database is well-suited for flexible querying and analysis.

### 2.3 Demo for building a real-time data warehouse

Here is a demo for building a real-time data warehouse by using OceanBase Database based on its columnar storage.

Data source 1: MySQL 8  
Data source 2: PostgreSQL 14  
Real-time data warehouse: OceanBase Database Community Edition V4.3.3  
Data synchronization tool: Flink CDC

a. Create a MySQL table and insert data into it.

```
    CREATE TABLE orders (
        order_id INT AUTO_INCREMENT,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        customer_name VARCHAR(100),
        price DECIMAL(10, 2),
        product_id INT,
        order_status BOOLEAN,
        PRIMARY KEY (order_id)
    );
    
    INSERT INTO orders (customer_name, price, product_id, order_status) VALUES
    ('Alice', 19.99, 101, TRUE),
    ('Bob', 29.99, 102, FALSE),
    ('Charlie', 39.99, 103, TRUE),
    ('David', 49.99, 104, TRUE);
```    
    

b. Create a table in Flink CDC for synchronizing data from the MySQL table.

```    
    CREATE TABLE mysql_source (
        order_id INT,
        order_date TIMESTAMP(0),
        customer_name STRING,
        price DECIMAL(10, 5),
        product_id INT,
        order_status BOOLEAN,
        PRIMARY KEY (order_id) NOT ENFORCED
    ) WITH (
        'connector' = 'mysql-cdc', 
        'hostname' = '192.16.1.10', 
        'port' = '3306',
        'username' = 'test', 
        'password' = 'password', 
        'database-name' = 'test', 
        'table-name' = 'orders' 
    );
```    
    

c. Create a PostgreSQL table and insert data into it.

```    
    CREATE TABLE products (
        product_id INT PRIMARY KEY,
        product_name VARCHAR(100),
        product_description TEXT
    );
    
    INSERT INTO products (product_id, product_name, product_description) VALUES
    (101, 'Laptop', 'High performance laptop'),
    (102, 'Smartphone', 'Latest model smartphone'),
    (103, 'Tablet', 'Portable and lightweight tablet'),
    (104, 'Headphones', 'Noise-cancelling headphones');
```    
    

d. Create a table in Flink CDC for synchronizing data from the PostgreSQL table.

```    
    CREATE TABLE postgres_source (
        product_id INT,
        product_name STRING,
        product_description STRING,
        PRIMARY KEY (product_id) NOT ENFORCED
    ) WITH (
        'connector' = 'postgres-cdc', 
        'hostname' = '192.168.10.11', 
        'port' = '5432', 
        'username' = 'test', 
        'password' = 'password', 
        'database-name' = 'test', 
        'schema-name' = 'public', 
        'table-name' = 'products'
    );
```    
    

e. Create a target columnstore table in OceanBase Database.

```    
    CREATE TABLE joined_orders (
        order_id INT,
        order_date TIMESTAMP,
        customer_name VARCHAR(100),
        price DECIMAL(10, 2),
        product_name VARCHAR(100),
        product_description TEXT,
        order_status BOOLEAN,
        PRIMARY KEY (order_id)
    ) WITH COLUMN GROUP (each column);
```    
    

f. Create a join view in Flink based on the fields of the target table in OceanBase Database.
```
    CREATE VIEW joined_orders AS
    SELECT
        o.order_id,
        o.order_date,
        o.customer_name,
        o.price,
        p.product_name,
        p.product_description,
        o.order_status
    FROM mysql_source AS o
    JOIN postgres_source AS p ON o.product_id = p.product_id;
```    
    

g. Configure a write task for Flink CDC.  
*The steps are not described here.*

f. Verify the result.  
If all previous steps are successful, you can find the following query result:
```
    SELECT * FROM joined_orders;
    +----------+---------------------+---------------+-------+--------------+---------------------------------+--------------+
    | order_id | order_date          | customer_name | price | product_name | product_description             | order_status |
    +----------+---------------------+---------------+-------+--------------+---------------------------------+--------------+
    |        1 | 2024-11-19 00:00:00 | Alice         | 19.99 | Laptop       | High performance laptop         |            1 |
    |        2 | 2024-11-19 00:00:01 | Bob           | 29.99 | Smartphone   | Latest model smartphone         |            0 |
    |        3 | 2024-11-19 00:00:02 | Charlie       | 39.99 | Tablet       | Portable and lightweight tablet |            1 |
    |        4 | 2024-11-19 00:00:03 | David         | 49.99 | Headphones   | Noise-cancelling headphones     |            1 |
    +----------+---------------------+---------------+-------+--------------+---------------------------------+--------------+
```    

Insert data into the source tables.

```    
    INSERT INTO orders (customer_name, price, product_id, order_status) VALUES ('Eve', 59.99, 105, TRUE);
    ---- the MySQL table
    
    INSERT INTO products (product_id, product_name, product_description) VALUES (105, 'Smartwatch', 'Advanced smartwatch with health tracking features'); ---- the PostgreSQL table
```    
    

After committing data, you can query the latest result from the target table in OceanBase Database in real time.
```
    SELECT * FROM joined_orders;
    +----------+---------------------+---------------+-------+--------------+---------------------------------------------------+--------------+
    | order_id | order_date          | customer_name | price | product_name | product_description                               | order_status |
    +----------+---------------------+---------------+-------+--------------+---------------------------------------------------+--------------+
    |        1 | 2024-11-19 00:00:00 | Alice         | 19.99 | Laptop       | High performance laptop                           |            1 |
    |        2 | 2024-11-19 00:00:01 | Bob           | 29.99 | Smartphone   | Latest model smartphone                           |            0 |
    |        3 | 2024-11-19 00:00:02 | Charlie       | 39.99 | Tablet       | Portable and lightweight tablet                   |            1 |
    |        4 | 2024-11-19 00:00:03 | David         | 49.99 | Headphones   | Noise-cancelling headphones                       |            1 |
    |        5 | 2024-11-19 00:00:05 | Eve           | 59.99 | Smartwatch   | Advanced smartwatch with health tracking features |            1 |
    +----------+---------------------+---------------+-------+--------------+---------------------------------------------------+--------------+
```

### 2.4 Summary

The preceding demo, where two tables are joined to output results, is simple and mainly aims to verify timeliness. In essence, OceanBase Database, with its high performance in columnar storage and its read/write splitting feature based on multiple replicas, works as a simplified real-time data warehouse. In this demo, OceanBase Database works with Flink CDC to serve as a real-time data warehouse, ensuring latency within seconds.

Due to limited resources and time, this demo does not cover larger data volumes or more complex calculations and is intended only as a reference. Given the opportunity, I'll provide a more detailed version in the future.

3 Build a Batch Processing Data Warehouse by Using OceanBase Database
-------

### 3.1 Technical requirements for building a batch processing data warehouse

A batch processing data warehouse is a conventional data warehouse that relies on batch processing technologies. Typically, ETL tasks are run at scheduled times to extract data from the source system, transform and cleanse it, and then load it into the data warehouse. A batch processing data warehouse has low timeliness demands but imposes other requirements on the database:

**(1) Storage capability**: A batch processing data warehouse processes and stores far more data than a real-time data warehouse and thus requires higher throughput and more efficient data compression.

**(2) Data processing capability**: A batch processing data warehouse has broader data processing requirements than a real-time data warehouse. In addition to support for common object types and SQL, large-scale parallel computing is required to process hundreds of gigabytes of data every day. For complex reports, techniques such as index acceleration are needed to maximize performance.

**(3) Data consistency**: Transaction support is often required during the execution of multiple complex ETL tasks to load, transform, compute, and persist data. In addition, constraints such as primary keys, unique keys, and non-null keys are needed to ensure data consistency and quality.

**(4) Security and data integration**: The requirements are similar to those of a real-time data warehouse.

### 3.2 Capabilities of OceanBase Database

**(1) Storage capability**: In various customer cases and my test with hundreds of gigabytes of data imported, OceanBase Database meets the requirements of a batch processing data warehouse for high throughput and storage capabilities. Additionally, columnar storage optimizes performance, minimizes storage space usage, and supports efficient data compression for large data volumes.

**(2) Data processing capability**: OceanBase Database V4.3 has introduced column-based vectorized engine 2.0, which significantly boosts query performance in AP scenarios. This equips OceanBase Database with large-scale parallel computing capabilities, enabling it to process hundreds of gigabytes of data every day as long as enough resources are allocated. The materialized view feature pre-calculates and stores query results in materialized views to improve real-time query performance, which is especially useful for querying complex reports.

**(3) Data consistency**: As mentioned earlier, OceanBase Database supports transactions during the execution of multiple complex ETL tasks. This ensures data consistency during data loading, transformation, computation, and persistence. Constraints such as primary keys, unique keys, and not-null keys are supported in both row-based storage and columnar storage, which alleviates my concerns about data consistency.

**(4) Security and data integration**: The capabilities are similar to those provided for building a real-time data warehouse.

  

### 3.3 Demo for building a batch processing data warehouse based on materialized views

My exploration of batch processing data warehouses is primarily based on the materialized views of OceanBase Database. Here, I simulate a batch processing data warehouse scenario to verify how materialized views speed up data queries.

> Test data: TPC-H 10 GB/20 GB
>
> Test statements: Multi-table queries and direct materialized view queries
>
> Test version: OceanBase Database Community Edition V4.3.3

a. Create TPC-H tables.

Create eight **columnstore** tables based on TPC-H requirements.
```
    CREATE TABLE NATION  ( N_NATIONKEY  INTEGER NOT NULL,
                            N_NAME       VARCHAR(25) NOT NULL,
                            N_REGIONKEY  INTEGER NOT NULL,
                            N_COMMENT    VARCHAR(152),
                            PRIMARY KEY (N_NATIONKEY)
                        )WITH COLUMN GROUP (each column);
    
    CREATE TABLE REGION  ( R_REGIONKEY  INTEGER NOT NULL,
                            R_NAME       VARCHAR(25) NOT NULL,
                            R_COMMENT    VARCHAR(152),
                            PRIMARY KEY (R_REGIONKEY)
                        )WITH COLUMN GROUP (each column);
    
    CREATE TABLE PART  ( P_PARTKEY     INTEGER NOT NULL,
                              P_NAME        VARCHAR(55) NOT NULL,
                              P_MFGR        VARCHAR(25)  NOT NULL,
                              P_BRAND       VARCHAR(10)  NOT NULL,
                              P_TYPE        VARCHAR(25) NOT NULL,
                              P_SIZE        INTEGER NOT NULL,
                              P_CONTAINER   VARCHAR(10) /*CHAR(10)*/ NOT NULL,
                              P_RETAILPRICE DECIMAL(15,2) NOT NULL,
                              P_COMMENT     VARCHAR(23) NOT NULL,
                            PRIMARY KEY (P_PARTKEY)
                        )WITH COLUMN GROUP (each column);
    
    CREATE TABLE SUPPLIER ( S_SUPPKEY     INTEGER NOT NULL,
                                 S_NAME        VARCHAR(25) NOT NULL,
                                 S_ADDRESS     VARCHAR(40) NOT NULL,
                                 S_NATIONKEY   INTEGER NOT NULL,
                                 S_PHONE       VARCHAR(15) NOT NULL,
                                 S_ACCTBAL     DECIMAL(15,2) NOT NULL,
                                 S_COMMENT     VARCHAR(101) NOT NULL,
                            PRIMARY KEY (S_SUPPKEY)
                            )WITH COLUMN GROUP (each column);
    
    CREATE TABLE PARTSUPP ( PS_PARTKEY     INTEGER NOT NULL,
                                 PS_SUPPKEY     INTEGER NOT NULL,
                                 PS_AVAILQTY    INTEGER NOT NULL,
                                 PS_SUPPLYCOST  DECIMAL(15,2)  NOT NULL,
                                 PS_COMMENT     VARCHAR(199) NOT NULL,
                             PRIMARY KEY (PS_PARTKEY, PS_SUPPKEY)
                            )WITH COLUMN GROUP (each column);
    
    CREATE TABLE CUSTOMER ( C_CUSTKEY     INTEGER NOT NULL,
                                 C_NAME        VARCHAR(25) NOT NULL,
                                 C_ADDRESS     VARCHAR(40) NOT NULL,
                                 C_NATIONKEY   INTEGER NOT NULL,
                                 C_PHONE       VARCHAR(15)  NOT NULL,
                                 C_ACCTBAL     DECIMAL(15,2)   NOT NULL,
                                 C_MKTSEGMENT  VARCHAR(10)  NOT NULL,
                                 C_COMMENT     VARCHAR(117) NOT NULL,
                            PRIMARY KEY (C_CUSTKEY)
                            )WITH COLUMN GROUP (each column);
    
    CREATE TABLE ORDERS  ( O_ORDERKEY       BIGINT NOT NULL,
                               O_CUSTKEY        INTEGER NOT NULL,
                               O_ORDERSTATUS    VARCHAR(1) NOT NULL,
                               O_TOTALPRICE     DECIMAL(15,2) NOT NULL,
                               O_ORDERDATE      DATE NOT NULL,
                               O_ORDERPRIORITY  VARCHAR(15)  NOT NULL,  
                               O_CLERK          VARCHAR(15)  NOT NULL, 
                               O_SHIPPRIORITY   INTEGER NOT NULL,
                               O_COMMENT        VARCHAR(79) NOT NULL,
                            PRIMARY KEY (O_ORDERKEY)
                            )WITH COLUMN GROUP (each column);
    
    CREATE TABLE LINEITEM ( L_ORDERKEY    BIGINT NOT NULL,
                                 L_PARTKEY     INTEGER NOT NULL,
                                 L_SUPPKEY     INTEGER NOT NULL,
                                 L_LINENUMBER  INTEGER NOT NULL,
                                 L_QUANTITY    INTEGER  NOT NULL,
                                 L_EXTENDEDPRICE  DECIMAL(15,2) NOT NULL,
                                 L_DISCOUNT    DECIMAL(15,2) NOT NULL,
                                 L_TAX         DECIMAL(15,2) NOT NULL,
                                 L_RETURNFLAG  VARCHAR(1) NOT NULL,
                                 L_LINESTATUS  VARCHAR(1) NOT NULL,
                                 L_SHIPDATE    DATE NOT NULL,
                                 L_COMMITDATE  DATE NOT NULL,
                                 L_RECEIPTDATE DATE NOT NULL,
                                 L_SHIPINSTRUCT VARCHAR(25)  NOT NULL,
                                 L_SHIPMODE     VARCHAR(10) NOT NULL,
                                 L_COMMENT      VARCHAR(44) NOT NULL,
                             PRIMARY KEY (L_ORDERKEY, L_LINENUMBER)
                            )WITH COLUMN GROUP (each column);
```
  

b. Use the data generation tool to generate a 10 GB dataset.
```
    ./dbgen -s 10
```

c. Import the 10 GB dataset after configuring [secure\_file\_priv](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001715689).
```
    SET SESSION ob_query_timeout = 1000000000000
```

d. Execute a TPC-H query and record the execution time. Here, I execute Q11 and record an execution time of 3.33 seconds.
```
    select
        ps_partkey,
        sum(ps_supplycost * ps_availqty) as value
    from
        partsupp,
        supplier,
        nation
    where
        ps_suppkey = s_suppkey
        and s_nationkey = n_nationkey
        and n_name = 'GERMANY'
    group by
        ps_partkey having
        sum(ps_supplycost * ps_availqty) > (
            select
            sum(ps_supplycost * ps_availqty) * 0.000002
            from
                partsupp,
                supplier,
                nation
            where
                ps_suppkey = s_suppkey
                and s_nationkey = n_nationkey
                and n_name = 'GERMANY'
        )
    order by
        value desc;
```

e. Create a materialized view based on Q11.
```
    CREATE MATERIALIZED VIEW mv_q11
    REFRESH COMPLETE ON DEMAND
    AS
    select
        ps_partkey,
        sum(ps_supplycost * ps_availqty) as value
    from
        partsupp,
        supplier,
        nation
    where
        ps_suppkey = s_suppkey
        and s_nationkey = n_nationkey
        and n_name = 'GERMANY'
    group by
        ps_partkey having
        sum(ps_supplycost * ps_availqty) > (
            select
            sum(ps_supplycost * ps_availqty) * 0.000002
            from
                partsupp,
                supplier,
                nation
            where
                ps_suppkey = s_suppkey
                and s_nationkey = n_nationkey
                and n_name = 'GERMANY'
        )
    order by
        value desc;
```

f. Clear the cache, query the materialized view, and record the execution time. Here, the execution time is 0.46 seconds, achieving a 7 times performance boost.
```
    select * from mv_q11;
```

As the data volume grows, the performance gains from the materialized view become more evident. For example, in a production environment where tens of gigabytes of data are generated daily, incremental refreshes, such as those at a 6-hour interval, of the materialized views in OceanBase Database deliver better performance.
```
    CREATE MATERIALIZED VIEW mv_q11
    REFRESH FORCE
    START WITH SYSDATE
    NEXT SYSDATE + 6/24  
    AS
    select
        ps_partkey,
        sum(ps_supplycost * ps_availqty) as value
    from
        partsupp,
        supplier,
        nation
    where
        ps_suppkey = s_suppkey
        and s_nationkey = n_nationkey
        and n_name = 'GERMANY'
    group by
        ps_partkey having
        sum(ps_supplycost * ps_availqty) > (
            select
            sum(ps_supplycost * ps_availqty) * 0.000002
            from
                partsupp,
                supplier,
                nation
            where
                ps_suppkey = s_suppkey
                and s_nationkey = n_nationkey
                and n_name = 'GERMANY'
        )
    order by
        value desc;
```
  

### 3.4 Summary

It is evident that the query efficiency of columnstore tables still lags significantly behind that of materialized views stored on disks. In data warehouses with fixed queries or common reports involving a large amount of data, materialized views that are periodically refreshed can greatly reduce the system overhead.

In fact, materialized views are at the top layer of a data warehouse, which is often referred to as the data mart or report layer. Below the top layer are the summary, foundation, and operational data store (ODS) layers, which can be transformed into columnstore tables in OceanBase Database through batch ETL tasks to deliver higher performance than rowstore tables.

  

4 Afterword
-------

OceanBase Database, known for its row-based storage and transaction processing (TP) capabilities, surprised me with its excellence in columnar storage, especially after I verified the performance disparity between row-based and columnar storage. The columnar storage technology is well suited for data warehouses. In columnar storage mode, the data of each column is stored as an independent SSTable, and the SSTables of all columns are combined into a virtual SSTable as baseline data in columnar storage. This design allows you to perform transactional operations on columnstore tables as on rowstore tables, improving both performance and the compression ratio. In the future, OceanBase Database may offer more new features for enhancement.

In batch processing data warehouses, the materialized view feature of OceanBase Database pre-processes complex queries and stores the results, which speeds up queries while reducing reliance on external ETL tools. What I haven't covered in this article is that the materialized views of OceanBase Database support flexible refresh strategies, including full refresh and on-demand refresh, allowing you to choose the one that best suits your needs. From my personal experience, I have observed that materialized views in OceanBase Database outperform those in other Chinese databases.

To keep the article concise, I haven't covered how to build the ODS, data warehouse detail (DWD), data warehouse service (DWS), and application layers. The new columnstore engine can significantly improve the efficiency of these layers. I've moved the test data at these layers to columnstore tables in OceanBase Database and conducted numerous tests. The test result shows that ETL tasks that used to take hours are now at least twice as fast due to the acceleration based on columnar storage. If the computation logic is adapted to columnar storage, the speed will improve even further.

Thanks to Modb\.pro for reminding me to finish this article before the deadline.