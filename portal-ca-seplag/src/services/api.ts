import axios, { AxiosInstance, AxiosError } from 'axios';

// ============================================
// CONFIGURAÇÃO DO CLIENTE HTTP
// Para integração com Dataverse REST API
// ============================================

// Configurações de ambiente (dinâmicas por ambiente)
const API_CONFIG = {
  // URLs do Power Automate configuráveis por ambiente (AGD01.03)
  powerAutomate: {
    baseUrl: import.meta.env.VITE_POWER_AUTOMATE_URL || '',
    flows: {
      buscarDisponibilidade: import.meta.env.VITE_FLOW_DISPONIBILIDADE || '',
      criarAgendamento: import.meta.env.VITE_FLOW_CRIAR_AGENDAMENTO || '',
      cancelarAgendamento: import.meta.env.VITE_FLOW_CANCELAR_AGENDAMENTO || '',
      criarOcorrencia: import.meta.env.VITE_FLOW_CRIAR_OCORRENCIA || '',
      buscarLocalizacoes: import.meta.env.VITE_FLOW_BUSCAR_LOCALIZACOES || '',
    },
  },
  // Dataverse Web API
  dataverse: {
    baseUrl: import.meta.env.VITE_DATAVERSE_URL || '',
    apiVersion: 'v9.2',
  },
  // Custom APIs (C#)
  customApi: {
    baseUrl: import.meta.env.VITE_CUSTOM_API_URL || '',
  },
};

// Criar instância do axios para Dataverse
export const dataverseApi: AxiosInstance = axios.create({
  baseURL: `${API_CONFIG.dataverse.baseUrl}/api/data/${API_CONFIG.dataverse.apiVersion}`,
  headers: {
    'Content-Type': 'application/json',
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Accept': 'application/json',
    'Prefer': 'return=representation',
  },
});

// Criar instância para Custom APIs
export const customApi: AxiosInstance = axios.create({
  baseURL: API_CONFIG.customApi.baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
const addAuthToken = (config: any) => {
  // TODO: Obter token do MSAL
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

dataverseApi.interceptors.request.use(addAuthToken);
customApi.interceptors.request.use(addAuthToken);

// Tratamento de erros
const handleApiError = (error: AxiosError) => {
  if (error.response) {
    // Erro de resposta do servidor
    console.error('API Error:', error.response.data);
    
    if (error.response.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
  } else if (error.request) {
    // Erro de rede
    console.error('Network Error:', error.request);
  }
  
  return Promise.reject(error);
};

dataverseApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

customApi.interceptors.response.use(
  (response) => response,
  handleApiError
);

// Função helper para chamar Power Automate flows
export async function callPowerAutomateFlow<T>(
  flowKey: keyof typeof API_CONFIG.powerAutomate.flows,
  data: Record<string, any>
): Promise<T> {
  const flowUrl = API_CONFIG.powerAutomate.flows[flowKey];
  
  if (!flowUrl) {
    throw new Error(`Flow URL não configurada para: ${flowKey}`);
  }

  const response = await axios.post<T>(flowUrl, data, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return response.data;
}

export { API_CONFIG };
