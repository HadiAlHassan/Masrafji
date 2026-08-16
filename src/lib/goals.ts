import { supabase } from '@/lib/supabase';
import type { Goal, GoalUpdate, NewGoal } from '@/lib/database.types';

export async function listGoals() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createGoal(goal: NewGoal) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase.from('goals').insert(goal).select('*').single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateGoal(goalId: Goal['id'], goal: GoalUpdate) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('goals')
    .update(goal)
    .eq('id', goalId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteGoal(goalId: Goal['id']) {
  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.from('goals').delete().eq('id', goalId);

  if (error) {
    throw error;
  }
}
