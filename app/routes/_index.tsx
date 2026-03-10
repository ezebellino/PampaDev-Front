import HomeFeatures from "~/components/home/HomeFeatures";
import HomeHero from "~/components/home/HomeHero";
import HomeStats from "~/components/home/HomeStats";
import Footer from "~/components/layout/Footer";
import { useBranches } from "~/lib/api/hooks/useBranches";
import { useAuth } from "~/lib/auth/AuthContext";
import { useDisciplinesPublic } from "~/lib/disciplines/useDisciplinesPublic";

export default function Home() {
  const { isAuthed, user } = useAuth();
  const { data: branches, loading: branchesLoading } = useBranches();
  const {
    data: disciplines,
    loading: disciplinesLoading,
    forbidden: disciplinesForbidden,
  } = useDisciplinesPublic();

  const branchesCount = branches?.length ?? 0;
  const disciplinesCount = disciplines?.length ?? 0;

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_32%),linear-gradient(180deg,rgba(24,24,27,0.25),rgba(9,9,11,0.9))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[linear-gradient(to_bottom,rgba(56,189,248,0.08),transparent)]" />

      <div className="relative flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-16">
          <HomeHero isAuthed={isAuthed} user={user} />
          <HomeStats
            branchesCount={branchesCount}
            disciplinesCount={disciplinesCount}
            branchesLoading={branchesLoading}
            disciplinesLoading={disciplinesLoading}
            disciplinesForbidden={disciplinesForbidden}
          />
          <HomeFeatures />
        </div>
      </div>

      <div className="relative">
        <Footer />
      </div>
    </main>
  );
}
