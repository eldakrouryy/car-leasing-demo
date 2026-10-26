"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CreditCard, Home, LogOut, User } from "lucide-react";
import { useSession } from "@/lib/session";

const NAV = [
  { href: "#home", label: "الرئيسية", icon: Home },
  { href: "#installments", label: "أقساطي", icon: CreditCard },
  { href: "#account", label: "حسابي", icon: User },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const { role, ready, setRole } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (ready && role !== "customer") router.replace(role ? "/dashboard" : "/login");
  }, [ready, role, router]);
  if (!ready || role !== "customer") return null;
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-canvas">
      <header className="sticky top-0 z-20 flex items-center justify-between bg-canvas/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-sm font-bold text-white">م</span><span className="font-bold">مِلك</span></div>
        <button onClick={() => { setRole(null); router.push("/login"); }} className="rounded-xl p-2 text-muted hover:bg-neutral-soft" aria-label="خروج"><LogOut size={18} /></button>
      </header>
      <main className="px-4 pb-24">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-lg border-t border-line bg-surface pb-safe">
        {NAV.map(({ href, label, icon: Icon }) => (
          <a key={href} href={href} className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium text-muted hover:text-brand"><Icon size={20} />{label}</a>
        ))}
      </nav>
    </div>
  );
}
