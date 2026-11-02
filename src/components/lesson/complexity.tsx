import { GaugeIcon } from "lucide-react";

export function Complexity({ time, space, why }: { time: string; space: string; why?: string }) {
  return (
    <section aria-label="Complexity" className="bg-card my-6 rounded-xl border p-5">
      <p className="flex items-center gap-2 font-semibold">
        <GaugeIcon className="text-primary size-4" aria-hidden="true" /> How fast is it?
      </p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="bg-muted rounded-lg p-3">
          <dt className="text-muted-foreground text-xs font-semibold uppercase">Time</dt>
          <dd className="mt-1 font-mono text-sm font-semibold">{time}</dd>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <dt className="text-muted-foreground text-xs font-semibold uppercase">Space</dt>
          <dd className="mt-1 font-mono text-sm font-semibold">{space}</dd>
        </div>
      </dl>
      {why ? (
        <p className="text-muted-foreground mt-3 text-sm">
          <span className="text-foreground font-medium">Why: </span>
          {why}
        </p>
      ) : null}
    </section>
  );
}
