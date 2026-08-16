import type { Session } from "@supabase/supabase-js";
import { KeyboardAvoidingView, Modal, Platform, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryPicker } from "@/components/category-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { AmountCurrencyRow } from "@/components/transaction-modal/amount-currency-row";
import { CategorySelectorButton } from "@/components/transaction-modal/category-selector-button";
import { SaveTransactionButton } from "@/components/transaction-modal/save-transaction-button";
import { TransactionDateField } from "@/components/transaction-modal/transaction-date-field";
import { TransactionModalHeader } from "@/components/transaction-modal/transaction-modal-header";
import { TransactionTypeSelector } from "@/components/transaction-modal/transaction-type-selector";
import { useTransactionForm } from "@/components/transaction-modal/use-transaction-form";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import type { Transaction } from "@/lib/database.types";

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
  const safeAreaInsets = useSafeAreaInsets();
  const {
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
  } = useTransactionForm({
    visible,
    session,
    transaction,
    onClose,
    onCreated,
    onUpdated,
  });
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
          <ThemedView
            type="backgroundElement"
            style={[
              styles.sheet,
              { paddingBottom: safeAreaInsets.bottom + Spacing.three },
            ]}
          >
            <TransactionModalHeader
              isEditing={isEditing}
              onClose={handleClose}
            />

            <TransactionTypeSelector
              value={transactionType}
              onChange={setTransactionType}
            />

            <TextInput
              value={title}
              onChangeText={setTitle}
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
              onAmountChange={setAmount}
              onCurrencyChange={setCurrency}
            />

            {transactionType === "expense" && (
              <CategorySelectorButton
                category={category}
                onPress={() => setCategoryPickerVisible(true)}
              />
            )}

            <TransactionDateField
              spentAt={spentAt}
              datePickerVisible={datePickerVisible}
              onQuickDate={setQuickDate}
              onOpenDatePicker={() => setDatePickerVisible(true)}
              onDateChange={handleDateChange}
            />

            <TextInput
              value={note}
              onChangeText={setNote}
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
        onSelect={setCategory}
        onClose={() => setCategoryPickerVisible(false)}
      />
    </>
  );
}
