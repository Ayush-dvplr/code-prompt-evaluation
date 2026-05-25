import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import * as taskApi from '../api/task.api';
import { flushOfflineQueue } from '../utils/offlineQueue';

const PAGE_SIZE = 20;
const CACHE_KEY = 'tasks_page1_cache';

/**
 * Manages task list: fetching, caching, pagination, filters, and CRUD.
 * Implements:
 *   - Prefetch cache: serves cached page-1 data instantly, then updates in background
 *   - Double-submit guard via `submitting` flag
 *   - Offline queue flush before every fetch
 */
export function useTasks() {
  // Serve cached tasks instantly (prefetch) while the real fetch runs in background
  const [tasks, setTasks] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });

  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false); // double-submit protection

  // Keep a stable ref to filters so fetchTasks closure is always fresh
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; }, [filters]);

  const fetchTasks = useCallback(async (page = 1) => {
    const f = filtersRef.current;
    setLoading(true);
    try {
      await flushOfflineQueue(); // push any pending offline ops first

      const params = { page, limit: PAGE_SIZE };
      if (f.status)   params.status   = f.status;
      if (f.priority) params.priority = f.priority;
      if (f.search)   params.search   = f.search;

      const { data } = await taskApi.getTasks(params);
      setTasks(data.tasks);
      setPagination(data.pagination);

      // Cache page 1 for instant load next visit
      if (page === 1) localStorage.setItem(CACHE_KEY, JSON.stringify(data.tasks));
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads filters via ref

  // Refetch whenever filters change
  useEffect(() => {
    fetchTasks(1);
  }, [filters.status, filters.priority, filters.search, fetchTasks]);

  const createTask = useCallback(async (taskData) => {
    if (submitting) return; // double-submit guard
    setSubmitting(true);
    try {
      const { data } = await taskApi.createTask(taskData);
      if (data.warning) toast(data.warning, { icon: '⚠️' });
      else toast.success('Task created!');
      await fetchTasks(1); // refresh list
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
      throw err;
    } finally {
      setSubmitting(false); // re-enable button on success or error
    }
  }, [submitting, fetchTasks]);

  const updateTask = useCallback(async (id, updates) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const { data } = await taskApi.updateTask(id, updates);
      // Optimistic UI — update locally without full refetch
      setTasks((prev) => prev.map((t) => (t._id === id ? data : t)));
      toast.success('Task updated!');
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  const deleteTask = useCallback(async (id) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      setPagination((prev) => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  }, [submitting]);

  return { tasks, pagination, filters, setFilters, loading, submitting, fetchTasks, createTask, updateTask, deleteTask };
}
