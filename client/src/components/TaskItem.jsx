import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskForm from './TaskForm';
import ConfirmDialog from './ConfirmDialog';
import { isOverdue, formatDate } from '../utils/dates';

export default function TaskItem({ task, onToggle, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const overdue = isOverdue(task);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleUpdate = async (data) => {
    await onUpdate(task.id, data);
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="task-item task-item--editing" ref={setNodeRef} style={style}>
        <TaskForm
          initialData={task}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className={[
          'task-item',
          task.completed ? 'task-item--completed' : '',
          overdue ? 'task-item--overdue' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* Drag handle */}
        <button
          className="drag-handle"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>

        {/* Checkbox */}
        <button
          className="checkbox"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? 'Mark as active' : 'Mark as complete'}
          onClick={() => onToggle(task)}
        >
          {task.completed ? (
            <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : null}
        </button>

        {/* Content */}
        <div className="task-content">
          <p className="task-title">{task.title}</p>
          {task.description && <p className="task-description">{task.description}</p>}
          {task.dueDate && (
            <span className={`task-due ${overdue ? 'task-due--overdue' : ''}`}>
              {overdue ? '⚠ Overdue · ' : '📅 '}
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="task-actions">
          <button
            className="icon-btn"
            aria-label="Edit task"
            onClick={() => setEditing(true)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="icon-btn icon-btn--danger"
            aria-label="Delete task"
            onClick={() => setConfirmDelete(true)}
            title="Delete"
          >
            🗑
          </button>
        </div>
      </li>

      {confirmDelete && (
        <ConfirmDialog
          message={`Delete "${task.title}"? This cannot be undone.`}
          onConfirm={() => { setConfirmDelete(false); onDelete(task.id); }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}
