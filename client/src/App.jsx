import { useState, useCallback } from 'react';
import { useTasks } from './hooks/useTasks';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export default function App() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [toast, setToast] = useState(null);

  const {
    tasks,
    summary,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
  } = useTasks(filter, search);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleCreate = async (data) => {
    try {
      await createTask(data);
      setShowAddForm(false);
      showToast('Task added!');
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      showToast('Task deleted.', 'info');
    } catch {
      showToast('Failed to delete task.', 'error');
    }
  };

  const handleToggle = async (task) => {
    try {
      await toggleComplete(task);
    } catch {
      showToast('Failed to update task.', 'error');
    }
  };

  const handleUpdate = async (id, data) => {
    const updated = await updateTask(id, data);
    showToast('Task saved.');
    return updated;
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-icon">✦</span>
            <h1 className="brand-name">TaskFlow</h1>
          </div>
          <div className="summary-pills">
            <span className="pill pill--active">{summary.active} active</span>
            <span className="pill pill--done">{summary.completed} done</span>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {showAddForm ? (
            <section className="add-section" aria-label="New task">
              <h2 className="section-title">New task</h2>
              <TaskForm onSubmit={handleCreate} onCancel={() => setShowAddForm(false)} />
            </section>
          ) : (
            <button
              className="add-task-btn"
              onClick={() => setShowAddForm(true)}
              aria-label="Add new task"
            >
              <span className="add-icon">+</span>
              Add a task
            </button>
          )}

          <div className="toolbar">
            <div className="filters" role="tablist" aria-label="Filter tasks">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  role="tab"
                  aria-selected={filter === f.value}
                  className={`filter-btn ${filter === f.value ? 'filter-btn--active' : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                  {f.value === 'active' && summary.active > 0 && (
                    <span className="filter-count">{summary.active}</span>
                  )}
                  {f.value === 'completed' && summary.completed > 0 && (
                    <span className="filter-count">{summary.completed}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="search-wrap">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="search"
                className="search-input"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search tasks"
              />
              {search && (
                <button
                  className="search-clear"
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading-state" aria-live="polite" aria-label="Loading tasks">
              <div className="spinner" />
              <p>Loading tasks…</p>
            </div>
          ) : error ? (
            <div className="error-state" role="alert">
              <span>⚠️</span>
              <p>Couldn't load tasks: {error}</p>
              <button className="btn btn-ghost" onClick={() => window.location.reload()}>
                Retry
              </button>
            </div>
          ) : (
            <TaskList
              tasks={tasks}
              onToggle={handleToggle}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onReorder={reorderTasks}
              filter={filter}
              search={search}
            />
          )}
        </div>
      </main>

      {toast && (
        <div
          className={`toast toast--${toast.type}`}
          role="status"
          aria-live="polite"
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
