---
slug: image-search-vector-search
title: '[OceanBase Practices] Building an Image Search Application Based on the Vector Search Technology of OceanBase Database'
---

# [OceanBase Practices] Building an Image Search Application Based on the Vector Search Technology of OceanBase Database

> This article is a contest entry of [「Making Technology Visible | The OceanBase Preacher Program 2024」](https://open.oceanbase.com/blog/essay-competition), a technical writing contest. If you are a tech enthusiast, participate in this contest to bring code to life with your words while getting a chance to win a ¥10,000 prize!

## 1. Introduction to Vector Search

OceanBase Database offers powerful vector search capabilities, allowing you to use dense floating-point vectors with up to 16,000 dimensions and to calculate various distance metrics such as Manhattan distance, Euclidean distance, inner product, and cosine similarity. Its vector indexes are based on Hierarchical Navigable Small World (HNSW), a technology that supports incremental updates and deletes without affecting the recall rate. OceanBase Database also supports fusion queries with scalar filtering and provides flexible access methods. You can execute SQL queries based on the MySQL protocol by using a client written in any programming language or by using the Python SDK. In addition, OceanBase Database has adapted to artificial intelligence (AI) application development frameworks, such as LlamaIndex and DB-GPT, and the AI application development platform Dify to expand the support for AI application development.

### 1.1 Key terms

#### (1) Unstructured data

Unstructured data refers to data without a defined format or structure, including text, images, audio, videos, social media content, emails, and log files. Due to the complexity and variety of unstructured data, processing it requires specific tools and technologies such as natural language processing, image recognition, and machine learning.

#### (2) Vector

A vector is the projection of an object in a high-dimensional space. Mathematically, a vector is a floating-point array with the following characteristics:

Each element in the array is a floating-point number that represents a dimension of the vector.

The size, namely, the number of elements, of the vector array indicates the dimensionality of the entire vector space.

#### (3) Embedding

Embedding is a process of extracting the content and semantics from unstructured data such as images and videos through deep learning based on the neural network to convert the unstructured data into feature vectors. The embedding technology maps raw data from a high-dimensional (sparse) space to a low-dimensional (dense) space and converts multimodal data with abundant features into a multidimensional array (vector).

#### (4) Vector similarity search

In an era of exponential data growth, users often need to quickly retrieve required information from massive amounts of data. For example, for an online literature database, the product catalog of an e-commerce platform, or a constantly growing multimedia content library, an efficient search system is required to quickly locate content of interest for users. Given the increasing amounts of data, conventional keyword-based search methods can no longer meet the requirements of users on search accuracy and speed. The vector search technology thus emerges. Vector similarity search converts unstructured data such as text, images, and audio into vectors through feature extraction and vectorization techniques, and then measures their similarity to capture deep semantic information of the data, thereby providing more accurate and efficient search results.

### 1.2 Scenarios

*   **RAG**  
    Retrieval-augmented generation (RAG) is an AI framework that retrieves facts from external knowledge bases to provide the most accurate and latest information for large language models (LLMs). It not only boosts the quality of model-generated content but also deepens users' understanding of the generation process. The RAG technology is often used in conjunction with retrieval and generation techniques in intelligent Q&A systems and knowledge bases to accelerate information retrieval and processing efficiency.
*   **Personalized recommendation**  
    The recommendation system can recommend content that users may be interested in based on their historical behavior and preferences. After receiving a recommendation request, the system calculates the similarity based on the characteristics of the user, and then returns items that the user may be interested in as the recommendation results. This technology is commonly used in recommendations for restaurants and tourist attractions to precisely meet user needs.
*   **Image/Text search**  
    An image/text search task aims to find results in a large-scale image/text database that are most similar to the specified image or text. By storing image or text characteristics in a vector database and using efficient indexing techniques for similarity calculation, the system can quickly return the matching results. This technology applies to scenarios such as facial recognition, delivering an accurate and efficient search experience.

## 2. Core Features of Vector Search

OceanBase Database can store, index, and retrieve vector data. The following table describes the core features.

| **Core feature**    | **Description**                                                    |
|---------------------|--------------------------------------------------------------------|
| Vector data type    | You can store floating-point vectors with up to 16,000 dimensions. |
| Vector indexes      | Exact search and approximate nearest neighbor search (ANNS) are supported. You can calculate the L2 distance, inner product distance, and cosine distance. HNSW indexes are supported. An index column can contain up to 2,000 dimensions. |
| Operators for vector search | Basic operators, such as addition, subtraction, multiplication, comparison, and aggregation operators, are supported.|

Observe the following limitations:

*   By default, OceanBase Database uses the nullsFirst comparison mode, in which NULL values are placed first during sorting. We recommend that you add a `NOT NULL` condition in queries.
*   You cannot define both a vector index and a full-text index on the same table.

## 3. Architecture of an Image Search Application

An image search application stores images as vectors in a database. When you upload an image through the corresponding user interface (UI), the application converts the image into a vector, searches the database for similar vectors, and displays the similar vectors as images on the UI.

![image-20241130234246523](https://cnlog-img-xybdiy.oss-cn-shanghai.aliyuncs.com/img/202412032205573.png)

## 4. Procedure

### 4.1 Use Docker to deploy OceanBase Database

Install and start Docker.
```
    root@oceanbase:~# apt-get install docker-ce
    Reading package lists... Done
    Building dependency tree... Done
    Reading state information... Done
    docker-ce is already the newest version (5:27.3.1-1~ubuntu.24.04~noble).
    0 upgraded, 0 newly installed, 0 to remove and 26 not upgraded.
    
    root@oceanbase:~# systemctl start docker && systemctl enable docker
    Synchronizing state of docker.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
    Executing: /usr/lib/systemd/systemd-sysv-install enable docker
    root@oceanbase:~# systemctl status docker
```

Run the following command to start the Docker container of OceanBase Database for installation:
```
    docker run --name=ob433 -e MODE=mini -e OB_MEMORY_LIMIT=8G -e OB_DATAFILE_SIZE=10G -e OB_CLUSTER_NAME=ailab2024 -e OB_SERVER_IP=127.0.0.1 -p 127.0.0.1:2881:2881 -d quay.io/oceanbase/oceanbase-ce:4.3.3.1-101000012024102216
```

Run the following command to check whether the boot process of OceanBase Database is completed:
```
    docker logs -f ob433
```

> It takes 2–3 minutes for initialization. Once "boot success!" appears, the boot process is completed and you can press **Ctrl+C** to exit the log view.

![image-20241202233404049](https://cnlog-img-xybdiy.oss-cn-shanghai.aliyuncs.com/img/202412032205630.png)

### 4.2 Test the connectivity of OceanBase Database

After installing OceanBase Database by using a Docker container, run the following command to test the database connectivity:
```
    root@oceanbase:~/image-search# mysql -h127.0.0.1 -P2881 -uroot@test -A -p
    Enter password:
    Welcome to the MySQL monitor.  Commands end with ; or \g.
    Your MySQL connection id is 3221487647
    Server version: 5.7.25 OceanBase_CE 4.3.3.1 (r101000012024102216-2df04a2a7a203b498f23e1904d4b7a000457ce43) (Built Oct 22 2024 17:42:50)
    
    Copyright (c) 2000, 2024, Oracle and/or its affiliates.
    
    Oracle is a registered trademark of Oracle Corporation and/or its
    affiliates. Other names may be trademarks of their respective
    owners.
    
    Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
    
    mysql>
```

### 4.3 Enable vector search in OceanBase Database

> Before using vector indexes, estimate the memory usage based on the index data of a tenant and configure an upper limit. For example, the following command sets the maximum vector index memory to 30% of the tenant's total memory:
```
    mysql> ALTER SYSTEM SET ob_vector_memory_limit_percentage = 30;
    Query OK, 0 rows affected (0.01 sec)
```

The default value of `ob_vector_memory_limit_percentage` is `0`, which means no memory is allocated for vector indexes. In this case, an error occurs when you create an index.

### 4.4 Clone the project code repository to your local server

```
    git clone https://gitee.com/oceanbase-devhub/image-search.git
    cd image-search
```

![image-20241202233532784](https://cnlog-img-xybdiy.oss-cn-shanghai.aliyuncs.com/img/202412032205401.png)

### 4.5 Install dependencies
```
    poetry install
```

If the following output is displayed, all dependencies have been installed:
```
    root@oceanbase:~/image-search# poetry install --no-root
    Installing dependencies from lock file
    
    No dependencies to install or update
```

### 4.6 Set environment variables

```
    # Run this command in the /image-search path.
    $ cp .env.example .env
    # Update the database information in the .env file.
    vim .env
```

Update the following parameters in the `.env` file as needed. For other parameters, keep their default values.
```
    HF_ENDPOINT=https://hf-mirror.com
    
    DB_HOST="127.0.0.1"   ## The IP address of the tenant
    DB_PORT="2881"   ## The port number
    DB_USER="root@test" ## The username of the tenant
    DB_NAME="test"   ## The database name
    DB_PASSWORD=""  ## The password corresponding to the username of the tenant
```

### 4.7 Upload your image dataset to the server

> Upload your image dataset to a specific server directory and take note of its absolute path. In this case, the absolute path is `/home/ubuntu/zebra/`.

![image-20241203211702633](/img/blogs/tech/image-search-vector-search/image/202412032205613.png)

> You can also use the command-line window to check whether the image dataset is successfully uploaded.

![image-20241203212152736](https://cnlog-img-xybdiy.oss-cn-shanghai.aliyuncs.com/img/202412032205552.png)

### 4.8 Start the image search application


> Run the following command to start the image search application:

    poetry run streamlit run --server.runOnSave false image_search_ui.py

![image-20241203000401007](https://cnlog-img-xybdiy.oss-cn-shanghai.aliyuncs.com/img/202412032205658.png)

> If the application is successfully started, the output shown in the following figure is displayed.

![image-20241203213937547](https://cnlog-img-xybdiy.oss-cn-shanghai.aliyuncs.com/img/202412032205556.png)

> Use one of the URLs to access the UI of the image search application.

![image-20241203214220422](/img/blogs/tech/image-search-vector-search/image/202412032205459.png)

### 4.9 Open the UI of the image search application


> In **Image Base** under **Loading Setting**, enter the absolute path of the directory where the images are stored on the server. Click **Load Images**. Once the images are loaded, you can perform image search operations.

![image-20241203212247459](/img/blogs/tech/image-search-vector-search/image/202412032205465.png)

> Wait for the images to be loaded.

![image-20241203151029796](/img/blogs/tech/image-search-vector-search/image/202412032205078.png)

> If the content shown in the following figure appears, all images are successfully loaded.

![image-20241203154156967](/img/blogs/tech/image-search-vector-search/image/202412032205524.png)

## 5 Test Image Search


> Click **Browse files** and choose the image of a zebra that you have prepared in advance.

![image-20241203212546208](/img/blogs/tech/image-search-vector-search/image/202412032206402.png)

> After you upload the image, all similar images in the image dataset are displayed, including their distances and paths.

![image-20241203212712128](/img/blogs/tech/image-search-vector-search/image/202412032206075.png)

Now we have built an image search application based on the vector search capability of OceanBase Database.

## 6 References


[Build an image search application with OceanBase Database](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001970972)