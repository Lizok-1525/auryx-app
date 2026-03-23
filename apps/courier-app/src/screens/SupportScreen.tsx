import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc,
  increment,
  setDoc,
  getDoc
} from 'firebase/firestore';
import { Send, Headset } from 'lucide-react-native';
import { theme } from '@/src/lib/theme';

export default function SupportScreen() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const currentUserId = auth.currentUser.uid;
    const id = [currentUserId, "ADMIN"].sort().join("_"); 
    setChatId(id);

    const chatRef = doc(db, "chats", id);
    getDoc(chatRef).then(async (docSnap) => {
      if (!docSnap.exists()) {
        const userDoc = await getDoc(doc(db, "users", currentUserId));
        const userData = userDoc.data();
        await setDoc(chatRef, {
          id: id,
          participants: [currentUserId, "ADMIN"],
          participantDetails: {
            [currentUserId]: {
              name: userData?.fullName || "Repartidor",
              role: "courier"
            },
            "ADMIN": {
              name: "Soporte Auryx",
              role: "admin"
            }
          },
          lastMessage: "Chat de soporte para repartidores iniciado",
          lastActivity: serverTimestamp(),
          unreadCountAdmin: 0,
          unreadCountUser: 0,
          supportType: "COURIER"
        });
      }
    });

    const q = query(
      collection(db, "chats", id, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      setLoading(false);
      updateDoc(chatRef, { unreadCountUser: 0 });
    });

    return () => unsubscribe();
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !auth.currentUser) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: auth.currentUser.uid,
        text,
        createdAt: serverTimestamp(),
        read: false,
        senderRole: 'courier'
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

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === auth.currentUser?.uid || item.senderRole === 'courier';
    return (
      <View style={[styles.messageContainer, isMe ? styles.myMessage : styles.theirMessage]}>
        {!isMe && (
          <View style={styles.avatar}>
            <Headset size={14} color={theme.colors.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
          <Text style={[styles.messageText, isMe ? styles.myText : styles.theirText]}>{item.text}</Text>
          <Text style={styles.timeText}>{item.createdAt?.toDate ? item.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <View style={styles.supportIcon}>
            <Headset color={theme.colors.primary} size={20} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Soporte Logística</Text>
            <Text style={styles.headerStatus}>Asistencia en tiempo real</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        {loading ? (
          <View style={styles.loading}><ActivityIndicator size="small" color={theme.colors.primary} /></View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Headset size={48} color={theme.colors.surfaceLight} strokeWidth={1} />
                <Text style={styles.emptyTitle}>¿Algún problema con un pedido?</Text>
                <Text style={styles.emptySubtitle}>Contáctanos si necesitas ayuda con la entrega o la aplicación.</Text>
              </View>
            }
          />
        )}
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="Escribe tu mensaje..." placeholderTextColor={theme.colors.textMuted} value={newMessage} onChangeText={setNewMessage} multiline />
            <TouchableOpacity onPress={sendMessage} disabled={!newMessage.trim()} style={[styles.sendButton, !newMessage.trim() && { opacity: 0.5 }]}>
              <Send color="#fff" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: theme.colors.surfaceLight, backgroundColor: theme.colors.surface },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center' },
  supportIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.text },
  headerStatus: { fontSize: 11, color: theme.colors.success, fontWeight: '600', marginTop: 2 },
  chatArea: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: 20, paddingBottom: 10 },
  messageContainer: { flexDirection: 'row', marginBottom: 16, maxWidth: '85%' },
  myMessage: { alignSelf: 'flex-end' },
  theirMessage: { alignSelf: 'flex-start' },
  avatar: { width: 28, height: 28, borderRadius: 10, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginTop: 4 },
  messageBubble: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  myBubble: { backgroundColor: theme.colors.primary, borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: theme.colors.surface, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: theme.colors.surfaceLight, borderStyle: 'solid' },
  messageText: { fontSize: 14, lineHeight: 20 },
  myText: { color: '#fff' },
  theirText: { color: theme.colors.text },
  timeText: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 4, textAlign: 'right' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text, marginTop: 20 },
  emptySubtitle: { fontSize: 14, color: theme.colors.textMuted, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 },
  inputArea: { padding: 15, paddingBottom: Platform.OS === 'ios' ? 10 : 20, borderTopWidth: 1, borderTopColor: theme.colors.surfaceLight, backgroundColor: theme.colors.surface },
  inputWrapper: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: theme.colors.background, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  input: { flex: 1, color: theme.colors.text, fontSize: 14, maxHeight: 100, paddingTop: Platform.OS === 'ios' ? 8 : 4, paddingBottom: Platform.OS === 'ios' ? 8 : 4 },
  sendButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 8, marginBottom: 2 }
});
