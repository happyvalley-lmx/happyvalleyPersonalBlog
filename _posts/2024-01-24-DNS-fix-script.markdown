---
layout: post
title: 一键修改电脑WiFi DNS的脚本
date:   2024-01-24 11:30:00 +0800
categories: maintenance
tags: DNS Windows bat
excerpt: 在Windows系统中，编写一个脚本，该脚本能够一键修改电脑的WiFi DNS。

---

在公司做了半年运维，最近老有财务部的同事找我报道电脑无法上网的问题，每次跑过去一看，都是由于各大银行的网银程序自动修改了电脑的DNS，导致连接的WiFi无法正常联网，内网IP都是可以ping通的。于是我就想写个脚本来一键修改电脑的WiFi DNS。

## 思路  
WiFi路由器一般都采用DHCP获取IP地址，所以只需要修改WiFi连接的DNS即可。  
直接用Windows自带的命令行工具`netsh`，通过修改WiFi连接的DNS来解决。  
DNS可以采用腾讯云的DNSPOD的公用DNS```119.29.29.29```，~~也可以采用阿里云的```223.5.5.5```。~~  
备用DNS可以采用腾讯云的```119.28.28.28```   

## 脚本内容  
将以下代码以ANSI编码保存为```.bat```文件，双击运行即可。  
```bat
netsh interface ip set address name="WLAN" source=dhcp
netsh interface ip set dns name="WLAN" source=static addr=119.29.29.29 register=primary
netsh interface ip add dns name="WLAN" addr=119.28.28.28 index=2
ipconfig /flushdns
@ping 127.0.0.1 -n 11 >nul
ipconfig
@echo DNS修改完成。
pause
```
### 脚本说明
第一行设置电脑WIFI为自动获取IP地址  
第二行设置电脑WIFI的DNS为```119.29.29.29```  
第三行设置电脑WIFI的备用DNS为```119.28.28.28```  
第四行清空电脑的DNS缓存  
第五行通过ping```127.0.0.1```实现延时等待设置生效  
第六行查看电脑的DNS配置情况。

### 2024.11 更新  
阿里云的223.5.5.5增加了很多限制，所以备用DNS不再采用阿里云，转为直接使用腾讯云DNSPod的备用DNS服务。