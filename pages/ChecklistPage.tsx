import React, { useMemo } from 'react';
import { useApp } from '../context';
import { CheckCircle2, Circle, ClipboardCheck, AlertTriangle } from 'lucide-react';
import { ChecklistItem } from '../types';

export default function ChecklistPage() {
  const { checklist, toggleCheckItem } = useApp();

  // Group items by category
  const groupedItems = useMemo(() => {
    return checklist.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, ChecklistItem[]>);
  }, [checklist]);

  // Statistics
  const totalItems = checklist.length;
  const completedItems = checklist.filter(i => i.completed).length;
  const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardCheck className="text-accent" />
            Checklist de Qualidade
          </h1>
          <p className="text-gray-500">Verifique os itens essenciais para garantir a qualidade da obra.</p>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">Progresso Geral</span>
          <span className="text-sm font-bold text-accent">{progressPercentage}% Concluído</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3">
          <div 
            className="bg-accent h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
             <CheckCircle2 size={16} className="text-green-500" />
             <span>{completedItems} Feitos</span>
          </div>
          <div className="flex items-center gap-1">
             <Circle size={16} className="text-gray-400" />
             <span>{totalItems - completedItems} Pendentes</span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="text-yellow-600 shrink-0 mt-0.5" size={20} />
        <div className="text-sm text-yellow-800">
          <span className="font-semibold">Dica Importante:</span> Não pule etapas! A verificação preventiva de impermeabilização e instalações evita retrabalhos custosos e patologias futuras na construção.
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {Object.entries(groupedItems).map(([category, items]: [string, ChecklistItem[]]) => {
            const categoryCompleted = items.every(i => i.completed);
            
            return (
                <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-bold text-gray-800">{category}</h2>
                        {categoryCompleted && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                Completo
                            </span>
                        )}
                    </div>
                    <div className="divide-y divide-gray-100">
                        {items.map((item) => (
                            <div 
                                key={item.id} 
                                onClick={() => toggleCheckItem(item.id)}
                                className={`px-6 py-4 flex items-start gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${item.completed ? 'bg-gray-50/50' : ''}`}
                            >
                                <div className={`mt-0.5 shrink-0 transition-colors ${item.completed ? 'text-green-500' : 'text-gray-300'}`}>
                                    {item.completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                </div>
                                <div className={item.completed ? 'opacity-50 line-through transition-opacity' : ''}>
                                    <p className="text-gray-900 font-medium">{item.task}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
}