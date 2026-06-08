import { useMemo } from "react";
import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import type {
  ExpenseCategory,
  Transaction,
  TransactionCurrency,
} from "@/lib/database.types";
import {
  formatMoney,
  transactionCategories,
} from "@/lib/transaction-helpers";

import { styles } from "./category-breakdown-card.styles";

type CategoryBreakdownCardProps = {
  currency: TransactionCurrency;
  transactions: Transaction[];
  loading: boolean;
};

export function CategoryBreakdownCard({
  currency,
  transactions,
  loading,
}: CategoryBreakdownCardProps) {
  const theme = useTheme();
  const categoryTotals = useMemo(() => {
    const totals = new Map<ExpenseCategory, number>();

    for (const transaction of transactions) {
      if (transaction.transaction_type !== "expense" || transaction.currency !== currency) {
        continue;
      }

      totals.set(
        transaction.category,
        (totals.get(transaction.category) ?? 0) + Number(transaction.amount),
      );
    }

    return transactionCategories
      .map((category) => ({
        category,
        total: totals.get(category) ?? 0,
      }))
      .filter((categoryTotal) => categoryTotal.total > 0)
      .sort((firstCategory, secondCategory) => secondCategory.total - firstCategory.total);
  }, [currency, transactions]);

  const maxCategoryTotal = Math.max(
    ...categoryTotals.map((categoryTotal) => categoryTotal.total),
    1,
  );

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.sectionHeader}>
        <ThemedText type="smallBold">{currency} expenses by category</ThemedText>
        {loading && <ActivityIndicator color={theme.text} />}
      </View>
      {categoryTotals.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          Add {currency} expenses to see category totals.
        </ThemedText>
      ) : (
        categoryTotals.map((categoryTotal) => (
          <View key={categoryTotal.category} style={styles.categoryRow}>
            <View style={styles.categoryHeader}>
              <ThemedText type="smallBold">{categoryTotal.category}</ThemedText>
              <ThemedText type="small">
                {formatMoney(categoryTotal.total, currency)}
              </ThemedText>
            </View>
            <View style={[styles.barTrack, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(categoryTotal.total / maxCategoryTotal) * 100}%` },
                ]}
              />
            </View>
          </View>
        ))
      )}
    </ThemedView>
  );
}
