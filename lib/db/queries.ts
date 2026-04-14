import "server-only";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, rawSqlite } from "./client";
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
    emailSentAt: row.emailSentAt,
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

export type ClientListRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  consultationCount: number;
  lastConsultationAt: number | null;
  lastConsultationId: string | null;
};

export function listClientsWithCounts(): ClientListRow[] {
  const stmt = rawSqlite.prepare<unknown[], ClientListRow>(
    `SELECT c.id as id, c.first_name as firstName, c.last_name as lastName, c.email as email, c.phone as phone,
            COUNT(co.id) as consultationCount,
            MAX(co.created_at) as lastConsultationAt,
            (SELECT id FROM consultations WHERE client_id = c.id ORDER BY created_at DESC LIMIT 1) as lastConsultationId
     FROM clients c
     LEFT JOIN consultations co ON co.client_id = c.id
     GROUP BY c.id
     ORDER BY lastConsultationAt DESC`
  );
  return stmt.all();
}

export function deleteClient(clientId: string) {
  db.delete(clients).where(eq(clients.id, clientId)).run();
}

export function markEmailSent(consultationId: string) {
  db.update(consultations)
    .set({ emailSentAt: new Date() })
    .where(eq(consultations.id, consultationId))
    .run();
}
