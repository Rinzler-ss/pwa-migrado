# Guía de Despliegue - PWA Migrado a Next.js

## Pasos para desplegar en Vercel con Supabase

### 1. Preparación del Proyecto

```bash
# Instalar dependencias
npm install

# Verificar que el proyecto funciona localmente
npm run dev
```

### 2. Configuración de Supabase

1. Ve a [Supabase](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales de conexión:
   - URL de conexión
   - Clave Anónima (ANON_KEY)
   - Clave de Servicio (SERVICE_ROLE_KEY)

### 3. Variables de Entorno

Crea un archivo `.env.local` con tus credenciales:

```env
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/base_de_datos"
DIRECT_URL="postgresql://usuario:contraseña@host:puerto/base_de_datos"
JWT_SECRET="tu_secreto_jwt_aqui"
NEXTAUTH_SECRET="tu_secreto_nextauth_aqui"
```

### 4. Despliegue en Vercel

1. Sube tu código a GitHub
2. Ve a [Vercel](https://vercel.com)
3. Importa tu repositorio
4. Configura las variables de entorno en el panel de Vercel
5. Despliega

### 5. Comandos Útiles

```bash
# Generar cliente Prisma
npx prisma generate

# Ver estado de migraciones
npx prisma migrate status

# Abrir Studio de Prisma
npx prisma studio
```

### 6. Solución de Problemas

#### Error de conexión a base de datos
- Verifica que las credenciales de Supabase sean correctas
- Asegúrate de que la IP de Vercel esté permitida en Supabase

#### Error de permisos
- Ejecuta los comandos SQL de permisos proporcionados
- Verifica que los roles `anon` y `authenticated` tengan acceso

#### Error 500 en API
- Revisa los logs en Vercel Dashboard
- Verifica que todas las variables de entorno estén configuradas

### 7. URLs Importantes

- **Aplicación**: `https://tu-proyecto.vercel.app`
- **API**: `https://tu-proyecto.vercel.app/api/`
- **Panel Vercel**: `https://vercel.com/dashboard`
- **Panel Supabase**: `https://app.supabase.com`

### 8. Características Implementadas

✅ Sistema de autenticación completo
✅ Gestión de productos (CRUD)
✅ Registros de movimientos
✅ Gestión de usuarios
✅ Generación de reportes PDF
✅ Autenticación de dos factores (2FA)
✅ Subida de archivos
✅ Panel de administración
✅ Diseño responsive
✅ Protección de rutas

### 9. Próximos Pasos

1. Configurar email para notificaciones
2. Implementar búsqueda avanzada
3. Agregar exportación a Excel
4. Implementar auditoría de cambios
5. Agregar múltiples idiomas

### 10. Soporte

Para problemas técnicos:
1. Revisa los logs de Vercel
2. Verifica la configuración de Supabase
3. Consulta la documentación de Next.js
4. Revisa los issues en GitHub