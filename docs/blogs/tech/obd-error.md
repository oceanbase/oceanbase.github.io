---
slug: obd-error
title: 'Troubleshoot obd Errors'
---

> After Liu Che, R&D director of OceanBase Migration Service (OMS) Community Edition, offered an OMS troubleshooting manual, Xieyun, R&D director of OceanBase Deployer (obd) Community Edition, promised to follow suit with a troubleshooting manual for obd Community Edition by the end of 2024.  
>   
> Before getting off work on December 31, 2024, Xieyun and his team fulfilled their promise, completing the manual just in time as a New Year's gift for the community.

Troubleshooting Procedure
----------

When an error occurs in obd, check whether the error is caused by the limitations mentioned in the official documentation.

The following figure shows the overall troubleshooting procedure when an error occurs during the execution of the obd start or upgrade command.

![Canvas](/img/blogs/tech/obd-error/image/001-86a2c9ebc5013b08b6824cc338027768.png)

Overview of Error Messages and Error Codes in OceanBase Database
--------------------

For more information, see [Overview](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001971428).

Logs and Their Paths
---------

If a command fails, you can run the `obd display-trace {trace-id}` command returned in the terminal window to view the detailed logs of the failed command.

![1735699591](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2025-01/3e4f93c3-91a1-457b-b264-d6032c243914.png)

