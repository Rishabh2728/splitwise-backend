import { Router } from 'express';
import importsRouter from './imports';
import anomaliesRouter from './anomalies';

const router = Router();

router.get('/health', (req, res) => res.json({ ok: true }));
router.use('/imports', importsRouter);
router.use('/anomalies', anomaliesRouter);

export default router;
