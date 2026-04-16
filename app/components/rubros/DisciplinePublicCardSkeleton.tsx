import { Card } from "../ui/Card";

export default function DisciplinePublicCardSkeleton() {
  return (
    <Card className="overflow-hidden rounded-[1.9rem] border border-slate-200 bg-white/96 shadow-[0_22px_50px_-40px_rgba(69,70,77,0.18)]">
      <div className="h-48 animate-pulse bg-[linear-gradient(135deg,rgba(224,242,254,0.9),rgba(255,255,255,1)_55%,rgba(236,253,245,0.7))] sm:h-52" />

      <div className="p-5">
        <div className="space-y-3">
          <div className="h-5 w-2/3 animate-pulse rounded-md bg-stone-200" />

          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-md bg-stone-100" />
            <div className="h-4 w-5/6 animate-pulse rounded-md bg-stone-100" />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200 sm:w-40" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-stone-100 sm:w-36" />
        </div>
      </div>
    </Card>
  );
}
