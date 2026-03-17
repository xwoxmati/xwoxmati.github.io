import { City, PanelModel, BatterySpec, DAYS_IN_MONTH, CO2_FACTOR_TCO2_PER_MWH } from '@/data/solarData';

export interface PVInputs {
  systemType: 'on-grid' | 'off-grid';
  city: City;
  dailyDemand: number; // Wh/day
  peakLoad: number; // W
  panel: PanelModel;
  cableLoss: number; // fraction
  dustLoss: number;
  mismatchLoss: number;
  inverterEff: number;
  dcAcRatio: number;
  inverterSafetyMargin: number; // fraction (e.g. 0.20 = 20%)
  // Battery
  batterySpec: BatterySpec;
  autonomyDays: number;
  systemVoltage: number;
  maxDoD: number;
  // Economics
  costPerWp: number; // CLP
  tariff: number; // CLP/kWh
  discountRate: number; // fraction
  omPercent: number; // fraction of CAPEX
  batteryCostMultiplier: number;
}

export interface PVResults {
  // Array
  nPanels: number;
  kWp: number;
  totalArea: number;
  pr: number;
  tempLossPercent: number;
  hspDesign: number;
  // Monthly
  monthlyGen: number[]; // kWh per month
  annualGen: number;
  // String sizing
  vocCold: number;
  stringsRecommended: { series: number; parallel: number };
  // Inverter
  inverterMinKw: number;
  inverterRecKw: number;
  inverterSafetyPercent: number;
  // Battery (off-grid)
  bankAh: number;
  usableKwh: number;
  totalKwh: number;
  nBattSeries: number;
  nBattParallel: number;
  totalBatteries: number;
  cycleLife: number;
  battCalendarLife: number;
  mpptCurrent: number;
  dailyDoD: number;
  // Economics
  projectLifeYears: number;
  capex: number;
  batteryCost: number;
  annualSavings: number;
  simplePayback: number;
  discountedPayback: number;
  van: number;
  tir: number;
  lcoe: number;
  // Yearly projection
  yearlyData: YearData[];
  // Environmental
  co2AvoidedPerYear: number;
  co2AvoidedTotal: number;
  // Compliance
  isLey21118Compliant: boolean;
}

export interface YearData {
  year: number;
  generation: number; // kWh
  usefulEnergy: number;
  degradationFactor: number;
  cashflow: number;
  cumulativeCashflow: number;
  discountedCashflow: number;
  cumulativeDiscounted: number;
}

