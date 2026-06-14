import request from 'supertest';
import app from '../testApp';
import { prisma } from '../prismaClient';

describe('Anomaly API', () => {
  test('list anomalies', async () => {
    const res = await request(app).get('/api/anomalies');
    expect(res.status).toBe(200);
  });

  test('review non-existent anomaly', async () => {
    const res = await request(app).post('/api/anomalies/nonexistent/review').send({ action: 'APPROVE', reviewerId: null });
    expect(res.status).toBe(400);
  });
});
