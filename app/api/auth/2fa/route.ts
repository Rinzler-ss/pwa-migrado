import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

// GET - Obtener QR code para 2FA
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.userId }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    // Generar secreto si no existe
    if (!usuario.codigo_2fa) {
      const secret = speakeasy.generateSecret({
        name: `Sistema Control Calidad (${usuario.email})`,
        length: 32
      })

      await prisma.usuarios.update({
        where: { id: decoded.userId },
        data: { codigo_2fa: secret.base32 }
      })

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!)
      
      return NextResponse.json({
        secret: secret.base32,
        qrCode: qrCodeUrl,
        setup: true
      })
    }

    // Si ya tiene secreto, generar QR con el secreto existente
    const otpauth_url = speakeasy.otpauthURL({
      secret: usuario.codigo_2fa,
      label: `Sistema Control Calidad (${usuario.email})`,
      issuer: 'Sistema Control Calidad'
    })

    const qrCodeUrl = await QRCode.toDataURL(otpauth_url)
    
    return NextResponse.json({
      secret: usuario.codigo_2fa,
      qrCode: qrCodeUrl,
      setup: false
    })
  } catch (error) {
    console.error('Error al generar QR 2FA:', error)
    return NextResponse.json({ error: 'Error al generar QR 2FA' }, { status: 500 })
  }
}

// POST - Verificar código 2FA
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    const usuario = await prisma.usuarios.findUnique({
      where: { id: decoded.userId }
    })

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    if (!usuario.codigo_2fa) {
      return NextResponse.json({ error: '2FA no configurado' }, { status: 400 })
    }

    const verified = speakeasy.totp.verify({
      secret: usuario.codigo_2fa,
      encoding: 'base32',
      token: body.codigo,
      window: 2
    })

    if (verified) {
      // Activar 2FA si es la primera vez
      if (!usuario.activar_2fa) {
        await prisma.usuarios.update({
          where: { id: decoded.userId },
          data: { activar_2fa: true }
        })
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Código 2FA verificado correctamente' 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Código 2FA inválido' 
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Error al verificar código 2FA:', error)
    return NextResponse.json({ error: 'Error al verificar código 2FA' }, { status: 500 })
  }
}