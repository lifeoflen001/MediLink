import { pgTable, uuid, text, boolean, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { usersTable } from './users';

export const customerProfilesTable = pgTable('customer_profiles', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  phone: text('phone'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  county: text('county'),
  bloodType: text('blood_type'),
  allergies: text('allergies'),
  emergencyContact: text('emergency_contact'),
  emergencyPhone: text('emergency_phone'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const hospitalProfilesTable = pgTable('hospital_profiles', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  institutionName: text('institution_name').notNull(),
  licenseNumber: text('license_number'),
  hospitalType: text('hospital_type'), // general | specialized | clinic | referral | maternity
  address: text('address'),
  county: text('county'),
  phone: text('phone'),
  contactEmail: text('contact_email'),
  website: text('website'),
  bedCount: integer('bed_count'),
  departments: jsonb('departments').$type<string[]>().default([]),
  hasEmergency: boolean('has_emergency').default(false),
  verified: boolean('verified').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const pharmacyProfilesTable = pgTable('pharmacy_profiles', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  pharmacyName: text('pharmacy_name').notNull(),
  licenseNumber: text('license_number'),
  address: text('address'),
  county: text('county'),
  phone: text('phone'),
  operatingHours: text('operating_hours'),
  hasDelivery: boolean('has_delivery').default(false),
  is24h: boolean('is_24h').default(false),
  services: jsonb('services').$type<string[]>().default([]),
  verified: boolean('verified').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const supplierProfilesTable = pgTable('supplier_profiles', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  registrationNumber: text('registration_number'),
  address: text('address'),
  county: text('county'),
  phone: text('phone'),
  contactEmail: text('contact_email'),
  productCategories: jsonb('product_categories').$type<string[]>().default([]),
  coverageAreas: jsonb('coverage_areas').$type<string[]>().default([]),
  certifications: text('certifications'),
  verified: boolean('verified').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const doctorProfilesTable = pgTable('doctor_profiles', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  fullName: text('full_name').notNull(),
  licenseNumber: text('license_number'),
  specialization: text('specialization'),
  qualifications: text('qualifications'),
  hospitalAffiliation: text('hospital_affiliation'),
  yearsExperience: integer('years_experience'),
  consultationFee: integer('consultation_fee'),
  county: text('county'),
  phone: text('phone'),
  availableDays: jsonb('available_days').$type<string[]>().default([]),
  languages: jsonb('languages').$type<string[]>().default(['English']),
  verified: boolean('verified').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const institutionProfilesTable = pgTable('institution_profiles', {
  userId: uuid('user_id').primaryKey().references(() => usersTable.id, { onDelete: 'cascade' }),
  institutionName: text('institution_name').notNull(),
  institutionType: text('institution_type'), // research | insurance | ngo | forum | association | other
  registrationNumber: text('registration_number'),
  address: text('address'),
  county: text('county'),
  phone: text('phone'),
  contactEmail: text('contact_email'),
  description: text('description'),
  website: text('website'),
  focusAreas: jsonb('focus_areas').$type<string[]>().default([]),
  verified: boolean('verified').default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export type CustomerProfile = typeof customerProfilesTable.$inferSelect;
export type HospitalProfile = typeof hospitalProfilesTable.$inferSelect;
export type PharmacyProfile = typeof pharmacyProfilesTable.$inferSelect;
export type SupplierProfile = typeof supplierProfilesTable.$inferSelect;
export type DoctorProfile = typeof doctorProfilesTable.$inferSelect;
export type InstitutionProfile = typeof institutionProfilesTable.$inferSelect;
