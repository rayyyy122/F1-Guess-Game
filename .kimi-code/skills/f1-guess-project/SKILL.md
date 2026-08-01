---
name: f1-guess-project
description: |
  F1 Guess 项目记忆与上下文恢复技能。当用户提到 F1 Guess、f1-guess、F1 车手猜谜、F1 猜车手游戏、联机猜车手等项目相关关键词时触发。用于快速回顾项目架构、技术栈、部署信息、当前进展和待办事项，帮助 Claude 在新会话中迅速进入项目状态。
version: "2.1.0"
author: "taodingrui"
license: MIT
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
---

# F1 Guess 项目记忆与上下文恢复

> 当会话涉及 F1 Guess 项目时使用本 skill，快速恢复项目上下文。

## 触发条件

用户提到以下关键词时触发本 skill：
- `F1 Guess` / `f1-guess` / `f1guess`
- `F1 车手猜谜` / `F1 猜车手`
- `联机猜车手` / `F1 联机`
- 引用项目路径 `/Users/taodingrui/Desktop/F1 Guess`
- 提到域名 `f1-guess.online` / `api.f1-guess.online`

## 使用流程

### Step 1: 阅读项目记忆文件

按优先级依次阅读以下文件恢复上下文：

1. **必读** - `.claude/projects/-Users-taodingrui-Desktop-F1-Guess/MEMORY.md`：项目记忆索引
2. **必读** - `.claude/projects/-Users-taodingrui-Desktop-F1-Guess/memory/deployment.md`：部署配置和流程
3. **按需** - 项目仓库中的需求文档：
   - `f1-guess-requirements.md` (v1.0 单机版)
   - `f1-guess-online-requirements.md` (v2.0 联机版)

### Step 2: 检查最新代码状态

```bash
cd "/Users/taodingrui/Desktop/F1 Guess" && git log --oneline -10 && git status
```

### Step 3: 确认用户意图

询问用户本次会话要做什么（继续之前任务/开始新任务/修复 bug/添加功能）。

## 项目快速概览

**项目**: F1 Guess - F1 车手猜谜游戏（类 Wordle）
**路径**: `/Users/taodingrui/Desktop/F1 Guess`
**仓库**: `git@github.com:rayyyy122/F1-Guess-Game.git`

**部署**:
- 前端: https://f1-guess.online (Cloudflare Pages)
- 后端: https://api.f1-guess.online (Cloudflare Workers)
- 备用: https://f1-guess-game.pages.dev

**技术栈**:
- 前端: Vite + React 19 + TypeScript + Tailwind CSS + React Router + lucide-react
- 后端: Cloudflare Workers + Durable Objects + WebSocket (原生)
- 包管理: pnpm (前端), npm (后端)

**当前版本**: v2.1 (单机 + 联机模式)

## 核心功能

### 单机模式 (v1.0)
- 8 次猜测机会，猜出隐藏的 F1 车手
- 49 位车手数据（22 位现役 + 3 位储备 + 24 位传奇）
- 2026 赛季数据
- 颜色反馈（🟩正确/🟨接近/⬜错误）+ 方向箭头
- 统计系统（localStorage 持久化）

### 联机模式 (v2.0)
- 1v1 实时对战，双方猜测同一目标车手
- 2 分钟倒计时
- 默认昵称系统（F1 风格随机生成，如 SpeedyFerrari42）
- 修改昵称功能（支持随机生成）
- 再来一局邀请机制（双方同意）
- 实时同步对方猜测次数和颜色反馈
- 防作弊（游戏结束前不发送目标车手 ID）

## 项目结构

