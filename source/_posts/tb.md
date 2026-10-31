---
title: 'Mac雷电3 type-c 热拔插支持'
description: 'Alienware 17 R4 的 JHL6340 雷电 3 控制器在 macOS 下实现热拔插的 SSDT 与端口配置。'
date: 2019-01-11 13:48:27
updated: 2022-11-03 18:56:27
cover: /img/awhd.gif
---

> 配置Alienware 17 r4<br>雷电3:8086, 15DA,Intel JHL6340 Thunderbolt 3 Bridge (C step) [Alpine Ridge 2C 2016]

> 原先没有任何修改时，开机前插着雷电启动，可以使用雷电设备，但是不能热拔插，睡醒回来也会挂。。。<br>后来发现@the-darkvoid写了macOS-IOElectrify这个KEXT，拿来试试终于可以热拔插了，感谢作者！！！

![屏幕快照 2017-11-19 上午10.13.01.png](/img/16.png)<br>![屏幕快照 2017-11-19 上午10.13.01.png](/img/17.png)<br>![屏幕快照 2017-11-19 上午10.13.01.png](/img/18.png)<br>![屏幕快照 2017-11-19 上午10.13.01.png](/img/19.png)<br>![屏幕快照 2017-11-19 上午10.13.01.png](/img/20.png)<br>![屏幕快照 2017-11-19 上午10.13.01.png](/img/21.png)

> 貌似把雷电仿冒成了express card所以thunderbolt下无显示。。<br>同机型可直接使用前往[https://github.com/RockJesus/macOS-IOElectrify](https://github.com/RockJesus/macOS-IOElectrify)

> 待解决问题：开机必须插着雷电启动才能使用，睡醒后雷电口依旧会挂，重新拔插也不行

```plaintext
[backcolor=rgba(27, 31, 35, 0.05)]UB31@00200000: AppleUSBXHCIPort::powerOn: deadline passed (PORTSC 0x00000000) UB21@00100000: AppleUSBXHCIPort::powerOn: deadline passed (PORTSC 0x00000000) TBTU@00000000: AppleUSBHostController::setPowerStateGated: going to state 1 returned 0xe00002e9 TBTU@00000000: AppleUSBHostController::hardwareExceptionThreadCallGated: attempting recovery TBTU@00000000: AppleUSBHostController::hardwareExceptionThreadCallGated: 0x00000004 TBTU@00000000: AppleUSBHostController::hardwareExceptionThreadCallGated: attempting recovery TBTU@00000000: AppleUSBHostController::setPowerStateGated: going to state 2 failed with 0xe00002e9 TBTU@00000000: AppleUSBHostController::hardwareExceptionThreadCallGated: 0x00000008
[backcolor=rgba(27, 31, 35, 0.05)]
```

日志里一直循环这些，求大神帮助解决！!

> xps或者其他机型参考作者的[https://github.com/the-darkvoid/macOS-IOElectrify](https://github.com/the-darkvoid/macOS-IOElectrify)<br>1.自行修改ssdt内雷电路径<br>举例:Scope (_SB.PCI0.PEG2.PEGP)<br>Scope (_SB.PCI0.RP05.PXSX)<br>2.（可选不确定作用）IOElectrify.kext&#x2F;info.plist里添加你的雷电bridge id ， 删除所有#<br>举例：IOPCIPrimaryMatch       0x76158086空格0x15da8086空格你的id

> 附上参考文章：<br>[https://www.tonymacx86.com/threads/usb-c-hotplug-not-working.223534/](https://www.tonymacx86.com/threads/usb-c-hotplug-not-working.223534/)<br>[https://www.tonymacx86.com/threads/usb-c-hotplug-questions.211313/](https://www.tonymacx86.com/threads/usb-c-hotplug-questions.211313/)<br>[https://github.com/gunslinger23/XPS15-9560-High-Sierra/tree/master/CLOVER/ACPI/patched](https://github.com/gunslinger23/XPS15-9560-High-Sierra/tree/master/CLOVER/ACPI/patched)<br>[https://github.com/wmchris/DellXPS15-9550-OSX/tree/10.13/10.13/Advanced/DSDT-HotPatches/Patches](https://github.com/wmchris/DellXPS15-9550-OSX/tree/10.13/10.13/Advanced/DSDT-HotPatches/Patches)

# 如有疑问请进QQ群 If u need help &gt;&gt; [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](/img/qq.png) | ![image](/img/gzh.jpg) | ![image](/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](/img/zfb.png) | ![image](/img/wx.png) | ![image](/img/zsm.png) |
