import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context';
import { User, Save, Loader2, Camera, Lock, KeyRound } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser, changePassword } = useApp();
  
  // Profile Info State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await updateUser({ name, email, avatar });
        alert("Perfil atualizado com sucesso!");
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("A nova senha e a confirmação não coincidem.");
      return;
    }
    
    setIsPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      alert("Senha alterada com sucesso!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      console.error(e);
      alert("Erro ao alterar senha.");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="text-gray-500">Gerencie suas informações pessoais e segurança.</p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <User size={20} className="text-gray-500" />
                Dados Pessoais
              </h2>
            </div>
            <form onSubmit={handleProfileSubmit} className="p-6 space-y-6">
                
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                    <div 
                        className="relative group w-32 h-32 rounded-full border-4 border-gray-100 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden shadow-sm hover:border-accent transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                    >
                         {avatar ? (
                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                         ) : (
                            <User size={48} className="text-gray-300" />
                         )}
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                         </div>
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-sm font-medium text-accent hover:underline">
                        Alterar foto
                    </button>
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input 
                            type="text"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input 
                            type="email"
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-accent text-white rounded-md font-semibold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Salvar Dados
                    </button>
                </div>

            </form>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <KeyRound size={20} className="text-gray-500" />
                Alterar Senha
              </h2>
            </div>
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Senha Atual</label>
                    <div className="relative">
                        <input 
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                      <input 
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                      <input 
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                      />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <button 
                        type="submit"
                        disabled={isPasswordLoading}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-md font-semibold hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                    >
                        {isPasswordLoading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
                        Atualizar Senha
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}