import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import './index.css';

// Lazy load pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const HabitList = lazy(() => import('./pages/Habits/HabitList'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Goals = lazy(() => import('./pages/Goals/Goals'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const Profile = lazy(() => import('./pages/Profile/Profile'));


// Professional Loading Component
const PageLoading = () => (
  <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <div className="spinner" style={{ 
      width: '40px', 
      height: '40px', 
      border: '3px solid var(--border)', 
      borderTopColor: 'var(--primary)', 
      borderRadius: '50%', 
      animation: 'spin 1s linear infinite' 
    }} />
    <p style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Preparing your dashboard...</p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <PageLoading />;
  if (!user) return <Navigate to="/login" replace />;
  
  return (
    <>
      <ThunderBackground />
      {children}
    </>
  );
};

const ThunderBackground = () => (
  <div className="thunder-overlay">
    <div className="thunder-flash" />
    <div className="lightning-bolt bolt-1" />
    <div className="lightning-bolt bolt-2" />
    <div className="lightning-bolt bolt-3" />
    <div className="lightning-bolt bolt-4" />
  </div>
);

const AppContent = () => {
    const { user } = useAuth();
    
    return (
        <Router>
          {user && <Navbar />}
          <div className={user ? 'container' : ''}>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />

                {/* Protected Routes */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/habits" element={
                  <ProtectedRoute>
                    <HabitList />
                  </ProtectedRoute>
                } />
                
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                
                <Route path="/goals" element={
                  <ProtectedRoute>
                    <Goals />
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />

              </Routes>
            </Suspense>
          </div>
        </Router>
    );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
