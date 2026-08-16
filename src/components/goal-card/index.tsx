import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import type { Goal } from '@/lib/database.types';
import type { GoalProgress } from '@/lib/goal-helpers';
import { formatMoney, isoDateToLocalDate, shortDateFormatter } from '@/lib/transaction-helpers';

import { styles } from './goal-card.styles';

type GoalCardProps = {
  described: GoalProgress;
  saved: number;
  busy: boolean;
  onEdit: (goal: Goal) => void;
  onAchieve: (goal: Goal) => void;
};

export function GoalCard({ described, saved, busy, onEdit, onAchieve }: GoalCardProps) {
  const theme = useTheme();
  const { goal, percent, remaining, affordable } = described;
  const isAchieved = goal.achieved_at != null;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable
        onPress={() => onEdit(goal)}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${goal.title}`}
        style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="smallBold">{goal.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {isAchieved && goal.achieved_at
              ? `Reached ${shortDateFormatter.format(isoDateToLocalDate(goal.achieved_at))}`
              : `${formatMoney(Math.min(saved, Number(goal.target_amount)), goal.currency)} of ${formatMoney(Number(goal.target_amount), goal.currency)}`}
          </ThemedText>
        </View>
        <ThemedText type="smallBold">{isAchieved ? '✓' : `${percent}%`}</ThemedText>
      </Pressable>

      {!isAchieved && (
        <>
          <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${percent}%`,
                  backgroundColor: affordable ? '#16a34a' : '#208AEF',
                },
              ]}
            />
          </View>

          <View style={styles.footer}>
            <ThemedText type="small" themeColor="textSecondary">
              {affordable
                ? 'You can cover this now'
                : `${formatMoney(remaining, goal.currency)} to go`}
            </ThemedText>
          </View>

          {affordable && (
            <Pressable
              onPress={() => onAchieve(goal)}
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel={`Mark ${goal.title} as bought`}
              style={({ pressed }) => [
                styles.achieveButton,
                { opacity: pressed || busy ? 0.65 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.achieveButtonText}>
                {busy ? 'Working…' : 'I bought this'}
              </ThemedText>
            </Pressable>
          )}
        </>
      )}
    </ThemedView>
  );
}
