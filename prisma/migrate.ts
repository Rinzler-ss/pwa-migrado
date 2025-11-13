import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
})

async function main() {
  try {
    // Crear tablas manualmente
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(255) NOT NULL,
        usuario VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255),
        email_verified BOOLEAN DEFAULT false,
        password VARCHAR(255) NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        roles VARCHAR(50) DEFAULT 'trabajador',
        two_factor_secret VARCHAR(100)
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS parametros_maestros (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) UNIQUE NOT NULL,
        tipo VARCHAR(50) DEFAULT 'texto',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS parametros (
        id SERIAL PRIMARY KEY,
        producto_id INTEGER NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        rango_min DECIMAL(10,2) NOT NULL,
        rango_max DECIMAL(10,2) NOT NULL,
        unidad VARCHAR(50) DEFAULT '',
        rango_completo TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parametro_maestro_id INTEGER,
        valor_texto TEXT,
        es_rango BOOLEAN DEFAULT false,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (parametro_maestro_id) REFERENCES parametros_maestros(id)
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS registros (
        id SERIAL PRIMARY KEY,
        lote_interno VARCHAR(100) NOT NULL,
        guia VARCHAR(100),
        cantidad INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        producto_nombre VARCHAR(255) NOT NULL,
        usuario_id INTEGER NOT NULL,
        usuario_nombre VARCHAR(255) NOT NULL,
        observaciones_generales TEXT,
        verificado_por VARCHAR(255),
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (producto_id) REFERENCES productos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS controles (
        id SERIAL PRIMARY KEY,
        registro_id INTEGER NOT NULL,
        parametro_nombre VARCHAR(255) NOT NULL,
        rango_completo TEXT NOT NULL,
        valor_control DECIMAL(10,2),
        texto_control VARCHAR(255),
        parametro_tipo VARCHAR(50),
        observacion TEXT,
        fuera_de_rango BOOLEAN DEFAULT false,
        mensaje_alerta TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        parametro_id INTEGER,
        FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE,
        FOREIGN KEY (parametro_id) REFERENCES parametros(id)
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS fotos (
        id SERIAL PRIMARY KEY,
        registro_id INTEGER NOT NULL,
        nombre_archivo VARCHAR(255) NOT NULL,
        datos_base64 TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS password_resets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `

    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS sesiones (
        id VARCHAR(128) PRIMARY KEY,
        usuario_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      );
    `

    console.log('✅ Tablas creadas exitosamente')
    
  } catch (error) {
    console.error('Error al crear tablas:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()