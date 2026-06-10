import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  balanceCard: {
    borderRadius: Spacing.four,
    gap: Spacing.one,
    padding: Spacing.four,
  },
  progressCard: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  walletGroups: {
    gap: Spacing.two,
  },
});
