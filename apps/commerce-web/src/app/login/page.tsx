"use client";

import { useAuthStore } from "@/store/authStore";
//import { useAuthStore } from "../../store/authStore";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock, Mail, Store } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));

      if (
        userDoc.exists() &&
        ["commerce", "admin", "courier"].includes(userDoc.data().role)
      ) {
        setUser(userCredential.user);
        router.push("/");
      } else {
        await auth.signOut();
        setError("Acceso denegado. Esta cuenta no pertenece a una Tienda/Comercio.");
      }
    } catch (err: any) {
      setError("Credenciales inválidas o error de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Adorno visual */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-indigo-500"></div>

        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
            <Store className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Auryx Commerce</h1>
          <p className="text-slate-400">Panel administrativo para tiendas</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-500 border border-red-500/20 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Correo de la Tienda</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="local@burgerking.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-slate-700 bg-slate-800/50 py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider mt-4"
          >
            {loading ? "Verificando..." : "Ingresar a mi Tienda"}
          </button>
        </form>
      </div>
    </div>
  );
}
