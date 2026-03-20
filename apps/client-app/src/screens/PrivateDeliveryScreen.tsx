import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Dimensions } from 'react-native';
import { Package, MapPin, ArrowRight } from 'lucide-react-native';
import { theme } from '../lib/theme';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import AnimatedButton from '../components/AnimatedButton';

const { width } = Dimensions.get('window');

export default function PrivateDeliveryScreen() {
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [details, setDetails] = useState('');
  
  const estimatedCost = 4.50; 

  const handleRequest = () => {
    if (!pickup || !dropoff || !details) {
      Alert.alert("AURYX", "Por favor ingresa correctamente las direcciones y detalles del paquete.");
      return;
    }
    Alert.alert("Buscando Repartidor", "Tu solicitud está siendo procesada de forma segura por Auryx.");
    setPickup(''); setDropoff(''); setDetails('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Text style={styles.title}>Envío <Text style={styles.titleAccent}>Privado</Text></Text>
          <Text style={styles.subtitle}>Conectamos tu punto A con el punto B de manera VIP.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.card}>
           <View style={styles.timeline}>
              <View style={styles.dotOrigin}/>
              <View style={styles.line}/>
              <View style={styles.dotDest}/>
           </View>
          
           <View style={styles.inputsColumn}>
              <View style={styles.inputGroup}>
                 <Text style={styles.label}>Recoger en...</Text>
                 <TextInput 
                  style={styles.input} 
                  placeholder="Ej: Mi oficina" 
                  placeholderTextColor={theme.colors.textMuted}
                  value={pickup} 
                  onChangeText={setPickup} 
                 />
              </View>
              <View style={[styles.inputGroup, { marginTop: 16 }]}>
                 <Text style={styles.label}>Entregar a...</Text>
                 <TextInput 
                  style={styles.input} 
                  placeholder="Ej: Casa de mi cliente" 
                  placeholderTextColor={theme.colors.textMuted}
                  value={dropoff} 
                  onChangeText={setDropoff} 
                 />
              </View>
           </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={[styles.card, { marginTop: 20 }]}>
           <View style={styles.inputGroupFull}>
              <View style={styles.inputHeader}>
                 <Package color={theme.colors.primary} size={20} />
                 <Text style={styles.labelWithIcon}>¿Qué desea enviar?</Text>
              </View>
              <TextInput 
                style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                placeholder="Ej: Documentos confidenciales, llaves..." 
                placeholderTextColor={theme.colors.textMuted}
                multiline 
                value={details} 
                onChangeText={setDetails} 
              />
           </View>
        </Animated.View>

        <Animated.View entering={SlideInUp.duration(500).delay(400)} style={styles.footerSummary}>
           <View>
              <Text style={styles.estimateLabel}>Costo Estimado</Text>
              <Text style={styles.estimateValue}>${estimatedCost.toFixed(2)}</Text>
           </View>
           <AnimatedButton 
             title="Solicitar Ahora" 
             onPress={handleRequest} 
             style={{width: 160}} 
           />
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  bgGlow: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.secondary, opacity: 0.3 },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 100 },
  
  header: { marginBottom: 32 },
  title: { fontSize: 36, fontWeight: '900', color: theme.colors.text, letterSpacing: -0.5 },
  titleAccent: { color: theme.colors.primary },
  subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 8, lineHeight: 24 },
  
  card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.glassBorder, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: {height: 10, width: 0}, elevation: 8, flexDirection: 'row' },
  
  timeline: { width: 30, alignItems: 'center', paddingTop: 30, paddingBottom: 30, marginRight: 8 },
  dotOrigin: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.text, borderWidth: 3, borderColor: theme.colors.background },
  dotDest: { width: 14, height: 14, borderRadius: 7, backgroundColor: theme.colors.primary, borderWidth: 3, borderColor: 'rgba(228, 150, 17, 0.2)' },
  line: { flex: 1, width: 2, backgroundColor: theme.colors.surfaceLight, marginVertical: 4 },
  
  inputsColumn: { flex: 1 },
  inputGroup: { width: '100%' },
  inputGroupFull: { width: '100%', paddingVertical: 4 },
  inputHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  
  label: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  labelWithIcon: { fontSize: 13, fontWeight: '700', color: theme.colors.textMuted, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 0 },
  
  input: { backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md, padding: 16, fontSize: 16, color: theme.colors.text, borderWidth: 1, borderColor: theme.colors.surfaceLight },
  
  footerSummary: { marginTop: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.glass, padding: 20, borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.glassBorder },
  estimateLabel: { color: theme.colors.textMuted, fontSize: 14, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '600', marginBottom: 4 },
  estimateValue: { color: theme.colors.primary, fontSize: 32, fontWeight: '900' }
});
