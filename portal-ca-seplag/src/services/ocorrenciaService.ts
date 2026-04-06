import { dataverseApi, customApi, callPowerAutomateFlow } from './api';
import type { 
  Ocorrencia, 
  Local,
  Assunto,
  PortfolioServicos,
  Service,
  PaginatedResponse
} from '@/types';

// ============================================
// SERVIÇOS DE OCORRÊNCIA (OCOR01)
// ============================================

export const ocorrenciaService = {
  // Buscar Localizações com Typeahead (OCOR01.01 item 6)
  // Usando Custom API para performance com 1000+ registros
  async buscarLocalizacoes(query: string, limite: number = 20): Promise<Local[]> {
    try {
      // Tentar Custom API primeiro (mais performático)
      const response = await customApi.get('/api/localizacoes/buscar', {
        params: {
          q: query,
          limite,
        },
      });
      return response.data;
    } catch (error) {
      // Fallback para Dataverse direto
      const response = await dataverseApi.get('/cr_locais', {
        params: {
          $filter: `contains(cr_nome, '${query}') or contains(cr_predio, '${query}') or contains(cr_andar, '${query}')`,
          $top: limite,
          $orderby: 'cr_predio asc, cr_andar asc, cr_nome asc',
        },
      });
      return response.data.value;
    }
  },

  // Buscar Assuntos para Ocorrências
  async getAssuntos(): Promise<Assunto[]> {
    const response = await dataverseApi.get('/cr_assuntos', {
      params: {
        $filter: 'statecode eq 0',
        $orderby: 'cr_ordem asc, cr_nome asc',
      },
    });
    return response.data.value;
  },

  // Buscar Portfolios de Ocorrência
  async getPortfolios(assuntoId: string): Promise<PortfolioServicos[]> {
    const response = await dataverseApi.get('/cr_portfolioservicos', {
      params: {
        $filter: `_cr_assuntoid_value eq '${assuntoId}' and cr_tipo eq 'ocorrencia' and cr_exibirnoportal eq true and statecode eq 0`,
        $orderby: 'cr_ordem asc, cr_nome asc',
      },
    });
    return response.data.value;
  },

  // Buscar Services com configuração de campos (OCOR01.02)
  async getServices(portfolioId: string): Promise<Service[]> {
    const response = await dataverseApi.get('/cr_services', {
      params: {
        $filter: `_cr_portfolioservicosid_value eq '${portfolioId}' and cr_exibirnoportal eq true and statecode eq 0`,
        $orderby: 'cr_ordem asc, cr_nome asc',
        // Incluir configuração de campos dinâmicos
        $select: 'cr_serviceid,cr_nome,cr_exibirnoportal,cr_possuijuncao,cr_possuianexo,cr_configcampos',
      },
    });
    return response.data.value;
  },

  // Criar Ocorrência
  async criarOcorrencia(ocorrencia: Partial<Ocorrencia>): Promise<Ocorrencia> {
    // Usar Power Automate para regras de negócio e notificações
    return await callPowerAutomateFlow<Ocorrencia>('criarOcorrencia', ocorrencia);
  },

  // Buscar Minhas Ocorrências
  async getMinhasOcorrencias(usuarioId: string): Promise<Ocorrencia[]> {
    const response = await dataverseApi.get('/cr_ocorrencias', {
      params: {
        $filter: `_cr_solicitanteid_value eq '${usuarioId}'`,
        $orderby: 'createdon desc',
        $expand: 'cr_service,cr_local',
      },
    });
    return response.data.value;
  },

  // Buscar Ocorrência por ID
  async getOcorrencia(ocorrenciaId: string): Promise<Ocorrencia> {
    const response = await dataverseApi.get(`/cr_ocorrencias(${ocorrenciaId})`, {
      params: {
        $expand: 'cr_service,cr_local,cr_solicitante',
      },
    });
    return response.data;
  },

  // Upload de Anexo (OCOR01.01 item 4)
  async uploadAnexo(ocorrenciaId: string, arquivo: File): Promise<{ id: string; url: string }> {
    const formData = new FormData();
    formData.append('file', arquivo);
    formData.append('ocorrenciaId', ocorrenciaId);

    const response = await customApi.post('/api/anexos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Buscar Ocorrências com Filtros (OCOR01.03)
  async buscarOcorrencias(filtros: {
    orgao?: string;
    predio?: string;
    andar?: string;
    tipoServico?: string;
    fornecedorId?: string;
    status?: string;
    pagina?: number;
    porPagina?: number;
  }): Promise<PaginatedResponse<Ocorrencia>> {
    const filters: string[] = ['statecode eq 0'];

    if (filtros.orgao) {
      filters.push(`cr_orgao eq '${filtros.orgao}'`);
    }
    if (filtros.predio) {
      filters.push(`cr_local/cr_predio eq '${filtros.predio}'`);
    }
    if (filtros.andar) {
      filters.push(`cr_local/cr_andar eq '${filtros.andar}'`);
    }
    if (filtros.tipoServico) {
      filters.push(`_cr_serviceid_value eq '${filtros.tipoServico}'`);
    }
    if (filtros.fornecedorId) {
      filters.push(`_cr_fornecedorid_value eq '${filtros.fornecedorId}'`);
    }
    if (filtros.status) {
      filters.push(`cr_status eq '${filtros.status}'`);
    }

    const pagina = filtros.pagina || 1;
    const porPagina = filtros.porPagina || 20;
    const skip = (pagina - 1) * porPagina;

    const response = await dataverseApi.get('/cr_ocorrencias', {
      params: {
        $filter: filters.join(' and '),
        $orderby: 'createdon desc',
        $top: porPagina,
        $skip: skip,
        $count: true,
        $expand: 'cr_service,cr_local,cr_fornecedor',
      },
    });

    const total = response.data['@odata.count'] || 0;

    return {
      items: response.data.value,
      total,
      page: pagina,
      pageSize: porPagina,
      totalPages: Math.ceil(total / porPagina),
    };
  },
};

export default ocorrenciaService;
