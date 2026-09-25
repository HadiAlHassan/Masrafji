import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useTransactionsContext } from '@/components/transactions-provider';
import type { Goal, TransactionCurrency } from '@/lib/database.types';
import { createTransaction, deleteTransaction, updateTransaction } from '@/lib/expenses';
import { describeGoals, splitGoalsByStatus } from '@/lib/goal-helpers';
import { listGoals, updateGoal } from '@/lib/goals';
import {
  calculateSavedTotal,
  countSavingContributions,
  SavingCategory,
  todayIsoDate,
  transactionCurrencies,
} from '@/lib/transaction-helpers';

export function useGoals() {
  const { session, transactions, addTransaction, replaceTransaction, removeTransaction } =
    useTransactionsContext();
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
   * Records the purchase as a real expense dated today and consumes the saving
   * contributions that fund it (deleted or reduced, newest first). The contributions
   * already took the money out of the available balance, so they become the purchase —
   * the pot drains and the balance is charged once, never twice.
   */
  const achieveGoal = useCallback(
    async (goal: Goal) => {
      if (!session) {
        setErrorMessage('Sign in before completing goals.');
        return;
      }

      const target = Number(goal.target_amount);

      try {
        setBusyGoalId(goal.id);
        setErrorMessage(null);

        const purchase = await createTransaction({
          user_id: session.user.id,
          transaction_type: 'expense',
          title: goal.title,
          amount: target,
          currency: goal.currency,
          category: 'shopping',
          note: 'Bought from savings',
          spent_at: todayIsoDate(),
        });

        addTransaction(purchase);

        const undo: (() => Promise<void>)[] = [];
        let remaining = target;

        try {
          const contributions = transactions
            .filter(
              (transaction) =>
                transaction.currency === goal.currency &&
                transaction.transaction_type === 'expense' &&
                transaction.category === SavingCategory,
            )
            .sort((first, second) => second.spent_at.localeCompare(first.spent_at));

          for (const contribution of contributions) {
            if (remaining <= 0) {
              break;
            }

            const amount = Number(contribution.amount);

            if (amount <= remaining) {
              await deleteTransaction(contribution.id);
              removeTransaction(contribution.id);
              undo.push(async () => {
                const restored = await createTransaction({
                  user_id: contribution.user_id,
                  transaction_type: contribution.transaction_type,
                  title: contribution.title,
                  amount: Number(contribution.amount),
                  currency: contribution.currency,
                  category: contribution.category,
                  note: contribution.note,
                  spent_at: contribution.spent_at,
                });
                addTransaction(restored);
              });
              remaining = Math.round((remaining - amount) * 100) / 100;
            } else {
              const reducedAmount = Math.round((amount - remaining) * 100) / 100;

              await updateTransaction(contribution.id, { amount: reducedAmount });
              replaceTransaction({ ...contribution, amount: reducedAmount });
              undo.push(async () => {
                await updateTransaction(contribution.id, { amount });
                replaceTransaction(contribution);
              });
              remaining = 0;
            }
          }

          const updatedGoal = await updateGoal(goal.id, { achieved_at: todayIsoDate() });

          setGoals((currentGoals) =>
            currentGoals.map((currentGoal) =>
              currentGoal.id === updatedGoal.id ? updatedGoal : currentGoal,
            ),
          );
        } catch (error) {
          // The goal was not marked, so undo the money moves (contributions then the
          // purchase) — otherwise the pot is drained while the goal still reads as
          // buyable and can be bought twice.
          for (const undoStep of undo.reverse()) {
            try {
              await undoStep();
            } catch {
              // Best effort; the primary error is reported below.
            }
          }

          try {
            await deleteTransaction(purchase.id);
          } catch {
            // Best effort; the purchase no longer exists locally either way.
          }
          removeTransaction(purchase.id);

          throw error;
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not complete the goal.');
      } finally {
        setBusyGoalId(null);
      }
    },
    [addTransaction, removeTransaction, replaceTransaction, session, transactions],
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
