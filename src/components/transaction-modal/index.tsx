import type { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useReducer } from "react";
import { KeyboardAvoidingView, Modal, Platform, TextInput } from "react-native";

import { AmountCurrencyRow } from "@/components/transaction-modal/amount-currency-row";
import { CategorySelectorButton } from "@/components/transaction-modal/category-selector-button";
import { SaveTransactionButton } from "@/components/transaction-modal/save-transaction-button";
import { TransactionDateField } from "@/components/transaction-modal/transaction-date-field";
import { TransactionModalHeader } from "@/components/transaction-modal/transaction-modal-header";
import {
  getInitialTransactionModalState,
  transactionModalReducer,
} from "@/components/transaction-modal/transaction-modal.reducer";
import { TransactionTypeSelector } from "@/components/transaction-modal/transaction-type-selector";
import { CategoryPicker } from "@/components/category-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import type { Transaction } from "@/lib/database.types";
import { createTransaction, updateTransaction } from "@/lib/expenses";
import { dateToIsoDate } from "@/lib/transaction-helpers";

import { styles } from "./transaction-modal.styles";

type TransactionModalProps = {
  visible: boolean;
  session: Session | null;
  transaction?: Transaction | null;
  onClose: () => void;
  onCreated?: (transaction: Transaction) => void;
  onUpdated?: (transaction: Transaction) => void;
};

export function TransactionModal({
  visible,
  session,
  transaction,
  onClose,
  onCreated,
  onUpdated,
}: TransactionModalProps) {
  const theme = useTheme();
  const [state, dispatch] = useReducer(
    transactionModalReducer,
    undefined,
    getInitialTransactionModalState,
  );
  const {
    transactionType,
    title,
    amount,
    currency,
    category,
    spentAt,
    note,
    saving,
    message,
    categoryPickerVisible,
    datePickerVisible,
  } = state;

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

  function resetForm() {
    dispatch({ type: "reset" });
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  async function handleSave() {
    const normalizedTitle = title.trim();
    const normalizedNote = note.trim();
    const normalizedSpentAt = spentAt.trim();
    const parsedAmount = Number(amount);

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
        transactionType === "deposit" ? "other" : category;
      const transactionPayload = {
        transaction_type: transactionType,
        title: normalizedTitle,
        amount: Math.round(parsedAmount * 100) / 100,
        currency,
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

  function setQuickDate(dayOffset: number) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + dayOffset);
    dispatch({ type: "setSpentAt", spentAt: dateToIsoDate(nextDate) });
  }

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") {
      dispatch({ type: "setDatePickerVisible", visible: false });
    }

    if (selectedDate) {
      dispatch({ type: "setSpentAt", spentAt: dateToIsoDate(selectedDate) });
    }
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.overlay}
        >
          <ThemedView type="backgroundElement" style={styles.sheet}>
            <TransactionModalHeader isEditing={isEditing} onClose={handleClose} />

            <TransactionTypeSelector
              value={transactionType}
              onChange={(nextTransactionType) =>
                dispatch({
                  type: "setTransactionType",
                  transactionType: nextTransactionType,
                })
              }
            />

            <TextInput
              value={title}
              onChangeText={(nextTitle) =>
                dispatch({ type: "setTitle", title: nextTitle })
              }
              placeholder={
                transactionType === "deposit"
                  ? "Where did this come from?"
                  : "What was this for?"
              }
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { borderColor: theme.backgroundSelected, color: theme.text },
              ]}
              accessibilityLabel="Transaction title"
            />

            <AmountCurrencyRow
              amount={amount}
              currency={currency}
              onAmountChange={(nextAmount) =>
                dispatch({ type: "setAmount", amount: nextAmount })
              }
              onCurrencyChange={(nextCurrency) =>
                dispatch({ type: "setCurrency", currency: nextCurrency })
              }
            />

            {transactionType === "expense" && (
              <CategorySelectorButton
                category={category}
                onPress={() =>
                  dispatch({ type: "setCategoryPickerVisible", visible: true })
                }
              />
            )}

            <TransactionDateField
              spentAt={spentAt}
              datePickerVisible={datePickerVisible}
              onQuickDate={setQuickDate}
              onOpenDatePicker={() =>
                dispatch({ type: "setDatePickerVisible", visible: true })
              }
              onDateChange={handleDateChange}
            />

            <TextInput
              value={note}
              onChangeText={(nextNote) =>
                dispatch({ type: "setNote", note: nextNote })
              }
              placeholder="Note optional"
              placeholderTextColor={theme.textSecondary}
              style={[
                styles.input,
                { borderColor: theme.backgroundSelected, color: theme.text },
              ]}
              accessibilityLabel="Transaction note"
            />

            {message && (
              <ThemedText type="small" themeColor="textSecondary">
                {message}
              </ThemedText>
            )}

            <SaveTransactionButton saving={saving} onPress={handleSave} />
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
      <CategoryPicker
        visible={categoryPickerVisible}
        selectedCategory={category}
        onSelect={(nextCategory) =>
          dispatch({ type: "setCategory", category: nextCategory })
        }
        onClose={() =>
          dispatch({ type: "setCategoryPickerVisible", visible: false })
        }
      />
    </>
  );
}
