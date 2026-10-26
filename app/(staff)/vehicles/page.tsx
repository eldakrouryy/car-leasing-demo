"use client";
import Link from "next/link";
import { useSession } from "@/lib/session";
import { formatAmount, formatKm } from "@/lib/format";
import { Fade, PlateBadge, StatusBadge } from "@/components/ui/basics";

export default function VehiclesPage() {
  const { db } = useSession();
  if (!db) return null;
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <Fade><h1 className="text-2xl font-bold">السيارات</h1><p className="text-sm text-muted">{db.vehicles.length} سيارة</p></Fade>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {db.vehicles.map((v, i) => (
          <Fade key={v.id} delay={i * 0.03}>
            <Link href={`/vehicles/${v.id}`} className="block rounded-2xl border border-line bg-surface p-4 shadow-soft transition hover:border-brand hover:shadow-lift">
              <div className="flex items-start justify-between gap-2">
                <div><p className="font-bold">{v.make} {v.model}</p><p className="text-xs text-muted">{v.year} · {v.color} · {formatKm(v.mileage)}</p></div>
                <StatusBadge status={v.status} />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <PlateBadge ar={v.plateAr} en={v.plateEn} />
                <span className="num font-bold text-brand">{formatAmount(v.listPrice)}</span>
              </div>
            </Link>
          </Fade>
        ))}
      </div>
    </div>
  );
}
