---
layout: post
title: 解决pyinstaller路径问题
date:   2024-02-06 15:50:00 +0800
categories: programming
tags: python
excerpt: 解决pyinstaller打包进单文件模式下，程序内打开文件路径错误的问题

---

用pyinstaller在单文件模式下打包多个文件后，在程序内打开或引用打包的文件时出现了路径错误的问题。  
应该想办法使用相对路径。从StackOverflow上找到了解决方法：

```
import os,sys
bundle_dir = getattr(sys, '_MEIPASS', os.path.abspath(os.path.dirname(__file__)))
# 引用文件file时使用以下格式
path_to_file = os.path.abspath(os.path.join(bundle_dir, 'file'))
```