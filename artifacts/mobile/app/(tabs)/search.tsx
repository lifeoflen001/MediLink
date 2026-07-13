import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  Pressable, Platform, Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { MEDICINES, PHARMACIES, CATEGORIES } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import MedicineCard from '@/components/MedicineCard';
import PharmacyCard from '@/components/PharmacyCard';

type TabType = 'medicines' | 'pharmacies';

export default function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const { addRecentSearch, recentSearches, clearRecentSearches } = useApp();
  const params = useLocalSearchParams<{ tab?: string; category?: string }>();

  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>(params.tab === 'pharmacies' ? 'pharmacies' : 'medicines');
  const [selectedCategory, setSelectedCategory] = useState(params.category ?? 'All');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const filteredMedicines = MEDICINES.filter(m => {
    const matchQuery =
      !query ||
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.genericName.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase());
    const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
    return matchQuery && matchCat;
  });

  const filteredPharmacies = PHARMACIES.filter(
    p =>
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.address.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = (text: string) => {
    setQuery(text);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      addRecentSearch(query.trim());
    }
    Keyboard.dismiss();
  };

  const handleRecentSearch = (term: string) => {
    setQuery(term);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const showEmpty = !query && activeTab === 'medicines';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <View style={[styles.inputWrapper, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="search-outline" size={17} color={colors.mutedForeground} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={handleSearch}
              onSubmitEditing={handleSubmit}
              placeholder="Search medicines, pharmacies..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.input, { color: colors.foreground }]}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={17} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tab toggle */}
        <View style={[styles.tabRow, { backgroundColor: colors.muted }]}>
          {(['medicines', 'pharmacies'] as TabType[]).map(tab => (
            <Pressable
              key={tab}
              onPress={() => {
                setActiveTab(tab);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.tabBtn,
                { backgroundColor: activeTab === tab ? colors.primary : 'transparent' },
              ]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  { color: activeTab === tab ? '#fff' : colors.mutedForeground },
                ]}
              >
                {tab === 'medicines' ? 'Medicines' : 'Pharmacies'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Category chips — medicines only */}
        {activeTab === 'medicines' && (
          <FlatList
            horizontal
            data={CATEGORIES}
            keyExtractor={item => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catScroll}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item.name)}
                style={[
                  styles.catChip,
                  {
                    backgroundColor: selectedCategory === item.name ? colors.primary : colors.muted,
                    borderColor: selectedCategory === item.name ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.catChipText,
                    { color: selectedCategory === item.name ? '#fff' : colors.foreground },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Results */}
      {showEmpty ? (
        <View style={styles.emptyContainer}>
          {recentSearches.length > 0 && (
            <>
              <View style={styles.recentHeader}>
                <Text style={[styles.recentTitle, { color: colors.foreground }]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecentSearches}>
                  <Text style={[styles.clearText, { color: colors.primary }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recentSearches.map(term => (
                <TouchableOpacity
                  key={term}
                  style={[styles.recentItem, { borderBottomColor: colors.border }]}
                  onPress={() => handleRecentSearch(term)}
                >
                  <Ionicons name="time-outline" size={16} color={colors.mutedForeground} />
                  <Text style={[styles.recentText, { color: colors.foreground }]}>{term}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
          {recentSearches.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Search Medicines</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Find medicines by name, generic name, or category
              </Text>
            </View>
          )}
        </View>
      ) : activeTab === 'medicines' ? (
        <FlatList
          data={filteredMedicines}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="medkit-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No medicines found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Try a different search or category
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MedicineCard
              medicine={item}
              onPress={() => {
                addRecentSearch(item.name);
                router.push({ pathname: '/medicine/[id]', params: { id: item.id } });
              }}
            />
          )}
        />
      ) : (
        <FlatList
          data={filteredPharmacies}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="business-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No pharmacies found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Try a different search term
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PharmacyCard
              pharmacy={item}
              onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingBottom: 8 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 12 },
  backBtn: { padding: 4 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 3,
    marginBottom: 10,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tabBtnText: { fontSize: 13, fontWeight: '600' },
  catScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  catChipText: { fontSize: 12, fontWeight: '600' },
  list: { paddingTop: 12, paddingBottom: 100 },
  emptyContainer: { flex: 1, paddingTop: 16 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 },
  recentTitle: { fontSize: 16, fontWeight: '700' },
  clearText: { fontSize: 14, fontWeight: '600' },
  recentItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1 },
  recentText: { fontSize: 15 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
