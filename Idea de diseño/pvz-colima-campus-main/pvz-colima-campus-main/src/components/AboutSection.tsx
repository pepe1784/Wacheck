import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section id="sobre" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left - Game info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-4">
              🌍 Sobre el Proyecto
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-6 leading-tight">
              Aprende jugando a cuidar el recurso más valioso
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              <strong className="text-foreground">Wacheck: Defensores del Agua</strong> es un videojuego educativo tipo Tower Defense inspirado en Plants vs Zombies, 
              donde los jugadores protegen fuentes de agua de agentes contaminantes utilizando defensores ecológicos.
            </p>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Desarrollado como proyecto de educación ambiental del <strong className="text-foreground">Bachillerato 25</strong> de la 
              Universidad de Colima, este juego busca concientizar a los jóvenes sobre la importancia de la conservación del agua 
              de forma interactiva y divertida.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "5+", label: "Niveles" },
                { value: "12+", label: "Defensores" },
                { value: "∞", label: "Diversión" },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-secondary">
                  <div className="font-heading font-black text-2xl text-accent">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right - Visual card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-3xl gradient-ucol p-8 md:p-10 text-primary-foreground relative overflow-hidden">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                {[...Array(20)].map((_, i) => (
                  <span
                    key={i}
                    className="absolute text-4xl"
                    style={{
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                    }}
                  >
                    💧
                  </span>
                ))}
              </div>

              <div className="relative z-10">
                <div className="text-6xl mb-6">🎮</div>
                <h3 className="font-heading font-bold text-2xl mb-4">
                  ¿Cómo se juega?
                </h3>
                <ul className="space-y-3 text-primary-foreground/90">
                  {[
                    "Elige tu equipo de defensores acuáticos",
                    "Colócalos estratégicamente en el campo",
                    "Detén a los contaminantes antes de que lleguen al agua",
                    "Gana monedas y mejora tus defensores",
                    "Completa misiones y desbloquea logros",
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-foreground/20 flex items-center justify-center text-sm font-bold">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
