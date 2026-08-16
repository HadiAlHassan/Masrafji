import type { Goal, TransactionCurrency } from '@/lib/database.types';

export type GoalProgress = {
  goal: Goal;
  /** How much of the goal the current savings pot covers, 0 to 1. */
  progress: number;
  percent: number;
  remaining: number;
  affordable: boolean;
};

/**
 * Measures every goal against the shared savings pot. Goals are targets rather than
 * envelopes, so the same saved money is compared against each one — the question being
 * answered is "what could this buy", not "what has been set aside for what".
 */
export function describeGoals(
  goals: Goal[],
  savedByCurrency: Record<TransactionCurrency, number>,
): GoalProgress[] {
  return goals.map((goal) => {
    const saved = savedByCurrency[goal.currency] ?? 0;
    const target = Number(goal.target_amount);
    const progress = target > 0 ? Math.min(saved / target, 1) : 0;

    return {
      goal,
      progress,
      percent: Math.round(progress * 100),
      remaining: Math.max(target - saved, 0),
      affordable: saved >= target,
    };
  });
}

/**
 * Affordable goals first and cheapest first within each group, so the goals the current
 * pot can actually cover surface at the top.
 */
export function sortGoalsByReach(goals: GoalProgress[]) {
  return [...goals].sort((firstGoal, secondGoal) => {
    if (firstGoal.affordable !== secondGoal.affordable) {
      return firstGoal.affordable ? -1 : 1;
    }

    if (firstGoal.affordable) {
      return Number(secondGoal.goal.target_amount) - Number(firstGoal.goal.target_amount);
    }

    return firstGoal.remaining - secondGoal.remaining;
  });
}

export function splitGoalsByStatus(goals: GoalProgress[]) {
  const active = goals.filter((described) => described.goal.achieved_at == null);
  const achieved = goals.filter((described) => described.goal.achieved_at != null);

  return {
    withinReach: sortGoalsByReach(active.filter((described) => described.affordable)),
    workingToward: sortGoalsByReach(active.filter((described) => !described.affordable)),
    achieved,
  };
}
