"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Database, Role } from "@/types/domain";
import { appConfig } from "@/lib/config";
import { getDb, persist } from "@/mocks/store";
import { DEMO_CUSTOMER_PHONE } from "@/mocks/data/seed";

interface Session {
  role: Role | null;
  ready: boolean;
  db: Database | null;
  customerId: string | null;
  setRole: (r: Role | null) => void;
  update: (fn: (db: Database) => void) => void;
}

const Ctx = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [db, setDb] = useState<Database | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const r = window.localStorage.getItem(appConfig.sessionKey) as Role | null;
      setRoleState(r);
    } catch {}
    setDb(getDb());
    setReady(true);
  }, []);

  const setRole = useCallback((r: Role | null) => {
    setRoleState(r);
    try {
      if (r) window.localStorage.setItem(appConfig.sessionKey, r);
      else window.localStorage.removeItem(appConfig.sessionKey);
    } catch {}
  }, []);

  const update = useCallback((fn: (d: Database) => void) => {
    const d = getDb();
    fn(d);
    persist();
    setDb({ ...d });
  }, []);

  const customerId = db?.customers.find((c) => c.phone === DEMO_CUSTOMER_PHONE)?.id ?? null;
  return <Ctx.Provider value={{ role, ready, db, customerId, setRole, update }}>{children}</Ctx.Provider>;
}

export function useSession(): Session {
  const s = useContext(Ctx);
  if (!s) throw new Error("SessionProvider missing");
  return s;
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "المدير",
  sales: "المبيعات",
  accountant: "المحاسب",
  procurement: "المشتريات",
  customer: "العميل",
};
