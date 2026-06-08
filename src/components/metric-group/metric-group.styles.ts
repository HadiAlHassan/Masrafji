import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  group: {
    borderRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  grid: {
    flexDirection: "row",
    gap: Spacing.two,
  },
});
