"use client";

/**
 * Header user area — login link when anonymous, account dropdown when
 * authenticated. Session identity arrives read-only from the server header
 * (cookie claims); logout is an inline server action clearing the cookie
 * and returning home.
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogInIcon, LogOutIcon, ReceiptTextIcon, UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOutAction } from '@/components/auth/actions';
import type { SessionRole } from '@/lib/auth/session';

interface UserMenuSession {
  fullName: string;
  email: string;
  role: SessionRole;
}

export function UserMenu({
  session,
  className,
}: {
  session: UserMenuSession | null;
  className?: string;
}) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  if (!session) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={className}
        nativeButton={false}
        render={<Link href="/login" />}
      >
        <LogInIcon data-icon="inline-start" />
        Iniciar sesión
      </Button>
    );
  }

  const roleLabel = session.role === 'admin' ? 'Administrador' : 'Cliente';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={className}
            disabled={signingOut}
          >
            <UserIcon data-icon="inline-start" />
            <span className="max-w-28 truncate">{session.fullName}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <span className="block text-sm font-semibold text-foreground">
              {session.fullName}
            </span>
            <span className="block truncate text-xs font-normal">{session.email}</span>
          </DropdownMenuLabel>
          <div className="flex items-center gap-2 px-1.5 py-1">
            <Badge variant="secondary">{roleLabel}</Badge>
            {session.role === 'customer' && (
              <span className="text-[10px] text-muted-foreground">
                rol vendedor pendiente en el dominio
              </span>
            )}
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/orders')}>
          <ReceiptTextIcon />
          Mis pedidos
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            setSigningOut(true);
            void signOutAction();
          }}
        >
          <LogOutIcon />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
