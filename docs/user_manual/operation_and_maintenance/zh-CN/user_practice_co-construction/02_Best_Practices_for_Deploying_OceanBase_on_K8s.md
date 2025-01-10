---
title: 在 K8S 上部署 OceanBase 的最佳实践
weight: 2
---
> 本文作者：美的集团软件工程院 陈子鎏

## 目录
- [1. 背景与选型](#1-背景与选型)
  - [1.1 为什么选择OB](#11-为什么选择ob)
  - [1.2 为什么选择ob-operator实现OB on K8S](#12-为什么选择ob-operator实现ob-on-k8s)
- [2. 部署实操](#2-部署实操)
  - [2.1 环境准备](#21-环境准备)
  - [2.2 安装 ob-operator](#22-安装-ob-operator)
  - [2.3 配置 OB 集群](#23-配置-ob-集群)
  - [2.4 配置 OBProxy 集群](#24-配置-obproxy-集群)
  - [2.5 Headless Service 和 CoreDNS 配置](#25-headless-service-和-coredns-配置)
  - [2.6 监控与运维](#26-监控与运维)
    - [2.6.1 Promethues部署](#261-promethues部署)
    - [2.6.2 Grafana接入](#262-grafana接入)
- [3. 部署中遇到的问题及解决方案](#3-部署中遇到的问题及解决方案)
  - [3.1 ob-operator 的调度器问题](#31-ob-operator-的调度器默认为k8s原生的-default-scheduler而在我们环境中需要使用自定义的调度器)
  - [3.2 网络配置问题](#32-网络配置问题)

## 1. 背景与选型

OB（下称OB）是一款分布式关系型数据库，具有高性能、高可用性和弹性扩展等特点，其企业版已经在公司内部的 "去 Oracle" 项目中进行了落地，并取得了不错的效果。此外，考虑到我们仍有许多业务在关系型数据库上有着需求，同时考虑到我们已经具备MySQL / MariaDB / MongoDB / PostgresSQL 在公司内部的 K8S 集群上进行容器化部署经验，因此我们决定将 OceanBase 也进行容器化部署。

### 1.1 为什么选择OB

在选择数据库时，我们从以下几个维度进行了分析：

- **高可用性**：OB 是基于 Paxos 算法的强一致性数据库，具备强大的容灾能力，支持多数据中心部署，同时单点故障并不影响业务连续性。
- **弹性扩展**：OB 的租户特性，使得相比 MySQL 和 TiDB 等关系型数据库而言，OB 提供了更灵活的扩展能力，能够根据业务需求动态调整资源。
- **成本**：OB 内核天然自带数据压缩能力，相比 MySQL/TiDB 具备更低的存储成本，特别是在大规模部署时，能够有效降低硬件成本（实测重复性文本数据下，OB 的存储成本仅为 MySQL 的 1/4 甚至更低）。
- **兼容性**：OB 内核天然兼容 MySQL 协议，方便现有应用的迁移和集成。

### 1.2 为什么选择 ob-operator 实现 OB on K8S

在将 OB 部署到 K8S 的过程中，我们选择了 ob-operator 作为核心组件。ob-operator 提供了自动化管理 OB 集群的能力，能够简化部署、扩展和运维的复杂性。其主要优势包括：

- **自动化管理**：ob-operator 能够自动处理 OB 集群的生命周期管理，包括创建、更新和删除。
- **灵活性**：支持自定义 OServer/OBTenant 资源，支持快速扩展集群规模, 支持通过 CR 文件快速修改参数。
- **高可用性**：通过多实例部署和健康检查机制，确保集群的稳定运行。支持静态 IP 和 OVN 网络，确保 POD 重建后仍然使用原 IP，避免了 POD 重建后 IP 变化带来的问题。

## 2 部署实操

对于希望将 OB 接入 K8S 但不知如何下手的用户，ob-operator 提供了一个方便快捷的起点。

### 2.1 环境准备

在开始之前，请确保已满足以下条件：

- 有可用的 Kubernetes 集群，至少有 9 个可用 CPU，33 GB 可用内存和 360 GB 的可用存储空间。
- ob-operator 依赖 cert-manager，请确保已安装 cert-manager。cert-manager 的安装方法如下。
- 连接 OceanBase 集群时，需已安装 MySQL 客户端或 OBClient。
- Kubernetes集群需要安装网络插件，例如 OVN。2.3.1 以上版本 ob-operator 支持 OVN 网络，并且能够做到 pod 重建后IP不变，进一步提高了 OB 集群的稳定性。

**安装 cert-manager**

```shell
# 检查是否已安装 cert-manager
kubectl get pod -n cert-manager

# 若未安装，则执行以下命令
wget https://github.com/jetstack/cert-manager/releases/download/v1.5.3/cert-manager.yaml

# 拉取镜像需要科学上网
# 我们使用的 K8S 的网络插件为 OVN，节点需要调度到 OVN 网络的节点上，否则可能无法通过 cert-manager 的 service 访问后端 POD
kubectl apply -f cert-manager.yaml
```

### 2.2 安装 ob-operator

安装 ob-operator 的操作可参考[ob-operator部署](https://www.oceanbase.com/docs/community-ob-operator-doc-1000000001666236)，如果手动通过 CRD 部署可以自行从 github 仓库中下载 [CRD 和Operator](https://github.com/oceanbase/ob-operator/blob/2.3.1/deploy/operator.yaml) 的 yaml 文件，然后通过 ``kubectl apply -f`` 命令进行安装。


### 2.3 配置 OB 集群

可参考官方文档进行[集群创建](https://www.oceanbase.com/docs/community-ob-operator-doc-1000000001666252)

### 2.4 配置 OBProxy 集群

OBProxy（即 ODP，OceanBase Database Proxy） 是 OB 集群的代理组件，生产环境上建议使用 OBProxy 对 OB 集群进行访问。使用 OBProxy 的好处包括：

- **连接管理**：OBProxy 负责管理客户端的连接，维护与后端 OB 集群 的会话，减少客户端与数据库之间的连接开销。
- **负载均衡**：OBProxy 能够智能地将客户端请求分发到不同的 OB 节点，优化资源使用，提升系统性能。
- **高可用性**：在后端 OB 节点发生故障时，OBProxy 能够自动剔除故障节点，确保请求的高可用性。
- **安全性**：通过 OBProxy，可以集中管理访问控制和安全策略，增强系统的安全性。

**配置步骤**

**安装 OBProxy**：直接应用 YAML 文件进行安装。

obproxy YAML文件地址：[obproxy.yaml](https://github.com/oceanbase/ob-operator/blob/2.3.1/example/webapp/obproxy.yaml)，但在部署 OBProxy 前需要创建一个用于 OBProxy 与 OB 集群 通信的 Secret。

```shell
# 创建用于 OBProxy 与 OB 集群 通信的 Secret
kubectl create secret -n oceanbase generic proxyro-password --from-literal=password='<proxyro_password>'

# 部署 OBProxy
kubectl apply -f obproxy.yaml
```

基本内容如下
```yaml
# 相比官方提供的 obproxy.yaml 文件，增加了 odp-headless 的无头服务配置，主要目的是用于 coreDNS 进行域名解析
apiVersion: v1
kind: Service
metadata:
  name: odp-headless
  namespace: oceanbase
spec:
  type: ClusterIP
  clusterIP: None
  selector:
    app: odp
    name: odp
  ports:
    - name: "sql"
      port: 2883
      targetPort: 2883

---
apiVersion: v1
kind: Service
metadata:
  name: odp
  namespace: oceanbase
spec:
  type: ClusterIP
  selector:
    app: odp
    name: odp
  ports:
    - name: "sql"
      port: 2883
      targetPort: 2883
    - name: "prometheus"
      port: 2884
      targetPort: 2884

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: odp # 生产环境下，不建议使用 odp 作为 Deployment 名称，建议使用 odp-${obcluster_name} 作为 Deployment 名称
  namespace: oceanbase
spec:
  selector:
    matchLabels:
      app: odp
      name: odp # 生产环境下，不建议使用 odp 作为 Deployment 名称，建议使用 odp-${obcluster_name} 作为 Deployment 名称
  replicas: 3
  template:
    metadata:
      labels:
        app: odp
        name: odp
    spec:
      containers:
        - name: obproxy
          image: oceanbase/obproxy-ce:4.2.1.0-11
          ports:
            - containerPort: 2883
              name: "sql"
            - containerPort: 2884
              name: "prometheus"
          env:
            - name: APP_NAME
              value: helloworld # 用于 OBProxy 的名称
            - name: OB_CLUSTER
              value: obcluster # 此处填写OB集群的名称，其来源于 OB 部署YAML文件中的 clusterName 值
            - name: RS_LIST
              value: '******' # 格式为 ${OBServer1 POD_IP}:2881;${OBServer2 POD_IP}:2881;${OBServer3 POD_IP}:2881，需要根据实际OBSevrer PODIP来进行替换。
            - name: PROXYRO_PASSWORD
              valueFrom: 
                secretKeyRef:
                  name: proxyro-password # 用于 OBProxy 与 OB集群 通信的 Secret
                  key: password
          resources:
            limits:
              memory: 2Gi
              cpu: "1"
            requests: 
              memory: 200Mi
              cpu: 200m
```
部署完成后，如下图所示：

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/001.png)

**通过 OBProxy 访问 OB 集群**：

此时，可以通过 OBProxy 的 Service 提供 OB 数据库的访问入口，如下（obmysql 是我提前创建好的租户，testdb 是提前在 obmysql 下创建的用户）：

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/002.png)

当然，在实际的生产中，我们采用的是域名访问的方式，而不是通过 IP 地址访问，因此需要进行域名重写，可看下一小节。


### 2.5 Headless Service 和 CoreDNS 配置

在我们的实践中，为了更好地管理 OBProxy 的访问，我们采用了 Headless Service 配合 CoreDNS 的方案：

1. **为什么使用 Headless Service**
   - Headless Service（无头服务）通过将 `clusterIP: None` 设置，使得 DNS 查询可以直接返回后端 Pod 的 IP 地址。
   - 这种方式避免了普通 Service 的 kube-proxy 转发，减少了网络跳转，提升了访问性能。

2. **CoreDNS 域名重写配置**
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: coredns
     namespace: kube-system
   data:
     Corefile: |
        .:3053 {
          errors
          log
          health {
            lameduck 10s
          }
          rewrite stop {
            name regex ob-(.*).rds.com odp-headless-ob-{1}.oceanbase.svc.cluster.local
            answer name odp-headless-ob-(.*).oceanbase.svc.cluster.local ob-{1}.rds.com
          }

          kubernetes cluster.local in-addr.arpa ip6.arpa {
            pods insecure
            fallthrough in-addr.arpa ip6.arpa
          }
          prometheus :9153
          ready :8153
          loop
          reload
          cache 10
          loadbalance
        }
   ```

3. **域名重写的优势**
   - **简化访问**：用户可以通过简单的域名格式（如 `ob-test.rds.com`）访问数据库，无需关心内部复杂的 K8S 域名。
   - **统一管理**：通过规范的域名格式（`ob-*.rds.com`），便于管理和维护多个 OB 集群。
   - **透明代理**：CoreDNS 自动完成域名转换，对应用层完全透明。
   - **灵活扩展**：可以根据需求轻松添加新的 OB 集群，只需遵循命名规范即可。

4. **访问流程**
   - 应用通过 `ob-{clustername}.rds.com` 访问数据库
   - CoreDNS 将请求域名重写为 `odp-headless-ob-{clustername}.oceanbase.svc.cluster.local`
   - Headless Service 返回对应 OBProxy Pod 的 IP
   - CoreDNS 在响应中将域名重写回 `ob-{clustername}.rds.com`
   - 应用获得 Pod IP 并建立连接

5. **CoreDNS 主机模式部署**
   - 将 CoreDNS 部署在主机网络模式 （即 hostNetwork: true），使 CoreDNS POD 与主机共享网络。
   - 这样用，在其余 K8S 集群中的机器上，将 /etc/resolv.conf 配置为 CoreDNS 服务器 ip 后，即可通过 CoreDNS 进行域名解析。
   - 这种配置方式使得外部机器能够方便地通过 CoreDNS 进行域名解析，适合需要跨集群访问的场景。

6. **如图所示**：
   - 直接通过域名即可访问，而不用关心 obproxy 的 service ip，进一步加强了集群的高可用能力

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/003.png)

### 2.6 监控与运维

#### 2.6.1 Promethues部署

- 应用ob-operator中的promethues.yaml文件进行部署，文件链接：[promethues.yaml](https://github.com/oceanbase/ob-operator/blob/2.3.1/example/webapp/prometheus.yaml)

执行以下命令部署
```shell
kubectl apply -f prometheus.yaml
```

执行以下命令检查是否部署完成

```shell
kubectl get pod -n oceanbase  | grep prometheus
```

执行以下命令获取SVC

```shell
kubectl get svc -n oceanbase  | grep prometheus
```
如下

```shell
root@(datamars)mhpl74334-10.20.248.59 ~$ kubectl get svc -n oceanbase  | grep pro
svc-prometheus    NodePort    12.80.144.38   <none>        9090:30090/TCP      7d15h
```


#### 2.6.2 Grafana 接入

- 可以应用 ob-operator 中的 grafana.yaml 文件进行部署，文件链接：[grafana.yaml](https://github.com/oceanbase/ob-operator/blob/2.3.1/example/webapp/grafana.yaml)
- 也可以通过 grafana 的配置页面，添加 prometheus 数据源，然后通过 prometheus 的 SVC 地址进行接入。

因为我们本地已经有 grafana，所以这里我们通过 grafana 的配置页面，添加 prometheus 数据源，然后通过 prometheus的 SVC 地址进行接入。

##### 2.6.2.1 配置 Prometheus 数据源

1. 在 Grafana 左侧导航栏，单击 `Configuration` 按钮，然后单击 `Add data source` 按钮。
2. 在 `Add data source` 页面，选择 `Prometheus` 作为数据源类型。
3. 在 `Prometheus` 页面，填写 `Name` 为 `ob-prometheus`，`URL` 为 `http://12.80.144.38:9090`(即上面的promethues对应的svc ip)，然后单击 `Save & Test` 按钮。

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/004.png)


##### 2.6.2.2 配置 Grafana Dashboard

1. 新建一个名为 OceanBase 的文件夹

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/005.png)

2. 进入该文件夹，接着导入文件链接：[grafana.yaml](https://github.com/oceanbase/ob-operator/blob/2.3.1/example/webapp/grafana.yaml) 中的grafana-dashboards-ob部分的json配置

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/006.png)
3. 监控展示如图

![img](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/02_best_practices_for_deploying_oceanbase_on_k8s/007.png)


## 3. 部署中遇到的问题及解决方案

### 3.1 ob-operator 的调度器默认为K8S原生的 default-scheduler，而在我们环境中需要使用自定义的调度器

**解决方案**：

- 在 OBCluster的CRD中新增了 schedulerName 字段，用于指定调度器，具体修改可以参考 MR: [Support Custom SchedulerName](https://github.com/oceanbase/ob-operator/pull/515), 用法如下:

```yaml
apiVersion: oceanbase.oceanbase.com/v1alpha1
kind: OBCluster
metadata:
  name: test
  namespace: oceanbase
spec:
  observer:
    image: oceanbase/oceanbase-cloud-native:4.2.3.1-101000032024061316
    podFields:
      schedulerName: custom-scheduler # 指定调度器为 custom-scheduler
    resource:
      cpu: 8
      memory: 16Gi
    ...
```

### 3.2 网络配置问题

**问题描述**：在使用 OVN 网络插件时，发现 Pod IP 在重启后发生变化，导致 OBProxy 无法正常访问OB集群。 

**解决方案**：
（1）使用 ob-operator 的 service 模式，即为每个 OBServer Pod 创建一个 Service，通过 service 来做静态 IP 的绑定，从而解决 IP 变化的问题，用法如下:
```yaml
apiVersion: oceanbase.oceanbase.com/v1alpha1
kind: OBCluster
metadata:
  name: test
  namespace: oceanbase
  annotations:
    "oceanbase.oceanbase.com/mode": "service" # 指定为service模式
spec:
  observer:
    image: oceanbase/oceanbase-cloud-native:4.2.3.1-101000032024061316
    podFields:
      schedulerName: custom-scheduler
    resource:
      cpu: 8
      memory: 16Gi
    ...
```
但是链路上多一节 service 做静态 IP 的绑定，会增加网络的复杂度。因此我们采用了下面的方案：

（2）ob-operator 更新到 2.3.1，该版本支持 OVN 网络插件，并且能够做到 Pod 重建后 IP 不变。

（3）但仍存在潜在的 IP 冲突问题，即当一个 OB Pod 正在重建过程中时，如果此时有其他新的 Pod 被创建，这些新 Pod 可能会占用到正在重建的 OB Pod 原本使用的 IP 地址。这会导致该 OB Pod 重建完成后无法使用其原有的 IP 地址。

为了解决这个问题，我们采用了 OVN 的子网隔离方案：

- **创建专用子网**：为 OceanBase 的命名空间创建了一个专用的 subnet，将其与其他业务的 Pod 网络进行隔离。
- **配置方式**：
  ```yaml
  apiVersion: kubeovn.io/v1
  kind: Subnet
  metadata:
    name: ob-subnet
  spec:
    protocol: IPv4
    cidrBlock: 10.16.0.0/16  # 为 OB 集群预留足够大的网段
    namespaces:
      - oceanbase  # 将子网与 oceanbase 命名空间绑定
    gateway: 10.16.0.1
    excludeIps:
      - 10.16.0.1..10.16.0.10  # 排除网关等保留地址
  ```

这种配置的优势：
- 网络隔离：OB 集群的 Pod 使用独立的 IP 地址段，避免与其他业务 Pod 发生 IP 冲突。
- 地址管理：可以更好地规划和管理 IP 地址资源。
- 安全性：通过网络隔离提升了系统安全性。