'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  estado: string;
  fecha_creacion: string;
  two_factor_enabled: boolean;
}

export default function Perfil() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      const parsedUser = JSON.parse(userData);
      setFormData({
        nombre: parsedUser.nombre,
        email: parsedUser.email,
        password: '',
        confirmPassword: ''
      });
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token || !user) return;

      const updateData: any = {
        nombre: formData.nombre,
        email: formData.email
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/usuarios/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (response.ok) {
        const updatedUser = { ...user, nombre: formData.nombre, email: formData.email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setShowEditForm(false);
        setFormData({
          ...formData,
          password: '',
          confirmPassword: ''
        });
        alert('Perfil actualizado exitosamente');
      } else {
        setError('Error al actualizar perfil');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleConfigure2FA = () => {
    router.push('/configurar-2fa');
  };

  const handleDisable2FA = async () => {
    if (!confirm('¿Está seguro de deshabilitar la autenticación de dos factores?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedUser = { ...user!, two_factor_enabled: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert('2FA deshabilitado exitosamente');
      } else {
        setError('Error al deshabilitar 2FA');
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
              <h1 className="text-xl font-semibold">Mi Perfil</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              Información del Perfil
            </h2>
            {!showEditForm && (
              <button
                onClick={() => setShowEditForm(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Editar Perfil
              </button>
            )}
          </div>

          {!showEditForm ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <p className="mt-1 text-sm text-gray-900">{user?.nombre}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <p className="mt-1 text-sm text-gray-900">{user?.rol}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <p className="mt-1 text-sm text-gray-900">{user?.estado}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Registro</label>
                <p className="mt-1 text-sm text-gray-900">
                  {user?.fecha_creacion ? new Date(user.fecha_creacion).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Autenticación de Dos Factores</label>
                <div className="mt-1 flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.two_factor_enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user?.two_factor_enabled ? 'Habilitado' : 'Deshabilitado'}
                  </span>
                  {user?.two_factor_enabled ? (
                    <button
                      onClick={handleDisable2FA}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Deshabilitar
                    </button>
                  ) : (
                    <button
                      onClick={handleConfigure2FA}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Configurar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
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
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Dejar vacío para mantener actual"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                  <input
                    type="password"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    placeholder="Dejar vacío para mantener actual"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}