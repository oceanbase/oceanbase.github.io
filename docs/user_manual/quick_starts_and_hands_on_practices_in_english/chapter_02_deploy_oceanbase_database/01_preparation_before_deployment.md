---
title: Preparations before deployment
weight: 2
---
# 2.1 Preparations before deployment

OceanBase Database is a native distributed database. You can deploy OceanBase Database in standalone mode in an experience environment. However, you must deploy OceanBase Database on at least three servers in a production environment. The deployment of OceanBase Database has something in common with that of conventional databases. You need to modify the hardware and software settings of the operating system and adjust the file system to ensure stable operation and high performance of OceanBase Database.

## Software and hardware resources

OceanBase Database has been systematically tested and verified. We recommend that you deploy it in an environment that meets the software and hardware requirements listed in the following table.

| Item    | Requirement   | Description  |
|---------|-------|-------|
| Server  | Mainstream servers that adapt to common software from Chinese manufacturers are supported. | The support details are as follows: <ul><li>Physical servers: Suma H620 series, Huawei TaiShan 200 series, and Great Wall Qingtian DF720 </li><li>CPUs: Hygon 7185/7280, Kunpeng 920, and FeiTeng 2000+ </li><li>Operating systems: Kylin V4, Kylin V10, and UOS V20; upper-layer middleware: TongWeb V7.0 and Apusic Application Server V9.0 </li></ul> |
| Operating system   | x86 and Arm architectures are supported.  | The following operating systems are supported: <ul><li>Alibaba Cloud Linux 2/3 (kernel: Linux 3.10.0 and later)</li><li>Anolis OS 8.X (kernel: Linux 3.10.0 and later)</li><li>Red Hat Enterprise Linux Server 7.X and 8.X (kernel: Linux 3.10.0 and later)</li><li>CentOS Linux 7.X and 8.X (kernel: Linux 3.10.0 and later)</li><li>Debian 9.X and later (kernel: Linux 3.10.0 and later)</li><li>Ubuntu 20.X and later (kernel: Linux 3.10.0 and later)</li><li>SUSE/openSUSE 15.X and later (kernel: Linux 3.10.0 and later)</li><li>Kylin V10</li><li>UOS V20 </li><li>NFSChina 4.0 and later</li><li>Inspur KOS 5.8</li></ul> |
| CPU | <ul><li>For a test environment, at least 2 cores are required. </li><li>For a production environment, at least 4 cores are required and 32 cores or more are recommended. </li><li>For a performance test environment, 24 cores or more are recommended. </li></ul> | The values provided here are the minimum number of cores allocated to OceanBase Database, not the total number of cores on servers.  |
| Memory | <ul><li>For a test environment, at least 6 GB is required. </li><li>For a production environment, at least 16 GB is required. For long-term use, at least 32 GB is required, and a value in the range from 256 GB to 1024 GB is recommended. </li><li>For a performance test environment, a value in the range from 128 GB to 1024 GB is recommended. </li></ul> | The values provided here are the minimum size of memory allocated to OceanBase Database, not the total size of memory on servers. <blockquote><b>Note</b><br></br>If multiple clusters are deployed, we recommend that you use OceanBase Cloud Platform (OCP) for unified O&M management. If a small number of clusters are deployed, we recommend that you use OceanBase Deployer (OBD) for installation and deployment. </blockquote> |
| Swap    | The swap feature is prohibited.  | Partition swapping will compromise the performance of the entire cluster.  |
| Disk type | SSDs are used.  | We recommend that you do not use HDDs in a production environment or performance test environment. |
| File system  | XFS and ext4 are supported.  | Other file systems are not supported. When the data size exceeds 16 TB, XFS is recommended.  |
| Disk capacity | The total disk capacity must be more than six times the memory size.  | None  |
| Disk mounting  | The data disk size must be at least 20 GB. In an experience environment, the log disk size must be at least 24 GB. In a production environment, the log disk size must be at least 48 GB.  | The rules for configuring the data disk size and log disk size are described as follows: <ul><li>We recommend that the combined size of the log disk and data disk be more than six times the size of memory allocated to OceanBase Database. Specifically, it should be greater than `memory_limit` × 6. </li><li>We recommend that the log disk size be three times the size of memory allocated to OceanBase Database. Specifically, it should be `memory_limit` × 3. </li><li>You can estimate the data disk size based on the business data volume. </li><li>In a production environment, data and logs must be stored on separate disks to avoid compromising the performance. </li></ul> |
| RAID   | Supported    | To use RAID cache, data must be written in write-through mode. |
| NIC  | At least a 1 Gbit/s NIC is used. A 10 Gbit/s NIC is recommended. | None  |

