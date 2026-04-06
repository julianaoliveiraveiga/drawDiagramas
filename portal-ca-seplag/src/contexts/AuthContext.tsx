import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '@/types';

// ============================================
// PRT01 - CONTEXTO DE AUTENTICAÇÃO E PERFIL
// ============================================

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  profileCheckedToday: boolean;
  login: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  checkProfileCompletion: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Campos obrigatórios do perfil (PRT01.01)
const REQUIRED_PROFILE_FIELDS: (keyof UserProfile)[] = [
  'nomeCompleto',
  'emailCorporativo',
  'orgaoSecretaria',
  'predio',
  'andar',
  'numeroEstacaoTrabalho',
  'masp',
  'cpf',
  'telefoneComercial',
  'celular',
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCheckedToday, setProfileCheckedToday] = useState(false);

  // Verificar se o perfil está completo (PRT01.01)
  const checkProfileCompletion = useCallback((): boolean => {
    if (!user) return false;
    
    return REQUIRED_PROFILE_FIELDS.every((field) => {
      const value = user[field];
      return value !== undefined && value !== null && value !== '';
    });
  }, [user]);

  const isProfileComplete = checkProfileCompletion();

  // Verificar primeiro acesso do dia (PRT01.02)
  const checkDailyLogin = useCallback(() => {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('lastProfileCheck');
    
    if (lastCheck !== today) {
      localStorage.setItem('lastProfileCheck', today);
      setProfileCheckedToday(false);
      return false;
    }
    
    setProfileCheckedToday(true);
    return true;
  }, []);

  // Simular login com Azure AD/SSO
  const login = async () => {
    setIsLoading(true);
    try {
      // TODO: Integrar com MSAL para Azure AD
      // Simulação de dados do usuário
      const mockUser: UserProfile = {
        id: '1',
        nomeCompleto: '',
        emailCorporativo: 'usuario@seplag.mg.gov.br',
        orgaoSecretaria: '',
        predio: '',
        andar: '',
        numeroEstacaoTrabalho: '',
        masp: '',
        cpf: '',
        telefoneComercial: '',
        celular: '',
        isProfileComplete: false,
        roles: ['usuario'],
      };
      
      setUser(mockUser);
      checkDailyLogin();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lastProfileCheck');
  };

  // Atualizar perfil (PRT01.03)
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    try {
      // TODO: Chamar API do Dataverse para atualizar perfil
      const updatedUser = { ...user, ...data };
      updatedUser.isProfileComplete = REQUIRED_PROFILE_FIELDS.every((field) => {
        const value = updatedUser[field];
        return value !== undefined && value !== null && value !== '';
      });
      
      setUser(updatedUser);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        // TODO: Verificar token MSAL
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          checkDailyLogin();
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [checkDailyLogin]);

  // Persistir usuário
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        isProfileComplete,
        profileCheckedToday,
        login,
        logout,
        updateProfile,
        checkProfileCompletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export { REQUIRED_PROFILE_FIELDS };
