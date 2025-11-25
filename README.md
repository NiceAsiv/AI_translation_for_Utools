# AI 智能翻译

一个优雅、现代的 AI 翻译 uTools 插件，采用 Apple 设计风格，支持多种 AI 翻译服务。

![image-20251125171150445](./README.assets/image-20251125171150445.png)

## 特性

- **现代 UI 设计** - 基于 Material-UI 的 Apple 风格界面
- **多 AI 服务支持** - 兼容 OpenAI、Qwen、DeepSeek 等多种 AI 服务
- **智能语言检测** - 自动识别 8+ 种语言，智能切换翻译方向
- **模型切换** - 可在界面上快速切换不同的 AI 模型
- **紧凑设计** - 优化的界面布局，节省屏幕空间

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm run dev
```

开发服务器将在 `http://localhost:5173` 启动。

### 构建

```bash
pnpm run build
```

构建产物将输出到 `dist` 目录。

## 技术栈

- **框架**: React 19
- **UI 库**: Material-UI v7 + Tailwind CSS v3
- **构建工具**: Vite 6
- **图标**: Material Icons + Lucide React
- **字体**: Inter + Noto Sans SC (Google Fonts)

## 使用说明

### 配置 API

使用 `翻译设置` 或 `API设置` 命令打开设置页面，添加你的 AI 服务提供商信息：

- API Key
- Base URL
- 模型名称

点击圆形图标激活对应的提供商。

### 开始翻译

- 选中任意文本后触发划词翻译
- 或使用 `翻译`、`translate`、`fy` 命令
- 输入文本后自动检测语言并翻译

### 语言检测规则

- 中文 → 英文
- 其他语言 → 中文
- 支持：中文、日语、韩语、俄语、法语、德语、西班牙语、英语等

## 支持的 AI 服务

- OpenAI (GPT-3.5, GPT-4 等)
- Qwen (通义千问)
- DeepSeek
- 其他兼容 OpenAI API 格式的服务

## 项目结构

```
├── public/
│   ├── plugin.json          # uTools 插件配置
│   └── preload/
│       └── services.js      # 翻译服务后端逻辑
├── src/
│   ├── Settings/            # 设置页面
│   │   ├── index.jsx
│   │   └── settings.css
│   ├── Translate/           # 翻译页面
│   │   ├── index.jsx
│   │   └── index.css
│   ├── App.jsx              # 主应用组件
│   ├── theme.js             # Material-UI 主题配置
│   ├── main.jsx             # 应用入口
│   └── main.css             # 全局样式
├── index.html
├── vite.config.js
└── package.json
```

## 开源协议

MIT
