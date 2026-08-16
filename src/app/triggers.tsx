import { useState } from "react";
import { View } from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ScreenState } from "@/components/screen-state";
import { SectionHeader } from "@/components/section-header";
import { ThemedView } from "@/components/themed-view";
import { TriggerListItem } from "@/components/trigger-list-item";
import { TriggerModal } from "@/components/trigger-modal";
import { useTriggers } from "@/hooks/use-triggers";
import type { TransactionTrigger } from "@/lib/database.types";
import { styles } from "@/screens/triggers/triggers-screen.styles";

export default function TriggersScreen() {
  const {
    session,
    describedTriggers,
    pendingTriggers,
    loading,
    refreshing,
    errorMessage,
    firingId,
    refresh,
    fireTrigger,
    skipTrigger,
    upsertTrigger,
    dropTrigger,
  } = useTriggers();

  return (
    <GuardedTriggersScreen
      authLoading={false}
      session={session}
      describedTriggers={describedTriggers}
      pendingTriggers={pendingTriggers}
      loading={loading}
      refreshing={refreshing}
      errorMessage={errorMessage}
      firingId={firingId}
      refresh={refresh}
      fireTrigger={fireTrigger}
      skipTrigger={skipTrigger}
      upsertTrigger={upsertTrigger}
      dropTrigger={dropTrigger}
    />
  );
}

type TriggersScreenContentProps = Omit<
  ReturnType<typeof useTriggers>,
  "triggers"
> & {
  authLoading: boolean;
};

function TriggersScreenContent({
  session,
  describedTriggers,
  pendingTriggers,
  loading,
  refreshing,
  errorMessage,
  firingId,
  refresh,
  fireTrigger,
  skipTrigger,
  upsertTrigger,
  dropTrigger,
}: TriggersScreenContentProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTrigger, setEditingTrigger] = useState<TransactionTrigger | null>(
    null,
  );
  const pendingIds = new Set(
    pendingTriggers.map((described) => described.trigger.id),
  );
  const restTriggers = describedTriggers.filter(
    (described) => !pendingIds.has(described.trigger.id),
  );

  function openCreate() {
    setEditingTrigger(null);
    setModalVisible(true);
  }

  function openEdit(trigger: TransactionTrigger) {
    setEditingTrigger(trigger);
    setModalVisible(true);
  }

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader
          eyebrow="Masrafji"
          title="Triggers"
          onAddPress={openCreate}
        />

        <ScreenState errorMessage={errorMessage} />

        {pendingTriggers.length > 0 && (
          <>
            <SectionHeader title="Due now" loading={loading} />
            <View style={styles.list}>
              {pendingTriggers.map((described) => (
                <TriggerListItem
                  key={described.trigger.id}
                  described={described}
                  firing={firingId === described.trigger.id}
                  onFire={fireTrigger}
                  onSkip={skipTrigger}
                  onEdit={openEdit}
                />
              ))}
            </View>
          </>
        )}

        <SectionHeader
          title={pendingTriggers.length > 0 ? "All triggers" : "Your triggers"}
          loading={loading}
        />
        <ScreenState
          empty={describedTriggers.length === 0}
          emptyTitle="No triggers yet"
          emptyMessage="Save a recurring salary or subscription, then log it in one tap."
        />
        <View style={styles.list}>
          {restTriggers.map((described) => (
            <TriggerListItem
              key={described.trigger.id}
              described={described}
              firing={firingId === described.trigger.id}
              onFire={fireTrigger}
              onSkip={skipTrigger}
              onEdit={openEdit}
            />
          ))}
        </View>
      </ScreenScrollView>

      <TriggerModal
        visible={modalVisible}
        session={session}
        trigger={editingTrigger}
        onClose={() => setModalVisible(false)}
        onSaved={upsertTrigger}
        onDeleted={dropTrigger}
      />
    </ThemedView>
  );
}

const GuardedTriggersScreen = withAuthGuard(TriggersScreenContent);
