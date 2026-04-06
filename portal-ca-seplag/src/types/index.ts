// ============================================
// TIPOS BASE DO PORTAL CA SEPLAG
// Baseado na modelagem atual do Dataverse
// ============================================

// PRT01 - Perfil do Usuário
export interface UserProfile {
  id: string;
  nomeCompleto: string;
  emailCorporativo: string;
  orgaoSecretaria: string;
  predio: string;
  andar: string;
  numeroEstacaoTrabalho: string;
  masp: string;
  cpf: string;
  telefoneComercial: string;
  celular: string;
  isProfileComplete: boolean;
  lastLoginDate?: Date;
  roles: UserRole[];
}

export type UserRole = 'usuario' | 'gestor' | 'admin' | 'ponto_focal';

// PRT02 - Notificações do Portal
export interface Notificacao {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: Date;
  dataTermino: Date;
  notificacaoPrincipal: boolean;
  ativa: boolean;
}

// ============================================
// MODELAGEM DATAVERSE - ESTRUTURA ATUAL
// ============================================

// 1. Assunto (= Grupo de Serviços)
export interface Assunto {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  ordem?: number;
}

// 2. Portfolio de Serviços (= Tipo de Serviço)
export interface PortfolioServicos {
  id: string;
  nome: string;
  assuntoId: string; // FK para Assunto (1:N)
  assunto?: Assunto;
  exibirNoPortal: boolean;
  tipo: TipoPortfolio; // Agendamento ou Ocorrência
  validarDisponibilidade: boolean;
  descricao?: string;
  ordem?: number;
  ativo: boolean;
}

export type TipoPortfolio = 'agendamento' | 'ocorrencia';

// 3. Service (= Serviço)
export interface Service {
  id: string;
  nome: string;
  portfolioServicosId: string; // FK para Portfolio de Serviços (N:1)
  portfolioServicos?: PortfolioServicos;
  exibirNoPortal: boolean;
  possuiJuncao: boolean;
  possuiAnexo?: boolean;
  descricao?: string;
  gruposRecursos?: GrupoRecursos[]; // Relacionamento N:N
  ordem?: number;
  ativo: boolean;
}

// 4. Instalação e Equipamentos
export interface InstalacaoEquipamentos {
  id: string;
  nome: string;
  descricao?: string;
  grupoRecursosId?: string; // FK para Grupo de Recursos (N:1)
  grupoRecursos?: GrupoRecursos;
  locais?: Local[]; // Relacionamento N:N
  capacidade?: number;
  foto?: string;
  caracteristicas?: string[];
  ativo: boolean;
}

// 5. Grupo de Recursos
export interface GrupoRecursos {
  id: string;
  nome: string;
  descricao?: string;
  services?: Service[]; // Relacionamento N:N com Service
  ativo: boolean;
}

// 6. Junção de Salas
export interface JuncaoSalas {
  id: string;
  nome: string;
  serviceId: string; // FK para Service (N:1)
  service?: Service;
  salaOriginalId: string;
  salaJuncaoId: string;
  capacidadeCombinada?: number;
  // Power Automate atualiza campo "Possui Junção?" no Service
}

// 7. Locais (Prédio + Andar)
// Representa a localização física onde o serviço/ocorrência será realizado
export interface Local {
  id: string;
  nome: string; // Nome descritivo (ex: "Torre Norte - 3º Andar")
  predio: string; // Prédio (ex: "Torre Norte", "Cidade Administrativa")
  andar: string; // Andar (ex: "1º Andar", "Térreo")
  descricao?: string;
  instalacoes?: InstalacaoEquipamentos[]; // Relacionamento N:N
  // Power Automate relaciona Local ao Portfolio na criação/atualização
  ativo: boolean;
}

// Estrutura hierárquica para seleção de localização em Ocorrências
export interface Predio {
  id: string;
  nome: string;
  descricao?: string;
  andares: Andar[];
  ativo: boolean;
}

