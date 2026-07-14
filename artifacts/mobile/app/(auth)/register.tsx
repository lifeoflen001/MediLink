import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView,
  Platform, ActivityIndicator, Pressable, Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth, type UserRole } from '@/context/AuthContext';

// ─── Role definitions ─────────────────────────────────────────────────────────

const ROLE_OPTIONS: { role: UserRole; label: string; sub: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { role: 'customer',    label: 'Patient / Customer',      sub: 'Find medicines, set reminders, AI health chat',   icon: 'person-circle-outline' },
  { role: 'hospital',    label: 'Hospital / Clinic',        sub: 'List your facility, departments & services',      icon: 'business-outline' },
  { role: 'pharmacy',    label: 'Pharmacy',                 sub: 'Manage inventory, operating hours & delivery',    icon: 'medkit-outline' },
  { role: 'supplier',    label: 'Medical Supplier',         sub: 'Showcase products & reach healthcare clients',    icon: 'cube-outline' },
  { role: 'doctor',      label: 'Private Doctor',           sub: 'Build your profile & connect with patients',      icon: 'medical-outline' },
  { role: 'institution', label: 'Health Institution/Forum', sub: 'Share research, news & connect with the network', icon: 'people-outline' },
];

const COUNTIES = ['Nairobi','Mombasa','Kisumu','Nakuru','Eldoret','Thika','Malindi','Kitale','Garissa','Nyeri','Other'];
const SPECIALIZATIONS = ['General Practice','Cardiology','Pediatrics','Obstetrics','Surgery','Orthopedics','Dermatology','Psychiatry','Oncology','Neurology','Ophthalmology','Other'];
const HOSPITAL_TYPES = ['General Hospital','Specialist Clinic','Maternity Clinic','Dental Clinic','Referral Hospital','Nursing Home','Other'];
const INSTITUTION_TYPES = ['Research Institute','Health Insurance','NGO / Non-Profit','Online Forum','Medical Association','Government Agency','Other'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(0); // 0=role 1=credentials 2=profile 3=done
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Credentials
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('');
  const [gender, setGender] = useState('');
  // Hospital
  const [institutionName, setInstitutionName] = useState('');
  const [hospitalType, setHospitalType] = useState('');
  const [address, setAddress] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [hasEmergency, setHasEmergency] = useState(false);
  // Pharmacy
  const [pharmacyName, setPharmacyName] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [hasDelivery, setHasDelivery] = useState(false);
  const [is24h, setIs24h] = useState(false);
  // Supplier
  const [companyName, setCompanyName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  // Doctor
  const [specialization, setSpecialization] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [yearsExp, setYearsExp] = useState('');
  const [consultationFee, setConsultationFee] = useState('');
  // Institution
  const [institutionType, setInstitutionType] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Navigation ──────────────────────────────────────────────────────────────

  function next() {
    setError('');
    if (step === 0) {
      if (!selectedRole) { setError('Please select your account type.'); return; }
    }
    if (step === 1) {
      if (!email.trim()) { setError('Email is required.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(s => s + 1);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 50);
  }

  function back() {
    if (step === 0) { router.back(); return; }
    setError('');
    setStep(s => s - 1);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!selectedRole) return;
    setError('');

    // Validate required profile field
    const requiredName = getRequiredName();
    if (!requiredName.trim()) {
      setError(`${getNameLabel()} is required.`);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await register({
        email: email.trim(),
        password,
        role: selectedRole,
        profile: buildProfile(),
      });
      setStep(3);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      setError(err.message ?? 'Registration failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  }

  function getRequiredName(): string {
    switch (selectedRole) {
      case 'customer': return fullName;
      case 'hospital': return institutionName;
      case 'pharmacy': return pharmacyName;
      case 'supplier': return companyName;
      case 'doctor': return fullName;
      case 'institution': return institutionName;
      default: return '';
    }
  }

  function getNameLabel(): string {
    switch (selectedRole) {
      case 'customer':
      case 'doctor': return 'Full name';
      case 'hospital':
      case 'institution': return 'Institution name';
      case 'pharmacy': return 'Pharmacy name';
      case 'supplier': return 'Company name';
      default: return 'Name';
    }
  }

  function buildProfile(): Record<string, unknown> {
    switch (selectedRole) {
      case 'customer': return { fullName, phone, county, gender };
      case 'hospital': return { institutionName, hospitalType, address, county, phone, contactEmail, licenseNumber, hasEmergency };
      case 'pharmacy': return { pharmacyName, licenseNumber, address, county, phone, operatingHours, hasDelivery, is24h };
      case 'supplier': return { companyName, registrationNumber: regNumber, address, county, phone, contactEmail };
      case 'doctor': return { fullName, licenseNumber, specialization, hospitalAffiliation, county, phone, yearsExperience: yearsExp ? parseInt(yearsExp) : null, consultationFee: consultationFee ? parseInt(consultationFee) : null };
      case 'institution': return { institutionName, institutionType, address, county, phone, contactEmail, description, website };
      default: return {};
    }
  }

  // ── Rendering ───────────────────────────────────────────────────────────────

  const STEPS = ['Account type', 'Credentials', 'Profile', 'Done'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={back} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.foreground }]}>Create Account</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      {step < 3 && (
        <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${((step + 1) / 3) * 100}%` }]} />
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {step === 0 && <StepRole selected={selectedRole} onSelect={r => { setSelectedRole(r); setError(''); }} colors={colors} />}
        {step === 1 && <StepCredentials email={email} setEmail={setEmail} password={password} setPassword={setPassword} confirmPw={confirmPw} setConfirmPw={setConfirmPw} showPw={showPw} setShowPw={setShowPw} colors={colors} />}
        {step === 2 && (
          <StepProfile
            role={selectedRole!}
            colors={colors}
            {...{ fullName, setFullName, phone, setPhone, county, setCounty, gender, setGender, institutionName, setInstitutionName, hospitalType, setHospitalType, address, setAddress, licenseNumber, setLicenseNumber, contactEmail, setContactEmail, hasEmergency, setHasEmergency, pharmacyName, setPharmacyName, operatingHours, setOperatingHours, hasDelivery, setHasDelivery, is24h, setIs24h, companyName, setCompanyName, regNumber, setRegNumber, specialization, setSpecialization, hospitalAffiliation, setHospitalAffiliation, yearsExp, setYearsExp, consultationFee, setConsultationFee, institutionType, setInstitutionType, description, setDescription, website, setWebsite }}
          />
        )}
        {step === 3 && <StepDone role={selectedRole!} colors={colors} />}

        {/* Error */}
        {error ? (
          <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorText }]}>
            <Ionicons name="alert-circle-outline" size={15} color={colors.errorText} />
            <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text>
          </View>
        ) : null}

        {/* Actions */}
        {step < 2 && (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={next} activeOpacity={0.88}>
            <Text style={styles.primaryBtnText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        )}
        {step === 2 && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: loading ? colors.muted : colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <><Text style={styles.primaryBtnText}>Create Account</Text><Ionicons name="checkmark" size={18} color="#fff" /></>
            }
          </TouchableOpacity>
        )}
        {step < 3 && (
          <View style={styles.footerRow}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Step components ──────────────────────────────────────────────────────────

function StepRole({ selected, onSelect, colors }: { selected: UserRole | null; onSelect: (r: UserRole) => void; colors: any }) {
  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>Who are you?</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Select the account type that best describes you</Text>
      <View style={styles.roleGrid}>
        {ROLE_OPTIONS.map(opt => (
          <Pressable
            key={opt.role}
            onPress={() => onSelect(opt.role)}
            style={({ pressed }) => [
              styles.roleCard,
              { backgroundColor: selected === opt.role ? colors.secondary : colors.card, borderColor: selected === opt.role ? colors.primary : colors.border, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <View style={[styles.roleIconBox, { backgroundColor: selected === opt.role ? colors.primary : colors.muted }]}>
              <Ionicons name={opt.icon} size={22} color={selected === opt.role ? '#fff' : colors.mutedForeground} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.roleLabel, { color: colors.foreground }]}>{opt.label}</Text>
              <Text style={[styles.roleSub, { color: colors.mutedForeground }]} numberOfLines={2}>{opt.sub}</Text>
            </View>
            {selected === opt.role && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function StepCredentials({ email, setEmail, password, setPassword, confirmPw, setConfirmPw, showPw, setShowPw, colors }: any) {
  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>Account Details</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Set up your login credentials</Text>
      <View style={styles.fields}>
        <FormField label="Email address" colors={colors}>
          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="mail-outline" size={17} color={colors.mutedForeground} />
            <TextInput value={email} onChangeText={setEmail} placeholder="you@example.com" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} keyboardType="email-address" autoCapitalize="none" />
          </View>
        </FormField>
        <FormField label="Password" colors={colors}>
          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={17} color={colors.mutedForeground} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Minimum 8 characters" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} secureTextEntry={!showPw} />
            <TouchableOpacity onPress={() => setShowPw((p: boolean) => !p)}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={17} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        </FormField>
        <FormField label="Confirm Password" colors={colors}>
          <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="lock-closed-outline" size={17} color={colors.mutedForeground} />
            <TextInput value={confirmPw} onChangeText={setConfirmPw} placeholder="Repeat password" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} secureTextEntry={!showPw} />
          </View>
        </FormField>
      </View>
    </View>
  );
}

function StepProfile({ role, colors, ...fields }: any) {
  const iRow = (label: string, value: string, setter: (v: string) => void, opts?: { kb?: any; ph?: string }) => (
    <FormField label={label} colors={colors}>
      <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
        <TextInput value={value} onChangeText={setter} placeholder={opts?.ph ?? ''} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} keyboardType={opts?.kb} />
      </View>
    </FormField>
  );

  const toggleRow = (label: string, value: boolean, setter: (v: boolean) => void) => (
    <View style={[styles.toggleRow, { borderColor: colors.border }]}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      <Switch value={value} onValueChange={setter} trackColor={{ false: colors.border, true: colors.primary }} thumbColor="#fff" />
    </View>
  );

  const chipField = (label: string, opts: string[], value: string, setter: (v: string) => void) => (
    <FormField label={label} colors={colors}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {opts.map(o => (
          <Pressable key={o} onPress={() => setter(o)} style={[styles.chip, { backgroundColor: value === o ? colors.primary : colors.muted, borderColor: value === o ? colors.primary : colors.border }]}>
            <Text style={[styles.chipText, { color: value === o ? '#fff' : colors.foreground }]}>{o}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </FormField>
  );

  const title = role === 'customer' ? 'Patient / Customer' : role === 'hospital' ? 'Hospital / Clinic' : role === 'pharmacy' ? 'Pharmacy' : role === 'supplier' ? 'Medical Supplier' : role === 'doctor' ? 'Private Doctor' : 'Health Institution';

  return (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: colors.foreground }]}>Profile Details</Text>
      <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Complete your {title} profile</Text>
      <View style={styles.fields}>
        {role === 'customer' && <>
          {iRow('Full Name *', fields.fullName, fields.setFullName, { ph: 'Your full name' })}
          {iRow('Phone', fields.phone, fields.setPhone, { kb: 'phone-pad', ph: '+254 700 000 000' })}
          {chipField('County', COUNTIES, fields.county, fields.setCounty)}
          {chipField('Gender', ['Male', 'Female', 'Other', 'Prefer not to say'], fields.gender, fields.setGender)}
        </>}

        {role === 'hospital' && <>
          {iRow('Institution Name *', fields.institutionName, fields.setInstitutionName, { ph: 'e.g. Nairobi General Hospital' })}
          {chipField('Hospital Type', HOSPITAL_TYPES, fields.hospitalType, fields.setHospitalType)}
          {iRow('Address', fields.address, fields.setAddress, { ph: 'Street / Building' })}
          {chipField('County', COUNTIES, fields.county, fields.setCounty)}
          {iRow('Phone', fields.phone, fields.setPhone, { kb: 'phone-pad', ph: '+254 700 000 000' })}
          {iRow('Contact Email', fields.contactEmail, fields.setContactEmail, { kb: 'email-address', ph: 'info@hospital.com' })}
          {iRow('License Number', fields.licenseNumber, fields.setLicenseNumber, { ph: 'MOH-XXXX' })}
          {toggleRow('Has Emergency Services', fields.hasEmergency, fields.setHasEmergency)}
        </>}

        {role === 'pharmacy' && <>
          {iRow('Pharmacy Name *', fields.pharmacyName, fields.setPharmacyName, { ph: 'e.g. Goodlife Pharmacy' })}
          {iRow('License Number', fields.licenseNumber, fields.setLicenseNumber, { ph: 'PPB-XXXX' })}
          {iRow('Address', fields.address, fields.setAddress, { ph: 'Street / Building' })}
          {chipField('County', COUNTIES, fields.county, fields.setCounty)}
          {iRow('Phone', fields.phone, fields.setPhone, { kb: 'phone-pad', ph: '+254 700 000 000' })}
          {iRow('Operating Hours', fields.operatingHours, fields.setOperatingHours, { ph: 'Mon–Fri 8AM–8PM' })}
          {toggleRow('Offers Delivery', fields.hasDelivery, fields.setHasDelivery)}
          {toggleRow('Open 24 Hours', fields.is24h, fields.setIs24h)}
        </>}

        {role === 'supplier' && <>
          {iRow('Company Name *', fields.companyName, fields.setCompanyName, { ph: 'e.g. MedSupply Kenya Ltd' })}
          {iRow('Registration Number', fields.regNumber, fields.setRegNumber, { ph: 'CPR-XXXX' })}
          {iRow('Address', fields.address, fields.setAddress, { ph: 'Street / Building' })}
          {chipField('County', COUNTIES, fields.county, fields.setCounty)}
          {iRow('Phone', fields.phone, fields.setPhone, { kb: 'phone-pad', ph: '+254 700 000 000' })}
          {iRow('Contact Email', fields.contactEmail, fields.setContactEmail, { kb: 'email-address', ph: 'sales@supplier.com' })}
        </>}

        {role === 'doctor' && <>
          {iRow('Full Name *', fields.fullName, fields.setFullName, { ph: 'Dr. John Kamau' })}
          {iRow('License Number', fields.licenseNumber, fields.setLicenseNumber, { ph: 'KMPDC-XXXX' })}
          {chipField('Specialization', SPECIALIZATIONS, fields.specialization, fields.setSpecialization)}
          {iRow('Hospital Affiliation', fields.hospitalAffiliation, fields.setHospitalAffiliation, { ph: 'Kenyatta National Hospital' })}
          {chipField('County', COUNTIES, fields.county, fields.setCounty)}
          {iRow('Phone', fields.phone, fields.setPhone, { kb: 'phone-pad', ph: '+254 700 000 000' })}
          {iRow('Years of Experience', fields.yearsExp, fields.setYearsExp, { kb: 'numeric', ph: '0' })}
          {iRow('Consultation Fee (KES)', fields.consultationFee, fields.setConsultationFee, { kb: 'numeric', ph: '0' })}
        </>}

        {role === 'institution' && <>
          {iRow('Institution Name *', fields.institutionName, fields.setInstitutionName, { ph: 'e.g. Kenya Medical Research Institute' })}
          {chipField('Institution Type', INSTITUTION_TYPES, fields.institutionType, fields.setInstitutionType)}
          {iRow('Address', fields.address, fields.setAddress, { ph: 'Street / Building' })}
          {chipField('County', COUNTIES, fields.county, fields.setCounty)}
          {iRow('Phone', fields.phone, fields.setPhone, { kb: 'phone-pad', ph: '+254 700 000 000' })}
          {iRow('Contact Email', fields.contactEmail, fields.setContactEmail, { kb: 'email-address', ph: 'info@institution.org' })}
          {iRow('Website', fields.website, fields.setWebsite, { ph: 'https://institution.org' })}
          <FormField label="Description" colors={colors}>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border, alignItems: 'flex-start', paddingTop: 12 }]}>
              <TextInput value={fields.description} onChangeText={fields.setDescription} placeholder="Brief description of your institution..." placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, minHeight: 80 }]} multiline numberOfLines={4} />
            </View>
          </FormField>
        </>}
      </View>
    </View>
  );
}

function StepDone({ role, colors }: { role: UserRole; colors: any }) {
  const label = ROLE_OPTIONS.find(r => r.role === role)?.label ?? 'your account';
  return (
    <View style={styles.doneContainer}>
      <View style={[styles.doneCircle, { backgroundColor: colors.secondary }]}>
        <Ionicons name="checkmark-circle" size={64} color={colors.primary} />
      </View>
      <Text style={[styles.doneTitle, { color: colors.foreground }]}>You're all set!</Text>
      <Text style={[styles.doneSub, { color: colors.mutedForeground }]}>
        Your {label} account is ready. Welcome to MediConnect.
      </Text>
      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 24 }]}
        onPress={() => router.replace('/(tabs)')}
        activeOpacity={0.88}
      >
        <Text style={styles.primaryBtnText}>Go to App</Text>
        <Ionicons name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

function FormField({ label, children, colors }: { label: string; children: React.ReactNode; colors: any }) {
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.foreground }]}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '700' },
  progressBar: { height: 3 },
  progressFill: { height: 3 },
  body: { padding: 20 },

  stepContainer: { marginBottom: 20 },
  stepTitle: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  stepSub: { fontSize: 14, lineHeight: 20, marginBottom: 20 },

  roleGrid: { gap: 10 },
  roleCard: {
    flexDirection: 'row', alignItems: 'center', padding: 14,
    borderRadius: 14, borderWidth: 1.5, gap: 12,
  },
  roleIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  roleSub: { fontSize: 11, lineHeight: 16 },

  fields: { gap: 16 },
  field: { gap: 7 },
  fieldLabel: { fontSize: 14, fontWeight: '600' },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1,
  },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1,
  },
  chipText: { fontSize: 13, fontWeight: '600' },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 12, borderWidth: 1, marginBottom: 14,
  },
  errorText: { flex: 1, fontSize: 14 },

  primaryBtn: {
    borderRadius: 14, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginBottom: 14,
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 4 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },

  doneContainer: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  doneCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  doneTitle: { fontSize: 26, fontWeight: '800' },
  doneSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 16 },
});
