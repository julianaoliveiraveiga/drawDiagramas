import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Upload, X, MapPin, Thermometer, Clock, FileText, Building, Layers } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button, Card, Select, Input, Textarea, Modal } from '@/components/ui';
import type { Assunto, PortfolioServicos, Service, Predio, Andar, Ocorrencia } from '@/types';

// ============================================
// OCOR01 - PÁGINA DE ABERTURA DE OCORRÊNCIAS
// Formulário Dinâmico conforme tipo de serviço
// Localização: Prédio + Andar (sem sala específica)
// ============================================

interface CamposDinamicos {
  temperaturaDesejada?: number;
  dataInicio?: string;
  dataFim?: string;
  horarioInicio?: string;
  horarioTermino?: string;
  justificativa?: string;
  descricao?: string;
  anexos?: File[];
}

export function OcorrenciaPage() {
  const navigate = useNavigate();
  const { user, isProfileComplete } = useAuth();
  
  // Estados de dados
  const [assuntos, setAssuntos] = useState<Assunto[]>([]);
  const [portfolios, setPortfolios] = useState<PortfolioServicos[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  
  // Estados de localização (Prédio > Andar)
  const [predios, setPredios] = useState<Predio[]>([]);
  const [andares, setAndares] = useState<Andar[]>([]);
  
  // Estados de seleção
  const [selectedAssunto, setSelectedAssunto] = useState<string>('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  
  // Seleção de localização hierárquica (apenas Prédio + Andar)
  const [selectedPredio, setSelectedPredio] = useState<string>('');
  const [selectedAndar, setSelectedAndar] = useState<string>('');
  
  // Campos dinâmicos (OCOR01.02)
  const [camposDinamicos, setCamposDinamicos] = useState<CamposDinamicos>({});
  
  // Estados de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Identificar tipo de serviço para campos condicionais (OCOR01.01)
  const serviceSelecionado = services.find(s => s.id === selectedService);
  const isTemperatura = serviceSelecionado?.nome?.toLowerCase().includes('temperatura') || 
                         serviceSelecionado?.nome?.toLowerCase().includes('ar-condicionado');
  const isIluminacao = serviceSelecionado?.nome?.toLowerCase().includes('iluminação');
  const possuiAnexo = serviceSelecionado?.possuiAnexo;

  // Verificar se usuário é ponto focal para iluminação (OCOR01.01 item 2)
  const isPontoFocal = user?.roles?.includes('ponto_focal');
  const podeVerIluminacao = !isIluminacao || isPontoFocal;

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      // TODO: Buscar do Dataverse via Custom API
      // Mock de Assuntos para Ocorrências
      setAssuntos([
        { id: '1', nome: 'Manutenção Predial', ativo: true },
        { id: '2', nome: 'Infraestrutura de TI', ativo: true },
        { id: '3', nome: 'Climatização', ativo: true },
        { id: '4', nome: 'Acesso e Segurança', ativo: true },
      ]);

      // Mock de Prédios com estrutura hierárquica
      const mockPredios: Predio[] = [
        {
          id: '1',
          nome: 'Cidade Administrativa - Torre Norte',
          descricao: 'Torre Norte da Cidade Administrativa',
          ativo: true,
          andares: [
            { id: '1-1', predioId: '1', nome: 'Térreo', numero: 0, salas: [], ativo: true },
            { id: '1-2', predioId: '1', nome: '1º Andar', numero: 1, salas: [], ativo: true },
            { id: '1-3', predioId: '1', nome: '2º Andar', numero: 2, salas: [], ativo: true },
            { id: '1-4', predioId: '1', nome: '3º Andar', numero: 3, salas: [], ativo: true },
            { id: '1-5', predioId: '1', nome: '4º Andar', numero: 4, salas: [], ativo: true },
          ],
        },
        {
          id: '2',
          nome: 'Cidade Administrativa - Torre Sul',
          descricao: 'Torre Sul da Cidade Administrativa',
          ativo: true,
          andares: [
            { id: '2-1', predioId: '2', nome: 'Térreo', numero: 0, salas: [], ativo: true },
            { id: '2-2', predioId: '2', nome: '1º Andar', numero: 1, salas: [], ativo: true },
            { id: '2-3', predioId: '2', nome: '2º Andar', numero: 2, salas: [], ativo: true },
            { id: '2-4', predioId: '2', nome: '3º Andar', numero: 3, salas: [], ativo: true },
          ],
        },
        {
          id: '3',
          nome: 'Prédio Minas',
          descricao: 'Prédio Minas',
          ativo: true,
          andares: [
            { id: '3-1', predioId: '3', nome: 'Térreo', numero: 0, salas: [], ativo: true },
            { id: '3-2', predioId: '3', nome: '1º Andar', numero: 1, salas: [], ativo: true },
            { id: '3-3', predioId: '3', nome: '2º Andar', numero: 2, salas: [], ativo: true },
          ],
        },
      ];
      setPredios(mockPredios);
    };

    loadData();
  }, []);

  // Carregar andares quando prédio mudar
  useEffect(() => {
    if (!selectedPredio) {
      setAndares([]);
      setSelectedAndar('');
      return;
    }

    const predio = predios.find(p => p.id === selectedPredio);
    if (predio) {
      setAndares(predio.andares);
    }
    setSelectedAndar('');
  }, [selectedPredio, predios]);

  // Carregar Portfolios quando Assunto mudar
  useEffect(() => {
    if (!selectedAssunto) {
      setPortfolios([]);
      setSelectedPortfolio('');
      return;
    }

    // TODO: Buscar do Dataverse filtrado por tipo = 'ocorrencia'
    const mockPortfolios: PortfolioServicos[] = [
      { 
        id: '1', 
        nome: 'Ar-condicionado', 
        assuntoId: '3',
        exibirNoPortal: true,
        tipo: 'ocorrencia',
        validarDisponibilidade: false,
        ativo: true
      },
      { 
        id: '2', 
        nome: 'Iluminação', 
        assuntoId: '1',
        exibirNoPortal: true,
        tipo: 'ocorrencia',
        validarDisponibilidade: false,
        ativo: true
      },
      { 
        id: '3', 
        nome: 'Crachá/Acesso', 
        assuntoId: '4',
        exibirNoPortal: true,
        tipo: 'ocorrencia',
        validarDisponibilidade: false,
        ativo: true
      },
      { 
        id: '4', 
        nome: 'Manutenção Elétrica', 
        assuntoId: '1',
        exibirNoPortal: true,
        tipo: 'ocorrencia',
        validarDisponibilidade: false,
        ativo: true
      },
    ].filter(p => p.assuntoId === selectedAssunto && p.exibirNoPortal);

    setPortfolios(mockPortfolios);
    setSelectedPortfolio('');
    setServices([]);
    setSelectedService('');
    setCamposDinamicos({});
  }, [selectedAssunto]);

  // Carregar Services quando Portfolio mudar
  useEffect(() => {
    if (!selectedPortfolio) {
      setServices([]);
      setSelectedService('');
      return;
    }

    // TODO: Buscar do Dataverse com configuração de campos
    const mockServices: Service[] = [
      { 
        id: '1', 
        nome: 'Regulação de Temperatura (Ar-condicionado)', 
        portfolioServicosId: '1',
        exibirNoPortal: true,
        possuiJuncao: false,
        possuiAnexo: false,
        ativo: true
      },
      { 
        id: '2', 
        nome: 'Iluminação após 19h', 
        portfolioServicosId: '2',
        exibirNoPortal: true,
        possuiJuncao: false,
        possuiAnexo: false,
        ativo: true
      },
      { 
        id: '3', 
        nome: 'Solicitação de Crachá', 
        portfolioServicosId: '3',
        exibirNoPortal: true,
        possuiJuncao: false,
        possuiAnexo: true, // Possui anexo
        ativo: true
      },
      { 
        id: '4', 
        nome: 'Troca de Lâmpada', 
        portfolioServicosId: '4',
        exibirNoPortal: true,
        possuiJuncao: false,
        possuiAnexo: false,
        ativo: true
      },
    ].filter(s => s.portfolioServicosId === selectedPortfolio && s.exibirNoPortal);

    // Filtrar iluminação para não pontos focais
    const filteredServices = mockServices.filter(s => {
      if (s.nome.toLowerCase().includes('iluminação') && !isPontoFocal) {
        return false;
      }
      return true;
    });

    setServices(filteredServices);
    setSelectedService('');
    setCamposDinamicos({});
  }, [selectedPortfolio, isPontoFocal]);

  // Validar campos
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedAssunto) newErrors.assunto = 'Selecione o grupo de serviço';
    if (!selectedService) newErrors.service = 'Selecione o serviço';
    
    // Validação de localização (Prédio + Andar)
    if (!selectedPredio) newErrors.predio = 'Selecione o prédio';
    if (!selectedAndar) newErrors.andar = 'Selecione o andar';

    // Validação específica para temperatura (OCOR01.01 item 1)
    if (isTemperatura) {
      const temp = camposDinamicos.temperaturaDesejada;
      if (temp === undefined || temp === null) {
        newErrors.temperatura = 'Informe a temperatura desejada';
      } else if (temp < 20 || temp > 24) {
        newErrors.temperatura = 'A temperatura deve estar entre 20°C e 24°C';
      }
    }

    // Validação para iluminação (OCOR01.01 item 2)
    if (isIluminacao) {
      if (!camposDinamicos.dataInicio) newErrors.dataInicio = 'Informe a data de início';
      if (!camposDinamicos.dataFim) newErrors.dataFim = 'Informe a data de fim';
      if (!camposDinamicos.horarioInicio) newErrors.horarioInicio = 'Informe o horário de início';
      if (!camposDinamicos.horarioTermino) newErrors.horarioTermino = 'Informe o horário de término';
      if (!camposDinamicos.justificativa) newErrors.justificativa = 'Informe a justificativa';
    }

    // Validação de descrição (OCOR01.01 item 3)
    if (!isTemperatura && !isIluminacao) {
      if (camposDinamicos.descricao && camposDinamicos.descricao.length > 2000) {
        newErrors.descricao = 'A descrição deve ter no máximo 2.000 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submeter ocorrência
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const predioSelecionado = predios.find(p => p.id === selectedPredio);
      const andarSelecionado = andares.find(a => a.id === selectedAndar);
      
      const ocorrencia: Partial<Ocorrencia> = {
        assuntoId: selectedAssunto,
        portfolioServicosId: selectedPortfolio,
        serviceId: selectedService,
        predioId: selectedPredio,
        andarId: selectedAndar,
        localizacaoDetalhada: `${predioSelecionado?.nome} - ${andarSelecionado?.nome}`,
        solicitanteId: user?.id,
        status: 'aberta',
        ...camposDinamicos,
      };

      // TODO: Salvar no Dataverse via API
      console.log('Ocorrência:', ocorrencia);

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manipulador de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setCamposDinamicos(prev => ({
        ...prev,
        anexos: [...(prev.anexos || []), ...Array.from(files)],
      }));
    }
  };

  const removeFile = (index: number) => {
    setCamposDinamicos(prev => ({
      ...prev,
      anexos: prev.anexos?.filter((_, i) => i !== index),
    }));
  };

  // Verificar perfil completo
  if (!isProfileComplete) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-seplag-warning mx-auto mb-4" />
          <h2 className="font-heading font-bold text-xl text-seplag-dark mb-2">
            Perfil Incompleto
          </h2>
          <p className="text-seplag-muted mb-6">
            Você precisa completar seu perfil antes de abrir ocorrências.
          </p>
          <Button onClick={() => navigate('/perfil')}>
            Completar Perfil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-3xl text-seplag-dark">
          Abrir Ocorrência
        </h1>
        <p className="text-seplag-muted mt-2">
          Preencha os campos abaixo para registrar sua solicitação.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campos Base (OCOR01.01) */}
          <section>
            <h2 className="font-heading font-semibold text-lg text-seplag-dark mb-4">
              Informações do Serviço
            </h2>
            
            <div className="space-y-4">
              <Select
                label="Grupo de Serviço"
                required
                value={selectedAssunto}
                onChange={(e) => setSelectedAssunto(e.target.value)}
                options={assuntos.map(a => ({ value: a.id, label: a.nome }))}
                placeholder="Selecione o grupo..."
                error={errors.assunto}
              />

              <Select
                label="Tipo de Serviço"
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                options={portfolios.map(p => ({ value: p.id, label: p.nome }))}
                placeholder="Selecione o tipo..."
                disabled={!selectedAssunto}
              />

              <Select
                label="Serviço"
                required
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                options={services.map(s => ({ value: s.id, label: s.nome }))}
                placeholder="Selecione o serviço..."
                disabled={!selectedPortfolio}
                error={errors.service}
              />
            </div>
          </section>

          {/* Localização: Prédio + Andar */}
          <section>
            <h2 className="font-heading font-semibold text-lg text-seplag-dark mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Localização
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Prédio"
                required
                value={selectedPredio}
                onChange={(e) => setSelectedPredio(e.target.value)}
                options={predios.map(p => ({ value: p.id, label: p.nome }))}
                placeholder="Selecione o prédio..."
                error={errors.predio}
              />

              <Select
                label="Andar"
                required
                value={selectedAndar}
                onChange={(e) => setSelectedAndar(e.target.value)}
                options={andares.map(a => ({ value: a.id, label: a.nome }))}
                placeholder="Selecione o andar..."
                disabled={!selectedPredio}
                error={errors.andar}
              />
            </div>
          </section>

          {/* Campos Condicionais (OCOR01.01, OCOR01.02) */}
          {selectedService && (
            <section>
              <h2 className="font-heading font-semibold text-lg text-seplag-dark mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Detalhes da Solicitação
              </h2>

              {/* Campo para Temperatura (OCOR01.01 item 1) */}
              {isTemperatura && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <Thermometer className="h-8 w-8 text-seplag-secondary" />
                    <div className="flex-1">
                      <Input
                        label="Temperatura Desejada (°C)"
                        type="number"
                        required
                        min={20}
                        max={24}
                        step={0.1}
                        value={camposDinamicos.temperaturaDesejada || ''}
                        onChange={(e) => setCamposDinamicos(prev => ({
                          ...prev,
                          temperaturaDesejada: parseFloat(e.target.value),
                        }))}
                        error={errors.temperatura}
                        helpText="Valor entre 20°C e 24°C (aceita uma casa decimal)"
                      />
                    </div>
                  </div>
                  
                  <Textarea
                    label="Observações (opcional)"
                    value={camposDinamicos.descricao || ''}
                    onChange={(e) => setCamposDinamicos(prev => ({
                      ...prev,
                      descricao: e.target.value,
                    }))}
                    maxLength={2000}
                    showCount
                    placeholder="Informações adicionais..."
                  />
                </div>
              )}

              {/* Campos para Iluminação após 19h (OCOR01.01 item 2) */}
              {isIluminacao && podeVerIluminacao && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm text-yellow-800">
                      Este serviço é exclusivo para pontos focais autorizados.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Data de Início"
                      type="date"
                      required
                      value={camposDinamicos.dataInicio || ''}
                      onChange={(e) => setCamposDinamicos(prev => ({
                        ...prev,
                        dataInicio: e.target.value,
                      }))}
                      error={errors.dataInicio}
                    />
                    <Input
                      label="Data de Fim"
                      type="date"
                      required
                      value={camposDinamicos.dataFim || ''}
                      onChange={(e) => setCamposDinamicos(prev => ({
                        ...prev,
                        dataFim: e.target.value,
                      }))}
                      error={errors.dataFim}
                    />
                    <Input
                      label="Horário de Início"
                      type="time"
                      required
                      value={camposDinamicos.horarioInicio || ''}
                      onChange={(e) => setCamposDinamicos(prev => ({
                        ...prev,
                        horarioInicio: e.target.value,
                      }))}
                      error={errors.horarioInicio}
                    />
                    <Input
                      label="Horário de Término"
                      type="time"
                      required
                      value={camposDinamicos.horarioTermino || ''}
                      onChange={(e) => setCamposDinamicos(prev => ({
                        ...prev,
                        horarioTermino: e.target.value,
                      }))}
                      error={errors.horarioTermino}
                    />
                  </div>

                  <Textarea
                    label="Justificativa"
                    required
                    value={camposDinamicos.justificativa || ''}
                    onChange={(e) => setCamposDinamicos(prev => ({
                      ...prev,
                      justificativa: e.target.value,
                    }))}
                    maxLength={2000}
                    showCount
                    placeholder="Descreva o motivo da necessidade de iluminação após 19h..."
                    error={errors.justificativa}
                  />
                </div>
              )}

              {/* Campo de descrição livre para outros serviços (OCOR01.01 item 3) */}
              {!isTemperatura && !isIluminacao && (
                <Textarea
                  label="Descrição"
                  value={camposDinamicos.descricao || ''}
                  onChange={(e) => setCamposDinamicos(prev => ({
                    ...prev,
                    descricao: e.target.value,
                  }))}
                  maxLength={2000}
                  showCount
                  placeholder="Descreva detalhadamente sua solicitação..."
                  error={errors.descricao}
                />
              )}

              {/* Campo de Anexo (OCOR01.01 item 4) */}
              {possuiAnexo && (
                <div className="space-y-3">
                  <label className="label">Anexar Arquivo</label>
                  
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Clique para anexar</span> ou arraste os arquivos
                        </p>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG (máx. 10MB)</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>

                  {/* Lista de arquivos */}
                  {camposDinamicos.anexos && camposDinamicos.anexos.length > 0 && (
                    <div className="space-y-2">
                      {camposDinamicos.anexos.map((file, index) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                        >
                          <span className="text-sm text-seplag-dark truncate">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <X className="h-4 w-4 text-seplag-muted" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Dados do Solicitante */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-seplag-dark mb-3">Dados do Solicitante</h3>
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
          </section>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(-1)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
              disabled={!selectedService || !selectedPredio || !selectedAndar}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Abrir Ocorrência
            </Button>
          </div>
        </form>
      </Card>

      {/* Modal de Sucesso */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/consultas/minhas-ocorrencias');
        }}
        title="Ocorrência Registrada!"
        footer={
          <Button onClick={() => {
            setShowSuccessModal(false);
            navigate('/consultas/minhas-ocorrencias');
          }}>
            Ver Minhas Ocorrências
          </Button>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-seplag-dark">
            Sua ocorrência foi registrada com sucesso e será analisada pela equipe responsável.
          </p>
          <p className="text-sm text-seplag-muted mt-2">
            Você receberá atualizações por e-mail sobre o andamento.
          </p>
        </div>
      </Modal>
    </div>
  );
}
