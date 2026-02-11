import { useState } from "react";
import { motion } from "framer-motion";

interface Activity {
  icon: string;
  name: string;
  question: string;
  litresPerUse: number;
  timesPerDay: number;
  unit: string;
  avgLitresSource: string;
  hasToggle?: boolean;
  toggleLabel?: string;
  toggleMultiplier?: number;
}

const defaultActivities: Activity[] = [
  {
    icon: "🚿",
    name: "Ducha",
    question: "¿Cuántas veces te duchas al día?",
    litresPerUse: 80,
    timesPerDay: 1,
    unit: "veces/día",
    avgLitresSource: "Una ducha de ~8 min gasta aprox. 80 litros (OMS)",
  },
  {
    icon: "🚽",
    name: "Ir al baño (WC)",
    question: "¿Cuántas veces jalas la cadena del WC al día?",
    litresPerUse: 6,
    timesPerDay: 5,
    unit: "veces/día",
    avgLitresSource: "Cada descarga usa aprox. 6 litros (CONAGUA)",
  },
  {
    icon: "🪥",
    name: "Cepillado de dientes",
    question: "¿Cuántas veces te cepillas los dientes al día?",
    litresPerUse: 1,
    timesPerDay: 3,
    unit: "veces/día",
    avgLitresSource: "Con la llave cerrada ~1L; abierta ~12L (CONAGUA)",
    hasToggle: true,
    toggleLabel: "¿Dejas la llave abierta?",
    toggleMultiplier: 12,
  },
  {
    icon: "🍽️",
    name: "Lavar platos",
    question: "¿Cuántas veces lavas los platos al día?",
    litresPerUse: 20,
    timesPerDay: 2,
    unit: "veces/día",
    avgLitresSource: "A mano con llave abierta ~20L por lavada (SEMARNAT)",
  },
  {
    icon: "👕",
    name: "Lavadora",
    question: "¿Cuántas cargas de lavadora pones por semana?",
    litresPerUse: 50,
    timesPerDay: 3,
    unit: "cargas/semana",
    avgLitresSource: "Una carga promedio usa ~50 litros (PROFECO)",
  },
];

// Tarifa CIAPACOV 2025 - Uso doméstico Popular 1 (Colima-Villa de Álvarez)
// Fuente: https://ciapadmin.ciapacov.gob.mx/tramiteServicio/TARIFAS%202025.pdf
// Popular 1: $95.86 agua + $47.93 drenaje + $73.68 saneam. + IVA = ~$236.94/mes
// Consumo básico estimado: ~15 m³/mes → ~$15.80/m³ → ~$0.0158/litro
const COST_PER_LITRE = 0.0158;
const TARIFF_SOURCE = "CIAPACOV Tarifas 2025 – Uso Doméstico Popular 1 (Colima–Villa de Álvarez)";
const TARIFF_URL = "https://ciapadmin.ciapacov.gob.mx/tramiteServicio/TARIFAS%202025.pdf";

