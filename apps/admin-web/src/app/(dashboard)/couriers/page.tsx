"use client";

import { useEffect, useState } from "react";
//import { db } from "@/lib/firebase";
import { db } from "@/lib/firebase"; 
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { ShieldCheck, ShieldAlert, MoreVertical } from "lucide-react";

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCouriers = async () => {
      // Solo una consulta demostrativa, se asume schema ya en Firestore
      const q = query(collection(db, "users"), where("role", "==", "courier"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCouriers(data);
      setLoading(false);
    };
    fetchCouriers();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "users", id), { isActive: !currentStatus });
    setCouriers(couriers.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Gestión de Repartidores</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          + Nuevo Repartidor
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Nombre</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Teléfono</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-900">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">Cargando repartidores...</td></tr>
            ) : couriers.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-4 text-center text-gray-500">No hay repartidores registrados.</td></tr>
            ) : (
              couriers.map((courier) => (
                <tr key={courier.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{courier.fullName || "Sin nombre"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{courier.phone || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${courier.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {courier.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => toggleStatus(courier.id, courier.isActive)}
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      {courier.isActive ? <ShieldAlert className="w-5 h-5 text-red-400"/> : <ShieldCheck className="w-5 h-5 text-green-400"/>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
