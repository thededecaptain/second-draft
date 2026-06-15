#!/usr/bin/env node
/**
 * Phase 1 funnel from usage_events + workspaces.
 * Usage: node scripts/usage-report.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

try {
  const workspaces = await prisma.workspace.findMany({
    where: { installationJson: { not: null } },
    select: { id: true, slackTeamId: true, createdAt: true },
  });

  const since7 = daysAgo(7);
  const since14 = daysAgo(14);

  const events = await prisma.usageEvent.findMany({
    where: { createdAt: { gte: since14 } },
    select: { workspaceId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byWorkspace = new Map();
  for (const e of events) {
    const list = byWorkspace.get(e.workspaceId) ?? [];
    list.push(e.createdAt);
    byWorkspace.set(e.workspaceId, list);
  }

  let activeLast7 = 0;
  let week2Retention = 0;
  let eligibleWeek2 = 0;

  for (const ws of workspaces) {
    const rewrites = byWorkspace.get(ws.id) ?? [];
    const firstRewrite = rewrites[0];
    const hasRewriteLast7 = rewrites.some((t) => t >= since7);
    if (hasRewriteLast7) activeLast7++;

    // Installed 7+ days ago and used in days 8-14 after first rewrite week
    if (ws.createdAt <= since7) {
      eligibleWeek2++;
      const week1End = new Date(ws.createdAt);
      week1End.setDate(week1End.getDate() + 7);
      const week2End = new Date(ws.createdAt);
      week2End.setDate(week2End.getDate() + 14);
      const usedWeek2 = rewrites.some((t) => t >= week1End && t < week2End);
      if (usedWeek2) week2Retention++;
    }

    const status = firstRewrite ? "rewrote" : "installed only";
    console.log(`${ws.slackTeamId}  install=${ws.createdAt.toISOString().slice(0, 10)}  ${status}  rewrites(14d)=${rewrites.length}`);
  }

  console.log("\n--- Phase 1 metrics ---");
  console.log(`Workspaces installed:     ${workspaces.length}`);
  console.log(`Active last 7 days:       ${activeLast7}`);
  console.log(`Week-2 retention:         ${eligibleWeek2 ? `${week2Retention}/${eligibleWeek2}` : "n/a (no installs 7+ days old yet)"}`);
  console.log(`Total rewrites (14 days): ${events.length}`);
} finally {
  await prisma.$disconnect();
}
