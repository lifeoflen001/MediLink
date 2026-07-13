import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Medicine } from '@/data/mockData';

interface Props {
  medicine: Medicine;
  onPress?: () => void;
}

export default function MedicineCard({ medicine, onPress }: Props) {
  const colors = useColors();

  const categoryColor = getCategoryColor(medicine.category, colors);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: categoryColor.bg }]}>
        <Ionicons name={getCategoryIcon(medicine.category)} size={22} color={categoryColor.text} />
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {medicine.name}
          </Text>
          {medicine.requiresPrescription && (
            <View style={[styles.rxBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.rxText, { color: colors.secondaryForeground }]}>Rx</Text>
            </View>
          )}
        </View>

        <Text style={[styles.generic, { color: colors.mutedForeground }]} numberOfLines={1}>
          {medicine.genericName}
        </Text>

        <View style={styles.footer}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor.bg }]}>
            <Text style={[styles.categoryText, { color: categoryColor.text }]}>
              {medicine.category}
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="business-outline" size={12} color={colors.mutedForeground} />
            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
              {medicine.pharmacyCount} pharmacies
            </Text>
            <Text style={[styles.price, { color: colors.primary }]}>
              KES {medicine.minPrice}–{medicine.maxPrice}
            </Text>
          </View>
        </View>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
    </Pressable>
  );
}

function getCategoryColor(category: string, colors: ReturnType<typeof useColors>) {
  const map: Record<string, { bg: string; text: string }> = {
    Antibiotics: { bg: '#FEF3C7', text: '#92400E' },
    Antimalarial: { bg: '#EDE9FE', text: '#5B21B6' },
    'Pain Relief': { bg: '#FEE2E2', text: '#991B1B' },
    Diabetes: { bg: '#DBEAFE', text: '#1E40AF' },
    Hypertension: { bg: '#FCE7F3', text: '#9D174D' },
    Respiratory: { bg: '#CCFBF1', text: '#0F766E' },
    Vitamins: { bg: '#DCFCE7', text: '#166534' },
    Stomach: { bg: '#FFF7ED', text: '#9A3412' },
  };
  return map[category] ?? { bg: colors.muted, text: colors.mutedForeground };
}

function getCategoryIcon(category: string): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    Antibiotics: 'shield-checkmark-outline',
    Antimalarial: 'bug-outline',
    'Pain Relief': 'medical-outline',
    Diabetes: 'pulse-outline',
    Hypertension: 'heart-outline',
    Respiratory: 'cloud-outline',
    Vitamins: 'nutrition-outline',
    Stomach: 'fitness-outline',
  };
  return map[category] ?? 'medkit-outline';
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
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 15, fontWeight: '600', flex: 1 },
  rxBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  rxText: { fontSize: 10, fontWeight: '700' },
  generic: { fontSize: 12 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  categoryBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '600' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 },
  metaText: { fontSize: 11 },
  price: { fontSize: 12, fontWeight: '700', marginLeft: 'auto' },
});
