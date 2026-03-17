import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ReferenceLine } from 'recharts';
import { MONTH_NAMES, DAYS_IN_MONTH } from '@/data/solarData';
import { formatNum, formatCLP } from '@/utils/pvCalculations';

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>;
}

const ORANGE = 'hsl(28, 95%, 52%)';
const ORANGE_LIGHT = 'hsl(28, 95%, 75%)';
const BLUE = 'hsl(210, 70%, 55%)';
const GREEN = 'hsl(142, 71%, 45%)';
const RED = 'hsl(0, 70%, 55%)';
const SLATE = 'hsl(215, 16%, 65%)';

export function EnergyCharts({ calc }: Props) {
  const r = calc.results;

  // Monthly energy balance
  const monthlyData = MONTH_NAMES.map((name, i) => ({
    name,
    generación: Math.round(r.monthlyGen[i]),
    consumo: Math.round((calc.dailyDemand / 1000) * DAYS_IN_MONTH[i]),
  }));

  // Degradation over project life (not fixed 20)
  const degradationData = r.yearlyData.map(d => ({
    name: `${d.year}`,
    generación: Math.round(d.generation),
    útil: Math.round(d.usefulEnergy),
  }));

  // Annual cashflow
  const cashflowData = r.yearlyData.map(d => ({
    name: `${d.year}`,
    flujo: Math.round(d.cashflow),
  }));

  // Cumulative payback
  const paybackData = [
    { name: '0', acumulado: Math.round(-r.capex), descontado: Math.round(-r.capex) },
    ...r.yearlyData.map(d => ({
      name: `${d.year}`,
      acumulado: Math.round(d.cumulativeCashflow),
      descontado: Math.round(d.cumulativeDiscounted),
    })),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Monthly Balance */}
      <div className="card-section">
        <h3 className="text-sm font-semibold text-foreground mb-3">Balance Energético Mensual</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 16%, 85%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={SLATE} />
            <YAxis tick={{ fontSize: 10 }} stroke={SLATE} tickFormatter={v => `${v}`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => [`${formatNum(v, 0)} kWh`, '']} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="generación" fill={ORANGE} radius={[3, 3, 0, 0]} />
            <Bar dataKey="consumo" fill={SLATE} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Degradation over project life */}
      <div className="card-section">
        <h3 className="text-sm font-semibold text-foreground mb-3">Proyección {r.projectLifeYears} Años — Degradación</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={degradationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 16%, 85%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={SLATE} />
            <YAxis tick={{ fontSize: 10 }} stroke={SLATE} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => [`${formatNum(v, 0)} kWh`, '']} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="linear" dataKey="generación" fill={ORANGE_LIGHT} stroke={ORANGE} fillOpacity={0.3} />
            <Area type="linear" dataKey="útil" fill={BLUE} stroke={BLUE} fillOpacity={0.15} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Annual Net Cashflow */}
      <div className="card-section">
        <h3 className="text-sm font-semibold text-foreground mb-3">Flujo de Caja Neto Anual</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={cashflowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 16%, 85%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={SLATE} />
            <YAxis tick={{ fontSize: 10 }} stroke={SLATE} tickFormatter={v => `${Math.round(v / 1000)}k`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => [formatCLP(v), 'Flujo']} />
            <ReferenceLine y={0} stroke={SLATE} />
            <Bar dataKey="flujo" fill={GREEN} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative Payback */}
      <div className="card-section">
        <h3 className="text-sm font-semibold text-foreground mb-3">Curva de Payback Acumulado</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={paybackData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 16%, 85%)" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke={SLATE} />
            <YAxis tick={{ fontSize: 10 }} stroke={SLATE} tickFormatter={v => `${Math.round(v / 1000000)}M`} />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} formatter={(v: number) => [formatCLP(v), '']} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={0} stroke={RED} strokeDasharray="4 4" />
            <Line type="linear" dataKey="acumulado" stroke={ORANGE} strokeWidth={2} dot={false} />
            <Line type="linear" dataKey="descontado" stroke={BLUE} strokeWidth={2} dot={false} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}