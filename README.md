# Pixel Clock

<img src="./icon.svg" width="96" alt="Pixel Clock" />

[![CI](https://github.com/aa0330/Pixel-Clock/actions/workflows/ci.yml/badge.svg)](https://github.com/aa0330/Pixel-Clock/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/aa0330/Pixel-Clock?label=release)](https://github.com/aa0330/Pixel-Clock/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

一个运行在 DeepSeek Harness（DSH）里的悬浮像素星球番茄钟。默认以真实置顶窗口停留在桌面上，也可以在设置里切回应用内模式；球体大小可调，右键打开设置，支持专注 / 休息计时、待办与提醒。

## 功能

- 像素风格星球：四套主题（绿屿、冰世界、极光、赤秋），片元着色器实时渲染
- 专注 / 休息循环与今日完成轮次
- 背景音乐：内置四段 ASMR 氛围音（雨声溪流 / 雨夜白噪 / 室内雨声 / 夜晚环境），专注阶段无缝循环、休息自动停止，可切换、音量可调
- 音量保护：读取 macOS 系统输出音量，系统音量 >70% 时应用音量上限压到 70%，>85% 时压到 55%
- 滑块预设点：大小（80/100/124/148/180px）与音量（0/25/50/75/100%）下方的圆点可直接点选
- 三栏弹窗：时钟、待办、提醒
- 应用内 / 桌面两种形态；桌面形态由独立 Electron helper 承载，透明置顶
- 单击加速自转、按住拖动位置、右键设置、键盘快捷键

## 环境要求

- DeepSeek Harness 桌面版
- 桌面模式需要 Electron 运行时：默认在 `$DSH_HOME/electron/` 下查找（macOS 为 `Electron.app/Contents/MacOS/Electron`，Linux 为 `electron`，Windows 为 `electron.exe`），也可以用 `PIXEL_CLOCK_ELECTRON` 指定
- 找不到 Electron 时插件仍可在 DSH 窗口内使用

## 安装

1. 将本仓库放到 DSH 工作区的 `.dsh-plugins/pixel-clock` 目录
2. 重启 DSH 或重新加载工作区，插件会通过 `cordis.patch.yml` 注入
3. 在设置里选择「应用内」或「桌面」模式

> 包名保持 `@local/pixel-clock`，`@local/` 是 DSH 本地插件的命名空间。若要发布到 npm，需要把 `package.json`、`cordis.patch.yml`、`template.js` 和 `client.js` 中的名称一起修改并重新构建。

## 使用

- 单击星球：加速自转
- 右键星球：打开设置
- 按住拖动：移动位置
- 星球两侧箭头 / `←` `→`：切换氛围音轨
- `空格`：开始 / 暂停
- `R`：重置
- `S`：跳过当前阶段

## 配置

| 环境变量 | 默认值 | 说明 |
| --- | --- | --- |
| `DSH_HOME` | `~/.dsh` | 数据目录与 Electron 运行时目录 |
| `PIXEL_CLOCK_PORT` | `17890` | 本地桥接端口 |
| `PIXEL_CLOCK_ELECTRON` | 空 | 自定义 Electron 可执行文件路径 |
| `PIXEL_CLOCK_DEBUG` | 空 | 设为 `1` 时开启 9223 调试端口 |

## 开发

```bash
npm install
npm run build   # template.js + src/planetShaders.ts + 像素字体 -> client.js
npm test        # 渲染冒烟测试
```

`client.js` 是构建产物，需要提交到仓库，DSH 会直接加载它。修改 `template.js` 或 `src/planetShaders.ts` 后必须重新运行 `npm run build`，CI 会检查产物是否与源码同步。不要直接手改 `client.js`。

### 目录结构

| 路径 | 说明 |
| --- | --- |
| `index.js` | Host 半区：管理桌面 helper 进程 |
| `client.js` | 构建产物，DSH Web UI 与桌面 helper 共用 |
| `template.js` | 客户端 bundle 源码 |
| `src/planetShaders.ts` | 像素星球的 GLSL 顶点/片元着色器 |
| `desktop/` | Electron 桌面 helper（主进程、预加载、页面、字体与 React 运行时） |
| `locale/` | 中文 / 英文文案 |
| `cordis.patch.yml` | DSH bundle 注入配置 |
| `build.mjs` | 把着色器和内嵌字体打进 `client.js` |
| `smoke-test.cjs` | 在模拟客户端环境下的渲染冒烟测试 |

## 安全与隐私

- 桌面 helper 是独立的 Electron 进程，只在 `127.0.0.1:17890` 提供本地 HTTP 桥，没有鉴权，请勿将端口暴露到局域网或公网
- 计时状态、日志与窗口位置保存在 `$DSH_HOME/pixel-clock`
- `PIXEL_CLOCK_DEBUG=1` 会打开 Chromium 远程调试端口，仅用于本地开发
- 插件不收集、不上传任何数据

## 路线图

- 自定义着色器主题：主题以独立文件分发，用户可拖入设置面板热加载
- 星球生长：从荒芜的灰色星球逐步长成目标星球，专注进度驱动地貌演化
- 完成星球的收藏与回看

## 贡献

欢迎 issue 和 PR。提交前请运行 `npm run build && npm test`，并确保构建产物与源码一致。

## 许可证

[MIT](./LICENSE)。第三方资源许可见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
