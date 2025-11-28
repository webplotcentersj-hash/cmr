'use client'

import { useState } from 'react'

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Datos insertados correctamente!\n\nClientes: ${data.clientes}\nProductos: ${data.productos}`)
      } else {
        setError(`❌ Error: ${data.error || 'Error desconocido'}`)
      }
    } catch (err: any) {
      setError(`❌ Error al ejecutar seed: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Poblar Base de Datos
        </h1>
        <p className="text-gray-600 mb-6">
          Este proceso insertará datos de ejemplo en tu base de datos de Supabase.
        </p>

        <button
          onClick={handleSeed}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {loading ? 'Insertando datos...' : 'Insertar Datos de Ejemplo'}
        </button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl">
            <pre className="text-sm text-green-800 whitespace-pre-wrap">{result}</pre>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <pre className="text-sm text-red-800 whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Asegúrate de haber ejecutado las migraciones en Supabase antes de ejecutar este seed.
          </p>
        </div>
      </div>
    </div>
  )
}

