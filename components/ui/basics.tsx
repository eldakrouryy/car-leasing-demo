"use client";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ContractStatus, InstallmentStatus, VehicleStatus } from "@/types/domain";
import { formatAmount } from "@/lib/format";

export function Fade({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay }} className={className}>
      {children}
    </motion.div>
  );
}

export function Card({ children, className, dark }: { children: ReactNode; className?: string; dark?: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-5 shadow-soft", dark ? "border-shell-line bg-ink text-white" : "border-line bg-surface", className)}>
      {children}
    </div>
  );
}

type BtnVariant = "primary" | "dark" | "ghost" | "outline";
export function Button({
  children, className, variant = "primary", ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  const v: Record<BtnVariant, string> = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    dark: "bg-ink text-white hover:bg-ink-2 dark:bg-white dark:text-ink",
    ghost: "bg-transparent text-fg hover:bg-neutral-soft",
    outline: "border border-line bg-surface text-fg hover:bg-neutral-soft",
  };
  return (
    <button
      className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50", v[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

const STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "مسودة", cls: "bg-neutral-soft text-muted" },
  pending_approval: { label: "بانتظار الاعتماد", cls: "bg-warning-soft text-warning" },
  approved: { label: "معتمد", cls: "bg-success-soft text-success" },
  active: { label: "نشط", cls: "bg-success-soft text-success" },
  overdue: { label: "متأخر", cls: "bg-danger-soft text-danger" },
  paid_off: { label: "مسدد", cls: "bg-brand-soft text-brand" },
  owned: { label: "تم التمليك", cls: "bg-neutral-soft text-fg" },
  terminated: { label: "مفسوخ", cls: "bg-neutral-soft text-muted" },
  upcoming: { label: "قادم", cls: "bg-neutral-soft text-muted" },
  due: { label: "مستحق", cls: "bg-warning-soft text-warning" },
  partial: { label: "جزئي", cls: "bg-warning-soft text-warning" },
  paid: { label: "مدفوع", cls: "bg-success-soft text-success" },
  in_purchase: { label: "قيد الشراء", cls: "bg-neutral-soft text-muted" },
  preparing: { label: "قيد التجهيز", cls: "bg-warning-soft text-warning" },
  available: { label: "متاحة", cls: "bg-success-soft text-success" },
  reserved: { label: "محجوزة", cls: "bg-brand-soft text-brand" },
  contracted: { label: "متعاقد عليها", cls: "bg-neutral-soft text-fg" },
  returned: { label: "مستردة", cls: "bg-danger-soft text-danger" },
  sold: { label: "مباعة", cls: "bg-neutral-soft text-muted" },
};
export const statusLabel = (s: string): string => STATUS[s]?.label ?? s;

export function StatusBadge({ status, className }: { status: ContractStatus | InstallmentStatus | VehicleStatus; className?: string }) {
  const s = STATUS[status] ?? { label: status, cls: "bg-neutral-soft" };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap", s.cls, className)}>{s.label}</span>;
}

export function PaymentRing({
  progress, remaining, size = 160, stroke = 12, dark, label = "المتبقي",
}: { progress: number; remaining: number; size?: number; stroke?: number; dark?: boolean; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={dark ? "#2a2a2e" : "var(--neutral-soft)"} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#FF6B00" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - p)} style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className={cn("text-[10px]", dark ? "text-shell-muted" : "text-muted")}>{label}</span>
        <span className="num text-lg font-bold leading-tight">{formatAmount(remaining)}</span>
        <span className="num text-xs font-semibold text-brand">{Math.round(p * 100)}%</span>
      </div>
    </div>
  );
}

export function PlateBadge({ ar, en, className }: { ar: string; en: string; className?: string }) {
  return (
    <div className={cn("inline-flex overflow-hidden rounded-lg border-2 border-ink bg-white text-ink shadow-soft", className)} dir="ltr">
      <div className="flex w-7 flex-col items-center justify-center bg-[#1d4ed8] text-[8px] font-bold text-white">
        <span>KSA</span>
      </div>
      <div className="flex flex-col px-3 py-1 text-center">
        <span className="num text-sm font-bold tracking-widest">{en}</span>
        <span className="text-xs font-semibold tracking-wider">{ar}</span>
      </div>
    </div>
  );
}

export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4 print:hidden" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl bg-surface p-5 shadow-pop sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-neutral-soft" aria-label="إغلاق"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand";

export function Stat({ label, value, sub, className, accent }: { label: string; value: string; sub?: string; className?: string; accent?: boolean }) {
  return (
    <Card className={className}>
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("num mt-1 text-2xl font-bold", accent && "text-brand")}>{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </Card>
  );
}

export function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">{text}</div>;
}
