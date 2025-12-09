import React, { useState } from 'react';
import { Calculator, BrickWall, Grid3X3, Droplet, ArrowRight, RotateCcw, Hammer } from 'lucide-react';

type CalculatorType = 'tijolos' | 'pisos' | 'pintura' | 'mao_de_obra';
type LaborType = 'diaria' | 'empreita';

export default function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<CalculatorType>('tijolos');
  
  // Common State
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0); // Or length
  const [wasteMargin, setWasteMargin] = useState<number>(10); // Percentage

  // Specific State - Materials
  const [tileWidth, setTileWidth] = useState<number>(60); // cm
  const [tileHeight, setTileHeight] = useState<number>(60); // cm
  const [coats, setCoats] = useState<number>(2); // Paint coats

  // Specific State - Labor
  const [laborType, setLaborType] = useState<LaborType>('diaria');
  const [workers, setWorkers] = useState<number>(1);
  const [days, setDays] = useState<number>(1);
  const [dailyRate, setDailyRate] = useState<number>(150); // BRL
  const [contractPrice, setContractPrice] = useState<number>(50); // BRL per m2

  const [result, setResult] = useState<{ main: string; sub: string } | null>(null);

  const handleCalculate = () => {
    // Special case for Labor - Daily Rate (doesn't need area)
    if (activeTab === 'mao_de_obra' && laborType === 'diaria') {
      if (workers <= 0 || days <= 0 || dailyRate <= 0) {
        alert("Por favor, preencha todos os campos com valores positivos.");
        return;
      }
      const total = workers * days * dailyRate;
      setResult({
        main: total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        sub: `Custo estimado para ${workers} profissional(is) trabalhando por ${days} dia(s).`
      });
      return;
    }

    // Area based calculations
    const area = width * height;
    if (area <= 0) {
      alert("Por favor, insira dimensões válidas maiores que zero.");
      return;
    }

    let mainResult = "";
    let subResult = "";

    if (activeTab === 'tijolos') {
      // Logic: Standard brick 19x19x9 or similar. Approx 25 bricks per m² usually covers mortar spacing.
      const bricksPerM2 = 25; 
      const totalBricks = Math.ceil(area * bricksPerM2 * (1 + wasteMargin / 100));
      
      mainResult = `${totalBricks} Tijolos`;
      subResult = `Baseado em área de ${area.toFixed(2)}m² (aprox. 25/m²) com ${wasteMargin}% de perda.`;
    } 
    else if (activeTab === 'pisos') {
      // Logic: Area / TileArea
      const tileAreaM2 = (tileWidth / 100) * (tileHeight / 100);
      if (tileAreaM2 <= 0) return;

      const areaWithMargin = area * (1 + wasteMargin / 100);
      const totalTiles = Math.ceil(areaWithMargin / tileAreaM2);
      const totalM2Needed = areaWithMargin.toFixed(2);

      mainResult = `${totalTiles} Peças`;
      subResult = `Equivalente a ${totalM2Needed}m² (incluindo ${wasteMargin}% de quebra). Tamanho: ${tileWidth}x${tileHeight}cm.`;
    } 
    else if (activeTab === 'pintura') {
      // Logic: Area * Coats / Yield (Rendimento). Avg latex paint yields ~10m² per liter per coat.
      const coveragePerLiter = 10; 
      const totalLiters = (area * coats) / coveragePerLiter;
      
      mainResult = `${totalLiters.toFixed(1)} Litros`;
      subResult = `Para cobrir ${area.toFixed(2)}m² com ${coats} demão(s). Rendimento est.: 10m²/L.`;
    }
    else if (activeTab === 'mao_de_obra' && laborType === 'empreita') {
      const total = area * contractPrice;
      mainResult = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      subResult = `Custo por empreita para ${area.toFixed(2)}m² a ${contractPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}/m².`;
    }

    setResult({ main: mainResult, sub: subResult });
  };

  const resetForm = () => {
    setWidth(0);
    setHeight(0);
    setResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="text-accent" />
          Calculadora de Materiais
        </h1>
        <p className="text-gray-500">Estime a quantidade de materiais e custos de mão de obra.</p>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        <button
          onClick={() => { setActiveTab('tijolos'); resetForm(); }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            activeTab === 'tijolos' 
              ? 'bg-blue-50 border-accent text-accent shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <BrickWall size={20} />
          <span className="font-medium text-sm">Alvenaria</span>
        </button>

        <button
          onClick={() => { setActiveTab('pisos'); resetForm(); }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            activeTab === 'pisos' 
              ? 'bg-blue-50 border-accent text-accent shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Grid3X3 size={20} />
          <span className="font-medium text-sm">Pisos</span>
        </button>

        <button
          onClick={() => { setActiveTab('pintura'); resetForm(); }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            activeTab === 'pintura' 
              ? 'bg-blue-50 border-accent text-accent shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Droplet size={20} />
          <span className="font-medium text-sm">Pintura</span>
        </button>

        <button
          onClick={() => { setActiveTab('mao_de_obra'); resetForm(); }}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-lg border transition-all ${
            activeTab === 'mao_de_obra' 
              ? 'bg-blue-50 border-accent text-accent shadow-sm' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Hammer size={20} />
          <span className="font-medium text-sm">Mão de Obra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2 flex justify-between items-center">
            <span>
              {activeTab === 'tijolos' && 'Cálculo de Paredes'}
              {activeTab === 'pisos' && 'Cálculo de Área de Piso'}
              {activeTab === 'pintura' && 'Cálculo de Tinta'}
              {activeTab === 'mao_de_obra' && 'Custo de Mão de Obra'}
            </span>
          </h3>

          <div className="space-y-4">
            
            {/* Labor Type Selection */}
            {activeTab === 'mao_de_obra' && (
              <div className="flex gap-4 mb-4 bg-gray-50 p-1 rounded-lg border border-gray-200 w-fit">
                <button
                  onClick={() => setLaborType('diaria')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    laborType === 'diaria' ? 'bg-white text-accent shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Por Diária
                </button>
                <button
                  onClick={() => setLaborType('empreita')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    laborType === 'empreita' ? 'bg-white text-accent shadow-sm' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Por Metro (Empreita)
                </button>
              </div>
            )}

            {/* Area Inputs (Width/Height) - Shown for all except Labor 'Diaria' */}
            {!(activeTab === 'mao_de_obra' && laborType === 'diaria') && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Largura / Base (m)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={width || ''}
                    onChange={(e) => setWidth(parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Altura / Comp. (m)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                    value={height || ''}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    placeholder="0.00"
                  />
                </div>
              </div>
            )}

            {/* Extra fields specific to active tab */}
            
            {/* PISOS */}
            {activeTab === 'pisos' && (
              <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Tamanho da Peça (cm)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Largura (cm)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                      value={tileWidth}
                      onChange={(e) => setTileWidth(parseFloat(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Altura (cm)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                      value={tileHeight}
                      onChange={(e) => setTileHeight(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PINTURA */}
            {activeTab === 'pintura' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Demãos</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={coats}
                  onChange={(e) => setCoats(parseInt(e.target.value))}
                >
                  <option value={1}>1 Demão</option>
                  <option value={2}>2 Demãos (Recomendado)</option>
                  <option value={3}>3 Demãos</option>
                </select>
              </div>
            )}

            {/* MÃO DE OBRA */}
            {activeTab === 'mao_de_obra' && laborType === 'diaria' && (
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nº Profissionais</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                      value={workers}
                      onChange={(e) => setWorkers(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dias Estimados</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                      value={days}
                      onChange={(e) => setDays(parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Diária (R$)</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(parseFloat(e.target.value))}
                    />
                  </div>
               </div>
            )}

            {activeTab === 'mao_de_obra' && laborType === 'empreita' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço por m² (R$)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-accent outline-none"
                  value={contractPrice}
                  onChange={(e) => setContractPrice(parseFloat(e.target.value))}
                  placeholder="Ex: 50.00"
                />
              </div>
            )}

            {/* WASTE MARGIN (Shared) */}
            {(activeTab === 'tijolos' || activeTab === 'pisos') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Margem de Perda/Quebra (%)</label>
                <div className="flex items-center gap-4">
                   <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    className="flex-1"
                    value={wasteMargin}
                    onChange={(e) => setWasteMargin(parseInt(e.target.value))}
                  />
                  <span className="text-gray-900 font-medium w-12 text-right">{wasteMargin}%</span>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-3">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <RotateCcw size={16} /> Limpar
              </button>
              <button
                onClick={handleCalculate}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
              >
                Calcular <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className="md:col-span-1">
          <div className={`h-full p-6 rounded-lg border flex flex-col items-center justify-center text-center transition-all ${result ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 border-dashed'}`}>
            {result ? (
              <div className="animate-in zoom-in duration-300">
                <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide mb-2">
                  {activeTab === 'mao_de_obra' ? 'Custo Estimado' : 'Estimativa Total'}
                </h3>
                <div className="text-4xl font-extrabold text-gray-900 mb-3">{result.main}</div>
                <p className="text-sm text-gray-600">{result.sub}</p>
                
                <div className="mt-6 pt-6 border-t border-green-100 w-full text-xs text-gray-500">
                  *Valores estimados. Consulte um profissional para validação técnica antes da contratação/compra.
                </div>
              </div>
            ) : (
              <div className="text-gray-400">
                <Calculator size={48} className="mx-auto mb-3 opacity-20" />
                <p>Preencha os dados e clique em calcular para ver o resultado.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}