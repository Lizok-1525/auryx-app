"use client";

import { useState } from "react";
import { Clock, CheckCircle2, Truck, Navigation } from "lucide-react";

export default function OrdersDashboard() {
  // Simulando órdenes que vendrían desde Firestore / API
  const [orders] = useState([
    { id: "ORD-991", status: "pending", items: "2x Hamburguesa, 1x Refresco", total: "$25.50", time: "10:45 AM", client: "María González" },
    { id: "ORD-990", status: "courier_assigned", items: "1x Pizza Familiar", total: "$18.00", time: "10:30 AM", client: "Carlos Ruiz", courier: "Roberto M." },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Pedidos en Tiempo Real</h1>
        <div className="flex space-x-2">
           <span className="flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium border border-emerald-500/20">
             <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
             Recibiendo Pedidos
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Columna: Nuevos / Pendientes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-medium text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-amber-500"/> Pendientes 
            </h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">1</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {orders.filter(o => o.status === 'pending').map(order => (
              <div key={order.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-white">{order.id}</span>
                  <span className="text-xs text-slate-400">{order.time}</span>
                </div>
                <p className="text-sm text-slate-300 mb-1">{order.items}</p>
                <p className="text-xs text-slate-500 mb-4">Cliente: {order.client}</p>
                
                <div className="flex gap-2">
                  <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg transition-colors">
                    Aceptar Pedido
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna: Preparando / Buscando Repartidor */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-medium text-white flex items-center">
              <Truck className="w-4 h-4 mr-2 text-blue-500"/> En Despacho
            </h2>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">1</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
             {orders.filter(o => o.status === 'courier_assigned').map(order => (
              <div key={order.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-white">{order.id}</span>
                  <span className="text-xs text-blue-400 flex items-center"><Navigation className="w-3 h-3 mr-1"/> En camino</span>
                </div>
                <p className="text-sm text-slate-300 mb-1">{order.items}</p>
                <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                   <span className="text-xs text-slate-400">Repartidor: <span className="text-white">{order.courier}</span></span>
                   <button className="text-xs text-emerald-400 font-medium hover:text-emerald-300">Marcar Listo</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Columna: Completados Recientes */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh] hidden xl:flex">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-medium text-white flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-2 text-slate-500"/> Entregados Hoy
            </h2>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4 flex items-center justify-center">
             <p className="text-slate-500 text-sm text-center">Las órdenes completadas aparecerán aquí.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
