// TaskSkeleton.jsx — shown while tasks are being fetched (skeleton loader)
function TaskSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-3 h-3 w-1/2 rounded bg-gray-200" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

export default TaskSkeleton;
