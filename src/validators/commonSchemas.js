const { z } = require('zod');

const positiveInt = z.coerce.number().int().positive();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe usar formato YYYY-MM-DD');

function makeParamIdSchema(paramName) {
  return z.object({
    [paramName]: positiveInt,
  });
}

const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().positive().max(100).optional(),
  })
  .strict();

module.exports = {
  z,
  positiveInt,
  isoDate,
  makeParamIdSchema,
  paginationQuerySchema,
};