export interface Andar {
  id: string;
  predioId: string;
  nome: string; // Ex: "1º Andar", "Térreo", "Subsolo"
  numero?: number;
  ativo: boolean;
}

// ============================================
// AGD01 - AGENDAMENTOS
// ============================================

export interface SlotDisponibilidade {
  id: string;
  instalacaoId: string; // Referência à Instalação/Equipamento
  instalacao?: InstalacaoEquipamentos;
  data: Date;
  horaInicio: string;
  horaFim: string;
  status: SlotStatus;
  agendamentoId?: string;
}

export type SlotStatus = 'disponivel' | 'ocupado' | 'indisponivel' | 'bloqueado';

export interface Agendamento {
  id: string;
  titulo: string;
  descricao?: string;
  assuntoId: string; // FK Assunto (Grupo de Serviços)
  assunto?: Assunto;
  portfolioServicosId: string; // FK Portfolio (Tipo de Serviço)
  portfolioServicos?: PortfolioServicos;
  serviceId: string; // FK Service
  service?: Service;
  instalacaoId: string; // FK Instalação/Equipamento
  instalacao?: InstalacaoEquipamentos;
  localId?: string; // FK Local
  local?: Local;
  solicitanteId: string;
  solicitante?: UserProfile;
  data: Date;
  horaInicio: string;
  horaFim: string;
  duracao: number; // em minutos
  status: AgendamentoStatus;
  agendamentoRelacionadoId?: string; // Para junção de salas
  empresa?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AgendamentoStatus = 
  | 'pendente' 
  | 'confirmado' 
  | 'cancelado' 
  | 'concluido' 
  | 'nao_compareceu';

// Filtros de Agendamento (AGD01.04)
export interface FiltrosAgendamento {
  assuntoId?: string;
  portfolioServicosId?: string;
  serviceId?: string;
  data?: Date;
  horaInicio?: string;
  local?: LocalFiltro;
}

export type LocalFiltro = 
  | 'todos'
  | 'todos_gerais'
  | 'todos_minas'
  | string; // ID específico do local

// ============================================
// OCOR01 - OCORRÊNCIAS
// ============================================

export interface Ocorrencia {
  id: string;
  titulo: string;
  descricao?: string;
  assuntoId: string; // FK Assunto (Grupo de Serviços)
  assunto?: Assunto;
  portfolioServicosId?: string; // FK Portfolio (Tipo de Serviço)
  portfolioServicos?: PortfolioServicos;
  serviceId: string; // FK Service
  service?: Service;
  solicitanteId: string;
  solicitante?: UserProfile;
  localId: string; // FK Local
  local?: Local;
  predioId?: string;
  andarId?: string;
  localizacaoDetalhada?: string;
  status: OcorrenciaStatus;
  // Campos condicionais por serviço
  temperaturaDesejada?: number; // 20-24°C, para ar-condicionado
  dataInicio?: Date; // Para iluminação após 19h
  dataFim?: Date;
  horarioInicio?: string;
  horarioTermino?: string;
  justificativa?: string;
  anexos?: Anexo[];
  createdAt: Date;
  updatedAt: Date;
}

export type OcorrenciaStatus = 
  | 'aberta' 
  | 'em_andamento' 
  | 'pendente' 
  | 'resolvida' 
  | 'cancelada';

export interface Anexo {
  id: string;
  nome: string;
  url: string;
  tipo: string;
  tamanho: number;
}

// Configuração de campos dinâmicos (OCOR01.02)
export interface CampoConfig {
  nome: string;
  tipo: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'textarea' | 'file';
  obrigatorio: boolean;
  visivel: boolean;
  validacao?: {
    min?: number;
    max?: number;
    maxLength?: number;
    pattern?: string;
  };
  opcoes?: { valor: string; label: string }[];
  ordem: number;
}

export interface SecaoFormulario {
  id: string;
  nome: string;
  servicoId: string;
  campos: CampoConfig[];
  ordem: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
