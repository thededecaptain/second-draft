import type { EnvelopeCryptoProvider } from "../crypto/envelope.js";
import { prisma } from "../db/client.js";

export async function hasUserToken(
  teamId: string,
  slackUserId: string
): Promise<boolean> {
  const row = await prisma.userToken.findFirst({
    where: { teamId, slackUserId, revokedAt: null },
    select: { id: true },
  });
  return row !== null;
}

export async function saveUserToken(
  teamId: string,
  slackUserId: string,
  accessToken: string,
  envelope: EnvelopeCryptoProvider
): Promise<void> {
  const { ciphertext, keyVersion } = await envelope.encrypt(accessToken);
  await prisma.userToken.upsert({
    where: { teamId_slackUserId: { teamId, slackUserId } },
    create: {
      teamId,
      slackUserId,
      ciphertext,
      keyVersion,
    },
    update: {
      ciphertext,
      keyVersion,
      revokedAt: null,
    },
  });
}

export async function getUserAccessToken(
  teamId: string,
  slackUserId: string,
  envelope: EnvelopeCryptoProvider
): Promise<string | null> {
  const row = await prisma.userToken.findFirst({
    where: { teamId, slackUserId, revokedAt: null },
  });
  if (!row) return null;
  return envelope.decrypt(row.ciphertext, row.keyVersion);
}

export async function revokeUserToken(
  teamId: string,
  slackUserId: string
): Promise<void> {
  await prisma.userToken.updateMany({
    where: { teamId, slackUserId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
