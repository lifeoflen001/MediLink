import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';

export const ROLES = [
  'superadmin',
  'customer',
  'hospital',
  'pharmacy',
  'supplier',
  'doctor',
  'institution',
] as const;

export type UserRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  superadmin: 'Super Admin',
  customer: 'Patient / Customer',
  hospital: 'Hospital / Clinic',
  pharmacy: 'Pharmacy',
  supplier: 'Medical Supplier',
  doctor: 'Private Doctor',
  institution: 'Health Institution',
};

export const usersTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().$type<UserRole>(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;
