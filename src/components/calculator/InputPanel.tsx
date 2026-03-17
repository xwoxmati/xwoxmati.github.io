import { Plus, Trash2, Zap, MapPin, Settings, DollarSign, Battery, ChevronDown, ChevronRight, Globe } from 'lucide-react';
import { cities, panelModels, batteryModels, MONTH_NAMES } from '@/data/solarData';
import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>;
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card-section">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 text-left">
        <span className="text-primary">{icon}</span>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="pt-4 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="input-group">
      <label className="label-xs">{label}</label>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, min, max, step, suffix }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; suffix?: string }) {
  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        min={min} max={max} step={step}
        className="w-full bg-secondary text-foreground text-sm font-medium px-3 py-2 rounded-inner outline-none focus:ring-2 focus:ring-primary/30 tabular-nums"
      />
      {suffix && <span className="text-[11px] text-muted-foreground whitespace-nowrap">{suffix}</span>}
    </div>
  );
}

function SelectInput({ value, onChange, options }: { value: string | number; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-secondary text-foreground text-sm font-medium px-3 py-2 rounded-inner outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function SegmentedControl({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex bg-secondary rounded-inner p-0.5">
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex-1 text-xs font-semibold py-2 px-3 rounded-[6px] transition-all duration-200 ${
            value === o.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function InputPanel({ calc }: Props) {
  const selectedPanel = calc.panelMode === 'commercial' ? panelModels[calc.panelIndex] : calc.customPanel;

  return (
    <div className="space-y-3">
      {/* System Type */}
      <div className="card-section">
        <SegmentedControl
          options={[{ value: 'on-grid', label: '⚡ On-Grid' }, { value: 'off-grid', label: '🔋 Off-Grid' }]}
          value={calc.systemType}
          onChange={v => calc.setSystemType(v as 'on-grid' | 'off-grid')}
        />
      </div>

      {/* Location */}
      <Section title="Ubicación e Irradiancia" icon={<MapPin className="w-4 h-4" />}>
        <SegmentedControl
          options={[{ value: 'preset', label: 'Ciudad Predefinida' }, { value: 'custom', label: 'Datos Personalizados' }]}
          value={calc.cityMode}
          onChange={v => calc.setCityMode(v as 'preset' | 'custom')}
        />
        {calc.cityMode === 'preset' ? (
          <>
            <Field label="Ciudad">
              <SelectInput
                value={calc.cityIndex.toString()}
                onChange={v => calc.setCityIndex(Number(v))}
                options={cities.map((c, i) => ({ value: i.toString(), label: `${c.name} (${c.region})` }))}
              />
            </Field>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-secondary rounded-inner p-2">
                <div className="label-xs">HSP Prom.</div>
                <div className="text-sm font-semibold text-foreground tabular-nums">
                  {(calc.city.monthlyHSP.reduce((a: number, b: number) => a + b, 0) / 12).toFixed(1)}
                </div>
              </div>
              <div className="bg-secondary rounded-inner p-2">
                <div className="label-xs">T° Min</div>
                <div className="text-sm font-semibold text-foreground tabular-nums">{calc.city.minTemp}°C</div>
              </div>
              <div className="bg-secondary rounded-inner p-2">
                <div className="label-xs">T° Max</div>
                <div className="text-sm font-semibold text-foreground tabular-nums">{calc.city.maxTemp}°C</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-accent/50 rounded-inner p-2 mb-1">
              <div className="flex items-center gap-1 text-xs text-accent-foreground font-medium mb-1">
                <Globe className="w-3 h-3" /> Datos Explorador Solar / Herramienta Externa
              </div>
            </div>
            <Field label="Nombre Ubicación">
              <input
                value={calc.customCity.name}
                onChange={e => calc.setCustomCity({ ...calc.customCity, name: e.target.value })}
                className="w-full bg-secondary text-foreground text-sm font-medium px-3 py-2 rounded-inner outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Latitud"><NumInput value={calc.customCity.latitude ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, latitude: v })} step={0.01} suffix="°" /></Field>
              <Field label="Longitud"><NumInput value={calc.customCity.longitude ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, longitude: v })} step={0.01} suffix="°" /></Field>
              <Field label="Altitud"><NumInput value={calc.customCity.altitude ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, altitude: v })} suffix="msnm" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Global Horizontal"><NumInput value={calc.customCity.globalHorizontal ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, globalHorizontal: v })} step={0.01} suffix="kWh/m²/día" /></Field>
              <Field label="Global Inclinado"><NumInput value={calc.customCity.globalTilted ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, globalTilted: v })} step={0.01} suffix="kWh/m²/día" /></Field>
              <Field label="Directa Normal"><NumInput value={calc.customCity.directNormal ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, directNormal: v })} step={0.01} suffix="kWh/m²/día" /></Field>
              <Field label="Difusa Horizontal"><NumInput value={calc.customCity.diffuseHorizontal ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, diffuseHorizontal: v })} step={0.01} suffix="kWh/m²/día" /></Field>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Nubes"><NumInput value={calc.customCity.cloudFrequency ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, cloudFrequency: v })} suffix="%" /></Field>
              <Field label="T° Ambiente"><NumInput value={calc.customCity.avgTemp} onChange={v => calc.setCustomCity({ ...calc.customCity, avgTemp: v })} step={0.1} suffix="°C" /></Field>
              <Field label="Viento"><NumInput value={calc.customCity.windSpeed ?? 0} onChange={v => calc.setCustomCity({ ...calc.customCity, windSpeed: v })} step={0.1} suffix="m/s" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="T° Mínima"><NumInput value={calc.customCity.minTemp} onChange={v => calc.setCustomCity({ ...calc.customCity, minTemp: v })} step={0.1} suffix="°C" /></Field>
              <Field label="T° Máxima"><NumInput value={calc.customCity.maxTemp} onChange={v => calc.setCustomCity({ ...calc.customCity, maxTemp: v })} step={0.1} suffix="°C" /></Field>
            </div>
            {/* Monthly HSP editable */}
            <div>
              <label className="label-xs mb-1 block">HSP Mensual (kWh/m²/día)</label>
              <div className="grid grid-cols-6 gap-1">
                {MONTH_NAMES.map((m, i) => (
                  <div key={m} className="text-center">
                    <div className="text-[10px] text-muted-foreground">{m}</div>
                    <input
                      type="number"
                      value={calc.customCity.monthlyHSP[i]}
                      onChange={e => {
                        const newHSP = [...calc.customCity.monthlyHSP];
                        newHSP[i] = Number(e.target.value);
                        calc.setCustomCity({ ...calc.customCity, monthlyHSP: newHSP });
                      }}
                      step={0.1}
                      className="w-full bg-secondary text-foreground text-xs font-medium px-1 py-1.5 rounded text-center outline-none focus:ring-2 focus:ring-primary/30 tabular-nums"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Section>

      {/* Demand */}
      <Section title="Demanda Energética" icon={<Zap className="w-4 h-4" />}>
        <SegmentedControl
          options={[{ value: 'manual', label: 'Manual' }, { value: 'audit', label: 'Auditoría' }]}
          value={calc.demandMode}
          onChange={v => calc.setDemandMode(v as 'manual' | 'audit')}
        />
        {calc.demandMode === 'manual' ? (
          <>
            <Field label="Consumo Diario">
              <NumInput value={calc.dailyDemandManual} onChange={calc.setDailyDemandManual} min={100} step={100} suffix="Wh/día" />
            </Field>
            <Field label="Potencia Punta">
              <NumInput value={calc.peakLoad} onChange={calc.setPeakLoad} min={100} step={100} suffix="W" />
            </Field>
          </>
        ) : (
          <>
            <div className="space-y-1">
              {calc.loads.map(load => (
                <div key={load.id} className="flex items-center gap-1 bg-secondary rounded-inner p-1.5">
                  <input
                    value={load.name}
                    onChange={e => calc.updateLoad(load.id, 'name', e.target.value)}
                    className="flex-1 min-w-0 bg-transparent text-xs text-foreground px-1 outline-none"
                  />
                  <input type="number" value={load.watts} onChange={e => calc.updateLoad(load.id, 'watts', Number(e.target.value))}
                    className="w-14 bg-card text-xs text-foreground px-1 py-0.5 rounded text-right tabular-nums outline-none" />
                  <span className="text-[10px] text-muted-foreground">W</span>
                  <input type="number" value={load.hours} onChange={e => calc.updateLoad(load.id, 'hours', Number(e.target.value))}
                    className="w-10 bg-card text-xs text-foreground px-1 py-0.5 rounded text-right tabular-nums outline-none" />
                  <span className="text-[10px] text-muted-foreground">h</span>
                  <input type="number" value={load.qty} onChange={e => calc.updateLoad(load.id, 'qty', Number(e.target.value))}
                    className="w-8 bg-card text-xs text-foreground px-1 py-0.5 rounded text-right tabular-nums outline-none" />
                  <span className="text-[10px] text-muted-foreground">×</span>
                  <button onClick={() => calc.removeLoad(load.id)} className="p-0.5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={calc.addLoad} className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80">
              <Plus className="w-3 h-3" /> Agregar equipo
            </button>
            <div className="bg-accent rounded-inner p-2 text-center">
              <span className="label-xs">Total Diario: </span>
              <span className="text-sm font-semibold text-accent-foreground tabular-nums">
                {calc.dailyDemand.toLocaleString('es-CL')} Wh/día
              </span>
            </div>
          </>
        )}
      </Section>

      {/* Panel */}
      <Section title="Panel Fotovoltaico" icon={<Settings className="w-4 h-4" />}>
        <SegmentedControl
          options={[{ value: 'commercial', label: 'Comercial' }, { value: 'custom', label: 'Personalizado' }]}
          value={calc.panelMode}
          onChange={v => calc.setPanelMode(v as 'commercial' | 'custom')}
        />
        {calc.panelMode === 'commercial' ? (
          <Field label="Modelo">
            <SelectInput
              value={calc.panelIndex.toString()}
              onChange={v => calc.setPanelIndex(Number(v))}
              options={panelModels.map((p, i) => ({ value: i.toString(), label: `${p.brand} ${p.model}` }))}
            />
          </Field>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Field label="Potencia"><NumInput value={calc.customPanel.power} onChange={v => calc.setCustomPanel({ ...calc.customPanel, power: v })} suffix="Wp" /></Field>
            <Field label="Voc"><NumInput value={calc.customPanel.voc} onChange={v => calc.setCustomPanel({ ...calc.customPanel, voc: v })} step={0.1} suffix="V" /></Field>
            <Field label="Isc"><NumInput value={calc.customPanel.isc} onChange={v => calc.setCustomPanel({ ...calc.customPanel, isc: v })} step={0.01} suffix="A" /></Field>
            <Field label="Vmp"><NumInput value={calc.customPanel.vmp} onChange={v => calc.setCustomPanel({ ...calc.customPanel, vmp: v })} step={0.1} suffix="V" /></Field>
            <Field label="Imp"><NumInput value={calc.customPanel.imp} onChange={v => calc.setCustomPanel({ ...calc.customPanel, imp: v })} step={0.01} suffix="A" /></Field>
            <Field label="γ (Pmax)"><NumInput value={calc.customPanel.gamma} onChange={v => calc.setCustomPanel({ ...calc.customPanel, gamma: v })} step={0.01} suffix="%/°C" /></Field>
            <Field label="β (Voc)"><NumInput value={calc.customPanel.beta} onChange={v => calc.setCustomPanel({ ...calc.customPanel, beta: v })} step={0.01} suffix="%/°C" /></Field>
            <Field label="NOCT"><NumInput value={calc.customPanel.noct} onChange={v => calc.setCustomPanel({ ...calc.customPanel, noct: v })} suffix="°C" /></Field>
          </div>
        )}
        {/* Panel specs summary */}
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { l: 'Pmax', v: `${selectedPanel.power}W` },
            { l: 'Voc', v: `${selectedPanel.voc}V` },
            { l: 'Isc', v: `${selectedPanel.isc}A` },
            { l: 'γ', v: `${selectedPanel.gamma}%` },
          ].map(d => (
            <div key={d.l} className="bg-secondary rounded p-1.5">
              <div className="text-[10px] text-muted-foreground">{d.l}</div>
              <div className="text-xs font-semibold text-foreground tabular-nums">{d.v}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Losses */}
      <Section title="Pérdidas y Eficiencia" icon={<Settings className="w-4 h-4" />} defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Pérdida Cable"><NumInput value={calc.cableLoss} onChange={calc.setCableLoss} min={0} max={10} step={0.5} suffix="%" /></Field>
          <Field label="Pérdida Polvo"><NumInput value={calc.dustLoss} onChange={calc.setDustLoss} min={0} max={15} step={0.5} suffix="%" /></Field>
          <Field label="Mismatch"><NumInput value={calc.mismatchLoss} onChange={calc.setMismatchLoss} min={0} max={5} step={0.5} suffix="%" /></Field>
          <Field label="Efic. Inversor"><NumInput value={calc.inverterEff} onChange={calc.setInverterEff} min={85} max={99} step={0.5} suffix="%" /></Field>
        </div>
        <Field label="Ratio DC/AC">
          <NumInput value={calc.dcAcRatio} onChange={calc.setDcAcRatio} min={1.0} max={1.5} step={0.05} />
        </Field>
        <Field label="Margen Seguridad Inversor">
          <NumInput value={calc.inverterSafetyMargin} onChange={calc.setInverterSafetyMargin} min={0} max={50} step={5} suffix="%" />
        </Field>
      </Section>

      {/* Battery (Off-grid) */}
      <AnimatePresence>
        {calc.systemType === 'off-grid' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} transition={{ duration: 0.3 }}>
            <Section title="Banco de Baterías" icon={<Battery className="w-4 h-4" />}>
              <SegmentedControl
                options={[{ value: 'commercial', label: 'Estándar' }, { value: 'custom', label: 'Personalizado' }]}
                value={calc.batteryMode}
                onChange={v => calc.setBatteryMode(v as 'commercial' | 'custom')}
              />
              {calc.batteryMode === 'commercial' ? (
                <Field label="Tipo de Batería">
                  <SelectInput
                    value={calc.battTypeIndex.toString()}
                    onChange={v => calc.setBattTypeIndex(Number(v))}
                    options={batteryModels.map((b, i) => ({ value: i.toString(), label: b.label }))}
                  />
                </Field>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Tecnología">
                    <SelectInput
                      value={calc.customBattery.type}
                      onChange={v => calc.setCustomBattery({ ...calc.customBattery, type: v, label: `${v} Personalizada` })}
                      options={[
                        { value: 'AGM', label: 'AGM' },
                        { value: 'GEL', label: 'GEL' },
                        { value: 'LiFePO4', label: 'LiFePO4' },
                        { value: 'Li-ion', label: 'Li-ion NMC' },
                        { value: 'Otra', label: 'Otra' },
                      ]}
                    />
                  </Field>
                  <Field label="Voltaje Nominal"><NumInput value={calc.customBattery.nominalV} onChange={v => calc.setCustomBattery({ ...calc.customBattery, nominalV: v })} suffix="V" /></Field>
                  <Field label="Capacidad"><NumInput value={calc.customBattery.capacityAh} onChange={v => calc.setCustomBattery({ ...calc.customBattery, capacityAh: v })} suffix="Ah" /></Field>
                  <Field label="DoD Referencia"><NumInput value={Math.round(calc.customBattery.refDoD * 100)} onChange={v => calc.setCustomBattery({ ...calc.customBattery, refDoD: v / 100 })} min={10} max={100} step={5} suffix="%" /></Field>
                  <Field label="Ciclos (ref DoD)"><NumInput value={calc.customBattery.cyclesAtRefDoD} onChange={v => calc.setCustomBattery({ ...calc.customBattery, cyclesAtRefDoD: v })} min={100} step={100} /></Field>
                  <Field label="Vida Calendario"><NumInput value={calc.customBattery.calendarLife} onChange={v => calc.setCustomBattery({ ...calc.customBattery, calendarLife: v })} min={1} max={25} suffix="años" /></Field>
                  <Field label="Costo Unitario"><NumInput value={calc.customBattery.costCLP} onChange={v => calc.setCustomBattery({ ...calc.customBattery, costCLP: v })} min={0} step={10000} suffix="CLP" /></Field>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Field label="Días Autonomía"><NumInput value={calc.autonomyDays} onChange={calc.setAutonomyDays} min={1} max={7} /></Field>
                <Field label="Voltaje Sistema">
                  <SelectInput
                    value={calc.systemVoltage.toString()}
                    onChange={v => calc.setSystemVoltage(Number(v))}
                    options={[{ value: '12', label: '12V' }, { value: '24', label: '24V' }, { value: '48', label: '48V' }]}
                  />
                </Field>
                <Field label="DoD Máximo"><NumInput value={calc.maxDoD} onChange={calc.setMaxDoD} min={20} max={95} step={5} suffix="%" /></Field>
              </div>
            </Section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Economics */}
      <Section title="Análisis Económico" icon={<DollarSign className="w-4 h-4" />} defaultOpen={false}>
        <SegmentedControl
          options={[{ value: 'CLP', label: 'CLP' }, { value: 'UF', label: 'UF' }, { value: 'USD', label: 'USD' }]}
          value={calc.currencyDisplay}
          onChange={v => calc.setCurrencyDisplay(v as 'CLP' | 'UF' | 'USD')}
        />
        <div className="grid grid-cols-2 gap-2">
          <Field label="Costo por Wp"><NumInput value={calc.costPerWp} onChange={calc.setCostPerWp} min={100} step={50} suffix="CLP" /></Field>
          <Field label="Tarifa Eléctrica"><NumInput value={calc.tariff} onChange={calc.setTariff} min={50} step={10} suffix="CLP/kWh" /></Field>
          <Field label="Tasa Descuento"><NumInput value={calc.discountRate} onChange={calc.setDiscountRate} min={1} max={20} step={0.5} suffix="%" /></Field>
          <Field label="O&M Anual"><NumInput value={calc.omPercent} onChange={calc.setOmPercent} min={0} max={5} step={0.25} suffix="% CAPEX" /></Field>
        </div>
      </Section>
    </div>
  );
}