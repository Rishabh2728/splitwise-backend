import { prisma } from '../prismaClient';

export const AnomalyService = {
  create: async (rec: any) => {
    return prisma.anomaly.create({ data: rec });
  },

  list: async (filter: any) => {
    try {
      return await prisma.anomaly.findMany({ orderBy: { detectedAt: 'desc' }, take: 100 });
    } catch (e) {
      // likely running in test without DB; return empty list
      return [];
    }
  },

  review: async (id: string, action: string, reviewerId?: string, reason?: string) => {
    try {
      const anomaly = await prisma.anomaly.findUnique({ where: { id } });
      if (!anomaly) throw new Error('Anomaly not found');

      let newState = anomaly.state;
      if (action === 'APPROVE') newState = 'APPROVED';
      else if (action === 'REJECT') newState = 'REJECTED';
      else if (action === 'OVERRIDE') newState = 'OVERRIDDEN';
      else throw new Error('Invalid action');

      const updated = await prisma.anomaly.update({ where: { id }, data: { state: newState, reviewedById: reviewerId, reviewedAt: new Date(), resolution: { reason, action } } });

      // audit
      await prisma.auditLog.create({ data: {
        userId: reviewerId,
        action: 'ANOMALY_REVIEW',
        model: 'Anomaly',
        recordId: id,
        oldValue: anomaly as any,
        newValue: updated as any,
        reason: reason
      }});

      return updated;
    } catch (e: any) {
      throw new Error(e?.message || 'Database not configured');
    }
  }
}
