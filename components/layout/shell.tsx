"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "next-themes";
import { Bell, Car, ChevronsRight, FileText, LayoutDashboard, LogOut, Moon, Sun, Users } from "lucide-react";
import type { Role, StaffRole } from "@/types/domain";
import { mobileNavForRole, navForRole, type NavIcon } from "@/lib/permissions";
import { ROLE_LABEL, useSession } from "@/lib/session";
import { useAlerts } from "@/lib/useAlerts";
import { cn } from "@/lib/utils";

const NAV_LABEL: Partial<Record<NavIcon, string>> = {
  dashboard: "الرئيسية", contracts: "العقود", customers: "العملاء", vehicles: "السيارات", notifications: "التنبيهات",
};
const NAV_ICON: Partial<Record<NavIcon, typeof Car>> = {
  dashboard: LayoutDashboard, contracts: FileText, customers: Users, vehicles: Car, notifications: Bell,
};
const STAFF: Role[] = ["admin", "sales", "accountant", "procurement", "customer"];

export function StaffShell({ children }: { children: ReactNode }) {
  const { role, ready, setRole } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { unread } = useAlerts();
  const { theme, setTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!role) router.replace("/login");
    else if (role === "customer") router.replace("/portal");
  }, [ready, role, router]);

  if (!ready || !role || role === "customer") return null;
  const items = navForRole(role).filter((n) => NAV_LABEL[n.key]);
  const mobile = mobileNavForRole(role as StaffRole).filter((n) => NAV_LABEL[n.key]);
  const mobileItems = [...mobile, ...items.filter((n) => !mobile.includes(n))].slice(0, 5);
  const active = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="flex min-h-screen">
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col bg-shell text-shell-fg transition-all lg:flex print:hidden", collapsed ? "w-20" : "w-64")}>
        <div className="flex items-center gap-2 px-5 py-6">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand font-bold text-white">م</span>
          {!collapsed && <span className="text-lg font-bold">مِلك</span>}
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {items.map((n) => {
            const Icon = NAV_ICON[n.key] ?? Car;
            return (
              <Link key={n.key} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition", active(n.href) ? "bg-brand text-white" : "text-shell-muted hover:bg-shell-line hover:text-white")}>
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="flex-1">{NAV_LABEL[n.key]}</span>}
                {!collapsed && n.key === "notifications" && unread > 0 && <span className="num rounded-full bg-white/20 px-2 text-xs">{unread}</span>}
              </Link>
            );
          })}
        </nav>
        <button onClick={() => setCollapsed((c) => !c)} className="m-3 flex items-center justify-center gap-2 rounded-xl p-2 text-shell-muted hover:bg-shell-line hover:text-white">
          <ChevronsRight size={18} className={cn("transition", collapsed ? "" : "rotate-180")} />
          {!collapsed && <span className="text-xs">طي القائمة</span>}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur sm:px-6 print:hidden">
          <div className="flex items-center gap-2 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">م</span>
            <span className="font-bold">مِلك</span>
          </div>
          <div className="hidden text-sm text-muted lg:block">مرحباً، {ROLE_LABEL[role]}</div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-line px-2.5 py-1.5 text-xs">
              <span className="hidden text-muted sm:inline">وضع العرض</span>
              <select value={role} onChange={(e) => { const r = e.target.value as Role; setRole(r); router.push(r === "customer" ? "/portal" : "/dashboard"); }} className="bg-transparent text-sm font-semibold outline-none">
                {STAFF.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </label>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border border-line p-2 hover:bg-neutral-soft" aria-label="الوضع الليلي">
              <Sun size={18} className="hidden dark:block" /><Moon size={18} className="dark:hidden" />
            </button>
            <Link href="/notifications" className="relative rounded-xl border border-line p-2 hover:bg-neutral-soft" aria-label="التنبيهات">
              <Bell size={18} />
              {unread > 0 && <span className="num absolute -top-1.5 -start-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{unread}</span>}
            </Link>
            <button onClick={() => { setRole(null); router.push("/login"); }} className="rounded-xl border border-line p-2 hover:bg-neutral-soft" aria-label="خروج"><LogOut size={18} /></button>
          </div>
        </header>
        <main className="flex-1 px-4 py-5 pb-24 sm:px-6 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-safe lg:hidden print:hidden">
        {mobileItems.map((n) => {
          const Icon = NAV_ICON[n.key] ?? Car;
          return (
            <Link key={n.key} href={n.href} className={cn("flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium", active(n.href) ? "text-brand" : "text-muted")}>
              <Icon size={20} />
              {NAV_LABEL[n.key]}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
