import { Router } from 'express';
import { obtenerGastos, crearGasto } from '../controller/gasto.controller';
import passport from 'passport';

const router = Router();

router.get('/', passport.authenticate('jwt', { session: false }), obtenerGastos);
router.post('/', passport.authenticate('jwt', { session: false }), crearGasto);

export default router;