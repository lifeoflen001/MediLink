import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '@workspace/db';
import {
  usersTable,
  customerProfilesTable,
  hospitalProfilesTable,
  pharmacyProfilesTable,
  supplierProfilesTable,
  doctorProfilesTable,
  institutionProfilesTable,
  type UserRole,
} from '@workspace/db';
import { eq } from 'drizzle-orm';
import { signToken } from '../lib/jwt.js';
import { requireAuth } from '../middlewares/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

// ── Helpers ──────────────────────────────────────────────────────────────────

async function getProfile(userId: string, role: UserRole) {
  switch (role) {
    case 'customer': {
      const [p] = await db.select().from(customerProfilesTable).where(eq(customerProfilesTable.userId, userId));
      return p ?? null;
    }
    case 'hospital': {
      const [p] = await db.select().from(hospitalProfilesTable).where(eq(hospitalProfilesTable.userId, userId));
      return p ?? null;
    }
    case 'pharmacy': {
      const [p] = await db.select().from(pharmacyProfilesTable).where(eq(pharmacyProfilesTable.userId, userId));
      return p ?? null;
    }
    case 'supplier': {
      const [p] = await db.select().from(supplierProfilesTable).where(eq(supplierProfilesTable.userId, userId));
      return p ?? null;
    }
    case 'doctor': {
      const [p] = await db.select().from(doctorProfilesTable).where(eq(doctorProfilesTable.userId, userId));
      return p ?? null;
    }
    case 'institution': {
      const [p] = await db.select().from(institutionProfilesTable).where(eq(institutionProfilesTable.userId, userId));
      return p ?? null;
    }
    default:
      return null;
  }
}

function getDisplayName(role: UserRole, profile: Record<string, unknown> | null): string {
  if (!profile) return 'User';
  switch (role) {
    case 'customer':   return (profile['fullName'] as string) ?? 'User';
    case 'hospital':   return (profile['institutionName'] as string) ?? 'Hospital';
    case 'pharmacy':   return (profile['pharmacyName'] as string) ?? 'Pharmacy';
    case 'supplier':   return (profile['companyName'] as string) ?? 'Supplier';
    case 'doctor':     return (profile['fullName'] as string) ?? 'Doctor';
    case 'institution':return (profile['institutionName'] as string) ?? 'Institution';
    case 'superadmin': return 'Super Admin';
    default:           return 'User';
  }
}

// ── POST /api/auth/register ───────────────────────────────────────────────────

