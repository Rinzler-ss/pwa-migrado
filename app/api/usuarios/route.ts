import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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

    const usuarios = await prisma.usuarios.findMany({
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

    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
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
    
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const usuario = await prisma.usuarios.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hashedPassword,
        rol: data.rol || 'usuario',
        estado: data.estado || 'activo',
        fecha_creacion: new Date()
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        fecha_creacion: true
      }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}