import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { AlertBanner } from '@/components/ui/AlertBanner';

// ============================================
// PRT01.02 / PRT01.04 - LAYOUT COM MIDDLEWARE DE PERFIL
// ============================================

export function Layout() {
  const { isAuthenticated, isProfileComplete, profileCheckedToday, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // PRT01.02 - Redirecionar para perfil se incompleto no primeiro acesso do dia
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isProfileComplete && !profileCheckedToday) {
      // Não redirecionar se já está na página de perfil
      if (location.pathname !== '/perfil') {
        navigate('/perfil', { 
          state: { 
            showAlert: true,
            message: 'Complete seu perfil para utilizar os serviços do portal.'
          }
        });
      }
    }
  }, [isAuthenticated, isProfileComplete, profileCheckedToday, isLoading, location.pathname, navigate]);

  // PRT01.04 - Bloquear acesso a páginas de cadastro com perfil incompleto
  useEffect(() => {
    const protectedRoutes = ['/agendar', '/ocorrencia'];
    const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

    if (!isLoading && isAuthenticated && !isProfileComplete && isProtectedRoute) {
      navigate('/perfil', {
        state: {
          showAlert: true,
          message: 'Você precisa completar seu perfil antes de realizar esta ação.'
        }
      });
    }
  }, [isAuthenticated, isProfileComplete, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-seplag-light flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4 h-8 w-8"></div>
          <p className="text-seplag-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-seplag-light">
      <Header />
      
      {/* Banner de alerta para perfil incompleto */}
      {isAuthenticated && !isProfileComplete && location.pathname !== '/perfil' && (
        <AlertBanner
          type="warning"
          message="Complete seu perfil para utilizar todos os serviços do portal."
          action={{
            label: 'Completar Perfil',
            onClick: () => navigate('/perfil')
          }}
        />
      )}

      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
}
