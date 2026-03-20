import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthStore } from '../store/authStore';
import { theme } from '../lib/theme';
import AnimatedButton from '../components/AnimatedButton';
import Animated, { FadeInUp, FadeInDown, SlideInDown } from 'react-native-reanimated';
import { ActivityIndicator } from 'react-native';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore(state => state.setUser);

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (isRegistering) {
        if (!name || !phone || !email || !password) {
          throw new Error('Todos los campos son obligatorios');
        }
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          role: "client",
          fullName: name,
          phone: phone,
          points: 0,
          createdAt: new Date()
        });
        setUser(userCred.user);
      } else {
        if (!email || !password) {
          throw new Error('Debe ingresar correo y contraseña');
        }
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        const docSnap = await getDoc(doc(db, "users", userCred.user.uid));
        if (docSnap.exists() && docSnap.data().role === "client") {
          setUser(userCred.user);
        } else {
          await auth.signOut();
          setError("Cuenta inválida o rol incorrecto. Descarga la App de Repartidor si eres un Courier.");
        }
      }
    } catch (e: any) {
      if (e.code === 'auth/invalid-credential') {
        setError("Credenciales incorrectas.");
      } else if (e.code === 'auth/email-already-in-use') {
        setError("Este correo ya está registrado.");
      } else {
        setError(e.message || "Error al autenticar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Background elements */}
      <View style={styles.bgCircleTop} />
      <View style={styles.bgCircleBottom} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <Animated.View entering={FadeInUp.duration(800).delay(200)} style={styles.header}>
          {/* Logo representation - Auryx Text since we cant easily load the local image yet without requiring it */}
          <Text style={styles.logoText}>AURY<Text style={styles.logoTextAccent}>X</Text></Text>
          <Text style={styles.subtitle}>{isRegistering ? "Un mundo de entregas, rápido y seguro." : "Bienvenido de nuevo."}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(800).delay(400)} style={styles.glassCard}>
          <Text style={styles.cardTitle}>{isRegistering ? "Crear cuenta" : "Iniciar Sesión"}</Text>
          
          {error ? (
            <Animated.View entering={SlideInDown.duration(300)} style={styles.errorBox}>
               <Text style={styles.error}>{error}</Text>
            </Animated.View>
          ) : null}

          {isRegistering && (
            <>
              <TextInput style={styles.input} placeholder="Nombres" placeholderTextColor={theme.colors.textMuted} value={name} onChangeText={setName} />
              <TextInput style={styles.input} placeholder="Teléfono" placeholderTextColor={theme.colors.textMuted} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            </>
          )}

          <TextInput 
            style={styles.input} 
            placeholder="Correo electrónico" 
            placeholderTextColor={theme.colors.textMuted} 
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Contraseña" 
            placeholderTextColor={theme.colors.textMuted} 
            secureTextEntry 
            value={password} 
            onChangeText={setPassword}
          />

          <View style={styles.buttonWrapper}>
            <AnimatedButton 
              title={isRegistering ? "Comenzar ahora" : "Ingresar"} 
              onPress={handleAuth} 
              loading={loading}
            />
          </View>
          
        </Animated.View>
        
        <Animated.View entering={FadeInUp.duration(800).delay(600)} style={styles.footer}>
            <AnimatedButton 
              title={isRegistering ? "¿Ya tienes cuenta? Ingresa aquí" : "¿Eres nuevo? Crea una cuenta"} 
              onPress={() => {
                setIsRegistering(!isRegistering);
                setError('');
              }} 
              variant="outline"
              disabled={loading}
              style={{marginTop: 16}}
            />
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  bgCircleTop: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primary,
    opacity: 0.15,
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: theme.colors.secondary,
    opacity: 0.3,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 2,
  },
  logoTextAccent: {
    color: theme.colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  glassCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  input: { 
    backgroundColor: theme.colors.surface, 
    borderWidth: 1, 
    borderColor: theme.colors.surfaceLight, 
    borderRadius: theme.borderRadius.md, 
    padding: theme.spacing.md, 
    color: theme.colors.text, 
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderColor: theme.colors.danger,
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
  },
  error: { 
    color: theme.colors.danger, 
  },
  buttonWrapper: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  }
});
