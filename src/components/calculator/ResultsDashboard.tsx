import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Zap, TrendingUp, Leaf, DollarSign, Battery, Cable } from 'lucide-react';
import { formatCLP, formatNum, formatUF, formatUSD } from '@/utils/pvCalculations';
import { MONTH_NAMES } from '@/data/solarData';

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>;
}

function fmt(calc: Props['calc'], clp: number): string {
  if (calc.currencyDisplay === 'UF') return formatUF(clp);
  if (calc.currencyDisplay === 'USD') return formatUSD(clp);
  return formatCLP(clp);
}

function ExecCard({ label, value, unit, accent = false }: { label: string; value: string; unit?: string; accent?: boolean }) {
  return (
    <motion.div className="card-executive" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <p className="label-xs">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-2xl font-semibold tabular-nums ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</span>
        {unit && <span className="value-sm">{unit}</span>}
      </div>
    </motion.div>
  );
}

export function ResultsDashboard({ calc }: Props) {
  const r = calc.results;

  return (
    <div className="space-y-4">
      {/* Executive Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ExecCard label="Potencia Instalada" value={formatNum(r.kWp, 2)} unit="kWp" accent />
        <ExecCard label="Inversión Inicial" value={fmt(calc, r.capex)} />
        <ExecCard label="Payback Simple" value={r.simplePayback > 0 ? `${r.simplePayback}` : `> ${r.projectLifeYears}`} unit="años" />
        <ExecCard label="CO₂ Evitado/año" value={formatNum(r.co2AvoidedPerYear, 1)} unit="ton" />
      </div>

      {/* Project Life Info */}
      <div className="bg-accent/50 rounded-inner p-3 text-xs text-accent-foreground">
        <span className="font-semibold">Horizonte del proyecto:</span> {r.projectLifeYears} años (vida útil del componente más limitante). Sin reemplazos considerados.
      </div>

      {/* Compliance Alert */}
      {calc.systemType === 'on-grid' && (
        <motion.div
          className={`p-4 rounded-inner border-l-4 ${
            r.isLey21118Compliant
              ? 'bg-success/10 border-success'
              : 'bg-destructive/10 border-destructive'
          }`}
          animate={!r.isLey21118Compliant ? { x: [0, -3, 3, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-start gap-2">
            {r.isLey21118Compliant ? (
              <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h4 className="text-sm font-bold text-foreground">Cumplimiento Ley 21.118 / SEC</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {r.isLey21118Compliant
                  ? `Sistema de ${formatNum(r.kWp, 1)} kWp < 300 kW. Requiere medidor bidireccional e inversor certificado SEC.`
                  : `Sistema de ${formatNum(r.kWp, 1)} kWp excede 300 kW. Requiere evaluación especial SEC y conexión como PMGD.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Technical Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Array Sizing */}
        <div className="card-section space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Arreglo Fotovoltaico</h3>
          </div>
          <div className="space-y-1.5">
            {[
              ['N° Paneles', `${r.nPanels}`],
              ['Potencia Total', `${formatNum(r.kWp, 2)} kWp`],
              ['Área Total', `${formatNum(r.totalArea, 1)} m²`],
              ['HSP Diseño', `${formatNum(r.hspDesign, 2)} h`],
              ['Performance Ratio', `${formatNum(r.pr * 100, 1)}%`],
              ['Pérdida Temperatura', `${formatNum(r.tempLossPercent, 1)}%`],
              ['Generación Anual', `${formatNum(r.annualGen, 0)} kWh/año`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* String Sizing & Inverter */}
        <div className="card-section space-y-3">
          <div className="flex items-center gap-2">
            <Cable className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Configuración de Strings</h3>
          </div>
          <div className="space-y-1.5">
            {[
              ['Voc Frío (validación)', `${formatNum(r.vocCold, 1)} V`],
              ['Paneles en Serie', `${r.stringsRecommended.series}`],
              ['Strings en Paralelo', `${r.stringsRecommended.parallel}`],
              ['Total Paneles', `${r.stringsRecommended.series * r.stringsRecommended.parallel}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground tabular-nums">{v}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 pt-2 border-t border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Inversor Recomendado</h4>
            </div>
            {[
              ['Potencia Mín. (DC/AC)', `${formatNum(r.inverterMinKw, 1)} kW`],
              ['Potencia Recomendada', `${formatNum(r.inverterRecKw, 1)} kW`],
              ['Margen de Seguridad', `${formatNum(r.inverterSafetyPercent, 0)}%`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Battery Results */}
      {calc.systemType === 'off-grid' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-section space-y-3">
          <div className="flex items-center gap-2">
            <Battery className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Banco de Baterías</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5">
            {[
              ['Capacidad Banco', `${formatNum(r.bankAh, 0)} Ah`],
              ['Energía Total', `${formatNum(r.totalKwh, 1)} kWh`],
              ['Energía Usable', `${formatNum(r.usableKwh, 1)} kWh`],
              ['DoD Diario Real', `${formatNum(r.dailyDoD * 100, 1)}%`],
              ['Baterías Serie', `${r.nBattSeries}`],
              ['Baterías Paralelo', `${r.nBattParallel}`],
              ['Total Baterías', `${r.totalBatteries}`],
              ['Vida Útil (ciclos)', `${formatNum(r.cycleLife, 0)}`],
              ['Vida Útil (años)', `${formatNum(r.battCalendarLife, 1)}`],
              ['Corriente MPPT', `${formatNum(r.mpptCurrent, 1)} A`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
                <span className="text-muted-foreground">{k}</span>
                <span className="font-medium text-foreground tabular-nums">{v}</span>
              </div>
            ))}
          </div>
          {/* Battery capacity bar */}
          <div className="mt-2">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Usable ({formatNum(r.dailyDoD * 100, 0)}% DoD diario)</span>
              <span>Reserva</span>
            </div>
            <div className="h-3 w-full bg-secondary rounded-full overflow-hidden flex">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${Math.min(100, r.dailyDoD * 100)}%` }} />
              <div className="h-full bg-warning/40 transition-all duration-300" style={{ width: `${Math.min(100, (calc.maxDoD - r.dailyDoD * 100))}%` }} />
            </div>
          </div>
        </motion.div>
      )}

      {/* Economic Analysis */}
      <div className="card-section space-y-3">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Análisis Económico ({r.projectLifeYears} años)</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { l: 'CAPEX', v: fmt(calc, r.capex) },
            { l: 'Ahorro Anual', v: fmt(calc, r.annualSavings) },
            { l: `VAN (${r.projectLifeYears} años)`, v: fmt(calc, r.van) },
            { l: 'LCOE', v: `${formatNum(r.lcoe, 1)} CLP/kWh` },
          ].map(d => (
            <div key={d.l} className="bg-secondary rounded-inner p-3 text-center">
              <div className="label-xs">{d.l}</div>
              <div className="text-sm font-semibold text-foreground tabular-nums mt-1">{d.v}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
          {[
            ['TIR', `${formatNum(r.tir * 100, 1)}%`],
            ['Payback Simple', r.simplePayback > 0 ? `${r.simplePayback} años` : `> ${r.projectLifeYears} años`],
            ['Payback Descontado', r.discountedPayback > 0 ? `${r.discountedPayback} años` : `> ${r.projectLifeYears} años`],
            ['CO₂ Evitado (total)', `${formatNum(r.co2AvoidedTotal, 1)} ton`],
            ...(calc.systemType === 'off-grid' ? [['Costo Baterías', fmt(calc, r.batteryCost)]] : []),
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm border-b border-border/50 pb-1">
              <span className="text-muted-foreground">{k}</span>
              <span className="font-medium text-foreground tabular-nums">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly HSP Table */}
      <div className="card-section">
        <h3 className="text-sm font-semibold text-foreground mb-3">HSP Mensual — {calc.city.name}</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                {MONTH_NAMES.map(m => (
                  <th key={m} className="label-xs pb-2 text-center">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {calc.city.monthlyHSP.map((h, i) => (
                  <td key={i} className="text-center font-medium text-foreground tabular-nums py-1">{h.toFixed(1)}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}