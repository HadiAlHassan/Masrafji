import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    borderTopLeftRadius: Spacing.four,
    borderTopRightRadius: Spacing.four,
    gap: Spacing.three,
    padding: Spacing.three,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.three,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentedRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    fontWeight: "500",
  },
  inlineRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  amountInput: {
    flex: 1,
  },
  currencyRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  currencyButton: {
    minWidth: 56,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 58,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  categorySelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  dateSection: {
    gap: Spacing.two,
  },
  quickDateRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  quickDateButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 58,
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.three,
  },
  saveButton: {
    minHeight: 52,
    borderRadius: Spacing.three,
    backgroundColor: "#208AEF",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#ffffff",
  },
});
