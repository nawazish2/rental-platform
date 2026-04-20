const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');

const PROPERTY_TYPES = ['1BHK', '2BHK', '3BHK', 'Studio', 'Villa', 'Hostel', 'Airbnb'];
const USER_ROLES = ['tenant', 'admin', 'owner'];
const REGISTRATION_ROLES = ['tenant', 'owner'];
const VISIT_STATUSES = ['requested', 'scheduled', 'visited', 'decision_pending'];
const SUPPORT_CATEGORIES = ['maintenance', 'billing', 'general', 'move-in'];
const SUPPORT_STATUSES = ['open', 'in_progress', 'resolved'];
const PROPERTY_STATUSES = ['draft', 'review', 'published'];
const PAYMENT_TYPES = ['deposit', 'rent', 'maintenance'];
const INVENTORY_CONDITIONS = ['good', 'fair', 'damaged'];

const isMongoIdList = (value) => {
  const ids = String(value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  return ids.length >= 2 && ids.length <= 3 && ids.every((id) => mongoose.isValidObjectId(id));
};

const isStringArray = (value) => {
  if (value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every((item) => typeof item === 'string');
  }

  return typeof value === 'string';
};

const mongoIdParam = (field, label) =>
  param(field).isMongoId().withMessage(`${label} is invalid`);

const authRegisterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 80 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6, max: 64 })
    .withMessage('Password must be between 6 and 64 characters'),
  body('role').optional().isIn(REGISTRATION_ROLES).withMessage('Role must be tenant or owner'),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
];

const authLoginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const profileUpdateValidation = [
  body('name').optional({ values: 'falsy' }).trim().isLength({ min: 2, max: 80 }),
  body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
];

const propertyListValidation = [
  query('location').optional({ values: 'falsy' }).trim().isLength({ max: 120 }),
  query('budgetMin').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('budgetMin must be a positive number'),
  query('budgetMax').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('budgetMax must be a positive number'),
  query('moveInDate').optional({ values: 'falsy' }).isISO8601().withMessage('moveInDate must be a valid date'),
  query('type').optional({ values: 'falsy' }).isIn(PROPERTY_TYPES).withMessage('Property type is invalid'),
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }).withMessage('page must be at least 1'),
  query('limit').optional({ values: 'falsy' }).isInt({ min: 1, max: 50 }).withMessage('limit must be between 1 and 50'),
];

const propertyCompareValidation = [
  query('ids')
    .custom(isMongoIdList)
    .withMessage('Provide 2-3 valid property IDs separated by commas'),
];

const propertyPayloadValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5, max: 120 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 20, max: 2000 }),
  body('location').trim().notEmpty().withMessage('Location is required').isLength({ min: 3, max: 120 }),
  body('city').trim().notEmpty().withMessage('City is required').isLength({ min: 2, max: 80 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('type').isIn(PROPERTY_TYPES).withMessage('Property type is invalid'),
  body('availableFrom').optional({ values: 'falsy' }).isISO8601().withMessage('availableFrom must be a valid date'),
  body('bedrooms').optional({ values: 'falsy' }).isInt({ min: 0, max: 20 }),
  body('bathrooms').optional({ values: 'falsy' }).isInt({ min: 0, max: 20 }),
  body('area').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Area must be a positive number'),
  body('amenities').optional().custom(isStringArray).withMessage('Amenities must be a string array'),
  body('rules').optional().custom(isStringArray).withMessage('Rules must be a string array'),
  body('images').optional().custom(isStringArray).withMessage('Images must be a string array'),
];

const propertyStatusValidation = [
  mongoIdParam('id', 'Property ID'),
  body('status').isIn(PROPERTY_STATUSES).withMessage('Invalid status'),
];

const visitCreateValidation = [
  body('propertyId').isMongoId().withMessage('propertyId is invalid'),
  body('preferredDate').isISO8601().withMessage('preferredDate is required'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
];

const visitStatusValidation = [
  mongoIdParam('id', 'Visit ID'),
  body('status').isIn(VISIT_STATUSES).withMessage('Invalid status'),
  body('scheduledDate').optional({ values: 'falsy' }).isISO8601().withMessage('scheduledDate must be a valid date'),
  body('adminNotes').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
];

const moveInCreateValidation = [
  body('propertyId').isMongoId().withMessage('propertyId is invalid'),
  body('moveInDate').optional({ values: 'falsy' }).isISO8601().withMessage('moveInDate must be a valid date'),
];

const inventoryValidation = [
  mongoIdParam('id', 'Move-in ID'),
  body('item').trim().notEmpty().withMessage('Item name is required').isLength({ max: 120 }),
  body('condition').optional({ values: 'falsy' }).isIn(INVENTORY_CONDITIONS),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
];

const extensionRequestValidation = [
  mongoIdParam('id', 'Move-in ID'),
  body('requestedUntil').isISO8601().withMessage('requestedUntil is required'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ min: 5, max: 400 }),
];

const extensionResponseValidation = [
  mongoIdParam('id', 'Move-in ID'),
  mongoIdParam('extId', 'Extension request ID'),
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
];

const moveOutRequestValidation = [
  mongoIdParam('id', 'Move-in ID'),
  body('reason').trim().notEmpty().withMessage('Reason is required').isLength({ min: 5, max: 400 }),
  body('preferredDate').isISO8601().withMessage('preferredDate is required'),
];

const moveOutResponseValidation = [
  mongoIdParam('id', 'Move-in ID'),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 400 }),
];

const supportCreateValidation = [
  body('propertyId').isMongoId().withMessage('propertyId is invalid'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ min: 5, max: 120 }),
  body('category').optional({ values: 'falsy' }).isIn(SUPPORT_CATEGORIES).withMessage('Category is invalid'),
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ min: 5, max: 1000 }),
];

const supportMessageValidation = [
  mongoIdParam('id', 'Ticket ID'),
  body('text').trim().notEmpty().withMessage('Message text is required').isLength({ min: 1, max: 1000 }),
];

const supportStatusValidation = [
  mongoIdParam('id', 'Ticket ID'),
  body('status').isIn(SUPPORT_STATUSES).withMessage('Invalid status'),
];

const paymentCreateValidation = [
  body('tenantId').isMongoId().withMessage('tenantId is invalid'),
  body('propertyId').isMongoId().withMessage('propertyId is invalid'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('type').isIn(PAYMENT_TYPES).withMessage('Payment type is invalid'),
  body('month').optional({ values: 'falsy' }).trim().isLength({ max: 30 }),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 300 }),
];

const reviewCreateValidation = [
  body('propertyId').isMongoId().withMessage('propertyId is invalid'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional({ values: 'falsy' }).trim().isLength({ max: 500 }),
];

const shortlistAddValidation = [
  body('propertyId').isMongoId().withMessage('propertyId is invalid'),
];

const shortlistRemoveValidation = [
  mongoIdParam('propertyId', 'Property ID'),
];

const readNotificationValidation = [
  mongoIdParam('id', 'Notification ID'),
];

module.exports = {
  authRegisterValidation,
  authLoginValidation,
  profileUpdateValidation,
  propertyListValidation,
  propertyCompareValidation,
  propertyPayloadValidation,
  propertyStatusValidation,
  visitCreateValidation,
  visitStatusValidation,
  moveInCreateValidation,
  inventoryValidation,
  extensionRequestValidation,
  extensionResponseValidation,
  moveOutRequestValidation,
  moveOutResponseValidation,
  supportCreateValidation,
  supportMessageValidation,
  supportStatusValidation,
  paymentCreateValidation,
  reviewCreateValidation,
  shortlistAddValidation,
  shortlistRemoveValidation,
  readNotificationValidation,
};
