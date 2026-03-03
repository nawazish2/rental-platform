const router = require('express').Router();
const Property = require('../models/Property');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const { uploadImages } = require('../utils/cloudinary');

// GET /api/properties - browse with filters (public)
router.get('/', async (req, res) => {
  try {
    const { location, budgetMin, budgetMax, moveInDate, type, page = 1, limit = 12 } = req.query;
    const query = { status: 'published' };

    if (location) {
      query.$or = [
        { location: { $regex: location, $options: 'i' } },
        { city: { $regex: location, $options: 'i' } },
        { title: { $regex: location, $options: 'i' } },
      ];
    }
    if (budgetMin || budgetMax) {
      query.price = {};
      if (budgetMin) query.price.$gte = Number(budgetMin);
      if (budgetMax) query.price.$lte = Number(budgetMax);
    }
    if (moveInDate) query.availableFrom = { $lte: new Date(moveInDate) };
    if (type) query.type = type;

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/properties/compare?ids=id1,id2,id3 (public) - must be before /:id
router.get('/compare', async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',').slice(0, 3) : [];
    if (ids.length < 2) return res.status(400).json({ message: 'Provide 2-3 property IDs' });
    const properties = await Property.find({ _id: { $in: ids }, status: 'published' });
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/properties/:id (public)
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('createdBy', 'name email');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/properties (admin)
router.post('/', verifyToken, requireRole('admin'), uploadImages.array('images', 10), async (req, res) => {
  try {
    const { title, description, location, city, price, type, amenities, rules, availableFrom } = req.body;
    const images = req.files ? req.files.map((f) => f.path) : [];
    const property = await Property.create({
      title, description, location, city,
      price: Number(price), type,
      images,
      amenities: amenities ? (Array.isArray(amenities) ? amenities : amenities.split(',').map(s => s.trim())) : [],
      rules: rules ? (Array.isArray(rules) ? rules : rules.split(',').map(s => s.trim())) : [],
      availableFrom: new Date(availableFrom),
      createdBy: req.user._id,
    });
    res.status(201).json({ property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/properties/:id (admin)
router.put('/:id', verifyToken, requireRole('admin'), uploadImages.array('images', 10), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => f.path);
    }
    if (updates.price) updates.price = Number(updates.price);
    if (updates.amenities && !Array.isArray(updates.amenities)) {
      updates.amenities = updates.amenities.split(',').map(s => s.trim());
    }
    if (updates.rules && !Array.isArray(updates.rules)) {
      updates.rules = updates.rules.split(',').map(s => s.trim());
    }
    delete updates.status; // status changed via separate route
    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/properties/:id/status (admin)
const STATUS_FLOW = { draft: 'review', review: 'published' };
router.put('/:id/status', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['draft', 'review', 'published'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/properties/:id (admin)
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.id);
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
