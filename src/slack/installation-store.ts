import type {
  Installation,
  InstallationQuery,
  InstallationStore,
} from "@slack/oauth";
import { Prisma } from "@prisma/client";
import { prisma } from "../db/client.js";
import { safeLog } from "../logging/redact.js";

function installationToJson(installation: Installation): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(installation)) as Prisma.InputJsonValue;
}

function jsonToInstallation(value: Prisma.JsonValue): Installation {
  return value as unknown as Installation;
}

export class PrismaInstallationStore implements InstallationStore {
  async storeInstallation(installation: Installation): Promise<void> {
    const teamId = installation.team?.id;
    if (!teamId) {
      throw new Error("Installation missing team id");
    }

    await prisma.workspace.upsert({
      where: { slackTeamId: teamId },
      create: {
        slackTeamId: teamId,
        tier: "SMB",
        installationJson: installationToJson(installation),
      },
      update: {
        installationJson: installationToJson(installation),
      },
    });

    safeLog("info", "Workspace registered on install", { slackTeamId: teamId });
  }

  async fetchInstallation(query: InstallationQuery<boolean>): Promise<Installation> {
    const teamId = query.teamId;
    if (!teamId) {
      throw new Error("Installation query missing team id");
    }

    const row = await prisma.workspace.findUnique({
      where: { slackTeamId: teamId },
    });
    if (!row?.installationJson) {
      throw new Error(`No installation stored for team ${teamId}`);
    }

    return jsonToInstallation(row.installationJson);
  }

  async deleteInstallation(query: InstallationQuery<boolean>): Promise<void> {
    const teamId = query.teamId;
    if (!teamId) return;

    await prisma.workspace.updateMany({
      where: { slackTeamId: teamId },
      data: { installationJson: Prisma.DbNull },
    });
    safeLog("info", "Installation cleared on uninstall", { slackTeamId: teamId });
  }
}