router.post('/register', async (req, res) => {
  const { email, password, role, profile = {} } = req.body as {
    email: string;
    password: string;
    role: UserRole;
    profile: Record<string, unknown>;
  };

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Email, password and role are required' });
  }

  const REGISTERABLE: UserRole[] = ['customer', 'hospital', 'pharmacy', 'supplier', 'doctor', 'institution'];
  if (!REGISTERABLE.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const emailLower = email.toLowerCase().trim();

  try {
    const [existing] = await db.select({ id: usersTable.id })
      .from(usersTable).where(eq(usersTable.email, emailLower)).limit(1);

    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await db.transaction(async (tx) => {
      const [user] = await tx.insert(usersTable).values({
        email: emailLower,
        passwordHash,
        role,
        isActive: true,
      }).returning();

      const p = profile;

      switch (role) {
        case 'customer':
          await tx.insert(customerProfilesTable).values({
            userId: user.id,
            fullName: (p['fullName'] as string) || 'New User',
            phone: (p['phone'] as string) || null,
            county: (p['county'] as string) || null,
            gender: (p['gender'] as string) || null,
          });
          break;
        case 'hospital':
          await tx.insert(hospitalProfilesTable).values({
            userId: user.id,
            institutionName: (p['institutionName'] as string) || 'Hospital',
            hospitalType: (p['hospitalType'] as string) || null,
            address: (p['address'] as string) || null,
            county: (p['county'] as string) || null,
            phone: (p['phone'] as string) || null,
            contactEmail: (p['contactEmail'] as string) || null,
          });
          break;
        case 'pharmacy':
          await tx.insert(pharmacyProfilesTable).values({
            userId: user.id,
            pharmacyName: (p['pharmacyName'] as string) || 'Pharmacy',
            licenseNumber: (p['licenseNumber'] as string) || null,
            address: (p['address'] as string) || null,
            county: (p['county'] as string) || null,
            phone: (p['phone'] as string) || null,
            operatingHours: (p['operatingHours'] as string) || null,
            hasDelivery: (p['hasDelivery'] as boolean) ?? false,
            is24h: (p['is24h'] as boolean) ?? false,
          });
          break;
        case 'supplier':
          await tx.insert(supplierProfilesTable).values({
            userId: user.id,
            companyName: (p['companyName'] as string) || 'Supplier',
            registrationNumber: (p['registrationNumber'] as string) || null,
            address: (p['address'] as string) || null,
            county: (p['county'] as string) || null,
            phone: (p['phone'] as string) || null,
            contactEmail: (p['contactEmail'] as string) || null,
          });
          break;
        case 'doctor':
          await tx.insert(doctorProfilesTable).values({
            userId: user.id,
            fullName: (p['fullName'] as string) || 'Doctor',
            licenseNumber: (p['licenseNumber'] as string) || null,
            specialization: (p['specialization'] as string) || null,
            hospitalAffiliation: (p['hospitalAffiliation'] as string) || null,
            county: (p['county'] as string) || null,
            phone: (p['phone'] as string) || null,
          });
          break;
        case 'institution':
          await tx.insert(institutionProfilesTable).values({
            userId: user.id,
            institutionName: (p['institutionName'] as string) || 'Institution',
            institutionType: (p['institutionType'] as string) || null,
            address: (p['address'] as string) || null,
            county: (p['county'] as string) || null,
            phone: (p['phone'] as string) || null,
            contactEmail: (p['contactEmail'] as string) || null,
            description: (p['description'] as string) || null,
          });
          break;
      }

      return user;
    });

    const userProfile = await getProfile(newUser.id, role);
    const displayName = getDisplayName(role, userProfile as Record<string, unknown>);
    const token = signToken({ userId: newUser.id, role, email: newUser.email });

    return res.status(201).json({
      token,
      user: { id: newUser.id, email: newUser.email, role, displayName, isActive: newUser.isActive },
      profile: userProfile,
    });
  } catch (err) {
    logger.error({ err }, 'Registration error');
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────

router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim())).limit(1);

    if (!user) return res.status(401).json({ error: 'Invalid email or password' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated. Contact support.' });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const userProfile = await getProfile(user.id, user.role as UserRole);
    const displayName = getDisplayName(user.role as UserRole, userProfile as Record<string, unknown>);
    const token = signToken({ userId: user.id, role: user.role as UserRole, email: user.email });

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, displayName, isActive: user.isActive },
      profile: userProfile,
    });
  } catch (err) {
    logger.error({ err }, 'Login error');
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.id, req.user!.userId)).limit(1);

    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.isActive) return res.status(403).json({ error: 'Account deactivated' });

    const userProfile = await getProfile(user.id, user.role as UserRole);
    const displayName = getDisplayName(user.role as UserRole, userProfile as Record<string, unknown>);

    return res.json({
      user: { id: user.id, email: user.email, role: user.role, displayName, isActive: user.isActive, createdAt: user.createdAt },
      profile: userProfile,
    });
  } catch (err) {
    logger.error({ err }, 'Get me error');
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────

router.put('/profile', requireAuth, async (req, res) => {
  const { userId, role } = req.user!;
  const updates = req.body;
  // Strip system fields from updates
  delete updates['userId'];
  delete updates['updatedAt'];

  try {
    switch (role as UserRole) {
      case 'customer':
        await db.update(customerProfilesTable).set({ ...updates, updatedAt: new Date() }).where(eq(customerProfilesTable.userId, userId)); break;
      case 'hospital':
        await db.update(hospitalProfilesTable).set({ ...updates, updatedAt: new Date() }).where(eq(hospitalProfilesTable.userId, userId)); break;
      case 'pharmacy':
        await db.update(pharmacyProfilesTable).set({ ...updates, updatedAt: new Date() }).where(eq(pharmacyProfilesTable.userId, userId)); break;
      case 'supplier':
        await db.update(supplierProfilesTable).set({ ...updates, updatedAt: new Date() }).where(eq(supplierProfilesTable.userId, userId)); break;
      case 'doctor':
        await db.update(doctorProfilesTable).set({ ...updates, updatedAt: new Date() }).where(eq(doctorProfilesTable.userId, userId)); break;
      case 'institution':
        await db.update(institutionProfilesTable).set({ ...updates, updatedAt: new Date() }).where(eq(institutionProfilesTable.userId, userId)); break;
    }
    const userProfile = await getProfile(userId, role as UserRole);
    return res.json({ profile: userProfile });
  } catch (err) {
    logger.error({ err }, 'Update profile error');
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── PUT /api/auth/password ────────────────────────────────────────────────────

router.put('/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db.update(usersTable).set({ passwordHash, updatedAt: new Date() }).where(eq(usersTable.id, user.id));
    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    logger.error({ err }, 'Change password error');
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
