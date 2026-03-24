const router = require('express').Router();
const Review = require('../models/Review');
const Visit = require('../models/Visit');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');

// GET reviews for a property
router.get('/property/:propertyId', async (req, res) => {
  try {
    const reviews = await Review.find({ property: req.params.propertyId })
      .populate('tenant', 'name')
      .sort({ createdAt: -1 });
    const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;
    res.json({ reviews, avgRating: avg, total: reviews.length });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create/update review (tenant only, must have visited)
router.post('/', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const { propertyId, rating, comment } = req.body;
    const visited = await Visit.findOne({ property: propertyId, tenant: req.user.id, status: { $in: ['visited','decision_pending'] } });
    if (!visited) return res.status(403).json({ message: 'You must visit a property before reviewing it' });
    const review = await Review.findOneAndUpdate(
      { property: propertyId, tenant: req.user.id },
      { rating, comment },
      { upsert: true, new: true }
    ).populate('tenant', 'name');
    res.status(201).json({ message: 'Review submitted', review });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE own review
router.delete('/:id', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    await Review.findOneAndDelete({ _id: req.params.id, tenant: req.user.id });
    res.json({ message: 'Review deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
