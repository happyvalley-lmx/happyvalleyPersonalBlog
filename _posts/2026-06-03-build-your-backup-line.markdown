---
layout: post
title: 搞个备用链路
date:   2026-6-3 16:00:00 +0800
categories: web
tags: linux proxy
excerpt: 最近访问 Github 等网站时，时不时发现连不上，记录一下自己研究备用链路的过程

---

# 让我们想办法搞个备用链路

在 2026 年的网络环境下，对传统代理特征的识别、主动探测以及基于机器学习的流量行为分析已经高度成熟。互联网上能直接购买到的加速服务又常会down掉，所以需要一个能够在备用时能正常工作的方式。

在美国豆包(Gemini)的帮助下，笔者找到了一种，使用 **Xray-core**，纯手工搭建实现**VLESS-XTLS-REALITY**协议的方法，能够一定程度上解决对网络的临时访问需求。

## 🛠️ 第一步：环境准备与独立核心安装

首先，通过 SSH 登录你的 VPS

### 1. 安装基础依赖、相关工具

更新并安装基础依赖
```bash
sudo apt update
sudo apt install curl openssl uuid-runtime lsof -y
```
下载并安装 Xray-core
```bash
# 1. 下载官方安装脚本到服务器本地
curl -Lo install-release.sh https://github.com/XTLS/Xray-install/raw/main/install-release.sh

# 2. 赋予脚本可执行权限
chmod +x install-release.sh

# 3. 运行本地脚本进行纯净安装
sudo ./install-release.sh

```

*提示：安装完成后，脚本会自动下载官方原版二进制文件并注册为系统服务，绝无任何后门或冗余残留。Xray 的默认配置文件存放路径固定为：`/usr/local/etc/xray/config.json*`

## 🔑 第二步：手动生成 REALITY 专属凭证

REALITY 协议的核心在于“借用”别人的合法 HTTPS 证书，并且需要独一无二的 UUID、密钥对和短 ID。我们在终端中手动生成并将它们记录在备忘录里。

### 1. 生成用户 UUID

```bash
uuidgen
```

*(会输出一行类似 `a25d2d75-b71c-48f9-8675-14f5425ab4ce` 的字符串，记为 **UUID**)*

### 2. 生成 REALITY X25519 密钥对
X25519 是 Xray 默认的密钥交换算法，也是目前最常用的。
```bash
xray x25519
```
输出的示例如下：
```bash
PrivateKey: WOUmmGYtpIAiTzrgXjdtowZrPj1f3-C-aZVwQ-1Vw1E
Password (PublicKey): qAv2KD5dvjYQPUL_0GCfrfwPeUbWGTO_DHj-A-Xjvlc
Hash32: 3VPGML-gx8K-VToi77PaWm6Lavu16FL2gFXbnthRz0s
```

*(输出的三行：一行为 `Private key: <一串私钥>`，另一行为 `Public key: <一串公钥>`，最后一行为`Hash32：<值>`。**私钥**稍后写进服务器，**公钥**用于客户端连接，**Hash32**用于生成校验，可直接忽略。*)*

### 3. 生成短 ID (Short ID)

```bash
openssl rand -hex 8
```

*(会输出一个 16 位的随机十六进制字符串，例如 `7c4e7e1383870633`，记为 **Short ID**)*

---

## 📡 第三步：手动编写 Xray 配置文件

我们这里选择全球标准的 **HTTPS 备用端口 `8443`（或者 Cloudflare 预留的 `2053` 端口），避开 Nginx已经使用的443端口。

### 1. 打开并编辑默认配置文件

笔者习惯使用vim，所以这里就使用vim来编辑。

```bash
sudo vim /usr/local/etc/xray/config.json
```

### 2. 写入以下标准 JSON 配置

把原本的默认配置文件删除，修改为下列代码配置。代码中提示需要替换的地方，换成你刚才在第二步中自己生成的 UUID、Private Key 和 Short ID，然后保存。

```json
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "port": 8443,
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "a25d2d75-b71c-48f9-8675-14f5425ab4ce", /*替换为你生成的_UUID*/
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "www.microsoft.com:443",
          "xver": 0,
          "serverNames": [
            "www.microsoft.com"
          ],
          "privateKey": "WOUmmGYtpIAiTzrgXjdtowZrPj1f3-C-aZVwQ-1Vw1E", /*替换为你生成的_Private_Key*/
          "shortIds": [
            "7c4e7e1383870633" /*替换为你生成的_Short_ID*/
          ]
        }
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "blocked"
    }
  ]
}

```

编辑完成后，按 `:wq` 保存，按 `Enter` 确认退出。

## 🚀 第五步：语法测试与启动服务

### 1. 测试配置文件语法

```bash
xray -test -config /usr/local/etc/xray/config.json
```

如果输出最后一行显示 `Configuration OK.`，说明配置无误。

### 2. 启动 Xray 并设置开机自启

```bash
systemctl restart xray
systemctl enable xray
```

### 4. 检查运行状态

```bash
systemctl status xray
```

看到绿色的 `active (running)` 即代表服务端已在正常运行。

---

## 📱 第六步：全平台客户端配置对接

### 1. 手动拼接标准的 `vless://` 快捷导入链接

将以下文本中的对应参数替换为你自己的信息，拼成完整的一行：

```text
vless://你的_UUID@你的服务器IP:8443?security=reality&encryption=none&flow=xtls-rprx-vision&sni=www.microsoft.com&fp=chrome&pbk=你的_Public_key_注意这里是公钥&sid=你的_Short_ID&type=tcp#REALITY
```

这段链接应该能在适用的客户端中从剪贴板导入。也可以使用[二维码转换器(我用的草料)](https://cli.im/)把它转成二维码后扫码添加。

### 2. 电脑端配置

由于 REALITY 属于新协议，猫内核必须切换为 **Mihomo Core**。新建一个本地 Profile，写入以下精简分流配置：

```yaml
proxies:
  - name: "REALITY"
    type: vless
    server: 114.51.41.91 #替换为你服务器的IP
    port: 8443
    uuid: a25d2d75-b71c-48f9-8675-14f5425ab4ce # 替换为你生成的UUID
    udp: true
    tls: true
    flow: xtls-rprx-vision
    servername: www.microsoft.com
    network: tcp
    reality-opts:
      public-key: qAv2KD5dvjYQPUL_0GCfrfwPeUbWGTO_DHj-A-Xjvlc #替换为你真实的公钥
      short-id: 7c4e7e1383870633 #替换为你真实的Short_ID
    client-fingerprint: chrome

proxy-groups:
  - name: 🚀 节点选择
    type: select
    proxies:
      - "REALITY"
      - DIRECT

rules:
  - GEOIP,CN,DIRECT
  - MATCH,🚀 节点选择

```

## 📈 网速测试

配置完成后，开启客户端的系统代理。在浏览器中打开无痕模式，直接访问全球公认的国外测速网站 [Fast.com](https://fast.com)。

笔者的洛杉矶VPS，测速结果能达到 **40-50 Mbps** 以上，且空载延迟稳定在洛杉矶物理极限的 **190ms-200ms**。至此，一条临时的私家车备用链路搭建圆满成功。又能愉快的在Github冲浪了。