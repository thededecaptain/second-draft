# SecondDraft Slack app

Bolt + Prisma backend. **Not deployed by Lovable** — run or host this separately.

Setup: [SETUP.md](./SETUP.md)

```bash
cd slack-app
cp .env.example .env   # fill Slack, Anthropic, DATABASE_URL
npm install
npx prisma db push
npm run dev            # port 3000
```
