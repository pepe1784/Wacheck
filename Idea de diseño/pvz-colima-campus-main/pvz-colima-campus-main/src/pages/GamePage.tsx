import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import waterShield from "@/assets/defenders/water-shield.png";
import iceCrystal from "@/assets/defenders/ice-crystal.png";
import waterLily from "@/assets/defenders/water-lily.png";
import waveWarrior from "@/assets/defenders/wave-warrior.png";
import coralReef from "@/assets/defenders/coral-reef.png";
import tsunamiGiant from "@/assets/defenders/tsunami-giant.png";
import waterCannon from "@/assets/defenders/water-cannon.png";
import rainCloud from "@/assets/defenders/rain-cloud.png";

type Tab = "jugar" | "historia" | "tutorial" | "tienda";

interface Defender {
  id: string;
  name: string;
  image: string;
  category: "low-cost" | "damage" | "tank" | "special";
  cost: number;
  damage: number;
  health: number;
  range: number;
  description: string;
}

const defenders: Defender[] = [
  { id: "water-shield", name: "Gota Escudo", image: waterShield, category: "low-cost", cost: 50, damage: 15, health: 100, range: 1, description: "Defensor básico con escudo. Barato y resistente para las primeras líneas." },
  { id: "rain-cloud", name: "Nube Lluviosa", image: rainCloud, category: "low-cost", cost: 75, damage: 20, health: 60, range: 3, description: "Ataca con lluvia a distancia. Ideal para apoyo desde atrás." },
  { id: "water-cannon", name: "Aqua Cañón", image: waterCannon, category: "damage", cost: 150, damage: 45, health: 80, range: 4, description: "Dispara chorros de agua a alta presión. Gran alcance y daño." },
  { id: "ice-crystal", name: "Cristal de Hielo", image: iceCrystal, category: "damage", cost: 125, damage: 35, health: 70, range: 3, description: "Congela y ralentiza a los contaminantes. Perfecto para control." },
  { id: "wave-warrior", name: "Guerrero Ola", image: waveWarrior, category: "tank", cost: 200, damage: 30, health: 250, range: 1, description: "Tanque pesado con enorme resistencia. Aguanta oleadas enteras." },
  { id: "water-lily", name: "Lirio Acuático", image: waterLily, category: "special", cost: 100, damage: 10, health: 80, range: 2, description: "Genera recursos adicionales y cura a defensores cercanos." },
  { id: "coral-reef", name: "Coral Dorado", image: coralReef, category: "special", cost: 175, damage: 25, health: 120, range: 2, description: "Aura especial que aumenta el daño de defensores adyacentes." },
  { id: "tsunami-giant", name: "Titán Tsunami", image: tsunamiGiant, category: "special", cost: 300, damage: 150, health: 180, range: 6, description: "Defensor legendario. Daño en área masivo que arrasa oleadas." },
];

