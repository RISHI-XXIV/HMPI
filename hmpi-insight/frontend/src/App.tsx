import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const HMPICalculator = lazy(() => import('./pages/HMPICalculator'));
const MapView = lazy(() => import('./pages/MapView'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CitizenPortal = lazy(() => import('./pages/CitizenPortal'));
const Reports = lazy(() => import('./pages/Reports'));
const Alerts = lazy(() => import('./pages/Alerts'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));

// Loading component
const Loading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress size={60} />
  </Box>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calculator" element={<HMPICalculator />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/citizen" element={<CitizenPortal />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/alerts" element={<Alerts />} />
          </Route>
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}

export default App;
