import Ionicons from '@expo/vector-icons/Ionicons';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CategoryPicker } from '@/components/category-picker';
import { SelectablePill } from '@/components/selectable-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type {
  ExpenseCategory,
  TransactionCurrency,
  TransactionTrigger,
  TransactionType,
} from '@/lib/database.types';
import { isSupabaseConfigured } from '@/lib/supabase';
import { transactionCategoryDetails, transactionCurrencies } from '@/lib/transaction-helpers';
import { createTrigger, deleteTrigger, updateTrigger } from '@/lib/triggers';

import { styles } from './trigger-modal.styles';

type TriggerModalProps = {
  visible: boolean;
  session: Session | null;
  trigger?: TransactionTrigger | null;
  onClose: () => void;
  onSaved: (trigger: TransactionTrigger) => void;
  onDeleted: (triggerId: TransactionTrigger['id']) => void;
};

export function TriggerModal({
  visible,
  session,
  trigger,
  onClose,
  onSaved,
  onDeleted,
}: TriggerModalProps) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [transactionType, setTransactionType] = useState<TransactionType>('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<TransactionCurrency>('USD');
  const [category, setCategory] = useState<ExpenseCategory>('other');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isEditing = Boolean(trigger);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setMessage(null);

    if (!trigger) {
      setTransactionType('expense');
      setTitle('');
      setAmount('');
      setCurrency('USD');
      setCategory('other');
      setDayOfMonth('');
      return;
    }

    setTransactionType(trigger.transaction_type);
    setTitle(trigger.title);
    setAmount(String(trigger.amount));
    setCurrency(trigger.currency);
    setCategory(trigger.category);
    setDayOfMonth(trigger.day_of_month == null ? '' : String(trigger.day_of_month));
  }, [trigger, visible]);

  async function handleSave() {
    const normalizedTitle = title.trim();
    const parsedAmount = Number(amount);
    const normalizedDay = dayOfMonth.trim();

    if (!session) {
      setMessage('Sign in before saving triggers.');
      return;
    }

    if (!normalizedTitle || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage('Add a name and an amount greater than zero.');
      return;
    }

    let parsedDay: number | null = null;

    if (normalizedDay) {
      parsedDay = Number(normalizedDay);

      if (!Number.isInteger(parsedDay) || parsedDay < 1 || parsedDay > 31) {
        setMessage('Use a day between 1 and 31, or leave it empty for a manual trigger.');
        return;
      }
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        transaction_type: transactionType,
        title: normalizedTitle,
        amount: Math.round(parsedAmount * 100) / 100,
        currency,
        category: transactionType === 'deposit' ? ('other' as const) : category,
        day_of_month: parsedDay,
      };

      const savedTrigger = trigger
        ? await updateTrigger(trigger.id, payload)
        : await createTrigger({ user_id: session.user.id, ...payload });

      onSaved(savedTrigger);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the trigger.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!trigger) {
      return;
    }

    Alert.alert('Delete trigger', `Remove "${trigger.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await deleteTrigger(trigger.id);
            onDeleted(trigger.id);
            onClose();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not delete the trigger.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.overlay}>
          <ThemedView
            type="backgroundElement"
            style={[styles.sheet, { paddingBottom: safeAreaInsets.bottom + Spacing.three }]}>
            <View style={styles.header}>
              <View>
                <ThemedText type="small" themeColor="textSecondary">
                  Trigger
                </ThemedText>
                <ThemedText type="subtitle">{isEditing ? 'Edit trigger' : 'New trigger'}</ThemedText>
              </View>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.segmentedRow}>
              {(['expense', 'deposit'] as const).map((option) => (
                <SelectablePill
                  key={option}
                  onPress={() => setTransactionType(option)}
                  selected={option === transactionType}
                  unselectedBackground={theme.background}
                  style={styles.segment}>
                  {option === 'expense' ? 'Expense' : 'Deposit'}
                </SelectablePill>
              ))}
            </View>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={
                transactionType === 'deposit' ? 'Wafeq salary' : 'Netflix subscription'
              }
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
              accessibilityLabel="Trigger name"
            />

            <View style={styles.inlineRow}>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  styles.amountInput,
                  { borderColor: theme.backgroundSelected, color: theme.text },
                ]}
                accessibilityLabel="Amount"
              />
              {transactionCurrencies.map((option) => (
                <SelectablePill
                  key={option}
                  onPress={() => setCurrency(option)}
                  selected={option === currency}
                  unselectedBackground={theme.background}
                  style={styles.currencyButton}>
                  {option}
                </SelectablePill>
              ))}
            </View>

            {transactionType === 'expense' && (
              <SelectablePill
                onPress={() => setCategoryPickerVisible(true)}
                selected={false}
                unselectedBackground={theme.background}
                style={styles.segment}>
                {transactionCategoryDetails[category].label}
              </SelectablePill>
            )}

            <View style={styles.scheduleSection}>
              <ThemedText type="small" themeColor="textSecondary">
                Day of month — leave empty to run it manually
              </ThemedText>
              <TextInput
                value={dayOfMonth}
                onChangeText={setDayOfMonth}
                placeholder="e.g. 12"
                placeholderTextColor={theme.textSecondary}
                keyboardType="number-pad"
                style={[
                  styles.input,
                  styles.dayInput,
                  { borderColor: theme.backgroundSelected, color: theme.text },
                ]}
                accessibilityLabel="Day of month"
              />
            </View>

            {message && (
              <ThemedText type="small" themeColor="textSecondary">
                {message}
              </ThemedText>
            )}

            <Pressable
              onPress={handleSave}
              disabled={saving || !isSupabaseConfigured}
              accessibilityRole="button"
              accessibilityLabel="Save trigger"
              style={({ pressed }) => [
                styles.saveButton,
                { opacity: pressed || saving || !isSupabaseConfigured ? 0.65 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.saveButtonText}>
                {saving ? 'Saving…' : 'Save trigger'}
              </ThemedText>
            </Pressable>

            {isEditing && (
              <Pressable
                onPress={handleDelete}
                disabled={saving}
                accessibilityRole="button"
                accessibilityLabel="Delete trigger"
                style={({ pressed }) => [
                  styles.deleteButton,
                  { opacity: pressed || saving ? 0.65 : 1 },
                ]}>
                <ThemedText type="smallBold" style={styles.deleteText}>
                  Delete trigger
                </ThemedText>
              </Pressable>
            )}
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
