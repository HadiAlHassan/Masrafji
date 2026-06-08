import { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import type { Session } from '@supabase/supabase-js';

import { CategoryPicker } from '@/components/category-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type {
  ExpenseCategory,
  Transaction,
  TransactionCurrency,
  TransactionType,
} from '@/lib/database.types';
import { createTransaction, updateTransaction } from '@/lib/expenses';
import {
  dateToIsoDate,
  isoDateToLocalDate,
  todayIsoDate,
  transactionCategoryDetails,
  transactionCurrencies,
} from '@/lib/transaction-helpers';
import { isSupabaseConfigured } from '@/lib/supabase';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './transaction-modal.styles';

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
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<TransactionCurrency>('USD');
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [spentAt, setSpentAt] = useState(todayIsoDate());
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const isEditing = Boolean(transaction);

  useEffect(() => {
    if (!visible) {
      return;
    }

    if (!transaction) {
      resetForm();
      return;
    }

    setTransactionType(transaction.transaction_type);
    setTitle(transaction.title);
    setAmount(String(Number(transaction.amount)));
    setCurrency(transaction.currency);
    setCategory(transaction.category);
    setSpentAt(transaction.spent_at);
    setNote(transaction.note ?? '');
    setMessage(null);
  }, [transaction, visible]);

  function resetForm() {
    setTitle('');
    setAmount('');
    setCategory('food');
    setCurrency('USD');
    setTransactionType('expense');
    setSpentAt(todayIsoDate());
    setNote('');
    setMessage(null);
    setCategoryPickerVisible(false);
    setDatePickerVisible(false);
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
      setMessage('Sign in before saving transactions.');
      return;
    }

    if (!normalizedTitle || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage('Add a title and an amount greater than zero.');
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedSpentAt)) {
      setMessage('Use date format YYYY-MM-DD.');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);
      const normalizedCategory = transactionType === 'deposit' ? 'other' : category;
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
        const updatedTransaction = await updateTransaction(transaction.id, transactionPayload);
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
      setMessage(error instanceof Error ? error.message : 'Could not save transaction.');
    } finally {
      setSaving(false);
    }
  }

  function setQuickDate(dayOffset: number) {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + dayOffset);
    setSpentAt(dateToIsoDate(nextDate));
  }

  function handleDateChange(_event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
    }

    if (selectedDate) {
      setSpentAt(dateToIsoDate(selectedDate));
    }
  }

  const selectedCategoryDetails = transactionCategoryDetails[category];

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <ThemedView type="backgroundElement" style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <View>
              <ThemedText type="small" themeColor="textSecondary">
                {isEditing ? 'Edit transaction' : 'New transaction'}
              </ThemedText>
              <ThemedText type="subtitle">{isEditing ? 'Update cashflow' : 'Add cashflow'}</ThemedText>
            </View>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close add transaction modal"
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.segmentedRow}>
            {(['expense', 'deposit'] as const).map((typeOption) => {
              const selected = typeOption === transactionType;

              return (
                <Pressable
                  key={typeOption}
                  onPress={() => setTransactionType(typeOption)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  style={[
                    styles.segment,
                    { backgroundColor: selected ? theme.text : theme.backgroundSelected },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{ color: selected ? theme.background : theme.text }}>
                    {typeOption === 'expense' ? 'Expense' : 'Deposit'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={
              transactionType === 'deposit'
                ? 'Where did this come from?'
                : 'What was this for?'
            }
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            accessibilityLabel="Transaction title"
          />

          <View style={styles.inlineRow}>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="Amount"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                styles.amountInput,
                { borderColor: theme.backgroundSelected, color: theme.text },
              ]}
              accessibilityLabel="Transaction amount"
            />
            <View style={styles.currencyRow}>
              {transactionCurrencies.map((currencyOption) => {
                const selected = currencyOption === currency;

                return (
                  <Pressable
                    key={currencyOption}
                    onPress={() => setCurrency(currencyOption)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    style={[
                      styles.currencyButton,
                      { backgroundColor: selected ? theme.text : theme.backgroundSelected },
                    ]}>
                    <ThemedText
                      type="smallBold"
                      style={{ color: selected ? theme.background : theme.text }}>
                      {currencyOption}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {transactionType === 'expense' && (
            <Pressable
              onPress={() => setCategoryPickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Category ${selectedCategoryDetails.label}`}
              style={[styles.categorySelector, { borderColor: theme.backgroundSelected }]}>
              <View style={styles.categorySelectorContent}>
                <Ionicons name={selectedCategoryDetails.icon} size={22} color={theme.text} />
                <View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Category
                  </ThemedText>
                  <ThemedText type="smallBold">{selectedCategoryDetails.label}</ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>
          )}

          <View style={styles.dateSection}>
            <View style={styles.quickDateRow}>
              <Pressable
                onPress={() => setQuickDate(0)}
                accessibilityRole="button"
                accessibilityLabel="Set date to today"
                style={[
                  styles.quickDateButton,
                  {
                    backgroundColor:
                      spentAt === todayIsoDate() ? theme.text : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{ color: spentAt === todayIsoDate() ? theme.background : theme.text }}>
                  Today
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setQuickDate(-1)}
                accessibilityRole="button"
                accessibilityLabel="Set date to yesterday"
                style={[
                  styles.quickDateButton,
                  {
                    backgroundColor:
                      spentAt === dateToIsoDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
                        ? theme.text
                        : theme.backgroundSelected,
                  },
                ]}>
                <ThemedText
                  type="smallBold"
                  style={{
                    color:
                      spentAt === dateToIsoDate(new Date(Date.now() - 24 * 60 * 60 * 1000))
                        ? theme.background
                        : theme.text,
                  }}>
                  Yesterday
                </ThemedText>
              </Pressable>
            </View>

            <Pressable
              onPress={() => setDatePickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`Transaction date ${spentAt}`}
              style={[styles.dateSelector, { borderColor: theme.backgroundSelected }]}>
              <View style={styles.categorySelectorContent}>
                <Ionicons name="calendar-outline" size={22} color={theme.text} />
                <View>
                  <ThemedText type="small" themeColor="textSecondary">
                    Date
                  </ThemedText>
                  <ThemedText type="smallBold">{spentAt}</ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
            </Pressable>

            {datePickerVisible && (
              <DateTimePicker
                value={isoDateToLocalDate(spentAt)}
                mode="date"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note optional"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            accessibilityLabel="Transaction note"
          />

          {message && (
            <ThemedText type="small" themeColor="textSecondary">
              {message}
            </ThemedText>
          )}

          <Pressable
            onPress={handleSave}
            disabled={saving || !isSupabaseConfigured}
            accessibilityRole="button"
            accessibilityLabel="Save transaction"
            style={({ pressed }) => [
              styles.saveButton,
              { opacity: pressed || saving || !isSupabaseConfigured ? 0.65 : 1 },
            ]}>
            <ThemedText type="smallBold" style={styles.saveButtonText}>
              {saving ? 'Saving…' : 'Save transaction'}
            </ThemedText>
          </Pressable>
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
