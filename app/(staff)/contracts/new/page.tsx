"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import type { Contract } from "@/types/domain";
import { formatContractNumber } from "@/lib/domain/contractNumber";
import { addMonthsISO, todayISO } from "@/lib/domain/dates";
import { calcContractTerms, generateSchedule } from "@/lib/domain/schedule";
import { appConfig } from "@/lib/config";
import { useSession } from "@/lib/session";
import { formatAmount, formatDateShort, formatMoney } from "@/lib/format";
import { Button, Card, Fade, Field, inputCls, PlateBadge } from "@/components/ui/basics";
import { cn } from "@/lib/utils";

export default function NewContractPage() {
  const router = useRouter();
  const { db, role, update } = useSession();
  const [customerId, setCustomerId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [down, setDown] = useState("");
  const [months, setMonths] = useState<number>(appConfig.defaultMonths);
  const [firstDue, setFirstDue] = useState(addMonthsISO(todayISO(), 1));
  const vehicle = db?.vehicles.find((v) => v.id === vehicleId);
  const price = vehicle?.listPrice ?? 0;
  const downPayment = Number(down) || 0;

  const terms = useMemo(() => {
    if (!price || downPayment >= price) return null;
    try { return calcContractTerms({ vehiclePrice: price, downPayment, months, vatRate: db?.settings.vatRate }); } catch { return null; }
  }, [price, downPayment, months, db?.settings.vatRate]);

  if (!db || !role) return null;
  const available = db.vehicles.filter((v) => v.status === "available");

  const save = () => {
    if (!customerId || !vehicle || !terms) return toast.error("أكمل بيانات العقد");
    let newId = "";
    update((d) => {
      const year = new Date().getFullYear();
      const seq = ++d.counters.contract;
      newId = `ct-${Date.now()}`;
      const installments = generateSchedule({ terms, firstDueDate: firstDue, idPrefix: newId });
      const c: Contract = {
        id: newId, number: formatContractNumber(year, seq), customerId, vehicleId: vehicle.id,
        vehiclePrice: price, downPayment, months, installmentAmount: terms.installment, vatRate: terms.vatRate,
        firstDueDate: firstDue, endDate: installments[installments.length - 1].dueDate, dueDay: Number(firstDue.slice(8, 10)),
        status: "pending_approval", createdAt: new Date().toISOString(), createdBy: role === "admin" ? "u-admin" : "u-sales1",
        termsSnapshot: d.settings.contractTemplate, installments, payments: [],
      };
      d.contracts.unshift(c);
      const v = d.vehicles.find((x) => x.id === vehicle.id); if (v) v.status = "reserved";
    });
    toast.success("تم إنشاء العقد وإرساله للاعتماد");
    router.push(`/contracts/${newId}`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Fade><h1 className="mb-5 text-2xl font-bold">عقد جديد</h1></Fade>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <Field label="العميل">
              <select className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                <option value="">اختر العميل…</option>
                {db.customers.map((c) => <option key={c.id} value={c.id}>{c.fullName} — {c.city}</option>)}
              </select>
            </Field>
          </Card>
          <Card>
            <p className="mb-3 text-xs font-semibold text-muted">السيارة المتاحة ({available.length})</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {available.map((v) => (
                <button key={v.id} onClick={() => setVehicleId(v.id)} className={cn("rounded-2xl border p-4 text-start transition", vehicleId === v.id ? "border-brand bg-brand-soft" : "border-line hover:border-ink")}>
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="font-bold">{v.make} {v.model}</p><p className="text-xs text-muted">{v.year} · {v.color}</p></div>
                    <span className="h-5 w-5 rounded-full border" style={{ background: v.colorHex }} />
                  </div>
                  <div className="mt-3 flex items-center justify-between"><PlateBadge ar={v.plateAr} en={v.plateEn} /><span className="num font-bold text-brand">{formatAmount(v.listPrice)}</span></div>
                </button>
              ))}
              {available.length === 0 && <p className="text-sm text-muted">لا توجد سيارات متاحة</p>}
            </div>
          </Card>
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label="الدفعة المقدمة (ر.س)"><input className={inputCls + " num"} type="number" inputMode="decimal" value={down} onChange={(e) => setDown(e.target.value)} placeholder={price ? String(Math.round(price * appConfig.defaultDownPaymentRatio)) : "0"} /></Field>
            <Field label="تاريخ أول قسط"><input className={inputCls + " num"} type="date" value={firstDue} onChange={(e) => setFirstDue(e.target.value)} /></Field>
            <div className="sm:col-span-2">
              <p className="mb-2 text-xs font-semibold text-muted">مدة التمويل (شهر)</p>
              <div className="flex flex-wrap gap-2">
                {appConfig.monthOptions.map((m) => (
                  <button key={m} onClick={() => setMonths(m)} className={cn("num rounded-full border px-4 py-1.5 text-sm font-semibold", months === m ? "border-ink bg-ink text-white dark:bg-white dark:text-ink" : "border-line hover:bg-neutral-soft")}>{m}</button>
                ))}
              </div>
            </div>
          </Card>
        </div>
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Card dark className="space-y-4">
            <p className="text-sm text-shell-muted">القسط الشهري</p>
            <p className="num text-4xl font-bold text-brand">{terms ? formatAmount(terms.installment) : "—"} <span className="text-sm text-shell-muted">ر.س</span></p>
            <div className="space-y-2 border-t border-shell-line pt-4 text-sm">
              <Row k="سعر السيارة" v={price ? formatMoney(price) : "—"} />
              <Row k="الدفعة المقدمة" v={formatMoney(downPayment)} />
              <Row k="المبلغ الممول" v={terms ? formatMoney(terms.financedAmount) : "—"} />
              <Row k={`الضريبة (${Math.round((db.settings.vatRate) * 100)}%)`} v={terms ? formatMoney(terms.vat) : "—"} />
              <Row k="إجمالي العقد" v={terms ? formatMoney(terms.contractTotal) : "—"} bold />
              <Row k="الجدول" v={terms ? `${months} قسط · من ${formatDateShort(firstDue)} إلى ${formatDateShort(addMonthsISO(firstDue, months - 1))}` : "—"} />
            </div>
            <Button className="w-full" onClick={save} disabled={!terms || !customerId}>حفظ وإرسال للاعتماد</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <div className="flex justify-between gap-3"><span className="text-shell-muted">{k}</span><span className={cn("num text-end", bold && "font-bold")}>{v}</span></div>;
}
