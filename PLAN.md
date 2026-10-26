# PLAN — ديمو منصة «مِلك»

> المرجع: `SPEC.md`. القرارات غير المذكورة في المواصفات: `DECISIONS.md`.
> ✅ تم · ⏳ متبقٍ · 🟧 جزئي

## المرحلة 1 — الأساس 🟧
- ✅ Next.js 15.5 + React 19 + TypeScript strict + Tailwind v4 + ESLint
- ✅ تثبيت المكتبات: TanStack Query/Table، RHF + Zod، Recharts، date-fns، react-pdf، Framer Motion، lucide، next-themes، sonner، cmdk، radix-ui، vaul، Vitest، Playwright، Prettier
- ✅ Design Tokens برتقالي/أسود Light + Dark في `app/globals.css`
- ✅ خطوط IBM Plex Sans Arabic بصيغة TTF في `public/fonts` (لملفات PDF)، وحزمة fontsource مثبتة للويب
- ✅ `lib/i18n/ar.json` (النصوص المشتركة، الأدوار، الحالات، التنبيهات، رسائل التحقق) + دالة `t()` بمفاتيح مُنمّطة
- ✅ `lib/format.ts` (المبالغ، التاريخ الميلادي والهجري، الجوال، الهوية المقنّعة، واتساب)، `lib/config.ts`، `lib/utils.ts`
- ⏳ `app/layout.tsx`: ما زال ملف القالب الافتراضي (`lang="en"` + خط Geist). المطلوب `lang="ar" dir="rtl"`، خط IBM Plex، Providers
- ⏳ مكونات shadcn/ui في `components/ui`
- ⏳ قاعدة ESLint تمنع النصوص العربية داخل المكونات + إعداد Prettier

## المرحلة 2 — المنطق والبيانات 🟧
- ✅ `types/domain.ts` (كما في SPEC §6 + أنواع مساعدة)، `types/api.ts`
- ✅ `lib/domain/`: money، vat، dates، schedule، allocation، balances، alerts، portfolio، contractNumber، template
- ✅ `lib/permissions.ts`: المصفوفة كاملة، `can()`، `canAccessRoute()`، القوائم، الزر العائم (FAB)
- ✅ `mocks/data/seed.ts`: مولد ثابت (seeded) بتواريخ نسبية لليوم، مع القائمة والقالب
- ✅ `mocks/store.ts`: حفظ في localStorage + إعادة توليد عند تغيّر اليوم
- ✅ اختبارات Vitest: **258 اختباراً ناجحاً** (الجدول، التوزيع، العكس، التنبيهات، الصلاحيات كاملة، ضمانات البيانات الوهمية على 5 تواريخ منها نهايات أشهر، التنسيق)
- ⏳ `mocks/handlers.ts` (Mock API)
- ⏳ `services/` (`http.ts`، `errors.ts`، الخدمات، hooks الخاصة بـ TanStack Query)
- ⏳ `lib/session.ts` + `middleware.ts`

## المرحلة 3 — الهيكل ⏳
Layout الموظفين (Sidebar + Bottom Nav + FAB)، Topbar، جرس الإشعارات، Command Palette، Role Switcher، صفحة الدخول.

## المرحلة 4 — مكونات الهوية ⏳
PaymentRing، ContractTimeline، PlateBadge، StatCard، TodayStrip، StatusBadge، EmptyState، Skeletons.

## المرحلة 5 — الصفحات الداخلية ⏳
الداشبورد ×4، العقود + صفحة العقد، المعالج + PDF، العميل، السيارة، المدفوعات + الإيصال، التحصيل، الإشعارات، التقارير، الإعدادات.

## المرحلة 6 — بوابة العميل ⏳

## المرحلة 7 — PWA والتلميع ⏳

## المرحلة 8 — التحقق النهائي ⏳
Playwright + لقطات الشاشة + README.

## المشاكل الحالية
- خطأ TypeScript واحد في `lib/domain/portfolio.ts:61` (تحويل النوع داخل `getAging`). الاختبارات تنجح، لكن `tsc` و`npm run build` سيفشلان حتى يُصلح.
- تحذيرا ESLint (متغيرات غير مستخدمة): `balances.ts` (`Customer`) و`seed.ts` (`contractSeq`).
- لا توجد أي صفحة (`app/page.tsx` محذوفة)، و`layout.tsx` ما زال ملف القالب الافتراضي.
- `services/errors.ts` لم يُكتب (أُوقف عند هذه الخطوة).
- تعارض في SPEC: 45 عقداً منها 38 قائمة لا تكفيها 40 سيارة، لذلك استخدم المولد 56 سيارة. هذا القرار لم يُسجل بعد في `DECISIONS.md`.
