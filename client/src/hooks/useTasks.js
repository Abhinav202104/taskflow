import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';

export function useTasks(filter, search) {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ active: 0, completed: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTasks({ status: filter, search });
      setTasks(data.tasks);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    const task = await api.createTask(taskData);
    await fetchTasks();
    return task;
  };

  const updateTask = async (id, data) => {
    const updated = await api.updateTask(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    // Refresh summary
    fetchTasks();
    return updated;
  };

  const deleteTask = async (id) => {
    await api.deleteTask(id);
    await fetchTasks();
  };

  const toggleComplete = async (task) => {
    return updateTask(task.id, { completed: !task.completed });
  };

  const reorderTasks = async (newOrder) => {
    setTasks(newOrder);
    const order = newOrder.map((t, i) => ({ id: t.id, position: i }));
    await api.reorderTasks(order);
  };

  return {
    tasks,
    summary,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
  };
}
