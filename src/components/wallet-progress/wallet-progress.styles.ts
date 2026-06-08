import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  block: {
    gap: Spacing.two,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  track: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#D7DAE0",
  },
  fill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: "#208AEF",
  },
});
