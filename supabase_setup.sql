-- Activar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tablas
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(50) DEFAULT 'usuario',
    estado VARCHAR(50) DEFAULT 'activo',
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    ultimo_acceso TIMESTAMP
);

CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(100) UNIQUE,
    precio DECIMAL(10,2),
    stock INTEGER DEFAULT 0,
    categoria VARCHAR(100),
    estado VARCHAR(50) DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);

CREATE TABLE registros (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    usuario_id INTEGER REFERENCES usuarios(id),
    tipo_registro VARCHAR(50) NOT NULL,
    cantidad INTEGER NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT,
    ubicacion VARCHAR(255),
    estado VARCHAR(50) DEFAULT 'completo',
    fecha_actualizacion TIMESTAMP
);

CREATE TABLE parametros (
    id SERIAL PRIMARY KEY,
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT,
    descripcion TEXT,
    categoria VARCHAR(100),
    tipo VARCHAR(50) DEFAULT 'string',
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE fotos (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    url TEXT NOT NULL,
    nombre_archivo VARCHAR(255),
    tipo_archivo VARCHAR(100),
    tamaño INTEGER,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Otorgar permisos
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Crear usuario administrador por defecto
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Administrador', 'admin@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insertar datos de ejemplo
INSERT INTO productos (nombre, descripcion, codigo, precio, stock, categoria) VALUES
('Producto 1', 'Descripción del producto 1', 'PROD001', 29.99, 100, 'Electrónica'),
('Producto 2', 'Descripción del producto 2', 'PROD002', 49.99, 50, 'Hogar'),
('Producto 3', 'Descripción del producto 3', 'PROD003', 19.99, 200, 'Oficina');

INSERT INTO parametros (clave, valor, descripcion, categoria) VALUES
('empresa_nombre', 'Mi Empresa', 'Nombre de la empresa', 'general'),
('empresa_email', 'contacto@empresa.com', 'Email de contacto', 'general'),
('moneda_default', 'USD', 'Moneda por defecto', 'configuracion');