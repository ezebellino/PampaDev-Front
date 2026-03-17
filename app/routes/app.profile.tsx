import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { useAuth } from "../lib/auth/AuthContext";
import { changePassword, getMe, updateUser } from "../lib/api/services/users";

type FormState = {
  firstName: string;
  lastname: string;
  email: string;
  avatarUrl: string;
};

function StatusBanner({
  error,
  ok,
}: {
  error: string | null;
  ok: string | null;
}) {
  if (!error && !ok) return null;

  const isError = !!error;

  return (
    <div
      className={`rounded-3xl border px-5 py-4 text-sm ${
        isError
          ? "border-red-500/20 bg-red-500/10 text-red-200"
          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
      }`}
    >
      {error ?? ok}
    </div>
  );
}

export default function ProfilePage() {
  const { user, updateProfile, refreshMe } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);

  const [me, setMe] = useState<Awaited<ReturnType<typeof getMe>> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastname: "",
    email: "",
    avatarUrl: user?.avatarUrl ?? "",
  });

  function readFileAsDataURL(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Error al leer la imagen"));
      };
      reader.onerror = () => reject(new Error("No se puede leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function onAvatarFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona un archivo de imagen válido.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es muy grande. Máximo 5MB.");
      return;
    }

    setError(null);
    setOk("Vista previa lista. Guardá tu perfil para persistir localmente.");

    const dataUrl = await readFileAsDataURL(file);

    setAvatarFile(file);
    setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
  }

  const [pass, setPass] = useState({
    currentPassword: "",
    newPassword: "",
    repeatPassword: "",
  });

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setOk(null);

    getMe()
      .then((data) => {
        if (!alive) return;
        setMe(data);

        const savedAvatar = localStorage.getItem(`pampaDev-avatar-${data.idUser}`);

        setForm((prev) => ({
          ...prev,
          firstName: data.firstName ?? "",
          lastname: data.lastname ?? "",
          email: data.email ?? "",
          avatarUrl: savedAvatar ?? prev.avatarUrl,
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

  const avatarSrc = useMemo(() => {
    const avatar = form.avatarUrl?.trim() || user?.avatarUrl?.trim();
    return avatar || "https://i.pravatar.cc/150?img=8";
  }, [form.avatarUrl, user?.avatarUrl]);

  if (!user) return null;

  async function onSaveProfile() {
    if (!me) return;
    setSaving(true);
    setError(null);
    setOk(null);

    try {
      await updateUser(me.idUser, {
        firstName: form.firstName.trim(),
        lastname: form.lastname.trim(),
        email: form.email.trim(),
        idRole: me.idRole,
        idCity: me.idCity,
      });

      const activeAvatar = form.avatarUrl.trim();

      updateProfile({
        name: `${form.firstName.trim()} ${form.lastname.trim()}`.trim(),
        avatarUrl: activeAvatar || undefined,
      });

      if (avatarFile || activeAvatar.startsWith("data:image/")) {
        localStorage.setItem(`pampaDev-avatar-${me.idUser}`, activeAvatar);
      }

      await refreshMe();
      setOk("Tus datos se actualizaron correctamente. La foto se guarda localmente hasta que el backend esté disponible para subir archivos.");
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword() {
    if (!me) return;

    setChangingPass(true);
    setError(null);
    setOk(null);

    try {
      if (pass.newPassword !== pass.repeatPassword) {
        setError("La nueva contraseña y su repetición no coinciden.");
        return;
      }

      await changePassword(me.idUser, {
        currentPassword: pass.currentPassword,
        newPassword: pass.newPassword,
        repeatPassword: pass.repeatPassword,
      });

      setOk("Tu contraseña se actualizó correctamente.");
      setPass({ currentPassword: "", newPassword: "", repeatPassword: "" });
    } catch (e: any) {
      setError(e?.message || "No se pudo cambiar la contraseña.");
    } finally {
      setChangingPass(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil"
        subtitle="Revisá tus datos personales, mantené tu información actualizada y gestioná el acceso a tu cuenta."
      />

      {loading ? (
        <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
          <div className="h-20 bg-linear-to-r from-cyan-500/14 to-transparent" />
          <CardContent className="relative -mt-3 py-6 text-sm text-zinc-400">
            Cargando información del perfil...
          </CardContent>
        </Card>
      ) : null}

      {!loading ? <StatusBanner error={error} ok={ok} /> : null}

      {!loading && me ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
            <div className="h-24 bg-linear-to-r from-cyan-500/14 to-transparent" />
            <CardHeader className="relative -mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="h-18 w-18 rounded-2xl border border-zinc-800 bg-zinc-900 object-cover shadow-lg"
                  />
                  <div>
                    <CardTitle className="text-lg text-zinc-100">
                      {form.firstName || user.name} {form.lastname}
                    </CardTitle>
                    <CardDescription>{form.email || user.email}</CardDescription>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge>Rol: {me.roleName}</Badge>
                  <Badge tone="neutral">Ciudad: {me.cityName}</Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Nombre</label>
                  <input
                    value={form.firstName}
                    onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Apellido</label>
                  <input
                    value={form.lastname}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastname: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Email</label>
                  <input
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Avatar URL</label>
                  <input
                    value={form.avatarUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Subir foto de perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarFileChange}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                />
                <p className="text-xs text-zinc-500">
                  Puedes subir una imagen desde tu equipo. En esta versión se guarda localmente en el navegador y se ve en vista previa; el endpoint de subida de archivos está pendiente en backend.
                </p>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm leading-6 text-zinc-400">
                Ahora podés subir una imagen de perfil directamente. Se renderiza en vista previa y se guarda localmente hasta que el backend soporte un endpoint REST dedicado.
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="ghost"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      firstName: me.firstName ?? "",
                      lastname: me.lastname ?? "",
                      email: me.email ?? "",
                      avatarUrl: user.avatarUrl ?? "",
                    }))
                  }
                >
                  Descartar cambios
                </Button>

                <Button onClick={onSaveProfile} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar perfil"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-zinc-800 bg-zinc-950/75">
            <div className="h-24 bg-linear-to-r from-amber-500/14 to-transparent" />
            <CardHeader className="relative -mt-8">
              <CardTitle className="text-lg text-zinc-100">Seguridad</CardTitle>
              <CardDescription>
                Actualizá tu contraseña para mantener protegida tu cuenta.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">Contraseña actual</label>
                <input
                  type="password"
                  value={pass.currentPassword}
                  onChange={(event) => setPass((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Nueva contraseña</label>
                  <input
                    type="password"
                    value={pass.newPassword}
                    onChange={(event) => setPass((prev) => ({ ...prev, newPassword: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Repetir contraseña</label>
                  <input
                    type="password"
                    value={pass.repeatPassword}
                    onChange={(event) => setPass((prev) => ({ ...prev, repeatPassword: event.target.value }))}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm leading-6 text-zinc-400">
                Elegí una contraseña fácil de recordar para vos, pero difícil de adivinar para otros.
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={onChangePassword} disabled={changingPass}>
                  {changingPass ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
