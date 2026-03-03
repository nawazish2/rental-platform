const mongoose = require('mongoose');

const moveInSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['checklist_pending', 'active', 'extension_requested', 'completed'],
      default: 'checklist_pending',
    },
    checklist: {
      documents: [
        {
          name: { type: String, required: true },
          url: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
        },
      ],
      agreementConfirmed: { type: Boolean, default: false },
      agreementConfirmedAt: { type: Date },
      inventoryList: [
        {
          item: { type: String, required: true },
          condition: { type: String, enum: ['good', 'fair', 'damaged'], default: 'good' },
          notes: { type: String, default: '' },
        },
      ],
    },
    moveInDate: { type: Date },
    extensionRequests: [
      {
        requestedUntil: { type: Date, required: true },
        reason: { type: String, required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        requestedAt: { type: Date, default: Date.now },
        respondedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('MoveIn', moveInSchema);
