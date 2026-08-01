# F1 Guess 技术架构

## 项目结构

```
/Users/taodingrui/Desktop/F1 Guess/
├── f1-guess/                      # 前端 (React SPA)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/            # 顶部导航 (单机模式)
│   │   │   ├── SearchBox/         # 搜索框 (自动补全)
│   │   │   ├── GuessTable/        # 猜测结果表格
│   │   │   ├── StatsModal/        # 统计弹窗
│   │   │   ├── HelpModal/         # 规则弹窗
│   │   │   ├── ConfirmModal/      # 通用确认弹窗
│   │   │   ├── AnswerModal/       # 答案展示弹窗
│   │   │   ├── online/            # 联机模式组件
│   │   │   │   ├── LobbyView.tsx       # 联机大厅
│   │   │   │   ├── RoomWaitView.tsx    # 房间等待
│   │   │   │   ├── OnlineGameView.tsx  # 联机游戏
│   │   │   │   ├── Countdown.tsx       # 倒计时
│   │   │   │   └── ResultModal.tsx     # 结算弹窗
│   │   │   └── GameStatus.tsx     # 胜利/失败横幅
│   │   ├── data/
│   │   │   └── drivers.json       # 车手数据 (109 位)
│   │   ├── hooks/
│   │   │   ├── useGame.ts         # 单机游戏状态
│   │   │   ├── useStats.ts        # 统计数据
│   │   │   ├── useOnlineGame.ts   # 联机游戏状态
│   │   │   └── useWebSocket.ts    # WebSocket 连接
│   │   ├── pages/
│   │   │   ├── HomePage.tsx       # 模式选择首页
│   │   │   ├── SoloPage.tsx       # 单机模式
│   │   │   └── OnlinePage.tsx     # 联机模式
│   │   ├── types/
│   │   │   └── index.ts           # TypeScript 类型定义
│   │   ├── utils/
│   │   │   ├── drivers.ts         # 车手数据工具
│   │   │   ├── compare.ts         # 猜测对比逻辑
│   │   │   └── storage.ts         # localStorage
│   │   ├── App.tsx                # 路由入口
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── netlify.toml               # Netlify 部署配置 (备用)
│   └── vercel.json                # Vercel 部署配置 (备用)
├── server/                        # 后端 (Cloudflare Workers)
│   ├── src/
│   │   ├── index.ts               # Workers 入口, 路由
│   │   ├── room.ts                # GameRoom Durable Object
│   │   ├── compare.ts             # 猜测对比逻辑 (与前端同步)
│   │   ├── types.ts               # 类型定义
│   │   ├── utils.ts               # 工具函数
│   │   └── drivers.json           # 车手数据 (与前端共享)
│   ├── package.json
│   ├── tsconfig.json
│   └── wrangler.toml              # Cloudflare Workers 配置
├── f1-guess-requirements.md       # v1.0 单机版需求
├── f1-guess-online-requirements.md # v2.0 联机版需求
└── README.md                      # 项目总览
```

## 前端技术栈

| 类别 | 技术 | 版本 | 用途 |
|:---|:---|:---|:---|
| 构建工具 | Vite | 8.x | 开发/构建 |
| 框架 | React | 19.x | UI |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 3.x | 样式 |
| 路由 | React Router | 7.x | 页面路由 |
| 包管理 | pnpm | - | 依赖管理 |

### 前端路由

| 路径 | 页面 | 说明 |
|:---|:---|:---|
| `/` | HomePage | 模式选择 (单机/联机) |
| `/solo` | SoloPage | 单机模式 |
| `/online` | OnlinePage | 联机模式 |

## 后端技术栈

| 类别 | 技术 | 用途 |
|:---|:---|:---|
| 计算平台 | Cloudflare Workers | 边缘计算 |
| 状态持久化 | Durable Objects | 房间状态 (SQLite) |
| 实时通信 | WebSocket (Workers 原生) | 双向通信 |
| 语言 | TypeScript | 类型安全 |

### 后端架构

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  玩家 A      │ ◄─────► │              │ ◄─────► │  玩家 B      │
│  (React)    │  WS     │  Workers     │  WS     │  (React)    │
└─────────────┘         │  (index.ts)  │         └─────────────┘
                        │              │
                        │  - 路由分发   │
                        └──────┬───────┘
                               │
                               ▼
                        ┌──────────────┐
                        │ GameRoom     │
                        │ (Durable     │
                        │  Object)     │
                        │              │
                        │  - 房间状态   │
                        │  - 游戏逻辑   │
                        │  - 倒计时     │
                        └──────────────┘
```

### 后端 API

| 端点 | 方法 | 说明 |
|:---|:---|:---|
| `/health` | GET | 健康检查 |
| `/create?playerName=xxx` | POST | 创建房间, 返回 `{ roomId }` |
| `/room/:roomId?playerName=xxx` | WS | WebSocket 连接 (加入房间) |

### WebSocket 消息协议

**客户端 → 服务器**:
- `make_guess` - 提交猜测 `{ driverId }`
- `give_up` - 放弃
- `request_restart` - 请求重开
- `confirm_restart` - 确认重开
- `ping` - 心跳

**服务器 → 客户端**:
- `room_joined` - 加入成功 `{ roomId, playerId, opponent }`
- `opponent_joined` - 对手加入 `{ opponent }`
- `game_start` - 游戏开始 `{ duration }`
- `guess_result` - 猜测结果 `{ driverId, feedback, isCorrect }`
- `opponent_guess` - 对手猜测 `{ guessCount, feedback }`
- `timer_sync` - 倒计时同步 `{ remaining }`
- `game_end` - 游戏结束 `{ result, reason, yourGuesses, opponentGuesses, targetDriverId, duration }`
- `game_restart` - 重新开始
- `opponent_left` - 对手离开
- `pong` - 心跳响应
- `error` - 错误 `{ code, message }`

## 数据流

### 单机模式

```
用户输入 → SearchBox → useGame.makeGuess
  ↓
compare.ts (前端计算反馈)
  ↓
更新 guesses state → GuessTable 显示
  ↓
猜中 → useStats.recordWin → localStorage
```

### 联机模式

```
用户输入 → SearchBox → useOnlineGame.makeGuess
  ↓
发送 { type: 'make_guess', driverId } 给后端
  ↓
后端 GameRoom.handleGuess:
  - compare.ts 计算反馈
  - 更新房间状态
  - 回发 guess_result 给猜测者
  - 广播 opponent_guess 给对手
  ↓
前端收到 guess_result → 更新 myGuesses
前端收到 opponent_guess → 更新对手进度
```

## 关键设计决策

1. **目标车手防作弊**: 游戏开始时后端**不发送** `targetDriverId`, 只在游戏结束时发送
2. **服务器权威计时**: 倒计时由后端每秒广播, 前端只显示
3. **状态一致性**: 每个房间对应一个 Durable Object 实例 (单线程串行)
4. **断线重连**: 30 秒重连窗口, 通过 playerId 恢复
5. **反馈计算位置**: 在**后端**计算 (防止前端作弊看到目标)

## F1 主题配色 (Tailwind)

```js
colors: {
  f1: {
    red: '#E10600',     // 主色
    dark: '#15151E',    // 背景
    green: '#38D1A8',   // 正确
    yellow: '#FAB500',  // 接近
    gray: '#38383F',    // 错误/中性
    text: '#F1F1F1',    // 文字
  }
}
```
