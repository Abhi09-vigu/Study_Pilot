import { Navigate } from 'react-router-dom';
import { requireAuth } from '../lib/api';

export default function ProtectedRoute({ children }) {
  if (!requireAuth()) return <Navigate to="/login" replace />;
  return children;
}
