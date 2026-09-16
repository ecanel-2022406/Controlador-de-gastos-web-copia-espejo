import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const obtenerTransferencias = async (req: any, res: Response) => {
  try {
    const usuarioId = req.user.id;
    const transferencias = await prisma.transferencia.findMany({
      where: { usuarioId },
      orderBy: { fecha: 'desc' }
    });
    return res.json(transferencias);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al obtener transferencias', error });
  }
};

export const crearTransferencia = async (req: any, res: Response) => {
  try {
    const { titulo, monto, categoria, fecha } = req.body;
    const usuarioId = req.user.id;

    const nuevaTransferencia = await prisma.transferencia.create({
      data: {
        titulo: titulo || 'Transferencia',
        monto: Number(monto),
        categoria: categoria || 'General',
        fecha: fecha ? new Date(fecha) : new Date(),
        usuarioId
      }
    });

    return res.status(201).json(nuevaTransferencia);
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al guardar transferencia', error });
  }
};

export const eliminarTransferencia = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.transferencia.delete({ where: { id: Number(id) } });
    return res.json({ mensaje: 'Transferencia eliminada' });
  } catch (error) {
    return res.status(500).json({ mensaje: 'Error al eliminar transferencia', error });
  }
};