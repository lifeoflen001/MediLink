import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { PHARMACIES } from '@/data/mockData';

function MenuItem({
  icon,
  label,
  onPress,
  value,
  danger,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  value?: string;
  danger?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        { borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.menuIcon, { backgroundColor: danger ? '#FEE2E2' : colors.secondary }]}>
        <Ionicons name={icon} size={19} color={danger ? colors.destructive : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.destructive : colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.menuRight}>
        {value ? <Text style={[styles.menuValue, { color: colors.mutedForeground }]}>{value}</Text> : null}
        <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
      </View>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : 80;
  const { userProfile, updateProfile, reminders, favorites } = useApp();

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(userProfile.name);
  const [editBloodType, setEditBloodType] = useState(userProfile.bloodType);
  const [editAllergies, setEditAllergies] = useState(userProfile.allergies);
  const [editEmergencyContact, setEditEmergencyContact] = useState(userProfile.emergencyContact);
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(userProfile.emergencyPhone);

  const initials = userProfile.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const activeReminders = reminders.filter(r => r.isActive).length;
  const favoritePharmacies = PHARMACIES.filter(p => favorites.includes(p.id));

  const handleSaveProfile = () => {
    updateProfile({
      name: editName.trim() || 'Guest User',
      bloodType: editBloodType.trim(),
      allergies: editAllergies.trim(),
      emergencyContact: editEmergencyContact.trim(),
      emergencyPhone: editEmergencyPhone.trim(),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowEditModal(false);
  };

  const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.primary }]}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatar, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileSubtitle}>Patient</Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setEditName(userProfile.name);
                setEditBloodType(userProfile.bloodType);
                setEditAllergies(userProfile.allergies);
                setEditEmergencyContact(userProfile.emergencyContact);
                setEditEmergencyPhone(userProfile.emergencyPhone);
                setShowEditModal(true);
              }}
              style={styles.editBtn}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Medical info pills */}
          <View style={styles.medInfoRow}>
            {userProfile.bloodType ? (
              <View style={styles.medPill}>
                <Ionicons name="water-outline" size={13} color="#fff" />
                <Text style={styles.medPillText}>{userProfile.bloodType}</Text>
              </View>
            ) : null}
            {userProfile.allergies ? (
              <View style={styles.medPill}>
                <Ionicons name="alert-outline" size={13} color="#fff" />
                <Text style={styles.medPillText} numberOfLines={1}>{userProfile.allergies}</Text>
              </View>
            ) : null}
            {!userProfile.bloodType && !userProfile.allergies && (
              <TouchableOpacity
                onPress={() => setShowEditModal(true)}
                style={styles.medPill}
              >
                <Ionicons name="add" size={13} color="#fff" />
                <Text style={styles.medPillText}>Add medical info</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={{ height: 8 }} />
        </View>

        {/* Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{activeReminders}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Active Reminders</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{favorites.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Saved Pharmacies</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{reminders.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Total Reminders</Text>
          </View>
        </View>

        {/* Favorite Pharmacies */}
        {favoritePharmacies.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Saved Pharmacies</Text>
            {favoritePharmacies.map(p => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: '/pharmacy/[id]', params: { id: p.id } })}
                style={({ pressed }) => [
                  styles.pharmItem,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <View style={[styles.pharmIcon, { backgroundColor: colors.secondary }]}>
                  <Ionicons name="business" size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.pharmName, { color: colors.foreground }]}>{p.name}</Text>
                  <Text style={[styles.pharmAddress, { color: colors.mutedForeground }]}>{p.address}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Menu */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Healthcare</Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MenuItem
              icon="medkit-outline"
              label="Find Medicines"
              onPress={() => router.push('/(tabs)/search')}
              colors={colors}
            />
            <MenuItem
              icon="business-outline"
              label="Nearby Pharmacies"
              onPress={() => router.push({ pathname: '/(tabs)/search', params: { tab: 'pharmacies' } })}
              colors={colors}
            />
            <MenuItem
              icon="chatbubbles-outline"
              label="AI Healthcare Assistant"
              onPress={() => router.push('/(tabs)/chat')}
              colors={colors}
            />
            <MenuItem
              icon="alert-circle-outline"
              label="Emergency"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                router.push('/emergency');
              }}
              danger
              colors={colors}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Emergency Contact</Text>
          <View style={[styles.menuGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {userProfile.emergencyContact ? (
              <MenuItem
                icon="person-circle-outline"
                label={userProfile.emergencyContact}
                value={userProfile.emergencyPhone || 'No phone'}
                onPress={() => setShowEditModal(true)}
                colors={colors}
              />
            ) : (
              <MenuItem
                icon="person-add-outline"
                label="Add Emergency Contact"
                onPress={() => setShowEditModal(true)}
                colors={colors}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={[styles.modalSave, { color: colors.primary }]}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Full Name</Text>
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Blood Type</Text>
              <View style={styles.bloodTypeGrid}>
                {BLOOD_TYPES.map(bt => (
                  <Pressable
                    key={bt}
                    onPress={() => setEditBloodType(bt)}
                    style={[
                      styles.btBtn,
                      {
                        backgroundColor: editBloodType === bt ? colors.primary : colors.muted,
                        borderColor: editBloodType === bt ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.btText, { color: editBloodType === bt ? '#fff' : colors.foreground }]}>
                      {bt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Known Allergies</Text>
              <TextInput
                value={editAllergies}
                onChangeText={setEditAllergies}
                placeholder="e.g. Penicillin, Sulfa drugs"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Emergency Contact Name</Text>
              <TextInput
                value={editEmergencyContact}
                onChangeText={setEditEmergencyContact}
                placeholder="Contact name"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Emergency Contact Phone</Text>
              <TextInput
                value={editEmergencyPhone}
                onChangeText={setEditEmergencyPhone}
                placeholder="+254 700 000 000"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="phone-pad"
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  avatarContainer: {},
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: '800', color: '#fff' },
  profileSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  medInfoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  medPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16 },
  medPillText: { color: '#fff', fontSize: 12, fontWeight: '600', maxWidth: 160 },

  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: -16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 4 },
    }),
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, textAlign: 'center' },
  statDivider: { width: 1, marginVertical: 4 },

  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  menuGroup: { borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, borderBottomWidth: 1 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontSize: 15, flex: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuValue: { fontSize: 13 },

  pharmItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 8, gap: 12 },
  pharmIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: 14, fontWeight: '600' },
  pharmAddress: { fontSize: 12 },

  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalBody: { padding: 20, gap: 20 },
  formField: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  textInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  bloodTypeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, minWidth: 50, alignItems: 'center' },
  btText: { fontSize: 13, fontWeight: '600' },
});
