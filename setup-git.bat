# Comandos para inicializar Git y subir a GitHub

# 1. Inicializar repositorio Git
git init

# 2. Crear archivo .gitignore
echo "node_modules" > .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".next" >> .gitignore
echo "*.log" >> .gitignore

# 3. Agregar todos los archivos
git add .

# 4. Hacer commit inicial
git commit -m "Initial commit: PWA migrado a Next.js con Supabase"

# 5. Agregar tu repositorio remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
# git remote add origin https://github.com/TU_USUARIO/pwa-migrado.git

# 6. Subir código
git push -u origin main