'use client';

import { ShieldCheck, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ManagedUser { id: string, email: string, role: 'admin' | 'editor' | 'user', role_version: number }

const roleLabel = { admin: 'Administrador', editor: 'Editor', user: 'Usuario' };
const roleVariant = { admin: 'default', editor: 'secondary', user: 'outline' } as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [error, setError] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [nextOffset, setNextOffset] = useState<number | null>(null);

  const loadUsers = async (nextPageOffset = 0) => {
    setError('');
    const response = await fetch(`/api/admin/users?offset=${nextPageOffset}`);
    const payload = await response.json();
    if (!response.ok) { setError(payload.error ?? 'No se ha podido cargar usuarios.'); return; }
    setUsers(payload.users);
    setOffset(nextPageOffset);
    setNextOffset(payload.nextOffset);
  };

  const updateRole = async (user: ManagedUser, role: ManagedUser['role']) => {
    setPendingId(user.id);
    setError('');
    const response = await fetch(`/api/admin/users/${user.id}/role`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, expectedRoleVersion: user.role_version }) });
    const payload = await response.json();
    if (!response.ok) { setError(payload.error ?? 'No se ha podido actualizar el rol.'); }
    else { setUsers(current => current.map(item => item.id === user.id ? payload.user : item)); }
    setPendingId(null);
  };

  useEffect(() => { void loadUsers(); }, []);

  const adminCount = users.filter(user => user.role === 'admin').length;

  return (
    <main className="mx-auto w-full max-w-5xl space-y-6" data-testid="adminUsersPage">
      <section className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Badge variant="secondary">Administración</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Usuarios y permisos</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">Gestiona roles de plataforma. Los cambios se aplican en la siguiente petición y quedan auditados.</p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-muted px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-medium">Acceso protegido</p>
            <p className="text-xs text-muted-foreground">Solo administradores</p>
          </div>
        </div>
      </section>
      {error ? <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive" data-testid="role_change_error">{error}</p> : null}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-primary/10 p-3 text-primary"><Users className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-semibold">{users.length}</p>
              <p className="text-sm text-muted-foreground">Usuarios en esta página</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-semibold">{adminCount}</p>
              <p className="text-sm text-muted-foreground">Administradores visibles</p>
            </div>
          </CardContent>
        </Card>
      </section>
      <Card>
        <CardHeader><CardTitle>Directorio de usuarios</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="border-b text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Usuario</th>
                  <th className="px-3 py-3">Rol actual</th>
                  <th className="px-3 py-3">Nuevo rol</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr className="border-b last:border-0" key={user.id}>
                    <td className="px-3 py-4 font-medium">{user.email}</td>
                    <td className="px-3 py-4"><Badge variant={roleVariant[user.role]}>{roleLabel[user.role]}</Badge></td>
                    <td className="px-3 py-4">
                      <select className="h-9 rounded-md border border-input bg-background px-3" data-testid="user_role_select" aria-label={`Rol de ${user.email}`} defaultValue={user.role} disabled={pendingId === user.id} onChange={event => void updateRole(user, event.target.value as ManagedUser['role'])}>
                        <option value="user">Usuario</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <p className="text-xs text-muted-foreground">
              Página
              {Math.floor(offset / 25) + 1}
            </p>
            <div className="flex gap-2">
              <Button data-testid="previous_page_button" disabled={offset === 0} onClick={() => void loadUsers(Math.max(0, offset - 25))} size="sm" variant="outline">Anterior</Button>
              <Button data-testid="next_page_button" disabled={nextOffset === null} onClick={() => void loadUsers(nextOffset ?? offset)} size="sm" variant="outline">Siguiente</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
