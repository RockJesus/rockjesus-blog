---
title: '外星人黑苹果clover/opencore收集 alienware hackintosh clover/opencore collection'
date: 2021-10-07 13:48:25
updated: 2022-11-03 18:55:54
cover: /img/header_ah.webp
sticky: true
---

# alienware hackintosh clover&#x2F;opencore collection

# 外星人黑苹果clover&#x2F;opencore收集

[![Anurag&#39;s GitHub stats](https://github-readme-stats.vercel.app/api?username=RockJesus&count_private=true&include_all_commits=true&show_icons=true&theme=nightowl&bg_color=30,e96443,904e95&title_color=fff&text_color=fff)](https://github.com/RockJesus)

[![Hardware](https://img.shields.io/badge/Hardware-alienware-silver.svg)](https://alienware.com/)[![Platform](https://img.shields.io/badge/platform-macOS-red.svg)](https://developer.apple.com/macos)[![Platform](https://img.shields.io/badge/platform-windows-blue.svg)](https://www.microsoft.com/en-us/windows/)[![zfb](https://img.shields.io/badge/%E6%89%93%E8%B5%8F-%E6%94%AF%E4%BB%98%E5%AE%9D-blue.svg)](https://gitee.com/rockjesus/rockjesus/raw/master/img/zfb.png)[![wx](https://img.shields.io/badge/%E6%89%93%E8%B5%8F-%E5%BE%AE%E4%BF%A1-green.svg)](https://gitee.com/rockjesus/rockjesus/raw/master/img/wx.png)[![zsm](https://img.shields.io/badge/%E6%89%93%E8%B5%8F-%E8%B5%9E%E8%B5%8F%E7%A0%81-yellow.svg)](https://gitee.com/rockjesus/rockjesus/raw/master/img/zsm.png)

# 下载地址：[https://github.com/RockJesus/Alienware-Hackintosh](https://github.com/RockJesus/Alienware-Hackintosh)

# 收集网友分享的外星人各机型黑苹果efi，欢迎push你的配置！

# Collect alienware hackintosh clover&#x2F;opencore shared by netizens. Welcome to push your own configuration here!

# Alienware 17 R4 长期维护 Long-term maintenance：[https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh)

# 更多台式机型 More desktop models: [https://github.com/jianghaizhi/DELL-Alienware-Aurora-R7-macOS](https://github.com/jianghaizhi/DELL-Alienware-Aurora-R7-macOS)

# Guides [中文版](https://github.com/RockJesus/Alienware-17-R4-I7-7700HQ-MacOS-High-Sierra/blob/master/README.md)|||[English](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh/blob/master/README.md)|||[subwoofer](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/alc.md)|||[hdmi audio](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/hdmi.md)|||[led light](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/light.md)|||[mouse theme](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/mouse.md)|||[clover theme](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/theme.md)|||[thunderbolt](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/tb.md)|||[Q&amp;A](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/qa.md)|||[远景论坛](http://bbs.pcbeta.com/viewthread-1833933-1-1.html)|||[tonymacx86](https://www.tonymacx86.com/threads/guide-alienware-17-r4-dual-gpu-macos-mojave-10-14-hackintosh.288728/)

# 欢迎来我的博客 Welcome to my blog：[https://rockjesus.cn](https://rockjesus.cn/)

# 黑果小兵的部落阁 daliansky’s blog: [https://blog.daliansky.net](https://blog.daliansky.net/) （安装教程等新手看这里）

# 其他各品牌机型 other brands:

[https://github.com/daliansky/Hackintosh](https://github.com/daliansky/Hackintosh)<br>[https://zhih.me/hackintosh/#/](https://zhih.me/hackintosh/#/)

# 黑苹果常用网站 credits:

[http://bbs.pcbeta.com/](http://bbs.pcbeta.com/)<br>[https://www.insanelymac.com/](https://www.insanelymac.com/)<br>[https://www.tonymacx86.com/](https://www.tonymacx86.com/)<br>[https://github.com/acidanthera/Lilu](https://github.com/acidanthera/Lilu)<br>[https://bitbucket.org/RehabMan/](https://bitbucket.org/RehabMan/)

# 外星人电脑黑苹果驱动情况总结:

1.首先win下-设备管理器-监视器-通用即插即用监视器<br>-常规-位置-确认显示器链接的显卡是双显还是只有独显,<br> A:可切换显卡机型(双显FN+F7切换模式)10.13.6下安装webdriver可驱动双显卡,可以3种模式运行(单核显模式需ssdt等屏蔽独显节能省电,单独显模式需win下切换支持外接显示器,双显卡模式支持外接显示器),10.14&#x2F;15下只能用核显<br> B:不可切换显卡机型(只有N卡输出GSYNC版本默认屏蔽核显)配合webdriver只能安装最高到10.13.6,如果安装10.14&#x2F;15显卡无解<br> C:黑苹果只支持10x0系列以下n卡,16x0&#x2F;20x0系列显卡无解

2.killer 有线网卡和蓝牙可驱动, 无线网卡无解,推荐换内置无线网卡DW1560,<br>dw1820问题多多麻烦，dw1830有点大装不进去，<br>intel有线网卡蓝牙可驱动，无线网卡暂时无解

3.大家有补充的可以@我

# 如有疑问请进QQ群 If u need help &gt;&gt; [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](/img/qq.png) | ![image](/img/gzh.jpg) | ![image](/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](/img/zfb.png) | ![image](/img/wx.png) | ![image](/img/zsm.png) |
