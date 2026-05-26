// EditTaskPage.jsx — standalone page for editing a single task
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getTask } from '../api/task.api'
import { useTasks } from '../context/TaskContext'
import Spinner from '../components/Spinner'

const blankForm = {
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  dueDate: '',
}

function EditTaskPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { updateTask, submitting } = useTasks()
  const [form, setForm] = useState(blankForm)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTask(id)
      .then(({ data }) => {
        const t = data.data
        setForm({
          title: t.title || '',
          description: t.description || '',
          status: t.status || 'pending',
          priority: t.priority || 'medium',
          dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '',
        })
      })
      .catch(() => {
        toast.error('Task not found')
        navigate('/')
      })
      .finally(() => setLoading(false))
  }, [id, navigate])

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateTask(id, { ...form, dueDate: form.dueDate || null })
      toast.success('Task updated!')
      navigate('/')
    } catch {
      // error toast handled in TaskContext
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link to="/" className="text-sm font-medium text-primary-600 hover:underline">
            ← Tasks
          </Link>
          <h1 className="text-base font-bold text-gray-800">Edit Task</h1>
          <span />
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
              <input
                name="title"
                required
                maxLength={200}
                value={form.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={4}
                maxLength={1000}
                value={form.description}
                onChange={handleChange}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Link
                to="/"
                className="flex flex-1 items-center justify-center rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? <Spinner size="sm" /> : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default EditTaskPage
