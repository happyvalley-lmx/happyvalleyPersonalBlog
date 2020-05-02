---
layout: post
title: 给MediaWiki安装可视化编辑VisualEditor
date:   2020-05-03 05:00:00
categories: web
tags: MediaWiki PHP web
excerpt: arcaeacnwiki搬家结束了，终于从512M的小水管换到了2M的小水管，于是在热心~~卡车~~WIKI群友的催促下安装了 VisualEditor 扩展用于可视化编辑操作。
---

# 给MediaWiki安装可视化编辑VisualEditor

## 前言

arcaeacnwiki搬家结束了，终于从512M的小水管换到了2M的小水管，于是在热心~~卡车~~WIKI群友的催促下安装了 VisualEditor 扩展用于可视化编辑操作。

## 流程

* 下载 VisualEditor 扩展

  前往[MediaWiki的下载页面](https://www.mediawiki.org/wiki/Special:ExtensionDistributor/VisualEditor)

* 安装 Parsoid

  Parsoid 和 Node.js 是可视化编辑器的必要前置条件，如果不安装这两个前置服务可视化编辑将会无法保存。

  安装过程参考MediaWiki中[Parsoid安装说明页面](https://www.mediawiki.org/wiki/Parsoid/Setup)

  `yum install git npm`
  `git clone --recursive https://gerrit.wikimedia.org/r/mediawiki/services/parsoid/deploy`
  `git clone https://gerrit.wikimedia.org/r/mediawiki/services/parsoid`
  `cd parsoid`
  `npm install`

  之后，复制一份 config.yaml 配置文件

  ` cp config.example.yaml config.yaml `

  最后再启动 Parsoid 服务就行了

  `node bin/server.js`

* debug

  然而事情并没有想象的那么简单

  通过 `netstat -tunlp | grep 8000` 验证得知

  Parsoid服务成功启用了

  但是在启用VisualEditor后报错

  `o_vrs: The VirtualRESTService for the document server is not defined; see https://www.mediawiki.org/wiki/Extension:VisualEditor`

  查阅官方文档后发现需要在LocalSetting里加上

  `$wgVirtualRestConfig['modules']['parsoid'] = array(
      // URL to the Parsoid instance
      // Use port 8142 if you use the Debian package
      'url' => 'http://localhost:8000',
      // Parsoid "domain", see below (optional)
      'domain' => 'localhost',
      // Parsoid "prefix", see below (optional)
      'prefix' => 'localhost'
  );`

  来使 MediaWiki 与 Parsoid 通信

  行吧，加上了，然后又弹出个报错

  `oldidnotfound: There is no revision with ID 0.`

  一查，原来是Parsoid配置错误了 导致请求URL404 所以没开启成功

  回到 Parsoid 的 config.ymli 配置文件

  检查发现uri一行位置没有改到正确的 MediaWiki 的 api.php 请求页面

  于是根据自己的api.php所在目录改为

  `uri: 'http://wiki.arcaea.cn/api.php'`

  保存 启动

  成功。

## 尾声

MediaWiki真是个大坑，查错误过程前后历经近四小时，找遍Google跟百度最后结合实际情况才解决问题，看起来需要多逛逛MediaWiki的官方文档了

因为暂时还不太会配置，所以目前直接开了个screen窗口来跑Parsoid的nodejs挂后台，之后再找别的方法配置自启动了x



参考:

[VisualEditor安装笔记](https://segmentfault.com/a/1190000008455881)

[MediaWiki上的VisualEditor页面](https://www.mediawiki.org/wiki/Extension:VisualEditor)

[MediaWiki上的Parsoid配置页面](https://www.mediawiki.org/wiki/Parsoid/Setup)