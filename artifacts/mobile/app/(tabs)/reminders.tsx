import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useApp, type Reminder } from '@/context/AppContext';

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'As needed'];
const TIMES_MAP: Record<string, string[]> = {
  'Once daily': ['08:00'],
  'Twice daily': ['08:00', '20:00'],
  'Three times daily': ['08:00', '14:00', '20:00'],
  'Every 8 hours': ['06:00', '14:00', '22:00'],
  'Every 12 hours': ['08:00', '20:00'],
  'As needed': [],
};

function ReminderCard({ reminder, onToggle, onDelete, colors }: {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.reminderCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: reminder.isActive ? 1 : 0.6,
        },
      ]}
    >
      <View style={[styles.reminderIcon, { backgroundColor: reminder.isActive ? colors.secondary : colors.muted }]}>
        <Ionicons name="alarm-outline" size={22} color={reminder.isActive ? colors.primary : colors.mutedForeground} />
      </View>
      <View style={styles.reminderContent}>
        <Text style={[styles.reminderName, { color: colors.foreground }]} numberOfLines={1}>
          {reminder.medicineName}
        </Text>
        <Text style={[styles.reminderDosage, { color: colors.mutedForeground }]}>
          {reminder.dosage} • {reminder.frequency}
        </Text>
        {reminder.times.length > 0 && (
          <View style={styles.timesRow}>
            {reminder.times.map(t => (
              <View key={t} style={[styles.timePill, { backgroundColor: colors.muted }]}>
                <Ionicons name="time-outline" size={11} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.foreground }]}>{t}</Text>
              </View>
            ))}
          </View>
        )}
        {reminder.notes ? (
          <Text style={[styles.reminderNote, { color: colors.mutedForeground }]} numberOfLines={1}>
            {reminder.notes}
          </Text>
        ) : null}
      </View>
      <View style={styles.reminderActions}>
        <Switch
          value={reminder.isActive}
          onValueChange={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggle();
          }}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#fff"
        />
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onDelete();
          }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color={colors.destructive} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RemindersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 + 84 : 80;
  const { reminders, addReminder, toggleReminder, deleteReminder } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setMedicineName('');
    setDosage('');
    setFrequency('Once daily');
    setNotes('');
  };

  const handleAdd = () => {
    if (!medicineName.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addReminder({
      medicineName: medicineName.trim(),
      dosage: dosage.trim() || 'As prescribed',
      frequency,
      times: TIMES_MAP[frequency] ?? [],
      notes: notes.trim(),
      isActive: true,
    });
    setShowModal(false);
    resetForm();
  };

  const activeCount = reminders.filter(r => r.isActive).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Reminders</Text>
        {activeCount > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.countText, { color: colors.primary }]}>{activeCount} active</Text>
          </View>
        )}
      </View>

      {reminders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="alarm-outline" size={56} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No reminders yet</Text>
          <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
            Add a reminder to track your medication schedule
          </Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={item => item.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ReminderCard
              reminder={item}
              colors={colors}
              onToggle={() => toggleReminder(item.id)}
              onDelete={() => deleteReminder(item.id)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setShowModal(true);
        }}
        style={[styles.fab, { backgroundColor: colors.primary, bottom: bottomPad - 20 }]}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add Reminder Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="formSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
              <Text style={[styles.modalCancel, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Reminder</Text>
            <TouchableOpacity onPress={handleAdd} disabled={!medicineName.trim()}>
              <Text style={[styles.modalSave, { color: medicineName.trim() ? colors.primary : colors.mutedForeground }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Medicine Name *</Text>
              <TextInput
                value={medicineName}
                onChangeText={setMedicineName}
                placeholder="e.g. Amoxicillin 500mg"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Dosage</Text>
              <TextInput
                value={dosage}
                onChangeText={setDosage}
                placeholder="e.g. 1 tablet, 500mg"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
              />
            </View>

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Frequency</Text>
              <View style={styles.freqGrid}>
                {FREQUENCIES.map(f => (
                  <Pressable
                    key={f}
                    onPress={() => setFrequency(f)}
                    style={[
                      styles.freqBtn,
                      {
                        backgroundColor: frequency === f ? colors.primary : colors.muted,
                        borderColor: frequency === f ? colors.primary : colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.freqText, { color: frequency === f ? '#fff' : colors.foreground }]}>
                      {f}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {TIMES_MAP[frequency] && TIMES_MAP[frequency].length > 0 && (
              <View style={[styles.timesPreview, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.timesPreviewLabel, { color: colors.secondaryForeground }]}>
                  Reminder times:
                </Text>
                <View style={styles.timesRow}>
                  {TIMES_MAP[frequency].map(t => (
                    <View key={t} style={[styles.timePill, { backgroundColor: colors.card }]}>
                      <Ionicons name="time-outline" size={11} color={colors.primary} />
                      <Text style={[styles.timeText, { color: colors.foreground }]}>{t}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.formField}>
              <Text style={[styles.label, { color: colors.foreground }]}>Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="e.g. Take with food"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.textInput, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                multiline
                numberOfLines={3}
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
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerTitle: { fontSize: 28, fontWeight: '800', flex: 1 },
  countBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '600' },
  list: { paddingTop: 12, gap: 2 },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  reminderIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  reminderContent: { flex: 1, gap: 4 },
  reminderName: { fontSize: 15, fontWeight: '600' },
  reminderDosage: { fontSize: 12 },
  timesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  timePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  timeText: { fontSize: 11, fontWeight: '600' },
  reminderNote: { fontSize: 12, fontStyle: 'italic' },
  reminderActions: { alignItems: 'center', gap: 8 },
  deleteBtn: { padding: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 6 },
    }),
  },
  // Modal
  modal: { flex: 1 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSave: { fontSize: 16, fontWeight: '700' },
  modalBody: { padding: 20, gap: 20 },
  formField: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  textInput: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  freqGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  freqBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  freqText: { fontSize: 13, fontWeight: '500' },
  timesPreview: { padding: 12, borderRadius: 12, gap: 8 },
  timesPreviewLabel: { fontSize: 13, fontWeight: '600' },
});
