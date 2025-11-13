import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const registro = await prisma.registros.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        producto: true,
        usuario: true
      }
    });

    if (!registro) {
      return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
    }

    return NextResponse.json(registro);
  } catch (error) {
    console.error('Error al obtener registro:', error);
    return NextResponse.json({ error: 'Error al obtener registro' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const data = await request.json();
    
    const registro = await prisma.registros.update({
      where: { id: parseInt(params.id) },
      data: {
        tipo_registro: data.tipo_registro,
        cantidad: data.cantidad,
        observaciones: data.observaciones,
        ubicacion: data.ubicacion,
        estado: data.estado,
        fecha_actualizacion: new Date()
      }
    });

    return NextResponse.json(registro);
  } catch (error) {
    console.error('Error al actualizar registro:', error);
    return NextResponse.json({ error: 'Error al actualizar registro' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    await prisma.registros.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Registro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar registro:', error);
    return NextResponse.json({ error: 'Error al eliminar registro' }, { status: 500 });
  }
}