# F1 Guess 部署信息

## 域名与访问

| 服务 | 域名 | 状态 |
|:---|:---|:---|
| 前端主域名 | https://f1-guess.online | ✅ 生产 |
| 后端 API | https://api.f1-guess.online | ✅ 生产 |
| Pages 备用域名 | https://f1-guess-game.pages.dev | ✅ 备用 |
| Workers 备用域名 | https://f1-guess-game-api.dingrui-tao.workers.dev | ⚠️ 中国大陆不可达 |

## Cloudflare 配置

### Pages (前端)

- **项目名**: `f1-guess-game`
- **仓库**: `rayyyy122/F1-Guess-Game` (GitHub)
- **分支**: `main`
- **Build command**: `cd f1-guess && pnpm install && pnpm run build`
- **Build output**: `f1-guess/dist`
- **Root directory**: 留空 (通过 build command 进入子目录)
- **自定义域名**: `f1-guess.online`
- **自动部署**: push 到 main 分支触发

### Workers (后端)

- **Worker 名**: `f1-guess-game-api`
- **入口**: `server/src/index.ts`
- **Durable Objects 绑定**: `ROOMS` → `GameRoom` class
- **Migration**: `new_sqlite_classes = ["GameRoom"]` (免费套餐要求)
- **自定义域名**: `api.f1-guess.online`

### DNS 配置

在 Cloudflare DNS 中:
- `f1-guess.online` → CNAME → `f1-guess-game.pages.dev` (Proxied)
- `www.f1-guess.online` → CNAME → `f1-guess-game.pages.dev` (Proxied)
- `api.f1-guess.online` → 由 Workers Custom Domain 自动创建

### 域名 NS 服务器

- `mia.ns.cloudflare.com`
- `theo.ns.cloudflare.com`

## 部署命令

### 前端 (自动)

```bash
git push  # push 到 main 分支后 Cloudflare Pages 自动部署 (约 1 分钟)
```

### 后端 (手动)

```bash
cd "/Users/taodingrui/Desktop/F1 Guess/server"
npx wrangler deploy
```

### 后端登录 (首次)

```bash
cd "/Users/taodingrui/Desktop/F1 Guess/server"
npx wrangler login  # 打开浏览器授权
```

### 查看后端日志

```bash
cd "/Users/taodingrui/Desktop/F1 Guess/server"
npx wrangler tail
```

### 查看部署历史

```bash
cd "/Users/taodingrui/Desktop/F1 Guess/server"
npx wrangler deployments list
```

## 环境差异

| 环境 | 前端 | 后端 |
|:---|:---|:---|
| 开发 | `http://localhost:5173` | `http://localhost:8787` (wrangler dev) |
| 生产 | `https://f1-guess.online` | `https://api.f1-guess.online` |

## 前端环境变量

前端硬编码后端地址在 `f1-guess/src/hooks/useOnlineGame.ts`:

```typescript
const API_BASE = 'https://api.f1-guess.online'
```

如需修改，改这里并重新部署。

## 内网访问说明

- `*.pages.dev` 和 `f1-guess.online` 在中国大陆**可正常访问** ✅
- `*.workers.dev` 在中国大陆**不可达** ❌
- `api.f1-guess.online` (自定义域名) **可正常访问** ✅

## 部署检查清单

部署新版本后，验证以下端点：

- [ ] `https://f1-guess.online` - 前端首页
- [ ] `https://f1-guess.online/solo` - 单机模式
- [ ] `https://f1-guess.online/online` - 联机模式
- [ ] `https://api.f1-guess.online/health` - 后端健康检查
- [ ] WebSocket: `wss://api.f1-guess.online/room/ABCXYZ?playerName=test`

## 回滚

### 前端回滚

```bash
git revert <commit>
git push
```

### 后端回滚

```bash
cd server
git revert <commit>
npx wrangler deploy
```

或在 Cloudflare 控制台 → Workers → `f1-guess-game-api` → Deployments → 选择历史版本 → Rollback。
