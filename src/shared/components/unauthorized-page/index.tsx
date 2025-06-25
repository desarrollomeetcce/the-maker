export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-5xl font-bold text-red-600 mb-4">Acceso denegado</h1>
      <p className="text-lg text-gray-700 max-w-md">
        No tienes permisos para acceder a esta página. Si crees que esto es un error,
        contacta a un administrador.
      </p>
      <a
        href="/"
        className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Regresar al inicio
      </a>
    </div>
  )
}
