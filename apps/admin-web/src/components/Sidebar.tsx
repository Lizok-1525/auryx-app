"use client";

import Link from "next/link";
import { LayoutDashboard, Users, Store, MessageSquare, LogOut, Package } from "lucide-react";

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Repartidores", href: "/couriers", icon: Users },
    { label: "Comercios", href: "/commerce", icon: Store },
    { label: "Pedidos", href: "/orders", icon: Package },
    { label: "Soporte", href: "/chat", icon: MessageSquare },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-950 border-r border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold tracking-wider text-white">AURYX <span className="text-indigo-500">ADMIN</span></h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all"
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-indigo-400" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
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
