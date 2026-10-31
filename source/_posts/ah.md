---
title: '外星人黑苹果clover/opencore收集 alienware hackintosh clover/opencore collection'
description: 'Alienware 全系黑苹果的 Clover / OpenCore 引导与驱动合集，按机型整理 EFI 下载与更新记录。'
date: 2021-10-07 13:48:25
updated: 2022-11-03 18:55:54
cover: /img/header_ah.webp
sticky: true
---

Alienware 全系黑苹果的 Clover / OpenCore 引导与驱动合集。收集网友分享的各机型 EFI，欢迎 push 你自己的配置 —— Collection of Alienware hackintosh EFI shared by the community; PRs are welcome.

[![GitHub Stars](https://img.shields.io/github/stars/RockJesus?style=for-the-badge&logo=github&labelColor=1b1f3b&color=8b5cf6)](https://github.com/RockJesus) [![GitHub Followers](https://img.shields.io/github/followers/RockJesus?style=for-the-badge&logo=github&labelColor=1b1f3b&color=0ea5e9)](https://github.com/RockJesus) [![Alienware-Hackintosh Downloads](https://img.shields.io/github/downloads/RockJesus/Alienware-Hackintosh/total?style=for-the-badge&logo=apple&labelColor=1b1f3b&color=22c55e)](https://github.com/RockJesus/Alienware-Hackintosh)

[![Hardware](https://img.shields.io/badge/Hardware-alienware-silver.svg)](https://alienware.com/)[![Platform](https://img.shields.io/badge/platform-macOS-red.svg)](https://developer.apple.com/macos)[![Platform](https://img.shields.io/badge/platform-windows-blue.svg)](https://www.microsoft.com/en-us/windows/)[![zfb](https://img.shields.io/badge/%E6%89%93%E8%B5%8F-%E6%94%AF%E4%BB%98%E5%AE%9D-blue.svg)](https://gitee.com/rockjesus/rockjesus/raw/master/img/zfb.png)[![wx](https://img.shields.io/badge/%E6%89%93%E8%B5%8F-%E5%BE%AE%E4%BF%A1-green.svg)](https://gitee.com/rockjesus/rockjesus/raw/master/img/wx.png)[![zsm](https://img.shields.io/badge/%E6%89%93%E8%B5%8F-%E8%B5%9E%E8%B5%8F%E7%A0%81-yellow.svg)](https://gitee.com/rockjesus/rockjesus/raw/master/img/zsm.png)

# 资源与链接 / Resources

- **EFI 合集（主仓库）**：[github.com/RockJesus/Alienware-Hackintosh](https://github.com/RockJesus/Alienware-Hackintosh)
- **17 R4 长期维护机型**：[Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh)
- **更多台式机型**：[DELL-Alienware-Aurora-R7-macOS](https://github.com/jianghaizhi/DELL-Alienware-Aurora-R7-macOS)
- **安装指南**：[中文版](https://github.com/RockJesus/Alienware-17-R4-I7-7700HQ-MacOS-High-Sierra/blob/master/README.md) ｜ [English](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-Mojave-10.14-Hackintosh/blob/master/README.md)
- **分项指南**：[低音炮 subwoofer](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/alc.md) ｜ [HDMI 音频](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/hdmi.md) ｜ [灯效 LED](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/light.md) ｜ [鼠标主题](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/mouse.md) ｜ [Clover 主题](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/theme.md) ｜ [雷电 Thunderbolt](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/tb.md) ｜ [常见问题 Q&A](https://github.com/RockJesus/Alienware-17-R4-Dual-GPU-MacOS-10.15-14-13-Hackintosh/blob/master/guide/qa.md)
- **讨论区**：[远景论坛帖](https://bbs.pcbeta.com/viewthread-1833933-1-1.html) ｜ [tonymacx86 帖](https://www.tonymacx86.com/threads/guide-alienware-17-r4-dual-gpu-macos-mojave-10-14-hackintosh.288728/) ｜ [Gitter 群](https://gitter.im/Alienware-hackintosh/community)
- **新手教程**：黑果小兵 [blog.daliansky.net](https://blog.daliansky.net/)（安装流程看这里最快）
- **本站**：[rockjesus.cn](https://rockjesus.cn/)
- **其他品牌机型**：[daliansky/Hackintosh](https://github.com/daliansky/Hackintosh) ｜ [zhih.me/hackintosh](https://zhih.me/hackintosh/#/)
- **常用站点**：[远景论坛](https://bbs.pcbeta.com/) ｜ [InsanelyMac](https://www.insanelymac.com/) ｜ [tonymacx86](https://www.tonymacx86.com/) ｜ [Lilu](https://github.com/acidanthera/Lilu) ｜ [RehabMan](https://bitbucket.org/RehabMan/)

# 驱动情况与支持 / Compatibility & Support

**显卡**：先在 Windows 下打开「设备管理器 → 监视器 → 通用即插即用监视器 → 常规 → 位置」，确认显示器接的是双显还是只有独显，不同情况结论完全不同。

1. **可切换显卡机型**（双显，FN+F7 切模式）：10.13.6 下装 WebDriver 可驱动双显卡，支持三种模式 —— 单核显（需 SSDT 屏蔽独显省电）、单独显（需 Windows 下切换，支持外接显示器）、双显卡（支持外接显示器）。10.14 / 10.15 起只能用核显。
2. **不可切换显卡机型**（只有 N 卡输出，GSYNC 版本默认屏蔽核显）：配合 WebDriver 最高只能装到 10.13.6，10.14 / 10.15 显卡无解。
3. **N 卡支持范围**：只支持 10x0 系列及以下，16x0 / 20x0 系列无解。

**网卡**：Killer 有线网卡与蓝牙可驱动，无线网卡无解，建议换内置无线网卡 DW1560 —— DW1820 问题多，DW1830 尺寸偏大装不进去。Intel 有线网卡与蓝牙可驱动，无线同样暂时无解。

有补充的可以 @我；需要人工协助请进 QQ 群 **308469644**，或到 [Gitter 群](https://gitter.im/Alienware-hackintosh/community) 提问。

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](/img/qq.png) | ![image](/img/gzh.jpg) | ![image](/img/xcx.jpg) |

如果文章对你有帮助，欢迎打赏作者 —— If u like, buy me a coffee :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](/img/zfb.png) | ![image](/img/wx.png) | ![image](/img/zsm.png) |
