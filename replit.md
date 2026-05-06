# Discord Moderation Bot — بوت ديسكورد للإدارة

بوت ديسكورد للقيمينق يحتوي على أوامر إدارة كاملة، مع HTTP server للربط مع UptimeRobot.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — تشغيل البوت + السيرفر (port 5000)
- `pnpm run typecheck` — فحص الأنواع
- `pnpm run build` — بناء كل الحزم
- Required env secrets: `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- Discord: discord.js v14
- Build: esbuild (ESM bundle)

## Where things live

- `artifacts/api-server/src/bot/` — كود البوت
  - `commands/` — أوامر السلاش (ban, kick, timeout, warn, clear, unban, serverinfo, userinfo)
  - `index.ts` — تشغيل البوت وربط الأحداث
  - `deploy-commands.ts` — تسجيل الأوامر عند Startup
- `artifacts/api-server/src/routes/ping.ts` — endpoint لـ UptimeRobot (`/api/ping`)

## Architecture decisions

- البوت والسيرفر HTTP يشتغلان في نفس العملية (process واحد)
- أوامر السلاش تُسجَّل تلقائياً عند كل تشغيل (global commands)
- endpoint `/api/ping` مخصص لـ UptimeRobot يرجع 200 ويبقي الخدمة حية

## Product

بوت ديسكورد للإدارة يحتوي على: ban, kick, timeout, untimeout, warn, clear, unban, serverinfo, userinfo

## User preferences

- اللغة العربية مفضّلة في رسائل البوت
- الربط مع Render و UptimeRobot للـ hosting

## Gotchas

- يجب أن يكون `DISCORD_TOKEN` و `DISCORD_CLIENT_ID` موجودَين كـ secrets
- الأوامر Global تأخذ حتى ساعة لتظهر في ديسكورد (في التطوير استخدم Guild commands)
- لا تنسَ تفعيل **Message Content Intent** و **Server Members Intent** من Developer Portal

## Pointers

- See the `pnpm-workspace` skill for workspace structure
- discord.js docs: https://discord.js.org/
