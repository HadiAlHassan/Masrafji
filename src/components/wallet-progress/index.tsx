import { View } from "react-native";

import { ThemedText } from "@/components/themed-text";

import { styles } from "./wallet-progress.styles";

type WalletProgressProps = {
  label: string;
  deposits: number;
  expenses: number;
};

export function WalletProgress({
  label,
  deposits,
  expenses,
}: WalletProgressProps) {
  const progress = deposits > 0 ? Math.min(expenses / deposits, 1) : 0;
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText type="smallBold">{percent}% spent</ThemedText>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}
