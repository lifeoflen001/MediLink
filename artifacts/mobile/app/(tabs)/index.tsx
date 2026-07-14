import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MEDICINES, PHARMACIES, CATEGORIES } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import MedicineCard from '@/components/MedicineCard';
import PharmacyCard from '@/components/PharmacyCard';
import SectionHeader from '@/components/SectionHeader';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const QUICK_ACTIONS = [
  { id: '1', label: 'Search Medicine', icon: 'search' as const, route: '/(tabs)/search' as const },
  { id: '2', label: 'AI Assistant', icon: 'chatbubbles' as const, route: '/(tabs)/chat' as const },
  { id: '3', label: 'Reminders', icon: 'alarm' as const, route: '/(tabs)/reminders' as const },
  { id: '4', label: 'Emergency', icon: 'alert-circle' as const, route: '/emergency' as const, danger: true },
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : 80;
  const { userProfile } = useApp();

  const greeting = useMemo(() => getGreeting(), []);
  const firstName = userProfile.name.split(' ')[0];

  const handleSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/search');
  };

  const handleActionPress = (route: string, danger?: boolean) => {
    if (danger) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 20, backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View style={styles.greetingBox}>
            <Text style={styles.greeting}>{greeting}, {firstName} 👋</Text>
            <Text style={styles.headerTitle}>Find your medicine</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => handleActionPress('/emergency', true)}
              style={[styles.sosButton, { backgroundColor: colors.accent }]}
              accessibilityLabel="Emergency SOS"
              accessibilityRole="button"
              accessibilityHint="Opens emergency services and contacts"
            >
              <Ionicons name="alert-circle" size={16} color="#fff" />
              <Text style={styles.sosLabel}>SOS</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <TouchableOpacity
          onPress={handleSearchPress}
          style={styles.searchBar}
          activeOpacity={0.92}
        >
          <Ionicons name="search-outline" size={18} color={colors.mutedForeground} />
          <Text style={[styles.searchPlaceholder, { color: colors.mutedForeground }]}>
            Medicines, pharmacies, symptoms...
          </Text>
          <View style={[styles.filterPill, { backgroundColor: colors.muted }]}>
            <Ionicons name="options-outline" size={15} color={colors.primary} />
          </View>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </View>

      {/* Quick actions card floating over header */}
      <View style={[styles.quickActionsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.id}
              onPress={() => handleActionPress(action.route, action.danger)}
              style={({ pressed }) => [
                styles.quickAction,
                {
                  backgroundColor: action.danger ? '#FFF1EE' : colors.secondary,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: action.danger ? colors.accent : colors.primary },
                ]}
              >
                <Ionicons name={action.icon} size={20} color="#fff" />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  { color: action.danger ? colors.accent : colors.foreground },
                ]}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <SectionHeader title="Categories" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() =>
                router.push({
                  pathname: '/(tabs)/search',
                  params: { category: cat.name },
                })
              }
              style={[
                styles.categoryChip,
                {
                  backgroundColor: i === 0 ? colors.primary : colors.muted,
                  borderColor: i === 0 ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  { color: i === 0 ? '#fff' : colors.foreground },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Pharmacies */}
      <View style={styles.section}>
        <SectionHeader
          title="Nearby Pharmacies"
          onSeeAll={() =>
            router.push({ pathname: '/(tabs)/search', params: { tab: 'pharmacies' } })
          }
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {PHARMACIES.filter(p => p.isOpen).slice(0, 4).map((pharmacy) => (
            <PharmacyCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              compact
              onPress={() =>
                router.push({ pathname: '/pharmacy/[id]', params: { id: pharmacy.id } })
              }
            />
          ))}
        </ScrollView>
      </View>

      {/* Popular Medicines */}
      <View style={styles.section}>
        <SectionHeader title="Common Medicines" onSeeAll={() => router.push('/(tabs)/search')} />
        {MEDICINES.slice(0, 5).map((medicine) => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
            onPress={() =>
              router.push({ pathname: '/medicine/[id]', params: { id: medicine.id } })
            }
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  greetingBox: { gap: 2 },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  sosLabel: { color: '#fff', fontSize: 13, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  searchPlaceholder: { flex: 1, fontSize: 14 },
  filterPill: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionsCard: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: -18,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
  },
  quickActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
  section: { marginTop: 24 },
  categoryScroll: { paddingHorizontal: 16, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 13, fontWeight: '600' },
});
