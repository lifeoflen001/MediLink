import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ROLES = [
  { icon: 'person-outline', label: 'Patients' },
  { icon: 'business-outline', label: 'Hospitals' },
  { icon: 'medkit-outline', label: 'Pharmacies' },
  { icon: 'cube-outline', label: 'Suppliers' },
  { icon: 'medical-outline', label: 'Doctors' },
  { icon: 'people-outline', label: 'Institutions' },
];

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#065F46', '#0E9F6E', '#34D399']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <View style={[styles.inner, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="heart" size={38} color="#0E9F6E" />
          </View>
          <Text style={styles.appName}>MediConnect</Text>
          <Text style={styles.tagline}>Africa's Healthcare Network</Text>
        </View>

        {/* Role pills */}
        <View style={styles.rolesRow}>
          {ROLES.map(r => (
            <View key={r.label} style={styles.rolePill}>
              <Ionicons name={r.icon as any} size={13} color="rgba(255,255,255,0.9)" />
              <Text style={styles.rolePillText}>{r.label}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.description}>
          One platform connecting patients, hospitals, pharmacies, suppliers, doctors, and health institutions.
        </Text>

        {/* CTA buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/(auth)/register');
            }}
            activeOpacity={0.88}
          >
            <Ionicons name="person-add-outline" size={18} color="#0E9F6E" />
            <Text style={styles.primaryBtnText}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(auth)/login');
            }}
            activeOpacity={0.88}
          >
            <Text style={styles.secondaryBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'space-between' },

  logoSection: { alignItems: 'center', gap: 10 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 10 },
    }),
  },
  appName: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },

  rolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  rolePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  rolePillText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },

  description: {
    fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center',
    lineHeight: 23, paddingHorizontal: 8,
  },

  buttons: { gap: 12 },
  primaryBtn: {
    backgroundColor: '#fff', borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#0E9F6E' },
  secondaryBtn: {
    borderRadius: 14, paddingVertical: 16,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: '#fff' },

  legal: { fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 16 },
});
