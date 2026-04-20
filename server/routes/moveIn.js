const router = require('express').Router();
const MoveIn = require('../models/MoveIn');
const Property = require('../models/Property');
const Visit = require('../models/Visit');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { uploadDoc } = require('../utils/cloudinary');
const { createNotification } = require('../services/notifications');
const {
  moveInCreateValidation,
  inventoryValidation,
  extensionRequestValidation,
  extensionResponseValidation,
  moveOutRequestValidation,
  moveOutResponseValidation,
} = require('../validators');
const { serverError } = require('../utils/serverError');

// POST /api/movein - initiate move-in
router.post('/', verifyToken, requireRole('tenant'), moveInCreateValidation, validate, async (req, res) => {
  try {
    const { propertyId, moveInDate } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'published') {
      return res.status(400).json({ message: 'Move-in is only available for published listings' });
    }
    const qualifyingVisit = await Visit.findOne({
      property: propertyId,
      tenant: req.user._id,
      status: { $in: ['visited', 'decision_pending'] },
    });
    if (!qualifyingVisit) {
      return res.status(403).json({
        message: 'You must complete a visit (visited or awaiting decision) before move-in',
      });
    }

    const existing = await MoveIn.findOne({ property: propertyId, tenant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Move-in already initiated for this property' });

    const moveIn = await MoveIn.create({
      property: propertyId,
      tenant: req.user._id,
      moveInDate: moveInDate ? new Date(moveInDate) : undefined,
    });
    res.status(201).json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/movein/my
router.get('/my', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const moveIns = await MoveIn.find({ tenant: req.user._id }).populate(
      'property',
      'title location city price images'
    );
    res.json({ moveIns });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/movein/:id — tenant (subject), listing owner, or admin
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const moveIn = await MoveIn.findById(req.params.id)
      .populate('property', 'title location city price images createdBy')
      .populate('tenant', 'name email');
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    const isTenant = String(moveIn.tenant._id) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';
    const ownerId = moveIn.property?.createdBy;
    const isPropertyOwner =
      req.user.role === 'owner' && ownerId && String(ownerId) === String(req.user._id);
    if (!isTenant && !isAdmin && !isPropertyOwner) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/movein/:id/documents - upload document
router.post('/:id/documents', verifyToken, requireRole('tenant'), uploadDoc.single('document'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (String(moveIn.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    moveIn.checklist.documents.push({ name: req.body.name || req.file.originalname, url: req.file.path });
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/movein/:id/agreement
router.put('/:id/agreement', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (String(moveIn.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    moveIn.checklist.agreementConfirmed = true;
    moveIn.checklist.agreementConfirmedAt = new Date();
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/movein/:id/inventory - add inventory item
router.post('/:id/inventory', verifyToken, requireRole('tenant'), inventoryValidation, validate, async (req, res) => {
  try {
    const { item, condition, notes } = req.body;
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (String(moveIn.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    moveIn.checklist.inventoryList.push({ item, condition: condition || 'good', notes: notes || '' });
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// DELETE /api/movein/:id/inventory/:itemId
router.delete('/:id/inventory/:itemId', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (String(moveIn.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    moveIn.checklist.inventoryList = moveIn.checklist.inventoryList.filter(
      (i) => String(i._id) !== req.params.itemId
    );
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/movein/:id/extend - tenant requests extension
router.post('/:id/extend', verifyToken, requireRole('tenant'), extensionRequestValidation, validate, async (req, res) => {
  try {
    const { requestedUntil, reason } = req.body;
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (String(moveIn.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    moveIn.extensionRequests.push({ requestedUntil: new Date(requestedUntil), reason });
    moveIn.status = 'extension_requested';
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/movein/:id/extend/:extId - admin approve/reject extension
router.put('/:id/extend/:extId', verifyToken, requireRole('admin'), extensionResponseValidation, validate, async (req, res) => {
  try {
    const { status } = req.body;
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    const extReq = moveIn.extensionRequests.id(req.params.extId);
    if (!extReq) return res.status(404).json({ message: 'Extension request not found' });
    extReq.status = status;
    extReq.respondedAt = new Date();
    // Resolved extension decision: tenant returns to normal active stay (approved extends terms; rejected keeps current lease).
    if (status === 'approved' || status === 'rejected') {
      moveIn.status = 'active';
    }
    await moveIn.save();
    await createNotification(
      moveIn.tenant,
      'movein_update',
      'Extension Request Updated',
      `Your stay extension request has been ${status}.`,
      '/dashboard'
    );
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/movein/:id/moveout-request (tenant)
router.post('/:id/moveout-request', verifyToken, requireRole('tenant'), moveOutRequestValidation, validate, async (req, res) => {
  try {
    const { reason, preferredDate } = req.body;
    const moveIn = await MoveIn.findOne({ _id: req.params.id, tenant: req.user._id });
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (moveIn.moveOut?.status === 'requested') return res.status(400).json({ message: 'Move-out already requested' });
    moveIn.moveOut = { status: 'requested', reason, preferredDate: new Date(preferredDate), requestedAt: new Date() };
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/movein/:id/moveout-respond (admin approve/reject)
router.put('/:id/moveout-respond', verifyToken, requireRole('admin'), moveOutResponseValidation, validate, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (!moveIn.moveOut || moveIn.moveOut.status !== 'requested') {
      return res.status(400).json({ message: 'No pending move-out request for this move-in' });
    }
    moveIn.moveOut.status = status;
    moveIn.moveOut.approvedAt = new Date();
    moveIn.moveOut.notes = notes || '';
    if (status === 'approved') moveIn.status = 'completed';
    await moveIn.save();
    await createNotification(
      moveIn.tenant,
      'movein_update',
      'Move-out Request Updated',
      `Your move-out request has been ${status}.`,
      '/dashboard'
    );
    res.json({ moveIn });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
