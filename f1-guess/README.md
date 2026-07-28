# F1 Guess

> F1 车手猜测游戏 - 通过属性提示找出隐藏的车手

类似 Wordle 和「足一把」的玩法，玩家通过猜测车手的国籍、车队、车号、冠军数、领奖台数、胜场数、首秀年份、现役状态等 8 个属性，根据颜色反馈找出隐藏的 F1 车手。

## 功能

- **无限模式**：随机选择车手，不限猜测次数
- **颜色反馈**：🟩 正确 / 🟨 接近 / ⬜ 错误
- **车手数据库**：50 位车手（23 位现役 + 27 位传奇）
- **自动补全搜索**：支持中英文姓名、键盘导航
- **统计系统**：总场次、胜率、连胜、最佳成绩（localStorage 持久化）
- **分享功能**：复制结果到剪贴板 / 分享到 X

## 技术栈

- **构建工具**：Vite 8
- **框架**：React 18
- **语言**：TypeScript 5
- **样式**：Tailwind CSS 3
- **存储**：localStorage

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
src/
├── components/         # UI 组件
│   ├── Header/         # 顶部导航
│   ├── SearchBox/      # 搜索框（自动补全）
│   ├── GuessTable/     # 猜测结果表格
│   ├── StatsModal/     # 统计弹窗
│   ├── ShareButton/    # 分享按钮
│   └── GameStatus.tsx  # 胜利提示横幅
├── data/
│   └── drivers.json    # 车手数据
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

## 反馈规则

| 属性 | 🟩 正确 | 🟨 接近 | ⬜ 错误 |
|------|---------|---------|---------|
| 国籍 | 相同 | - | 不同 |
| 车队 | 相同 | 曾效力同一车队 | 不同 |
| 车号 | 相同 | - | 不同 |
| 冠军数 | 相同 | 相差 ±1 | 相差 >1 |
| 领奖台 | 相同 | 差值 ≤10 | 差值 >10 |
| 胜场 | 相同 | 差值 ≤5 | 差值 >5 |
| 首秀年份 | 相同 | 相差 ±1 年 | 相差 >1 年 |
| 现役状态 | 相同 | - | 不同 |

## 部署

### Vercel

```bash
npx vercel
```

或在 Vercel 控制台导入 GitHub 仓库，构建配置已包含在 `vercel.json` 中。

### Netlify

```bash
npx netlify-cli deploy --prod
```

或在 Netlify 控制台导入 GitHub 仓库，构建配置已包含在 `netlify.toml` 中。

## License

MIT
