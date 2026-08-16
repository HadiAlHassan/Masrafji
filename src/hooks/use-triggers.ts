import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';

import { useTransactionsContext } from '@/components/transactions-provider';
import type { TransactionTrigger } from '@/lib/database.types';
import { createTransaction } from '@/lib/expenses';
import { describeTriggers, getPendingTriggers } from '@/lib/trigger-helpers';
import { listTriggers, updateTrigger } from '@/lib/triggers';
import { todayIsoDate } from '@/lib/transaction-helpers';

export function useTriggers() {
  const { session, addTransaction } = useTransactionsContext();
  const [triggers, setTriggers] = useState<TransactionTrigger[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firingId, setFiringId] = useState<TransactionTrigger['id'] | null>(null);

  const load = useCallback(async () => {
    if (!session) {
      setTriggers([]);
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setErrorMessage(null);
      const nextTriggers = await listTriggers();
      setTriggers(nextTriggers);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not load triggers.');
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

  const describedTriggers = useMemo(() => describeTriggers(triggers), [triggers]);
  const pendingTriggers = useMemo(
    () => getPendingTriggers(describedTriggers),
    [describedTriggers],
  );

  /**
   * Creates the transaction the trigger describes and records that this occurrence has
   * been handled, so a scheduled trigger is not offered twice in the same period.
   */
  const fireTrigger = useCallback(
    async (trigger: TransactionTrigger, spentAt: string) => {
      if (!session) {
        setErrorMessage('Sign in before using triggers.');
        return;
      }

      try {
        setFiringId(trigger.id);
        setErrorMessage(null);

        const createdTransaction = await createTransaction({
          user_id: session.user.id,
          transaction_type: trigger.transaction_type,
          title: trigger.title,
          amount: Number(trigger.amount),
          currency: trigger.currency,
          category: trigger.transaction_type === 'deposit' ? 'other' : trigger.category,
          note: trigger.note,
          spent_at: spentAt,
        });

        addTransaction(createdTransaction);

        const updatedTrigger = await updateTrigger(trigger.id, {
          last_triggered_on: spentAt > todayIsoDate() ? todayIsoDate() : spentAt,
        });

        setTriggers((currentTriggers) =>
          currentTriggers.map((currentTrigger) =>
            currentTrigger.id === updatedTrigger.id ? updatedTrigger : currentTrigger,
          ),
        );
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Could not run the trigger.');
      } finally {
        setFiringId(null);
      }
    },
    [addTransaction, session],
  );

  /** Marks the current occurrence handled without creating a transaction. */
  const skipTrigger = useCallback(async (trigger: TransactionTrigger, dueDate: string) => {
    try {
      setFiringId(trigger.id);
      const updatedTrigger = await updateTrigger(trigger.id, { last_triggered_on: dueDate });

      setTriggers((currentTriggers) =>
        currentTriggers.map((currentTrigger) =>
          currentTrigger.id === updatedTrigger.id ? updatedTrigger : currentTrigger,
        ),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not skip the trigger.');
    } finally {
      setFiringId(null);
    }
  }, []);

  const upsertTrigger = useCallback((trigger: TransactionTrigger) => {
    setTriggers((currentTriggers) => {
      const exists = currentTriggers.some(
        (currentTrigger) => currentTrigger.id === trigger.id,
      );

      return exists
        ? currentTriggers.map((currentTrigger) =>
            currentTrigger.id === trigger.id ? trigger : currentTrigger,
          )
        : [trigger, ...currentTriggers];
    });
  }, []);

  const dropTrigger = useCallback((triggerId: TransactionTrigger['id']) => {
    setTriggers((currentTriggers) =>
      currentTriggers.filter((currentTrigger) => currentTrigger.id !== triggerId),
    );
  }, []);

  return {
    session,
    triggers,
    describedTriggers,
    pendingTriggers,
    loading,
    refreshing,
    errorMessage,
    firingId,
    refresh,
    fireTrigger,
    skipTrigger,
    upsertTrigger,
    dropTrigger,
  };
}
