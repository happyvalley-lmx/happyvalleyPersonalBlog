---
layout: post
title: 使用Anubis阻挡AI爬虫的滥用攻击
date:   2025-11-24 09:00:00 +0800
categories: web
tags: anubis linux nginx
excerpt: 服务器要被各路AI爬虫的流量塞爆了,本文介绍了一种防范AI爬虫攻击的工具——anubis。

---

AI真的是太好用了。在2025年的今天，各路AI服务应接不暇，市场上充满了丰富的AI产品。可是，代价是什么呢？我在独立主机上所托管的 [Arcaea中文维基](https://wiki.arcaea.cn) 与 [Rotaeno中文维基](https://wiki.rotaeno.cn) 自今年以来，在线率出现了严重的下滑现象，服务器出现502错误的频次也不断增加。（在线率由原来的99%掉至不足95%）网站整体的响应时间也上升到了10秒以上。    
经过 Nginx 的日志分析，来自 Meta、OpenAI 以及众多来自中国大陆的AI爬虫IP的请求，占了总请求数的98%以上，爬虫的滥用已经导致了整体服务达到了崩溃的程度，是时候找一个方案来解决这个问题了。  

# Anubis  
![Anubis](https://github.com/TecharoHQ/anubis/raw/main/web/static/img/happy.webp)  
这个长得像猫娘一样的吉祥物正是我们的主角，神秘的埃及小狼 ———— Anubis。  
Anubis 是一个轻量化的开源 WAF，它使用工作量证明挑战，来确保访问网站的客户端使用的是现代浏览器，并且能够计算 SHA-256 校验和。Anubis 的工作量证明挑战为计算一定数量的 SHA-256 值，并要求计算结果包含一定数量的前导零，计算完成后，视为客户端完成验证，并将验证后的正常访问请求流量转发至后端的真实应用。  
Anubis 将会被安装于反向代理(如Nginx或apache)与后端服务之间，每保护一个后端服务，需要单独启用一个Anubis实例。Anubis 的系统需求极低，根据作者所述，128M 的内存可能就足以支持大量并发客户端的访问。  

## 安装 Anubis
Anubis 提供了 Docker 镜像以及原生应用包的安装形式，可以使用任意的方式进行安装。我们使用从 Github Release 下载的原生应用软件包进行安装。  
系统是 Debian 系的 Ubuntu 22.04 LTS 64位，所以我们使用以下脚本进行安装：  
```bash
apt install ./anubis-$VERSION-$ARCH.deb  
```  
安装完成后，默认的环境变量配置文件将会生成在 ```/etc/anubis/default.env``` ，而默认的bot策略则会生成在 ```/usr/share/doc/anubis/botPolicies.yaml``` 根据想要保护的服务，复制一份默认文件。例如，我们要保护我们的 Arcaea中文维基 服务，则可以使用以下脚本：  
```bash
sudo cp /etc/anubis/default.env /etc/anubis/arcwiki.env  
sudo cp /usr/share/doc/anubis/botPolicies.yaml /etc/anubis/arcwiki.botPolicies.yaml
```  
复制完成后，我们先对环境变量配置文件进行编辑（可用的环境变量可见[官方文档](https://anubis.techaro.lol/docs/admin/installation/#environment-variables)）：  
```
BIND=:8923  # Anubis 监听的端口（默认为8923）
DIFFICULTY=4  # 工作量证明的难度（前导零数量）
METRICS_BIND=:9090  # Anubis 监听的 Prometheus 端口（默认9090）
POLICY_FNAME=/etc/anubis/arcwiki.botPolicies.yaml  # bot策略文件位置
TARGET=http://localhost:3000  # 需保护的后端服务地址
```  
然后使用 ```systemctl enable --now``` 启动 Anubis：  
```bash
systemctl enable --now anubis@arcwiki.service
```  
在 Anubis 启动成功后，访问 ```http://localhost:9090/metrics``` 上的 Prometheus 指标链接就可以看到 Anubis 的运行状态了。我们可以使用 `curl` 命令来测试 Anubis 是否正常工作：  
```bash
curl http://localhost:9090/metrics
```  
## 配置 Nginx 反向代理
还记得前文所述 Anubis 安装在反向代理与后端服务之间吗？它看起来应该是像这样的：  
```mermaid
graph LR;
  A[Nginx-80端口] --> B[Anubis-8923端口] --> C[后端服务-3000端口]
```  
Anubis在工作的时候，流量应该从 Anubis 绕行后，再传到后端。Anubis 会过滤掉“恶意”的流量，然后将“正常”的流量转发到后端服务。所以，我们应该编辑原有的 Nginx 配置文件，将 Anubis 添加到 Nginx 的反向代理中。我原来的配置文件如下，是一个典型的基于 MediaWiki 的 Nginx 配置文件，MediaWiki直接监听在80端口：
```nginx
server {
    listen 80;
    server_name wiki.arcaea.cn;
    root /var/www/arcwiki;

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    # 其他配置省略
    # ...

}
```  
我们需要在其中添加让 Nginx 的 80 端口转发到 Anubis 8923 端口的配置，并且将 MediaWiki 监听到另一个端口（此处以 3000 为例）：  
```nginx
upstream anubis {
    # 定义 Anubis 监听的端口（上文环境变量中配置的）
    server localhost:8923;
}

server {
    listen 80;
    server_name wiki.arcaea.cn;

    # 将80端口的请求转发至 Anubis
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Http-Version $server_protocol;
        proxy_pass http://anubis;
    }
}

server {
    # 将 MediaWiki 监听的端口修改为 3000
    listen 3000;
    server_name wiki.example.com;
    root /var/www/arcwiki;

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    ...

}
```  
配置完成后，重启 Nginx 服务。  
```bash
sudo systemctl reload nginx.service
```
然后，访问网站就可以看到 Anubis 开始工作保护你的网站了。  
## Anubis 官方链接
官方文档：[https://anubis.techaro.lol/](https://anubis.techaro.lol/)  
官方 Github 仓库：[https://github.com/TecharoHQ/anubis](https://github.com/TecharoHQ/anubis)