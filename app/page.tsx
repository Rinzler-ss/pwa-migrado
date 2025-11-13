import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, BarChart3, Camera } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sistema de Control de Calidad
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Gestión integral de control de calidad para productos. Registra, verifica y genera reportes de calidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Package className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Productos</CardTitle>
              <CardDescription>
                Gestiona el catálogo de productos y sus parámetros de calidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/productos">
                <Button className="w-full">Ver Productos</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle>Registros</CardTitle>
              <CardDescription>
                Crea nuevos registros de control de calidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/registros">
                <Button className="w-full">Nuevo Registro</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Camera className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle>Reportes</CardTitle>
              <CardDescription>
                Genera reportes PDF de controles de calidad
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/reportes">
                <Button className="w-full">Ver Reportes</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-8 w-8 text-orange-600 mb-2" />
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                Administración de usuarios y permisos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/usuarios">
                <Button className="w-full">Gestionar Usuarios</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/auth/login">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Iniciar Sesión
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}