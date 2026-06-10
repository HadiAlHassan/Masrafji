import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import type { Transaction } from "@/lib/database.types";
import {
  formatMoney,
  shortDateFormatter,
  transactionCategoryDetails,
} from "@/lib/transaction-helpers";

import { styles } from "./transaction-list-item.styles";

type TransactionListItemProps = {
  transaction: Transaction;
  onSelected?: (transaction: Transaction) => void;
  onDeleteRequested: (transaction: Transaction) => void;
};

export function TransactionListItem({
  transaction,
  onSelected,
  onDeleteRequested,
}: TransactionListItemProps) {
  const theme = useTheme();
  const isDeposit = transaction.transaction_type === "deposit";
  const categoryDetails = transactionCategoryDetails[transaction.category];

  return (
    <Pressable
      onPress={() => onSelected?.(transaction)}
      onLongPress={() => onDeleteRequested(transaction)}
      accessibilityRole="button"
      accessibilityLabel={`Transaction ${transaction.title}, ${formatMoney(
        Number(transaction.amount),
        transaction.currency,
      )}`}
      accessibilityHint="Tap to edit. Long press to delete."
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.backgroundSelected }]}>
        <Ionicons
          name={isDeposit ? "arrow-down-circle-outline" : categoryDetails.icon}
          size={22}
          color={isDeposit ? "#16a34a" : theme.text}
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="smallBold">{transaction.title}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {isDeposit ? "Deposit" : categoryDetails.label} ·{" "}
          {shortDateFormatter.format(new Date(transaction.spent_at))}
          {transaction.note ? ` · ${transaction.note}` : ""}
        </ThemedText>
      </View>
      <ThemedText
        type="smallBold"
        style={{ color: isDeposit ? "#16a34a" : theme.text }}
      >
        {isDeposit ? "+" : "-"}
        {formatMoney(Number(transaction.amount), transaction.currency)}
      </ThemedText>
    </Pressable>
  );
}
