import { useState } from 'react';
import { formatDate, isPast } from '../utils/formatDate';

const priorityColors = {
  low:    'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high:   'bg-red-100 text-red-700',
};

const statusColors = {
  'pending':     'bg-gray-100 text-gray-600',
  'in-progress': 'bg-blue-100 text-blue-700',
  'completed':   'bg-green-100 text-green-700',
};

function TaskCard({ task, onUpdate, onDelete, disabled }) {
  const [expanded, setExpanded] = useState(false);

  const toggleComplete = () => {
    onUpdate(task._id, {
      status: task.status === 'completed' ? 'pending' : 'completed',
    });
  };

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
      task.status === 'completed' ? 'opacity-60' : ''
    }`}>
      {/* Title + action buttons */}
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-1 text-left"
          onClick={() => setExpanded((p) => !p)}
          aria-expanded={expanded}
        >
          <p className={`font-medium text-gray-800 ${
            task.status === 'completed' ? 'line-through text-gray-400' : ''
          }`}>
            {task.title}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={toggleComplete}
            disabled={disabled}
            title={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
            className="rounded px-2 py-0.5 text-sm text-green-600 hover:bg-green-50 disabled:cursor-not-allowed"
          >
            {task.status === 'completed' ? '↩' : '✓'}
          </button>
          <button
            onClick={() => onDelete(task._id)}
            disabled={disabled}
            title="Delete task"
            className="rounded px-2 py-0.5 text-sm text-red-400 hover:bg-red-50 disabled:cursor-not-allowed"
            aria-label="Delete task"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Status / priority / due date badges */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[task.status]}`}>
          {task.status}
        </span>
        {task.dueDate && (
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isPast(task.dueDate) && task.status !== 'completed'
              ? 'bg-red-100 text-red-600'
              : 'bg-gray-100 text-gray-500'
          }`}>
            📅 {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Expandable description */}
      {expanded && task.description && (
        <p className="mt-3 text-sm text-gray-500">{task.description}</p>
      )}
    </div>
  );
}

export default TaskCard;
