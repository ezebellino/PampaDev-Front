import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { getCities, getCountries, getProvinces, type City, type Country, type Province } from "../lib/api/services/locations";
import { createUserPublic } from "../lib/api/services/users";

const PUBLIC_USER_ROLE_ID = 4;

type RegisterFormState = {
  firstName: string;
  lastname: string;
  email: string;
  password: string;
  repeatPassword: string;
  countryName: string;
  provinceName: string;
  cityId: string;
};

const INITIAL_FORM: RegisterFormState = {
  firstName: "",
  lastname: "",
  email: "",
  password: "",
  repeatPassword: "",
  countryName: "",
  provinceName: "",
  cityId: "",
};

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>(INITIAL_FORM);
  const [countries, setCountries] = useState<Country[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadLocations() {
      setLoadingLocations(true);
      setError(null);

      try {
        const [countriesData, provincesData, citiesData] = await Promise.all([
          getCountries(),
          getProvinces(),
          getCities(),
        ]);

        if (!alive) return;

        setCountries(countriesData);
        setProvinces(provincesData);
        setCities(citiesData);

        const defaultCountry = countriesData[0]?.name ?? "";
        const firstProvince = provincesData.find((province) => province.countryName === defaultCountry)?.name ?? "";
        const firstCity = citiesData.find((city) => city.provinceName === firstProvince)?.idCity;

        setForm((previous) => ({
          ...previous,
          countryName: previous.countryName || defaultCountry,
          provinceName: previous.provinceName || firstProvince,
          cityId: previous.cityId || (firstCity ? String(firstCity) : ""),
        }));
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "No pudimos cargar la informaci?n de ubicaci?n.");
      } finally {
        if (alive) {
          setLoadingLocations(false);
        }
      }
    }

    void loadLocations();

    return () => {
      alive = false;
    };
  }, []);

  const filteredProvinces = useMemo(
    () => provinces.filter((province) => province.countryName === form.countryName),
    [provinces, form.countryName]
  );

  const filteredCities = useMemo(
    () => cities.filter((city) => city.provinceName === form.provinceName),
    [cities, form.provinceName]
  );

  function updateField<K extends keyof RegisterFormState>(key: K, value: RegisterFormState[K]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function handleCountryChange(value: string) {
    const nextProvince = provinces.find((province) => province.countryName === value)?.name ?? "";
    const nextCity = cities.find((city) => city.provinceName === nextProvince)?.idCity;

    setForm((previous) => ({
      ...previous,
      countryName: value,
      provinceName: nextProvince,
      cityId: nextCity ? String(nextCity) : "",
    }));
  }

  function handleProvinceChange(value: string) {
    const nextCity = cities.find((city) => city.provinceName === value)?.idCity;

    setForm((previous) => ({
      ...previous,
      provinceName: value,
      cityId: nextCity ? String(nextCity) : "",
    }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;

    setError(null);

    const payload = {
      firstName: form.firstName.trim(),
      lastname: form.lastname.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
      repeatPassword: form.repeatPassword,
      idCity: Number(form.cityId),
    };

    if (!payload.firstName || !payload.lastname || !payload.email || !payload.password) {
      setError("Complet? todos los campos obligatorios.");
      return;
    }

    if (!isValidEmail(payload.email)) {
      setError("Ingres? un email v?lido.");
      return;
    }

    if (payload.password.length < 6) {
      setError("La contrase?a debe tener al menos 6 caracteres.");
      return;
    }

    if (payload.password !== payload.repeatPassword) {
      setError("La contrase?a y su repetici?n no coinciden.");
      return;
    }

    if (!payload.idCity) {
      setError("Seleccion? una ciudad para continuar.");
      return;
    }

    setLoading(true);

    try {
      await createUserPublic({
        firstName: payload.firstName,
        lastname: payload.lastname,
        email: payload.email,
        password: payload.password,
        idRole: PUBLIC_USER_ROLE_ID,
        idCity: payload.idCity,
      });

      setCreated(true);
    } catch (e: any) {
      setError(e?.message || "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_26%),linear-gradient(180deg,rgba(24,24,27,0.2),rgba(9,9,11,0.96))]" />

      <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-6">
          <div className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/75 px-3 py-1 text-xs font-medium text-zinc-300">
            Nuevo acceso
          </div>

          <div className="space-y-3">
            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl md:leading-tight">
              Cre? tu cuenta.
            </h1>
            <p className="max-w-md text-base leading-7 text-zinc-400">
              El registro p?blico crea cuentas de usuario.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/45 px-4 py-4 text-sm text-zinc-300">
            Complet? tus datos y eleg? tu ubicaci?n.
          </div>
        </section>

        <Card className="border-zinc-800 bg-zinc-950/88 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <CardHeader className="space-y-2 pb-2">
            <CardTitle className="text-2xl text-zinc-100">Crear cuenta</CardTitle>
            <CardDescription>Complet? tus datos.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {created ? (
              <div className="space-y-4">
                <div className="rounded-[1.25rem] border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm leading-6 text-emerald-100">
                  Tu cuenta ya est? lista.
                </div>

                <div className="grid gap-2">
                  <Button className="w-full" onClick={() => navigate("/login")}>
                    Ir a login
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      setCreated(false);
                      setForm(INITIAL_FORM);
                    }}
                  >
                    Crear otra cuenta
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Nombre</label>
                    <input
                      value={form.firstName}
                      onChange={(event) => updateField("firstName", event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Apellido</label>
                    <input
                      value={form.lastname}
                      onChange={(event) => updateField("lastname", event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300">Email</label>
                  <input
                    value={form.email}
                    onChange={(event) => updateField("email", event.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                    autoComplete="email"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Contrase?a</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(event) => updateField("password", event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Repetir contrase?a</label>
                    <input
                      type="password"
                      value={form.repeatPassword}
                      onChange={(event) => updateField("repeatPassword", event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Pa?s</label>
                    <select
                      value={form.countryName}
                      onChange={(event) => handleCountryChange(event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                      disabled={loadingLocations}
                    >
                      <option value="">Seleccionar</option>
                      {countries.map((country) => (
                        <option key={country.idCountry} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Provincia</label>
                    <select
                      value={form.provinceName}
                      onChange={(event) => handleProvinceChange(event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                      disabled={loadingLocations || filteredProvinces.length === 0}
                    >
                      <option value="">Seleccionar</option>
                      {filteredProvinces.map((province) => (
                        <option key={province.idProvince} value={province.name}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-zinc-300">Ciudad</label>
                    <select
                      value={form.cityId}
                      onChange={(event) => updateField("cityId", event.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-3 text-sm outline-none transition focus:border-emerald-500/50"
                      disabled={loadingLocations || filteredCities.length === 0}
                    >
                      <option value="">Seleccionar</option>
                      {filteredCities.map((city) => (
                        <option key={city.idCity} value={city.idCity}>
                          {city.name} ({city.postCode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}

                <Button className="w-full" disabled={loading || loadingLocations}>
                  {loading ? "Creando cuenta..." : "Crear cuenta"}
                </Button>

                <div className="grid gap-2 pt-2">
                  <Button type="button" variant="secondary" className="w-full" onClick={() => navigate("/login")}>
                    Volver a login
                  </Button>

                  <Link
                    to="/"
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900"
                  >
                    Volver al sitio
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
