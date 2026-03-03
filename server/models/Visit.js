const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['requested', 'scheduled', 'visited', 'decision_pending'],
      default: 'requested',
    },
    preferredDate: { type: Date, required: true },
    scheduledDate: { type: Date },
    notes: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Visit', visitSchema);
