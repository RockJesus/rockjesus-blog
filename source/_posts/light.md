---
title: 'macOS 下修改外星人键盘背光：AlienMAC 原生灯控（17 R4）'
description: '不需要 kext、不关 SIP、也不进 Win 虚拟机，在菜单栏用原生 macOS 工具 AlienMAC 直接控制 17 R4 键盘四区与整机 13 个灯区。'
date: 2019-01-11 13:48:26
updated: 2026-11-27 02:34:18
cover: /img/mac-poster.webp
cover_video: /img/mac.mp4
---

> 以前键盘背光只能进 Win 用 AWCC 改，Mac 下一直没有对应软件。现在有了原生 macOS 工具 **AlienMAC**：纯用户态走 IOKit HID 通信，不需要装 kext、不用关闭 SIP、也不用再开 Win 虚拟机，在菜单栏直接控制 17 R4 的键盘四区和整机灯效。
>
> 仓库：[https://github.com/RockJesus/AlienMAC](https://github.com/RockJesus/AlienMAC)

![AlienMAC 主界面](/img/alienmac-hero.jpg)

## 适用机型与协议

按 USB 产品名和 HID 输出报文长度自动识别机型与 AlienFX 协议，不看 PID 硬编码。当前直接驱动 **APIv3** 机型，其他世代会被正确识别并给出明确提示。

| 协议 | 报文 | 覆盖机型 | 本 App |
|------|------|----------|--------|
| APIv2 | 9 字节 / 4-bit 色 | 13 R2、15 R2、M11x 等 | 识别，暂不控制 |
| APIv3 | 12 字节 / 8-bit 色 | 17 R4、17 R5、15 R3/R4 等 | **可控制** |
| APIv4 | 34 字节（AW-ELC） | m15/m17、x15/x17、Area-51m、Aurora R10+、G5/G7 | 识别，暂不控制 |
| APIv5 | 64 字节 Feature | 逐键 RGB 键盘机型 | 识别，暂不控制 |

17 R4 实测硬件参数：

| 项目 | 值 |
|------|-----|
| 设备 | Alienware 17 R4 (2016) |
| 控制器 | AlienFX USB HID |
| VID / PID | `0x187C` / `0x0530` |
| 协议 | APIv3（12 字节 HID Report） |
| Report ID | `0x02` |
| 颜色深度 | 8-bit per channel |
| 灯区 | 13 个灯区（顶盖头像、屏幕 Logo、电源按钮、宏键、键盘四区、触摸板、左右侧灯带、屏下左右灯条） |

## 安装

### DMG（推荐）

下载 [Releases](https://github.com/RockJesus/AlienMAC/releases) 里的 `AlienMAC-x.y.z.dmg`，拖进「应用程序」即可。首次打开若被 Gatekeeper 拦截，右键 → 打开，或在终端解除隔离：

```bash
xattr -dr com.apple.quarantine /Applications/AlienMAC.app
```

### 从源码编译

```bash
brew install xcodegen
git clone https://github.com/RockJesus/AlienMAC.git
cd AlienMAC
./build.sh          # 编译 Release
./create_dmg.sh     # 编译并打包 DMG
```

产物在 `build/Build/Products/Release/AlienMAC.app`。签名用 Ad-hoc（Sign to Run Locally），无需 Apple 开发者账号。请把 `AlienMAC.app` 放进 `/Applications`：登录自启只在已签名、且位于应用程序目录时才会登记系统登录项；从 `build/` 目录直接运行未签名产物时，会退回 LaunchAgent 方式。

## 黑苹果前置检查

AlienFX 控制器挂在主板内部 USB 总线上，黑苹果需要先确认端口已正确驱动：

```bash
system_profiler SPUSBDataType | grep -A 5 -i alien
ioreg -p IOUSB -l | grep -i 187c
```

看不到设备时，用 [USBMap](https://github.com/corpnewt/USBMap) 或 [USBToolBox](https://github.com/USBToolBox/tool) 重新定制 USB 端口，确保 AlienFX 所在的内部 USB 2.0 端口（通常是 HSxx）已启用。

## 怎么改键盘背光

1. 打开 AlienMAC，菜单栏出现常驻图标。
2. 在 3D 机身模型上点键盘区域（左 / 中 / 右 / 小键盘四区），也可以点底部 13 个灯区胶囊多选；不选用任何灯区时，调色作用于全部灯区。
3. 选主颜色，再选效果：常亮、脉冲、渐变、呼吸，外加光谱、光波、扫描三种逐帧灯效，速度与亮度可调；渐变、呼吸会出现次色与速度。改动即时下发并自动保存，不用再点应用。
4. 键盘硬件只有**四区背光**：单键逐键上色只在本机预览，真正下发时取该键所在分区的主色；想让硬件接近预览效果，就把同区的键刷成同一种颜色。
5. 全局快捷键：`⌥⌘L` 开关灯，`⌥⌘↑` / `⌥⌘↓` 亮度 +10% / −10%，任何界面都能用，不需要辅助功能权限。
6. 调好的配色 + 效果 + 范围可存成自定义预设，一键切换，重启不丢；内置 **23 套现成主题**（10 套常用配色 + 13 套 AWCC 官方预置）。

整机 13 个灯区：顶盖头像、屏幕 Logo、电源按钮、宏键、键盘四区、触摸板（整面背光与四边光可分开细调）、左右侧灯带、屏下左右灯条，都在同一个面板里控制。

![预设主题](/img/alienmac-presets.jpg)

![拆解视图](/img/alienmac-exploded.jpg)

### 其他能力

- **拆解视图**：把屏幕盖、键盘四区、宏键、触摸板、电源键、前后灯带分层抬起，看清每个发光部件的装配位置。
- **手机网页控制**：同一 Wi-Fi 下扫码打开网页，机身建模与 app 实时同步，不用另装 App。
- **定时任务**：按时间 + 星期自动执行开关灯。
- **接入 Home Assistant**：MQTT Discovery 自动生成带 RGB / 亮度 / 灯效的灯实体，双向同步；也支持语音口令与 Siri 快捷指令。

## 常见问题

- **未检测到控制器** — 先做上面的 USB 检查，点「重新扫描」，确认系统报告里存在 VID `0x187C` 的设备。
- **连上了但灯没反应** — 点「重置控制器」，再看调试日志里是否有 TX 行。APIv3 控制器短时间接收过多请求会假死，完全断电（关机拔电源 10 秒）可恢复。
- **某个灯区控制了错误的灯** — 用逐灯测试记录实际 bit，再调整灯区的位定义。
- **登录自启点不动 / 打开后自动弹回** — 确认 app 已放进 `/Applications` 且为签名构建；仍失败时设置页会显示原因，可点「打开登录项设置」手动添加。
- **MQTT 一直连不上** — 应用会给出具体原因（端口拒绝、认证失败等）并在 6 秒后重试；先确认 broker 端口对外开放、账号密码正确。

## 备选：旧的虚拟机方式

在没有原生工具之前，只能借助虚拟机里的官方 AWCC 改灯，外接键盘鼠标同理可试：

1. 下载 Parallels Desktop 安装，支持 BootCamp，无需再单独装 Win，直接开启硬盘上的 Win 虚拟机。
2. 进入 Win 虚拟机后，点右上角 USB，挂载 `aw1517` 键盘 LED 设备到虚拟机里（这里查找你的键盘 LED 灯设备，我的是 aw1517）。![QQ20180405-0.png](/img/11.jpg)
3. 打开 AWCC 等修改软件即可开始调整背景灯。![QQ20180405-1.png](/img/12.jpg)

# 如有疑问请进QQ群 If u need help >> [https://gitter.im/Alienware-hackintosh/community](https://gitter.im/Alienware-hackintosh/community)

| 外星人黑苹果QQ群：308469644 | 外星人黑苹果微信公众号 | 外星人黑苹果微信小程序 |
| --- | --- | --- |
| ![image](/img/qq.png) | ![image](/img/gzh.jpg) | ![image](/img/xcx.jpg) |

# 如果文章对你有帮助，欢迎打赏作者. If u like, Buy me a coffee  :)

| 支付宝打赏 | 微信打赏 | 微信赞赏 |
| --- | --- | --- |
| ![image](/img/zfb.png) | ![image](/img/wx.png) | ![image](/img/zsm.png) |
