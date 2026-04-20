const router = require('express').Router();
const SupportTicket = require('../models/SupportTicket');
const Property = require('../models/Property');
const verifyToken = require('../middleware/auth');
const requireRole = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { createNotification } = require('../services/notifications');
const {
  supportCreateValidation,
  supportMessageValidation,
  supportStatusValidation,
} = require('../validators');
const { serverError } = require('../utils/serverError');

// POST /api/support - create ticket
router.post('/', verifyToken, requireRole('tenant'), supportCreateValidation, validate, async (req, res) => {
  try {
    const { propertyId, subject, category, message } = req.body;
    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found' });
    const ticket = await SupportTicket.create({
      property: propertyId,
      raisedBy: req.user._id,
      subject,
      category: category || 'general',
      messages: [{ sender: req.user._id, senderRole: 'tenant', text: message }],
    });
    res.status(201).json({ ticket });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/support/my - tenant's tickets
router.get('/my', verifyToken, requireRole('tenant'), async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ raisedBy: req.user._id })
      .populate('property', 'title location city')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/support - admin all tickets
router.get('/', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const tickets = await SupportTicket.find()
      .populate('property', 'title location city')
      .populate('raisedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json({ tickets });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/support/:id - single ticket with thread
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('property', 'title location city')
      .populate('raisedBy', 'name email')
      .populate('messages.sender', 'name role');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    // Only owner or admin
    if (String(ticket.raisedBy._id) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json({ ticket });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/support/:id/message - add reply
router.post('/:id/message', verifyToken, supportMessageValidation, validate, async (req, res) => {
  try {
    const { text } = req.body;
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    // Only ticket owner or admin can reply
    if (String(ticket.raisedBy) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    ticket.messages.push({ sender: req.user._id, senderRole: req.user.role, text });
    if (ticket.status === 'open' && req.user.role === 'admin') ticket.status = 'in_progress';
    await ticket.save();
    await ticket.populate('messages.sender', 'name role');
    // Notify the other party
    if (req.user.role === 'admin') {
      await createNotification(ticket.raisedBy, 'ticket_reply', 'Support Reply 💬', `Admin replied to your ticket: "${ticket.subject}"`, '/support');
    }
    res.json({ ticket });
  } catch (err) {
    return serverError(res, err);
  }
});

// PUT /api/support/:id/status - admin change status
router.put('/:id/status', verifyToken, requireRole('admin'), supportStatusValidation, validate, async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate('property', 'title').populate('raisedBy', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    await createNotification(
      ticket.raisedBy._id,
      'ticket_reply',
      'Ticket Status Updated',
      `Your support ticket "${ticket.subject}" is now marked as ${status.replace('_', ' ')}.`,
      '/support'
    );
    res.json({ ticket });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
