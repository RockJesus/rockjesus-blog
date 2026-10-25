---
title: 'AW 17 R4 笔记本双显卡 MacOS'
date: 2021-10-06 13:48:26
updated: 2022-11-03 21:47:54
cover: https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/alienwareb2.gif
sticky: true
---

<br>![WechatIMG12.jpeg](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/17r4.gif)

> [http://bbs.pcbeta.com/viewthread-1761528-1-1.html](http://bbs.pcbeta.com/viewthread-1761528-1-1.html)

> [http://bbs.pcbeta.com/viewthread-1797200-1-1.html](http://bbs.pcbeta.com/viewthread-1797200-1-1.html)

> **配置**<br>Alienware 17 R4<br>bios版本1.2.4<br>CPU:Intel i7-7700hq<br>显卡:Intel HD630 &#x2F; Nvidia GeForce GT 1060<br>内存:16g<br>硬盘:Sandisk m.2 256G &#x2F;希捷 1T （添加nvme sm961 256g）<br>声卡：alc298<br>网卡：killer e2500 (wifi 更换为dw1560-bcm94352z )

> **成功驱动「HD630+nvidia 1060双显卡」声卡网卡，满足日常使用（双显卡模式请看第二部分）**<br>![about.png](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/about.png)

> **第一部分（核显模式）**

只能在win10下fn+f7以核显模式启动 ，独显模式启动会黑屏 使用情况

1. <p>hotpatch屏蔽NVIDIA 1060 （优点节能省电低温）</p>

1. <p>原生驱动I7-7700HQ 核显 HD630 （外接hdmi显示器无信号，内屏连接hd630输出正常，thunderbolt&#x2F;dp未测试）</p>

1. <p>声卡ALC298也叫ALC3266（自制applealc已上传github layoutid&#x3D;11 精简版下载请看2楼） （笔记本自带2.1声道，左右扬声器声音正常无破音，低音炮安装boom2后低音正常并且提高了整体最大音量，内置mic正常，外接耳机声音极小（2楼已修复），外接mic未测试）</p>

1. <p>网卡Killer E2500 （有线正常，killer-wifi无解，自配小米usb wifi正常使用</p>

1. <p>电池驱动 （电量信息显示正确）</p>

1. <p>USB 3.0 (两个usb口正常，type-c测试看2楼)</p>

1. <p>蓝牙&#x2F;摄像头正常使用 （蓝牙开关无法关闭，2楼已修复）</p>

1. <p>ALIENFX灯光正常，键盘&#x2F;触摸板使用正常 （键盘和logo灯光保持win下配置好的颜色，   触摸板bios&#x3D;auto时无光，bios开启touchpad backlight可常亮，不会自动熄灭，2楼更新解决方案）</p>

1. <p>cpu 15档变频，睡眠能睡醒不来，黑屏但有光 （2楼已修复）</p>

核显版本CLOVER文件分享 CLOVERhd630 (适合不需要hdmi的同学&amp;安装时使用)

> **第二部分 （双显卡模式&amp;单独显模式） 特别感谢@【解】小天**

使用前提：安装webdriver （补充一点安装完重启前要删除hotpatch屏蔽独显的ssdt或直接覆盖下面附件）

**此配置config兼容两种启动方式**

- <p>A：win10下fn+f7 以核显启动-双显卡模式（个人推荐 长期更新双显版本CLOVERhd630+1060 适合需要hdmi的同学使用）<br>原生驱动I7-7700HQ HD630 &#x2F; webdriver 驱动nvidia 1060 （外接hdmi显示器连接1060视频输出正常，hdmi声音不出声（已修复），内屏连接hd630输出正常，HDMI热拔插正常，thunderbolt未测试）</p>

- <p>B：win10下fn+f7 以独显启动-单独显模式 （单独显版本CLOVER+1060 适合需要hdmi的同学使用）<br>HD630貌似被屏蔽 &#x2F; webdriver 驱动nvidia 1060 （外接hdmi显示器和内屏连接1060视频输出正常，有个问题插着hdmi启动会黑屏，不插hdmi启动正常（bios legacy option rom&#x3D;enable 解决此问题），HDMI热拔插正常，hdmi声音不出声（已修复），thunderbolt&#x2F;dp未测试）</p>

声卡 网卡 电池 USB 蓝牙&#x2F;摄像头 ALIENFX灯光 睡眠 cpu变频 （和第一部分相同）

**两部分三种启动方式优缺点自行斟酌**

---

> **2楼**

10&#x2F;7更新 亮度保存

10&#x2F;8更新 耳机&#x2F;睡醒无声修复 ALCPlugFix-master 感谢@darkhandz

10&#x2F;10更新 解决关机重启问题

10&#x2F;11更新 自己制作的 applealc for alc298 (alc3266) 已经上传applealc github，你也可以到[https://github.com/vit9696/AppleALC](https://github.com/vit9696/AppleALC) 这里自行下载编译 layoutid&#x3D;11

10&#x2F;16更新 优化核显版本

10&#x2F;31更新 添加蓝牙注入 （解决蓝牙开关问题）<br>添加lpc注入 （kabylake到底需不需要加载lpc？）<br>自行删除fakesmc下蓝牙和lpc条目，以后可以无痛更新fakesmc了

11&#x2F;1更新 终于能睡醒了！适用于睡醒黑屏的情况 （删除clover里edid注入相关选项）

11&#x2F;6更新 安卓手机做wifi网卡 HoRNDIS

11&#x2F;7更新 双显模式 睡眠完美 解决睡醒黑屏&amp;无声 （前提要使用10&#x2F;8耳机补丁）更新clover&amp;kexts版本，替换了新的hwp驱动方法精简优化设置，仿冒facetimehd摄像头等 （用核显版本的同学自行添加屏蔽独显补丁）

11&#x2F;9更新 仿冒白苹果鼠标 （自行修改info下的pidvid为你的鼠标id，注意十六进制转十进制）

11&#x2F;10更新 SSDT-PCIALL-Rockjesus 显示所有pci设备信息 适合双显卡版本，可注入声显卡id (clover设置删除相关选项，并勾选injectnvidia)，其他机型可自行参考修改<br>![pci.png](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/pci.png)

11&#x2F;13更新 修复雷电usb-c口支持热拔插 [http://bbs.pcbeta.com/viewthread-1769978-1-1.html](http://bbs.pcbeta.com/viewthread-1769978-1-1.html)

1&#x2F;27更新 增加nvme sm961 256g 替换wifi dw1560（bcm94352z）无线蓝牙完美更新clover&#x2F;驱动&#x2F;优化等

> 附上KBLFB edp&#x2F;hdmi补丁：<br>com.apple.driver.AppleIntelKBLGraphicsFramebuffer<br>00000800 02000000 98000000<br>00000800 00040000 98000000<br>0-edp

> com.apple.driver.AppleIntelKBLGraphicsFramebuffer<br>01050900 00040000 87010000<br>01050900 00080000 87010000<br>1-hdmi

10&#x2F;24更新 修复hdmi声音输出

> clover美化贴:<br>[http://bbs.pcbeta.com/viewthread-1725492-1-1.html](http://bbs.pcbeta.com/viewthread-1725492-1-1.html)<br>[http://bbs.pcbeta.com/viewthread-1724405-1-1.html](http://bbs.pcbeta.com/viewthread-1724405-1-1.html)<br>[http://bbs.pcbeta.com/viewthread-1770623-1-1.html](http://bbs.pcbeta.com/viewthread-1770623-1-1.html)<br>[http://bbs.pcbeta.com/viewthread-1766401-1-1.html](http://bbs.pcbeta.com/viewthread-1766401-1-1.html)<br>声卡帖子：[http://bbs.pcbeta.com/viewthread-1729541-1-1.html](http://bbs.pcbeta.com/viewthread-1729541-1-1.html)<br>鼠标主题：[http://bbs.pcbeta.com/viewthread-1766401-1-1.html](http://bbs.pcbeta.com/viewthread-1766401-1-1.html)

PS： mac下修改键盘灯方法 [http://bbs.pcbeta.com/viewthread-1780839-1-1.html](http://bbs.pcbeta.com/viewthread-1780839-1-1.html)

更新10.13.4后发现不用屏蔽独显了，也不需修改或添加edid文件，睡眠完美，又省了两步，不错！

推荐软件boom2或者boom3d

bios设置：raid on 改为ahci secure boot 关闭 touchpad backlight改为on （可选）

10&#x2F;18测试雷电口&#x2F;type-c可正常使用，热拔插ok，但睡醒后会挂

Q1：cpu必须使用这个VoodooTSCSync.kext才能正常使用，否则进入系统响应超慢，请问这个问题有解吗？ Q2: hdmi声音至今未搞定（已修复） Q3: 未驱动硬件 image

问题多多不够完美，要完善的地方还有很多，慢慢更新吧 寻找机油一起研究 QQ群: 308469644

> clover引导文件下载：[https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh)

# 如有疑问请进QQ群 If u need help &gt;&gt; [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/qq.png) | ![image](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/gzh.jpg) | ![image](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/zfb.png) | ![image](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/wx.png) | ![image](https://cdn.jsdelivr.net/gh/rockjesus/rockjesus/img/zsm.png) |
