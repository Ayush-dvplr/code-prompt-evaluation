// TaskContext.jsx — task list state + useTasks() hook
import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import * as taskApi from '../api/task.api'
import { flushOfflineQueue } from '../utils/offlineQueue'

const TaskContext = createContext(null)

const PAGE_SIZE = 20
const CACHE_KEY = 'tasks_page1_cache'

const initialState = {
  tasks: (() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })(),
  meta: { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 },
  filters: { status: '', priority: '', search: '' },
  loading: true,
  submitting: false,
}

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_SUBMITTING':
      return { ...state, submitting: action.payload }
    case 'SET_TASKS':
      return { ...state, tasks: action.payload.tasks, meta: action.payload.meta, loading: false }
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } }
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === action.payload._id ? action.payload : t)),
      }
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((t) => t._id !== action.payload),
        meta: { ...state.meta, total: Math.max(0, state.meta.total - 1) },
      }
    default:
      return state
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Keep a stable ref to filters so fetchTasks closure is always fresh
  const filtersRef = useRef(state.filters)
  useEffect(() => {
    filtersRef.current = state.filters
  }, [state.filters])

  const fetchTasks = useCallback(async (page = 1) => {
    const f = filtersRef.current
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      await flushOfflineQueue()

      const params = { page, limit: PAGE_SIZE }
      if (f.status) params.status = f.status
      if (f.priority) params.priority = f.priority
      if (f.search) params.search = f.search

      const { data } = await taskApi.getTasks(params)
      dispatch({ type: 'SET_TASKS', payload: { tasks: data.data, meta: data.meta } })

      // Cache page 1 for instant load on next visit
      if (page === 1) localStorage.setItem(CACHE_KEY, JSON.stringify(data.data))
    } catch {
      toast.error('Failed to load tasks')
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Refetch whenever filters change
  useEffect(() => {
    fetchTasks(1)
  }, [state.filters.status, state.filters.priority, state.filters.search, fetchTasks])

  const setFilters = useCallback((updates) => {
    dispatch({ type: 'SET_FILTERS', payload: updates })
  }, [])

  const createTask = useCallback(async (taskData) => {
    if (state.submitting) return
    dispatch({ type: 'SET_SUBMITTING', payload: true })
    try {
      const { data } = await taskApi.createTask(taskData)
      if (data.warning) toast(data.warning, { icon: '⚠️' })
      else toast.success('Task created!')
      await fetchTasks(1)
      return data.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task')
      throw err
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false })
    }
  }, [state.submitting, fetchTasks])

  const updateTask = useCallback(async (id, updates) => {
    if (state.submitting) return
    dispatch({ type: 'SET_SUBMITTING', payload: true })
    try {
      const { data } = await taskApi.updateTask(id, updates)
      dispatch({ type: 'UPDATE_TASK', payload: data.data })
      toast.success('Task updated!')
      return data.data
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task')
      throw err
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false })
    }
  }, [state.submitting])

  const deleteTask = useCallback(async (id) => {
    if (state.submitting) return
    dispatch({ type: 'SET_SUBMITTING', payload: true })
    try {
      await taskApi.deleteTask(id)
      dispatch({ type: 'REMOVE_TASK', payload: id })
      toast.success('Task deleted')
    } catch {
      toast.error('Failed to delete task')
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false })
    }
  }, [state.submitting])

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        meta: state.meta,
        filters: state.filters,
        loading: state.loading,
        submitting: state.submitting,
        setFilters,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTasks must be used inside TaskProvider')
  return ctx
}
