import { useState, useEffect, useRef } from 'react';
import { toInputDate } from '../utils/dates';

export default function TaskForm({ onSubmit, onCancel, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState(toInputDate(initialData?.dueDate));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const titleRef = useRef(null);

  const isEdit = !!initialData;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      titleRef.current?.focus();
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        dueDate: dueDate || null,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label htmlFor="tf-title" className="form-label">
          Title <span className="required">*</span>
        </label>
        <input
          id="tf-title"
          ref={titleRef}
          type="text"
          className="form-input"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          aria-required="true"
          aria-describedby={error ? 'tf-error' : undefined}
        />
      </div>

      <div className="form-field">
        <label htmlFor="tf-desc" className="form-label">
          Description
        </label>
        <textarea
          id="tf-desc"
          className="form-input form-textarea"
          placeholder="Add more details (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="form-field">
        <label htmlFor="tf-due" className="form-label">
          Due Date
        </label>
        <input
          id="tf-due"
          type="date"
          className="form-input"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {error && (
        <p id="tf-error" className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (isEdit ? 'Saving…' : 'Adding…') : isEdit ? 'Save changes' : 'Add task'}
        </button>
      </div>
    </form>
  );
}
