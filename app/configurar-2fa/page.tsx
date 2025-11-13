'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Configurar2FA() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const router = useRouter();

  useEffect(() => {
    setup2FA();
  }, []);

  const setup2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('verify');
      } else {
        setError('Error al configurar 2FA');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo })
      });

      if (response.ok) {
        alert('2FA habilitado exitosamente');
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Código inválido');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Configurando 2FA...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Configurar Autenticación de Dos Factores
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Escanea el código QR con tu aplicación de autenticación
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {qrCode && (
            <div className="text-center mb-6">
              <img src={qrCode} alt="Código QR" className="mx-auto" />
              <p className="text-sm text-gray-600 mt-2">
                O ingresa este código manualmente:
              </p>
              <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                {secret}
              </code>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
                Código de verificación
              </label>
              <input
                id="codigo"
                name="codigo"
                type="text"
                required
                placeholder="123456"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm"
              >
                {loading ? 'Verificando...' : 'Verificar y Activar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}