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

    const parametro = await prisma.parametros.findUnique({
      where: { id: parseInt(params.id) }
    });

    if (!parametro) {
      return NextResponse.json({ error: 'Parámetro no encontrado' }, { status: 404 });
    }

    return NextResponse.json(parametro);
  } catch (error) {
    console.error('Error al obtener parámetro:', error);
    return NextResponse.json({ error: 'Error al obtener parámetro' }, { status: 500 });
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
    
    const parametro = await prisma.parametros.update({
      where: { id: parseInt(params.id) },
      data: {
        clave: data.clave,
        valor: data.valor,
        descripcion: data.descripcion,
        categoria: data.categoria,
        tipo: data.tipo,
        activo: data.activo
      }
    });

    return NextResponse.json(parametro);
  } catch (error) {
    console.error('Error al actualizar parámetro:', error);
    return NextResponse.json({ error: 'Error al actualizar parámetro' }, { status: 500 });
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

    await prisma.parametros.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Parámetro eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar parámetro:', error);
    return NextResponse.json({ error: 'Error al eliminar parámetro' }, { status: 500 });
  }
}