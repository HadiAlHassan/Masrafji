import { useState } from "react";
import { View } from "react-native";

import { withAuthGuard } from "@/components/auth-guard";
import { GoalCard } from "@/components/goal-card";
import { GoalModal } from "@/components/goal-modal";
import { ScreenHeader } from "@/components/screen-header";
import { ScreenScrollView } from "@/components/screen-scroll-view";
import { ScreenState } from "@/components/screen-state";
import { SectionHeader } from "@/components/section-header";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useGoals } from "@/hooks/use-goals";
import type { Goal } from "@/lib/database.types";
import { formatMoney } from "@/lib/transaction-helpers";
import { styles } from "@/screens/saving/saving-screen.styles";

export default function SavingScreen() {
  const {
    session,
    groupedGoals,
    savedByCurrency,
    contributionCounts,
    loading,
    refreshing,
    errorMessage,
    busyGoalId,
    refresh,
    achieveGoal,
    upsertGoal,
    dropGoal,
  } = useGoals();

  return (
    <GuardedSavingScreen
      authLoading={false}
      session={session}
      groupedGoals={groupedGoals}
      savedByCurrency={savedByCurrency}
      contributionCounts={contributionCounts}
      loading={loading}
      refreshing={refreshing}
      errorMessage={errorMessage}
      busyGoalId={busyGoalId}
      refresh={refresh}
      achieveGoal={achieveGoal}
      upsertGoal={upsertGoal}
      dropGoal={dropGoal}
    />
  );
}

type SavingScreenContentProps = Omit<
  ReturnType<typeof useGoals>,
  "goals" | "describedGoals"
> & {
  authLoading: boolean;
};

function SavingScreenContent({
  session,
  groupedGoals,
  savedByCurrency,
  contributionCounts,
  loading,
  refreshing,
  errorMessage,
  busyGoalId,
  refresh,
  achieveGoal,
  upsertGoal,
  dropGoal,
}: SavingScreenContentProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const { withinReach, workingToward, achieved } = groupedGoals;
  const hasLbpSavings = savedByCurrency.LBP > 0;
  const hasGoals =
    withinReach.length + workingToward.length + achieved.length > 0;

  function openCreate() {
    setEditingGoal(null);
    setModalVisible(true);
  }

  function openEdit(goal: Goal) {
    setEditingGoal(goal);
    setModalVisible(true);
  }

  return (
    <ThemedView style={styles.screen}>
      <ScreenScrollView refreshing={refreshing} onRefresh={refresh}>
        <ScreenHeader
          eyebrow="Masrafji"
          title="Saving"
          onAddPress={openCreate}
        />

        <ThemedView type="backgroundElement" style={styles.totalCard}>
          <ThemedText type="small" themeColor="textSecondary">
            Total saved
          </ThemedText>
          <ThemedText type="subtitle">
            {formatMoney(savedByCurrency.USD, "USD")}
          </ThemedText>
          {hasLbpSavings && (
            <ThemedText type="default">
              {formatMoney(savedByCurrency.LBP, "LBP")}
            </ThemedText>
          )}
          <ThemedText type="small" themeColor="textSecondary">
            {contributionCounts.USD === 0
              ? "Log an expense with the Saving category to add to this."
              : `From ${contributionCounts.USD} contribution${contributionCounts.USD === 1 ? "" : "s"}.`}
          </ThemedText>
        </ThemedView>

        <ScreenState errorMessage={errorMessage} />

        {withinReach.length > 0 && (
          <>
            <SectionHeader title="Within reach" loading={loading} />
            <View style={styles.list}>
              {withinReach.map((described) => (
                <GoalCard
                  key={described.goal.id}
                  described={described}
                  saved={savedByCurrency[described.goal.currency]}
                  busy={busyGoalId === described.goal.id}
                  onEdit={openEdit}
                  onAchieve={achieveGoal}
                />
              ))}
            </View>
          </>
        )}

        {workingToward.length > 0 && (
          <>
            <SectionHeader title="Working toward" loading={loading} />
            <View style={styles.list}>
              {workingToward.map((described) => (
                <GoalCard
                  key={described.goal.id}
                  described={described}
                  saved={savedByCurrency[described.goal.currency]}
                  busy={busyGoalId === described.goal.id}
                  onEdit={openEdit}
                  onAchieve={achieveGoal}
                />
              ))}
            </View>
          </>
        )}

        <ScreenState
          empty={!hasGoals}
          emptyTitle="No goals yet"
          emptyMessage="Add something you are saving for and track how close you are."
        />

        {achieved.length > 0 && (
          <>
            <SectionHeader title="Reached" loading={loading} />
            <View style={styles.list}>
              {achieved.map((described) => (
                <GoalCard
                  key={described.goal.id}
                  described={described}
                  saved={savedByCurrency[described.goal.currency]}
                  busy={busyGoalId === described.goal.id}
                  onEdit={openEdit}
                  onAchieve={achieveGoal}
                />
              ))}
            </View>
          </>
        )}
      </ScreenScrollView>

      <GoalModal
        visible={modalVisible}
        session={session}
        goal={editingGoal}
        onClose={() => setModalVisible(false)}
        onSaved={upsertGoal}
        onDeleted={dropGoal}
      />
    </ThemedView>
  );
}

const GuardedSavingScreen = withAuthGuard(SavingScreenContent);
