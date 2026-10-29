/**
 * `/login` — session entry (RSC shell).
 *
 * Before the form can authenticate, the demo users are mirrored into the
 * API module graph through the users HTTP contract (dev keeps boot/page/api
 * graphs isolated; the auth route runs in the API graph).
 */

import {
  DEMO_LOGIN_ACCOUNTS,
  ensureCatalogSeeded,
  syncDemoUsersViaApi,
} from '@/lib/seed/catalog-seed';
import { getOwnOriginUrl } from '@/lib/auth/session';
import { LoginForm } from '@/components/auth/login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar sesión',
};

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  ensureCatalogSeeded();

  const origin = await getOwnOriginUrl();
  await syncDemoUsersViaApi(origin);

  const params = await searchParams;
  const nextParam = params.next;
  const next = typeof nextParam === 'string' && nextParam.startsWith('/') ? nextParam : '';

  return (
    <main className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Iniciá sesión</h1>
        <p className="text-sm text-muted-foreground">
          Accedé con tu cuenta para finalizar compras y ver pedidos.
        </p>
      </header>

      <div className="mt-8">
        <LoginForm nextPath={next} demoAccounts={DEMO_LOGIN_ACCOUNTS} />
      </div>
    </main>
  );
}
