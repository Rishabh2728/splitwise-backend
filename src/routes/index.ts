import { Router } from 'express';
import importsRouter from './imports';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/imports', importsRouter);

export default router;
