import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json()

    if (!usuario || !password) {
      return NextResponse.json(
        { error: 'Usuario y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.usuarios.findUnique({
      where: { email: usuario }
    })

    if (!user || user.estado !== 'activo') {
      return NextResponse.json(
        { error: 'Usuario no encontrado o inactivo' },
        { status: 401 }
      )
    }

    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Contraseña incorrecta' },
        { status: 401 }
      )
    }

    // Verificar si tiene 2FA activado
    if (user.activar_2fa && user.codigo_2fa) {
      return NextResponse.json(
        { 
          requires2FA: true,
          message: 'Se requiere código 2FA'
        },
        { status: 202 }
      )
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        rol: user.rol 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol
      }
    })

  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    )
  }
}