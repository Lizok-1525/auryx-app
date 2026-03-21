import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from './src/store/authStore';
import { Store, Map as MapIcon, Compass } from 'lucide-react-native';
import { theme } from './src/lib/theme';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import LoginScreen from './src/screens/LoginScreen';
import ShopScreen from './src/screens/ShopScreen';
import PrivateDeliveryScreen from './src/screens/PrivateDeliveryScreen';
import ActiveOrderScreen from './src/screens/ActiveOrderScreen';

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
    </Tab.Navigator>
  );
}

export default function App() {
  const { user } = useAuthStore();

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
