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

    const parametros = await prisma.parametros.findMany({
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(parametros);
  } catch (error) {
    console.error('Error al obtener parámetros:', error);
    return NextResponse.json({ error: 'Error al obtener parámetros' }, { status: 500 });
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
    
    const parametro = await prisma.parametros.create({
      data: {
        clave: data.clave,
        valor: data.valor,
        descripcion: data.descripcion,
        categoria: data.categoria,
        tipo: data.tipo || 'string',
        activo: data.activo !== false
      }
    });

    return NextResponse.json(parametro);
  } catch (error) {
    console.error('Error al crear parámetro:', error);
    return NextResponse.json({ error: 'Error al crear parámetro' }, { status: 500 });
  }
}