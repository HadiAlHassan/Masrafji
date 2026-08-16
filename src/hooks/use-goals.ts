import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useTransactionsContext } from '@/components/transactions-provider';
import type { Goal, TransactionCurrency } from '@/lib/database.types';
import { createTransaction } from '@/lib/expenses';
import { describeGoals, splitGoalsByStatus } from '@/lib/goal-helpers';
import { listGoals, updateGoal } from '@/lib/goals';
import {
  calculateSavedTotal,
  countSavingContributions,
  todayIsoDate,
  transactionCurrencies,
} from '@/lib/transaction-helpers';

export function useGoals() {
  const { session, transactions, addTransaction } = useTransactionsContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [busyGoalId, setBusyGoalId] = useState<Goal['id'] | null>(null);

  const load = useCallback(async () => {
    if (!session) {
      setGoals([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setErrorMessage(null);
      const nextGoals = await listGoals();
      setGoals(nextGoals);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load goals.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  const savedByCurrency = useMemo(
    () =>
      Object.fromEntries(
        transactionCurrencies.map((currency) => [
          currency,
          calculateSavedTotal(transactions, currency),
        ]),
      ) as Record<TransactionCurrency, number>,
    [transactions],
  );

  const contributionCounts = useMemo(
    () =>
      Object.fromEntries(
        transactionCurrencies.map((currency) => [
          currency,
          countSavingContributions(transactions, currency),
        ]),
      ) as Record<TransactionCurrency, number>,
    [transactions],
  );

  const describedGoals = useMemo(
    () => describeGoals(goals, savedByCurrency),
    [goals, savedByCurrency],
  );
  const groupedGoals = useMemo(() => splitGoalsByStatus(describedGoals), [describedGoals]);

  /**
   * Records the purchase as a real expense so the savings pot reflects the money actually
   * leaving, then marks the goal achieved.
   */
  const achieveGoal = useCallback(
    async (goal: Goal) => {
      if (!session) {
        setErrorMessage('Sign in before completing goals.');
        return;
      }

      try {
        setBusyGoalId(goal.id);
        setErrorMessage(null);

        const createdTransaction = await createTransaction({
          user_id: session.user.id,
          transaction_type: 'expense',
          title: goal.title,
          amount: Number(goal.target_amount),
          currency: goal.currency,
          category: 'shopping',
          note: 'Savings goal reached',
          spent_at: todayIsoDate(),
        });

        addTransaction(createdTransaction);

        const updatedGoal = await updateGoal(goal.id, { achieved_at: todayIsoDate() });

        setGoals((currentGoals) =>
          currentGoals.map((currentGoal) =>
            currentGoal.id === updatedGoal.id ? updatedGoal : currentGoal,
          ),
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not complete the goal.');
      } finally {
        setBusyGoalId(null);
      }
    },
    [addTransaction, session],
  );

  const upsertGoal = useCallback((goal: Goal) => {
    setGoals((currentGoals) => {
      const exists = currentGoals.some((currentGoal) => currentGoal.id === goal.id);

      return exists
        ? currentGoals.map((currentGoal) => (currentGoal.id === goal.id ? goal : currentGoal))
        : [goal, ...currentGoals];
    });
  }, []);

  const dropGoal = useCallback((goalId: Goal['id']) => {
    setGoals((currentGoals) => currentGoals.filter((currentGoal) => currentGoal.id !== goalId));
  }, []);

  return {
    session,
    goals,
    describedGoals,
    groupedGoals,
    savedByCurrency,
    contributionCounts,
    loading,
    refreshing,
    errorMessage,
    busyGoalId,
    refresh,
    achieveGoal,
    upsertGoal,
    dropGoal,
  };
}
