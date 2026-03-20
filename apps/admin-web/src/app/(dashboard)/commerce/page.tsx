"use client";

import React, { useState } from "react";
import { Store, ShoppingBag, Plus, MoreVertical, Edit, Trash2, Search, Star, ToggleLeft, ToggleRight } from "lucide-react";

const STORES_MOCK = [
  { id: "1", name: "La Burger Fina", category: "Hamburguesas", rating: 4.8, status: "active", revenue: "$4,200", orders: 154 },
  { id: "2", name: "Sushi Auryx", category: "Asiática", rating: 4.9, status: "active", revenue: "$6,100", orders: 201 },
  { id: "3", name: "Pizza del Barrio", category: "Pizzería", rating: 4.5, status: "inactive", revenue: "$950", orders: 32 },
];

export default function CommercePage() {
  const [activeTab, setActiveTab] = useState("stores");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-amber-500">
            Comercios & Catálogo
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Administra los restaurantes, tiendas y sus menús.</p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          {activeTab === "stores" ? "Nuevo Comercio" : "Nuevo Producto"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700/50">
        <button
          onClick={() => setActiveTab("stores")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
            activeTab === "stores" 
              ? "border-amber-500 text-amber-500" 
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <Store size={18} />
          <span>Comercios Afiliados</span>
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
            activeTab === "products" 
              ? "border-amber-500 text-amber-500" 
              : "border-transparent text-gray-400 hover:text-gray-200"
          }`}
        >
          <ShoppingBag size={18} />
          <span>Catálogo Universal</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-[#1A2B4C]/40 backdrop-blur-xl border border-[#2a3f68]/50 rounded-2xl p-6 shadow-2xl">
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder={`Buscar ${activeTab === "stores" ? "restaurante..." : "producto..."}`}
              className="w-full bg-[#0F172A]/60 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 text-gray-200 focus:outline-none focus:border-amber-500/50 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
             <select className="bg-[#0F172A]/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-gray-300 focus:outline-none focus:border-amber-500/50">
               <option value="all">Todas las Categorías</option>
               <option value="food">Comida Fast-Food</option>
               <option value="markets">Mercados</option>
             </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-slate-700/50">
                <th className="font-medium pb-4 pl-4">Comercio</th>
                <th className="font-medium pb-4">Categoría</th>
                <th className="font-medium pb-4">Métricas</th>
                <th className="font-medium pb-4">Estado</th>
                <th className="font-medium pb-4 text-right pr-4">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {STORES_MOCK.map((store) => (
                <tr key={store.id} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-inner">
                        {store.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-200">{store.name}</p>
                        <p className="text-xs text-gray-500">{store.id.slice(0,8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-gray-300">
                    <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs">
                      {store.category}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star size={14} fill="currentColor" />
                        <span className="font-medium">{store.rating}</span>
                      </div>
                      <span className="text-xs text-gray-500">{store.orders} pedidos</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      store.status === "active" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}>
                      {store.status === "active" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      {store.status === "active" ? "Activo" : "Pausado"}
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {STORES_MOCK.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Store className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-300 font-medium">No hay comercios registrados</p>
              <p className="text-sm text-gray-500 mt-1">Empieza añadiendo tu primer socio comercial.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal (Simple Overlay Demo) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#1A2B4C] border border-[#2a3f68] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
            <h2 className="text-2xl font-bold text-white mb-2">Añadir Nuevo Comercio</h2>
            <p className="text-gray-400 text-sm mb-6">Ingresa los datos del nuevo socio restaurante / tienda.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Nombre del Local</label>
                <input type="text" className="w-full mt-1 bg-[#0F172A]/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500" placeholder="Ej: Burger King" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Categoría</label>
                  <select className="w-full mt-1 bg-[#0F172A]/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500">
                    <option>Restaurantes</option>
                    <option>Farmacias</option>
                    <option>Mercados</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Comisión (%)</label>
                  <input type="number" className="w-full mt-1 bg-[#0F172A]/80 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-amber-500" placeholder="15" />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 justify-end">
              <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl font-medium text-gray-300 hover:bg-slate-800 transition-colors">
                Cancelar
              </button>
              <button className="px-5 py-2.5 rounded-xl font-medium bg-amber-500 text-slate-900 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">
                Guardar Comercio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
