"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, doc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Store, ShoppingBag, Clock, ChevronRight, Activity, MapPin } from "lucide-react";

export default function TrackingPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar comercios activos
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "commerce"), where("isActive", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRestaurants(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Cargar pedidos en tiempo real para el restaurante seleccionado
  useEffect(() => {
    if (!selectedRestaurant) {
      setActiveOrders([]);
      return;
    }

    const q = query(
      collection(db, "orders"), 
      where("restaurantId", "==", selectedRestaurant.id),
      where("status", "not-in", ["delivered", "cancelled"])
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setActiveOrders(orders.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    });

    return () => unsubscribe();
  }, [selectedRestaurant]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'incoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'preparing': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'ready': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'dispatched': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'incoming': return 'Entrante';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'dispatched': return 'Enviado';
      default: return status;
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-gray-400">Cargando flota de restaurantes...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Seguimiento en Vivo</h1>
          <p className="text-gray-400 mt-1">Monitorea la actividad de los comercios y sus pedidos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Listado de Restaurantes */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest px-2">Comercios Activos</h3>
          <div className="space-y-2">
            {restaurants.map(rest => (
              <button
                key={rest.id}
                onClick={() => setSelectedRestaurant(rest)}
                className={`w-full flex items-center p-4 rounded-2xl border transition-all ${
                  selectedRestaurant?.id === rest.id 
                    ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-600/10' 
                    : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-inner ${
                  selectedRestaurant?.id === rest.id ? 'bg-indigo-500 text-white' : 'bg-gray-800 text-gray-400'
                }`}>
                  <Store className="w-6 h-6" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-bold text-white">{rest.fullName || rest.businessName || "Comercio"}</p>
                  <div className="flex items-center mt-0.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[150px]">{rest.address || "Sin ubicación"}</span>
                  </div>
                </div>
                <ChevronRight className={`w-5 h-5 transition-transform ${selectedRestaurant?.id === rest.id ? 'text-indigo-400' : 'text-gray-600'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Pedidos Activos */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">
              {selectedRestaurant ? `Pedidos de "${selectedRestaurant.fullName || selectedRestaurant.businessName}"` : "Selecciona un comercio"}
            </h3>
            {selectedRestaurant && (
               <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">
                En vivo
              </span>
            )}
          </div>

          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 min-h-[400px]">
            {!selectedRestaurant ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <Activity className="w-16 h-16 text-gray-700 mb-4 animate-pulse" />
                <p className="text-gray-400 font-medium">Selecciona un restaurante de la lista para ver su actividad en vivo.</p>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-20">
                <ShoppingBag className="w-16 h-16 text-gray-800 mb-4" />
                <p className="text-gray-500">No hay pedidos activos en este momento para este comercio.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeOrders.map(order => (
                  <div key={order.id} className="bg-gray-950 border border-gray-800 rounded-2xl p-4 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono text-indigo-400">#{order.id?.slice(-6).toUpperCase() || 'ERROR'}</span>
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <h4 className="text-white font-bold mb-1 truncate">
                      {order.items?.map((i: any) => i.name).join(', ') || "Pedido Especial"}
                    </h4>
                    <div className="flex items-center text-xs text-gray-500 space-x-3 mt-4">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{order.createdAt && typeof order.createdAt.toDate === 'function' ? order.createdAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold text-gray-300">€{order.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
