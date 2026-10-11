import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { hhmmss } from '../lib/format';
import { colors, fonts, radius, space } from './theme';

/** Моноширинний текст для даних, ідентифікаторів і службових рядків. */
export function Mono({ style, bold, ...rest }: TextProps & { bold?: boolean }) {
  return <Text {...rest} style={[styles.mono, bold && styles.monoBold, style]} />;
}

type BtnProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Btn({ label, onPress, variant = 'primary', disabled, style }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' ? styles.btnPrimary : styles.btnOutline,
        disabled && styles.btnDisabled,
        pressed && !disabled && styles.btnPressed,
        style,
      ]}>
      <Mono
        bold
        style={[
          styles.btnText,
          { color: variant === 'primary' ? colors.bg : colors.text },
          disabled && { color: colors.textFaint },
        ]}>
        {label}
      </Mono>
    </Pressable>
  );
}

/** Рядок таблиці «поле: значення». */
export function Row({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.row}>
      <Mono style={styles.rowLabel}>{label}</Mono>
      <Mono style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>{value}</Mono>
    </View>
  );
}

/** Заголовок розділу з тонкою лінією. */
export function Section({ title, right }: { title: string; right?: string }) {
  return (
    <View style={styles.section}>
      <Mono style={styles.sectionText}>{title}</Mono>
      <View style={styles.sectionLine} />
      {right ? <Mono style={styles.sectionText}>{right}</Mono> : null}
    </View>
  );
}

/** Звичайний текст, у якому фрагменти [[так]] показуються як закреслені. */
export function RedactedText({
  text,
  style,
}: {
  text: string;
  style?: StyleProp<TextStyle>;
}) {
  const parts = text.split(/(\[\[.*?\]\])/g).filter((p) => p.length > 0);
  return (
    <Text style={[styles.body, style]}>
      {parts.map((part, i) =>
        part.startsWith('[[') && part.endsWith(']]') ? (
          <Text key={i} style={styles.redacted}>
            {part.slice(2, -2)}
          </Text>
        ) : (
          part
        ),
      )}
    </Text>
  );
}

/** Курсор, що блимає. */
export function Cursor() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <Mono style={{ color: colors.accent, opacity: on ? 1 : 0 }}>█</Mono>;
}

/** Годинник. Оновлює тільки себе, а не весь екран. */
export function Clock({ style }: { style?: StyleProp<TextStyle> }) {
  const [now, setNow] = useState(() => hhmmss());
  useEffect(() => {
    const t = setInterval(() => setNow(hhmmss()), 1000);
    return () => clearInterval(t);
  }, []);
  return <Mono style={style}>{now}</Mono>;
}

const styles = StyleSheet.create({
  mono: { fontFamily: fonts.mono, color: colors.text, fontSize: 13 },
  monoBold: { fontFamily: fonts.monoBold },

  body: { color: colors.text, fontSize: 14, lineHeight: 22 },
  redacted: { backgroundColor: colors.redaction, color: colors.redaction },

  btn: {
    paddingVertical: 14,
    paddingHorizontal: space.lg,
    borderRadius: radius,
    alignItems: 'center',
    borderWidth: 1,
  },
  btnPrimary: { backgroundColor: colors.accent, borderColor: colors.accent },
  btnOutline: { backgroundColor: 'transparent', borderColor: colors.borderStrong },
  btnDisabled: { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
  btnPressed: { opacity: 0.75 },
  btnText: { fontSize: 14, letterSpacing: 0.4 },

  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { width: 118, color: colors.textFaint, fontSize: 12 },
  rowValue: { flex: 1, fontSize: 12, lineHeight: 18 },

  section: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  sectionText: { color: colors.textFaint, fontSize: 12 },
  sectionLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong },
});
