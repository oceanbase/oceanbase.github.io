# Quick experience

This topic describes how to deploy OceanBase Database for quick experience. 

## Prerequisites

Your server is connected to the Internet, and your hardware and software meet the following requirements.

| Item | Description |
| --- | --- |
|OS|<ul><li>Anolis OS 8.X (Linux kernel V3.10.0 or later)</li><li>Red Hat Enterprise Linux Server 7.X (Linux kernel V3.10.0 or later)</li><li>CentOS Linux 7.X (Linux kernel V3.10.0 or later)</li></ul>|
|CPU|At least two cores or preferably four cores or more|
|Memory|At least 10 GB or preferably 16 GB or more|
|Disk type|Preferably SSD|
|Disk space|Four times the memory size or more|
|File system|EXT4 or XFS. Choose XFS when the data volume exceeds 16 TB.|

> **Note**
>
> At least 10 GB of memory is required if you use Docker to deploy OceanBase Database. 

### Use OBD to deploy OceanBase Database

> **Note**
>
> The following describes the deployment of OceanBase Database on an x86-based CentOS Linux 7.9 system. The procedure may be different on other OSs. 

#### Step 1: Download and install OBD

OceanBase Deployer (OBD) is the most efficient deployment tool to make OceanBase Database ready to work. We recommend that you use OBD when you deploy OceanBase Database for experience. Download and install OBD by performing the following steps. 
If the server has access to the Internet and allows you to add a third-party YUM repository as the software source, you can run the following command to install OBD from the official software source of OceanBase:

```test
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://mirrors.aliyun.com/oceanbase/OceanBase.repo
sudo yum install -y ob-deploy
```

#### Step 2: Use the obd demo command for quick deployment

With the `obd demo` command, you can directly deploy and start a specified component on your local computer without loading the configuration file. The fixed name of the cluster deployed is `demo`. After the deployment, you can run the `obd cluster list` command to view the cluster in the cluster list. You can also run other cluster commands to manage the cluster, such as `obd cluster display demo`. 

```bash
obd demo [-c/--components] 
```

The following table describes the parameters.

| Parameter | Required | Data type | Default value | Description |
|------------------|---------|------------|----------|--------------------------------------------------------------------|
| -c or --components | No | String | oceanbase-ce,obagent,prometheus,grafana | The list of components that are separated with commas (`,`). You can use this parameter to specify the components to be deployed.  |

By default, this command deploys the minimum specifications in the home directory of the current user, and the latest versions are deployed by default. You can use this command to deploy OceanBase Community Edition, OBProxy Community Edition, OBAgent, Grafana, and Prometheus. 

You can select the version and specify the configurations of a component to be deployed.

```bash
# Deploy components of the specified version.
obd demo -c oceanbase-ce,obproxy-ce --oceanbase-ce.version=4.2.1
# Specify the components to be deployed and the package hash of OceanBase Community Edition.
obd demo -c oceanbase-ce,obproxy-ce --oceanbase-ce.package_hash=f38723204d49057d3e062ffad778edc1552a7c114622bf2a86fea769fbd202ea
# Specify the installation path for all components to be deployed.
## Deploy OceanBase Community Edition and OBProxy Community Edition in the /data/demo directory and create corresponding working directories for them.
obd demo -c oceanbase-ce,obproxy-ce --home_path=/data/demo
# Specify the installation path for all components to be deployed.
obd demo --home_path=/path
# Specify the installation path for a specific component to be deployed.
## Deploy OceanBase Community Edition in the home directory and create a working directory for it, and deploy OBProxy in the /data/playground/obproxy-ce directory.
obd demo -c oceanbase-ce,obproxy-ce --obproxy-ce.home_path=/data/demo/
# Specify the configurations of a component to be deployed.
## Specify the mysql_port parameter of OceanBase Community Edition.
obd demo --oceanbase-ce.mysql_port=3881
```

> **Notice**
>
> This command supports only level-1 configurations under global that are specified by using options. 

#### Step 3: Connect to OceanBase Database

Perform the following steps to connect to OceanBase Database:

1. Install the OceanBase Database client (OBClient):

   If you have added the official YUM repository of OceanBase as the software source, run the following command to install the OBClient:

   ```test
   sudo yum install -y obclient
   ```

2. Run the following command to connect to OceanBase Database by using the OBClient:

   ```test
   obclient -h127.0.0.1 -P2881 -uroot@sys
   ```

### Use Docker to deploy OceanBase Database

> **Notice**
>
> Before you deploy the [oceanbase-ce](https://hub.docker.com/r/oceanbase/oceanbase-ce) image, make sure that the following prerequisites are met:
>
> * The resources on your server are sufficient to support a Docker container with at least 2 CPU cores and 8 GB of memory. 
>
> * You have installed the latest version of Docker on your server. For more information, see the [Docker Documentation](https://docs.docker.com/get-docker/). 
> * You have started the Docker service on your server. 

#### Step 1: Start an OceanBase Database instance

Run the following command to start an OceanBase Database instance:

```test
# Deploy an instance with the maximum specifications supported by the container.
docker run -p 2881:2881 --name obstandalone -d oceanbase/oceanbase-ce
## Deploy a mini standalone instance.
docker run -p 2881:2881 --name obstandalone -e MINI_MODE=1 -d oceanbase/oceanbase-ce
```

> **Note**
>
> By default, the preceding command pulls the latest version of Docker image. You can select a desired docker image from [Docker images](https://hub.docker.com/r/oceanbase/oceanbase-ce/tags) as needed. 

The process is expected to take two to five minutes. Run the following command. If "boot success!" is returned, the instance is started. 

```test
$ docker logs obstandalone | tail -1
boot success!
```

#### Step 2: Connect to the OceanBase Database instance

The oceanbase-ce image is integrated with the OBClient and the default connection script `ob-mysql`. 

```test
docker exec -it obstandalone ob-mysql sys # Connect to the root user of the sys tenant.
docker exec -it obstandalone ob-mysql root # Connect to the root user of the test tenant.
docker exec -it obstandalone ob-mysql test # Connect to the test user of the test tenant.
```

You can also run the following command to connect to the instance by using the OBClient or MySQL client on your local server. 

```test
mysql -uroot -h127.1 -P2881
```

After the connection is established, the following information is displayed:

```test
$ docker exec -it obstandalone ob-mysql sys

login as root@sys
Command is: obclient -h127.1 -uroot@sys -A -Doceanbase -P2881
Welcome to the OceanBase.  Commands end with ; or \g.
Your OceanBase connection id is 3221487638
Server version: 5.7.25 OceanBase 4.0.0 (r10100032022041510-a09d3134c10665f03fd56d7f8bdd413b2b771977) (Built Oct 15 2022 02:16:22)

Copyright (c) 2000, 2022, OceanBase and/or its affiliates. All  rights reserved.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MySQL [oceanbase]>
```