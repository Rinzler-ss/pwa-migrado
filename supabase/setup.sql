-- Crear tablas para el sistema de control de calidad

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'usuario',
    estado VARCHAR(50) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    codigo_2fa VARCHAR(100),
    activar_2fa BOOLEAN DEFAULT false
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(100) UNIQUE NOT NULL,
    categoria VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'activo',
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros de calidad
CREATE TABLE IF NOT EXISTS registros (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER NOT NULL,
    tipo_registro VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL,
    observaciones TEXT,
    usuario_creacion INTEGER,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) DEFAULT 'activo'
);

-- Tabla de parámetros (configuración de productos)
CREATE TABLE IF NOT EXISTS parametros (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    valor_min DECIMAL(10,2),
    valor_max DECIMAL(10,2),
    unidad VARCHAR(50),
    tipo VARCHAR(50) DEFAULT 'numerico',
    estado VARCHAR(50) DEFAULT 'activo'
);

-- Tabla de controles de calidad
CREATE TABLE IF NOT EXISTS controles (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER NOT NULL,
    parametro_id INTEGER,
    valor_medido DECIMAL(10,2),
    resultado VARCHAR(50),
    observaciones TEXT,
    fecha_control TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de fotos/evidencias
CREATE TABLE IF NOT EXISTS fotos (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    datos_base64 TEXT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_codigo ON productos(codigo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_registros_producto ON registros(producto_id);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha_registro);
CREATE INDEX IF NOT EXISTS idx_controles_registro ON controles(registro_id);
CREATE INDEX IF NOT EXISTS idx_fotos_registro ON fotos(registro_id);

-- Crear usuario administrador por defecto
INSERT INTO usuarios (nombre, apellido, email, password, rol, estado) 
VALUES ('Admin', 'Sistema', 'admin@sistema.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'activo')
ON CONFLICT (email) DO NOTHING;

-- Nota: La contraseña es 'password' encriptada con bcrypt
-- Puedes cambiarla después del primer login

-- Otorgar permisos básicos
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres;