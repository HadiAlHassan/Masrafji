import { Alert, View } from "react-native";

import { TransactionListItem } from "@/components/transaction-list-item";
import type { Transaction } from "@/lib/database.types";
import { deleteTransaction } from "@/lib/expenses";

import { styles } from "./transaction-list.styles";

type TransactionListProps = {
  transactions: Transaction[];
  onSelected?: (transaction: Transaction) => void;
  onDeleted?: (transactionId: Transaction["id"]) => void;
};

export function TransactionList({ transactions, onSelected, onDeleted }: TransactionListProps) {
  function confirmDelete(transaction: Transaction) {
    Alert.alert("Delete transaction", `Delete "${transaction.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTransaction(transaction.id);
          onDeleted?.(transaction.id);
        },
      },
    ]);
  }

  return (
    <View style={styles.list}>
      {transactions.map((transaction) => (
        <TransactionListItem
          key={transaction.id}
          transaction={transaction}
          onSelected={onSelected}
          onDeleteRequested={confirmDelete}
        />
      ))}
    </View>
  );
}
