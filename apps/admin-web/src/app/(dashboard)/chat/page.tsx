"use client";

import { useEffect, useState, useRef } from "react";
import { db, auth } from "@/lib/firebase";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  orderBy, 
  limit, 
  getDocs,
  setDoc,
  increment,
  writeBatch
} from "firebase/firestore";
import { 
  MessageSquare, 
  Send, 
  User as UserIcon, 
  Search, 
  Plus, 
  X,
  CheckCheck,
  MoreVertical,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Chat {
  id: string;
  participants: string[];
  participantDetails: {
    [key: string]: {
      name: string;
      role: string;
      photoUrl?: string;
    };
  };
  lastMessage: string;
  lastActivity: any;
  unreadCountAdmin: number;
  unreadCountUser: number;
  supportType: 'CLIENT' | 'COURIER' | 'MERCHANT';
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: any;
  read: boolean;
  senderRole?: string;
}

export default function ChatSupportPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [userSearchText, setUserSearchText] = useState("");
  const [foundUsers, setFoundUsers] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscripción a los chats activos
  useEffect(() => {
    const q = query(
      collection(db, "chats"),
      orderBy("lastActivity", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscripción a los mensajes del chat seleccionado
  useEffect(() => {
    if (!selectedChat) return;

    const q = query(
      collection(db, "chats", selectedChat.id, "messages"),
      orderBy("createdAt", "asc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
      setTimeout(() => scrollToBottom(), 100);
      markAsRead(selectedChat.id);
    });

    return () => unsubscribe();
  }, [selectedChat]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const markAsRead = async (chatId: string) => {
    try {
      await updateDoc(doc(db, "chats", chatId), {
        unreadCountAdmin: 0
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !auth.currentUser) return;

    const text = newMessage.trim();
    setNewMessage("");

    try {
      const chatRef = doc(db, "chats", selectedChat.id);
      const messagesRef = collection(db, "chats", selectedChat.id, "messages");

      await addDoc(messagesRef, {
        senderId: auth.currentUser.uid,
        text,
        createdAt: serverTimestamp(),
        read: false,
        senderRole: 'admin'
      });

      await updateDoc(chatRef, {
        lastMessage: text,
        lastActivity: serverTimestamp(),
        unreadCountUser: increment(1)
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const searchUsers = async () => {
    if (!userSearchText.trim()) return;
    setSearchLoading(true);
    try {
      const q = query(
        collection(db, "users"),
        where("fullName", ">=", userSearchText),
        where("fullName", "<=", userSearchText + '\uf8ff'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFoundUsers(users);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const startNewChat = async (user: any) => {
    if (!auth.currentUser) return;

    // Verificar si ya existe un chat con este usuario
    const existingChat = chats.find(c => c.participants.includes(user.id));
    if (existingChat) {
      setSelectedChat(existingChat);
      setIsNewChatModalOpen(false);
      return;
    }

    try {
      const chatId = [user.id, "ADMIN"].sort().join("_");
      const chatData: Chat = {
        id: chatId,
        participants: [user.id, "ADMIN"],
        participantDetails: {
          ["ADMIN"]: {
            name: "Soporte Central Auryx",
            role: "admin"
          },
          [user.id]: {
            name: user.fullName || "Usuario",
            role: user.role || "client"
          }
        },
        lastMessage: "Conversation started",
        lastActivity: serverTimestamp(),
        unreadCountAdmin: 0,
        unreadCountUser: 0,
        supportType: user.role.toUpperCase() as any
      };

      await setDoc(doc(db, "chats", chatId), chatData);
      setSelectedChat(chatData);
      setIsNewChatModalOpen(false);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  const getOtherParticipant = (chat: Chat) => {
    if (!auth.currentUser) return { name: "Usuario", role: "..." };
    const otherId = chat.participants.find(id => id !== auth.currentUser?.uid);
    return chat.participantDetails[otherId || ""] || { name: "Usuario", role: "..." };
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Lista de Chats (Sidebar) */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 border-r border-gray-800 bg-gray-950 flex flex-col",
        selectedChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <MessageSquare className="w-6 h-6 mr-3 text-indigo-500"/>
              Soporte
            </h2>
            <button 
              onClick={() => setIsNewChatModalOpen(true)}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar conversaciones..."
              className="w-full bg-gray-900 border border-gray-800 rounded-[20px] py-2.5 pl-11 pr-4 text-sm text-gray-300 focus:border-indigo-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          {loading ? (
            <div className="flex justify-center p-8">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : chats.length === 0 ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 text-sm font-medium">No hay chats activos</p>
              <p className="text-xs text-gray-600 mt-2">Inicia una conversación con un usuario para empezar.</p>
            </div>
          ) : (
            chats.map((chat) => {
              const other = getOtherParticipant(chat);
              const isActive = selectedChat?.id === chat.id;
              
              return (
                <div 
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={cn(
                    "p-4 rounded-[24px] cursor-pointer transition-all duration-200 border relative group",
                    isActive 
                      ? "bg-indigo-600/10 border-indigo-500/30 ring-1 ring-indigo-500/20" 
                      : "bg-transparent border-transparent hover:bg-gray-800/40 hover:border-gray-800"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform group-hover:scale-105",
                        isActive ? "bg-indigo-600/20 border-indigo-500/30" : "bg-gray-800 border-gray-700"
                      )}>
                        <UserIcon className={cn("w-6 h-6", isActive ? "text-indigo-400" : "text-gray-500")} />
                      </div>
                      {chat.unreadCountAdmin > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-4 ring-gray-950">
                          {chat.unreadCountAdmin}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className={cn("text-sm font-bold truncate", isActive ? "text-white" : "text-gray-200")}>
                          {other.name}
                        </h3>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap ml-2">
                          {chat.lastActivity ? format(chat.lastActivity.toDate(), "HH:mm") : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className={cn("text-xs truncate max-w-[150px]", chat.unreadCountAdmin > 0 ? "text-indigo-300 font-bold" : "text-gray-500")}>
                          {chat.lastMessage}
                        </p>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                          chat.supportType === 'COURIER' ? "bg-amber-500/10 text-amber-500" :
                          chat.supportType === 'MERCHANT' ? "bg-emerald-500/10 text-emerald-500" :
                          "bg-blue-500/10 text-blue-500"
                        )}>
                          {chat.supportType}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Área de Mensajes */}
      <div className={cn(
        "flex-1 flex flex-col bg-gray-900 overflow-hidden",
        !selectedChat ? "hidden md:flex" : "flex"
      )}>
        {selectedChat ? (
          <>
            <div className="p-5 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-gray-800 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white text-base font-bold leading-tight">
                    {getOtherParticipant(selectedChat).name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-gray-500 capitalize">{getOtherParticipant(selectedChat).role}</span>
                  </div>
                </div>
              </div>
              <button className="p-2.5 hover:bg-gray-800 rounded-xl transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              className="flex-1 p-6 overflow-y-auto space-y-6 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent scroll-smooth"
            >
              <div className="flex justify-center p-8">
                <p className="text-[11px] font-bold text-gray-600 bg-gray-800/30 px-4 py-1.5 rounded-full uppercase tracking-widest border border-gray-800/50">
                  Inicio de conversación — {selectedChat.lastActivity && format(selectedChat.lastActivity.toDate(), "dd MMM, yyyy", { locale: es })}
                </p>
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderId === auth.currentUser?.uid || msg.senderRole === 'admin';
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex group animate-in slide-in-from-bottom-2 duration-300",
                      isMe ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "max-w-md relative flex flex-col",
                      isMe ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-6 py-3.5 rounded-[28px] text-sm shadow-xl",
                        isMe 
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-600/10" 
                          : "bg-gray-800 text-gray-200 rounded-tl-none shadow-black/20"
                      )}>
                        {msg.text}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 px-2">
                        <span className="text-[10px] font-medium text-gray-500">
                          {msg.createdAt ? format(msg.createdAt.toDate(), "HH:mm") : ""}
                        </span>
                        {isMe && (
                          <CheckCheck className={cn("w-3.5 h-3.5", msg.read ? "text-indigo-400" : "text-gray-600")} />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-gray-950/50 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex gap-4 items-center">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Escribe un mensaje aquí..." 
                    className="w-full bg-gray-900 border border-gray-800 rounded-[28px] pl-6 pr-14 py-4 text-sm text-gray-100 placeholder-gray-600 focus:border-indigo-500/50 outline-none transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
                      <Plus className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full flex items-center justify-center transition-all shadow-xl shadow-indigo-600/30 active:scale-95 group"
                >
                  <Send className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-transparent to-transparent">
            <div className="w-24 h-24 bg-gray-800/50 rounded-[40px] flex items-center justify-center mb-8 border border-gray-700 animate-pulse">
              <MessageSquare className="w-12 h-12 text-indigo-500/40" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Centro de Soporte Auryx</h3>
            <p className="text-gray-400 max-w-sm mb-8">
              Selecciona una conversación del panel lateral para gestionar la asistencia en tiempo real.
            </p>
            <button 
              onClick={() => setIsNewChatModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-[24px] font-bold text-sm tracking-tight transition-all shadow-2xl shadow-indigo-600/20 active:scale-95 flex items-center"
            >
              <Plus className="w-5 h-5 mr-3" />
              Nueva Conversación
            </button>
          </div>
        )}
      </div>

      {/* Modal - Nueva Conversación */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300" 
            onClick={() => setIsNewChatModalOpen(false)}
          ></div>
          <div className="relative bg-gray-900 border border-gray-800 w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Iniciar Conversación</h2>
                  <p className="text-gray-400 text-sm mt-1">Busca a un usuario para darle soporte.</p>
                </div>
                <button 
                  onClick={() => setIsNewChatModalOpen(false)} 
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-2xl transition-all active:scale-90"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="relative mb-8">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  autoFocus
                  type="text" 
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                  onKeyUp={(e) => e.key === 'Enter' && searchUsers()}
                  placeholder="Nombre del usuario..."
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-[28px] py-5 pl-16 pr-24 text-white font-medium placeholder-gray-600 focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
                <button 
                  onClick={searchUsers}
                  disabled={searchLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {searchLoading ? "..." : "Buscar"}
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
                {foundUsers.map((user) => (
                  <div 
                    key={user.id}
                    onClick={() => startNewChat(user)}
                    className="p-5 bg-gray-800/30 hover:bg-indigo-600/10 border border-transparent hover:border-indigo-500/30 rounded-[32px] cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-700 flex items-center justify-center border border-gray-600 group-hover:border-indigo-500/50 transition-colors">
                        <UserIcon className="w-6 h-6 text-gray-400 group-hover:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.fullName}</p>
                        <p className="text-xs text-gray-500 font-medium capitalize">{user.role}</p>
                      </div>
                    </div>
                    <ChevronLeft className="w-5 h-5 text-gray-700 group-hover:text-indigo-500 rotate-180 transition-all group-hover:translate-x-1" />
                  </div>
                ))}
                
                {foundUsers.length === 0 && userSearchText && !searchLoading && (
                  <p className="text-center py-12 text-gray-500 text-sm italic">No se encontraron usuarios con ese nombre.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
