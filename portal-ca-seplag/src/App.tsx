import React from 'react';
import { AuthProvider, NotificacoesProvider } from '@/contexts';
import { AppRouter } from './routes';
import '@/styles/globals.css';

function App() {
  return (
    <AuthProvider>
      <NotificacoesProvider>
        <AppRouter />
      </NotificacoesProvider>
    </AuthProvider>
  );
}

export default App;
