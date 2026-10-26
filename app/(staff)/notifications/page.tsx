"use client";
import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Bell, Info } from "lucide-react";
import type { Severity } from "@/types/domain";
import { useSession } from "@/lib/session";
import { useAlerts } from "@/lib/useAlerts";
import { formatRelativeDay } from "@/lib/format";
import { Card, Empty, Fade } from "@/components/ui/basics";

const SEV: { key: Severity; label: string; icon: typeof Bell; cls: string }[] = [
  { key: "critical", label: "عاجل", icon: AlertTriangle, cls: "bg-danger-soft text-danger" },
  { key: "warning", label: "تنبيه", icon: Bell, cls: "bg-warning-soft text-warning" },
  { key: "info", label: "معلومة", icon: Info, cls: "bg-neutral-soft text-muted" },
];

export default function NotificationsPage() {
  const { role, update } = useSession();
  const { alerts, today } = useAlerts();
  useEffect(() => {
    if (!role || alerts.length === 0) return;
    const t = setTimeout(() => update((d) => { d.reads[role] = alerts.map((a) => a.id); }), 800);
    return () => clearTimeout(t);
  }, [alerts, role, update]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Fade><h1 className="text-2xl font-bold">التنبيهات</h1><p className="text-sm text-muted">{alerts.length} تنبيه لدورك</p></Fade>
      {alerts.length === 0 && <Empty text="لا توجد تنبيهات" />}
      {SEV.map(({ key, label, icon: Icon, cls }) => {
        const list = alerts.filter((a) => a.severity === key);
        if (list.length === 0) return null;
        return (
          <section key={key} className="space-y-2">
            <h2 className="flex items-center gap-2 text-sm font-bold"><span className={`rounded-full px-2.5 py-0.5 text-xs ${cls}`}>{label}</span><span className="num text-muted">{list.length}</span></h2>
            <Card className="divide-y divide-line p-0">
              {list.map((a) => (
                <Link key={a.id} href={a.link} className="flex items-start gap-3 px-5 py-3 hover:bg-surface-2">
                  <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${cls}`}><Icon size={16} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{a.title}</span><span className="block text-xs text-muted">{a.body}</span></span>
                  <span className="num shrink-0 text-xs text-muted">{formatRelativeDay(a.createdAt.slice(0, 10), today)}</span>
                </Link>
              ))}
            </Card>
          </section>
        );
      })}
    </div>
  );
}
