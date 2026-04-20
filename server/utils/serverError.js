const isProd = process.env.NODE_ENV === 'production';

/** Log server error; in production return a generic message to the client. */
function serverError(res, err) {
  console.error(err);
  const message = isProd ? 'Something went wrong' : err.message;
  return res.status(500).json({ message });
}

module.exports = { serverError };
