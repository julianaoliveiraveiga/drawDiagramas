import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, MapPin, Eye, Edit, X, RotateCcw, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Modal, Select, AlertBanner } from '@/components/ui';
import type { Agendamento } from '@/types';

// ============================================
// CON01.02 - MEUS AGENDAMENTOS
// ============================================

type TabType = 'hoje' | 'proximos' | 'passados';

export function MeusAgendamentosPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('hoje');
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgendamento, setSelectedAgendamento] = useState<Agendamento | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Filtros
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  // Mensagem de sucesso do state
  const successMessage = location.state?.success ? location.state.message : null;

  // Carregar agendamentos
  useEffect(() => {
    const fetchAgendamentos = async () => {
      setIsLoading(true);
      try {
        // TODO: Buscar do Dataverse via API
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
          {
            id: '3',
            titulo: 'Treinamento de Equipe',
            descricao: 'Capacitação sobre novas ferramentas',
            assuntoId: '1',
            portfolioServicosId: '2',
            serviceId: '3',
            instalacaoId: '3',
            solicitanteId: user?.id || '',
            data: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Daqui 2 dias
            horaInicio: '10:00',
            horaFim: '12:00',
            duracao: 120,
            status: 'pendente',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '4',
            titulo: 'Workshop de Inovação',
            descricao: 'Brainstorming de ideias',
            assuntoId: '1',
            portfolioServicosId: '2',
            serviceId: '4',
            instalacaoId: '4',
            solicitanteId: user?.id || '',
            data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Daqui 7 dias
            horaInicio: '14:00',
            horaFim: '17:00',
            duracao: 180,
            status: 'confirmado',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '5',
            titulo: 'Reunião de Alinhamento',
            descricao: 'Alinhamento com stakeholders',
            assuntoId: '1',
            portfolioServicosId: '1',
            serviceId: '1',
            instalacaoId: '1',
            solicitanteId: user?.id || '',
            data: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
            horaInicio: '15:00',
            horaFim: '16:00',
            duracao: 60,
            status: 'concluido',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '6',
            titulo: 'Entrevista de Candidato',
            descricao: 'Processo seletivo',
            assuntoId: '1',
            portfolioServicosId: '1',
            serviceId: '1',
            instalacaoId: '2',
            solicitanteId: user?.id || '',
            data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
            horaInicio: '10:00',
            horaFim: '11:00',
            duracao: 60,
            status: 'concluido',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        setAgendamentos(mockAgendamentos);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgendamentos();
  }, [user]);

  // Filtrar agendamentos por tab
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let filtered: Agendamento[] = [];

    switch (activeTab) {
      case 'hoje':
        filtered = agendamentos.filter(a => {
          const agendDate = new Date(a.data);
          agendDate.setHours(0, 0, 0, 0);
          return agendDate.getTime() === today.getTime();
        });
        break;
      case 'proximos':
        filtered = agendamentos.filter(a => {
          const agendDate = new Date(a.data);
          agendDate.setHours(0, 0, 0, 0);
          return agendDate.getTime() >= tomorrow.getTime();
        });
        break;
      case 'passados':
        filtered = agendamentos.filter(a => {
          const agendDate = new Date(a.data);
          agendDate.setHours(0, 0, 0, 0);
          return agendDate.getTime() < today.getTime();
        });
        break;
    }

    // Aplicar filtro de status
    if (filtroStatus) {
      filtered = filtered.filter(a => a.status === filtroStatus);
    }

    // Ordenar por data/hora
    filtered.sort((a, b) => {
      const dateA = new Date(a.data);
      const dateB = new Date(b.data);
      if (dateA.getTime() !== dateB.getTime()) {
        return activeTab === 'passados' 
          ? dateB.getTime() - dateA.getTime() 
          : dateA.getTime() - dateB.getTime();
      }
      return a.horaInicio.localeCompare(b.horaInicio);
    });

    setFilteredAgendamentos(filtered);
  }, [agendamentos, activeTab, filtroStatus]);

  // Cancelar agendamento
  const handleCancelAgendamento = async () => {
    if (!selectedAgendamento) return;
    
    // TODO: Chamar API para cancelar
    setAgendamentos(prev => 
      prev.map(a => 
        a.id === selectedAgendamento.id 
          ? { ...a, status: 'cancelado' as const }
          : a
      )
    );
    setShowCancelModal(false);
    setSelectedAgendamento(null);
  };

  // Reservar novamente (CON01.02)
  const handleReservarNovamente = (agendamento: Agendamento) => {
    navigate('/agendar', {
      state: {
        preenchimento: {
          assuntoId: agendamento.assuntoId,
          portfolioServicosId: agendamento.portfolioServicosId,
          serviceId: agendamento.serviceId,
          titulo: agendamento.titulo,
        }
      }
    });
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

  const tabs = [
    { id: 'hoje' as const, label: 'Hoje', count: agendamentos.filter(a => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const agendDate = new Date(a.data);
      agendDate.setHours(0, 0, 0, 0);
      return agendDate.getTime() === today.getTime();
    }).length },
    { id: 'proximos' as const, label: 'Próximos', count: agendamentos.filter(a => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const agendDate = new Date(a.data);
      agendDate.setHours(0, 0, 0, 0);
      return agendDate.getTime() >= tomorrow.getTime();
    }).length },
    { id: 'passados' as const, label: 'Passados', count: agendamentos.filter(a => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const agendDate = new Date(a.data);
      agendDate.setHours(0, 0, 0, 0);
      return agendDate.getTime() < today.getTime();
    }).length },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-seplag-dark">
          Meus Agendamentos
        </h1>
        <p className="text-seplag-muted mt-2">
          Visualize e gerencie seus agendamentos de salas e serviços.
        </p>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="mb-6">
          <AlertBanner
            type="success"
            message={successMessage}
            dismissible
            onDismiss={() => navigate(location.pathname, { replace: true, state: {} })}
          />
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-seplag-primary text-seplag-primary'
                    : 'border-transparent text-seplag-muted hover:text-seplag-dark hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                <span className={`
                  ml-2 py-0.5 px-2 rounded-full text-xs
                  ${activeTab === tab.id
                    ? 'bg-seplag-primary text-white'
                    : 'bg-gray-100 text-seplag-muted'
                  }
                `}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-seplag-muted" />
          <Select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            options={[
              { value: '', label: 'Todos os status' },
              { value: 'pendente', label: 'Pendente' },
              { value: 'confirmado', label: 'Confirmado' },
              { value: 'cancelado', label: 'Cancelado' },
              { value: 'concluido', label: 'Concluído' },
              { value: 'nao_compareceu', label: 'Não Compareceu' },
            ]}
          />
          {filtroStatus && (
            <Button variant="ghost" size="sm" onClick={() => setFiltroStatus('')}>
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </Card>

      {/* Lista de Agendamentos */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-lg" />
          ))}
        </div>
      ) : filteredAgendamentos.length > 0 ? (
        <div className="space-y-4">
          {filteredAgendamentos.map((agendamento) => (
            <Card key={agendamento.id} className="hover:shadow-card-hover transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-semibold text-lg text-seplag-dark">
                      {agendamento.titulo}
                    </h3>
                    {getStatusBadge(agendamento.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-seplag-muted">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {agendamento.horaInicio} - {agendamento.horaFim}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      Sala {agendamento.instalacaoId}
                    </span>
                  </div>

                  {agendamento.descricao && (
                    <p className="text-sm text-seplag-muted mt-2 line-clamp-2">
                      {agendamento.descricao}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedAgendamento(agendamento);
                      setShowDetailsModal(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>

                  {activeTab !== 'passados' && agendamento.status !== 'cancelado' && (
                    <>
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
                        className="text-seplag-danger"
                        onClick={() => {
                          setSelectedAgendamento(agendamento);
                          setShowCancelModal(true);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </>
                  )}

                  {activeTab === 'passados' && agendamento.status === 'concluido' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReservarNovamente(agendamento)}
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reservar Novamente
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-12">
          <Calendar className="h-16 w-16 text-seplag-muted mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg text-seplag-dark mb-2">
            Nenhum agendamento encontrado
          </h3>
          <p className="text-seplag-muted mb-6">
            {activeTab === 'hoje' && 'Você não tem agendamentos para hoje.'}
            {activeTab === 'proximos' && 'Você não tem agendamentos futuros.'}
            {activeTab === 'passados' && 'Você não tem agendamentos passados.'}
          </p>
          {activeTab !== 'passados' && (
            <Button onClick={() => navigate('/agendar')}>
              Fazer um Agendamento
            </Button>
          )}
        </Card>
      )}

      {/* Modal de Detalhes */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedAgendamento(null);
        }}
        title="Detalhes do Agendamento"
        size="lg"
      >
        {selectedAgendamento && (
          <div className="space-y-4">
            <div>
              <label className="label">Título</label>
              <p className="text-seplag-dark font-medium">{selectedAgendamento.titulo}</p>
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
              <div>
                <label className="label">Duração</label>
                <p className="text-seplag-dark">{selectedAgendamento.duracao} minutos</p>
              </div>
              <div>
                <label className="label">Status</label>
                {getStatusBadge(selectedAgendamento.status)}
              </div>
            </div>

            <div>
              <label className="label">Descrição</label>
              <p className="text-seplag-dark">
                {selectedAgendamento.descricao || 'Sem descrição'}
              </p>
            </div>

            <div className="pt-4 border-t">
              <label className="label">Criado em</label>
              <p className="text-seplag-muted text-sm">
                {new Date(selectedAgendamento.createdAt).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Cancelamento */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedAgendamento(null);
        }}
        title="Cancelar Agendamento"
        footer={
          <>
            <Button 
              variant="ghost" 
              onClick={() => {
                setShowCancelModal(false);
                setSelectedAgendamento(null);
              }}
            >
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
