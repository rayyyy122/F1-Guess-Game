# F1 Guess

> F1 车手猜测游戏 - 类似 Wordle 的猜谜玩法

🔗 **在线试玩**: https://f1-guess-game.pages.dev

## 项目简介

通过猜测车手的国籍、车队、车号、世界冠军、领奖台、分站冠军、首秀年份、状态等 8 个属性，根据颜色反馈（🟩 正确 / 🟨 接近 / ⬜ 错误）和数值方向箭头（↑↓），在 8 次机会内找出隐藏的 F1 车手。

## 功能特性

- **49 位车手**：22 位现役 + 3 位储备 + 24 位传奇
- **2026 赛季数据**：包含 Audi、Cadillac 等新车队
- **中英文支持**：车手姓名、车队名称双语显示和搜索
- **颜色反馈**：属性匹配度可视化
- **方向箭头**：数值大小关系提示
- **统计系统**：总场次、胜率、连胜、最佳成绩（localStorage 持久化）
- **响应式设计**：支持桌面端和移动端

## 游戏规则

| 属性 | 🟩 正确 | 🟨 接近 | ⬜ 错误 |
|------|---------|---------|---------|
| 国籍 | 相同 | 同一大洲 | 不同大洲 |
| 车队 | 相同 | - | 不同 |
| 车号 | 相同 | 相差 ≤1 | 相差 >1 |
| 世界冠军 | 相同 | 相差 ≤1 | 相差 >1 |
| 领奖台 | 相同 | 相差 ≤1 | 相差 >1 |
| 分站冠军 | 相同 | 相差 ≤1 | 相差 >1 |
| 首秀年份 | 相同 | 相差 ≤1 年 | 相差 >1 年 |
| 状态 | 相同（现役/储备/退役） | - | 不同 |

## 技术栈

- **构建工具**: Vite 8
- **框架**: React 19 + TypeScript 5
- **样式**: Tailwind CSS 3
- **包管理**: pnpm
- **部署**: Cloudflare Pages

## 本地开发

```bash
# 进入项目目录
cd f1-guess

# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:5173)
pnpm run dev

# 构建生产版本
pnpm run build

# 预览生产构建
pnpm run preview
```

## 项目结构

```
.
├── f1-guess/                 # 主应用目录
│   ├── src/
│   │   ├── components/       # UI 组件
│   │   │   ├── Header/       # 顶部导航
│   │   │   ├── SearchBox/    # 搜索框（自动补全）
│   │   │   ├── GuessTable/   # 猜测结果表格
│   │   │   ├── StatsModal/   # 统计弹窗
│   │   │   ├── HelpModal/    # 规则弹窗
│   │   │   ├── ConfirmModal/ # 确认弹窗
│   │   │   ├── AnswerModal/  # 答案弹窗
│   │   │   └── GameStatus.tsx
│   │   ├── data/
│   │   │   └── drivers.json  # 车手数据
│   │   ├── hooks/
│   │   │   ├── useGame.ts    # 游戏状态管理
│   │   │   └── useStats.ts   # 统计数据管理
│   │   ├── types/            # TypeScript 类型
│   │   ├── utils/
│   │   │   ├── drivers.ts    # 车手数据工具
│   │   │   ├── compare.ts    # 猜测对比逻辑
│   │   │   └── storage.ts    # localStorage 存储
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── README.md             # 项目技术文档
├── f1-guess-requirements.md  # 需求文档
└── README.md                 # 本文件
```

## 部署

项目通过 **Cloudflare Pages** 自动部署：

- **生产环境**: https://f1-guess-game.pages.dev
- **自动部署**: push 到 `main` 分支触发
- **构建配置**:
  - Build command: `cd f1-guess && pnpm install && pnpm run build`
  - Build output: `f1-guess/dist`

## 数据说明

- 数据截止时间：2026-07-27（匈牙利大奖赛）
- 车手统计数据来源：F1 官方网站、Wikipedia

## License

MIT
