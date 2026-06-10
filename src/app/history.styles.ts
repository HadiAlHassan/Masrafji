import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  filterButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
});
