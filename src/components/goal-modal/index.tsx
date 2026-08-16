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

import { SelectablePill } from '@/components/selectable-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { Goal, TransactionCurrency } from '@/lib/database.types';
import { createGoal, deleteGoal, updateGoal } from '@/lib/goals';
import { isSupabaseConfigured } from '@/lib/supabase';
import { transactionCurrencies } from '@/lib/transaction-helpers';

import { styles } from './goal-modal.styles';

type GoalModalProps = {
  visible: boolean;
  session: Session | null;
  goal?: Goal | null;
  onClose: () => void;
  onSaved: (goal: Goal) => void;
  onDeleted: (goalId: Goal['id']) => void;
};

export function GoalModal({
  visible,
  session,
  goal,
  onClose,
  onSaved,
  onDeleted,
}: GoalModalProps) {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currency, setCurrency] = useState<TransactionCurrency>('USD');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const isEditing = Boolean(goal);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setMessage(null);

    if (!goal) {
      setTitle('');
      setTargetAmount('');
      setCurrency('USD');
      setNote('');
      return;
    }

    setTitle(goal.title);
    setTargetAmount(String(goal.target_amount));
    setCurrency(goal.currency);
    setNote(goal.note ?? '');
  }, [goal, visible]);

  async function handleSave() {
    const normalizedTitle = title.trim();
    const parsedAmount = Number(targetAmount);

    if (!session) {
      setMessage('Sign in before saving goals.');
      return;
    }

    if (!normalizedTitle || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setMessage('Add a name and a target greater than zero.');
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        title: normalizedTitle,
        target_amount: Math.round(parsedAmount * 100) / 100,
        currency,
        note: note.trim() || null,
      };

      const savedGoal = goal
        ? await updateGoal(goal.id, payload)
        : await createGoal({ user_id: session.user.id, ...payload });

      onSaved(savedGoal);
      onClose();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not save the goal.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!goal) {
      return;
    }

    Alert.alert('Delete goal', `Remove "${goal.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setSaving(true);
            await deleteGoal(goal.id);
            onDeleted(goal.id);
            onClose();
          } catch (error) {
            setMessage(error instanceof Error ? error.message : 'Could not delete the goal.');
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }

  return (
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
                Goal
              </ThemedText>
              <ThemedText type="subtitle">{isEditing ? 'Edit goal' : 'New goal'}</ThemedText>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="New laptop"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            accessibilityLabel="Goal name"
          />

          <View style={styles.inlineRow}>
            <TextInput
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              style={[
                styles.input,
                styles.amountInput,
                { borderColor: theme.backgroundSelected, color: theme.text },
              ]}
              accessibilityLabel="Target amount"
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

          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Note optional"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { borderColor: theme.backgroundSelected, color: theme.text }]}
            accessibilityLabel="Goal note"
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
            accessibilityLabel="Save goal"
            style={({ pressed }) => [
              styles.saveButton,
              { opacity: pressed || saving || !isSupabaseConfigured ? 0.65 : 1 },
            ]}>
            <ThemedText type="smallBold" style={styles.saveButtonText}>
              {saving ? 'Saving…' : 'Save goal'}
            </ThemedText>
          </Pressable>

          {isEditing && (
            <Pressable
              onPress={handleDelete}
              disabled={saving}
              accessibilityRole="button"
              accessibilityLabel="Delete goal"
              style={({ pressed }) => [
                styles.deleteButton,
                { opacity: pressed || saving ? 0.65 : 1 },
              ]}>
              <ThemedText type="smallBold" style={styles.deleteText}>
                Delete goal
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
