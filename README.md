# 唠嗑

趁着Cloudflare Realtime还在免费，赶紧薅羊毛开黑用吧

## 环境变量

Worker 需要这些变量/secret：

- `CLOUDFLARE_ACCOUNT_ID`: Cloudflare account ID
- `REALTIME_APP_ID`: RealtimeKit app ID
- `REALTIME_API_TOKEN`: 有 Realtime 权限的 Cloudflare API token
- `ADMIN_TOKEN`: 管理会议用的共享密码

本地开发可以放在 `.dev.vars` 或 `.env` 里。生产环境建议用 Wrangler secret：

```sh
wrangler secret put REALTIME_API_TOKEN
wrangler secret put ADMIN_TOKEN
```

登录大厅后，在右侧“管理会议”输入 `ADMIN_TOKEN`，就可以创建会议、复制会议 ID、删除会议。RealtimeKit 不提供彻底删除 meeting 的 API，这里的删除会把会议标记为 `INACTIVE`，管理列表只显示 `ACTIVE` 会议。
