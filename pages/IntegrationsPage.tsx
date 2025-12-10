import React, { useState } from 'react';
import { useApp } from '../context';
import { Blocks, CheckCircle2, HardDrive, AlertCircle, X, Loader2, LogOut } from 'lucide-react';
import { Integration } from '../types';

export default function IntegrationsPage() {
  const { integrations, connectIntegration, disconnectIntegration } = useApp();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Connect Form State
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenConnect = (provider: string) => {
    setEmail('');
    setActiveModal(provider);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal || !email) return;

    setIsLoading(true);
    try {
        await connectIntegration(activeModal, email);
        setActiveModal(null);
        // Optional: Alert success
    } catch (err) {
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleDisconnect = (provider: string) => {
      if(window.confirm("Deseja realmente desconectar? O backup automático será pausado.")) {
          disconnectIntegration(provider);
      }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Blocks className="text-accent" />
          Integrações
        </h1>
        <p className="text-gray-500">Conecte o Obra360 com suas ferramentas favoritas.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <div 
            key={integration.id} 
            className={`bg-white rounded-xl border p-6 flex flex-col justify-between transition-shadow hover:shadow-md ${
                integration.connected ? 'border-green-200 shadow-sm' : 'border-gray-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-4">
                 <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                    {integration.provider === 'google_drive' ? (
                        <HardDrive size={24} className={integration.connected ? "text-green-600" : "text-gray-600"} />
                    ) : (
                        <Blocks size={24} className="text-gray-600" />
                    )}
                 </div>
                 {integration.connected && (
                     <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                         <CheckCircle2 size={12} />
                         Conectado
                     </span>
                 )}
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-2">{integration.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{integration.description}</p>
              
              {integration.connected && (
                  <div className="mb-6 p-3 bg-gray-50 rounded-lg text-xs border border-gray-100">
                      <p className="text-gray-500 mb-1">Conta vinculada:</p>
                      <p className="font-medium text-gray-900 truncate">{integration.connectedEmail}</p>
                      {integration.lastSync && (
                          <p className="text-gray-400 mt-2">Última sincronização: {new Date(integration.lastSync).toLocaleDateString()}</p>
                      )}
                  </div>
              )}
            </div>

            <div>
                {integration.connected ? (
                    <button 
                        onClick={() => handleDisconnect(integration.provider)}
                        className="w-full py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut size={16} />
                        Desconectar
                    </button>
                ) : (
                    <button 
                        onClick={() => handleOpenConnect(integration.provider)}
                        className="w-full py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition-colors"
                    >
                        Conectar
                    </button>
                )}
            </div>
          </div>
        ))}

        {/* Placeholder for future integrations */}
        <div className="rounded-xl border border-dashed border-gray-300 p-6 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                <Blocks size={24} className="text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900">Em breve</h3>
            <p className="text-sm text-gray-500 mt-1">Dropbox, OneDrive e mais.</p>
        </div>
      </div>

      {/* Connection Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {activeModal === 'google_drive' && <HardDrive size={18} />}
                        Conectar {integrations.find(i => i.provider === activeModal)?.name}
                    </h2>
                    <button onClick={() => setActiveModal(null)} disabled={isLoading}>
                        <X size={20} className="text-gray-400 hover:text-gray-600" />
                    </button>
                </div>
                
                <form onSubmit={handleConnect} className="p-6">
                    <div className="mb-4 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                        <AlertCircle className="text-blue-600 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-800">
                            Para ativar a integração, insira o e-mail da sua conta Google Drive abaixo.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail da conta Google</label>
                            <input 
                                required
                                type="email"
                                autoFocus
                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                                placeholder="exemplo@gmail.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button 
                                type="button" 
                                onClick={() => setActiveModal(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                disabled={isLoading}
                            >
                                Cancelar
                            </button>
                            <button 
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={16} /> : 'Conectar Conta'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}