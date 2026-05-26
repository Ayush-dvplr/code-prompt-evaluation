// Spinner.jsx — themed loading indicator
function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' };
  return (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-primary-100 border-t-primary-600`}
      role="status"
      aria-label="Loading"
    />
  );
}

export default Spinner;
