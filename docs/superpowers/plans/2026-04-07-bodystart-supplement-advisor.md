# BodyStart Supplement Advisor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local Next.js web app that lets Adam (BodyStart Nutrition) collect a client profile via a 7-step wizard, generate a structured supplement protocol via Claude, display it in a rich UI, refine it with a dietary analysis chat, export it as a branded PDF, and persist clients in a local SQLite database.

**Architecture:** Next.js 15 App Router + TypeScript, React Hook Form + Zod wizard, Anthropic SDK with forced `tool_use` for a JSON-structured `Protocol` schema (streamed), Drizzle ORM over better-sqlite3, Puppeteer PDF rendering from a dedicated print route, shadcn/ui components.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, @anthropic-ai/sdk, better-sqlite3, drizzle-orm, drizzle-kit, puppeteer, vitest, @playwright/test, lucide-react.

**Project root:** `C:\Users\Adam\supplement-advisor\`. The design doc lives in `docs/superpowers/specs/2026-04-07-bodystart-supplement-advisor-design.md` — re-read it if anything is unclear.

---

## File Structure Overview

```
bodystart-advisor/
├── app/
│   ├── layout.tsx                        # root layout, fonts, header
│   ├── page.tsx                          # home
│   ├── globals.css                       # tailwind base
│   ├── consultation/
│   │   ├── new/page.tsx                  # wizard page
│   │   ├── [id]/page.tsx                 # protocol view
│   │   ├── [id]/refine/page.tsx          # phase 3 chat
│   │   └── [id]/print/page.tsx           # PDF template route
│   ├── history/page.tsx
│   └── api/
│       ├── generate-protocol/route.ts
│       ├── refine-protocol/route.ts
│       └── export-pdf/[id]/route.ts
├── components/
│   ├── ui/                               # shadcn primitives
│   ├── wizard/
│   │   ├── WizardShell.tsx
│   │   ├── StepProgress.tsx
│   │   ├── Section0Client.tsx
│   │   ├── Section1Basics.tsx
│   │   ├── Section2Goals.tsx
│   │   ├── Section3Lifestyle.tsx
│   │   ├── Section4Nutrition.tsx
│   │   ├── Section5Health.tsx
│   │   ├── Section6Supplements.tsx
│   │   └── SectionReview.tsx
│   └── protocol/
│       ├── ProtocolView.tsx
│       ├── SummaryBlock.tsx
│       ├── DailyTimeline.tsx
│       ├── SupplementCard.tsx
│       ├── RecapTable.tsx
│       ├── WarningsBlock.tsx
│       └── MonitoringBlock.tsx
├── lib/
│   ├── claude/
│   │   ├── client.ts                     # Anthropic SDK singleton
│   │   ├── systemPrompt.ts               # loaded from supplement-advisor-prompt.md
│   │   ├── protocolTool.ts               # tool schema + Zod schema
│   │   └── generate.ts                   # generateProtocol / refineProtocol
│   ├── db/
│   │   ├── client.ts                     # better-sqlite3 + drizzle
│   │   ├── schema.ts                     # drizzle table definitions
│   │   └── queries.ts                    # CRUD helpers
│   ├── schemas/
│   │   ├── clientProfile.ts              # Zod for the 7-step form
│   │   └── protocol.ts                   # Zod for Claude output
│   └── pdf/
│       └── render.ts                     # puppeteer helper
├── public/
│   └── logo.png                          # copied from Desktop/Bodystart
├── prompts/
│   └── system.md                         # copy of supplement-advisor-prompt.md
├── drizzle.config.ts
├── .env.local.example
├── README.md
└── package.json
```

---

## Task 1: Scaffold Next.js project with Tailwind + shadcn

**Files:**
- Create: `C:\Users\Adam\supplement-advisor\package.json` (via create-next-app)
- Create: `C:\Users\Adam\supplement-advisor\app\layout.tsx`
- Create: `C:\Users\Adam\supplement-advisor\app\page.tsx`
- Create: `C:\Users\Adam\supplement-advisor\public\logo.png`
- Create: `C:\Users\Adam\supplement-advisor\.env.local.example`

- [ ] **Step 1: Run create-next-app inside the project root**

```bash
cd /c/Users/Adam/supplement-advisor
npx create-next-app@latest . --typescript --tailwind --app --eslint --src-dir false --import-alias "@/*" --no-turbo --use-npm
```

Accept defaults for any prompt. This will populate the existing directory (it already has `docs/` and `.git/` — confirm "Y" when asked about a non-empty directory).

- [ ] **Step 2: Install shadcn/ui base**

```bash
npx shadcn@latest init -d
```

Choose: Style = Default, Base color = Slate, CSS variables = Yes.

- [ ] **Step 3: Install required shadcn components**

```bash
npx shadcn@latest add button card input label textarea checkbox radio-group select slider progress dialog badge table toast sonner separator
```

- [ ] **Step 4: Copy the logo from Desktop into public/**

```bash
cp "/c/Users/Adam/Desktop/Bodystart/Mes logos/Logo.png" public/logo.png
```

- [ ] **Step 5: Create `.env.local.example`**

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
BODYSTART_SHOP_ADDRESS=
BODYSTART_SHOP_PHONE=
```

- [ ] **Step 6: Add `.env.local` to .gitignore if not already**

Open `.gitignore` and ensure these lines exist (Next already adds most):
```
.env.local
bodystart.db
bodystart.db-*
backups/
```

- [ ] **Step 7: Replace `app/layout.tsx` with the branded shell**

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BodyStart Nutrition — Supplement Advisor",
  description: "Outil de génération de protocoles personnalisés",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen bg-slate-50 text-slate-900`}>
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="BodyStart Nutrition" width={40} height={40} />
              <span className="text-lg font-semibold tracking-tight">BodyStart Nutrition</span>
            </Link>
            <nav className="ml-auto flex gap-2 text-sm">
              <Link href="/consultation/new" className="rounded-md px-3 py-2 hover:bg-slate-100">Nouvelle consultation</Link>
              <Link href="/history" className="rounded-md px-3 py-2 hover:bg-slate-100">Historique</Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Replace `app/page.tsx` with a minimal home screen**

```tsx
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Nouvelle consultation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Démarre un nouveau bilan client et génère un protocole personnalisé.</p>
          <Button asChild><Link href="/consultation/new">Commencer</Link></Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Historique clients</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">Retrouve, rouvre ou exporte un protocole passé.</p>
          <Button asChild variant="secondary"><Link href="/history">Ouvrir</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9: Verify the dev server boots**

```bash
npm run dev
```
Expected: server starts on http://localhost:3000, home page shows the BodyStart header + two cards. Stop it with Ctrl+C.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Tailwind, shadcn, BodyStart shell"
```

---

## Task 2: Copy system prompt and add core env plumbing

**Files:**
- Create: `prompts/system.md`
- Create: `lib/env.ts`

- [ ] **Step 1: Copy the existing prompt into the project**

```bash
cp "/c/Users/Adam/Downloads/supplement-advisor-prompt.md" prompts/system.md
```

- [ ] **Step 2: Create `lib/env.ts` with typed env access**

```ts
import "server-only";

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export const env = {
  anthropicApiKey: required("ANTHROPIC_API_KEY"),
  shopAddress: process.env.BODYSTART_SHOP_ADDRESS ?? "",
  shopPhone: process.env.BODYSTART_SHOP_PHONE ?? "",
};
```

- [ ] **Step 3: Create an actual `.env.local`**

```bash
cp .env.local.example .env.local
```
Then open `.env.local` and paste Adam's real Anthropic API key into `ANTHROPIC_API_KEY`.

- [ ] **Step 4: Commit**

```bash
git add prompts/system.md lib/env.ts
git commit -m "chore: add system prompt and env access helpers"
```

---

## Task 3: Zod schema for ClientProfile

**Files:**
- Create: `lib/schemas/clientProfile.ts`
- Create: `lib/schemas/__tests__/clientProfile.test.ts`

- [ ] **Step 1: Install vitest**

```bash
npm install -D vitest @vitest/ui
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write the failing test**

