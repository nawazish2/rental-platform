const router = require('express').Router();
const { param } = require('express-validator');
const Payment = require('../models/Payment');
const Property = require('../models/Property');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createNotification } = require('../services/notifications');
const { paymentCreateValidation } = require('../validators');
const { serverError } = require('../utils/serverError');

const paymentIdValidation = [
  param('id').isMongoId().withMessage('Payment ID is invalid'),
];

const propertyIdParamValidation = [
  param('propertyId').isMongoId().withMessage('Property ID is invalid'),
];

const adminOrPropertyOwner = async (req, res, next) => {
  if (req.user.role === 'admin') return next();
  if (req.user.role !== 'owner') {
    return res.status(403).json({ message: 'Access denied: insufficient permissions' });
  }
  try {
    const property = await Property.findById(req.params.propertyId).select('createdBy');
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (String(property.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your listing' });
    }
    return next();
  } catch (e) {
    return serverError(res, e);
  }
};

// GET my payments (tenant)
router.get('/my', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const payments = await Payment.find({ tenant: req.user._id })
      .populate('property', 'title city images')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) {
    return serverError(res, e);
  }
});

// GET payments for a property (admin or owner of that property)
router.get('/property/:propertyId', verifyToken, propertyIdParamValidation, validate, adminOrPropertyOwner, async (req, res) => {
  try {
    const payments = await Payment.find({ property: req.params.propertyId })
      .populate('tenant', 'name email')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (e) {
    return serverError(res, e);
  }
});

// POST create payment record (admin creates, tenant pays)
router.post('/', verifyToken, requireRole('admin'), paymentCreateValidation, validate, async (req, res) => {
  try {
    const { tenantId, propertyId, amount, type, month, notes } = req.body;
    const payment = await Payment.create({
      tenant: tenantId,
      property: propertyId,
      amount: Number(amount),
      type,
      month,
      notes,
    });
    await createNotification(
      tenantId,
      'payment',
      `Payment Due: ${type}`,
      `₹${Number(amount).toLocaleString()} ${type} payment is due${month ? ' for ' + month : ''}`,
      '/dashboard'
    );
    res.status(201).json({ message: 'Payment record created', payment });
  } catch (e) {
    return serverError(res, e);
  }
});

// PATCH mark payment as paid (admin)
router.patch('/:id/pay', verifyToken, requireRole('admin'), paymentIdValidation, validate, async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    ).populate('tenant', 'name');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    await createNotification(
      payment.tenant._id,
      'payment',
      'Payment Confirmed ✅',
      `Your ₹${payment.amount.toLocaleString()} ${payment.type} payment has been confirmed.`,
      '/dashboard'
    );
    res.json({ message: 'Marked as paid', payment });
  } catch (e) {
    return serverError(res, e);
  }
});

module.exports = router;
