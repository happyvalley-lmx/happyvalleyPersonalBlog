---
layout: post
title: WNMP环境下MediaWiki配合宝塔面板配置过程中的常见问题及解决方案 
date:   2022-07-15 11:11:11 +0800
categories: web
tags: MediaWiki nginx PHP
excerpt: 最近在搞一个新的MediaWiki站点，本文结合了自己在宝塔一键安装WNMP环境中配置MediaWiki遇到的问题以及对应解决方案。

---
# WNMP环境下MediaWiki配合宝塔面板配置过程中的常见问题及解决方案  
最近在搞一个新的 MediaWiki 站点，本文结合了自己在宝塔一键安装WNMP环境中配置 MediaWiki 遇到的问题以及对应解决方案。

## 可视化编辑器出现 curl error 60 错误  
* 错误原因：curl 配置中开启了证书校验

### 解决方法  
* 方法1：
curl 关闭证书校验：  
`curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);`  
* 方法2：
使用 [cacert.pem](https://curl.haxx.se/ca/cacert.pem)  
在php的php.ini配置文件引用此文件  
例，代码：
`curl.cainfo = "D:\php\cacert.pem"`

## 使用链接进入未创建页面时出现 404 错误  
* 错误复现：使用搜索框时可以正常进入未创建的页面，但直接在浏览器地址栏输入页面时进入404页面，没有自动跳转到MW的创建页面页。  
* 错误原因：宝塔默认创建时使用了自定义的404页面。通过F12调试发现，正常的MediaWiki在进入没有创建的页面时会进入404，随后MW的404页会跳转至带有`&action=edit`参数的编辑页面，从而进入创建页页面。
  
### 解决方法  
在站点nginx配置中关闭自定义404页。  
`#error_page 404 /404.html;`(找到此行在前面加入井号键注释)

## 站点伪静态配置后css/js后缀文件及上传文件无法访问  
* 错误原因: nginx站点配置不正确。

### 解决方法  
在宝塔面板 **伪静态** 页中按以下内容配置：

    location ^~ /maintenance/ {
        return 403;
    }

     location /rest.php {
        try_files $uri $uri/ /rest.php?$args;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        try_files $uri /index.php;
        expires max;
        log_not_found off;
    }

    location = /_.gif {
        expires max;
        empty_gif;
    }

    location ^~ /cache/ {
        deny all;
    }

    location /dumps {
        root /var/www/mediawiki/local;
        autoindex on;
    }
    
    location / {
        try_files $uri $uri/ @rewrite;
    }

    location @rewrite {
        rewrite ^/(.*)$ /index.php?title=$1&$args;
    }
注：宝塔伪静态页实质为站点nginx配置中的REWRITE设置

    #REWRITE-START
    include rewrite/wiki.rotaeno.cn/*.conf;
    #REWRITE-END

故在站点配置文件中使用同样也是可以的。
在 **LocalSetting.php** 中按以下内容设置：

    $wgScriptPath = "";
    $wgArticlePath = "/$1";
    $wgUsePathInfo = true;

## 尾声  
淦，已经一年没更新blog了（  
这次的内容基本是在配置 [Rotaeno中文维基](https://wiki.rotaeno.cn) 时遇到的问题，可以说是屡屡碰壁，跌倒再爬起了（
MediaWiki 配置过程的很多问题其实在 [MediaWiki](https://www.mediawiki.org) 的 Manual 中都有详细的解决方案，比如在 **Manual:Short_URL** 中就介绍了网站伪静态的配置方法。当然也有很多奇奇妙妙的小BUG是宝塔面板默认**禁用函数**导致的问题，配置过程中一定要检查是否取消禁用了这些函数。  
还有一种存在的问题就是因为安装的插件(extentions)没有更新到最新版本。比如这次安装过程中发现的 **Special:日志** 页面就会因为评论和头像插件没有更新到最新版本导致报错。更新MW版本时一定要检查所用的插件是否都支持了最新版本，否则更新后可能会出现奇妙的兼容性问题。  

~~Rotaeno 真好玩~~