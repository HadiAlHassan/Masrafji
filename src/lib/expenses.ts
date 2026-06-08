import { supabase } from '@/lib/supabase';
import type { Database, NewTransaction, Transaction, TransactionType } from '@/lib/database.types';

type TransactionUpdate = Database['public']['Tables']['expenses']['Update'];

export async function listTransactions(type?: TransactionType) {
  if (!supabase) {
    return [];
  }

  let query = supabase
    .from('expenses')
    .select('*')
    .order('spent_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('transaction_type', type);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
}

export async function createTransaction(transaction: NewTransaction) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.from('expenses').insert(transaction).select('*').single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteTransaction(transactionId: Transaction['id']) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('expenses').delete().eq('id', transactionId);

  if (error) {
    throw error;
  }
}

export async function updateTransaction(
  transactionId: Transaction['id'],
  transaction: TransactionUpdate,
) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('expenses')
    .update(transaction)
    .eq('id', transactionId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export const listExpenses = listTransactions;
export const createExpense = createTransaction;
export const deleteExpense = deleteTransaction;
