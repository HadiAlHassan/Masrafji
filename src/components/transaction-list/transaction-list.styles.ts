import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  list: {
    gap: Spacing.two,
  },
  row: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  emptyState: {
    borderRadius: Spacing.three,
    gap: Spacing.one,
    padding: Spacing.four,
  },
});
