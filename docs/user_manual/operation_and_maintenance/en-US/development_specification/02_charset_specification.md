---
title: Character Set Usage Specifications
weight: 1
---
> Note:
>
> At present, *OceanBase Advanced Tutorial for DBAs* applies only to MySQL tenants of OceanBase Database Community Edition. Features of Oracle tenants of OceanBase Database Enterprise Edition are not described in this topic. For more information about the differences between the two editions, see [Differences between Enterprise Edition and Community Edition](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001714481).


## Basic Knowledge
This section describes two terms: character set and collation. If you have understood the terms, you can ignore the section.

### Character set
To put it simply, character sets define how characters are encoded and stored. Here are some examples:
- If the character set is `utf8`, the uppercase letter "A" is encoded as the byte 0100 0001, which is represented as 0x41 in hexadecimal.
- If the character set is `utf16`, the uppercase letter "A" is encoded as two bytes 0000 0100 0000 0001, which is represented as 0x0041 in hexadecimal.

Different character sets support storage of different types and ranges of characters. For example, the `utf8` character set can store all Unicode characters, whereas the `latin1` character set supports storage of only characters from Western European languages.


### Collation
A collation is an attribute of character sets. It defines a set of rules for comparing and sorting characters. For example, the `utf8mb4` character set supports collations such as `utf8mb4_general_ci`, `utf8mb4_bin`, and `utf8mb4_unicode_ci`.

- `utf8mb4_general_ci`: the case-insensitive general collation of `utf8mb4`.
- `utf8mb4_bin`: the case-sensitive binary collation of `utf8mb4`.
- `utf8mb4_unicode_ci`: the Unicode-based case-insensitive collation of `utf8mb4`.
- `utf8mb4` also supports collations for different languages, such as `utf8mb4_zh_pinyin_ci`, which sorts data by Pinyin.

A character set can have multiple collations. However, a collation belongs to only one character set. For example, if you define a column as `c3 varchar(200) COLLATE utf8mb4_bin`, the character set of the column is automatically set to `utf8mb4`.


## Set Character Sets for Database Objects

This section describes the specifications for setting character sets in OceanBase Database.

You can set character sets at the tenant, database, table, column, or session level. OceanBase Database supports character sets such as `utf8mb4`, `gbk`, `gb18030`, `binary`, `utf16`, and `latin1`.

```
obclient [test]> show charset;
+--------------+-----------------------+-------------------------+--------+
| Charset      | Description           | Default collation       | Maxlen |
+--------------+-----------------------+-------------------------+--------+
| binary       | Binary pseudo charset | binary                  |      1 |
| utf8mb4      | UTF-8 Unicode         | utf8mb4_general_ci      |      4 |
| gbk          | GBK charset           | gbk_chinese_ci          |      2 |
| utf16        | UTF-16 Unicode        | utf16_general_ci        |      2 |
| gb18030      | GB18030 charset       | gb18030_chinese_ci      |      4 |
| latin1       | cp1252 West European  | latin1_swedish_ci       |      1 |
| gb18030_2022 | GB18030-2022 charset  | gb18030_2022_chinese_ci |      4 |
+--------------+-----------------------+-------------------------+--------+
7 rows in set (0.008 sec)

obclient [test]> show collation;;
+-------------------------+--------------+-----+---------+----------+---------+
| Collation               | Charset      | Id  | Default | Compiled | Sortlen |
+-------------------------+--------------+-----+---------+----------+---------+
| utf8mb4_general_ci      | utf8mb4      |  45 | Yes     | Yes      |       1 |
| utf8mb4_bin             | utf8mb4      |  46 |         | Yes      |       1 |
| binary                  | binary       |  63 | Yes     | Yes      |       1 |
| gbk_chinese_ci          | gbk          |  28 | Yes     | Yes      |       1 |
| gbk_bin                 | gbk          |  87 |         | Yes      |       1 |
| utf16_general_ci        | utf16        |  54 | Yes     | Yes      |       1 |
| utf16_bin               | utf16        |  55 |         | Yes      |       1 |
| gb18030_chinese_ci      | gb18030      | 248 | Yes     | Yes      |       1 |
| gb18030_bin             | gb18030      | 249 |         | Yes      |       1 |
| latin1_swedish_ci       | latin1       |   8 | Yes     | Yes      |       1 |
| latin1_bin              | latin1       |  47 |         | Yes      |       1 |
| gb18030_2022_bin        | gb18030_2022 | 216 |         | Yes      |       1 |
| gb18030_2022_chinese_ci | gb18030_2022 | 217 | Yes     | Yes      |       1 |
| gb18030_2022_chinese_cs | gb18030_2022 | 218 |         | Yes      |       1 |
| gb18030_2022_radical_ci | gb18030_2022 | 219 |         | Yes      |       1 |
| gb18030_2022_radical_cs | gb18030_2022 | 220 |         | Yes      |       1 |
| gb18030_2022_stroke_ci  | gb18030_2022 | 221 |         | Yes      |       1 |
| gb18030_2022_stroke_cs  | gb18030_2022 | 222 |         | Yes      |       1 |
+-------------------------+--------------+-----+---------+----------+---------+
18 rows in set (0.007 sec)
```


