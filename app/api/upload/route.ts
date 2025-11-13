import { NextRequest, NextResponse } from 'next/server';
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

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // En producción, aquí subirías el archivo a un servicio como AWS S3, Cloudinary, etc.
    // Por ahora, vamos a simular la subida y retornar una URL mock
    const fileName = `${Date.now()}-${file.name}`;
    const mockUrl = `https://ejemplo.com/uploads/${fileName}`;

    return NextResponse.json({
      url: mockUrl,
      nombre_archivo: file.name,
      tipo_archivo: file.type,
      tamaño: file.size
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 });
  }
}