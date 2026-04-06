import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bell, 
  Menu as MenuIcon, 
  X, 
  ChevronDown,
  Calendar,
  AlertCircle,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/contexts/NotificacoesContext';

// ============================================
// PRT03.03 - HEADER DO PORTAL
// ============================================

export function Header() {
  const { user, logout, isProfileComplete } = useAuth();
  const { notificacoesPrincipais } = useNotificacoes();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConsultasOpen, setIsConsultasOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificacoesOpen, setIsNotificacoesOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/agendar', label: 'Realizar Agendamento', icon: Calendar },
    { path: '/ocorrencia', label: 'Abrir Ocorrência', icon: AlertCircle },
  ];

  const consultasItems = [
    { path: '/consultas/minhas-ocorrencias', label: 'Minhas Ocorrências' },
    { path: '/consultas/meus-agendamentos', label: 'Meus Agendamentos' },
    { path: '/consultas/tarefas', label: 'Consultar Tarefas' },
    { path: '/consultas/auditorios', label: 'Consultar Auditórios' },
    { path: '/consultas/vagas', label: 'Consultar Vagas' },
    { path: '/consultas/emissao-cin', label: 'Consultar Emissão CIN' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-seplag-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/images/logo-seplag.png" 
                alt="SEPLAG" 
                className="h-10 w-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-white font-heading font-bold text-xl">
                Portal CA
              </span>
            </Link>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link flex items-center space-x-2 ${
                  isActive(item.path) ? 'nav-link-active' : ''
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Dropdown Consultas */}
            <div className="relative">
              <button
                onClick={() => setIsConsultasOpen(!isConsultasOpen)}
                className="nav-link flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>Consultas</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isConsultasOpen ? 'rotate-180' : ''}`} />
              </button>

              {isConsultasOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg py-2 z-50">
                  {consultasItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="dropdown-item"
                      onClick={() => setIsConsultasOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Ícones da direita */}
          <div className="flex items-center space-x-4">
            {/* Botão Home */}
            <Link to="/" className="text-white hover:text-seplag-accent p-2">
              <Home className="h-5 w-5" />
            </Link>

            {/* Notificações */}
            <div className="relative">
              <button
                onClick={() => setIsNotificacoesOpen(!isNotificacoesOpen)}
                className="text-white hover:text-seplag-accent p-2 relative"
              >
                <Bell className="h-5 w-5" />
                {notificacoesPrincipais.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-seplag-danger text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notificacoesPrincipais.length}
                  </span>
                )}
              </button>

              {isNotificacoesOpen && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="font-semibold text-seplag-dark">Notificações</h3>
                  </div>
                  {notificacoesPrincipais.length > 0 ? (
                    notificacoesPrincipais.map((notif) => (
                      <div
                        key={notif.id}
                        className="px-4 py-3 hover:bg-gray-50 border-b border-gray-100"
                      >
                        <p className="font-medium text-sm text-seplag-dark">{notif.titulo}</p>
                        <p className="text-xs text-seplag-muted mt-1">{notif.descricao}</p>
                      </div>
                    ))
                  ) : (
                    <p className="px-4 py-3 text-sm text-seplag-muted">
                      Nenhuma notificação no momento.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Menu do Usuário */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 text-white hover:text-seplag-accent"
              >
                <div className="h-8 w-8 bg-seplag-secondary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
                <span className="hidden lg:block text-sm">
                  {user?.nomeCompleto || user?.emailCorporativo || 'Usuário'}
                </span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  {!isProfileComplete && (
                    <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
                      <p className="text-xs text-yellow-800">
                        ⚠️ Complete seu perfil
                      </p>
                    </div>
                  )}
                  <Link
                    to="/perfil"
                    className="dropdown-item flex items-center space-x-2"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="dropdown-item flex items-center space-x-2 w-full text-left text-seplag-danger"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              )}
            </div>

            {/* Menu Mobile Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-seplag-secondary">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block py-2 px-4 text-white hover:bg-seplag-secondary rounded-lg ${
                  isActive(item.path) ? 'bg-seplag-secondary' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center space-x-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            ))}
            
            <div className="mt-2 pt-2 border-t border-seplag-secondary">
              <p className="px-4 py-2 text-seplag-accent text-sm font-medium">Consultas</p>
              {consultasItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block py-2 px-6 text-white hover:bg-seplag-secondary rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
