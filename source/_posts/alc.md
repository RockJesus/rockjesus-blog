---
title: '终于驱动了笔记本ALC269VC的低音炮'
description: '三星 NT550P7C 上的 ALC269VC 2.1 声道：前面板扬声器加后置低音炮，从 VoodooHDA 换到 AppleALC 的完整配置过程。'
date: 2019-01-11 13:48:31
updated: 2022-11-03 18:55:58
cover: /img/header_alc.webp
---

> 本子型号 三星NT550P7C-S65 <br>声卡 ALC269VC 2.1声道，一个前面板左右声道扬声器，后面板一个低音炮

> 之前一直在使用voodoohda，虽然可以驱动扬声器和低音炮但是耳机死活驱动不了，所以改用applealc，经过多次尝试终于成功，耳机，扬声器，低音炮，两个mic全部正常工作，但是不算完美。。

> 待解决：<br>a.开机和睡醒时有爆音<br>b.耳机插拔时不能自动切换，需要手动切换<br>c.扬声器和低音炮音量不能总体控制，需要单独调节（附件里包含音量软件方便调节）用到的软件和alc文件打包 

---

> 12.30更新 准完美版<br>解决自动切换和音量总体调节

> 说下我的步骤：<br>1.layout修改intspeaker下添加一项 dspfunction 如图<br>![1.png](/img/1.png)<br>2.platform文件由idsdt获得，把低音炮和扬声器放在一组（注意子母项位置），修改低音炮channel格式如图<br>![2.png](/img/2.png)<br>3.使用PinConfigurator获得pinconfigdata<br>把codec里有用节点都add进去，点applefix，再手动修改低音炮倒数第二个数与扬声器相同（这里为4），最后一个数改为1，<br>点get configdata，最后加上01b70c02这组数据，修改PinConfigs.kext替换对应数据<br>![3.png](/img/3.png)<br>4.注意layout和platform要打包成xml.zlib格式，info.plist里对应这两个文件名，编译安装Applealc.kext<br>5.修改dsdt里layoutid为0x0E （layoutid&#x3D;14），ok重启

> 还有两个小问题<br>a。唤醒时有爆音<br>b。唤醒后低音炮无声，但是耳机插拔后或者更改音量后又恢复正常<br>望大神指点迷津

> 12.31 已上传 [https://github.com/vit9696/AppleALC](https://github.com/vit9696/AppleALC) layoutid&#x3D;14，改dsdt里为0x0E即可直接使用

> 文件下载[https://pan.baidu.com/s/1QLCznYTq523vwP-OoQCtpw](https://pan.baidu.com/s/1QLCznYTq523vwP-OoQCtpw)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](/img/qq.png) | ![image](/img/gzh.jpg) | ![image](/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](/img/zfb.png) | ![image](/img/wx.png) | ![image](/img/zsm.png) |
