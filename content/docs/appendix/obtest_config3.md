---
title: 扩容后配置文件事例
weight: 3
---
```yaml
## Only need to configure when remote login is required
user:
  username: admin
  password: xxx
#   key_file: your ssh-key file path if need
#   port: your ssh port, default 22
#   timeout: ssh connection timeout (second), default 30
oceanbase-ce:
  servers:
  - name: server1
      # Please don't use hostname, only IP can be supported
    ip: x.x.x.32
  - name: server2
    ip: x.x.x.33
  - name: server3
    ip: x.x.x.34
  - name: server4
      # Please don't use hostname, only IP can be supported
    ip: x.x.x.35
  - name: server5
    ip: x.x.x.36
  - name: server6
    ip: x.x.x.37
  global:
    # Please set devname as the network adaptor's name whose ip is  in the setting of severs.
    # if set severs as "127.0.0.1", please set devname as "lo"
    # if current ip is 192.168.1.10, and the ip's network adaptor's name is "eth0", please use "eth0"
    devname: eth0
    # if current hardware's memory capacity is smaller than 50G, please use the setting of "mini-single-example.yaml" and do a small adjustment.
    memory_limit: 12G # The maximum running memory for an observer
    # The reserved system memory. system_memory is reserved for general tenants. The default value is 30G.
    system_memory: 5G
    cpu_count: 6
    datafile_size: 30G # Size of the data file.
    log_disk_size: 20G # The size of disk space used by the clog files.
    enable_syslog_wf: false # Print system logs whose levels are higher than WARNING to a separate log file. The default value is true.
    enable_syslog_recycle: true # Enable auto system log recycling or not. The default value is false.
    max_syslog_file_count: 4 # The maximum number of reserved log files before enabling auto recycling. The default value is 0.
    # observer cluster name, consistent with obproxy's cluster_name
    appname: obtest
    # root_password: # root user password, can be empty
    root_password: xxx
    # proxyro_password: # proxyro user pasword, consistent with obproxy's observer_sys_password, can be empty
    proxyro_password: xxx
  # In this example , support multiple ob process in single node, so different process use different ports.
  # If deploy ob cluster in multiple nodes, the port and path setting can be same.
  server1:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /ob_data/1
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /ob_data/log1
    zone: zone1
  server2:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /ob_data/1
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /ob_data/log1
    zone: zone2
  server3:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /ob_data/1
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /ob_data/log1
    zone: zone3
  server4:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /ob_data/1
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /ob_data/log1
    zone: zone1
  server5:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /ob_data/1
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /ob_data/log1
    zone: zone2
  server6:
    mysql_port: 2881 # External port for OceanBase Database. The default value is 2881. DO NOT change this value after the cluster is started.
    rpc_port: 2882 # Internal port for OceanBase Database. The default value is 2882. DO NOT change this value after the cluster is started.
    #  The working directory for OceanBase Database. OceanBase Database is started under this directory. This is a required field.
    home_path: /home/admin/observer
    # The directory for data storage. The default value is $home_path/store.
    data_dir: /ob_data/1
    # The directory for clog, ilog, and slog. The default value is the same as the data_dir value.
    redo_dir: /ob_data/log1
    zone: zone3
obproxy-ce:
  # Set dependent components for the component.
  # When the associated configurations are not done, OBD will automatically get the these configurations from the dependent components.
  depends:
  - oceanbase-ce
  servers:
  - x.x.x.32
  - x.x.x.33
  - x.x.x.34
  global:
    listen_port: 2883 # External port. The default value is 2883.
    prometheus_listen_port: 2884 # The Prometheus port. The default value is 2884.
    home_path: /home/admin/obproxy
    # oceanbase root server list
    # format: ip:mysql_port;ip:mysql_port. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    # rs_list: 192.168.1.2:2881;192.168.1.3:2881;192.168.1.4:2881
    enable_cluster_checkout: false
    # observer cluster name, consistent with oceanbase-ce's appname. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    cluster_name: obtest
    skip_proxy_sys_private_check: true
    enable_strict_kernel_release: false
    # obproxy_sys_password: # obproxy sys user password, can be empty. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    obproxy_sys_password: xxx
    # observer_sys_password: # proxyro user pasword, consistent with oceanbase-ce's proxyro_password, can be empty. When a depends exists, OBD gets this value from the oceanbase-ce of the depends.
    observer_sys_password: xxx
    ```
