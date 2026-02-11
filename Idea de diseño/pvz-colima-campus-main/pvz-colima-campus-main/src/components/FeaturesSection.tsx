import { motion } from "framer-motion";

const features = [
  {
    icon: "🛡️",
    title: "Tower Defense Acuático",
    description: "Coloca defensores estratégicamente para proteger las fuentes de agua de contaminantes que avanzan sin cesar.",
  },
  {
    icon: "🌊",
    title: "Misiones Diarias",
    description: "Completa misiones y desafíos diarios para ganar recompensas, subir de nivel y desbloquear nuevos defensores.",
  },
  {
    icon: "📊",
    title: "Calculadora de Agua",
    description: "Aprende cuánta agua consumes diariamente con nuestra herramienta interactiva y descubre cómo reducir tu huella hídrica.",
  },
  {
    icon: "🏆",
    title: "Sistema de Logros",
    description: "Desbloquea logros, sube en el ranking y demuestra tu compromiso con la conservación del agua.",
  },
  {
    icon: "📖",
    title: "Modo Historia",
    description: "Explora una narrativa envolvente sobre la importancia de la conservación del agua en nuestro planeta.",
  },
  {
    icon: "⬆️",
    title: "Mejoras Permanentes",
    description: "Invierte tus puntos en mejoras que fortalecen a tus defensores y te dan ventaja en cada partida.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="caracteristicas" className="py-24 gradient-section">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent font-semibold text-sm mb-4">
            🎮 Características del Juego
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-5xl text-foreground mb-4">
            Todo lo que necesitas para defender el agua
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Un juego completo tipo Plants vs Zombies con temática ambiental desarrollado por estudiantes del Bachillerato 25.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="group p-6 rounded-2xl bg-card shadow-card hover:shadow-card-hover border border-border/50 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 rounded-xl gradient-water flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="font-heading font-bold text-xl text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
