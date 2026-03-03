const mongoose = require('mongoose');

const shortlistSchema = new mongoose.Schema(
  {
    tenant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    properties: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shortlist', shortlistSchema);
