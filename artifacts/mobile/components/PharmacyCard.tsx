import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Pharmacy } from '@/data/mockData';

interface Props {
  pharmacy: Pharmacy;
  onPress?: () => void;
  compact?: boolean;
}

export default function PharmacyCard({ pharmacy, onPress, compact }: Props) {
  const colors = useColors();

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.compactCard,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
        ]}
      >
        <View style={styles.compactHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
            <Ionicons name="business" size={18} color={colors.primary} />
          </View>
          {pharmacy.hasEmergency && (
            <View style={[styles.emergencyDot, { backgroundColor: colors.accent }]} />
          )}
        </View>
        <Text style={[styles.compactName, { color: colors.foreground }]} numberOfLines={1}>
          {pharmacy.name}
        </Text>
        <Text style={[styles.compactDistance, { color: colors.mutedForeground }]}>
          {pharmacy.distance} km away
        </Text>
        <View style={styles.compactRow}>
          <Ionicons name="star" size={11} color={colors.starColor} />
          <Text style={[styles.compactRating, { color: colors.foreground }]}>{pharmacy.rating}</Text>
          <View style={[styles.openBadge, { backgroundColor: pharmacy.isOpen ? colors.successBg : colors.errorBg }]}>
            <Text style={[styles.openText, { color: pharmacy.isOpen ? colors.successText : colors.errorText }]}>
              {pharmacy.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: colors.secondary }]}>
        <Ionicons name="business" size={22} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {pharmacy.name}
          </Text>
          {pharmacy.hasEmergency && (
            <View style={[styles.emergencyBadge, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={10} color="#991B1B" />
              <Text style={styles.emergencyText}>24h Emergency</Text>
            </View>
          )}
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.address, { color: colors.mutedForeground }]} numberOfLines={1}>
            {pharmacy.address}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.stars}>
            <Ionicons name="star" size={12} color={colors.starColor} />
            <Text style={[styles.rating, { color: colors.foreground }]}>
              {pharmacy.rating} ({pharmacy.reviewCount})
            </Text>
          </View>
          <Text style={[styles.distance, { color: colors.mutedForeground }]}>
            {pharmacy.distance} km
          </Text>
          <View style={[styles.openBadge, { backgroundColor: pharmacy.isOpen ? colors.successBg : colors.errorBg }]}>
            <Text style={[styles.openText, { color: pharmacy.isOpen ? colors.successText : colors.errorText }]}>
              {pharmacy.isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', flex: 1 },
  emergencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  emergencyText: { fontSize: 9, color: '#991B1B', fontWeight: '600' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  address: { fontSize: 12, flex: 1 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 12, fontWeight: '500' },
  distance: { fontSize: 12 },
  openBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },
  openText: { fontSize: 11, fontWeight: '600' },

  // Compact
  compactCard: {
    width: 150,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginLeft: 16,
    gap: 6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  compactHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  emergencyDot: { width: 8, height: 8, borderRadius: 4 },
  compactName: { fontSize: 14, fontWeight: '600' },
  compactDistance: { fontSize: 11 },
  compactRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactRating: { fontSize: 11, fontWeight: '500', flex: 1 },
  starColor: { color: '#F59E0B' },
});
