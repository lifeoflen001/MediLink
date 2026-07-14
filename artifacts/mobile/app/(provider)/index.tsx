import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Platform, ActivityIndicator, Modal, TextInput, Switch,
  RefreshControl, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth, ROLE_LABELS, type UserRole } from '@/context/AuthContext';
import { apiJson, apiFetch } from '@/utils/api';

// Role-specific icon and color
const ROLE_META: Record<UserRole, { icon: string; color: string }> = {
  superadmin:  { icon: 'shield-checkmark',  color: '#6B7280' },
  customer:    { icon: 'person-circle',      color: '#3B82F6' },
  hospital:    { icon: 'business',           color: '#8B5CF6' },
  pharmacy:    { icon: 'medkit',             color: '#0E9F6E' },
  supplier:    { icon: 'cube',               color: '#F59E0B' },
  doctor:      { icon: 'medical',            color: '#EF4444' },
  institution: { icon: 'people',             color: '#EC4899' },
};

function InfoRow({ label, value, icon, colors }: { label: string; value?: string | number | null; icon?: string; colors: any }) {
  if (!value) return null;
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      {icon && <Ionicons name={icon as any} size={15} color={colors.mutedForeground} />}
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]} numberOfLines={2}>{String(value)}</Text>
    </View>
  );
}

