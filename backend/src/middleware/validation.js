const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().min(1).max(50).optional(),
    lastName: Joi.string().min(1).max(50).optional()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  generateAnimation: Joi.object({
    title: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional(),
    prompt: Joi.string().min(10).max(1000).required(),
    duration: Joi.number().min(1).max(60).default(5),
    resolution: Joi.string().valid('480p', '720p', '1080p').default('720p'),
    frameRate: Joi.number().valid(24, 30, 60).default(30),
    backgroundColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#000000')
  })
};

module.exports = {
  validate,
  schemas
};