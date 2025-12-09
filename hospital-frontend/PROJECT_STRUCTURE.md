# React + Vite + TypeScript 前端项目结构说明

本文档详细说明了使用 Vite 创建的 React + TypeScript 项目的目录结构和每个文件的作用，帮助您快速了解和使用前端项目。

## 项目根目录结构

```
hospital-frontend/
├── .gitignore            # Git 忽略文件配置
├── README.md             # 项目说明文档
├── eslint.config.js      # ESLint 配置文件
├── index.html            # HTML 入口文件
├── package-lock.json     # npm 依赖锁定文件
├── package.json          # 项目配置和依赖管理
├── public/               # 静态资源目录
├── src/                  # 源代码目录
├── tsconfig.app.json     # TypeScript 应用配置
├── tsconfig.json         # TypeScript 主配置
├── tsconfig.node.json    # TypeScript Node 环境配置
└── vite.config.ts        # Vite 构建工具配置
```

## 核心目录说明

### 1. public/ 目录

静态资源目录，存放不会被编译处理的文件，如图片、字体、图标等。这些文件会直接复制到构建输出目录。

```
public/
└── vite.svg            # Vite 默认图标
```

- **使用场景**：存放网站 Logo、favicon.ico、第三方库的 CDN 文件等
- **访问方式**：在代码中可以直接通过 `/vite.svg` 访问

### 2. src/ 目录

项目的核心源代码目录，包含所有 React 组件、样式、工具函数等。

```
src/
├── App.css              # App 组件样式
├── App.tsx              # 根组件
├── assets/              # 资源文件目录
├── index.css            # 全局样式
└── main.tsx             # 应用入口文件
```

#### 2.1 App.tsx

根组件，是整个 React 应用的起点。所有其他组件都会嵌套在这个组件中。

```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // 组件逻辑
  return (
    <div className="App">
      {/* 组件内容 */}
    </div>
  )
}

export default App
```

#### 2.2 main.tsx

应用入口文件，负责将 React 应用渲染到 HTML 页面中的根元素。

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### 2.3 assets/ 目录

存放项目所需的资源文件，如图像、图标、字体等。这些文件会被 Vite 编译处理。

```
assets/
└── react.svg            # React 图标
```

#### 2.4 样式文件

- **App.css**：App 组件的样式
- **index.css**：全局样式，应用于整个项目

## 配置文件说明

### 1. package.json

项目配置和依赖管理文件，包含项目信息、脚本命令、依赖包等。

```json
{
  "name": "hospital-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",         // 启动开发服务器
    "build": "tsc -b && vite build",  // 构建生产版本
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",  // 代码检查
    "preview": "vite preview"  // 预览生产构建
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    // 开发依赖
  }
}
```

### 2. vite.config.ts

Vite 构建工具的配置文件，可以自定义构建流程、服务器配置、插件等。

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

### 3. tsconfig.json

TypeScript 主配置文件，定义了 TypeScript 编译器的选项。

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

### 4. tsconfig.app.json

TypeScript 应用配置，专门用于配置应用代码的编译选项。

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

### 5. eslint.config.js

ESLint 配置文件，用于代码质量检查和风格规范。

```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  { 
    // 配置内容
  }
)
```

## 前端项目扩展建议

随着项目的发展，您可能需要添加更多的目录和文件来组织代码。以下是一些常见的扩展建议：

### 1. 组件目录 (components/)

创建 `src/components/` 目录，用于存放可复用的 React 组件。

```
src/components/
├── Button/           # 按钮组件
├── Card/             # 卡片组件
├── Header/           # 头部组件
└── Modal/            # 弹窗组件
```

### 2. 页面目录 (pages/)

创建 `src/pages/` 目录，用于存放不同的页面组件。

```
src/pages/
├── Home/             # 首页
├── Login/            # 登录页
├── Dashboard/        # 仪表盘
└── Patients/         # 患者管理页
```

### 3. 路由配置 (router/)

创建 `src/router/` 目录，用于配置页面路由。

```
src/router/
└── index.tsx         # 路由配置文件
```

### 4. 状态管理 (store/)

创建 `src/store/` 目录，用于管理应用状态（如使用 Redux、MobX 或 Context API）。

```
src/store/
├── slices/           # Redux Toolkit slices
└── index.ts          # 状态管理配置
```

### 5. API 请求 (api/)

创建 `src/api/` 目录，用于封装与后端的 API 交互。

```
src/api/
├── axios.ts          # Axios 配置
├── patient.ts        # 患者相关 API
└── user.ts           # 用户相关 API
```

### 6. 工具函数 (utils/)

创建 `src/utils/` 目录，用于存放通用工具函数。

```
src/utils/
├── format.ts         # 格式化工具
├── validation.ts     # 验证工具
└── storage.ts        # 本地存储工具
```

### 7. 类型定义 (types/)

创建 `src/types/` 目录，用于存放 TypeScript 类型定义。

```
src/types/
├── patient.ts        # 患者类型
├── user.ts           # 用户类型
└── index.ts          # 类型导出
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:5173/` 查看应用。

### 3. 构建生产版本

```bash
npm run build
```

构建后的文件将输出到 `dist/` 目录。

### 4. 预览生产构建

```bash
npm run preview
```

## 总结

React + Vite + TypeScript 项目结构清晰，便于维护和扩展。随着项目的发展，您可以根据需要添加更多的目录和文件来组织代码。建议遵循模块化、组件化的开发原则，提高代码的可复用性和可维护性。

如果您对前端开发不熟悉，可以先从修改 `App.tsx` 和 `App.css` 开始，逐步学习 React 和 TypeScript 的基础知识。