function ProfileCard({ profile, role, colors }: { profile: Record<string, any>; role: UserRole; colors: any }) {
  const rows: { label: string; key: string; icon?: string }[] = [];

  switch (role) {
    case 'customer':
      rows.push(
        { label: 'Phone', key: 'phone', icon: 'call-outline' },
        { label: 'Gender', key: 'gender', icon: 'person-outline' },
        { label: 'County', key: 'county', icon: 'location-outline' },
        { label: 'Blood Type', key: 'bloodType', icon: 'water-outline' },
        { label: 'Allergies', key: 'allergies', icon: 'alert-circle-outline' },
        { label: 'Emergency Contact', key: 'emergencyContact', icon: 'people-outline' },
        { label: 'Emergency Phone', key: 'emergencyPhone', icon: 'call-outline' },
      );
      break;
    case 'hospital':
      rows.push(
        { label: 'Type', key: 'hospitalType', icon: 'business-outline' },
        { label: 'Address', key: 'address', icon: 'location-outline' },
        { label: 'County', key: 'county', icon: 'map-outline' },
        { label: 'Phone', key: 'phone', icon: 'call-outline' },
        { label: 'Email', key: 'contactEmail', icon: 'mail-outline' },
        { label: 'Website', key: 'website', icon: 'globe-outline' },
        { label: 'Bed Count', key: 'bedCount', icon: 'bed-outline' },
        { label: 'License #', key: 'licenseNumber', icon: 'document-text-outline' },
      );
      break;
    case 'pharmacy':
      rows.push(
        { label: 'Address', key: 'address', icon: 'location-outline' },
        { label: 'County', key: 'county', icon: 'map-outline' },
        { label: 'Phone', key: 'phone', icon: 'call-outline' },
        { label: 'Hours', key: 'operatingHours', icon: 'time-outline' },
        { label: 'License #', key: 'licenseNumber', icon: 'document-text-outline' },
      );
      break;
    case 'supplier':
      rows.push(
        { label: 'Reg. Number', key: 'registrationNumber', icon: 'document-text-outline' },
        { label: 'Address', key: 'address', icon: 'location-outline' },
        { label: 'County', key: 'county', icon: 'map-outline' },
        { label: 'Phone', key: 'phone', icon: 'call-outline' },
        { label: 'Email', key: 'contactEmail', icon: 'mail-outline' },
      );
      break;
    case 'doctor':
      rows.push(
        { label: 'Specialization', key: 'specialization', icon: 'medical-outline' },
        { label: 'License #', key: 'licenseNumber', icon: 'document-text-outline' },
        { label: 'Affiliation', key: 'hospitalAffiliation', icon: 'business-outline' },
        { label: 'Experience', key: 'yearsExperience', icon: 'time-outline' },
        { label: 'Consultation Fee', key: 'consultationFee', icon: 'cash-outline' },
        { label: 'County', key: 'county', icon: 'location-outline' },
        { label: 'Phone', key: 'phone', icon: 'call-outline' },
      );
      break;
    case 'institution':
      rows.push(
        { label: 'Type', key: 'institutionType', icon: 'business-outline' },
        { label: 'Reg. Number', key: 'registrationNumber', icon: 'document-text-outline' },
        { label: 'Address', key: 'address', icon: 'location-outline' },
        { label: 'County', key: 'county', icon: 'map-outline' },
        { label: 'Phone', key: 'phone', icon: 'call-outline' },
        { label: 'Email', key: 'contactEmail', icon: 'mail-outline' },
        { label: 'Website', key: 'website', icon: 'globe-outline' },
      );
      break;
  }

  const hasTags = (role === 'pharmacy' && (profile.hasDelivery || profile.is24h)) ||
                  (role === 'hospital' && profile.hasEmergency);

  return (
    <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {hasTags && (
        <View style={styles.tagsRow}>
          {role === 'hospital' && profile.hasEmergency && (
            <View style={[styles.tag, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="alert-circle" size={11} color="#DC2626" />
              <Text style={[styles.tagText, { color: '#DC2626' }]}>Emergency</Text>
            </View>
          )}
          {role === 'pharmacy' && profile.is24h && (
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Ionicons name="moon" size={11} color={colors.primary} />
              <Text style={[styles.tagText, { color: colors.primary }]}>24h</Text>
            </View>
          )}
          {role === 'pharmacy' && profile.hasDelivery && (
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Ionicons name="bicycle" size={11} color={colors.primary} />
              <Text style={[styles.tagText, { color: colors.primary }]}>Delivery</Text>
            </View>
          )}
        </View>
      )}
      {role === 'institution' && profile.description ? (
        <View style={[styles.descBox, { backgroundColor: colors.muted }]}>
          <Text style={[styles.descText, { color: colors.foreground }]}>{profile.description}</Text>
        </View>
      ) : null}
      {rows.map(r => <InfoRow key={r.key} label={r.label} value={profile[r.key]} icon={r.icon} colors={colors} />)}
    </View>
  );
}

export default function ProviderDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateLocalUser } = useAuth();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editFields, setEditFields] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await apiJson<{ user: any; profile: any }>('/auth/me');
      setProfile(data.profile ?? {});
      if (data.user.displayName !== user?.displayName) {
        updateLocalUser({ displayName: data.user.displayName });
      }
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const openEdit = () => {
    setEditFields({ ...(profile ?? {}) });
    setEditModal(true);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(editFields),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Save failed');
      setProfile(data.profile);
      if (data.profile) {
        const nameKey = user?.role === 'pharmacy' ? 'pharmacyName' : user?.role === 'supplier' ? 'companyName' : 'fullName';
        const newName = data.profile[nameKey] ?? user?.displayName;
        if (newName) updateLocalUser({ displayName: newName });
      }
      setEditModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
        },
      },
    ]);
  };

  const role = user?.role as UserRole;
  const meta = ROLE_META[role] ?? ROLE_META.customer;
  const initials = (user?.displayName ?? '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const displayName = user?.displayName ?? 'User';
  const isVerified = profile?.verified === true;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View style={[styles.avatarLarge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={styles.avatarLargeText}>{initials}</Text>
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.headerName} numberOfLines={1}>{displayName}</Text>
              {isVerified && <Ionicons name="checkmark-circle" size={16} color="#fff" />}
            </View>
            <View style={[styles.roleBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Ionicons name={meta.icon as any} size={12} color="#fff" />
              <Text style={styles.roleBadgeText}>{ROLE_LABELS[role] ?? role}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={22} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerEmail}>{user?.email}</Text>
        <View style={{ height: 8 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProfile(); }} tintColor="#fff" />}
      >
        {/* Edit profile button */}
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={openEdit}
          activeOpacity={0.88}
        >
          <View style={[styles.editBtnIcon, { backgroundColor: colors.secondary }]}>
            <Ionicons name="create-outline" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Profile details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Profile Details</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
          ) : profile ? (
            <ProfileCard profile={profile} role={role} colors={colors} />
          ) : null}
        </View>

        {/* Account section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Account</Text>
          <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.accountRow}>
              <Ionicons name="mail-outline" size={17} color={colors.mutedForeground} />
              <Text style={[styles.accountLabel, { color: colors.mutedForeground }]}>Email</Text>
              <Text style={[styles.accountValue, { color: colors.foreground }]}>{user?.email}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.accountRow}>
              <Ionicons name={meta.icon as any} size={17} color={colors.mutedForeground} />
              <Text style={[styles.accountLabel, { color: colors.mutedForeground }]}>Role</Text>
              <Text style={[styles.accountValue, { color: colors.foreground }]}>{ROLE_LABELS[role]}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.accountRow}>
              <Ionicons name="shield-outline" size={17} color={colors.mutedForeground} />
              <Text style={[styles.accountLabel, { color: colors.mutedForeground }]}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: user?.isActive ? colors.successBg : colors.errorBg }]}>
                <Text style={[styles.statusText, { color: user?.isActive ? colors.successText : colors.errorText }]}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide" presentationStyle="formSheet" onRequestClose={() => setEditModal(false)}>
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setEditModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile</Text>
            <TouchableOpacity onPress={saveProfile} disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color={colors.primary} />
                : <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
              }
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {Object.entries(editFields)
              .filter(([k]) => !['userId', 'updatedAt', 'verified'].includes(k))
              .map(([key, val]) => {
                if (typeof val === 'boolean') {
                  return (
                    <View key={key} style={[styles.toggleRow, { borderColor: colors.border }]}>
                      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{formatKey(key)}</Text>
                      <Switch
                        value={val as boolean}
                        onValueChange={v => setEditFields(f => ({ ...f, [key]: v }))}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                  );
                }
                if (Array.isArray(val)) return null; // skip arrays for now
                return (
                  <View key={key} style={styles.editField}>
                    <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{formatKey(key)}</Text>
                    <View style={[styles.editInputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                      <TextInput
                        value={val != null ? String(val) : ''}
                        onChangeText={v => setEditFields(f => ({ ...f, [key]: v }))}
                        placeholderTextColor={colors.mutedForeground}
                        style={[styles.editInput, { color: colors.foreground }]}
                        keyboardType={typeof val === 'number' ? 'numeric' : 'default'}
                        multiline={key === 'description'}
                      />
                    </View>
                  </View>
                );
              })
            }
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 6 },
  avatarLarge: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  avatarLargeText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  headerInfo: { flex: 1, gap: 5 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  headerName: { fontSize: 18, fontWeight: '800', color: '#fff', flex: 1 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  roleBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  logoutBtn: { padding: 8 },
  headerEmail: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginBottom: 4 },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12, margin: 16,
    padding: 14, borderRadius: 14, borderWidth: 1,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }, android: { elevation: 2 } }),
  },
  editBtnIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  editBtnText: { flex: 1, fontSize: 15, fontWeight: '600' },

  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  profileCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 13, width: 130, flexShrink: 0 },
  infoValue: { flex: 1, fontSize: 13, fontWeight: '500', textAlign: 'right' },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '600' },
  descBox: { padding: 12, margin: 12, borderRadius: 10 },
  descText: { fontSize: 13, lineHeight: 20 },

  accountCard: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
  accountLabel: { fontSize: 13, flex: 1 },
  accountValue: { fontSize: 13, fontWeight: '500' },
  divider: { height: 1, marginHorizontal: 14 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 12, fontWeight: '700' },

  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalBody: { padding: 20, gap: 16 },
  editField: { gap: 7 },
  fieldLabel: { fontSize: 14, fontWeight: '600' },
  editInputRow: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1 },
  editInput: { fontSize: 15, padding: 0 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
});
