import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import speakeasy from 'speakeasy';

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
    const { codigo } = data;

    const usuario = await prisma.usuarios.findUnique({
      where: { id: user.id }
    });

    if (!usuario || !usuario.two_factor_secret) {
      return NextResponse.json({ error: '2FA no configurado' }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
      secret: usuario.two_factor_secret,
      encoding: 'base32',
      token: codigo,
      window: 2
    });

    if (!verified) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    await prisma.usuarios.update({
      where: { id: user.id },
      data: { two_factor_enabled: true }
    });

    return NextResponse.json({ message: '2FA habilitado exitosamente' });
  } catch (error) {
    console.error('Error al verificar 2FA:', error);
    return NextResponse.json({ error: 'Error al verificar 2FA' }, { status: 500 });
  }
}