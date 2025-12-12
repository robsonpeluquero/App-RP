import React, { useState } from 'react';
import { useApp } from '../context';
import { User, Shield, UserPlus, Trash2, Mail, Users, X, Loader2, Check, Pencil } from 'lucide-react';
import { UserRole } from '../types';

export default function UsersPage() {
  const { user, allUsers, addNewUser, editUser, deleteUser, askConfirmation, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('collaborator');

  // Authorization Check
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg border border-red-200 mt-10 max-w-2xl mx-auto">
        <Shield size={48} className="mx-auto mb-4" />
        <h2 className="text-xl font-bold">Acesso Negado</h2>
        <p>Você não tem permissão para gerenciar usuários.</p>
      </div>
    );
  }

  const handleOpenModal = (userToEdit?: any) => {
    if (userToEdit) {
        setEditingUserId(userToEdit.id);
        setName(userToEdit.name);
        setEmail(userToEdit.email);
        setRole(userToEdit.role);
        setPassword(''); // Don't show password, leave blank to keep current
    } else {
        setEditingUserId(null);
        setName('');
        setEmail('');
        setRole('collaborator');
        setPassword('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!editingUserId && password.length < 6) {
      showToast('error', 'Senha fraca', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    
    setIsLoading(true);
    try {
      if (editingUserId) {
          // Editing existing user
          const existingUser = allUsers.find(u => u.id === editingUserId);
          if (!existingUser) throw new Error("Usuário não encontrado.");

          await editUser({
              ...existingUser,
              name,
              email,
              role,
              // Only update password if provided
              ...(password ? { password } : {})
          });
          showToast('success', 'Usuário atualizado', 'As informações foram salvas com sucesso.');
      } else {
          // Adding new user
          await addNewUser({
            name,
            email,
            password,
            role,
            avatar: ''
          });
          showToast('success', 'Usuário criado', 'O novo usuário foi adicionado com sucesso.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Erro', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (targetId: string, targetName: string) => {
    if (targetId === user.id) {
      showToast('error', 'Ação inválida', 'Você não pode excluir sua própria conta aqui.');
      return;
    }

    askConfirmation({
      title: 'Excluir Usuário',
      message: `Tem certeza que deseja remover ${targetName} do sistema?`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUser(targetId);
          showToast('success', 'Usuário excluído', 'Acesso revogado com sucesso.');
        } catch (err: any) {
          showToast('error', 'Erro', err.message);
        }
      }
    });
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"><Shield size={12}/> Administrador</span>;
      case 'manager':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Users size={12}/> Gerente</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Colaborador</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="text-accent" />
            Gestão de Usuários
          </h1>
          <p className="text-gray-500">Adicione e gerencie os membros da equipe.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm font-medium"
        >
          <UserPlus size={18} className="mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
            <tr>
              <th className="px-6 py-3">Usuário</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Função</th>
              <th className="px-6 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {allUsers.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden text-gray-500">
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : <Users size={16} />}
                  </div>
                  {u.name} {u.id === user.id && <span className="text-xs text-gray-400">(Você)</span>}
                </td>
                <td className="px-6 py-4 text-gray-500">{u.email}</td>
                <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleOpenModal(u)}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-2"
                            title="Editar Usuário"
                        >
                            <Pencil size={18} />
                        </button>
                        {u.id !== user.id && (
                            <button 
                            onClick={() => handleDelete(u.id, u.name)}
                            className="text-gray-400 hover:text-red-600 transition-colors p-2"
                            title="Remover Usuário"
                            >
                            <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit User */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingUserId ? 'Editar Usuário' : 'Adicionar Usuário'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input 
                  required
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={16} />
                  <input 
                    required
                    type="email"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingUserId ? 'Nova Senha (Opcional)' : 'Senha Inicial'}
                </label>
                <input 
                  type="password"
                  placeholder={editingUserId ? "Deixe em branco para manter" : "Mínimo 6 caracteres"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required={!editingUserId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Função</label>
                <div className="grid grid-cols-3 gap-2">
                   <button 
                     type="button"
                     onClick={() => setRole('collaborator')}
                     className={`py-2 px-1 text-xs sm:text-sm rounded-md border text-center transition-colors ${role === 'collaborator' ? 'bg-blue-50 border-accent text-accent font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                   >
                     Colaborador
                   </button>
                   <button 
                     type="button"
                     onClick={() => setRole('manager')}
                     className={`py-2 px-1 text-xs sm:text-sm rounded-md border text-center transition-colors ${role === 'manager' ? 'bg-blue-50 border-accent text-accent font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                   >
                     Gerente
                   </button>
                   {user?.role === 'admin' && (
                     <button 
                       type="button"
                       onClick={() => setRole('admin')}
                       className={`py-2 px-1 text-xs sm:text-sm rounded-md border text-center transition-colors ${role === 'admin' ? 'bg-blue-50 border-accent text-accent font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                     >
                       Admin
                     </button>
                   )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {role === 'collaborator' && "Pode ver e editar dados, mas não gerencia usuários."}
                  {role === 'manager' && "Pode gerenciar usuários e dados do sistema."}
                  {role === 'admin' && "Acesso total ao sistema."}
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-accent rounded-md hover:bg-blue-700 shadow-sm flex items-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  {editingUserId ? 'Salvar Alterações' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}