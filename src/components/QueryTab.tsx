import { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { SEARCH_AREA } from '../data/content';
import { hhmmss } from '../lib/format';
import type { Phase, Session } from '../lib/session';
import { Btn, Clock, Mono } from '../ui/components';
import { colors, radius, space } from '../ui/theme';
import { QueryConsole } from './QueryConsole';

// Те саме джерело й налаштування карти, що й у вихідному файлі: Leaflet,
// темні тайли cartocdn dark_all і коло 40 км навколо точки пошуку.
// Кольори тут навмисно записані буквально (не з теми), щоб карта була
// один в один такою самою незалежно від подальших змін теми застосунку.
const buildMapHtml = (lat: number, lon: number, zoom: number) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; background-color: #1c1e24; }
    #map { height: 100vh; width: 100vw; }
    .leaflet-control-container { display: none !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lon}], ${zoom});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    L.circle([${lat}, ${lon}], { color: '#475569', fillColor: '#64748B', fillOpacity: 0.2, weight: 2, radius: 40000 }).addTo(map);
  </script>
</body>
</html>
`;

type Props = {
  phase: Phase;
  session: Session;
  nextQueryId: string;
  lastQueryAt: number | null;
  onStart: () => void;
  onFinish: () => void;
};

export function QueryTab({ phase, session, nextQueryId, lastQueryAt, onStart, onFinish }: Props) {
  const insets = useSafeAreaInsets();
  const html = useMemo(
    () => buildMapHtml(SEARCH_AREA.lat, SEARCH_AREA.lon, SEARCH_AREA.zoom),
    [],
  );

  const cats = session.categories.length ? session.categories.join(', ') : 'усі';

  return (
    <View style={styles.root}>
      {/* Структура як у вихідному файлі: карта на весь екран, поверх неї —
          прозорий HUD (pointerEvents="none") і окрема кнопка запиту. Без
          додаткових напівпрозорих панелей, які раніше перекривали кнопку. */}
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={StyleSheet.absoluteFill}
        scrollEnabled={false}
        // На деяких Android-пристроях WebView малюється на окремій системній
        // поверхні (SurfaceView) і може лягати поверх сусідніх елементів
        // незалежно від порядку в JSX. "software" прибирає цей ризик.
        androidLayerType="software"
      />

      <View
        pointerEvents="none"
        style={[styles.hudTop, { top: Math.max(insets.top, space.xl) }]}>
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/images/no_bg.png')}
            style={styles.hudLogo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.statusWrap}>
          <Mono style={styles.online}>● на зв’язку</Mono>
          <Clock style={styles.clock} />
        </View>
      </View>

      {phase === 'idle' && (
        <>
          <View pointerEvents="none" style={[styles.info, { bottom: 110 }]}>
            <Mono style={styles.infoText}>
              Профіль: {session.callsign}, {session.age} р.
            </Mono>
            <Mono style={styles.infoText}>Категорії: {cats}</Mono>
            <Mono style={styles.infoFaint}>
              Останній запит: {lastQueryAt ? hhmmss(new Date(lastQueryAt)) : 'немає'}
            </Mono>
          </View>

          <Btn
            label="Виконати запит"
            onPress={onStart}
            style={[styles.scanButton, { bottom: 40 }]}
          />
        </>
      )}

      {phase === 'running' && (
        <QueryConsole session={session} queryId={nextQueryId} onDone={onFinish} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },

  hudTop: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 10,
  },
  logoWrap: {
    backgroundColor: 'transparent',
    padding: 6,
    borderRadius: radius,
  },
  hudLogo: { width: 90, height: 90 },
  statusWrap: {
    backgroundColor: 'rgba(11,13,15,0.75)',
    paddingVertical: 15,
    paddingHorizontal: 19,
    borderRadius: radius,
    alignItems: 'flex-end',
    gap: 2,
  },
  online: { color: colors.accent, fontSize: 12 },
  clock: { color: colors.textDim, fontSize: 12 },

  info: {
    position: 'absolute',
    left: space.lg,
    right: space.lg,
    zIndex: 10,
    gap: 3,
  },
  infoText: {
    color: colors.text,
    fontSize: 12,
    backgroundColor: 'rgba(11,13,15,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  infoFaint: { color: colors.textFaint, fontSize: 11 },

  // Кнопка запиту: та сама поведінка, що й scanButton у вихідному файлі —
  // абсолютне позиціювання, по центру знизу, з тінню й elevation, щоб
  // гарантовано лежати над WebView на Android.
  scanButton: {
    position: 'absolute',
    alignSelf: 'center',
    left: space.xl,
    right: space.xl,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    zIndex: 10,
  },
});
