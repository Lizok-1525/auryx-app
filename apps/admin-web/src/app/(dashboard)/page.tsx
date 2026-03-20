"use client";

import { Users, Truck, Store, DollarSign } from "lucide-react";

export default function DashboardHome() {
  const stats = [
    { title: "Pedidos Hoy", value: "124", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Usuarios Activos", value: "1,204", icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Comercios", value: "48", icon: Store, color: "text-purple-500", bg: "bg-purple-500/10" },
    { title: "Ingresos (Hoy)", value: "$3,420", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Resumen General</h1>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-sm">
              <div className="flex items-center">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Espacio para gráficos interactivos posteriores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 h-96 flex items-center justify-center">
          <p className="text-gray-500">Gráfico de Envíos en Tiempo Real</p>
        </div>
        <div className="rounded-2xl bg-gray-900 border border-gray-800 p-6 h-96 flex items-center justify-center">
          <p className="text-gray-500">Volumen de Órdenes (Últimos 7 días)</p>
        </div>
      </div>
    </div>
  );
}
