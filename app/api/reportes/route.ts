import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import PDFDocument from 'pdfkit'

// GET - Generar reporte de productos
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get('tipo')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    
    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    
    let data: any[] = []
    let titulo = ''

    switch (tipo) {
      case 'productos':
        data = await prisma.productos.findMany({
          orderBy: { fecha_creacion: 'desc' },
          include: {
            usuarios: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        })
        titulo = 'Reporte de Productos'
        break

      case 'registros':
        const whereClause: any = {}
        if (fechaInicio && fechaFin) {
          whereClause.fecha_registro = {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          }
        }
        
        data = await prisma.registros.findMany({
          where: whereClause,
          orderBy: { fecha_registro: 'desc' },
          include: {
            productos: true,
            usuarios: {
              select: {
                nombre: true,
                apellido: true
              }
            }
          }
        })
        titulo = 'Reporte de Registros de Calidad'
        break

      case 'usuarios':
        data = await prisma.usuarios.findMany({
          orderBy: { fecha_creacion: 'desc' },
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            rol: true,
            estado: true,
            fecha_creacion: true
          }
        })
        titulo = 'Reporte de Usuarios'
        break

      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 })
    }

    // Crear PDF
    const doc = new PDFDocument()
    const chunks: Buffer[] = []

    doc.on('data', (chunk) => chunks.push(chunk))
    
    // Encabezado
    doc.fontSize(20).text(titulo, { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).text(`Fecha de generación: ${new Date().toLocaleDateString()}`, { align: 'right' })
    doc.moveDown()

    // Contenido según tipo
    if (tipo === 'productos') {
      data.forEach((producto: any) => {
        doc.fontSize(12).text(`Código: ${producto.codigo}`)
        doc.text(`Nombre: ${producto.nombre}`)
        doc.text(`Descripción: ${producto.descripcion}`)
        doc.text(`Categoría: ${producto.categoria}`)
        doc.text(`Estado: ${producto.estado}`)
        doc.text(`Creado por: ${producto.usuarios?.nombre} ${producto.usuarios?.apellido}`)
        doc.text(`Fecha: ${new Date(producto.fecha_creacion).toLocaleDateString()}`)
        doc.moveDown()
      })
    } else if (tipo === 'registros') {
      data.forEach((registro: any) => {
        doc.fontSize(12).text(`Producto: ${registro.productos?.nombre}`)
        doc.text(`Tipo: ${registro.tipo_registro}`)
        doc.text(`Fecha: ${new Date(registro.fecha_registro).toLocaleDateString()}`)
        doc.text(`Observaciones: ${registro.observaciones}`)
        doc.text(`Registrado por: ${registro.usuarios?.nombre} ${registro.usuarios?.apellido}`)
        doc.moveDown()
      })
    } else if (tipo === 'usuarios') {
      data.forEach((usuario: any) => {
        doc.fontSize(12).text(`Nombre: ${usuario.nombre} ${usuario.apellido}`)
        doc.text(`Email: ${usuario.email}`)
        doc.text(`Rol: ${usuario.rol}`)
        doc.text(`Estado: ${usuario.estado}`)
        doc.text(`Fecha de registro: ${new Date(usuario.fecha_creacion).toLocaleDateString()}`)
        doc.moveDown()
      })
    }

    doc.end()

    // Esperar a que termine el PDF
    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        
        const response = new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${titulo.toLowerCase().replace(/\s+/g, '_')}.pdf"`
          }
        })
        
        resolve(response)
      })
    })
  } catch (error) {
    console.error('Error al generar reporte:', error)
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 })
  }
}