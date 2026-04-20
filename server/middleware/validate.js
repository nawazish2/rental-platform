const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array({ onlyFirstError: true });

  return res.status(400).json({
    message: errors[0].msg,
    errors: errors.map((error) => ({
      field: error.path,
      message: error.msg,
    })),
  });
};

module.exports = validate;
