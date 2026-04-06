import React from 'react';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, className = '', onClick, hoverable = false }: CardProps) {
  const baseClass = hoverable ? 'card-hover' : 'card';
  
  return (
    <div 
      className={`${baseClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

// Card de Ação para página inicial
interface ActionCardProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
  color?: 'primary' | 'secondary' | 'accent';
}

export function ActionCard({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  color = 'primary'
}: ActionCardProps) {
  const colorStyles = {
    primary: 'border-seplag-primary hover:bg-seplag-primary',
    secondary: 'border-seplag-secondary hover:bg-seplag-secondary',
    accent: 'border-seplag-accent hover:bg-seplag-accent',
  };

  return (
    <button
      onClick={onClick}
      className={`
        card-action group w-full text-left
        border-l-4 ${colorStyles[color]}
        hover:text-white transition-all duration-300
      `}
    >
      <div className="flex items-center space-x-4">
        <div className={`
          p-3 rounded-lg bg-seplag-${color} bg-opacity-10
          group-hover:bg-white group-hover:bg-opacity-20
          transition-colors
        `}>
          <Icon className={`h-8 w-8 text-seplag-${color} group-hover:text-white`} />
        </div>
        <div>
          <h3 className="font-heading font-semibold text-lg">{title}</h3>
          {description && (
            <p className="text-sm text-seplag-muted group-hover:text-white/80 mt-1">
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

// Card de Sala com foto
interface SalaCardProps {
  nome: string;
  foto?: string;
  capacidade: number;
  caracteristicas: string[];
  disponivel: boolean;
  onClick?: () => void;
}

export function SalaCard({ 
  nome, 
  foto, 
  capacidade, 
  caracteristicas, 
  disponivel,
  onClick 
}: SalaCardProps) {
  return (
    <div 
      className={`
        card overflow-hidden cursor-pointer
        ${disponivel ? 'hover:shadow-card-hover' : 'opacity-75'}
        transition-all duration-200
      `}
      onClick={disponivel ? onClick : undefined}
    >
      {/* Foto */}
      <div className="h-40 bg-gray-200 -mx-6 -mt-6 mb-4">
        {foto ? (
          <img src={foto} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            Sem imagem
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-heading font-semibold text-lg text-seplag-dark">
            {nome}
          </h3>
          <span className={`
            badge ${disponivel ? 'badge-success' : 'badge-danger'}
          `}>
            {disponivel ? 'Disponível' : 'Ocupado'}
          </span>
        </div>

        <p className="text-sm text-seplag-muted">
          Capacidade: {capacidade} pessoas
        </p>

        {caracteristicas.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {caracteristicas.slice(0, 3).map((carac, index) => (
              <span key={index} className="badge badge-info">
                {carac}
              </span>
            ))}
            {caracteristicas.length > 3 && (
              <span className="badge badge-muted">
                +{caracteristicas.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
