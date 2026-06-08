import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  arrowButton: {
    width: 48,
    minHeight: 44,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  labelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
});
