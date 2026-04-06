import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Notificacao } from '@/types';

// ============================================
// PRT02 - CONTEXTO DE NOTIFICAÇÕES
// ============================================

interface NotificacoesContextType {
  notificacoes: Notificacao[];
  notificacoesPrincipais: Notificacao[];
  isLoading: boolean;
  fetchNotificacoes: () => Promise<void>;
  marcarComoLida: (id: string) => void;
}

const NotificacoesContext = createContext<NotificacoesContextType | undefined>(undefined);

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtrar notificações principais (PRT02.01)
  const notificacoesPrincipais = notificacoes.filter(
    (n) => n.notificacaoPrincipal && n.ativa
  );

  const fetchNotificacoes = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Buscar da API Dataverse
      // Filtrar por data de início e término
      const today = new Date();
      
      // Mock de notificações
      const mockNotificacoes: Notificacao[] = [
        {
          id: '1',
          titulo: 'Manutenção Programada',
          descricao: 'O sistema estará em manutenção no dia 15/04 das 22h às 06h.',
          dataInicio: new Date('2026-04-01'),
          dataTermino: new Date('2026-04-30'),
          notificacaoPrincipal: true,
          ativa: true,
        },
        {
          id: '2',
          titulo: 'Novo Auditório Disponível',
          descricao: 'O Auditório B está agora disponível para agendamentos.',
          dataInicio: new Date('2026-04-01'),
          dataTermino: new Date('2026-05-01'),
          notificacaoPrincipal: true,
          ativa: true,
        },
        {
          id: '3',
          titulo: 'Atualização de Política',
          descricao: 'Nova política de uso das salas de reunião.',
          dataInicio: new Date('2026-03-01'),
          dataTermino: new Date('2026-06-01'),
          notificacaoPrincipal: false,
          ativa: true,
        },
      ];

      // Filtrar notificações ativas no período
      const activeNotificacoes = mockNotificacoes.filter(
        (n) => n.dataInicio <= today && n.dataTermino >= today && n.ativa
      );

      setNotificacoes(activeNotificacoes);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const marcarComoLida = (id: string) => {
    // Marcar notificação como lida (armazenar em localStorage ou API)
    const lidasKey = 'notificacoesLidas';
    const lidas = JSON.parse(localStorage.getItem(lidasKey) || '[]');
    if (!lidas.includes(id)) {
      lidas.push(id);
      localStorage.setItem(lidasKey, JSON.stringify(lidas));
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, [fetchNotificacoes]);

  return (
    <NotificacoesContext.Provider
      value={{
        notificacoes,
        notificacoesPrincipais,
        isLoading,
        fetchNotificacoes,
        marcarComoLida,
      }}
    >
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes() {
  const context = useContext(NotificacoesContext);
  if (context === undefined) {
    throw new Error('useNotificacoes deve ser usado dentro de um NotificacoesProvider');
  }
  return context;
}
