import React, { useState, useRef } from 'react';
import { useApp } from '../context';
import { 
    Ruler, FileWarning, Plus, Camera, Trash2, Calendar, 
    Clock, DollarSign, X, CheckCircle, AlertCircle, Image as ImageIcon 
} from 'lucide-react';
import { Measurement, Addition } from '../types';

type Tab = 'medicoes' | 'aditivos';

export default function MeasurementsPage() {
    const { measurements, additions, addMeasurement, deleteMeasurement, addAddition, deleteAddition, updateAddition } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('medicoes');

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Ruler className="text-accent" />
                    Medições e Aditivos
                </h1>
                <p className="text-gray-500">Acompanhamento físico da obra e controle de alterações de escopo.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('medicoes')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'medicoes' 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Medições Físicas
                </button>
                <button
                    onClick={() => setActiveTab('aditivos')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === 'aditivos' 
                            ? 'bg-white text-gray-900 shadow-sm' 
                            : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    Aditivos de Contrato
                </button>
            </div>

            {activeTab === 'medicoes' ? (
                <MeasurementsView measurements={measurements} onAdd={addMeasurement} onDelete={deleteMeasurement} />
            ) : (
                <AdditionsView additions={additions} onAdd={addAddition} onDelete={deleteAddition} onUpdate={updateAddition} />
            )}
        </div>
    );
}

// --- Sub-components for Measurements ---

