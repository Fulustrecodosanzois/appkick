import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Auth from './Auth';
import Dashboard from './Dashboard';
import StreamSettings from './StreamSettings';
import ChatManager from './ChatManager';
import ViewerStats from './ViewerStats';
import Subscriptions from './Subscriptions';
import Clips from './Clips';
import Navigation from './Navigation';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, loading } = useAuth();

  if (loading) {
    return <div className="container">Carregando...</div>;
  }

  return token ? <>{children}</> : <Navigate to="/auth" />;
};

const App: React.FC = () => {
  const { token } = useAuth();

  return (
    <Router>
      <div className="container">
        {token && <Navigation />}
        <Routes>
          <Route path="/auth" element={token ? <Navigate to="/" /> : <Auth />} />
          <Route 
            path="/" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/stream" 
            element={
              <PrivateRoute>
                <StreamSettings />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <PrivateRoute>
                <ChatManager />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/stats" 
            element={
              <PrivateRoute>
                <ViewerStats />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/subscriptions" 
            element={
              <PrivateRoute>
                <Subscriptions />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/clips" 
            element={
              <PrivateRoute>
                <Clips />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;