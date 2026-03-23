"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle2, Truck, Navigation, AlertCircle } from "lucide-react";
import { db, auth, rtdb } from "@/lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from "firebase/firestore";
import { ref, set } from "firebase/database";

export default function OrdersDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Escuchar pedidos para este comercio que no estén finalizados o cancelados
    const q = query(
      collection(db, "orders"), 
      where("restaurantId", "==", user.uid),
      where("status", "not-in", ["delivered", "cancelled"]),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(data);
      setLoading(false);
    }, (err) => {
      console.error("Orders sync error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // 1. Actualizar Firestore (Persistencia y Reportes)
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        updatedAt: new Date()
      });

      // 2. Sincronizar con Real Time Database (Seguimiento Ultra Rápido)
      await set(ref(rtdb, `live_orders/${orderId}`), {
        status: newStatus,
        updatedAt: Date.now()
      });
    } catch (error) {
      console.error("Error updating order:", error);
      alert("No se pudo actualizar el pedido.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-emerald-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-3"></div>
        Cargando pedidos...
      </div>
    );
  }

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
        {/* Columna: Nuevos / Pendientes (incoming) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-medium text-white flex items-center">
              <Clock className="w-4 h-4 mr-2 text-amber-500"/> Pendientes 
            </h2>
            <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === 'incoming').length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            {orders.filter(o => o.status === 'incoming').length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-10">No hay pedidos nuevos.</p>
            ) : (
              orders.filter(o => o.status === 'incoming').map(order => (
                <div key={order.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-emerald-400">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] text-slate-500">{order.createdAt?.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-sm text-slate-300 mb-1">{order.items?.map((i:any) => i.name).join(', ') || "Pedido Especial"}</p>
                  <p className="text-xs text-slate-500 mb-4">Cliente: {order.clientName || order.userId?.slice(0,8)}</p>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg transition-colors active:scale-95"
                    >
                      Aceptar Pedido
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Columna: En Cocina / Despacho (preparing, ready) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-medium text-white flex items-center">
              <Truck className="w-4 h-4 mr-2 text-blue-500"/> En Preparación
            </h2>
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded-full">
              {orders.filter(o => ['preparing', 'ready'].includes(o.status)).length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
             {orders.filter(o => ['preparing', 'ready'].includes(o.status)).length === 0 ? (
               <p className="text-slate-500 text-xs text-center py-10">Nada en preparación.</p>
             ) : (
               orders.filter(o => ['preparing', 'ready'].includes(o.status)).map(order => (
                <div key={order.id} className={`bg-slate-800 rounded-xl p-4 border border-slate-700 border-l-4 ${order.status === 'ready' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-white">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className={`text-[10px] flex items-center ${order.status === 'ready' ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {order.status === 'ready' ? 'Listo para entrega' : 'En cocina'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-300 mb-1">{order.items?.map((i:any) => i.name).join(', ')}</p>
                  <div className="mt-3 pt-3 border-t border-slate-700 flex justify-between items-center">
                     <span className="text-xs text-slate-400">Total: <span className="text-white font-bold">€{order.total?.toFixed(2)}</span></span>
                     {order.status === 'preparing' && (
                       <button 
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="text-xs text-emerald-400 font-bold hover:text-emerald-300 underline"
                       >
                         Marcar Listo
                       </button>
                     )}
                  </div>
                </div>
              ))
             )}
          </div>
        </div>
        
        {/* Columna: En Camino (dispatched) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[70vh]">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-medium text-white flex items-center">
              <Navigation className="w-4 h-4 mr-2 text-indigo-500"/> En Reparto
            </h2>
            <span className="bg-indigo-500/20 text-indigo-400 text-xs px-2 py-0.5 rounded-full">
              {orders.filter(o => o.status === 'dispatched').length}
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
             {orders.filter(o => o.status === 'dispatched').length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center opacity-30">
                 <Truck className="w-8 h-8 mb-2" />
                 <p className="text-xs">No hay pedidos en camino.</p>
               </div>
             ) : (
               orders.filter(o => o.status === 'dispatched').map(order => (
                <div key={order.id} className="bg-slate-800/40 rounded-xl p-4 border border-slate-800 opacity-80">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-gray-400">#{order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] text-indigo-400">Con repartidor</span>
                  </div>
                  <p className="text-xs text-slate-400">{order.items?.map((i:any) => i.name).join(', ')}</p>
                  <div className="mt-2 flex items-center text-[10px] text-slate-500">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    <span>Llegada estimada en 10-15 min</span>
                  </div>
                </div>
              ))
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
