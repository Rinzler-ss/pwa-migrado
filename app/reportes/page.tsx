'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Reportes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const generateReport = async (tipo: string) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/reports?tipo=${tipo}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Crear PDF (simulado con window.print)
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Reporte de ${tipo}</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; }
                  h1 { color: #333; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                  th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                  th { background-color: #f2f2f2; }
                  .header { margin-bottom: 30px; }
                  .date { color: #666; font-size: 12px; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Reporte de ${tipo.toUpperCase()}</h1>
                  <p class="date">Fecha de generación: ${new Date().toLocaleDateString()}</p>
                  <p class="date">Generado por: ${data.generado_por}</p>
                </div>
                <div id="content"></div>
              </body>
            </html>
          `);
          
          // Agregar contenido según el tipo
          let content = '';
          if (data.data && data.data.length > 0) {
            if (tipo === 'productos') {
              content = `
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Código</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Categoría</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.data.map((item: any) => `
                      <tr>
                        <td>${item.id}</td>
                        <td>${item.nombre}</td>
                        <td>${item.codigo}</td>
                        <td>$${item.precio}</td>
                        <td>${item.stock}</td>
                        <td>${item.categoria}</td>
                        <td>${item.estado}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            } else if (tipo === 'registros') {
              content = `
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Usuario</th>
                      <th>Fecha</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.data.map((item: any) => `
                      <tr>
                        <td>${item.id}</td>
                        <td>${item.producto?.nombre || 'N/A'}</td>
                        <td>${item.tipo_registro}</td>
                        <td>${item.cantidad}</td>
                        <td>${item.usuario?.nombre || 'N/A'}</td>
                        <td>${new Date(item.fecha_registro).toLocaleDateString()}</td>
                        <td>${item.ubicacion || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            } else if (tipo === 'usuarios') {
              content = `
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Fecha de Creación</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.data.map((item: any) => `
                      <tr>
                        <td>${item.id}</td>
                        <td>${item.nombre}</td>
                        <td>${item.email}</td>
                        <td>${item.rol}</td>
                        <td>${item.estado}</td>
                        <td>${new Date(item.fecha_creacion).toLocaleDateString()}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              `;
            }
          } else {
            content = '<p>No hay datos disponibles para este reporte.</p>';
          }
          
          printWindow.document.getElementById('content')!.innerHTML = content;
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        setError('Error al generar reporte');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-xl font-semibold">Reportes</h1>
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
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Generar Reportes
          </h2>
          <p className="text-gray-600 mb-6">
            Seleccione el tipo de reporte que desea generar:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => generateReport('productos')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {loading ? 'Generando...' : 'Reporte de Productos'}
            </button>
            
            <button
              onClick={() => generateReport('registros')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {loading ? 'Generando...' : 'Reporte de Registros'}
            </button>
            
            <button
              onClick={() => generateReport('usuarios')}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              {loading ? 'Generando...' : 'Reporte de Usuarios'}
            </button>
          </div>
        </div>

        <div className="mt-6 bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Información sobre Reportes
          </h3>
          <div className="space-y-4 text-gray-600">
            <div>
              <h4 className="font-medium text-gray-800">Reporte de Productos</h4>
              <p>Muestra todos los productos registrados en el sistema con su información completa.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Reporte de Registros</h4>
              <p>Lista todos los movimientos de entrada, salida y ajustes de productos.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Reporte de Usuarios</h4>
              <p>Muestra todos los usuarios del sistema con sus roles y estados.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}