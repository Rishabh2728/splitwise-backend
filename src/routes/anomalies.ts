import { Router } from 'express';
import { listAnomalies, reviewAnomaly } from '../controllers/anomaly.controller';

const router = Router();

router.get('/', listAnomalies);
router.post('/:id/review', reviewAnomaly);

export default router;