```ts
// lib/schemas/__tests__/clientProfile.test.ts
import { describe, expect, it } from "vitest";
import { clientProfileSchema } from "../clientProfile";

describe("clientProfileSchema", () => {
  it("accepts a minimal valid profile", () => {
    const result = clientProfileSchema.safeParse({
      client: { firstName: "Marie", lastName: "Dupont", email: "marie@example.com", phone: null, consultationDate: "2026-04-07", consentGiven: true },
      basics: { age: 32, sex: "female", weightKg: 62, heightCm: 168, country: "France" },
      goals: { priorities: ["energy", "sleep", "stress"] },
      lifestyle: { activityLevel: "moderate", sportTypes: ["strength"], sleepQuality: 7, sleepHours: 7.5, stressLevel: 6, sunExposureMinutes: 20 },
      nutrition: { diet: "omnivore", frequentFoods: ["eggs", "leafy_greens"], alcoholPerWeek: 2, caffeinePerDay: 2 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a profile missing consent", () => {
    const result = clientProfileSchema.safeParse({
      client: { firstName: "Marie", lastName: "Dupont", email: "bad", phone: null, consultationDate: "2026-04-07", consentGiven: false },
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid goal count", () => {
    const base: any = {
      client: { firstName: "M", lastName: "D", email: "m@d.fr", phone: null, consultationDate: "2026-04-07", consentGiven: true },
      basics: { age: 30, sex: "male", weightKg: 70, heightCm: 175, country: "France" },
      goals: { priorities: [] },
      lifestyle: { activityLevel: "sedentary", sportTypes: [], sleepQuality: 5, sleepHours: 7, stressLevel: 5, sunExposureMinutes: 10 },
      nutrition: { diet: "omnivore", frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 0 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "<30" },
    };
    expect(clientProfileSchema.safeParse(base).success).toBe(false);
  });
});
```

- [ ] **Step 3: Run it to see it fail**

```bash
npm test
```
Expected: FAIL — module not found.

- [ ] **Step 4: Implement the schema**

```ts
// lib/schemas/clientProfile.ts
import { z } from "zod";

export const goalEnum = z.enum([
  "performance", "weight_loss", "energy", "sleep", "stress",
  "cognition", "longevity", "hormonal", "immunity", "digestive", "beauty", "other",
]);

export const activityLevelEnum = z.enum(["sedentary", "light", "moderate", "very_active", "athlete"]);
export const sportTypeEnum = z.enum(["strength", "endurance", "hiit", "team", "yoga", "none"]);
export const dietEnum = z.enum(["omnivore", "flexitarian", "vegetarian", "vegan", "carnivore_keto", "gluten_free", "lactose_free"]);
export const frequentFoodEnum = z.enum(["fatty_fish", "eggs", "dairy", "legumes", "nuts_seeds", "leafy_greens"]);
export const budgetTierEnum = z.enum(["<30", "30-60", "60-100", "100+"]);
export const sexEnum = z.enum(["male", "female"]);

export const clientProfileSchema = z.object({
  client: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().nullable(),
    consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    consentGiven: z.literal(true, { errorMap: () => ({ message: "Consent required" }) }),
  }),
  basics: z.object({
    age: z.number().int().min(14).max(110),
    sex: sexEnum,
    weightKg: z.number().positive().max(300),
    heightCm: z.number().positive().max(250),
    country: z.string().min(1),
  }),
  goals: z.object({
    priorities: z.array(goalEnum).min(1).max(3),
  }),
  lifestyle: z.object({
    activityLevel: activityLevelEnum,
    sportTypes: z.array(sportTypeEnum),
    sleepQuality: z.number().int().min(1).max(10),
    sleepHours: z.number().min(0).max(14),
    stressLevel: z.number().int().min(1).max(10),
    sunExposureMinutes: z.number().min(0).max(600),
  }),
  nutrition: z.object({
    diet: dietEnum,
    frequentFoods: z.array(frequentFoodEnum),
    alcoholPerWeek: z.number().min(0).max(100),
    caffeinePerDay: z.number().min(0).max(20),
  }),
  health: z.object({
    conditions: z.string(),
    medications: z.string(),
    bloodwork: z.string(),
    allergies: z.string(),
    pregnancy: z.boolean(),
  }),
  supplements: z.object({
    current: z.string(),
    pastBadExperiences: z.string(),
    budgetTier: budgetTierEnum,
  }),
});

export type ClientProfile = z.infer<typeof clientProfileSchema>;
```

- [ ] **Step 5: Run tests**

```bash
npm test
```
Expected: 3 passing.

- [ ] **Step 6: Commit**

```bash
git add lib/schemas package.json package-lock.json
git commit -m "feat(schemas): add ClientProfile Zod schema with tests"
```

---

## Task 4: Zod schema for Protocol

**Files:**
- Create: `lib/schemas/protocol.ts`
- Create: `lib/schemas/__tests__/protocol.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// lib/schemas/__tests__/protocol.test.ts
import { describe, expect, it } from "vitest";
import { protocolSchema } from "../protocol";

const validProtocol = {
  summary: "Protocole axé sur performance et sommeil.",
  supplements: [
    {
      id: "magnesium-bisglycinate",
      emoji: "💊",
      name: "Magnésium",
      form: "Bisglycinate",
      formRationale: "Biodisponibilité 4x supérieure à l'oxyde.",
      doseValue: 400,
      doseUnit: "mg",
      timing: "bedtime",
      timingRationale: "Favorise la détente nerveuse avant le coucher.",
      duration: "en continu",
      justification: "Stress élevé + activité physique.",
      interactions: [],
      successIndicators: ["Meilleure qualité de sommeil sous 2 semaines"],
      tier: 1,
      category: "foundation",
    },
  ],
  dailySchedule: { morning: [], midday: [], preWorkout: [], postWorkout: [], evening: [], bedtime: ["magnesium-bisglycinate"] },
  warnings: ["Consulter un médecin si traitement en cours."],
  monitoring: { reviewAfterWeeks: 8, indicators: ["Qualité du sommeil"], bloodTests: ["Magnésium érythrocytaire"] },
};

describe("protocolSchema", () => {
  it("accepts a valid protocol", () => {
    const result = protocolSchema.safeParse(validProtocol);
    if (!result.success) console.error(result.error);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid timing value", () => {
    const bad = { ...validProtocol, supplements: [{ ...validProtocol.supplements[0], timing: "random_time" }] };
    expect(protocolSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a negative dose", () => {
    const bad = { ...validProtocol, supplements: [{ ...validProtocol.supplements[0], doseValue: -10 }] };
    expect(protocolSchema.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to see it fail**

```bash
npm test
```
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the schema**

```ts
// lib/schemas/protocol.ts
import { z } from "zod";

export const timingEnum = z.enum([
  "morning_fasted", "morning_meal", "midday", "pre_workout", "post_workout", "evening", "bedtime",
]);
export type Timing = z.infer<typeof timingEnum>;

export const categoryEnum = z.enum([
  "foundation", "performance", "recovery", "beauty", "hormonal", "digestive",
]);

export const doseUnitEnum = z.enum(["mg", "g", "UI", "µg"]);

export const supplementSchema = z.object({
  id: z.string().min(1),
  emoji: z.string().min(1),
  name: z.string().min(1),
  form: z.string().min(1),
  formRationale: z.string().min(1),
  doseValue: z.number().positive(),
  doseUnit: doseUnitEnum,
  timing: timingEnum,
  timingRationale: z.string().min(1),
  duration: z.string().min(1),
  justification: z.string().min(1),
  interactions: z.array(z.string()),
  successIndicators: z.array(z.string()),
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  category: categoryEnum,
});
export type Supplement = z.infer<typeof supplementSchema>;