export function calculatePV(inputs: PVInputs): PVResults {
  const { city, panel, dailyDemand, peakLoad, systemType } = inputs;

  // Design HSP: use the minimum monthly HSP for conservative sizing (or average)
  const avgHSP = city.monthlyHSP.reduce((a, b) => a + b, 0) / 12;
  const minHSP = Math.min(...city.monthlyHSP);
  const hspDesign = systemType === 'off-grid' ? minHSP : avgHSP;

  // Temperature loss
  const tCell = city.avgTemp + (panel.noct - 20) * 1000 / 800;
  const tempLossFraction = Math.max(0, -panel.gamma / 100 * (tCell - 25));
  const tempLossPercent = tempLossFraction * 100;

  // Performance Ratio
  const pr = (1 - tempLossFraction) * (1 - inputs.cableLoss) * (1 - inputs.dustLoss) * (1 - inputs.mismatchLoss) * inputs.inverterEff;

  // Number of panels
  const ePanelDay = (panel.power / 1000) * hspDesign * pr; // kWh/day per panel
  const nPanels = Math.max(1, Math.ceil((dailyDemand / 1000) / ePanelDay));
  const kWp = nPanels * panel.power / 1000;
  const totalArea = nPanels * panel.area;

  // Monthly generation
  const monthlyGen = city.monthlyHSP.map((hsp, i) =>
    nPanels * (panel.power / 1000) * hsp * pr * DAYS_IN_MONTH[i]
  );
  const annualGen = monthlyGen.reduce((a, b) => a + b, 0);

  // String sizing (cold Voc)
  const tCold = city.minTemp;
  const vocCold = panel.voc * (1 + panel.beta / 100 * (tCold - 25));
  const maxInverterVdc = 600; // typical
  const seriesMax = Math.floor(maxInverterVdc / vocCold);
  const series = Math.min(seriesMax, Math.max(1, Math.floor(nPanels / 2)));
  const parallel = Math.ceil(nPanels / series);

  // Inverter sizing with safety margin
  const pvDcKw = kWp;
  const inverterMinKw = pvDcKw / inputs.dcAcRatio;
  const inverterBase = Math.max(inverterMinKw, peakLoad / 1000);
  const inverterRecKw = inverterBase * (1 + inputs.inverterSafetyMargin);
  const inverterSafetyPercent = inputs.inverterSafetyMargin * 100;

  // Battery calculations
  let bankAh = 0, usableKwh = 0, totalKwh = 0, nBattSeries = 0, nBattParallel = 0, totalBatteries = 0;
  let cycleLife = 0, battCalendarLife = 0, mpptCurrent = 0, dailyDoD = 0;
  let batteryCost = 0;

  if (systemType === 'off-grid') {
    const { batterySpec, autonomyDays, systemVoltage, maxDoD } = inputs;
    const eRequired = (dailyDemand / 1000) * autonomyDays; // kWh
    bankAh = Math.ceil((eRequired * 1000) / (systemVoltage * maxDoD * inputs.inverterEff));
    totalKwh = bankAh * systemVoltage / 1000;
    usableKwh = totalKwh * maxDoD;

    nBattSeries = systemVoltage / batterySpec.nominalV;
    nBattParallel = Math.ceil(bankAh / batterySpec.capacityAh);
    totalBatteries = nBattSeries * nBattParallel;

    // Cycle life adjusted by actual DoD vs reference DoD
    const dodRatio = batterySpec.refDoD / maxDoD;
    cycleLife = Math.round(batterySpec.cyclesAtRefDoD * Math.pow(dodRatio, 0.8));

    // Daily DoD (actual daily usage)
    dailyDoD = (dailyDemand / 1000) / totalKwh;

    // Calendar life limited by cycles or calendar
    const cyclesPerDay = 1;
    const cycleLifeYears = cycleLife / (cyclesPerDay * 365);
    battCalendarLife = Math.min(batterySpec.calendarLife, cycleLifeYears);

    mpptCurrent = nPanels * panel.imp / nBattParallel;
    batteryCost = totalBatteries * batterySpec.costCLP;
  }

  // Project life = minimum component life (panels ~25y, inverter ~15y, batteries if off-grid)
  const panelLife = 25;
  const inverterLife = 15;
  const componentLives = [panelLife, inverterLife];
  if (systemType === 'off-grid' && battCalendarLife > 0) {
    componentLives.push(Math.max(1, Math.floor(battCalendarLife)));
  }
  const projectLifeYears = Math.min(...componentLives);

  // Economics — no replacements, single initial investment
  const capex = kWp * 1000 * inputs.costPerWp + batteryCost;
  const annualSavings = annualGen * inputs.tariff;
  const annualOM = capex * inputs.omPercent;

  // Projection over project life (no replacements)
  const yearlyData: YearData[] = [];
  let cumCash = -capex;
  let cumDisc = -capex;
  let simplePayback = -1;
  let discountedPayback = -1;

  for (let y = 1; y <= projectLifeYears; y++) {
    // Degradation: 2% year 1, then 0.5%/year
    const degFactor = y === 1 ? 0.98 : 0.98 * Math.pow(0.995, y - 1);
    const gen = annualGen * degFactor;
    const savings = gen * inputs.tariff;
    const cashflow = savings - annualOM;
    cumCash += cashflow;
    const discFactor = Math.pow(1 + inputs.discountRate, -y);
    const discCashflow = cashflow * discFactor;
    cumDisc += discCashflow;

    if (simplePayback < 0 && cumCash >= 0) simplePayback = y;
    if (discountedPayback < 0 && cumDisc >= 0) discountedPayback = y;

    yearlyData.push({
      year: y,
      generation: gen,
      usefulEnergy: Math.min(gen, dailyDemand / 1000 * 365 * degFactor),
      degradationFactor: degFactor,
      cashflow,
      cumulativeCashflow: cumCash,
      discountedCashflow: discCashflow,
      cumulativeDiscounted: cumDisc,
    });
  }

  const van = cumDisc;
  const tir = calculateIRR(capex, yearlyData.map(d => d.cashflow));

  // LCOE — no replacements
  const totalDiscountedCosts = capex + yearlyData.reduce((sum, _d, i) => {
    const disc = Math.pow(1 + inputs.discountRate, -(i + 1));
    return sum + annualOM * disc;
  }, 0);
  const totalDiscountedEnergy = yearlyData.reduce((sum, d, i) =>
    sum + d.generation * Math.pow(1 + inputs.discountRate, -(i + 1)), 0);
  const lcoe = totalDiscountedEnergy > 0 ? totalDiscountedCosts / totalDiscountedEnergy : 0;

  const co2AvoidedPerYear = annualGen * CO2_FACTOR_TCO2_PER_MWH / 1000;
  const co2AvoidedTotal = yearlyData.reduce((s, d) => s + d.generation, 0) * CO2_FACTOR_TCO2_PER_MWH / 1000;

  const isLey21118Compliant = kWp <= 300;

  return {
    nPanels, kWp, totalArea, pr, tempLossPercent, hspDesign,
    monthlyGen, annualGen,
    vocCold, stringsRecommended: { series, parallel },
    inverterMinKw, inverterRecKw, inverterSafetyPercent,
    bankAh, usableKwh, totalKwh, nBattSeries, nBattParallel, totalBatteries,
    cycleLife, battCalendarLife, mpptCurrent, dailyDoD,
    projectLifeYears, capex, batteryCost, annualSavings, simplePayback, discountedPayback, van, tir, lcoe,
    yearlyData, co2AvoidedPerYear, co2AvoidedTotal, isLey21118Compliant,
  };
}

function calculateIRR(investment: number, cashflows: number[]): number {
  let lo = -0.5, hi = 2.0;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const npv = -investment + cashflows.reduce((s, cf, i) => s + cf / Math.pow(1 + mid, i + 1), 0);
    if (Math.abs(npv) < 1) return mid;
    if (npv > 0) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Formatters
export function formatCLP(n: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n);
}

export function formatNum(n: number, decimals = 1): string {
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }).format(n);
}

export function formatUF(clp: number): string {
  return `UF ${formatNum(clp / 37500, 1)}`;
}

export function formatUSD(clp: number): string {
  return `USD ${formatNum(clp / 950, 0)}`;
}