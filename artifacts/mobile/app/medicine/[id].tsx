import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MEDICINES, PHARMACIES, MEDICINE_AVAILABILITY } from '@/data/mockData';

export default function MedicineDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const { id } = useLocalSearchParams<{ id: string }>();

  const medicine = MEDICINES.find(m => m.id === id);
  if (!medicine) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Medicine not found</Text>
      </View>
    );
  }

  const availability = MEDICINE_AVAILABILITY[medicine.id] ?? [];
  const pharmaciesWithStock = availability
    .filter(a => a.inStock)
    .map(a => ({
      ...PHARMACIES.find(p => p.id === a.pharmacyId)!,
      price: a.price,
      quantity: a.quantity,
    }))
    .filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      >
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.heroBadgeText}>{medicine.category}</Text>
            </View>
            <Text style={styles.heroName}>{medicine.name}</Text>
            <Text style={styles.heroGeneric}>{medicine.genericName}</Text>

            <View style={styles.heroMeta}>
              {medicine.requiresPrescription && (
                <View style={[styles.rxBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                  <Ionicons name="document-text-outline" size={13} color="#fff" />
                  <Text style={styles.rxText}>Prescription Required</Text>
                </View>
              )}
              <View style={[styles.rxBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Ionicons name="business-outline" size={13} color="#fff" />
                <Text style={styles.rxText}>{medicine.pharmacyCount} pharmacies</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceBox}>
            <Text style={styles.priceLabel}>Price Range</Text>
            <Text style={styles.priceValue}>
              KES {medicine.minPrice} – {medicine.maxPrice}
            </Text>
          </View>
        </View>

        {/* Description */}
        <InfoSection title="About this medicine" colors={colors}>
          <Text style={[styles.bodyText, { color: colors.foreground }]}>{medicine.description}</Text>
        </InfoSection>

        {/* Dosage */}
        <InfoSection title="Dosage & Usage" colors={colors}>
          <View style={[styles.dosageBox, { backgroundColor: colors.secondary }]}>
            <Ionicons name="time-outline" size={18} color={colors.primary} />
            <Text style={[styles.dosageText, { color: colors.secondaryForeground }]}>{medicine.dosage}</Text>
          </View>
        </InfoSection>

        {/* Uses */}
        <InfoSection title="What it treats" colors={colors}>
          <View style={styles.tagGrid}>
            {medicine.uses.map(use => (
              <View key={use} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
                <Text style={[styles.tagText, { color: colors.secondaryForeground }]}>{use}</Text>
              </View>
            ))}
          </View>
        </InfoSection>

        {/* Side Effects */}
        <InfoSection title="Possible Side Effects" colors={colors}>
          {medicine.sideEffects.map(effect => (
            <View key={effect} style={styles.listItem}>
              <View style={[styles.bullet, { backgroundColor: colors.warningText }]} />
              <Text style={[styles.listText, { color: colors.foreground }]}>{effect}</Text>
            </View>
          ))}
        </InfoSection>

        {/* Precautions */}
        <InfoSection title="Precautions" colors={colors}>
          {medicine.precautions.map(p => (
            <View key={p} style={styles.listItem}>
              <Ionicons name="alert-circle-outline" size={15} color={colors.accent} />
              <Text style={[styles.listText, { color: colors.foreground }]}>{p}</Text>
            </View>
          ))}
        </InfoSection>

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.warningBg, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.warningText} />
          <Text style={[styles.disclaimerText, { color: colors.warningText }]}>
            This information is for general guidance only. Always consult a qualified pharmacist or healthcare provider before taking any medication.
          </Text>
        </View>

        {/* Available Pharmacies */}
        {pharmaciesWithStock.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Available At ({pharmaciesWithStock.length})
            </Text>
            {pharmaciesWithStock.map(p => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: p.id } })}
                style={({ pressed }) => [
                  styles.pharmCard,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={[styles.pharmIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="business" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pharmName, { color: colors.foreground }]}>{p.name}</Text>
                  <View style={styles.pharmMeta}>
                    <Ionicons name="location-outline" size={12} color={colors.mutedForeground} />
                    <Text style={[styles.pharmAddress, { color: colors.mutedForeground }]}>{p.address}</Text>
                  </View>
                </View>
                <View style={styles.pharmPrice}>
                  <Text style={[styles.pharmPriceText, { color: colors.primary }]}>KES {p.price}</Text>
                  <View style={[styles.inStockBadge, { backgroundColor: colors.successBg }]}>
                    <Text style={[styles.inStockText, { color: colors.successText }]}>In Stock</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Chat with AI */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        <TouchableOpacity
          style={[styles.aiBtn, { backgroundColor: colors.secondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/chat');
          }}
        >
          <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
          <Text style={[styles.aiBtnText, { color: colors.primary }]}>Ask AI about this</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reminderBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(tabs)/reminders');
          }}
        >
          <Ionicons name="alarm-outline" size={18} color="#fff" />
          <Text style={styles.reminderBtnText}>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoSection({ title, children, colors }: {
  title: string;
  children: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.infoSection}>
      <Text style={[styles.infoTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorText: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  hero: { padding: 20, paddingTop: 24, paddingBottom: 0 },
  heroContent: { gap: 6 },
  heroBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  heroBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 4 },
  heroGeneric: { fontSize: 14, color: 'rgba(255,255,255,0.75)' },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  rxBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  rxText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  priceBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 12, marginTop: 16, marginBottom: 20 },
  priceLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  priceValue: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 2 },

  infoSection: { paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  infoTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  bodyText: { fontSize: 15, lineHeight: 23 },
  dosageBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12 },
  dosageText: { flex: 1, fontSize: 14, lineHeight: 21, fontWeight: '500' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: '500' },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  listText: { flex: 1, fontSize: 14, lineHeight: 21 },
  disclaimer: { margin: 20, borderRadius: 12, padding: 14, flexDirection: 'row', gap: 10, borderWidth: 1 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 20 },

  section: { paddingHorizontal: 20, paddingVertical: 16 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  pharmCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 10, gap: 12 },
  pharmIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: 14, fontWeight: '600' },
  pharmMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  pharmAddress: { fontSize: 12 },
  pharmPrice: { alignItems: 'flex-end', gap: 4 },
  pharmPriceText: { fontSize: 15, fontWeight: '700' },
  inStockBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  inStockText: { fontSize: 10, fontWeight: '600' },

  bottomBar: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', gap: 10 },
  aiBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 12 },
  aiBtnText: { fontSize: 14, fontWeight: '600' },
  reminderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 12 },
  reminderBtnText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
