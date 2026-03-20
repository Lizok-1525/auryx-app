import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NativeMap(props: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>[ MAPA EN VIVO - RUTA DEL REPARTIDOR ]</Text>
      <Text style={styles.subtext}>(Google Maps activo para versión Móvil)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A2B4C', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#8ec3b9', fontWeight: 'bold' },
  subtext: { color: '#64779e', marginTop: 8 }
});