> **Note**
>
> * More software and hardware platforms are currently being tested for compatibility.
>
> * If you plan to deploy an OceanBase cluster on multiple servers, make sure that all servers in the cluster have the same configurations.

For the Red Hat operating system earlier than RHEL 9, run the following command to manually disable the transparent huge page mode:

```shell
echo never > /sys/kernel/mm/redhat_transparent_hugepage/enabled
```

For the Red Hat operating system RHEL 9 or CentOS operating system, run the following command to manually disable the transparent huge page mode:

```shell
echo never > /sys/kernel/mm/transparent_hugepage/enabled
```

## Command dependencies

|   Environment package   |                 Requirement                 |                      Reason                      |
| ---------- | ------------------------------------ | ---------------------------------------------- |
| nc         | Strong dependency                               | The `nc` command is required when you deploy OceanBase Database by using OCP.          |
| net-tools  | Strong dependency                               | The `netstat` command is required when you deploy OceanBase Database by using OCP.     |
| Python     | Python 2.7 and later                   | Python commands are required when you add hosts in the OCP console. Python 2 commands are not supported.    |
| JDK        | java-1.8.0-openjdk                   | JDK is required when you deploy OCP Express and OCP by using OBD.               |
| ntp/Chrony | Non-strong dependency                             | OceanBase clusters require that the time difference be less than 2s.                  |
| NFS        | Non-strong dependency                             | OceanBase Database uses Network File System (NFS) as the backup media for remote physical backup.            |

## Server initialization

> **Note**
>
> * Server initialization is optional for deploying an experience environment, and is required for deploying a production environment.
>
> * This section describes how to initialize servers in an environment deployed by using a x86-based CentOS Linux 7.9 image. The procedure may differ for other environments.

### Create a user and a user group

The following example describes how to create a normal operating system user `admin`.

> **Note**
>
> * You need to perform the following operations on each OBServer node.
>
> * In OCP Community Edition of a version earlier than V4.2.0, you can use only the `admin` user to install and deploy OceanBase Database and OceanBase Database Proxy (ODP), also known as OBProxy. In OCP Community Edition V4.2.0 and later, you can use a custom user to install and deploy them. We recommend that you use OCP of the latest version for deployment.
>
> * OBD allows you to use any operating system users to install and deploy OceanBase Database and ODP.

1. Create a user group named `admin`.

   ```shell
   [root@test001 ~]# groupadd -g 6001 admin
   ```

2. Create a user named `admin`.

   ```shell
   [root@test001 ~]# useradd -u 6001 -g admin admin
   ```

   > **Notice**
   >
   > The user ID must be consistent on all OBServer nodes. Otherwise, the backup will fail due to permission issues when you use NFS as the backup media.

3. Configure the password of the `admin` user.

   ```shell
   [root@test001 ~]# passwd admin
   ```

   Enter the password on the CLI.

### Configure passwordless sudo access for the user

1. Add the write permission of the `sudoers` file in the `/etc/` directory.

   ```shell
   [root@test001 ~]# chmod u+w /etc/sudoers
   ```

2. Configure passwordless sudo access for the `admin` user.

   ```shell
   [root@test001 ~]# vim /etc/sudoers
   ```

   Append the following content to the end of the `sudoers` file in the `/etc/` directory:

   ```shell
   ## Same thing without a password
   # %wheel        ALL=(ALL)       NOPASSWD: ALL
   admin       ALL=(ALL)       NOPASSWD: ALL
   ```

3. Remove the write permission of the `sudoers` file in the `/etc/` directory.

   ```shell
   [root@test001 ~]# chmod u-w  /etc/sudoers
   ```

### Configure SSH trust for the user

