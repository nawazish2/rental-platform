const router = require('express').Router();
const Property = require('../models/Property');
const Visit = require('../models/Visit');
const MoveIn = require('../models/MoveIn');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');

// All admin routes require auth + admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalListings, publishedListings, totalVisits, pendingVisits, totalTickets, openTickets, totalMoveIns, totalUsers] =
      await Promise.all([
        Property.countDocuments(),
        Property.countDocuments({ status: 'published' }),
        Visit.countDocuments(),
        Visit.countDocuments({ status: 'requested' }),
        SupportTicket.countDocuments(),
        SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        MoveIn.countDocuments(),
        User.countDocuments({ role: 'tenant' }),
      ]);
    res.json({
      listings: { total: totalListings, published: publishedListings },
      visits: { total: totalVisits, pending: pendingVisits },
      tickets: { total: totalTickets, open: openTickets },
      moveIns: { total: totalMoveIns },
      users: { tenants: totalUsers },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/listings
router.get('/listings', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const properties = await Property.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/visits
router.get('/visits', async (req, res) => {
  try {
    const visits = await Visit.find()
      .populate('property', 'title location city price')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ visits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/movein
router.get('/movein', async (req, res) => {
  try {
    const moveIns = await MoveIn.find()
      .populate('property', 'title location city price')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ moveIns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/moveout-requests
router.get('/moveout-requests', async (req, res) => {
  try {
    const moveIns = await MoveIn.find({ 'moveOut.status': 'requested' })
      .populate('property', 'title city')
      .populate('tenant', 'name email phone')
      .sort({ 'moveOut.requestedAt': -1 });
    res.json({ moveIns });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
