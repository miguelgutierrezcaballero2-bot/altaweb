'use server';

/**
 * Session server actions — cookie writers cleared of module-scope inline
 * actions: Turbopack keeps treating "use client" files that declare
 * module-level 'use server' functions as RSC, so the actions live here.
 */

import { redirect } from 'next/navigation';
import {
  clearSessionCookie,
  setSessionCookie,
} from '@/lib/auth/session';
import type { SessionClaims } from '@/lib/auth/session';

/** Persists the httpOnly session cookie after a successful contract auth. */
export async function createSessionAction(claims: SessionClaims): Promise<void> {
  await setSessionCookie(claims);
}

/** Clears the session cookie and returns to the home page (logout). */
export async function signOutAction(): Promise<void> {
  await clearSessionCookie();
  redirect('/');
}