const WaterCalculator = () => {
  const [activities, setActivities] = useState(defaultActivities);
  const [toggleStates, setToggleStates] = useState<Record<number, boolean>>({});

  const updateTimes = (index: number, value: number) => {
    const updated = [...activities];
    updated[index] = { ...updated[index], timesPerDay: value };
    setActivities(updated);
  };

  const toggleOpen = (index: number) => {
    setToggleStates((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const getLitresForActivity = (a: Activity, index: number) => {
    const multiplier = a.hasToggle && toggleStates[index] ? (a.toggleMultiplier || 1) : 1;
    const effectiveLitres = a.hasToggle ? multiplier : a.litresPerUse;
    const isWeekly = a.unit.includes("semana");
    const dailyUses = isWeekly ? a.timesPerDay / 7 : a.timesPerDay;
    return (a.hasToggle ? effectiveLitres : a.litresPerUse) * dailyUses;
  };

  const totalDaily = activities.reduce((sum, a, i) => sum + getLitresForActivity(a, i), 0);
  const totalMonthly = totalDaily * 30;
  const costMonthly = totalMonthly * COST_PER_LITRE;

  const getLevel = () => {
    if (totalDaily < 100) return { label: "🌟 Excelente", color: "text-nature-green", msg: "¡Felicidades! Tu consumo es muy eficiente. Sigue así y motiva a otros a cuidar el agua." };
    if (totalDaily < 200) return { label: "👍 Bien", color: "text-water-blue", msg: "Tu consumo está dentro del promedio. Pequeños cambios como cerrar la llave al cepillarte pueden hacer la diferencia." };
    if (totalDaily < 350) return { label: "⚠️ Regular", color: "text-gold", msg: "Tu consumo es alto. Intenta reducir el tiempo de ducha y cierra la llave mientras te enjabonas." };
    return { label: "🚨 Alto consumo", color: "text-destructive", msg: "¡Alerta! Estás gastando mucha agua. Revisa cada hábito: duchas más cortas, reparar fugas y usar la lavadora con carga completa puede ahorrar miles de litros al mes." };
  };

  const level = getLevel();

  return (
    <section id="calculadora" className="py-24 gradient-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-water-blue/10 text-water-blue font-semibold text-sm mb-4">
            💧 Herramienta Educativa
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
            Calculadora de Consumo de Agua
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground text-lg">
            Descubre cuánta agua consumes al día, cuánto te cuesta y aprende a reducir tu huella hídrica.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-card shadow-card border border-border/50 overflow-hidden">
            <div className="p-6 md:p-8 space-y-5">
              {activities.map((activity, i) => (
                <div
                  key={activity.name}
                  className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors space-y-3"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl w-10 text-center">{activity.icon}</span>
                    <div className="flex-1">
                      <div className="font-heading font-semibold text-foreground">{activity.name}</div>
                      <div className="text-sm text-water-blue font-medium">{activity.question}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateTimes(i, Math.max(0, activity.timesPerDay - 1))}
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-heading font-bold text-foreground">
                        {activity.timesPerDay}
                      </span>
                      <button
                        onClick={() => updateTimes(i, activity.timesPerDay + 1)}
                        className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-xs text-muted-foreground w-24">{activity.unit}</span>
                    </div>
                    <div className="w-20 text-right">
                      <span className="font-heading font-bold text-accent">
                        {Math.round(getLitresForActivity(activity, i))}L
                      </span>
                      <div className="text-[10px] text-muted-foreground">por día</div>
                    </div>
                  </div>

                  {/* Toggle for leaving faucet open */}
                  {activity.hasToggle && (
                    <div className="flex items-center gap-2 ml-14">
                      <button
                        onClick={() => toggleOpen(i)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${toggleStates[i] ? "bg-destructive" : "bg-border"}`}
                      >
                        <span
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow transition-transform ${toggleStates[i] ? "translate-x-5" : "translate-x-0.5"}`}
                        />
                      </button>
                      <span className="text-sm text-muted-foreground">{activity.toggleLabel}</span>
                      {toggleStates[i] && (
                        <span className="text-xs text-destructive font-medium">¡Gastas 12x más!</span>
                      )}
                    </div>
                  )}

                  {/* Source info */}
                  <div className="ml-14 text-xs text-muted-foreground/70 italic">
                    📊 {activity.avgLitresSource}
                  </div>
                </div>
              ))}
            </div>

            {/* Result */}
            <div className="p-6 md:p-8 bg-secondary/30 border-t border-border/50 space-y-5">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Consumo diario estimado</div>
                  <div className="font-heading font-black text-4xl text-foreground">
                    {Math.round(totalDaily)} <span className="text-lg text-muted-foreground font-normal">litros/día</span>
                  </div>
                </div>
                <div className={`text-2xl font-heading font-bold ${level.color}`}>
                  {level.label}
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-water"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (totalDaily / 400) * 100)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Cost estimate */}
              <div className="p-4 rounded-xl bg-card border border-border/50">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-muted-foreground">💰 Costo mensual estimado</div>
                    <div className="font-heading font-black text-3xl text-foreground">
                      ${costMonthly.toFixed(2)} <span className="text-sm text-muted-foreground font-normal">MXN/mes</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({Math.round(totalMonthly).toLocaleString()} litros/mes ≈ {(totalMonthly / 1000).toFixed(1)} m³)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-water-blue">Tarifa doméstica Popular 1</div>
                    <div className="text-xs text-muted-foreground">≈ $15.80 MXN/m³</div>
                  </div>
                </div>
              </div>

              {/* Saving message */}
              <div className="p-4 rounded-xl bg-water-blue/10 border border-water-blue/20">
                <p className="text-sm text-foreground leading-relaxed">
                  💡 <strong>Consejo:</strong> {level.msg}
                </p>
              </div>

              {/* Source */}
              <div className="text-xs text-muted-foreground/60 space-y-1">
                <p>
                  📄 <strong>Fuente de tarifas:</strong>{" "}
                  <a href={TARIFF_URL} target="_blank" rel="noopener" className="underline hover:text-water-blue transition-colors">
                    {TARIFF_SOURCE}
                  </a>
                </p>
                <p>
                  📄 <strong>Fuente de consumo promedio:</strong> CONAGUA, OMS, SEMARNAT, PROFECO — datos de referencia para uso doméstico en México.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaterCalculator;
