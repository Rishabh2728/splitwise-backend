import { parse } from 'csv-parse/sync';
import { prisma } from '../prismaClient';

export const ImportService = {
  processCsv: async (buffer: Buffer, filename: string, uploaderId?: string) => {
    const text = buffer.toString('utf8');
    const lines = text.split(/\r?\n/);

    // create import record
    const imp = await prisma.import.create({
      data: {
        filename,
        uploaderId,
        totalRows: 0,
        processedRows: 0,
        importedRows: 0,
        flaggedRows: 0,
        status: 'PROCESSING',
        report: { rawFile: text }
      }
    });

    let headerLine = lines.findIndex(l => l.trim().length > 0);
    if (headerLine === -1) headerLine = 0;
    const header = lines[headerLine] || '';

    const records: any[] = parse(text, { columns: true, skip_empty_lines: true }) as any[];

    await prisma.import.update({ where: { id: imp.id }, data: { totalRows: records.length } });

    let lineCursor = headerLine + 1;
    let processed = 0;
    let flagged = 0;

    for (const rec of records) {
      // find next non-empty raw line
      while (lineCursor < lines.length && lines[lineCursor].trim().length === 0) lineCursor++;
      const raw = lines[lineCursor] ?? '';

      const row = await prisma.importRow.create({
        data: {
          importId: imp.id,
          rowNumber: lineCursor + 1,
          rawData: { raw },
          parsedData: rec as any,
          status: 'PROCESSED'
        }
      });

      // Basic anomaly checks
      const anomalies: any[] = [];
      const amount = (rec as any).amount ?? (rec as any).total ?? (rec as any).value;
      if (amount === undefined || amount === null || isNaN(Number(amount))) {
        anomalies.push({ type: 'Invalid amount', severity: 'HIGH', description: 'Missing or invalid amount' });
      } else if (Number(amount) < 0) {
        anomalies.push({ type: 'Negative amount', severity: 'HIGH', description: 'Amount is negative' });
      }

      if (!(rec as any).payer && !(rec as any).payee && !(rec as any).paid_by) {
        anomalies.push({ type: 'Missing payer', severity: 'MEDIUM', description: 'No payer/payee field detected' });
      }

      if (anomalies.length > 0) {
        flagged++;
        for (const a of anomalies) {
          await prisma.anomaly.create({ data: {
            importRowId: row.id,
            type: a.type,
            severity: a.severity,
            description: a.description,
            state: 'PENDING'
          }});
        }
        await prisma.importRow.update({ where: { id: row.id }, data: { status: 'FLAGGED' } });
      }

      processed++;
      lineCursor++;
    }

    await prisma.import.update({ where: { id: imp.id }, data: { processedRows: processed, flaggedRows: flagged, status: 'COMPLETED' } });

    return { importId: imp.id, total: records.length, flagged };
  }
}

