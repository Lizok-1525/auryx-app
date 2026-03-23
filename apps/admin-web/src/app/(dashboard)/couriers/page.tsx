"use client";

import { useEffect, useState } from "react";
import { db, firebaseConfig } from "@/lib/firebase"; 
import { collection, query, where, onSnapshot, doc, updateDoc, setDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { ShieldCheck, ShieldAlert, X, UserPlus, Phone, Mail, Lock, User, Trash2 } from "lucide-react";

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: ""
  });

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "courier"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCouriers(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching couriers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "users", id), { isActive: !currentStatus });
      setCouriers(couriers.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  const deleteCourier = async (id: string, name: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente a ${name || 'este repartidor'}? Esta acción no se puede deshacer y perderá acceso a la aplicación.`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", id));
      alert("Repartidor eliminado satisfactoriamente.");
    } catch (error) {
      console.error("Error deleting courier:", error);
      alert("Error al intentar eliminar el repartidor. Verifica tu conexión.");
    }
  };

  const handleAddCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError("");

    try {
      // 1. Crear usuario en Auth usando una instancia secundaria (para no desloguear al admin)
      const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth, 
        formData.email, 
        formData.password
      );
      
      const newUserId = userCredential.user.uid;

      // 2. Crear documento en Firestore
      await setDoc(doc(db, "users", newUserId), {
        email: formData.email,
        fullName: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: "courier",
        isActive: true,
        createdAt: serverTimestamp()
      });

      // 3. Limpiar instancia secundaria
      await deleteApp(secondaryApp);

      // 4. Finalizar
      setIsModalOpen(false);
      setFormData({ firstName: "", lastName: "", email: "", phone: "", password: "" });
    } catch (error: any) {
      console.error("Error creating courier:", error);
      setFormError(error.message || "Error al crear el repartidor");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Gestión de Repartidores</h1>
           <p className="text-gray-400 mt-1">Administra el personal que entrega tus pedidos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all flex items-center shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <UserPlus className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuevo Repartidor</span>
          <span className="sm:hidden">Nuevo</span>
        </button>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-x-auto shadow-2xl scrollbar-hide">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-950/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Repartidor</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center"><div className="flex justify-center flex-col items-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div><span className="mt-4 text-gray-400 text-sm">Sincronizando flota...</span></div></td></tr>
            ) : couriers.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-500">No hay repartidores registrados. Comienza agregando uno nuevo.</td></tr>
            ) : (
              couriers.map((courier) => (
                <tr key={courier.id} className="hover:bg-gray-800/20 transition-colors group">
                  <td className="px-6 py-4">
                     <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center mr-3 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-105 transition-all">
                           <User className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                           <p className="text-sm font-medium text-gray-200">{courier.fullName || "Sin nombre"}</p>
                           <p className="text-xs text-gray-500">{courier.email || "Sin email"}</p>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                     <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-2 text-indigo-500/60" />
                        {courier.phone || "N/A"}
                     </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${courier.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-2 ${courier.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`}></span>
                      {courier.isActive ? "Operante" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleStatus(courier.id, courier.isActive)}
                        className="p-2 transition-all hover:bg-gray-800 rounded-lg"
                        title={courier.isActive ? "Desactivar" : "Activar"}
                      >
                        {courier.isActive ? <ShieldAlert className="w-5 h-5 text-amber-500 hover:text-amber-400 transition-colors"/> : <ShieldCheck className="w-5 h-5 text-emerald-500 hover:text-emerald-400 transition-colors"/>}
                      </button>
                      <button 
                        onClick={() => deleteCourier(courier.id, courier.fullName)}
                        className="p-2 transition-all hover:bg-rose-500/10 rounded-lg group"
                        title="Eliminar Repartidor"
                      >
                         <Trash2 className="w-5 h-5 text-gray-500 group-hover:text-rose-500 transition-colors" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>


      {/* Modal - Nuevo Repartidor */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
           
           <div className="relative bg-gray-900 border border-gray-800 w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="p-8">
                 <div className="flex justify-between items-center mb-8">
                    <div>
                       <h2 className="text-2xl font-bold text-white tracking-tight">Nuevo Repartidor</h2>
                       <p className="text-gray-400 text-sm mt-1">Crea credenciales para tu flota.</p>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                       <X className="w-5 h-5 text-gray-400" />
                    </button>
                 </div>

                 <form onSubmit={handleAddCourier} className="space-y-4">
                    {formError && (
                       <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-medium text-center">
                          {formError}
                       </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 ml-1">NOMBRE</label>
                          <div className="relative">
                             <input 
                                required
                                value={formData.firstName}
                                onChange={e => setFormData({...formData, firstName: e.target.value})}
                                placeholder="Juan"
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                             />
                          </div>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-xs font-bold text-gray-500 ml-1">APELLIDO</label>
                          <div className="relative">
                             <input 
                                required
                                value={formData.lastName}
                                onChange={e => setFormData({...formData, lastName: e.target.value})}
                                placeholder="Pérez"
                                className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3 px-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                             />
                          </div>
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 ml-1">EMAIL PROFESIONAL</label>
                       <div className="relative">
                          <Mail className="w-4 h-4 absolute left-4 top-3.5 text-gray-600" />
                          <input 
                             required
                             type="email"
                             value={formData.email}
                             onChange={e => setFormData({...formData, email: e.target.value})}
                             placeholder="repartidor@auryx.com"
                             className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-xs font-bold text-gray-500 ml-1">TELÉFONO</label>
                       <div className="relative">
                          <Phone className="w-4 h-4 absolute left-4 top-3.5 text-gray-600" />
                          <input 
                             required
                             value={formData.phone}
                             onChange={e => setFormData({...formData, phone: e.target.value})}
                             placeholder="+34 600 000 000"
                             className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5 pb-2">
                       <label className="text-xs font-bold text-gray-500 ml-1">CONTRASEÑA DE ACCESO</label>
                       <div className="relative">
                          <Lock className="w-4 h-4 absolute left-4 top-3.5 text-gray-600" />
                          <input 
                             required
                             type="password"
                             value={formData.password}
                             onChange={e => setFormData({...formData, password: e.target.value})}
                             placeholder="••••••••"
                             className="w-full bg-gray-800/50 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white text-sm placeholder-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                          />
                       </div>
                    </div>

                    <button 
                       type="submit"
                       disabled={formLoading}
                       className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-sm tracking-widest uppercase transition-all shadow-xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 flex justify-center items-center"
                    >
                       {formLoading ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       ) : (
                          "Dar de Alta"
                       )}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
