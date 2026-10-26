import type { Database } from "@/types/domain";
import { appConfig } from "@/lib/config";
import { todayISO } from "@/lib/domain/dates";
import { generateSeed, SEED_VERSION } from "./data/seed";

/**
 * قاعدة بيانات العرض داخل المتصفح. تُحفظ في localStorage وتُعاد توليدها
 * عند تغيّر اليوم حتى تبقى التواريخ النسبية والتنبيهات «حية».
 */
let db: Database | null = null;

const canPersist = (): boolean => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

function read(): Database | null {
  if (!canPersist()) return null;
  try {
    const raw = window.localStorage.getItem(appConfig.storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Database;
    if (parsed.version !== SEED_VERSION || parsed.seededFor !== todayISO()) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getDb(): Database {
  if (db && db.seededFor === todayISO()) return db;
  db = read() ?? generateSeed(todayISO());
  persist();
  return db;
}

export function persist(): void {
  if (!db || !canPersist()) return;
  try {
    window.localStorage.setItem(appConfig.storageKey, JSON.stringify(db));
  } catch {
    // التخزين ممتلئ أو محظور — نكمل في الذاكرة
  }
}

export function resetDb(): Database {
  db = generateSeed(todayISO());
  persist();
  return db;
}
