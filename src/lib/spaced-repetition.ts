const MIN_INTERVAL_DAYS = 1;
const MAX_INTERVAL_DAYS = 60;

// Простой Leitner-подобный алгоритм: правильно -> интервал удваивается, ошибка -> сброс на 1 день
export function nextInterval(currentIntervalDays: number, wasCorrect: boolean): number {
  if (!wasCorrect) return MIN_INTERVAL_DAYS;
  return Math.min(currentIntervalDays * 2, MAX_INTERVAL_DAYS);
}

export function nextDueDate(intervalDays: number, from: Date = new Date()): Date {
  const due = new Date(from);
  due.setDate(due.getDate() + intervalDays);
  return due;
}
