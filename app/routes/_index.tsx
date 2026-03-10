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
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-12 md:py-20">
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

      <Footer />
    </main>
  );
}
