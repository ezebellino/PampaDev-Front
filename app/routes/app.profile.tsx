import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../lib/auth/AuthContext";
import { changePassword, getMe, updateUser } from "../lib/api/services/users";

import { PageHeader } from "../components/ui/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

type FormState = {
  firstName: string;
  lastname: string;
  email: string;
  avatarUrl: string; // frontend-only
};

export default function ProfilePage() {
  const { user, updateProfile, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [me, setMe] = useState<Awaited<ReturnType<typeof getMe>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastname: "",
    email: "",
    avatarUrl: user?.avatarUrl ?? "",
  });

  const [pass, setPass] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  // 1) Cargar /me al entrar
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setOk(null);

    getMe()
      .then((data) => {
        if (!alive) return;
        setMe(data);
        setForm((prev) => ({
          ...prev,
          firstName: data.firstName ?? "",
          lastname: data.lastname ?? "",
          email: data.email ?? "",
        }));
      })
      .catch((e: any) => {
        if (!alive) return;
        setError(e?.message || "No se pudo cargar tu perfil.");
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  // 2) Derivados
  const avatarSrc = useMemo(() => {
    const a = form.avatarUrl?.trim() || user?.avatarUrl?.trim();
    return a || "https://i.pravatar.cc/150?img=8";
  }, [form.avatarUrl, user?.avatarUrl]);

  if (!user) return null;

  async function onSaveProfile() {
    if (!me) return;
    setSaving(true);
    setError(null);
    setOk(null);

    try {
      // backend requiere idRole/idCity → los mantenemos desde /me (no los tocamos acá)
      await updateUser(me.idUser, {
        firstName: form.firstName.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        idRole: me.idRole,
        idCity: me.idCity,
      });

      // avatarUrl sigue siendo local
      updateProfile({
        name: `${form.firstName.trim()} ${form.lastname.trim()}`.trim(),
        avatarUrl: form.avatarUrl.trim() || undefined,
      });

      // refrescar store con /me (por si backend normaliza mail/nombre)
      await refreshMe();

      setOk("Perfil actualizado.");
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    setChangingPass(true);
    setError(null);
    setOk(null);

    try {
      if (pass.newPassword !== pass.repeatPassword) {
        setError("La nueva contraseña y su repetición no coinciden.");
        return;
      }

      await changePassword({
        currentPassword: pass.currentPassword,
        newPassword: pass.newPassword,
        repeatPassword: pass.repeatPassword,
      });

      setOk("Contraseña actualizada.");
      setPass({ currentPassword: "", newPassword: "", repeatPassword: "" });
    } catch (e: any) {
      setError(e?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setChangingPass(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Perfil" subtitle="Datos reales desde /api/Users/me" />

      {loading && (
        <Card>
          <CardContent className="py-6 text-sm text-zinc-400">Cargando perfil...</CardContent>
        </Card>
      )}

      {!loading && (error || ok) && (
        <Card>
          <CardContent className="py-4">
            {error && <div className="text-sm text-red-300">{error}</div>}
            {ok && <div className="text-sm text-emerald-300">{ok}</div>}
          </CardContent>
        </Card>
      )}

      {!loading && me && (
        <>
          {/* Datos básicos */}
          <Card>
            <CardHeader>
              <CardTitle>Datos básicos</CardTitle>
              <CardDescription>Actualiza nombre y email. Rol y ciudad son informativos por ahora.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={avatarSrc}
                  alt="Avatar"
                  className="h-12 w-12 rounded-full border border-zinc-800 object-cover"
                />
                <div className="text-sm text-zinc-400">
                  Avatar es <span className="text-zinc-200">frontend-only</span> por ahora (URL).
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Nombre</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Apellido</label>
                  <input
                    value={form.lastname}
                    onChange={(e) => setForm((p) => ({ ...p, lastname: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Email</label>
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Avatar URL</label>
                  <input
                    value={form.avatarUrl}
                    onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Badge>Rol: {me.roleName}</Badge>
                <Badge tone="neutral">Ciudad: {me.cityName}</Badge>
                <Badge tone="neutral">ID: {me.idUser}</Badge>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      firstName: me.firstName ?? "",
                      lastname: me.lastname ?? "",
                      email: me.email ?? "",
                      avatarUrl: user.avatarUrl ?? "",
                    }))
                  }
                >
                  Cancelar
                </Button>

                <Button onClick={onSaveProfile} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader>
              <CardTitle>Cambiar contraseña</CardTitle>
              <CardDescription>Usa PUT /api/Users/password</CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <input
                type="password"
                value={pass.currentPassword}
                onChange={(e) => setPass((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Contraseña actual"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
              />
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="password"
                  value={pass.newPassword}
                  onChange={(e) => setPass((p) => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Nueva contraseña"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                />
                <input
                  type="password"
                  value={pass.repeatPassword}
                  onChange={(e) => setPass((p) => ({ ...p, repeatPassword: e.target.value }))}
                  placeholder="Repetir nueva contraseña"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={onChangePassword} disabled={changingPass}>
                  {changingPass ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}