1. Run the following command on the server where OBD resides to check whether the public key of the user exists:

   ```shell
   [admin@test001 ~]# ls ~/.ssh/id_rsa.pub
   ```

   If yes, you do not need to generate a new key.

2. (Optional) Run the following command to generate the public and private SSH keys:

   ```shell
   [admin@test001 ~]# ssh-keygen -t rsa
   ```

3. Run the following command on the server where OBD resides to copy the generated public SSH key to the `authorized_keys` file on the target server:

   ```shell
   [admin@test001 ~]# ssh-copy-id -i ~/.ssh/id_rsa.pub <user>@<server_ip>
   ```

If your server supports `yum` commands, you can run a script after the keys are generated to configure SSH trust. The procedure is as follows:

> **Note**
>
> To run a script to configure SSH trust, you must have sudo permissions.

1. Create a script.

   ```shell
   [admin@test001 ~]# vim ssh.sh
   ```

   In this example, the script is named `ssh.sh`. You can specify a custom name. The script content is as follows:

   ```shell
   #!/usr/bin/bash
   
   SERVERS=("<user>@<server_ip1>" "<user>@<server_ip2>" "<user>@<server_ip3>")
   PASSWORD="******"
   keygen() {
   sudo yum -y install expect
   expect -c "
      spawn ssh-keygen -t rsa
      expect {
         *(~/.ssh/id_rsa):* { send -- \r;exp_continue}
         *(y/n)* { send -- y\r;exp_continue}
         *Enter* { send -- \r;exp_continue}
         *(y/n)* { send -- y\r;exp_continue}
         *Enter* { send -- \r;exp_continue}
         eof {exit 0}
      }
      expect eof
   "
   }
   copy(){
   expect -c "
      set timeout -1
      spawn ssh-copy-id $1
      expect {
         *(yes/no)* { send -- yes\r; exp_continue }
         *password:* { send -- $PASSWORD\r; exp_continue}
         eof {exit 0}
      }
      expect eof
   "
   }
   ssh_copy_id_to_all(){
   keygen ;
   for host in ${SERVERS[@]}
   do
         copy $host
   done
   }
   ssh_copy_id_to_all
   ```

   > **Notice**
   >
   > * You must replace the server list and password in the first two lines of the script with the actual server list and password.
   >
   > * SSH trust between the OBD node, OCP node, and target service node must be configured for the created user.

2. Add the execute permission of the script.

   ```shell
   [admin@test001 ~]# chmod u+x your_script.sh
   ```

3. Execute the script.

   ```shell
   [admin@test001 ~]# ./ssh.sh
   ```

### Disk and file system planning

<table>
  <thead>
    <tr>
      <th>Mount point</th>
      <th>Size</th>
      <th>Description</th>
      <th>File system format</th>
    </tr>
  </thead>
  <tr>
    <td>/home</td>
    <td>100 GB to 300 GB</td>
    <td>Installation directory</td>
    <td rowspan="3">When the data size does not exceed 16 TB, both XFS and ext4 are supported, but ext4 is recommended. When the data size exceeds 16 TB, XFS must be used. </td>
  </tr>
  <tr>
    <td>/data</td>
    <td>Depending on the size of data to be stored</td>
    <td>Data directory of OceanBase Database</td>
  </tr>
  <tr>
    <td>/redo</td>
    <td>Three to four times the memory size of the database</td>
    <td>Transaction log directory of OceanBase Database</td>
  </tr>
</table>

> **Note**
>
> In a production environment, we recommend that you deploy the data directory (`/data`) and transaction log directory (`/redo`) on separate disks, that is, use independent mount directories.

The directories mentioned in the preceding table are described as follows:

* Installation directory

  The installation directory of OceanBase Database stores non-data files, such as binary files, configuration files, and system log files. It features sequential writes. System log files, including `observer.log`, `election.log`, `rootservice.log`, and `trace.log`, occupy a significant portion of disk space. In OceanBase Database, the size of each system log file is limited to 256 MB. Generally, new system logs are generated every 3 to 8 minutes. Therefore, you must ensure sufficient space for storing the log files and reserve extra capacity to support software upgrade and maintenance operations.
  
  We recommend that the remaining disk space be at least 200 GB in a production environment. If a long system log retention period is specified, you need to estimate the required disk space based on the amount of system logs generated by the business system.

