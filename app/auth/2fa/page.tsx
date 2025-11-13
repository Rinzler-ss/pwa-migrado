'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Configurar2FAPage() {
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchQRCode()
  }, [])

  const fetchQRCode = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/2fa', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
      } else if (response.status === 401) {
        router.push('/login')
      } else {
        setError('Error al cargar código QR')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVerifying(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ codigo }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else {
        setError(data.error || 'Código inválido')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setVerifying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => router.push('/profile')}
            className="text-blue-600 hover:text-blue-700 mr-4"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Configurar Autenticación de Dos Factores</h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Escanea este código QR con tu aplicación de autenticación
              </h2>
              <p className="text-gray-600 mb-6">
                Usa Google Authenticator, Authy, o cualquier otra app compatible
              </p>
              
              {qrCode && (
                <div className="flex justify-center mb-6">
                  <img src={qrCode} alt="Código QR para 2FA" className="border border-gray-200 rounded-lg" />
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">O ingresa este código manualmente:</p>
                <code className="bg-white px-3 py-2 rounded border font-mono text-sm break-all">
                  {secret}
                </code>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-green-800">¡2FA configurado exitosamente!</p>
                </div>
              )}

              <div>
                <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingresa el código de 6 dígitos de tu aplicación
                </label>
                <input
                  type="text"
                  id="codigo"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md font-medium"
                  disabled={verifying}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={verifying || codigo.length !== 6}
                >
                  {verifying ? 'Verificando...' : 'Verificar y Activar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}