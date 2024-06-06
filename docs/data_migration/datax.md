---
title: Datax
weight: 2
---
# **使用 DataX 迁移 MySQL 数据到 OceanBase 数据库**

本文仅给出使用 DataX 迁移 MySQL 数据到 OceanBase 数据库的示例，详细介绍可查看对应小节给出的参考文档。

## **MySQL 数据同步到 OceanBase**

本节仅给出配置文件示例，详情可参照 OceanBase 数据库文档 [使用 DataX 迁移 MySQL 数据到 OceanBase 数据库](https://www.oceanbase.com/docs/community-observer-cn-10000000000900965) 一文。

配置文件如下：

```json
{
    "job": {
        "setting": {
            "speed": {
                "channel": 4 
            },
            "errorLimit": {
                "record": 0,
                "percentage": 0.1
            }
        },
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
                        "username": "tpcc",
                        "password": "********",
                        "column": [
                            "*"
                        ],
                        "connection": [
                            {
                                "table": [
                                    "bmsql_oorder"
                                ],
                                "jdbcUrl": ["jdbc:mysql://127.0.0.1:3306/tpccdb?useUnicode=true&characterEncoding=utf8"]
                            }
                        ]
                    }
                },

                "writer": {
                    "name": "oceanbasev10writer",
                    "parameter": {
                        "obWriteMode": "insert",
                        "column": [
                            "*"
                        ],
                        "preSql": [
                            "truncate table bmsql_oorder"
                        ],
                        "connection": [
                            {
                                "jdbcUrl": "||_dsc_ob10_dsc_||obdemo:oboracle||_dsc_ob10_dsc_||jdbc:mysql://127.0.0.1:2883/tpcc?useLocalSessionState=true&allowBatch=true&allowMultiQueries=true&rewriteBatchedStatements=true",
                                "table": [
                                    "bmsql_oorder"
                                ]
                            }
                        ],
                        "username": "tpcc",
                        "password":"********",
                        "writerThreadCount":10,
                        "batchSize": 1000,
                        "memstoreThreshold": "0.9"
                    }
                }
            }
        ]
    }
}
```

## **加载 CSV 数据文件到 OceanBase 数据库**

将 MySQL 数据迁移到 OceanBase 数据库时，如果源端和目标端不能同时跟 DataX 服务器网络联通，则需要通过 CSV 文件中转。本节仅给出配置文件示例，详情可参照 OceanBase 数据库文档 [使用 DataX 加载 CSV 数据文件到 OceanBase 数据库](https://www.oceanbase.com/docs/community-observer-cn-10000000000900960) 一文。

### **MySQL 数据导出为 CSV 文件**

将 MySQL 数据导出为 CSV 文件。

配置文件如下：

```bash
$cat job/bmsql_oorder_mysql2csv.json
{
    "job": {
        "setting": {
            "speed": {
                "channel": 4
            },
            "errorLimit": {
                "record": 0,
                "percentage": 0.1
            }
        },
        "content": [
            {
                "reader": {
                    "name": "mysqlreader",
                    "parameter": {
                        "username": "tpcc",
                        "password": "********",
                        "column": [
                            "*"
                        ],
                        "connection": [
                            {
                                "table": [
                                    "bmsql_oorder"
                                ],
                                "jdbcUrl": ["jdbc:mysql://127.0.0.1:3306/tpccdb?useUnicode=true&characterEncoding=utf8"]
                            }
                        ]
                    }
                },
                "writer": {
                    "name": "txtfilewriter",
                    "parameter": {
                        "path": "/tmp/tpcc/bmsql_oorder",
                        "fileName": "bmsql_oorder",
                        "encoding": "UTF-8",
                        "writeMode": "truncate",
                        "dateFormat": "yyyy-MM-dd hh:mm:ss" ,
                        "nullFormat": "\\N" ,
                        "fileFormat": "csv" ,
                        "fieldDelimiter": ","
                    }
                }
            }
        ]
    }
}
```

### **CSV 文件导入到 OceanBase**

将源端导出的 CSV 文件复制到目标端的 DataX 服务器上，然后导入到目标端 OceanBase 数据库中。

配置文件如下：

```bash
$cat job/bmsql_oorder_csv2ob.json
{
    "job": {
        "setting": {
            "speed": {
                "channel": 4
            },
            "errorLimit": {
                "record": 0,
                "percentage": 0.1
            }
        },
        "content": [
            {
                "reader": {
                    "name": "txtfilereader",
                    "parameter": {
                        "path": ["/tmp/tpcc/bmsql_oorder"],
                        "fileName": "bmsql_oorder",
                        "encoding": "UTF-8",
                        "column": ["*"],
                        "dateFormat": "yyyy-MM-dd hh:mm:ss" ,
                        "nullFormat": "\\N" ,
                        "fieldDelimiter": ","
                    }
                },
                "writer": {
                    "name": "oceanbasev10writer",
                    "parameter": {
                        "obWriteMode": "insert",
                        "column": [
                            "*"
                        ],
                        "preSql": [
                            "truncate table bmsql_oorder"
                        ],
                        "connection": [
                            {
                                "jdbcUrl": "||_dsc_ob10_dsc_||obdemo:oboracle||_dsc_ob10_dsc_||jdbc:mysql://127.0.0.1:2883/tpcc?useLocalSessionState=true&allowBatch=true&allowMultiQueries=true&rewriteBatchedStatements=true",
                                "table": [
                                    "bmsql_oorder"
                                ]
                            }
                        ],
                        "username": "tpcc",
                        "password":"********",
                        "writerThreadCount":10,
                        "batchSize": 1000,
                        "memstoreThreshold": "0.9"
                    }
                }
            }
        ]
    }
}
```
