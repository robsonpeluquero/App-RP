import React, { useEffect, useState } from 'react';
import { Download, Clock, AlertTriangle, X, RefreshCw } from 'lucide-react';

export default function UpdateManager() {
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTimer, setScheduleTimer] = useState<number | null>(null);

  // Registra o Service Worker e monitora atualizações
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        
        // Se já existe um worker esperando (baixado mas não ativo)
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowPrompt(true);
        }

        // Monitora novas instalações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nova atualização disponível e instalada em background
                setWaitingWorker(newWorker);
                if (!isScheduled) {
                    setShowPrompt(true);
                }
              }
            });
          }
        });
      });

      // Recarrega a página quando o novo SW assumir o controle
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          window.location.reload();
          refreshing = true;
        }
      });
    }
  }, [isScheduled]);

  const updateNow = () => {
    if (waitingWorker) {
      // Envia mensagem para o SW pular a espera e ativar
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setShowPrompt(false);
    }
  };

  const scheduleUpdate = (minutes: number) => {
    setIsScheduled(true);
    setShowPrompt(false);
    
    // Mostra um feedback rápido (opcional, aqui usando console ou state visual futuro)
    console.log(`Atualização agendada para ${minutes} minutos.`);

    const timer = window.setTimeout(() => {
      updateNow();
    }, minutes * 60 * 1000);

    setScheduleTimer(timer);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom duration-300">
        
        <div className="bg-accent px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 text-white">
            <RefreshCw className="animate-spin-slow" size={24} />
            <h3 className="font-bold text-lg">Atualização Disponível</h3>
          </div>
          <button 
            onClick={() => setShowPrompt(false)} 
            className="text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 bg-blue-50 text-blue-800 p-3 rounded-lg text-sm flex gap-3 items-start">
             <AlertTriangle className="shrink-0 mt-0.5" size={16} />
             <p>
               Uma nova versão do <strong>Obra360</strong> foi baixada. Seus dados salvos (orçamentos e materiais) <strong>não serão apagados</strong>.
             </p>
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            Deseja aplicar a atualização agora para receber as melhorias, ou prefere agendar para mais tarde?
          </p>

          <div className="space-y-3">
            <button 
              onClick={updateNow}
              className="w-full py-3 bg-accent text-white rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Download size={18} />
              Atualizar Agora
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-white text-xs text-gray-500">ou agendar automaticamente</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => scheduleUpdate(30)}
                className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Clock size={16} />
                Em 30 min
              </button>
              <button 
                onClick={() => scheduleUpdate(60)}
                className="py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Clock size={16} />
                Em 1 hora
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}