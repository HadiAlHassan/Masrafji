import { supabase } from '@/lib/supabase';
import type {
  NewTransactionTrigger,
  TransactionTrigger,
  TransactionTriggerUpdate,
} from '@/lib/database.types';

export async function listTriggers() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('transaction_triggers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createTrigger(trigger: NewTransactionTrigger) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('transaction_triggers')
    .insert(trigger)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateTrigger(
  triggerId: TransactionTrigger['id'],
  trigger: TransactionTriggerUpdate,
) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('transaction_triggers')
    .update(trigger)
    .eq('id', triggerId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTrigger(triggerId: TransactionTrigger['id']) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('transaction_triggers').delete().eq('id', triggerId);

  if (error) {
    throw error;
  }
}
