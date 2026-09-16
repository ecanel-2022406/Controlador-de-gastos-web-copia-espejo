import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import passport from 'passport'; 
import './config/passport'; 
import authRoutes from './routes/auth.routes';
import gastoRoutes from './routes/gasto.routes';
import ingresoRoutes from './routes/ingreso.routes';
import transferenciaRoutes from './routes/transferencia.routes'; // <-- Asegúrate de importarlo

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/transferencias', transferenciaRoutes); // <-- Asegúrate de registrarlo aquí

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});