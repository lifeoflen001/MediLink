import { Router, type IRouter } from 'express';
import healthRouter from './health.js';
import aiRouter from './ai.js';
import authRouter from './auth.js';
import adminRouter from './admin.js';

const router: IRouter = Router();

router.use(healthRouter);
router.use('/ai', aiRouter);
router.use('/auth', authRouter);
router.use('/admin', adminRouter);

export default router;
