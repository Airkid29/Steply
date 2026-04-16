import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import OpportunityDetail from './pages/OpportunityDetail';
import Applications from './pages/Applications';
import Saved from './pages/Saved';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';
import ResumeAnalysis from './pages/ResumeAnalysis';
import Notifications from './pages/Notifications';
import InterviewPrep from './pages/InterviewPrep';
import RecruiterPost from './pages/RecruiterPost';
import Admin from './pages/Admin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, authError, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/post-opportunity" element={<RecruiterPost />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} />
      
      {/* Auth required */}
      <Route path="/onboarding" element={isAuthenticated ? <Onboarding /> : <Navigate to="/" replace />} />
      
      {/* App layout routes */}
      <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/" replace />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/opportunity/:id" element={<OpportunityDetail />} />
        <Route path="/applications" element={<Applications />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/resume" element={<ResumeAnalysis />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/interview-prep" element={<InterviewPrep />} />
        <Route path="/admin" element={<Admin />} />
      </Route>

      <Route path="/post-opportunity" element={<RecruiterPost />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App