"use client";

import Link from "next/link";
import { LayoutDashboard, PlusCircle, History, Settings, LogOut } from "lucide-react";

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const navItems = [
    { label: "Panel de Pedidos", href: "/", icon: LayoutDashboard },
    { label: "Crear Pedido Manual", href: "/new-order", icon: PlusCircle },
    { label: "Historial", href: "/history", icon: History },
    { label: "Configuración", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 border-r border-slate-800">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-wider text-white">AURYX <span className="text-emerald-500">STORE</span></h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-emerald-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onSignOut}
          className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
        >
          <LogOut className="mr-3 h-5 w-5 flex-shrink-0" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
