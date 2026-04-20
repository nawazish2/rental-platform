const router = require('express').Router();
const { param } = require('express-validator');
const Property = require('../models/Property');
const verifyToken = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { uploadImages } = require('../utils/cloudinary');
const { createNotification } = require('../services/notifications');
const {
  propertyListValidation,
  propertyCompareValidation,
  propertyPayloadValidation,
  propertyStatusValidation,
} = require('../validators');
const { escapeRegex } = require('../utils/escapeRegex');
const { serverError } = require('../utils/serverError');

const ALLOWED_PROPERTY_UPDATE_KEYS = [
  'title',
  'description',
  'location',
  'city',
  'price',
  'type',
  'amenities',
  'rules',
  'availableFrom',
  'bedrooms',
  'bathrooms',
  'area',
  'images',
  'blockedDates',
  'availabilityTimeline',
];

const propertyIdValidation = [
  param('id').isMongoId().withMessage('Property ID is invalid'),
];

const toStringList = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch (error) {}

    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// Helper: admin OR owner of the property
const adminOrOwner = async (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.role === 'owner') {
    const prop = await Property.findById(req.params.id).select('createdBy');
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    if (String(prop.createdBy) !== String(req.user._id)) return res.status(403).json({ message: 'Not your listing' });
    return next();
  }
  return res.status(403).json({ message: 'Forbidden' });
};

// GET /api/properties/my-listings (owner)
router.get('/my-listings', verifyToken, requireRole('owner'), async (req, res) => {
  try {
    const properties = await Property.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json({ properties });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/properties (public browse)
router.get('/', propertyListValidation, validate, async (req, res) => {
  try {
    const { location, budgetMin, budgetMax, moveInDate, type, page = 1, limit = 12 } = req.query;
    const query = { status: 'published' };

    if (location) {
      const safe = escapeRegex(location);
      query.$or = [
        { location: { $regex: safe, $options: 'i' } },
        { city: { $regex: safe, $options: 'i' } },
        { title: { $regex: safe, $options: 'i' } },
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
    return serverError(res, err);
  }
});

// GET /api/properties/compare?ids=id1,id2,id3 (public) - must be before /:id
router.get('/compare', propertyCompareValidation, validate, async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(',').slice(0, 3) : [];
    const properties = await Property.find({ _id: { $in: ids }, status: 'published' });
    res.json({ properties });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/properties/:id — published listings public; draft/review only for owner or admin
router.get('/:id', optionalAuth, propertyIdValidation, validate, async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('createdBy', 'name email');
    if (!property) return res.status(404).json({ message: 'Property not found' });

    if (property.status !== 'published') {
      const uid = req.user?._id || req.user?.id;
      const isOwner = uid && String(property.createdBy?._id || property.createdBy) === String(uid);
      const isAdmin = req.user?.role === 'admin';
      if (!isOwner && !isAdmin) {
        return res.status(404).json({ message: 'Property not found' });
      }
    }

    res.json({ property });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/properties (admin or owner)
router.post('/', verifyToken, (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'owner') return next();
  return res.status(403).json({ message: 'Forbidden' });
}, uploadImages.array('images', 10), propertyPayloadValidation, validate, async (req, res) => {
  try {
    const { title, description, location, city, price, type, amenities, rules, availableFrom, bedrooms, bathrooms, area } = req.body;
    // Support both file uploads (Cloudinary) and plain image URL arrays (JSON body)
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((f) => f.path);
    } else if (req.body.images) {
      images = toStringList(req.body.images);
    }
    const property = await Property.create({
      title, description, location, city,
      price: Number(price), type,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      area: area ? Number(area) : undefined,
      images,
      amenities: toStringList(amenities),
      rules: toStringList(rules),
      availableFrom: availableFrom ? new Date(availableFrom) : undefined,
      createdBy: req.user._id,
    });
    res.status(201).json({ property });
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/properties/:id (admin or owner)
router.put('/:id', verifyToken, propertyIdValidation, validate, adminOrOwner, uploadImages.array('images', 10), propertyPayloadValidation, validate, async (req, res) => {
  try {
    const updates = {};
    for (const key of ALLOWED_PROPERTY_UPDATE_KEYS) {
      if (Object.prototype.hasOwnProperty.call(req.body, key) && req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }
    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((f) => f.path);
    } else if (Object.prototype.hasOwnProperty.call(updates, 'images') && updates.images) {
      updates.images = toStringList(updates.images);
    }
    if (updates.price !== undefined && updates.price !== '') {
      updates.price = Number(updates.price);
    }
    if (updates.bedrooms !== undefined && updates.bedrooms !== '') updates.bedrooms = Number(updates.bedrooms);
    if (updates.bathrooms !== undefined && updates.bathrooms !== '') updates.bathrooms = Number(updates.bathrooms);
    if (updates.area !== undefined && updates.area !== '') updates.area = Number(updates.area);
    if (updates.amenities) updates.amenities = toStringList(updates.amenities);
    if (updates.rules) updates.rules = toStringList(updates.rules);
    if (updates.availableFrom) updates.availableFrom = new Date(updates.availableFrom);
    const property = await Property.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });
    res.json({ property });
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/properties/:id/status (admin)
router.put('/:id/status', verifyToken, requireRole('admin'), propertyStatusValidation, validate, async (req, res) => {
  try {
    const { status } = req.body;
    const property = await Property.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!property) return res.status(404).json({ message: 'Property not found' });

    const statusMessages = {
      review: {
        title: 'Listing Sent For Review',
        message: `"${property.title}" is now under admin review.`,
      },
      published: {
        title: 'Listing Published',
        message: `"${property.title}" is now live for tenants to browse.`,
      },
      draft: {
        title: 'Listing Moved To Draft',
        message: `"${property.title}" was moved back to draft.`,
      },
    };

    if (statusMessages[status]) {
      await createNotification(
        property.createdBy,
        'new_listing',
        statusMessages[status].title,
        statusMessages[status].message,
        '/owner'
      );
    }

    res.json({ property });
  } catch (err) {
    return serverError(res, err);
  }
});

// DELETE /api/properties/:id (admin or owner)
router.delete('/:id', verifyToken, propertyIdValidation, validate, adminOrOwner, async (req, res) => {
  try {
    const deleted = await Property.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Property not found' });
    res.json({ message: 'Property deleted' });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
