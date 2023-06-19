---
title: 通过Prometheus监控数据库（手动）
weight: 10
---
# **手动部署 Prometheus**

> **说明**
>
> OBD 可以直接部署 OBAgent 和 Prometheus, 详情可以参考 [配置文件](https://github.com/oceanbase/obdeploy/blob/master/example/prometheus/distributed-with-obagent-and-prometheus-example.yaml)

本文档帮助大家独立部署obagent 和prometheus。

## **OBAgent 安装部署**

### **什么是 OBAgent**

OBAgent 是一个监控采集框架。OBAgent 支持推、拉两种数据采集模式，可以满足不同的应用场景。OBAgent 默认支持的插件包括主机数据采集、OceanBase 数据库指标的采集、监控数据标签处理和 Prometheus 协议的 HTTP 服务。要使 OBAgent 支持其他数据源的采集，或者自定义数据的处理流程，您只需要开发对应的插件即可。

### **部署 OBAgent**

可参照官网，选择合适的部署方式：[部署文档](https://www.oceanbase.com/docs/common-oceanbase-database-cn-10000000001700702)

#### **需要注意的地方**

目前集群初始未安装 OBAgent 不会创建 ocp_monitor 用户，而 OBAgent 连接 OceanBase 数据库获取信息正是通过这个用户来的，所以部署 OBAgent 前需要先确认是否已经有了这个用户，如果没有的话需要创建

```sql
# 确认是否存在 ocp_monitor
select user,host from mysql.user;

# 如果不存在则需要手动创建
GRANT SELECT ON `oceanbase`.* TO 'ocp_monitor'@'%' identified by '******';
```

如果是启动 OBAgent 后续添加的账号，那么需要重启 OBAgent 才能识别。

**配置文件**
http_basic_auth_user：后续 prometheus 访问 OBAgent 的账号
http_basic_auth_password：后续 prometheus 访问 OBAgent 的密码
monitor_user：默认是ocp_monitor，修改不生效
monitor_password：需要填写 ocp_monitor的密码

**验证**
账号密码替换为自己设置的

```bash
curl -H "Content-Type: application/json" -X GET  --user admin:root  http://ip:8088/metrics/ob/basic
curl -H "Content-Type: application/json" -X GET  --user admin:root  http://ip:8088/metrics/ob/extra
curl -H "Content-Type: application/json" -X GET  --user admin:root  http://ip:8088/metrics/node/host
```

**日志**
${ocp.agent.home.path}/log**/***

## Prometheus 安装部署

1. 下载 [Prometheus 软件](https://prometheus.io/download/)。
2. 解压并安装 Prometheus 软件。

   ```bash
   sudo tar zxvf Prometheus-2.30.3.linux-amd64.tar.gz -C /usr/local/
   ```

3. 复制 OBAgent 生成的 Prometheus 配置文件到 Prometheus 安装目录中。

   **说明**
   OBAgent 携带了 Prometheus 配置文件的模版，使用 OBD 部署 OBAgent, 会自动填充模版中的内容。该配置文件被放在 OBAgent 安装目录下，如 /home/admin/obagent/conf/   Prometheus_config/。这个配置文件可以供 Prometheus 软件直接使用。OBAgent 的安装部署，请参考 [OBAgent](https://www.oceanbase.com/docs/community-observer-cn-10000000001879804)

   ```bash
   sudo mv Prometheus_config/ /usr/local/Prometheus-2.30.3.linux-amd64/
   ```

4. 新建 Prometheus 服务文件。

   ```bash
   sudo mkdir /var/lib/Prometheus
   sudo vim /etc/systemd/system/Prometheus.service
   
   [Unit]
   Description=Prometheus Server
   Documentation=https://Prometheus.io/docs/introduction/overview/
   After=network-online.target
   
   [Service]
   Restart=on-failure
   ExecStart=/usr/local/Prometheus-2.30.3.linux-amd64/Prometheus --config.file=/usr/local/Prometheus-2.30.3.linux-amd64/Prometheus_config/Prometheus.yaml    --storage.tsdb.path=/var/lib/Prometheus --web.enable-lifecycle --web.external-url=http://x.x.x.x:9090
   
   [Install]
   WantedBy=multi-user.target
   ```

5. 启动 Prometheus 服务。

   ```bash
   sudo systemctl daemon-reload
   
   sudo systemctl start Prometheus
   
   sudo systemctl status Prometheus
   
   [admin@**** ~]$ sudo systemctl status Prometheus
   ● Prometheus.service - Prometheus Server
      Loaded: loaded (/etc/systemd/system/Prometheus.service; disabled; vendor preset: disabled)
      Active: active (running) since 一 2023-05-15 11:39:14 CST; 8s ago
        Docs: https://Prometheus.io/docs/introduction/overview/
    Main PID: 13003 (prometheus)
       Tasks: 13
      Memory: 23.4M
      CGroup: /system.slice/Prometheus.service
              └─13003 /usr/local/prometheus-2.37.8.linux-amd64/prometheus --config.file=/usr/local/prometheus-2.37.8.linux-amd64/prometheus_config/   prometheus.yaml --storage.tsdb.path=/var/lib/Prometheus --web.enable-lifecycle --we...
   ```

6. 确认 Prometheus 是否启动成功。

   ```bash
   [admin@**** ~]$ sudo netstat -ntlp | grep 9090
   tcp6       0      0 :::9090                 :::*                    LISTEN      902555/Prometheus
   ```

## **Prometheus 使用**

使用浏览器访问：<http://172.20.xx.xx:9090/graph。>

> **说明**
>
> 此处链接中的 IP 为示例中配置 Prometheus 的服务器 IP，根据实际情况将其转换为自身配置 Prometheus 的服务器 IP。

## **Prometheus 配置文件说明**

```yaml
# OBAgent 的 RPM 包中包含 Prometheus 的配置模版，您可以根据实际情况修改。
# 要开启基础认证，您需要配置 {http_basic_auth_user} 和 {http_basic_auth_password}，要按照 OBAgent 设置的对应账密来。
# {target} 替换成监控目标主机的 IP 和端口号(默认都是8088), 如果有多个监控目标，需要配置多行，每个监控目标一行。比如 xx.xx.xx.xx:8088
# rules 目录包含两个报警配置模版，分别是默认的主机和 OceanBase 数据库的报警配置。如需自定义报警项，您可以参考此目录。

# 全局配置
global:
  # 抓取间隔
  scrape_interval: 1s
  # 评估规则间隔
  evaluation_interval: 10s

# 报警规则配置
# Prometheus 将根据这些信息，推送报警信息至 alertmanager。
rule_files:
  - "rules/*rules.yaml"

# 抓取配置
# 用来配置 Prometheus 的数据采集。
scrape_configs:
  - job_name: prometheus
    metrics_path: /metrics
    scheme: http
    static_configs:
      - targets:
          - "localhost:9090"
  - job_name: node
    basic_auth:
      username: { http_basic_auth_user }
      password: { http_basic_auth_password }
    metrics_path: /metrics/node/host
    scheme: http
    static_configs:
      - targets:
          - { target }
  - job_name: ob_basic
    basic_auth:
      username: { http_basic_auth_user }
      password: { http_basic_auth_password }
    metrics_path: /metrics/ob/basic
    scheme: http
    static_configs:
      - targets:
          - { target }
  - job_name: ob_extra
    basic_auth:
      username: { http_basic_auth_user }
      password: { http_basic_auth_password }
    metrics_path: /metrics/ob/extra
    scheme: http
    static_configs:
      - targets:
          - { target }
  - job_name: agent
    basic_auth:
      username: { http_basic_auth_user }
      password: { http_basic_auth_password }
    metrics_path: /metrics/stat
    scheme: http
    static_configs:
      - targets:
          - { target }

```

## **Grafana 展示**

### **Dashboard 模版**

[oceanbase-metrics](https://grafana.com/grafana/dashboards/15215-oceanbase-metrics/)

[host-metrics](https://grafana.com/grafana/dashboards/15216-host-metrics/)

[hnew-dashboard-copy](https://grafana.com/grafana/dashboards/15354-new-dashboard-copy/)

导入 dashboard 模版，并且在 Grafana 配置数据源信息就可以了。
