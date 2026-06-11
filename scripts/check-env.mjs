#!/usr/bin/env node
/**
 * Validates .env without printing secret values.
 * Usage: node scripts/check-env.mjs
 */
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

const required = [
  "DATABASE_URL",
  "SLACK_SIGNING_SECRET",
  "SLACK_CLIENT_ID",
  "SLACK_CLIENT_SECRET",
  "SLACK_STATE_SECRET",
  "SLACK_APP_TOKEN",
  "ANTHROPIC_API_KEY",
];

function parseEnv(content) {
  const out = {};
  for (const line of content.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

if (!existsSync(envPath)) {
  console.error("Missing .env — copy .env.example to .env and fill values.");
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, "utf8"));
const missing = required.filter((k) => !env[k]?.length);
const placeholders = required.filter((k) =>
  /^(your-|paste|xxx|<)/i.test(env[k] ?? "")
);

if (missing.length) {
  console.error("Missing or empty:", missing.join(", "));
  process.exit(1);
}
if (placeholders.length) {
  console.error("Still looks like placeholders:", placeholders.join(", "));
  process.exit(1);
}

console.log("OK — all required env vars are set.");
console.log("Next: npx prisma db push && npm run dev");
console.log("Then open http://localhost:3000/slack/install");
