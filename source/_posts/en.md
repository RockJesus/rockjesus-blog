---
title: 'AW 17 R4 DUAL-GPU MacOS'
date: 2021-10-06 13:48:25
updated: 2022-11-03 21:48:07
cover: /img/header_post.webp
sticky: true
---

<br>![aw17.jpg](/img/17r4.gif)

> [http://bbs.pcbeta.com/viewthread-1797200-1-1.html](http://bbs.pcbeta.com/viewthread-1797200-1-1.html)

> [https://www.tonymacx86.com/threads/guide-alienware-17-r4-dual-gpu-macos-mojave.263577/](https://www.tonymacx86.com/threads/guide-alienware-17-r4-dual-gpu-macos-mojave.263577/)

> **My hardware**<br>Alienware 17 R4<br>1080p<br>i7-7700HQ<br>Intel HD 630 &amp; Nvidia GeForce GT 1060<br>16G RAM<br>SM961 Samsung NVME 256<br>REALTEK ALC298<br>KILLER E2500<br>Dell DW1560 (Broadcom BCM94352Z)<br>BIOS version 1.5.0

> **BIOS Configuration**<br>SATA MODE AHCI<br>SECURE BOOT NO<br>BOOT UEFI

> **Overview**<br>I’ve got dual-gpu working good on 10.13.6,Now just waiting for the webdriver for 10.14.<br>*In windows OS press FN+F7 to change graphic mode:<br>1.dual gpu mode:Indisplay connects to hd630,Exdisplay connects to nvidia 1060<br>2.nvidia gpu only mode:Indisplay &amp; Exdisplay both connects to nvidia 1060<br>![about.png](/img/about.png)<br>![pci.png](/img/pci.png)

> **What Works**<br>CPU Power Management<br>Battery Support<br>Intel HD 630 &amp; Nvidia GeForce GT 1060(when webdriver has installed)<br>HDMI out (with hotplug) &amp; Audio out(when webdriver has installed)<br>Audio ALC298 (2.1ch with subwoofer)<br>Headphone<br>Brightness &amp; volume Keys<br>Keyboard<br>AlienFX keyboard &amp; logo LED lights (follow the settings on windows os but using vmware boot to windows and load the aw1517 usb device could change Alienfx light on macos)<br>Trackpad with Gestures<br>Webcam<br>WiFi and Bluetooth<br>Ethernet<br>iCloud Services<br>Continuity and Hand-off<br>USB 3.0 &amp; TYPE-C<br>Thunderbolt devices with hotplug before sleep<br>Sleep &amp; Wake (only power button could wakeup system)

> **What Doesn’t Work**<br>Keyboard &amp; mouse wakeup sysytem<br>Thunderbolt devices with hotplug after wake<br>ALIENFX light control on Macos<br>Webcam IR function<br>Trackpad light (Bios touchpad backlight&#x3D;auto with no light ,but Bios touchpad backlight&#x3D;on with light always on)

> **What Needs Improvement**<br>Backlight auto adjust (ALS0 device)<br>HWsensor for more info<br>LPCB,SBUS,Thermal subsystem controllers seems not working normally<br>Things under “What Doesn’t Work”

> **Install**<br>If you can’t see install partition try to press F3 on clover boot screen

> **Post Install**<br>**HIDPI**<br>Run script in Terminal:<br>Code:<br>sh -c “$(curl -fsSL [https://raw.githubusercontent.com/xzhih/one-key-hidpi/master/hidpi.sh)&quot;](https://raw.githubusercontent.com/xzhih/one-key-hidpi/master/hidpi.sh\)&quot;)

> **Change ur own productid &amp; vendorid in kext’s info.plist ()**<br>AppleMouseKeyboard.kext<br>Applesmcmotion.kext (KIOX device)<br>UVC2FaceTimeHD.kext (cam)<br>VoodooHDA.kext (nvidia hdmi controller id)

> **Nvidia webdriver**<br>copy and paste the following in a terminal:<br>Code:<br>bash &lt;(curl -s [https://raw.githubusercontent.com/Benjamin-Dobell/nvidia-update/master/nvidia-update.sh](https://raw.githubusercontent.com/Benjamin-Dobell/nvidia-update/master/nvidia-update.sh))

> **Audio**<br>ALC298: layout-id&#x3D;11 [https://github.com/acidanthera/AppleALC](https://github.com/acidanthera/AppleALC)<br>Headphone&#x2F;Headset volume ALCplugfix(deprecated):<br>Code:<br>cd alc_fix<br>chmod +x install.sh<br>.&#x2F;install.sh<br>Headphone&#x2F;Headset volume fix Combojack(newway):<br>Code:<br>cd ComboJack<br>chmod +x install.sh<br>.&#x2F;install.sh<br>Install Boom 3D APP to get better audio output

> **Change log**<br>hdmi audio changed to hotpatch from dsdt patch<br>usbports.kext<br>cpu pm 800-3800mhz<br>Add smcmotionsensor<br>Fixed BT issue by droping DMAR table<br>change virtualsmc to fakesmc for getting more sensors (Fan &amp; nvidia temp)<br>Add intel &amp; nvidia GPU PM<br>alcplugfix seems not working on 10.14,changed to verstub(combojack) for headset fix<br>smbios&#x3D;mbp15,1<br>New released lilu &amp; whatevergeen etc,No need to hotpatch hdmi audio any more,but still need voodoohda to make hdmi audio work<br>changed to virtualsmc

> **Dump request**<br>I really need a dump of real Macbookpro 14,3’s full acpi dsdt&#x2F;ssdt &amp; IOREG &amp; system report.spx , Any help will be appreciated!

> **Updates on my github:[https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh)**

# 如有疑问请进QQ群 If u need help &gt;&gt; [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](/img/qq.png) | ![image](/img/gzh.jpg) | ![image](/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](/img/zfb.png) | ![image](/img/wx.png) | ![image](/img/zsm.png) |
