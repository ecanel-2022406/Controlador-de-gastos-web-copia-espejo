import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro';

export const registrarUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password, nombre } = req.body;
    
    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const nuevoUsuario = await prisma.usuario.create({
      data: { email, password: hashedPassword, nombre }
    });

    return res.status(201).json({ mensaje: 'Usuario creado exitosamente', id: nuevoUsuario.id });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
};

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(400).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email }, 
      JWT_SECRET, 
      { expiresIn: '1m' } 
    );

    return res.json({ 
      mensaje: 'Login exitoso', 
      token, 
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email } 
    });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error en el login', error });
  }
};
