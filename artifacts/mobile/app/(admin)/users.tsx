import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
  Modal, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { apiJson, apiFetch } from '@/utils/api';
import type { UserRole } from '@/context/AuthContext';

const ROLE_LABELS: Record<string, string> = {
  all: 'All', customer: 'Patients', hospital: 'Hospitals',
  pharmacy: 'Pharmacies', supplier: 'Suppliers', doctor: 'Doctors', institution: 'Institutions',
};
const ROLE_COLORS: Record<string, string> = {
  customer: '#3B82F6', hospital: '#8B5CF6', pharmacy: '#0E9F6E',
  supplier: '#F59E0B', doctor: '#EF4444', institution: '#EC4899', superadmin: '#6B7280',
};
const ROLE_FILTER_KEYS = ['all', 'customer', 'hospital', 'pharmacy', 'supplier', 'doctor', 'institution'];

interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  isActive: boolean;
  createdAt: string;
}

function UserAvatar({ name, role, size = 44 }: { name: string; role: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  const color = ROLE_COLORS[role] ?? '#6B7280';
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '22', borderColor: color + '44', borderWidth: 1.5 }]}>
      <Text style={[styles.avatarText, { color, fontSize: size * 0.34 }]}>{initials}</Text>
    </View>
  );
}

export default function AdminUsersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string }>();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState(params.role ?? 'all');
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const fetchUsers = useCallback(async (pg = 1, append = false) => {
    if (!append) setLoading(true); else setLoadingMore(true);
    try {
      const qp = new URLSearchParams({ page: String(pg), limit: '20' });
      if (roleFilter !== 'all') qp.set('role', roleFilter);
      const data = await apiJson<{ users: AppUser[]; total: number; page: number }>(`/admin/users?${qp}`);
      setUsers(prev => append ? [...prev, ...data.users] : data.users);
      setTotal(data.total);
      setPage(pg);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [roleFilter]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  // Search filter (client-side for simplicity)
  const filtered = query.trim()
    ? users.filter(u =>
        u.displayName.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
      )
    : users;

  const openActions = (user: AppUser) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedUser(user);
    setActionModalVisible(true);
  };

  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setActionModalVisible(false);
    const newStatus = !selectedUser.isActive;
    const label = newStatus ? 'activate' : 'deactivate';
    Alert.alert(
      `${newStatus ? 'Activate' : 'Deactivate'} Account`,
      `${label.charAt(0).toUpperCase() + label.slice(1)} ${selectedUser.displayName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: newStatus ? 'Activate' : 'Deactivate',
          style: newStatus ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/admin/users/${selectedUser.id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: newStatus }),
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchUsers(1);
            } catch {
              Alert.alert('Error', 'Could not update status');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    setActionModalVisible(false);
    Alert.alert(
      'Delete Account',
      `Permanently delete ${selectedUser.displayName}?\n\nThis cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiFetch(`/admin/users/${selectedUser.id}`, { method: 'DELETE' });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              fetchUsers(1);
            } catch {
              Alert.alert('Error', 'Could not delete user');
            }
          },
        },
      ]
    );
  };

  const roleBadgeColor = (role: string) => ROLE_COLORS[role] ?? '#6B7280';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Users{total > 0 ? ` (${total})` : ''}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Search */}
        <View style={[styles.searchRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or email..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Role filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {ROLE_FILTER_KEYS.map(r => (
            <Pressable
              key={r}
              onPress={() => { setRoleFilter(r); setQuery(''); }}
              style={[styles.filterChip, {
                backgroundColor: roleFilter === r ? colors.primary : colors.muted,
                borderColor: roleFilter === r ? colors.primary : colors.border,
              }]}
            >
              <Text style={[styles.filterChipText, { color: roleFilter === r ? '#fff' : colors.mutedForeground }]}>
                {ROLE_LABELS[r]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* User list */}
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (!loadingMore && users.length < total) fetchUsers(page + 1, true);
          }}
          ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.mutedForeground} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No users found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.userRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => openActions(item)}
              activeOpacity={0.88}
            >
              <UserAvatar name={item.displayName} role={item.role} />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                    {item.displayName}
                  </Text>
                  {!item.isActive && (
                    <View style={[styles.inactiveBadge, { backgroundColor: colors.errorBg }]}>
                      <Text style={[styles.inactiveBadgeText, { color: colors.errorText }]}>Inactive</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>{item.email}</Text>
                <View style={[styles.roleBadge, { backgroundColor: roleBadgeColor(item.role) + '18' }]}>
                  <View style={[styles.roleDot, { backgroundColor: roleBadgeColor(item.role) }]} />
                  <Text style={[styles.roleBadgeText, { color: roleBadgeColor(item.role) }]}>
                    {ROLE_LABELS[item.role] ?? item.role}
                  </Text>
                </View>
              </View>
              <Ionicons name="ellipsis-vertical" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Action Modal */}
      <Modal
        visible={actionModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setActionModalVisible(false)}>
          <View style={[styles.actionSheet, { backgroundColor: colors.card }]}>
            {selectedUser && (
              <>
                <View style={styles.sheetHeader}>
                  <UserAvatar name={selectedUser.displayName} role={selectedUser.role} size={48} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.sheetName, { color: colors.foreground }]}>{selectedUser.displayName}</Text>
                    <Text style={[styles.sheetEmail, { color: colors.mutedForeground }]}>{selectedUser.email}</Text>
                  </View>
                </View>

                <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />

                <TouchableOpacity style={styles.sheetAction} onPress={handleToggleStatus}>
                  <View style={[styles.sheetActionIcon, { backgroundColor: selectedUser.isActive ? colors.warningBg : colors.successBg }]}>
                    <Ionicons name={selectedUser.isActive ? 'pause-circle-outline' : 'play-circle-outline'} size={20} color={selectedUser.isActive ? colors.warningText : colors.successText} />
                  </View>
                  <Text style={[styles.sheetActionText, { color: colors.foreground }]}>
                    {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                  </Text>
                </TouchableOpacity>

                {selectedUser.role !== 'superadmin' && (
                  <TouchableOpacity style={styles.sheetAction} onPress={handleDelete}>
                    <View style={[styles.sheetActionIcon, { backgroundColor: colors.errorBg }]}>
                      <Ionicons name="trash-outline" size={20} color={colors.errorText} />
                    </View>
                    <Text style={[styles.sheetActionText, { color: colors.destructive }]}>Delete Account</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.sheetCancel, { borderColor: colors.border }]} onPress={() => setActionModalVisible(false)}>
                  <Text style={[styles.sheetCancelText, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { borderBottomWidth: 1, paddingBottom: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 10 },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1,
    marginBottom: 8,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
  filterScroll: { paddingHorizontal: 16, gap: 8, paddingBottom: 10 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  list: { paddingTop: 10, paddingHorizontal: 16, paddingBottom: 100, gap: 8 },
  userRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, borderRadius: 14, borderWidth: 1,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 1 } }),
  },
  avatar: { alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontWeight: '700' },
  userInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userName: { fontSize: 14, fontWeight: '600', flex: 1 },
  userEmail: { fontSize: 12 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start' },
  roleDot: { width: 6, height: 6, borderRadius: 3 },
  roleBadgeText: { fontSize: 10, fontWeight: '700' },
  inactiveBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  inactiveBadgeText: { fontSize: 9, fontWeight: '700' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 10 },
  emptyText: { fontSize: 15 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  actionSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 4 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  sheetName: { fontSize: 16, fontWeight: '700' },
  sheetEmail: { fontSize: 13 },
  sheetDivider: { height: 1, marginBottom: 12 },
  sheetAction: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  sheetActionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheetActionText: { fontSize: 15, fontWeight: '600' },
  sheetCancel: { marginTop: 8, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center' },
  sheetCancelText: { fontSize: 15, fontWeight: '600' },
});
