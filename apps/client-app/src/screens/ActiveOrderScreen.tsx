import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ShieldCheck, Phone, MessageSquare } from 'lucide-react-native';
import MapComponent from '../components/MapComponent';
import { theme } from '../lib/theme';
import { darkMapStyle } from '../lib/mapStyle';
import Animated, { FadeInDown, SlideInDown } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

export default function ActiveOrderScreen() {
  const [otp] = useState("4819");
  const [courierName] = useState("Roberto M.");
  const [statusText] = useState("En camino a destino");
  
  const initialRegion = {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapComponent 
        initialRegion={initialRegion}
        customMapStyle={darkMapStyle}
        markerCoordinate={{ latitude: 37.78825, longitude: -122.4324 }}
        markerColor={theme.colors.primary}
      />

      <Animated.View entering={SlideInDown.duration(600).springify()} style={styles.bottomSheet}>
         
         <View style={styles.statusBar}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>{statusText}</Text>
         </View>

         <View style={styles.courierInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>R</Text>
              <View style={styles.onlineBadge} />
            </View>
            <View style={styles.courierDetails}>
               <Text style={styles.courierName}>{courierName}</Text>
               <Text style={styles.courierMeta}>Auryx Pro Courier • ⭐ 4.9</Text>
            </View>
         </View>

         <View style={styles.actionsRow}>
           <Animated.View style={{flex: 1, marginRight: theme.spacing.md}}>
             <TouchableOpacity style={styles.actionBtnPrimary}>
               <Phone color={theme.colors.secondary} size={20} />
               <Text style={styles.actionBtnTextPrimary}>Llamar</Text>
             </TouchableOpacity>
           </Animated.View>

           <Animated.View style={{flex: 1}}>
             <TouchableOpacity style={styles.actionBtnSecondary}>
               <MessageSquare color={theme.colors.text} size={20} />
               <Text style={styles.actionBtnTextSecondary}>Mensaje</Text>
             </TouchableOpacity>
           </Animated.View>
         </View>

         <Animated.View entering={FadeInDown.delay(300)} style={styles.otpCard}>
            <View style={styles.otpHeader}>
               <ShieldCheck color={theme.colors.primary} size={20} />
               <Text style={styles.otpTitle}>Código de Recepción Segura</Text>
            </View>
            <Text style={styles.otpDesc}>Muestra este código al recibir para confirmar tu identidad.</Text>
            <Text style={styles.otpCode}>{otp}</Text>
         </Animated.View>
         
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  bottomSheet: { 
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: theme.borderRadius.xl, 
    padding: theme.spacing.lg, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.5, 
    shadowRadius: 20, 
    elevation: 20,
  },
  statusBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(220, 165, 34, 0.15)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 20, 
    marginBottom: 20 
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginRight: 8, shadowColor: theme.colors.primary, shadowOpacity: 0.6, shadowRadius: 5 },
  statusLabel: { color: theme.colors.primary, fontWeight: '700' },
  courierInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 2, borderColor: theme.colors.primary },
  avatarInitial: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary },
  onlineBadge: { position: 'absolute', bottom: 0, right: 0, width: 14, height: 14, backgroundColor: theme.colors.success, borderRadius: 7, borderWidth: 2, borderColor: theme.colors.glass },
  courierDetails: { flex: 1 },
  courierName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  courierMeta: { fontSize: 13, color: theme.colors.textMuted, marginTop: 4 },
  
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtnPrimary: { backgroundColor: theme.colors.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: theme.borderRadius.lg },
  actionBtnTextPrimary: { color: theme.colors.secondary, fontWeight: 'bold', marginLeft: 8, fontSize: 16 },
  
  actionBtnSecondary: { backgroundColor: theme.colors.surfaceLight, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: theme.borderRadius.lg, borderWidth: 1, borderColor: theme.colors.glassBorder },
  actionBtnTextSecondary: { color: theme.colors.text, fontWeight: 'bold', marginLeft: 8, fontSize: 16 },

  otpCard: { backgroundColor: 'rgba(26, 43, 76, 0.5)', borderRadius: theme.borderRadius.lg, padding: 16, borderWidth: 1, borderColor: theme.colors.surfaceLight, alignItems: 'center' },
  otpHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  otpTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginLeft: 8 },
  otpDesc: { fontSize: 12, color: theme.colors.textMuted, textAlign: 'center', marginBottom: 12, paddingHorizontal: 10 },
  otpCode: { fontSize: 36, letterSpacing: 16, fontWeight: '900', color: theme.colors.text }
});
