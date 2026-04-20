const router = require('express').Router();
const Shortlist = require('../models/Shortlist');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { shortlistAddValidation, shortlistRemoveValidation } = require('../validators');
const { serverError } = require('../utils/serverError');

// GET /api/shortlists/my
router.get('/my', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const shortlist = await Shortlist.findOne({ tenant: req.user._id }).populate(
      'properties',
      'title location city price type images amenities rules availableFrom status'
    );
    res.json({ properties: shortlist ? shortlist.properties : [] });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/shortlists/add
router.post('/add', verifyToken, requireRole('tenant'), shortlistAddValidation, validate, async (req, res) => {
  try {
    const { propertyId } = req.body;

    let shortlist = await Shortlist.findOne({ tenant: req.user._id });
    if (!shortlist) {
      shortlist = await Shortlist.create({ tenant: req.user._id, properties: [propertyId] });
    } else {
      if (shortlist.properties.map(String).includes(String(propertyId))) {
        return res.status(400).json({ message: 'Already in shortlist' });
      }
      shortlist.properties.push(propertyId);
      await shortlist.save();
    }
    await shortlist.populate('properties', 'title location city price type images');
    res.json({ properties: shortlist.properties });
  } catch (err) {
    return serverError(res, err);
  }
});

// DELETE /api/shortlists/remove/:propertyId
router.delete(
  '/remove/:propertyId',
  verifyToken,
  requireRole('tenant'),
  shortlistRemoveValidation,
  validate,
  async (req, res) => {
    try {
      const shortlist = await Shortlist.findOne({ tenant: req.user._id });
      if (!shortlist) return res.status(404).json({ message: 'Shortlist not found' });
      shortlist.properties = shortlist.properties.filter(
        (id) => String(id) !== req.params.propertyId
      );
      await shortlist.save();
      await shortlist.populate('properties', 'title location city price type images');
      res.json({ properties: shortlist.properties });
    } catch (err) {
      return serverError(res, err);
    }
  }
);

module.exports = router;
