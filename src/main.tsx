import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import AppRoutes from './assets/routes/AppRoutes';
import { AuthProvider } from './context/AuthContext';

import './styles/global.css';

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

    </AuthProvider>
  </React.StrictMode>
);