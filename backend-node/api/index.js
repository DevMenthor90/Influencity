const app = require('../lib/app');

module.exports = (req, res) => {
  if (
    req.body !== undefined &&
    req.body !== null &&
    typeof req.body === 'object' &&
    !Buffer.isBuffer(req.body)
  ) {
    req._vercelParsedBody = req.body;
  }
  app(req, res);
};
