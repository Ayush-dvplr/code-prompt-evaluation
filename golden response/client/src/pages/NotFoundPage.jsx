import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="mb-4 text-7xl">🗺️</p>
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="mt-2 text-lg text-gray-500">This page doesn't exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        Go back home
      </Link>
    </div>
  );
}

export default NotFoundPage;