* Data directory

  The data directory of OceanBase Database stores the baseline data. It features random reads, sequential writes, and occasionally intensive random writes. The space of the data directory is preallocated. Once you specify the size of the directory and deploy it, the space is immediately occupied. You cannot modify a parameter to reduce the allocated space. The size of disk space required for the data directory depends on the amount of business data and the estimated data growth trends. If the data directory and transaction log directory are deployed on the same disk, we recommend that you specify a fixed disk capacity for the data directory by using the `datafile_size` parameter.

* Transaction log directory

  The transaction log directory of OceanBase Database stores all transaction operation logs. It features sequential writes. The space of the transaction log directory is preallocated. Once you specify the size of the directory and deploy it, the space is immediately occupied. You can modify a parameter to dynamically adjust the allocated space.
  
  OceanBase Database uses the Write-Ahead Logging (WAL) strategy to ensure the atomicity and durability of transactions. Sufficient log space is required to handle the log generation speed in high-concurrency transaction scenarios. To ensure stable system operation and avoid service interruptions caused by log overflow, the transaction log directory must have sufficient reserved space. We recommend that the size of the reserved space be no less than three to four times the memory size of OceanBase Database. If the transaction log directory and data directory are deployed on the same disk, we recommend that you specify a fixed disk capacity for the transaction log directory by using the `log_disk_size` parameter.

By default, the installation directory is located under the home directory of the deployment user, for example, `/home/admin`. The data directory (such as `/data`) and transaction log directory (such as `/redo`) must be mounted to different disks, and the permissions of both directories are 755 (drwxr-xr-x).

```shell
[admin@test001 ~]$ ls -ld /data 
drwxr-xr-x 2 admin admin 4096 Jan 25 17:34 /data

[admin@test001 ~]$ ls -ld /redo 
drwxr-xr-x 2 admin admin 4096 Jan 25 17:35 /redo

[admin@test001 ~]$ df -h
Filesystem      Size  Used Avail Use% Mounted on
devtmpfs         16G     0   16G   0% /dev
tmpfs            16G     0   16G   0% /dev/shm
tmpfs            16G  676K   16G   1% /run
tmpfs            16G     0   16G   0% /sys/fs/cgroup
/dev/vda1       500G   50G  450G  90% /
/dev/vdb        500G    0   500G   0% /data
/dev/vdc        500G    0   500G   0% /redo
```

#### (Optional) Configure logical volumes for disks

In practice, you may encounter a situation where the disk capacity of servers is insufficient to store more data, and adding a server is costly. In this case, you can scale out the disks to resolve the issue. We recommend that you configure logical volumes for the disks before deployment.

The following example describes how to use four disks to create a disk/file system required for deploying OceanBase Database.

1. Initialize physical volumes.

   ```shell
   [admin@test001 ~]$ pvcreate /dev/vdb
   [admin@test001 ~]$ pvcreate /dev/vdc
   [admin@test001 ~]$ pvcreate /dev/vdd
   [admin@test001 ~]$ pvcreate /dev/vde
   ```

2. Create volume groups.

   ```shell
   [admin@test001 ~]$ vgcreate vg_obdata /dev/vdb /dev/vdc /dev/vdd
   [admin@test001 ~]$ vgcreate vg_obredo /dev/vde
   ```

3. Create logical volumes.

   ```shell
   [admin@test001 ~]$ lvcreate -l 100%FREE vg_obdata -n lv_obdata
   [admin@test001 ~]$ lvcreate -l 100%FREE vg_obredo -n lv_obredo
   ```

4. Format logical volumes.

   ```shell
   [admin@test001 ~]$ mkfs.ext4 /dev/vg_obdata/lv_obdata
   [admin@test001 ~]$ mkfs.ext4 /dev/vg_obredo/lv_obredo
   ```

   At present, ext4 and XFS are supported. For more information, see the description of file formats in preceding sections.

5. Create mount points.

   ```shell
   [admin@test001 ~]$ sudo mkdir /data
   [admin@test001 ~]$ sudo mkdir /redo
   ```

