import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context';
import { LayoutDashboard, Mail, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { recoverPassword } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await recoverPassword(email);
      setIsSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Erro ao processar solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 animate-in fade-in zoom-in duration-300">
        
        {!isSuccess ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-50 text-accent mb-4">
                <LayoutDashboard size={24} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Recuperar Senha</h1>
              <p className="text-gray-500 mt-2">Digite seu e-mail para receber as instruções.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Cadastrado</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent outline-none bg-white text-gray-900"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-accent text-white rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Enviar Link de Recuperação'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
             <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 animate-in zoom-in">
               <CheckCircle2 size={32} />
             </div>
             <h2 className="text-xl font-bold text-gray-900 mb-2">Email Enviado!</h2>
             <p className="text-gray-600 mb-6">
               Enviamos instruções de recuperação para <strong>{email}</strong>. Por favor, verifique sua caixa de entrada (e spam).
             </p>
             <p className="text-xs text-gray-400">
               Nota: Como este é um ambiente de demonstração, nenhuma mensagem real foi enviada, mas o fluxo foi simulado com sucesso.
             </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} />
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}