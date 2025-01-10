---
title: 负载均衡解决方案
weight: 4
---
> 本文作者：韦彪（OceanBase 社区论坛账号：@甯空）


## 一、背景介绍

之前的公司算是第一批使用 Oceanbase 的互联网公司了, 由于之前做过 LINUX 运维, 深入思考过企业入口的负载均衡问题。通过 Nginx、Keepalived、域名实现双活、多活，能彻底解决单点故障、负载不均衡、扩展性差等问题。

之前因为疫情原因，业务有 10 倍增长，对大并发、横向扩展会比较关注。通过使用现有开源组件组合，可以媲美商业负载均衡，最终能够做到免维护、甚至遗忘负载均衡和高可用的存在。

开源组件:
- obproxy（TCP、UDP、HTTP 负载均衡换成 nginx、haproxy）
- keepalived
- DNS 域名解析
- 三个 VIP 地址

## 二、拓扑介绍
![示例图片](/img/user_manual/operation_and_maintenance/zh-CN/user_practice_co-construction/04_load_balancing/001.png)

## 三、配置详情
1. 安装 oceanbase、obproxy 的步骤略去。

2. 安装 keepalived。
```
yum install keepalived   # centos
apt install keepalived   # ubuntu
```

3. 主机 10.1.1.1 配置文件
- /etc/keepalived/checkobproxy.sh
```
#!/bin/bash
if [ `ps -C obproxy --no-header |wc -l` -eq 0 ]; then
   sleep 1
   if [ $(ps -C obproxy --no-header | wc -l) -eq 0 ]; then
       exit 1
   fi
fi
```

- /etc/keepalived/keepalived.conf
```
# Configuration File for keepalived

global_defs {
   notification_email {
     willian@xx.com
   }
   router_id LVS_DEVEL
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   script_user root
   enable_script_security
}


vrrp_script check_obproxy {
    script "/etc/keepalived/checkobproxy.sh"
    interval 2
    weight -50
}

vrrp_instance VI_1 {
    # nopreempt
    state BACKUP
    interface bond1
    virtual_router_id 1
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.1
    unicast_peer {
        10.1.1.2
        10.1.1.3
    }
    virtual_ipaddress {
        10.1.1.241/24
    }
    track_script {
        check_obproxy
    }
}


vrrp_instance VI_2 {
    state BACKUP
    interface bond1
    virtual_router_id 2
    priority 60
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.1
    unicast_peer {
        10.1.1.2
        10.1.1.3
    }
    virtual_ipaddress {
        10.1.1.242/24
    }
    track_script {
        check_obproxy
    }
}

vrrp_instance VI_3 {
    state BACKUP
    interface bond1
    virtual_router_id 3
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.1
    unicast_peer {
        10.1.1.2
        10.1.1.3
    }
    virtual_ipaddress {
        10.1.1.243/24
    }
    track_script {
        check_obproxy
    }
}

```

4. 主机 10.1.1.2 配置文件
- /etc/keepalived/checkobproxy.sh
```
#!/bin/bash
if [ `ps -C obproxy --no-header |wc -l` -eq 0 ]; then
   sleep 1
   if [ $(ps -C obproxy --no-header | wc -l) -eq 0 ]; then
       exit 1
   fi
fi
```

- /etc/keepalived/keepalived.conf
```
# Configuration File for keepalived

global_defs {
   notification_email {
     willian@xx.com
   }
   router_id LVS_DEVEL
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   script_user root
   enable_script_security
}


vrrp_script check_obproxy {
    script "/etc/keepalived/checkobproxy.sh"
    interval 2
    weight -50
}

vrrp_instance VI_1 {
    state BACKUP
    interface bond1
    virtual_router_id 1
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.2
    unicast_peer {
        10.1.1.1
        10.1.1.3
    }
    virtual_ipaddress {
        10.1.1.241/24
    }
    track_script {
        check_obproxy
    }
}


vrrp_instance VI_2 {
    # nopreempt
    state BACKUP
    interface bond1
    virtual_router_id 2
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.2
    unicast_peer {
        10.1.1.1
        10.1.1.3
    }
    virtual_ipaddress {
        10.1.1.242/24
    }
    track_script {
        check_obproxy
    }
}

vrrp_instance VI_3 {
    state BACKUP
    interface bond1
    virtual_router_id 3
    priority 60
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.2
    unicast_peer {
        10.1.1.1
        10.1.1.3
    }
    virtual_ipaddress {
        10.1.1.243/24
    }
    track_script {
        check_obproxy
    }
}
```

5. 主机 10.1.1.3 配置文件
- /etc/keepalived/checkobproxy.sh

```
#!/bin/bash
if [ `ps -C obproxy --no-header |wc -l` -eq 0 ]; then
   sleep 1
   if [ $(ps -C obproxy --no-header | wc -l) -eq 0 ]; then
       exit 1
   fi
fi
```

- /etc/keepalived/keepalived.conf
```
# Configuration File for keepalived

global_defs {
   notification_email {
     willian@xx.com
   }
   router_id LVS_DEVEL
   vrrp_skip_check_adv_addr
   vrrp_garp_interval 0
   vrrp_gna_interval 0
   script_user root
   enable_script_security
}


vrrp_script check_obproxy {
    script "/etc/keepalived/checkobproxy.sh"
    interval 2
    weight -50
}

vrrp_instance VI_1 {
    state BACKUP
    interface bond1
    virtual_router_id 1
    priority 60
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.3
    unicast_peer {
        10.1.1.1
        10.1.1.2
    }
    virtual_ipaddress {
        10.1.1.241/24
    }
    track_script {
        check_obproxy
    }
}


vrrp_instance VI_2 {
    state BACKUP
    interface bond1
    virtual_router_id 2
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.3
    unicast_peer {
        10.1.1.1
        10.1.1.2
    }
    virtual_ipaddress {
        10.1.1.242/24
    }
    track_script {
        check_obproxy
    }
}

vrrp_instance VI_3 {
    # nopreempt
    state BACKUP
    interface bond1
    virtual_router_id 3
    priority 100
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass wukong
    }
    unicast_src_ip 10.1.1.3
    unicast_peer {
        10.1.1.1
        10.1.1.2
    }
    virtual_ipaddress {
        10.1.1.243/24
    }
    track_script {
        check_obproxy
    }
}

```

## 四、总结
- 域名解析三个 VIP A 记录，利用 DNS RR 轮询功能。
- 通过 VIP 地址跳转，规避某个 OBProxy 服务不可用。
- OBProxy 恢复后 VIP 抢占回来，人工无需干预。
- 使用 keepalived 新增单播功能，来保活通信。
- 不使用 haproxy，减少反向代理层级。
- 三活节点，足够健壮。
- 横向扩容不受限。
- 运维简单，且开源免费。
