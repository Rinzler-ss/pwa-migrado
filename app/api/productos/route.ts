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

    const productos = await prisma.productos.findMany({
      orderBy: { id: 'desc' }
    });

    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
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
    
    const producto = await prisma.productos.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        codigo: data.codigo,
        precio: data.precio,
        stock: data.stock,
        categoria: data.categoria,
        estado: data.estado || 'activo',
        fecha_creacion: new Date()
      }
    });

    return NextResponse.json(producto);
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}