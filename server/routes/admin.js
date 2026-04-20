const router = require('express').Router();
const Property = require('../models/Property');
const Visit = require('../models/Visit');
const MoveIn = require('../models/MoveIn');
const SupportTicket = require('../models/SupportTicket');
const User = require('../models/User');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const { escapeRegex } = require('../utils/escapeRegex');
const { serverError } = require('../utils/serverError');

const getPaging = (req, defaultLimit = 25) => {
  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || String(defaultLimit)), 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

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
    return serverError(res, err);
  }
});

// GET /api/admin/listings
router.get('/listings', async (req, res) => {
  try {
    const { page, limit, skip } = getPaging(req, 20);
    const { status, q } = req.query;
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (q && String(q).trim()) {
      const safe = escapeRegex(String(q).trim());
      query.$or = [
        { title: { $regex: safe, $options: 'i' } },
        { city: { $regex: safe, $options: 'i' } },
        { location: { $regex: safe, $options: 'i' } },
      ];
    }
    const [statusAgg, total, properties] = await Promise.all([
      Property.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Property.countDocuments(query),
      Property.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);
    const statusCounts = { all: await Property.countDocuments(), draft: 0, review: 0, published: 0 };
    statusAgg.forEach((x) => {
      if (x._id && Object.prototype.hasOwnProperty.call(statusCounts, x._id)) {
        statusCounts[x._id] = x.n;
      }
    });
    res.json({
      properties,
      listings: properties,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      limit,
      statusCounts,
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/admin/visits
router.get('/visits', async (req, res) => {
  try {
    const { page, limit, skip } = getPaging(req, 25);
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const [statusAgg, total, visits] = await Promise.all([
      Visit.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
      Visit.countDocuments(query),
      Visit.find(query)
        .populate('property', 'title location city price images')
        .populate('tenant', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);
    const statusCounts = {
      all: await Visit.countDocuments(),
      requested: 0,
      scheduled: 0,
      visited: 0,
      decision_pending: 0,
    };
    statusAgg.forEach((x) => {
      if (x._id && Object.prototype.hasOwnProperty.call(statusCounts, x._id)) {
        statusCounts[x._id] = x.n;
      }
    });
    res.json({ visits, total, page, pages: Math.ceil(total / limit) || 1, limit, statusCounts });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/admin/movein
router.get('/movein', async (req, res) => {
  try {
    const { page, limit, skip } = getPaging(req, 25);
    const total = await MoveIn.countDocuments();
    const moveIns = await MoveIn.find()
      .populate('property', 'title location city price')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    res.json({ moveIns, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/admin/moveout-requests
router.get('/moveout-requests', async (req, res) => {
  try {
    const { page, limit, skip } = getPaging(req, 25);
    const baseQuery = { 'moveOut.status': 'requested' };
    const total = await MoveIn.countDocuments(baseQuery);
    const moveIns = await MoveIn.find(baseQuery)
      .populate('property', 'title city')
      .populate('tenant', 'name email phone')
      .sort({ 'moveOut.requestedAt': -1 })
      .skip(skip)
      .limit(limit);
    res.json({ moveIns, total, page, pages: Math.ceil(total / limit) || 1, limit });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
