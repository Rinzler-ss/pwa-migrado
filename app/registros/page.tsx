'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Producto {
  id: number;
  nombre: string;
  codigo: string;
}

interface Registro {
  id: number;
  producto_id: number;
  usuario_id: number;
  tipo_registro: string;
  cantidad: number;
  fecha_registro: string;
  observaciones: string;
  ubicacion: string;
  estado: string;
  producto: Producto;
  usuario: {
    nombre: string;
  };
}

export default function Registros() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    producto_id: '',
    tipo_registro: 'entrada',
    cantidad: '',
    observaciones: '',
    ubicacion: '',
    estado: 'completo'
  });

  useEffect(() => {
    fetchRegistros();
    fetchProductos();
  }, []);

  const fetchRegistros = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/registros', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRegistros(data);
      } else {
        setError('Error al cargar registros');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/productos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProductos(data);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          producto_id: parseInt(formData.producto_id),
          cantidad: parseInt(formData.cantidad)
        })
      });

      if (response.ok) {
        setShowForm(false);
        setFormData({
          producto_id: '',
          tipo_registro: 'entrada',
          cantidad: '',
          observaciones: '',
          ubicacion: '',
          estado: 'completo'
        });
        fetchRegistros();
      } else {
        setError('Error al crear registro');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este registro?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/registros/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchRegistros();
      } else {
        setError('Error al eliminar registro');
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
              <h1 className="text-xl font-semibold">Registros de Productos</h1>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              Nuevo Registro
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
              Nuevo Registro
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Producto</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.producto_id}
                    onChange={(e) => setFormData({...formData, producto_id: e.target.value})}
                  >
                    <option value="">Seleccione un producto</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - {producto.codigo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Registro</label>
                  <select
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.tipo_registro}
                    onChange={(e) => setFormData({...formData, tipo_registro: e.target.value})}
                  >
                    <option value="entrada">Entrada</option>
                    <option value="salida">Salida</option>
                    <option value="ajuste">Ajuste</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad</label>
                  <input
                    type="number"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.cantidad}
                    onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ubicación</label>
                  <input
                    type="text"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
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
              Lista de Registros
            </h3>
          </div>
          <div className="border-t border-gray-200">
            {registros.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-gray-500">
                No hay registros
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {registros.map((registro) => (
                  <li key={registro.id} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {registro.producto.nombre} - {registro.tipo_registro.toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Cantidad: {registro.cantidad} | Ubicación: {registro.ubicacion} | Estado: {registro.estado}
                        </p>
                        <p className="text-sm text-gray-500">
                          Registrado por: {registro.usuario.nombre} | Fecha: {new Date(registro.fecha_registro).toLocaleDateString()}
                        </p>
                        {registro.observaciones && (
                          <p className="text-sm text-gray-500">
                            Observaciones: {registro.observaciones}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(registro.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Eliminar
                      </button>
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