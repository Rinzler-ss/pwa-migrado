import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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

    const usuario = await prisma.usuarios.findUnique({
      where: { id: parseInt(params.id) },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        fecha_creacion: true,
        ultimo_acceso: true,
        two_factor_enabled: true
      }
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
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
    
    const updateData: any = {
      nombre: data.nombre,
      email: data.email,
      rol: data.rol,
      estado: data.estado,
      fecha_actualizacion: new Date()
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const usuario = await prisma.usuarios.update({
      where: { id: parseInt(params.id) },
      data: updateData,
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        fecha_creacion: true,
        ultimo_acceso: true
      }
    });

    return NextResponse.json(usuario);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
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

    await prisma.usuarios.delete({
      where: { id: parseInt(params.id) }
    });

    return NextResponse.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario' }, { status: 500 });
  }
}