export const protocolSchema = z.object({
  summary: z.string().min(1),
  supplements: z.array(supplementSchema).min(1),
  dailySchedule: z.object({
    morning: z.array(z.string()),
    midday: z.array(z.string()),
    preWorkout: z.array(z.string()),
    postWorkout: z.array(z.string()),
    evening: z.array(z.string()),
    bedtime: z.array(z.string()),
  }),
  warnings: z.array(z.string()),
  monitoring: z.object({
    reviewAfterWeeks: z.number().int().positive(),
    indicators: z.array(z.string()),
    bloodTests: z.array(z.string()),
  }),
});
export type Protocol = z.infer<typeof protocolSchema>;
```

- [ ] **Step 4: Run tests**

```bash
npm test
```
Expected: 6 passing total.

- [ ] **Step 5: Commit**

```bash
git add lib/schemas
git commit -m "feat(schemas): add Protocol Zod schema with tests"
```

---

## Task 5: Database layer (Drizzle + SQLite)

**Files:**
- Create: `lib/db/schema.ts`
- Create: `lib/db/client.ts`
- Create: `lib/db/queries.ts`
- Create: `lib/db/__tests__/queries.test.ts`
- Create: `drizzle.config.ts`

- [ ] **Step 1: Install deps**

```bash
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit @types/better-sqlite3
```

- [ ] **Step 2: Create `lib/db/schema.ts`**

```ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export const consultations = sqliteTable("consultations", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  profileJson: text("profile_json").notNull(),
  protocolJson: text("protocol_json").notNull(),
  dietaryAnalysisJson: text("dietary_analysis_json"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

export type ClientRow = typeof clients.$inferSelect;
export type ConsultationRow = typeof consultations.$inferSelect;
```

- [ ] **Step 3: Create `drizzle.config.ts`**

```ts
import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: { url: process.env.DATABASE_URL ?? "./bodystart.db" },
} satisfies Config;
```

- [ ] **Step 4: Create `lib/db/client.ts`**

```ts
import "server-only";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "node:path";

const dbPath = process.env.DATABASE_URL ?? path.join(process.cwd(), "bodystart.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });

// Auto-create tables on first boot (dev-friendly; no migrations step needed)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    consent_given INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE TABLE IF NOT EXISTS consultations (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    profile_json TEXT NOT NULL,
    protocol_json TEXT NOT NULL,
    dietary_analysis_json TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_consultations_client ON consultations(client_id);
`);
```

- [ ] **Step 5: Create `lib/db/queries.ts`**

```ts
import "server-only";
import { randomUUID } from "node:crypto";
import { eq, desc } from "drizzle-orm";
import { db } from "./client";
import { clients, consultations } from "./schema";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import type { Protocol } from "@/lib/schemas/protocol";

export function upsertClientAndConsultation(profile: ClientProfile, protocol: Protocol): { clientId: string; consultationId: string } {
  const existing = db.select().from(clients).where(eq(clients.email, profile.client.email)).get();
  const clientId = existing?.id ?? randomUUID();
  if (!existing) {
    db.insert(clients).values({
      id: clientId,
      firstName: profile.client.firstName,
      lastName: profile.client.lastName,
      email: profile.client.email,
      phone: profile.client.phone,
      consentGiven: profile.client.consentGiven,
    }).run();
  } else {
    db.update(clients).set({
      firstName: profile.client.firstName,
      lastName: profile.client.lastName,
      phone: profile.client.phone,
      consentGiven: profile.client.consentGiven,
    }).where(eq(clients.id, clientId)).run();
  }
  const consultationId = randomUUID();
  db.insert(consultations).values({
    id: consultationId,
    clientId,
    profileJson: JSON.stringify(profile),
    protocolJson: JSON.stringify(protocol),
  }).run();
  return { clientId, consultationId };
}

export function getConsultation(id: string) {
  const row = db.select().from(consultations).where(eq(consultations.id, id)).get();
  if (!row) return null;
  const clientRow = db.select().from(clients).where(eq(clients.id, row.clientId)).get();
  return {
    id: row.id,
    client: clientRow,
    profile: JSON.parse(row.profileJson) as ClientProfile,
    protocol: JSON.parse(row.protocolJson) as Protocol,
    dietaryAnalysis: row.dietaryAnalysisJson ? JSON.parse(row.dietaryAnalysisJson) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function updateProtocol(consultationId: string, protocol: Protocol, dietaryAnalysis: unknown) {
  db.update(consultations).set({
    protocolJson: JSON.stringify(protocol),
    dietaryAnalysisJson: JSON.stringify(dietaryAnalysis),
    updatedAt: new Date(),
  }).where(eq(consultations.id, consultationId)).run();
}

export function listClientsWithCounts() {
  // Raw SQL for the aggregate — clean and typed enough
  return db.all<{ id: string; firstName: string; lastName: string; email: string; phone: string | null; consultationCount: number; lastConsultationAt: number }>(
    // @ts-expect-error drizzle raw
    `SELECT c.id, c.first_name as firstName, c.last_name as lastName, c.email, c.phone,
            COUNT(co.id) as consultationCount,
            MAX(co.created_at) as lastConsultationAt
     FROM clients c
     LEFT JOIN consultations co ON co.client_id = c.id
     GROUP BY c.id
     ORDER BY lastConsultationAt DESC`
  );
}

export function deleteClient(clientId: string) {
  db.delete(clients).where(eq(clients.id, clientId)).run();
}
```

- [ ] **Step 6: Write a round-trip test using an in-memory DB**

```ts
// lib/db/__tests__/queries.test.ts
import { describe, expect, it, beforeAll } from "vitest";
process.env.DATABASE_URL = ":memory:";

// Lazy import so env var applies first
let q: typeof import("../queries");

beforeAll(async () => {
  q = await import("../queries");
});

const profile = {
  client: { firstName: "Marie", lastName: "Dupont", email: "marie@example.com", phone: null, consultationDate: "2026-04-07", consentGiven: true },
  basics: { age: 32, sex: "female" as const, weightKg: 62, heightCm: 168, country: "France" },
  goals: { priorities: ["energy" as const] },
  lifestyle: { activityLevel: "moderate" as const, sportTypes: [], sleepQuality: 7, sleepHours: 7, stressLevel: 5, sunExposureMinutes: 20 },
  nutrition: { diet: "omnivore" as const, frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 1 },
  health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
  supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" as const },
};

const protocol = {
  summary: "x",
  supplements: [{ id: "s1", emoji: "💊", name: "Mg", form: "Bisglycinate", formRationale: "r", doseValue: 400, doseUnit: "mg" as const, timing: "bedtime" as const, timingRationale: "r", duration: "continu", justification: "j", interactions: [], successIndicators: [], tier: 1 as const, category: "foundation" as const }],
  dailySchedule: { morning: [], midday: [], preWorkout: [], postWorkout: [], evening: [], bedtime: ["s1"] },
  warnings: [],
  monitoring: { reviewAfterWeeks: 8, indicators: [], bloodTests: [] },
};

describe("queries", () => {
  it("saves and retrieves a consultation", () => {
    const { consultationId, clientId } = q.upsertClientAndConsultation(profile as any, protocol as any);
    const fetched = q.getConsultation(consultationId);
    expect(fetched?.client?.email).toBe("marie@example.com");
    expect(fetched?.protocol.supplements[0].id).toBe("s1");
    const list = q.listClientsWithCounts();
    expect(list.find(c => c.id === clientId)?.consultationCount).toBe(1);
  });
});
```

- [ ] **Step 7: Run tests**

```bash
npm test
```
Expected: 7 passing.

- [ ] **Step 8: Commit**

```bash
git add lib/db drizzle.config.ts package.json package-lock.json
git commit -m "feat(db): Drizzle + SQLite schema and queries with tests"
```

---

## Task 6: Claude client and Protocol tool

**Files:**
- Create: `lib/claude/client.ts`
- Create: `lib/claude/systemPrompt.ts`
- Create: `lib/claude/protocolTool.ts`
- Create: `lib/claude/generate.ts`
- Create: `lib/claude/__tests__/protocolTool.test.ts`

- [ ] **Step 1: Install the SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Create `lib/claude/client.ts`**

```ts
import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

export const anthropic = new Anthropic({ apiKey: env.anthropicApiKey });
export const CLAUDE_MODEL = "claude-sonnet-4-6";
```

- [ ] **Step 3: Create `lib/claude/systemPrompt.ts`**

```ts
import "server-only";
import fs from "node:fs";
import path from "node:path";

let cached: string | null = null;

export function loadSystemPrompt(): string {
  if (cached) return cached;
  const p = path.join(process.cwd(), "prompts", "system.md");
  cached = fs.readFileSync(p, "utf8");
  return cached;
}
```

- [ ] **Step 4: Create `lib/claude/protocolTool.ts`**

This tool schema mirrors the Zod `protocolSchema` exactly. Claude is forced to call this tool, which guarantees a validated JSON response.

```ts
import "server-only";
import type Anthropic from "@anthropic-ai/sdk";

export const PROTOCOL_TOOL_NAME = "emit_protocol";

export const protocolTool: Anthropic.Tool = {
  name: PROTOCOL_TOOL_NAME,
  description: "Émet le protocole de compléments structuré pour le client. Tu DOIS appeler cet outil avec les recommandations finales.",
  input_schema: {
    type: "object",
    required: ["summary", "supplements", "dailySchedule", "warnings", "monitoring"],
    properties: {
      summary: { type: "string", description: "Introduction narrative 2-3 phrases, markdown autorisé." },
      supplements: {
        type: "array",
        minItems: 1,
        items: {
          type: "object",
          required: ["id", "emoji", "name", "form", "formRationale", "doseValue", "doseUnit", "timing", "timingRationale", "duration", "justification", "interactions", "successIndicators", "tier", "category"],
          properties: {
            id: { type: "string", description: "slug unique kebab-case, ex: magnesium-bisglycinate" },
            emoji: { type: "string" },
            name: { type: "string" },
            form: { type: "string" },
            formRationale: { type: "string" },
            doseValue: { type: "number", minimum: 0 },
            doseUnit: { type: "string", enum: ["mg", "g", "UI", "µg"] },
            timing: { type: "string", enum: ["morning_fasted", "morning_meal", "midday", "pre_workout", "post_workout", "evening", "bedtime"] },
            timingRationale: { type: "string" },
            duration: { type: "string" },
            justification: { type: "string" },
            interactions: { type: "array", items: { type: "string" } },
            successIndicators: { type: "array", items: { type: "string" } },
            tier: { type: "integer", enum: [1, 2, 3] },
            category: { type: "string", enum: ["foundation", "performance", "recovery", "beauty", "hormonal", "digestive"] },
          },
        },
      },
      dailySchedule: {
        type: "object",
        required: ["morning", "midday", "preWorkout", "postWorkout", "evening", "bedtime"],
        properties: {
          morning: { type: "array", items: { type: "string" } },
          midday: { type: "array", items: { type: "string" } },
          preWorkout: { type: "array", items: { type: "string" } },
          postWorkout: { type: "array", items: { type: "string" } },
          evening: { type: "array", items: { type: "string" } },
          bedtime: { type: "array", items: { type: "string" } },
        },
      },
      warnings: { type: "array", items: { type: "string" } },
      monitoring: {
        type: "object",
        required: ["reviewAfterWeeks", "indicators", "bloodTests"],
        properties: {
          reviewAfterWeeks: { type: "integer", minimum: 1 },
          indicators: { type: "array", items: { type: "string" } },
          bloodTests: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
};
```

- [ ] **Step 5: Create `lib/claude/generate.ts`**

```ts
import "server-only";
import { anthropic, CLAUDE_MODEL } from "./client";
import { loadSystemPrompt } from "./systemPrompt";
import { protocolTool, PROTOCOL_TOOL_NAME } from "./protocolTool";
import { protocolSchema, type Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";

export async function generateProtocol(profile: ClientProfile): Promise<Protocol> {
  const msg = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: loadSystemPrompt(),
    tools: [protocolTool],
    tool_choice: { type: "tool", name: PROTOCOL_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Voici le profil client (JSON). Génère le protocole personnalisé en appelant l'outil ${PROTOCOL_TOOL_NAME}.\n\n\`\`\`json\n${JSON.stringify(profile, null, 2)}\n\`\`\``,
      },
    ],
  });

  const toolUse = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not call emit_protocol tool");
  const parsed = protocolSchema.safeParse(toolUse.input);
  if (!parsed.success) throw new Error(`Protocol validation failed: ${parsed.error.message}`);
  return parsed.data;
}

