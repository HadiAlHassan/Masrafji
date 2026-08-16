import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionTrigger } from '@/lib/database.types';
import { formatMoney, isoDateToLocalDate, shortDateFormatter } from '@/lib/transaction-helpers';
import { getNextOccurrence, type TriggerWithStatus } from '@/lib/trigger-helpers';

import { styles } from './trigger-list-item.styles';

type TriggerListItemProps = {
  described: TriggerWithStatus;
  firing: boolean;
  onFire: (trigger: TransactionTrigger, spentAt: string) => void;
  onSkip: (trigger: TransactionTrigger, dueDate: string) => void;
  onEdit: (trigger: TransactionTrigger) => void;
};

const statusBadges: Record<string, { label: string; color: string }> = {
  due: { label: 'Due today', color: '#208AEF' },
  overdue: { label: 'Overdue', color: '#f59e0b' },
};

export function TriggerListItem({
  described,
  firing,
  onFire,
  onSkip,
  onEdit,
}: TriggerListItemProps) {
  const theme = useTheme();
  const { trigger, status, dueDate } = described;
  const badge = statusBadges[status];
  const isPending = status === 'due' || status === 'overdue';
  const isDeposit = trigger.transaction_type === 'deposit';

  function describeSchedule() {
    if (trigger.day_of_month == null) {
      return 'Manual · run whenever it happens';
    }

    if (dueDate) {
      return `For ${shortDateFormatter.format(isoDateToLocalDate(dueDate))}`;
    }

    const nextOccurrence = getNextOccurrence(trigger.day_of_month);

    return `Next ${shortDateFormatter.format(isoDateToLocalDate(nextOccurrence))}`;
  }

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable
        onPress={() => onEdit(trigger)}
        accessibilityRole="button"
        accessibilityLabel={`Edit ${trigger.title}`}
        style={styles.header}>
        <View style={styles.headerText}>
          <ThemedText type="smallBold">{trigger.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {describeSchedule()}
          </ThemedText>
        </View>
        <View style={styles.amount}>
          <ThemedText type="smallBold">
            {isDeposit ? '+' : '−'}
            {formatMoney(Number(trigger.amount), trigger.currency)}
          </ThemedText>
          {!trigger.active && (
            <ThemedText type="small" themeColor="textSecondary">
              Paused
            </ThemedText>
          )}
        </View>
      </Pressable>

      {badge && (
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <ThemedText type="small" style={styles.badgeText}>
            {badge.label}
          </ThemedText>
        </View>
      )}

      <View style={styles.actions}>
        <Pressable
          onPress={() => onFire(trigger, dueDate ?? new Date().toISOString().slice(0, 10))}
          disabled={firing}
          accessibilityRole="button"
          accessibilityLabel={`Log ${trigger.title}`}
          style={({ pressed }) => [
            styles.primaryButton,
            { opacity: pressed || firing ? 0.65 : 1 },
          ]}>
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            {firing ? 'Working…' : isPending ? 'Log it' : 'Log now'}
          </ThemedText>
        </Pressable>

        {isPending && dueDate && (
          <Pressable
            onPress={() => onSkip(trigger, dueDate)}
            disabled={firing}
            accessibilityRole="button"
            accessibilityLabel={`Skip ${trigger.title}`}
            style={({ pressed }) => [
              styles.secondaryButton,
              { borderColor: theme.backgroundSelected, opacity: pressed || firing ? 0.65 : 1 },
            ]}>
            <ThemedText type="smallBold">Skip</ThemedText>
          </Pressable>
        )}
      </View>
    </ThemedView>
  );
}
