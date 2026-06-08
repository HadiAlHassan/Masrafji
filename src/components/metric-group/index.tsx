import { View } from "react-native";

import { MetricCard } from "@/components/metric-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

import { styles } from "./metric-group.styles";

type MetricGroupProps = {
  title: string;
  deposits: string;
  expenses: string;
};

export function MetricGroup({ title, deposits, expenses }: MetricGroupProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.group}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.grid}>
        <MetricCard label="Deposits" value={deposits} />
        <MetricCard label="Expenses" value={expenses} />
      </View>
    </ThemedView>
  );
}
