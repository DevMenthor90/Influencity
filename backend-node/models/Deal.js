const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema(
  {
    dealNumber: { type: Number, required: true },

    creatorName: { type: String, required: true },
    clientName: { type: String, required: true },
    campaignName: { type: String, required: true },
    contentType: { type: String, required: true },
    currency: { type: String, default: 'COP' },
    totalValue: { type: Number, required: true },
    creatorPayment: { type: Number, required: true },
    commission: { type: Number, required: true },

    status: { type: String, default: 'Confirmado' },

    publicationLink: { type: String, default: null },
    publicationDate: { type: Date, default: null },
    notes: { type: String, default: null },

    approvedToBill: { type: Boolean, default: false },
    approvedToBillDate: { type: Date, default: null },

    creatorPaymentReceived: { type: Boolean, default: false },
    creatorPaymentDate: { type: Date, default: null },
    commissionReceived: { type: Boolean, default: false },
    commissionReceivedDate: { type: Date, default: null },

    createdBy: { type: String, required: true },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, collection: 'deals' }
);

module.exports = mongoose.models.Deal || mongoose.model('Deal', dealSchema);
