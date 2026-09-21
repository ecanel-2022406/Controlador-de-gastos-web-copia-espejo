import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

// 1. Ruta que inicia el flujo con Google (¡esta es la que faltaba!)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// 2. Ruta de callback que recibe la respuesta de Google
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:4200/login' }),
  (req, res) => {
    const usuario = req.user as any;

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const nombreCodificado = encodeURIComponent(usuario.nombre || 'Usuario');

    // Redirige al frontend pasándole el token por la URL
    res.redirect(`http://localhost:4200/auth-callback?token=${token}&nombre=${nombreCodificado}`);
  }
);

export default router;