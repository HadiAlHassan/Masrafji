import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  titleBlock: {
    flex: 1,
    gap: Spacing.one,
  },
  addButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
  },
});
