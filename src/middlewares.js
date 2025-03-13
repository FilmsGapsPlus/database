const rateLimit = require('express-rate-limit');

const securityMiddlewares = {
  pathSanitization: (req, res, next) => {
    if (req.params.path.includes('..')) {
      return res.status(400).send('Invalid path');
    }
    next();
  },

  jsonValidation: (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
      try {
        JSON.parse(JSON.stringify(req.body));
      } catch (error) {
        return res.status(400).send('Invalid JSON');
      }
    }
    next();
  },

  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  })
};
