import { useMemo, useState } from "react";

import type { Transaction } from "@/lib/database.types";
import {
  filterTransactionsByMonth,
  filterTransactionsUpToMonth,
  getAdjacentAvailableMonth,
  getAvailableMonthKeys,
  getMonthKey,
} from "@/lib/transaction-helpers";

export function useMonthFilter(transactions: Transaction[]) {
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey());
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  const availableMonths = useMemo(
    () => getAvailableMonthKeys(transactions),
    [transactions],
  );
  const previousAvailableMonth = useMemo(
    () => getAdjacentAvailableMonth(selectedMonth, availableMonths, "previous"),
    [availableMonths, selectedMonth],
  );
  const nextAvailableMonth = useMemo(
    () => getAdjacentAvailableMonth(selectedMonth, availableMonths, "next"),
    [availableMonths, selectedMonth],
  );
  const monthTransactions = useMemo(
    () => filterTransactionsByMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  );
  const transactionsUpToMonth = useMemo(
    () => filterTransactionsUpToMonth(transactions, selectedMonth),
    [selectedMonth, transactions],
  );

  return {
    selectedMonth,
    setSelectedMonth,
    monthPickerVisible,
    setMonthPickerVisible,
    availableMonths,
    previousAvailableMonth,
    nextAvailableMonth,
    monthTransactions,
    transactionsUpToMonth,
  };
}
