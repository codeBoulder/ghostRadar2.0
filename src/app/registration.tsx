import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CATEGORIES, INVITE_CODE } from '../data/content';
import { createSession } from '../lib/session';
import { Btn, Mono } from '../ui/components';
import { colors, fonts, radius, space } from '../ui/theme';

function Field({ label, error, ...input }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={styles.field}>
      <Mono style={styles.fieldLabel}>{label}</Mono>
      <TextInput
        {...input}
        placeholderTextColor={colors.textFaint}
        selectionColor={colors.accent}
        autoCorrect={false}
        style={[styles.input, error ? styles.inputError : null]}
      />
      {error ? <Mono style={styles.errorText}>{error}</Mono> : null}
    </View>
  );
}

export default function RegistrationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [code, setCode] = useState('');
  const [callsign, setCallsign] = useState('');
  const [age, setAge] = useState('');
  const [categories, setCategories] = useState<string[]>(['Страх']);
  const [agreed, setAgreed] = useState(false);
  const [codeError, setCodeError] = useState(false);

  const validCallsign = callsign.trim().length >= 2;
  const validAge = age.length > 0 && Number(age) >= 10 && Number(age) <= 99;
  const canSubmit =
    code.trim().length > 0 && validCallsign && validAge && categories.length > 0 && agreed;

  const toggleCategory = (c: string) =>
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const submit = () => {
    if (!canSubmit) return;

    const entered = code.trim().toUpperCase();
    const codeOk = INVITE_CODE ? entered === INVITE_CODE.toUpperCase() : entered.length >= 4;
    if (!codeOk) {
      setCodeError(true);
      return;
    }

    createSession({ callsign: callsign.trim(), age, categories });
    router.replace('/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
        ]}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/no_bg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Mono bold style={styles.title}>
              Доступ до сховища
            </Mono>
            <Mono style={styles.subtitle}>Закритий ресурс. Вхід за запрошенням.</Mono>
          </View>
        </View>

        <Field
          label="Код доступу"
          placeholder="XXXX-XXXX"
          autoCapitalize="characters"
          value={code}
          onChangeText={(v) => {
            setCode(v);
            setCodeError(false);
          }}
          error={codeError ? 'Код недійсний або вже використаний.' : undefined}
        />

        <Field
          label="Ім'я"
          placeholder="Ім’я"
          autoCapitalize="none"
          maxLength={24}
          value={callsign}
          onChangeText={setCallsign}
        />

        <Field
          label="Вік"
          placeholder="Повних років"
          keyboardType="number-pad"
          maxLength={2}
          value={age}
          onChangeText={(v) => setAge(v.replace(/\D/g, ''))}
        />

        <View style={styles.field}>
          <Mono style={styles.fieldLabel}>Категорії записів</Mono>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => {
              const active = categories.includes(c);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggleCategory(c)}
                  style={[styles.chip, active && styles.chipActive]}>
                  <Mono style={[styles.chipText, active && styles.chipTextActive]}>
                    {active ? '■' : '□'} {c}
                  </Mono>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.terms}>
          <Mono style={styles.termsText}>
            Доступ надається добровільно й на власний ризик. Матеріали не підлягають розголошенню,
            копіюванню та пересиланню. Власник ресурсу за наслідки не відповідає.
          </Mono>
          <Pressable style={styles.agreeRow} onPress={() => setAgreed((v) => !v)}>
            <View style={[styles.checkbox, agreed && styles.checkboxOn]}>
              {agreed ? <Ionicons name="checkmark" size={14} color={colors.bg} /> : null}
            </View>
            <Mono style={styles.agreeText}>Я ознайомився з умовами доступу</Mono>
          </Pressable>
        </View>

        <Btn label="Створити сеанс" onPress={submit} disabled={!canSubmit} />

        <Mono style={styles.version}>v0.9.3-beta, build 2917</Mono>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1, paddingHorizontal: space.xl, justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', gap: space.lg, marginBottom: space.xl },
  logo: { width: 90, height: 90 },
  headerText: { flex: 1, gap: 4 },
  title: { fontSize: 18 },
  subtitle: { color: colors.textDim, fontSize: 12 },

  field: { marginBottom: space.lg },
  fieldLabel: { color: colors.textDim, fontSize: 12, marginBottom: 6 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    color: colors.text,
    fontFamily: fonts.mono,
    fontSize: 14,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginTop: 6 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    paddingVertical: 8,
    paddingHorizontal: space.md,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accentDim },
  chipText: { color: colors.textDim, fontSize: 12 },
  chipTextActive: { color: colors.text },

  terms: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius,
    padding: space.md,
    marginBottom: space.lg,
    gap: space.md,
  },
  termsText: { color: colors.textFaint, fontSize: 11, lineHeight: 17 },
  agreeRow: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  agreeText: { color: colors.textDim, fontSize: 12, flex: 1 },

  version: { color: colors.textFaint, fontSize: 11, textAlign: 'center', marginTop: space.xl },
});
