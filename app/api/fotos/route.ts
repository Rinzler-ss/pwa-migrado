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
    const productoId = searchParams.get('producto_id');

    const where = productoId ? { producto_id: parseInt(productoId) } : {};

    const fotos = await prisma.fotos.findMany({
      where,
      include: {
        producto: true
      },
      orderBy: { fecha_creacion: 'desc' }
    });

    return NextResponse.json(fotos);
  } catch (error) {
    console.error('Error al obtener fotos:', error);
    return NextResponse.json({ error: 'Error al obtener fotos' }, { status: 500 });
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
    
    const foto = await prisma.fotos.create({
      data: {
        producto_id: data.producto_id,
        url: data.url,
        nombre_archivo: data.nombre_archivo,
        tipo_archivo: data.tipo_archivo,
        tamaño: data.tamaño,
        descripcion: data.descripcion,
        fecha_creacion: new Date()
      }
    });

    return NextResponse.json(foto);
  } catch (error) {
    console.error('Error al crear foto:', error);
    return NextResponse.json({ error: 'Error al crear foto' }, { status: 500 });
  }
}