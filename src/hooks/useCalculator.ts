import { useState, useMemo, useCallback } from 'react';
import { cities, panelModels, batteryModels, defaultLoads, type LoadItem, type City, type BatterySpec } from '@/data/solarData';
import { calculatePV, type PVInputs, type PVResults } from '@/utils/pvCalculations';

export type SystemType = 'on-grid' | 'off-grid';
export type DemandMode = 'manual' | 'audit';
export type PanelMode = 'commercial' | 'custom';
export type CurrencyDisplay = 'CLP' | 'UF' | 'USD';
export type BatteryMode = 'commercial' | 'custom';
export type CityMode = 'preset' | 'custom';

export function useCalculator() {
  const [systemType, setSystemType] = useState<SystemType>('on-grid');
  const [cityMode, setCityMode] = useState<CityMode>('preset');
  const [cityIndex, setCityIndex] = useState(7); // Santiago
  const [customCity, setCustomCity] = useState<City>({
    name: 'Personalizado', region: '-',
    monthlyHSP: [6.8,6.5,5.5,4.2,3.0,2.5,2.7,3.5,4.5,5.5,6.5,7.0],
    avgTemp: 15, minTemp: 2, maxTemp: 32,
    latitude: -33.42, longitude: -70.60, altitude: 637,
    globalHorizontal: 5.30, globalTilted: 5.72, directNormal: 6.85, diffuseHorizontal: 1.23,
    cloudFrequency: 14, windSpeed: 1.1,
  });
  const [demandMode, setDemandMode] = useState<DemandMode>('manual');
  const [dailyDemandManual, setDailyDemandManual] = useState(10000);
  const [peakLoad, setPeakLoad] = useState(3000);
  const [loads, setLoads] = useState<LoadItem[]>(defaultLoads);
  const [panelMode, setPanelMode] = useState<PanelMode>('commercial');
  const [panelIndex, setPanelIndex] = useState(0);
  const [customPanel, setCustomPanel] = useState(panelModels[0]);
  const [cableLoss, setCableLoss] = useState(2);
  const [dustLoss, setDustLoss] = useState(3);
  const [mismatchLoss, setMismatchLoss] = useState(2);
  const [inverterEff, setInverterEff] = useState(96);
  const [dcAcRatio, setDcAcRatio] = useState(1.2);
  const [inverterSafetyMargin, setInverterSafetyMargin] = useState(20); // %
  const [batteryMode, setBatteryMode] = useState<BatteryMode>('commercial');
  const [battTypeIndex, setBattTypeIndex] = useState(2); // LiFePO4
  const [customBattery, setCustomBattery] = useState<BatterySpec>({
    type: 'LiFePO4', label: 'Personalizada', nominalV: 12, capacityAh: 200,
    cyclesAtRefDoD: 5000, refDoD: 0.80, calendarLife: 12, costCLP: 550000,
  });
  const [autonomyDays, setAutonomyDays] = useState(2);
  const [systemVoltage, setSystemVoltage] = useState(48);
  const [maxDoD, setMaxDoD] = useState(80);
  const [costPerWp, setCostPerWp] = useState(800);
  const [tariff, setTariff] = useState(150);
  const [discountRate, setDiscountRate] = useState(6);
  const [omPercent, setOmPercent] = useState(1);
  const [currencyDisplay, setCurrencyDisplay] = useState<CurrencyDisplay>('CLP');
  const [darkMode, setDarkMode] = useState(false);

  const dailyDemand = useMemo(() => {
    if (demandMode === 'manual') return dailyDemandManual;
    return loads.reduce((s, l) => s + l.watts * l.hours * l.qty, 0);
  }, [demandMode, dailyDemandManual, loads]);

  const panel = panelMode === 'commercial' ? panelModels[panelIndex] : customPanel;
  const city = cityMode === 'preset' ? cities[cityIndex] : customCity;
  const batterySpec = batteryMode === 'commercial' ? batteryModels[battTypeIndex] : customBattery;

  const results: PVResults = useMemo(() => {
    const inputs: PVInputs = {
      systemType, city, dailyDemand, peakLoad, panel,
      cableLoss: cableLoss / 100, dustLoss: dustLoss / 100,
      mismatchLoss: mismatchLoss / 100, inverterEff: inverterEff / 100,
      dcAcRatio,
      inverterSafetyMargin: inverterSafetyMargin / 100,
      batterySpec, autonomyDays, systemVoltage,
      maxDoD: maxDoD / 100,
      costPerWp, tariff, discountRate: discountRate / 100, omPercent: omPercent / 100,
      batteryCostMultiplier: 1,
    };
    return calculatePV(inputs);
  }, [systemType, city, dailyDemand, peakLoad, panel, cableLoss, dustLoss, mismatchLoss, inverterEff, dcAcRatio, inverterSafetyMargin, batterySpec, autonomyDays, systemVoltage, maxDoD, costPerWp, tariff, discountRate, omPercent]);

  const addLoad = useCallback(() => {
    setLoads(prev => [...prev, { id: Date.now().toString(), name: 'Nuevo equipo', watts: 100, hours: 4, qty: 1 }]);
  }, []);

  const removeLoad = useCallback((id: string) => {
    setLoads(prev => prev.filter(l => l.id !== id));
  }, []);

  const updateLoad = useCallback((id: string, field: keyof LoadItem, value: string | number) => {
    setLoads(prev => prev.map(l => l.id === id ? { ...l, [field]: value } : l));
  }, []);

  return {
    // State
    systemType, setSystemType,
    cityMode, setCityMode, cityIndex, setCityIndex, customCity, setCustomCity,
    demandMode, setDemandMode,
    dailyDemandManual, setDailyDemandManual, peakLoad, setPeakLoad, loads, addLoad, removeLoad, updateLoad,
    panelMode, setPanelMode, panelIndex, setPanelIndex, customPanel, setCustomPanel,
    cableLoss, setCableLoss, dustLoss, setDustLoss, mismatchLoss, setMismatchLoss,
    inverterEff, setInverterEff, dcAcRatio, setDcAcRatio,
    inverterSafetyMargin, setInverterSafetyMargin,
    batteryMode, setBatteryMode,
    battTypeIndex, setBattTypeIndex, customBattery, setCustomBattery,
    autonomyDays, setAutonomyDays,
    systemVoltage, setSystemVoltage, maxDoD, setMaxDoD,
    costPerWp, setCostPerWp, tariff, setTariff, discountRate, setDiscountRate,
    omPercent, setOmPercent, currencyDisplay, setCurrencyDisplay,
    darkMode, setDarkMode,
    // Derived
    dailyDemand, panel, city, batterySpec, results,
    // Data refs
    cities, panelModels, batteryModels,
  };
}