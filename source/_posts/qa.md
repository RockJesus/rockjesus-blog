---
title: '五国/日常问题集合Q&A'
date: 2019-01-11 13:48:28
updated: 2022-11-03 18:56:24
cover: https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/color.gif
---

# Busy Timeout[0], kextd wait(0):’AppleACPICPU’

这个错误找了很多帖子，最后将Clover 更新到最新版本，并将Clover下的kexts&#x2F;other目录下的kext全部复制到kexts&#x2F;10.13下解决。<br>换fakesmc<br>删除4个温度kext<br>开机clover-option-Bin下选项打勾尝试

# hd4400-4600花屏 8苹果

一。添加AzulPatcher4600.kext<br>ig-platform-id 0x04128086<br>fake-id-intelgfx 0x0a260006<br>二、在clover中注入一个修改过的EDID<br>00FFFFFFFFFFFF000DAE351700000000321601049526157802D495A355509D270F505400000001010101010101010101010101010101B43B804A71383440302035007ED710000018000000FE004E3137334847452D4531310A20000000FE00434D4E0A202020202020202020000000FE004E3137334847452D4531310A2000E0<br>或者直接贴clover config代码

```plaintext
<key>Graphics</key>
<dict>
<key>EDID</key>
<dict>
<key>Custom</key>
<data>
AP///////wANrjUXAAAAADIWAQSVJhV4AtSVo1VQnScPUFQAAAAB
AQEBAQEBAQEBAQEBAQEBtDuASnE4NEAwIDUAftcQAAAYAAAA/gBO
MTczSEdFLUUxMQogAAAA/gBDTU4KICAgICAgICAgAAAA/gBOMTcz
SEdFLUUxMQogAOA=
</data>
<key>Inject</key>
<true/>
</dict>
<key>Inject</key>
<dict>
<key>ATI</key>
<false/>
<key>Intel</key>
<true/>
<key>NVidia</key>
<false/>
</dict>
<key>NvidiaSingle</key>
<false/>
<key>ig-platform-id</key>
<string>0x0a260006</string>
</dict>
```

# still waiting for root device

开启ahci<br>换usb口尝试<br>CPUS＝1<br>更新fakesmc

# Mbr安装找不到内核

-v &#x2F;System&#x2F;Library&#x2F;PrelinkedKernels&#x2F;Prelinkedkernel

# 双显卡上两行 &amp;解决外接屏幕滞留问题

clover injectNv&#x3D;&#x3D;的都打勾<br>添加clover&#x2F;drivers64UEFI&#x2F;EmuVariableUefi-64.efi

# 在安装High Sierra启动过程中，选择-v跑时会出现”Attempting system restart…MACH Reboot”，而不用-v图跑直接显示苹果标志时则不会出现。

更换fakesmc<br>删除4个温度kexts<br>fix headers打勾<br>drop掉 mach<br>Drop掉 DMAR<br>drop掉MATS，<br>drop掉BGRT。<br>drop掉#MCFG<br>drop oem都不勾<br>dart&#x3D;0

# app store下载有问题

设置 网络 dns 8.8.8.8

# 启动完成后，安装器提示 OSInstall 已缺失或损坏

【更新】解决：删掉clover&#x2F;drivers64UEFI&#x2F;EmuVariableUefi-64.efi

# 卡osaptio ++++++++++

cpu kernel lapic 打勾<br>更换OsxAptioFix。。。efi

# n卡 驱动

web 打勾<br>添加clover&#x2F;drivers64UEFI&#x2F;EmuVariableUefi-64.efi<br>device设置里删nv相关patch<br>删除dgpu.aml<br>nvram&#x3D;no （开机clover界面f11可清除nvram）<br>nvda_drv&#x3D;1<br>lilu+nvidiagraphicsfixup

# 更新系统后闪退重启

bash &lt;(curl -s [https://raw.githubusercontent.com/Benjamin-Dobell/nvidia-update/master/nvidia-update.sh](https://raw.githubusercontent.com/Benjamin-Dobell/nvidia-update/master/nvidia-update.sh))<br>更新fakesmc+lilu等相关驱动 删除4个温度传感器驱动<br>-lilubeta<br>-liluoff

# 蓝牙开关

usbinjectall+btinjector 添加usb里蓝牙id

# 登录转圈卡顿

改smbios尝试

# 多显示器同时连接开机黑屏

Bios 下修改<br>csm&#x3D;enable<br>legacy option oprom&#x3D;enable

# 蓝牙搜不到设备无法使用

去win下卸载自带蓝牙驱动，尝试安装不同版本的蓝牙驱动，Drop tables 添加DMAR表单<br>再回到mac尝试

# 如有疑问请进QQ群 If u need help &gt;&gt; [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/qq.png) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/gzh.jpg) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/zfb.png) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/wx.png) | ![image](https://gcore.jsdelivr.net/gh/rockjesus/rockjesus/img/zsm.png) |
