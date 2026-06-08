import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.four,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryRow: {
    gap: Spacing.two,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#208AEF",
  },
});
