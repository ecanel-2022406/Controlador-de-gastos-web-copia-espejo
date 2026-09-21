import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerIngresos = async (req: any, res: Response) => {
  try {
    const usuarioId = req.user.id;
    const ingresos = await prisma.ingreso.findMany({
      where: { usuarioId },
      orderBy: { fecha: 'desc' }
    });
    return res.json(ingresos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener ingresos', error });
  }
};

export const crearIngreso = async (req: any, res: Response) => {
  try {
    const { titulo, monto, frecuencia, categoria, fecha } = req.body;
    const usuarioId = req.user.id;

    const nuevoIngreso = await prisma.ingreso.create({
      data: {
        titulo: titulo || 'Ingreso',
        monto: Number(monto),
        frecuencia: frecuencia || 'Único',
        categoria: categoria || 'General',
        fecha: fecha ? new Date(fecha) : new Date(),
        usuarioId
      }
    });

    return res.status(201).json(nuevoIngreso);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al guardar ingreso', error });
  }
};

export const eliminarIngreso = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.ingreso.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Ingreso eliminado' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar ingreso', error });
  }
};