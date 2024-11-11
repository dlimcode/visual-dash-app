// Create a reusable error component
const ErrorMessage = ({ error }) => (
  <div className="text-center p-4 bg-red-50 rounded-lg">
    <p className="text-red-600">{error}</p>
  </div>
);

export default ErrorMessage; 