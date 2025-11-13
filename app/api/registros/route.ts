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

    const registros = await prisma.registros.findMany({
      include: {
        producto: true,
        usuario: true
      },
      orderBy: { fecha_registro: 'desc' }
    });

    return NextResponse.json(registros);
  } catch (error) {
    console.error('Error al obtener registros:', error);
    return NextResponse.json({ error: 'Error al obtener registros' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    
    const registro = await prisma.registros.create({
      data: {
        producto_id: data.producto_id,
        usuario_id: user.id,
        tipo_registro: data.tipo_registro,
        cantidad: data.cantidad,
        fecha_registro: new Date(),
        observaciones: data.observaciones,
        ubicacion: data.ubicacion,
        estado: data.estado || 'completo'
      }
    });

    return NextResponse.json(registro);
  } catch (error) {
    console.error('Error al crear registro:', error);
    return NextResponse.json({ error: 'Error al crear registro' }, { status: 500 });
  }
}