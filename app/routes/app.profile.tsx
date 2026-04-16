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
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
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
    setOk("Vista previa lista. Guardá tu perfil para aplicar el cambio.");

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
      setOk("Tus datos se actualizaron correctamente.");
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
        <Card className="overflow-hidden border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
          <div className="h-20 bg-linear-to-r from-sky-100 via-lime-50 to-transparent" />
          <CardContent className="relative -mt-3 py-6 text-sm text-slate-600">
            Cargando información del perfil...
          </CardContent>
        </Card>
      ) : null}

      {!loading ? <StatusBanner error={error} ok={ok} /> : null}

      {!loading && me ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <div className="h-24 bg-linear-to-r from-sky-100 via-lime-50 to-transparent" />
            <CardHeader className="relative -mt-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <img
                    src={avatarSrc}
                    alt="Avatar"
                    className="h-18 w-18 rounded-2xl border border-slate-200 bg-stone-50 object-cover shadow-lg"
                  />
                  <div>
                    <CardTitle className="text-lg text-slate-900">
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
                  <label className="text-sm text-slate-700">Nombre</label>
                  <input
                    value={form.firstName}
                    onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-700">Apellido</label>
                  <input
                    value={form.lastname}
                    onChange={(event) => setForm((prev) => ({ ...prev, lastname: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-700">Email</label>
                  <input
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-slate-700">Avatar URL</label>
                  <input
                    value={form.avatarUrl}
                    onChange={(event) => setForm((prev) => ({ ...prev, avatarUrl: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-700">Subir foto de perfil</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarFileChange}
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                />
                <p className="text-xs text-zinc-500">
                  Podés subir una imagen desde tu equipo y verla al instante en tu perfil.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm leading-6 text-slate-600">
                Elegí una foto clara y actual para que tu perfil sea más fácil de reconocer.
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

          <Card className="overflow-hidden border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
            <div className="h-24 bg-linear-to-r from-amber-100 via-stone-50 to-transparent" />
            <CardHeader className="relative -mt-8">
              <CardTitle className="text-lg text-slate-900">Seguridad</CardTitle>
              <CardDescription>
                Actualizá tu contraseña para mantener protegida tu cuenta.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-slate-700">Contraseña actual</label>
                <input
                  type="password"
                  value={pass.currentPassword}
                  onChange={(event) => setPass((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-700">Nueva contraseña</label>
                  <input
                    type="password"
                    value={pass.newPassword}
                    onChange={(event) => setPass((prev) => ({ ...prev, newPassword: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-700">Repetir contraseña</label>
                  <input
                    type="password"
                    value={pass.repeatPassword}
                    onChange={(event) => setPass((prev) => ({ ...prev, repeatPassword: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-300 focus:bg-white"
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-stone-50 px-4 py-4 text-sm leading-6 text-slate-600">
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