function MeasurementsView({ measurements, onAdd, onDelete }: { 
    measurements: Measurement[], 
    onAdd: (m: Measurement) => void,
    onDelete: (id: string) => void 
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New Form State
    const [stage, setStage] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [percentage, setPercentage] = useState<number>(0);
    const [desc, setDesc] = useState('');
    const [photos, setPhotos] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files) {
            Array.from(files).forEach((file: File) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPhotos(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMeasurement: Measurement = {
            id: Math.random().toString(36).substr(2, 9),
            stage,
            date,
            percentage,
            description: desc,
            photos
        };
        onAdd(newMeasurement);
        setIsModalOpen(false);
        // Reset
        setStage('');
        setPhotos([]);
        setPercentage(0);
        setDesc('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} /> Nova Medição
                </button>
            </div>

            {measurements.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                    <Ruler size={48} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500">Nenhuma medição registrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {measurements.map(m => (
                        <div key={m.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50">
                                <div>
                                    <h3 className="font-bold text-gray-900">{m.stage}</h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                        <Calendar size={14} />
                                        {new Date(m.date).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onDelete(m.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            
                            <div className="p-4 space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-gray-700">Progresso</span>
                                        <span className="font-bold text-accent">{m.percentage}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div 
                                            className="bg-accent h-2 rounded-full" 
                                            style={{ width: `${m.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    {m.description || "Sem observações."}
                                </p>

                                {/* Photo Gallery */}
                                {m.photos.length > 0 && (
                                    <div>
                                        <span className="text-xs font-semibold text-gray-500 mb-2 block">Evidências Fotográficas</span>
                                        <div className="grid grid-cols-4 gap-2">
                                            {m.photos.map((photo, idx) => (
                                                <div key={idx} className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                                    <img src={photo} alt="Evidência" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Registrar Medição</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Etapa da Obra *</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                    placeholder="Ex: Alvenaria 1º Pavimento" 
                                    value={stage} 
                                    onChange={e => setStage(e.target.value)} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                                    <input 
                                        required 
                                        type="date" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                        value={date} 
                                        onChange={e => setDate(e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Progresso (%) *</label>
                                    <input 
                                        required 
                                        type="number" 
                                        min="0" 
                                        max="100" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                        value={percentage} 
                                        onChange={e => setPercentage(Number(e.target.value))} 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Avanço</label>
                                <textarea 
                                    rows={3} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                    placeholder="Descreva o que foi realizado..." 
                                    value={desc} 
                                    onChange={e => setDesc(e.target.value)} 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                    {photos.map((p, i) => (
                                        <div key={i} className="relative aspect-square rounded-md overflow-hidden border group">
                                            <img src={p} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-accent hover:text-accent transition-colors">
                                        <Camera size={20} />
                                        <span className="text-xs mt-1">Add</span>
                                    </button>
                                </div>
                                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            </div>

                            <button type="submit" className="w-full py-2 bg-accent text-white rounded-md font-semibold hover:bg-blue-700">Salvar Medição</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- Sub-components for Additions ---

function AdditionsView({ additions, onAdd, onDelete, onUpdate }: { 
    additions: Addition[], 
    onAdd: (a: Addition) => void,
    onDelete: (id: string) => void,
    onUpdate: (a: Addition) => void
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [reason, setReason] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [cost, setCost] = useState<number>(0);
    const [days, setDays] = useState<number>(0);

    const totalCost = additions.reduce((acc, a) => acc + (a.status !== 'rejected' ? a.costImpact : 0), 0);
    const totalDays = additions.reduce((acc, a) => acc + (a.status !== 'rejected' ? a.timeImpact : 0), 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAddition: Addition = {
            id: Math.random().toString(36).substr(2, 9),
            reason,
            date,
            costImpact: cost,
            timeImpact: days,
            status: 'pending'
        };
        onAdd(newAddition);
        setIsModalOpen(false);
        setReason(''); setCost(0); setDays(0);
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Impacto Financeiro Total</p>
                        <p className="text-2xl font-bold text-red-600">
                            + {totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-full"><DollarSign size={24} /></div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500">Impacto no Cronograma</p>
                        <p className="text-2xl font-bold text-orange-600">+ {totalDays} Dias</p>
                    </div>
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><Clock size={24} /></div>
                </div>
            </div>

            <div className="flex justify-end">
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    <FileWarning size={18} /> Novo Aditivo
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3">Data</th>
                            <th className="px-6 py-3">Motivo / Alteração de Escopo</th>
                            <th className="px-6 py-3 text-right text-red-600">Custo Extra</th>
                            <th className="px-6 py-3 text-right text-orange-600">Prazo Extra</th>
                            <th className="px-6 py-3 text-center">Status</th>
                            <th className="px-6 py-3 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {additions.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-gray-500">Nenhum aditivo registrado.</td></tr>
                        ) : (
                            additions.map(a => (
                                <tr key={a.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 text-gray-500">{new Date(a.date).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-6 py-3 font-medium text-gray-900">{a.reason}</td>
                                    <td className="px-6 py-3 text-right font-medium text-red-600">
                                        {a.costImpact.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </td>
                                    <td className="px-6 py-3 text-right text-orange-600 font-medium">{a.timeImpact} dias</td>
                                    <td className="px-6 py-3 text-center">
                                        <button 
                                            onClick={() => onUpdate({ ...a, status: a.status === 'pending' ? 'approved' : a.status === 'approved' ? 'rejected' : 'pending' })}
                                            className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                                                a.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' :
                                                a.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}
                                        >
                                            {a.status === 'approved' ? 'Aprovado' : a.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-3">
                                        <button onClick={() => onDelete(a.id)} className="text-gray-400 hover:text-red-500">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="text-lg font-semibold text-gray-900">Relatório de Aditivo</h2>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo da Alteração *</label>
                                <textarea 
                                    required 
                                    rows={3} 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                    placeholder="Justificativa técnica para o aditivo..." 
                                    value={reason} 
                                    onChange={e => setReason(e.target.value)} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Solicitação</label>
                                <input 
                                    required 
                                    type="date" 
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                    value={date} 
                                    onChange={e => setDate(e.target.value)} 
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custo Extra (R$)</label>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        step="0.01" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                        value={cost} 
                                        onChange={e => setCost(Number(e.target.value))} 
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prazo Extra (Dias)</label>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none" 
                                        value={days} 
                                        onChange={e => setDays(Number(e.target.value))} 
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700">Gerar Aditivo</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}