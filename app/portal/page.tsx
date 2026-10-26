"use client";
import { Bell, Car } from "lucide-react";
import { getContractBalances } from "@/lib/domain/balances";
import { todayISO } from "@/lib/domain/dates";
import { useSession } from "@/lib/session";
import { useAlerts } from "@/lib/useAlerts";
import { formatAmount, formatDate, formatMoney, formatPhone, maskNationalId } from "@/lib/format";
import { Card, Fade, PaymentRing, PlateBadge, StatusBadge } from "@/components/ui/basics";
import { cn } from "@/lib/utils";

export default function PortalPage() {
  const { db, customerId } = useSession();
  const { alerts } = useAlerts();
  if (!db || !customerId) return null;
  const customer = db.customers.find((c) => c.id === customerId)!;
  const contract = db.contracts.find((c) => c.customerId === customerId && ["active", "overdue"].includes(c.status)) ?? db.contracts.find((c) => c.customerId === customerId);
  if (!contract) return <p className="py-10 text-center text-muted">لا يوجد عقد نشط</p>;
  const today = todayISO();
  const b = getContractBalances(contract, today);
  const v = db.vehicles.find((x) => x.id === contract.vehicleId)!;
  const next = b.nextInstallment;
  const pct = Math.round(b.progress * 100);

  return (
    <div className="space-y-4 pt-2">
      <Fade>
        <div id="home" />
        <p className="text-sm text-muted">أهلاً بك</p>
        <h1 className="text-2xl font-bold">{customer.fullName.split(" ")[0]} 👋</h1>
      </Fade>
      <Fade delay={0.05}>
        <Card dark className="flex items-center gap-4">
          <PaymentRing progress={b.progress} remaining={b.remaining} size={130} stroke={10} dark />
          <div className="flex-1">
            <p className="text-lg font-bold leading-snug">سددت <span className="num text-brand">{pct}%</span> من سيارتك</p>
            <p className="mt-1 text-xs text-shell-muted">{b.paidCount} من {contract.installments.length} قسط</p>
            <p className="num mt-3 text-xs text-shell-muted">المدفوع {formatAmount(b.paid)} ر.س</p>
          </div>
        </Card>
      </Fade>
      {next && (
        <Fade delay={0.1}>
          <div className="rounded-2xl bg-brand p-5 text-white shadow-lift">
            <p className="text-sm opacity-90">{b.overdueAmount > 0 ? "قسط متأخر" : "القسط القادم"}</p>
            <div className="mt-1 flex items-end justify-between">
              <p className="num text-3xl font-bold">{formatAmount(next.amount - next.paidAmount)} <span className="text-sm font-medium">ر.س</span></p>
              <p className="num text-end text-sm">{b.daysToNext === 0 ? "مستحق اليوم" : b.daysToNext !== null && b.daysToNext > 0 ? `بعد ${b.daysToNext} يوم` : `متأخر ${b.daysOverdue} يوم`}<br /><span className="opacity-80">{formatDate(next.dueDate)}</span></p>
            </div>
            <p className="num mt-3 rounded-xl bg-white/15 px-3 py-2 text-xs">سداد: رمز المفوتر 301 · رقم العقد {contract.number}</p>
          </div>
        </Fade>
      )}
      <Fade delay={0.15}>
        <Card className="flex items-center gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-white" style={{ background: v.colorHex }}><Car size={28} /></span>
          <div className="flex-1"><p className="font-bold">{v.make} {v.model}</p><p className="text-xs text-muted">{v.year} · {v.color}</p></div>
          <PlateBadge ar={v.plateAr} en={v.plateEn} />
        </Card>
      </Fade>
      {alerts.length > 0 && (
        <Fade delay={0.2} className="space-y-2">
          {alerts.map((a) => (
            <div key={a.id} className={cn("flex items-start gap-3 rounded-2xl border p-4 text-sm", a.severity === "critical" ? "border-danger/30 bg-danger-soft" : "border-line bg-surface")}>
              <Bell size={16} className="mt-0.5 shrink-0 text-brand" />
              <span><span className="block font-semibold">{a.customerTitle ?? a.title}</span><span className="block text-xs text-muted">{a.customerBody ?? a.body}</span></span>
            </div>
          ))}
        </Fade>
      )}
      <section id="installments" className="scroll-mt-20 space-y-2 pt-4">
        <h2 className="text-lg font-bold">أقساطي</h2>
        <Card className="divide-y divide-line p-0">
          {contract.installments.map((i) => (
            <div key={i.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", i.status === "paid" ? "bg-success" : i.status === "overdue" ? "bg-danger" : i.status === "due" || i.status === "partial" ? "bg-brand" : "bg-line")} />
              <span className="num w-8 text-muted">#{i.seq}</span>
              <span className="num flex-1">{formatDate(i.dueDate)}</span>
              <span className="num font-semibold">{formatAmount(i.amount)}</span>
              <StatusBadge status={i.status} />
            </div>
          ))}
        </Card>
      </section>
      <section id="account" className="scroll-mt-20 space-y-2 pt-4">
        <h2 className="text-lg font-bold">حسابي</h2>
        <Card className="space-y-2 text-sm">
          <Row k="الاسم" v={customer.fullName} />
          <Row k="رقم الهوية" v={maskNationalId(customer.nationalId)} />
          <Row k="الجوال" v={formatPhone(customer.phone)} />
          <Row k="رقم العقد" v={contract.number} />
          <Row k="إجمالي العقد" v={formatMoney(b.contractTotal)} />
          <Row k="المتبقي" v={formatMoney(b.remaining)} />
        </Card>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><span className="text-muted">{k}</span><span className="num font-semibold" dir="auto">{v}</span></div>;
}
