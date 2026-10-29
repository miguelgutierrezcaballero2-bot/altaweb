/**
 * Session helpers — httpOnly cookie session for the B2B storefront (Phase 5).
 *
 * Cookie `altec_session`: httpOnly, sameSite=lax, path=/, 7-day expiry;
 * value = base64url JSON `{ token, userId, email, fullName, role }` where
 * `token` is an opaque random UUID (unguessable, not verified anywhere yet).
 *
 * Trust model (documented in odd/tasks/vendor-accounts.md): display-only
 * claims (fullName/role) are read straight from the payload without network
 * I/O; when identity matters, `verifySession` re-checks the userId against
 * the users HTTP contract (`GET /api/users/<id>`), so a stale or forged id
 * that no longer resolves counts as signed out. The payload is not signed;
 * signing/HMAC or server-state sessions are a follow-up.
 *
 * This module must stay server-only-safe (cookies/headers from
 * 'next/headers'); server actions import it dynamically.
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const SESSION_COOKIE_NAME = 'altec_session';
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/** Role claims as stored — mirrors the domain UserRole enum (customer | admin). */
export type SessionRole = 'admin' | 'customer';

export interface SessionClaimsInput {
  userId: string;
  email: string;
  fullName: string;
  role: SessionRole;
  /** Opaque token carried for forward use (verification revocation hooks). */
  token?: string;
}

export interface SessionClaims extends Required<SessionClaimsInput> {}

export function encodeSessionCookie(input: SessionClaimsInput): string {
  const claims: SessionClaims = {
    ...input,
    token: input.token ?? crypto.randomUUID(),
  };
  return Buffer.from(JSON.stringify(claims)).toString('base64url');
}

export function decodeSessionCookie(value: string): SessionClaims | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as SessionClaims;
    if (
      typeof parsed.token !== 'string' ||
      typeof parsed.userId !== 'string' ||
      typeof parsed.email !== 'string' ||
      typeof parsed.fullName !== 'string' ||
      (parsed.role !== 'admin' && parsed.role !== 'customer')
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Reads the raw cookie and decodes its claims (no contract verification). */
export async function getSessionClaims(): Promise<SessionClaims | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return decodeSessionCookie(raw);
}

/** Sets the session cookie (server actions / route handlers only). */
export async function setSessionCookie(input: SessionClaimsInput): Promise<void> {
  const store = await cookies();
  store.set({
    name: SESSION_COOKIE_NAME,
    value: encodeSessionCookie(input),
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clears the session cookie (logout). */
export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

/** Own-origin base URL for HTTP-contract reads (Next 16 async headers). */
export async function getOwnOriginUrl(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') ?? 'localhost:3000';
  const protocol =
    host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

/**
 * Verifies the session claims against the users HTTP contract:
 * `GET /api/users/<userId>` must resolve for the session to count as valid.
 * Returns null on missing/undecodable cookie or an unresolvable userId.
 */
export async function verifySession(
  baseUrl: string = await getOwnOriginUrl(),
): Promise<SessionClaims | null> {
  const claims = await getSessionClaims();
  if (!claims) return null;
  const res = await fetch(`${baseUrl}/api/users/${encodeURIComponent(claims.userId)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    return null;
  }
  return claims;
}

/**
 * Gate helper for RSC shells: verified session or redirect to
 * `/login?next=<path>`. Returning code should use the claims for identity.
 */
export async function requireVerifiedSession(nextPath: string): Promise<SessionClaims> {
  const claims = await verifySession();
  if (!claims) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return claims;
}
