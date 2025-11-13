'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  codigo: string;
  precio: number;
  stock: number;
  categoria: string;
  estado: string;
  fecha_creacion: string;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    codigo: '',
    precio: '',
    stock: '',
    categoria: '',
    estado: 'activo'
  });

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/productos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      } else {
        setError('Error al cargar productos');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const url = editingProducto 
        ? `/api/productos/${editingProducto.id}`
        : '/api/productos';

      const method = editingProducto ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          precio: parseFloat(formData.precio),
          stock: parseInt(formData.stock)
        })
      });

      if (response.ok) {
        setShowForm(false);
        setEditingProducto(null);
        setFormData({
          nombre: '',
          descripcion: '',
          codigo: '',
          precio: '',
          stock: '',
          categoria: '',
          estado: 'activo'
        });
        fetchProductos();
      } else {
        setError('Error al guardar producto');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      codigo: producto.codigo,
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      categoria: producto.categoria,
      estado: producto.estado
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/productos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchProductos();
      } else {
        setError('Error al eliminar producto');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Volver
              </button>
              <h1 className="text-xl font-semibold">Productos</h1>
            </div>
            <button
              onClick={() => {
                setEditingProducto(null);
                setFormData({
                  nombre: '',
                  descripcion: '',
                  codigo: '',
                  precio: '',
                  stock: '',
                  categoria: '',
                  estado: 'activo'
                });
                setShowForm(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Nuevo Producto
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Código</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.codigo}
                    onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.stock}
                    onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.categoria}
                    onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Productos
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {productos.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-gray-500">
                No hay productos registrados
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {productos.map((producto) => (
                  <li key={producto.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {producto.nombre}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Código: {producto.codigo} | Categoría: {producto.categoria}
                        </p>
                        <p className="text-sm text-gray-500">
                          Precio: ${producto.precio} | Stock: {producto.stock} | Estado: {producto.estado}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}