---
slug: Zabbix
title: 'Zabbix and OceanBase Database Completed Product Compatibility and Mutual Certification'
---

# Zabbix and OceanBase Database Completed Product Compatibility and Mutual Certification

1 Introduction to Zabbix
========

Zabbix is an enterprise-grade, open source monitoring solution that provides comprehensive monitoring across the IT infrastructure, from hardware devices, operating systems, and cloud services to business applications. The Zabbix project started in 1998 and has over 20 years of service experience. It is currently widely used by large enterprises in sectors such as finance, telecommunications, manufacturing, education, and retail.

2 Zabbix & OceanBase Database
==================

Zabbix supports OceanBase Database as a backend database for the storage of configuration and historical data, demonstrating superior performance compared to MySQL.

The following figure shows the simplified system topology of Zabbix.

![1715054634](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-05/1715054634242.png)

Both Zabbix server and Zabbix frontend exchange data with the database.

Zabbix server: the primary Zabbix application responsible for data collection, problem diagnostics, and alert dispatch. Zabbix server retrieves all configuration data and some historical/trend data from the database, and writes all collected historical data, generated trend data, event information, and alert information to the database.

Zabbix frontend: the frontend that provides a unified interface for viewing and managing configurations. All historical data, trends, events, and alerts are retrieved from the database.

3 Zabbix Deployment and Installation (CentOS 8)
====================

3.1 Install OceanBase Database Community Edition
----------------

### 3.1.1 Install OceanBase Database
```
    cd /opt/
    wget https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/download-center/opensource/oceanbase-all-in-one/7/x86_64/oceanbase-all-in-one-4.2.1.0-100120231013145059.el7.x86_64.tar.gz
    tar -xf oceanbase-all-in-one-4.2.1.0-100120231013145059.el7.x86_64.tar.gz
    cd oceanbase-all-in-one
    bin/install.sh
    source ~/.oceanbase-all-in-one/bin/env.sh
```

### 3.1.2 Start the service

Run the following command to start the service:
```
    obd demo
```

To stop the service or delete the cluster, run the following commands:
```
    obd cluster stop demo
    obd cluster destroy demo
```

3.2 Compile and install Zabbix server
-------------------

### 3.2.1 Install dependencies
```
    dnf install -y git
    dnf install -y automake  autoconf
    dnf install -y gcc net-snmp-devel libxml2-devel  unixODBC-devel libcurl-devel  openssl-devel  openldap-devel  libevent-devel  pcre-devel libssh2-devel OpenIPMI-devel
    dnf install -y java-11-openjdk  java-11-openjdk-devel
    dnf localinstall -y mysql-community-{client,common,libs,devel}*
```

### 3.2.2 Install Zabbix server
```
    mkdir -p /var/www/html && cd /var/www/html
    git clone -b release/6.0 --single-branch --depth=1 https://git.zabbix.com/scm/zbx/zabbix.git 6.0
    cd /var/www/html/6.0
    ./bootstrap.sh
    ./configure  --prefix=$(pwd) --enable-server    --enable-agent  --with-mysql=/usr/bin/mysql_config  --enable-java  --enable-ipv6    --with-libcurl  --with-libxml2 --with-openipmi --with-net-snmp    --with-ssh2 --with-unixodbc --with-openssl --with-ldap
    make && make install
    make dbschema
```

### 3.2.3 Create a tenant and import data
```
    obd cluster tenant create demo -n obmysql --max-cpu=4 --memory-size=10G --log-disk-size=4G --max-iops=9223372036854775807 --iops-weight=2 --unit-num=1 --charset=utf8 -s 'ob_tcp_invited_nodes="%"'
    
    obclient -P2881 -uroot@obmysql -h127.0.0.1
    > create user zabbix@'%' identified by 'xxxxxxxxxx';
    > create database zabbix character set utf8mb4 collate utf8mb4_bin;
    > grant all on zabbix.* to zabbix@'%';
    > use zabbix
    > source /var/www/html/6.0/database/mysql/schema.sql;
    > source /var/www/html/6.0/database/mysql/images.sql;
    > source /var/www/html/6.0/database/mysql/data.sql;
```

### 3.2.4 Start the service

Modify the configuration file `zabbix_server.conf` of Zabbix server in the `/var/www/html/6.0/etc` directory. Modify the `DBHost`, `DBName`, `DBUser`, `DBPassword`, and `DBPort` parameters to reflect the OceanBase Database connection information. In addition, pay attention to other parameters related to internal processes, data collection processes, and cache configuration. Finally, start Zabbix server.
```
    /var/www/html/6.0/sbin/zabbix_server
```
    
    

3.3 Install Zabbix frontend
------

Install NGINX and PHP. The minimum PHP version is 7.2.5. We recommend that you install PHP 7.4 or later.

Enter http://xx.xx.xx.xx/ui in your browser, and then follow the wizard to fill in the OceanBase Database connection information.

4 Demonstration
====

After you log in to Zabbix, the homepage appears. The left side of the page displays the navigation pane, while the right side shows the main window, also known as the Dashboard.

![1715054675](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-05/1715054675208.png)![](https://grandage.feishu.cn/space/api/box/stream/download/asynccode/?code=ZTE2ZjQ3OWRkNTM2OTgxMjY1NGIyOGMyNGZhZWZlYzZfeGpMOUdWTzgwN3hKa25ScUZKT0pIUmtseUsxek1mS1dfVG9rZW46Q2RwaWIzMUk0b085aDV4RWJsS2NaazNjblBiXzE3MTMxNDUxNjM6MTcxMzE0ODc2M19WNA)

Testing can be performed by using the built-in PHP test file in the Zabbix Git repository.

![1715054692](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2024-05/1715054692446.png)