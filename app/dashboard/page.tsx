import { generateSeed } from "@/mocks/data/seed";
import type { ISODate } from "@/lib/domain/dates";

const today = new Date().toISOString().slice(0, 10) as ISODate;
const database = generateSeed(today);

const stats = [
  { label: "العقود", value: database.contracts.length },
  { label: "العقود النشطة", value: database.contracts.filter((contract) => contract.status === "active").length },
  { label: "العملاء", value: database.customers.length },
  { label: "السيارات", value: database.vehicles.length },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-10 text-fg sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-brand">مِلك</p>
            <h1 className="text-2xl font-bold tracking-normal sm:text-3xl">لوحة التحكم</h1>
          </div>
          <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-muted">نسخة تجريبية</span>
        </header>

        <section aria-labelledby="overview-title">
          <div className="mb-5">
            <h2 id="overview-title" className="text-lg font-semibold">نظرة عامة</h2>
            <p className="mt-1 text-sm text-muted">ملخص بيانات منصة التأجير المنتهي بالتمليك.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-xl border border-line bg-surface p-5">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold tabular-nums">{stat.value.toLocaleString("en-US")}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-line bg-surface-2 p-5 sm:p-6" aria-label="حالة النظام">
          <p className="font-semibold">مساحة العمل جاهزة</p>
          <p className="mt-1 text-sm text-muted">تم تحميل بيانات العرض التجريبية بنجاح.</p>
        </section>
      </div>
    </main>
  );
}