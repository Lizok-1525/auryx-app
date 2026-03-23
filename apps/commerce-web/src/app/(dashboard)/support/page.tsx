"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  doc, 
  setDoc,
  getDoc,
  increment
} from "firebase/firestore";
import { 
  Send, 
  Headset, 
  CheckCheck,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
  senderRole?: string;
}

export default function MerchantSupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const id = [user.uid, "ADMIN"].sort().join("_");
        setChatId(id);

        // Asegurar que el chat existe
        const chatRef = doc(db, "chats", id);
        const docSnap = await getDoc(chatRef);
        
        if (!docSnap.exists()) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.data();
          await setDoc(chatRef, {
            id,
            participants: [user.uid, "ADMIN"],
            participantDetails: {
              [user.uid]: {
                name: userData?.fullName || "Comercio",
                role: "merchant"
              },
              "ADMIN": {
                name: "Soporte Central Auryx",
                role: "admin"
              }
            },
            lastMessage: "Contacto inicial de comercio",
            lastActivity: serverTimestamp(),
            unreadCountAdmin: 0,
            unreadCountUser: 0,
            supportType: "MERCHANT"
          });
        }

        // Suscribirse a mensajes
        const q = query(
          collection(db, "chats", id, "messages"),
          orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
          setMessages(msgs);
          setLoading(false);
          setTimeout(() => scrollToBottom(), 100);
          
          // Marcar como leídos por el usuario
          updateDoc(chatRef, { unreadCountUser: 0 });
        });

        return () => unsubscribe();
      }
    });

    return () => unsubAuth();
  }, []);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !auth.currentUser) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: auth.currentUser.uid,
        text,
        createdAt: serverTimestamp(),
        read: false,
        senderRole: 'merchant'
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: text,
        lastActivity: serverTimestamp(),
        unreadCountAdmin: increment(1)
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-10rem)] flex flex-col bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="p-6 bg-gray-950/50 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Headset className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Centro de Ayuda</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-sm text-gray-500 font-medium">Soporte técnico en línea</p>
            </div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">PROMEDIO DE RESPUESTA</span>
            <div className="flex items-center gap-2 text-indigo-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">2-5 minutos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent scrollbar-hide"
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
            <Headset className="w-16 h-16 text-gray-700 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">¡Hola! ¿Necesitas asistencia?</h3>
            <p className="text-gray-500 text-sm max-w-xs">Envíanos un mensaje sobre facturación, pedidos o problemas técnicos.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === auth.currentUser?.uid || msg.senderRole === 'merchant';
            return (
              <div 
                key={msg.id} 
                className={cn(
                  "flex animate-in slide-in-from-bottom-2 duration-300",
                  isMe ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[80%] flex flex-col",
                  isMe ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "px-5 py-3 rounded-2xl text-sm shadow-xl",
                    isMe 
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10" 
                      : "bg-gray-800 text-gray-200 rounded-tl-none shadow-black/20"
                  )}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 px-2">
                    <span className="text-[10px] font-medium text-gray-500">
                      {msg.createdAt ? format(msg.createdAt.toDate(), "HH:mm") : "..."}
                    </span>
                    {isMe && (
                      <CheckCheck className={cn("w-3.5 h-3.5", msg.read ? "text-indigo-400" : "text-gray-600")} />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-gray-950/50 border-t border-gray-800">
        <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Describe tu consulta..." 
            className="flex-1 bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 outline-none transition-all shadow-inner"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-indigo-600/30 active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
