import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, Linking, Alert, useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp } from '@/context/AppContext';
import { PHARMACIES } from '@/data/mockData';

const EMERGENCY_NUMBERS = [
  { label: 'Kenya Emergency', number: '999', icon: 'call' as const },
  { label: 'Ambulance (KRcs)', number: '1199', icon: 'medical' as const },
  { label: 'Police', number: '999', icon: 'shield-checkmark' as const },
];

// Emergency red — intentionally stays vivid regardless of dark mode
const ER = {
  primary: '#DC2626',
  bg: '#FEE2E2',
  darkBg: '#2D0A0A',
  text: '#991B1B',
  darkText: '#FCA5A5',
};

export default function EmergencyScreen() {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;
  const { userProfile } = useApp();

  const erText = isDark ? ER.darkText : ER.text;
  const erBg = isDark ? ER.darkBg : ER.bg;

  const nearestEmergencyPharmacy = PHARMACIES.find(p => p.hasEmergency && p.isOpen);

  const handleCall = (number: string, label: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      `Call ${label}?`,
      `You are about to call ${number}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Call ${number}`,
          style: 'destructive',
          onPress: () => Linking.openURL(`tel:${number}`),
        },
      ]
    );
  };

  const handleCallPharmacy = () => {
    if (!nearestEmergencyPharmacy) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Linking.openURL(`tel:${nearestEmergencyPharmacy.phone}`).catch(() =>
      Alert.alert('Cannot make call', 'Please dial ' + nearestEmergencyPharmacy.phone)
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: ER.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* SOS Banner */}
        <View style={styles.sosBanner}>
          <View style={[styles.sosIcon, { backgroundColor: ER.primary }]}>
            <Ionicons name="alert-circle" size={40} color="#fff" />
          </View>
          <Text style={[styles.sosTitle, { color: ER.primary }]}>Emergency Mode</Text>
          <Text style={[styles.sosSubtitle, { color: colors.mutedForeground }]}>
            Call emergency services or find the nearest healthcare facility
          </Text>
        </View>

        {/* Emergency Numbers */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: ER.primary }]}>Emergency Numbers</Text>
          {EMERGENCY_NUMBERS.map(item => (
            <TouchableOpacity
              key={item.number + item.label}
              style={styles.emergencyRow}
              onPress={() => handleCall(item.number, item.label)}
              accessibilityLabel={`Call ${item.label} at ${item.number}`}
              accessibilityRole="button"
            >
              <View style={[styles.emergencyIcon, { backgroundColor: erBg }]}>
                <Ionicons name={item.icon} size={20} color={ER.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.emergencyLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.emergencyNumber, { color: ER.primary }]}>{item.number}</Text>
              </View>
              <View style={[styles.callBtn, { backgroundColor: ER.primary }]}>
                <Ionicons name="call" size={16} color="#fff" />
                <Text style={styles.callBtnText}>Call</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Your Medical Info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Your Medical Information</Text>
          <View style={styles.medInfoGrid}>
            <View style={[styles.medInfoItem, { backgroundColor: colors.muted }]}>
              <Ionicons name="water-outline" size={18} color={ER.primary} />
              <Text style={[styles.medInfoLabel, { color: colors.mutedForeground }]}>Blood Type</Text>
              <Text style={[styles.medInfoValue, { color: colors.foreground }]}>
                {userProfile.bloodType || 'Not set'}
              </Text>
            </View>
            <View style={[styles.medInfoItem, { backgroundColor: colors.muted }]}>
              <Ionicons name="person-outline" size={18} color={ER.primary} />
              <Text style={[styles.medInfoLabel, { color: colors.mutedForeground }]}>Name</Text>
              <Text style={[styles.medInfoValue, { color: colors.foreground }]}>{userProfile.name}</Text>
            </View>
          </View>
          {userProfile.allergies ? (
            <View style={[styles.allergyBox, { backgroundColor: colors.warningBg, borderColor: colors.border }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.warningText} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.allergyLabel, { color: colors.warningText }]}>Known Allergies</Text>
                <Text style={[styles.allergyValue, { color: colors.foreground }]}>{userProfile.allergies}</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              style={[styles.addMedInfo, { backgroundColor: colors.muted, borderColor: colors.border }]}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.addMedInfoText, { color: colors.primary }]}>
                Add medical info in Profile
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Emergency Contact */}
        {userProfile.emergencyContact ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Emergency Contact</Text>
            <View style={styles.contactRow}>
              <View style={[styles.contactIcon, { backgroundColor: colors.secondary }]}>
                <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.contactName, { color: colors.foreground }]}>{userProfile.emergencyContact}</Text>
                <Text style={[styles.contactPhone, { color: colors.mutedForeground }]}>
                  {userProfile.emergencyPhone || 'No phone saved'}
                </Text>
              </View>
              {userProfile.emergencyPhone ? (
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    Linking.openURL(`tel:${userProfile.emergencyPhone}`);
                  }}
                  style={[styles.callBtn, { backgroundColor: colors.primary }]}
                >
                  <Ionicons name="call" size={16} color="#fff" />
                  <Text style={styles.callBtnText}>Call</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.contactRow}
            >
              <View style={[styles.contactIcon, { backgroundColor: colors.muted }]}>
                <Ionicons name="person-add-outline" size={22} color={colors.mutedForeground} />
              </View>
              <Text style={[styles.addEmergencyText, { color: colors.primary }]}>
                Add an emergency contact in Profile
              </Text>
              <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        )}

        {/* Nearest 24h Pharmacy */}
        {nearestEmergencyPharmacy && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Nearest 24h Emergency Pharmacy</Text>
            <View style={styles.pharmRow}>
              <View style={[styles.pharmIconBox, { backgroundColor: colors.secondary }]}>
                <Ionicons name="business" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.pharmName, { color: colors.foreground }]}>{nearestEmergencyPharmacy.name}</Text>
                <Text style={[styles.pharmAddress, { color: colors.mutedForeground }]}>
                  {nearestEmergencyPharmacy.address}
                </Text>
                <Text style={[styles.pharmDist, { color: colors.primary }]}>
                  {nearestEmergencyPharmacy.distance} km away
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCallPharmacy}
              style={[styles.pharmCallBtn, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="call" size={18} color="#fff" />
              <Text style={styles.pharmCallText}>Call Pharmacy</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Disclaimer */}
        <View style={[styles.disclaimer, { backgroundColor: colors.warningBg, borderColor: colors.border }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.warningText} />
          <Text style={[styles.disclaimerText, { color: colors.warningText }]}>
            In a life-threatening emergency, call emergency services immediately. Do not delay seeking professional help.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 14, justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },

  content: { padding: 16, gap: 16 },

  sosBanner: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  sosIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  sosTitle: { fontSize: 24, fontWeight: '800' },
  sosSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },

  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },

  emergencyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emergencyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emergencyLabel: { fontSize: 14, fontWeight: '600' },
  emergencyNumber: { fontSize: 20, fontWeight: '800' },
  callBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  callBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  medInfoGrid: { flexDirection: 'row', gap: 10 },
  medInfoItem: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  medInfoLabel: { fontSize: 11, fontWeight: '600' },
  medInfoValue: { fontSize: 16, fontWeight: '700' },
  allergyBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  allergyLabel: { fontSize: 11, fontWeight: '600' },
  allergyValue: { fontSize: 14, fontWeight: '500', marginTop: 2 },
  addMedInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  addMedInfoText: { fontSize: 14, fontWeight: '600' },

  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  contactIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  contactName: { fontSize: 15, fontWeight: '600' },
  contactPhone: { fontSize: 13 },
  addEmergencyText: { flex: 1, fontSize: 14, fontWeight: '600' },

  pharmRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pharmIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pharmName: { fontSize: 15, fontWeight: '600' },
  pharmAddress: { fontSize: 12 },
  pharmDist: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  pharmCallBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 13, borderRadius: 12 },
  pharmCallText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 14, borderRadius: 12, borderWidth: 1 },
  disclaimerText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
