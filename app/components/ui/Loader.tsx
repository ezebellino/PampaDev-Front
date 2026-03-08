type Props = {
  label?: string;
  className?: string;
};

export default function Loader({ label = "Cargando…", className }: Props) {
  return (
    <div className={["flex items-center gap-3 text-sm text-zinc-400", className ?? ""].join(" ")}>
      <span
        className="h-4 w-4 rounded-full border border-zinc-700 border-t-zinc-200 animate-spin"
        aria-hidden
      />
      <span>{label}</span>
    </div>
  );
}