```
F1 Guess/
├── f1-guess/                      # 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/           # 顶部导航栏
│   │   │   ├── SearchBox/        # 搜索框
│   │   │   ├── GuessTable/       # 猜测结果表格
│   │   │   ├── StatsModal/       # 统计弹窗
│   │   │   ├── HelpModal/        # 规则弹窗
│   │   │   ├── AnswerModal/      # 答案弹窗（单机）
│   │   │   ├── ConfirmModal/     # 确认弹窗
│   │   │   ├── GameStatus.tsx    # 游戏状态横幅
│   │   │   ├── online/           # 联机模式组件
│   │   │   │   ├── LobbyView.tsx      # 联机大厅
│   │   │   │   ├── RoomWaitView.tsx   # 房间等待
│   │   │   │   ├── OnlineGameView.tsx # 联机游戏界面
│   │   │   │   ├── ResultModal.tsx    # 结算弹窗
│   │   │   │   ├── ChangeNameModal.tsx # 修改昵称
│   │   │   │   └── Countdown.tsx      # 倒计时
│   │   ├── hooks/
│   │   │   ├── useGame.ts        # 单机游戏状态
│   │   │   ├── useOnlineGame.ts  # 联机游戏状态
│   │   │   ├── useStats.ts       # 统计数据
│   │   │   └── useWebSocket.ts   # WebSocket 连接
│   │   ├── pages/
│   │   │   ├── HomePage.tsx      # 首页（模式选择）
│   │   │   ├── SoloPage.tsx      # 单机模式
│   │   │   └── OnlinePage.tsx    # 联机模式
│   │   ├── types/index.ts
│   │   ├── utils/
│   │   │   ├── compare.ts        # 猜测对比逻辑
│   │   │   ├── drivers.ts        # 车手数据工具
│   │   │   └── storage.ts        # localStorage 存储
│   │   └── data/drivers.json     # 49位车手数据
│   ├── tailwind.config.js
│   └── package.json
├── server/                        # 后端
│   ├── src/
│   │   ├── index.ts              # Workers 入口
│   │   ├── room.ts               # 房间管理 Durable Object
│   │   ├── types.ts              # 类型定义
│   │   ├── compare.ts            # 猜测对比逻辑
│   │   ├── utils.ts              # 工具函数
│   │   └── drivers.json          # 车手数据
│   ├── wrangler.toml             # Cloudflare 配置
│   └── package.json
├── f1-guess-requirements.md      # 单机需求
├── f1-guess-online-requirements.md # 联机需求
└── README.md
```

## 关键文件说明

### 前端核心文件

| 文件 | 功能 |
|-----|------|
| `f1-guess/src/hooks/useOnlineGame.ts` | 联机游戏状态管理，包含昵称、邀请、房间逻辑 |
| `f1-guess/src/hooks/useWebSocket.ts` | WebSocket 连接管理，支持自动重连 |
| `f1-guess/src/utils/storage.ts` | localStorage 存储（统计、昵称、帮助状态） |
| `f1-guess/src/components/Header/Header.tsx` | 顶部导航栏，支持显示/隐藏新游戏按钮 |

### 后端核心文件

| 文件 | 功能 |
|-----|------|
| `server/src/room.ts` | 房间管理 Durable Object，处理所有房间和游戏逻辑 |
| `server/src/types.ts` | 类型定义（ClientMessage, ServerMessage, RoomState） |
| `server/src/index.ts` | Workers 入口，路由请求到对应的 Durable Object |

## 部署流程

### 前端部署（自动）
```bash
cd "/Users/taodingrui/Desktop/F1 Guess"
git add -A
git commit -m "..."
git push origin main
# Cloudflare Pages 自动部署
```

### 后端部署
```bash
cd server
npx wrangler deploy
```

### 部署配置
- **Worker 名称**: `f1-guess-game-api`
- **Durable Objects**: `ROOMS` → `GameRoom`
- **兼容日期**: `2024-12-30`
- **兼容标志**: `nodejs_compat`
- **迁移**: `new_sqlite_classes = ["GameRoom"]`

## 自动部署策略

完成代码更改后，我会自动执行：
1. 构建前端: `cd f1-guess && pnpm run build`
2. 提交代码: `git add -A && git commit && git push`
3. 部署后端: `cd server && npx wrangler deploy`

前端会自动部署，后端需要手动部署。

## 最近重要更新

### v2.1 (2026-07-31)
- 优化昵称系统：默认 F1 风格昵称，支持修改和随机生成
- 实现再来一局邀请机制：双方同意才能开始新游戏
- 修复多个联机模式 bug（状态残留、自动重连、已退出玩家被拉回）
- 统一单机和联机模式 UI（顶部导航栏对齐）

### v2.0 (2026-07-28)
- 实现联机对战模式
- 前端架构改造（React Router 多页面）
- 后端 Cloudflare Workers + Durable Objects

## 常见问题与解决方案

### 昵称系统
- 默认昵称格式：`形容词 + 车队 + 数字`（如 `SpeedyFerrari42`）
- 存储位置：`localStorage.getItem('f1-guess-player-name')`
- 修改入口：联机大厅右上角编辑按钮

### 房间管理
- 房间号：6 位大写字母（排除易混淆字符 I/O/0/1）
- 超时：创建后 5 分钟无人加入自动销毁
- 断线重连：30 秒窗口期

### 退出逻辑
- 任何一方退出都会关闭整个房间
- 剩余玩家会被通知并强制断开连接
- 防止已退出玩家被拉回新游戏

## 注意事项

- 内网无法访问 `*.workers.dev`，但 `f1-guess.online` 和 `api.f1-guess.online` 可正常访问
- WebSocket 消息处理需检查连接状态（`ws.readyState === WebSocket.OPEN`）
- 离开房间时必须：设置标志 → 发送消息 → 清空 sessions → 关闭连接 → 重置状态
- 新建/加入房间时必须重置 `isLeavingRef` 标志
