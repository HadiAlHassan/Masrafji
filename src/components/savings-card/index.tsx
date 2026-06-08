import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { TransactionCurrency } from "@/lib/database.types";
import { formatMoney } from "@/lib/transaction-helpers";

import { styles } from "./savings-card.styles";

type SavingsCardProps = {
  currency: TransactionCurrency;
  totals: { deposits: number; expenses: number; balance: number };
};

export function SavingsCard({ currency, totals }: SavingsCardProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="small" themeColor="textSecondary">
        {currency} saved
      </ThemedText>
      <ThemedText type="subtitle">{formatMoney(totals.balance, currency)}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        In {formatMoney(totals.deposits, currency)} · Out{" "}
        {formatMoney(totals.expenses, currency)}
      </ThemedText>
    </ThemedView>
  );
}
