---
layout: post
title: 一种导出QQ群成员列表的方案
date:   2022-07-28 09:50:00 +0800
categories: web
tags: json
excerpt: 导出QQ群成员列表，避免有可能的炸群后找不回联系方式

------
# 一种导出QQ群成员列表的方案  
因为前段时间出现了QQ账号大量被盗后被用于在群内发送违规信息，导致部分群炸群（被tx封群）的现象时常出现，今天看到群友所在地的本地音游群也炸群了，于是就想着找一种能快速导出群成员信息的方案，以备不时之需（  
## 导出原理  
通过访问 [QQ群官网-成员管理](https://qun.qq.com/member.html) 页面，并通过 DevTools 截取 post 的 search_group_members 数据包来获取群成员列表。![](https://github.com/happyvalley-lmx/happyvalleyPersonalBlog/blob/master/img/search_group_members.png?raw=true)  
## 导出方法  
通过保存 **mems** 对象的数组便可导出一份包含部分群成员的 JSON 数据，在开启 DevTools 时刷新页面，并向下滚动页面直至列出全部群员后，在名称中找到全部的 search_group_members 并在预览页中右键 mems 对象选择“复制值”，这样就能导出该部分数据包所包含的群成员数据。通过导出全部同名数据包中的 mems 对象即可导出一份完整的群成员数组。![](https://raw.githubusercontent.com/happyvalley-lmx/happyvalleyPersonalBlog/master/img/JSON_member_list.png)    
## 数据处理  
可以通过 [json2xls](https://github.com/rikkertkoppes/json2xls/) 来快速将 JSON 数据转换成 excel 表格数据方便查阅。  
* 此方法需要使用 NodeJS 安装 json2xls 包并放置 JSON 文件到相同文件夹下
### 示例
        var json2xls = require('json2xls');
        var fs = require('fs');

        //将jsonfilename.json换成你导出保存的json文件
        let data = JSON.parse(fs.readFileSync('jsonfilename.json', 'utf-8'))
        var xls = json2xls(data);

        //将xlsfilename.xlsx换成你想保存的xls名称
        fs.writeFileSync('xlsfilename.xlsx', xls, 'binary');

## 结语
希望tx少炸点群...