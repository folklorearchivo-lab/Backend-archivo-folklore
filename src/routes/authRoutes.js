const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { validateZod } = require('../middlewares/validateZod');
const {
  authRegisterSchema,
  authLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
} = require('../validators/domainSchemas');

router.post('/register', validateZod({ body: authRegisterSchema }), authController.register);
router.post('/login', validateZod({ body: authLoginSchema }), authController.login);
router.get('/verify', authController.verifyToken);

// Nuevas rutas de recuperación de contraseña y gestión de perfil
router.post('/forgot-password', validateZod({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validateZod({ body: resetPasswordSchema }), authController.resetPassword);

// Rutas protegidas por autenticación
router.get('/profile', requireAuth, authController.getProfile);
router.put('/profile', requireAuth, validateZod({ body: updateProfileSchema }), authController.updateProfile);
router.post('/change-password', requireAuth, validateZod({ body: changePasswordSchema }), authController.changePassword);

module.exports = { path: '/auth', router };
