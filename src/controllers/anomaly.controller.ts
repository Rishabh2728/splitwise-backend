import { Request, Response } from 'express';
import { AnomalyService } from '../anomalies/anomaly.service';

export const listAnomalies = async (req: Request, res: Response) => {
  const q = req.query || {};
  const items = await AnomalyService.list(q as any);
  res.json(items);
}

export const reviewAnomaly = async (req: Request, res: Response) => {
  const id = req.params.id;
  const { action, reason, reviewerId } = req.body;
  try {
    const result = await AnomalyService.review(id, action, reviewerId, reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
