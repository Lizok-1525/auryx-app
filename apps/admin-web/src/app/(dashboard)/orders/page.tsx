"use client";

import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ShoppingBag, 
  MapPin, 
  User, 
  Truck, 
  Clock, 
  Search, 
  Filter,
  MoreVertical,
  ChevronRight,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Escuchar TODOS los pedidos en tiempo real
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'incoming': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'preparing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'ready': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'dispatched': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'delivered': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'incoming': return 'Entrante';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'dispatched': return 'En camino';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.restaurantName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.clientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Pedidos</h1>
          <p className="text-gray-400 mt-1">Supervisión global de todas las operaciones activas.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar por ID, Comercio o Cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-900 border border-gray-800 rounded-2xl py-2.5 pl-10 pr-4 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all w-full md:w-80"
            />
          </div>
          <button className="p-2.5 bg-gray-900 text-gray-400 hover:text-white border border-gray-800 rounded-2xl transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full divide-y divide-gray-800/50">
            <thead className="bg-gray-950/50 uppercase tracking-widest text-[10px] font-bold text-gray-500">
              <tr>
                <th className="px-6 py-5 text-left">Pedido</th>
                <th className="px-6 py-5 text-left">Comercio</th>
                <th className="px-6 py-5 text-left">Entrega</th>
                <th className="px-6 py-5 text-left">Repartidor</th>
                <th className="px-6 py-5 text-left">Estado</th>
                <th className="px-6 py-5 text-right">Monto</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/30">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="mt-4 text-gray-500 text-sm font-medium">Sincronizando con base de datos real...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center">
                    <ShoppingBag className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No se encontraron pedidos activos.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="group hover:bg-gray-800/20 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-mono text-indigo-400 font-bold mb-1 tracking-tighter">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <div className="flex items-center text-gray-500 text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          {order.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center mr-3 border border-gray-700/50">
                          <Store className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-200">{order.restaurantName || "Desconocido"}</span>
                          <span className="text-[10px] text-gray-500">{order.restaurantId?.slice(-6)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-[200px]">
                        <div className="flex items-center text-sm font-medium text-gray-300 mb-0.5">
                          <User className="w-3.5 h-3.5 mr-1.5 text-indigo-500/60" />
                          <span className="truncate">{order.clientName || "Cliente"}</span>
                        </div>
                        <div className="flex items-center text-[11px] text-gray-500 italic">
                          <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" />
                          <span className="truncate">{order.deliveryAddress || order.address || "Sin dirección"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.courierId ? (
                        <div className="flex items-center px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-xl w-fit">
                          <Truck className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-200 text-nowrap">
                              {order.courierName || "Repartidor Asignado"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center px-3 py-1.5 bg-rose-500/5 border border-rose-500/10 rounded-xl w-fit">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-2"></div>
                          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Sin asignar</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
                        getStatusStyles(order.status)
                      )}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-sm font-black text-white">
                        {order.total?.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-600 hover:text-white hover:bg-gray-800 rounded-xl transition-all">
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-gray-950/50 px-6 py-4 border-t border-gray-800 flex items-center justify-between">
           <span className="text-xs text-gray-500 font-medium tracking-wide">
            Mostrando <span className="text-indigo-400 font-bold">{filteredOrders.length}</span> pedidos recientes
           </span>
           <div className="flex gap-1.5">
             <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
             <div className="h-1.5 w-1.5 rounded-full bg-gray-800"></div>
             <div className="h-1.5 w-1.5 rounded-full bg-gray-800"></div>
           </div>
        </div>
      </div>
    </div>
  );
}