> Note:
>
> To support seamless migration, OceanBase Database recognizes <code>UTF8</code> as a synonym of <code>UTF8MB4</code>.
>
> You cannot modify the database character set.


In the following examples, the `gbk` character set is used:

* Set the character set when you create a tenant

  * Select **gbk** as the character set when you create a tenant in OceanBase Cloud Platform (OCP).

    ![image](/img/user_manual/operation_and_maintenance/en-US/development_specification/02_charset_specification/001.png)

  * Add `"charset=gbk"` in the `create tenant` statement to set the character set.

    ```shell
    create tenant zlatan replica_num = 1,
        resource_pool_list =('pool1'),
        charset = gbk
            set
            ob_tcp_invited_nodes = '%',
            ob_compatibility_mode = 'mysql',
            parallel_servers_target = 10,
            ob_sql_work_area_percentage = 20,
            secure_file_priv = "";
    ```

**You can also specify a character set and collation when you create a database, table, or column. If not specified, the character set and collation of the higher-level database object are used. The object levels, from highest to lowest, are tenant, database, table, and column.**

The syntax for creating these database objects will not be described in this section.



## Set the Client (Link) Character Set

The client (link) character set is used for the interaction between the client and the server.

The client sends SQL statements to the server for execution. The server then returns the execution results to the client.

In this process, the server must recognize the character set used by the client to correctly parse and execute the SQL statements and return the execution results.

In different environments, the client can be OceanBase Command-Line Client (OBClient), Java Database Connectivity (JDBC), or Oracle Call Interface (OCI). The client character set is also called the link character set.

* The tenant character set and the client character set are independent of each other.

    A tenant with the `gbk` character set can be accessed by a client with the `gbk` or `utf8` character set.

    * If the client character set is `gbk`, the server parses and executes the received SQL statements based on `gbk`.

    * If the client character set is `utf8`, the server parses and executes the received SQL statements based on `utf8`.

* Configuration methods

    * Permanent configuration

        ```shell
        set global character_set_client = gbk;
        set global character_set_connection = gbk;
        set global character_set_results = gbk;
        ```

        * `character_set_client`: the client character set.
        * `character_set_connection`: the connection character set.
        * `character_set_results`: the character set of the results returned by the server to the client.

    In most cases, the strings sent by the client to the server and those returned by the server to the client use the same character set. In MySQL mode, these three variables are provided for flexible configuration. **<font color="red">In general scenarios, you can set the three variables to the client character set</font>**.

    * Temporary configuration (valid only for the current session)

        * Method 1:

        ```shell
        set character_set_client = gbk;
        set character_set_connection = gbk;
        set character_set_results = gbk;
        ```

        * Method 2:

        ```shell
        set names gbk;
        ```

## Set the Client Character Set

  * When you use the JDBC driver to connect to an OceanBase database, add `characterEncoding=gbk` to the URL to create a GBK link.

    ```shell
    String url = "jdbc:oceanbase://xxx.xxx.xxx.xxx:xxxx?useSSL=false&useUnicode=true&characterEncoding=gbk&connectTimeout=30000&rewriteBatchedStatements=true";
    ```

  * When you use OBClient to connect to an OceanBase database, we recommend that you use the `zh_CN.GB18030` superset of `zh_CN.GBK` for the bash environment variables of the GBK link.

    * Modify the bash environment variables.

      ```shell
      export LANG=zh_CN.GB18030
      export LC_ALL=zh_CN.GB18030
      ```

    * Modify the character set configuration of the terminal to set the character set of the current window to `gbk`. Follow the instructions on the terminal.



> Notice
>
> You must set the client and driver accordingly. Otherwise, garbled characters may occur.


## Indexes Do Not Work When Columns with Different Collations Are Joined

As reported by many users in the community, indexes cannot be used for joining two columns with the same data type (such as `varchar`) and the same character set.

This issue usually occurs when different database administrators (DBAs) create the table and columns and set different collations for them. For more information about how to analyze and troubleshoot the issue, see [SQL Tuning Practices - Analyze the Inability to Use Indexes When Joining Columns with Different Collations](https://open.oceanbase.com/blog/14870818145).

**<font color="red">Note that if tables in the production environment are created by different DBAs, you must check the collations set for these tables when using them. Otherwise, query performance may be compromised due to non-optimal plans. </font>**

**<font color="red">If you have no special requirements, we recommend that you set the same collation for columns to be joined when creating them. </font>**