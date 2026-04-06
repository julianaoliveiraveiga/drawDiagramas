import { dataverseApi, customApi, callPowerAutomateFlow } from './api';
import type { 
  Assunto, 
  PortfolioServicos, 
  Service, 
  InstalacaoEquipamentos,
  Local,
  SlotDisponibilidade,
  Agendamento,
  JuncaoSalas,
  PaginatedResponse
} from '@/types';

// ============================================
// SERVIÇOS DE AGENDAMENTO (AGD01)
// ============================================

export const agendamentoService = {
  // Buscar todos os Assuntos (Grupos de Serviço)
  async getAssuntos(): Promise<Assunto[]> {
    const response = await dataverseApi.get('/cr_assuntos', {
      params: {
        $filter: 'statecode eq 0', // Apenas ativos
        $orderby: 'cr_ordem asc, cr_nome asc',
      },
    });
    return response.data.value;
  },

  // Buscar Portfolios por Assunto (AGD01.01)
  async getPortfolios(assuntoId: string, tipo?: 'agendamento' | 'ocorrencia'): Promise<PortfolioServicos[]> {
    let filter = `_cr_assuntoid_value eq '${assuntoId}' and cr_exibirnoportal eq true and statecode eq 0`;
    
    if (tipo) {
      filter += ` and cr_tipo eq '${tipo}'`;
    }

    const response = await dataverseApi.get('/cr_portfolioservicos', {
      params: {
        $filter: filter,
        $orderby: 'cr_ordem asc, cr_nome asc',
      },
    });
    return response.data.value;
  },

  // Buscar Services por Portfolio (AGD01.01)
  async getServices(portfolioId: string): Promise<Service[]> {
    const response = await dataverseApi.get('/cr_services', {
      params: {
        $filter: `_cr_portfolioservicosid_value eq '${portfolioId}' and cr_exibirnoportal eq true and statecode eq 0`,
        $orderby: 'cr_ordem asc, cr_nome asc',
      },
    });
    return response.data.value;
  },

  // Buscar Instalações/Equipamentos
  async getInstalacoes(serviceId?: string): Promise<InstalacaoEquipamentos[]> {
    let filter = 'statecode eq 0';
    
    if (serviceId) {
      // Buscar via relacionamento N:N com Grupo de Recursos
      filter += ` and cr_services/any(s: s/cr_serviceid eq '${serviceId}')`;
    }

    const response = await dataverseApi.get('/cr_instalacaoequipamentos', {
      params: {
        $filter: filter,
        $expand: 'cr_gruporecursos',
      },
    });
    return response.data.value;
  },

  // Buscar Locais
  async getLocais(): Promise<Local[]> {
    const response = await dataverseApi.get('/cr_locais', {
      params: {
        $filter: 'statecode eq 0',
        $orderby: 'cr_predio asc, cr_andar asc, cr_nome asc',
      },
    });
    return response.data.value;
  },

  // Buscar Disponibilidade (AGD01.05) - via Power Automate
  async buscarDisponibilidade(params: {
    serviceId: string;
    data: string;
    localId?: string;
    horaInicio?: string;
  }): Promise<SlotDisponibilidade[]> {
    // Chamar Power Automate ou Custom API para melhor performance
    return await callPowerAutomateFlow<SlotDisponibilidade[]>('buscarDisponibilidade', params);
  },

  // Verificar Junção de Salas (AGD01.06)
  async getJuncaoSala(serviceId: string): Promise<JuncaoSalas | null> {
    const response = await dataverseApi.get('/cr_juncaosalas', {
      params: {
        $filter: `_cr_serviceid_value eq '${serviceId}'`,
        $expand: 'cr_salaoriginal,cr_salajuncao',
      },
    });
    
    return response.data.value[0] || null;
  },

  // Criar Agendamento (AGD01.05)
  async criarAgendamento(agendamento: Partial<Agendamento>): Promise<Agendamento> {
    // Usar Power Automate para criar agendamento com regras de negócio
    return await callPowerAutomateFlow<Agendamento>('criarAgendamento', agendamento);
  },

  // Criar Agendamento com Junção (AGD01.06)
  async criarAgendamentoComJuncao(
    agendamento: Partial<Agendamento>,
    juncao: JuncaoSalas
  ): Promise<{ agendamento1: Agendamento; agendamento2: Agendamento }> {
    // Criar dois agendamentos relacionados
    const agendamento1 = await this.criarAgendamento({
      ...agendamento,
      instalacaoId: juncao.salaOriginalId,
    });

    const agendamento2 = await this.criarAgendamento({
      ...agendamento,
      instalacaoId: juncao.salaJuncaoId,
      agendamentoRelacionadoId: agendamento1.id,
    });

    // Atualizar agendamento1 com referência ao agendamento2
    await dataverseApi.patch(`/cr_agendamentos(${agendamento1.id})`, {
      cr_agendamentorelacionadoid: agendamento2.id,
    });

    return { agendamento1, agendamento2 };
  },

  // Buscar Agendamentos do Usuário (CON01.02)
  async getMeusAgendamentos(usuarioId: string): Promise<Agendamento[]> {
    const response = await dataverseApi.get('/cr_agendamentos', {
      params: {
        $filter: `_cr_solicitanteid_value eq '${usuarioId}'`,
        $orderby: 'cr_data desc, cr_horainicio asc',
        $expand: 'cr_instalacao,cr_service,cr_portfolio,cr_assunto',
      },
    });
    return response.data.value;
  },

  // Cancelar Agendamento
  async cancelarAgendamento(agendamentoId: string): Promise<void> {
    await callPowerAutomateFlow('cancelarAgendamento', { agendamentoId });
  },

  // Atualizar Agendamento
  async atualizarAgendamento(agendamentoId: string, dados: Partial<Agendamento>): Promise<Agendamento> {
    const response = await dataverseApi.patch(`/cr_agendamentos(${agendamentoId})`, dados);
    return response.data;
  },
};

export default agendamentoService;