export async function refineProtocol(
  profile: ClientProfile,
  currentProtocol: Protocol,
  dietaryDescription: string,
): Promise<{ adjustedProtocol: Protocol; analysisNarrative: string }> {
  const msg = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: loadSystemPrompt(),
    tools: [protocolTool],
    tool_choice: { type: "tool", name: PROTOCOL_TOOL_NAME },
    messages: [
      {
        role: "user",
        content: `Profil client:\n\`\`\`json\n${JSON.stringify(profile, null, 2)}\n\`\`\`\n\nProtocole actuel:\n\`\`\`json\n${JSON.stringify(currentProtocol, null, 2)}\n\`\`\``,
      },
      { role: "assistant", content: "Protocole émis. Souhaites-tu la Phase 3 — analyse alimentaire ?" },
      {
        role: "user",
        content: `Oui. Voici la journée alimentaire type:\n\n${dietaryDescription}\n\nAnalyse, identifie les lacunes, et ré-émets le protocole AJUSTÉ via l'outil ${PROTOCOL_TOOL_NAME}. Avant l'appel d'outil, explique brièvement les ajustements en 3-5 lignes.`,
      },
    ],
  });

  const textBlocks = msg.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  const toolUse = msg.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Claude did not call emit_protocol tool during refine");
  const parsed = protocolSchema.safeParse(toolUse.input);
  if (!parsed.success) throw new Error(`Refined protocol validation failed: ${parsed.error.message}`);
  return {
    adjustedProtocol: parsed.data,
    analysisNarrative: textBlocks.map(b => b.text).join("\n\n"),
  };
}
```

- [ ] **Step 6: Add a schema shape sanity test for the tool**

```ts
// lib/claude/__tests__/protocolTool.test.ts
import { describe, expect, it } from "vitest";
import { protocolTool, PROTOCOL_TOOL_NAME } from "../protocolTool";

describe("protocolTool", () => {
  it("has the expected name", () => {
    expect(protocolTool.name).toBe(PROTOCOL_TOOL_NAME);
  });
  it("requires the same top-level keys as the Zod schema", () => {
    const required = (protocolTool.input_schema as any).required as string[];
    expect(required.sort()).toEqual(["dailySchedule", "monitoring", "summary", "supplements", "warnings"]);
  });
});
```

- [ ] **Step 7: Run tests**

```bash
npm test
```
Expected: 9 passing.

- [ ] **Step 8: Commit**

```bash
git add lib/claude package.json package-lock.json
git commit -m "feat(claude): Anthropic client, system prompt loader, protocol tool, generate/refine helpers"
```

---

## Task 7: API route `/api/generate-protocol`

**Files:**
- Create: `app/api/generate-protocol/route.ts`

- [ ] **Step 1: Create the route**

```ts
// app/api/generate-protocol/route.ts
import { NextRequest, NextResponse } from "next/server";
import { clientProfileSchema } from "@/lib/schemas/clientProfile";
import { generateProtocol } from "@/lib/claude/generate";
import { upsertClientAndConsultation } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = clientProfileSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid profile", details: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const protocol = await generateProtocol(parsed.data);
    const { consultationId } = upsertClientAndConsultation(parsed.data, protocol);
    return NextResponse.json({ consultationId, protocol });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
```

> **Note on streaming:** The v1 design mentioned streaming; however, `tool_use` streaming with incremental JSON parsing adds significant complexity and the protocol is small (~2-4 KB). We send it as a single JSON response and show a loading animation during the ~5-15 second wait. If latency becomes an issue, revisit with `stream: true` and `input_json_delta` handling.

- [ ] **Step 2: Smoke test the route by hand**

```bash
npm run dev
```

In another terminal, POST a sample profile (you can copy the one from the schema test). If an API key is configured, expect a 200 with a `consultationId` and full `protocol`. Stop the dev server after verifying.

- [ ] **Step 3: Commit**

```bash
git add app/api/generate-protocol
git commit -m "feat(api): add generate-protocol route"
```

---

## Task 8: Wizard shell and progress component

**Files:**
- Create: `components/wizard/StepProgress.tsx`
- Create: `components/wizard/WizardShell.tsx`
- Create: `lib/wizard/steps.ts`

- [ ] **Step 1: Create `lib/wizard/steps.ts`**

```ts
export const STEPS = [
  { id: "client", label: "Client" },
  { id: "basics", label: "Données de base" },
  { id: "goals", label: "Objectifs" },
  { id: "lifestyle", label: "Mode de vie" },
  { id: "nutrition", label: "Alimentation" },
  { id: "health", label: "Santé" },
  { id: "supplements", label: "Compléments actuels" },
  { id: "review", label: "Récapitulatif" },
] as const;

export type StepId = typeof STEPS[number]["id"];
```

- [ ] **Step 2: Create `components/wizard/StepProgress.tsx`**

```tsx
"use client";
import { STEPS } from "@/lib/wizard/steps";