6. Configure automatic mounting upon startup.

   Add the following content to the `fstab` file in the `/etc/` directory:

   ```shell
   /dev/vg_obdata/lv_obdata          /data         ext4            defaults,noatime,nodiratime,nodelalloc,barrier=0        0 0
   /dev/vg_obredo/lv_obredo          /redo         ext4            defaults,noatime,nodiratime,nodelalloc,barrier=0        0 0
   ```

7. Perform mounting and confirm the operation.

   ```shell
   [admin@test001 ~]$ mount -a
   [admin@test001 ~]$ df -h
   ```

### Modify user resource limits

Add the following content to the `limits.conf` file in the `/etc/security/` directory:

```shell
root soft nofile 655350
root hard nofile 655350

* soft nofile 655350
* hard nofile 655350
* soft stack 20480
* hard stack 20480
* soft nproc 655360
* hard nproc 655360
* soft core unlimited
* hard core unlimited
```

> **Note**
>
> If the `20-nproc.conf` file exists in the `/etc/security/limits.d/` directory and contains the `nproc` setting, you must change the value of `nproc` to `655360`.

### Modify kernel parameters

Add the following content to the `sysctl.conf` file in the `/etc/` directory:

> **Note**
>
> When you deploy OceanBase Database in a container, you need to modify the corresponding kernel configurations on the host. The container will inherit the kernel configurations of the host.

```shell
# for oceanbase
# Modify the limit on the asynchronous I/O in the kernel.
fs.aio-max-nr=1048576

# Optimize the network.
net.core.somaxconn = 2048
net.core.netdev_max_backlog = 10000
net.core.rmem_default = 16777216
net.core.wmem_default = 16777216
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216

net.ipv4.ip_local_port_range = 3500 65535
net.ipv4.ip_forward = 0
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_max_syn_backlog = 16384
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 1
net.ipv4.tcp_slow_start_after_idle=0

vm.swappiness = 0
vm.min_free_kbytes = 2097152
vm.overcommit_memory = 0

fs.file-max = 6573688

# Modify the number of virtual memory areas that a process can have.
vm.max_map_count = 655360

# Configure to store the core dump file in the data directory of OceanBase Database.
kernel.core_pattern = /data/core-%e-%p-%t
```

> **Note**
>
> We recommend that you do not specify a path in the root partition for `kernel.core_pattern`. This is to prevent the root partition from filling up with excessively large core dump files.

For an Arm-based system, you also need to add the following content to the `sysctl.conf` file in the `/etc/` directory:

```shell
# Disable NUMA balancing to avoid performance jitters during balancing.
rnel.numa_balancing = 0

# Disable memory reclamation and reallocation.
vm.zone_reclaim_mode = 0
```

Then, run the `sysctl -p` command to load and validate the configuration file.

### Disable the firewall and SELinux

* Disable the firewall and confirm the operation

  ```shell
  [root@test001 ~]$ systemctl disable firewalld
  [root@test001 ~]$ systemctl stop firewalld
  [root@test001 ~]$ systemctl status firewalld
  ```

  If `Active: inactive (dead)` is included in the output, the firewall is successfully disabled.

* Disable SELinux and confirm the operation

  ```shell
  [root@test001 ~]$ sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/sysconfig/selinux
  ```

  Although the `SELINUX` parameter can take effect temporarily, we recommend that you restart the server after it is initialized to persist the parameter.

  After the server restarts, run the following command to verify whether SELinux is disabled:

  ```shell
  [root@test001 ~]$ getenforce
  ```
  
  If the `getenforce` command returns `Disabled`, SELinux is successfully disabled.

### Configure the clock source

OceanBase Database is a native distributed database system. If you deploy it in a cluster, you must ensure that time is synchronized across all servers in the cluster. Otherwise, the cluster cannot start. OceanBase Database V4.x allows a clock offset of no more than 2s among servers in a cluster. When the clock offset exceeds 2s, no leader is available. After clock synchronization resumes, you can restart the OceanBase cluster to solve the issue.

We recommend that you use the Chrony service as the clock source for CentOS and Red Hat 7.x. Chrony is another implementation of NTP. Unlike the ntpd service, the Chrony service can synchronize the system clock more quickly and accurately, thereby reducing the time and frequency errors.

