# 第三方资源许可

本项目以 MIT 许可证发布，但包含以下第三方资源，它们分别遵循各自的许可。

## Fusion Pixel Font

- 文件：`desktop/vendor/fusion-pixel.woff2`
- 版权：Copyright (c) 2022, TakWolf (https://takwolf.com), with Reserved Font Name 'Fusion Pixel'
- 许可：SIL Open Font License 1.1
- 完整许可见 `desktop/vendor/FUSION-PIXEL-OFL.txt`，其中同时包含该字体所基于的其他字体许可

字体在构建时以 base64 内嵌进 `client.js`，仓库与分发产物中均保留上述许可文件。

## React / React DOM

- 文件：`desktop/vendor/react.production.min.js`、`desktop/vendor/react-dom.production.min.js`
- 版权：Copyright (c) Facebook, Inc. and its affiliates
- 许可：MIT
- 完整许可见 `desktop/vendor/REACT-LICENSE.txt`

仅用于桌面 helper 页面。

## 背景氛围音

- 文件：`assets/ambience-rain.m4a`、`assets/ambience-night.m4a`、`assets/ambience-indoor.m4a`、`assets/ambience-evening.m4a`
- 来源：用户提供的 ASMR 混音（雨声溪流 / 雨夜白噪 / 室内雨声 / 夜晚环境），统一裁剪为 120 秒并加 10ms 淡入淡出，经 afconvert 转为 64 kbps 单声道 AAC
- 许可：随项目一同使用，发布前请自行确认原始音频的授权范围

音频在构建时以 base64 内嵌进 `client.js`，运行时解码为 AudioBuffer 循环播放。