export function StepProgress({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="mb-8">
      <div className="mb-2 flex gap-1">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= currentIndex ? "bg-emerald-600" : "bg-slate-200"}`} />
        ))}
      </div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Étape {currentIndex + 1} / {STEPS.length} — {STEPS[currentIndex].label}
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/wizard/WizardShell.tsx`**

This shell holds the full RHF form and renders the current section. Individual sections (Task 9) plug in via a render map.

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { STEPS } from "@/lib/wizard/steps";
import { clientProfileSchema, type ClientProfile } from "@/lib/schemas/clientProfile";
import { StepProgress } from "./StepProgress";
import { Section0Client } from "./Section0Client";
import { Section1Basics } from "./Section1Basics";
import { Section2Goals } from "./Section2Goals";
import { Section3Lifestyle } from "./Section3Lifestyle";
import { Section4Nutrition } from "./Section4Nutrition";
import { Section5Health } from "./Section5Health";
import { Section6Supplements } from "./Section6Supplements";
import { SectionReview } from "./SectionReview";

const sectionFieldGroups: Record<number, (keyof ClientProfile)[]> = {
  0: ["client"],
  1: ["basics"],
  2: ["goals"],
  3: ["lifestyle"],
  4: ["nutrition"],
  5: ["health"],
  6: ["supplements"],
};

export function WizardShell() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ClientProfile>({
    resolver: zodResolver(clientProfileSchema),
    mode: "onBlur",
    defaultValues: {
      client: { firstName: "", lastName: "", email: "", phone: null, consultationDate: new Date().toISOString().slice(0, 10), consentGiven: false as any },
      basics: { age: 30, sex: "male", weightKg: 70, heightCm: 175, country: "France" },
      goals: { priorities: [] },
      lifestyle: { activityLevel: "moderate", sportTypes: [], sleepQuality: 7, sleepHours: 7, stressLevel: 5, sunExposureMinutes: 15 },
      nutrition: { diet: "omnivore", frequentFoods: [], alcoholPerWeek: 0, caffeinePerDay: 1 },
      health: { conditions: "", medications: "", bloodwork: "", allergies: "", pregnancy: false },
      supplements: { current: "", pastBadExperiences: "", budgetTier: "30-60" },
    },
  });

  async function next() {
    const fields = sectionFieldGroups[step];
    if (fields) {
      const ok = await form.trigger(fields as any);
      if (!ok) return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/generate-protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form.getValues()),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }
      const { consultationId } = await res.json();
      toast.success("Protocole généré");
      router.push(`/consultation/${consultationId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto max-w-2xl">
        <StepProgress currentIndex={step} />
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          {step === 0 && <Section0Client />}
          {step === 1 && <Section1Basics />}
          {step === 2 && <Section2Goals />}
          {step === 3 && <Section3Lifestyle />}
          {step === 4 && <Section4Nutrition />}
          {step === 5 && <Section5Health />}
          {step === 6 && <Section6Supplements />}
          {step === 7 && <SectionReview />}
        </div>
        <div className="mt-4 flex justify-between">
          <Button variant="ghost" disabled={step === 0 || submitting} onClick={() => setStep(s => s - 1)}>Précédent</Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={next}>Suivant →</Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>{submitting ? "Génération..." : "Générer le protocole"}</Button>
          )}
        </div>
      </div>
    </FormProvider>
  );
}
```

- [ ] **Step 4: Install React Hook Form + resolvers**

```bash
npm install react-hook-form @hookform/resolvers
```

- [ ] **Step 5: Commit**

```bash
git add components/wizard lib/wizard package.json package-lock.json
git commit -m "feat(wizard): shell, progress bar, step config (sections stubbed)"
```

> The section components referenced here are created in Tasks 9 and 10. The project will not compile until those exist — that's expected; we commit incrementally and the next tasks close the loop.

---

## Task 9: Wizard sections 0–3 (Client, Basics, Goals, Lifestyle)

**Files:**
- Create: `components/wizard/Section0Client.tsx`
- Create: `components/wizard/Section1Basics.tsx`
- Create: `components/wizard/Section2Goals.tsx`
- Create: `components/wizard/Section3Lifestyle.tsx`

Each section is a client component that reads/writes through `useFormContext<ClientProfile>()`.

- [ ] **Step 1: Section 0 — Client**

```tsx
// components/wizard/Section0Client.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function Section0Client() {
  const { register, formState: { errors }, setValue, watch } = useFormContext<ClientProfile>();
  const consent = watch("client.consentGiven");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Informations client</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Prénom</Label><Input {...register("client.firstName")} /></div>
        <div><Label>Nom</Label><Input {...register("client.lastName")} /></div>
        <div><Label>Email</Label><Input type="email" {...register("client.email")} /></div>
        <div><Label>Téléphone (optionnel)</Label><Input {...register("client.phone")} /></div>
        <div><Label>Date de consultation</Label><Input type="date" {...register("client.consultationDate")} /></div>
      </div>
      <label className="flex items-start gap-3 rounded-md border bg-slate-50 p-3">
        <Checkbox checked={!!consent} onCheckedChange={(v) => setValue("client.consentGiven", v === true as any, { shouldValidate: true })} />
        <span className="text-sm">Le client consent à la conservation de ses données personnelles pour un suivi nutritionnel personnalisé.</span>
      </label>
      {errors.client && <p className="text-sm text-red-600">{Object.values(errors.client).map(e => (e as any)?.message).filter(Boolean).join(" · ")}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Section 1 — Basics**

```tsx
// components/wizard/Section1Basics.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Section1Basics() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const sex = watch("basics.sex");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Données de base</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Âge</Label><Input type="number" {...register("basics.age", { valueAsNumber: true })} /></div>
        <div>
          <Label>Sexe biologique</Label>
          <RadioGroup value={sex} onValueChange={(v) => setValue("basics.sex", v as any, { shouldValidate: true })} className="mt-2 flex gap-4">
            <label className="flex items-center gap-2"><RadioGroupItem value="male" /> Homme</label>
            <label className="flex items-center gap-2"><RadioGroupItem value="female" /> Femme</label>
          </RadioGroup>
        </div>
        <div><Label>Poids (kg)</Label><Input type="number" step="0.1" {...register("basics.weightKg", { valueAsNumber: true })} /></div>
        <div><Label>Taille (cm)</Label><Input type="number" {...register("basics.heightCm", { valueAsNumber: true })} /></div>
        <div className="sm:col-span-2"><Label>Pays / continent</Label><Input {...register("basics.country")} /></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Section 2 — Goals (max 3, checkboxes)**

```tsx
// components/wizard/Section2Goals.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Checkbox } from "@/components/ui/checkbox";

const GOALS: { value: ClientProfile["goals"]["priorities"][number]; label: string }[] = [
  { value: "performance", label: "Performance sportive / masse musculaire" },
  { value: "weight_loss", label: "Perte de poids / recomposition" },
  { value: "energy", label: "Énergie / anti-fatigue" },
  { value: "sleep", label: "Sommeil et récupération" },
  { value: "stress", label: "Stress / anxiété" },
  { value: "cognition", label: "Cognition / concentration" },
  { value: "longevity", label: "Longévité / santé préventive" },
  { value: "hormonal", label: "Santé hormonale / libido" },
  { value: "immunity", label: "Immunité" },
  { value: "digestive", label: "Santé digestive" },
  { value: "beauty", label: "Beauté (peau, cheveux, ongles)" },
  { value: "other", label: "Autre" },
];

export function Section2Goals() {
  const { setValue, watch } = useFormContext<ClientProfile>();
  const selected = watch("goals.priorities") ?? [];

  function toggle(v: string) {
    const set = new Set(selected as string[]);
    if (set.has(v)) set.delete(v);
    else if (set.size < 3) set.add(v);
    setValue("goals.priorities", Array.from(set) as any, { shouldValidate: true });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Objectifs prioritaires</h2>
      <p className="text-sm text-slate-600">Choisis jusqu'à 3 objectifs.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {GOALS.map(g => {
          const checked = (selected as string[]).includes(g.value);
          return (
            <label key={g.value} className={`flex items-center gap-2 rounded-md border p-3 ${checked ? "border-emerald-600 bg-emerald-50" : ""}`}>
              <Checkbox checked={checked} onCheckedChange={() => toggle(g.value)} />
              <span className="text-sm">{g.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Section 3 — Lifestyle**

```tsx
// components/wizard/Section3Lifestyle.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const SPORTS = [
  { v: "strength", l: "Force" },
  { v: "endurance", l: "Endurance" },
  { v: "hiit", l: "HIIT" },
  { v: "team", l: "Sports co" },
  { v: "yoga", l: "Yoga / mobilité" },
  { v: "none", l: "Aucun" },
] as const;

export function Section3Lifestyle() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const v = watch("lifestyle");
  function toggleSport(value: string) {
    const set = new Set(v.sportTypes as string[]);
    set.has(value) ? set.delete(value) : set.add(value);
    setValue("lifestyle.sportTypes", Array.from(set) as any, { shouldValidate: true });
  }
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Mode de vie</h2>
      <div>
        <Label>Niveau d'activité</Label>
        <Select value={v.activityLevel} onValueChange={(val) => setValue("lifestyle.activityLevel", val as any, { shouldValidate: true })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="sedentary">Sédentaire</SelectItem>
            <SelectItem value="light">Légèrement actif (1-2/sem)</SelectItem>
            <SelectItem value="moderate">Modérément actif (3-4/sem)</SelectItem>
            <SelectItem value="very_active">Très actif (5+/sem)</SelectItem>
            <SelectItem value="athlete">Athlète / compétition</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Type(s) de sport</Label>
        <div className="mt-2 flex flex-wrap gap-2">
          {SPORTS.map(s => {
            const checked = (v.sportTypes as string[]).includes(s.v);
            return (
              <label key={s.v} className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${checked ? "border-emerald-600 bg-emerald-50" : ""}`}>
                <Checkbox checked={checked} onCheckedChange={() => toggleSport(s.v)} />
                {s.l}
              </label>
            );
          })}
        </div>
      </div>
      <div>
        <Label>Qualité du sommeil : {v.sleepQuality}/10</Label>
        <Slider min={1} max={10} step={1} value={[v.sleepQuality]} onValueChange={([n]) => setValue("lifestyle.sleepQuality", n)} className="mt-2" />
      </div>
      <div><Label>Durée moyenne du sommeil (heures)</Label><Input type="number" step="0.5" {...register("lifestyle.sleepHours", { valueAsNumber: true })} /></div>
      <div>
        <Label>Niveau de stress : {v.stressLevel}/10</Label>
        <Slider min={1} max={10} step={1} value={[v.stressLevel]} onValueChange={([n]) => setValue("lifestyle.stressLevel", n)} className="mt-2" />
      </div>
      <div><Label>Exposition solaire quotidienne (minutes)</Label><Input type="number" {...register("lifestyle.sunExposureMinutes", { valueAsNumber: true })} /></div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/wizard/Section0Client.tsx components/wizard/Section1Basics.tsx components/wizard/Section2Goals.tsx components/wizard/Section3Lifestyle.tsx
git commit -m "feat(wizard): sections 0-3 (client, basics, goals, lifestyle)"
```

---

## Task 10: Wizard sections 4–6 + review + page mount

**Files:**
- Create: `components/wizard/Section4Nutrition.tsx`
- Create: `components/wizard/Section5Health.tsx`
- Create: `components/wizard/Section6Supplements.tsx`
- Create: `components/wizard/SectionReview.tsx`
- Create: `app/consultation/new/page.tsx`

- [ ] **Step 1: Section 4 — Nutrition**

```tsx
// components/wizard/Section4Nutrition.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FOODS = [
  { v: "fatty_fish", l: "Poisson gras (saumon, sardines...)" },
  { v: "eggs", l: "Œufs" },
  { v: "dairy", l: "Produits laitiers" },
  { v: "legumes", l: "Légumineuses" },
  { v: "nuts_seeds", l: "Noix et graines" },
  { v: "leafy_greens", l: "Légumes verts feuillus" },
] as const;

export function Section4Nutrition() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const v = watch("nutrition");
  function toggleFood(value: string) {
    const set = new Set(v.frequentFoods as string[]);
    set.has(value) ? set.delete(value) : set.add(value);
    setValue("nutrition.frequentFoods", Array.from(set) as any, { shouldValidate: true });
  }
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Alimentation</h2>
      <div>
        <Label>Régime alimentaire</Label>
        <Select value={v.diet} onValueChange={(val) => setValue("nutrition.diet", val as any, { shouldValidate: true })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="omnivore">Omnivore</SelectItem>
            <SelectItem value="flexitarian">Flexitarien</SelectItem>
            <SelectItem value="vegetarian">Végétarien</SelectItem>
            <SelectItem value="vegan">Vegan</SelectItem>
            <SelectItem value="carnivore_keto">Carnivore / Keto / Paleo</SelectItem>
            <SelectItem value="gluten_free">Sans gluten</SelectItem>
            <SelectItem value="lactose_free">Sans lactose</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Consommation régulière (plusieurs fois/semaine)</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {FOODS.map(f => {
            const checked = (v.frequentFoods as string[]).includes(f.v);
            return (
              <label key={f.v} className={`flex items-center gap-2 rounded-md border p-2 ${checked ? "border-emerald-600 bg-emerald-50" : ""}`}>
                <Checkbox checked={checked} onCheckedChange={() => toggleFood(f.v)} />
                <span className="text-sm">{f.l}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><Label>Alcool (verres/semaine)</Label><Input type="number" {...register("nutrition.alcoholPerWeek", { valueAsNumber: true })} /></div>
        <div><Label>Caféine (tasses/jour)</Label><Input type="number" {...register("nutrition.caffeinePerDay", { valueAsNumber: true })} /></div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Section 5 — Health**

```tsx
// components/wizard/Section5Health.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export function Section5Health() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const sex = watch("basics.sex");
  const pregnancy = watch("health.pregnancy");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Santé et antécédents</h2>
      <div><Label>Problèmes de santé connus</Label><Textarea {...register("health.conditions")} placeholder="Thyroïde, diabète, SOPK..." /></div>
      <div><Label>Médicaments en cours</Label><Textarea {...register("health.medications")} /></div>
      <div><Label>Bilan sanguin récent (valeurs connues)</Label><Textarea {...register("health.bloodwork")} placeholder="Vit D 22 ng/mL, Ferritine 45..." /></div>
      <div><Label>Allergies / intolérances</Label><Textarea {...register("health.allergies")} /></div>
      {sex === "female" && (
        <label className="flex items-center gap-2"><Checkbox checked={pregnancy} onCheckedChange={(v) => setValue("health.pregnancy", v === true)} /> Enceinte ou possible grossesse</label>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Section 6 — Supplements actuels + budget**

```tsx
// components/wizard/Section6Supplements.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function Section6Supplements() {
  const { register, setValue, watch } = useFormContext<ClientProfile>();
  const budget = watch("supplements.budgetTier");
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Compléments actuels et budget</h2>
      <div><Label>Compléments déjà pris (noms, doses)</Label><Textarea {...register("supplements.current")} /></div>
      <div><Label>Mauvaises expériences passées</Label><Textarea {...register("supplements.pastBadExperiences")} /></div>
      <div>
        <Label>Budget mensuel</Label>
        <Select value={budget} onValueChange={(v) => setValue("supplements.budgetTier", v as any, { shouldValidate: true })}>
          <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="<30">Moins de 30€</SelectItem>
            <SelectItem value="30-60">30-60€</SelectItem>
            <SelectItem value="60-100">60-100€</SelectItem>
            <SelectItem value="100+">100€+ / pas de contrainte</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Review section**

```tsx
// components/wizard/SectionReview.tsx
"use client";
import { useFormContext } from "react-hook-form";
import type { ClientProfile } from "@/lib/schemas/clientProfile";

export function SectionReview() {
  const { getValues } = useFormContext<ClientProfile>();
  const v = getValues();
  const row = (label: string, value: string) => (
    <div className="flex gap-3 py-1 text-sm"><span className="w-40 shrink-0 text-slate-500">{label}</span><span>{value}</span></div>
  );
  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Vérification</h2>
      <div className="divide-y">
        {row("Client", `${v.client.firstName} ${v.client.lastName} — ${v.client.email}`)}
        {row("Âge / sexe", `${v.basics.age} ans · ${v.basics.sex === "male" ? "Homme" : "Femme"}`)}
        {row("Poids / taille", `${v.basics.weightKg} kg · ${v.basics.heightCm} cm`)}
        {row("Objectifs", v.goals.priorities.join(", "))}
        {row("Activité", v.lifestyle.activityLevel)}
        {row("Régime", v.nutrition.diet)}
        {row("Budget", v.supplements.budgetTier)}
      </div>
      <p className="mt-4 text-xs text-slate-500">Clique sur « Générer le protocole » quand tu es prêt.</p>
    </div>
  );
}
```

- [ ] **Step 5: Mount the wizard page**

```tsx
// app/consultation/new/page.tsx
import { WizardShell } from "@/components/wizard/WizardShell";

export default function NewConsultationPage() {
  return <WizardShell />;
}
```

- [ ] **Step 6: Verify the build**

```bash
npm run build
```
Expected: build succeeds. Fix any TypeScript complaint inline (usually cast on `consentGiven` default — keep `as any` on the default until the user ticks the checkbox).

- [ ] **Step 7: Commit**

```bash
git add components/wizard app/consultation/new
git commit -m "feat(wizard): sections 4-6, review, mount /consultation/new"
```

---

## Task 11: Protocol view components

**Files:**
- Create: `components/protocol/SummaryBlock.tsx`
- Create: `components/protocol/DailyTimeline.tsx`
- Create: `components/protocol/SupplementCard.tsx`
- Create: `components/protocol/RecapTable.tsx`
- Create: `components/protocol/WarningsBlock.tsx`
- Create: `components/protocol/MonitoringBlock.tsx`
- Create: `components/protocol/ProtocolView.tsx`
- Create: `app/consultation/[id]/page.tsx`

- [ ] **Step 1: Install `react-markdown` for the narrative bits**

```bash
npm install react-markdown
```

- [ ] **Step 2: `SummaryBlock.tsx`**

```tsx
import ReactMarkdown from "react-markdown";
export function SummaryBlock({ text }: { text: string }) {
  return (
    <div className="prose prose-slate max-w-none rounded-lg border bg-white p-6">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
```

- [ ] **Step 3: `DailyTimeline.tsx`**

```tsx
import type { Protocol, Supplement } from "@/lib/schemas/protocol";

const COLS: { key: keyof Protocol["dailySchedule"]; label: string; emoji: string }[] = [
  { key: "morning", label: "Matin", emoji: "🌅" },
  { key: "midday", label: "Midi", emoji: "🥗" },
  { key: "preWorkout", label: "Pré-train", emoji: "🏋️" },
  { key: "postWorkout", label: "Post-train", emoji: "🔄" },
  { key: "evening", label: "Soir", emoji: "🌙" },
  { key: "bedtime", label: "Coucher", emoji: "🛌" },
];

export function DailyTimeline({ protocol }: { protocol: Protocol }) {
  const bySlug = new Map(protocol.supplements.map(s => [s.id, s]));
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border bg-white p-4 md:grid-cols-6">
      {COLS.map(c => {
        const ids = protocol.dailySchedule[c.key] ?? [];
        return (
          <div key={c.key} className="rounded-md bg-slate-50 p-3">
            <div className="mb-2 text-sm font-semibold">{c.emoji} {c.label}</div>
            <ul className="space-y-1">
              {ids.length === 0 && <li className="text-xs text-slate-400">—</li>}
              {ids.map(id => {
                const s = bySlug.get(id);
                if (!s) return null;
                return <li key={id}><a href={`#supp-${id}`} className="block rounded bg-white px-2 py-1 text-xs hover:bg-emerald-50">{s.emoji} {s.name}</a></li>;
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: `SupplementCard.tsx`**

```tsx
import type { Supplement } from "@/lib/schemas/protocol";
import { Badge } from "@/components/ui/badge";

const tierColor: Record<1 | 2 | 3, string> = { 1: "bg-emerald-600", 2: "bg-amber-500", 3: "bg-slate-400" };

export function SupplementCard({ s }: { s: Supplement }) {
  return (
    <div id={`supp-${s.id}`} className="rounded-lg border bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{s.emoji} {s.name} — <span className="text-emerald-700">{s.form}</span></h3>
          <p className="text-sm text-slate-600">{s.doseValue} {s.doseUnit} · {s.duration}</p>
        </div>
        <Badge className={`${tierColor[s.tier]} text-white`}>Tier {s.tier}</Badge>
      </div>
      <dl className="space-y-2 text-sm">
        <div><dt className="font-medium">Pourquoi cette forme</dt><dd className="text-slate-700">{s.formRationale}</dd></div>
        <div><dt className="font-medium">Moment de prise</dt><dd className="text-slate-700">{s.timingRationale}</dd></div>
        <div><dt className="font-medium">Justification pour ce profil</dt><dd className="text-slate-700">{s.justification}</dd></div>
        {s.interactions.length > 0 && <div><dt className="font-medium">Interactions</dt><dd className="text-slate-700"><ul className="list-disc pl-5">{s.interactions.map((i, k) => <li key={k}>{i}</li>)}</ul></dd></div>}
        {s.successIndicators.length > 0 && <div><dt className="font-medium">Signes que ça fonctionne</dt><dd className="text-slate-700"><ul className="list-disc pl-5">{s.successIndicators.map((i, k) => <li key={k}>{i}</li>)}</ul></dd></div>}
      </dl>
    </div>
  );
}
```

- [ ] **Step 5: `RecapTable.tsx`**

```tsx
import type { Protocol } from "@/lib/schemas/protocol";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const timingLabels: Record<string, string> = {
  morning_fasted: "Matin à jeun", morning_meal: "Matin avec repas", midday: "Midi",
  pre_workout: "Pré-train", post_workout: "Post-train", evening: "Soir", bedtime: "Coucher",
};

export function RecapTable({ protocol }: { protocol: Protocol }) {
  const sorted = [...protocol.supplements].sort((a, b) => a.tier - b.tier);
  return (
    <Table>
      <TableHeader>
        <TableRow><TableHead>Complément</TableHead><TableHead>Forme</TableHead><TableHead>Dose</TableHead><TableHead>Moment</TableHead><TableHead>Objectif</TableHead></TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(s => (
          <TableRow key={s.id}>
            <TableCell>{s.emoji} {s.name}</TableCell>
            <TableCell>{s.form}</TableCell>
            <TableCell>{s.doseValue} {s.doseUnit}</TableCell>
            <TableCell>{timingLabels[s.timing]}</TableCell>
            <TableCell>{s.category}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 6: `WarningsBlock.tsx` and `MonitoringBlock.tsx`**

```tsx
// components/protocol/WarningsBlock.tsx
export function WarningsBlock({ warnings }: { warnings: string[] }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
      <h3 className="mb-2 font-semibold">⚠️ Avertissements</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-amber-900">{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
    </div>
  );
}
```

```tsx
// components/protocol/MonitoringBlock.tsx
import type { Protocol } from "@/lib/schemas/protocol";
export function MonitoringBlock({ m }: { m: Protocol["monitoring"] }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <h3 className="mb-2 font-semibold">🔁 Suivi recommandé</h3>
      <p className="text-sm">Réévaluation dans <strong>{m.reviewAfterWeeks} semaines</strong>.</p>
      {m.indicators.length > 0 && <><p className="mt-2 text-sm font-medium">Indicateurs à surveiller :</p><ul className="list-disc pl-5 text-sm">{m.indicators.map((i, k) => <li key={k}>{i}</li>)}</ul></>}
      {m.bloodTests.length > 0 && <><p className="mt-2 text-sm font-medium">Analyses de suivi :</p><ul className="list-disc pl-5 text-sm">{m.bloodTests.map((i, k) => <li key={k}>{i}</li>)}</ul></>}
    </div>
  );
}
```

- [ ] **Step 7: `ProtocolView.tsx` — composite**

```tsx
import type { Protocol } from "@/lib/schemas/protocol";
import type { ClientProfile } from "@/lib/schemas/clientProfile";
import { SummaryBlock } from "./SummaryBlock";
import { DailyTimeline } from "./DailyTimeline";
import { SupplementCard } from "./SupplementCard";
import { RecapTable } from "./RecapTable";
import { WarningsBlock } from "./WarningsBlock";
import { MonitoringBlock } from "./MonitoringBlock";

export function ProtocolView({ profile, protocol }: { profile: ClientProfile; protocol: Protocol }) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Protocole personnalisé — {profile.client.firstName} {profile.client.lastName}</h1>
        <p className="text-sm text-slate-500">Consultation du {profile.client.consultationDate}</p>
      </header>
      <SummaryBlock text={protocol.summary} />
      <DailyTimeline protocol={protocol} />
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Suppléments recommandés</h2>
        {[...protocol.supplements].sort((a, b) => a.tier - b.tier).map(s => <SupplementCard key={s.id} s={s} />)}
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Récapitulatif</h2>
        <div className="rounded-lg border bg-white"><RecapTable protocol={protocol} /></div>
      </section>
      <WarningsBlock warnings={protocol.warnings} />
      <MonitoringBlock m={protocol.monitoring} />
    </div>
  );
}
```

- [ ] **Step 8: `app/consultation/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";
import { Button } from "@/components/ui/button";

export default async function ConsultationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) notFound();
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button asChild><a href={`/api/export-pdf/${c.id}`}>Exporter PDF</a></Button>
        <Button variant="secondary" asChild><Link href={`/consultation/${c.id}/refine`}>Affiner avec analyse alimentaire</Link></Button>
        <Button variant="ghost" asChild><Link href="/history">Retour à l'historique</Link></Button>
      </div>
      <ProtocolView profile={c.profile} protocol={c.protocol} />
    </div>
  );
}
```

- [ ] **Step 9: Build check**

```bash
npm run build
```
Expected: build succeeds.

- [ ] **Step 10: Commit**

```bash
git add components/protocol app/consultation/[id]/page.tsx package.json package-lock.json
git commit -m "feat(protocol): view components and consultation detail page"
```

---

## Task 12: Phase 3 — Dietary refine (API + page)

**Files:**
- Create: `app/api/refine-protocol/route.ts`
- Create: `app/consultation/[id]/refine/page.tsx`

- [ ] **Step 1: API route**

```ts
// app/api/refine-protocol/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getConsultation, updateProtocol } from "@/lib/db/queries";
import { refineProtocol } from "@/lib/claude/generate";

export const runtime = "nodejs";

const bodySchema = z.object({ consultationId: z.string(), dietaryDescription: z.string().min(10) });

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const c = getConsultation(parsed.data.consultationId);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const { adjustedProtocol, analysisNarrative } = await refineProtocol(c.profile, c.protocol, parsed.data.dietaryDescription);
    updateProtocol(c.id, adjustedProtocol, { description: parsed.data.dietaryDescription, narrative: analysisNarrative });
    return NextResponse.json({ adjustedProtocol, analysisNarrative });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Refine page (simple form + reload)**

```tsx
// app/consultation/[id]/refine/page.tsx
"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RefinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      const res = await fetch("/api/refine-protocol", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ consultationId: id, dietaryDescription: desc }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erreur");
      toast.success("Protocole ajusté");
      router.push(`/consultation/${id}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Analyse alimentaire</h1>
      <p className="text-sm text-slate-600">Décris une journée alimentaire type du client : petit-déjeuner, déjeuner, collations, dîner, boissons.</p>
      <div>
        <Label>Journée type</Label>
        <Textarea rows={12} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Petit-déjeuner: 2 œufs, avocat, café..." />
      </div>
      <Button onClick={submit} disabled={loading || desc.length < 20}>{loading ? "Analyse..." : "Ajuster le protocole"}</Button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/refine-protocol app/consultation/[id]/refine
git commit -m "feat(phase3): dietary refine API + page"
```

---

## Task 13: PDF export (Puppeteer + print route)

**Files:**
- Create: `app/consultation/[id]/print/page.tsx`
- Create: `app/api/export-pdf/[id]/route.ts`
- Create: `app/consultation/[id]/print/print.css`

- [ ] **Step 1: Install puppeteer**

```bash
npm install puppeteer
```

Note: first install downloads Chromium (~150 MB). That's fine since the app is local.

- [ ] **Step 2: Create the print route — reuses `ProtocolView` with print-specific wrapping**

```tsx
// app/consultation/[id]/print/page.tsx
import { notFound } from "next/navigation";
import Image from "next/image";
import { getConsultation } from "@/lib/db/queries";
import { ProtocolView } from "@/components/protocol/ProtocolView";
import { env } from "@/lib/env";
import "./print.css";

export default async function PrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) notFound();
  return (
    <div className="pdf-root">
      <header className="pdf-header">
        <Image src="/logo.png" alt="BodyStart" width={56} height={56} />
        <div>
          <div className="pdf-brand">BodyStart Nutrition</div>
          <div className="pdf-brand-sub">{env.shopAddress} · {env.shopPhone}</div>
        </div>
      </header>
      <ProtocolView profile={c.profile} protocol={c.protocol} />
      <footer className="pdf-footer">Document généré le {new Date().toLocaleDateString("fr-FR")} — BodyStart Nutrition</footer>
    </div>
  );
}
```

- [ ] **Step 3: Print stylesheet**

```css
/* app/consultation/[id]/print/print.css */
@page { size: A4; margin: 16mm 14mm; }
.pdf-root { background: white; color: #0f172a; font-size: 11pt; }
.pdf-header { display: flex; align-items: center; gap: 12px; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 20px; }
.pdf-brand { font-size: 16pt; font-weight: 700; }
.pdf-brand-sub { font-size: 9pt; color: #64748b; }
.pdf-footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #e2e8f0; font-size: 8pt; color: #64748b; text-align: center; }
/* Avoid page break inside cards */
[id^="supp-"] { break-inside: avoid; }
```

- [ ] **Step 4: PDF export API**

```ts
// app/api/export-pdf/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import { getConsultation } from "@/lib/db/queries";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = getConsultation(id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const origin = process.env.APP_ORIGIN ?? "http://localhost:3000";
  const url = `${origin}/consultation/${id}/print`;

  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" } });
    const filename = `BodyStart-${c.client?.lastName ?? "client"}-${c.id.slice(0, 6)}.pdf`;
    return new NextResponse(pdf, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  } finally {
    await browser.close();
  }
}
```

- [ ] **Step 5: Add `APP_ORIGIN=http://localhost:3000` to `.env.local`**

Append:
```
APP_ORIGIN=http://localhost:3000
```

- [ ] **Step 6: Commit**

```bash
git add app/consultation/[id]/print app/api/export-pdf package.json package-lock.json
git commit -m "feat(pdf): puppeteer-based export with branded print template"
```

---

## Task 14: History page and CSV export

**Files:**
- Create: `app/history/page.tsx`
- Create: `app/api/clients/[id]/route.ts`
- Create: `app/api/clients/export/route.ts`

- [ ] **Step 1: Delete client API**

```ts
// app/api/clients/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { deleteClient } from "@/lib/db/queries";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  deleteClient(id);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: CSV export API**

```ts
// app/api/clients/export/route.ts
import { NextResponse } from "next/server";
import { listClientsWithCounts } from "@/lib/db/queries";

export async function GET() {
  const rows = listClientsWithCounts();
  const header = "firstName,lastName,email,phone,consultationCount\n";
  const body = rows.map(r => [r.firstName, r.lastName, r.email, r.phone ?? "", r.consultationCount].map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  return new NextResponse(header + body, {
    headers: { "content-type": "text/csv", "content-disposition": 'attachment; filename="bodystart-clients.csv"' },
  });
}
```

- [ ] **Step 3: History page**

```tsx
// app/history/page.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

type Row = { id: string; firstName: string; lastName: string; email: string; phone: string | null; consultationCount: number; lastConsultationAt: number };

export default function HistoryPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  async function load() {
    const res = await fetch("/api/clients/list", { cache: "no-store" });
    if (res.ok) setRows(await res.json());
  }
  useEffect(() => { load(); }, []);

  async function del(id: string) {
    if (!confirm("Supprimer ce client et toutes ses consultations ?")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Client supprimé"); load(); }
  }

  const filtered = rows.filter(r =>
    `${r.firstName} ${r.lastName} ${r.email}`.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Historique clients</h1>
        <div className="ml-auto flex gap-2">
          <Input placeholder="Rechercher…" value={q} onChange={(e) => setQ(e.target.value)} className="w-64" />
          <Button asChild variant="secondary"><a href="/api/clients/export">Export CSV</a></Button>
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead>Téléphone</TableHead><TableHead>Consultations</TableHead><TableHead></TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(r => (
              <TableRow key={r.id}>
                <TableCell>{r.firstName} {r.lastName}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.phone ?? "—"}</TableCell>
                <TableCell>{r.consultationCount}</TableCell>
                <TableCell className="text-right"><Button variant="ghost" onClick={() => del(r.id)}>Supprimer</Button></TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-sm text-slate-500">Aucun client</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: List clients API (used by the page)**

```ts
// app/api/clients/list/route.ts  (create this file)
import { NextResponse } from "next/server";
import { listClientsWithCounts } from "@/lib/db/queries";
export async function GET() { return NextResponse.json(listClientsWithCounts()); }
```

- [ ] **Step 5: Commit**

```bash
git add app/history app/api/clients
git commit -m "feat(history): client list with search, CSV export, delete"
```

---

## Task 15: README and final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write the README**

```markdown
# BodyStart Nutrition — Supplement Advisor

Outil local de génération de protocoles de compléments personnalisés.

## Prérequis
- Node.js 20+
- Une clé API Anthropic

## Installation
```bash
npm install
cp .env.local.example .env.local
# Éditer .env.local et renseigner ANTHROPIC_API_KEY + coordonnées boutique
```

## Utilisation
```bash
npm run dev       # mode développement
npm run build     # build production
npm run start     # lancement production
npm test          # tests unitaires
```

La base SQLite `bodystart.db` est créée automatiquement au premier lancement.

## Sauvegarde
```bash
cp bodystart.db "backups/bodystart-$(date +%Y%m%d-%H%M%S).db"
```
```

- [ ] **Step 2: Full build + test run**

```bash
npm test
npm run build
```
Expected: tests pass, build succeeds.

- [ ] **Step 3: Manual smoke test**

```bash
npm run dev
```
- Ouvrir http://localhost:3000
- Cliquer « Nouvelle consultation », remplir le wizard avec un profil de test
- Vérifier que le protocole s'affiche
- Cliquer « Exporter PDF » — vérifier le PDF
- Cliquer « Historique » — vérifier la présence du client
- Supprimer le client de test

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "docs: add README with install and usage instructions"
```

---

## Self-Review Notes

- **Spec coverage:** every section of the design doc maps to a task:
  - §2 parcours → Tasks 1, 8–10 (wizard), 11 (view), 12 (phase 3), 13 (PDF), 14 (history)
  - §3 stack → Tasks 1, 5, 6
  - §4 data model → Tasks 3, 4, 5
  - §5 UI → Tasks 1, 8–11, 13, 14
  - §6 tests → Tasks 3, 4, 5, 6, 15 (build+smoke)
  - §7 privacy → Tasks 1 (.env), 5 (consent), 14 (delete)
- **Streaming caveat:** design mentioned streaming; implementation returns JSON in one shot with a clear note. This is a deliberate simplification, not an omission — revisit if latency becomes a UX issue.
- **Type consistency:** Protocol / Supplement types are defined once in `lib/schemas/protocol.ts` and imported everywhere. Timing enum values match between Zod, tool schema, and `DailyTimeline` column mapping.
- **No placeholders:** every step contains concrete code or exact commands.

## Hors scope (rappelé ici)

- Streaming incrémental du tool_use
- Déploiement cloud
- Envoi email automatique du PDF
- Statistiques d'usage
- Auth / multi-postes
