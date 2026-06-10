import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useReducer } from "react";
import { Platform } from "react-native";

import {
  getInitialTransactionModalState,
  transactionModalReducer,
} from "@/components/transaction-modal/transaction-modal.reducer";
import type {
  ExpenseCategory,
  Transaction,
  TransactionCurrency,
  TransactionType,
} from "@/lib/database.types";
import { createTransaction, updateTransaction } from "@/lib/expenses";
import { dateToIsoDate } from "@/lib/transaction-helpers";

type UseTransactionFormOptions = {
  visible: boolean;
  session: Session | null;
  transaction?: Transaction | null;
  onClose: () => void;
  onCreated?: (transaction: Transaction) => void;
  onUpdated?: (transaction: Transaction) => void;
};

export function useTransactionForm({
  visible,
  session,
  transaction,
  onClose,
  onCreated,
  onUpdated,
}: UseTransactionFormOptions) {
  const [state, dispatch] = useReducer(
    transactionModalReducer,
    undefined,
    getInitialTransactionModalState,
  );
  const isEditing = Boolean(transaction);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (!transaction) {
      dispatch({ type: "reset" });
      return;
    }

    dispatch({ type: "loadTransaction", transaction });
  }, [transaction, visible]);

  function handleClose() {
    dispatch({ type: "reset" });
    onClose();
  }

  async function handleSave() {
    const normalizedTitle = state.title.trim();
    const normalizedNote = state.note.trim();
    const normalizedSpentAt = state.spentAt.trim();
    const parsedAmount = Number(state.amount);

    if (!session) {
      dispatch({
        type: "setMessage",
        message: "Sign in before saving transactions.",
      });
      return;
    }

    if (
      !normalizedTitle ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      dispatch({
        type: "setMessage",
        message: "Add a title and an amount greater than zero.",
      });
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedSpentAt)) {
      dispatch({ type: "setMessage", message: "Use date format YYYY-MM-DD." });
      return;
    }

    try {
      dispatch({ type: "setSaving", saving: true });
      dispatch({ type: "setMessage", message: null });

      const normalizedCategory =
        state.transactionType === "deposit" ? "other" : state.category;
      const transactionPayload = {
        transaction_type: state.transactionType,
        title: normalizedTitle,
        amount: Math.round(parsedAmount * 100) / 100,
        currency: state.currency,
        category: normalizedCategory,
        note: normalizedNote || null,
        spent_at: normalizedSpentAt,
      };

      if (transaction) {
        const updatedTransaction = await updateTransaction(
          transaction.id,
          transactionPayload,
        );
        onUpdated?.(updatedTransaction);
        handleClose();
        return;
      }

      const createdTransaction = await createTransaction({
        user_id: session.user.id,
        ...transactionPayload,
      });

      onCreated?.(createdTransaction);
      handleClose();
    } catch (error) {
      dispatch({
        type: "setMessage",
        message:
          error instanceof Error
            ? error.message
            : "Could not save transaction.",
      });
    } finally {
      dispatch({ type: "setSaving", saving: false });
    }
  }

  function setTransactionType(transactionType: TransactionType) {
    dispatch({ type: "setTransactionType", transactionType });
  }

  function setTitle(title: string) {
    dispatch({ type: "setTitle", title });
  }

  function setAmount(amount: string) {
    dispatch({ type: "setAmount", amount });
  }

  function setCurrency(currency: TransactionCurrency) {
    dispatch({ type: "setCurrency", currency });
  }

  function setCategory(category: ExpenseCategory) {
    dispatch({ type: "setCategory", category });
  }

  function setNote(note: string) {
    dispatch({ type: "setNote", note });
  }

  function setCategoryPickerVisible(visible: boolean) {
    dispatch({ type: "setCategoryPickerVisible", visible });
  }

  function setDatePickerVisible(visible: boolean) {
    dispatch({ type: "setDatePickerVisible", visible });
  }

  function setQuickDate(dayOffset: number) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + dayOffset);
    dispatch({ type: "setSpentAt", spentAt: dateToIsoDate(nextDate) });
  }

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      setDatePickerVisible(false);
    }

    if (selectedDate) {
      dispatch({ type: "setSpentAt", spentAt: dateToIsoDate(selectedDate) });
    }
  }

  return {
    state,
    isEditing,
    handleClose,
    handleSave,
    handleDateChange,
    setTransactionType,
    setTitle,
    setAmount,
    setCurrency,
    setCategory,
    setNote,
    setCategoryPickerVisible,
    setDatePickerVisible,
    setQuickDate,
  };
}
