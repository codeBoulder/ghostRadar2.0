import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RECORD, type RecordPhoto } from '../data/content';
import { ddmmyyyy, formatCoord, hhmmss } from '../lib/format';
import type { Session } from '../lib/session';
import { Btn, Mono, RedactedText, Row, Section } from '../ui/components';
import { colors, radius, space } from '../ui/theme';

type Props = { session: Session; onClose: () => void };

/** Картка запису: оформлена як матеріал із закритого архіву. */
export function RecordView({ session, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [copied, setCopied] = useState(false);
  const [viewer, setViewer] = useState<RecordPhoto | null>(null);
  const [openedAt] = useState(() => `${ddmmyyyy()} ${hhmmss()}`);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const { lat, lon } = RECORD.coordinates;
  const coordText = `${formatCoord(lat)}, ${formatCoord(lon)}`;

  const copyCoords = async () => {
    await Clipboard.setStringAsync(coordText);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const openOnMap = () => {
    Linking.openURL(`https://waze.com/ul?ll=${lat},${lon}&navigate=yes`);
  };

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <Mono style={styles.topTitle}>Запис із архіву</Mono>
        <Pressable onPress={onClose} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={colors.textDim} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + space.xxl }]}>
        <Mono bold style={styles.recordId}>
          {RECORD.id}
        </Mono>
        <View style={styles.statusRow}>
          <View style={styles.statusChip}>
            <Mono bold style={styles.statusText}>
              {RECORD.status}
            </Mono>
          </View>
          <Mono style={styles.statusHint}>Рівень доступу {RECORD.accessLevel}</Mono>
        </View>

        <View style={styles.table}>
          <Row label="Створено" value={RECORD.created} />
          <Row label="Змінено" value={RECORD.updated} />
          <Row label="Категорія" value={RECORD.category} />
          <View style={styles.row}>
            <Mono style={styles.rowLabel}>Джерело</Mono>
            <View style={styles.flex}>
              <RedactedText text={RECORD.source} style={styles.sourceText} />
            </View>
          </View>
        </View>

        <Section title="Координати" />
        <View style={styles.coordBox}>
          <Mono bold style={styles.coords}>
            {coordText}
          </Mono>
          <View style={styles.coordActions}>
            <Btn
              label={copied ? 'Скопійовано' : 'Скопіювати'}
              variant="outline"
              onPress={copyCoords}
              style={styles.flex}
            />
            <Btn label="Відкрити на карті" variant="outline" onPress={openOnMap} style={styles.flex} />
          </View>
        </View>

        <Section title="Фото" right={`${RECORD.photos.length}`} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photos}>
          {RECORD.photos.map((photo) => (
            <Pressable key={photo.file} onPress={() => setViewer(photo)} style={styles.photoCard}>
              <View style={styles.photoFrame}>
                <Image source={photo.image} style={styles.photo} resizeMode="cover" />
                <View pointerEvents="none" style={styles.photoTint} />
              </View>
              <Mono style={styles.metaMain}>{photo.file}</Mono>
              <Mono style={styles.meta}>{photo.taken}</Mono>
              <Mono style={styles.meta}>{photo.device}</Mono>
              <Mono style={styles.meta}>GPS: {photo.gps}</Mono>
            </Pressable>
          ))}
        </ScrollView>

        <Section title="Матеріали" />
        <View style={styles.paragraphs}>
          {RECORD.summary.map((p, i) => (
            <RedactedText key={i} text={p} />
          ))}
        </View>

        <Section title="Свідчення" right={`${RECORD.testimonies.length}`} />
        <View style={styles.testimonies}>
          {RECORD.testimonies.map((t, i) => (
            <View key={i} style={styles.testimony}>
              <RedactedText text={t.label} style={styles.testimonyLabel} />
              <RedactedText text={t.text} />
            </View>
          ))}
        </View>

        <Section title="Примітка модератора" />
        <View style={styles.note}>
          <RedactedText text={RECORD.moderatorNote} style={styles.noteText} />
        </View>

        <View style={styles.footer}>
          <Mono style={styles.footerText}>Запис відкрито: {openedAt}</Mono>
          <Mono style={styles.footerText}>Сеанс: {session.sessionId}</Mono>
        </View>

        <Btn label="Закрити запис" variant="outline" onPress={onClose} />
      </ScrollView>

      <Modal
        visible={viewer !== null}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setViewer(null)}>
        <Pressable style={styles.viewerBackdrop} onPress={() => setViewer(null)}>
          {viewer ? (
            <>
              <Image source={viewer.image} style={styles.viewerImage} resizeMode="contain" />
              <Mono style={styles.viewerMeta}>
                {viewer.file}, {viewer.taken}
              </Mono>
            </>
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.bg, zIndex: 30 },
  flex: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.lg,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  topTitle: { color: colors.textDim, fontSize: 13 },
  closeBtn: { padding: 2 },

  scroll: { padding: space.lg },

  recordId: { fontSize: 22, letterSpacing: 0.5, marginTop: space.sm },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, marginTop: space.md },
  statusChip: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerDim,
    borderRadius: radius,
    paddingVertical: 4,
    paddingHorizontal: space.sm,
  },
  statusText: { color: colors.danger, fontSize: 12, letterSpacing: 0.5 },
  statusHint: { color: colors.textFaint, fontSize: 12 },

  table: { marginTop: space.lg },
  row: {
    flexDirection: 'row',
    gap: space.md,
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { width: 118, color: colors.textFaint, fontSize: 12 },
  sourceText: { fontSize: 12, lineHeight: 18 },

  coordBox: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius,
    backgroundColor: colors.surface,
    padding: space.lg,
    gap: space.lg,
  },
  coords: { color: colors.accent, fontSize: 17, letterSpacing: 0.3 },
  coordActions: { flexDirection: 'row', gap: space.sm },

  photos: { gap: space.md },
  photoCard: { width: 210, gap: 3 },
  photoFrame: {
    width: 210,
    height: 140,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius,
    overflow: 'hidden',
    backgroundColor: '#050607',
    marginBottom: 4,
  },
  photo: { width: '100%', height: '100%', opacity: 0.8 },
  photoTint: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(24,30,26,0.35)' },
  metaMain: { color: colors.textDim, fontSize: 11 },
  meta: { color: colors.textFaint, fontSize: 11 },

  paragraphs: { gap: space.md },

  testimonies: { gap: space.lg },
  testimony: { borderLeftWidth: 2, borderLeftColor: colors.borderStrong, paddingLeft: space.md, gap: 6 },
  testimonyLabel: { color: colors.textFaint, fontSize: 12, lineHeight: 18 },

  note: {
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerDim,
    borderRadius: radius,
    padding: space.md,
  },
  noteText: { color: colors.text, fontSize: 13, lineHeight: 20 },

  footer: { marginTop: space.xl, marginBottom: space.lg, gap: 4 },
  footerText: { color: colors.textFaint, fontSize: 11 },

  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.lg,
  },
  viewerImage: { width: '100%', height: '75%' },
  viewerMeta: { color: colors.textFaint, fontSize: 11, marginTop: space.md },
});
