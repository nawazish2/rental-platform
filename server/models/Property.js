const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    city: { type: String, required: true },
    price: { type: Number, required: true },
    type: {
      type: String,
      enum: ['1BHK', '2BHK', '3BHK', 'Studio', 'Villa', 'Hostel', 'Airbnb'],
      required: true,
    },
    images: [{ type: String }],
    amenities: [{ type: String }],
    rules: [{ type: String }],
    availableFrom: { type: Date, required: false, default: Date.now },
    blockedDates: [{ type: Date }],
    availabilityTimeline: [
      {
        date: Date,
        note: String,
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'review', 'published'],
      default: 'draft',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Text index for location/title search
propertySchema.index({ location: 'text', title: 'text', city: 'text' });

module.exports = mongoose.model('Property', propertySchema);
