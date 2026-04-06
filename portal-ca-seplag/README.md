# Portal CA SEPLAG

Portal web de Agendamentos e Ocorrências da SEPLAG, desenvolvido com React + TypeScript + Vite, integrado com Microsoft Dataverse.

## 🚀 Funcionalidades

### Telas Gerais (PRT)
- **PRT01 - Validação de Perfil Obrigatório**: Impede que usuários com perfil incompleto iniciem fluxos de agendamento ou ocorrência
- **PRT02 - Administração de Conteúdo via Dataverse**: Notificações e banners gerenciáveis pelo cliente
- **PRT03 - Identidade Visual Institucional**: Design system alinhado com a identidade visual da SEPLAG

### Sistema de Agendamentos (AGD)
- **AGD01.01** - Página unificada de agendamento para todos os tipos (Coworking, Salas, Auditórios)
- **AGD01.02** - Exibição dinâmica de campos baseada em configuração do Dataverse
- **AGD01.04** - Filtros avançados (Tipo de Serviço, Data, Local - Gerais/Minas)
- **AGD01.05** - Calendário de disponibilidade com slots coloridos
- **AGD01.06** - Suporte a junção de salas
- **AGD01.08** - Visualização de bloqueios de gestor

### Sistema de Ocorrências (OCOR)
- **OCOR01.01** - Formulário dinâmico com campos condicionais por serviço
  - Temperatura: 20-24°C com validação
  - Iluminação após 19h: restrito para pontos focais
  - Anexos: apenas para serviços configurados
- **OCOR01.02** - Localização com typeahead otimizado (Custom API)
- **OCOR01.03** - Filtros por órgão, prédio, andar, tipo de serviço, fornecedor

### Consultas (CON)
- **CON01.02** - Meus Agendamentos (Hoje, Próximos, Passados)
- Funcionalidade "Reservar Novamente"
- Consultar Vagas, Auditórios, Emissão CIN

## 📦 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Estilização**: Tailwind CSS
- **Roteamento**: React Router v6
- **Formulários**: React Hook Form
- **Estado Global**: Zustand
- **Autenticação**: MSAL (Azure AD)
- **Backend**: Microsoft Dataverse + Power Automate + Custom APIs (C#)

## 🛠️ Instalação

```bash
# Instalar dependências
npm install

# Copiar variáveis de ambiente
cp .env.example .env

# Editar variáveis de ambiente com suas configurações
nano .env

# Rodar em desenvolvimento
npm run dev

# Build de produção
npm run build
```

## 📁 Estrutura do Projeto

```
portal-ca-seplag/
├── src/
│   ├── components/
│   │   ├── layout/        # Header, Footer, Layout
│   │   ├── ui/            # Componentes reutilizáveis
│   │   ├── agendamento/   # Componentes de agendamento
│   │   ├── ocorrencia/    # Componentes de ocorrência
│   │   ├── consultas/     # Componentes de consultas
│   │   └── perfil/        # Componentes de perfil
│   ├── contexts/          # Contextos React (Auth, Notificações)
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Páginas da aplicação
│   ├── services/          # Serviços de API
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Funções utilitárias
│   └── styles/            # Estilos globais
├── public/
│   └── images/            # Imagens estáticas
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🔗 Integrações

### Dataverse (Microsoft Power Platform)

Entidades utilizadas:
- **cr_assuntos** - Grupos de Serviço
- **cr_portfolioservicos** - Tipos de Serviço
- **cr_services** - Serviços
- **cr_instalacaoequipamentos** - Salas/Instalações
- **cr_locais** - Localizações
- **cr_juncaosalas** - Junções de Salas
- **cr_agendamentos** - Agendamentos
- **cr_ocorrencias** - Ocorrências
- **cr_notificacoesportal** - Notificações

### Power Automate

Fluxos configuráveis por ambiente:
- Buscar Disponibilidade
- Criar Agendamento
- Cancelar Agendamento
- Criar Ocorrência
- Buscar Localizações

### Custom APIs (C#)

Para operações de alta performance:
- Busca de localizações com typeahead (1000+ registros)
- Upload de anexos
- Operações complexas de agendamento

## 🎨 Design System

### Cores Institucionais SEPLAG

| Nome | Hex | Uso |
|------|-----|-----|
| Primary | `#003366` | Elementos principais, header |
| Secondary | `#0066CC` | Botões secundários, links |
| Accent | `#00A859` | Destaques, sucesso |
| Warning | `#FFC107` | Alertas |
| Danger | `#DC3545` | Erros, cancelamento |

### Slots de Disponibilidade

- 🟢 **Verde** (`#28A745`): Disponível
- 🔴 **Vermelho** (`#DC3545`): Ocupado
- ⚫ **Cinza** (`#6C757D`): Indisponível/Bloqueado

## 📝 Variáveis de Ambiente

Veja `.env.example` para todas as variáveis necessárias.

As URLs do Power Automate são configuráveis por ambiente, permitindo alterações sem modificar código.

## 🔐 Autenticação

O portal utiliza Azure AD para autenticação SSO. Configure os seguintes valores:

- `VITE_AZURE_CLIENT_ID`: ID do aplicativo registrado no Azure AD
- `VITE_AZURE_TENANT_ID`: ID do tenant da organização
- `VITE_AZURE_REDIRECT_URI`: URL de redirecionamento após login

## 📄 Licença

Propriedade da SEPLAG - Secretaria de Estado de Planejamento e Gestão de Minas Gerais.
