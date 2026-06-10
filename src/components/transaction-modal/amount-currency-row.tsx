import { TextInput, View } from "react-native";

import { SelectablePill } from "@/components/selectable-pill";
import { useTheme } from "@/hooks/use-theme";
import type { TransactionCurrency } from "@/lib/database.types";
import { transactionCurrencies } from "@/lib/transaction-helpers";

import { styles } from "./transaction-modal.styles";

type AmountCurrencyRowProps = {
  amount: string;
  currency: TransactionCurrency;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: TransactionCurrency) => void;
};

export function AmountCurrencyRow({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
}: AmountCurrencyRowProps) {
  const theme = useTheme();

  return (
    <View style={styles.inlineRow}>
      <TextInput
        value={amount}
        onChangeText={onAmountChange}
        placeholder="Amount"
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        style={[
          styles.input,
          styles.amountInput,
          { borderColor: theme.backgroundSelected, color: theme.text },
        ]}
        accessibilityLabel="Transaction amount"
      />
      <View style={styles.currencyRow}>
        {transactionCurrencies.map((currencyOption) => {
          const selected = currencyOption === currency;

          return (
            <SelectablePill
              key={currencyOption}
              onPress={() => onCurrencyChange(currencyOption)}
              selected={selected}
              accessibilityRole="radio"
              style={styles.currencyButton}
            >
              {currencyOption}
            </SelectablePill>
          );
        })}
      </View>
    </View>
  );
}
