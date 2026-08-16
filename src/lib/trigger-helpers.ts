import type { TransactionTrigger } from '@/lib/database.types';
import { dateToIsoDate } from '@/lib/transaction-helpers';

export type TriggerStatus = 'due' | 'overdue' | 'scheduled' | 'manual';

export type TriggerWithStatus = {
  trigger: TransactionTrigger;
  status: TriggerStatus;
  /** The date a fired transaction should carry. Null for manual triggers. */
  dueDate: string | null;
};

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/**
 * The occurrence date inside a given month, clamped to the last day when the month is
 * shorter than the configured day. A trigger set to the 31st fires on the 28th in
 * February, which matches how billing dates usually behave.
 */
function occurrenceInMonth(year: number, month: number, dayOfMonth: number) {
  const clampedDay = Math.min(dayOfMonth, daysInMonth(year, month));

  return dateToIsoDate(new Date(year, month - 1, clampedDay));
}

/**
 * The most recent occurrence on or before `today`. Looks at the current month first and
 * falls back to the previous month when this month's date has not arrived yet.
 */
export function getLatestOccurrence(dayOfMonth: number, today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const thisMonth = occurrenceInMonth(year, month, dayOfMonth);
  const todayIso = dateToIsoDate(today);

  if (thisMonth <= todayIso) {
    return thisMonth;
  }

  const previousMonthDate = new Date(year, month - 2, 1);

  return occurrenceInMonth(
    previousMonthDate.getFullYear(),
    previousMonthDate.getMonth() + 1,
    dayOfMonth,
  );
}

/**
 * The next occurrence strictly after `today`, used to tell the user when a scheduled
 * trigger comes around again.
 */
export function getNextOccurrence(dayOfMonth: number, today = new Date()) {
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const thisMonth = occurrenceInMonth(year, month, dayOfMonth);
  const todayIso = dateToIsoDate(today);

  if (thisMonth > todayIso) {
    return thisMonth;
  }

  const nextMonthDate = new Date(year, month, 1);

  return occurrenceInMonth(
    nextMonthDate.getFullYear(),
    nextMonthDate.getMonth() + 1,
    dayOfMonth,
  );
}

/**
 * Classifies a trigger against today.
 *
 * `last_triggered_on` is what keeps an occurrence from being offered twice: once the
 * latest occurrence has been fired, the trigger goes back to `scheduled`.
 */
export function describeTrigger(
  trigger: TransactionTrigger,
  today = new Date(),
): TriggerWithStatus {
  if (trigger.day_of_month == null) {
    return { trigger, status: 'manual', dueDate: null };
  }

  const latestOccurrence = getLatestOccurrence(trigger.day_of_month, today);
  const alreadyFired =
    trigger.last_triggered_on != null && trigger.last_triggered_on >= latestOccurrence;

  if (alreadyFired) {
    return { trigger, status: 'scheduled', dueDate: null };
  }

  const todayIso = dateToIsoDate(today);

  return {
    trigger,
    status: latestOccurrence === todayIso ? 'due' : 'overdue',
    dueDate: latestOccurrence,
  };
}

export function describeTriggers(triggers: TransactionTrigger[], today = new Date()) {
  return triggers
    .filter((trigger) => trigger.active)
    .map((trigger) => describeTrigger(trigger, today));
}

export function getPendingTriggers(triggers: TriggerWithStatus[]) {
  return triggers.filter(
    (described) => described.status === 'due' || described.status === 'overdue',
  );
}