const storyChapters = [
  {
    chapter: 1,
    title: "El Despertar del Río",
    description: "El río de Colima está en peligro. Las fábricas han comenzado a verter residuos tóxicos y los contaminantes avanzan sin control. Como nuevo guardián del agua, debes organizar tu primera línea de defensa usando las gotas escudo que te ha encomendado el Consejo del Agua.",
    levels: ["Nivel 1: Primera Oleada", "Nivel 2: Los Desechos Avanzan", "Nivel 3: Jefe — Petróleo Oscuro"],
    unlocked: true,
  },
  {
    chapter: 2,
    title: "El Lago Olvidado",
    description: "Un antiguo lago sagrado ha sido descubierto bajo la ciudad. Pero las tuberías rotas filtran contaminantes industriales. Nuevos defensores acuáticos se unen a tu causa: el Cristal de Hielo y el Aqua Cañón te ayudarán a proteger estas aguas ancestrales.",
    levels: ["Nivel 4: Filtraciones", "Nivel 5: Tormenta Ácida", "Nivel 6: Jefe — Mercurio Vivo"],
    unlocked: true,
  },
  {
    chapter: 3,
    title: "La Bahía Contaminada",
    description: "La bahía de Manzanillo enfrenta su mayor amenaza. Plásticos y químicos amenazan la vida marina. El Guerrero Ola y el Coral Dorado se unen a tus filas para esta épica batalla por los océanos.",
    levels: ["Nivel 7: Marea de Plástico", "Nivel 8: Derrame Químico", "Nivel 9: Jefe — Leviatán Tóxico"],
    unlocked: false,
  },
  {
    chapter: 4,
    title: "El Acuífero Profundo",
    description: "Las aguas subterráneas de Comala están siendo drenadas y contaminadas. En las profundidades, el legendario Titán Tsunami aguarda a un guardián digno. ¿Podrás llegar hasta él y salvar el último acuífero?",
    levels: ["Nivel 10: Grietas en la Tierra", "Nivel 11: Invasión Subterránea", "Nivel 12: Jefe Final — Rey Contaminante"],
    unlocked: false,
  },
];

const tutorialSteps = [
  {
    icon: "🎯",
    title: "Objetivo del Juego",
    content: "Tu misión es proteger las fuentes de agua de Colima de los agentes contaminantes. Los enemigos avanzan por carriles hacia tu fuente de agua — ¡no dejes que lleguen!",
  },
  {
    icon: "🛡️",
    title: "Colocar Defensores",
    content: "Toca una celda vacía en el campo de batalla para colocar un defensor. Cada defensor cuesta monedas, así que elige estratégicamente. Los defensores atacan automáticamente a los enemigos en su rango.",
  },
  {
    icon: "💰",
    title: "Economía y Recursos",
    content: "Ganas monedas al eliminar contaminantes y al pasar oleadas. Usa las monedas para comprar más defensores. El Lirio Acuático genera recursos extra pasivamente.",
  },
  {
    icon: "⬆️",
    title: "Mejoras y Evoluciones",
    content: "Toca un defensor ya colocado para mejorarlo. Las mejoras aumentan su daño, velocidad de ataque y salud. Las mejoras permanentes se compran con runas 🔮 en el menú de progresión.",
  },
  {
    icon: "🌊",
    title: "Oleadas y Jefes",
    content: "Cada nivel tiene múltiples oleadas de contaminantes. La dificultad aumenta progresivamente. Al final de cada capítulo hay un jefe con habilidades especiales — ¡prepárate!",
  },
  {
    icon: "⭐",
    title: "Recompensas y Progresión",
    content: "Completa misiones diarias para ganar runas y monedas especiales. Inicia sesión cada día para reclamar recompensas. ¡El día 7 desbloqueas al Titán Tsunami!",
  },
];

