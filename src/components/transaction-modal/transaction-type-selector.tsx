import { View } from "react-native";

import { SelectablePill } from "@/components/selectable-pill";
import type { TransactionType } from "@/lib/database.types";

import { styles } from "./transaction-modal.styles";

type TransactionTypeSelectorProps = {
  value: TransactionType;
  onChange: (transactionType: TransactionType) => void;
};

export function TransactionTypeSelector({
  value,
  onChange,
}: TransactionTypeSelectorProps) {
  return (
    <View style={styles.segmentedRow}>
      {(["expense", "deposit"] as const).map((typeOption) => {
        const selected = typeOption === value;

        return (
          <SelectablePill
            key={typeOption}
            onPress={() => onChange(typeOption)}
            selected={selected}
            accessibilityRole="radio"
            style={styles.segment}
          >
            {typeOption === "expense" ? "Expense" : "Deposit"}
          </SelectablePill>
        );
      })}
    </View>
  );
}
