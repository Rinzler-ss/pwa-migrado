import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

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

    const secret = speakeasy.generateSecret({
      name: `PWA App (${user.email})`,
      length: 32
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    await prisma.usuarios.update({
      where: { id: user.id },
      data: {
        two_factor_secret: secret.base32,
        two_factor_enabled: false
      }
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      manualEntryKey: secret.base32
    });
  } catch (error) {
    console.error('Error al configurar 2FA:', error);
    return NextResponse.json({ error: 'Error al configurar 2FA' }, { status: 500 });
  }
}