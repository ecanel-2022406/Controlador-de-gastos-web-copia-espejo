import { Router } from 'express';
import passport from 'passport';
import { obtenerTransferencias, crearTransferencia, eliminarTransferencia } from '../controller/transferencia.controller';

const router = Router();

router.get('/', passport.authenticate('jwt', { session: false }), obtenerTransferencias);
router.post('/', passport.authenticate('jwt', { session: false }), crearTransferencia);
router.delete('/:id', passport.authenticate('jwt', { session: false }), eliminarTransferencia);

export default router;