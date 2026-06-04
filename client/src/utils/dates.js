export function isOverdue(task) {
  if (task.completed || !task.dueDate) return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function formatDate(isoString) {
  if (!isoString) return null;
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function toInputDate(isoString) {
  if (!isoString) return '';
  return isoString.split('T')[0];
}
