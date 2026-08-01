# F1 Guess 游戏规则与数据逻辑

## 核心玩法

玩家通过猜测车手的 8 个属性，根据颜色反馈和数值方向箭头，在限定次数内找出隐藏的 F1 车手。

## 猜测属性

| 属性 | 类型 | 说明 |
|:---|:---|:---|
| 姓名 | - | 仅用于显示，不参与反馈 |
| 国籍 | 分类 | 相同=🟩, 同大洲=🟨, 不同大洲=⬜ |
| 车队 | 分类 | 相同=🟩, 不同=⬜ |
| 车号 | 数值 | 相同=🟩, 相差≤1=🟨, 相差>1=⬜ |
| 世界冠军 | 数值 | 相同=🟩, 相差≤1=🟨, 相差>1=⬜ |
| 领奖台 | 数值 | 相同=🟩, 相差≤1=🟨, 相差>1=⬜ |
| 分站冠军 | 数值 | 相同=🟩, 相差≤1=🟨, 相差>1=⬜ |
| 首秀年份 | 数值 | 相同=🟩, 相差≤1=🟨, 相差>1=⬜ |
| 状态 | 分类 | 相同=🟩, 不同=⬜ |

## 颜色反馈

- 🟩 `correct` - 完全匹配
- 🟨 `close` - 接近
- ⬜ `wrong` - 不匹配

## 数值方向箭头

数值类型的属性显示方向箭头：
- `↑` 目标值比猜测值**大**
- `↓` 目标值比猜测值**小**
- 无箭头表示相等

## 大洲映射

```typescript
欧洲: 英国/意大利/法国/德国/西班牙/荷兰/芬兰/奥地利/摩纳哥/波兰/比利时/瑞士/瑞典/丹麦/爱尔兰/俄罗斯/葡萄牙
非洲: 南非
亚洲: 中国/日本/泰国/印度/印度尼西亚
北美: 加拿大/美国/墨西哥
南美: 阿根廷/巴西/哥伦比亚/委内瑞拉
大洋洲: 澳大利亚/新西兰
```

## 车手状态

| 状态 | 含义 | 数量 |
|:---|:---|:---|
| `active` | 现役 (2026 赛季正式车手) | 22 |
| `reserve` | 储备 (无参赛席位但在 F1 体系内) | 4 |
| `retired` | 退役 | 83 |

## 车队显示规则

| 状态 | team 字段显示 |
|:---|:---|
| 现役 | 当前效力车队 |
| 储备 | 最后效力车队 (如 Zhou Guanyu 显示 Sauber, 虽现为 Ferrari 储备) |
| 退役 | 最后效力车队 (如 Michael Schumacher 显示 Mercedes, 而非法拉利) |

## 单机模式规则

- **猜测次数**: 8 次
- **胜利**: 8 次内猜中
- **失败**: 8 次用完未猜中 或 主动放弃
- **统计**: 总场次/胜率/连胜/最佳成绩 (localStorage)

## 联机模式规则

- **玩家数**: 2 人 (1v1)
- **猜测次数**: 每人 8 次
- **时间限制**: 2 分钟 (120 秒)
- **目标车手**: 两人相同 (服务器分配)
- **胜利条件**:
  1. 先猜中者胜
  2. 时间到时，猜测次数少者胜
  3. 次数相同为平局
- **同步内容**:
  - 对方猜测次数
  - 对方最新猜测的颜色反馈 (不看姓名)
  - 倒计时
- **不同步内容**:
  - 目标车手 ID (游戏结束才发送)
  - 对方具体猜测了哪位车手

## 数据存储

### 单机统计 (localStorage)

Key: `f1-guess-stats`

```typescript
{
  totalGames: number,     // 总场次
  wins: number,           // 猜中次数
  currentStreak: number,  // 当前连胜
  maxStreak: number,      // 最大连胜
  totalGuesses: number,   // 总猜测次数 (仅胜局)
  bestGame: number | null // 最佳成绩 (最少猜测次数)
}
```

### 帮助弹窗标记 (localStorage)

Key: `f1-guess-help-seen` (`'true'` 表示已看过)

### 联机房间状态 (Durable Object)

每个房间对应一个 DO 实例, 存储:

```typescript
{
  id: string,             // 6 位字母房间号
  status: 'waiting' | 'playing' | 'finished',
  players: Record<playerId, Player>,
  targetDriverId: string | null,
  startTime: number | null,
  endTime: number | null,
  duration: 120,
  winner: playerId | null,
  createdAt: number
}
```

## 车手数据

存储于 `f1-guess/src/data/drivers.json` 和 `server/src/drivers.json` (保持同步)。

**当前数据**: 109 位车手 (2026-07-27 匈牙利大奖赛后)

字段:
```typescript
{
  id: string,            // kebab-case 唯一标识
  name: string,          // 英文名
  nameCn: string,        // 中文名
  nationality: string,   // 国籍 (中文)
  team: string,          // 主要车队 (英文)
  teamCn: string,        // 主要车队 (中文)
  teams: string[],       // 曾效力车队 (按时间顺序)
  number: number,        // 车号
  championships: number, // 世界冠军次数
  podiums: number,       // 领奖台次数
  wins: number,          // 分站冠军次数
  debutYear: number,     // 首秀年份
  status: 'active' | 'reserve' | 'retired',
  country: string        // 国家代码 (ISO)
}
```

## 前端搜索逻辑

`searchDrivers(query)`:
- 匹配字段: `name` (忽略大小写) + `nameCn`
- 算法: `String.includes()` 子串匹配
- 返回: 前 8 个结果
- 过滤: 已猜过的车手不显示
