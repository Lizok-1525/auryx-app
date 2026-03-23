"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Store, MessageSquare, LogOut, Package, Activity, ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onSignOut: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ onSignOut, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Seguimiento", href: "/tracking", icon: Activity },
    { label: "Historial", href: "/history", icon: ClipboardList },
    { label: "Repartidores", href: "/couriers", icon: Users },
    { label: "Comercios", href: "/commerce", icon: Store },
    { label: "Pedidos", href: "/orders", icon: Package },
    { label: "Soporte", href: "/chat", icon: MessageSquare },
  ];

  return (
    <>
      {/* Background Overlay (Mobile only) */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gray-950 border-r border-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-wider text-white">
            AURYX <span className="text-indigo-500 font-extrabold italic">ADMIN</span>
          </h1>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 scrollbar-hide">
          <nav className="space-y-1.5 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    // Cierra el menú al seleccionar una sección en móvil
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-indigo-500/10 text-indigo-400 shadow-sm shadow-indigo-500/10" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-indigo-400" : "group-hover:text-white"
                  )} />
                  {item.label}
                  {isActive && (
                    <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800 mt-auto bg-gray-950/50 backdrop-blur-md">
          <button
            onClick={onSignOut}
            className="group flex w-full items-center px-4 py-3 text-sm font-medium rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/5 group-hover:bg-red-500/10 mr-3">
              <LogOut className="h-4 w-4" />
            </div>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
