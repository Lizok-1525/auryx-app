"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { Sidebar } from "@/components/Sidebar";

export default function CommerceLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === "commerce") {
            setLoading(false);
            return;
          }
        }
        await signOut(auth);
        router.push("/login");
      } catch (error) {
        console.error("Auth sync error (Commerce):", error);
        if (!currentUser) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-900">
      <Sidebar onSignOut={() => { signOut(auth); router.push("/login"); }} />
      <main className="flex-1 overflow-y-auto bg-slate-950">
        <div className="px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
