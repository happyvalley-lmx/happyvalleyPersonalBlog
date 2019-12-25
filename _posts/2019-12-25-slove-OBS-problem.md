---
layout: post
title: 解决OBS无法使用窗口捕获以及显示器捕获的问题
date:   2019-12-25 12:11:32
---

# 解决OBS无法使用窗口捕获以及显示器捕获的问题
---
**OBS**是一款开源的免费视频流采集推送软件，可以用于直播以及屏幕录像

我个人是从2015年B站刚公测直播间那会儿开始接触到OBS的，当时听说有这款直播软件可以使用，实际使用下来发现功能远比拿来单纯的当个直播工具要强大

---
这个问题大概是在今年6月后新买电脑后出现的。高中毕业进入大学，自然少不了为自己更换一台电脑。于是我购买了神州战神系列的带 GTX1660Ti 的游戏本，主要是因为平时自己经常做视频建模~~打游戏~~可以更流畅

之后问题也随即出现，我发现我的OBS在新电脑上无法正常的使用**窗口捕获**以及**显示器捕获**功能了。
* 窗口捕获示意
![窗口捕获示意](https://img-blog.csdnimg.cn/20191225114229138.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI3NjYwMDY3,size_16,color_FFFFFF,t_70)

这两个选项采集出来的视频要不就是黑屏要不就是与所选内容完全不符，但是相对应的**游戏捕获**功能却可以正常的使用并采集出视频。
![错误的窗口捕获情况](https://img-blog.csdnimg.cn/20191225114518107.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI3NjYwMDY3,size_16,color_FFFFFF,t_70)
(可以看到在窗口捕获选择Chrome浏览器情况下预览窗口却显示的OBS窗口)

遇到这个问题的第一时间，我首先想到的是会不会是 Windows 10 的兼容性问题，毕竟当年电脑用的是win7系统，于是将OBS设置为了兼容模式 Windows 7 启动，结果问题依旧没有解决。

不是系统兼容问题，那是不是可能与显卡有关呢？我原来旧的电脑因为没有装独显，用的一直是Intel的集成显卡。如果是因为新电脑的GTX1660Ti不兼容OBS，那么尝试设置为集成显卡启动会不会解决这个问题呢？

* 鼠标右键点击OBS选择集成显卡启动
![右键使用集成显卡运行OBS](https://img-blog.csdnimg.cn/20191225115125813.png)
启动之后，重新设置了窗口捕获，Chrome再次出现在了OBS的预览窗口中，问题圆满解决。
![正常捕获窗口](https://img-blog.csdnimg.cn/20191225115330164.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzI3NjYwMDY3,size_16,color_FFFFFF,t_70)
---
其实不只是OBS，经过这接近六个月的使用下来，遇到很多的图像处理软件都与独立显卡出现了或多或少的适配问题。虽然也不清楚是什么原理，但是自己也还是得在这条蜿蜒曲折的路上坚持走下去_(:3rz)_
