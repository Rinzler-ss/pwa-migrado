import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const fechaInicio = searchParams.get('fecha_inicio');
    const fechaFin = searchParams.get('fecha_fin');

    let data = {};

    switch (tipo) {
      case 'productos':
        data = await prisma.productos.findMany({
          orderBy: { id: 'desc' }
        });
        break;

      case 'registros':
        const whereRegistros: any = {};
        if (fechaInicio && fechaFin) {
          whereRegistros.fecha_registro = {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          };
        }

        data = await prisma.registros.findMany({
          where: whereRegistros,
          include: {
            producto: true,
            usuario: true
          },
          orderBy: { fecha_registro: 'desc' }
        });
        break;

      case 'usuarios':
        data = await prisma.usuarios.findMany({
          select: {
            id: true,
            nombre: true,
            email: true,
            rol: true,
            estado: true,
            fecha_creacion: true,
            ultimo_acceso: true
          },
          orderBy: { id: 'desc' }
        });
        break;

      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 });
    }

    return NextResponse.json({
      tipo,
      fecha_generacion: new Date(),
      generado_por: user.nombre,
      data
    });
  } catch (error) {
    console.error('Error al generar reporte:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}