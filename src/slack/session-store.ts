import type { Relationship, Tone } from "../prompts/types.js";

export interface RewriteSession {
  id: string;
  draft: string;
  channelId: string;
  teamId: string;
  userId: string;
  tone: Tone;
  relationship: Relationship;
  rewritten?: string;
  /** Latest response_url from an interaction; used to update ephemeral after modal submit. */
  responseUrl?: string;
  createdAt: number;
}

const TTL_MS = 30 * 60 * 1000;
const sessions = new Map<string, RewriteSession>();

function pruneExpired(): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > TTL_MS) {
      sessions.delete(id);
    }
  }
}

export function createSession(
  data: Omit<RewriteSession, "id" | "createdAt">
): RewriteSession {
  pruneExpired();
  const session: RewriteSession = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): RewriteSession | undefined {
  pruneExpired();
  return sessions.get(id);
}

export function updateSession(
  id: string,
  patch: Partial<
    Pick<RewriteSession, "tone" | "relationship" | "rewritten" | "responseUrl">
  >
): RewriteSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  Object.assign(session, patch);
  return session;
}