const GamePage = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "jugar";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [selectedDefenders, setSelectedDefenders] = useState<string[]>([]);
  const [shopCategory, setShopCategory] = useState<string>("all");

  useEffect(() => {
    const tab = searchParams.get("tab") as Tab;
    if (tab && ["jugar", "historia", "tutorial", "tienda"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const toggleDefender = (id: string) => {
    setSelectedDefenders((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : prev.length < 8 ? [...prev, id] : prev
    );
  };

  const filteredDefenders = shopCategory === "all" ? defenders : defenders.filter((d) => d.category === shopCategory);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "jugar", label: "Jugar", icon: "🎮" },
    { id: "historia", label: "Historia", icon: "📜" },
    { id: "tutorial", label: "Tutorial", icon: "🎓" },
    { id: "tienda", label: "Tienda", icon: "🏪" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-primary text-primary-foreground sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold hover:opacity-80 transition-opacity">
            <span>←</span> Volver
          </Link>
          <div className="flex items-center gap-2">
            <img src="/images/ucol-logo.svg" alt="UCol" className="w-8 h-8" />
            <span className="font-heading font-bold text-lg">Wacheck</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span>💰 100</span>
            <span>⭐ 0</span>
            <span>🔮 0</span>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <nav className="bg-card border-b border-border sticky top-14 z-40">
        <div className="container mx-auto px-4 flex gap-1 overflow-x-auto py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-heading font-semibold text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "gradient-water text-accent-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {activeTab === "jugar" && (
            <motion.div key="jugar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground mb-3">⚔️ Selecciona tus Defensores</h1>
                <p className="text-muted-foreground text-lg">Elige exactamente 8 defensores para esta partida</p>
              </div>

              {/* Selected slots */}
              <div className="mb-8 p-6 rounded-2xl bg-card shadow-card border border-border/50">
                <h3 className="font-heading font-bold text-lg mb-4 text-foreground">✅ Seleccionados ({selectedDefenders.length}/8)</h3>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const def = defenders.find((d) => d.id === selectedDefenders[i]);
                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-xl border-2 border-dashed flex items-center justify-center ${
                          def ? "border-accent bg-accent/10" : "border-border/50 bg-secondary/30"
                        }`}
                      >
                        {def ? (
                          <img src={def.image} alt={def.name} className="w-full h-full object-contain p-1" onClick={() => toggleDefender(def.id)} />
                        ) : (
                          <span className="text-2xl text-muted-foreground/30">?</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Available defenders */}
              <div className="mb-8">
                <h3 className="font-heading font-bold text-lg mb-4 text-foreground">📦 Disponibles</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {defenders.map((def) => (
                    <motion.button
                      key={def.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleDefender(def.id)}
                      className={`p-4 rounded-2xl border-2 transition-all text-left ${
                        selectedDefenders.includes(def.id)
                          ? "border-accent bg-accent/10 shadow-md"
                          : "border-border/50 bg-card hover:border-accent/50"
                      }`}
                    >
                      <img src={def.image} alt={def.name} className="w-16 h-16 mx-auto mb-2 object-contain" />
                      <div className="font-heading font-bold text-sm text-foreground text-center">{def.name}</div>
                      <div className="text-xs text-muted-foreground text-center mt-1">💰 {def.cost}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={selectedDefenders.length !== 8}
                  className="px-10 py-4 rounded-2xl gradient-water text-accent-foreground font-heading font-bold text-xl shadow-[var(--shadow-hero-btn)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  🎮 Comenzar Partida
                </motion.button>
                {selectedDefenders.length < 8 && (
                  <p className="text-sm text-muted-foreground mt-3">Selecciona {8 - selectedDefenders.length} defensor(es) más</p>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "historia" && (
            <motion.div key="historia" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground mb-3">📜 Modo Historia</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Embárcate en una aventura para salvar las fuentes de agua de Colima. Cada capítulo revela nuevos desafíos y aliados.
                </p>
              </div>

              <div className="max-w-3xl mx-auto space-y-6">
                {storyChapters.map((ch) => (
                  <motion.div
                    key={ch.chapter}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className={`p-6 md:p-8 rounded-2xl border-2 transition-all ${
                      ch.unlocked
                        ? "bg-card border-accent/30 shadow-card hover:shadow-card-hover"
                        : "bg-secondary/30 border-border/30 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-heading font-black text-xl flex-shrink-0 ${
                        ch.unlocked ? "gradient-water text-accent-foreground" : "bg-border text-muted-foreground"
                      }`}>
                        {ch.unlocked ? ch.chapter : "🔒"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-heading font-bold text-xl md:text-2xl text-foreground mb-2">
                          Capítulo {ch.chapter}: {ch.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">{ch.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {ch.levels.map((level) => (
                            <span
                              key={level}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                ch.unlocked
                                  ? "bg-accent/10 text-accent border border-accent/20"
                                  : "bg-border/50 text-muted-foreground"
                              }`}
                            >
                              {level}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "tutorial" && (
            <motion.div key="tutorial" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground mb-3">🎓 Tutorial del Juego</h1>
                <p className="text-muted-foreground text-lg">Aprende todo lo necesario para convertirte en un Defensor del Agua</p>
              </div>

              <div className="max-w-3xl mx-auto space-y-4">
                {tutorialSteps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="p-6 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl gradient-ucol flex items-center justify-center text-2xl flex-shrink-0">
                        {step.icon}
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg text-foreground mb-2">{step.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{step.content}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Defender preview in tutorial */}
              <div className="max-w-3xl mx-auto mt-10">
                <h2 className="font-heading font-bold text-2xl text-foreground mb-6 text-center">🛡️ Conoce a tus Defensores</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {defenders.slice(0, 4).map((def) => (
                    <div key={def.id} className="p-4 rounded-2xl bg-card shadow-card border border-border/50 text-center">
                      <img src={def.image} alt={def.name} className="w-20 h-20 mx-auto mb-2 object-contain" />
                      <div className="font-heading font-bold text-sm text-foreground">{def.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{def.description.split(".")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "tienda" && (
            <motion.div key="tienda" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8">
                <h1 className="font-heading font-black text-3xl md:text-5xl text-foreground mb-3">🏪 Tienda de Defensores</h1>
                <p className="text-muted-foreground text-lg">⭐ Monedas Especiales: 0</p>
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                {[
                  { id: "all", label: "Todos" },
                  { id: "low-cost", label: "Bajo Coste" },
                  { id: "damage", label: "Daño" },
                  { id: "tank", label: "Tanque" },
                  { id: "special", label: "Especiales" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setShopCategory(cat.id)}
                    className={`px-4 py-2 rounded-lg font-heading font-semibold text-sm transition-all ${
                      shopCategory === cat.id
                        ? "gradient-ucol text-primary-foreground shadow-md"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Defender cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {filteredDefenders.map((def) => (
                  <motion.div
                    key={def.id}
                    whileHover={{ y: -4 }}
                    className="p-5 rounded-2xl bg-card shadow-card border border-border/50 hover:shadow-card-hover transition-all"
                  >
                    <div className="relative mb-4">
                      <img src={def.image} alt={def.name} className="w-24 h-24 mx-auto object-contain" />
                      <span className={`absolute top-0 right-0 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        def.category === "special" ? "bg-gold/20 text-gold-dark" :
                        def.category === "tank" ? "bg-accent/20 text-accent" :
                        def.category === "damage" ? "bg-destructive/20 text-destructive" :
                        "bg-nature-green/20 text-nature-green"
                      }`}>
                        {def.category === "low-cost" ? "Económico" : def.category === "damage" ? "DPS" : def.category === "tank" ? "Tanque" : "Especial"}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-foreground text-center">{def.name}</h3>
                    <p className="text-xs text-muted-foreground text-center mt-1 mb-3 line-clamp-2">{def.description}</p>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                      <div className="p-2 rounded-lg bg-secondary text-center">
                        <div className="text-muted-foreground">⚔️ Daño</div>
                        <div className="font-heading font-bold text-foreground">{def.damage}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary text-center">
                        <div className="text-muted-foreground">❤️ Salud</div>
                        <div className="font-heading font-bold text-foreground">{def.health}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary text-center">
                        <div className="text-muted-foreground">🎯 Rango</div>
                        <div className="font-heading font-bold text-foreground">{def.range}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary text-center">
                        <div className="text-muted-foreground">💰 Costo</div>
                        <div className="font-heading font-bold text-foreground">{def.cost}</div>
                      </div>
                    </div>

                    <button className="w-full py-2.5 rounded-xl gradient-gold text-primary font-heading font-bold text-sm hover:brightness-110 transition-all">
                      Comprar ⭐ {def.cost}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom nav mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border py-2 px-4 flex justify-around md:hidden z-50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all ${
              activeTab === tab.id ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default GamePage;