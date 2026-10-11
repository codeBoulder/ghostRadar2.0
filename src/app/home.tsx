import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AccountTab } from '../components/AccountTab';
import { ArchiveTab } from '../components/ArchiveTab';
import { BottomNav, type TabKey } from '../components/BottomNav';
import { NodeTab } from '../components/NodeTab';
import { QueryTab } from '../components/QueryTab';
import { RecordView } from '../components/RecordView';
import { FIRST_OWN_QUERY_NUMBER } from '../data/content';
import { getSession, type OwnQuery, type Phase } from '../lib/session';
import { colors } from '../ui/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const session = getSession();

  const [tab, setTab] = useState<TabKey>('query');
  const [phase, setPhase] = useState<Phase>('idle');
  const [ownQueries, setOwnQueries] = useState<OwnQuery[]>([]);

  const nextQueryId = `Q-${FIRST_OWN_QUERY_NUMBER + ownQueries.length}`;

  const finishQuery = useCallback(() => {
    setOwnQueries((prev) => [
      { id: `Q-${FIRST_OWN_QUERY_NUMBER + prev.length}`, at: Date.now() },
      ...prev,
    ]);
    setPhase('found');
  }, []);

  const openOwnRecord = useCallback(() => {
    setTab('query');
    setPhase('found');
  }, []);

  // Під час запиту та перегляду запису нижнє меню ховається
  const immersive = phase !== 'idle';

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {/* Вкладка запиту завжди змонтована, щоб карта не перезавантажувалась */}
        <View style={[styles.fill, tab !== 'query' && styles.hidden]}>
          <QueryTab
            phase={phase}
            session={session}
            nextQueryId={nextQueryId}
            lastQueryAt={ownQueries[0]?.at ?? null}
            onStart={() => setPhase('running')}
            onFinish={finishQuery}
          />
        </View>

        {tab === 'archive' && (
          <View style={[styles.fill, { paddingTop: insets.top }]}>
            <ArchiveTab own={ownQueries} onOpenOwn={openOwnRecord} />
          </View>
        )}
        {tab === 'node' && (
          <View style={[styles.fill, { paddingTop: insets.top }]}>
            <NodeTab session={session} />
          </View>
        )}
        {tab === 'account' && (
          <View style={[styles.fill, { paddingTop: insets.top }]}>
            <AccountTab session={session} viewed={ownQueries.length} />
          </View>
        )}
      </View>

      {!immersive && <BottomNav tab={tab} onChange={setTab} bottomInset={insets.bottom} />}

      {phase === 'found' && <RecordView session={session} onClose={() => setPhase('idle')} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1 },
  fill: { ...StyleSheet.absoluteFill },
  hidden: { display: 'none' },
});
