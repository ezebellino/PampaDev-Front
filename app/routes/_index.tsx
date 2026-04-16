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
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#f8f9ff] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_24%),radial-gradient(circle_at_top_right,rgba(163,230,53,0.10),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,244,236,0.92)_55%,rgba(239,246,245,0.96))]" />

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
