"use client";

import { MessageSquare } from "lucide-react";

export default function ChatSupportPage() {
  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
      {/* Lista de Chats (Sidebar) */}
      <div className="w-80 border-r border-gray-800 bg-gray-950 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-indigo-400"/>
            Bandeja de Entrada
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {/* Item quemado para visualización inicial */}
          <div className="p-3 bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-800/80 transition-colors mb-2">
            <h3 className="text-sm font-medium text-white mb-1">Juan (Cliente)</h3>
            <p className="text-xs text-gray-400 truncate">El repartidor no encuentra la dirección...</p>
          </div>
          <div className="p-3 bg-transparent rounded-xl cursor-pointer hover:bg-gray-800/50 transition-colors">
            <h3 className="text-sm font-medium text-gray-300 mb-1">Roberto (Repartidor)</h3>
            <p className="text-xs text-gray-500 truncate">Llegué al punto de entrega y nadie...</p>
          </div>
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className="flex-1 flex flex-col bg-gray-900">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-white font-medium">Chat Activo: <span className="text-gray-400 font-normal">Juan (Cliente)</span></h3>
        </div>
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          <div className="flex justify-start">
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-2 max-w-md">
              <p className="text-sm text-gray-300">Hola soporte, el repartidor no encuentra la dirección. ¿Me ayudan?</p>
              <span className="text-[10px] text-gray-500 mt-1 block">10:42 AM</span>
            </div>
          </div>
          <div className="flex justify-end">
            <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-4 py-2 max-w-md">
              <p className="text-sm text-white">Hola Juan, un momento, contactaremos al repartidor enseguida.</p>
              <span className="text-[10px] text-indigo-200 mt-1 block">10:43 AM</span>
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-gray-800 bg-gray-950">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Escribe un mensaje de respuesta..." 
              className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition-colors">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
