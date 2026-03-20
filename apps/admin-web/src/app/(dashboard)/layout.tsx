"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useAuthStore } from "@/store/authStore";
import { Sidebar } from "@/components/Sidebar";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, loading, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // Verificar el rol nuevamente por seguridad al recargar
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setUser(currentUser);
        } else {
          await auth.signOut();
          setUser(null);
          router.push("/login");
        }
      } else {
        setUser(null);
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, setUser, setLoading]);

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
    <div className="flex h-screen bg-gray-900">
      <Sidebar onSignOut={handleSignOut} />
      <main className="flex-1 overflow-y-auto bg-gray-950">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
