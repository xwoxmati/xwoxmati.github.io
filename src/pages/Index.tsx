import { Sun, Moon, Printer } from 'lucide-react';
import { useCalculator } from '@/hooks/useCalculator';
import { InputPanel } from '@/components/calculator/InputPanel';
import { ResultsDashboard } from '@/components/calculator/ResultsDashboard';
import { EnergyCharts } from '@/components/calculator/EnergyCharts';
import { useEffect } from 'react';

const Index = () => {
  const calc = useCalculator();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', calc.darkMode);
  }, [calc.darkMode]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border no-print" style={{ boxShadow: 'var(--card-shadow)' }}>
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-inner bg-primary flex items-center justify-center">
              <Sun className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-foreground tracking-tight">SolarCalc Pro</h1>
              <p className="text-[11px] text-muted-foreground">Dimensionamiento Fotovoltaico — Chile</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-inner text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Imprimir reporte"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => calc.setDarkMode(!calc.darkMode)}
              className="p-2 rounded-inner text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Cambiar tema"
            >
              {calc.darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-[1600px] mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left: Inputs */}
          <div className="w-full lg:w-[420px] lg:flex-shrink-0 no-print">
            <div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <InputPanel calc={calc} />
            </div>
          </div>
          {/* Right: Results */}
          <div className="flex-1 min-w-0 space-y-4">
            <ResultsDashboard calc={calc} />
            <EnergyCharts calc={calc} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
