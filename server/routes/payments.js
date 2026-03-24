const router = require('express').Router();
const Payment = require('../models/Payment');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleGuard');
const { createNotification } = require('./notifications');

// GET my payments (tenant)
router.get('/my', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user.id })
      .populate('property', 'title city images')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET payments for a property (admin/owner)
router.get('/property/:propertyId', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const payments = await Payment.find({ property: req.params.propertyId })
      .populate('tenant', 'name email').sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST create payment record (admin creates, tenant pays)
router.post('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { tenantId, propertyId, amount, type, month, notes } = req.body;
    const payment = await Payment.create({ tenant: tenantId, property: propertyId, amount, type, month, notes });
    await createNotification(tenantId, 'payment', `Payment Due: ${type}`, `₹${amount.toLocaleString()} ${type} payment is due${month ? ' for ' + month : ''}`, '/dashboard');
    res.status(201).json({ message: 'Payment record created', payment });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH mark payment as paid (admin)
router.patch('/:id/pay', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(req.params.id,
      { status: 'paid', paidAt: new Date() }, { new: true }).populate('tenant', 'name');
    await createNotification(payment.tenant._id, 'payment', 'Payment Confirmed ✅', `Your ₹${payment.amount.toLocaleString()} ${payment.type} payment has been confirmed.`, '/dashboard');
    res.json({ message: 'Marked as paid', payment });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
