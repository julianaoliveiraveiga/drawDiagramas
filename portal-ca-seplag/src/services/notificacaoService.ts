import { dataverseApi } from './api';
import type { Notificacao } from '@/types';

// ============================================
// SERVIÇOS DE NOTIFICAÇÃO (PRT02)
// ============================================

export const notificacaoService = {
  // Buscar Notificações Ativas (PRT02.01)
  async getNotificacoesAtivas(): Promise<Notificacao[]> {
    const hoje = new Date().toISOString();
    
    const response = await dataverseApi.get('/cr_notificacoesportal', {
      params: {
        $filter: `cr_ativa eq true and cr_datainicio le ${hoje} and cr_datatermino ge ${hoje}`,
        $orderby: 'cr_notificacaoprincipal desc, createdon desc',
      },
    });
    
    return response.data.value.map((n: any) => ({
      id: n.cr_notificacaoportalid,
      titulo: n.cr_titulo,
      descricao: n.cr_descricao,
      dataInicio: new Date(n.cr_datainicio),
      dataTermino: new Date(n.cr_datatermino),
      notificacaoPrincipal: n.cr_notificacaoprincipal,
      ativa: n.cr_ativa,
    }));
  },

  // Buscar Notificações Principais (para banner)
  async getNotificacoesPrincipais(): Promise<Notificacao[]> {
    const hoje = new Date().toISOString();
    
    const response = await dataverseApi.get('/cr_notificacoesportal', {
      params: {
        $filter: `cr_ativa eq true and cr_notificacaoprincipal eq true and cr_datainicio le ${hoje} and cr_datatermino ge ${hoje}`,
        $orderby: 'createdon desc',
        $top: 5,
      },
    });
    
    return response.data.value.map((n: any) => ({
      id: n.cr_notificacaoportalid,
      titulo: n.cr_titulo,
      descricao: n.cr_descricao,
      dataInicio: new Date(n.cr_datainicio),
      dataTermino: new Date(n.cr_datatermino),
      notificacaoPrincipal: n.cr_notificacaoprincipal,
      ativa: n.cr_ativa,
    }));
  },
};

export default notificacaoService;
