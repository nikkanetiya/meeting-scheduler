import Joi from '@hapi/joi';

export const CreateEventSchema = Joi.object().keys({
  startTime: Joi.string().required(),
  duration: Joi.number()
    .max(60)
    .required()
});

export const AddAvailabilitySchema = Joi.object().keys({
  start: Joi.date().required(),
  end: Joi.date().required(),
  duration: Joi.number()
    .max(60)
    .required()
});