You can install and configure the Chrony service based on the description in this section. For more information about how to use NTP as the clock source, see [(Optional) Configure the clock source](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001106067).

1. Install the Chrony server.
  
   ```shell
   [root@test001 ~]$ yum -y install chrony
   ```

2. Configure the Chrony server.

   ```shell
   [root@test001 ~]$ vim /etc/chrony.conf
   ```

   The file content is as follows:

   ```shell
   # Enter an NTP server after "server".

   # Use public servers from the pool.ntp.org project. Technically, you can add an unlimited number of NTP servers.
   
   # You can also use the NTP servers of Alibaba Cloud.
   
   # Please consider joining the pool (<http://www.pool.ntp.org/join.html>)
   
   server ntp.cloud.aliyuncs.com minpoll 4 maxpoll 10 iburst
   server ntp.aliyun.com minpoll 4 maxpoll 10 iburst
   server ntp1.aliyun.com minpoll 4 maxpoll 10 iburst
   server ntp1.cloud.aliyuncs.com minpoll 4 maxpoll 10 iburst
   server ntp10.cloud.aliyuncs.com minpoll 4 maxpoll 10 iburst
   
   # If no NTP server is available in a test environment, select a server and configure it as the NTP server.
   
   # If you select the local server, uncomment the following server:
   
   # server 127.127.1.0
   
   # Calculate the rate at which the system clock gains/loses time and record the rate in a file. Make the best time compensation for the system after the system restarts.
   
   driftfile /var/lib/chrony/drift
   
   # chronyd slows down or speeds up time adjustment as needed.
   
   # In some cases, the system clock may drift quickly and thereby prolongs time adjustment.
   
   # This directive forces chronyd to adjust the time. The system clock is stepped to the correct time if its offset is larger than the specified threshold.
   
   # This directive takes effect only when the startup time of chronyd exceeds the specified limit (you can use a negative value to disable the limit) and no more clock updates are available.
   
   makestep 1.0 3
   
   # Enable a kernel mode in which the system time is copied to the real-time clock (RTC) every 11 minutes.
   
   rtcsync
   
   # Enable hardware timestamping on all interfaces that support it
   
   # Use the hwtimestamp directive to enable hardware timestamping.
   
   # hwtimestamp eth0
   # hwtimestamp eth1
   # hwtimestamp *
   
   # Increase the minimum number of selectable sources required to adjust
   
   # the system clock
   
   # minsources 2
   
   # Specify a host, subnet, or network to allow or disallow NTP connections to the server that functions as the NTP server.
   
   # allow 192.168.0.0/16
   # deny 192.168/16
   
   # Serve time even if not synchronized to a time source.
   
   local stratum 10
   
   # Specify the file containing keys for NTP authentication.
   
   # keyfile /etc/chrony.keys
   
   # Specify the directory where log files are stored.
   
   logdir /var/log/chrony
   
   # Select which information is logged
   
   # log measurements statistics tracking
   ```

   Here is a simple configuration example:

   ```shell
   server 10.10.10.1
   allow 10.10.10.0/24
   local stratum 10
   ```

3. Start the Chrony service and verify the service status.

   ```shell
   [root@test001 ~]$ systemctl start chronyd
   [root@test001 ~]$ systemctl enable chronyd
   [root@test001 ~]$ systemctl status chronyd
   ```

4. Install the Chrony client.

   ```shell
   [root@test002 ~]$ yum -y install chrony
   ```

5. Configure the Chrony client.

   ```shell
   [root@test002 ~]$ server 10.10.10.1 minpoll 4 maxpoll 10 iburst
   ```

6. Check whether the clock is synchronized.

   ```shell
   [root@test002 ~]$chronyc tracking
   ```

   In the output, if the value of `Leap status` is `Normal`, the synchronization process is normal. If the value of `Leap status` is `Not synchronised`, a synchronization error occurs.

   ```shell
   Reference ID    : AC18FF60 (10.10.10.1)
   Stratum         : 3
   Ref time (UTC)  : Wed Jan 31 07:49:10 2024
   System time     : 0.000003143 seconds slow of NTP time
   Last offset     : -0.000003572 seconds
   RMS offset      : 0.000003572 seconds
   Frequency       : 7.534 ppm slow
   Residual freq   : +14.035 ppm
   Skew            : 0.192 ppm
   Root delay      : 0.003962355 seconds
   Root dispersion : 0.010611359 seconds
   Update interval : 2.0 seconds
   Leap status     : Normal
   ```

