---
slug: ob-openai
title: 'Build Your Own Document Q&A App with OceanBase and OpenAI in 30 mins'
---

## ✨ Intro: Vector Search Is the Core of AI Applications

AI-powered applications are evolving fast, and one of the most exciting capabilities is the RAG (Retrieval-Augmented Generation) pattern — combining language models like OpenAI’s GPT with your own data for accurate, contextual answers.

At the heart of any RAG system is a vector database — storing and searching embeddings for documents, questions, images, and more. Most developers turn to purpose-built vector DBs, but what if you could use a general-purpose distributed SQL database with native vector capabilities?

That’s where OceanBase comes in.

In this post, we’ll show you how to:

- Turn your documents into embeddings using OpenAI
- Store and index them in OceanBase
- Run fast vector similarity search using SQL
- Generate answers using GPT based on retrieved content

Let’s build a simple but powerful document Q&A system — using only OceanBase, OpenAI, and Python.

Prerequisites

>1. Install Python 3.9 or above and corresponding pip.
>
>2. Install poetry, pyobvector, and OpenAI SDK.
>
> ```bash
> python3 -m pip install poetry
> python3 -m pip install pyobvector
> python3 -m pip install openai
> ```
>
>3. Prepare your [OpenAI API key](https://platform.openai.com/api-keys).
>
>4. Make sure you have set the ob_vector_memory_limit_percentage configuration item in your instance to enable vector retrieval. The recommended setting is 30

## 🔍 Why Use OceanBase for Vector Search?

OceanBase is a distributed relational database, originally developed by Ant Group, and now available as a fully open source, MySQL-compatible database.

In its latest release, OceanBase added native support for vector indexing and search — including:

- Vector data type and distance functions (L2, IP)
- Index-based nearest neighbor search
- Seamless SQL integration for hybrid queries
- Cost-effective storage and horizontal scalability

This means you can store structured data + vector embeddings in one system, run fast retrieval with SQL, and build AI features without extra infrastructure.

## ⚙️ Step-by-Step: Document Q&A with OceanBase and OpenAI

If you have deployed OceanBase database V4.3.3 or above, created MySQL mode tenants, databases, and accounts, and granted read and write permissions to the database accounts, you can skip steps 1 and 2 below.

### 1. Set Up OceanBase

You can install OceanBase locally using OceanBase Community Edition by following the [official doc - Deploy OceanBase Database in a Docker container](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001976348).

### 2. Create MySQL tenant and database

#### 2.1 Create a unit config

**Step 1:**

Log in to the sys tenant of the cluster as the root user.

```bash
obclient -h172.30.xx.xx -P2883 -uroot@sys#cluster -p**** -A
```

**Step 2:**

Access the database named oceanbase.

```sql
USE oceanbase;
```

**Step 3:**

Query the DBA_OB_UNIT_CONFIGS view for information about existing unit configs.

```sql
obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS;
+----------------+-------------------------------+----------------------------+----------------------------+---------+---------+-------------+---------------+----------+----------+-------------+
| UNIT_CONFIG_ID | NAME                          | CREATE_TIME                | MODIFY_TIME                | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS | MIN_IOPS | IOPS_WEIGHT |
+----------------+-------------------------------+----------------------------+----------------------------+---------+---------+-------------+---------------+----------+----------+-------------+
|              1 | sys_unit_config               | 2022-12-20 17:50:17.035504 | 2022-12-20 17:50:17.035504 |       1 |       1 | 14495514624 |   14495514624 |    10000 |    10000 |           1 |
|           1001 | config_mysql001_zone1_S1_okz  | 2022-12-20 18:04:31.547715 | 2022-12-20 18:04:31.547715 |     1.5 |     1.5 |  6442450944 |   19327352832 |    15000 |    15000 |           1 |
|           1002 | config_mysql001_zone2_S1_pme  | 2022-12-20 18:04:31.561335 | 2022-12-20 18:04:31.561335 |     1.5 |     1.5 |  6442450944 |   19327352832 |    15000 |    15000 |           1 |
|           1003 | config_mysql001_zone3_S1_jsu  | 2022-12-20 18:04:31.564510 | 2022-12-20 18:04:31.564510 |     1.5 |     1.5 |  6442450944 |   19327352832 |    15000 |    15000 |           1 |
|           1013 | config_oracle001_zone3_S1_exu | 2022-12-26 18:28:37.969047 | 2022-12-26 18:28:37.969047 |     1.5 |     1.5 |  6442450944 |   19327352832 |    15000 |    15000 |           1 |
|           1014 | config_oracle001_zone2_S1_hli | 2022-12-26 18:28:37.972194 | 2022-12-26 18:28:37.972194 |     1.5 |     1.5 |  6442450944 |   19327352832 |    15000 |    15000 |           1 |
|           1015 | config_oracle001_zone1_S1_owy | 2022-12-26 18:28:37.976446 | 2022-12-26 18:28:37.976446 |     1.5 |     1.5 |  6442450944 |   19327352832 |    15000 |    15000 |           1 |
+----------------+-------------------------------+----------------------------+----------------------------+---------+---------+-------------+---------------+----------+----------+-------------+
7 rows in set
```

**Step 4:**

Execute the CREATE RESOURCE UNIT statement to create a unit config.

```sql
CREATE RESOURCE UNIT unit_name 
    MEMORY_SIZE [=] 'size_value',
    MAX_CPU [=] cpu_num,  
    [MAX_IOPS [=] iops_num,]
    [MIN_CPU [=] cpu_num,]
    [MIN_IOPS [=] iops_num,]
    [IOPS_WEIGHT [=]iopsweight,]
    [LOG_DISK_SIZE [=] 'size_value'];
```

Here is an example:
Create a unit config named S1_unit_config that contains one CPU core, 5 GB of memory, and 6 GB of log disk space.

```sql
obclient [oceanbase]> CREATE RESOURCE UNIT S1_unit_config
                MEMORY_SIZE = '5G',
                MAX_CPU = 1, MIN_CPU = 1,
                LOG_DISK_SIZE = '6G',
                MAX_IOPS = 10000, MIN_IOPS = 10000, IOPS_WEIGHT=1;
```

**Step 5:**

Query the DBA_OB_UNIT_CONFIGS view to verify whether the unit config is successfully created.

```sql
obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_UNIT_CONFIGS WHERE NAME = 'S1_unit_config';
+----------------+----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+----------+----------+-------------+
| UNIT_CONFIG_ID | NAME           | CREATE_TIME                | MODIFY_TIME                | MAX_CPU | MIN_CPU | MEMORY_SIZE | LOG_DISK_SIZE | MAX_IOPS | MIN_IOPS | IOPS_WEIGHT |
+----------------+----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+----------+----------+-------------+
|           1020 | S1_unit_config | 2023-01-10 22:31:38.805862 | 2023-01-10 22:31:38.805862 |       1 |       1 |  5368709120 |    6442450944 |    10000 |    10000 |           1 |
+----------------+----------------+----------------------------+----------------------------+---------+---------+-------------+---------------+----------+----------+-------------+
1 row in set
```

#### 2.2 Create a resource pool

**Step 1:**

Log in to the sys tenant of the cluster as the root user.

```sql
obclient -h172.30.xx.xx -P2883 -uroot@sys#cluster -p**** -A
```

**Step 2:**

Access the database named oceanbase.

```sql
obclient [(none)]> USE oceanbase;
```

**Step 3:**

Query the DBA_OB_RESOURCE_POOLS view for the configuration information about resource pools.

```sql
obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_RESOURCE_POOLS;
+------------------+--------------------------+-----------+----------------------------+----------------------------+------------+----------------+-------------------+--------------+
| RESOURCE_POOL_ID | NAME                     | TENANT_ID | CREATE_TIME                | MODIFY_TIME                | UNIT_COUNT | UNIT_CONFIG_ID | ZONE_LIST         | REPLICA_TYPE |
+------------------+--------------------------+-----------+----------------------------+----------------------------+------------+----------------+-------------------+--------------+
|                1 | sys_pool                 |         1 | 2022-12-20 17:50:17.038641 | 2022-12-20 17:50:17.045453 |          1 |              1 | zone1;zone2;zone3 | FULL         |
|             1001 | pool_mysql001_zone3_jsu  |      1002 | 2022-12-20 18:04:31.607227 | 2022-12-20 18:04:31.692836 |          1 |           1003 | zone3             | FULL         |
|             1002 | pool_mysql001_zone1_okz  |      1002 | 2022-12-20 18:04:31.617087 | 2022-12-20 18:04:31.691827 |          1 |           1001 | zone1             | FULL         |
|             1003 | pool_mysql001_zone2_pme  |      1002 | 2022-12-20 18:04:31.621327 | 2022-12-20 18:04:31.692836 |          1 |           1002 | zone2             | FULL         |
|             1013 | pool_oracle001_zone3_exu |      1010 | 2022-12-26 18:28:37.979539 | 2022-12-26 18:28:38.059505 |          1 |           1013 | zone3             | FULL         |
|             1014 | pool_oracle001_zone1_owy |      1010 | 2022-12-26 18:28:37.988964 | 2022-12-26 18:28:38.058440 |          1 |           1015 | zone1             | FULL         |
|             1015 | pool_oracle001_zone2_hli |      1010 | 2022-12-26 18:28:37.994241 | 2022-12-26 18:28:38.059505 |          1 |           1014 | zone2             | FULL         |
+------------------+--------------------------+-----------+----------------------------+----------------------------+------------+----------------+-------------------+--------------+
7 rows in set
```

**Step 4:**

Execute the CREATE RESOURCE POOL statement to create a resource pool.

```sql
CREATE RESOURCE POOL poolname 
    UNIT [=] unitname, 
    UNIT_NUM [=] unitnum, 
    ZONE_LIST [=] ('zone' [, 'zone' ...]);
```
Here is an example:

Create a resource pool named mq_pool_01, a resource unit for each of zone1 and zone2, and a unit config named S1_unit_config for the resource units.
```sql
obclient [oceanbase]> CREATE RESOURCE POOL mq_pool_01 
                UNIT='S1_unit_config', 
                UNIT_NUM=1, 
                ZONE_LIST=('zone1','zone2'); 
```

**Step 5:**

Query the DBA_OB_RESOURCE_POOLS view to verify whether the resource pool is successfully created.

```sql
obclient [oceanbase]> SELECT * FROM DBA_OB_RESOURCE_POOLS WHERE NAME = 'mq_pool_01';
+------------------+------------+-----------+----------------------------+----------------------------+------------+----------------+-------------+--------------+
| RESOURCE_POOL_ID | NAME       | TENANT_ID | CREATE_TIME                | MODIFY_TIME                | UNIT_COUNT | UNIT_CONFIG_ID | ZONE_LIST   | REPLICA_TYPE |
+------------------+------------+-----------+----------------------------+----------------------------+------------+----------------+-------------+--------------+
|             1024 | mq_pool_01 |      NULL | 2023-01-10 22:37:08.212366 | 2023-01-10 22:37:08.212366 |          1 |           1020 | zone1;zone2 | FULL         |
+------------------+------------+-----------+----------------------------+----------------------------+------------+----------------+-------------+--------------+
1 row in set
```

#### 2.3 Create a tenant

**Step 1:**

Log in to the sys tenant of the cluster as the root user.

```bash
obclient -h172.30.xx.xx -P2883 -uroot@sys#cluster -p**** -A
```

**Step 2:**

Access the database named oceanbase.

```sql
USE oceanbase;
```

**Step 3:**

Query the DBA_OB_TENANTS view for information about all tenants.

```sql
obclient [oceanbase]> SELECT * FROM oceanbase.DBA_OB_TENANTS;
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | CREATE_TIME                | MODIFY_TIME                | PRIMARY_ZONE | LOCALITY      | PREVIOUS_LOCALITY | COMPATIBILITY_MODE | STATUS | IN_RECYCLEBIN | LOCKED | TENANT_ROLE | SWITCHOVER_STATUS | SWITCHOVER_EPOCH | SYNC_SCN            | REPLAYABLE_SCN      | READABLE_SCN        | RECOVERY_UNTIL_SCN  | LOG_MODE     | ARBITRATION_SERVICE_STATUS |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
|         1 | sys         | SYS         | 2023-05-17 18:10:19.940353 | 2023-05-17 18:10:19.940353 | RANDOM       | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1001 | META$1002   | META        | 2023-05-17 18:15:21.455549 | 2023-05-17 18:15:36.639479 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1002 | mysql001    | USER        | 2023-05-17 18:15:21.461276 | 2023-05-17 18:15:36.669988 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684395321137516636 | 1684395321137516636 | 1684395321052204807 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
|      1003 | META$1004   | META        | 2023-05-17 18:18:19.927859 | 2023-05-17 18:18:36.443233 | zone1        | FULL{1}@zone1 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 |                NULL |                NULL |                NULL |                NULL | NOARCHIVELOG | DISABLED                   |
|      1004 | oracle001   | USER        | 2023-05-17 18:18:19.928914 | 2023-05-17 18:18:36.471606 | zone1        | FULL{1}@zone1 | NULL              | ORACLE             | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684395321137558760 | 1684395321137558760 | 1684395320951813345 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+---------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
5 rows in set
```

**Step 4:**

Execute the CREATE TENANT statement to create a tenant.

```sql
CREATE TENANT [IF NOT EXISTS] tenant_name  
    PRIMARY_ZONE [=] zone,
    RESOURCE_POOL_LIST [=](poolname [, poolname...])
    [ENABLE_ARBITRATION_SERVICE = {true | false}]
    {SET | SET VARIABLES | VARIABLES} system_var_name = expr [,system_var_name = expr] ...
```

Here is an example:

Create a tenant named mq_t1, which is a MySQL tenant by default. Set the number of replicas to 2, resource pool to mq_pool_01, and primary zone to zone1, and allow all IP addresses to connect to the tenant.

The list of zones where the tenant is distributed is inherited from the ZONE_LIST attribute of the resource pool specified by RESOURCE_POOL_LIST. The number of replicas of the tenant is the same as the number of zones specified by the ZONE_LIST attribute of the resource pool specified by RESOURCE_POOL_LIST. The number of resource units in each zone is equal to the value of the UNIT_NUM attribute of the resource pool specified by RESOURCE_POOL_LIST. The unit config for the resource units of the tenant is determined by the UNIT attribute of the resource pool specified by RESOURCE_POOL_LIST.

```sql
obclient [oceanbase]> CREATE TENANT IF NOT EXISTS mq_t1 
                PRIMARY_ZONE='zone1', 
                RESOURCE_POOL_LIST=('mq_pool_01')
                set OB_TCP_INVITED_NODES='%';
```

**Step 5:**

Query the DBA_OB_TENANTS view to verify whether the tenant is successfully created.

```sql
obclient [oceanbase]> SELECT * FROM DBA_OB_TENANTS WHERE TENANT_NAME = 'mq_t1';
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+------------------------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
| TENANT_ID | TENANT_NAME | TENANT_TYPE | CREATE_TIME                | MODIFY_TIME                | PRIMARY_ZONE | LOCALITY                     | PREVIOUS_LOCALITY | COMPATIBILITY_MODE | STATUS | IN_RECYCLEBIN | LOCKED | TENANT_ROLE | SWITCHOVER_STATUS | SWITCHOVER_EPOCH | SYNC_SCN            | REPLAYABLE_SCN      | READABLE_SCN        | RECOVERY_UNTIL_SCN  | LOG_MODE     | ARBITRATION_SERVICE_STATUS |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+------------------------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
|      1006 | mq_t1       | USER        | 2023-05-18 15:48:57.447657 | 2023-05-18 15:49:12.857944 | zone1;zone2  | FULL{1}@zone1, FULL{1}@zone2 | NULL              | MYSQL              | NORMAL | NO            | NO     | PRIMARY     | NORMAL            |                0 | 1684396167132057328 | 1684396167132057328 | 1684396167051160964 | 4611686018427387903 | NOARCHIVELOG | DISABLED                   |
+-----------+-------------+-------------+----------------------------+----------------------------+--------------+------------------------------+-------------------+--------------------+--------+---------------+--------+-------------+-------------------+------------------+---------------------+---------------------+---------------------+---------------------+--------------+----------------------------+
1 row in set
```

**Step 6:**

After the tenant is created, try to log in to the tenant.
By default, the password of the administrator user is empty. The administrator user is named root in MySQL mode. You must change its password as soon as possible.

- Log in to the mq_t1 tenant as the root user.

```sql
obclient -h172.30.xx.xx -P2883 -uroot@mq_t1#cluster  -A
```

- Execute the following statement to change the password of the root user:

```sql
obclient [(none)]> ALTER USER root IDENTIFIED BY '****';
Query OK, 0 rows affected
```

**Step 7:**

After the password is changed, log in to the tenant again.

```sql
obclient -h172.30.xx.xx -P2883 -uroot@mq_t1#cluster -p**** -A
```

### 3. Register an account on the LLM platform

Obtain an OpenAI API key:

**Steps:**

1. Log in to the [OpenAI](https://platform.openai.com/) console.
2. In the upper-right corner, click API Keys.
3. Click Create API Key.
4. Fill in the required information and click Create API Key.

Configure the OpenAI API key as an environment variable:

- For a Unix-based system (such as Ubuntu or MacOS), run the following command in the terminal:

```bash
export OPENAI_API_KEY='your-api-key'
```

- For a Windows system, run the following command in the command prompt:

```bash
set OPENAI_API_KEY=your-api-key
```

**Make sure to replace your-api-key with your actual OpenAI API key.**

### 4. Store vector data to OceanBase Database

After you have completed the preceding steps, you can store vector data to OceanBase Database.

#### 4.1 Store vector data in OceanBase Database

**Step 1:**
Prepare test data.
Download the [CSV](https://help-static-aliyun-doc.aliyuncs.com/file-manage-files/zh-CN/20240827/srxyhu/fine_food_reviews.csv) file that contains pre-computed vectorized data. The CSV file contains 1,000 reviews of food and the last column contains the vectorized values. Therefore, you do not need to compute the vectors again. You can also use the following code to recalculate the embedding column (i.e., the vector column) and generate a new CSV file.

```python
from openai import OpenAI
import pandas as pd
input_datapath = "./fine_food_reviews.csv"
client = OpenAI()
# You can change the text-embedding-ada-002 model to another one as needed.
def embedding_text(text, model="text-embedding-ada-002"):
    # For more information about how to generate embedding vectors, see: https://community.openai.com/t/embeddings-api-documentation-needs-to-updated/475663
    res = client.embeddings.create(input=text, model=model)
    return res.data[0].embedding
df = pd.read_csv(input_datapath, index_col=0)
# It takes a few minutes to generate vectors. The OpenAI Embedding API is called for each row.
df["embedding"] = df.combined.apply(embedding_text)
output_datapath = './fine_food_reviews_self_embeddings.csv'
df.to_csv(output_datapath)
```

**Step 2:**
Run the following script to insert the test data into OceanBase Database. The directory where the script is located must be the same as the directory where the test data is located.

```python
    import os
    import sys
    import csv
    import json
    from pyobvector import *
    from sqlalchemy import Column, Integer, String
    # Connect to OceanBase Database by using pyobvector. Replace @ in the username and password with %40.
    client = ObVecClient(uri="host:port", user="username",password="****",db_name="test")
    # The prepared test dataset has been vectorized. By default, the dataset is stored in the same directory as the Python script. If you have vectorized the dataset yourself, replace the file name with the name of the corresponding file.
    file_name = "fine_food_reviews.csv"
    file_path = os.path.join("./", file_name)
    # Define columns. The vectorized column is the last field.
    cols = [
        Column('id', Integer, primary_key=True, autoincrement=False),
        Column('product_id', String(256), nullable=True),
        Column('user_id', String(256), nullable=True),
        Column('score', Integer, nullable=True),
        Column('summary', String(2048), nullable=True),
        Column('text', String(8192), nullable=True),
        Column('combined', String(8192), nullable=True),
        Column('n_tokens', Integer, nullable=True),
        Column('embedding', VECTOR(1536))
    ]
    # Specify the table name.
    table_name = 'fine_food_reviews'
    # Create the table if it does not exist.
    if not client.check_table_exists(table_name):
        client.create_table(table_name,columns=cols)
        # Create an index for the vector column.
        client.create_index(
            table_name=table_name,
            is_vec_index=True,
            index_name='vidx',
            column_names=['embedding'],
            vidx_params='distance=l2, type=hnsw, lib=vsag',
        )
    # Open and read the CSV file.
    with open(file_name, mode='r', newline='', encoding='utf-8') as csvfile:
        csvreader = csv.reader(csvfile)
        # Read the header row.
        headers = next(csvreader)
        print("Headers:", headers)
        batch = [] # Store data. Insert the data into the database in batches of 10 rows.
        for i, row in enumerate(csvreader):
            # The CSV file has nine fields: id, product_id, user_id, score, summary, text, combined, n_tokens, and embedding.
            if not row:
                break
            food_review_line= {'id':row[0],'product_id':row[1],'user_id':row[2],'score':row[3],'summary':row[4],'text':row[5],\
            'combined':row[6],'n_tokens':row[7],'embedding':json.loads(row[8])}
            batch.append(food_review_line)
            # Insert data in batches of 10 rows.
            if (i + 1) % 10 == 0:
                client.insert(table_name,batch)
                batch = []  # Clear the cache.
        # Insert the remaining rows (if any).
        if batch:
            client.insert(table_name,batch)
    # Check the data in the table to make sure that all data has been inserted.
    count_sql = f"select count(*) from {table_name};"
    cursor = client.perform_raw_text_sql(count_sql)
    result = cursor.fetchone()
    print(f"Total number of imported rows:{result[0]}")
```

#### 4.2 Query OceanBase data

**Step 1:**
Save the following Python script as openAIQuery.py

```python
    import os
    import sys
    import csv
    import json
    from pyobvector import *
    from sqlalchemy import func
    from openai import OpenAI
    # Get the command-line arguments.
    if len(sys.argv) != 2:
        print("Please enter a query statement.")
        sys.exit()
    queryStatement = sys.argv[1]
    # Connect to OceanBase Database by using pyobvector. Replace @ in the username or password with %40.
    client = ObVecClient(uri="host:port", user="usename",password="****",db_name="test")
    openAIclient = OpenAI()
    # Define a function to generate text vectors.
    def generate_embeddings(text, model="text-embedding-ada-002"):
        # For more information about how to create embedding vectors, see: https://community.openai.com/t/embeddings-api-documentation-needs-to-updated/475663
        res = openAIclient.embeddings.create(input=text, model=model)
        return res.data[0].embedding

    def query_ob(query, tableName, vector_name="embedding", top_k=1):
        embedding = generate_embeddings(query)
        # Perform approximate nearest neighbor search.
        res = client.ann_search(
            table_name=tableName,
            vec_data=embedding,
            vec_column_name=vector_name,
            distance_func=func.l2_distance,
            topk=top_k,
            output_column_names=['combined']
        )
        for row in res:
            print(str(row[0]).replace("Title: ", "").replace("; Content: ", ": "))
    # Specify the table name.
    table_name = 'fine_food_reviews'
    query_ob(queryStatement,table_name,'embedding',1)
```

**Step 2:**
Enter a question and obtain the relevant answer.

```bash
python3 openAIQuery.py 'pet food'
```

The expected result is as follows:

> Crack for dogs. These thing are like crack for dogs. I am not sure of the make-up but the doggies sure love them.

### 5. Summary

✅ Result: A Lightweight, End-to-End Q&A App

You now have a working document-based Q&A system that:

- Uses OpenAI to generate vector embeddings
- Stores and indexes them in OceanBase
- Runs fast retrieval with pure SQL
- Uses GPT to answer based on real content

No need for extra vector DBs or complex infrastructure — just one OceanBase instance and a few lines of Python.

🧭 What’s Next?

- 📄 Add metadata (source, tags) to build a smarter retrieval system
- 🚀 Scale to millions of documents — OceanBase supports large-scale deployments with strong consistency

### 6. References

1. [ob + openAI](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001976365)
2. [create a tenant](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971591)
3. [Deploy OceanBase Database in a container](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001976348)
