import { Request, Response } from 'express';

export const login = async (req: Request, res: Response) => {
  res.json({ token: 'stub' });
}
