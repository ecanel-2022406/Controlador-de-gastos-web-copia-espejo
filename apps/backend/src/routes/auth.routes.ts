import { Router } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { registrarUsuario, loginUsuario } from '../controller/auth.controller';

const router = Router();

router.post('/register', registrarUsuario);
router.post('/login', loginUsuario);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req: any, res) => {
    const usuario = req.user;

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET || 'tu_secreto_jwt',
      { expiresIn: '1d' }
    );

    res.redirect(`http://localhost:4200/dashboard?token=${token}`);
  }
);

export default router;