## Common resource parameters of OceanBase Database and their calculation methods

> **Note**
>
> For more information about the parameters mentioned in this section, see [Overview](https://en.oceanbase.com/docs/common-oceanbase-database-10000000001103709).

<table>
  <thead>
    <tr>
      <th></th>
      <th>Parameter</th>
      <th>Description</th>
      <th>Modification mode</th>
      <th>Tips</th>
    </tr>
  </thead>
  <tr>
    <td>CPU resource parameters</td>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105435'>cpu_count</a></td>
    <td>The number of CPU cores for OceanBase Database. The value is an integer, such as <code>16</code>. The default value is <code>0</code>. If the parameter is set to <code>0</code>, the system automatically detects and sets the number of CPU cores. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>Other cluster parameters may affect the way in which this parameter takes effect. After you modify this parameter, we recommend that you use a SELECT statement to query the actual value of <code>CPU_CAPACITY</code> in the <code>GV$OB_SERVERS</code> internal table. If the modification does not take effect dynamically, restart the cluster. <blockquote><b>Notice</b><br></br>When you decrease the parameter value, make sure that the new value is not smaller than the number of CPU cores that have been allocated. </blockquote></td>
  </tr>
  <tr>
    <td rowspan="3">Memory resource parameters</td>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105475'>memory_limit</a></td>
    <td>The size of memory for OceanBase Database. You need to specify the unit when you configure this parameter, such as <code>32G</code>. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>Take note of the following considerations when you configure this parameter: <ul><li><code>memory_limit</code> has no upper bound. We recommend that you plan the memory size based on the actual size of available memory, which is shown in the <code>free</code> column of the <code>free -m</code> command output. </li><li>You can dynamically increase or decrease the memory size. The specified value must not be smaller than the size of memory that has been allocated on OBServer nodes. </li><li><code>memory_limit</code> has a higher priority than <code>memory_limit_percentage</code>. When both are configured, the value of <code>memory_limit</code> prevails. </li></ul></td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105533'>memory_limit_percentage</a></td>
    <td>The percentage of the memory available for OceanBase Database to the total memory. The value is an integer, such as <code>80</code> (indicating 80%). </td>
    <td>You can modify the parameter dynamically.</td>
    <td>When this parameter and the <code>memory_limit</code> parameter are both configured, the value of <code>memory_limit</code> prevails. </td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105522'>system_memory</a></td>
    <td>The memory reserved for the tenant whose ID is <code>500</code>, that is, the internal runtime memory of OceanBase Database. You need to specify the unit when you configure this parameter, such as <code>30G</code>. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>Take note of the following considerations when you configure this parameter: <ul><li>The recommended value range of <code>system_memory</code> changes depending on the value of <code>memory_limit</code>. <ul><li>When the value of <code>memory_limit</code> falls within the range [16G, 32G], the value range of <code>system_memory</code> is [3G, 5G]. </li><li>When the value of <code>memory_limit</code> falls within the range [32G, 64G], the value range of <code>system_memory</code> is [5G, 10G]. </li><li>When <code>memory_limit</code> is set to a value greater than 64 GB, you can calculate the value of <code>system_memory</code> by using the <code>system_memory = 3 * (sqrt(memory_limit) - 3G)</code> formula and take the integral part of the calculation result. </li></ul></li><li>When <code>system_memory</code> is set to <code>0</code>, the system applies for memory adaptively. </li><li>The <code>system_memory</code> setting does not apply to the sys tenant. The sys tenant is an adaptive resource tenant automatically created by the system after OceanBase Database is deployed, with an ID of <code>1</code>. The <code>system_memory</code> setting applies to the tenant with the ID <code>500</code>. </li></ul></td>
  </tr>
  <tr>
    <td rowspan="6">Disk resource parameters</td>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105406'>datafile_size</a></td>
    <td>The size of disk space preallocated to data files of OceanBase Database. You need to specify the unit when you configure this parameter, such as <code>32G</code>. </td>
    <td>The space specified by this parameter is preallocated and you cannot decrease the value.</td>
    <td>Take note of the following considerations when you configure this parameter: <ul><li>The required disk space is allocated in advance. If the disk usage is high after deployment, this is normal. </li><li><code>datafile_size</code> has a higher priority than <code>datafile_disk_percentage</code>. If both are configured, the value of <code>datafile_size</code> prevails. </li></ul></td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105552'>datafile_disk_percentage</a></td>
    <td>The percentage of disk space preallocated to data files, such as <code>80</code> (indicating 80%). </td>
    <td>The space specified by this parameter is preallocated and you cannot decrease the value.</td>
    <td>When this parameter and the <code>datafile_size</code> parameter are both configured, the value of <code>datafile_size</code> prevails. </td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105473'>datafile_next</a></td>
    <td>The step size of automatic space scale-out for disk files. You need to specify the unit when you configure this parameter, such as <code>100G</code>. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>This parameter must be used in combination with <code>datafile_max</code>. </td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105407'>datafile_maxsize</a></td>
    <td>The maximum space allowed in automatic space scale-out for disk files. You need to specify the unit when you configure this parameter, such as <code>100G</code>. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>Take note of the following considerations when you configure this parameter: <ul><li>When you decrease the parameter value, the new value must not be smaller than the size of occupied data disk space. </li><li>This parameter must be used in combination with <code>datafile_max</code>. </li><li>When <code>datafile_next</code> and <code>datafile_maxsize</code> are set to values greater than 0, on-demand space allocation is enabled. At this time, <code>datafile_size</code> or <code>datafile_disk_percentage</code> affects the size of initial data files on the disk. </li></ul></td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105489'>log_disk_size</a></td>
    <td>The size of disk space preallocated to redo log files of OceanBase Database. You need to specify the unit when you configure this parameter, such as <code>20G</code>. </td>
    <td>The space specified by this parameter is preallocated but you can modify the value dynamically.</td>
    <td>Take note of the following considerations when you configure this parameter: <ul><li>The value of <code>log_disk_size</code> must be at least three times the value of <code>memory_limit</code>, namely, <code>log_disk_size</code> >= <code>memory_limit</code> × 3.</li><li>The required disk space is allocated in advance. If the disk usage is high after deployment, this is normal. </li><li><code>log_disk_size</code> has a higher priority than <code>log_disk_percentage</code>. When both are configured, the value of <code>log_disk_size</code> prevails. </li></ul></td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105486'>log_disk_percentage</a></td>
    <td>The percentage of disk space preallocated to redo log files, such as <code>80</code> (indicating 80%). </td>
    <td>The space specified by this parameter is preallocated but you can modify the value dynamically.</td>
    <td>When this parameter and the <code>log_disk_size</code> parameter are both configured, the value of <code>log_disk_size</code> prevails. </td>
  </tr>
  <tr>
    <td rowspan="2">System log parameters</td>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105534'>enable_syslog_recycle</a></td>
    <td>Specifies whether log files generated before the restart will be recycled after the restart. We recommend that you set the value to <code>true</code>. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>This parameter must be used in combination with <code>max_syslog_file_count</code>. If you set this parameter to <code>false</code>, the log files that can be retained before log recycling do not include those generated before the restart. </td>
  </tr>
  <tr>
    <td><a href='https://en.oceanbase.com/docs/common-oceanbase-database-10000000001105563'>max_syslog_file_count</a></td>
    <td>The maximum number of system log files that can be retained before the recycling of OceanBase Database system log files. </td>
    <td>You can modify the parameter dynamically.</td>
    <td>This parameter must be used in combination with <code>enable_syslog_recycle</code>. A single system log file can occupy at most 256 MB disk space. We recommend that you set the number of system log files based on the log retention period in a production environment. <blockquote><b>Notice</b><br></br>System log files are frequently generated in OceanBase Database. Pay attention to the number of system log files and the disk size to prevent the disk from being used up. </blockquote></td>
  </tr>
</table>
