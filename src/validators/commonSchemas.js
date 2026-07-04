const { z } = require('zod');

const positiveInt = z.coerce.number().int().positive();
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Debe usar formato YYYY-MM-DD');

// Contraseña de uso general: mínimo 8 caracteres, al menos una mayúscula y al menos
// un carácter especial (no alfanumérico). Se usa en registro, creación de usuarios,
// cambio de contraseña y restablecimiento por token.
const passwordSegura = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128)
  .regex(/[A-ZÁÉÍÓÚÑ]/, 'La contraseña debe tener al menos una letra mayúscula')
  .regex(/[^A-Za-z0-9]/, 'La contraseña debe tener al menos un carácter especial');

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
  passwordSegura,
  makeParamIdSchema,
  paginationQuerySchema,
};
