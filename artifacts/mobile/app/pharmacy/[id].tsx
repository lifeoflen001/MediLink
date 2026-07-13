import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Linking, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { PHARMACIES, MEDICINES, MEDICINE_AVAILABILITY } from '@/data/mockData';
import { useApp } from '@/context/AppContext';

export default function PharmacyDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isFavorite, addFavorite, removeFavorite } = useApp();

  const pharmacy = PHARMACIES.find(p => p.id === id);
  if (!pharmacy) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Pharmacy not found</Text>
      </View>
    );
  }

  const fav = isFavorite(pharmacy.id);

  const toggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (fav) removeFavorite(pharmacy.id);
    else addFavorite(pharmacy.id);
  };

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${pharmacy.phone}`).catch(() =>
      Alert.alert('Cannot make call', 'Please dial ' + pharmacy.phone)
    );
  };

  // Find medicines available at this pharmacy
  const availableMedicines = Object.entries(MEDICINE_AVAILABILITY)
    .filter(([, avail]) => avail.some(a => a.pharmacyId === pharmacy.id && a.inStock))
    .map(([medicineId, avail]) => {
      const medicine = MEDICINES.find(m => m.id === medicineId);
      const stock = avail.find(a => a.pharmacyId === pharmacy.id);
      return medicine && stock ? { ...medicine, price: stock.price } : null;
    })
    .filter(Boolean) as Array<(typeof MEDICINES)[0] & { price: number }>;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 100 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name="business" size={36} color="#fff" />
          </View>
          <Text style={styles.heroName}>{pharmacy.name}</Text>
          <View style={styles.heroMeta}>
            <View style={styles.heroMetaItem}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.heroMetaText}>
                {pharmacy.rating} ({pharmacy.reviewCount} reviews)
              </Text>
            </View>
            <View style={styles.heroMetaItem}>
              <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroMetaText}>{pharmacy.distance} km away</Text>
            </View>
          </View>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: pharmacy.isOpen ? 'rgba(74,222,128,0.25)' : 'rgba(239,68,68,0.25)' },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: pharmacy.isOpen ? '#4ADE80' : '#EF4444' },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: pharmacy.isOpen ? '#4ADE80' : '#EF4444' },
                ]}
              >
                {pharmacy.isOpen ? 'Open Now' : 'Closed'}
              </Text>
            </View>
            {pharmacy.hasEmergency && (
              <View style={[styles.emergencyBadge, { backgroundColor: 'rgba(255,87,34,0.25)' }]}>
                <Ionicons name="alert-circle" size={13} color={colors.accent} />
                <Text style={[styles.emergencyText, { color: colors.accent }]}>24h Emergency</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="location" size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Address</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{pharmacy.address}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="time" size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Hours</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{pharmacy.openHours}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="call" size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{pharmacy.phone}</Text>
          </View>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="navigate" size={20} color={colors.primary} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Distance</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{pharmacy.distance} km</Text>
          </View>
        </View>

        {/* Available Medicines */}
        {availableMedicines.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Available Medicines ({availableMedicines.length})
            </Text>
            {availableMedicines.map(m => (
              <TouchableOpacity
                key={m.id}
                style={[styles.medicineRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: '/medicine/[id]', params: { id: m.id } })}
              >
                <View style={[styles.medIcon, { backgroundColor: colors.muted }]}>
                  <Ionicons name="medkit-outline" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.medName, { color: colors.foreground }]}>{m.name}</Text>
                  <Text style={[styles.medGeneric, { color: colors.mutedForeground }]}>{m.genericName}</Text>
                </View>
                <Text style={[styles.medPrice, { color: colors.primary }]}>KES {m.price}</Text>
                <Ionicons name="chevron-forward" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 12 },
        ]}
      >
        <TouchableOpacity
          onPress={toggleFavorite}
          style={[styles.favBtn, { backgroundColor: fav ? colors.secondary : colors.muted }]}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={22}
            color={fav ? colors.primary : colors.mutedForeground}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCall}
          style={[styles.callBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.callBtnText}>Call Pharmacy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  hero: { padding: 24, alignItems: 'center', gap: 10 },
  heroIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff', textAlign: 'center' },
  heroMeta: { flexDirection: 'row', gap: 16 },
  heroMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  heroMetaText: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  statusRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  emergencyText: { fontSize: 12, fontWeight: '600' },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: 16,
    gap: 10,
  },
  infoCard: {
    width: '47%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 5,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  infoLabel: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  infoValue: { fontSize: 13, fontWeight: '500', lineHeight: 18 },
  section: { paddingHorizontal: 16, paddingVertical: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  medicineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  medIcon: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 14, fontWeight: '600' },
  medGeneric: { fontSize: 12 },
  medPrice: { fontSize: 14, fontWeight: '700' },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  favBtn: { width: 50, height: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  callBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14 },
  callBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
