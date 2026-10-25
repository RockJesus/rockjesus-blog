---
title: '一行patch驱动NVIDIA HDMI声音'
date: 2019-01-11 13:48:30
updated: 2022-11-03 18:56:08
cover: https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/header_hdmi.webp
---

# **成功测试硬件**

> Alienware 17 R4<br>alc298 <br>英特尔HD 630和Nvidia GeForce GT 1060

> **测试环境10.13.6 ，9系10系n卡可做参考，当webdriver更新10.14后应该同理**

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/4.png)

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/5.png)

> 原帖地址：[WhateverGreen&#x2F;FAQ.GeForce.en.md at master · acidanthera&#x2F;WhateverGreen · GitHub](https://github.com/acidanthera/WhateverGreen/blob/master/Manual/FAQ.GeForce.en.md)<br>按照这里的操作确实可行，但是只讲到修改dsdt来显示被隐藏的hdmi声音HDAU设备，下面讲到如何通过hotpatch显示设备和驱动设备

#**hotpatch驱动方法：**

> 1. win下到设备管理器-声音-nvidia hdmi-记录硬件id和bios硬件位置<br>例如我的硬件id为：厂商id&#x3D;0x10de  设备id&#x3D;0x10f1 （这里注意是硬件id不要记录成codecid）<br>bios硬件位置为：_SB&#x2F;PCI0&#x2F;PEG0&#x2F;PEGP

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/6.png)

<blockquote>
<ol start="2">
<li>mac下需要安装对应版本webdriver来驱动独显，外接显示器视频正常输出，但系统检测不到hdmi声音hdau硬件设备</li>
</ol>
</blockquote>

<blockquote>
<ol start="3">
<li>hotpatch 模版 这里等同原帖第一步操作，<br>打开ssdt修改对应bios硬件位置，和我一样的就不用改了，直接放到clover-acpi-patched里面<br>*我没有做原帖里面的第二步，因为在我的ssdt里搜索到了相同代码，无需操作，你的如果不行的话参考原帖尝试第二步修改</li>
</ol>
</blockquote>

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/7.png)

<blockquote>
<ol start="4">
<li>改名使ssdt生效<br>打开config.plist-acpi-patches<br>添加改名补丁：<br>Comment：_PRT to XPRT in Device peg0<br>Find:5F505254<br>Replace:58505254<br>tgtbridge:50454730<br>如果和我的硬件位置不一样，参考下图修改,这步完成之后如果重启应该就可以看到hdmi声音设备了</li>
</ol>
</blockquote>

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/8.png)

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/9.png)

<blockquote>
<ol start="5">
<li>终于可以看到硬件了，那下一步就是驱动了，我的alc298 使用applealc驱动，但是驱动不了hdmi声音，<br>这里给出临时解决方案：利用voodoohda驱动hdmi声音，并且和applealc互不影响。<br>打开voodoohda模版的info.plist  注意这里修改为你的硬件ID&#x3D;0x设备id+厂商id<br>和我一样的就不用改了，直接放到clover-kext-other里面<br>完工！重启进入mac测试你的hdmi声音吧</li>
</ol>
</blockquote>

![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/10.png)

> **待完善**<br>使用applealc来驱动hdmi声音，持续测试中。。。

> **模版下载：[n卡hdmi声音模版](https://pan.baidu.com/s/1w5neAaAVZhOMoqPunEpQAw)   （最新方法看下面）**

---

> 最新更新lilu，applealc，whatevergreen后自带显示默认隐藏的hdmi声音代码，所以现在只需更改voodoohda里的n卡id即可驱动hdmi声音！！！<br>**最新clover下载：[AW17R4Mojave](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh)**

# 如有疑问请进QQ群 If u need help &gt;&gt; [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/qq.png) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/gzh.jpg) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/zfb.png) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/wx.png) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/zsm.png) |
