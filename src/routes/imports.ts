import { Router } from 'express';
import multer from 'multer';
import { ImportService } from '../imports/import.service';

const router = Router();
const upload = multer();

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const result = await ImportService.processCsv(req.file.buffer, req.file.originalname);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
