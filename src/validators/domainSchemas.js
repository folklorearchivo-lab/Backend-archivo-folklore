const { z, isoDate, positiveInt } = require('./commonSchemas');

const rolesCreateSchema = z.object({
  nombre_rol: z.string().min(2, 'El nombre del rol debe tener al menos 2 caracteres').max(50),
  descripcion: z.string().max(255).optional().nullable(),
}).strict();

const rolesUpdateSchema = rolesCreateSchema.partial().strict();

const authRegisterSchema = z.object({
  primer_nombre: z.string().min(2, 'El primer nombre debe tener al menos 2 caracteres').max(50),
  segundo_nombre: z.string().max(50).optional().nullable(),
  primer_apellido: z.string().min(2, 'El primer apellido debe tener al menos 2 caracteres').max(50),
  segundo_apellido: z.string().max(50).optional().nullable(),
  correo: z.string().email('Debe proporcionar un correo electrónico válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres').max(128),
  id_rol: positiveInt.optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
}).strict();

const authLoginSchema = z.object({
  correo: z.string().email('Debe proporcionar un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
}).strict();

const usuariosCreateSchema = z.object({
  primer_nombre: z.string().min(2).max(50),
  segundo_nombre: z.string().max(50).optional().nullable(),
  primer_apellido: z.string().min(2).max(50),
  segundo_apellido: z.string().max(50).optional().nullable(),
  correo: z.string().email(),
  password: z.string().min(8).optional(),
  id_rol: positiveInt.optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  activo: z.boolean().optional(),
}).strict();

const usuariosUpdateSchema = usuariosCreateSchema.partial().strict();

const cultoresCreateSchema = z.object({
  id_usuario: positiveInt.optional().nullable(),
  // Formato exigido por el selector V-/E- del frontend (ManualCultorForm.jsx, RegisterForm.jsx):
  // letra + guion + 6 a 9 dígitos. Ej. V-12345678
  cedula: z.string().regex(/^[VE]-\d{6,9}$/, 'Formato esperado: V-12345678 o E-12345678'),
  primer_nombre: z.string().min(2).max(50),
  segundo_nombre: z.string().max(50).optional().nullable(),
  primer_apellido: z.string().min(2).max(50),
  segundo_apellido: z.string().max(50).optional().nullable(),
  fecha_nacimiento: isoDate.optional().nullable(),
  genero: z.string().max(10).optional().nullable(),
  // Formato exigido por el selector de prefijo del frontend: prefijo venezolano válido +
  // guion + 7 dígitos. Ej. 0414-1234567
  telefono_contacto: z.string()
    .regex(/^(0414|0424|0416|0426|0412|0422|0276)-\d{7}$/, 'Formato esperado: 0414-1234567 (prefijo venezolano válido + 7 dígitos)')
    .optional()
    .nullable(),
  correo_contacto: z.string().email().optional().nullable(),
  direccion_residencia: z.string().optional().nullable(),
  id_parroquia: positiveInt.optional().nullable(),
  resumen_curricular: z.string().optional().nullable(),
  trayectoria_documentada: z.string().optional().nullable(),
  estatus_vida: z.string().max(20).optional().nullable(),
  esta_certificado: z.boolean().optional(),
  foto_perfil: z.string().max(255).optional().nullable(),
  foto_certificacion: z.string().max(255).optional().nullable(),
  datos_censo_adicionales: z.any().optional(),
}).strict();

const cultoresUpdateSchema = cultoresCreateSchema.partial().strict();

const estatusSchema = z.object({
  estatus: z.enum(['pendiente', 'aprobado', 'rechazado']),
}).strict();

// Campos de control de aprobación (estatus, observaciones_admin, fecha_aprobacion,
// id_usuario_registro) quedan FUERA de este esquema a propósito: el cliente que crea
// una obra (visitante o cultor) nunca debe poder fijarlos; los asigna el servidor.
const obrasCreateSchema = z.object({
  titulo: z.string().min(2).max(150),
  id_cultor: positiveInt.optional().nullable(),
  id_categoria: positiveInt.optional().nullable(),
  id_parroquia: positiveInt.optional().nullable(),
  tipo_patrimonio: z.string().max(50).optional().nullable(),
  descripcion_historica: z.string().optional().nullable(),
  materiales_utilizados: z.string().max(255).optional().nullable(),
  dimensiones: z.string().max(50).optional().nullable(),
  peso: z.coerce.number().optional().nullable(),
  tecnica_utilizada: z.string().max(100).optional().nullable(),
  tiempo_ejecucion: z.string().max(50).optional().nullable(),
  significado_cultural: z.string().optional().nullable(),
  estado_conservacion: z.string().max(50).optional().nullable(),
  ubicacion_actual: z.string().max(150).optional().nullable(),
  valor_estimado: z.coerce.number().optional().nullable(),
  codigo_qr_link: z.string().max(255).optional().nullable(),
  destacado_galeria: z.boolean().optional(),
}).strict();

// El admin sí puede tocar estos campos vía PUT (todo menos el estatus, que tiene su
// propio PATCH dedicado para mantener ese cambio auditable y separado).
const obrasUpdateSchema = obrasCreateSchema.partial().extend({
  observaciones_admin: z.string().optional().nullable(),
}).strict();

const manifestacionesCreateSchema = z.object({
  id_tipo_folklore: positiveInt,
  nombre: z.string().min(2).max(150),
  descripcion: z.string().optional().nullable(),
  id_parroquia: positiveInt.optional().nullable(),
  origen_historico: z.string().optional().nullable(),
  vigencia_actual: z.string().max(50).optional().nullable(),
  observaciones: z.string().optional().nullable(),
  estatus: z.string().max(20).optional().nullable(),
  id_usuario_registro: positiveInt.optional().nullable(),
}).strict();

const manifestacionesUpdateSchema = manifestacionesCreateSchema.partial().strict();

const forgotPasswordSchema = z.object({
  correo: z.string().email('Debe proporcionar un correo electrónico válido'),
}).strict();

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'El token es requerido'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(128),
}).strict();

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').max(128),
}).strict();

const updateProfileSchema = z.object({
  primer_nombre: z.string().min(2).max(50).optional(),
  segundo_nombre: z.string().max(50).optional().nullable(),
  primer_apellido: z.string().min(2).max(50).optional(),
  segundo_apellido: z.string().max(50).optional().nullable(),
  telefono: z.string().max(20).optional().nullable(),
  correo: z.string().email().optional(),
}).strict();

module.exports = {
  authRegisterSchema,
  authLoginSchema,
  usuariosCreateSchema,
  usuariosUpdateSchema,
  cultoresCreateSchema,
  cultoresUpdateSchema,
  obrasCreateSchema,
  obrasUpdateSchema,
  estatusSchema,
  manifestacionesCreateSchema,
  manifestacionesUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  rolesCreateSchema,
  rolesUpdateSchema,
};
