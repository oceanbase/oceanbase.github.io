---
title: 初始化服务器
weight: 1
---
# **初始化服务器**

> **说明**
>
> - 部署前置配置详情可以参照官网 OceanBase 数据库文档 [部署前置部署](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001700627)。
>
> - 强烈建议部署 OceanBase 数据库前对服务器进行初始化，防止某些前置配置没有操作，导致使用过程中出现问题。

下面是一个初始化服务器的自动化脚本，仅供参考，如果使用可以根据实际详情进行变更。

补充下述脚本内的 `pubkey` 后可执行如下命令运行脚本。

```bash
bash init_ob.sh ob
```

## **自动化脚本**

```bash
#!/bin/bash
set -e

# 初始化 IDC 服务器
# 注意: 仅适用于新交付的全新服务器

if [ $# -ne 1 ]; then
    echo "$(basename $0): 输入参数错误!"
    echo "$(basename $0) [ mysql | ob ]"
    echo "示例: $(basename $0) mysql"
    exit 9
fi

baseName=`basename $0`
dbType=$1

case  "${dbType}" in
    'mysql')
    echo "db类型为 ${dbType}"
    ;;
    'ob')
    echo "db类型为 ${dbType}"
    ;;
    *)
    echo '参数错误！！！'
    echo "示例: $(basename $0) mysql"
    exit 9
esac

logName=`basename $0 | awk -F. '{print $1}'`".log."`date '+%Y%m%d%H%M%S'`
logFile="/tmp/$logName"
# OBD所在机器公钥
pubKey=""

logPrint()
{
    log_type=$1
    log_content=${@:2}
    case $log_type in
        error | Error | ERROR )
            echo -e "[`date +'%F %H:%M:%S'`] [ERROR] - $log_content" | tee -a $logFile;;
        info | Info | INFO )
            echo -e "[`date +'%F %H:%M:%S'`] [INFO] - $log_content" | tee -a $logFile;;
        warn | Warn | WARN )
            echo -e "[`date +'%F %H:%M:%S'`] [WARN] - $log_content" | tee -a $logFile;;
    esac
}

# 安全检查
processCnt=`ps -ef | grep -iE 'mysql|ob' | grep -v grep | grep -v 'export' | grep -v ${baseName} | grep -v init_server| wc -l`
if [ $processCnt -gt 0 ];then
    logPrint "ERROR" "有数据库进程存活, 请先检查!"
    echo '--------------------------------------------------------------------'
    ps -ef | grep -iE 'mysql|ob' | grep -v grep | grep -v 'export'
    echo '--------------------------------------------------------------------'
    exit 1
fi

mkdir -p /xx
fileCnt=`ls /xx | grep -v fio | grep -v total | wc -l`
if [ $fileCnt -gt 0 ];then
    logPrint "ERROR" "目录 /xx 下有未清理干净文件, 请先检查!"
    echo '--------------------------------------------------------------------'
    ls -l /xx | grep -v fio
    echo '--------------------------------------------------------------------'
    exit 1
fi

# 安全设置
rm -rf /root/.mysql_history
ln -s /dev/null /root/.mysql_history

# 关闭 swap
logPrint "INFO" "Turn off swap"
swapoff -a || true
echo "vm.swappiness = 0">> /etc/sysctl.conf
sed -i '/swap/s/^/#/' /etc/fstab
sysctl -p  2>&1 > /dev/null || true

# 初始化磁盘
# 其中 /xx 代表磁盘目录，分多个盘的话初始化多次，如果同一盘多个目录可自行设置
logPrint "INFO" "Format disk"
mkdir -p /xx/data
umount /xx
## 将原先这个磁盘的信息注释
sed -i '/xx/s/^/#/' /etc/fstab

mkfs.ext4 -F /dev/nvme0n1 &
wait
sleep 3
uuid=`lsblk -f | grep nvme0n1 | awk -F' ' '{print $3}'`
echo '' >> /etc/fstab
echo "UUID=\"${uuid}\" /xx ext4 defaults,nodelalloc,noatime 0 2" >> /etc/fstab
mount -a

# 初始化安装包
logPrint "INFO" "Install dependency packages"
yum install -y htop linux-cpupower parted ntpstat  byobu mariadb-client numactl irqbalance 2>&1 > /dev/null


# 新建用户
## 最后授权的 /xx 可以根据自己的数据、日志文件等进行修改
if [ $dbType = 'ob' ];then
    # 初始化用户以及 ssh
    mkdir -p /xx/ob
    logPrint "INFO" "Init admin user"
    useradd -m -s /bin/bash admin
    echo '' >> /etc/sudoers
    echo 'admin ALL=(ALL) NOPASSWD: ALL' >> /etc/sudoers
    mkdir -p /home/admin/.ssh
    echo '' >> /home/admin/.ssh/authorized_keys
    echo "${pubKey}" >> /home/admin/.ssh/authorized_keys
    chown -R admin:admin /home/admin/.ssh
    chown -R admin:admin /xx
fi

# 修改 vim 设置
touch ~/.vimrc
echo '' >> ~/.vimrc
echo 'syntax on' >> ~/.vimrc
echo 'set mouse=r' >> ~/.vimrc
echo 'set paste' >> ~/.vimrc


# 配置 limits 参数
logPrint "INFO" "Set limit config"
echo '' >>/etc/security/limits.conf
echo 'root soft nofile 655350' >> /etc/security/limits.conf
echo 'root hard nofile 655350' >> /etc/security/limits.conf
echo '* soft nofile 655350' >> /etc/security/limits.conf
echo '* hard nofile 655350' >> /etc/security/limits.conf
echo '* soft stack 20480' >> /etc/security/limits.conf
echo '* hard stack 20480' >> /etc/security/limits.conf
echo '* soft nproc 655360' >> /etc/security/limits.conf
echo '* hard nproc 655360' >> /etc/security/limits.conf
echo '* soft core unlimited' >> /etc/security/limits.conf
echo '* hard core unlimited' >> /etc/security/limits.conf


# 配置 sysctl.conf 参数
## 最后一行的 /data 要换成实际的 数据目录
logPrint "INFO" "Set sysctl.conf config"
echo '' >> /etc/sysctl.conf
echo '# for oceanbase' >> /etc/sysctl.conf
echo '## 修改内核异步 I/O 限制' >> /etc/sysctl.conf
echo 'fs.aio-max-nr=1048576' >> /etc/sysctl.conf
echo '' >> /etc/sysctl.conf
echo '## 网络优化' >> /etc/sysctl.conf
echo 'net.core.somaxconn = 2048' >> /etc/sysctl.conf
echo 'net.core.netdev_max_backlog = 10000' >> /etc/sysctl.conf
echo 'net.core.rmem_default = 16777216' >> /etc/sysctl.conf
echo 'net.core.wmem_default = 16777216' >> /etc/sysctl.conf
echo 'net.core.rmem_max = 16777216' >> /etc/sysctl.conf
echo 'net.core.wmem_max = 16777216' >> /etc/sysctl.conf
echo '' >> /etc/sysctl.conf
echo 'net.ipv4.ip_local_port_range = 3500 65535' >> /etc/sysctl.conf
echo 'net.ipv4.ip_forward = 0' >> /etc/sysctl.conf
echo 'net.ipv4.conf.default.rp_filter = 1' >> /etc/sysctl.conf
echo 'net.ipv4.conf.default.accept_source_route = 0' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_syncookies = 0' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_rmem = 4096 87380 16777216' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_wmem = 4096 65536 16777216' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 16384' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_fin_timeout = 15' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_max_syn_backlog = 16384' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_tw_reuse = 1' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_tw_recycle = 1' >> /etc/sysctl.conf
echo 'net.ipv4.tcp_slow_start_after_idle=0' >> /etc/sysctl.conf
echo '' >> /etc/sysctl.conf
echo 'vm.swappiness = 0' >> /etc/sysctl.conf
echo 'vm.min_free_kbytes = 2097152' >> /etc/sysctl.conf
echo '' >> /etc/sysctl.conf
echo '# 此处为 OceanBase 数据库的 data 目录' >> /etc/sysctl.conf
echo 'kernel.core_pattern = /data/core-%e-%p-%t' >> /etc/sysctl.conf



# 关闭透明大页
logPrint "INFO" "Stop transparent_hugepage"
echo never > /sys/kernel/mm/transparent_hugepage/enabled
echo never > /sys/kernel/mm/transparent_hugepage/defrag

# 关闭防火墙和SELinux
logPrint "INFO" "Stop firewalld"
systemctl disable firewalld
systemctl stop firewalld
# systemctl status firewalld
sed -i 's/^SELINUX=.*/SELINUX=disabled/' /etc/selinux/config

# NTP 安装
## ntp.xxxx 为公司内自己的NTP服务器, 可根据实际情况添加
# apt-get install -y ntp
# systemctl stop ntp.service || true
# echo 'y' | ntpdate ntp.xxxx 2>&1 > /dev/null || true

logPrint "INFO" "Completed Successfully"
```
