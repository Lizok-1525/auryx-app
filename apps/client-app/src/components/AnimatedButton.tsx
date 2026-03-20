import React from 'react';
import { StyleSheet, Text, ActivityIndicator } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { theme } from '../lib/theme';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function AnimatedButton({ title, onPress, loading, disabled, style, variant = 'primary' }: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const getBackgroundColor = () => {
    if (disabled) return '#334155';
    if (variant === 'secondary') return theme.colors.surfaceLight;
    if (variant === 'outline') return 'transparent';
    return theme.colors.primary;
  };

  const getTextColor = () => {
    if (disabled) return '#94a3b8';
    if (variant === 'outline') return theme.colors.primary;
    return '#fff';
  };

  return (
    <Animated.View style={[animatedStyle, { width: '100%', alignItems: 'center' }, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled || loading}
        style={[
          styles.button,
          { backgroundColor: getBackgroundColor() },
          variant === 'outline' && { borderWidth: 1, borderColor: theme.colors.primary }
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getTextColor()} />
        ) : (
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    width: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: theme.fonts.bold,
  },
});
