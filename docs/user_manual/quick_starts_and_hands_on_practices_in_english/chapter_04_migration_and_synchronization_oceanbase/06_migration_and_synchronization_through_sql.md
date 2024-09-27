---
title: Use SQL statements for data migration
weight: 7
---

# 4.6 Use SQL statements for data migration

It is common and simple to migrate data by using SQL statements. You can use the `SELECT INTO OUTFILE` statement to export data to external files, and the `LOAD DATA` statement or `source` command to import data from external files. You can use the `INSERT INTO` or `MERGE INTO` statement to migrate data between tables. This topic describes how to use these methods. 

> **Note**
>
> The official documents referenced in this tutorial are of the latest version available at the time of writing. You can switch to another version as needed in the upper-left corner of the document page. 

## Export data by using SELECT INTO OUTFILE

The `SELECT INTO OUTFILE` statement is often used to export data. It allows you to specify the fields to be exported, and is preferred when primary key fields do not need to be exported. You can use this statement in combination with the `LOAD DATA INFILE` statement to facilitate data import and export. 

### Syntax

```sql
SELECT column_list_option
INTO OUTFILE file_route_option
    [format_of_field_option]
    [start_and_end_option]
FROM table_name_list
[WHERE where_conditions]
[GROUP BY group_by_list [HAVING having_search_conditions]]
[ORDER BY order_expression_list]

column_list_option:
    column_name[,column_name]...

file_route_option:
    '/path/file'
    | 'oss://$PATH/$FILENAME/?host=$HOST&access_id=$ACCESS_ID&access_key=$ACCESSKEY'

format_of_field_option:
    {FIELDS | COLUMNS}
        [TERMINATED BY 'string']
        [[OPTIONALLY] ENCLOSED BY 'char']
        [ESCAPED BY 'char']

start_and_end_option:
    LINES
        [STARTING BY 'string']
        [TERMINATED BY 'string']
```

