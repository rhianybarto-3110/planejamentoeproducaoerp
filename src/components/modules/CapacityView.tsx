import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { CapacitySettings } from '../../types';
import { 
  Gauge, 
  Settings2, 
  Users, 
  Clock, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Calculator, 
  ArrowRight,
  Factory,
  Zap
} from 'lucide-react';
import { formatTimeMinutes, formatDate } from '../../utils/formatters';
import { calculateCapacityMetrics, calculateLeadTimeDate } from '../../utils/productionCalculations';

export const CapacityView: React.FC = () => {
  const { capacity, updateCapacity, products, productionOrders } = useERP();

  // Settings form states
  const [formHoursDay, setFormHoursDay] = useState<number>(capacity.hoursPerDay);
  const [formDaysWeek, setFormDaysWeek] = useState<number>(capacity.daysPerWeek);
  const [formOperators, setFormOperators] = useState<number>(capacity.activeOperators);
  const [formEfficiency, setFormEfficiency] = useState<number>(capacity.efficiencyPercent);
  const [formFactoryName, setFormFactoryName] = useState<string>(capacity.factoryName || 'Planta Principal');

  // Simulator states
  const [simProductId, setSimProductId] = useState<string>(products[0]?.id || '');
  const [simQuantity, setSimQuantity] = useState<number>(10);
  const [simStartDate, setSimStartDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const metrics = calculateCapacityMetrics(capacity, productionOrders);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (formHoursDay <= 0 || formDaysWeek <= 0 || formOperators <= 0) {
      alert('Preencha valores maiores que zero para horas, dias e operadores.');
      return;
    }

    const updated: CapacitySettings = {
      hoursPerDay: Number(formHoursDay),
      daysPerWeek: Number(formDaysWeek),
      activeOperators: Number(formOperators),
      efficiencyPercent: Math.max(10, Math.min(100, Number(formEfficiency))),
      factoryName: formFactoryName.trim() || 'Planta Principal',
    };

    updateCapacity(updated);
  };

  // Simulation calculations
  const simProduct = products.find((p) => p.id === simProductId);
  const simTotalMinutes = simProduct ? simProduct.processTimeMinutes * simQuantity : 0;
  const simTotalHours = simTotalMinutes / 60;
  const simLeadTimeDate = calculateLeadTimeDate(simStartDate, simTotalMinutes, capacity);
  const simWorkDaysNeeded = Math.ceil(simTotalMinutes / Math.max(1, metrics.dailyNetMinutes));
  const simCapacityImpactPct = metrics.weeklyNetHours > 0 
    ? Math.round((simTotalHours / metrics.weeklyNetHours) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Capacidade Diária Líquida</span>
            <Clock className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.dailyNetHours.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500">úteis / dia</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {capacity.activeOperators} postos × {capacity.hoursPerDay}h × {capacity.efficiencyPercent}% eficiência
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Capacidade Semanal</span>
            <Calendar className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-purple-950 tabular-nums">
              {metrics.weeklyNetHours.toFixed(0)}h
            </span>
            <span className="text-xs text-slate-500">disponíveis / semana</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Jornada de {capacity.daysPerWeek} dias úteis por semana
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Carga Atual em Fila</span>
            <Factory className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.totalActiveHoursQueued.toFixed(1)}h
            </span>
            <span className="text-xs text-slate-500">alocadas em OPs</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            {productionOrders.filter((o) => o.status === 'pendente' || o.status === 'em_producao').length} ordens ativas
          </p>
        </div>

        <div className="p-5 bg-white rounded-xl border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Índice de Ocupação</span>
            <Gauge className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {metrics.weeklyUtilizationPercent}%
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              metrics.status === 'sobrecarga'
                ? 'bg-rose-100 text-rose-800'
                : metrics.status === 'alto'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {metrics.status === 'sobrecarga' ? 'Sobrecarga' : metrics.status === 'alto' ? 'Carga Alta' : 'Equilibrada'}
            </span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                metrics.weeklyUtilizationPercent > 100 
                  ? 'bg-rose-600' 
                  : metrics.weeklyUtilizationPercent > 75 
                  ? 'bg-amber-500' 
                  : 'bg-purple-600'
              }`}
              style={{ width: `${Math.min(100, metrics.weeklyUtilizationPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters Configuration + Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form de Configuração da Fábrica */}
        <div className="bg-white rounded-xl border border-purple-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-purple-700" />
                Parâmetros Operacionais da Linha de Produção
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ajuste os parâmetros físicos da sua oficina ou indústria para calibrar o cálculo de prazos
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome da Planta / Unidade Fabril
              </label>
              <input
                type="text"
                value={formFactoryName}
                onChange={(e) => setFormFactoryName(e.target.value)}
                placeholder="Ex: Fábrica Principal - Linha 1"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Horas de Trabalho por Dia (h/dia) *
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="24"
                  value={formHoursDay}
                  onChange={(e) => setFormHoursDay(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Ex: 8 horas diárias (turno padrão)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dias Úteis por Semana *
                </label>
                <select
                  value={formDaysWeek}
                  onChange={(e) => setFormDaysWeek(parseInt(e.target.value, 10) || 5)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value={5}>5 dias (Segunda a Sexta)</option>
                  <option value={6}>6 dias (Segunda a Sábado)</option>
                  <option value={7}>7 dias (Operação Contínua)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operadores / Bancadas Ativas *
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="100"
                  value={formOperators}
                  onChange={(e) => setFormOperators(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Número de estações simultâneas de trabalho
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fator de Eficiência Global (%) *
                </label>
                <input
                  type="number"
                  step="1"
                  min="10"
                  max="100"
                  value={formEfficiency}
                  onChange={(e) => setFormEfficiency(parseInt(e.target.value, 10) || 80)}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:outline-none"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Considera paradas técnicas e setups (recomendado: 80% a 90%)
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-sm transition-colors"
              >
                Salvar Configurações de Capacidade
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Simulador de Prazo e Carga */}
        <div className="bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 rounded-xl p-6 text-white space-y-4 shadow-md">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <Calculator className="w-5 h-5" />
            <span>Simulador de Prazos e Carga Produtiva</span>
          </div>
          <p className="text-xs text-purple-200">
            Simule o tempo necessário e a data exata de entrega para qualquer produto antes de fechar o pedido com o cliente:
          </p>

          <div className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                Selecione o Produto a Simular
              </label>
              <select
                value={simProductId}
                onChange={(e) => setSimProductId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-purple-900/60 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} className="bg-purple-950 text-white">
                    {p.code} - {p.name} ({formatTimeMinutes(p.processTimeMinutes)}/un)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                  Quantidade a Fabricar
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={simQuantity}
                  onChange={(e) => setSimQuantity(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono bg-purple-900/60 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">
                  Data de Início Prevista
                </label>
                <input
                  type="date"
                  value={simStartDate}
                  onChange={(e) => setSimStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono bg-purple-900/60 border border-purple-500/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            {/* Simulation Results Box */}
            <div className="p-4 rounded-xl bg-purple-900/50 border border-purple-400/30 space-y-3 mt-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[11px] text-purple-300 block">Horas Totais de Trabalho:</span>
                  <strong className="text-base font-bold text-amber-300 font-mono">
                    {simTotalHours.toFixed(1)} horas
                  </strong>
                  <span className="text-[10px] text-purple-300 block">
                    ({simTotalMinutes} minutos de bancada)
                  </span>
                </div>

                <div>
                  <span className="text-[11px] text-purple-300 block">Prazo Estimado de Conclusão:</span>
                  <strong className="text-base font-bold text-white font-mono">
                    {formatDate(simLeadTimeDate)}
                  </strong>
                  <span className="text-[10px] text-purple-300 block">
                    (~{simWorkDaysNeeded} {simWorkDaysNeeded === 1 ? 'dia útil' : 'dias úteis'})
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-700/50 flex items-center justify-between text-xs">
                <span className="text-purple-200">Impacto na capacidade semanal:</span>
                <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                  simCapacityImpactPct > 50 ? 'bg-amber-400/20 text-amber-300' : 'bg-emerald-400/20 text-emerald-300'
                }`}>
                  +{simCapacityImpactPct}% da semana
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Throughput / Capacidade Teórica Máxima por Produto */}
      <div className="bg-white rounded-xl border border-purple-100 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-700" />
            Capacidade Máxima Teórica por Produto (Throughput)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimativa de quantas unidades a fábrica consegue produzir se dedicar 100% da sua jornada a um único item:
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-purple-50/50 border-b border-purple-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Produto</th>
                <th className="py-3 px-4">Tempo Unitário</th>
                <th className="py-3 px-4 text-right">Produção Máx / Dia</th>
                <th className="py-3 px-4 text-right">Produção Máx / Semana</th>
                <th className="py-3 px-4 text-right">Produção Máx / Mês</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {products.map((p) => {
                const dailyUnits = metrics.dailyNetMinutes > 0 
                  ? Math.floor(metrics.dailyNetMinutes / p.processTimeMinutes)
                  : 0;
                const weeklyUnits = dailyUnits * capacity.daysPerWeek;
                const monthlyUnits = Math.floor(weeklyUnits * 4.33);

                return (
                  <tr key={p.id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-purple-900">
                      {p.code}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-purple-800">
                      {formatTimeMinutes(p.processTimeMinutes)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                      {dailyUnits} un
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-purple-900 tabular-nums">
                      {weeklyUnits} un
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-purple-950 tabular-nums">
                      {monthlyUnits} un
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
