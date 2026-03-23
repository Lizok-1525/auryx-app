"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/Sidebar";
import { doc, getDoc } from "firebase/firestore";
import { Menu, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, loading, setLoading } = useAuthStore();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          if (!user || user.uid !== currentUser.uid) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists() && userDoc.data().role === "admin") {
              setUser(currentUser);
            } else {
              await auth.signOut();
              setUser(null);
              router.push("/login");
            }
          }
        } else {
          setUser(null);
          router.push("/login");
        }
      } catch (error) {
        console.error("Auth sync error:", error);
        if (!currentUser) {
          setUser(null);
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, setUser, setLoading, user]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <Sidebar 
        onSignOut={handleSignOut} 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-800 bg-gray-950 px-4 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-white">
              AURYX <span className="text-indigo-500">ADMIN</span>
            </h1>
          </div>
          <button 
                onClick={handleSignOut}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-950 scroll-smooth">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