![1735699597](https://obcommunityprod.oss-cn-shanghai.aliyuncs.com/prod/blog/2025-01/e0653c8c-70f6-4df9-9089-5d4c0d0a4f0a.png)

Path to obd logs: `~/.obd/log/obd`

Path to oceanbase-ce logs: the home\_path value under the oceanbase-ce component in the `~/.obd/cluster/{cluster name}/config.yaml` file

Path to obproxy-ce logs: the home\_path value under the obproxy component in the `~/.obd/cluster/{cluster name}/config.yaml` file

Path to ocp-server-ce logs: the home\_path value under the ocp-server-ce component in the `~/.obd/cluster/{cluster name}/config.yaml` file

Path to frontend request logs: `~/.obd/app.log`

Path to obshell logs: `{oceanbase-ce deployment directory}/log_obshell/obshell.log`

Common Issues During Startup
------------

1.  If a port conflict occurs, change the port number in the configuration file or terminate the process using the port.
2.  If the installation path or data directory is not empty, change the path or delete the original path after confirming it is safe to do so.
3.  If memory is insufficient, adjust system\_memory and memory\_limit in the configuration file.
4.  If the error message is followed by an executable command, run the command and then rerun the start command.
5.  If the obd start command fails during the cluster bootstrap phase, check the error messages in the observer.log file.

Common Issues During Upgrade
--------------

1.  If `[ERROR] Too many match` occurs during the OceanBase Database upgrade, add the `--usable` option.
2.  If `fail to get upgrade graph: ‘NoneType’ object has no attribute ‘version’` occurs during the OceanBase Database upgrade, the upgrade to the target version is not supported.
3. If the session is closed due to long execution or other reasons during the upgrade, execute `nohup obd cluster upgrade` to enable obd to run in the background. This prevents obd from terminating due to a user exit.
4.  If the primary\_zone value of the tenant is RANDOM during the upgrade, the following error occurs: `__main__.MyError: 'upgrade checker failed with 2 reasons: [META$1002 tenant primary zone random before update not allowed] , [t1 tenant primary zone random before update not allowed]'`. To fix this issue, connect to OceanBase Database, execute the SQL statement `ALTER TENANT tenant1 primary_zone='zone2';`, and rerun the upgrade command.

Status in obd
--------

1.  The `obd cluster list` command does not return the real-time status. obd updates the status when it executes a management command. If servers reboot, component services do not automatically restart, and the `obd cluster list` command displays the status prior to the server reboot.
2.  If the `obd cluster list` command returns `stopped`, the status remains the same after you start each component by running `obd cluster start -c`. The `stopped` state affects subsequent cluster operations such as upgrades and tenant creation.

Typical Scenarios
------

### Instructions on modifying the YAML file for deploying an OceanBase cluster by using obd

**When editing the YAML file, pay attention to the indentation. Do not use tabs, and ensure there is a space after each colon.**

```
    user:
       username: admin
    #   password: your password if need
       key_file: /home/admin/.ssh/id_rsa.pub
    #   port: your ssh port, default 22
    #   timeout: ssh connection timeout (second), default 30
    
    oceanbase-ce:
      servers: # The list of OBServer nodes. You need to set the IP addresses to those you plan for the OBServer nodes.
        - name: server1
          ip: 1.2.3.4
      global:
        # The name of the network interface card (NIC) corresponding to the host IP addresses of the OBServer nodes.
        devname: eth0
        # The maximum memory size for the observer process.
        memory_limit: 8G
        # The size of memory reserved from memory_limit as system memory, which belongs to the internal sys tenant whose ID is 500 instead of any other OceanBase Database tenant.
        system_memory: 4G
        # The percentage of disk space pre-allocated to data files in OceanBase Database. Once this parameter takes effect, the specified percentage of disk space is immediately reserved, and you can only increase its value. We recommend that you start with a moderate initial percentage, such as 50%.
        datafile_disk_percentage: 20
        # The system log level. The default value is INFO, which generates a large amount of observer logs. You can set it to WARN or ERROR as needed.
        syslog_level: WARN
        # Print system logs whose levels are higher than WARNING to a separate log file. The default value is true.
        enable_syslog_wf: false
        # Enable auto system log recycling or not. The default value is false.
        enable_syslog_recycle: true
        # The maximum number of observer log files to be retained. By default, up to four 256 MB observer log files are kept. We recommend that you retain as many logs as possible based on your disk size to prevent logs necessary for troubleshooting from being overwritten.
        max_syslog_file_count: 10
        # The OceanBase cluster name, which must be consistent with the value of the cluster_name parameter under the global section of the obproxy configuration. You can view it by running `show parameters like 'cluster';`. Note that the parameter name is not appname when you run this command to view the cluster name.
        appname: obcluster
        # The password of the root user in the sys tenant.
        root_password: Root123@@Root123
        # The password of the proxyro user in the sys tenant.
        proxyro_password: Root123@@Root123
    
      # Note that server1 at this level corresponds to the name parameter under the servers section of the oceanbase-ce configuration. You can modify the name but must ensure the correspondence.  
      server1:
        # The port for external connections to OceanBase Database, which defaults to 2881. You can customize the port number but can no longer change it after the cluster starts.
        mysql_port: 2881
        # The port for internal RPC communications within OceanBase Database, which defaults to 2882. You can customize the port number but can no longer change it after the cluster starts.
        rpc_port: 2882
        # The working directory of OceanBase Database, where software, /lib, and /etc are located.
        home_path: /home/admin/observer
        # The data directory of OceanBase Database, which is deployed under $home_path/store and $home_path/store/$appname by default. We recommend that you create a symbolic link to deploy the directory on a separate disk.
        data_dir: /data
        # The redo log directory of OceanBase Database. We recommend that you create a symbolic link to deploy the directory on a separate disk.
        redo_dir: /redo
        # The name of the zone corresponding to the specified OBServer node.
        zone: zone1
```    

### Locate OceanBase Database error logs

1\.  Directly connect to the OceanBase cluster, and filter logs by the error message on the server.
```
    root@observer109 log]#
    mysql -h1.2.3.4 -P2881 -uroot@test1#ob_test_1 -p'Root123@@Root123' -A -c oceanbase
    
    mysql: [Warning] Using a password on the command line interface can be insecure.
    ERROR 1045 (42000): Access denied for user 'root'@'xxx.xxx.xxx.xxx' (using password: YES)
```    

In the preceding example, the error code returned by OceanBase Database is 1045. You can search through the observer.log file by the error code to locate the error logs for troubleshooting.

2\. Log in to the specified OceanBase Database Proxy (ODP), also known as OBProxy.

   a. Determine the IP address of the accessed ODP and the executed command.

   b. Log in to the ODP to find `server_ip` and `trace_id` based on the executed command.

   c. Log in to the server specified by `server_ip` to search for `trace_id`.

3\. Log in to the ODP by using its virtual IP address (VIP).

If multiple ODPs exist in the environment and the VIP of the closest load balancer is accessed, you cannot directly determine which ODP has been accessed. In this case, you can check the `gv$sql_audit` view in OceanBase Database for determination.

### Deploy an OceanBase cluster online or offline by using obd

#### Online installation

1\.  Install dependencies.
```
    yum install -y yum-utils
    yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
    yum -y install ob-deploy
```    

2\. Check whether obd is successfully installed.
```
    obd --version
```    

3\. Edit the `YAML` configuration file of obd.

4\. Deploy the OceanBase cluster.
```
    obd cluster deploy ${your_deploy_name} -c distributed-with-obproxy-example.yaml
```
   a. After you run the `obd cluster deploy` command, a hidden directory named `.obd` is created in the home directory of the current user.

   b. `${your_deploy_name}` has nothing to do with `app_name` in the configuration file. You can set them to the same value or different values as needed.

   c. Actually, this step does not deploy the OceanBase cluster. Instead, it creates the directory structure and grants permissions.

5\. Start the cluster.
```
    obd cluster start ${your_deploy_name}
```

*   If you are deploying the cluster for the first time, the preceding command initiates the cluster, including creating system tables and the sys tenant.
*   If you are not deploying the cluster for the first time, the preceding command starts the OceanBase cluster.

6\. Display the cluster information.
```
    obd cluster display ${your_deploy_name}
```

#### Offline installation

1\.  Download the software package.
```
    # Download the software package on a server with Internet access.
    yum install -y yum-utils
    yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
    
    mkdir -p /opt/ob_rpm
    yum install --downloadonly ob-deploy --downloaddir=/opt/ob_rpm
```    

2\. Install obd on the central control server.
```
    # Upload the software package you downloaded in Step 1 to a directory such as /opt/ob_rpm.
    cd /opt/ob_rpm
    yum install ob-deploy-*.rpm -y
```

3\. Check whether obd is successfully installed.
```
    obd --help
```

4\. Disable the remote image sources.
```
    obd --version
    # If the obd version is earlier than V1.2.1, an obd upgrade is performed.
    
    obd mirror disable remote
```

5\. Copy the RPM package to the local image repository.
```
    obd mirror clone /opt/ob_rpm/*.rpm
```

6\. Edit the `YAML` file of obd.

7\. Deploy the OceanBase cluster.
```
    obd cluster deploy ${your_deploy_name} -c distributed-with-obproxy-example.yaml
```

8\. Start the cluster.
```
    obd cluster start ${your_deploy_name}
```

9\. Display the cluster information.
```
    obd cluster display ${your_deploy_name}
```

### Upgrade an OceanBase cluster online or offline by using obd

#### Upgrade obd online

1\.  Make sure that remote repositories are enabled.
```
    obd mirror list
    # If the value in the Enabled column is False, run the following command to enable remote repositories: obd mirror enable remote.
```
    

2\.  Run `obd update` with sudo privileges to upgrade obd.

#### Upgrade obd offline

To upgrade obd offline, you must upload the obd RPM package of a later version to the local server.

Click [here](https://en.oceanbase.com/softwarecenter) to download the package.

1\.  Disable remote image repositories.
```
    obd  mirror disable remote
```

2\. Copy the obd RPM package of a later version to the local image repository.
```
    obd mirror clone /yourpath/ob-deploy-xxxx.el7.x86_64.rpm
```

3\. Upgrade obd.
```
    sudo obd update
```

#### Upgrade an OceanBase cluster online

To upgrade an OceanBase cluster online, the servers must have Internet access.

1\.  Make sure that remote repositories are enabled.
```
    obd mirror list
    # If the value in the Enabled column is False, run the following command to enable remote repositories: obd mirror enable remote.
```

2\. View the MD5 checksum. An upgrade within the same major version requires verifying the uniqueness of the MD5 checksum for the target version, which is determined based on the release date of the version.
```
    obd mirror list oceanbase.community.stable | grep -e " oceanbase-ce " | grep -e " OceanBase Database version number "
```

3\. Run `obd cluster upgrade` to upgrade OceanBase Database.
```
    obd cluster upgrade testob -c oceanbase-ce -V ob_version --usable the list of image hashes used during the upgrade
```

4\. Connect to OceanBase Database to check whether it is successfully upgraded.

#### Upgrade an OceanBase cluster offline

To upgrade an OceanBase cluster offline, you must upload the OceanBase Database RPM package of a later version to the local server.

Click [here](https://en.oceanbase.com/softwarecenter) to download the package.

1\.  Disable remote repositories again. This step is required because remote repositories are enabled by default after an obd upgrade.
```
    obd mirror disable remote
```

2\. Copy the OceanBase Database RPM package of a later version to the local image repository.
```
    obd mirror clone /opt/oceanbase-ce-xxxx.rpm
    obd mirror clone /opt/oceanbase-ce-libs-xxxx.rpm
    obd mirror clone /opt/oceanbase-ce-utils-xxxx.rpm
```

3\. View the MD5 checksum. An upgrade within the same major version requires verifying the uniqueness of the MD5 checksum.
```
    obd mirror list local
```

4\. Upgrade OceanBase Database.
```
    obd cluster upgrade testob -c oceanbase-ce -V OceanBase Database version number
```

#### Upgrade ODP

In V4.0.0.0, no minor version upgrade is available for ODP. To upgrade ODP, use one of the following ways:

*   To upgrade ODP from V3.2.0 to V3.2.3, refer to [How do I upgrade an OBProxy to obproxy-ce 3.2.3?](https://en.oceanbase.com/docs/community-obd-en-10000000000842686)
*   ODP V3.2.3 and later have the same upgrade procedure as OceanBase Database. The corresponding component name and MD5 checksum are required.

#### FAQ

Q1: The following error occurs when I upgrade OceanBase Database: `[ERROR] Too many match`. What do I do?

A1: Check whether the upgrade command includes the `--usable` option with the MD5 checksum as its value.

Q2: Why does the following error occur when I upgrade OceanBase Database: `fail to get upgrade graph: ‘NoneType’ object has no attribute ‘version’`?

A2: OceanBase Database cannot be directly upgraded from V3.x to V4.x.

### Self-service diagnostics and diagnostic information collection

1.  Install OceanBase Diagnostic Tool (obdiag). 
a. For an OceanBase cluster not deployed by using obd, install obdiag V2.4.0. For more information, see this link. 
b. For an OceanBase cluster deployed by using obd V2.5.0 or later, install obdiag V1.5.2 or later. For more information, see this link.
2.  Use obdiag to inspect the cluster for diagnostics. 
a. For an OceanBase cluster not deployed by using obd, refer to this link for inspection execution and refer to this link for best practices. 
b. For an OceanBase cluster deployed by using obd, refer to this link for inspection execution.
3.  Run `obdiag rca run --scene=<scene_name>` in some scenarios for root cause analysis. For more information, see this link. After running the command, post the analysis result on the community forum to seek support. For scenarios not supported by this command, go to Step 4.
4.  Run `obdiag analyze log` to analyze the OceanBase Database logs within a specified time period for possible error messages. For more information, see this link. If the analysis result is not PASS, post it on the community forum to seek support. Otherwise, go to Step 5.
5.  If none of the preceding steps resolves your issue, run `obdiag gather` to collect and package the diagnostic information before and after the failure. For more information, see this link. After running the `obdiag gather` command, post the diagnostic information on the community forum to seek support.

Acknowledgments
----

This post is entirely the work of my colleagues.

They are:

*   Xieyun, R&D director of obd Community Edition
*   Pan Jiayao, R&D engineer in open source management
*   Tuwa, lead expert in obd O&M
*   Cishuang, technical support engineer
*   Xuhui, technical support engineer

Thanks to Xieyun and Pan Jiayao for their generous time and effort in producing this troubleshooting manual for the community!

Thanks to Tuwa, Cishuang, and Xuhui for their meticulous review of the manual despite their busy schedules!