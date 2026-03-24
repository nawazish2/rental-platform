const router = require('express').Router();
const Visit = require('../models/Visit');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createNotification } = require('./notifications');

// POST /api/visits - tenant requests a visit
router.post('/', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const { propertyId, preferredDate, notes } = req.body;
    if (!propertyId || !preferredDate) {
      return res.status(400).json({ message: 'propertyId and preferredDate required' });
    }
    // Prevent duplicate pending requests for same property
    const existing = await Visit.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: { $in: ['requested', 'scheduled'] },
    });
    if (existing) return res.status(400).json({ message: 'You already have an active visit request for this property' });

    const visit = await Visit.create({
      property: propertyId,
      tenant: req.user._id,
      preferredDate: new Date(preferredDate),
      notes: notes || '',
    });
    await visit.populate('property', 'title location price images');
    res.status(201).json({ visit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/visits/my - tenant's own visits
router.get('/my', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const visits = await Visit.find({ tenant: req.user._id })
      .populate('property', 'title location price images city')
      .sort({ createdAt: -1 });
    res.json({ visits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/visits/my-property - owner gets visits on their properties
router.get('/my-property', verifyToken, requireRole('owner'), async (req, res) => {
  try {
    const Property = require('../models/Property');
    const myProps = await Property.find({ createdBy: req.user._id }).select('_id');
    const propIds = myProps.map(p => p._id);
    const visits = await Visit.find({ property: { $in: propIds } })
      .populate('property', 'title city')
      .populate('tenant', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ visits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/visits - admin gets all visits
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
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

// PUT /api/visits/:id/status - admin updates visit status
router.put('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status, scheduledDate, adminNotes } = req.body;
    const allowed = ['requested', 'scheduled', 'visited', 'decision_pending'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    const updates = { status };
    if (scheduledDate) updates.scheduledDate = new Date(scheduledDate);
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;

    const visit = await Visit.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('property', 'title location')
      .populate('tenant', 'name email');
    if (!visit) return res.status(404).json({ message: 'Visit not found' });

    // Send notification to tenant
    const statusMessages = {
      scheduled: `Your visit to "${visit.property.title}" has been scheduled${scheduledDate ? ' on ' + new Date(scheduledDate).toLocaleDateString('en-IN',{day:'numeric',month:'short'}) : ''}.`,
      visited: `Your visit to "${visit.property.title}" has been marked as completed.`,
      decision_pending: `Your visit to "${visit.property.title}" is complete. Ready to move in?`,
    };
    if (statusMessages[status]) {
      await createNotification(visit.tenant._id, 'visit_update', 'Visit Update 📅', statusMessages[status], '/dashboard');
    }
    res.json({ visit });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
