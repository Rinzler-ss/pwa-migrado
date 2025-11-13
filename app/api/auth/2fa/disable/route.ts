import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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

    await prisma.usuarios.update({
      where: { id: user.id },
      data: { 
        two_factor_enabled: false,
        two_factor_secret: null
      }
    });

    return NextResponse.json({ message: '2FA deshabilitado exitosamente' });
  } catch (error) {
    console.error('Error al deshabilitar 2FA:', error);
    return NextResponse.json({ error: 'Error al deshabilitar 2FA' }, { status: 500 });
  }
}