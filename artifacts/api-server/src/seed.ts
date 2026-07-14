import bcrypt from 'bcryptjs';
import { db } from '@workspace/db';
import { usersTable } from '@workspace/db';
import { eq } from 'drizzle-orm';
import { logger } from './lib/logger.js';

export async function seedSuperAdmin() {
  try {
    const [existing] = await db.select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.role, 'superadmin'))
      .limit(1);

    if (!existing) {
      const passwordHash = await bcrypt.hash('Admin@MediConnect2024', 12);
      await db.insert(usersTable).values({
        email: 'admin@mediconnect.app',
        passwordHash,
        role: 'superadmin',
        isActive: true,
      });
      logger.info('✅ Superadmin seeded — email: admin@mediconnect.app  password: Admin@MediConnect2024');
    }
  } catch (err) {
    logger.error({ err }, 'Superadmin seed failed');
  }
}