| Parameter | Required | Description | Example |
|------------------------|---------|----------|---------------------|
| column_list_option | Yes | Column options for the export. To select all data, use an asterisk (`*`). <br></br>`column_name` specifies the name of the column to be exported.  | `SELECT col1,col2,col3 ...` |
| file_route_option | Yes | The path of the exported file. Alibaba Cloud Object Storage Service (OSS) is supported. <blockquote>Note<br></br>Alibaba Cloud OSS does not support files larger than 5 GB. When you export a file larger than 5 GB to Alibaba Cloud OSS, it is split into multiple smaller files. </blockquote> | `... INTO OUTFILE '/home/admin/student.sql' ...` |
| format_of_field_option | No | Field format options for the export. You can use the `FIELDS` or `COLUMNS` clause to specify the format of each field in the output file. <ul><li>`TERMINATED BY`: specifies the separator between field values. For example, `TERMINATED BY ','` specifies that field values are separated with commas (,). </li><li>`ENCLOSED BY`: specifies the symbol for enclosing field values. For example, `ENCLOSED BY '"'` specifies that character values are enclosed within a pair of double quotation marks (""). If the `OPTIONALLY` keyword is used, only values of the string type are enclosed within the specified symbols. </li><li>`ESCAPED BY`: specifies the escape character. For example, `ESCAPED BY '*'` indicates that the asterisk (`*`) but not the backslash (`\`) is used as the escape character. The backslash (`\`) is the default escape character. </li></ul> | `... TERMINATED BY ',' ENCLOSED BY '"' ...` |
| start_and_end_option | No | Start and end character options for exported data rows. `LINES` specifies the characters to enclose each line in the output file. <ul><li>`STARTING BY`: specifies the character to start each line. </li><li>`TERMINATED BY`: specifies the character to end each line. </li></ul> | `... LINES TERMINATED BY '\n' ...` specifies that a row ends with a line feed.  |
| FROM table_name_list | Yes | The object from which data is selected.  | `... FROM tbl1,tbl2 ...` |
| WHERE where_conditions | No | The filter condition. Only data that meets the condition is returned in the query results.  | `... WHERE col1 > 100 ...` |
| GROUP BY group_by_list | No | The grouping field, which is usually used together with aggregate functions. <blockquote>Note<br></br>If no column following the <code>SELECT</code> clause uses any aggregate function, the columns following the `SELECT` clause must be specified after the <code>GROUP BY</code> clause. </blockquote> | `... GROUP BY col1,col2 ...` |
| HAVING having_search_conditions | No | Filters the grouped data. The `HAVING` clause is similar to the `WHERE` clause, but the `HAVING` clause can reference an aggregate function such as `SUM()` and `AVG()`.  | `... HAVING SUM(col1) < 160 ...` |
| ORDER BY order_expression_list | No | Sorts the query results by one or multiple columns in ascending (`ASC`) or descending (`DESC`) order. If you do not specify `ASC` or `DESC`, the default value `ASC` is used. <ul><li>`ASC`: indicates an ascending order. </li><li>`DESC`: indicates a descending order. </li></ul> | `... ORDER BY col1,col2 DESC ...` |

### Example

The following takes exporting data to a local device as an example to describe how to export data. 

1. Create a table named `tbl1` in the `test` database in the `mysql001` tenant and insert data into the table. 

   ```sql
   obclient [test]> CREATE TABLE tbl1(col1 INT PRIMARY KEY,col2 varchar(128),col3 INT);
   Query OK, 0 rows affected
   
   obclient [test]> INSERT INTO tbl1 VALUES(1,'one',80),(2,'two',90),(3,'three',100);
   Query OK, 3 rows affected
   Records: 3  Duplicates: 0  Warnings: 0
   
   obclient [test]> SELECT * FROM tbl1;
   +------+-------+------+
   | col1 | col2  | col3 |
   +------+-------+------+
   |    1 | one   |   80 |
   |    2 | two   |   90 |
   |    3 | three |  100 |
   +------+-------+------+
   3 rows in set
   ```

2. Set a path for the exported file. 

   Set the system variable `secure_file_priv` to specify the path that can be accessed for file import or export. 

   > **Notice**
   >
   > For security reasons, when you set the system variable `secure_file_priv`, you can connect to the database only through a local socket to execute the SQL statement that modifies the global variable. For more information, see [secure_file_priv](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105254). 

   1. Log on to the OBServer node to connect to. 

   2. Execute the following statement to connect to the `mysql001` tenant through a local Unix Socket: 

      ```bash
      [admin@test ~]$ obclient -S /home/admin/oceanbase/run/sql.sock -uroot@mysql001 -p******
      ```

   3. Set the export path to `/home/admin`. 

      ```sql
      obclient [(none)]> SET GLOBAL secure_file_priv = "/home/admin";
      ```

3. After you reconnect to the database, execute the `SELECT INTO OUTFILE` statement to export data from the `tbl1` table. The name of the exported file is `tbl1.sql`. The field values are separated with a comma (,). The values of the string type are enclosed within a pair of double quotation marks (`""`). The end symbol is a line feed. 

   ```sql
   obclient [test]> SELECT * INTO OUTFILE '/home/admin/tbl1.sql' 
       FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '"' 
       LINES TERMINATED BY '\n' 
       FROM tbl1;
   ```

4. Log on to the OBServer node and check the information about the exported file in the `/home/admin` directory on your local device. 

   ```bash
   [admin@test ~]$ cat tbl1.sql
   1,"one",80
   2,"two",90
   3,"three",100
   ```

## Import data by using LOAD DATA

You can use the `LOAD DATA` statement to import data to a database from files on OBServer nodes, clients, and OSS. 

> **Notice**
>
> * Do not use the `LOAD DATA` statement on tables with triggers. 
>
> * To import data from an external file, you must have the `FILE` privilege and configure the following settings:
>
>    * To load files from an OBServer node, you must configure the system variable [secure_file_priv](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105254) to specify the path that can be accessed during file import or export. 
>
>    * To load local files on a client, you must add the `--local-infile[=1]` option when starting the MySQL client or OBClient to enable data loading from the local file system. 

OceanBase Database supports the following input files for the `LOAD DATA` statement:

* Files on an OBServer node. You can execute the `LOAD DATA INFILE` statement to load data from files on an OBServer node into database tables. 

* Files in the file system of the local client. You can execute the `LOAD DATA LOCAL INFILE` statement to load data from files in the file system of the local client into database tables. 

   > **Note**
   >
   > Starting from V4.2.2, OceanBase Database in MySQL mode supports the `LOAD DATA LOCAL INFILE` syntax to load local data files. When executing `LOAD DATA LOCAL INFILE`, the system automatically adds the `IGNORE` option. 

* Files in an OSS file system. You can execute the `LOAD DATA REMOTE_OSS INFILE` statement to load data from files in an OSS file system into database tables. 

You can use the `LOAD DATA` statement to import a CSV text file in the following process:

1. Parse the file: OceanBase Database reads data from a file based on the file name that you enter and determines whether to perform parallel or serial parsing of data from the input file based on the specified degree of parallelism (DOP). 

2. Distribute the data: OceanBase Database is a distributed database. Data of each partition may be distributed across different OBServer nodes. The `LOAD DATA` statement is used to calculate the parsed data and determine the OBServer node to which data needs to be sent. 

3. Insert the data: After the destination OBServer node receives the data, it executes the `INSERT` statement to insert the data into the corresponding partition. 

For more information, see [LOAD DATA](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001231164). 

## Migrate data between tables

You can migrate data between tables in the same tenant by using the `INSERT INTO` or `MERGE INTO` statement. 

### INSERT INTO

#### Syntax

```sql
INSERT INTO target_table_name[(target_col_name[, target_col_name] ...)]
SELECT [(source_col_name[, source_col_name] ...)]
FROM source_table_name
[WHERE expr];
```

The following table describes the parameters.

| Parameter | Description |
|------|-----|
| target_table_name | The destination table to which data is migrated.  |
| target_col_name | The name of a column in the destination table. To update data for all columns in the destination table, you can omit the column names.  |
| source_col_name | The name of a column in the source table. To select all data, use an asterisk (*). <blockquote>**Notice**<br></br>The number of columns selected must be the same as the number of columns in the destination table. </blockquote> |
| source_table_name | The source table from which data is migrated.  |
| WHERE expr | The filtering condition for data migration. If you do not specify this parameter, all row records specified in `SELECT` are migrated.  |

#### Example

This example describes how to insert data that meets the condition `age` > 10 in the `tbl1` table into the `tbl2` table. 

1. Query data in the `tbl1` table.

   ```shell
   obclient [test]> SELECT * FROM tbl1;
   ```

   The output is as follows:

   ```shell
   +------+------+------+
   | id   | name | age  |
   +------+------+------+
   |    1 | ab   |    8 |
   |    2 | bc   |   18 |
   |    3 | cd   |   14 |
   |    4 | de   |   19 |
   |    5 | ef   |    6 |
   |    6 | fg   |   15 |
   +------+------+------+
   ```

2. Query the schema of the `tbl2` table.

   ```shell
   obclient [test]> DESC tbl2;
   ```

   The output is as follows:

   ```shell
   +-------+---------+------+-----+---------+-------+
   | Field | Type    | Null | Key | Default | Extra |
   +-------+---------+------+-----+---------+-------+
   | col1  | int(11) | YES  |     | NULL    |       |
   | col2  | int(11) | YES  |     | NULL    |       |
   +-------+---------+------+-----+---------+-------+
   ```

3. Query data in the `tbl2` table.

   ```shell
   obclient [test]> SELECT * FROM tbl2;
   ```

   The output is as follows, which indicates that the `tbl2` table is empty: 

   ```shell
   Empty set
   ```

4. Insert data that meets the condition `age` > 10 in the `tbl1` table into the `tbl2` table.

   ```shell
   obclient [test]> INSERT INTO tbl2 SELECT id,age FROM tbl1 WHERE age > 10;
   ```

5. Query data in the `tbl2` table.

   ```shell
   obclient [test]> SELECT * FROM tbl2;
   ```

   The output is as follows, which indicates that the `tbl2` table contains the data that meets the condition `age` > 10 in the `tbl1` table: 

   ```shell
   +------+------+
   | col1 | col2 |
   +------+------+
   |    2 |   18 |
   |    3 |   14 |
   |    4 |   19 |
   |    6 |   15 |
   +------+------+
   ```

## Direct load

Direct load allows OceanBase Database to write data directly to a data file. Direct load skips the SQL layer interface, directly allocates space in data files, and inserts data, thereby improving the data import efficiency. 

### Scenarios

The direct load feature applies to the following scenarios:

* Data migration and synchronization: In data migration or synchronization, a large amount of data of different types must be migrated from different data sources to OceanBase Database. Conventional SQL interfaces cannot meet the requirement on timeliness. 

* Conventional extract, transform, and load (ETL): After data is extracted and transformed in the source, a large amount of data must be loaded to the destination within a short time. The direct load technology can improve the import performance. As for the extract, load, and transform (ELT) technology, the data loading efficiency can also be improved by using direct load. 

* Data loading from text files or other data sources to OceanBase Database: Direct load can accelerate the data loading process. 

### Supported statements for direct load

At present, OceanBase Database supports the following statements for direct load:

* `LOAD DATA /*+ direct */`

* `INSERT /*+ append */ INTO SELECT`

> **Notice**
>
> Direct load will write all existing data. If the source table contains a large amount of data but only a small amount of data needs to be imported, direct load is inappropriate in this case. 

### Import data through direct load by using the LOAD DATA statement

In the `LOAD DATA` statement, you can use the `direct` hint to specify to use direct load. 

#### Limitations

* You cannot execute two statements to write the same table at a time because a lock is added to the table during import. 

* The statement is not supported for tables with triggers. 

* The statement can load data of the `LOB` type but the loading performance is poor, because `LOB` data is still loaded to the corresponding paths by using transactions. 

* The statement cannot be executed in a multi-row transaction. 

#### Considerations

To speed up data import, OceanBase Database adopts a parallel design for `LOAD DATA` operations. During the process, data to be imported is divided into multiple subtasks, which are executed in parallel. Each subtask is processed as an independent transaction in a random order. Therefore, observe the following considerations:

* The atomicity of the overall data import operation is not guaranteed. 

* For a table without a primary key, data may be written to the table in an order different from that in the source file. 

#### Syntax

```sql
LOAD DATA /*+ direct(need_sort,max_error) parallel(N) */ INFILE 'file_name' ...
```

The following table describes the parameters.

| Parameter | Description |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| direct | Specifies to use direct load.  |
| need_sort | Specifies whether OceanBase Database needs to sort the data. <br></br>The value is of the Boolean type.<ul><li>`true`: Data sorting is needed. </li><li>`false`: Data sorting is not needed. </li></ul> |
| max_error | The maximum number of erroneous rows allowed. The value is of the INT type. If this value is exceeded, the `LOAD DATA` statement returns an error.  |
| parallel(N) | The DOP for loading data. The default value of `N` is `4`.  |

#### Example

This example describes how to import data from an OBServer node. In OceanBase Database, you can also use the `LOCAL INFILE` clause in the `LOAD DATA` statement to import local files through direct load. For more information, see [Import data by using the LOAD DATA statement](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103637). 

1. Log on to the server where the target OBServer node resides and create test data in the `/home` directory. 

   > **Note**
   >
   > In OceanBase Database, the <code>LOAD DATA</code> statement can load only local input files on OBServer nodes. Therefore, you must copy the to-be-imported files to an OBServer node before the import. 

   ```shell
   [admin@test ~]$ vi tbl1.csv
   ```

   The test data is as follows:

   ```shell
   1,11
   2,22
   3,33
   ```

2. Set the path where the file to be imported is located. 

   Set the system variable `secure_file_priv` to specify the path that can be accessed for file import or export. 

   > **Notice**
   >
   > For security reasons, when you set the system variable `secure_file_priv`, you can connect to the database only through a local socket to execute the SQL statement that modifies the global variable. For more information, see [secure_file_priv](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105254). 

   1. Log on to the server where the OBServer node to connect to resides. 

   2. Execute the following statement to connect to the `mysql001` tenant through a local Unix Socket: 

      ```shell
      [admin@test ~]$ obclient -S /home/admin/oceanbase/run/sql.sock -uroot@mysql001 -p******
      ```

   3. Set the import path to `/home/admin`. 

      ```shell
      obclient [(none)]> SET GLOBAL secure_file_priv = "/home/admin";
      ```

3. After you reconnect to the database, execute the `LOAD /*+ APPEND */ DATA` statement to import data. 

   ```shell
   obclient [test]> CREATE TABLE tbl1(col1 INT PRIMARY KEY,col2 INT);
   Query OK, 0 rows affected
   
   obclient [test]> SELECT * FROM tbl1;
   Empty set
   
   obclient [test]> LOAD DATA /*+ direct(true,1024) parallel(16) */INFILE '/home/admin/tbl1.csv' INTO TABLE tbl1 FIELDS TERMINATED BY ',';
   Query OK, 3 rows affected
   Records: 3  Deleted: 0  Skipped: 0  Warnings: 0
   
   obclient [test]> SELECT * FROM tbl1;
   +------+------+
   | col1 | col2 |
   +------+------+
   |    1 |   11 |
   |    2 |   22 |
   |    3 |   33 |
   +------+------+
   3 rows in set
   ```

### Import data through direct load by using the INSERT INTO SELECT statement

In the `INSERT INTO SELECT` statement, you can use the `append` hint in combination with the `enable_parallel_dml` hint to enable direct load. 

#### Limitations

* Direct load is supported only for parallel DML. 

* You cannot execute two statements to write the same table at a time because a lock is added to the table during import. 

* The statement is not supported for tables with triggers. 

* The statement can load data of the `LOB` type but the loading performance is poor, because `LOB` data is still loaded to the corresponding paths by using transactions. 

* The statement cannot be executed in a multi-row transaction that contains multiple operations. 

#### Syntax

```sql
INSERT /*+ append enable_parallel_dml parallel(N) */ INTO  table_name select_sentence
```

The following table describes the parameters.

| Parameter | Description |
|------|------|
| append | Specifies to use direct load.  |
| enable_parallel_dml parallel(N) | The DOP for loading data. The default value of `N` is `4`. <blockquote>**Note**<br></br>In most cases, the <code>enable_parallel_dml</code> hint must be used together with the <code>parallel</code> hint to enable parallel DML. However, if the table-level DOP is specified on the schema of the target table, you only need to specify the <code>enable_parallel_dml</code> hint. </blockquote> |

#### Example

This example describes how to import part of the data in the `tbl2` table to the `tbl1` table through direct load. 

1. Query data in the `tbl1` table.

   ```shell
   obclient [test]> SELECT * FROM tbl1;
   ```

   The output is as follows, which indicates that the `tbl1` table is empty: 

   ```shell
   Empty set
   ```

2. Query data in the `tbl2` table.

   ```shell
   obclient [test]> SELECT * FROM tbl2;
   ```

   The output is as follows:

   ```shell
   +------+------+------+
   | col1 | col2 | col3 |
   +------+------+------+
   |    1 | a1   |   11 |
   |    2 | a2   |   22 |
   |    3 | a3   |   33 |
   +------+------+------+
   ```

3. Import part of the data in the `tbl2` table to the `tbl1` table through direct load.

   ```shell
   obclient [test]> INSERT /*+ append enable_parallel_dml parallel(16) */ INTO tbl1 SELECT t2.col1,t2.col3 FROM tbl2 t2;
   ```

4. Query data in the `tbl1` table.

   ```shell
   obclient [test]> SELECT * FROM tbl1;
   ```

   The output is as follows, which indicates that the `tbl1` table already contains part of the data in the `tbl2` table: 

   ```shell
   +------+------+
   | col1 | col2 |
   +------+------+
   |    1 |   11 |
   |    2 |   22 |
   |    3 |   33 |
   +------+------+
   ```

In the `Note` section of the return result of the `EXPLAIN EXTENDED` statement, check whether the data is written through direct load. The statement is as follows:

```shell
obclient [test]> EXPLAIN EXTENDED INSERT /*+ append enable_parallel_dml parallel(16) */ INTO tbl1 SELECT t2.col1,t2.col3 FROM tbl2 t2;
```

The output is as follows:

```shell
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Query Plan                                                                                                                                                                                                                         |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| ===========================================================================                                                                                                                                                        |
| |ID|OPERATOR                        |NAME           |EST.ROWS|EST.TIME(us)|                                                                                                                                                        |
| ---------------------------------------------------------------------------                                                                                                                                                        |
| |0 |OPTIMIZER STATS MERGE           |               |3       |27          |                                                                                                                                                        |
| |1 | PX COORDINATOR                 |               |3       |27          |                                                                                                                                                        |
| |2 |  EXCHANGE OUT DISTR            |:EX10001       |3       |27          |                                                                                                                                                        |
| |3 |   INSERT                       |               |3       |26          |                                                                                                                                                        |
| |4 |    EXCHANGE IN DISTR           |               |3       |1           |                                                                                                                                                        |
| |5 |     EXCHANGE OUT DISTR (RANDOM)|:EX10000       |3       |1           |                                                                                                                                                        |
| |6 |      OPTIMIZER STATS GATHER    |               |3       |1           |                                                                                                                                                        |
| |7 |       SUBPLAN SCAN             |ANONYMOUS_VIEW1|3       |1           |                                                                                                                                                        |
| |8 |        PX BLOCK ITERATOR       |               |3       |1           |                                                                                                                                                        |
| |9 |         TABLE SCAN             |t2             |3       |1           |                                                                                                                                                        |
| ===========================================================================                                                                                                                                                        |
| Outputs & filters:                                                                                                                                                                                                                 |
| -------------------------------------                                                                                                                                                                                              |
|   0 - output(nil), filter(nil), rowset=256                                                                                                                                                                                         |
|   1 - output([column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)]),                                      |
| filter(nil), rowset=256                                                                                                                                                                                                            |
|   2 - output([column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)]),                                      |
| filter(nil), rowset=256                                                                                                                                                                                                            |
|       dop=16                                                                                                                                                                                                                       |
|   3 - output([column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)]),                                      |
| filter(nil)                                                                                                                                                                                                                        |
|       columns([{tbl1: ({tbl1: (tbl1.__pk_increment(0x7f0ba6a51d80), tbl1.col1(0x7f0ba6a30a90), tbl1.col2(0x7f0ba6a30d50))})}]), partitions(p0),                                                                                    |
|       column_values([T_HIDDEN_PK(0x7f0ba6a52040)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)]) |
|   4 - output([column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)],                                       |
| [T_HIDDEN_PK(0x7f0ba6a52040)]), filter(nil), rowset=256                                                                                                                                                                            |
|   5 - output([column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)],                                       |
| [T_HIDDEN_PK(0x7f0ba6a52040)]), filter(nil), rowset=256                                                                                                                                                                            |
|       dop=16                                                                                                                                                                                                                       |
|   6 - output([column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col1(0x7f0ba6a51800))(0x7f0ba6a522c0)], [column_conv(INT,PS:(11,0),NULL,ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0))(0x7f0ba6a59630)]),                                      |
| filter(nil), rowset=256                                                                                                                                                                                                            |
|   7 - output([ANONYMOUS_VIEW1.col1(0x7f0ba6a51800)], [ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0)]), filter(nil), rowset=256                                                                                                              |
|       access([ANONYMOUS_VIEW1.col1(0x7f0ba6a51800)], [ANONYMOUS_VIEW1.col3(0x7f0ba6a51ac0)])                                                                                                                                       |
|   8 - output([t2.col1(0x7f0ba6a50d40)], [t2.col3(0x7f0ba6a512f0)]), filter(nil), rowset=256                                                                                                                                        |
|   9 - output([t2.col1(0x7f0ba6a50d40)], [t2.col3(0x7f0ba6a512f0)]), filter(nil), rowset=256                                                                                                                                        |
|       access([t2.col1(0x7f0ba6a50d40)], [t2.col3(0x7f0ba6a512f0)]), partitions(p0)                                                                                                                                                 |
|       is_index_back=false, is_global_index=false,                                                                                                                                                                                  |
|       range_key([t2.__pk_increment(0x7f0ba6a6ccf0)]), range(MIN ; MAX)always true                                                                                                                                                  |
| Used Hint:                                                                                                                                                                                                                         |
| -------------------------------------                                                                                                                                                                                              |
| /*+                                                                                                                                                                                                                                |
|                                                                                                                                                                                                                                    |
|       USE_PLAN_CACHE( NONE )                                                                                                                                                                                                       |
|       PARALLEL(16)                                                                                                                                                                                                                 |
|       ENABLE_PARALLEL_DML                                                                                                                                                                                                          |
|       APPEND                                                                                                                                                                                                                       |
|       APPEND                                                                                                                                                                                                                       |
| */                                                                                                                                                                                                                                 |
| Qb name trace:                                                                                                                                                                                                                     |
| -------------------------------------                                                                                                                                                                                              |
|   stmt_id:0, stmt_type:T_EXPLAIN                                                                                                                                                                                                   |
|   stmt_id:1, INS$1                                                                                                                                                                                                                 |
|   stmt_id:2, SEL$1                                                                                                                                                                                                                 |
| Outline Data:                                                                                                                                                                                                                      |
| -------------------------------------                                                                                                                                                                                              |
| /*+                                                                                                                                                                                                                                |
|       BEGIN_OUTLINE_DATA                                                                                                                                                                                                           |
|       FULL(@"SEL$1" "test"."t2"@"SEL$1")                                                                                                                                                                                           |
|       USE_PLAN_CACHE( NONE )                                                                                                                                                                                                       |
|       PARALLEL(16)                                                                                                                                                                                                                 |
|       ENABLE_PARALLEL_DML                                                                                                                                                                                                          |
|       OPTIMIZER_FEATURES_ENABLE('4.0.0.0')                                                                                                                                                                                         |
|       APPEND                                                                                                                                                                                                                       |
|       APPEND                                                                                                                                                                                                                       |
|       END_OUTLINE_DATA                                                                                                                                                                                                             |
| */                                                                                                                                                                                                                                 |
| Optimization Info:                                                                                                                                                                                                                 |
| -------------------------------------                                                                                                                                                                                              |
| t2:                                                                                                                                                                                                                                |
|       table_rows:3                                                                                                                                                                                                                 |
|       physical_range_rows:3                                                                                                                                                                                                        |
|       logical_range_rows:3                                                                                                                                                                                                         |
|       index_back_rows:0                                                                                                                                                                                                            |
|       output_rows:3                                                                                                                                                                                                                |
|       est_method:local_storage                                                                                                                                                                                                     |
|       optimization_method:cost_based                                                                                                                                                                                               |
|       avaiable_index_name:[tbl2]                                                                                                                                                                                                   |
|       table_id:500004:estimation info:(table_type:12, version:-1--1--1, logical_rc:3, physical_rc:3)]                                                                                                                              |
|       stats version:0                                                                                                                                                                                                              |
| Plan Type:                                                                                                                                                                                                                         |
|       DISTRIBUTED                                                                                                                                                                                                                  |
| Note:                                                                                                                                                                                                                              |
|       Degree of Parallelism is 16 because of hint                                                                                                                                                                                  |
|       Direct-mode is enabled in insert into select                                                                                                                                                                                 |
+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
86 rows in set
```
