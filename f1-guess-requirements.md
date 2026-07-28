# F1 猜车手游戏需求文档

> 本文档基于 `vibe-coding-architect` 和 `dev-expert` 技能方法论生成
> 生成时间: 2026-07-28

---

## 目录

- [1. 项目背景](#1-项目背景)
- [2. 需求澄清](#2-需求澄清)
- [3. 架构选型](#3-架构选型)
- [4. 任务拆解](#4-任务拆解)
- [5. 架构 Prompt](#5-架构-prompt)
- [6. 实施计划](#6-实施计划)
- [7. 数据设计](#7-数据设计)
- [8. UI/UX 设计](#8-uiux-设计)

---

## 1. 项目背景

### 1.1 项目概述

**项目名称**: F1 Guess (暂定)

**项目描述**: 参照 "足一把" (https://zuyiba.pages.dev/) 的玩法，打造一个 F1 车手猜测游戏。玩家通过猜测车手属性来找出隐藏的 F1 车手。

**版本**: v1.0 MVP (简化版)

**核心理念**:
- 快速验证产品价值
- 最小化技术复杂度
- 专注核心游戏体验

---

## 2. 需求澄清

根据 `vibe-coding-architect` Phase 1 的 6 个必答问题：

| # | 必答问题 | 答案 |
|:---|:---|:---|
| 01 | **产品形态** | Web 网站（单页应用 SPA） |
| 02 | **运行环境** | 云端部署（静态托管，如 Vercel/Netlify） |
| 03 | **项目规模** | MVP（最小可行产品） |
| 04 | **数据方案** | 本地 JSON 文件（车手数据）+ localStorage（统计） |
| 05 | **前后端分工** | 纯前端（无后端，纯静态站点） |
| 06 | **扩展预期** | 模块化设计，未来可扩展多人联机、每日挑战 |

---

## 3. 架构选型

根据 `dev-expert` `@web-controller` 和 `@tech-selection` 子技能，提供架构方案对比：

### 3.1 方案对比表

| 维度 | 方案 A: 纯静态 SPA (推荐) | 方案 B: Next.js 全栈 |
|:---|:---|:---|
| **架构模式** | 单页应用 (SPA) | SSR/SSG + API Routes |
| **技术栈** | React + TypeScript + Vite + Tailwind CSS | Next.js + Tailwind CSS + shadcn/ui |
| **开发速度** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **可维护性** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **扩展性** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **部署难度** | 极低（静态托管） | 低（Vercel 一键部署） |
| **学习曲线** | 低 | 中 |
| **适用场景** | 快速原型、小型应用、纯客户端逻辑 | 需要 SEO、后端 API、复杂路由 |

### 3.2 推荐方案

**推荐: 方案 A - 纯静态 SPA**

**理由**:
1. **快速验证**: MVP 阶段优先验证游戏玩法，技术复杂度越低越好
2. **零成本部署**: 静态托管免费，无需服务器
3. **开发效率高**: Vite 构建速度极快，开发体验好
4. **未来迁移**: 如需后端，可平滑迁移到 Next.js
5. **符合现状**: 纯前端即可满足所有需求（无认证、无实时通信、无数据库）

**不选方案 B 的原因**:
- Next.js 框架较重，学习成本高
- 当前无需 SSR/SSG（游戏内容不需要 SEO）
- 无后端 API 需求，API Routes 用不上

---

## 4. 任务拆解

根据 `dev-expert` `@task-execution` 子技能，按功能模块拆分：

```
F1 Guess 项目总目标
├── 模块 1: 项目初始化 (P0)
│   ├── 1.1 初始化项目脚手架 (Vite + React + TypeScript)
│   ├── 1.2 配置 Tailwind CSS
│   └── 1.3 配置项目目录结构
│
├── 模块 2: 数据层 (P0)
│   ├── 2.1 设计车手数据结构
│   ├── 2.2 准备初始车手数据（约 50 位）
│   └── 2.3 实现数据加载逻辑
│
├── 模块 3: 核心游戏逻辑 (P0)
│   ├── 3.1 实现随机选择目标车手
│   ├── 3.2 实现车手搜索/自动补全
│   ├── 3.3 实现猜测对比逻辑
│   └── 3.4 实现颜色反馈系统
│
├── 模块 4: UI 组件 (P0)
│   ├── 4.1 主页面布局
│   ├── 4.2 搜索框组件
│   ├── 4.3 猜测结果表格
│   └── 4.4 游戏状态提示
│
├── 模块 5: 统计系统 (P1)
│   ├── 5.1 设计统计数据结构
│   ├── 5.2 实现统计存储 (localStorage)
│   ├── 5.3 实现统计弹窗
│   └── 5.4 实现统计持久化
│
├── 模块 6: 分享功能 (P1)
│   ├── 6.1 生成游戏结果文案
│   ├── 6.2 实现分享到剪贴板
│   └── 6.3 实现分享到社交媒体
│
└── 模块 7: 部署上线 (P0)
    ├── 7.1 准备部署配置
    ├── 7.2 部署到 Vercel/Netlify
    └── 7.3 验证线上功能
```

**依赖关系**:
- 模块 1 → 模块 2, 3, 4 (必须先初始化)
- 模块 2 → 模块 3 (数据层必须先就绪)
- 模块 3 + 模块 4 → 模块 5, 6 (核心完成后做统计和分享)
- 所有模块 → 模块 7 (最后部署)

---

## 5. 架构 Prompt

根据 `vibe-coding-architect` Phase 4，生成完整的架构 Prompt：

### 5.1 项目背景

我要做一个 F1 车手猜测游戏，类似于 Wordle 和 "足一把"，让玩家通过猜测车手属性来找出隐藏的车手。这是为了验证产品创意，快速迭代。

### 5.2 目标用户

F1 车迷，尤其是喜欢 F1 历史和现役车手的用户。

### 5.3 核心需求

1. **无限模式**: 随机选择车手，无限次猜测
2. **车手数据库**: 存储 F1 历史车手信息（国籍、车队、车号、冠军数等）
3. **颜色反馈**: 绿色（正确）、黄色（接近）、灰色（错误）
4. **搜索功能**: 快速选择车手（自动补全）
5. **统计面板**: 记录玩家游戏数据

### 5.4 架构设定

- **产品形态**: 单页应用 (SPA)
- **架构模式**: 组件化 + 状态管理
- **运行环境**: 浏览器端 + 静态托管

### 5.5 技术约束

| 层级 | 技术选型 | 版本要求 |
|:---|:---|:---|
| **构建工具** | Vite | ^5.x |
| **前端框架** | React | ^18.x |
| **开发语言** | TypeScript | ^5.x |
| **样式方案** | Tailwind CSS | ^3.x |
| **状态管理** | React Hooks + Context API | - |
| **数据存储** | JSON 文件 + localStorage | - |
| **部署平台** | Vercel / Netlify / Pages.dev | - |
| **包管理器** | pnpm (推荐) / npm | - |

### 5.6 非功能需求

| 类别 | 要求 |
|:---|:---|
| **性能** | 首屏加载 < 1s，交互响应 < 100ms |
| **可访问性** | 支持键盘导航，颜色对比度符合 WCAG AA |
| **响应式** | 支持桌面端 (1280px+) 和移动端 (375px+) |
| **兼容性** | 现代浏览器 (Chrome/Edge/Firefox/Safari 最新版) |
| **可维护性** | 代码清晰，注释完整，组件职责单一 |

### 5.7 实施计划

| 阶段 | 目标 | 预计时间 |
|:---|:---|:---|
| **阶段一** | 项目初始化 + 数据层 | 1-2 天 |
| **阶段二** | 核心游戏逻辑 + UI 组件 | 2-3 天 |
| **阶段三** | 统计系统 + 分享功能 | 1-2 天 |
| **阶段四** | 测试 + 部署 + 上线 | 1 天 |

### 5.8 输出要求

1. **代码**: 完整可运行的代码，包含必要的注释
2. **说明**: 每个模块的功能说明和实现思路
3. **测试**: 核心功能的测试用例或手动测试步骤
4. **文档**: 项目结构说明和开发指南

### 5.9 验收标准

- [ ] 功能正常：游戏可以完整游玩，从开始到结束
- [ ] 界面正常：UI 美观，符合 F1 主题
- [ ] 数据持久化：统计数据在刷新后不丢失
- [ ] 可访问：线上可以正常访问
- [ ] 代码清晰：代码结构清晰，易于维护

### 5.10 限制条件

1. **不过度设计**: 不使用复杂的设计模式，保持代码简单
2. **不引入不必要依赖**: 只使用必要的技术栈，不引入多余库
3. **不实现多人联机**: MVP 阶段只做单机模式
4. **不做每日挑战**: 暂不实现每日固定车手功能
5. **不做 UI 主题切换**: 固定使用 F1 主题配色
6. **不使用后端**: 纯前端实现，不涉及服务器端代码

---

## 6. 实施计划

### 6.1 阶段一：项目初始化 + 数据层 (1-2 天)

**目标**: 搭建项目骨架，准备基础数据

**任务清单**:
- [ ] 使用 Vite 初始化 React + TypeScript 项目
- [ ] 安装并配置 Tailwind CSS
- [ ] 创建项目目录结构
- [ ] 设计车手数据结构
- [ ] 准备约 50 位车手的初始数据
- [ ] 实现数据加载和类型定义

**交付物**:
- 可运行的项目骨架
- 完整的车手数据 JSON 文件
- TypeScript 类型定义

### 6.2 阶段二：核心游戏逻辑 + UI 组件 (2-3 天)

**目标**: 实现游戏核心玩法

**任务清单**:
- [ ] 实现游戏状态管理 (React Context)
- [ ] 实现随机选择目标车手
- [ ] 实现车手搜索/自动补全组件
- [ ] 实现猜测对比逻辑
- [ ] 实现颜色反馈系统
- [ ] 实现主页面布局
- [ ] 实现猜测结果表格
- [ ] 实现游戏状态提示（胜利/进行中）

**交付物**:
- 可玩的游戏原型
- 完整的 UI 组件

### 6.3 阶段三：统计系统 + 分享功能 (1-2 天)

**目标**: 增强游戏体验

**任务清单**:
- [ ] 设计统计数据结构
- [ ] 实现 localStorage 存储逻辑
- [ ] 实现统计弹窗 UI
- [ ] 实现统计数据的展示
- [ ] 生成游戏结果文案
- [ ] 实现分享到剪贴板
- [ ] 实现分享到社交媒体（Twitter/X）

**交付物**:
- 完整的统计系统
- 分享功能

### 6.4 阶段四：测试 + 部署 + 上线 (1 天)

**目标**: 上线可用的产品

**任务清单**:
- [ ] 进行全流程测试
- [ ] 修复发现的 Bug
- [ ] 准备 Vercel/Netlify 部署配置
- [ ] 部署到线上
- [ ] 验证线上功能
- [ ] 准备项目文档

**交付物**:
- 线上可访问的游戏
- 项目 README 文档

---

## 7. 数据设计

### 7.1 车手数据结构

```typescript
interface Driver {
  id: string;          // 唯一标识符 (kebab-case)
  name: string;        // 车手姓名
  nameCn?: string;     // 中文名 (可选)
  nationality: string; // 国籍
  team: string;        // 当前/主要车队
  teams: string[];     // 曾效力车队列表
  number: number;      // 车号
  championships: number; // 世界冠军次数
  podiums: number;     // 领奖台次数
  wins: number;        // 分站冠军次数
  debutYear: number;   // 首秀年份
  active: boolean;     // 是否现役
  country: string;     // 国家代码 (用于国旗)
}
```

### 7.2 反馈逻辑表

| 属性 | 🟢 绿色 | 🟡 黄色 | ⚪ 灰色 |
|:---|:---|:---|:---|
| `nationality` | 国籍相同 | - | 不同 |
| `team` | 车队相同 | 曾效力同一车队 | 不同 |
| `number` | 车号相同 | - | 不同 |
| `championships` | 冠军数相同 | 相差±1 | 相差>1 |
| `podiums` | 领奖台数相同 | 差值≤10 | 差值>10 |
| `wins` | 分站冠军数相同 | 差值≤5 | 差值>5 |
| `debutYear` | 首秀年份相同 | 相差±1年 | 相差>1年 |
| `active` | 现役状态相同 | - | 不同 |

### 7.3 统计数据结构

```typescript
interface GameStats {
  totalGames: number;     // 总游戏场次
  wins: number;           // 猜中次数
  currentStreak: number;  // 当前连胜
  maxStreak: number;      // 最大连胜
  averageGuesses: number; // 平均猜测次数
  bestGame: number;       // 最佳成绩（最少猜测次数）
}
```

### 7.4 初始数据样本

以下为建议的首批车手（约 50 位）：

**现役车手** (约 20 位):
- Lewis Hamilton (Mercedes)
- Max Verstappen (Red Bull Racing)
- Charles Leclerc (Ferrari)
- Lando Norris (McLaren)
- George Russell (Mercedes)
- Fernando Alonso (Aston Martin)
- Carlos Sainz (Ferrari)
- Daniel Ricciardo (RB)
- Oscar Piastri (McLaren)
- Esteban Ocon (Alpine)
- Pierre Gasly (Alpine)
- Alexander Albon (Williams)
- Yuki Tsunoda (RB)
- Kevin Magnussen (Haas)
- Nico Hülkenberg (Haas)
- Zhou Guanyu (Sauber)
- Valtteri Bottas (Sauber)
- Sergio Pérez (Red Bull Racing)
- Lance Stroll (Aston Martin)
- Logan Sargeant (Williams)

**传奇车手** (约 30 位):
- Michael Schumacher
- Sebastian Vettel
- Kimi Räikkönen
- Ayrton Senna
- Alain Prost
- Niki Lauda
- Juan Manuel Fangio
- Jim Clark
- Jackie Stewart
- Nelson Piquet
- Nigel Mansell
- Damon Hill
- Mika Häkkinen
- Ayrton Senna
- Alain Prost
- Niki Lauda
- Juan Manuel Fangio
- Jim Clark
- Jackie Stewart
- Nelson Piquet
- Nigel Mansell
- Damon Hill
- Mika Häkkinen
- Jenson Button
- Jacques Villeneuve
- Mario Andretti
- Emerson Fittipaldi
- Graham Hill
- James Hunt
- Gilles Villeneuve

---

## 8. UI/UX 设计

### 8.1 设计主题

**F1 主题配色**:
- 主色: `#E10600` (F1 官方红)
- 辅助色: `#15151E` (深色背景)
- 强调色: `#38D1A8` (绿色 - 正确)
- 警告色: `#FAB500` (黄色 - 接近)
- 中性色: `#38383F` (灰色 - 错误)
- 文字色: `#F1F1F1` (浅色文字)

### 8.2 页面布局

```
┌─────────────────────────────────────────────────────┐
│  [Logo] F1 GUESS                    [统计] [?]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              猜出今天的 F1 车手！                   │
│                                                     │
│         ┌─────────────────────────────────┐        │
│         │ 🔍 搜索车手...                   │        │
│         └─────────────────────────────────┘        │
│         [ 自动补全下拉列表 ]                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│  姓名      国籍  车队  车号  冠军  领奖台  首秀    │
│  ──────────────────────────────────────────────────│
│  🟢 Hamilton 🟢英国 🟢Merc 🟢44 🟢7   🟢197 🟢2007 │
│  ⚪ Vettel   ⚪德国 🟡Ferrari ⚪5 ⚡4 ⟡180 ⚡2010   │
│  🟡 Verstappen🟢荷兰 ⚪RedBull ⚪1 ⚢3 ⚢80 ⚡2016   │
│  ...                                                 │
├─────────────────────────────────────────────────────┤
│  [🎮 新游戏]  [📊 查看统计]  [📤 分享结果]         │
└─────────────────────────────────────────────────────┘
```

### 8.3 组件规范

| 组件 | 说明 | 优先级 |
|:---|:---|:---|
| **Header** | 顶部导航栏，包含 Logo 和帮助按钮 | P0 |
| **SearchBox** | 搜索框，支持自动补全 | P0 |
| **GuessTable** | 猜测结果表格 | P0 |
| **GameStatus** | 游戏状态提示（胜利/进行中） | P0 |
| **StatsModal** | 统计数据弹窗 | P1 |
| **ShareButton** | 分享按钮 | P1 |
| **HelpModal** | 帮助说明弹窗 | P1 |

### 8.4 响应式断点

| 断点 | 设备 | 最小宽度 |
|:---|:---|:---|
| **mobile** | 手机 | 375px |
| **tablet** | 平板 | 768px |
| **desktop** | 桌面 | 1024px |
| **wide** | 宽屏 | 1280px |

### 8.5 交互设计

| 交互 | 行为 |
|:---|:---|
| **搜索** | 输入时显示匹配的车手列表，点击或回车选择 |
| **提交猜测** | 选择车手后自动提交 |
| **颜色反馈** | 提交后立即显示颜色编码的对比结果 |
| **胜利** | 猜中后显示祝贺弹窗和分享按钮 |
| **新游戏** | 点击按钮重置游戏，随机选择新车手 |
| **查看统计** | 点击按钮弹出统计数据面板 |

---

## 9. 附录

### 9.1 技术栈详情

**核心依赖**:
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.5.4"
}
```

**开发依赖**:
```json
{
  "vite": "^5.4.0",
  "tailwindcss": "^3.4.9",
  "@types/react": "^18.3.3",
  "@types/react-dom": "^18.3.0"
}
```

### 9.2 项目目录结构

```
f1-guess/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/          # UI 组件
│   │   ├── Header/
│   │   ├── SearchBox/
│   │   ├── GuessTable/
│   │   ├── StatsModal/
│   │   └── ShareButton/
│   ├── data/               # 数据文件
│   │   └── drivers.json
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useGame.ts
│   │   └── useStats.ts
│   ├── types/              # TypeScript 类型
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── compare.ts
│   │   └── storage.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

### 9.3 参考资料

- "足一把" 游戏: https://zuyiba.pages.dev/
- Vite 官方文档: https://vitejs.dev/
- React 官方文档: https://react.dev/
- Tailwind CSS 官方文档: https://tailwindcss.com/
- F1 官方数据: https://www.formula1.com/en/results.html

---

## 变更记录

| 版本 | 日期 | 变更内容 | 作者 |
|:---|:---|:---|:---|
| v1.0 | 2026-07-28 | 初始版本，基于 vibe-coding-architect 和 dev-expert 生成 | Claude |

---

**文档结束**
