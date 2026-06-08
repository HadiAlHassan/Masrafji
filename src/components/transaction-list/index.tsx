import { Alert, Pressable, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import type { Transaction } from '@/lib/database.types';
import { deleteTransaction } from '@/lib/expenses';
import {
  formatMoney,
  shortDateFormatter,
  transactionCategoryDetails,
} from '@/lib/transaction-helpers';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './transaction-list.styles';

type TransactionListProps = {
  transactions: Transaction[];
  onSelected?: (transaction: Transaction) => void;
  onDeleted?: (transactionId: Transaction['id']) => void;
};

export function TransactionList({ transactions, onSelected, onDeleted }: TransactionListProps) {
  const theme = useTheme();

  function confirmDelete(transaction: Transaction) {
    Alert.alert('Delete transaction', `Delete "${transaction.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(transaction.id);
          onDeleted?.(transaction.id);
        },
      },
    ]);
  }

  if (transactions.length === 0) {
    return (
      <View style={[styles.emptyState, { backgroundColor: theme.backgroundElement }]}>
        <ThemedText type="smallBold">No transactions yet</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Use the + button to add your first deposit or expense.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {transactions.map((transaction) => {
        const isDeposit = transaction.transaction_type === 'deposit';
        const categoryDetails = transactionCategoryDetails[transaction.category];

        return (
          <Pressable
            key={transaction.id}
            onPress={() => onSelected?.(transaction)}
            onLongPress={() => confirmDelete(transaction)}
            accessibilityRole="button"
            accessibilityLabel={`Transaction ${transaction.title}, ${formatMoney(
              Number(transaction.amount),
              transaction.currency,
            )}`}
            accessibilityHint="Tap to edit. Long press to delete."
                style={({ pressed }) => [
                  styles.row,
                  { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.75 : 1 },
                ]}>
            <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
              <Ionicons
                name={isDeposit ? 'arrow-down-circle-outline' : categoryDetails.icon}
                size={22}
                color={isDeposit ? '#16a34a' : theme.text}
              />
            </View>
            <View style={styles.content}>
              <ThemedText type="smallBold">{transaction.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {isDeposit ? 'Deposit' : categoryDetails.label} ·{' '}
                {shortDateFormatter.format(new Date(transaction.spent_at))}
                {transaction.note ? ` · ${transaction.note}` : ''}
              </ThemedText>
            </View>
            <ThemedText type="smallBold" style={{ color: isDeposit ? '#16a34a' : theme.text }}>
              {isDeposit ? '+' : '-'}
              {formatMoney(Number(transaction.amount), transaction.currency)}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}
