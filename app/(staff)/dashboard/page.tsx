"use client";
import Link from "next/link";
import { AlertTriangle, CalendarClock, Car, Clock } from "lucide-react";
import { getAging, getDueItems, getFleetCounts, getPortfolioSummary } from "@/lib/domain/portfolio";
import { todayISO } from "@/lib/domain/dates";
import { can } from "@/lib/permissions";
import { useSession } from "@/lib/session";
import { formatAmount, formatMoney } from "@/lib/format";
import { Card, Fade, Stat, statusLabel } from "@/components/ui/basics";

export default function DashboardPage() {
  const { db, role } = useSession();
  if (!db || !role) return null;
  const today = todayISO();
  const s = getPortfolioSummary(db.contracts, today);
  const aging = getAging(db.contracts, today);
  const dueToday = getDueItems(db.contracts, today, 0, 0).length;
  const dueSoon = getDueItems(db.contracts, today, 0, 3).length;
  const fleet = getFleetCounts(db.vehicles);
  const money = can(role, "payments.view");
  const fleetVisible = can(role, "vehicles.view");

  const strip = [
    { icon: Clock, label: "مستحق اليوم", value: dueToday, href: "/contracts?f=active" },
    { icon: CalendarClock, label: "مستحق خلال 3 أيام", value: dueSoon, href: "/contracts?f=active" },
    { icon: AlertTriangle, label: "عقود تنتهي خلال 3 أيام", value: s.endingSoonCount, href: "/contracts?f=ending" },
  ];
  const bucketLabel = { b1_7: "1–7 أيام", b8_30: "8–30 يوماً", b30_plus: "+30 يوماً" } as const;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Fade>
        <h1 className="text-2xl font-bold">لوحة اليوم</h1>
        <p className="text-sm text-muted">{new Date().toLocaleDateString("ar-SA", { weekday: "long", day: "numeric", month: "long" })}</p>
      </Fade>
      <Fade delay={0.05} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {strip.map(({ icon: Icon, label, value, href }) => (
          <Link key={label} href={href} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-brand hover:shadow-lift">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand"><Icon size={20} /></span>
            <span className="flex-1 text-sm font-medium">{label}</span>
            <span className="num text-2xl font-bold text-brand">{value}</span>
          </Link>
        ))}
      </Fade>
      <Fade delay={0.1} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {money && (
          <Card dark className="col-span-2 row-span-2 flex flex-col justify-between">
            <p className="text-sm text-shell-muted">إجمالي المتبقي للتحصيل</p>
            <p className="num text-4xl font-bold lg:text-5xl">{formatAmount(s.totalRemaining)} <span className="text-base font-medium text-shell-muted">ر.س</span></p>
            <div className="mt-4 flex gap-6 text-sm">
              <span><span className="text-shell-muted">متأخر: </span><span className="num font-bold text-brand">{formatMoney(s.overdueTotal)}</span></span>
              <span><span className="text-shell-muted">مستحق الشهر: </span><span className="num font-bold">{formatMoney(s.dueThisMonth)}</span></span>
            </div>
          </Card>
        )}
        {money && <Stat label="المحصّل هذا الشهر" value={formatMoney(s.collectedThisMonth)} sub={`نسبة التحصيل ${Math.round(s.collectionRate * 100)}%`} accent />}
        <Stat label="عقود نشطة" value={String(s.activeCount)} sub={`${s.pendingApprovalCount} بانتظار الاعتماد`} />
        <Stat label="عقود متأخرة" value={String(s.overdueCount)} sub={`${s.ownedCount} مسددة`} className={s.overdueCount ? "border-danger/40" : ""} />
        {money && (
          <Card className="col-span-2">
            <p className="mb-3 text-xs text-muted">أعمار المتأخرات</p>
            <div className="grid grid-cols-3 gap-2">
              {aging.map((a) => (
                <div key={a.bucket} className="rounded-xl bg-neutral-soft p-3">
                  <p className="text-[11px] text-muted">{bucketLabel[a.bucket]}</p>
                  <p className="num text-lg font-bold">{a.count}</p>
                  <p className="num text-xs text-danger">{formatAmount(a.amount)}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
        {fleetVisible && (
          <Card className="col-span-2">
            <div className="mb-3 flex items-center gap-2 text-xs text-muted"><Car size={14} /> حالة الأسطول</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(fleet).filter(([, n]) => n > 0).map(([k, n]) => (
                <Link key={k} href="/vehicles" className="rounded-full border border-line px-3 py-1 text-xs"><span className="num font-bold">{n}</span> {statusLabel(k)}</Link>
              ))}
            </div>
          </Card>
        )}
      </Fade>
    </div>
  );
}
