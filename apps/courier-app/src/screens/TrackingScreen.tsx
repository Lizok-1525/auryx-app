import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';

export default function TrackingScreen({ navigation }: any) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [orderStatus, setOrderStatus] = useState(1); // 1: Esperando, 2: Recogido, 3: Entregado
  const [otpCode, setOtpCode] = useState('');
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'El mapa requiere acceso a tu ubicación');
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      
      // En un entorno real, aquí inicializaríamos Location.watchPositionAsync
      // para actualizar Firestore cada pocos segundos.
    })();
  }, []);

  const handleAdvanceStatus = () => {
    if (orderStatus === 1) {
      setOrderStatus(2); // Pasar a Recogido
    } else if (orderStatus === 2) {
      setIsOtpModalVisible(true); // Pedir código para Entregar
    }
  };

  const confirmDelivery = () => {
    // Validar OTP con base de datos real (Simulación temporal)
    if (otpCode.length === 4) {
      setOrderStatus(3);
      setIsOtpModalVisible(false);
      Alert.alert("¡Entregado!", "Pedido finalizado exitosamente.");
      navigation.goBack();
    } else {
      Alert.alert("Error", "Código incorrecto");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <ArrowLeft color="#1f2937" size={24} />
      </TouchableOpacity>

      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
           {/* Marcador del destino (ejemplo estático) */}
           <Marker coordinate={{ latitude: location.coords.latitude + 0.01, longitude: location.coords.longitude + 0.01 }} pinColor="green" />
        </MapView>
      ) : (
        <View style={styles.loadingMap}><ActivityIndicator color="#10b981" /></View>
      )}

      {/* Panel inferior de acción */}
      <View style={styles.bottomSheet}>
        <View style={styles.orderInfo}>
           <Text style={styles.clientName}>Pedido: Juan Cliente</Text>
           <Text style={styles.address}>Av. Siempreviva 123</Text>
        </View>

        <TouchableOpacity 
          style={[styles.actionBtn, orderStatus === 2 ? styles.btnDeliver : styles.btnPickup]} 
          onPress={handleAdvanceStatus}
        >
           <Text style={styles.btnText}>
             {orderStatus === 1 ? "Marcar como Recogido" : orderStatus === 2 ? "Marcar como Entregado" : "Finalizado"}
           </Text>
        </TouchableOpacity>
      </View>

      {/* Modal simulado nativo en vista para el OTP */}
      {isOtpModalVisible && (
        <View style={styles.otpOverlay}>
          <View style={styles.otpCard}>
            <Text style={styles.otpTitle}>Código de Seguridad</Text>
            <Text style={styles.otpDesc}>Pídele al cliente el PIN de 4 dígitos generado en su App para cerrar la orden.</Text>
            
            <TextInput
               style={styles.otpInput}
               keyboardType="number-pad"
               maxLength={4}
               value={otpCode}
               onChangeText={setOtpCode}
               placeholder="1234"
            />
            
            <View style={styles.otpActions}>
              <TouchableOpacity onPress={() => setIsOtpModalVisible(false)}><Text style={{ color: '#ef4444', padding: 10 }}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity onPress={confirmDelivery} style={styles.otpConfirm}><Text style={{ color: '#fff', fontWeight: 'bold' }}>Confirmar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  map: { width: '100%', height: '100%' },
  loadingMap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { position: 'absolute', top: 50, left: 20, zIndex: 10, backgroundColor: '#fff', padding: 10, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  bottomSheet: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  orderInfo: { marginBottom: 20 },
  clientName: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  address: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  actionBtn: { padding: 18, borderRadius: 16, alignItems: 'center' },
  btnPickup: { backgroundColor: '#3b82f6' },
  btnDeliver: { backgroundColor: '#10b981' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  otpOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  otpCard: { width: '85%', backgroundColor: '#fff', borderRadius: 24, padding: 24, alignItems: 'center' },
  otpTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937', marginBottom: 8 },
  otpDesc: { fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 24 },
  otpInput: { width: '100%', backgroundColor: '#f3f4f6', fontSize: 32, textAlign: 'center', padding: 16, borderRadius: 12, letterSpacing: 8, marginBottom: 24 },
  otpActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', alignItems: 'center' },
  otpConfirm: { backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 }
});
