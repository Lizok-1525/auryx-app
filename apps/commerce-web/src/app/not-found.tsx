export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-slate-400">Página no encontrada</p>
        <a href="/" className="mt-6 inline-block bg-emerald-600 px-6 py-2 rounded-lg font-medium">
          Volver al Inicio
        </a>
      </div>
    </div>
  );
}
