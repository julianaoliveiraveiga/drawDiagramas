import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, REQUIRED_PROFILE_FIELDS } from '@/contexts/AuthContext';
import { Input, Button, Select, Card, AlertBanner } from '@/components/ui';
import type { UserProfile } from '@/types';

// ============================================
// PRT01 - TELA DE PERFIL DO USUÁRIO
// ============================================

type ProfileFormData = Omit<UserProfile, 'id' | 'isProfileComplete' | 'lastLoginDate' | 'roles'>;

// Opções de órgãos/secretarias (exemplo)
const orgaosOptions = [
  { value: 'SEPLAG', label: 'SEPLAG - Secretaria de Planejamento e Gestão' },
  { value: 'SEF', label: 'SEF - Secretaria de Estado de Fazenda' },
  { value: 'SEE', label: 'SEE - Secretaria de Estado de Educação' },
  { value: 'SES', label: 'SES - Secretaria de Estado de Saúde' },
  { value: 'SEINFRA', label: 'SEINFRA - Secretaria de Estado de Infraestrutura' },
];

// Opções de prédios (exemplo)
const prediosOptions = [
  { value: 'CIDADE_ADM', label: 'Cidade Administrativa' },
  { value: 'PREDIO_MINAS', label: 'Prédio Minas' },
  { value: 'PREDIO_GERAIS', label: 'Prédio Gerais' },
];

// Opções de andares
const andaresOptions = Array.from({ length: 20 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}º Andar`,
}));

export function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, isProfileComplete } = useAuth();
  
  const showAlert = location.state?.showAlert;
  const alertMessage = location.state?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm<ProfileFormData>({
    defaultValues: {
      nomeCompleto: user?.nomeCompleto || '',
      emailCorporativo: user?.emailCorporativo || '',
      orgaoSecretaria: user?.orgaoSecretaria || '',
      predio: user?.predio || '',
      andar: user?.andar || '',
      numeroEstacaoTrabalho: user?.numeroEstacaoTrabalho || '',
      masp: user?.masp || '',
      cpf: user?.cpf || '',
      telefoneComercial: user?.telefoneComercial || '',
      celular: user?.celular || '',
    },
  });

  const formValues = watch();

  // Verificar se todos os campos obrigatórios estão preenchidos (PRT01.03)
  const canSave = REQUIRED_PROFILE_FIELDS.every((field) => {
    const value = formValues[field as keyof ProfileFormData];
    return value !== undefined && value !== null && value !== '';
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile(data);
      navigate('/');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  // Formatação de CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Formatação de telefone
  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Alerta de perfil incompleto */}
      {showAlert && alertMessage && (
        <div className="mb-6">
          <AlertBanner
            type="warning"
            message={alertMessage}
          />
        </div>
      )}

      <Card>
        <div className="mb-6">
          <h1 className="font-heading font-bold text-2xl text-seplag-dark">
            Meu Perfil
          </h1>
          <p className="text-seplag-muted mt-1">
            {isProfileComplete 
              ? 'Mantenha seus dados atualizados.'
              : 'Complete todos os campos obrigatórios para utilizar os serviços do portal.'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <section>
            <h2 className="font-heading font-semibold text-lg text-seplag-dark mb-4">
              Dados Pessoais
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Nome Completo"
                  required
                  {...register('nomeCompleto', { 
                    required: 'Nome completo é obrigatório' 
                  })}
                  error={errors.nomeCompleto?.message}
                />
              </div>

              <Input
                label="CPF"
                required
                placeholder="000.000.000-00"
                {...register('cpf', {
                  required: 'CPF é obrigatório',
                  pattern: {
                    value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                    message: 'CPF inválido',
                  },
                })}
                onChange={(e) => {
                  e.target.value = formatCPF(e.target.value);
                }}
                error={errors.cpf?.message}
              />

              <Input
                label="MASP"
                required
                {...register('masp', { 
                  required: 'MASP é obrigatório' 
                })}
                error={errors.masp?.message}
              />
            </div>
          </section>

          {/* Dados de Contato */}
          <section>
            <h2 className="font-heading font-semibold text-lg text-seplag-dark mb-4">
              Dados de Contato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="E-mail Corporativo"
                  type="email"
                  required
                  {...register('emailCorporativo', {
                    required: 'E-mail é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'E-mail inválido',
                    },
                  })}
                  error={errors.emailCorporativo?.message}
                />
              </div>

              <Input
                label="Telefone Comercial"
                required
                placeholder="(00) 00000-0000"
                {...register('telefoneComercial', {
                  required: 'Telefone comercial é obrigatório',
                })}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value);
                }}
                error={errors.telefoneComercial?.message}
              />

              <Input
                label="Celular"
                required
                placeholder="(00) 00000-0000"
                {...register('celular', {
                  required: 'Celular é obrigatório',
                })}
                onChange={(e) => {
                  e.target.value = formatPhone(e.target.value);
                }}
                error={errors.celular?.message}
              />
            </div>
          </section>

          {/* Dados de Localização */}
          <section>
            <h2 className="font-heading font-semibold text-lg text-seplag-dark mb-4">
              Localização
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Select
                  label="Órgão/Secretaria"
                  required
                  options={orgaosOptions}
                  {...register('orgaoSecretaria', {
                    required: 'Órgão/Secretaria é obrigatório',
                  })}
                  error={errors.orgaoSecretaria?.message}
                />
              </div>

              <Select
                label="Prédio"
                required
                options={prediosOptions}
                {...register('predio', {
                  required: 'Prédio é obrigatório',
                })}
                error={errors.predio?.message}
              />

              <Select
                label="Andar"
                required
                options={andaresOptions}
                {...register('andar', {
                  required: 'Andar é obrigatório',
                })}
                error={errors.andar?.message}
              />

              <div className="md:col-span-2">
                <Input
                  label="Número da Estação de Trabalho"
                  required
                  {...register('numeroEstacaoTrabalho', {
                    required: 'Número da estação é obrigatório',
                  })}
                  error={errors.numeroEstacaoTrabalho?.message}
                />
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
              disabled={!canSave || !isDirty}
            >
              Salvar Perfil
            </Button>
          </div>

          {/* Mensagem de campos obrigatórios */}
          {!canSave && (
            <p className="text-sm text-seplag-danger text-center">
              * Preencha todos os campos obrigatórios para salvar
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}
