"use client";

import React, { useState, useEffect } from "react";
import { db, firebaseConfig } from "@/lib/firebase";
import { 
  collection, query, where, getDocs, doc, setDoc, updateDoc, deleteDoc, 
  serverTimestamp, addDoc, onSnapshot 
} from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { 
  Store, ShoppingBag, Plus, Trash2, Search, Star, ToggleLeft, ToggleRight, 
  MapPin, Phone, Mail, Lock, X, ChevronLeft, Package, CheckCircle2, AlertCircle
} from "lucide-react";

export default function CommercePage() {
  const [commerces, setCommerces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommerce, setSelectedCommerce] = useState<any>(null); // For product management
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  const [commerceForm, setCommerceForm] = useState({
    name: "",
    address: "",
    email: "",
    phone: "",
    password: ""
  });

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    isAvailable: true,
    category: "General"
  });

  // Fetch Commerces
  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "commerce"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommerces(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Products when a commerce is selected
  useEffect(() => {
    if (!selectedCommerce) return;
    setProductsLoading(true);
    const q = query(collection(db, "products"), where("commerceId", "==", selectedCommerce.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setProductsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedCommerce]);

  // Handle Add Commerce
  const handleAddCommerce = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const secApp = initializeApp(firebaseConfig, "CommerceGen");
      const secAuth = getAuth(secApp);
      const creds = await createUserWithEmailAndPassword(secAuth, commerceForm.email, commerceForm.password);
      
      await setDoc(doc(db, "users", creds.user.uid), {
        fullName: commerceForm.name,
        name: commerceForm.name,
        address: commerceForm.address,
        email: commerceForm.email,
        phone: commerceForm.phone,
        role: "commerce",
        isActive: true,
        createdAt: serverTimestamp()
      });
      
      await deleteApp(secApp);
      setShowAddModal(false);
      setCommerceForm({ name: "", address: "", email: "", phone: "", password: "" });
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Delete Commerce
  const handleDeleteCommerce = async (id: string, name: string) => {
    if (!window.confirm(`¿Eliminar permanentemente ${name}?`)) return;
    try {
      await deleteDoc(doc(db, "users", id));
      // Optional: Clean up their products too
    } catch (error) {
       alert("Error al eliminar");
    }
  };

  // Handle Add Product
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await addDoc(collection(db, "products"), {
        ...productForm,
        price: parseFloat(productForm.price),
        commerceId: selectedCommerce.id,
        createdAt: serverTimestamp()
      });
      setShowProductModal(false);
      setProductForm({ name: "", description: "", price: "", isAvailable: true, category: "General" });
    } catch (error) {
      alert("Error al agregar producto");
    } finally {
      setFormLoading(false);
    }
  };

  const toggleProductAvailability = async (productId: string, current: boolean) => {
    await updateDoc(doc(db, "products", productId), { isAvailable: !current });
  };

  const deleteProduct = async (productId: string) => {
    if (window.confirm("¿Eliminar producto?")) {
      await deleteDoc(doc(db, "products", productId));
    }
  };

  if (selectedCommerce) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <button onClick={() => setSelectedCommerce(null)} className="flex items-center text-gray-400 hover:text-white transition-colors group">
          <ChevronLeft className="mr-1 group-hover:-translate-x-1 transition-transform" />
          Volver a Comercios
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-900 font-bold text-2xl shadow-xl shadow-orange-500/20">
                {selectedCommerce.name.charAt(0)}
             </div>
             <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{selectedCommerce.name}</h1>
                <p className="text-gray-400 flex items-center mt-1 text-sm">
                   <MapPin className="w-4 h-4 mr-1 text-orange-500" />
                   {selectedCommerce.address}
                </p>
             </div>
          </div>
          <button 
            onClick={() => setShowProductModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5 mr-1" />
            Nuevo Producto
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {productsLoading ? (
             <div className="col-span-full py-12 flex justify-center flex-col items-center">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-500">Cargando catálogo...</p>
             </div>
           ) : products.length === 0 ? (
             <div className="col-span-full py-20 text-center bg-gray-900/40 border border-gray-800 rounded-[32px]">
                <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">Catálogo Vacío</h3>
                <p className="text-gray-600 mt-2">Este comercio aún no tiene productos registrados.</p>
             </div>
           ) : (
             products.map(product => (
               <div key={product.id} className="bg-gray-900/60 border border-gray-800 rounded-[28px] p-6 hover:border-gray-700 transition-all group overflow-hidden relative">
                  <div className="flex justify-between items-start mb-4">
                     <span className="px-3 py-1 bg-gray-800 text-gray-400 text-[10px] font-bold uppercase rounded-lg tracking-widest leading-none">
                        {product.category}
                     </span>
                     <div className="flex gap-1">
                        <button onClick={() => deleteProduct(product.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-gray-600 hover:text-rose-500 transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                     <span className="text-xl font-black text-white">€{product.price.toFixed(2)}</span>
                     <button 
                       onClick={() => toggleProductAvailability(product.id, product.isAvailable)}
                       className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold transition-all ${product.isAvailable ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                     >
                        {product.isAvailable ? <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> : <AlertCircle className="w-3.5 h-3.5 mr-1.5" />}
                        {product.isAvailable ? "Disponible" : "Agotado"}
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>

        {/* Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowProductModal(false)}></div>
             <div className="relative bg-[#111A2E] border border-gray-800 w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8 animate-in zoom-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-6">
                   <h2 className="text-2xl font-black text-white">Añadir Producto</h2>
                   <button onClick={() => setShowProductModal(false)} className="p-2 bg-gray-800 rounded-full text-gray-400"><X /></button>
                </div>
                <form onSubmit={handleAddProduct} className="space-y-4">
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1">NOMBRE DEL PRODUCTO</label>
                      <input required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-gray-800 border-none rounded-2xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-amber-500" placeholder="Ej: Pizza Margarita" />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 ml-1">DESCRIPCIÓN</label>
                      <textarea rows={3} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-gray-800 border-none rounded-2xl p-4 text-white placeholder-gray-600 focus:ring-2 focus:ring-amber-500" placeholder="Ingredientes, detalles..." />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 ml-1">PRECIO (€)</label>
                        <input type="number" step="0.01" required value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} className="w-full bg-gray-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500" placeholder="12.50" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 ml-1">CATEGORÍA</label>
                        <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-gray-800 border-none rounded-2xl p-4 text-white focus:ring-2 focus:ring-amber-500">
                           <option>General</option>
                           <option>Bebidas</option>
                           <option>Postres</option>
                           <option>Entrantes</option>
                        </select>
                      </div>
                   </div>
                   <button disabled={formLoading} type="submit" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-4 rounded-3xl mt-4 shadow-xl shadow-amber-500/20 active:scale-95 transition-all outline-none">
                      {formLoading ? "Guardando..." : "GUARDAR EN CATÁLOGO"}
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter">Socios Comerciales</h1>
           <p className="text-gray-400 mt-2 font-medium">Gestiona tus restaurantes y sus catálogos.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-7 py-3.5 rounded-[24px] font-black text-sm tracking-widest uppercase flex items-center shadow-2xl shadow-amber-500/30 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" />
          Añadir Comercio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-600 font-bold uppercase tracking-[0.2em] animate-pulse">Sincronizando Terminales...</div>
        ) : commerces.length === 0 ? (
          <div className="col-span-full py-32 text-center bg-gray-950/40 border border-gray-800 rounded-[48px]">
             <Store className="w-16 h-16 text-gray-800 mx-auto mb-6" />
             <h2 className="text-2xl font-bold text-gray-500 italic">Sin socios registrados</h2>
          </div>
        ) : (
          commerces.map(commerce => (
            <div key={commerce.id} className="group bg-gray-900/40 backdrop-blur-2xl border border-gray-800 hover:border-amber-500/50 rounded-[40px] p-8 transition-all relative overflow-hidden">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-slate-900 font-black text-xl shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                     {commerce.name?.charAt(0) || "C"}
                  </div>
                  <button onClick={() => handleDeleteCommerce(commerce.id, commerce.name)} className="p-3 bg-gray-950/50 hover:bg-rose-500/20 rounded-2xl text-gray-500 hover:text-rose-500 transition-colors">
                     <Trash2 className="w-5 h-5" />
                  </button>
               </div>

               <h3 className="text-xl font-black text-white mb-1 group-hover:text-amber-400 transition-colors">{commerce.name}</h3>
               <p className="text-gray-500 text-sm font-bold flex items-center mb-6">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-600" />
                  {commerce.address || "Sin ubicación"}
               </p>

               <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-950/50 rounded-2xl p-3 border border-gray-800/50">
                     <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Teléfono</p>
                     <p className="text-xs text-white font-bold">{commerce.phone || "---"}</p>
                  </div>
                  <div className="bg-gray-950/50 rounded-2xl p-3 border border-gray-800/50">
                     <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Email</p>
                     <p className="text-xs text-white font-bold truncate">{commerce.email?.split("@")[0]}</p>
                  </div>
               </div>

               <button 
                 onClick={() => setSelectedCommerce(commerce)}
                 className="w-full bg-gray-950 hover:bg-amber-500 hover:text-slate-900 text-white border border-gray-800 py-4 rounded-[22px] font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center group-active:scale-95"
               >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Gestionar Productos
               </button>
            </div>
          ))
        )}
      </div>

      {/* Add Commerce Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAddModal(false)}></div>
           <div className="relative bg-[#0F172A] border border-slate-800 w-full max-w-lg rounded-[48px] shadow-2xl p-10 animate-in slide-in-from-bottom-8 duration-500">
              <div className="flex justify-between items-center mb-8">
                 <div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Alta de Socio</h2>
                    <p className="text-gray-500 font-medium">Crea una cuenta para el restaurante.</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-3 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
                    <X />
                 </button>
              </div>

              <form onSubmit={handleAddCommerce} className="space-y-5">
                 <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-500 ml-2 uppercase tracking-widest">Nombre Comercial</label>
                       <input required value={commerceForm.name} onChange={e => setCommerceForm({...commerceForm, name: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-4 text-white focus:border-amber-500 transition-colors outline-none" placeholder="Burger King Centro" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-500 ml-2 uppercase tracking-widest">Contacto Directo</label>
                       <input required value={commerceForm.phone} onChange={e => setCommerceForm({...commerceForm, phone: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-4 text-white focus:border-amber-500 transition-colors outline-none" placeholder="+34 600..." />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 ml-2 uppercase tracking-widest">Dirección Exacta</label>
                    <div className="relative">
                       <MapPin className="absolute left-4 top-4 text-slate-600" size={20} />
                       <input required value={commerceForm.address} onChange={e => setCommerceForm({...commerceForm, address: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-4 pl-12 text-white focus:border-amber-500 transition-colors outline-none" placeholder="Av. Alcarria, 12, Local 4..." />
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 ml-2 uppercase tracking-widest">Email de Acceso</label>
                    <input required type="email" value={commerceForm.email} onChange={e => setCommerceForm({...commerceForm, email: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-4 text-white focus:border-amber-500 transition-colors outline-none" placeholder="admin@restaurante.com" />
                 </div>

                 <div className="space-y-1.5 pb-2">
                    <label className="text-[10px] font-black text-gray-500 ml-2 uppercase tracking-widest">Contraseña Temporal</label>
                    <input required type="password" value={commerceForm.password} onChange={e => setCommerceForm({...commerceForm, password: e.target.value})} className="w-full bg-slate-900/50 border-2 border-slate-800 rounded-3xl p-4 text-white focus:border-amber-500 transition-colors outline-none" placeholder="••••••••" />
                 </div>

                 <button disabled={formLoading} type="submit" className="w-full bg-white text-slate-950 font-black py-5 rounded-[28px] shadow-xl shadow-white/10 active:scale-[0.98] transition-all">
                    {formLoading ? "CREANDO TERMINAL..." : "VINCULAR SOCIO AURYX"}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
