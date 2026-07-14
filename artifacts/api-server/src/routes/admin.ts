import { Router } from 'express';
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
import { eq, desc, sql } from 'drizzle-orm';
import { requireAdmin } from '../middlewares/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();
router.use(requireAdmin);

// ── GET /api/admin/stats ──────────────────────────────────────────────────────

router.get('/stats', async (_req, res) => {
  try {
    const [stats] = await db.select({
      total: sql<number>`count(*)::int`,
      customers: sql<number>`count(*) filter (where role = 'customer')::int`,
      hospitals: sql<number>`count(*) filter (where role = 'hospital')::int`,
      pharmacies: sql<number>`count(*) filter (where role = 'pharmacy')::int`,
      suppliers: sql<number>`count(*) filter (where role = 'supplier')::int`,
      doctors: sql<number>`count(*) filter (where role = 'doctor')::int`,
      institutions: sql<number>`count(*) filter (where role = 'institution')::int`,
      active: sql<number>`count(*) filter (where is_active = true)::int`,
      inactive: sql<number>`count(*) filter (where is_active = false)::int`,
    }).from(usersTable);
    return res.json({ stats });
  } catch (err) {
    logger.error({ err }, 'Admin stats error');
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── Helper: resolve display name ──────────────────────────────────────────────

async function resolveDisplayName(userId: string, role: UserRole): Promise<string> {
  try {
    switch (role) {
      case 'customer': {
        const [p] = await db.select({ n: customerProfilesTable.fullName }).from(customerProfilesTable).where(eq(customerProfilesTable.userId, userId));
        return p?.n ?? '';
      }
      case 'hospital': {
        const [p] = await db.select({ n: hospitalProfilesTable.institutionName }).from(hospitalProfilesTable).where(eq(hospitalProfilesTable.userId, userId));
        return p?.n ?? '';
      }
      case 'pharmacy': {
        const [p] = await db.select({ n: pharmacyProfilesTable.pharmacyName }).from(pharmacyProfilesTable).where(eq(pharmacyProfilesTable.userId, userId));
        return p?.n ?? '';
      }
      case 'supplier': {
        const [p] = await db.select({ n: supplierProfilesTable.companyName }).from(supplierProfilesTable).where(eq(supplierProfilesTable.userId, userId));
        return p?.n ?? '';
      }
      case 'doctor': {
        const [p] = await db.select({ n: doctorProfilesTable.fullName }).from(doctorProfilesTable).where(eq(doctorProfilesTable.userId, userId));
        return p?.n ?? '';
      }
      case 'institution': {
        const [p] = await db.select({ n: institutionProfilesTable.institutionName }).from(institutionProfilesTable).where(eq(institutionProfilesTable.userId, userId));
        return p?.n ?? '';
      }
      case 'superadmin':
        return 'Super Admin';
      default:
        return '';
    }
  } catch {
    return '';
  }
}

// ── GET /api/admin/users ──────────────────────────────────────────────────────

router.get('/users', async (req, res) => {
  const { role, page = '1', limit = '25' } = req.query as Record<string, string>;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  try {
    const base = db.select({
      id: usersTable.id,
      email: usersTable.email,
      role: usersTable.role,
      isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable);

    const query = role && role !== 'all'
      ? base.where(eq(usersTable.role, role))
      : base;

    const users = await query.orderBy(desc(usersTable.createdAt)).limit(limitNum).offset(offset);

    const usersWithNames = await Promise.all(
      users.map(async (u) => ({
        ...u,
        displayName: await resolveDisplayName(u.id, u.role as UserRole) || u.email,
      }))
    );

    const [countRow] = await db.select({ count: sql<number>`count(*)::int` })
      .from(usersTable)
      .where(role && role !== 'all' ? eq(usersTable.role, role) : undefined as any);

    return res.json({
      users: usersWithNames,
      total: countRow?.count ?? 0,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    logger.error({ err }, 'Admin list users error');
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── GET /api/admin/users/:id ──────────────────────────────────────────────────

router.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) return res.status(404).json({ error: 'User not found' });

    let profile = null;
    switch (user.role as UserRole) {
      case 'customer': { const [p] = await db.select().from(customerProfilesTable).where(eq(customerProfilesTable.userId, id)); profile = p ?? null; break; }
      case 'hospital':  { const [p] = await db.select().from(hospitalProfilesTable).where(eq(hospitalProfilesTable.userId, id)); profile = p ?? null; break; }
      case 'pharmacy':  { const [p] = await db.select().from(pharmacyProfilesTable).where(eq(pharmacyProfilesTable.userId, id)); profile = p ?? null; break; }
      case 'supplier':  { const [p] = await db.select().from(supplierProfilesTable).where(eq(supplierProfilesTable.userId, id)); profile = p ?? null; break; }
      case 'doctor':    { const [p] = await db.select().from(doctorProfilesTable).where(eq(doctorProfilesTable.userId, id)); profile = p ?? null; break; }
      case 'institution':{ const [p] = await db.select().from(institutionProfilesTable).where(eq(institutionProfilesTable.userId, id)); profile = p ?? null; break; }
    }

    const { passwordHash: _, ...safeUser } = user;
    const displayName = await resolveDisplayName(id, user.role as UserRole) || user.email;

    return res.json({ user: { ...safeUser, displayName }, profile });
  } catch (err) {
    logger.error({ err }, 'Admin get user error');
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────

router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (id === req.user!.userId) return res.status(400).json({ error: 'Cannot delete your own account' });

  try {
    const [user] = await db.select({ id: usersTable.id, role: usersTable.role })
      .from(usersTable).where(eq(usersTable.id, id)).limit(1);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'superadmin') return res.status(400).json({ error: 'Cannot delete another superadmin' });

    await db.delete(usersTable).where(eq(usersTable.id, id));
    return res.json({ message: 'User deleted successfully' });
  } catch (err) {
    logger.error({ err }, 'Admin delete user error');
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ── PATCH /api/admin/users/:id/status ────────────────────────────────────────

router.patch('/users/:id/status', async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive: boolean };
  if (id === req.user!.userId) return res.status(400).json({ error: 'Cannot modify your own status' });

  try {
    const [updated] = await db.update(usersTable)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(usersTable.id, id))
      .returning({ id: usersTable.id, isActive: usersTable.isActive });

    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json({ user: updated });
  } catch (err) {
    logger.error({ err }, 'Admin toggle status error');
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

export default router;
