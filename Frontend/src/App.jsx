import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Donation from './pages/Donation';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import History from './pages/History';

function PrivateRoute({ children, role }) {
  const { currentUser } = useApp();
  if (!currentUser) return <Navigate to="/signin" replace />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/donate'} replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { currentUser } = useApp();
  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/dashboard' : '/donate'} replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/signin" element={<PublicRoute><SignIn /></PublicRoute>} />

      {/* Protected routes with sidebar layout */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        {/* Donor routes */}
        <Route path="/donate" element={<PrivateRoute role="donor"><Donation /></PrivateRoute>} />

        {/* Admin routes */}
        <Route path="/dashboard" element={<PrivateRoute role="admin"><Dashboard /></PrivateRoute>} />
        <Route path="/expenses" element={<PrivateRoute role="admin"><Expenses /></PrivateRoute>} />

        {/* Shared routes */}
        <Route path="/history" element={<History />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/signin" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
