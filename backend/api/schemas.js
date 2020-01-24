const Joi = require('@hapi/joi');

module.exports.CreateEventSchema = Joi.object().keys({
  startTime: Joi.string().required(),
  duration: Joi.number()
    .max(60)
    .required()
});
