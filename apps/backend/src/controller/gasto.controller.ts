import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerGastos = async (req: any, res: Response) => {
  try {
    const usuarioId = req.user.id;

    const gastos = await prisma.gasto.findMany({
      where: { usuarioId },
      orderBy: { fecha: 'desc' }
    });

    return res.json(gastos);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener los gastos', error });
  }
};

export const crearGasto = async (req: any, res: Response) => {
  try {
    const { titulo, categoria, monto, fecha } = req.body;
    const usuarioId = req.user.id;

    const nuevoGasto = await prisma.gasto.create({
      data: {
        titulo: titulo || categoria,
        categoria,
        monto: Number(monto),
        fecha: fecha ? new Date(fecha) : new Date(),
        usuarioId
      }
    });

    return res.status(201).json(nuevoGasto);
  } catch (error) {
    console.error("Error al crear gasto:", error);
    return res.status(500).json({ mensaje: "Error al guardar el gasto", error });
  }
};