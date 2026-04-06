import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-seplag-dark text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Portal CA - SEPLAG</h3>
            <p className="text-gray-400 text-sm">
              Sistema de Agendamentos e Ocorrências da Secretaria de Estado de 
              Planejamento e Gestão de Minas Gerais.
            </p>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Links Úteis</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.planejamento.mg.gov.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-seplag-accent transition-colors"
                >
                  Site SEPLAG
                </a>
              </li>
              <li>
                <a 
                  href="https://www.mg.gov.br" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-seplag-accent transition-colors"
                >
                  Portal MG
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Suporte</h3>
            <p className="text-gray-400 text-sm">
              Em caso de dúvidas ou problemas, entre em contato com o suporte técnico.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              📧 suporte@seplag.mg.gov.br
            </p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} SEPLAG - Secretaria de Estado de Planejamento e Gestão</p>
          <p className="mt-1">Governo de Minas Gerais</p>
        </div>
      </div>
    </footer>
  );
}
