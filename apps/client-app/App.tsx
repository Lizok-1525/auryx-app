import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './src/lib/firebase';
import { useAuthStore } from './src/store/authStore';
import { Store, Map as MapIcon, Compass, Headset } from 'lucide-react-native';
import { theme } from './src/lib/theme';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './src/screens/LoginScreen';
import ShopScreen from './src/screens/ShopScreen';
import PrivateDeliveryScreen from './src/screens/PrivateDeliveryScreen';
import ActiveOrderScreen from './src/screens/ActiveOrderScreen';
import SupportScreen from './src/screens/SupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MyTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: theme.colors.primary,
    background: theme.colors.background,
    card: theme.colors.surface,
    text: theme.colors.text,
    border: theme.colors.surfaceLight,
    notification: theme.colors.primary,
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { 
          height: 65, 
          paddingBottom: 10, 
          paddingTop: 10, 
          backgroundColor: theme.colors.surface, 
          borderTopWidth: 1, 
          borderTopColor: theme.colors.surfaceLight,
          elevation: 0,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        }
      }}
    >
      <Tab.Screen 
        name="Tienda" 
        component={ShopScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="Mi Envío P2P" 
        component={PrivateDeliveryScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="Seguimiento" 
        component={ActiveOrderScreen} 
        options={{ tabBarIcon: ({ color, size }) => <MapIcon color={color} size={size} /> }} 
      />
      <Tab.Screen 
        name="Soporte" 
        component={SupportScreen} 
        options={{ tabBarIcon: ({ color, size }) => <Headset color={color} size={size} /> }} 
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { user, setUser, loading, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        if (currentUser) {
          if (!user || user.uid !== currentUser.uid) {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists() && userDoc.data().role === "client") {
              setUser(currentUser);
            } else {
              await signOut(auth);
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth sync error (Client App):", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setLoading, user]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={MyTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background }}}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <Stack.Screen name="Main" component={MainTabs} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
