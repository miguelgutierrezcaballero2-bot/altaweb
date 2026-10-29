"use client";

/**
 * Login form — client island for /login.
 *
 * Flow against the real users contract:
 * 1. `GET /api/users?email=` resolves the account id (only email resolver),
 * 2. `POST /api/users/<id>/auth` verifies credentials (route is id-keyed,
 *    authenticate looks the email up and the id only records lastLogin),
 * 3. an inline server action sets the httpOnly `altec_session` cookie,
 * 4. the client navigates to `next` (or /orders).
 *
 * The server action imports the session module dynamically so this client
 * file never pulls server-only code into the client bundle.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2Icon, LogInIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SessionClaims } from '@/lib/auth/session';
import type { DemoAccount } from '@/lib/seed/catalog-seed';

const loginSchema = z.object({
  email: z.email('Ingresá un correo válido'),
  password: z.string().min(1, 'Ingresá la contraseña'),
});

type LoginValues = z.infer<typeof loginSchema>;

/** Server action: persists the session cookie established by the contract. */
async function createSessionAction(claims: SessionClaims) {
  'use server';
  const { setSessionCookie } = await import('@/lib/auth/session');
  await setSessionCookie(claims);
}

interface LoginFormProps {
  /** Validated `?next=` target (internal paths only). */
  nextPath: string;
  /** Seeded demo credentials shown as a hint (demo passwords, per doc). */
  demoAccounts: DemoAccount[];
}

export function LoginForm({ nextPath, demoAccounts }: LoginFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginValues) => {
    setFormError(null);

    // 1. Resolve the account id by email (GET /api/users?email=).
    let userId: string;
    let fullName: string;
    let role: SessionClaims['role'];
    try {
      const lookup = await fetch(
        `/api/users?email=${encodeURIComponent(values.email)}`,
      );
      if (!lookup.ok) {
        setFormError('No encontramos una cuenta con ese correo');
        return;
      }
      const { user } = (await lookup.json()) as {
        user?: { id: string; firstName: string; lastName: string; role: SessionClaims['role'] };
      };
      if (!user) {
        setFormError('Respuesta inválida del servicio de cuentas');
        return;
      }
      userId = user.id;
      fullName = `${user.firstName} ${user.lastName}`.trim();
      role = user.role;
    } catch {
      setFormError('Error de conexión al buscar tu cuenta');
      return;
    }

    // 2. Verify credentials (POST /api/users/<id>/auth).
    try {
      const auth = await fetch(`/api/users/${encodeURIComponent(userId)}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      if (auth.status === 401) {
        setFormError('Credenciales incorrectas. Probá de nuevo.');
        return;
      }
      if (!auth.ok) {
        setFormError(`No pudimos iniciar sesión (HTTP ${auth.status})`);
        return;
      }
      const { result } = (await auth.json()) as {
        result?: { user: { id: string; email: string; role: 'admin' | 'customer' }; token: string };
      };
      if (!result) {
        setFormError('Respuesta inválida del servicio de autenticación');
        return;
      }

      // 3. Set the httpOnly session cookie server-side, then navigate.
      await createSessionAction({
        userId: result.user.id,
        email: result.user.email,
        fullName,
        role: result.user.role ?? role,
        token: result.token,
      });
      router.push(nextPath || '/orders');
    } catch {
      setFormError('Error de conexión al iniciar sesión');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <form className="space-y-4" noValidate onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo</Label>
              <Input
                id="email"
                type="email"
                placeholder="compras@negocio.demo"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2Icon className="animate-spin" />}
              <LogInIcon data-icon="inline-start" />
              Iniciar sesión
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-muted/40 p-4">
        <p className="text-xs font-medium text-muted-foreground">
          Credenciales de demostración (cargalas tal cual)
        </p>
        <ul className="mt-2 space-y-1.5 text-xs">
          {demoAccounts.map((account) => (
            <li key={account.email} className="flex flex-wrap items-center gap-1.5">
              <span>
                <span className="font-mono font-medium">{account.email}</span>
                <span className="text-muted-foreground"> · </span>
                <span className="font-mono">{account.password}</span>
              </span>
              <span className="rounded-sm bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-secondary-foreground">
                {account.role === 'admin' ? 'Administración' : 'Cliente'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
