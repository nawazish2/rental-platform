const router = require('express').Router();
const mongoose = require('mongoose');
const Review = require('../models/Review');
const Visit = require('../models/Visit');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { reviewCreateValidation } = require('../validators');
const { serverError } = require('../utils/serverError');

// GET reviews for a property (paginated; avg/total over all reviews)
router.get('/property/:propertyId', async (req, res) => {
  try {
    const { propertyId } = req.params;
    if (!mongoose.isValidObjectId(propertyId)) {
      return res.status(400).json({ message: 'Invalid property id' });
    }
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const agg = await Review.aggregate([
      { $match: { property: new mongoose.Types.ObjectId(propertyId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, total: { $sum: 1 } } },
    ]);
    const stats = agg[0] || { avgRating: null, total: 0 };
    const avgRating = stats.total ? Number(stats.avgRating).toFixed(1) : null;

    const reviews = await Review.find({ property: propertyId })
      .populate('tenant', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      reviews,
      avgRating,
      total: stats.total,
      page,
      pages: stats.total ? Math.ceil(stats.total / limit) : 1,
      limit,
    });
  } catch (e) {
    return serverError(res, e);
  }
});

// POST create/update review (tenant only, must have visited)
router.post('/', verifyToken, requireRole('tenant'), reviewCreateValidation, validate, async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const visited = await Visit.findOne({ property: propertyId, tenant: req.user._id, status: { $in: ['visited', 'decision_pending'] } });
    if (!visited) return res.status(403).json({ message: 'You must visit a property before reviewing it' });
    const review = await Review.findOneAndUpdate(
      { property: propertyId, tenant: req.user._id },
      { rating, comment },
      { upsert: true, new: true }
    ).populate('tenant', 'name');
    res.status(201).json({ message: 'Review submitted', review });
  } catch (e) {
    return serverError(res, e);
  }
});

// DELETE own review
router.delete('/:id', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    await Review.findOneAndDelete({ _id: req.params.id, tenant: req.user._id });
    res.json({ message: 'Review deleted' });
  } catch (e) {
    return serverError(res, e);
  }
});

module.exports = router;
