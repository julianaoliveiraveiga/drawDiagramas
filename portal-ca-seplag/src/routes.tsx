import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { 
  HomePage, 
  ProfilePage, 
  AgendamentoPage, 
  OcorrenciaPage,
  MeusAgendamentosPage 
} from '@/pages';
import { useAuth } from '@/contexts/AuthContext';

// ============================================
// ROTAS DO PORTAL CA SEPLAG
// ============================================

// Componente de rota protegida
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-seplag-light flex items-center justify-center">
        <div className="spinner h-8 w-8"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Página de Login temporária
function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = React.useCallback(() => {
    window.location.href = '/';
  }, []);

  const handleLogin = async () => {
    await login();
    navigate();
  };

  return (
    <div className="min-h-screen bg-seplag-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
        <img 
          src="/images/logo-seplag.png" 
          alt="SEPLAG" 
          className="h-16 mx-auto mb-6"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <h1 className="font-heading font-bold text-2xl text-seplag-dark mb-2">
          Portal CA - SEPLAG
        </h1>
        <p className="text-seplag-muted mb-8">
          Sistema de Agendamentos e Ocorrências
        </p>
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="btn-primary w-full"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="spinner h-5 w-5 mr-2"></span>
              Entrando...
            </span>
          ) : (
            'Entrar com Conta Microsoft'
          )}
        </button>
        <p className="text-xs text-seplag-muted mt-4">
          Use seu e-mail corporativo @seplag.mg.gov.br
        </p>
      </div>
    </div>
  );
}

// Placeholder para páginas em construção
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="card text-center py-12">
        <h1 className="font-heading font-bold text-2xl text-seplag-dark mb-4">
          {title}
        </h1>
        <p className="text-seplag-muted">
          Esta página está em desenvolvimento.
        </p>
      </div>
    </div>
  );
}

// Definição das rotas
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'perfil',
        element: <ProfilePage />,
      },
      {
        path: 'agendar',
        element: <AgendamentoPage />,
      },
      {
        path: 'agendar/editar/:id',
        element: <AgendamentoPage />,
      },
      {
        path: 'ocorrencia',
        element: <OcorrenciaPage />,
      },
      // Consultas (CON01)
      {
        path: 'consultas/meus-agendamentos',
        element: <MeusAgendamentosPage />,
      },
      {
        path: 'consultas/minhas-ocorrencias',
        element: <PlaceholderPage title="Minhas Ocorrências" />,
      },
      {
        path: 'consultas/tarefas',
        element: <PlaceholderPage title="Consultar Tarefas" />,
      },
      {
        path: 'consultas/auditorios',
        element: <PlaceholderPage title="Consultar Auditórios" />,
      },
      {
        path: 'consultas/vagas',
        element: <PlaceholderPage title="Consultar Vagas" />,
      },
      {
        path: 'consultas/emissao-cin',
        element: <PlaceholderPage title="Consultar Emissão CIN" />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
