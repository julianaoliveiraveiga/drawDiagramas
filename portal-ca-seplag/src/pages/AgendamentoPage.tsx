import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Filter, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Select, Input, Modal, SalaCard } from '@/components/ui';
import type { 
  Assunto, 
  PortfolioServicos, 
  Service, 
  InstalacaoEquipamentos,
  Local,
  SlotDisponibilidade,
  Agendamento,
  FiltrosAgendamento 
} from '@/types';

// ============================================
// AGD01 - PÁGINA UNIFICADA DE AGENDAMENTO
// ============================================

export function AgendamentoPage() {
  const navigate = useNavigate();
  const { user, isProfileComplete } = useAuth();
  
  // Estados para hierarquia de seleção
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioServicos[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [instalacoes, setInstalacoes] = useState<InstalacaoEquipamentos[]>([]);
  const [locais, setLocais] = useState<Local[]>([]);
  
  // Estados de seleção
  const [selectedAssunto, setSelectedAssunto] = useState<string>('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedLocal, setSelectedLocal] = useState<string>('todos');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedHoraInicio, setSelectedHoraInicio] = useState<string>('');
  
  // Estados de disponibilidade
  const [slots, setSlots] = useState<SlotDisponibilidade[]>([]);
  const [showDisponibilidade, setShowDisponibilidade] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  
  // Estados do formulário de reserva
  const [showReservaModal, setShowReservaModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotDisponibilidade | null>(null);
  const [selectedInstalacao, setSelectedInstalacao] = useState<InstalacaoEquipamentos | null>(null);
  const [reservaForm, setReservaForm] = useState({
    assunto: '',
    duracao: '60',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para junção de salas
  const [showJuncaoAlert, setShowJuncaoAlert] = useState(false);
  const [juncaoInfo, setJuncaoInfo] = useState<{ sala1: string; sala2: string } | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      // TODO: Buscar do Dataverse via API
      // Mock de Assuntos (Grupos de Serviço)
      setAssuntos([
        { id: '1', nome: 'Agendamento de Salas', ativo: true },
        { id: '2', nome: 'Coworking', ativo: true },
        { id: '3', nome: 'Auditórios', ativo: true },
        { id: '4', nome: 'Eventos', ativo: true },
      ]);

      // Mock de Locais
      setLocais([
        { id: '1', nome: 'Cidade Administrativa - Torre Norte', predio: 'Gerais', ativo: true },
        { id: '2', nome: 'Cidade Administrativa - Torre Sul', predio: 'Gerais', ativo: true },
        { id: '3', nome: 'Prédio Minas', predio: 'Minas', ativo: true },
        { id: '4', nome: 'Prédio Central', predio: 'Minas', ativo: true },
      ]);
    };

    loadData();
  }, []);

  // Carregar Portfolios quando Assunto mudar
  useEffect(() => {
    if (!selectedAssunto) {
      setPortfolios([]);
      setSelectedPortfolio('');
      return;
    }

    // TODO: Buscar do Dataverse filtrado por Assunto
    // Filtrar por exibirNoPortal = true
    const mockPortfolios: PortfolioServicos[] = [
      { 
        id: '1', 
        nome: 'Sala de Reunião', 
        assuntoId: '1',
        exibirNoPortal: true,
        tipo: 'agendamento',
        validarDisponibilidade: true,
        ativo: true
      },
      { 
        id: '2', 
        nome: 'Sala de Treinamento', 
        assuntoId: '1',
        exibirNoPortal: true,
        tipo: 'agendamento',
        validarDisponibilidade: true,
        ativo: true
      },
      { 
        id: '3', 
        nome: 'Estação de Trabalho', 
        assuntoId: '2',
        exibirNoPortal: true,
        tipo: 'agendamento',
        validarDisponibilidade: true,
        ativo: true
      },
    ].filter(p => p.assuntoId === selectedAssunto && p.exibirNoPortal);

    setPortfolios(mockPortfolios);
    setSelectedPortfolio('');
    setServices([]);
    setSelectedService('');
  }, [selectedAssunto]);

  // Carregar Services quando Portfolio mudar
  useEffect(() => {
    if (!selectedPortfolio) {
      setServices([]);
      setSelectedService('');
      return;
    }

    // TODO: Buscar do Dataverse filtrado por Portfolio
    // Filtrar por exibirNoPortal = true
    const mockServices: Service[] = [
      { 
        id: '1', 
        nome: 'Sala de 04 lugares', 
        portfolioServicosId: '1',
        exibirNoPortal: true,
        possuiJuncao: false,
        ativo: true
      },
      { 
        id: '2', 
        nome: 'Sala de 08 lugares', 
        portfolioServicosId: '1',
        exibirNoPortal: true,
        possuiJuncao: true,
        ativo: true
      },
      { 
        id: '3', 
        nome: 'Sala de 12 lugares', 
        portfolioServicosId: '1',
        exibirNoPortal: true,
        possuiJuncao: false,
        ativo: true
      },
      { 
        id: '4', 
        nome: 'Sala para 20 pessoas', 
        portfolioServicosId: '2',
        exibirNoPortal: true,
        possuiJuncao: false,
        ativo: true
      },
    ].filter(s => s.portfolioServicosId === selectedPortfolio && s.exibirNoPortal);

    setServices(mockServices);
    setSelectedService('');
  }, [selectedPortfolio]);

  // Verificar se portfolio requer validação de disponibilidade
  const portfolioSelecionado = portfolios.find(p => p.id === selectedPortfolio);
  const requiresDisponibilidade = portfolioSelecionado?.validarDisponibilidade;

  // Verificar se serviço possui junção
  const serviceSelecionado = services.find(s => s.id === selectedService);
  const hasJuncao = serviceSelecionado?.possuiJuncao;

  // Buscar disponibilidade (AGD01.05)
  const buscarDisponibilidade = async () => {
    if (!selectedService || !selectedDate) return;

    setIsLoadingSlots(true);
    try {
      // TODO: Chamar API/Power Automate para buscar disponibilidade
      // Mock de instalações e slots
      const mockInstalacoes: InstalacaoEquipamentos[] = [
        {
          id: '1',
          nome: 'Sala 101',
          capacidade: 4,
          caracteristicas: ['Ar-condicionado', 'TV', 'Videoconferência'],
          foto: '/images/sala-101.jpg',
          ativo: true,
        },
        {
          id: '2',
          nome: 'Sala 102',
          capacidade: 8,
          caracteristicas: ['Ar-condicionado', 'Projetor', 'Quadro Branco'],
          foto: '/images/sala-102.jpg',
          ativo: true,
        },
        {
          id: '3',
          nome: 'Sala 201',
          capacidade: 12,
          caracteristicas: ['Ar-condicionado', 'TV 65"', 'Sistema de Som'],
          ativo: true,
        },
      ];

      setInstalacoes(mockInstalacoes);

      // Mock de slots de disponibilidade
      const horarios = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
      const mockSlots: SlotDisponibilidade[] = [];

      mockInstalacoes.forEach(instalacao => {
        horarios.forEach((hora, index) => {
          const isOcupado = Math.random() > 0.7;
          const isBloqueado = Math.random() > 0.9;
          
          mockSlots.push({
            id: `${instalacao.id}-${hora}`,
            instalacaoId: instalacao.id,
            data: new Date(selectedDate),
            horaInicio: hora,
            horaFim: horarios[index + 1] || '18:00',
            status: isBloqueado ? 'bloqueado' : isOcupado ? 'ocupado' : 'disponivel',
          });
        });
      });

      setSlots(mockSlots);
      setShowDisponibilidade(true);
    } catch (error) {
      console.error('Erro ao buscar disponibilidade:', error);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Selecionar slot (AGD01.05)
  const handleSelectSlot = (slot: SlotDisponibilidade, instalacao: InstalacaoEquipamentos) => {
    if (slot.status !== 'disponivel') return;

    setSelectedSlot(slot);
    setSelectedInstalacao(instalacao);

    // AGD01.06 - Verificar junção
    if (hasJuncao) {
      setJuncaoInfo({
        sala1: instalacao.nome,
        sala2: 'Sala Adjacente', // TODO: Buscar sala de junção real
      });
      setShowJuncaoAlert(true);
    } else {
      setShowReservaModal(true);
    }
  };

  // Confirmar junção
  const confirmarJuncao = () => {
    setShowJuncaoAlert(false);
    setShowReservaModal(true);
  };

  // Opções de duração baseadas no horário (AGD01.05)
  const getDuracaoOptions = () => {
    if (!selectedSlot) return [];

    const horaInicio = parseInt(selectedSlot.horaInicio.split(':')[0]);
    const maxHora = 18; // Limite operacional
    const maxDuracao = (maxHora - horaInicio) * 60;

    const opcoes = [
      { value: '30', label: '30 minutos' },
      { value: '60', label: '1 hora' },
      { value: '90', label: '1h30' },
      { value: '120', label: '2 horas' },
      { value: '180', label: '3 horas' },
      { value: '240', label: '4 horas' },
    ].filter(opt => parseInt(opt.value) <= maxDuracao);

    return opcoes;
  };

  // Submeter reserva
  const handleSubmitReserva = async () => {
    if (!selectedSlot || !selectedInstalacao || !user) return;

    setIsSubmitting(true);
    try {
      const agendamento: Partial<Agendamento> = {
        titulo: reservaForm.assunto,
        assuntoId: selectedAssunto,
        portfolioServicosId: selectedPortfolio,
        serviceId: selectedService,
        instalacaoId: selectedInstalacao.id,
        solicitanteId: user.id,
        data: selectedSlot.data,
        horaInicio: selectedSlot.horaInicio,
        duracao: parseInt(reservaForm.duracao),
        status: 'pendente',
      };

      // TODO: Salvar no Dataverse via API
      console.log('Agendamento:', agendamento);

      // Se tem junção, criar segundo agendamento (AGD01.06)
      if (hasJuncao && juncaoInfo) {
        console.log('Agendamento da sala de junção:', {
          ...agendamento,
          instalacaoId: 'ID_SALA_JUNCAO',
          agendamentoRelacionadoId: 'ID_PRIMEIRO_AGENDAMENTO',
        });
      }

      // Sucesso
      setShowReservaModal(false);
      navigate('/consultas/meus-agendamentos', {
        state: { success: true, message: 'Agendamento realizado com sucesso!' }
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Limpar filtros (AGD01.07)
  const limparFiltros = () => {
    setSelectedAssunto('');
    setSelectedPortfolio('');
    setSelectedService('');
    setSelectedLocal('todos');
    setSelectedDate('');
    setSelectedHoraInicio('');
    setShowDisponibilidade(false);
    setSlots([]);
    setInstalacoes([]);
  };

  // Verificar perfil completo
  if (!isProfileComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <AlertTriangle className="h-16 w-16 text-seplag-warning mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-seplag-dark mb-2">
            Perfil Incompleto
          </h2>
          <p className="text-seplag-muted mb-6">
            Você precisa completar seu perfil antes de realizar agendamentos.
          </p>
          <Button onClick={() => navigate('/perfil')}>
            Completar Perfil
          </Button>
        </Card>
      </div>
    );
  }

  // Opções de local (AGD01.04)
  const localOptions = [
    { value: 'todos', label: 'Todos os Locais' },
    { value: 'todos_gerais', label: 'Todos – Gerais' },
    { value: 'todos_minas', label: 'Todos – Minas' },
    ...locais.map(l => ({ value: l.id, label: l.nome })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-seplag-dark">
          Realizar Agendamento
        </h1>
        <p className="text-seplag-muted mt-2">
          Selecione o tipo de serviço e encontre a melhor opção disponível.
        </p>
      </div>

      {/* Filtros de Agendamento (AGD01.02, AGD01.04) */}
      <Card className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading font-semibold text-lg flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filtros
          </h2>
          <Button variant="ghost" size="sm" onClick={limparFiltros}>
            <X className="h-4 w-4 mr-1" />
            Limpar Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Assunto (Grupo de Serviço) */}
          <Select
            label="Grupo de Serviços"
            required
            value={selectedAssunto}
            onChange={(e) => setSelectedAssunto(e.target.value)}
            options={assuntos.map(a => ({ value: a.id, label: a.nome }))}
            placeholder="Selecione o grupo..."
          />

          {/* Portfolio (Tipo de Serviço) */}
          <Select
            label="Tipo de Serviço"
            required
            value={selectedPortfolio}
            onChange={(e) => setSelectedPortfolio(e.target.value)}
            options={portfolios.map(p => ({ value: p.id, label: p.nome }))}
            placeholder="Selecione o tipo..."
            disabled={!selectedAssunto}
          />

          {/* Service */}
          <Select
            label="Serviço"
            required
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            options={services.map(s => ({ value: s.id, label: s.nome }))}
            placeholder="Selecione o serviço..."
            disabled={!selectedPortfolio}
          />

          {/* Local (AGD01.04) */}
          <Select
            label="Local"
            value={selectedLocal}
            onChange={(e) => setSelectedLocal(e.target.value)}
            options={localOptions}
          />

          {/* Data - só mostrar se validarDisponibilidade = true */}
          {requiresDisponibilidade && (
            <>
              <Input
                label="Data"
                type="date"
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />

              <Input
                label="Horário de Início (opcional)"
                type="time"
                value={selectedHoraInicio}
                onChange={(e) => setSelectedHoraInicio(e.target.value)}
                min="08:00"
                max="17:00"
              />
            </>
          )}
        </div>

        {/* Botão de Buscar Disponibilidade */}
        {requiresDisponibilidade && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={buscarDisponibilidade}
              disabled={!selectedService || !selectedDate}
              loading={isLoadingSlots}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Localizar Disponibilidade
            </Button>
          </div>
        )}
      </Card>

      {/* Resultados de Disponibilidade (AGD01.05, PRT03.02) */}
      {showDisponibilidade && (
        <div className="space-y-6">
          <h2 className="font-heading font-semibold text-xl text-seplag-dark">
            Disponibilidade para {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </h2>

          {/* Legenda */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-available"></div>
              <span>Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-occupied"></div>
              <span>Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-slot-unavailable"></div>
              <span>Indisponível</span>
            </div>
          </div>

          {/* Cards de Salas (PRT03.02) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {instalacoes.map((instalacao) => {
              const instalacaoSlots = slots.filter(s => s.instalacaoId === instalacao.id);
              const hasDisponivel = instalacaoSlots.some(s => s.status === 'disponivel');

              return (
                <Card key={instalacao.id} className="overflow-hidden">
                  {/* Foto da sala */}
                  <div className="h-40 bg-gray-200 -mx-6 -mt-6 mb-4">
                    {instalacao.foto ? (
                      <img 
                        src={instalacao.foto} 
                        alt={instalacao.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <MapPin className="h-12 w-12" />
                      </div>
                    )}
                  </div>

                  {/* Info da sala */}
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-heading font-semibold text-lg">
                        {instalacao.nome}
                      </h3>
                      <span className={`badge ${hasDisponivel ? 'badge-success' : 'badge-danger'}`}>
                        {hasDisponivel ? 'Disponível' : 'Ocupado'}
                      </span>
                    </div>
                    
                    {instalacao.capacidade && (
                      <p className="text-sm text-seplag-muted flex items-center mt-1">
                        <Users className="h-4 w-4 mr-1" />
                        {instalacao.capacidade} pessoas
                      </p>
                    )}

                    {instalacao.caracteristicas && instalacao.caracteristicas.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {instalacao.caracteristicas.slice(0, 3).map((carac, i) => (
                          <span key={i} className="badge badge-info">{carac}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Grid de Slots */}
                  <div className="grid grid-cols-5 gap-1">
                    {instalacaoSlots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot, instalacao)}
                        disabled={slot.status !== 'disponivel'}
                        className={`
                          slot text-xs py-1.5
                          ${slot.status === 'disponivel' ? 'slot-available' : ''}
                          ${slot.status === 'ocupado' ? 'slot-occupied' : ''}
                          ${slot.status === 'indisponivel' || slot.status === 'bloqueado' ? 'slot-unavailable' : ''}
                        `}
                        title={`${slot.horaInicio} - ${slot.horaFim}`}
                      >
                        {slot.horaInicio}
                      </button>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Alerta de Junção (AGD01.06) */}
      <Modal
        isOpen={showJuncaoAlert}
        onClose={() => setShowJuncaoAlert(false)}
        title="Reserva com Junção de Salas"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowJuncaoAlert(false)}>
              Cancelar
            </Button>
            <Button onClick={confirmarJuncao}>
              Confirmar e Continuar
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <AlertTriangle className="h-12 w-12 text-seplag-warning mx-auto mb-4" />
          <p className="text-seplag-dark">
            A reserva será feita nas salas <strong>{juncaoInfo?.sala1}</strong> e{' '}
            <strong>{juncaoInfo?.sala2}</strong>, pois este serviço possui junção de salas.
          </p>
          <p className="text-sm text-seplag-muted mt-2">
            Ambas as salas serão reservadas para o mesmo horário.
          </p>
        </div>
      </Modal>

      {/* Modal de Formulário de Reserva (AGD01.05) */}
      <Modal
        isOpen={showReservaModal}
        onClose={() => setShowReservaModal(false)}
        title="Confirmar Reserva"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowReservaModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitReserva}
              loading={isSubmitting}
              disabled={!reservaForm.assunto}
            >
              Confirmar Reserva
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Dados pré-preenchidos */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-seplag-dark mb-3">Dados da Reserva</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-seplag-muted">Sala:</span>
                <p className="font-medium">{selectedInstalacao?.nome}</p>
              </div>
              <div>
                <span className="text-seplag-muted">Data:</span>
                <p className="font-medium">
                  {selectedDate && new Date(selectedDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="text-seplag-muted">Horário:</span>
                <p className="font-medium">{selectedSlot?.horaInicio}</p>
              </div>
              <div>
                <span className="text-seplag-muted">Grupo de Serviço:</span>
                <p className="font-medium">
                  {assuntos.find(a => a.id === selectedAssunto)?.nome}
                </p>
              </div>
              <div>
                <span className="text-seplag-muted">Tipo de Serviço:</span>
                <p className="font-medium">
                  {portfolios.find(p => p.id === selectedPortfolio)?.nome}
                </p>
              </div>
              <div>
                <span className="text-seplag-muted">Serviço:</span>
                <p className="font-medium">
                  {services.find(s => s.id === selectedService)?.nome}
                </p>
              </div>
            </div>
          </div>

          {/* Campos a preencher */}
          <div className="space-y-4">
            <Input
              label="Assunto da Reunião"
              required
              value={reservaForm.assunto}
              onChange={(e) => setReservaForm(prev => ({ ...prev, assunto: e.target.value }))}
              placeholder="Ex: Reunião de Planejamento Estratégico"
            />

            <Select
              label="Duração"
              required
              value={reservaForm.duracao}
              onChange={(e) => setReservaForm(prev => ({ ...prev, duracao: e.target.value }))}
              options={getDuracaoOptions()}
            />
          </div>

          {/* Dados do Solicitante */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-seplag-dark mb-3">Dados do Solicitante</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-seplag-muted">Nome:</span>
                <p className="font-medium">{user?.nomeCompleto}</p>
              </div>
              <div>
                <span className="text-seplag-muted">E-mail:</span>
                <p className="font-medium">{user?.emailCorporativo}</p>
              </div>
              <div>
                <span className="text-seplag-muted">Órgão:</span>
                <p className="font-medium">{user?.orgaoSecretaria}</p>
              </div>
              <div>
                <span className="text-seplag-muted">Telefone:</span>
                <p className="font-medium">{user?.telefoneComercial}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
