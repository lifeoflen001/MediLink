import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';
import { apiJson } from '@/utils/api';

interface Stats {
  total: number; customers: number; hospitals: number; pharmacies: number;
  suppliers: number; doctors: number; institutions: number;
  active: number; inactive: number;
}

const STAT_ROWS: { key: keyof Stats; label: string; icon: string; color: string }[] = [
  { key: 'customers',    label: 'Patients',     icon: 'person-outline',    color: '#3B82F6' },
  { key: 'hospitals',    label: 'Hospitals',    icon: 'business-outline',  color: '#8B5CF6' },
  { key: 'pharmacies',   label: 'Pharmacies',   icon: 'medkit-outline',    color: '#0E9F6E' },
  { key: 'suppliers',    label: 'Suppliers',    icon: 'cube-outline',      color: '#F59E0B' },
  { key: 'doctors',      label: 'Doctors',      icon: 'medical-outline',   color: '#EF4444' },
  { key: 'institutions', label: 'Institutions', icon: 'people-outline',    color: '#EC4899' },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiJson<{ stats: Stats }>('/admin/stats');
      setStats(data.stats);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  React.useEffect(() => { fetchStats(); }, [fetchStats]);

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerGreeting}>Admin Panel</Text>
            <Text style={styles.headerName}>MediConnect CRM</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}
            accessibilityLabel="Logout" accessibilityRole="button">
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Summary pills */}
        {stats && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryNum}>{stats.total}</Text>
              <Text style={styles.summaryLabel}>Total Users</Text>
            </View>
            <View style={[styles.summaryDivider]} />
            <View style={styles.summaryPill}>
              <Text style={styles.summaryNum}>{stats.active}</Text>
              <Text style={styles.summaryLabel}>Active</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryPill}>
              <Text style={styles.summaryNum}>{stats.inactive}</Text>
              <Text style={styles.summaryLabel}>Inactive</Text>
            </View>
          </View>
        )}
        <View style={{ height: 8 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Manage users CTA */}
        <TouchableOpacity
          style={[styles.manageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push('/(admin)/users'); }}
          activeOpacity={0.88}
        >
          <View style={[styles.manageIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="people" size={26} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.manageTitle, { color: colors.foreground }]}>Manage Users</Text>
            <Text style={[styles.manageSub, { color: colors.mutedForeground }]}>View, deactivate or delete any user account</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* User breakdown */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Users by Role</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.statsGrid}>
            {STAT_ROWS.map(row => (
              <TouchableOpacity
                key={row.key}
                style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.push({ pathname: '/(admin)/users', params: { role: String(row.key).replace(/s$/, '') } })}
                activeOpacity={0.88}
              >
                <View style={[styles.statIcon, { backgroundColor: row.color + '20' }]}>
                  <Ionicons name={row.icon as any} size={22} color={row.color} />
                </View>
                <Text style={[styles.statNum, { color: colors.foreground }]}>
                  {stats ? stats[row.key] : '–'}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Admin info */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoTitle, { color: colors.foreground }]}>Logged in as</Text>
            <Text style={[styles.infoSub, { color: colors.mutedForeground }]}>{user?.email}</Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.adminBadgeText, { color: colors.primary }]}>Super Admin</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 0 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  headerGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginBottom: 2 },
  headerName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  logoutBtn: { padding: 8 },
  summaryRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, marginBottom: 8 },
  summaryPill: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  manageCard: {
    flexDirection: 'row', alignItems: 'center', margin: 16,
    padding: 16, borderRadius: 16, borderWidth: 1, gap: 14,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 3 } }, android: { elevation: 3 } }),
  },
  manageIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  manageTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  manageSub: { fontSize: 13, lineHeight: 18 },

  sectionHeader: { paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 10, marginBottom: 20 },
  statCard: {
    width: '30%', flex: 1, minWidth: 90, borderRadius: 14, borderWidth: 1,
    padding: 14, alignItems: 'center', gap: 8,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 2 } }),
  },
  statIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  infoCard: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16,
    padding: 14, borderRadius: 14, borderWidth: 1, gap: 12,
  },
  infoTitle: { fontSize: 13, fontWeight: '600' },
  infoSub: { fontSize: 12 },
  adminBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  adminBadgeText: { fontSize: 11, fontWeight: '700' },
});
