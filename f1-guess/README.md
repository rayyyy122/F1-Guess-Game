# F1 Guess (Web App)

> F1 车手猜测游戏的前端应用

在线访问：https://f1-guess-game.pages.dev

## 技术栈

- **构建工具**: Vite 8
- **框架**: React 19
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3
- **包管理**: pnpm

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

## 项目结构

```
src/
├── components/         # UI 组件
│   ├── Header/         # 顶部导航
│   ├── SearchBox/      # 搜索框（自动补全）
│   ├── GuessTable/     # 猜测结果表格
│   ├── StatsModal/     # 统计弹窗
│   ├── HelpModal/      # 规则弹窗
│   ├── ConfirmModal/   # 通用确认弹窗
│   ├── AnswerModal/    # 答案展示弹窗
│   └── GameStatus.tsx  # 游戏状态横幅
├── data/
│   └── drivers.json    # 车手数据 (49 位)
├── hooks/
│   ├── useGame.ts      # 游戏状态管理
│   └── useStats.ts     # 统计数据管理
├── types/
│   └── index.ts        # TypeScript 类型定义
├── utils/
│   ├── drivers.ts      # 车手数据工具
│   ├── compare.ts      # 猜测对比逻辑
│   └── storage.ts      # localStorage 存储
├── App.tsx             # 主应用
└── main.tsx            # 入口
```

## 核心逻辑

### 颜色反馈

- 🟩 `correct` - 完全匹配
- 🟨 `close` - 接近（数值差 ≤1，或同一大洲）
- ⬜ `wrong` - 不匹配

### 数值方向

数值类型的属性（车号、世界冠军、领奖台、分站冠军、首秀年份）会显示方向箭头：
- `↑` 目标值比猜测值大
- `↓` 目标值比猜测值小

### 车手状态

- `active` - 现役（2026 赛季正式车手）
- `reserve` - 储备（无参赛席位但在 F1 体系内）
- `retired` - 退役

## 数据更新

车手数据存储在 `src/data/drivers.json`，更新时间：2026-07-27（匈牙利大奖赛后）。

## 部署

通过 Cloudflare Pages 自动部署，配置见仓库根目录 README。
