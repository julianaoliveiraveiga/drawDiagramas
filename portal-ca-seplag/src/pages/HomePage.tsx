import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, AlertCircle, ChevronLeft, ChevronRight, Eye, Edit, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotificacoes } from '@/contexts/NotificacoesContext';
import { ActionCard, Card, Button, Modal } from '@/components/ui';
import type { Agendamento } from '@/types';

// ============================================
// PRT03.03 - PÁGINA INICIAL DO PORTAL
// ============================================

export function HomePage() {
  const navigate = useNavigate();
  const { user, isProfileComplete } = useAuth();
  const { notificacoesPrincipais } = useNotificacoes();
  const [agendamentosHoje, setAgendamentosHoje] = useState<Agendamento[]>([]);
  const [currentNotifIndex, setCurrentNotifIndex] = useState(0);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Carregar agendamentos de hoje
  useEffect(() => {
    const fetchAgendamentosHoje = async () => {
      // TODO: Buscar da API
      // Mock de agendamentos para hoje
      const mockAgendamentos: Agendamento[] = [
        {
          id: '1',
          titulo: 'Reunião de Planejamento',
          descricao: 'Discussão sobre o projeto X',
          assuntoId: '1',
          portfolioServicosId: '1',
          serviceId: '1',
          instalacaoId: '1',
          solicitanteId: user?.id || '',
          data: new Date(),
          horaInicio: '09:00',
          horaFim: '10:00',
          duracao: 60,
          status: 'confirmado',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          titulo: 'Apresentação de Resultados',
          descricao: 'Apresentação trimestral',
          assuntoId: '1',
          portfolioServicosId: '1',
          serviceId: '2',
          instalacaoId: '2',
          solicitanteId: user?.id || '',
          data: new Date(),
          horaInicio: '14:00',
          horaFim: '16:00',
          duracao: 120,
          status: 'confirmado',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setAgendamentosHoje(mockAgendamentos);
    };

    if (user) {
      fetchAgendamentosHoje();
    }
  }, [user]);

  // Navegação do banner de notificações
  const nextNotif = () => {
    setCurrentNotifIndex((prev) => 
      prev === notificacoesPrincipais.length - 1 ? 0 : prev + 1
    );
  };

  const prevNotif = () => {
    setCurrentNotifIndex((prev) => 
      prev === 0 ? notificacoesPrincipais.length - 1 : prev - 1
    );
  };

  const handleCancelAgendamento = async () => {
    if (!selectedAgendamento) return;
    
    // TODO: Chamar API para cancelar
    setAgendamentosHoje((prev) => 
      prev.filter((a) => a.id !== selectedAgendamento.id)
    );
    setShowCancelModal(false);
    setSelectedAgendamento(null);
  };

  const getStatusBadge = (status: Agendamento['status']) => {
    const styles = {
      pendente: 'badge-warning',
      confirmado: 'badge-success',
      cancelado: 'badge-danger',
      concluido: 'badge-info',
      nao_compareceu: 'badge-muted',
    };
    const labels = {
      pendente: 'Pendente',
      confirmado: 'Confirmado',
      cancelado: 'Cancelado',
      concluido: 'Concluído',
      nao_compareceu: 'Não Compareceu',
    };
    return <span className={`badge ${styles[status]}`}>{labels[status]}</span>;
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Bem-vindo ao Portal CA
          </h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Sistema de Agendamentos e Ocorrências da SEPLAG
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Cards de Ações Principais */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 -mt-16 relative z-10">
            <ActionCard
              title="Realizar Agendamento"
              description="Reserve salas de reunião, auditórios, coworking e mais"
              icon={Calendar}
              onClick={() => navigate('/agendar')}
              color="primary"
            />
            <ActionCard
              title="Abrir Ocorrência"
              description="Solicite serviços de manutenção, suporte e infraestrutura"
              icon={AlertCircle}
              onClick={() => navigate('/ocorrencia')}
              color="accent"
            />
          </div>
        </section>

        {/* Banner de Notificações Principais */}
        {notificacoesPrincipais.length > 0 && (
          <section>
            <div className="notification-banner relative">
              <div className="flex items-center justify-between">
                <button
                  onClick={prevNotif}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  disabled={notificacoesPrincipais.length <= 1}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex-1 text-center px-4">
                  <h3 className="font-heading font-semibold text-lg">
                    {notificacoesPrincipais[currentNotifIndex]?.titulo}
                  </h3>
                  <p className="text-white/90 mt-1">
                    {notificacoesPrincipais[currentNotifIndex]?.descricao}
                  </p>
                </div>

                <button
                  onClick={nextNotif}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  disabled={notificacoesPrincipais.length <= 1}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              {/* Indicadores */}
              {notificacoesPrincipais.length > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  {notificacoesPrincipais.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentNotifIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentNotifIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Agendamentos de Hoje */}
        <section>
          <h2 className="font-heading font-bold text-2xl text-seplag-dark mb-4">
            Agendamentos de Hoje
          </h2>

          {agendamentosHoje.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agendamentosHoje.map((agendamento) => (
                <Card key={agendamento.id} className="relative">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-seplag-dark">
                        {agendamento.titulo}
                      </h3>
                      <p className="text-sm text-seplag-muted">
                        {agendamento.horaInicio} - {agendamento.horaFim}
                      </p>
                    </div>
                    {getStatusBadge(agendamento.status)}
                  </div>

                  {agendamento.descricao && (
                    <p className="text-sm text-seplag-muted mb-4 line-clamp-2">
                      {agendamento.descricao}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAgendamento(agendamento)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/agendar/editar/${agendamento.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedAgendamento(agendamento);
                        setShowCancelModal(true);
                      }}
                      className="text-seplag-danger"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-8">
              <Calendar className="h-12 w-12 text-seplag-muted mx-auto mb-4" />
              <p className="text-seplag-muted">
                Você não tem agendamentos para hoje.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/agendar')}
              >
                Fazer um Agendamento
              </Button>
            </Card>
          )}
        </section>

        {/* Alerta de Perfil Incompleto */}
        {!isProfileComplete && (
          <section>
            <Card className="bg-yellow-50 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800">
                    Complete seu Perfil
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    Para utilizar todos os serviços do portal, você precisa completar seu perfil.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => navigate('/perfil')}
                >
                  Completar Perfil
                </Button>
              </div>
            </Card>
          </section>
        )}
      </div>

      {/* Modal de Detalhes do Agendamento */}
      <Modal
        isOpen={!!selectedAgendamento && !showCancelModal}
        onClose={() => setSelectedAgendamento(null)}
        title="Detalhes do Agendamento"
      >
        {selectedAgendamento && (
          <div className="space-y-4">
            <div>
              <label className="label">Título</label>
              <p className="text-seplag-dark">{selectedAgendamento.titulo}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Data</label>
                <p className="text-seplag-dark">
                  {new Date(selectedAgendamento.data).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="label">Horário</label>
                <p className="text-seplag-dark">
                  {selectedAgendamento.horaInicio} - {selectedAgendamento.horaFim}
                </p>
              </div>
            </div>
            <div>
              <label className="label">Descrição</label>
              <p className="text-seplag-dark">
                {selectedAgendamento.descricao || 'Sem descrição'}
              </p>
            </div>
            <div>
              <label className="label">Status</label>
              {getStatusBadge(selectedAgendamento.status)}
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmação de Cancelamento */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancelar Agendamento"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
              Não, manter
            </Button>
            <Button variant="danger" onClick={handleCancelAgendamento}>
              Sim, cancelar
            </Button>
          </>
        }
      >
        <p className="text-seplag-dark">
          Tem certeza que deseja cancelar o agendamento{' '}
          <strong>"{selectedAgendamento?.titulo}"</strong>?
        </p>
        <p className="text-sm text-seplag-muted mt-2">
          Esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
