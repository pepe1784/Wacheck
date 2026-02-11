import { motion } from "framer-motion";

const BachilleratoSection = () => {
  return (
    <section id="bachillerato" className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Subtle pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground/80 font-semibold text-sm mb-4">
              🏛️ Bachillerato 25
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6 leading-tight">
              Universidad de Colima
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-6 leading-relaxed">
              El Bachillerato 25 de la Universidad de Colima se compromete con la formación integral de sus estudiantes, 
              impulsando proyectos que combinan tecnología, creatividad y conciencia ambiental.
            </p>
            <p className="text-primary-foreground/80 text-lg mb-8 leading-relaxed">
              Este proyecto de educación ambiental fue diseñado y desarrollado por estudiantes como parte de su 
              formación académica, demostrando que el aprendizaje puede ser innovador, divertido y con impacto social.
            </p>

            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.ucol.mx/"
                target="_blank"
                rel="noopener"
                className="px-5 py-2.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-all font-medium text-sm"
              >
                🌐 Sitio UdeC
              </a>
              <a
                href="https://portal.ucol.mx/bach25/"
                target="_blank"
                rel="noopener"
                className="px-5 py-2.5 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-all font-medium text-sm"
              >
                🎓 Portal Bach. 25
              </a>
            </div>
          </motion.div>

          {/* Right - Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {[
              { icon: "🎓", title: "Educación", desc: "Formación integral de calidad" },
              { icon: "💻", title: "Tecnología", desc: "Desarrollo de proyectos digitales" },
              { icon: "🌱", title: "Medio Ambiente", desc: "Conciencia ambiental activa" },
              { icon: "🤝", title: "Comunidad", desc: "Impacto social positivo" },
            ].map((card) => (
              <div
                key={card.title}
                className="p-5 rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 hover:bg-primary-foreground/10 transition-all"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <h4 className="font-heading font-bold text-lg mb-1">{card.title}</h4>
                <p className="text-sm text-primary-foreground/60">{card.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default BachilleratoSection;
