'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NuevoProductoPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    categoria: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/productos')
      } else {
        setError(data.error || 'Error al crear producto')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/productos')}
            className="text-blue-600 hover:text-blue-700 mr-4"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Nuevo Producto</h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingresa el nombre del producto"
                  value={formData.nombre}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                  Código del Producto *
                </label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingresa el código único"
                  value={formData.codigo}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
                Categoría *
              </label>
              <input
                type="text"
                id="categoria"
                name="categoria"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: Electrónica, Alimentos, Ropa"
                value={formData.categoria}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Describe el producto (opcional)"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.push('/productos')}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Producto'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}