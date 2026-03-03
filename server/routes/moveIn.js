const router = require('express').Router();
const MoveIn = require('../models/MoveIn');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const { uploadDoc } = require('../utils/cloudinary');

// POST /api/movein - initiate move-in
router.post('/', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const { propertyId, moveInDate } = req.body;
    if (!propertyId) return res.status(400).json({ message: 'propertyId required' });

    const existing = await MoveIn.findOne({ property: propertyId, tenant: req.user._id });
    if (existing) return res.status(400).json({ message: 'Move-in already initiated for this property' });

    const moveIn = await MoveIn.create({
      property: propertyId,
      tenant: req.user._id,
      moveInDate: moveInDate ? new Date(moveInDate) : undefined,
    });
    res.status(201).json({ moveIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// GET /api/movein/:id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const moveIn = await MoveIn.findById(req.params.id)
      .populate('property', 'title location city price images')
      .populate('tenant', 'name email');
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    // Only owner or admin can view
    if (
      String(moveIn.tenant._id) !== String(req.user._id) &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ moveIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    if (moveIn.status === 'checklist_pending') moveIn.status = 'checklist_pending';
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// POST /api/movein/:id/inventory - add inventory item
router.post('/:id/inventory', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const { item, condition, notes } = req.body;
    if (!item) return res.status(400).json({ message: 'item name required' });
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    if (String(moveIn.tenant) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    moveIn.checklist.inventoryList.push({ item, condition: condition || 'good', notes: notes || '' });
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});

// POST /api/movein/:id/extend - tenant requests extension
router.post('/:id/extend', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const { requestedUntil, reason } = req.body;
    if (!requestedUntil || !reason) {
      return res.status(400).json({ message: 'requestedUntil and reason required' });
    }
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
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/movein/:id/extend/:extId - admin approve/reject extension
router.put('/:id/extend/:extId', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const moveIn = await MoveIn.findById(req.params.id);
    if (!moveIn) return res.status(404).json({ message: 'Move-in not found' });
    const extReq = moveIn.extensionRequests.id(req.params.extId);
    if (!extReq) return res.status(404).json({ message: 'Extension request not found' });
    extReq.status = status;
    extReq.respondedAt = new Date();
    if (status === 'approved') moveIn.status = 'active';
    else if (status === 'rejected') moveIn.status = 'active';
    await moveIn.save();
    res.json({ moveIn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
