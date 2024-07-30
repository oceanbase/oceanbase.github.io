---
title: 数据迁移平台 - OMS
weight: 3
---

> OMS 迁移任务使用的资源比较多，建议机器预留充足的资源，比如单个任务内存10G以上。

# 安装 influxdb
如果需要 OMS 收集和展示监控数据，那么需要安装部署 influxdb；不需要的话可以忽略，直接安装 OMS。

1. 下载
```
wget https://oms-images.oss-cn-shanghai.aliyuncs.com/current_branchs/influxdb_1.8.tar.gz
```

2. 加载镜像
```
docker load -i influxdb_1.8.tar.gz
```

3. 启动 Docker 容器
```
# 端口需要使用 8086 端口
sudo docker run  -dit -p 8086:8086 -p 14444:14444 \
-v {挂载数据盘}:/var/lib/influxdb \
--env INFLUXDB_BIND_ADDRESS=127.0.0.1:14444 \
--env INFLUXDB_HTTP_AUTH_ENABLED=true \
--env INFLUXDB_HTTP_PING_AUTH_ENABLED=true \
--name=oms-influxdb \
influxdb:1.8
```

4. 设置 账号密码
```
# 查看容器，获取对应容器 NAMES
docker ps
# 指定 NAMES 进入到容器
docker exec -it ${INFLUXDB_NAME} bash
# 打开 InfluxDB 控制台
cd /usr/bin
./influx
# 创建账号密码
create user "${USER_NAME}" with password '${PASSWORD}' with all privileges
```

# 安装OMS

1. 下载安装包（可以去官网下载最新版本）

```
wget https://obbusiness-private.oss-cn-shanghai.aliyuncs.com/download-center/opensource/oms/4.2.0-CE/oms_4.2.0-ce.tar.gz
```

2. 加载安装包
```
# 如果没有安装 docker 想要先进行安装和启动
yum install -y docker
service docker start
docker load -i oms_4.2.0-ce.tar.gz
```

3. 创建 OMS Meta 租户
```
# 命名和资源可自定义
create resource unit unit_oms max_cpu 4, min_cpu 4, memory_size '8G', log_disk_size '24G', max_iops 100000;
create resource pool pool_oms unit = 'unit_oms', unit_num = 1, zone_list = ('zone1');
create tenant oms_meta replica_num = 1,primary_zone='RANDOM', resource_pool_list=('pool_oms') set ob_tcp_invited_nodes='%';

# 修改 root 密码
set password for root=password('xxxx');
```

4. 修改配置文件

```
[root@iZ0jl7bmjvyd7ojkpcdiggZ oms]# cat config.yaml
# OMS 社区版元数据库信息
oms_meta_host: ${oms_meta_host}
oms_meta_port: ${oms_meta_port}
oms_meta_user: ${oms_meta_user}
oms_meta_password: ${oms_meta_password}

# 用户可以自定义以下三个数据库的名称，OMS 社区版部署时会在元信息库中创建出这三个数据库
drc_rm_db: drc_rm_db
drc_cm_db: drc_cm_db
drc_cm_heartbeat_db: drc_cm_heartbeat_db

# OMS 社区版集群配置
# 单节点部署时，通常配置为当前 OMS 社区版机器 IP（建议使用内网 IP,不建议使用 127.0.0.1）
cm_url: http://172.xx.xx.xx:8088
cm_location: 0   # 地域码，取值范围为 [0,127]
# 单节点部署时，无需设置 cm_region
cm_region: ''
# 单节点部署时，无需设置 cm_region_cn
cm_region_cn: ''
cm_is_default: true
cm_nodes:
 - 172.xx.xx.xx

# 时序数据库配置
# 默认值为 false。如果您需要开启指标汇报功能，请设置为 true
tsdb_enabled: true
# 当 tsdb_enabled 为 true 时，请取消下述参数的注释并根据实际情况填写
tsdb_service: 'INFLUXDB'
tsdb_url: '172.xx.xx.xx:8086'
tsdb_username: ${tsdb_user}  # 上面创建的账号密码
tsdb_password: ${tsdb_password}
```

5. 查看相关镜像
```
# 获取 IMAGE ID 作为后面
docker images
```

6. 从加载的镜像中获取部署脚本
```
sudo docker run --name oms-config-tool <IMAGE ID> bash && sudo docker cp oms-config-tool:/root/docker_remote_deploy.sh . && sudo docker rm -f oms-config-tool
```

7. 通过部署脚本启动部署工具
```
# /data/oms 为 OMS 容器挂载目录，/root/oms/config.yaml 为配置文件地址，根据实际情况填写即可
sh docker_remote_deploy.sh -o /data/oms -c /root/oms/config.yaml -i sh docker_remote_deploy.sh -o <OMS 容器挂载目录> -c <已有 config.yaml 配置文件地址> -i <本机 IP 地址> -d <IMAGE ID>
```

根据工具提示完成部署，每次输入后，通过回车进入下一步。

除了这两步，其他一路回车就好，会根据配置文件作为默认配置。部署过程中需要关注是否有明显的报错，比如初始化 SQL 插入失败。
![image.png](/img/deploy_tools/deploy_oms/p1.png)

8. 部署完成后，如果您需要修改配置，请登录至运行的 OMS 容器中进行以下操作：

- 登陆到容器
```
[root@iZ0jl7bmjvyd7ojkpcdiggZ oms]# docker ps
CONTAINER ID        IMAGE               COMMAND                  CREATED             STATUS              PORTS                                              NAMES
c51d1b1bbe2f        89bcd10c636e        "/bin/sh -c '/usr/..."   10 minutes ago      Up 10 minutes                                                          OMS_20231117_103102
7a2dfd02ed79        influxdb:1.8        "/entrypoint.sh in..."   14 hours ago        Up 14 hours         0.0.0.0:8086->8086/tcp, 0.0.0.0:14444->14444/tcp   oms-influxdb
[root@iZ0jl7bmjvyd7ojkpcdiggZ oms]# docker exec -it c51d1b1bbe2f bash
```

- 修改配置

    1. 根据业务需求，修改 config.yaml 文件。
    2. 执行命令 python -m omsflow.scripts.units.oms_init_manager --init-config-file。
    3. 执行命令 supervisorctl restart oms_console oms_drc_supervisor。

    config.yaml 文件的位置，可以执行 2 查看使用的配置。
![image.png](/img/deploy_tools/deploy_oms/p2.png)

9. 查看组件运行状态
```
[root@iZ0jl7bmjvyd7ojkpcdiggZ ~]# supervisorctl status
nginx                            RUNNING   pid 1045, uptime 0:11:03
oms_console                      RUNNING   pid 1053, uptime 0:10:53
oms_drc_cm                       RUNNING   pid 1125, uptime 0:10:42
oms_drc_supervisor               RUNNING   pid 1390, uptime 0:10:32
sshd                             RUNNING   pid 1684, uptime 0:10:22
```

10. 登陆 OMS 页面

地址：http://xx.xx.xx.xx:8089/

默认账号/密码为：admin/aaAA11__

![image.png](/img/deploy_tools/deploy_oms/p3.png)

11. 登陆完成后，即可看到页面详情
![image.png](/img/deploy_tools/deploy_oms/p4.png)

