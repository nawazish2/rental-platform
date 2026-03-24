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
    const [total, published, draft, review, pendingVisits, openTickets, activeMoveIns, totalVisits, totalTickets] =
      await Promise.all([
        Property.countDocuments(),
        Property.countDocuments({ status: 'published' }),
        Property.countDocuments({ status: 'draft' }),
        Property.countDocuments({ status: 'under_review' }),
        Visit.countDocuments({ status: 'requested' }),
        SupportTicket.countDocuments({ status: { $in: ['open', 'in_progress'] } }),
        MoveIn.countDocuments({ status: { $in: ['documents_uploaded', 'agreement_signed', 'inventory_done'] } }),
        Visit.countDocuments(),
        SupportTicket.countDocuments(),
      ]);
    res.json({
      totalProperties: total,
      publishedProperties: published,
      draftProperties: draft,
      reviewProperties: review,
      pendingVisits,
      openTickets,
      activeMoveIns,
      totalVisits,
      totalTickets,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/charts — data for Chart.js visualisations
router.get('/charts', async (req, res) => {
  try {
    // 1. Monthly visits — last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const visitsByMonth = await Visit.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    // Build full 6-month labels with 0 for missing months
    const monthLabels = [];
    const monthCounts = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      monthLabels.push(monthNames[d.getMonth()]);
      const found = visitsByMonth.find(v => v._id.year === d.getFullYear() && v._id.month === d.getMonth() + 1);
      monthCounts.push(found ? found.count : 0);
    }

    // 2. Properties by city
    const propertiesByCity = await Property.aggregate([
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // 3. Ticket status breakdown
    const ticketStatus = await SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      visits: { labels: monthLabels, data: monthCounts },
      propertiesByCity: {
        labels: propertiesByCity.map(p => p._id || 'Unknown'),
        data: propertiesByCity.map(p => p.count),
      },
      ticketStatus: {
        labels: ticketStatus.map(t => t._id),
        data: ticketStatus.map(t => t.count),
      },
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
