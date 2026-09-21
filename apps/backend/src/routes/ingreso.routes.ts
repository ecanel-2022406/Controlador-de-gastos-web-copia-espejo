import { Router } from 'express';
import passport from 'passport';
import { obtenerIngresos, crearIngreso, eliminarIngreso } from '../controller/ingreso.controller';

const router = Router();

router.get('/', passport.authenticate('jwt', { session: false }), obtenerIngresos);
router.post('/', passport.authenticate('jwt', { session: false }), crearIngreso);
router.delete('/:id', passport.authenticate('jwt', { session: false }), eliminarIngreso);

export default router;