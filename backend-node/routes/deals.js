const express = require('express');
const ExcelJS = require('exceljs');
const Deal = require('../models/Deal');
const Counter = require('../models/Counter');
const { authenticate } = require('../lib/authMiddleware');

const router = express.Router();
router.use(authenticate);

async function getNextDealNumber() {
  const counter = await Counter.findOneAndUpdate(
    { _id: 'dealNumber' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return counter.seq;
}

function buildFilter(query) {
  const filter = {};
  if (query.campaignName) filter.campaignName = { $regex: query.campaignName, $options: 'i' };
  if (query.creatorName) filter.creatorName = { $regex: query.creatorName, $options: 'i' };
  if (query.clientName) filter.clientName = { $regex: query.clientName, $options: 'i' };
  if (query.status) filter.status = query.status;

  if (query.dateFrom || query.dateTo) {
    filter.createdAt = {};
    if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
    if (query.dateTo) {
      const to = new Date(query.dateTo);
      to.setDate(to.getDate() + 1);
      filter.createdAt.$lte = to;
    }
  }
  return filter;
}

function toResponse(d) {
  return {
    id: d._id.toString(),
    dealNumber: d.dealNumber,
    creatorName: d.creatorName,
    clientName: d.clientName,
    campaignName: d.campaignName,
    contentType: d.contentType,
    currency: d.currency,
    totalValue: d.totalValue,
    creatorPayment: d.creatorPayment,
    commission: d.commission,
    status: d.status,
    publicationLink: d.publicationLink,
    publicationDate: d.publicationDate,
    notes: d.notes,
    approvedToBill: d.approvedToBill,
    creatorPaymentReceived: d.creatorPaymentReceived,
    creatorPaymentDate: d.creatorPaymentDate,
    commissionReceived: d.commissionReceived,
    commissionReceivedDate: d.commissionReceivedDate,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 20;
  const filter = buildFilter(req.query);

  const total = await Deal.countDocuments(filter);
  const items = await Deal.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  res.json({
    items: items.map(toResponse),
    totalCount: total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
});

router.get('/dashboard', async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const allDeals = await Deal.find({});

  const activeDeals = allDeals.filter((d) => d.status !== 'Cancelado').length;
  const thisMonth = allDeals.filter((d) => d.createdAt >= startOfMonth);
  const totalValueMonth = thisMonth.reduce((s, d) => s + d.totalValue, 0);
  const totalCommissionsMonth = thisMonth.reduce((s, d) => s + d.commission, 0);
  const pendingCommissions = allDeals
    .filter((d) => !d.commissionReceived && d.status !== 'Cancelado')
    .reduce((s, d) => s + d.commission, 0);
  const publishedDeals = allDeals.filter((d) => d.status === 'Publicado').length;
  const cancelledDeals = allDeals.filter((d) => d.status === 'Cancelado').length;
  const dealsWithoutLink = allDeals.filter((d) => !d.publicationLink && d.status !== 'Cancelado').length;
  const pendingApproval = allDeals.filter(
    (d) => !d.approvedToBill && d.publicationLink && d.status !== 'Cancelado'
  ).length;
  const pendingCommissionCount = allDeals.filter(
    (d) => !d.commissionReceived && d.status !== 'Cancelado'
  ).length;

  res.json({
    totalActiveDeals: activeDeals,
    totalValueThisMonth: totalValueMonth,
    totalCommissionsThisMonth: totalCommissionsMonth,
    pendingCommissions,
    totalPublishedDeals: publishedDeals,
    totalCancelledDeals: cancelledDeals,
    dealsWithoutLink,
    pendingApprovalToBill: pendingApproval,
    pendingCommissionCount,
  });
});

router.get('/export', async (req, res) => {
  const filter = buildFilter(req.query);
  const deals = await Deal.find(filter).sort({ createdAt: -1 }).limit(10000);

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('Deals');

  const headers = [
    'ID', 'Creador', 'Cliente', 'Campaña', 'Tipo Contenido', 'Moneda',
    'Valor Total', 'Pago Creador (80%)', 'Comisión (20%)', 'Estado',
    'Link Publicación', 'Fecha Publicación', 'Aprobado Facturar',
    'Pago Creador Recibido', 'Fecha Pago Creador',
    'Comisión Recibida', 'Fecha Comisión', 'Notas', 'Fecha Creación',
  ];
  ws.addRow(headers);
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };

  const fmtDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

  for (const d of deals) {
    ws.addRow([
      `DEAL-${String(d.dealNumber).padStart(3, '0')}`,
      d.creatorName,
      d.clientName,
      d.campaignName,
      d.contentType,
      d.currency,
      d.totalValue,
      d.creatorPayment,
      d.commission,
      d.status,
      d.publicationLink || '',
      fmtDate(d.publicationDate),
      d.approvedToBill ? 'Sí' : 'No',
      d.creatorPaymentReceived ? 'Sí' : 'No',
      fmtDate(d.creatorPaymentDate),
      d.commissionReceived ? 'Sí' : 'No',
      fmtDate(d.commissionReceivedDate),
      d.notes || '',
      fmtDate(d.createdAt),
    ]);
  }

  ws.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const len = cell.value ? cell.value.toString().length : 0;
      if (len > maxLength) maxLength = len;
    });
    col.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `deals_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(Buffer.from(buffer));
});

router.get('/:id', async (req, res) => {
  const deal = await Deal.findById(req.params.id).catch(() => null);
  if (!deal) return res.status(404).json({ message: 'Deal no encontrado.' });
  res.json(toResponse(deal));
});

router.post('/', async (req, res) => {
  const { creatorName, clientName, campaignName, contentType, currency, totalValue } = req.body || {};

  const dealNumber = await getNextDealNumber();
  const value = Number(totalValue) || 0;

  const deal = await Deal.create({
    dealNumber,
    creatorName: (creatorName || '').trim(),
    clientName: (clientName || '').trim(),
    campaignName: (campaignName || '').trim(),
    contentType,
    currency: currency || 'COP',
    totalValue: value,
    creatorPayment: Math.round(value * 0.8 * 100) / 100,
    commission: Math.round(value * 0.2 * 100) / 100,
    status: 'Confirmado',
    createdBy: req.user.id,
  });

  res.status(201).json(toResponse(deal));
});

router.put('/:id', async (req, res) => {
  const deal = await Deal.findById(req.params.id).catch(() => null);
  if (!deal) return res.status(400).json({ message: 'Deal no encontrado.' });

  const body = req.body || {};

  if (body.approvedToBill === true && !deal.publicationLink && !body.publicationLink) {
    return res.status(400).json({ message: 'No se puede aprobar para facturación sin un link de publicación.' });
  }

  const fields = [
    'creatorName', 'clientName', 'campaignName', 'contentType', 'currency',
    'status', 'publicationLink', 'publicationDate', 'notes', 'approvedToBill',
    'creatorPaymentReceived', 'creatorPaymentDate', 'commissionReceived', 'commissionReceivedDate',
  ];

  for (const field of fields) {
    if (body[field] !== undefined && body[field] !== null) {
      if (typeof body[field] === 'string' && ['creatorName', 'clientName', 'campaignName'].includes(field)) {
        deal[field] = body[field].trim();
      } else {
        deal[field] = body[field];
      }
    }
  }

  if (body.totalValue !== undefined && body.totalValue !== null) {
    const value = Number(body.totalValue);
    deal.totalValue = value;
    deal.creatorPayment = Math.round(value * 0.8 * 100) / 100;
    deal.commission = Math.round(value * 0.2 * 100) / 100;
  }

  await deal.save();
  res.json({ message: 'Deal actualizado.', data: toResponse(deal) });
});

router.delete('/:id', async (req, res) => {
  const result = await Deal.findByIdAndDelete(req.params.id).catch(() => null);
  if (!result) return res.status(404).json({ message: 'Deal no encontrado.' });
  res.json({ message: 'Deal eliminado.' });
});

module.exports = router;
