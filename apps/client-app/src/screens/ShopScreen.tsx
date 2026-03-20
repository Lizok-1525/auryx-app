import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Dimensions } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Wallet, Search, MapPin, Store, ChevronRight, Star } from 'lucide-react-native';
import { theme } from '../lib/theme';
import Animated, { FadeInRight, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import AnimatedButton from '../components/AnimatedButton';

const { width } = Dimensions.get('window');

export default function ShopScreen({ navigation }: any) {
  const { user, points, setPoints } = useAuthStore();
  const [userName, setUserName] = React.useState('Cargando...');
  
  const shops = [
    { id: '1', name: 'Auryx Premium Burgers', type: 'Comida Rápida', status: 'Abierto', rating: 4.9, time: '15-20 min' },
    { id: '2', name: 'Farmacia 24H', type: 'Salud', status: 'Abierto', rating: 4.8, time: '10 min' },
    { id: '3', name: 'Fresh Market', type: 'Víveres', status: 'Cerrado', rating: 4.6, time: '-' },
  ];

  const categories = [
    { id: 'c1', name: 'Restaurantes', icon: '🍔' },
    { id: 'c2', name: 'Supermercados', icon: '🛒' },
    { id: 'c3', name: 'Farmacias', icon: '💊' },
    { id: 'c4', name: 'Paquetería', icon: '📦' },
  ];

  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserName(data.fullName?.split(" ")[0] || 'Cliente');
        setPoints(data.points || 0);
      }
    });
    return () => unsub();
  }, [user]);

  return (
    <View style={styles.container}>
      <View style={styles.bgGlow} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header Profile & Points */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <View>
            <Text style={styles.greetingHeader}>Entregando a</Text>
            <View style={styles.locationContainer}>
              <Text style={styles.locationText}>Mi Ubicación Actual</Text>
              <ChevronRight color={theme.colors.primary} size={20} />
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.7} style={styles.profileBadge}>
            <View style={styles.pointsPill}>
              <Text style={styles.pointsText}>{points} pts</Text>
            </View>
            <View style={styles.avatar}>
               <Text style={styles.avatarInitial}>{userName.charAt(0)}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text entering={FadeInDown.duration(600).delay(100)} style={styles.greeting}>
          Hola, <Text style={styles.greetingName}>{userName}</Text>
        </Animated.Text>

        {/* Search */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.searchContainer}>
          <Search color={theme.colors.textMuted} size={20} style={styles.searchIcon} />
          <TextInput 
            placeholder="¿Qué se te antoja hoy?" 
            placeholderTextColor={theme.colors.textMuted}
            style={styles.searchInput}
          />
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories.map((cat, index) => (
              <Animated.View key={cat.id} entering={FadeInRight.delay(300 + (index * 100))}>
                <TouchableOpacity style={styles.catCard}>
                  <View style={styles.catIconContainer}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.Text entering={FadeInDown.duration(600).delay(400)} style={styles.sectionTitle}>
          Cerca de ti <Text style={styles.sectionTitleAccent}>✨</Text>
        </Animated.Text>

        {/* Grid Tiendas */}
        <View style={styles.grid}>
          {shops.map((shop, index) => (
            <Animated.View key={shop.id} entering={FadeInDown.duration(600).delay(400 + (index * 100))}>
              <TouchableOpacity style={styles.shopCard} activeOpacity={0.8}>
                
                <View style={styles.shopImagePlaceholder}>
                   {/* Replace with actual shop images, gradient for now */}
                   <View style={styles.shopImageGradient}>
                     <Store color={theme.colors.secondary} size={32} />
                   </View>
                   {shop.status === 'Cerrado' && <View style={styles.closedOverlay}><Text style={styles.closedText}>Cerrado</Text></View>}
                </View>

                <View style={styles.shopInfo}>
                  <View style={styles.shopMetaRow}>
                    <Text style={styles.shopName} numberOfLines={1}>{shop.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Star color={theme.colors.primary} size={12} fill={theme.colors.primary} />
                      <Text style={styles.ratingText}>{shop.rating}</Text>
                    </View>
                  </View>

                  <Text style={styles.shopType}>{shop.type}</Text>
                  
                  <View style={styles.shopFooter}>
                    <Text style={styles.deliveryTime}>{shop.time}</Text>
                    <View style={styles.dot} />
                    <Text style={styles.deliveryFee}>Envío $1.99</Text>
                  </View>
                </View>

              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  bgGlow: { position: 'absolute', top: -100, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.primary, opacity: 0.1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 100 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  greetingHeader: { color: theme.colors.primary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { color: theme.colors.text, fontSize: 18, fontWeight: 'bold' },
  
  profileBadge: { flexDirection: 'row', alignItems: 'center' },
  pointsPill: { backgroundColor: 'rgba(220,165,34,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: 'rgba(220,165,34,0.3)' },
  pointsText: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 13 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: theme.colors.primary },
  avatarInitial: { color: theme.colors.primary, fontWeight: 'bold', fontSize: 18 },

  greeting: { fontSize: 32, color: theme.colors.text, fontWeight: '300', marginBottom: 24 },
  greetingName: { fontWeight: 'bold', color: theme.colors.text },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: theme.colors.glassBorder, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  searchIcon: { marginRight: 12 },
  searchInput: { flex: 1, color: theme.colors.text, fontSize: 16 },

  categoriesContainer: { flexDirection: 'row', marginBottom: 32 },
  catCard: { alignItems: 'center', marginRight: 20 },
  catIconContainer: { width: 64, height: 64, borderRadius: 24, backgroundColor: theme.colors.surfaceLight, justifyContent: 'center', alignItems: 'center', marginBottom: 8, borderWidth: 1, borderColor: theme.colors.glassBorder },
  catIcon: { fontSize: 28 },
  catName: { color: theme.colors.textMuted, fontSize: 13, fontWeight: '600' },

  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: theme.colors.text, marginBottom: 16 },
  sectionTitleAccent: { color: theme.colors.primary },

  grid: { gap: 20 },
  shopCard: { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.xl, padding: 12, flexDirection: 'row', borderWidth: 1, borderColor: theme.colors.glassBorder, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  
  shopImagePlaceholder: { width: 90, height: 90, borderRadius: theme.borderRadius.lg, overflow: 'hidden', marginRight: 16 },
  shopImageGradient: { flex: 1, backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center', opacity: 0.8 },
  closedOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  closedText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },

  shopInfo: { flex: 1, justifyContent: 'center' },
  shopMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  shopName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, flex: 1, paddingRight: 8 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#283d6a', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  ratingText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },

  shopType: { fontSize: 14, color: theme.colors.textMuted, marginBottom: 12 },
  
  shopFooter: { flexDirection: 'row', alignItems: 'center' },
  deliveryTime: { color: theme.colors.primary, fontSize: 13, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: theme.colors.textMuted, marginHorizontal: 8 },
  deliveryFee: { color: theme.colors.textMuted, fontSize: 13 }
});
