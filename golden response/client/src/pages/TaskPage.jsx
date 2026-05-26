import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import TaskCard from '../components/TaskCard';
import TaskSkeleton from '../components/TaskSkeleton';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';

const STATUSES   = ['', 'pending', 'in-progress', 'completed'];
const PRIORITIES = ['', 'low', 'medium', 'high'];

const blankForm = {
  title: '', description: '', status: 'pending', priority: 'medium', dueDate: '',
};

function TaskPage() {
  const { user, logout } = useAuth();
  const {
    tasks, pagination, filters, setFilters,
    loading, submitting, fetchTasks,
    createTask, updateTask, deleteTask,
  } = useTasks();

  const [searchInput, setSearchInput] = useState('');
  const [showCreate, setShowCreate]   = useState(false);
  const [form, setForm]               = useState(blankForm);

  // Debounce search — only fires filter update after 300ms of no typing
  const debouncedSearch = useDebounce(searchInput, 300);
  useEffect(() => {
    setFilters((prev) => ({ ...prev, search: debouncedSearch }));
  }, [debouncedSearch, setFilters]);

  const handleFilter = (key, val) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createTask({ ...form, dueDate: form.dueDate || null });
      setShowCreate(false);
      setForm(blankForm);
    } catch {
      // error toast handled in useTasks — button re-enables via finally
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky navbar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <h1 className="text-lg font-bold text-primary-600">📝 Todo App</h1>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              title="Go to profile"
              aria-label="Profile"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-600 hover:bg-primary-200"
            >
              {user?.displayName?.[0]?.toUpperCase() || 'U'}
            </Link>
            <button
              onClick={logout}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* ── Search + Filter bar ─────────────────────────────────── */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <select
              value={filters.status}
              onChange={(e) => handleFilter('status', e.target.value)}
              aria-label="Filter by status"
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-600 focus:outline-none"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s || 'All status'}</option>
              ))}
            </select>
            <select
              value={filters.priority}
              onChange={(e) => handleFilter('priority', e.target.value)}
              aria-label="Filter by priority"
              className="rounded-lg border border-gray-300 px-2 py-2 text-sm text-gray-600 focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p || 'All priority'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {loading ? '' : `${pagination.total} task${pagination.total !== 1 ? 's' : ''}`}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 active:scale-95 transition-transform"
          >
            + New task
          </button>
        </div>

        {/* ── Task list ───────────────────────────────────────────── */}
        <div className="space-y-3">
          {loading ? (
            // Skeleton loaders while fetching
            Array.from({ length: 4 }).map((_, i) => <TaskSkeleton key={i} />)
          ) : tasks.length === 0 ? (
            // Empty state — "No tasks yet"
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
              <p className="mb-2 text-4xl">📭</p>
              <p className="font-medium text-gray-600">No tasks yet</p>
              <p className="mt-1 text-sm text-gray-400">Click "+ New task" to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdate={updateTask}
                onDelete={deleteTask}
                disabled={submitting}
              />
            ))
          )}
        </div>

        {/* ── Pagination ──────────────────────────────────────────── */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchTasks(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-500">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => fetchTasks(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="rounded-lg border px-4 py-2 text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {/* ── Create Task Modal ────────────────────────────────────── */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New Task">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input
              name="title"
              required
              maxLength={200}
              value={form.title}
              onChange={handleFormChange}
              placeholder="What needs to be done?"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              rows={3}
              maxLength={7000}
              value={form.description}
              onChange={handleFormChange}
              placeholder="Optional details..."
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Due date</label>
            <input
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleFormChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting ? <Spinner size="sm" /> : 'Create task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TaskPage;
