import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { LogOut, MapPin, Package, Headset } from 'lucide-react-native';
import { ActivityIndicator } from 'react-native';

export default function HomeScreen({ navigation }: any) {
  const { user, isActive, setIsActive } = useAuthStore();
  const [courierName, setCourierName] = React.useState('Cargando...');
  
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsActive(data.isActive || false);
        setCourierName(data.fullName || 'Repartidor');
      }
    });
    return () => unsub();
  }, [user]);

  const toggleActive = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), { isActive: !isActive });
    } catch {
      Alert.alert("Error", "No se pudo actualizar tu estado");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Profile */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hola, {courierName}</Text>
          <Text style={styles.statusText}>{isActive ? "🟢 En Línea y Recibiendo Pedidos" : "🔴 Desconectado"}</Text>
        </View>
        <TouchableOpacity onPress={() => auth.signOut()} style={styles.logoutBtn}>
          <LogOut color="#ef4444" size={24} />
        </TouchableOpacity>
      </View>

      {/* Rueda de Actividad */}
      <View style={styles.switchCard}>
        <Text style={styles.switchLabel}>Disponibilidad</Text>
        <Switch value={isActive} onValueChange={toggleActive} trackColor={{ false: '#334155', true: '#10b981' }} thumbColor="#fff" />
      </View>

      {/* Grid Menu */}
      <View style={styles.grid}>
        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Tracking")}>
          <View style={[styles.iconBox, { backgroundColor: '#10b98120' }]}>
            <MapPin color="#10b981" size={32} />
          </View>
          <Text style={styles.gridItemText}>Ir al Mapa</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridItem} onPress={() => navigation.navigate("Support")}>
          <View style={[styles.iconBox, { backgroundColor: '#8b5cf620' }]}>
            <Headset color="#8b5cf6" size={32} />
          </View>
          <Text style={styles.gridItemText}>Soporte</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.gridItem}>
           <View style={[styles.iconBox, { backgroundColor: '#6366f120' }]}>
              <Package color="#6366f1" size={32} />
           </View>
           <Text style={styles.gridItemText}>Historial</Text>
        </TouchableOpacity>
      </View>

      {isActive && (
        <View style={styles.searchBanner}>
          <ActivityIndicator color="#10b981" />
          <Text style={styles.searchBannerText}>Buscando pedidos cercanos...</Text>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a', padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  statusText: { color: '#94a3b8', fontSize: 14, marginTop: 4 },
  logoutBtn: { padding: 8, backgroundColor: '#ef444415', borderRadius: 12 },
  switchCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e293b', padding: 20, borderRadius: 16, marginBottom: 32 },
  switchLabel: { color: '#fff', fontSize: 18, fontWeight: '600' },
  grid: { flexDirection: 'row', justifyContent: 'flex-start', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '48%', backgroundColor: '#1e293b', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  iconBox: { padding: 16, borderRadius: 20, marginBottom: 12 },
  gridItemText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  searchBanner: { position: 'absolute', bottom: 40, left: 24, right: 24, backgroundColor: '#064e3b', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  searchBannerText: { color: '#34d399', marginLeft: 12, fontWeight: '500' }
});
