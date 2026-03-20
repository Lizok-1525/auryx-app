"use client";

import { useState } from "react";
import { PackageOpen, MapPin, Receipt, Share2 } from "lucide-react";

export default function NewOrderPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados del formulario simulado
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [orderDetails, setOrderDetails] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular guardado en firestore
    setTimeout(() => {
        setLoading(false);
        setSuccess(true);
        // Reset
        setCustomerName(""); setCustomerPhone(""); setDropoffAddress(""); setOrderDetails(""); setPrice("");
        setTimeout(() => setSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-semibold text-white">Nuevo Pedido Manual</h1>
           <p className="text-slate-400 mt-1">Crea una orden desde el local para asignarla a un repartidor disponible.</p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-6 py-4 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
           <span>¡Pedido creado y transmitido exitosamente al sistema de repartidores!</span>
           <button onClick={() => setSuccess(false)} className="text-emerald-500 hover:text-emerald-300">×</button>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Cliente */}
            <div className="space-y-6">
               <h3 className="text-lg font-medium text-white flex items-center border-b border-slate-800 pb-3">
                 <MapPin className="w-5 h-5 mr-2 text-emerald-500"/>
                 Destino de Entrega
               </h3>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Nombre del Cliente</label>
                 <input
                   type="text" required value={customerName} onChange={e=>setCustomerName(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                   placeholder="Ej: Laura Méndez"
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Teléfono de Contacto</label>
                 <input
                   type="tel" required value={customerPhone} onChange={e=>setCustomerPhone(e.target.value)}
                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                   placeholder="+5... "
                 />
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Dirección Exacta</label>
                 <textarea
                   required value={dropoffAddress} onChange={e=>setDropoffAddress(e.target.value)} rows={3}
                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                   placeholder="Calle, Número, Referencia..."
                 />
               </div>
            </div>

            {/* Columna Derecha: Pedido */}
            <div className="space-y-6">
               <h3 className="text-lg font-medium text-white flex items-center border-b border-slate-800 pb-3">
                 <PackageOpen className="w-5 h-5 mr-2 text-indigo-400"/>
                 Detalles de la Orden
               </h3>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Monto a Cobrar / Precio</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <span className="text-slate-500 font-medium">$</span>
                   </div>
                   <input
                     type="number" step="0.01" required value={price} onChange={e=>setPrice(e.target.value)}
                     className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                     placeholder="0.00"
                   />
                 </div>
               </div>

               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Resumen de Artículos</label>
                 <textarea
                   required value={orderDetails} onChange={e=>setOrderDetails(e.target.value)} rows={5}
                   className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                   placeholder="2x Pizza, 1x Coca-cola grande..."
                 />
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end space-x-4">
             <button type="button" className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors">
               Cancelar
             </button>
             <button 
               type="submit" disabled={loading}
               className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center disabled:opacity-50"
             >
               {loading ? "Procesando..." : <><Share2 className="w-4 h-4 mr-2"/> Generar y Asignar Conductor</>}
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}
